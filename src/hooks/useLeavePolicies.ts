import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LeavePolicy, LeaveTransaction } from '@/types/leavePolicy';
import { useAuth } from '@/auth/AuthContext';

export function useLeavePolicies() {
  return useQuery({
    queryKey: ['leave-policies'],
    queryFn: async (): Promise<LeavePolicy[]> => {
      const { data, error } = await supabase
        .from('leave_policies')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      
      return (data || []).map(row => ({
        ...row,
        restrictions: Array.isArray(row.restrictions) 
          ? (row.restrictions as unknown as string[]) 
          : [],
        accrual_frequency: (row.accrual_frequency || 'none') as LeavePolicy['accrual_frequency'],
      }));
    },
  });
}

export function useLeaveTransactions(leaveType: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['leave-transactions', leaveType, user?.id],
    queryFn: async (): Promise<LeaveTransaction[]> => {
      if (!user?.id) return [];

      // Map policy code to leave type if needed
      const typeMap: Record<string, string> = {
        'CL': 'CL',
        'COMP_OFF': 'COMP_OFF',
        'PL_PATERNITY': 'PL',
        'ML': 'ML',
        'LOP': 'LOP',
      };

      const requestType = typeMap[leaveType] || leaveType;
      const currentYear = new Date().getFullYear();

      // Call the edge function to get transactions
      const { data, error } = await supabase.functions.invoke('get-leave-transactions', {
        body: { 
          employeeId: user.id, 
          leaveType: requestType,
          year: currentYear
        }
      });

      if (error) {
        console.error('Error fetching leave transactions:', error);
        throw error;
      }

      return data?.transactions || [];
    },
    enabled: !!user?.id,
  });
}
