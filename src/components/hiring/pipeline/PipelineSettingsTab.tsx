import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/shared/DataTable'
import { Settings, Clock, Shield, Bell, Link, FileText } from 'lucide-react'

export function PipelineSettingsTab() {
  const [activeTab, setActiveTab] = useState('sla-mappings')

  // Mock data
  const slaData = [
    { stage: 'Feedback Pending' },
    { stage: 'Interview Schedule' },
    { stage: 'Offer Release' }
  ]

  const permissionData = [
    { role: 'Recruiter' },
    { role: 'Staffing Manager' },
    { role: 'Collaborator' },
    { role: 'HR' },
    { role: 'Leadership' },
    { role: 'Client SPOC' }
  ]

  const auditData = [
    {
      timestamp: '2024-01-15 10:30',
      actor: 'Alice Smith',
      action: 'Status Change',
      target: 'John Doe - Senior React Developer',
      details: 'Interview-R1 → Offer-Released',
      ipAddress: '192.168.1.100'
    },
    {
      timestamp: '2024-01-15 09:15',
      actor: 'Bob Manager',
      action: 'Reminder Sent',
      target: 'TechCorp Inc SPOC',
      details: 'Feedback pending for 3 days',
      ipAddress: '192.168.1.101'
    }
  ]

  // Column definitions
  const slaColumns = [
    { id: 'stage', header: 'Stage', accessor: 'stage' as keyof { stage: string } },
    { 
      id: 'actions', 
      header: 'Actions',
      accessor: () => '',
      cell: () => (
        <div className="flex items-center gap-2">
          <Input 
            type="number" 
            defaultValue="48" 
            className="w-20 h-8" 
            placeholder="Hours"
          />
          <Button variant="outline" size="sm">Save</Button>
        </div>
      )
    }
  ]

  const permissionColumns = [
    { id: 'role', header: 'Role', accessor: 'role' as keyof { role: string } },
    { 
      id: 'permissions', 
      header: 'Permissions',
      accessor: () => '',
      cell: () => (
        <div className="flex items-center gap-2">
          <Badge variant="outline">View</Badge>
          <Badge variant="outline">Edit Own</Badge>
          <Button variant="outline" size="sm">Configure</Button>
        </div>
      )
    }
  ]

  const auditColumns = [
    { id: 'timestamp', header: 'Timestamp', accessor: 'timestamp' as keyof typeof auditData[0] },
    { id: 'actor', header: 'Actor', accessor: 'actor' as keyof typeof auditData[0] },
    { id: 'action', header: 'Action', accessor: 'action' as keyof typeof auditData[0] },
    { id: 'target', header: 'Target', accessor: 'target' as keyof typeof auditData[0] },
    { id: 'details', header: 'Details', accessor: 'details' as keyof typeof auditData[0] },
    { id: 'ipAddress', header: 'IP Address', accessor: 'ipAddress' as keyof typeof auditData[0] }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Pipeline Settings</h2>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Save All Changes
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="sla-mappings">SLA Mappings</TabsTrigger>
          <TabsTrigger value="status-controls">Status Controls</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="sla-mappings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                SLA Timer Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-sm text-muted-foreground">
                  Configure SLA timers for different application stages. You can set defaults and override for specific clients or JDs.
                </div>
                
                <DataTable
                  columns={slaColumns}
                  data={slaData}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Default SLA Rules</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Enforce required rounds from JD Interview Plan</Label>
                        <Switch />
                      </div>
                      <div className="space-y-2">
                        <Label>Auto-escalate overdue items</Label>
                        <Switch defaultChecked />
                      </div>
                      <div className="space-y-2">
                        <Label>Send daily SLA reminders</Label>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Client Overrides</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>TechCorp Inc - Feedback SLA</Label>
                        <Input type="number" defaultValue="72" placeholder="Hours" />
                      </div>
                      <div className="space-y-2">
                        <Label>CloudTech - Interview Schedule SLA</Label>
                        <Input type="number" defaultValue="24" placeholder="Hours" />
                      </div>
                      <Button variant="outline" size="sm">Add Override</Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status-controls">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Status Control Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-sm text-muted-foreground">
                  Configure who can update application statuses and under what conditions.
                </div>
                
                <DataTable
                  columns={permissionColumns}
                  data={permissionData}
                />
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Global Rules</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Require approval for offer release</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="space-y-2">
                      <Label>Allow status override with reason</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="space-y-2">
                      <Label>Block actions on unapproved JDs</Label>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reminders">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Reminder Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Cadence Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Daily reminders for overdue items</Label>
                        <Switch defaultChecked />
                      </div>
                      <div className="space-y-2">
                        <Label>Weekly digest for managers</Label>
                        <Switch defaultChecked />
                      </div>
                      <div className="space-y-2">
                        <Label>Monthly summary for leadership</Label>
                        <Switch />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Channel Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Email notifications</Label>
                        <Switch defaultChecked />
                      </div>
                      <div className="space-y-2">
                        <Label>WhatsApp notifications</Label>
                        <Switch />
                      </div>
                      <div className="space-y-2">
                        <Label>Slack notifications</Label>
                        <Switch />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Template Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>SLA Breach Reminder Template</Label>
                      <Input defaultValue="Action required: {{candidateName}} - {{jdTitle}} is overdue for {{stage}}" />
                    </div>
                    <div className="space-y-2">
                      <Label>Daily Digest Template</Label>
                      <Input defaultValue="Daily Pipeline Summary - {{overdueCount}} items need attention" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Integration Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Module Integrations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Ownership sync enabled</Label>
                        <Switch defaultChecked />
                        <div className="text-xs text-muted-foreground">
                          Honor Primary + Collaborators from Ownership module
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Applications sync enabled</Label>
                        <Switch defaultChecked />
                        <div className="text-xs text-muted-foreground">
                          Bi-directional updates with Applications module
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>JD Approval gating enabled</Label>
                        <Switch defaultChecked />
                        <div className="text-xs text-muted-foreground">
                          Block pipeline actions for unapproved JDs
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">External Integrations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Email provider (SMTP)</Label>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-green-600">Connected</Badge>
                          <Button variant="outline" size="sm">Configure</Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>WhatsApp Business API</Label>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-red-600">Disconnected</Badge>
                          <Button variant="outline" size="sm">Setup</Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Slack Workspace</Label>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-green-600">Connected</Badge>
                          <Button variant="outline" size="sm">Configure</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-sm text-muted-foreground">
                  View all pipeline actions including status changes, reminders, and escalations.
                </div>
                
                <DataTable
                  columns={auditColumns}
                  data={auditData}
                  searchable={true}
                  exportable={true}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}