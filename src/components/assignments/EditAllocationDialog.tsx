import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AllocationData {
  id: string;
  employeeName: string;
  role: string;
  allocationPct: number;
  startDate: string;
  endDate: string | null;
  type: string;
}

interface EditAllocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allocation: AllocationData | null;
  onSuccess: () => void;
}

export function EditAllocationDialog({
  open,
  onOpenChange,
  allocation,
  onSuccess,
}: EditAllocationDialogProps) {
  const { toast } = useToast();
  const [allocationPct, setAllocationPct] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (allocation) {
      setAllocationPct(allocation.allocationPct);
    }
  }, [allocation]);

  const handleSave = async () => {
    if (!allocation) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('allocations')
        .update({ allocation_pct: allocationPct })
        .eq('id', allocation.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Allocation updated to ${allocationPct}%`,
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating allocation:', error);
      toast({
        title: 'Error',
        description: 'Failed to update allocation',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!allocation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Allocation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Read-only fields */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Employee Name</Label>
            <Input value={allocation.employeeName} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Role</Label>
            <Input value={allocation.role} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Type</Label>
            <div>
              <Badge variant={allocation.type === 'ACTIVE' ? 'default' : 'secondary'}>
                {allocation.type}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Start Date</Label>
              <Input value={allocation.startDate} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">End Date</Label>
              <Input 
                value={allocation.endDate || 'Ongoing'} 
                disabled 
                className="bg-muted" 
              />
            </div>
          </div>

          {/* Editable field */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label>Allocation Percentage</Label>
              <span className="text-sm font-semibold">{allocationPct}%</span>
            </div>
            <Slider
              value={[allocationPct]}
              onValueChange={(value) => setAllocationPct(value[0])}
              max={150}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Drag the slider to adjust allocation (0-150%)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}