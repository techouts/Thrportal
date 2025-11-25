import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { ApplicationsService } from "@/services/applicationsService"
import { Submission } from "@/types/applications"
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

interface UpdateApplicationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  application: Submission | null
  onSuccess: () => void
}

export function UpdateApplicationDialog({
  open,
  onOpenChange,
  application,
  onSuccess
}: UpdateApplicationDialogProps) {
  const [stage, setStage] = useState(application?.stage || '')
  const [round, setRound] = useState(application?.round || '')
  const [statusReason, setStatusReason] = useState(application?.statusReason || '')
  const [notes, setNotes] = useState(application?.notes || '')
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')

  // Update form when application changes
  useState(() => {
    if (application) {
      setStage(application.stage || '')
      setRound(application.round || '')
      setStatusReason(application.statusReason || '')
      setNotes(application.notes || '')
    }
  })

  const handleSave = () => {
    setError('')
    if (!stage) {
      setError('Stage is required')
      return
    }
    setShowConfirm(true)
  }

  const handleConfirm = async () => {
    if (!application) return
    
    setLoading(true)
    setShowConfirm(false)
    
    try {
      await ApplicationsService.updateSubmissionStatus(application.id, {
        stage,
        round: round || undefined,
        status_reason: statusReason || undefined,
        notes: notes || undefined
      })
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update application')
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false)
      setError('')
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Application</DialogTitle>
            <DialogDescription>
              Update status for {application?.candidateName} - {application?.jdTitle}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="stage">Stage *</Label>
              <Select value={stage} onValueChange={setStage} disabled={loading}>
                <SelectTrigger id="stage">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {STAGE_OPTIONS.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {error && !stage && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="round">Round</Label>
              <Input
                id="round"
                value={round}
                onChange={(e) => setRound(e.target.value)}
                placeholder="e.g., Round 1, Technical Round"
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status-reason">Status Reason</Label>
              <Textarea
                id="status-reason"
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="Reason for status change"
                rows={3}
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes"
                rows={3}
                disabled={loading}
              />
            </div>

            {error && stage && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Update</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update this application? This action will modify the stage and status information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
