import { useState, useEffect } from 'react'
import { AlertTriangle, Download, Filter, CheckCircle, Clock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/components/shared/DataTable'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { FollowupService } from '@/services/followupService'
import { EscalationDTO, FollowupFilters } from '@/types/followup'
import { useToast } from '@/hooks/use-toast'

export function EscalationReportsTab() {
  const [escalations, setEscalations] = useState<EscalationDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FollowupFilters>({})
  const [selectedEscalation, setSelectedEscalation] = useState<EscalationDTO | null>(null)
  const [resolutionNote, setResolutionNote] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    loadEscalations()
  }, [filters])

  const loadEscalations = async () => {
    try {
      setLoading(true)
      const data = await FollowupService.getEscalations(filters)
      setEscalations(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load escalations",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResolveEscalation = async () => {
    if (!selectedEscalation) return
    
    try {
      await FollowupService.resolveEscalation(selectedEscalation.id, resolutionNote)
      toast({
        title: "Success",
        description: "Escalation resolved successfully"
      })
      setSelectedEscalation(null)
      setResolutionNote('')
      loadEscalations()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve escalation",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: EscalationDTO['status']) => {
    const variants = {
      'OPEN': { variant: 'destructive' as const, color: 'bg-red-100 text-red-700' },
      'IN_PROGRESS': { variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-700' },
      'RESOLVED': { variant: 'default' as const, color: 'bg-green-100 text-green-700' }
    }
    return variants[status] || { variant: 'secondary' as const, color: '' }
  }

  const getAgingSeverity = (raisedAt: string, status: EscalationDTO['status']) => {
    if (status === 'RESOLVED') return { level: 'Resolved', color: 'text-green-600' }
    
    const days = Math.floor((Date.now() - new Date(raisedAt).getTime()) / (1000 * 60 * 60 * 24))
    if (days > 3) return { level: 'Critical', color: 'text-red-600' }
    if (days > 1) return { level: 'High', color: 'text-orange-600' }
    return { level: 'Medium', color: 'text-yellow-600' }
  }

  const ResolveEscalationDialog = ({ escalation }: { escalation: EscalationDTO }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={escalation.status === 'RESOLVED'}
          onClick={() => setSelectedEscalation(escalation)}
        >
          <CheckCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resolve Escalation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="font-medium">Escalation Details</div>
            <div className="text-sm text-muted-foreground mt-1">
              Raised: {new Date(escalation.raisedAt).toLocaleString()}
            </div>
            <div className="text-sm mt-2">{escalation.reason}</div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Resolution Note</label>
            <Textarea
              placeholder="Describe how this escalation was resolved..."
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelectedEscalation(null)}>
              Cancel
            </Button>
            <Button onClick={handleResolveEscalation}>
              Mark as Resolved
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  const columns = [
    {
      id: 'severity',
      header: 'Severity',
      accessor: 'raisedAt' as keyof EscalationDTO,
      cell: (item: EscalationDTO) => {
        if (!item) return <div>-</div>
        const severity = getAgingSeverity(item.raisedAt, item.status)
        return (
          <Badge className={`text-xs ${severity.color}`}>
            {severity.level}
          </Badge>
        )
      }
    },
    {
      id: 'submission',
      header: 'Submission',
      accessor: 'submissionId' as keyof EscalationDTO,
      cell: (item: EscalationDTO) => {
        if (!item) return <div>-</div>
        // In real app, would lookup submission details by ID
        return (
          <div className="text-sm">
            <div className="font-medium">Alice Johnson</div>
            <div className="text-muted-foreground">JD-2024-001 • TechCorp</div>
          </div>
        )
      }
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status' as keyof EscalationDTO,
      cell: (item: EscalationDTO) => {
        if (!item) return <div>-</div>
        const badge = getStatusBadge(item.status)
        return (
          <Badge className={`text-xs ${badge.color}`}>
            {item.status.replace('_', ' ')}
          </Badge>
        )
      }
    },
    {
      id: 'raisedAt',
      header: 'Raised At',
      accessor: 'raisedAt' as keyof EscalationDTO,
      cell: (item: EscalationDTO) => {
        if (!item || !item.raisedAt) return <div>-</div>
        const date = new Date(item.raisedAt)
        return (
          <div className="text-sm">
            <div>{date.toLocaleDateString()}</div>
            <div className="text-muted-foreground">{date.toLocaleTimeString()}</div>
          </div>
        )
      }
    },
    {
      id: 'aging',
      header: 'Aging',
      accessor: 'raisedAt' as keyof EscalationDTO,
      cell: (item: EscalationDTO) => {
        if (!item) return <div>-</div>
        const days = Math.floor((Date.now() - new Date(item.raisedAt).getTime()) / (1000 * 60 * 60 * 24))
        const hours = Math.floor((Date.now() - new Date(item.raisedAt).getTime()) / (1000 * 60 * 60)) % 24
        
        if (item.status === 'RESOLVED') {
          const resolvedDays = item.resolvedAt ? 
            Math.floor((new Date(item.resolvedAt).getTime() - new Date(item.raisedAt).getTime()) / (1000 * 60 * 60 * 24)) : 0
          return <div className="text-sm text-green-600">Resolved in {resolvedDays}d</div>
        }
        
        return (
          <div className="text-sm">
            <div>{days}d {hours}h</div>
            <div className="text-muted-foreground">Open</div>
          </div>
        )
      }
    },
    {
      id: 'owner',
      header: 'Owner',
      accessor: 'ownerId' as keyof EscalationDTO,
      cell: (item: EscalationDTO) => {
        if (!item) return <div>-</div>
        // In real app, would lookup user details by ID
        const ownerNames: Record<string, string> = {
          'manager-001': 'Alice Manager',
          'manager-002': 'Bob Director',
          'hr-001': 'Carol HR'
        }
        return (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{ownerNames[item.ownerId] || item.ownerId}</span>
          </div>
        )
      }
    },
    {
      id: 'reason',
      header: 'Reason',
      accessor: 'reason' as keyof EscalationDTO,
      cell: (item: EscalationDTO) => {
        if (!item || !item.reason) return <div>-</div>
        return (
          <div className="max-w-xs text-sm">
            <span className="line-clamp-2">{item.reason}</span>
          </div>
        )
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'id' as keyof EscalationDTO,
      cell: (item: EscalationDTO) => {
        if (!item) return <div>-</div>
        return (
          <div className="flex items-center gap-1">
            <ResolveEscalationDialog escalation={item} />
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <User className="h-4 w-4" />
            </Button>
          </div>
        )
      }
    }
  ]

  // Calculate stats
  const openEscalations = escalations.filter(e => e.status === 'OPEN').length
  const inProgressEscalations = escalations.filter(e => e.status === 'IN_PROGRESS').length
  const resolvedEscalations = escalations.filter(e => e.status === 'RESOLVED').length
  const criticalEscalations = escalations.filter(e => 
    e.status !== 'RESOLVED' && 
    Math.floor((Date.now() - new Date(e.raisedAt).getTime()) / (1000 * 60 * 60 * 24)) > 3
  ).length

  const avgResolutionTime = resolvedEscalations.length > 0 ? 
    escalations
      .filter(e => e.status === 'RESOLVED' && e.resolvedAt)
      .reduce((sum, e) => {
        const days = Math.floor((new Date(e.resolvedAt!).getTime() - new Date(e.raisedAt).getTime()) / (1000 * 60 * 60 * 24))
        return sum + days
      }, 0) / resolvedEscalations.length : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Escalation Reports</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{escalations.length}</div>
            <p className="text-sm text-muted-foreground">Total Escalations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{openEscalations}</div>
            <p className="text-sm text-muted-foreground">Open</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{inProgressEscalations}</div>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{resolvedEscalations}</div>
            <p className="text-sm text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{criticalEscalations}</div>
            <p className="text-sm text-muted-foreground">Critical (&gt; 3 days)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{avgResolutionTime.toFixed(1)}d</div>
            <p className="text-sm text-muted-foreground">Avg Resolution Time</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Severity</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Owner</label>
              <Select onValueChange={(value) => setFilters(prev => ({ ...prev, recruiterId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All owners" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager-001">Alice Manager</SelectItem>
                  <SelectItem value="manager-002">Bob Director</SelectItem>
                  <SelectItem value="hr-001">Carol HR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="quarter">Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Escalations Alert */}
      {criticalEscalations > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">
                {criticalEscalations} critical escalation{criticalEscalations > 1 ? 's' : ''} requiring immediate attention (open for more than 3 days)
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <DataTable
        data={escalations}
        columns={columns}
        loading={loading}
      />
    </div>
  )
}