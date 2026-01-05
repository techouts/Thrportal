import { useState, useEffect } from 'react';
import { format, differenceInDays } from 'date-fns';
import { CalendarIcon, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface RequestCompOffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CompOffRequestData) => Promise<void>;
}

export interface CompOffRequestData {
  start_date: Date;
  end_date: Date;
  total_days: number;
  reason: string;
  evidence_url?: string;
}

export function RequestCompOffDialog({ open, onOpenChange, onSubmit }: RequestCompOffDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [reason, setReason] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  const totalDays = fromDate && toDate 
    ? differenceInDays(toDate, fromDate) + 1 
    : 0;

  const resetForm = () => {
    setFromDate(undefined);
    setToDate(undefined);
    setReason('');
    setFile(null);
    setFromOpen(false);
    setToOpen(false);
  };

  const handleFromDateSelect = (date: Date | undefined) => {
    setFromDate(date);
    setFromOpen(false);
    setTimeout(() => setToOpen(true), 100);
  };

  const handleToDateSelect = (date: Date | undefined) => {
    setToDate(date);
    setToOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!fromDate || !toDate) {
      toast({
        title: 'Validation Error',
        description: 'Please select from and to dates for compensatory off',
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
        start_date: fromDate,
        end_date: toDate,
        total_days: totalDays,
        reason,
        evidence_url: file ? file.name : undefined,
      });
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting comp-off request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Credit for Compensatory Off</DialogTitle>
          <DialogDescription>
            Request compensatory off for extra hours worked on weekends or holidays.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date Range with Days Count */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">From *</Label>
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
                    onSelect={handleFromDateSelect}
                    disabled={(date) => date > new Date()}
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
              <Label className="text-xs text-muted-foreground">To *</Label>
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
                    onSelect={handleToDateSelect}
                    defaultMonth={fromDate}
                    disabled={(date) => {
                      const today = new Date();
                      if (date > today) return true;
                      if (fromDate && date < fromDate) return true;
                      return false;
                    }}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label>Note</Label>
            <Textarea
              placeholder="Add details about the extra work performed..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Upload Evidence (Optional)</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                {file ? file.name : 'Upload Files'}
              </Button>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Supported: PDF, DOC, PNG, JPG (max 5MB)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Confirming...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
