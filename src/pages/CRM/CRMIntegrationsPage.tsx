import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Mail, Calendar, Slack, Linkedin, MessageSquare, FileText, 
  Zap, Settings, Clock, Users, CheckCircle, AlertTriangle,
  Plus, ExternalLink, Webhook, Database, Cloud, Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CRMIntegrationsPage() {
  const [integrations, setIntegrations] = useState([
    {
      id: 'email',
      name: 'Email Sync',
      description: 'Sync emails with Gmail, Outlook, and other providers',
      icon: Mail,
      enabled: true,
      status: 'Connected',
      lastSync: '2 minutes ago',
      config: { provider: 'Gmail', account: 'sales@company.com' }
    },
    {
      id: 'calendar',
      name: 'Calendar Integration',
      description: 'Sync meetings and appointments',
      icon: Calendar,
      enabled: true,
      status: 'Connected',
      lastSync: '5 minutes ago',
      config: { provider: 'Google Calendar', calendar: 'Primary' }
    },
    {
      id: 'slack',
      name: 'Slack Notifications',
      description: 'Get CRM updates in Slack channels',
      icon: Slack,
      enabled: false,
      status: 'Not Connected',
      lastSync: 'Never',
      config: {}
    },
    {
      id: 'linkedin',
      name: 'LinkedIn Sales Navigator',
      description: 'Import leads and contact information',
      icon: Linkedin,
      enabled: true,
      status: 'Connected',
      lastSync: '1 hour ago',
      config: { account: 'Premium Account' }
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      description: 'Send messages and track conversations',
      icon: MessageSquare,
      enabled: false,
      status: 'Setup Required',
      lastSync: 'Never',
      config: {}
    },
    {
      id: 'sharepoint',
      name: 'SharePoint Documents',
      description: 'Sync documents and contracts',
      icon: FileText,
      enabled: true,
      status: 'Connected',
      lastSync: '30 minutes ago',
      config: { site: 'company.sharepoint.com' }
    }
  ]);

  const [workflows, setWorkflows] = useState([
    {
      id: 'follow-up',
      name: 'Automatic Follow-ups',
      description: 'Send follow-up emails after 3 days of no contact',
      enabled: true,
      trigger: 'No interaction for 3 days',
      action: 'Send follow-up email template',
      executed: 15
    },
    {
      id: 'lead-scoring',
      name: 'Lead Scoring',
      description: 'Automatically score leads based on engagement',
      enabled: true,
      trigger: 'New interaction logged',
      action: 'Update engagement score',
      executed: 42
    },
    {
      id: 'contract-alerts',
      name: 'Contract Renewal Alerts',
      description: 'Alert team 30 days before contract expiration',
      enabled: true,
      trigger: '30 days before contract expiry',
      action: 'Notify account manager',
      executed: 8
    },
    {
      id: 'task-assignment',
      name: 'Smart Task Assignment',
      description: 'Auto-assign tasks based on workload and expertise',
      enabled: false,
      trigger: 'New opportunity created',
      action: 'Assign to best available team member',
      executed: 0
    }
  ]);

  const [showAddIntegration, setShowAddIntegration] = useState(false);
  const { toast } = useToast();

  const toggleIntegration = (id: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === id 
        ? { ...integration, enabled: !integration.enabled }
        : integration
    ));
    toast({
      title: "Integration Updated",
      description: "Integration settings have been saved."
    });
  };

  const toggleWorkflow = (id: string) => {
    setWorkflows(prev => prev.map(workflow => 
      workflow.id === id 
        ? { ...workflow, enabled: !workflow.enabled }
        : workflow
    ));
    toast({
      title: "Workflow Updated",
      description: "Automation workflow has been updated."
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Connected':
        return <Badge className="bg-green-600">Connected</Badge>;
      case 'Not Connected':
        return <Badge variant="secondary">Not Connected</Badge>;
      case 'Setup Required':
        return <Badge variant="destructive">Setup Required</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrations & Automation"
        description="Connect external services and automate your CRM workflows"
      />

      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Connected Services</h3>
              <p className="text-muted-foreground">Manage your external integrations</p>
            </div>
            <Dialog open={showAddIntegration} onOpenChange={setShowAddIntegration}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Integration
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Integration</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-20 flex-col">
                      <Database className="h-6 w-6 mb-2" />
                      Salesforce
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Cloud className="h-6 w-6 mb-2" />
                      HubSpot
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Webhook className="h-6 w-6 mb-2" />
                      Zapier
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Shield className="h-6 w-6 mb-2" />
                      Microsoft 365
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration) => {
              const IconComponent = integration.icon;
              return (
                <Card key={integration.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-6 w-6 text-primary" />
                        <div>
                          <CardTitle className="text-base">{integration.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{integration.description}</p>
                        </div>
                      </div>
                      <Switch
                        checked={integration.enabled}
                        onCheckedChange={() => toggleIntegration(integration.id)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Status</span>
                        {getStatusBadge(integration.status)}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Last Sync</span>
                        <span className="text-sm text-muted-foreground">{integration.lastSync}</span>
                      </div>
                      {Object.keys(integration.config).length > 0 && (
                        <div className="pt-2 border-t">
                          {Object.entries(integration.config).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center text-sm">
                              <span className="capitalize">{key}</span>
                              <span className="text-muted-foreground">{value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <Button variant="outline" size="sm" className="w-full">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Workflow Automation</h3>
              <p className="text-muted-foreground">Automate repetitive tasks and processes</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {workflows.map((workflow) => (
              <Card key={workflow.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Zap className="h-5 w-5 text-orange-600" />
                      <div>
                        <CardTitle className="text-base">{workflow.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{workflow.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={workflow.enabled}
                      onCheckedChange={() => toggleWorkflow(workflow.id)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Trigger:</span>
                        <span>{workflow.trigger}</span>
                      </div>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Action:</span>
                        <span>{workflow.action}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm">Executions this month</span>
                      <Badge variant="outline">{workflow.executed}</Badge>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Workflow
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Workflow Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Workflow Templates</CardTitle>
              <p className="text-sm text-muted-foreground">
                Quick start with pre-built automation templates
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">Welcome Sequence</h4>
                  <p className="text-sm text-muted-foreground">Send welcome emails to new clients</p>
                  <Button variant="outline" size="sm" className="mt-2">Use Template</Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">Meeting Reminders</h4>
                  <p className="text-sm text-muted-foreground">Automatic meeting confirmations</p>
                  <Button variant="outline" size="sm" className="mt-2">Use Template</Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">Quote Follow-up</h4>
                  <p className="text-sm text-muted-foreground">Follow up on pending quotes</p>
                  <Button variant="outline" size="sm" className="mt-2">Use Template</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive email alerts for important events</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Real-time Sync</Label>
                    <p className="text-sm text-muted-foreground">Sync data in real-time across all integrations</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Auto-backup</Label>
                    <p className="text-sm text-muted-foreground">Automatically backup CRM data daily</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t">
                <Label className="text-base">API Configuration</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="api-endpoint">API Endpoint</Label>
                    <Input id="api-endpoint" value="https://api.company.com/crm" readOnly />
                  </div>
                  <div>
                    <Label htmlFor="api-version">API Version</Label>
                    <Input id="api-version" value="v2.1" readOnly />
                  </div>
                </div>
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View API Documentation
                </Button>
              </div>

              <div className="space-y-4 pt-6 border-t">
                <Label className="text-base">Data Retention</Label>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Interaction logs</span>
                    <span className="text-sm text-muted-foreground">2 years</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Email history</span>
                    <span className="text-sm text-muted-foreground">5 years</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Document storage</span>
                    <span className="text-sm text-muted-foreground">Unlimited</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                <div>
                  <p className="font-medium">Reset All Integrations</p>
                  <p className="text-sm text-muted-foreground">Disconnect all integrations and reset configurations</p>
                </div>
                <Button variant="destructive" size="sm">Reset</Button>
              </div>
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                <div>
                  <p className="font-medium">Clear Automation History</p>
                  <p className="text-sm text-muted-foreground">Remove all automation execution logs</p>
                </div>
                <Button variant="destructive" size="sm">Clear</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}