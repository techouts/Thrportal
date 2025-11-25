import { Badge } from '@/components/ui/badge';
import type { IjpStage } from '../../types';
import { cn } from '@/lib/utils';

interface StageBadgeProps {
  stage: IjpStage;
  className?: string;
}

const stageConfig: Record<IjpStage, { label: string; variant: string; color: string }> = {
  SUBMITTED: {
    label: 'Submitted',
    variant: 'default',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
  },
  AWAITING_MANAGER_OK: {
    label: 'Manager Approval',
    variant: 'default',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
  },
  ELIGIBILITY_CHECK: {
    label: 'Eligibility Check',
    variant: 'default',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
  },
  INELIGIBLE: {
    label: 'Ineligible',
    variant: 'destructive',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
  },
  HR_SCREEN: {
    label: 'HR Screening',
    variant: 'default',
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400'
  },
  HM_REVIEW: {
    label: 'HM Review',
    variant: 'default',
    color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400'
  },
  SHORTLISTED: {
    label: 'Shortlisted',
    variant: 'default',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
  },
  INTERVIEW_R1: {
    label: 'Interview R1',
    variant: 'default',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
  },
  INTERVIEW_R2: {
    label: 'Interview R2',
    variant: 'default',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
  },
  INTERVIEW_R3: {
    label: 'Interview R3',
    variant: 'default',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
  },
  OFFER_RECOMMENDED: {
    label: 'Offer Recommended',
    variant: 'default',
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400'
  },
  OFFER_APPROVED: {
    label: 'Offer Approved',
    variant: 'default',
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400'
  },
  SELECTED: {
    label: 'Selected',
    variant: 'default',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
  },
  NOT_SELECTED: {
    label: 'Not Selected',
    variant: 'secondary',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
  },
  WITHDRAWN: {
    label: 'Withdrawn',
    variant: 'outline',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
  },
  ON_HOLD: {
    label: 'On Hold',
    variant: 'outline',
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
  }
};

export function StageBadge({ stage, className }: StageBadgeProps) {
  const config = stageConfig[stage];
  
  return (
    <Badge 
      variant={config.variant as any}
      className={cn(config.color, className)}
    >
      {config.label}
    </Badge>
  );
}