import { useMemo } from 'react';
import { useLeaveTransactions } from './useLeavePolicies';

export interface LeaveBalanceCalculated {
  available: number;
  consumed: number;
  accrued: number;
  isLoading: boolean;
}

/**
 * Hook to calculate leave balance from actual transactions
 * This provides real data instead of mock API data
 */
export function useLeaveBalanceFromTransactions(leaveType: string): LeaveBalanceCalculated {
  const { data: transactions = [], isLoading } = useLeaveTransactions(leaveType);

  return useMemo(() => {
    if (transactions.length === 0) {
      return {
        available: 0,
        consumed: 0,
        accrued: 0,
        isLoading,
      };
    }

    // Get the latest balance (transactions are in reverse chronological order)
    const available = transactions[0]?.balance ?? 0;

    // Calculate consumed (sum of all negative changes)
    const consumed = transactions.reduce((sum, tx) => {
      if (tx.change < 0) {
        return sum + Math.abs(tx.change);
      }
      return sum;
    }, 0);

    // Calculate accrued (sum of all positive changes)
    const accrued = transactions.reduce((sum, tx) => {
      if (tx.change > 0) {
        return sum + tx.change;
      }
      return sum;
    }, 0);

    return {
      available,
      consumed,
      accrued,
      isLoading,
    };
  }, [transactions, isLoading]);
}
