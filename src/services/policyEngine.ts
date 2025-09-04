import { format, parseISO, differenceInCalendarDays, isWeekend, startOfDay } from 'date-fns';
import { Employee } from '@/types';
import { 
  PolicyPreviewResult, 
  LeavePolicy, 
  LeaveBalance, 
  HolidayCalendar,
  Holiday,
  LeaveConflict,
  PolicyWarning,
  LeaveType,
  HalfDayPeriod,
  CalendarType,
  CoverageScore
} from '@/types/leave';

export interface PolicyContext {
  employee: Employee;
  policies: LeavePolicy[];
  balances: LeaveBalance[];
  calendars: HolidayCalendar[];
  teamLeaves: LeaveConflict[];
  currentDate: Date;
}

export interface PreviewInput {
  employee: Employee;
  type: LeaveType;
  start: Date;
  end: Date;
  halfDay?: HalfDayPeriod | null;
  wfh?: boolean;
}

/**
 * Core policy engine for leave calculations
 */
export class PolicyEngine {
  /**
   * Preview leave request with policy calculations
   */
  static previewLeave(input: PreviewInput, ctx: PolicyContext): PolicyPreviewResult {
    const policy = ctx.policies.find(p => p.type === input.type);
    if (!policy) {
      throw new Error(`Policy not found for leave type: ${input.type}`);
    }

    const balance = ctx.balances.find(b => b.type === input.type);
    if (!balance) {
      throw new Error(`Balance not found for leave type: ${input.type}`);
    }

    const warnings: PolicyWarning[] = [];
    
    // Determine calendar to use
    const calendarUsed = this.determineCalendar(ctx.employee, ctx.calendars);
    const calendar = ctx.calendars.find(c => c.type === calendarUsed) || ctx.calendars[0];
    
    // Calculate working days
    const { countedDays, appliesSandwich } = this.calculateWorkingDays(
      input.start,
      input.end,
      input.halfDay,
      calendar,
      policy
    );

    // Check if backdated
    const backdatedDays = this.calculateBackdatedDays(input.start, ctx.currentDate);
    const isBackdated = backdatedDays > 0;

    // Validate backdated request
    if (isBackdated && backdatedDays > policy.backdatedDaysAllowed) {
      warnings.push({
        code: 'BACKDATED_EXCEEDED',
        message: `Request is ${backdatedDays} days backdated, exceeds policy limit of ${policy.backdatedDaysAllowed} days`,
        severity: 'warning'
      });
    }

    // Calculate projected balance
    const projectedBalance = balance.available - countedDays;
    const negativeBalanceAfter = projectedBalance < 0;

    if (negativeBalanceAfter && !policy.allowNegativeBalance) {
      warnings.push({
        code: 'NEGATIVE_BALANCE',
        message: `Request will result in negative balance: ${projectedBalance}`,
        severity: 'error'
      });
    } else if (negativeBalanceAfter) {
      warnings.push({
        code: 'NEGATIVE_BALANCE_WARNING',
        message: `Request will result in negative balance: ${projectedBalance}`,
        severity: 'warning'
      });
    }

    // Check WFH limits
    const wfhLimitExceeded = this.checkWfhLimit(input, policy, ctx);
    if (wfhLimitExceeded) {
      warnings.push({
        code: 'WFH_LIMIT_EXCEEDED',
        message: `WFH request exceeds weekly limit of ${policy.weeklyWfhLimit} days`,
        severity: 'warning'
      });
    }

    // Check conflicts and calculate coverage score
    const conflicts = this.findConflicts(input, ctx.teamLeaves);
    const coverageScore = this.calculateCoverageScore(conflicts, countedDays);

    if (conflicts.length > 0) {
      warnings.push({
        code: 'TEAM_CONFLICTS',
        message: `${conflicts.length} team member(s) have overlapping leave`,
        severity: 'info'
      });
    }

    // Half-day validation
    if (input.halfDay && !policy.allowHalfDay) {
      warnings.push({
        code: 'HALF_DAY_NOT_ALLOWED',
        message: `Half-day leave not allowed for ${input.type}`,
        severity: 'error'
      });
    }

    // Sandwich rule warning
    if (appliesSandwich && policy.appliesSandwich) {
      warnings.push({
        code: 'SANDWICH_APPLIED',
        message: 'Sandwich rule applied - intervening weekends/holidays included',
        severity: 'info'
      });
    }

    return {
      countedDays,
      appliesSandwich,
      isBackdated,
      backdatedDays,
      negativeBalanceAfter,
      wfhLimitExceeded,
      calendarUsed,
      warnings,
      projectedBalanceByType: projectedBalance,
      conflicts,
      coverageScore
    };
  }

  /**
   * Calculate working days excluding weekends and holidays
   */
  private static calculateWorkingDays(
    start: Date,
    end: Date,
    halfDay: HalfDayPeriod | null | undefined,
    calendar: HolidayCalendar,
    policy: LeavePolicy
  ): { countedDays: number; appliesSandwich: boolean } {
    let days = 0;
    let appliesSandwich = false;
    
    const holidays = new Set(calendar.holidays.map(h => format(parseISO(h.date), 'yyyy-MM-dd')));
    
    const current = startOfDay(start);
    const endDate = startOfDay(end);
    
    // Check for sandwich rule
    if (policy.appliesSandwich && differenceInCalendarDays(endDate, current) > 1) {
      appliesSandwich = this.hasSandwichDays(current, endDate, holidays);
    }

    if (appliesSandwich) {
      // Count all calendar days when sandwich rule applies
      days = differenceInCalendarDays(endDate, current) + 1;
    } else {
      // Count only working days
      let currentDay = new Date(current);
      while (currentDay <= endDate) {
        const dayStr = format(currentDay, 'yyyy-MM-dd');
        if (!isWeekend(currentDay) && !holidays.has(dayStr)) {
          days++;
        }
        currentDay.setDate(currentDay.getDate() + 1);
      }
    }

    // Apply half-day reduction
    if (halfDay && days > 0) {
      days -= 0.5;
    }

    return { countedDays: Math.max(0, days), appliesSandwich };
  }

  /**
   * Check if there are weekend/holiday days between start and end
   */
  private static hasSandwichDays(start: Date, end: Date, holidays: Set<string>): boolean {
    let current = new Date(start);
    current.setDate(current.getDate() + 1); // Start from day after start
    
    while (current < end) {
      const dayStr = format(current, 'yyyy-MM-dd');
      if (isWeekend(current) || holidays.has(dayStr)) {
        return true;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return false;
  }

  /**
   * Calculate how many days the request is backdated
   */
  private static calculateBackdatedDays(requestDate: Date, currentDate: Date): number {
    const days = differenceInCalendarDays(currentDate, requestDate);
    return Math.max(0, days);
  }

  /**
   * Determine which calendar to use based on employee assignment
   */
  private static determineCalendar(employee: Employee, calendars: HolidayCalendar[]): CalendarType {
    // Check if employee has client calendar assignment (would come from employee data)
    // For now, use location calendar or company default
    const hasClientCalendar = false; // This would be determined from employee.clientId
    
    if (hasClientCalendar) return 'client';
    
    const hasLocationCalendar = calendars.some(c => 
      c.type === 'location' && c.location === employee.location
    );
    
    if (hasLocationCalendar) return 'location';
    
    return 'company';
  }

  /**
   * Check if WFH request exceeds weekly limits
   */
  private static checkWfhLimit(
    input: PreviewInput, 
    policy: LeavePolicy, 
    ctx: PolicyContext
  ): boolean {
    if (!input.wfh || !policy.weeklyWfhLimit) return false;
    
    // This is a simplified check - in reality, you'd check the current week's WFH usage
    // For now, just check if the request duration exceeds the weekly limit
    const requestDays = differenceInCalendarDays(input.end, input.start) + 1;
    return requestDays > policy.weeklyWfhLimit;
  }

  /**
   * Find conflicts with team members' approved/pending leaves
   */
  private static findConflicts(input: PreviewInput, teamLeaves: LeaveConflict[]): LeaveConflict[] {
    const conflicts: LeaveConflict[] = [];
    
    for (const teamLeave of teamLeaves) {
      const teamStart = parseISO(teamLeave.startDate);
      const teamEnd = parseISO(teamLeave.endDate);
      
      // Check for date overlap
      if (
        (input.start >= teamStart && input.start <= teamEnd) ||
        (input.end >= teamStart && input.end <= teamEnd) ||
        (input.start <= teamStart && input.end >= teamEnd)
      ) {
        // Only include approved or pending leaves as conflicts
        if (['approved', 'pending_L1', 'pending_L2'].includes(teamLeave.status)) {
          conflicts.push(teamLeave);
        }
      }
    }
    
    return conflicts;
  }

  /**
   * Calculate coverage score based on conflicts and request duration
   */
  private static calculateCoverageScore(
    conflicts: LeaveConflict[], 
    requestDays: number
  ): CoverageScore {
    if (conflicts.length === 0) return 'High';
    
    const conflictRatio = conflicts.length / Math.max(1, requestDays);
    
    if (conflictRatio >= 0.5) return 'Low';
    if (conflictRatio >= 0.25) return 'Medium';
    
    return 'High';
  }

  /**
   * Validate comp-off request
   */
  static validateCompOff(
    workDate: Date,
    hours: number,
    calendars: HolidayCalendar[],
    currentDate: Date
  ): PolicyWarning[] {
    const warnings: PolicyWarning[] = [];
    
    // Check if work date is in the past
    if (workDate > currentDate) {
      warnings.push({
        code: 'FUTURE_WORK_DATE',
        message: 'Comp-off cannot be claimed for future dates',
        severity: 'error'
      });
    }
    
    // Check if work date is weekend or holiday
    const calendar = calendars.find(c => c.isDefault) || calendars[0];
    const workDateStr = format(workDate, 'yyyy-MM-dd');
    const isHoliday = calendar?.holidays.some(h => h.date === workDateStr);
    
    if (!isWeekend(workDate) && !isHoliday) {
      warnings.push({
        code: 'NOT_WEEKEND_OR_HOLIDAY',
        message: 'Comp-off can only be claimed for work done on weekends or holidays',
        severity: 'error'
      });
    }
    
    // Validate hours
    if (hours < 4) {
      warnings.push({
        code: 'INSUFFICIENT_HOURS',
        message: 'Minimum 4 hours of work required for comp-off',
        severity: 'error'
      });
    }
    
    if (hours > 16) {
      warnings.push({
        code: 'EXCESSIVE_HOURS',
        message: 'Maximum 16 hours can be claimed in a day',
        severity: 'warning'
      });
    }
    
    return warnings;
  }

  /**
   * Calculate comp-off days based on hours worked
   */
  static calculateCompOffDays(hours: number): number {
    // Standard 8-hour workday = 1 comp-off day
    return Math.min(2, Math.floor(hours / 4) * 0.5); // 4 hours = 0.5 day, max 2 days
  }
}