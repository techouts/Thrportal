import { useState } from 'react'
import { Save, Bell, Globe, DollarSign, FileText, Users, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'

interface GlobalSettings {
  defaultRecruiterAssignment: 'AUTO' | 'MANUAL'
  autoAssignmentRules: {
    byLocation: boolean
    bySkill: boolean
    byWorkload: boolean
    roundRobin: boolean
  }
  notifications: {
    email: boolean
    whatsapp: boolean
    teams: boolean
    slack: boolean
  }
  defaults: {
    currency: string
    primaryLocation: string
    secondaryLocation: string
    jdNamingConvention: string
    timeZone: string
  }
  bulkOperations: {
    maxImportSize: number
    enableScheduledExports: boolean
    autoBackupEnabled: boolean
    backupFrequency: string
  }
}

export function GlobalDefaultsTab() {
  const [settings, setSettings] = useState<GlobalSettings>({
    defaultRecruiterAssignment: 'AUTO',
    autoAssignmentRules: {
      byLocation: true,
      bySkill: true,
      byWorkload: true,
      roundRobin: false
    },
    notifications: {
      email: true,
      whatsapp: true,
      teams: false,
      slack: false
    },
    defaults: {
      currency: 'INR',
      primaryLocation: 'Bangalore',
      secondaryLocation: 'Mumbai',
      jdNamingConvention: '{CLIENT}-{ROLE}-{DATE}',
      timeZone: 'Asia/Kolkata'
    },
    bulkOperations: {
      maxImportSize: 1000,
      enableScheduledExports: true,
      autoBackupEnabled: true,
      backupFrequency: 'WEEKLY'
    }
  })

  const [integrationSettings, setIntegrationSettings] = useState({
    atsIntegration: false,
    crmIntegration: false,
    payrollIntegration: false,
    calendarSync: true
  })

  const { toast } = useToast()

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Global default settings have been updated successfully"
    })
  }

  const handleResetToDefaults = () => {
    // Reset to factory defaults
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to factory defaults"
    })
  }

  return (
    <div className="space-y-6">
      {/* Recruiter Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recruiter Assignment Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Default Assignment Mode</Label>
              <Select 
                value={settings.defaultRecruiterAssignment}
                onValueChange={(value) => setSettings(prev => ({ 
                  ...prev, 
                  defaultRecruiterAssignment: value as any 
                }))}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AUTO">Auto Assignment</SelectItem>
                  <SelectItem value="MANUAL">Manual Assignment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {settings.defaultRecruiterAssignment === 'AUTO' && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                <h3 className="font-medium">Auto Assignment Rules</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-normal">By Location</Label>
                      <p className="text-xs text-muted-foreground">Assign based on candidate location</p>
                    </div>
                    <Switch 
                      checked={settings.autoAssignmentRules.byLocation}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        autoAssignmentRules: { ...prev.autoAssignmentRules, byLocation: checked }
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-normal">By Skill Match</Label>
                      <p className="text-xs text-muted-foreground">Assign based on recruiter expertise</p>
                    </div>
                    <Switch 
                      checked={settings.autoAssignmentRules.bySkill}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        autoAssignmentRules: { ...prev.autoAssignmentRules, bySkill: checked }
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-normal">By Workload</Label>
                      <p className="text-xs text-muted-foreground">Balance assignments by current load</p>
                    </div>
                    <Switch 
                      checked={settings.autoAssignmentRules.byWorkload}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        autoAssignmentRules: { ...prev.autoAssignmentRules, byWorkload: checked }
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-normal">Round Robin</Label>
                      <p className="text-xs text-muted-foreground">Rotate assignments equally</p>
                    </div>
                    <Switch 
                      checked={settings.autoAssignmentRules.roundRobin}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        autoAssignmentRules: { ...prev.autoAssignmentRules, roundRobin: checked }
                      }))}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            {Object.entries(settings.notifications).map(([channel, enabled]) => (
              <div key={channel} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-muted">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-medium capitalize">{channel}</h3>
                    <p className="text-sm text-muted-foreground">
                      {channel === 'email' && 'Email notifications and reports'}
                      {channel === 'whatsapp' && 'WhatsApp Business messaging'}
                      {channel === 'teams' && 'Microsoft Teams integration'}
                      {channel === 'slack' && 'Slack workspace notifications'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={enabled}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, [channel]: checked }
                    }))}
                  />
                  {enabled && (
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Currency & Location Defaults */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Regional & Currency Defaults
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Primary Currency</Label>
              <Select 
                value={settings.defaults.currency}
                onValueChange={(value) => setSettings(prev => ({
                  ...prev,
                  defaults: { ...prev.defaults, currency: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Primary Location</Label>
              <Select 
                value={settings.defaults.primaryLocation}
                onValueChange={(value) => setSettings(prev => ({
                  ...prev,
                  defaults: { ...prev.defaults, primaryLocation: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bangalore">Bangalore</SelectItem>
                  <SelectItem value="Mumbai">Mumbai</SelectItem>
                  <SelectItem value="Delhi">Delhi</SelectItem>
                  <SelectItem value="Pune">Pune</SelectItem>
                  <SelectItem value="Chennai">Chennai</SelectItem>
                  <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Time Zone</Label>
              <Select 
                value={settings.defaults.timeZone}
                onValueChange={(value) => setSettings(prev => ({
                  ...prev,
                  defaults: { ...prev.defaults, timeZone: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                  <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                  <SelectItem value="Asia/Singapore">Asia/Singapore (SGT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Secondary Location</Label>
            <Select 
              value={settings.defaults.secondaryLocation}
              onValueChange={(value) => setSettings(prev => ({
                ...prev,
                defaults: { ...prev.defaults, secondaryLocation: value }
              }))}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mumbai">Mumbai</SelectItem>
                <SelectItem value="Delhi">Delhi</SelectItem>
                <SelectItem value="Pune">Pune</SelectItem>
                <SelectItem value="Chennai">Chennai</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* JD Naming Conventions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            JD Naming Conventions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Naming Pattern</Label>
            <Input
              value={settings.defaults.jdNamingConvention}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                defaults: { ...prev.defaults, jdNamingConvention: e.target.value }
              }))}
              placeholder="{CLIENT}-{ROLE}-{DATE}"
            />
            <p className="text-xs text-muted-foreground">
              Available variables: {'{CLIENT}'}, {'{ROLE}'}, {'{DATE}'}, {'{LOCATION}'}, {'{LEVEL}'}, {'{SEQUENCE}'}
            </p>
          </div>

          <div className="p-3 bg-muted/20 rounded border">
            <div className="text-sm">
              <strong>Preview:</strong> TechCorp-Senior-Frontend-Developer-2024-01-15
            </div>
          </div>

          <div className="space-y-2">
            <Label>Common Patterns</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSettings(prev => ({
                  ...prev,
                  defaults: { ...prev.defaults, jdNamingConvention: '{CLIENT}-{ROLE}-{DATE}' }
                }))}
              >
                CLIENT-ROLE-DATE
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSettings(prev => ({
                  ...prev,
                  defaults: { ...prev.defaults, jdNamingConvention: '{ROLE}-{LOCATION}-{SEQUENCE}' }
                }))}
              >
                ROLE-LOCATION-SEQ
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSettings(prev => ({
                  ...prev,
                  defaults: { ...prev.defaults, jdNamingConvention: '{CLIENT}_{LEVEL}_{ROLE}' }
                }))}
              >
                CLIENT_LEVEL_ROLE
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSettings(prev => ({
                  ...prev,
                  defaults: { ...prev.defaults, jdNamingConvention: 'JD-{DATE}-{SEQUENCE}' }
                }))}
              >
                JD-DATE-SEQ
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Operations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Bulk Import/Export Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Max Import Size (Records)</Label>
                <Input
                  type="number"
                  value={settings.bulkOperations.maxImportSize}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    bulkOperations: { ...prev.bulkOperations, maxImportSize: parseInt(e.target.value) }
                  }))}
                  min="100"
                  max="10000"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-normal">Scheduled Exports</Label>
                  <p className="text-xs text-muted-foreground">Enable automated data exports</p>
                </div>
                <Switch 
                  checked={settings.bulkOperations.enableScheduledExports}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    bulkOperations: { ...prev.bulkOperations, enableScheduledExports: checked }
                  }))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-normal">Auto Backup</Label>
                  <p className="text-xs text-muted-foreground">Automatic data backup</p>
                </div>
                <Switch 
                  checked={settings.bulkOperations.autoBackupEnabled}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    bulkOperations: { ...prev.bulkOperations, autoBackupEnabled: checked }
                  }))}
                />
              </div>

              {settings.bulkOperations.autoBackupEnabled && (
                <div className="space-y-2">
                  <Label>Backup Frequency</Label>
                  <Select 
                    value={settings.bulkOperations.backupFrequency}
                    onValueChange={(value) => setSettings(prev => ({
                      ...prev,
                      bulkOperations: { ...prev.bulkOperations, backupFrequency: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAILY">Daily</SelectItem>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Settings */}
      <Card>
        <CardHeader>
          <CardTitle>System Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(integrationSettings).map(([integration, enabled]) => (
              <div key={integration} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <Label className="font-normal capitalize">
                    {integration.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {integration === 'atsIntegration' && 'Connect with external ATS systems'}
                    {integration === 'crmIntegration' && 'Sync with CRM for client management'}
                    {integration === 'payrollIntegration' && 'Integration with payroll systems'}
                    {integration === 'calendarSync' && 'Calendar synchronization for interviews'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={enabled}
                    onCheckedChange={(checked) => setIntegrationSettings(prev => ({
                      ...prev,
                      [integration]: checked
                    }))}
                  />
                  {enabled && (
                    <Badge variant="outline" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleResetToDefaults}>
          Reset to Defaults
        </Button>
        <Button onClick={handleSaveSettings}>
          <Save className="mr-2 h-4 w-4" />
          Save All Settings
        </Button>
      </div>
    </div>
  )
}