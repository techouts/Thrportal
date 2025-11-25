import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LeaveMeService, LeaveManagerService, LeaveHrService } from '@/services/leave';
import { PolicyEngine } from '@/services/policyEngine';
import { useToast } from '@/hooks/use-toast';
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

// Query Keys
export const LEAVE_QUERY_KEYS = {
  BALANCES: ['leave', 'balances'] as const,
  CALENDARS: ['leave', 'calendars'] as const,
  MY_REQUESTS: ['leave', 'my-requests'] as const,
  PENDING_L1: ['leave', 'pending-l1'] as const,
  PENDING_L2: ['leave', 'pending-l2'] as const,
  TEAM_CALENDAR: ['leave', 'team-calendar'] as const,
  POLICIES: ['leave', 'policies'] as const,
  HOLIDAYS: ['leave', 'holidays'] as const,
  REPORTS: ['leave', 'reports'] as const,
  SETTINGS: ['leave', 'settings'] as const,
};

// Employee hooks
export function useLeaveBalances(financialYear?: string) {
  return useQuery({
    queryKey: [...LEAVE_QUERY_KEYS.BALANCES, financialYear],
    queryFn: () => LeaveMeService.getBalances(financialYear),
  });
}

export function useHolidayCalendars(from: string, to: string) {
  return useQuery({
    queryKey: [...LEAVE_QUERY_KEYS.CALENDARS, from, to],
    queryFn: () => LeaveMeService.getCalendars(from, to),
  });
}

export function useMyLeaveRequests(filters?: {
  status?: string;
  type?: LeaveType;
  from?: string;
  to?: string;
}) {
  return useQuery({
    queryKey: [...LEAVE_QUERY_KEYS.MY_REQUESTS, filters],
    queryFn: () => LeaveMeService.getMyRequests(filters),
  });
}

export function usePolicyPreview() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (params: {
      typeId: string;
      start: string;
      end: string;
      halfDay?: HalfDayPeriod;
      wfh?: boolean;
    }) => LeaveMeService.previewPolicy(params),
    onError: (error: any) => {
      toast({
        title: "Preview Error",
        description: error.message || "Failed to preview leave policy",
        variant: "destructive",
      });
    },
  });
}

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: {
      type: LeaveType;
      startDate: string;
      endDate: string;
      halfDay?: HalfDayPeriod;
      reason: string;
      isWfh: boolean;
      outlookHold: boolean;
      attachments?: File[];
    }) => LeaveMeService.createLeaveRequest(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: LEAVE_QUERY_KEYS.MY_REQUESTS });
      queryClient.invalidateQueries({ queryKey: LEAVE_QUERY_KEYS.BALANCES });
      toast({
        title: "Leave Request Submitted",
        description: "Your leave request has been submitted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit leave request",
        variant: "destructive",
      });
    },
  });
}

export function useCreateCompOffRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: {
      workDate: string;
      hours: number;
      reason: string;
      project?: string;
      evidence?: string;
    }) => LeaveMeService.requestCompOff(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEAVE_QUERY_KEYS.MY_REQUESTS });
      toast({
        title: "Comp-Off Request Submitted",
        description: "Your comp-off request has been submitted for approval",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit comp-off request",
        variant: "destructive",
      });
    },
  });
}

// Manager hooks
export function usePendingL1Approvals(filters?: {
  employeeId?: string;
  type?: LeaveType;
  hasConflict?: boolean;
  coverageRisk?: string;
  from?: string;
  to?: string;
}) {
  return useQuery({
    queryKey: [...LEAVE_QUERY_KEYS.PENDING_L1, filters],
    queryFn: () => LeaveManagerService.listPendingL1(filters),
  });
}

export function useTeamCalendar(from: string, to: string) {
  return useQuery({
    queryKey: [...LEAVE_QUERY_KEYS.TEAM_CALENDAR, from, to],
    queryFn: () => LeaveManagerService.getTeamCalendar(from, to),
  });
}

export function useApproveL1() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) => 
      LeaveManagerService.approveL1(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEAVE_QUERY_KEYS.PENDING_L1 });
      queryClient.invalidateQueries({ queryKey: LEAVE_QUERY_KEYS.TEAM_CALENDAR });
      toast({
        title: "Request Approved",
        description: "Leave request has been approved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve leave request",
        variant: "destructive",
      });
    },
  });
}

export function useRejectL1() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, reason, note }: { id: string; reason: string; note?: string }) => 
      LeaveManagerService.rejectL1(id, reason, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEAVE_QUERY_KEYS.PENDING_L1 });
      toast({
        title: "Request Rejected",
        description: "Leave request has been rejected",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Rejection Failed",
        description: error.message || "Failed to reject leave request",
        variant: "destructive",
      });
    },
  });
}

export function useBulkApproveL1() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ ids, note }: { ids: string[]; note?: string }) => 
      LeaveManagerService.bulkApproveL1(ids, note),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: LEAVE_QUERY_KEYS.PENDING_L1 });
      toast({
        title: "Bulk Approval Complete",
        description: `${response.data.approved} requests approved, ${response.data.failed} failed`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Bulk Approval Failed",
        description: error.message || "Failed to process bulk approval",
        variant: "destructive",
      });
    },
  });
}

// HR hooks
export function usePendingL2Approvals(filters?: {
  employeeId?: string;
  type?: LeaveType;
  hasBackdatedOverride?: boolean;
  hasNegativeBalance?: boolean;
  hasExpiredCompOff?: boolean;
  from?: string;
  to?: string;
}) {
  return useQuery({
    queryKey: [...LEAVE_QUERY_KEYS.PENDING_L2, filters],
    queryFn: () => LeaveHrService.listPendingL2(filters),
  });
}

export function useApproveL2() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) => 
      LeaveHrService.approveL2(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEAVE_QUERY_KEYS.PENDING_L2 });
      toast({
        title: "Request Approved",
        description: "Leave request has been approved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve leave request",
        variant: "destructive",
      });
    },
  });
}

export function useLeaveSettings() {
  return useQuery({
    queryKey: LEAVE_QUERY_KEYS.SETTINGS,
    queryFn: () => LeaveHrService.getSettings(),
  });
}

export function useUpdateLeaveSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (settings: Partial<LeaveSettings>) => 
      LeaveHrService.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEAVE_QUERY_KEYS.SETTINGS });
      toast({
        title: "Settings Updated",
        description: "Leave settings have been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update leave settings",
        variant: "destructive",
      });
    },
  });
}

export function useLeaveReports(params: {
  from: string;
  to: string;
  departments?: string[];
  locations?: string[];
  clients?: string[];
}) {
  return useQuery({
    queryKey: [...LEAVE_QUERY_KEYS.REPORTS, params],
    queryFn: () => LeaveHrService.getReports(params),
    enabled: !!params.from && !!params.to,
  });
}

export function useUploadAllocations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (file: File) => LeaveHrService.uploadAllocations(file),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: LEAVE_QUERY_KEYS.BALANCES });
      toast({
        title: "Upload Complete",
        description: `${response.data.processed} allocations processed. ${response.data.errors.length} errors.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload allocations",
        variant: "destructive",
      });
    },
  });
}