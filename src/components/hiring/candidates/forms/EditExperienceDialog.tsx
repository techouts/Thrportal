import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { candidatesService } from '@/services/candidatesService';
import { experienceSchema, type ExperienceFormData } from '@/schemas/candidateFormSchemas';
import type { CandidateExperience } from '@/types/candidates';

interface EditExperienceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  experience: CandidateExperience | null;
  onSuccess?: () => void;
}

export function EditExperienceDialog({ open, onOpenChange, experience, onSuccess }: EditExperienceDialogProps) {
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, watch, reset, setValue } = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
  });
  
  const isCurrent = watch('isCurrent');
  
  useEffect(() => {
    if (experience) {
      reset({
        company: experience.company,
        designation: experience.designation,
        startDate: experience.startDate,
        endDate: experience.endDate || '',
        isCurrent: experience.isCurrent,
        description: experience.description,
        skills: experience.skills || [],
        achievements: experience.achievements || [],
        ctc: experience.ctc,
      });
    }
  }, [experience, reset]);
  
  const onSubmit = async (data: ExperienceFormData) => {
    if (!experience) return;
    
    setLoading(true);
    try {
      await candidatesService.updateCandidateExperience(experience.id, data as any);
      
      toast.success('Experience updated successfully');
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update experience');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Work Experience</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input id="company" {...register('company')} />
              {errors.company && <p className="text-sm text-destructive">{errors.company.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="designation">Designation *</Label>
              <Input id="designation" {...register('designation')} />
              {errors.designation && <p className="text-sm text-destructive">{errors.designation.message}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input id="startDate" type="date" {...register('startDate')} />
              {errors.startDate && <p className="text-sm text-destructive">{errors.startDate.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date {!isCurrent && '*'}</Label>
              <Input id="endDate" type="date" {...register('endDate')} disabled={isCurrent} />
              {errors.endDate && <p className="text-sm text-destructive">{errors.endDate.message}</p>}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="isCurrent" 
              checked={isCurrent}
              onCheckedChange={(checked) => setValue('isCurrent', !!checked)}
            />
            <Label htmlFor="isCurrent">Currently working here</Label>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} rows={3} />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ctc">CTC (Annual)</Label>
            <Input id="ctc" type="number" step="0.01" {...register('ctc')} />
            {errors.ctc && <p className="text-sm text-destructive">{errors.ctc.message}</p>}
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Experience
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
