import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { candidatesService } from '@/services/candidatesService';
import { toast } from 'sonner';

interface BulkLinkJdDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCandidateIds: string[];
  selectedCandidateCount: number;
  onSuccess: () => void;
}

export function BulkLinkJdDialog({
  open,
  onOpenChange,
  selectedCandidateIds,
  selectedCandidateCount,
  onSuccess,
}: BulkLinkJdDialogProps) {
  const [approvedJDs, setApprovedJDs] = useState<Array<{ id: string; jobTitle: string; clientName: string }>>([]);
  const [selectedJDs, setSelectedJDs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadApprovedJDs();
    }
  }, [open]);

  const loadApprovedJDs = async () => {
    try {
      const jds = await candidatesService.getApprovedJDs();
      setApprovedJDs(jds);
    } catch (error) {
      console.error('Error loading approved JDs:', error);
      toast.error('Failed to load approved JDs');
    }
  };

  const handleSubmit = async () => {
    if (selectedJDs.length === 0) {
      toast.error('Please select at least one JD');
      return;
    }

    setLoading(true);
    try {
      // Link selected JDs to all selected candidates
      await Promise.all(
        selectedCandidateIds.map(candidateId =>
          candidatesService.linkCandidateToJDs(candidateId, selectedJDs)
        )
      );

      toast.success(`Successfully linked ${selectedJDs.length} JD(s) to ${selectedCandidateCount} candidate(s)`);
      setSelectedJDs([]);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error linking JDs:', error);
      toast.error('Failed to link JDs to candidates');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Bulk Link to JDs</DialogTitle>
          <DialogDescription>
            You are about to link JDs to <strong>{selectedCandidateCount}</strong> candidate(s)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[400px] overflow-y-auto">
          {approvedJDs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No approved JDs available</p>
          ) : (
            approvedJDs.map((jd) => (
              <div key={jd.id} className="flex items-start space-x-3 p-2 hover:bg-muted/50 rounded">
                <Checkbox
                  id={`jd-${jd.id}`}
                  checked={selectedJDs.includes(jd.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedJDs([...selectedJDs, jd.id]);
                    } else {
                      setSelectedJDs(selectedJDs.filter(id => id !== jd.id));
                    }
                  }}
                />
                <label
                  htmlFor={`jd-${jd.id}`}
                  className="flex-1 cursor-pointer text-sm"
                >
                  <div className="font-medium">{jd.jobTitle}</div>
                  <div className="text-muted-foreground">{jd.clientName}</div>
                </label>
              </div>
            ))
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedJDs([]);
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || selectedJDs.length === 0}>
            {loading ? 'Linking...' : 'Link'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
