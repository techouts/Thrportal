import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { approvalsService } from '@/services/approvalsService';
import { useToast } from '@/hooks/use-toast';
import type { CreateJDApproval, JobType, PayType } from '@/types/approvals';
import { CrmService } from '@/services/crmService';
import type { CrmClient, CrmAccount, CrmProject } from '@/types/crm';

export function ManualJDTab() {
  const [formData, setFormData] = useState<Partial<CreateJDApproval>>({
    currency: 'USD',
    headcount: 1,
    is_replacement: false,
    is_internal: true,
    positions: 1,
    priority: 'Normal',
    work_location: { city: '', mode: 'Onsite' }
  });
  
  const [responsibilities, setResponsibilities] = useState<string[]>(['']);
  const [mustHaveSkills, setMustHaveSkills] = useState<string[]>(['']);
  const [goodToHaveSkills, setGoodToHaveSkills] = useState<string[]>(['']);
  const [interviewRounds, setInterviewRounds] = useState<string[]>(['']);
  
  const [approverNames, setApproverNames] = useState<string[]>([]);
  const [targetDate, setTargetDate] = useState<Date | undefined>();
  const [expectedDOJ, setExpectedDOJ] = useState<Date | undefined>();
  const [resumeDeadline, setResumeDeadline] = useState<Date | undefined>();
  const [jobType, setJobType] = useState<JobType>('Full-time');
  const [payType, setPayType] = useState<PayType>('Annually');
  const [ctcMin, setCtcMin] = useState<string>('');
  const [ctcMax, setCtcMax] = useState<string>('');
  const [contractPeriod, setContractPeriod] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const [clients, setClients] = useState<CrmClient[]>([]);
  const [accounts, setAccounts] = useState<CrmAccount[]>([]);
  const [projects, setProjects] = useState<CrmProject[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  useEffect(() => {
    const loadApprovers = async () => {
      const names = await approvalsService.getApproverNamesFromChain();
      setApproverNames(names);
    };
    loadApprovers();
    CrmService.getClients().then(setClients).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      CrmService.getAccountsByClient(selectedClientId).then(setAccounts).catch(console.error);
      CrmService.getProjectsByClient(selectedClientId).then(setProjects).catch(console.error);
    } else {
      setAccounts([]);
      setProjects([]);
    }
    setSelectedAccountId('');
    handleInputChange('account_name', '');
    handleInputChange('project_name', '');
  }, [selectedClientId]);

  const handleInputChange = (field: keyof CreateJDApproval, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleWorkLocationChange = (field: 'city' | 'mode', value: string) => {
    setFormData(prev => ({
      ...prev,
      work_location: { ...prev.work_location!, [field]: value }
    }));
  };

  const handleCTCChange = (field: 'min' | 'max', value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      if (field === 'min') {
        setCtcMin('');
        handleInputChange('ctc_monthly_min', undefined);
        handleInputChange('ctc_annual_min', undefined);
      } else {
        setCtcMax('');
        handleInputChange('ctc_monthly_max', undefined);
        handleInputChange('ctc_annual_max', undefined);
      }
      return;
    }

    const ctcValues = approvalsService.calculateCTCValues(numValue, payType);
    
    if (field === 'min') {
      setCtcMin(value);
      handleInputChange('ctc_monthly_min', ctcValues.monthly);
      handleInputChange('ctc_annual_min', ctcValues.annual);
    } else {
      setCtcMax(value);
      handleInputChange('ctc_monthly_max', ctcValues.monthly);
      handleInputChange('ctc_annual_max', ctcValues.annual);
    }
  };

  // Array management functions
  const addResponsibility = () => setResponsibilities([...responsibilities, '']);
  const removeResponsibility = (index: number) => setResponsibilities(responsibilities.filter((_, i) => i !== index));
  const updateResponsibility = (index: number, value: string) => {
    const updated = [...responsibilities];
    updated[index] = value;
    setResponsibilities(updated);
  };

  const addMustHaveSkill = () => setMustHaveSkills([...mustHaveSkills, '']);
  const removeMustHaveSkill = (index: number) => setMustHaveSkills(mustHaveSkills.filter((_, i) => i !== index));
  const updateMustHaveSkill = (index: number, value: string) => {
    const updated = [...mustHaveSkills];
    updated[index] = value;
    setMustHaveSkills(updated);
  };

  const addGoodToHaveSkill = () => setGoodToHaveSkills([...goodToHaveSkills, '']);
  const removeGoodToHaveSkill = (index: number) => setGoodToHaveSkills(goodToHaveSkills.filter((_, i) => i !== index));
  const updateGoodToHaveSkill = (index: number, value: string) => {
    const updated = [...goodToHaveSkills];
    updated[index] = value;
    setGoodToHaveSkills(updated);
  };

  const addInterviewRound = () => setInterviewRounds([...interviewRounds, '']);
  const removeInterviewRound = (index: number) => setInterviewRounds(interviewRounds.filter((_, i) => i !== index));
  const updateInterviewRound = (index: number, value: string) => {
    const updated = [...interviewRounds];
    updated[index] = value;
    setInterviewRounds(updated);
  };

  const resetForm = () => {
    setFormData({
      currency: 'USD',
      headcount: 1,
      is_replacement: false,
      is_internal: true,
      positions: 1,
      priority: 'Normal',
      work_location: { city: '', mode: 'Onsite' }
    });
    setResponsibilities(['']);
    setMustHaveSkills(['']);
    setGoodToHaveSkills(['']);
    setInterviewRounds(['']);
    setTargetDate(undefined);
    setExpectedDOJ(undefined);
    setResumeDeadline(undefined);
    setJobType('Full-time');
    setPayType('Annually');
    setCtcMin('');
    setCtcMax('');
    setContractPeriod('');
    setSelectedClientId('');
    setSelectedAccountId('');
  };

  const handleCreate = async () => {
    try {
      setIsSubmitting(true);
      
      if (!formData.job_title || !formData.department) {
        toast({
          title: "Validation Error",
          description: "Please fill in Job Title and Department",
          variant: "destructive"
        });
        return;
      }

      await approvalsService.createJDWithStatus({
        ...formData,
        responsibilities: responsibilities.filter(r => r.trim()),
        required_skills: {
          mustHave: mustHaveSkills.filter(s => s.trim()),
          goodToHave: goodToHaveSkills.filter(s => s.trim())
        },
        interview_rounds: interviewRounds.filter(r => r.trim()),
        target_date: targetDate?.toISOString(),
        target_doj: expectedDOJ?.toISOString(),
        resume_deadline: resumeDeadline?.toISOString(),
        job_type: jobType,
        pay_type: payType,
        contract_period_months: contractPeriod ? parseInt(contractPeriod) : undefined,
        approver_names: approverNames,
        employment_type: jobType
      }, false);

      toast({
        title: "Success",
        description: "Job Description created successfully with Active status"
      });
      resetForm();
    } catch (error) {
      console.error('Error creating JD:', error);
      toast({
        title: "Error",
        description: "Failed to create Job Description",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAsDraft = async () => {
    try {
      setIsSubmitting(true);

      await approvalsService.createJDWithStatus({
        ...formData,
        responsibilities: responsibilities.filter(r => r.trim()),
        required_skills: {
          mustHave: mustHaveSkills.filter(s => s.trim()),
          goodToHave: goodToHaveSkills.filter(s => s.trim())
        },
        interview_rounds: interviewRounds.filter(r => r.trim()),
        target_date: targetDate?.toISOString(),
        target_doj: expectedDOJ?.toISOString(),
        resume_deadline: resumeDeadline?.toISOString(),
        job_type: jobType,
        pay_type: payType,
        contract_period_months: contractPeriod ? parseInt(contractPeriod) : undefined,
        approver_names: approverNames,
        employment_type: jobType
      }, true);

      toast({
        title: "Success",
        description: "Job Description saved as draft"
      });
      resetForm();
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Error",
        description: "Failed to save draft",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Job Basics Section */}
      <Card>
        <CardHeader>
          <CardTitle>Job Basics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="job_title">Job Title *</Label>
              <Input
                id="job_title"
                value={formData.job_title || ''}
                onChange={(e) => handleInputChange('job_title', e.target.value)}
                placeholder="e.g. Senior React Developer"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Input
                id="department"
                value={formData.department || ''}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder="e.g. Engineering"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_unit">Business Unit</Label>
              <Input
                id="business_unit"
                value={formData.business_unit || ''}
                onChange={(e) => handleInputChange('business_unit', e.target.value)}
                placeholder="e.g. Digital Solutions"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Work Location (City)</Label>
              <Input
                id="city"
                value={formData.work_location?.city || ''}
                onChange={(e) => handleWorkLocationChange('city', e.target.value)}
                placeholder="e.g. New York"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="work_mode">Work Mode</Label>
              <Select 
                value={formData.work_location?.mode || 'Onsite'} 
                onValueChange={(value: 'Onsite' | 'Remote' | 'Hybrid') => handleWorkLocationChange('mode', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Onsite">Onsite</SelectItem>
                  <SelectItem value="Remote">Remote</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="is_internal">Position Type</Label>
              <Select 
                value={formData.is_internal ? 'internal' : 'external'} 
                onValueChange={(value) => handleInputChange('is_internal', value === 'internal')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Internal</SelectItem>
                  <SelectItem value="external">External (Client)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Client Name</Label>
              <Select
                value={selectedClientId}
                onValueChange={(clientId) => {
                  setSelectedClientId(clientId);
                  const client = clients.find(c => c.id === clientId);
                  handleInputChange('client_name', client?.name || '');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Account Name</Label>
              <Select
                value={selectedAccountId}
                onValueChange={(accountId) => {
                  setSelectedAccountId(accountId);
                  const account = accounts.find(a => a.id === accountId);
                  handleInputChange('account_name', account?.name || '');
                }}
                disabled={!selectedClientId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedClientId ? "Select account..." : "Select client first"} />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Project Name</Label>
              <Select
                value={formData.project_name || ''}
                onValueChange={(projectName) => handleInputChange('project_name', projectName)}
                disabled={!selectedClientId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedClientId ? "Select project..." : "Select client first"} />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.name}>{project.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Details Section */}
      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="short_summary">Short Summary</Label>
            <Textarea
              id="short_summary"
              value={formData.short_summary || ''}
              onChange={(e) => handleInputChange('short_summary', e.target.value)}
              placeholder="Brief description of the role..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Responsibilities</Label>
            {responsibilities.map((resp, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={resp}
                  onChange={(e) => updateResponsibility(index, e.target.value)}
                  placeholder="e.g. Lead development of new features"
                />
                {responsibilities.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeResponsibility(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addResponsibility}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Responsibility
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Must-Have Skills</Label>
            {mustHaveSkills.map((skill, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={skill}
                  onChange={(e) => updateMustHaveSkill(index, e.target.value)}
                  placeholder="e.g. React, TypeScript"
                />
                {mustHaveSkills.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMustHaveSkill(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addMustHaveSkill}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Good-to-Have Skills</Label>
            {goodToHaveSkills.map((skill, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={skill}
                  onChange={(e) => updateGoodToHaveSkill(index, e.target.value)}
                  placeholder="e.g. GraphQL, AWS"
                />
                {goodToHaveSkills.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeGoodToHaveSkill(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addGoodToHaveSkill}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Experience & Requirements Section */}
      <Card>
        <CardHeader>
          <CardTitle>Experience & Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experience_min">Min Experience (years)</Label>
              <Input
                id="experience_min"
                type="number"
                min="0"
                value={formData.experience_min || 0}
                onChange={(e) => handleInputChange('experience_min', parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience_max">Max Experience (years)</Label>
              <Input
                id="experience_max"
                type="number"
                min="0"
                value={formData.experience_max || 0}
                onChange={(e) => handleInputChange('experience_max', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Other Details Section */}
      <Card>
        <CardHeader>
          <CardTitle>Other Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="positions">Number of Positions</Label>
              <Input
                id="positions"
                type="number"
                min="1"
                value={formData.positions || 1}
                onChange={(e) => handleInputChange('positions', parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={formData.priority || 'Normal'} 
                onValueChange={(value: 'Critical' | 'High' | 'Normal') => handleInputChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Normal">Normal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Expected Date of Joining</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expectedDOJ ? format(expectedDOJ, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={expectedDOJ}
                    onSelect={setExpectedDOJ}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Resume Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {resumeDeadline ? format(resumeDeadline, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={resumeDeadline}
                    onSelect={setResumeDeadline}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="headcount">Headcount *</Label>
              <Input
                id="headcount"
                type="number"
                min="1"
                value={formData.headcount || 1}
                onChange={(e) => handleInputChange('headcount', parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost_center">Cost Center</Label>
              <Input
                id="cost_center"
                value={formData.cost_center || ''}
                onChange={(e) => handleInputChange('cost_center', e.target.value)}
                placeholder="e.g. Engineering"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Interview Rounds</Label>
            {interviewRounds.map((round, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={round}
                  onChange={(e) => updateInterviewRound(index, e.target.value)}
                  placeholder="e.g. Technical Round with Team Lead"
                />
                {interviewRounds.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeInterviewRound(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addInterviewRound}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Interview Round
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pay and Billing Details Section */}
      <Card>
        <CardHeader>
          <CardTitle>Pay and Billing Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="job_type">Job Type</Label>
              <Select value={jobType} onValueChange={(value: JobType) => setJobType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Permanent">Permanent</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="C2H">C2H</SelectItem>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pay_type">Pay Type</Label>
              <Select value={payType} onValueChange={(value: PayType) => setPayType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ctc_min">CTC From ({payType})</Label>
              <Input
                id="ctc_min"
                type="number"
                value={ctcMin}
                onChange={(e) => handleCTCChange('min', e.target.value)}
                placeholder={payType === 'Monthly' ? "e.g. 10000" : "e.g. 120000"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ctc_max">CTC To ({payType})</Label>
              <Input
                id="ctc_max"
                type="number"
                value={ctcMax}
                onChange={(e) => handleCTCChange('max', e.target.value)}
                placeholder={payType === 'Monthly' ? "e.g. 15000" : "e.g. 180000"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="INR">INR</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="opex_capex">OPEX/CAPEX</Label>
              <Select value={formData.opex_capex} onValueChange={(value) => handleInputChange('opex_capex', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEX">OPEX</SelectItem>
                  <SelectItem value="CAPEX">CAPEX</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(jobType === 'Contract' || jobType === 'C2H') && (
            <div className="space-y-2">
              <Label htmlFor="contract_period">Contract Period (months)</Label>
              <Input
                id="contract_period"
                type="number"
                value={contractPeriod}
                onChange={(e) => setContractPeriod(e.target.value)}
                placeholder="e.g. 12"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approver Chain & Target Date */}
      <Card>
        <CardHeader>
          <CardTitle>Approval Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Approver Chain</Label>
            <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px]">
              {approverNames.length > 0 ? (
                approverNames.map((name, idx) => (
                  <Badge key={idx} variant="secondary">
                    Step {idx + 1}: {name}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">Loading approvers...</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Target Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {targetDate ? format(targetDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={targetDate}
                  onSelect={setTargetDate}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Business Justification / Additional Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business_justification">Business Justification</Label>
            <Textarea
              id="business_justification"
              value={formData.business_justification || ''}
              onChange={(e) => handleInputChange('business_justification', e.target.value)}
              placeholder="Detailed justification for this position..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional_notes">Additional Notes</Label>
            <Textarea
              id="additional_notes"
              value={formData.additional_notes || ''}
              onChange={(e) => handleInputChange('additional_notes', e.target.value)}
              placeholder="Any additional notes or comments..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleSaveAsDraft} disabled={isSubmitting}>
          Save as Draft
        </Button>
        <Button onClick={handleCreate} disabled={isSubmitting}>
          Create
        </Button>
      </div>
    </div>
  );
}
