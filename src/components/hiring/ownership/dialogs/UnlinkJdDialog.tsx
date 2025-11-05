import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { candidatesService } from '@/services/candidatesService';
import { toast } from 'sonner';

interface UnlinkJdDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateId: string;
  candidateName: string;
  onSuccess: () => void;
}

export const UnlinkJdDialog = ({ open, onOpenChange, candidateId, candidateName, onSuccess }: UnlinkJdDialogProps) => {
  const [linkedJDs, setLinkedJDs] = useState<Array<{ id: string; jobTitle: string; clientName: string }>>([]);
  const [selectedJDs, setSelectedJDs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (open) {
      loadLinkedJDs();
    }
  }, [open]);

  const loadLinkedJDs = async () => {
    setLoading(true);
    try {
      const jds = await candidatesService.getLinkedJDs(candidateId);
      setLinkedJDs(jds);
    } catch (error) {
      console.error('Error loading linked JDs:', error);
      toast.error('Failed to load linked JDs');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkClick = () => {
    if (selectedJDs.length === 0) {
      toast.error('Please select at least one JD to unlink');
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmUnlink = async () => {
    setLoading(true);
    try {
      await candidatesService.unlinkCandidateFromJDs(candidateId, selectedJDs);
      toast.success(`Successfully unlinked ${selectedJDs.length} JD(s)`);
      setSelectedJDs([]);
      setShowConfirmation(false);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error unlinking JDs:', error);
      toast.error('Failed to unlink JDs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Unlink JD from Candidate</DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Candidate: <strong>{candidateName}</strong>
            </p>
          </DialogHeader>
          
          <div className="space-y-2 overflow-y-auto max-h-96">
            {loading ? (
              <div className="text-center py-8">Loading linked JDs...</div>
            ) : linkedJDs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No linked JDs found</div>
            ) : (
              linkedJDs.map((jd) => (
                <div key={jd.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                  <Checkbox
                    id={jd.id}
                    checked={selectedJDs.includes(jd.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedJDs([...selectedJDs, jd.id]);
                      } else {
                        setSelectedJDs(selectedJDs.filter(id => id !== jd.id));
                      }
                    }}
                  />
                  <label htmlFor={jd.id} className="flex-1 cursor-pointer">
                    <div className="font-medium">{jd.jobTitle}</div>
                    <div className="text-sm text-muted-foreground">{jd.clientName}</div>
                  </label>
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleUnlinkClick} 
              disabled={loading || selectedJDs.length === 0}
            >
              Unlink {selectedJDs.length > 0 && `(${selectedJDs.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Unlink</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unlink <strong>{selectedJDs.length}</strong> JD(s) from this candidate?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmUnlink}>
              Confirm Unlink
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
