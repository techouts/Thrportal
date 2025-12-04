import React, { useState, useEffect } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface TimeEntryPopoverProps {
  value: number
  comment?: string
  onChange: (value: number, comment: string) => void
  disabled?: boolean
  children: React.ReactNode
}

export function TimeEntryPopover({
  value,
  comment = '',
  onChange,
  disabled = false,
  children
}: TimeEntryPopoverProps) {
  const [open, setOpen] = useState(false)
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const [entryComment, setEntryComment] = useState('')

  // Initialize values when popover opens
  useEffect(() => {
    if (open) {
      setHours(Math.floor(value))
      setMinutes(Math.round((value - Math.floor(value)) * 60))
      setEntryComment(comment)
    }
  }, [open, value, comment])

  const handleSave = () => {
    if (!entryComment.trim()) {
      toast({
        title: "Comment required",
        description: "Please add a comment before saving",
        variant: "destructive"
      })
      return
    }
    const decimalHours = hours + (minutes / 60)
    onChange(decimalHours, entryComment)
    setOpen(false)
  }

  const handleCancel = () => {
    setOpen(false)
  }

  const incrementHours = () => setHours(prev => Math.min(24, prev + 1))
  const decrementHours = () => setHours(prev => Math.max(0, prev - 1))
  const incrementMinutes = () => setMinutes(prev => (prev + 15) % 60)
  const decrementMinutes = () => setMinutes(prev => (prev - 15 + 60) % 60)

  if (disabled) {
    return <>{children}</>
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="center">
        {/* Time Display */}
        <div className="text-center mb-4">
          <div className="text-5xl font-mono font-light text-foreground">
            {hours}:{minutes.toString().padStart(2, '0')}
          </div>
        </div>

        {/* Time Controls */}
        <div className="flex justify-center gap-8 mb-4">
          {/* Hours Control */}
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={incrementHours}
              className="h-8 w-8 p-0"
            >
              ▲
            </Button>
            <span className="text-xs text-muted-foreground">Hours</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={decrementHours}
              className="h-8 w-8 p-0"
            >
              ▼
            </Button>
          </div>

          {/* Minutes Control */}
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={incrementMinutes}
              className="h-8 w-8 p-0"
            >
              ▲
            </Button>
            <span className="text-xs text-muted-foreground">Minutes</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={decrementMinutes}
              className="h-8 w-8 p-0"
            >
              ▼
            </Button>
          </div>
        </div>

        {/* Quick Time Buttons */}
        <div className="flex gap-1 mb-4 justify-center">
          {[1, 2, 4, 8].map(h => (
            <Button
              key={h}
              variant="outline"
              size="sm"
              onClick={() => { setHours(h); setMinutes(0); }}
              className={cn(
                "h-7 px-2 text-xs",
                hours === h && minutes === 0 && "bg-primary text-primary-foreground"
              )}
            >
              {h}h
            </Button>
          ))}
        </div>

        {/* Comment Field */}
        <Textarea
          placeholder="Add comment (required)"
          value={entryComment}
          onChange={(e) => setEntryComment(e.target.value)}
          className="mb-3 text-sm"
          rows={2}
        />

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCancel} className="flex-1">
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} className="flex-1">
            Save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
