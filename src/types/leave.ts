// Leave Management Types

export type LeaveStatus = 'draft' | 'pending_L1' | 'pending_L2' | 'approved' | 'rejected' | 'cancelled';
export type LeaveType = 'CL' | 'SL' | 'PL' | 'ML' | 'PL_PATERNITY' | 'COMP_OFF' | 'LOP';
export type HalfDayPeriod = 'AM' | 'PM';
export type CalendarType = 'client' | 'location' | 'company';
export type CoverageScore = 'Low' | 'Medium' | 'High';

export interface LeaveBalance {
  id: string;
  employeeId: string;
  type: LeaveType;
  allocated: number;
  consumed: number;
  available: number;
  carryForward: number;
  expiry?: string;
  financialYear: string;
}

export interface LeavePolicy {
  id: string;
  type: LeaveType;
  name: string;
  accrualRate: number; // per month
  maxCarryForward: number;
  allowNegativeBalance: boolean;
  allowHalfDay: boolean;
  appliesSandwich: boolean;
  requiresL1Approval: boolean;
  requiresL2Approval: boolean;
  backdatedDaysAllowed: number;
  maxContinuousDays?: number;
  minGapBetweenRequests?: number;
  weeklyWfhLimit?: number;
  compOffExpiryDays?: number;
  encashmentEnabled: boolean;
  encashmentMinBalance?: number;
  encashmentMaxDays?: number;
}

export interface LeaveRequestDetailed {
  id: string;
  employeeId: string;
  employeeName: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  halfDay?: HalfDayPeriod;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  isWfh: boolean;
  outlookHold: boolean;
  backdatedDays: number;
  appliesSandwich: boolean;
  attachments: Attachment[];
  submittedAt: string;
  l1ApprovedAt?: string;
  l1ApprovedBy?: string;
  l1Comments?: string;
  l2ApprovedAt?: string;
  l2ApprovedBy?: string;
  l2Comments?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  warningsJson: PolicyWarning[];
  conflictsWith: LeaveConflict[];
  coverageScore: CoverageScore;
  projectedBalance: number;
}

export interface CompOffRequest {
  id: string;
  employeeId: string;
  workDate: string;
  hours: number;
  reason: string;
  project?: string;
  evidence?: string;
  status: LeaveStatus;
  submittedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  expiryDate?: string;
  creditedDays?: number;
}

export interface PolicyWarning {
  code: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
}

export interface LeaveConflict {
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  type: LeaveType;
  status: LeaveStatus;
}

export interface PolicyPreviewResult {
  countedDays: number;
  appliesSandwich: boolean;
  isBackdated: boolean;
  backdatedDays: number;
  negativeBalanceAfter: boolean;
  wfhLimitExceeded: boolean;
  calendarUsed: CalendarType;
  warnings: PolicyWarning[];
  projectedBalanceByType: number;
  conflicts: LeaveConflict[];
  coverageScore: CoverageScore;
}

export interface HolidayCalendar {
  id: string;
  name: string;
  type: CalendarType;
  location?: string;
  client?: string;
  holidays: Holiday[];
  isDefault: boolean;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  type: 'national' | 'regional' | 'client' | 'optional';
  isOptional: boolean;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedAt: string;
}

export interface TeamCalendarView {
  employeeId: string;
  employeeName: string;
  leaves: Array<{
    id: string;
    startDate: string;
    endDate: string;
    type: LeaveType;
    status: LeaveStatus;
    halfDay?: HalfDayPeriod;
  }>;
  wfhDays: string[];
}

export interface LeaveReportData {
  usageByType: Array<{ type: LeaveType; days: number; percentage: number }>;
  usageByDepartment: Array<{ department: string; days: number; employees: number }>;
  monthlyTrends: Array<{ month: string; leaves: number; wfh: number }>;
  weekdayPattern: Array<{ day: string; count: number; percentage: number }>;
  absenteeismStats: {
    mondayBias: number;
    fridayBias: number;
    averageLeaveLength: number;
    totalAbsenteeism: number;
  };
  balanceAging: Array<{ type: LeaveType; expiring: number; unutilized: number }>;
  compOffStats: {
    issued: number;
    consumed: number;
    expired: number;
    pending: number;
  };
}

export interface LeaveSettings {
  policies: LeavePolicy[];
  wfhGlobalLimit: number;
  wfhDepartmentOverrides: Record<string, number>;
  backdatedGlobalLimit: number;
  outlookSyncEnabled: boolean;
  defaultCalendarId: string;
  encashmentWindows: Array<{ start: string; end: string }>;
  notifications: {
    reminderDaysBeforeExpiry: number;
    escalationDaysForApproval: number;
    weeklyDigestEnabled: boolean;
  };
  auditRetentionDays: number;
}