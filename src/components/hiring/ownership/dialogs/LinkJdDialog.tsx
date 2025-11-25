import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { candidatesService } from '@/services/candidatesService';
import { toast } from 'sonner';

interface LinkJdDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateId: string;
  candidateName: string;
  onSuccess: () => void;
}

export const LinkJdDialog = ({ open, onOpenChange, candidateId, candidateName, onSuccess }: LinkJdDialogProps) => {
  const [approvedJDs, setApprovedJDs] = useState<Array<{ id: string; jobTitle: string; clientName: string }>>([]);
  const [selectedJDs, setSelectedJDs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadApprovedJDs();
    }
  }, [open]);

  const loadApprovedJDs = async () => {
    setLoading(true);
    try {
      const jds = await candidatesService.getApprovedJDs();
      setApprovedJDs(jds);
    } catch (error) {
      console.error('Error loading approved JDs:', error);
      toast.error('Failed to load approved JDs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedJDs.length === 0) {
      toast.error('Please select at least one JD');
      return;
    }

    setLoading(true);
    try {
      await candidatesService.linkCandidateToJDs(candidateId, selectedJDs);
      toast.success(`Successfully linked ${selectedJDs.length} JD(s)`);
      setSelectedJDs([]);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error linking JDs:', error);
      toast.error('Failed to link JDs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Link JD to Candidate</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Candidate: <strong>{candidateName}</strong>
          </p>
        </DialogHeader>
        
        <div className="space-y-2 overflow-y-auto max-h-96">
          {loading ? (
            <div className="text-center py-8">Loading approved JDs...</div>
          ) : approvedJDs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No approved JDs found</div>
          ) : (
            approvedJDs.map((jd) => (
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
          <Button onClick={handleSubmit} disabled={loading || selectedJDs.length === 0}>
            Link {selectedJDs.length > 0 && `(${selectedJDs.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
