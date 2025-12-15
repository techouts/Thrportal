import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RegularizationRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  attendance_date: string;
  reason: string;
  status: string;
  document_url?: string;
  created_at: string;
}

export function usePendingRegularizationRequests(managerId?: string) {
  return useQuery({
    queryKey: ['pending-regularization-requests', managerId],
    queryFn: async (): Promise<RegularizationRequest[]> => {
      if (!managerId) return [];

      // First get direct reports of this manager
      const { data: directReports, error: reportsError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('manager_employee_id', managerId);

      if (reportsError) throw reportsError;
      if (!directReports || directReports.length === 0) return [];

      const reportIds = directReports.map(r => r.id);

      // Get pending regularization requests from direct reports
      const { data: requests, error } = await supabase
        .from('attendance_regularization_requests')
        .select('*')
        .in('employee_id', reportIds)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map employee names
      const employeeMap = new Map(
        directReports.map(r => [r.id, `${r.first_name || ''} ${r.last_name || ''}`.trim() || 'Unknown'])
      );

      return (requests || []).map(req => ({
        id: req.id,
        employee_id: req.employee_id,
        employee_name: employeeMap.get(req.employee_id) || 'Unknown',
        attendance_date: req.attendance_date,
        reason: req.reason,
        status: req.status,
        document_url: req.document_url || undefined,
        created_at: req.created_at || ''
      }));
    },
    enabled: !!managerId
  });
}

export function useApproveRegularization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, approverId }: { requestId: string; approverId: string }) => {
      const { error } = await supabase
        .from('attendance_regularization_requests')
        .update({
          status: 'approved',
          approved_by: approverId,
          approved_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-regularization-requests'] });
      toast.success('Regularization request approved');
    },
    onError: () => {
      toast.error('Failed to approve request');
    }
  });
}

export function useRejectRegularization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, approverId, rejectionReason }: { requestId: string; approverId: string; rejectionReason?: string }) => {
      const { error } = await supabase
        .from('attendance_regularization_requests')
        .update({
          status: 'rejected',
          approved_by: approverId,
          approved_at: new Date().toISOString(),
          rejection_reason: rejectionReason || 'Rejected by manager'
        })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-regularization-requests'] });
      toast.success('Regularization request rejected');
    },
    onError: () => {
      toast.error('Failed to reject request');
    }
  });
}
