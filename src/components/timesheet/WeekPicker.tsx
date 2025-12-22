import React, { useState } from 'react'
import { format, startOfWeek, addWeeks, subWeeks, isAfter, subDays } from 'date-fns'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

interface WeekPickerProps {
  value: Date
  onChange: (date: Date) => void
  startOnMonday?: boolean
  backdateLimit?: number // weeks
  className?: string
}

export function WeekPicker({ 
  value, 
  onChange, 
  startOnMonday = true, 
  backdateLimit = 6,
  className 
}: WeekPickerProps) {
  const [open, setOpen] = useState(false)
  const weekStart = startOfWeek(value, { weekStartsOn: startOnMonday ? 1 : 0 })
  const weekEnd = addWeeks(weekStart, 1)
  const earliestAllowed = subWeeks(new Date(), backdateLimit)
  
  const canGoBack = isAfter(weekStart, earliestAllowed)
  const canGoForward = true // No future limit for viewing

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const newWeekStart = startOfWeek(date, { weekStartsOn: startOnMonday ? 1 : 0 })
      onChange(newWeekStart)
      setOpen(false)
    }
  }

  const formatWeekRange = (start: Date) => {
    const end = subDays(addWeeks(start, 1), 1)
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(subWeeks(weekStart, 1))}
        disabled={!canGoBack}
        className="p-2"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="min-w-[200px] justify-start font-normal"
          >
            <Calendar className="mr-2 h-4 w-4" />
            {formatWeekRange(weekStart)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={weekStart}
            onSelect={handleDateSelect}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
            disabled={(date) => 
              isAfter(earliestAllowed, startOfWeek(date, { weekStartsOn: 1 }))
            }
          />
        </PopoverContent>
      </Popover>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(addWeeks(weekStart, 1))}
        disabled={!canGoForward}
        className="p-2"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}