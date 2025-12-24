import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LeaveTransaction } from '@/types/leavePolicy';

interface LeaveTransactionTableProps {
  transactions: LeaveTransaction[];
  isLoading?: boolean;
  showExpiry?: boolean;
}

export function LeaveTransactionTable({ transactions, isLoading, showExpiry = false }: LeaveTransactionTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        Loading transactions...
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        No transactions found
      </div>
    );
  }

  const formatChange = (transaction: LeaveTransaction) => {
    const changeValue = transaction.change > 0 
      ? `+${transaction.change}` 
      : transaction.change.toString();
    
    // Add expiry info for comp-off accruals
    if (showExpiry && transaction.expiryDate && transaction.change > 0) {
      const expiryFormatted = format(new Date(transaction.expiryDate), 'dd MMM yyyy');
      return (
        <span>
          {changeValue}
          <span className="text-xs text-muted-foreground ml-1">
            (Expires: {expiryFormatted})
          </span>
        </span>
      );
    }
    
    return changeValue;
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">DATE</TableHead>
              <TableHead className="font-semibold">CHANGE (DAYS)</TableHead>
              <TableHead className="font-semibold">BALANCE (DAYS)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {format(new Date(transaction.date), 'dd MMM yyyy')}
                </TableCell>
                <TableCell>
                  <span className={transaction.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatChange(transaction)}
                  </span>
                </TableCell>
                <TableCell>{transaction.balance}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Transaction Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground border-t pt-3">
        <div className="flex items-center gap-1">
          <span className="text-green-600 font-medium">+</span>
          <span>Accrual/Credit</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-red-600 font-medium">−</span>
          <span>Deduction/Used</span>
        </div>
        {showExpiry && (
          <div className="flex items-center gap-1">
            <span className="italic">(Expires: date)</span>
            <span>Comp-Off expiry</span>
          </div>
        )}
      </div>
    </div>
  );
}
