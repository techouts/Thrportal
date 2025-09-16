import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/shared/DataTable'
import { Settings, Clock, Shield, Bell, Link, History } from 'lucide-react'
import { pipelineService } from '@/services/pipelineService'
import { PipelineSettings, ApplicationStatus } from '@/types/pipeline'

export function PipelineSettingsTab() {
  const [settings, setSettings] = useState<PipelineSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const data = await pipelineService.getPipelineSettings()
      setSettings(data)
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    if (!settings) return
    
    try {
      setSaving(true)
      await pipelineService.updatePipelineSettings(settings)
      console.log('Settings saved successfully')
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateSLATimer = (stage: string, field: string, value: any) => {
    if (!settings) return
    
    setSettings(prev => ({
      ...prev!,
      slaTimers: {
        ...prev!.slaTimers,
        [stage]: {
          ...prev!.slaTimers[stage],
          [field]: value
        }
      }
    }))
  }

  const updateStatusPermission = (role: string, field: string, value: any) => {
    if (!settings) return
    
    setSettings(prev => ({
      ...prev!,
      statusPermissions: {
        ...prev!.statusPermissions,
        [role]: {
          ...prev!.statusPermissions[role],
          [field]: value
        }
      }
    }))
  }

  const updateReminderSettings = (field: string, value: any) => {
    if (!settings) return
    
    setSettings(prev => ({
      ...prev!,
      reminderSettings: {
        ...prev!.reminderSettings,
        [field]: value
      }
    }))
  }

  const updateIntegrationSettings = (field: string, value: boolean) => {
    if (!settings) return
    
    setSettings(prev => ({
      ...prev!,
      integrationSettings: {
        ...prev!.integrationSettings,
        [field]: value
      }
    }))
  }

  if (loading || !settings) {
    return <div className="flex items-center justify-center h-96">Loading pipeline settings...</div>
  }

  const slaColumns = [
    {
      accessorKey: 'stage',
      header: 'Stage',
    },
    {
      accessorKey: 'defaultHours',
      header: 'Default Hours',
      cell: ({ row }: any) => (
        <Input
          type="number"
          value={settings.slaTimers[row.original.stage]?.defaultHours || 24}
          onChange={(e) => updateSLATimer(row.original.stage, 'defaultHours', parseInt(e.target.value))}
          className="w-24"
        />
      )
    },
    {
      accessorKey: 'clientOverrides',
      header: 'Client Overrides',
      cell: ({ row }: any) => (
        <Badge variant="outline">
          {Object.keys(settings.slaTimers[row.original.stage]?.clientOverrides || {}).length} clients
        </Badge>
      )
    },
    {
      accessorKey: 'jdOverrides',
      header: 'JD Overrides',
      cell: ({ row }: any) => (
        <Badge variant="outline">
          {Object.keys(settings.slaTimers[row.original.stage]?.jdOverrides || {}).length} JDs
        </Badge>
      )
    }
  ]

  const slaData = [
    { stage: 'feedback' },
    { stage: 'interview-schedule' },
    { stage: 'offer-release' }
  ]

  const permissionColumns = [
    {
      accessorKey: 'role',
      header: 'Role',
    },
    {
      accessorKey: 'canUpdate',
      header: 'Can Update Statuses',
      cell: ({ row }: any) => (
        <div className="space-y-1">
          {(settings.statusPermissions[row.original.role]?.canUpdate || []).map((status: ApplicationStatus) => (
            <Badge key={status} variant="outline" className="mr-1 text-xs">
              {status}
            </Badge>
          ))}
        </div>
      )
    },
    {
      accessorKey: 'canOverride',
      header: 'Can Override',
      cell: ({ row }: any) => (
        <Switch
          checked={settings.statusPermissions[row.original.role]?.canOverride || false}
          onCheckedChange={(checked) => updateStatusPermission(row.original.role, 'canOverride', checked)}
        />
      )
    }
  ]

  const permissionData = [
    { role: 'recruiter' },
    { role: 'manager' },
    { role: 'hr' },
    { role: 'leadership' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Pipeline Settings</h2>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <Tabs defaultValue="sla-mappings" className="space-y-6">
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
                SLA Timer Mappings
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
                        <Label>Allow manager override with reason</Label>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Escalation Rules</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Auto-escalate after SLA breach</Label>
                        <Switch />
                      </div>
                      <div className="space-y-2">
                        <Label>Escalation delay (hours)</Label>
                        <Input type="number" defaultValue="4" />
                      </div>
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
                  Configure who can change application statuses. Recruiters can only change status when they are Primary on that JD/candidate.
                </div>
                
                <DataTable
                  columns={permissionColumns}
                  data={permissionData}
                />
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Special Rules</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Block pipeline actions for non-approved JDs</Label>
                      <Switch 
                        checked={settings.integrationSettings.approvalGatingEnabled}
                        onCheckedChange={(checked) => updateIntegrationSettings('approvalGatingEnabled', checked)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Require comment for status changes</Label>
                      <Switch />
                    </div>
                    <div className="space-y-2">
                      <Label>Allow client SPOC feedback submission</Label>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Reminder Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Cadence</Label>
                      <Select 
                        value={settings.reminderSettings.cadence}
                        onValueChange={(value: any) => updateReminderSettings('cadence', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Channels</Label>
                      <div className="space-y-2">
                        {['email', 'whatsapp', 'slack'].map((channel) => (
                          <div key={channel} className="flex items-center space-x-2">
                            <Switch 
                              checked={settings.reminderSettings.channels.includes(channel as any)}
                              onCheckedChange={(checked) => {
                                const newChannels = checked 
                                  ? [...settings.reminderSettings.channels, channel as any]
                                  : settings.reminderSettings.channels.filter(c => c !== channel)
                                updateReminderSettings('channels', newChannels)
                              }}
                            />
                            <Label className="capitalize">{channel}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Digest Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Daily digests for Managers</Label>
                      <Switch 
                        checked={settings.reminderSettings.digestEnabled}
                        onCheckedChange={(checked) => updateReminderSettings('digestEnabled', checked)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Weekly summaries for Leadership</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="space-y-2">
                      <Label>Digest send time</Label>
                      <Input type="time" defaultValue="09:00" />
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Module Integrations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Ownership Module Sync</Label>
                        <Switch 
                          checked={settings.integrationSettings.ownershipSyncEnabled}
                          onCheckedChange={(checked) => updateIntegrationSettings('ownershipSyncEnabled', checked)}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Honor Primary + Collaborators; sync reassignment hooks
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Applications Module Sync</Label>
                        <Switch 
                          checked={settings.integrationSettings.applicationsSyncEnabled}
                          onCheckedChange={(checked) => updateIntegrationSettings('applicationsSyncEnabled', checked)}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Source of truth for stages; bi-directional updates
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>JD Approvals Integration</Label>
                        <Switch 
                          checked={settings.integrationSettings.approvalGatingEnabled}
                          onCheckedChange={(checked) => updateIntegrationSettings('approvalGatingEnabled', checked)}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Block pipeline actions for non-approved JDs
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">External Integrations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Email Provider</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="outlook">Outlook</SelectItem>
                          <SelectItem value="gmail">Gmail</SelectItem>
                          <SelectItem value="sendgrid">SendGrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>WhatsApp Integration</Label>
                      <Switch />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Slack Integration</Label>
                      <Switch />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Audit Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Audit Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Log all status changes</Label>
                      <Switch defaultChecked disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Log reminders sent</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="space-y-2">
                      <Label>Log escalations</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="space-y-2">
                      <Label>Log manager overrides</Label>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Retention Policy</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Audit log retention (days)</Label>
                      <Input type="number" defaultValue="365" />
                    </div>
                    <div className="space-y-2">
                      <Label>Auto-archive old entries</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="space-y-2">
                      <Label>Export audit logs</Label>
                      <Button variant="outline">Export Current Logs</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}