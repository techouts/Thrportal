import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings, Trophy, Shield, Users, Target, Plus, Trash2 } from 'lucide-react';
import { ownershipService } from '@/services/ownershipService';
import { OwnershipRules, CreditRules, DedupeConfig, SubmissionCapConfig, OpenPoolConfig } from '@/types/ownership';
import { useToast } from '@/hooks/use-toast';

export function OwnershipSettingsTab() {
  const [rules, setRules] = useState<OwnershipRules | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadOwnershipRules();
  }, []);

  const loadOwnershipRules = async () => {
    setLoading(true);
    try {
      const data = await ownershipService.getOwnershipRules();
      setRules(data);
    } catch (error) {
      console.error('Failed to load ownership rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!rules) return;
    
    setSaving(true);
    try {
      // Mock save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({ title: "Settings Saved", description: "Ownership rules updated successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const updateCreditRules = (updates: Partial<CreditRules>) => {
    if (!rules) return;
    setRules({
      ...rules,
      creditRules: { ...rules.creditRules, ...updates }
    });
  };

  const updateDedupeConfig = (updates: Partial<DedupeConfig>) => {
    if (!rules) return;
    setRules({
      ...rules,
      dedupeKeys: { ...rules.dedupeKeys, ...updates }
    });
  };

  const updateSubmissionCaps = (updates: Partial<SubmissionCapConfig>) => {
    if (!rules) return;
    setRules({
      ...rules,
      submissionCaps: { ...rules.submissionCaps, ...updates }
    });
  };

  const updateOpenPoolDefaults = (updates: Partial<OpenPoolConfig>) => {
    if (!rules) return;
    setRules({
      ...rules,
      openPoolDefaults: { ...rules.openPoolDefaults, ...updates }
    });
  };

  const addCustomScheme = () => {
    if (!rules) return;
    const newScheme = {
      name: 'New Scheme',
      submitterCredit: 1.0,
      primaryCredit: 0.25,
      conditions: ''
    };
    updateCreditRules({
      customSchemes: [...rules.creditRules.customSchemes, newScheme]
    });
  };

  const removeCustomScheme = (index: number) => {
    if (!rules) return;
    const schemes = [...rules.creditRules.customSchemes];
    schemes.splice(index, 1);
    updateCreditRules({ customSchemes: schemes });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!rules) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Settings className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Failed to load ownership rules</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Ownership Rules Configuration
            </CardTitle>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="credit-rules" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="credit-rules">Credit Rules</TabsTrigger>
              <TabsTrigger value="dedupe-keys">Dedupe Keys</TabsTrigger>
              <TabsTrigger value="submission-caps">Submission Caps</TabsTrigger>
              <TabsTrigger value="open-pool">Open Pool Defaults</TabsTrigger>
            </TabsList>

            <TabsContent value="credit-rules" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Default Credit Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="submitter-credit">Submitter Credit</Label>
                      <Input
                        id="submitter-credit"
                        type="number"
                        step="0.1"
                        value={rules.creditRules.submitterCredit}
                        onChange={(e) => updateCreditRules({ submitterCredit: parseFloat(e.target.value) })}
                      />
                      <p className="text-xs text-muted-foreground">Credit awarded for candidate submission</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="primary-credit">Primary Follow-up Credit</Label>
                      <Input
                        id="primary-credit"
                        type="number"
                        step="0.1"
                        value={rules.creditRules.primaryFollowUpCredit}
                        onChange={(e) => updateCreditRules({ primaryFollowUpCredit: parseFloat(e.target.value) })}
                      />
                      <p className="text-xs text-muted-foreground">Credit awarded for follow-up activities</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Custom Credit Schemes</CardTitle>
                    <Button variant="outline" size="sm" onClick={addCustomScheme}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Scheme
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {rules.creditRules.customSchemes.map((scheme, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <Input
                          placeholder="Scheme name"
                          value={scheme.name}
                          onChange={(e) => {
                            const schemes = [...rules.creditRules.customSchemes];
                            schemes[index].name = e.target.value;
                            updateCreditRules({ customSchemes: schemes });
                          }}
                        />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeCustomScheme(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Submitter Credit</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={scheme.submitterCredit}
                            onChange={(e) => {
                              const schemes = [...rules.creditRules.customSchemes];
                              schemes[index].submitterCredit = parseFloat(e.target.value);
                              updateCreditRules({ customSchemes: schemes });
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Primary Credit</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={scheme.primaryCredit}
                            onChange={(e) => {
                              const schemes = [...rules.creditRules.customSchemes];
                              schemes[index].primaryCredit = parseFloat(e.target.value);
                              updateCreditRules({ customSchemes: schemes });
                            }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Conditions</Label>
                        <Input
                          placeholder="e.g., Priority = Critical, Client = TechCorp"
                          value={scheme.conditions}
                          onChange={(e) => {
                            const schemes = [...rules.creditRules.customSchemes];
                            schemes[index].conditions = e.target.value;
                            updateCreditRules({ customSchemes: schemes });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dedupe-keys" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Duplicate Detection Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Detection Keys</Label>
                      <div className="flex flex-wrap gap-2">
                        {['email', 'phone', 'resume_hash'].map((key) => (
                          <Badge
                            key={key}
                            variant={rules.dedupeKeys.keys.includes(key as any) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => {
                              const keys = rules.dedupeKeys.keys.includes(key as any)
                                ? rules.dedupeKeys.keys.filter(k => k !== key)
                                : [...rules.dedupeKeys.keys, key as any];
                              updateDedupeConfig({ keys });
                            }}
                          >
                            {key.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">Select which fields to use for duplicate detection</p>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Detection Mode</Label>
                        <Select
                          value={rules.dedupeKeys.mode}
                          onValueChange={(value: 'strict' | 'soft') => updateDedupeConfig({ mode: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="strict">Strict - All keys must match</SelectItem>
                            <SelectItem value="soft">Soft - Any key match triggers warning</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="block-duplicates"
                          checked={rules.dedupeKeys.blockDuplicates}
                          onCheckedChange={(checked) => updateDedupeConfig({ blockDuplicates: checked })}
                        />
                        <Label htmlFor="block-duplicates">Block duplicate submissions</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="submission-caps" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Submission Cap Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="default-cap">Default Daily Cap per Recruiter per JD</Label>
                    <Input
                      id="default-cap"
                      type="number"
                      value={rules.submissionCaps.defaultDailyCap}
                      onChange={(e) => updateSubmissionCaps({ defaultDailyCap: parseInt(e.target.value) })}
                    />
                    <p className="text-xs text-muted-foreground">Maximum submissions per recruiter per JD per day</p>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="enforce-jd-level"
                        checked={rules.submissionCaps.enforceAtJDLevel}
                        onCheckedChange={(checked) => updateSubmissionCaps({ enforceAtJDLevel: checked })}
                      />
                      <Label htmlFor="enforce-jd-level">Enforce at JD level</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="allow-overrides"
                        checked={rules.submissionCaps.allowOverrides}
                        onCheckedChange={(checked) => updateSubmissionCaps({ allowOverrides: checked })}
                      />
                      <Label htmlFor="allow-overrides">Allow staffing manager overrides</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="open-pool" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Open Pool Default Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="default-allow-collaborators"
                      checked={rules.openPoolDefaults.defaultAllowCollaborators}
                      onCheckedChange={(checked) => updateOpenPoolDefaults({ defaultAllowCollaborators: checked })}
                    />
                    <Label htmlFor="default-allow-collaborators">Allow collaborators by default on new JDs</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="require-approval"
                      checked={rules.openPoolDefaults.requireApproval}
                      onCheckedChange={(checked) => updateOpenPoolDefaults({ requireApproval: checked })}
                    />
                    <Label htmlFor="require-approval">Require primary recruiter approval for collaboration requests</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-notify-primary"
                      checked={rules.openPoolDefaults.autoNotifyPrimary}
                      onCheckedChange={(checked) => updateOpenPoolDefaults({ autoNotifyPrimary: checked })}
                    />
                    <Label htmlFor="auto-notify-primary">Auto-notify primary recruiter of collaboration requests</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}