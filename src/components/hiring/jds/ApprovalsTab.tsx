import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, CheckCircle, XCircle, Clock, AlertTriangle, FileText, Send } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { JDApproval, JDApprovalStep, ApprovalStatus } from '@/types/approvals';
import { approvalsService } from '@/services/approvalsService';
import { toast } from '@/hooks/use-toast';

interface ApprovalsTabProps {
  jdId: string;
}

export function ApprovalsTab({ jdId }: ApprovalsTabProps) {
  const [approval, setApproval] = useState<JDApproval | null>(null);
  const [approvalSteps, setApprovalSteps] = useState<JDApprovalStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    headcount: '',
    is_replacement: false,
    replacement_for: '',
    cost_center: '',
    project_name: '',
    client_name: '',
    salary_band_min: '',
    salary_band_max: '',
    currency: 'USD',
    opex_capex: '',
    business_justification: '',
    target_first_submission_days: '',
    target_doj: undefined as Date | undefined,
  });

  useEffect(() => {
    loadApprovalData();
  }, [jdId]);

  const loadApprovalData = async () => {
    try {
      setLoading(true);
      const approvalData = await approvalsService.getJDApproval(jdId);
      setApproval(approvalData);

      if (approvalData) {
        setApprovalSteps(await approvalsService.getApprovalSteps(approvalData.id));
        
        // Populate form with existing data
        setFormData({
          headcount: approvalData.headcount?.toString() || '',
          is_replacement: approvalData.is_replacement || false,
          replacement_for: approvalData.replacement_for || '',
          cost_center: approvalData.cost_center || '',
          project_name: approvalData.project_name || '',
          client_name: approvalData.client_name || '',
          salary_band_min: approvalData.salary_band_min?.toString() || '',
          salary_band_max: approvalData.salary_band_max?.toString() || '',
          currency: approvalData.currency || 'USD',
          opex_capex: approvalData.opex_capex || '',
          business_justification: approvalData.business_justification || '',
          target_first_submission_days: approvalData.target_first_submission_days?.toString() || '',
          target_doj: approvalData.target_doj ? new Date(approvalData.target_doj) : undefined,
        });
      }
    } catch (error) {
      console.error('Error loading approval data:', error);
      toast({
        title: "Error",
        description: "Failed to load approval data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForApproval = async () => {
    try {
      setSubmitting(true);
      
      const approvalData = {
        headcount: formData.headcount ? parseInt(formData.headcount) : undefined,
        is_replacement: formData.is_replacement,
        replacement_for: formData.replacement_for,
        cost_center: formData.cost_center,
        project_name: formData.project_name,
        client_name: formData.client_name,
        salary_band_min: formData.salary_band_min ? parseFloat(formData.salary_band_min) : undefined,
        salary_band_max: formData.salary_band_max ? parseFloat(formData.salary_band_max) : undefined,
        currency: formData.currency,
        opex_capex: formData.opex_capex,
        business_justification: formData.business_justification,
        target_first_submission_days: formData.target_first_submission_days ? parseInt(formData.target_first_submission_days) : undefined,
        target_doj: formData.target_doj ? format(formData.target_doj, 'yyyy-MM-dd') : undefined,
      };

      const result = await approvalsService.submitForApproval(jdId, approvalData);
      setApproval(result);
      setApprovalSteps(await approvalsService.getApprovalSteps(result.id));
      
      toast({
        title: "Success",
        description: "JD submitted for approval successfully"
      });
    } catch (error) {
      console.error('Error submitting for approval:', error);
      toast({
        title: "Error",
        description: "Failed to submit for approval",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
      draft: { color: 'secondary', icon: FileText, label: 'Draft' },
      Draft: { color: 'secondary', icon: FileText, label: 'Draft' },
      submitted: { color: 'warning', icon: Clock, label: 'Submitted' },
      Active: { color: 'success', icon: CheckCircle, label: 'Active' },
      approved: { color: 'success', icon: CheckCircle, label: 'Approved' },
      rejected: { color: 'destructive', icon: XCircle, label: 'Rejected' },
      on_hold: { color: 'secondary', icon: AlertTriangle, label: 'On Hold' },
      'On Hold': { color: 'secondary', icon: AlertTriangle, label: 'On Hold' },
      changes_requested: { color: 'warning', icon: AlertTriangle, label: 'Changes Requested' },
      Closed: { color: 'default', icon: CheckCircle, label: 'Closed' },
      Cancelled: { color: 'destructive', icon: XCircle, label: 'Cancelled' },
      'Target Date Expired': { color: 'warning', icon: AlertTriangle, label: 'Target Date Expired' }
    };

    const config = statusConfig[status] || { color: 'secondary', icon: FileText, label: status };
    const Icon = config.icon;

    return (
      <Badge variant={config.color as any} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading approval data...</p>
        </div>
      </div>
    );
  }

  const canEdit = !approval || approval.status === 'draft' || approval.status === 'changes_requested';
  const isSubmitted = approval && approval.status !== 'draft';

  return (
    <div className="space-y-6">
      {/* Status Header */}
      {approval && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                Approval Status
                {getStatusBadge(approval.status)}
              </CardTitle>
              {approval.submitted_at && (
                <p className="text-sm text-muted-foreground">
                  Submitted: {format(new Date(approval.submitted_at), 'PPp')}
                </p>
              )}
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Requisition Block */}
      <Card>
        <CardHeader>
          <CardTitle>Requisition Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="headcount">Headcount *</Label>
              <Input
                id="headcount"
                type="number"
                value={formData.headcount}
                onChange={(e) => setFormData({ ...formData, headcount: e.target.value })}
                disabled={!canEdit}
                placeholder="Enter headcount"
              />
            </div>

            <div className="space-y-2">
              <Label>Position Type</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_replacement}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_replacement: checked })}
                  disabled={!canEdit}
                />
                <Label>{formData.is_replacement ? 'Replacement' : 'New Position'}</Label>
              </div>
            </div>

            {formData.is_replacement && (
              <div className="space-y-2">
                <Label htmlFor="replacement_for">Replacement For/Position ID</Label>
                <Input
                  id="replacement_for"
                  value={formData.replacement_for}
                  onChange={(e) => setFormData({ ...formData, replacement_for: e.target.value })}
                  disabled={!canEdit}
                  placeholder="Enter position ID or name"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="cost_center">Cost Center</Label>
              <Input
                id="cost_center"
                value={formData.cost_center}
                onChange={(e) => setFormData({ ...formData, cost_center: e.target.value })}
                disabled={!canEdit}
                placeholder="Enter cost center"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project_name">Project</Label>
              <Input
                id="project_name"
                value={formData.project_name}
                onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                disabled={!canEdit}
                placeholder="Enter project name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_name">Client</Label>
              <Input
                id="client_name"
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                disabled={!canEdit}
                placeholder="Enter client name"
              />
            </div>

            <div className="space-y-2">
              <Label>Salary Band</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={formData.salary_band_min}
                  onChange={(e) => setFormData({ ...formData, salary_band_min: e.target.value })}
                  disabled={!canEdit}
                  placeholder="Min"
                />
                <span>-</span>
                <Input
                  type="number"
                  value={formData.salary_band_max}
                  onChange={(e) => setFormData({ ...formData, salary_band_max: e.target.value })}
                  disabled={!canEdit}
                  placeholder="Max"
                />
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  disabled={!canEdit}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="INR">INR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="opex_capex">OPEX/CAPEX</Label>
              <Select
                value={formData.opex_capex}
                onValueChange={(value) => setFormData({ ...formData, opex_capex: value })}
                disabled={!canEdit}
              >
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
              <Label htmlFor="target_first_submission_days">Target First Submission (Days)</Label>
              <Input
                id="target_first_submission_days"
                type="number"
                value={formData.target_first_submission_days}
                onChange={(e) => setFormData({ ...formData, target_first_submission_days: e.target.value })}
                disabled={!canEdit}
                placeholder="Enter days"
              />
            </div>

            <div className="space-y-2">
              <Label>Target DOJ</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.target_doj && "text-muted-foreground"
                    )}
                    disabled={!canEdit}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.target_doj ? format(formData.target_doj, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.target_doj}
                    onSelect={(date) => setFormData({ ...formData, target_doj: date })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_justification">Business Justification *</Label>
            <Textarea
              id="business_justification"
              value={formData.business_justification}
              onChange={(e) => setFormData({ ...formData, business_justification: e.target.value })}
              disabled={!canEdit}
              placeholder="Enter business justification for this requisition..."
              rows={4}
            />
          </div>

          {canEdit && (
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmitForApproval}
                disabled={submitting}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {submitting ? 'Submitting...' : 'Submit for Approval'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Chain */}
      {isSubmitted && (
        <Card>
          <CardHeader>
            <CardTitle>Approval Chain</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {approvalSteps.map((step, index) => (
                <div key={step.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                      step.status === 'approved' && "bg-green-100 text-green-800",
                      step.status === 'rejected' && "bg-red-100 text-red-800",
                      step.status === 'pending' && "bg-yellow-100 text-yellow-800",
                      step.status === 'changes_requested' && "bg-orange-100 text-orange-800"
                    )}>
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{step.approver_role || 'Approver'}</p>
                      <Badge variant={
                        step.status === 'approved' ? 'default' :
                        step.status === 'rejected' ? 'destructive' :
                        step.status === 'pending' ? 'secondary' : 'secondary'
                      }>
                        {step.status}
                      </Badge>
                    </div>
                    {step.comments && (
                      <p className="text-sm text-muted-foreground">{step.comments}</p>
                    )}
                    {step.assigned_at && (
                      <p className="text-xs text-muted-foreground">
                        Assigned: {format(new Date(step.assigned_at), 'PPp')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}