import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { candidatesService } from '@/services/candidatesService';
import { educationSchema, type EducationFormData } from '@/schemas/candidateFormSchemas';
import type { CandidateEducation } from '@/types/candidates';

interface EditEducationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  education: CandidateEducation | null;
  onSuccess?: () => void;
}

export function EditEducationDialog({ open, onOpenChange, education, onSuccess }: EditEducationDialogProps) {
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
  });
  
  useEffect(() => {
    if (education) {
      reset({
        type: education.type,
        degree: education.degree,
        field: education.field,
        institution: education.institution,
        startYear: education.startYear,
        endYear: education.endYear,
        grade: education.grade,
      });
    }
  }, [education, reset]);
  
  const onSubmit = async (data: EducationFormData) => {
    if (!education) return;
    
    setLoading(true);
    try {
      await candidatesService.updateCandidateEducation(education.id, data as any);
      
      toast.success('Education updated successfully');
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update education');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Education/Certification</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select onValueChange={(value) => setValue('type', value as any)} defaultValue={education?.type}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Degree">Degree</SelectItem>
                <SelectItem value="Certification">Certification</SelectItem>
                <SelectItem value="Course">Course</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="degree">Degree/Certificate Name *</Label>
              <Input id="degree" {...register('degree')} />
              {errors.degree && <p className="text-sm text-destructive">{errors.degree.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="field">Field of Study *</Label>
              <Input id="field" {...register('field')} />
              {errors.field && <p className="text-sm text-destructive">{errors.field.message}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="institution">Institution *</Label>
            <Input id="institution" {...register('institution')} />
            {errors.institution && <p className="text-sm text-destructive">{errors.institution.message}</p>}
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startYear">Start Year *</Label>
              <Input id="startYear" type="number" {...register('startYear', { valueAsNumber: true })} />
              {errors.startYear && <p className="text-sm text-destructive">{errors.startYear.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endYear">End Year</Label>
              <Input id="endYear" type="number" {...register('endYear', { valueAsNumber: true })} />
              {errors.endYear && <p className="text-sm text-destructive">{errors.endYear.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="grade">Grade/CGPA</Label>
              <Input id="grade" {...register('grade')} placeholder="e.g., 8.5 CGPA" />
              {errors.grade && <p className="text-sm text-destructive">{errors.grade.message}</p>}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Education
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
