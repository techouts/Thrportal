import { useState, useEffect } from 'react';
import { format } from 'date-fns';
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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface RequestCompOffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CompOffRequestData) => Promise<void>;
}

export interface CompOffRequestData {
  comp_off_date: Date;
  is_half_day: boolean;
  reason: string;
  evidence_url?: string;
}

export function RequestCompOffDialog({ open, onOpenChange, onSubmit }: RequestCompOffDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [compOffDate, setCompOffDate] = useState<Date>();
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [reason, setReason] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const resetForm = () => {
    setCompOffDate(undefined);
    setIsHalfDay(false);
    setReason('');
    setFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!compOffDate) {
      toast({
        title: 'Validation Error',
        description: 'Please select a date for compensatory off',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        comp_off_date: compOffDate,
        is_half_day: isHalfDay,
        reason,
        evidence_url: file ? file.name : undefined, // In real app, upload file first
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
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Request Credit for Compensatory Off</DialogTitle>
          <DialogDescription>
            Request compensatory off for extra hours worked on weekends or holidays.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Comp Off Date */}
          <div className="space-y-2">
            <Label>Compensatory Off Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !compOffDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {compOffDate ? format(compOffDate, 'dd MMM yyyy') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={compOffDate}
                  onSelect={setCompOffDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Half Day Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="halfDay"
              checked={isHalfDay}
              onCheckedChange={(checked) => setIsHalfDay(checked === true)}
            />
            <Label htmlFor="halfDay" className="font-normal cursor-pointer">
              Request Half Day
            </Label>
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
