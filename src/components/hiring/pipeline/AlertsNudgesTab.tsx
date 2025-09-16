import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { DataTable } from '@/components/shared/DataTable'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertTriangle, Bell, Send, MessageSquare, Mail, Phone, Clock } from 'lucide-react'
import { pipelineService } from '@/services/pipelineService'
import { PipelineAlert, ReminderAction, EscalationAction } from '@/types/pipeline'

export function AlertsNudgesTab() {
  const [alerts, setAlerts] = useState<PipelineAlert[]>([])
  const [filteredAlerts, setFilteredAlerts] = useState<PipelineAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAlert, setSelectedAlert] = useState<PipelineAlert | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterSeverity, setFilterSeverity] = useState<string>('all')

  useEffect(() => {
    loadAlerts()
  }, [])

  useEffect(() => {
    filterAlerts()
  }, [alerts, filterType, filterSeverity])

  const loadAlerts = async () => {
    try {
      setLoading(true)
      const data = await pipelineService.getAlerts()
      setAlerts(data)
    } catch (error) {
      console.error('Failed to load alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAlerts = () => {
    let filtered = [...alerts]
    
    if (filterType !== 'all') {
      filtered = filtered.filter(alert => alert.type === filterType)
    }
    
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(alert => alert.severity === filterSeverity)
    }
    
    setFilteredAlerts(filtered)
  }

  const handleSendReminder = async (reminder: ReminderAction) => {
    try {
      await pipelineService.sendReminder(reminder)
      // Refresh alerts
      loadAlerts()
    } catch (error) {
      console.error('Failed to send reminder:', error)
    }
  }

  const handleEscalate = async (escalation: EscalationAction) => {
    try {
      await pipelineService.escalateIssue(escalation)
      // Refresh alerts
      loadAlerts()
    } catch (error) {
      console.error('Failed to escalate:', error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'warning': return 'secondary'
      case 'info': return 'default'
      default: return 'outline'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sla-breach': return AlertTriangle
      case 'productivity-nudge': return Bell
      case 'escalation-needed': return Clock
      default: return Bell
    }
  }

  const columns = [
    {
      accessorKey: 'severity',
      header: 'Severity',
      cell: ({ row }: any) => (
        <Badge variant={getSeverityColor(row.original.severity)}>
          {row.original.severity}
        </Badge>
      )
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }: any) => {
        const IconComponent = getTypeIcon(row.original.type)
        return (
          <div className="flex items-center gap-2">
            <IconComponent className="h-4 w-4" />
            <span>{row.original.type.replace('-', ' ')}</span>
          </div>
        )
      }
    },
    {
      accessorKey: 'title',
      header: 'Alert',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.title}</div>
          <div className="text-sm text-muted-foreground">{row.original.description}</div>
        </div>
      )
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }: any) => (
        <div className="text-sm">{new Date(row.original.createdAt).toLocaleDateString()}</div>
      )
    },
    {
      accessorKey: 'actionTaken',
      header: 'Status',
      cell: ({ row }: any) => (
        <Badge variant={row.original.actionTaken ? 'default' : 'secondary'}>
          {row.original.actionTaken ? 'Resolved' : 'Pending'}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedAlert(row.original)}
              >
                <Send className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <ReminderDialog alert={row.original} onSend={handleSendReminder} />
            </DialogContent>
          </Dialog>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedAlert(row.original)}
              >
                <AlertTriangle className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <EscalationDialog alert={row.original} onEscalate={handleEscalate} />
            </DialogContent>
          </Dialog>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Center</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div>
              <Label>Filter by Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sla-breach">SLA Breach</SelectItem>
                  <SelectItem value="productivity-nudge">Productivity Nudge</SelectItem>
                  <SelectItem value="escalation-needed">Escalation Needed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Filter by Severity</Label>
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DataTable
            columns={columns}
            data={filteredAlerts}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Alert Streams */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              SLA Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredAlerts
                .filter(alert => alert.type === 'sla-breach')
                .slice(0, 5)
                .map((alert) => (
                <div key={alert.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{alert.title}</h4>
                    <Badge variant={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-500" />
              Productivity Nudges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredAlerts
                .filter(alert => alert.type === 'productivity-nudge')
                .slice(0, 5)
                .map((alert) => (
                <div key={alert.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{alert.title}</h4>
                    <Badge variant={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ReminderDialog({ 
  alert, 
  onSend 
}: { 
  alert: PipelineAlert
  onSend: (reminder: ReminderAction) => void 
}) {
  const [reminderType, setReminderType] = useState<'email' | 'whatsapp' | 'slack'>('email')
  const [message, setMessage] = useState('')

  const handleSend = () => {
    const reminder: ReminderAction = {
      type: reminderType,
      recipientIds: [], // Would be populated based on alert context
      message,
      jdIds: alert.jdId ? [alert.jdId] : undefined,
      applicationIds: alert.candidateId ? [alert.candidateId] : undefined
    }
    onSend(reminder)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Send Reminder</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label>Channel</Label>
          <Select value={reminderType} onValueChange={(value: any) => setReminderType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </div>
              </SelectItem>
              <SelectItem value="whatsapp">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  WhatsApp
                </div>
              </SelectItem>
              <SelectItem value="slack">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Slack
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Message</Label>
          <Textarea
            placeholder="Enter reminder message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
        </div>
        
        <Button onClick={handleSend} className="w-full">
          <Send className="h-4 w-4 mr-2" />
          Send Reminder
        </Button>
      </div>
    </>
  )
}

function EscalationDialog({ 
  alert, 
  onEscalate 
}: { 
  alert: PipelineAlert
  onEscalate: (escalation: EscalationAction) => void 
}) {
  const [toRole, setToRole] = useState('')
  const [reason, setReason] = useState('')
  const [urgency, setUrgency] = useState<'normal' | 'high' | 'critical'>('normal')

  const handleEscalate = () => {
    if (!alert.candidateId) return
    
    const escalation: EscalationAction = {
      applicationId: alert.candidateId,
      fromRole: 'current-user-role', // Would be determined from auth context
      toRole,
      reason,
      urgency
    }
    onEscalate(escalation)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Escalate Issue</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label>Escalate To</Label>
          <Select value={toRole} onValueChange={setToRole}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="hr">HR</SelectItem>
              <SelectItem value="leadership">Leadership</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Urgency</Label>
          <Select value={urgency} onValueChange={(value: any) => setUrgency(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Reason</Label>
          <Textarea
            placeholder="Explain why escalation is needed..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
          />
        </div>
        
        <Button onClick={handleEscalate} className="w-full">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Escalate Issue
        </Button>
      </div>
    </>
  )
}