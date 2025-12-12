import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLeavePolicies } from '@/hooks/useLeavePolicies';
import { LeavePolicyContent } from './policy/LeavePolicyContent';
import { LeaveBalance } from '@/types/leave';
import { Loader2 } from 'lucide-react';

interface LeavePolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balances?: LeaveBalance[];
}

export function LeavePolicyDialog({ open, onOpenChange, balances }: LeavePolicyDialogProps) {
  const { data: policies, isLoading } = useLeavePolicies();

  // Map policy codes to balance data
  const getBalanceForPolicy = (code: string) => {
    const typeMap: Record<string, string> = {
      'CL': 'CL',
      'COMP_OFF': 'COMP_OFF',
      'PL_PATERNITY': 'PL',
      'LOP': 'LOP',
    };
    
    const leaveType = typeMap[code];
    const balance = balances?.find(b => b.type === leaveType);
    
    return {
      available: balance?.available || 0,
      consumed: balance?.consumed || 0,
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Leave Policy Explanation</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : policies && policies.length > 0 ? (
          <Tabs defaultValue={policies[0]?.code} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              {policies.map((policy) => (
                <TabsTrigger key={policy.code} value={policy.code} className="text-xs sm:text-sm">
                  {policy.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {policies.map((policy) => {
              const { available, consumed } = getBalanceForPolicy(policy.code);
              return (
                <TabsContent key={policy.code} value={policy.code}>
                  <LeavePolicyContent 
                    policy={policy} 
                    available={available} 
                    consumed={consumed} 
                  />
                </TabsContent>
              );
            })}
          </Tabs>
        ) : (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            No leave policies found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
