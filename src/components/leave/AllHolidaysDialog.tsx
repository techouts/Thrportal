import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { useHolidays, Holiday } from '@/hooks/useHolidays';

interface AllHolidaysDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Month colors as per the screenshot
const MONTH_COLORS: Record<string, string> = {
  JAN: 'bg-cyan-500',
  FEB: 'bg-cyan-500',
  MAR: 'bg-blue-500',
  APR: 'bg-indigo-500',
  MAY: 'bg-violet-500',
  JUN: 'bg-purple-500',
  JUL: 'bg-fuchsia-500',
  AUG: 'bg-pink-500',
  SEP: 'bg-rose-500',
  OCT: 'bg-orange-500',
  NOV: 'bg-amber-500',
  DEC: 'bg-blue-500',
};

export function AllHolidaysDialog({ open, onOpenChange }: AllHolidaysDialogProps) {
  const [year, setYear] = useState(new Date().getFullYear());
  const { data: holidays, isLoading } = useHolidays(year);

  const handlePrevYear = () => setYear((prev) => prev - 1);
  const handleNextYear = () => setYear((prev) => prev + 1);

  const getMonthAbbr = (date: string) => {
    return format(new Date(date), 'MMM').toUpperCase();
  };

  const getMonthColor = (date: string) => {
    const month = getMonthAbbr(date);
    return MONTH_COLORS[month] || 'bg-gray-500';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold text-center">
            Holiday Calendar
          </DialogTitle>
          
          {/* Year Selector */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevYear}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-semibold min-w-[60px] text-center">
              {year}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextYear}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Holidays Grid */}
        <div className="flex-1 overflow-y-auto pr-2">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-3 p-3">
                  <div className="h-10 w-10 bg-muted rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : holidays && holidays.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {holidays.map((holiday) => (
                <HolidayItem key={holiday.id} holiday={holiday} getMonthColor={getMonthColor} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No holidays found for {year}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface HolidayItemProps {
  holiday: Holiday;
  getMonthColor: (date: string) => string;
}

function HolidayItem({ holiday, getMonthColor }: HolidayItemProps) {
  const date = new Date(holiday.date);
  const monthAbbr = format(date, 'MMM').toUpperCase();
  const dayNum = format(date, 'd');
  const dayOfWeek = format(date, 'EEEE');

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      {/* Month Badge with Day */}
      <div className={`${getMonthColor(holiday.date)} text-white rounded-lg p-2 min-w-[48px] text-center`}>
        <div className="text-[10px] font-medium leading-none">{monthAbbr}</div>
        <div className="text-lg font-bold leading-tight">{dayNum}</div>
      </div>

      {/* Holiday Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{holiday.name}</p>
        <p className="text-xs text-muted-foreground">{dayOfWeek}</p>
      </div>
    </div>
  );
}
