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
import { CalendarIcon } from 'lucide-react';
import { approvalsService } from '@/services/approvalsService';
import { useToast } from '@/hooks/use-toast';
import type { CreateJDApproval, JobType, PayType } from '@/types/approvals';

export function ManualJDTab() {
  const [formData, setFormData] = useState<Partial<CreateJDApproval>>({
    currency: 'USD',
    headcount: 1,
    is_replacement: false
  });
  const [approverNames, setApproverNames] = useState<string[]>([]);
  const [targetDate, setTargetDate] = useState<Date | undefined>();
  const [jobType, setJobType] = useState<JobType>('Full-time');
  const [payType, setPayType] = useState<PayType>('Annually');
  const [ctcMin, setCtcMin] = useState<string>('');
  const [ctcMax, setCtcMax] = useState<string>('');
  const [contractPeriod, setContractPeriod] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadApprovers = async () => {
      const names = await approvalsService.getApproverNamesFromChain();
      setApproverNames(names);
    };
    loadApprovers();
  }, []);

  const handleInputChange = (field: keyof CreateJDApproval, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const resetForm = () => {
    setFormData({
      currency: 'USD',
      headcount: 1,
      is_replacement: false
    });
    setTargetDate(undefined);
    setJobType('Full-time');
    setPayType('Annually');
    setCtcMin('');
    setCtcMax('');
    setContractPeriod('');
  };

  const handleCreate = async () => {
    try {
      setIsSubmitting(true);
      
      if (!formData.project_name || !formData.client_name) {
        toast({
          title: "Validation Error",
          description: "Please fill in Project Name and Client Name",
          variant: "destructive"
        });
        return;
      }

      await approvalsService.createJDWithStatus({
        ...formData,
        target_date: targetDate?.toISOString(),
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
        target_date: targetDate?.toISOString(),
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
    <Card>
      <CardHeader>
        <CardTitle>Create Job Description Manually</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="project_name">Project Name *</Label>
            <Input
              id="project_name"
              value={formData.project_name || ''}
              onChange={(e) => handleInputChange('project_name', e.target.value)}
              placeholder="e.g. Senior React Developer"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="client_name">Client Name *</Label>
            <Input
              id="client_name"
              value={formData.client_name || ''}
              onChange={(e) => handleInputChange('client_name', e.target.value)}
              placeholder="e.g. TechCorp"
            />
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
        </div>

        {/* Pay and Billing Details Section */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-lg">Pay and Billing Details</CardTitle>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business_justification">Business Justification</Label>
            <Textarea
              id="business_justification"
              value={formData.business_justification || ''}
              onChange={(e) => handleInputChange('business_justification', e.target.value)}
              placeholder="Detailed justification for this position..."
              rows={6}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleSaveAsDraft} disabled={isSubmitting}>
            Save as Draft
          </Button>
          <Button onClick={handleCreate} disabled={isSubmitting}>
            Create
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
