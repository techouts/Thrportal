import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { InterviewSlot } from '@/types/scheduling'

interface AssignCandidateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  slot: InterviewSlot
  onAssigned: () => void
}

export function AssignCandidateDialog({ open, onOpenChange, slot, onAssigned }: AssignCandidateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Candidate</DialogTitle>
        </DialogHeader>
        <div>TODO: Implement candidate assignment form</div>
        <Button onClick={onAssigned}>Assign</Button>
      </DialogContent>
    </Dialog>
  )
}