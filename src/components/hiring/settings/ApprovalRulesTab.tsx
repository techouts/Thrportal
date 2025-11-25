import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Settings } from 'lucide-react';
import { ApprovalRule, ApprovalChainStep } from '@/types/approvals';
import { approvalsService } from '@/services/approvalsService';
import { useToast } from '@/hooks/use-toast';

interface RuleForm {
  rule_name: string;
  conditions: {
    client?: string;
    cost_center?: string;
    salary_band_min?: number;
    salary_band_max?: number;
    location?: string;
  };
  approval_chain: ApprovalChainStep[];
}

export function ApprovalRulesTab() {
  const [rules, setRules] = useState<ApprovalRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<ApprovalRule | null>(null);
  const [formData, setFormData] = useState<RuleForm>({
    rule_name: '',
    conditions: {},
    approval_chain: []
  });
  const { toast } = useToast();

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const rulesData = await approvalsService.getApprovalRules();
      setRules(rulesData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load approval rules",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (rule?: ApprovalRule) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        rule_name: rule.rule_name,
        conditions: rule.conditions || {},
        approval_chain: rule.approval_chain || []
      });
    } else {
      setEditingRule(null);
      setFormData({
        rule_name: '',
        conditions: {},
        approval_chain: []
      });
    }
    setShowDialog(true);
  };

  const addApprovalStep = () => {
    const newStep: ApprovalChainStep = {
      step: formData.approval_chain.length + 1,
      role: '',
      sla_hours: 24,
      quorum: 'any'
    };
    setFormData(prev => ({
      ...prev,
      approval_chain: [...prev.approval_chain, newStep]
    }));
  };

  const updateApprovalStep = (index: number, updates: Partial<ApprovalChainStep>) => {
    setFormData(prev => ({
      ...prev,
      approval_chain: prev.approval_chain.map((step, i) => 
        i === index ? { ...step, ...updates } : step
      )
    }));
  };

  const removeApprovalStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      approval_chain: prev.approval_chain
        .filter((_, i) => i !== index)
        .map((step, i) => ({ ...step, step: i + 1 }))
    }));
  };

  const handleSave = async () => {
    try {
      const ruleData = {
        rule_name: formData.rule_name,
        conditions: formData.conditions,
        approval_chain: formData.approval_chain,
        is_active: true
      };

      if (editingRule) {
        // Update existing rule - would need to implement in service
        toast({
          title: "Info",
          description: "Rule update functionality not yet implemented"
        });
      } else {
        // Create new rule - would need to implement in service
        toast({
          title: "Info", 
          description: "Rule creation functionality not yet implemented"
        });
      }

      setShowDialog(false);
      await loadRules();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save rule",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Loading approval rules...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Approval Rules</h3>
          <p className="text-sm text-muted-foreground">
            Configure conditional approval workflows based on JD attributes
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRule ? 'Edit Approval Rule' : 'Create Approval Rule'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="rule_name">Rule Name</Label>
                <Input
                  id="rule_name"
                  value={formData.rule_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, rule_name: e.target.value }))}
                  placeholder="e.g., High Value External JDs"
                />
              </div>

              <div>
                <h4 className="font-medium mb-3">Conditions</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client">Client</Label>
                    <Input
                      id="client"
                      value={formData.conditions.client || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        conditions: { ...prev.conditions, client: e.target.value }
                      }))}
                      placeholder="Client name (optional)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cost_center">Cost Center</Label>
                    <Input
                      id="cost_center"
                      value={formData.conditions.cost_center || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        conditions: { ...prev.conditions, cost_center: e.target.value }
                      }))}
                      placeholder="Cost center (optional)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="salary_min">Min Salary Band</Label>
                    <Input
                      id="salary_min"
                      type="number"
                      value={formData.conditions.salary_band_min || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        conditions: { ...prev.conditions, salary_band_min: Number(e.target.value) }
                      }))}
                      placeholder="Minimum salary"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.conditions.location || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        conditions: { ...prev.conditions, location: e.target.value }
                      }))}
                      placeholder="Location (optional)"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Approval Chain</h4>
                  <Button size="sm" onClick={addApprovalStep}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Step
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {formData.approval_chain.map((step, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-md">
                      <div className="font-medium text-sm w-12">
                        Step {step.step}
                      </div>
                      <div className="flex-1">
                        <Select
                          value={step.role}
                          onValueChange={(value) => updateApprovalStep(index, { role: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="HR_MANAGER">HR Manager</SelectItem>
                            <SelectItem value="STAFFING_MANAGER">Staffing Manager</SelectItem>
                            <SelectItem value="FINANCE_MANAGER">Finance Manager</SelectItem>
                            <SelectItem value="HIRING_MANAGER">Hiring Manager</SelectItem>
                            <SelectItem value="MANAGEMENT">Management</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-24">
                        <Input
                          type="number"
                          value={step.sla_hours}
                          onChange={(e) => updateApprovalStep(index, { sla_hours: Number(e.target.value) })}
                          placeholder="Hours"
                        />
                      </div>
                      <div className="w-20">
                        <Select
                          value={step.quorum}
                          onValueChange={(value: 'any' | 'all') => updateApprovalStep(index, { quorum: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            <SelectItem value="all">All</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeApprovalStep(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {editingRule ? 'Update Rule' : 'Create Rule'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent>
          {rules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No approval rules configured
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rule Name</TableHead>
                    <TableHead>Conditions</TableHead>
                    <TableHead>Steps</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.rule_name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {Object.keys(rule.conditions || {}).length === 0 ? (
                            <span className="text-muted-foreground">No conditions</span>
                          ) : (
                            Object.entries(rule.conditions || {}).map(([key, value]) => (
                              <div key={key}>
                                <span className="font-medium">{key}:</span> {String(value)}
                              </div>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {rule.approval_chain?.length || 0} steps
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenDialog(rule)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              toast({
                                title: "Info",
                                description: "Delete functionality not yet implemented"
                              });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}