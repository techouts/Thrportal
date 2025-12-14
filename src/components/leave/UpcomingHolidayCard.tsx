import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, TreePine, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { Holiday, useUpcomingHolidays } from '@/hooks/useHolidays';
import { AllHolidaysDialog } from './AllHolidaysDialog';

export function UpcomingHolidayCard() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAllDialog, setShowAllDialog] = useState(false);
  const { data: holidays, isLoading } = useUpcomingHolidays(10);

  const handlePrev = () => {
    if (holidays && holidays.length > 0) {
      setCurrentIndex((prev) => (prev === 0 ? holidays.length - 1 : prev - 1));
    }
  };

  const handleNext = () => {
    if (holidays && holidays.length > 0) {
      setCurrentIndex((prev) => (prev === holidays.length - 1 ? 0 : prev + 1));
    }
  };

  const currentHoliday = holidays?.[currentIndex];

  // Get holiday icon based on name
  const getHolidayIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('christmas')) return <TreePine className="h-16 w-16 text-white/80" />;
    if (lowerName.includes('diwali')) return <Sparkles className="h-16 w-16 text-white/80" />;
    return <Sparkles className="h-16 w-16 text-white/80" />;
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-rose-400 to-orange-400 border-0 overflow-hidden">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-white/30 rounded w-1/2" />
            <div className="h-12 bg-white/30 rounded w-3/4" />
            <div className="h-4 bg-white/30 rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!holidays || holidays.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-rose-400 to-orange-400 border-0 overflow-hidden">
        <CardContent className="p-6 text-white">
          <p className="text-sm">No upcoming holidays</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-gradient-to-br from-rose-400 to-orange-400 border-0 overflow-hidden relative">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Holidays</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-white/20 hover:text-white text-sm"
              onClick={() => setShowAllDialog(true)}
            >
              View All
            </Button>
          </div>

          {/* Navigation + Content */}
          <div className="flex items-center gap-4">
            {/* Left Arrow */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 h-8 w-8 shrink-0"
              onClick={handlePrev}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Holiday Content */}
            <div className="flex-1 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                {currentHoliday?.name}
              </h2>
              <p className="text-white/90 text-sm">
                {currentHoliday && format(new Date(currentHoliday.date), 'EEE, dd MMMM, yyyy')}
              </p>
            </div>

            {/* Right Arrow */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 h-8 w-8 shrink-0"
              onClick={handleNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Decorative Icon */}
          <div className="absolute bottom-4 right-4 opacity-50">
            {currentHoliday && getHolidayIcon(currentHoliday.name)}
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-1 mt-4">
            {holidays.slice(0, 5).map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  idx === currentIndex % 5 ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <AllHolidaysDialog
        open={showAllDialog}
        onOpenChange={setShowAllDialog}
      />
    </>
  );
}
