import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CompOffBalance {
  earned: number;
  consumed: number;
  available: number;
}

export function useCompOffBalance(employeeId: string | undefined) {
  return useQuery({
    queryKey: ['compOffBalance', employeeId],
    queryFn: async (): Promise<CompOffBalance> => {
      if (!employeeId) {
        return { earned: 0, consumed: 0, available: 0 };
      }

      // Get approved comp-off requests (earned)
      const { data: earnedData, error: earnedError } = await supabase
        .from('comp_off_requests')
        .select('total_days')
        .eq('employee_id', employeeId)
        .eq('status', 'approved');

      if (earnedError) throw earnedError;

      // Get consumed comp-offs from leave requests
      const { data: consumedData, error: consumedError } = await supabase
        .from('leave_requests')
        .select('total_days')
        .eq('employee_id', employeeId)
        .eq('leave_type', 'COMP_OFF')
        .in('status', ['approved', 'pending']);

      if (consumedError) throw consumedError;

      const earned = earnedData?.reduce((sum, r) => sum + (Number(r.total_days) || 0), 0) || 0;
      const consumed = consumedData?.reduce((sum, r) => sum + (Number(r.total_days) || 0), 0) || 0;
      const available = Math.max(0, earned - consumed);

      return { earned, consumed, available };
    },
    enabled: !!employeeId,
  });
}
