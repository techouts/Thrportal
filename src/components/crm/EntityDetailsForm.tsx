import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CrmService } from '@/services/crmService';
import { useToast } from '@/hooks/use-toast';
import type { CrmClient, CrmAccount, CrmProject } from '@/types/crm';

interface EntityDetailsFormProps {
  entity: CrmClient | CrmAccount | CrmProject;
  entityType: 'client' | 'account' | 'project';
  onSave: () => void;
}

export function EntityDetailsForm({ entity, entityType, onSave }: EntityDetailsFormProps) {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setFormData({ ...entity });
  }, [entity]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      if (entityType === 'client') {
        await CrmService.updateClient(entity.id, formData as Partial<CrmClient>);
      } else if (entityType === 'account') {
        await CrmService.updateAccount(entity.id, formData as Partial<CrmAccount>);
      } else if (entityType === 'project') {
        await CrmService.updateProject(entity.id, formData as Partial<CrmProject>);
      }
      
      toast({ title: 'Success', description: 'Changes saved successfully' });
      onSave();
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error?.message || 'Failed to save changes', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entity Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Name *</Label>
            <Input 
              value={formData.name || ''} 
              onChange={(e) => handleChange('name', e.target.value)}
              className="mt-1" 
            />
          </div>
          
          {entityType !== 'project' && (
            <div>
              <Label>Status</Label>
              <Select 
                value={formData.status || 'Active'}
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  {entityType === 'client' && <SelectItem value="Prospect">Prospect</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          )}

          {entityType === 'project' && (
            <>
              <div>
                <Label>Status</Label>
                <Select 
                  value={formData.status || 'Planned'}
                  onValueChange={(value) => handleChange('status', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planned">Planned</SelectItem>
                    <SelectItem value="In-flight">In-flight</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                    <SelectItem value="On-hold">On-hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select 
                  value={formData.priority || 'Medium'}
                  onValueChange={(value) => handleChange('priority', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {entityType === 'client' && (
            <>
              <div>
                <Label>Industry</Label>
                <Input 
                  value={formData.industry || ''} 
                  onChange={(e) => handleChange('industry', e.target.value)}
                  className="mt-1" 
                />
              </div>
              <div>
                <Label>Location/Region</Label>
                <Input 
                  value={formData.location || ''} 
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="mt-1" 
                />
              </div>
              <div>
                <Label>Domain</Label>
                <Input 
                  value={formData.domain || ''} 
                  onChange={(e) => handleChange('domain', e.target.value)}
                  className="mt-1" 
                />
              </div>
              <div>
                <Label>GST/VAT Number</Label>
                <Input 
                  value={formData.gst_vat || ''} 
                  onChange={(e) => handleChange('gst_vat', e.target.value)}
                  className="mt-1" 
                />
              </div>
              <div>
                <Label>Contract Type</Label>
                <Input 
                  value={formData.contract_type || ''} 
                  onChange={(e) => handleChange('contract_type', e.target.value)}
                  className="mt-1" 
                />
              </div>
            </>
          )}

          {entityType === 'account' && (
            <>
              <div>
                <Label>Account Type</Label>
                <Input 
                  value={formData.type || ''} 
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="mt-1" 
                />
              </div>
              <div>
                <Label>SLA Override</Label>
                <Input 
                  value={formData.sla_override || ''} 
                  onChange={(e) => handleChange('sla_override', e.target.value)}
                  className="mt-1" 
                />
              </div>
            </>
          )}

          <Button 
            onClick={handleSave} 
            disabled={loading || !formData.name}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
