import React, { useState, useEffect } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface TimeEntryPopoverProps {
  comment?: string
  onCommentChange: (comment: string) => void
  disabled?: boolean
  children: React.ReactNode
}

export function TimeEntryPopover({
  comment = '',
  onCommentChange,
  disabled = false,
  children
}: TimeEntryPopoverProps) {
  const [open, setOpen] = useState(false)
  const [entryComment, setEntryComment] = useState('')

  // Initialize comment when popover opens
  useEffect(() => {
    if (open) {
      setEntryComment(comment)
    }
  }, [open, comment])

  // Auto-save comment when popover closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && entryComment.trim() !== comment) {
      onCommentChange(entryComment.trim())
    }
    setOpen(newOpen)
  }

  if (disabled) {
    return <>{children}</>
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="center">
        <div className="space-y-2">
          <Label htmlFor="comment-input" className="text-sm font-medium">
            Comment
          </Label>
          <Textarea
            id="comment-input"
            placeholder="Add comment (optional)"
            value={entryComment}
            onChange={(e) => setEntryComment(e.target.value)}
            className="text-sm"
            rows={3}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
