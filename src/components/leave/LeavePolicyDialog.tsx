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
import { useAuth } from '@/auth/AuthContext';
import { useMemo } from 'react';

interface LeavePolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balances?: LeaveBalance[];
}

export function LeavePolicyDialog({ open, onOpenChange, balances }: LeavePolicyDialogProps) {
  const { data: policies, isLoading } = useLeavePolicies();
  const { user } = useAuth();

  // Filter policies based on user's gender
  const filteredPolicies = useMemo(() => {
    if (!policies) return [];
    
    const gender = user?.gender;
    
    return policies.filter(policy => {
      // Hide Paternity Leave for females
      if (policy.code === 'PL_PATERNITY' && gender === 'Female') return false;
      // Hide Maternity Leave for males
      if (policy.code === 'ML' && gender === 'Male') return false;
      // Hide both Paternity and Maternity for null/Other gender
      if ((policy.code === 'PL_PATERNITY' || policy.code === 'ML') && (!gender || (gender !== 'Male' && gender !== 'Female'))) return false;
      return true;
    });
  }, [policies, user?.gender]);

  // Map policy codes to balance data
  const getBalanceForPolicy = (code: string) => {
    const typeMap: Record<string, string> = {
      'CL': 'CL',
      'COMP_OFF': 'COMP_OFF',
      'PL_PATERNITY': 'PL',
      'ML': 'ML',
      'LOP': 'LOP',
    };
    
    const leaveType = typeMap[code];
    const balance = balances?.find(b => b.type === leaveType);
    
    return {
      available: balance?.available || 0,
      consumed: balance?.consumed || 0,
    };
  };

  // Determine grid columns based on number of tabs
  const gridColsClass = filteredPolicies.length === 3 ? 'grid-cols-3' : 'grid-cols-4';

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
        ) : filteredPolicies && filteredPolicies.length > 0 ? (
          <Tabs defaultValue={filteredPolicies[0]?.code} className="w-full">
            <TabsList className={`grid w-full ${gridColsClass} mb-6`}>
              {filteredPolicies.map((policy) => (
                <TabsTrigger key={policy.code} value={policy.code} className="text-xs sm:text-sm">
                  {policy.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {filteredPolicies.map((policy) => {
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
