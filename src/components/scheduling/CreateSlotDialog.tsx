import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

interface CreateSlotDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSlotCreated: () => void
}

export function CreateSlotDialog({ open, onOpenChange, onSlotCreated }: CreateSlotDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // TODO: Implement slot creation
    setTimeout(() => {
      setLoading(false)
      onSlotCreated()
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Interview Slot</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date</Label>
              <Input type="date" required />
            </div>
            <div>
              <Label>Time</Label>
              <Input type="time" required />
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Slot'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}