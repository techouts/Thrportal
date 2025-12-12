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
}

export function LeaveTransactionTable({ transactions, isLoading }: LeaveTransactionTableProps) {
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

  return (
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
                  {transaction.change > 0 ? `+${transaction.change}` : transaction.change}
                </span>
              </TableCell>
              <TableCell>{transaction.balance}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
