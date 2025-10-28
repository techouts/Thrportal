import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { candidatesService } from '@/services/candidatesService';
import { documentUploadSchema, type DocumentUploadFormData } from '@/schemas/candidateFormSchemas';

interface UploadDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateId: string;
  onSuccess?: () => void;
}

export function UploadDocumentDialog({ open, onOpenChange, candidateId, onSuccess }: UploadDocumentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<DocumentUploadFormData>({
    resolver: zodResolver(documentUploadSchema),
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('File must be PDF, DOC, DOCX, JPG, or PNG');
        return;
      }
      
      setSelectedFile(file);
      setValue('name', file.name);
    }
  };
  
  const onSubmit = async (data: DocumentUploadFormData) => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }
    
    setLoading(true);
    try {
      await candidatesService.uploadCandidateDocument(
        candidateId,
        selectedFile,
        data.type,
        data.name
      );
      
      toast.success('Document uploaded successfully');
      reset();
      setSelectedFile(null);
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Select File *</Label>
            <div className="flex items-center gap-2">
              <Input 
                id="file" 
                type="file" 
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">Max 10MB • PDF, DOC, DOCX, JPG, PNG</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Document Type *</Label>
            <Select onValueChange={(value) => setValue('type', value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Resume">Resume</SelectItem>
                <SelectItem value="Cover Letter">Cover Letter</SelectItem>
                <SelectItem value="Certificate">Certificate</SelectItem>
                <SelectItem value="Portfolio">Portfolio</SelectItem>
                <SelectItem value="ID Proof">ID Proof</SelectItem>
                <SelectItem value="Address Proof">Address Proof</SelectItem>
                <SelectItem value="Salary Slip">Salary Slip</SelectItem>
                <SelectItem value="Offer Letter">Offer Letter</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Document Name *</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedFile}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
