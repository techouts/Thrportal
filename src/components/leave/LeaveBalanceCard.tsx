import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, AlertTriangle } from "lucide-react";
import { LeaveBalance, LeaveType } from "@/types/leave";
import { format, parseISO, differenceInDays } from "date-fns";

interface LeaveBalanceCardProps {
  balance: LeaveBalance;
  variant?: 'default' | 'compact';
}

const LEAVE_TYPE_NAMES: Record<LeaveType, string> = {
  CL: 'Casual Leave',
  SL: 'Sick Leave', 
  PL: 'Privilege Leave',
  ML: 'Maternity Leave',
  PL_PATERNITY: 'Paternity Leave',
  COMP_OFF: 'Comp-Off',
  LOP: 'Loss of Pay'
};

const LEAVE_TYPE_COLORS: Record<LeaveType, string> = {
  CL: 'bg-blue-500',
  SL: 'bg-red-500',
  PL: 'bg-green-500', 
  ML: 'bg-pink-500',
  PL_PATERNITY: 'bg-purple-500',
  COMP_OFF: 'bg-orange-500',
  LOP: 'bg-gray-500'
};

export function LeaveBalanceCard({ balance, variant = 'default' }: LeaveBalanceCardProps) {
  const utilization = balance.allocated > 0 ? (balance.consumed / balance.allocated) * 100 : 0;
  const isExpiring = balance.expiry && differenceInDays(parseISO(balance.expiry), new Date()) <= 30;
  const isLowBalance = balance.available <= 2 && balance.type !== 'LOP';

  if (variant === 'compact') {
    return (
      <div className="flex items-center justify-between p-3 border rounded-lg">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${LEAVE_TYPE_COLORS[balance.type]}`} />
          <div>
            <p className="font-medium text-sm">{balance.type}</p>
            <p className="text-xs text-muted-foreground">
              {balance.available} of {balance.allocated} available
            </p>
          </div>
        </div>
        {(isExpiring || isLowBalance) && (
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
        )}
      </div>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {LEAVE_TYPE_NAMES[balance.type]}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {balance.type}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Balance Overview */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">{balance.available}</p>
            <p className="text-xs text-muted-foreground">Available</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-muted-foreground">{balance.consumed}</p>
            <p className="text-xs text-muted-foreground">Used</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-muted-foreground">{balance.allocated}</p>
            <p className="text-xs text-muted-foreground">Allocated</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Utilization</span>
            <span>{Math.round(utilization)}%</span>
          </div>
          <Progress 
            value={utilization} 
            className="h-2"
            style={{
              '--progress-background': LEAVE_TYPE_COLORS[balance.type]
            } as React.CSSProperties}
          />
        </div>

        {/* Additional Info */}
        <div className="space-y-2 text-xs text-muted-foreground">
          {balance.carryForward > 0 && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{balance.carryForward} carried forward</span>
            </div>
          )}
          
          {balance.expiry && (
            <div className={`flex items-center gap-1 ${isExpiring ? 'text-yellow-600' : ''}`}>
              <Clock className="h-3 w-3" />
              <span>
                Expires {format(parseISO(balance.expiry), 'MMM dd, yyyy')}
                {isExpiring && ' (Soon)'}
              </span>
            </div>
          )}
          
          <div className="text-xs">
            FY {balance.financialYear}
          </div>
        </div>

        {/* Warnings */}
        {(isExpiring || isLowBalance) && (
          <div className="flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
            <AlertTriangle className="h-3 w-3 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-yellow-800">
              {isExpiring && <p>Balance expires soon</p>}
              {isLowBalance && <p>Low balance remaining</p>}
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Color indicator bar */}
      <div 
        className={`absolute bottom-0 left-0 right-0 h-1 ${LEAVE_TYPE_COLORS[balance.type]}`}
      />
    </Card>
  );
}