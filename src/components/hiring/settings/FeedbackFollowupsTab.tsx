import { useState } from 'react'
import { Plus, Edit, Save, MessageSquare, Clock, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { DataTable } from '@/components/shared/DataTable'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

interface FeedbackTemplate {
  id: string
  name: string
  type: 'EMAIL' | 'WHATSAPP'
  stage: 'INITIAL_FEEDBACK' | 'REMINDER_1' | 'REMINDER_2' | 'ESCALATION'
  subject?: string
  content: string
  linkedClients: string[]
  linkedJDs: string[]
  isActive: boolean
  usageCount: number
}

interface AgingThreshold {
  stage: string
  reminderDays: number[]
  escalationDays: number
  autoEscalate: boolean
}

export function FeedbackFollowupsTab() {
  const [templates, setTemplates] = useState<FeedbackTemplate[]>([
    {
      id: 'tpl-001',
      name: 'Initial Feedback Request',
      type: 'EMAIL',
      stage: 'INITIAL_FEEDBACK',
      subject: 'Feedback Required: {{candidateName}} - {{jdTitle}}',
      content: 'Dear {{clientName}},\n\nWe submitted {{candidateName}} for the {{jdTitle}} position on {{submissionDate}}. Could you please provide your feedback at your earliest convenience?\n\nCandidate Profile:\n- Experience: {{experience}}\n- Skills: {{skills}}\n\nBest regards,\n{{recruiterName}}',
      linkedClients: ['TechCorp', 'FinanceMax'],
      linkedJDs: [],
      isActive: true,
      usageCount: 156
    },
    {
      id: 'tpl-002',
      name: 'WhatsApp Reminder',
      type: 'WHATSAPP',
      stage: 'REMINDER_1',
      content: 'Hi {{clientName}}, gentle reminder for feedback on {{candidateName}} for {{jdTitle}}. Submitted {{daysAgo}} days ago. Thanks! - {{recruiterName}}',
      linkedClients: [],
      linkedJDs: [],
      isActive: true,
      usageCount: 89
    }
  ])

  const [agingThresholds, setAgingThresholds] = useState<AgingThreshold[]>([
    { stage: 'Initial Submission', reminderDays: [2, 4], escalationDays: 7, autoEscalate: true },
    { stage: 'Interview Feedback', reminderDays: [1, 3], escalationDays: 5, autoEscalate: true },
    { stage: 'Final Decision', reminderDays: [3, 6], escalationDays: 10, autoEscalate: false }
  ])

  const [showNewTemplate, setShowNewTemplate] = useState(false)
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'EMAIL' as any,
    stage: 'INITIAL_FEEDBACK' as any,
    subject: '',
    content: '',
    linkedClients: [] as string[],
    linkedJDs: [] as string[]
  })

  const [globalSettings, setGlobalSettings] = useState({
    enableAutoReminders: true,
    enableEscalation: true,
    maxReminders: 3,
    escalationCooldown: 24 // hours
  })

  const { toast } = useToast()

  const handleCreateTemplate = () => {
    const template: FeedbackTemplate = {
      id: `tpl-${Date.now()}`,
      name: newTemplate.name,
      type: newTemplate.type,
      stage: newTemplate.stage,
      subject: newTemplate.subject,
      content: newTemplate.content,
      linkedClients: newTemplate.linkedClients,
      linkedJDs: newTemplate.linkedJDs,
      isActive: true,
      usageCount: 0
    }
    
    setTemplates([...templates, template])
    setNewTemplate({
      name: '',
      type: 'EMAIL',
      stage: 'INITIAL_FEEDBACK',
      subject: '',
      content: '',
      linkedClients: [],
      linkedJDs: []
    })
    setShowNewTemplate(false)
    
    toast({
      title: "Template Created",
      description: "Feedback template has been created successfully"
    })
  }

  const handleSaveGlobalSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Feedback and follow-up settings have been updated"
    })
  }

  const templateColumns = [
    {
      id: 'name',
      header: 'Template Name',
      accessor: 'name' as keyof FeedbackTemplate
    },
    {
      id: 'type',
      header: 'Type',
      accessor: 'type' as keyof FeedbackTemplate,
      cell: (item: FeedbackTemplate) => (
        <Badge variant="outline" className={item.type === 'EMAIL' ? 'border-blue-200 text-blue-700' : 'border-green-200 text-green-700'}>
          {item.type}
        </Badge>
      )
    },
    {
      id: 'stage',
      header: 'Stage',
      accessor: 'stage' as keyof FeedbackTemplate,
      cell: (item: FeedbackTemplate) => (
        <Badge variant="secondary" className="text-xs">
          {item.stage?.replace('_', ' ') || 'Unknown'}
        </Badge>
      )
    },
    {
      id: 'scope',
      header: 'Linked To',
      accessor: 'linkedClients' as keyof FeedbackTemplate,
      cell: (item: FeedbackTemplate) => (
        <div className="text-sm">
          <div>
            {item.linkedClients && item.linkedClients.length > 0 ? (
              <span>Clients: {item.linkedClients?.slice(0, 2)?.join(', ') || 'None'}{item.linkedClients.length > 2 ? ` +${item.linkedClients.length - 2}` : ''}</span>
            ) : (
              <span className="text-muted-foreground">All Clients</span>
            )}
          </div>
          <div className="text-muted-foreground">
            {item.linkedJDs && item.linkedJDs.length > 0 ? `JDs: ${item.linkedJDs.length}` : 'All JDs'}
          </div>
        </div>
      )
    },
    {
      id: 'usage',
      header: 'Usage',
      accessor: 'usageCount' as keyof FeedbackTemplate,
      cell: (item: FeedbackTemplate) => (
        <div className="text-sm">
          <div className="font-medium">{item.usageCount}</div>
          <div className="text-muted-foreground text-xs">times used</div>
        </div>
      )
    },
    {
      id: 'isActive',
      header: 'Status',
      accessor: 'isActive' as keyof FeedbackTemplate,
      cell: (item: FeedbackTemplate) => (
        <Badge className={item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
          {item.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'id' as keyof FeedbackTemplate,
      cell: (item: FeedbackTemplate) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  const thresholdColumns = [
    {
      id: 'stage',
      header: 'Stage',
      accessor: 'stage' as keyof AgingThreshold
    },
    {
      id: 'reminders',
      header: 'Reminder Days',
      accessor: 'reminderDays' as keyof AgingThreshold,
      cell: (item: AgingThreshold) => (
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
      id: 'escalation',
      header: 'Escalation',
      accessor: 'escalationDays' as keyof AgingThreshold,
      cell: (item: AgingThreshold) => (
        <div className="text-sm">
          <div className="font-medium">{item.escalationDays} days</div>
          <div className={`text-xs ${item.autoEscalate ? 'text-green-600' : 'text-gray-500'}`}>
            {item.autoEscalate ? 'Auto-escalate' : 'Manual'}
          </div>
        </div>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'stage' as keyof AgingThreshold,
      cell: (item: AgingThreshold) => (
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Feedback Templates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Feedback Templates</CardTitle>
            <Button onClick={() => setShowNewTemplate(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={templates}
            columns={templateColumns}
            loading={false}
            searchable={false}
          />
        </CardContent>
      </Card>

      {/* Aging Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback Aging Thresholds</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={agingThresholds}
            columns={thresholdColumns}
            loading={false}
            searchable={false}
          />
        </CardContent>
      </Card>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Follow-up Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Auto Reminders</h3>
                  <p className="text-sm text-muted-foreground">Automatically send reminder messages</p>
                </div>
                <Switch 
                  checked={globalSettings.enableAutoReminders}
                  onCheckedChange={(checked) => setGlobalSettings(prev => ({ ...prev, enableAutoReminders: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Auto Escalation</h3>
                  <p className="text-sm text-muted-foreground">Automatically escalate after repeated reminders</p>
                </div>
                <Switch 
                  checked={globalSettings.enableEscalation}
                  onCheckedChange={(checked) => setGlobalSettings(prev => ({ ...prev, enableEscalation: checked }))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Maximum Reminders</Label>
                <Input
                  type="number"
                  value={globalSettings.maxReminders}
                  onChange={(e) => setGlobalSettings(prev => ({ ...prev, maxReminders: parseInt(e.target.value) }))}
                  min="1"
                  max="10"
                />
                <p className="text-xs text-muted-foreground">Max reminders before escalation</p>
              </div>

              <div className="space-y-2">
                <Label>Escalation Cooldown (Hours)</Label>
                <Input
                  type="number"
                  value={globalSettings.escalationCooldown}
                  onChange={(e) => setGlobalSettings(prev => ({ ...prev, escalationCooldown: parseInt(e.target.value) }))}
                  min="1"
                  max="72"
                />
                <p className="text-xs text-muted-foreground">Wait time between escalations</p>
              </div>
            </div>
          </div>

          <Button onClick={handleSaveGlobalSettings}>
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* Template Variables Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Template Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium mb-2">Candidate Variables</h3>
              <div className="space-y-1 text-sm">
                <div><code className="bg-muted px-1 rounded">{'{{candidateName}}'}</code> - Candidate name</div>
                <div><code className="bg-muted px-1 rounded">{'{{experience}}'}</code> - Years of experience</div>
                <div><code className="bg-muted px-1 rounded">{'{{skills}}'}</code> - Key skills</div>
                <div><code className="bg-muted px-1 rounded">{'{{currentCTC}}'}</code> - Current salary</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">JD Variables</h3>
              <div className="space-y-1 text-sm">
                <div><code className="bg-muted px-1 rounded">{'{{jdTitle}}'}</code> - Job title</div>
                <div><code className="bg-muted px-1 rounded">{'{{jdId}}'}</code> - JD reference ID</div>
                <div><code className="bg-muted px-1 rounded">{'{{clientName}}'}</code> - Client name</div>
                <div><code className="bg-muted px-1 rounded">{'{{location}}'}</code> - Job location</div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">System Variables</h3>
              <div className="space-y-1 text-sm">
                <div><code className="bg-muted px-1 rounded">{'{{recruiterName}}'}</code> - Recruiter name</div>
                <div><code className="bg-muted px-1 rounded">{'{{submissionDate}}'}</code> - Submission date</div>
                <div><code className="bg-muted px-1 rounded">{'{{daysAgo}}'}</code> - Days since submission</div>
                <div><code className="bg-muted px-1 rounded">{'{{companyName}}'}</code> - Your company</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Template Modal */}
      <Dialog open={showNewTemplate} onOpenChange={setShowNewTemplate}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Feedback Template</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Premium Client Feedback Request"
                />
              </div>
              <div className="space-y-2">
                <Label>Template Type</Label>
                <Select 
                  value={newTemplate.type}
                  onValueChange={(value) => setNewTemplate(prev => ({ ...prev, type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMAIL">Email</SelectItem>
                    <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Stage</Label>
              <Select 
                value={newTemplate.stage}
                onValueChange={(value) => setNewTemplate(prev => ({ ...prev, stage: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INITIAL_FEEDBACK">Initial Feedback</SelectItem>
                  <SelectItem value="REMINDER_1">First Reminder</SelectItem>
                  <SelectItem value="REMINDER_2">Second Reminder</SelectItem>
                  <SelectItem value="ESCALATION">Escalation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newTemplate.type === 'EMAIL' && (
              <div className="space-y-2">
                <Label>Email Subject</Label>
                <Input
                  value={newTemplate.subject}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Feedback Required: {{candidateName}} - {{jdTitle}}"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Message Content</Label>
              <Textarea
                value={newTemplate.content}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter your template content with variables..."
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                Use variables like {'{{candidateName}}'}, {'{{jdTitle}}'}, {'{{clientName}}'} etc.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Link to Clients (Optional)</Label>
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
                <Label>Link to JDs (Optional)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All JDs or select specific" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All JDs</SelectItem>
                    <SelectItem value="jd-001">JD-2024-001</SelectItem>
                    <SelectItem value="jd-002">JD-2024-002</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewTemplate(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTemplate}>
                Create Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}