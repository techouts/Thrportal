import { useState, useEffect } from 'react';
import { format, differenceInDays, addDays } from 'date-fns';
import { CalendarIcon, Search } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useToast } from '@/hooks/use-toast';

interface RequestLeaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: LeaveRequestData) => Promise<void>;
  profiles?: Array<{ id: string; display_name: string | null; first_name: string | null; last_name: string | null }>;
}

export interface LeaveRequestData {
  leave_type: string;
  start_date: Date;
  end_date: Date;
  total_days: number;
  reason: string;
  notify_employee_id?: string;
}

const LEAVE_TYPES = [
  { value: 'CL', label: 'Casual Leave' },
  { value: 'SL', label: 'Sick Leave' },
  { value: 'PL', label: 'Privilege Leave' },
  { value: 'ML', label: 'Maternity Leave' },
  { value: 'PL_PATERNITY', label: 'Paternity Leave' },
  { value: 'COMP_OFF', label: 'Compensatory Off' },
  { value: 'LOP', label: 'Loss of Pay' },
];

export function RequestLeaveDialog({ open, onOpenChange, onSubmit, profiles = [] }: RequestLeaveDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [leaveType, setLeaveType] = useState<string>('');
  const [reason, setReason] = useState('');
  const [notifyEmployeeId, setNotifyEmployeeId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmployeeSearch, setShowEmployeeSearch] = useState(false);

  const totalDays = fromDate && toDate 
    ? differenceInDays(toDate, fromDate) + 1 
    : 0;

  const filteredProfiles = profiles.filter(profile => {
    const name = profile.display_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedEmployee = profiles.find(p => p.id === notifyEmployeeId);
  const selectedEmployeeName = selectedEmployee 
    ? (selectedEmployee.display_name || `${selectedEmployee.first_name || ''} ${selectedEmployee.last_name || ''}`.trim())
    : '';

  const resetForm = () => {
    setFromDate(undefined);
    setToDate(undefined);
    setLeaveType('');
    setReason('');
    setNotifyEmployeeId('');
    setSearchQuery('');
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
        notify_employee_id: notifyEmployeeId || undefined,
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
    }
  }, [open]);

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
              <Popover>
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
                    onSelect={setFromDate}
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
              <Popover>
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
                    onSelect={setToDate}
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
                {LEAVE_TYPES.map((type) => (
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

          {/* Notify Employee */}
          <div className="space-y-2">
            <Label>Notify Employee</Label>
            <Popover open={showEmployeeSearch} onOpenChange={setShowEmployeeSearch}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                >
                  {selectedEmployeeName || 'Search employee...'}
                  <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Search employee..." 
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList>
                    <CommandEmpty>No employee found.</CommandEmpty>
                    <CommandGroup>
                      {filteredProfiles.slice(0, 10).map((profile) => {
                        const name = profile.display_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
                        return (
                          <CommandItem
                            key={profile.id}
                            value={profile.id}
                            onSelect={() => {
                              setNotifyEmployeeId(profile.id);
                              setShowEmployeeSearch(false);
                            }}
                          >
                            {name || 'Unknown'}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
