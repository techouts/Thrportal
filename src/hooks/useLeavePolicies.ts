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

      // Map policy code to leave request type
      const typeMap: Record<string, string> = {
        'CL': 'CL',
        'COMP_OFF': 'COMP_OFF',
        'PL_PATERNITY': 'PL',
        'LOP': 'LOP',
      };

      const requestType = typeMap[leaveType] || leaveType;

      const { data, error } = await supabase
        .from('leave_requests')
        .select('id, start_date, end_date, total_days, status, created_at')
        .eq('employee_id', user.id)
        .eq('leave_type', requestType)
        .in('status', ['APPROVED', 'PENDING'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Transform leave requests into transactions
      let runningBalance = 0;
      const transactions: LeaveTransaction[] = [];

      // Reverse to calculate running balance from oldest to newest
      const sortedData = [...(data || [])].reverse();
      
      sortedData.forEach((request) => {
        const change = -(request.total_days || 0);
        runningBalance += change;
        
        transactions.unshift({
          id: request.id,
          date: request.start_date,
          change,
          balance: runningBalance,
          description: request.status === 'PENDING' ? 'Pending' : 'Approved',
        });
      });

      return transactions;
    },
    enabled: !!user?.id,
  });
}
