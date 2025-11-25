import { useState } from 'react'
import { Plus, Edit, Save, Clock, AlertTriangle, MessageSquare, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { DataTable } from '@/components/shared/DataTable'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

interface SLARule {
  id: string
  name: string
  client?: string
  roleType?: string
  stage: 'JD_CREATION' | 'JD_TO_SUBMISSION' | 'SUBMISSION_TO_FEEDBACK' | 'OFFER_TO_DOJ'
  targetDays: number
  reminderDays: number[]
  escalationDays: number
  isActive: boolean
}

interface NotificationChannel {
  type: 'EMAIL' | 'WHATSAPP' | 'TEAMS' | 'SLACK'
  enabled: boolean
  config: any
}

interface DashboardThreshold {
  metric: string
  green: number
  amber: number
  red: number
}

export function SLATab() {
  const [slaRules, setSlaRules] = useState<SLARule[]>([
    {
      id: 'sla-001',
      name: 'Standard IT JD Creation',
      client: 'TechCorp',
      roleType: 'IT',
      stage: 'JD_CREATION',
      targetDays: 2,
      reminderDays: [1],
      escalationDays: 3,
      isActive: true
    },
    {
      id: 'sla-002',
      name: 'IT Submission SLA',
      roleType: 'IT',
      stage: 'JD_TO_SUBMISSION',
      targetDays: 7,
      reminderDays: [3, 5],
      escalationDays: 10,
      isActive: true
    },
    {
      id: 'sla-003',
      name: 'Client Feedback SLA',
      stage: 'SUBMISSION_TO_FEEDBACK',
      targetDays: 3,
      reminderDays: [2],
      escalationDays: 5,
      isActive: true
    }
  ])

  const [notificationChannels, setNotificationChannels] = useState<NotificationChannel[]>([
    { type: 'EMAIL', enabled: true, config: { template: 'standard' } },
    { type: 'WHATSAPP', enabled: true, config: { businessAccount: 'enabled' } },
    { type: 'TEAMS', enabled: false, config: { webhook: '' } },
    { type: 'SLACK', enabled: false, config: { webhook: '' } }
  ])

  const [dashboardThresholds, setDashboardThresholds] = useState<DashboardThreshold[]>([
    { metric: 'JD Creation Time', green: 1, amber: 2, red: 3 },
    { metric: 'Submission Time', green: 5, amber: 7, red: 10 },
    { metric: 'Feedback Time', green: 2, amber: 3, red: 5 },
    { metric: 'Offer to DOJ', green: 15, amber: 20, red: 30 }
  ])

  const [showNewSLA, setShowNewSLA] = useState(false)
  const [globalSettings, setGlobalSettings] = useState({
    weekendExclusion: true,
    holidayExclusion: true,
    autoEscalation: true,
    parallelReminders: false
  })

  const { toast } = useToast()

  const handleSaveGlobalSettings = () => {
    toast({
      title: "SLA Settings Saved",
      description: "Global SLA configuration has been updated"
    })
  }

  const slaColumns = [
    {
      id: 'name',
      header: 'SLA Name',
      accessor: 'name' as keyof SLARule
    },
    {
      id: 'scope',
      header: 'Scope',
      accessor: 'client' as keyof SLARule,
      cell: (item: SLARule) => (
        <div className="text-sm">
          <div>{item.client || 'All Clients'}</div>
          <div className="text-muted-foreground">{item.roleType || 'All Roles'}</div>
        </div>
      )
    },
    {
      id: 'stage',
      header: 'Stage',
      accessor: 'stage' as keyof SLARule,
      cell: (item: SLARule) => (
        <Badge variant="outline" className="text-xs">
          {item.stage?.replace('_', ' → ') || 'Unknown'}
        </Badge>
      )
    },
    {
      id: 'target',
      header: 'Target',
      accessor: 'targetDays' as keyof SLARule,
      cell: (item: SLARule) => (
        <div className="text-sm">
          <div className="font-medium">{item.targetDays} days</div>
          <div className="text-muted-foreground text-xs">
            Escalate: {item.escalationDays}d
          </div>
        </div>
      )
    },
    {
      id: 'reminders',
      header: 'Reminders',
      accessor: 'reminderDays' as keyof SLARule,
      cell: (item: SLARule) => (
        <div className="flex flex-wrap gap-1">
          {item.reminderDays?.map(day => (
            <Badge key={day} variant="secondary" className="text-xs">
              {day}d
            </Badge>
          )) || <span className="text-muted-foreground text-sm">No reminders</span>}
        </div>
      )
    },
    {
      id: 'isActive',
      header: 'Status',
      accessor: 'isActive' as keyof SLARule,
      cell: (item: SLARule) => (
        <Badge className={item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
          {item.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'id' as keyof SLARule,
      cell: (item: SLARule) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Clock className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  const thresholdColumns = [
    {
      id: 'metric',
      header: 'Metric',
      accessor: 'metric' as keyof DashboardThreshold
    },
    {
      id: 'green',
      header: 'Green (Days)',
      accessor: 'green' as keyof DashboardThreshold,
      cell: (item: DashboardThreshold) => (
        <Badge className="bg-green-100 text-green-700">≤ {item.green}</Badge>
      )
    },
    {
      id: 'amber',
      header: 'Amber (Days)',
      accessor: 'amber' as keyof DashboardThreshold,
      cell: (item: DashboardThreshold) => (
        <Badge className="bg-amber-100 text-amber-700">{item.green + 1}-{item.amber}</Badge>
      )
    },
    {
      id: 'red',
      header: 'Red (Days)',
      accessor: 'red' as keyof DashboardThreshold,
      cell: (item: DashboardThreshold) => (
        <Badge className="bg-red-100 text-red-700">&gt; {item.amber}</Badge>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'metric' as keyof DashboardThreshold,
      cell: (item: DashboardThreshold) => (
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* SLA Rules */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>SLA Rules</CardTitle>
            <Button onClick={() => setShowNewSLA(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New SLA Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={slaRules}
            columns={slaColumns}
            loading={false}
            searchable={false}
          />
        </CardContent>
      </Card>

      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {notificationChannels.map(channel => (
            <div key={channel.type} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-muted">
                  {channel.type === 'EMAIL' && <MessageSquare className="h-4 w-4" />}
                  {channel.type === 'WHATSAPP' && <MessageSquare className="h-4 w-4" />}
                  {channel.type === 'TEAMS' && <Bell className="h-4 w-4" />}
                  {channel.type === 'SLACK' && <Bell className="h-4 w-4" />}
                </div>
                <div>
                  <h3 className="font-medium">{channel.type}</h3>
                  <p className="text-sm text-muted-foreground">
                    {channel.type === 'EMAIL' && 'Email notifications and reminders'}
                    {channel.type === 'WHATSAPP' && 'WhatsApp Business messaging'}
                    {channel.type === 'TEAMS' && 'Microsoft Teams integration'}
                    {channel.type === 'SLACK' && 'Slack workspace notifications'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={channel.enabled}
                  onCheckedChange={(checked) => {
                    setNotificationChannels(prev => 
                      prev.map(c => c.type === channel.type ? { ...c, enabled: checked } : c)
                    )
                  }}
                />
                {channel.enabled && (
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Dashboard Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Thresholds</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={dashboardThresholds}
            columns={thresholdColumns}
            loading={false}
            searchable={false}
          />
        </CardContent>
      </Card>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Global SLA Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Weekend Exclusion</h3>
                  <p className="text-sm text-muted-foreground">Exclude Saturdays & Sundays from SLA calculations</p>
                </div>
                <Switch 
                  checked={globalSettings.weekendExclusion}
                  onCheckedChange={(checked) => setGlobalSettings(prev => ({ ...prev, weekendExclusion: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Holiday Exclusion</h3>
                  <p className="text-sm text-muted-foreground">Exclude public holidays from SLA calculations</p>
                </div>
                <Switch 
                  checked={globalSettings.holidayExclusion}
                  onCheckedChange={(checked) => setGlobalSettings(prev => ({ ...prev, holidayExclusion: checked }))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Auto Escalation</h3>
                  <p className="text-sm text-muted-foreground">Automatically escalate when SLA is breached</p>
                </div>
                <Switch 
                  checked={globalSettings.autoEscalation}
                  onCheckedChange={(checked) => setGlobalSettings(prev => ({ ...prev, autoEscalation: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Parallel Reminders</h3>
                  <p className="text-sm text-muted-foreground">Send reminders to all stakeholders simultaneously</p>
                </div>
                <Switch 
                  checked={globalSettings.parallelReminders}
                  onCheckedChange={(checked) => setGlobalSettings(prev => ({ ...prev, parallelReminders: checked }))}
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSaveGlobalSettings}>
            <Save className="mr-2 h-4 w-4" />
            Save Global Settings
          </Button>
        </CardContent>
      </Card>

      {/* New SLA Rule Modal */}
      <Dialog open={showNewSLA} onOpenChange={setShowNewSLA}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create SLA Rule</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>SLA Name</Label>
              <Input placeholder="e.g., Premium Client Feedback SLA" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Client (Optional)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All clients or select specific" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    <SelectItem value="techcorp">TechCorp</SelectItem>
                    <SelectItem value="financemax">FinanceMax</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Role Type (Optional)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All roles or select specific" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="it">IT</SelectItem>
                    <SelectItem value="non-it">Non-IT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Hiring Stage</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JD_CREATION">JD Creation</SelectItem>
                  <SelectItem value="JD_TO_SUBMISSION">JD → Submission</SelectItem>
                  <SelectItem value="SUBMISSION_TO_FEEDBACK">Submission → Feedback</SelectItem>
                  <SelectItem value="OFFER_TO_DOJ">Offer → DOJ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Target Days</Label>
                <Input type="number" placeholder="7" min="1" />
              </div>
              <div className="space-y-2">
                <Label>Reminder Days</Label>
                <Input placeholder="3,5" />
                <p className="text-xs text-muted-foreground">Comma-separated values</p>
              </div>
              <div className="space-y-2">
                <Label>Escalation Days</Label>
                <Input type="number" placeholder="10" min="1" />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewSLA(false)}>
                Cancel
              </Button>
              <Button>
                Create SLA Rule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}