import React, { useState, useEffect } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
  const [hoursInput, setHoursInput] = useState('')
  const [entryComment, setEntryComment] = useState('')

  // Convert decimal hours to HH:MM format
  const formatDecimalToTime = (decimal: number): string => {
    if (!decimal || decimal === 0) return ''
    const hours = Math.floor(decimal)
    const minutes = Math.round((decimal - hours) * 60)
    return `${hours}:${minutes.toString().padStart(2, '0')}`
  }

  // Parse time input (accepts "8", "8:00", "8:30", etc.)
  const parseTimeInput = (input: string): number => {
    if (!input.trim()) return 0
    
    // If it contains a colon, parse as HH:MM
    if (input.includes(':')) {
      const [hours, minutes] = input.split(':').map(s => parseInt(s, 10) || 0)
      return hours + (minutes / 60)
    }
    
    // Otherwise parse as decimal hours
    const parsed = parseFloat(input)
    return isNaN(parsed) ? 0 : parsed
  }

  // Initialize values when popover opens
  useEffect(() => {
    if (open) {
      setHoursInput(formatDecimalToTime(value))
      setEntryComment(comment)
    }
  }, [open, value, comment])

  const handleSave = () => {
    const decimalHours = parseTimeInput(hoursInput)
    onChange(decimalHours, entryComment.trim())
    setOpen(false)
  }

  const handleCancel = () => {
    setOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    }
  }

  if (disabled) {
    return <>{children}</>
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="center">
        {/* Hours Input */}
        <div className="space-y-2 mb-4">
          <Label htmlFor="hours-input" className="text-sm font-medium">
            Hours
          </Label>
          <Input
            id="hours-input"
            value={hoursInput}
            onChange={(e) => setHoursInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. 8 or 8:00"
            className="text-center text-lg"
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            Enter hours (e.g., 8 or 8:30)
          </p>
        </div>

        {/* Comment Field */}
        <div className="space-y-2 mb-4">
          <Label htmlFor="comment-input" className="text-sm font-medium">
            Add comment
          </Label>
          <Textarea
            id="comment-input"
            placeholder="Add comment (optional)"
            value={entryComment}
            onChange={(e) => setEntryComment(e.target.value)}
            className="text-sm"
            rows={2}
          />
        </div>

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
