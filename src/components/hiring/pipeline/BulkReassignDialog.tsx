import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { ApplicationsService } from "@/services/applicationsService"
import { Loader2 } from "lucide-react"

const STAGE_OPTIONS = [
  'Submitted',
  'Shortlisted',
  'Interview',
  'Offer',
  'Client',
  'HR',
  'Joined',
  'Rejected'
]

interface BulkReassignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedIds: string[]
  onSuccess: (count: number) => void
}

export function BulkReassignDialog({
  open,
  onOpenChange,
  selectedIds,
  onSuccess
}: BulkReassignDialogProps) {
  const [stage, setStage] = useState('')
  const [round, setRound] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')

  const handleReassign = () => {
    setError('')
    
    // Validate at least one field is filled
    if (!stage && !round && !notes) {
      setError('Please fill at least one field to update')
      return
    }
    
    setShowConfirm(true)
  }

  const handleConfirm = async () => {
    setLoading(true)
    setShowConfirm(false)
    
    try {
      const updates: any = {}
      if (stage) updates.stage = stage
      if (round) updates.round = round
      if (notes) updates.notes = notes
      
      await ApplicationsService.bulkUpdateApplications(selectedIds, updates)
      
      // Reset form
      setStage('')
      setRound('')
      setNotes('')
      
      onSuccess(selectedIds.length)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update applications')
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false)
      setError('')
      setStage('')
      setRound('')
      setNotes('')
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Bulk Reassign Applications</DialogTitle>
            <DialogDescription>
              Update {selectedIds.length} selected application{selectedIds.length !== 1 ? 's' : ''}.
              Fill in the fields you want to update.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="bulk-stage">Stage</Label>
              <Select value={stage} onValueChange={setStage} disabled={loading}>
                <SelectTrigger id="bulk-stage">
                  <SelectValue placeholder="Select stage (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {STAGE_OPTIONS.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bulk-round">Round</Label>
              <Input
                id="bulk-round"
                value={round}
                onChange={(e) => setRound(e.target.value)}
                placeholder="e.g., Round 1 (optional)"
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bulk-notes">Notes</Label>
              <Textarea
                id="bulk-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes (optional)"
                rows={3}
                disabled={loading}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleReassign} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reassign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Update</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update {selectedIds.length} application{selectedIds.length !== 1 ? 's' : ''}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Confirm Update</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
