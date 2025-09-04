import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import type { IjpApplication } from '../../types';

interface EligibilityIndicatorProps {
  eligibility: IjpApplication['eligibility'];
  className?: string;
}

export function EligibilityIndicator({ eligibility, className }: EligibilityIndicatorProps) {
  const { tenureOk, notOnProbation, notOnPip, perfOk, messages } = eligibility;
  
  const hasBlockingIssues = !tenureOk || !notOnProbation || !notOnPip || !perfOk;
  const hasWarnings = messages.length > 0;

  const getIcon = () => {
    if (hasBlockingIssues) {
      return <XCircle className="w-5 h-5 text-destructive" />;
    }
    if (hasWarnings) {
      return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    }
    return <CheckCircle className="w-5 h-5 text-green-600" />;
  };

  const getVariant = () => {
    if (hasBlockingIssues) return 'destructive';
    if (hasWarnings) return 'default';
    return 'default';
  };

  const getTitle = () => {
    if (hasBlockingIssues) return 'Eligibility Issues Found';
    if (hasWarnings) return 'Eligibility Warnings';
    return 'Eligible to Apply';
  };

  const getDescription = () => {
    if (hasBlockingIssues) {
      return 'You have eligibility issues that prevent you from applying to this position.';
    }
    if (hasWarnings) {
      return 'Please review the warnings below before proceeding with your application.';
    }
    return 'You meet all eligibility requirements for this position.';
  };

  return (
    <div className={className}>
      <Alert variant={getVariant()} className="mb-4">
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1">
            <h4 className="font-medium mb-1">{getTitle()}</h4>
            <AlertDescription>{getDescription()}</AlertDescription>
          </div>
        </div>
      </Alert>

      <div className="space-y-3">
        <h5 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
          Eligibility Criteria
        </h5>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            {tenureOk ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <XCircle className="w-4 h-4 text-destructive" />
            )}
            <span className="text-sm">Minimum Tenure</span>
            <Badge variant={tenureOk ? "default" : "destructive"} className="ml-auto">
              {tenureOk ? "Met" : "Not Met"}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {notOnProbation ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <XCircle className="w-4 h-4 text-destructive" />
            )}
            <span className="text-sm">Not on Probation</span>
            <Badge variant={notOnProbation ? "default" : "destructive"} className="ml-auto">
              {notOnProbation ? "Met" : "Not Met"}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {notOnPip ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <XCircle className="w-4 h-4 text-destructive" />
            )}
            <span className="text-sm">Not on PIP</span>
            <Badge variant={notOnPip ? "default" : "destructive"} className="ml-auto">
              {notOnPip ? "Met" : "Not Met"}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {perfOk ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <XCircle className="w-4 h-4 text-destructive" />
            )}
            <span className="text-sm">Performance Rating</span>
            <Badge variant={perfOk ? "default" : "destructive"} className="ml-auto">
              {perfOk ? "Met" : "Not Met"}
            </Badge>
          </div>
        </div>

        {messages.length > 0 && (
          <div className="space-y-2">
            <h6 className="font-medium text-sm text-muted-foreground">
              Additional Information
            </h6>
            {messages.map((message, index) => (
              <div key={index} className="flex items-start gap-2 p-2 bg-muted/50 rounded-md">
                <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">{message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}