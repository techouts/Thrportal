import React from 'react'
import { format, parseISO, addDays } from 'date-fns'
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HistoryWeekPickerProps {
  weeks: { weekStart: string; status: string | null }[]
  currentIndex: number
  onChange: (index: number) => void
  className?: string
}

export function HistoryWeekPicker({ 
  weeks, 
  currentIndex, 
  onChange, 
  className 
}: HistoryWeekPickerProps) {
  if (weeks.length === 0) {
    return (
      <div className={cn("flex items-center gap-2 text-muted-foreground", className)}>
        <AlertCircle className="h-4 w-4" />
        <span>No incomplete weeks found</span>
      </div>
    )
  }

  const currentWeek = weeks[currentIndex]
  const weekStartDate = parseISO(currentWeek.weekStart)
  const weekEndDate = addDays(weekStartDate, 6)
  
  const canGoLeft = currentIndex < weeks.length - 1 // Go to older week
  const canGoRight = currentIndex > 0 // Go to newer week

  const formatWeekRange = () => {
    return `${format(weekStartDate, 'dd MMM')} - ${format(weekEndDate, 'dd MMM yyyy')}`
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(currentIndex + 1)}
        disabled={!canGoLeft}
        className="p-2"
        aria-label="Previous incomplete week"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="min-w-[200px] text-center px-4 py-2 border rounded-md bg-background">
        <span className="font-medium">{formatWeekRange()}</span>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(currentIndex - 1)}
        disabled={!canGoRight}
        className="p-2"
        aria-label="Next incomplete week"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
