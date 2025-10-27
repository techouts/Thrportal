import React, { useState, useEffect } from 'react';
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
import { candidateSchemaPhase2, CandidateFormDataPhase2 } from '@/schemas/candidateSchema';
import { candidatesService } from '@/services/candidatesService';
import { toast } from 'sonner';
import { Loader2, AlertCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface AddCandidateDialogPhase2Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddCandidateDialogPhase2({ open, onOpenChange, onSuccess }: AddCandidateDialogPhase2Props) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [tabErrors, setTabErrors] = useState<Record<string, number>>({
    basic: 0,
    professional: 0,
    location: 0,
    personal: 0,
    identity: 0,
    compliance: 0,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CandidateFormDataPhase2>({
    resolver: zodResolver(candidateSchemaPhase2),
    defaultValues: {
      consent: true,
      gdprCompliant: true,
      status: 'New',
      experience: 0,
      skills: [],
      languagesKnown: [],
      willingToRelocate: false,
    },
  });

  const skills = watch('skills') || [];
  const languagesKnown = watch('languagesKnown') || [];
  const consent = watch('consent');
  const gdprCompliant = watch('gdprCompliant');
  const willingToRelocate = watch('willingToRelocate');

  // Validate tab fields
  const validateTab = (tabName: string) => {
    const formErrors = errors;
    
    switch(tabName) {
      case 'basic':
        return ['firstName', 'lastName', 'email', 'phone'].filter(f => formErrors[f as keyof typeof formErrors]).length;
      case 'professional':
        return ['source', 'experience'].filter(f => formErrors[f as keyof typeof formErrors]).length;
      case 'location':
        return formErrors.location ? 1 : 0;
      default:
        return 0;
    }
  };

  // Update tab errors in real-time
  useEffect(() => {
    setTabErrors({
      basic: validateTab('basic'),
      professional: validateTab('professional'),
      location: validateTab('location'),
      personal: 0,
      identity: 0,
      compliance: 0,
    });
  }, [errors]);

  const onError = (errors: any) => {
    console.log('=== FORM VALIDATION FAILED ===');
    console.log('Validation errors:', errors);
    
    // Count errors per tab
    const basicErrors = ['firstName', 'lastName', 'email', 'phone'].filter(f => errors[f]).length;
    const professionalErrors = ['source', 'experience'].filter(f => errors[f]).length;
    const locationErrors = errors.location ? 1 : 0;
    
    // Find first tab with errors
    let firstErrorTab = 'basic';
    if (basicErrors > 0) firstErrorTab = 'basic';
    else if (professionalErrors > 0) firstErrorTab = 'professional';
    else if (locationErrors > 0) firstErrorTab = 'location';
    
    // Navigate to first error tab
    setActiveTab(firstErrorTab);
    
    // Show error toast
    const totalErrors = basicErrors + professionalErrors + locationErrors;
    toast.error(`Please fill ${totalErrors} required field${totalErrors > 1 ? 's' : ''} before creating candidate`);
  };

  const onSubmit = async (data: CandidateFormDataPhase2) => {
    console.log('=== FORM SUBMISSION STARTED ===');
    console.log('Form data:', data);
    console.log('Validation errors:', errors);
    
    setLoading(true);
    try {
      console.log('Calling candidatesService.createCandidate...');
      const result = await candidatesService.createCandidate(data as any);
      console.log('Candidate created successfully:', result);
      
      toast.success('Candidate created successfully');
      reset();
      onOpenChange(false);
      console.log('Calling onSuccess callback to refresh candidate list...');
      onSuccess?.();
    } catch (error: any) {
      console.error('Error creating candidate:', error);
      toast.error(error.message || 'Failed to create candidate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Candidate (Enhanced)</DialogTitle>
          <DialogDescription>Fill in comprehensive candidate details to add them to the system.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="basic" className={tabErrors.basic > 0 ? 'border-2 border-destructive' : ''}>
                Basic
                {tabErrors.basic > 0 && <AlertCircle className="ml-1 h-4 w-4 text-destructive" />}
              </TabsTrigger>
              <TabsTrigger value="professional" className={tabErrors.professional > 0 ? 'border-2 border-destructive' : ''}>
                Professional
                {tabErrors.professional > 0 && <AlertCircle className="ml-1 h-4 w-4 text-destructive" />}
              </TabsTrigger>
              <TabsTrigger value="location" className={tabErrors.location > 0 ? 'border-2 border-destructive' : ''}>
                Location
                {tabErrors.location > 0 && <AlertCircle className="ml-1 h-4 w-4 text-destructive" />}
              </TabsTrigger>
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="identity">Identity</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
            </TabsList>

            {/* Tab 1: Basic Information */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" {...register('firstName')} placeholder="John" />
                  {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input id="middleName" {...register('middleName')} placeholder="Michael" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" {...register('lastName')} placeholder="Doe" />
                  {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" {...register('email')} placeholder="john@example.com" />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alternateEmail">Alternate Email</Label>
                  <Input id="alternateEmail" type="email" {...register('alternateEmail')} placeholder="john.personal@gmail.com" />
                  {errors.alternateEmail && <p className="text-sm text-destructive">{errors.alternateEmail.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" {...register('phone')} placeholder="+1 234 567 8900" />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} />
                  {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t mt-6">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => setActiveTab('professional')}>
                  Next
                </Button>
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
                  <Input id="experience" type="number" {...register('experience', { valueAsNumber: true })} placeholder="5" />
                  {errors.experience && <p className="text-sm text-destructive">{errors.experience.message}</p>}
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Skills</Label>
                  <TagsInput value={skills} onChange={(tags) => setValue('skills', tags)} placeholder="Type a skill and press Enter" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentCtc">Current CTC (USD)</Label>
                  <Input id="currentCtc" type="number" {...register('currentCtc', { valueAsNumber: true })} placeholder="50000" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedCtc">Expected CTC (USD)</Label>
                  <Input id="expectedCtc" type="number" {...register('expectedCtc', { valueAsNumber: true })} placeholder="60000" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedCtcType">Expected CTC Type</Label>
                  <Select onValueChange={(value) => setValue('expectedCtcType', value as 'Monthly' | 'Annual')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select CTC type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="statusExtended">Availability Status</Label>
                  <Select onValueChange={(value) => setValue('statusExtended', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Not Available">Not Available</SelectItem>
                      <SelectItem value="Do Not Call">Do Not Call</SelectItem>
                      <SelectItem value="Blacklist">Blacklist</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Placed">Placed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobType">Job Type</Label>
                  <Select onValueChange={(value) => setValue('jobType', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Permanent">Permanent</SelectItem>
                      <SelectItem value="Part Time">Part Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredShift">Preferred Shift</Label>
                  <Select onValueChange={(value) => setValue('preferredShift', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select shift" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Day">Day</SelectItem>
                      <SelectItem value="Night">Night</SelectItem>
                      <SelectItem value="Flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recruiterOwner">Owner (Recruiter)</Label>
                  <Input id="recruiterOwner" {...register('recruiterOwner')} placeholder="Recruiter name" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                  <Input id="linkedinUrl" {...register('linkedinUrl')} placeholder="https://linkedin.com/in/johndoe" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="githubUrl">GitHub URL</Label>
                  <Input id="githubUrl" {...register('githubUrl')} placeholder="https://github.com/johndoe" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t mt-6">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => setActiveTab('location')}>
                  Next
                </Button>
              </div>
            </TabsContent>

            {/* Tab 3: Location Details */}
            <TabsContent value="location" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" {...register('city')} placeholder="New York" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" {...register('state')} placeholder="NY" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" {...register('country')} placeholder="USA" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input id="pincode" {...register('pincode')} placeholder="10001" />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" {...register('address')} placeholder="Street address" rows={3} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location (Legacy) *</Label>
                  <Input id="location" {...register('location')} placeholder="New York, USA" />
                  {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
                </div>

                <div className="flex items-center space-x-2 pt-8">
                  <Checkbox
                    id="willingToRelocate"
                    checked={willingToRelocate}
                    onCheckedChange={(checked) => setValue('willingToRelocate', checked as boolean)}
                  />
                  <Label htmlFor="willingToRelocate" className="cursor-pointer">Willing to Relocate</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t mt-6">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => setActiveTab('personal')}>
                  Next
                </Button>
              </div>
            </TabsContent>

            {/* Tab 4: Personal Details */}
            <TabsContent value="personal" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maritalStatus">Marital Status</Label>
                  <Select onValueChange={(value) => setValue('maritalStatus', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Unmarried">Unmarried</SelectItem>
                      <SelectItem value="Married">Married</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Languages Known</Label>
                  <TagsInput
                    value={languagesKnown}
                    onChange={(tags) => setValue('languagesKnown', tags)}
                    placeholder="Type a language and press Enter"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t mt-6">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => setActiveTab('identity')}>
                  Next
                </Button>
              </div>
            </TabsContent>

            {/* Tab 5: Identity Documents */}
            <TabsContent value="identity" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="panCardNumber">PAN Card Number</Label>
                  <Input id="panCardNumber" {...register('panCardNumber')} placeholder="ABCDE1234F" maxLength={10} />
                  {errors.panCardNumber && <p className="text-sm text-destructive">{errors.panCardNumber.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aadhaarCardNumber">Aadhaar Card Number</Label>
                  <Input id="aadhaarCardNumber" {...register('aadhaarCardNumber')} placeholder="123456789012" maxLength={12} />
                  {errors.aadhaarCardNumber && <p className="text-sm text-destructive">{errors.aadhaarCardNumber.message}</p>}
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="passportNumber">Passport Number</Label>
                  <Input id="passportNumber" {...register('passportNumber')} placeholder="A12345678" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t mt-6">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => setActiveTab('compliance')}>
                  Next
                </Button>
              </div>
            </TabsContent>

            {/* Tab 6: Compliance & Consent */}
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

                <div className="p-4 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground">
                    By checking these boxes, you confirm that the candidate has provided explicit consent for data
                    processing and that all data collection activities comply with GDPR regulations.
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t mt-6">
                <Button type="button" variant="outline" onClick={() => setActiveTab('identity')}>
                  Previous
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Candidate
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </DialogContent>
    </Dialog>
  );
}
