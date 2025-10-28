import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { candidatesService } from '@/services/candidatesService';
import type { CandidateExperience } from '@/types/candidates';
import { Briefcase, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AddExperienceDialog } from '../../forms/AddExperienceDialog';
import { EditExperienceDialog } from '../../forms/EditExperienceDialog';

interface CandidateExperienceTabProps {
  candidateId: string;
}

export function CandidateExperienceTab({ candidateId }: CandidateExperienceTabProps) {
  const [experiences, setExperiences] = useState<CandidateExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingExperience, setEditingExperience] = useState<CandidateExperience | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadExperiences();
  }, [candidateId]);

  const loadExperiences = async () => {
    try {
      const data = await candidatesService.getCandidateExperience(candidateId);
      setExperiences(data);
    } catch (error) {
      console.error('Failed to load experience:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    
    try {
      await candidatesService.deleteCandidateExperience(deletingId);
      toast.success('Experience deleted successfully');
      setDeletingId(null);
      loadExperiences();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete experience');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Work Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Work Experience</CardTitle>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Experience
          </Button>
        </CardHeader>
        <CardContent>
          {experiences.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No work experience found</p>
          ) : (
            <div className="space-y-6">
              {experiences.map((exp) => (
                <div key={exp.id} className="border-l-2 border-primary pl-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        <h3 className="font-semibold">{exp.designation}</h3>
                        {exp.isCurrent && <Badge>Current</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{exp.company}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {exp.startDate} - {exp.endDate || 'Present'}
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => setEditingExperience(exp)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeletingId(exp.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {exp.description && (
                    <p className="text-sm">{exp.description}</p>
                  )}
                  {exp.skills && exp.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {exp.skills.map((skill, idx) => (
                        <Badge key={idx} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddExperienceDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        candidateId={candidateId}
        onSuccess={loadExperiences}
      />

      <EditExperienceDialog
        open={!!editingExperience}
        onOpenChange={(open) => !open && setEditingExperience(null)}
        experience={editingExperience}
        onSuccess={loadExperiences}
      />

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Experience</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this work experience? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
