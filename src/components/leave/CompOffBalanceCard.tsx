import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useCompOffBalance } from '@/hooks/useCompOffBalance';

interface CompOffBalanceCardProps {
  employeeId: string | undefined;
}

export function CompOffBalanceCard({ employeeId }: CompOffBalanceCardProps) {
  const { data: balance, isLoading } = useCompOffBalance(employeeId);

  if (isLoading) {
    return (
      <Card className="relative overflow-hidden animate-pulse">
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-8 bg-muted rounded w-1/2" />
            <div className="h-2 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const earned = balance?.earned || 0;
  const consumed = balance?.consumed || 0;
  const available = balance?.available || 0;
  const utilization = earned > 0 ? (consumed / earned) * 100 : 0;

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Comp-Offs
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            COMP_OFF
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Balance Overview */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">{available}</p>
            <p className="text-xs text-muted-foreground">Available</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-muted-foreground">{consumed}</p>
            <p className="text-xs text-muted-foreground">Consumed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-muted-foreground">{earned}</p>
            <p className="text-xs text-muted-foreground">Earned</p>
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
          />
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground">
          Comp-offs are earned by working on holidays or weekends
        </div>
      </CardContent>
      
      {/* Color indicator bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500" />
    </Card>
  );
}
