import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const QUERY_KEYS = {
  pendingApprovals: 'manager-pending-leave-approvals',
  teamCalendar: 'manager-team-calendar',
  compOffBalance: 'compOffBalance',
};

// Types for the leave request with employee info
export interface PendingLeaveRequest {
  id: string;
  employee_id: string;
  employeeName: string;
  leave_type: string;
  type: string;
  start_date: string;
  startDate: string;
  end_date: string;
  endDate: string;
  total_days: number;
  totalDays: number;
  reason: string | null;
  status: string;
  created_at: string;
  halfDay?: string;
  coverageScore: string;
  conflictsWith: string[];
  evidence_url?: string | null;
  rejection_reason?: string | null;
  request_source: 'leave' | 'comp_off';
}

interface TeamMemberCalendar {
  employeeId: string;
  employeeName: string;
  leaves: {
    id: string;
    type: string;
    startDate: string;
    endDate: string;
    status: string;
  }[];
  wfhDays: string[];
}

// Fetch pending leave approvals for manager's direct reports (includes comp-off requests)
export function usePendingLeaveApprovals(managerId: string | undefined, statusFilter: 'pending' | 'rejected' = 'pending') {
  return useQuery({
    queryKey: [QUERY_KEYS.pendingApprovals, managerId, statusFilter],
    queryFn: async () => {
      if (!managerId) return { data: [] };

      // First get direct reports of this manager
      const { data: directReports, error: reportsError } = await supabase
        .from('profiles')
        .select('id, display_name, first_name, last_name')
        .eq('manager_employee_id', managerId);

      if (reportsError) throw reportsError;

      const reportIds = directReports?.map(r => r.id) || [];
      
      if (reportIds.length === 0) {
        return { data: [] };
      }

      // Fetch leave requests AND comp-off requests from direct reports based on status filter
      const [leaveResult, compOffResult] = await Promise.all([
        supabase
          .from('leave_requests')
          .select('*')
          .in('employee_id', reportIds)
          .eq('status', statusFilter)
          .order('created_at', { ascending: false }),
        supabase
          .from('comp_off_requests')
          .select('*')
          .in('employee_id', reportIds)
          .eq('status', statusFilter)
          .order('created_at', { ascending: false })
      ]);

      if (leaveResult.error) throw leaveResult.error;
      if (compOffResult.error) throw compOffResult.error;

      // Map leave requests with employee names
      const leaveRequests: PendingLeaveRequest[] = (leaveResult.data || []).map(req => {
        const employee = directReports?.find(r => r.id === req.employee_id);
        const employeeName = employee?.display_name || 
          `${employee?.first_name || ''} ${employee?.last_name || ''}`.trim() || 
          'Unknown';

        return {
          id: req.id,
          employee_id: req.employee_id,
          employeeName,
          leave_type: req.leave_type,
          type: req.leave_type,
          start_date: req.start_date,
          startDate: req.start_date,
          end_date: req.end_date,
          endDate: req.end_date,
          total_days: req.total_days,
          totalDays: req.total_days,
          reason: req.reason,
          status: req.status,
          created_at: req.created_at,
          halfDay: undefined,
          coverageScore: 'High',
          conflictsWith: [],
          evidence_url: req.evidence_url,
          rejection_reason: req.rejection_reason,
          request_source: 'leave' as const,
        };
      });

      // Map comp-off requests with employee names
      const compOffRequests: PendingLeaveRequest[] = (compOffResult.data || []).map(req => {
        const employee = directReports?.find(r => r.id === req.employee_id);
        const employeeName = employee?.display_name || 
          `${employee?.first_name || ''} ${employee?.last_name || ''}`.trim() || 
          'Unknown';

        return {
          id: req.id,
          employee_id: req.employee_id,
          employeeName,
          leave_type: 'COMP_OFF',
          type: 'COMP_OFF',
          start_date: req.start_date,
          startDate: req.start_date,
          end_date: req.end_date,
          endDate: req.end_date,
          total_days: req.total_days || 1,
          totalDays: req.total_days || 1,
          reason: req.reason,
          status: req.status,
          created_at: req.created_at,
          halfDay: undefined,
          coverageScore: 'High',
          conflictsWith: [],
          evidence_url: req.evidence_url,
          rejection_reason: null, // comp_off doesn't have rejection_reason column
          request_source: 'comp_off' as const,
        };
      });

      // Combine and sort by created_at descending
      const allRequests = [...leaveRequests, ...compOffRequests].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return { data: allRequests };
    },
    enabled: !!managerId,
  });
}

// Fetch team calendar for manager's direct reports
export function useTeamCalendarSupabase(managerId: string | undefined, from: string, to: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.teamCalendar, managerId, from, to],
    queryFn: async () => {
      if (!managerId) return { data: [] };

      // Get direct reports
      const { data: directReports, error: reportsError } = await supabase
        .from('profiles')
        .select('id, display_name, first_name, last_name')
        .eq('manager_employee_id', managerId);

      if (reportsError) throw reportsError;

      const reportIds = directReports?.map(r => r.id) || [];
      
      if (reportIds.length === 0) {
        return { data: [] };
      }

      // Fetch all leave requests for this period (any status)
      const { data: leaveRequests, error: leaveError } = await supabase
        .from('leave_requests')
        .select('*')
        .in('employee_id', reportIds)
        .gte('start_date', from)
        .lte('end_date', to);

      if (leaveError) throw leaveError;

      // Group by employee
      const calendarData: TeamMemberCalendar[] = (directReports || []).map(employee => {
        const employeeLeaves = (leaveRequests || []).filter(l => l.employee_id === employee.id);
        const employeeName = employee.display_name || 
          `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 
          'Unknown';

        return {
          employeeId: employee.id,
          employeeName,
          leaves: employeeLeaves.map(l => ({
            id: l.id,
            type: l.leave_type,
            startDate: l.start_date,
            endDate: l.end_date,
            status: l.status,
          })),
          wfhDays: [], // Add WFH tracking if you have it
        };
      });

      return { data: calendarData };
    },
    enabled: !!managerId && !!from && !!to,
  });
}

// Approve leave request mutation
export function useApproveLeaveRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, note }: { id: string; note?: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      const approverId = userData?.user?.id;

      const { data, error } = await supabase
        .from('leave_requests')
        .update({
          status: 'approved',
          approved_by: approverId,
          approved_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.pendingApprovals] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.teamCalendar] });
      toast({
        title: 'Request Approved',
        description: 'Leave request has been approved successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Approval Failed',
        description: error.message || 'Failed to approve leave request',
        variant: 'destructive',
      });
    },
  });
}

// Approve comp-off request mutation
export function useApproveCompOffRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, note }: { id: string; note?: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      const approverId = userData?.user?.id;

      const { data, error } = await supabase
        .from('comp_off_requests')
        .update({
          status: 'approved',
          approved_by: approverId,
          approved_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.pendingApprovals] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.compOffBalance] });
      toast({
        title: 'Comp-Off Approved',
        description: 'Comp-off request has been approved successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Approval Failed',
        description: error.message || 'Failed to approve comp-off request',
        variant: 'destructive',
      });
    },
  });
}

// Reject leave request mutation
export function useRejectLeaveRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      const approverId = userData?.user?.id;

      const { data, error } = await supabase
        .from('leave_requests')
        .update({
          status: 'rejected',
          approved_by: approverId,
          approved_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.pendingApprovals] });
      toast({
        title: 'Request Rejected',
        description: 'Leave request has been rejected',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Rejection Failed',
        description: error.message || 'Failed to reject leave request',
        variant: 'destructive',
      });
    },
  });
}

// Reject comp-off request mutation
export function useRejectCompOffRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      const approverId = userData?.user?.id;

      const { data, error } = await supabase
        .from('comp_off_requests')
        .update({
          status: 'rejected',
          approved_by: approverId,
          approved_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.pendingApprovals] });
      toast({
        title: 'Request Rejected',
        description: 'Comp-off request has been rejected',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Rejection Failed',
        description: error.message || 'Failed to reject comp-off request',
        variant: 'destructive',
      });
    },
  });
}

// Bulk approve leave requests
export function useBulkApproveLeaveRequests() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ ids, requestSources }: { ids: string[]; requestSources?: Record<string, 'leave' | 'comp_off'> }) => {
      const { data: userData } = await supabase.auth.getUser();
      const approverId = userData?.user?.id;

      // If requestSources is provided, separate the requests
      if (requestSources) {
        const leaveIds = ids.filter(id => requestSources[id] === 'leave');
        const compOffIds = ids.filter(id => requestSources[id] === 'comp_off');

        const results = await Promise.all([
          leaveIds.length > 0 ? supabase
            .from('leave_requests')
            .update({
              status: 'approved',
              approved_by: approverId,
              approved_at: new Date().toISOString(),
            })
            .in('id', leaveIds)
            .select() : { data: [] },
          compOffIds.length > 0 ? supabase
            .from('comp_off_requests')
            .update({
              status: 'approved',
              approved_by: approverId,
              approved_at: new Date().toISOString(),
            })
            .in('id', compOffIds)
            .select() : { data: [] }
        ]);

        const totalApproved = (results[0].data?.length || 0) + (results[1].data?.length || 0);
        return { approved: totalApproved, failed: ids.length - totalApproved };
      }

      // Fallback to leave requests only
      const { data, error } = await supabase
        .from('leave_requests')
        .update({
          status: 'approved',
          approved_by: approverId,
          approved_at: new Date().toISOString(),
        })
        .in('id', ids)
        .select();

      if (error) throw error;
      return { approved: data?.length || 0, failed: ids.length - (data?.length || 0) };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.pendingApprovals] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.teamCalendar] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.compOffBalance] });
      toast({
        title: 'Bulk Approval Complete',
        description: `${result.approved} requests approved`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Bulk Approval Failed',
        description: error.message || 'Failed to process bulk approval',
        variant: 'destructive',
      });
    },
  });
}
