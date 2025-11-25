import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { candidatesService } from '@/services/candidatesService';
import type { CandidateEducation } from '@/types/candidates';
import { GraduationCap, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AddEducationDialog } from '../../forms/AddEducationDialog';
import { EditEducationDialog } from '../../forms/EditEducationDialog';

interface CandidateEducationTabProps {
  candidateId: string;
}

export function CandidateEducationTab({ candidateId }: CandidateEducationTabProps) {
  const [education, setEducation] = useState<CandidateEducation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'Degree' | 'Certification'>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEducation, setEditingEducation] = useState<CandidateEducation | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadEducation();
  }, [candidateId]);

  const loadEducation = async () => {
    try {
      const data = await candidatesService.getCandidateEducation(candidateId);
      setEducation(data);
    } catch (error) {
      console.error('Failed to load education:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    
    try {
      await candidatesService.deleteCandidateEducation(deletingId);
      toast.success('Education deleted successfully');
      setDeletingId(null);
      loadEducation();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete education');
    }
  };

  const filteredEducation = filter === 'all' 
    ? education 
    : education.filter(edu => edu.type === filter);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Education & Certifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Education & Certifications</CardTitle>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Education
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(val) => setFilter(val as any)} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({education.length})</TabsTrigger>
              <TabsTrigger value="Degree">Degrees ({education.filter(e => e.type === 'Degree').length})</TabsTrigger>
              <TabsTrigger value="Certification">Certifications ({education.filter(e => e.type === 'Certification').length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value={filter}>
              {filteredEducation.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No education details found</p>
              ) : (
                <div className="space-y-6">
                  {filteredEducation.map((edu) => (
                    <div key={edu.id} className="border-l-2 border-primary pl-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" />
                            <h3 className="font-semibold">{edu.degree} in {edu.field}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">{edu.institution}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <span className="text-sm text-muted-foreground">
                              {edu.startYear} - {edu.endYear || 'Present'}
                            </span>
                            <Badge variant="outline" className="ml-2">{edu.type}</Badge>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => setEditingEducation(edu)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeletingId(edu.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {edu.grade && (
                        <p className="text-sm"><span className="font-medium">Grade:</span> {edu.grade}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AddEducationDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        candidateId={candidateId}
        onSuccess={loadEducation}
      />

      <EditEducationDialog
        open={!!editingEducation}
        onOpenChange={(open) => !open && setEditingEducation(null)}
        education={editingEducation}
        onSuccess={loadEducation}
      />

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Education</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this education record? This action cannot be undone.
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
