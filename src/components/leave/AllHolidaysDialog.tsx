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

// Month colors matching the screenshot
const MONTH_COLORS: Record<string, string> = {
  JAN: 'bg-[#8B9A7B]',
  FEB: 'bg-[#7B8A9A]',
  MAR: 'bg-[#A69F8C]',
  APR: 'bg-[#6B9E8A]',
  MAY: 'bg-amber-400',
  JUN: 'bg-emerald-500',
  JUL: 'bg-teal-500',
  AUG: 'bg-pink-400',
  SEP: 'bg-rose-400',
  OCT: 'bg-rose-400',
  NOV: 'bg-amber-500',
  DEC: 'bg-[#7B8AC4]',
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
    return MONTH_COLORS[month] || 'bg-muted';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Holidays
            </DialogTitle>
            
            {/* Year Selector */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevYear}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-base font-medium min-w-[50px] text-center">
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
          </div>
        </DialogHeader>

        {/* Holidays Grid */}
        <div className="flex-1 overflow-y-auto pr-2">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-3 p-3">
                  <div className="h-14 w-14 bg-muted rounded" />
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
    <div className="flex items-stretch gap-0 rounded-lg overflow-hidden border bg-card">
      {/* Month Badge with Day */}
      <div className="flex flex-col w-16 shrink-0">
        <div className={`${getMonthColor(holiday.date)} text-white text-center py-1.5`}>
          <span className="text-xs font-semibold">{monthAbbr}</span>
        </div>
        <div className="flex-1 flex items-center justify-center border-r bg-background">
          <span className="text-xl font-bold text-foreground">{dayNum}</span>
        </div>
      </div>

      {/* Holiday Info */}
      <div className="flex-1 flex flex-col justify-center px-4 py-3">
        <p className="font-medium text-sm text-foreground">{holiday.name}</p>
        <p className="text-xs text-muted-foreground">{dayOfWeek}</p>
      </div>
    </div>
  );
}
