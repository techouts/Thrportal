import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const QUERY_KEYS = {
  pendingApprovals: 'manager-pending-leave-approvals',
  teamCalendar: 'manager-team-calendar',
};

// Types for the leave request with employee info
interface PendingLeaveRequest {
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

// Fetch pending leave approvals for manager's direct reports
export function usePendingLeaveApprovals(managerId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.pendingApprovals, managerId],
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

      // Fetch pending leave requests from direct reports
      const { data: leaveRequests, error: leaveError } = await supabase
        .from('leave_requests')
        .select('*')
        .in('employee_id', reportIds)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (leaveError) throw leaveError;

      // Map leave requests with employee names
      const requestsWithNames: PendingLeaveRequest[] = (leaveRequests || []).map(req => {
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
          halfDay: undefined, // Add if you have half day field
          coverageScore: 'High', // Placeholder - calculate based on team availability
          conflictsWith: [], // Placeholder - detect overlapping leaves
        };
      });

      return { data: requestsWithNames };
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

// Bulk approve leave requests
export function useBulkApproveLeaveRequests() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ ids }: { ids: string[] }) => {
      const { data: userData } = await supabase.auth.getUser();
      const approverId = userData?.user?.id;

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
