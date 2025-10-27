import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TagsInput } from '@/components/ui/tags-input';
import { candidateSchemaPhase1, CandidateFormDataPhase1 } from '@/schemas/candidateSchema';
import { candidatesService } from '@/services/candidatesService';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface AddCandidateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddCandidateDialog({ open, onOpenChange, onSuccess }: AddCandidateDialogProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CandidateFormDataPhase1>({
    resolver: zodResolver(candidateSchemaPhase1),
    defaultValues: {
      consent: true,
      gdprCompliant: true,
      status: 'New',
      experience: 0,
      skills: [],
    },
  });

  const skills = watch('skills') || [];
  const consent = watch('consent');
  const gdprCompliant = watch('gdprCompliant');

  const onSubmit = async (data: CandidateFormDataPhase1) => {
    setLoading(true);
    try {
      await candidatesService.createCandidate(data as any);
      toast.success('Candidate created successfully');
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create candidate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Candidate</DialogTitle>
          <DialogDescription>Fill in the candidate details to add them to the system.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="professional">Professional Details</TabsTrigger>
              <TabsTrigger value="compliance">Compliance & Consent</TabsTrigger>
            </TabsList>

            {/* Tab 1: Basic Information */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" {...register('name')} placeholder="John Doe" />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" {...register('email')} placeholder="john@example.com" />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" {...register('phone')} placeholder="+1 234 567 8900" />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input id="location" {...register('location')} placeholder="New York, USA" />
                  {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                  <Input id="linkedinUrl" {...register('linkedinUrl')} placeholder="https://linkedin.com/in/johndoe" />
                  {errors.linkedinUrl && <p className="text-sm text-destructive">{errors.linkedinUrl.message}</p>}
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Professional Details */}
            <TabsContent value="professional" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="source">Source *</Label>
                  <Select onValueChange={(value) => setValue('source', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                      <SelectItem value="Job Board">Naukri / Job Board</SelectItem>
                      <SelectItem value="Direct Application">Direct / WhatsApp</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                      <SelectItem value="Internal Pool">Internal Pool</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.source && <p className="text-sm text-destructive">{errors.source.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <Input
                    id="experience"
                    type="number"
                    {...register('experience', { valueAsNumber: true })}
                    placeholder="5"
                  />
                  {errors.experience && <p className="text-sm text-destructive">{errors.experience.message}</p>}
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Skills</Label>
                  <TagsInput
                    value={skills}
                    onChange={(tags) => setValue('skills', tags)}
                    placeholder="Type a skill and press Enter"
                  />
                  {errors.skills && <p className="text-sm text-destructive">{errors.skills.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentCtc">Current CTC (USD)</Label>
                  <Input
                    id="currentCtc"
                    type="number"
                    {...register('currentCtc', { valueAsNumber: true })}
                    placeholder="50000"
                  />
                  {errors.currentCtc && <p className="text-sm text-destructive">{errors.currentCtc.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedCtc">Expected CTC (USD)</Label>
                  <Input
                    id="expectedCtc"
                    type="number"
                    {...register('expectedCtc', { valueAsNumber: true })}
                    placeholder="60000"
                  />
                  {errors.expectedCtc && <p className="text-sm text-destructive">{errors.expectedCtc.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="noticePeriod">Notice Period</Label>
                  <Select onValueChange={(value) => setValue('noticePeriod', parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select notice period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Immediate</SelectItem>
                      <SelectItem value="15">15 Days</SelectItem>
                      <SelectItem value="30">1 Month</SelectItem>
                      <SelectItem value="90">3 Months</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.noticePeriod && <p className="text-sm text-destructive">{errors.noticePeriod.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select defaultValue="New" onValueChange={(value) => setValue('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                      <SelectItem value="Submitted">Submitted</SelectItem>
                      <SelectItem value="Interview Scheduled">Interview Scheduled</SelectItem>
                      <SelectItem value="Offer Extended">Offer Extended</SelectItem>
                      <SelectItem value="Joined">Joined</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="recruiterOwner">Owner (Recruiter)</Label>
                  <Input id="recruiterOwner" {...register('recruiterOwner')} placeholder="Recruiter name" />
                  {errors.recruiterOwner && <p className="text-sm text-destructive">{errors.recruiterOwner.message}</p>}
                </div>
              </div>
            </TabsContent>

            {/* Tab 3: Compliance & Consent */}
            <TabsContent value="compliance" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="consent"
                    checked={consent}
                    onCheckedChange={(checked) => setValue('consent', checked as boolean)}
                  />
                  <Label htmlFor="consent" className="cursor-pointer">
                    Candidate has given consent for data processing
                  </Label>
                </div>
                {errors.consent && <p className="text-sm text-destructive">{errors.consent.message}</p>}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="gdprCompliant"
                    checked={gdprCompliant}
                    onCheckedChange={(checked) => setValue('gdprCompliant', checked as boolean)}
                  />
                  <Label htmlFor="gdprCompliant" className="cursor-pointer">
                    Data collection is GDPR compliant
                  </Label>
                </div>
                {errors.gdprCompliant && <p className="text-sm text-destructive">{errors.gdprCompliant.message}</p>}

                <div className="p-4 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground">
                    By checking these boxes, you confirm that the candidate has provided explicit consent for data
                    processing and that all data collection activities comply with GDPR regulations.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Candidate
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
