import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { JobDescription, PositionType, Currency, EmploymentType, JDPriority } from '@/types/hiring-extended';
import { hiringExtendedService } from '@/services/hiringExtendedService';
import { useToast } from '@/hooks/use-toast';

export function ManualJDTab() {
  const [formData, setFormData] = useState<Partial<JobDescription>>({
    position_type: 'EXTERNAL',
    currency: 'INR',
    employment_type: 'Full-time',
    priority: 'Normal',
    skills_primary: [],
    skills_secondary: [],
    approval_required: true,
    status: 'Draft',
    jd_source: 'Manual'
  });
  const [newSkill, setNewSkill] = useState('');
  const [skillType, setSkillType] = useState<'primary' | 'secondary'>('primary');
  const { toast } = useToast();

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    
    const skillArray = skillType === 'primary' ? 'skills_primary' : 'skills_secondary';
    const currentSkills = formData[skillArray] || [];
    
    if (!currentSkills.includes(newSkill.trim())) {
      handleInputChange(skillArray, [...currentSkills, newSkill.trim()]);
    }
    setNewSkill('');
  };

  const removeSkill = (skill: string, type: 'primary' | 'secondary') => {
    const skillArray = type === 'primary' ? 'skills_primary' : 'skills_secondary';
    const currentSkills = formData[skillArray] || [];
    handleInputChange(skillArray, currentSkills.filter(s => s !== skill));
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      const requiredFields = ['department', 'business_unit', 'job_title', 'openings', 'recruiter_owner_email', 'hiring_manager_email'];
      const missingFields = requiredFields.filter(field => !formData[field as keyof JobDescription]);
      
      if (missingFields.length > 0) {
        toast({
          title: "Missing Required Fields",
          description: `Please fill in: ${missingFields.join(', ')}`,
          variant: "destructive"
        });
        return;
      }

      // Validate CTC range
      if (formData.min_ctc_annual && formData.max_ctc_annual && formData.min_ctc_annual > formData.max_ctc_annual) {
        toast({
          title: "Invalid CTC Range",
          description: "Minimum CTC cannot be greater than Maximum CTC",
          variant: "destructive"
        });
        return;
      }

      // Set approval path based on position type
      const approval_path = formData.position_type === 'INTERNAL' ? 'INTERNAL' : 'EXTERNAL';
      
      await hiringExtendedService.createJD({
        ...formData,
        approval_path,
        created_by: 'current_user@company.com' // Would come from auth context
      } as Omit<JobDescription, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>);

      toast({
        title: "Success",
        description: "Job Description created successfully"
      });

      // Reset form
      setFormData({
        position_type: 'EXTERNAL',
        currency: 'INR',
        employment_type: 'Full-time',
        priority: 'Normal',
        skills_primary: [],
        skills_secondary: [],
        approval_required: true,
        status: 'Draft',
        jd_source: 'Manual'
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create Job Description",
        variant: "destructive"
      });
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
            <Label htmlFor="business_unit">Business Unit *</Label>
            <Input
              id="business_unit"
              value={formData.business_unit || ''}
              onChange={(e) => handleInputChange('business_unit', e.target.value)}
              placeholder="e.g. Product Development"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="openings">Number of Openings *</Label>
            <Input
              id="openings"
              type="number"
              min="1"
              value={formData.openings || ''}
              onChange={(e) => handleInputChange('openings', parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position_type">Position Type</Label>
            <Select value={formData.position_type} onValueChange={(value) => handleInputChange('position_type', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INTERNAL">Internal</SelectItem>
                <SelectItem value="EXTERNAL">External</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="employment_type">Employment Type</Label>
            <Select value={formData.employment_type} onValueChange={(value) => handleInputChange('employment_type', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="C2H">Contract to Hire</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">INR</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
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
            <Label htmlFor="min_ctc_annual">Min CTC (Annual)</Label>
            <Input
              id="min_ctc_annual"
              type="number"
              value={formData.min_ctc_annual || ''}
              onChange={(e) => handleInputChange('min_ctc_annual', parseInt(e.target.value) || undefined)}
              placeholder="e.g. 1200000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_ctc_annual">Max CTC (Annual)</Label>
            <Input
              id="max_ctc_annual"
              type="number"
              value={formData.max_ctc_annual || ''}
              onChange={(e) => handleInputChange('max_ctc_annual', parseInt(e.target.value) || undefined)}
              placeholder="e.g. 1800000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="min_exp_years">Min Experience (Years)</Label>
            <Input
              id="min_exp_years"
              type="number"
              value={formData.min_exp_years || ''}
              onChange={(e) => handleInputChange('min_exp_years', parseInt(e.target.value) || undefined)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_exp_years">Max Experience (Years)</Label>
            <Input
              id="max_exp_years"
              type="number"
              value={formData.max_exp_years || ''}
              onChange={(e) => handleInputChange('max_exp_years', parseInt(e.target.value) || undefined)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location || ''}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g. Bangalore"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="remote_hybrid">Work Mode</Label>
            <Select value={formData.remote_hybrid} onValueChange={(value) => handleInputChange('remote_hybrid', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Remote">Remote</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
                <SelectItem value="Onsite">Onsite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recruiter_owner_email">Recruiter Owner Email *</Label>
            <Input
              id="recruiter_owner_email"
              type="email"
              value={formData.recruiter_owner_email || ''}
              onChange={(e) => handleInputChange('recruiter_owner_email', e.target.value)}
              placeholder="recruiter@company.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hiring_manager_email">Hiring Manager Email *</Label>
            <Input
              id="hiring_manager_email"
              type="email"
              value={formData.hiring_manager_email || ''}
              onChange={(e) => handleInputChange('hiring_manager_email', e.target.value)}
              placeholder="hm@company.com"
            />
          </div>
        </div>

        {/* Skills Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Add Skills</Label>
            <div className="flex gap-2">
              <Select value={skillType} onValueChange={(value: 'primary' | 'secondary') => setSkillType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primary</SelectItem>
                  <SelectItem value="secondary">Secondary</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Enter skill"
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              />
              <Button onClick={addSkill} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Primary Skills</Label>
            <div className="flex flex-wrap gap-2">
              {(formData.skills_primary || []).map((skill, index) => (
                <Badge key={index} variant="default">
                  {skill}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => removeSkill(skill, 'primary')}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Secondary Skills</Label>
            <div className="flex flex-wrap gap-2">
              {(formData.skills_secondary || []).map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => removeSkill(skill, 'secondary')}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Description Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="job_description">Job Description</Label>
            <Textarea
              id="job_description"
              value={formData.job_description || ''}
              onChange={(e) => handleInputChange('job_description', e.target.value)}
              placeholder="Detailed job description..."
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="must_have">Must Have Requirements</Label>
            <Textarea
              id="must_have"
              value={formData.must_have || ''}
              onChange={(e) => handleInputChange('must_have', e.target.value)}
              placeholder="Essential requirements..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="good_to_have">Good to Have</Label>
            <Textarea
              id="good_to_have"
              value={formData.good_to_have || ''}
              onChange={(e) => handleInputChange('good_to_have', e.target.value)}
              placeholder="Preferred qualifications..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setFormData({ ...formData, status: 'Draft' })}>
            Save as Draft
          </Button>
          <Button onClick={handleSubmit}>
            Create JD
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}