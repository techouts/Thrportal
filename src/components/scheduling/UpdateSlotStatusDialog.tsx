import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { schedulingService } from '@/services/schedulingService'
import type { InterviewSlot } from '@/types/scheduling'

interface UpdateSlotStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  slot: InterviewSlot
  onUpdated: () => void
}

const CANCELLATION_REASONS = [
  { value: 'panel_not_available', label: 'Panel not available' },
  { value: 'candidate_not_available', label: 'Candidate not available' }
]

export function UpdateSlotStatusDialog({ open, onOpenChange, slot, onUpdated }: UpdateSlotStatusDialogProps) {
  const [reason, setReason] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!reason) {
      toast.error('Please select a cancellation reason')
      return
    }

    setIsSubmitting(true)
    try {
      await schedulingService.cancelSlot(slot.id, reason)
      toast.success('Slot cancelled successfully')
      onUpdated()
      onOpenChange(false)
      setReason('')
    } catch (error) {
      console.error('Error cancelling slot:', error)
      toast.error('Failed to cancel slot')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setReason('')
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Status</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select value="cancelled" disabled>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Reason <span className="text-destructive">*</span></Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                {CANCELLATION_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !reason}>
            {isSubmitting ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
