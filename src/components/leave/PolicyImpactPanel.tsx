import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Calendar,
  Users,
  Wifi,
  Clock
} from "lucide-react";
import { PolicyPreviewResult } from "@/types/leave";

interface PolicyImpactPanelProps {
  preview: PolicyPreviewResult | null;
  isLoading?: boolean;
}

export function PolicyImpactPanel({ preview, isLoading }: PolicyImpactPanelProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Policy Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!preview) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Policy Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select dates to see policy impact
          </p>
        </CardContent>
      </Card>
    );
  }

  const getWarningIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getWarningVariant = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getCoverageColor = (score: string) => {
    switch (score) {
      case 'High':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Policy Impact</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-lg font-semibold">{preview.countedDays}</p>
            <p className="text-xs text-muted-foreground">Days Counted</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className={`text-lg font-semibold ${
              preview.projectedBalanceByType >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {preview.projectedBalanceByType}
            </p>
            <p className="text-xs text-muted-foreground">Projected Balance</p>
          </div>
        </div>

        <Separator />

        {/* Policy Flags */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Policy Application</h4>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span className={preview.isBackdated ? 'text-yellow-600' : 'text-muted-foreground'}>
                {preview.isBackdated ? `${preview.backdatedDays}d backdated` : 'Not backdated'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3" />
              <span className={preview.appliesSandwich ? 'text-blue-600' : 'text-muted-foreground'}>
                {preview.appliesSandwich ? 'Sandwich applied' : 'No sandwich'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Wifi className="h-3 w-3" />
              <span className={preview.wfhLimitExceeded ? 'text-red-600' : 'text-muted-foreground'}>
                {preview.wfhLimitExceeded ? 'WFH limit exceeded' : 'WFH within limits'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span className="text-muted-foreground capitalize">
                {preview.calendarUsed} calendar
              </span>
            </div>
          </div>
        </div>

        {/* Team Impact */}
        {(preview.conflicts.length > 0 || preview.coverageScore) && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Team Impact</h4>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <Users className="h-3 w-3" />
                  <span>{preview.conflicts.length} team conflicts</span>
                </div>
                
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getCoverageColor(preview.coverageScore)}`}
                >
                  {preview.coverageScore} Coverage
                </Badge>
              </div>
              
              {preview.conflicts.slice(0, 2).map((conflict, index) => (
                <div key={index} className="text-xs text-muted-foreground pl-5">
                  {conflict.employeeName} ({conflict.type})
                </div>
              ))}
              
              {preview.conflicts.length > 2 && (
                <div className="text-xs text-muted-foreground pl-5">
                  +{preview.conflicts.length - 2} more conflicts
                </div>
              )}
            </div>
          </>
        )}

        {/* Warnings */}
        {preview.warnings.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Warnings & Notices</h4>
              
              {preview.warnings.map((warning, index) => (
                <Alert 
                  key={index} 
                  variant={getWarningVariant(warning.severity) as any}
                  className="py-2"
                >
                  <div className="flex items-start gap-2">
                    {getWarningIcon(warning.severity)}
                    <AlertDescription className="text-xs">
                      {warning.message}
                    </AlertDescription>
                  </div>
                </Alert>
              ))}
            </div>
          </>
        )}

        {/* All Clear */}
        {preview.warnings.length === 0 && preview.conflicts.length === 0 && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>No policy violations detected</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}