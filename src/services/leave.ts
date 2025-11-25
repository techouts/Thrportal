import { ApiService } from './api';
import {
  LeaveBalance,
  LeaveRequestDetailed,
  CompOffRequest,
  PolicyPreviewResult,
  HolidayCalendar,
  TeamCalendarView,
  LeaveReportData,
  LeaveSettings,
  LeaveType,
  HalfDayPeriod
} from '@/types/leave';

// API Endpoints
const ENDPOINTS = {
  // Employee endpoints
  BALANCES: '/api/leave/balances',
  CALENDARS: '/api/leave/calendars',
  POLICY_PREVIEW: '/api/leave/policy/preview',
  LEAVE_REQUEST: '/api/leave/requests',
  COMP_OFF_REQUEST: '/api/leave/compoff',
  MY_REQUESTS: '/api/leave/my-requests',
  
  // Manager endpoints
  PENDING_L1: '/api/leave/approvals/pending-l1',
  APPROVE_L1: '/api/leave/approvals/l1',
  REJECT_L1: '/api/leave/approvals/l1/reject',
  DELEGATE_L1: '/api/leave/approvals/l1/delegate',
  TEAM_CALENDAR: '/api/leave/team/calendar',
  
  // HR endpoints
  PENDING_L2: '/api/leave/approvals/pending-l2',
  APPROVE_L2: '/api/leave/approvals/l2',
  REJECT_L2: '/api/leave/approvals/l2/reject',
  OVERRIDE_POLICY: '/api/leave/approvals/l2/override',
  POLICIES: '/api/leave/policies',
  ALLOCATIONS: '/api/leave/allocations',
  HOLIDAYS: '/api/leave/holidays',
  REPORTS: '/api/leave/reports',
  SETTINGS: '/api/leave/settings',
  
  // Integration endpoints
  OUTLOOK_SYNC: '/api/leave/integrations/outlook',
  ATTENDANCE_EXCUSE: '/api/leave/integrations/attendance',
  PAYROLL_EXPORT: '/api/leave/integrations/payroll'
};

export class LeaveMeService {
  static async getBalances(financialYear?: string) {
    return ApiService.get<LeaveBalance[]>(ENDPOINTS.BALANCES, {
      params: { financialYear }
    });
  }

  static async getCalendars(from: string, to: string) {
    return ApiService.get<HolidayCalendar[]>(ENDPOINTS.CALENDARS, {
      params: { from, to }
    });
  }

  static async previewPolicy(params: {
    typeId: string;
    start: string;
    end: string;
    halfDay?: HalfDayPeriod;
    wfh?: boolean;
  }) {
    return ApiService.post<PolicyPreviewResult>(ENDPOINTS.POLICY_PREVIEW, params);
  }

  static async createLeaveRequest(payload: {
    type: LeaveType;
    startDate: string;
    endDate: string;
    halfDay?: HalfDayPeriod;
    reason: string;
    isWfh: boolean;
    outlookHold: boolean;
    attachments?: File[];
  }) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (key === 'attachments' && Array.isArray(value)) {
        value.forEach(file => formData.append('attachments', file));
      } else {
        formData.append(key, String(value));
      }
    });

    return ApiService.post<LeaveRequestDetailed>(ENDPOINTS.LEAVE_REQUEST, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  static async amendLeaveRequest(id: string, patch: Partial<LeaveRequestDetailed>) {
    return ApiService.patch<LeaveRequestDetailed>(`${ENDPOINTS.LEAVE_REQUEST}/${id}`, patch);
  }

  static async requestCompOff(payload: {
    workDate: string;
    hours: number;
    reason: string;
    project?: string;
    evidence?: string;
  }) {
    return ApiService.post<CompOffRequest>(ENDPOINTS.COMP_OFF_REQUEST, payload);
  }

  static async getMyRequests(filters?: {
    status?: string;
    type?: LeaveType;
    from?: string;
    to?: string;
  }) {
    return ApiService.get<LeaveRequestDetailed[]>(ENDPOINTS.MY_REQUESTS, {
      params: filters
    });
  }
}

export class LeaveManagerService {
  static async listPendingL1(filters?: {
    employeeId?: string;
    type?: LeaveType;
    hasConflict?: boolean;
    coverageRisk?: string;
    from?: string;
    to?: string;
  }) {
    return ApiService.get<LeaveRequestDetailed[]>(ENDPOINTS.PENDING_L1, {
      params: filters
    });
  }

  static async approveL1(id: string, note?: string) {
    return ApiService.post<LeaveRequestDetailed>(`${ENDPOINTS.APPROVE_L1}/${id}`, { note });
  }

  static async rejectL1(id: string, reason: string, note?: string) {
    return ApiService.post<LeaveRequestDetailed>(`${ENDPOINTS.REJECT_L1}/${id}`, { reason, note });
  }

  static async delegateL1(id: string, delegateTo: string) {
    return ApiService.post<LeaveRequestDetailed>(`${ENDPOINTS.DELEGATE_L1}/${id}`, { delegateTo });
  }

  static async bulkApproveL1(ids: string[], note?: string) {
    return ApiService.post<{ approved: number; failed: number }>(`${ENDPOINTS.APPROVE_L1}/bulk`, { 
      ids, 
      note 
    });
  }

  static async bulkRejectL1(ids: string[], reason: string, note?: string) {
    return ApiService.post<{ rejected: number; failed: number }>(`${ENDPOINTS.REJECT_L1}/bulk`, { 
      ids, 
      reason, 
      note 
    });
  }

  static async getTeamCalendar(from: string, to: string) {
    return ApiService.get<TeamCalendarView[]>(ENDPOINTS.TEAM_CALENDAR, {
      params: { from, to }
    });
  }
}

export class LeaveHrService {
  static async listPendingL2(filters?: {
    employeeId?: string;
    type?: LeaveType;
    hasBackdatedOverride?: boolean;
    hasNegativeBalance?: boolean;
    hasExpiredCompOff?: boolean;
    from?: string;
    to?: string;
  }) {
    return ApiService.get<LeaveRequestDetailed[]>(ENDPOINTS.PENDING_L2, {
      params: filters
    });
  }

  static async approveL2(id: string, note?: string) {
    return ApiService.post<LeaveRequestDetailed>(`${ENDPOINTS.APPROVE_L2}/${id}`, { note });
  }

  static async rejectL2(id: string, reason: string, note?: string) {
    return ApiService.post<LeaveRequestDetailed>(`${ENDPOINTS.REJECT_L2}/${id}`, { reason, note });
  }

  static async overrideBackdatedOrExpiry(id: string, payload: {
    override: 'backdated' | 'expiry';
    justification: string;
    note?: string;
  }) {
    return ApiService.post<LeaveRequestDetailed>(`${ENDPOINTS.OVERRIDE_POLICY}/${id}`, payload);
  }

  // Policy Management
  static async getPolicies() {
    return ApiService.get<LeaveSettings>(ENDPOINTS.POLICIES);
  }

  static async updatePolicies(settings: Partial<LeaveSettings>) {
    return ApiService.put<LeaveSettings>(ENDPOINTS.POLICIES, settings);
  }

  // Allocation Management
  static async uploadAllocations(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return ApiService.post<{ processed: number; errors: string[] }>(
      `${ENDPOINTS.ALLOCATIONS}/upload`, 
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  }

  static async applyAllocations(allocations: Array<{
    employeeId: string;
    type: LeaveType;
    days: number;
    reason: string;
  }>) {
    return ApiService.post<{ applied: number; failed: number }>(
      `${ENDPOINTS.ALLOCATIONS}/apply`, 
      { allocations }
    );
  }

  // Holiday Management
  static async getHolidays() {
    return ApiService.get<HolidayCalendar[]>(ENDPOINTS.HOLIDAYS);
  }

  static async importHolidays(calendarId: string, file: File, format: 'ics' | 'csv') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);
    return ApiService.post<{ imported: number; skipped: number }>(
      `${ENDPOINTS.HOLIDAYS}/${calendarId}/import`, 
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  }

  // Reports
  static async getReports(params: {
    from: string;
    to: string;
    departments?: string[];
    locations?: string[];
    clients?: string[];
  }) {
    return ApiService.get<LeaveReportData>(ENDPOINTS.REPORTS, { params });
  }

  static async exportReports(params: {
    from: string;
    to: string;
    format: 'csv' | 'xlsx';
    departments?: string[];
    locations?: string[];
    clients?: string[];
  }) {
    return ApiService.get<{ url: string }>(`${ENDPOINTS.REPORTS}/export`, { params });
  }

  // Settings
  static async getSettings() {
    return ApiService.get<LeaveSettings>(ENDPOINTS.SETTINGS);
  }

  static async updateSettings(settings: Partial<LeaveSettings>) {
    return ApiService.put<LeaveSettings>(ENDPOINTS.SETTINGS, settings);
  }
}

export class LeaveIntegrationsService {
  static async createOutlookTentative(requestId: string) {
    return ApiService.post<{ eventId: string }>(`${ENDPOINTS.OUTLOOK_SYNC}/tentative`, { requestId });
  }

  static async updateOutlookToBusy(requestId: string) {
    return ApiService.post<{ eventId: string }>(`${ENDPOINTS.OUTLOOK_SYNC}/busy`, { requestId });
  }

  static async deleteOutlookHold(requestId: string) {
    return ApiService.delete<{ deleted: boolean }>(`${ENDPOINTS.OUTLOOK_SYNC}/${requestId}`);
  }

  static async markAttendanceExcused(employeeId: string, date: string) {
    return ApiService.post<{ marked: boolean }>(ENDPOINTS.ATTENDANCE_EXCUSE, { employeeId, date });
  }

  static async exportPayroll(params: {
    from: string;
    to: string;
    format: 'csv' | 'json';
  }) {
    return ApiService.get<{ url: string }>(ENDPOINTS.PAYROLL_EXPORT, { params });
  }
}