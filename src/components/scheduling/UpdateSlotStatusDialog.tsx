import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { InterviewSlot } from '@/types/scheduling'

interface UpdateSlotStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  slot: InterviewSlot
  onUpdated: () => void
}

export function UpdateSlotStatusDialog({ open, onOpenChange, slot, onUpdated }: UpdateSlotStatusDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Slot Status</DialogTitle>
        </DialogHeader>
        <div>TODO: Implement status update form</div>
        <Button onClick={onUpdated}>Update</Button>
      </DialogContent>
    </Dialog>
  )
}