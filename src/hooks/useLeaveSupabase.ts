import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const QUERY_KEYS = {
  leaveRequests: 'leave-requests',
  compOffRequests: 'comp-off-requests',
  allRequests: 'all-requests',
  profiles: 'profiles-search',
};

// Types
interface LeaveRequestInsert {
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason?: string;
  requested_by?: string;
}

interface CompOffRequestInsert {
  employee_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason?: string;
  evidence_url?: string;
}

interface CompOffRequestDB {
  employee_id: string;
  comp_off_date: string;
  start_date: string;
  end_date: string;
  total_days: number;
  is_half_day: boolean;
  reason?: string;
  evidence_url?: string;
}

// Unified request type for display
export interface UnifiedLeaveRequest {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  total_days: number;
  status: string;
  requested_by: string | null;
  reason: string | null;
  rejection_reason: string | null;
  approved_at: string | null;
  created_at: string;
  evidence_url?: string | null;
  request_source: 'leave' | 'comp_off';
}

// Fetch leave requests for current user
export function useMyLeaveRequests(employeeId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.leaveRequests, employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId,
  });
}

// Fetch comp-off requests for current user
export function useMyCompOffRequests(employeeId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.compOffRequests, employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      
      const { data, error } = await supabase
        .from('comp_off_requests')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId,
  });
}

// Fetch ALL requests (leave + comp-off) for My Requests tab
export function useAllMyRequests(employeeId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.allRequests, employeeId],
    queryFn: async (): Promise<UnifiedLeaveRequest[]> => {
      if (!employeeId) return [];
      
      // Fetch both leave requests and comp-off requests
      const [leaveResult, compOffResult] = await Promise.all([
        supabase
          .from('leave_requests')
          .select('*')
          .eq('employee_id', employeeId)
          .order('created_at', { ascending: false }),
        supabase
          .from('comp_off_requests')
          .select('*')
          .eq('employee_id', employeeId)
          .order('created_at', { ascending: false })
      ]);

      if (leaveResult.error) throw leaveResult.error;
      if (compOffResult.error) throw compOffResult.error;

      // Transform leave requests
      const leaveRequests: UnifiedLeaveRequest[] = (leaveResult.data || []).map(req => ({
        id: req.id,
        leave_type: req.leave_type,
        start_date: req.start_date,
        end_date: req.end_date,
        total_days: req.total_days,
        status: req.status,
        requested_by: req.requested_by,
        reason: req.reason,
        rejection_reason: req.rejection_reason,
        approved_at: req.approved_at,
        created_at: req.created_at,
        evidence_url: null,
        request_source: 'leave' as const,
      }));

      // Transform comp-off requests
      const compOffRequests: UnifiedLeaveRequest[] = (compOffResult.data || []).map(req => ({
        id: req.id,
        leave_type: 'COMP_OFF',
        start_date: req.start_date,
        end_date: req.end_date,
        total_days: req.total_days || 1,
        status: req.status,
        requested_by: null,
        reason: req.reason,
        rejection_reason: null,
        approved_at: req.approved_at,
        created_at: req.created_at,
        evidence_url: req.evidence_url,
        request_source: 'comp_off' as const,
      }));

      // Combine and sort by created_at descending
      const allRequests = [...leaveRequests, ...compOffRequests].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return allRequests;
    },
    enabled: !!employeeId,
  });
}

// Fetch profiles for employee search
export function useProfiles() {
  return useQuery({
    queryKey: [QUERY_KEYS.profiles],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, first_name, last_name')
        .order('display_name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
}

// Create leave request mutation
export function useCreateLeaveRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (request: LeaveRequestInsert) => {
      const { data, error } = await supabase
        .from('leave_requests')
        .insert(request)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.leaveRequests] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.allRequests] });
      toast({
        title: 'Success',
        description: 'Leave request submitted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit leave request',
        variant: 'destructive',
      });
    },
  });
}

// Create comp-off request mutation
export function useCreateCompOffRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (request: CompOffRequestInsert) => {
      // Map to DB schema (includes legacy fields for compatibility)
      const dbRequest: CompOffRequestDB = {
        employee_id: request.employee_id,
        comp_off_date: request.start_date, // Use start_date as comp_off_date for legacy compatibility
        start_date: request.start_date,
        end_date: request.end_date,
        total_days: request.total_days,
        is_half_day: false,
        reason: request.reason,
        evidence_url: request.evidence_url,
      };
      
      const { data, error } = await supabase
        .from('comp_off_requests')
        .insert(dbRequest as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.compOffRequests] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.allRequests] });
      toast({
        title: 'Success',
        description: 'Comp-off request submitted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit comp-off request',
        variant: 'destructive',
      });
    },
  });
}

// Cancel leave request mutation
export function useCancelLeaveRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const { data, error } = await supabase
        .from('leave_requests')
        .update({ status: 'cancelled' })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.leaveRequests] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.allRequests] });
      toast({
        title: 'Success',
        description: 'Leave request cancelled',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel leave request',
        variant: 'destructive',
      });
    },
  });
}

// Cancel comp-off request mutation
export function useCancelCompOffRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const { data, error } = await supabase
        .from('comp_off_requests')
        .update({ status: 'cancelled' })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.compOffRequests] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.allRequests] });
      toast({
        title: 'Success',
        description: 'Comp-off request cancelled',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel comp-off request',
        variant: 'destructive',
      });
    },
  });
}
