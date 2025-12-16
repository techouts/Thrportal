import { useState, useEffect } from 'react';
import { format, differenceInDays } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface RequestLeaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: LeaveRequestData) => Promise<void>;
  initialDate?: Date;
  compOffBalance?: number;
}

export interface LeaveRequestData {
  leave_type: string;
  start_date: Date;
  end_date: Date;
  total_days: number;
  reason: string;
}

const LEAVE_TYPES = [
  { value: 'CL', label: 'Casual Leave' },
  { value: 'ML', label: 'Maternity Leave' },
  { value: 'PL_PATERNITY', label: 'Paternity Leave' },
  { value: 'COMP_OFF', label: 'Comp Offs' },
];

export function RequestLeaveDialog({ open, onOpenChange, onSubmit, initialDate, compOffBalance = 0 }: RequestLeaveDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fromDate, setFromDate] = useState<Date | undefined>(initialDate);
  const [toDate, setToDate] = useState<Date | undefined>(initialDate);
  const [leaveType, setLeaveType] = useState<string>('');
  const [reason, setReason] = useState('');
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  // Filter out COMP_OFF if user has no available balance
  const availableLeaveTypes = LEAVE_TYPES.filter(type => {
    if (type.value === 'COMP_OFF') {
      return compOffBalance > 0;
    }
    return true;
  });

  const totalDays = fromDate && toDate 
    ? differenceInDays(toDate, fromDate) + 1 
    : 0;

  const resetForm = () => {
    setFromDate(undefined);
    setToDate(undefined);
    setLeaveType('');
    setReason('');
  };

  const handleSubmit = async () => {
    if (!fromDate || !toDate || !leaveType) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (toDate < fromDate) {
      toast({
        title: 'Validation Error',
        description: 'End date cannot be before start date',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        leave_type: leaveType,
        start_date: fromDate,
        end_date: toDate,
        total_days: totalDays,
        reason,
      });
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting leave request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!open) {
      resetForm();
    } else if (initialDate) {
      setFromDate(initialDate);
      setToDate(initialDate);
    }
  }, [open, initialDate]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Leave</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date Range with Days Count */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">From</Label>
              <Popover open={fromOpen} onOpenChange={setFromOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !fromDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, 'dd MMM yyyy') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={(date) => {
                      setFromDate(date);
                      setFromOpen(false);
                      // Auto-open To date picker after small delay
                      setTimeout(() => setToOpen(true), 100);
                    }}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col items-center justify-center px-4 py-2 bg-muted rounded-md min-w-[60px]">
              <span className="text-2xl font-bold">{totalDays}</span>
              <span className="text-xs text-muted-foreground">Days</span>
            </div>

            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">To</Label>
              <Popover open={toOpen} onOpenChange={setToOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !toDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, 'dd MMM yyyy') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={(date) => {
                      setToDate(date);
                      setToOpen(false); // Auto-close after selection
                    }}
                    disabled={(date) => fromDate ? date < fromDate : false}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Leave Type */}
          <div className="space-y-2">
            <Label>Leave Type *</Label>
            <Select value={leaveType} onValueChange={setLeaveType}>
              <SelectTrigger>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                {availableLeaveTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label>Note</Label>
            <Textarea
              placeholder="Add a note (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Requesting...' : 'Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
