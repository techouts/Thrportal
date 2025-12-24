import { LeavePolicy } from '@/types/leavePolicy';
import { LeaveDonutChart } from '../LeaveDonutChart';
import { LeaveTransactionTable } from '../LeaveTransactionTable';
import { useLeaveTransactions } from '@/hooks/useLeavePolicies';
import { useLeaveBalanceFromTransactions } from '@/hooks/useLeaveBalanceFromTransactions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface LeavePolicyContentProps {
  policy: LeavePolicy;
  available: number;
  consumed: number;
}

export function LeavePolicyContent({ policy }: LeavePolicyContentProps) {
  const { data: transactions = [], isLoading } = useLeaveTransactions(policy.code);
  const { available, consumed, isLoading: balanceLoading } = useLeaveBalanceFromTransactions(policy.code);

  // Determine if this is a comp-off type that needs expiry display
  const showExpiry = policy.code === 'COMP_OFF';

  // Get current year for quota message
  const currentYear = new Date().getFullYear();
  const yearStart = `Jan ${currentYear}`;
  const yearEnd = `Dec ${currentYear}`;

  return (
    <div className="space-y-6">
      {/* Header with description and chart */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-foreground mb-2">{policy.name}</h3>
          <Separator className="my-3" />
          <p className="text-muted-foreground">{policy.description}</p>
        </div>
        <div className="flex justify-center pb-8">
          <LeaveDonutChart 
            available={balanceLoading ? 0 : available} 
            consumed={balanceLoading ? 0 : consumed} 
          />
        </div>
      </div>

      {/* Leave Quota - Enhanced display */}
      <Card className="bg-muted/30 border-muted">
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">
            {policy.code === 'COMP_OFF' ? (
              <>
                You are allocated a total of <strong>{available}</strong> days of leave in a year 
                beginning {yearStart} till {yearEnd}. You can consume this leave in the same year they are accrued/credited.
              </>
            ) : policy.code === 'PL_PATERNITY' ? (
              <>
                You are allocated a total of <strong>{policy.annual_quota} days</strong> of leave in a year 
                beginning {yearStart} till {yearEnd}. This allocation is available upon qualifying event.
              </>
            ) : policy.annual_quota > 0 ? (
              <>
                You are allocated a total of <strong>{policy.annual_quota} days</strong> of leave in a year 
                beginning {yearStart} till {yearEnd}.
                {policy.accrual_rate > 0 && (
                  <> This accrues at <strong>{policy.accrual_rate} days</strong> per {policy.accrual_frequency}.</>
                )}
              </>
            ) : (
              <>Unpaid leave is available as needed with manager approval.</>
            )}
          </p>
        </CardContent>
      </Card>

      {/* Transaction Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Leave History</CardTitle>
        </CardHeader>
        <CardContent>
          <LeaveTransactionTable 
            transactions={transactions} 
            isLoading={isLoading} 
            showExpiry={showExpiry}
          />
        </CardContent>
      </Card>

      {/* Accrual Info (for CL) */}
      {policy.accrual_rate > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Leave Accrual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your leave quota of <strong>{policy.annual_quota} days</strong> accrues {policy.accrual_frequency} at{' '}
              <strong>{policy.accrual_rate} days</strong> per {policy.accrual_frequency === 'monthly' ? 'month' : policy.accrual_frequency}.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Expiry Info (for Comp-Off) */}
      {policy.expiry_days && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Expiry Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Earned comp-offs must be consumed within <strong>{policy.expiry_days} days</strong> of accrual.
              Expired comp-offs cannot be recovered.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Application Notes */}
      {policy.application_notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Applying for Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{policy.application_notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Restrictions */}
      {policy.restrictions && policy.restrictions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Restrictions for Applying Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {policy.restrictions.map((restriction, index) => (
                <li key={index}>{restriction}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Joining Restriction */}
      {policy.joining_restriction_days > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Restrictions after Joining</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Can consume leave <strong>{policy.joining_restriction_days} days</strong> after joining date.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Year End Policy */}
      {(policy.carry_forward_limit > 0 || policy.encashment_limit > 0) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Leave Balances at End of Year</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Up to <strong>{policy.carry_forward_limit} days</strong> will be carried forward
              {policy.encashment_limit > 0 ? (
                <>, and up to <strong>{policy.encashment_limit} days</strong> can be encashed.</>
              ) : (
                <>. No days will be encashed.</>
              )}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
