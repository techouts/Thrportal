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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
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
  const [type, setType] = useState<'ACTIVE' | 'SHADOW'>('ACTIVE');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  
  // Date picker popover states
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  useEffect(() => {
    if (allocation) {
      setAllocationPct(allocation.allocationPct);
      setType(allocation.type as 'ACTIVE' | 'SHADOW');
      setStartDate(new Date(allocation.startDate));
      setEndDate(allocation.endDate ? new Date(allocation.endDate) : undefined);
    }
  }, [allocation]);

  const handleSave = async () => {
    if (!allocation || !startDate) return;

    if (endDate && endDate <= startDate) {
      toast({
        title: 'Validation Error',
        description: 'End date must be after start date',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('allocations')
        .update({ 
          allocation_pct: allocationPct,
          type: type,
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null
        })
        .eq('id', allocation.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Allocation updated successfully',
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
      <DialogContent className="sm:max-w-[500px]">
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
            <Label>Type</Label>
            <Select value={type} onValueChange={(value: 'ACTIVE' | 'SHADOW') => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="SHADOW">Shadow</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal min-w-0",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    <span className="truncate">
                      {startDate ? format(startDate, 'PP') : 'Pick a date'}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      setStartDateOpen(false);
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal min-w-0",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    <span className="truncate">
                      {endDate ? format(endDate, 'PP') : 'Ongoing'}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      setEndDate(date);
                      setEndDateOpen(false);
                    }}
                    disabled={(date) => startDate ? date <= startDate : false}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
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