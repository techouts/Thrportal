import { useState, useEffect } from 'react'
import { Clock, MessageSquare, Phone, AlertTriangle, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/components/shared/DataTable'
import { Progress } from '@/components/ui/progress'
import { FollowupService } from '@/services/followupService'
import { FollowupSubmissionDTO, FollowupFilters } from '@/types/followup'
import { useToast } from '@/hooks/use-toast'

export function PendingFeedbackTab() {
  const [submissions, setSubmissions] = useState<FollowupSubmissionDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FollowupFilters>({
    status: ['AWAITING_FEEDBACK', 'FOLLOWUP_SCHEDULED']
  })
  const { toast } = useToast()

  useEffect(() => {
    loadPendingSubmissions()
  }, [filters])

  const loadPendingSubmissions = async () => {
    try {
      setLoading(true)
      const data = await FollowupService.getSubmissions(filters)
      // Filter to only show pending feedback items
      const pendingData = data.filter(sub => 
        sub.status === 'AWAITING_FEEDBACK' || sub.status === 'FOLLOWUP_SCHEDULED'
      )
      setSubmissions(pendingData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load pending submissions",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSendFollowup = async (submissionId: string, channel: 'EMAIL' | 'WHATSAPP' | 'CALL') => {
    try {
      await FollowupService.createAction({
        submissionId,
        actionAt: new Date().toISOString(),
        channel,
        actorId: 'current-user', // Would be from auth context
        note: `Follow-up sent via ${channel}`
      })
      toast({
        title: "Success",
        description: `Follow-up sent via ${channel}`
      })
      loadPendingSubmissions()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send follow-up",
        variant: "destructive"
      })
    }
  }

  const handleEscalate = async (submissionId: string) => {
    try {
      await FollowupService.createEscalation(
        submissionId,
        "No feedback received after multiple follow-ups",
        "manager-001" // Would be from context
      )
      toast({
        title: "Success",
        description: "Submission escalated successfully"
      })
      loadPendingSubmissions()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to escalate submission",
        variant: "destructive"
      })
    }
  }

  const getUrgencyLevel = (agingDays: number, followupCount: number) => {
    if (agingDays > 7 || followupCount > 3) return { level: 'Critical', color: 'text-red-600', bg: 'bg-red-100' }
    if (agingDays > 5 || followupCount > 2) return { level: 'High', color: 'text-orange-600', bg: 'bg-orange-100' }
    if (agingDays > 3) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    return { level: 'Low', color: 'text-green-600', bg: 'bg-green-100' }
  }

  const getProgressValue = (agingDays: number) => {
    // Assuming 7 days is 100% (critical threshold)
    return Math.min((agingDays / 7) * 100, 100)
  }

  const columns = [
    {
      id: 'urgency',
      header: 'Urgency',
      accessor: 'agingDays' as keyof FollowupSubmissionDTO,
      cell: (item: FollowupSubmissionDTO) => {
        if (!item) return <div>-</div>
        const urgency = getUrgencyLevel(item.agingDays, item.followupCount)
        return (
          <Badge className={`text-xs ${urgency.color} ${urgency.bg}`}>
            {urgency.level}
          </Badge>
        )
      }
    },
    {
      id: 'candidate',
      header: 'Candidate',
      accessor: 'candidateName' as keyof FollowupSubmissionDTO,
      cell: (item: FollowupSubmissionDTO) => {
        if (!item) return <div>-</div>
        return (
          <div>
            <div className="font-medium">{item.candidateName}</div>
            {item.candidateEmail && (
              <div className="text-sm text-muted-foreground">{item.candidateEmail}</div>
            )}
          </div>
        )
      }
    },
    {
      id: 'jdClient',
      header: 'JD / Client',
      accessor: 'jdCode' as keyof FollowupSubmissionDTO,
      cell: (item: FollowupSubmissionDTO) => {
        if (!item) return <div>-</div>
        return (
          <div>
            <div className="font-medium">{item.jdCode}</div>
            <div className="text-sm text-muted-foreground">{item.clientName}</div>
          </div>
        )
      }
    },
    {
      id: 'recruiter',
      header: 'Recruiter',
      accessor: 'recruiterName' as keyof FollowupSubmissionDTO
    },
    {
      id: 'agingProgress',
      header: 'Aging Progress',
      accessor: 'agingDays' as keyof FollowupSubmissionDTO,
      cell: (item: FollowupSubmissionDTO) => {
        if (!item) return <div>-</div>
        const progressValue = getProgressValue(item.agingDays)
        const progressColor = progressValue > 85 ? 'bg-red-500' : progressValue > 70 ? 'bg-orange-500' : 'bg-green-500'
        return (
          <div className="space-y-1 w-32">
            <div className="flex justify-between text-xs">
              <span>{item.agingDays} days</span>
              <span>{Math.round(progressValue)}%</span>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>
        )
      }
    },
    {
      id: 'followupCount',
      header: 'Follow-ups',
      accessor: 'followupCount' as keyof FollowupSubmissionDTO,
      cell: (item: FollowupSubmissionDTO) => {
        if (!item) return <div>-</div>
        return item.followupCount > 3 ? 
          <Badge variant="destructive" className="text-xs">{item.followupCount}</Badge> :
          <Badge variant="outline" className="text-xs">{item.followupCount}</Badge>
      }
    },
    {
      id: 'lastFollowup',
      header: 'Last Follow-up',
      accessor: 'submissionAt' as keyof FollowupSubmissionDTO,
      cell: (item: FollowupSubmissionDTO) => {
        if (!item || !item.submissionAt) return <div>-</div>
        const daysSince = Math.floor((Date.now() - new Date(item.submissionAt).getTime()) / (1000 * 60 * 60 * 24))
        return (
          <div className="text-sm">
            <div>{daysSince} days ago</div>
            <div className="text-muted-foreground">Email</div>
          </div>
        )
      }
    },
    {
      id: 'nextDue',
      header: 'Next Due',
      accessor: 'nextFollowupAt' as keyof FollowupSubmissionDTO,
      cell: (item: FollowupSubmissionDTO) => {
        if (!item || !item.nextFollowupAt) return <div>-</div>
        const dueDate = new Date(item.nextFollowupAt)
        const isOverdue = dueDate < new Date()
        const hoursUntilDue = Math.round((dueDate.getTime() - Date.now()) / (1000 * 60 * 60))
        
        return (
          <div className={`text-sm ${isOverdue ? 'text-red-600' : ''}`}>
            <div>{dueDate.toLocaleDateString()}</div>
            <div className="text-muted-foreground">
              {isOverdue ? 'Overdue' : `${hoursUntilDue}h remaining`}
            </div>
          </div>
        )
      }
    },
    {
      id: 'actions',
      header: 'Quick Actions',
      accessor: 'id' as keyof FollowupSubmissionDTO,
      cell: (item: FollowupSubmissionDTO) => {
        if (!item) return <div>-</div>
        return (
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8"
              onClick={() => handleSendFollowup(item.id, 'EMAIL')}
            >
              <MessageSquare className="h-3 w-3" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8"
              onClick={() => handleSendFollowup(item.id, 'WHATSAPP')}
            >
              <Phone className="h-3 w-3" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8"
              onClick={() => handleEscalate(item.id)}
            >
              <AlertTriangle className="h-3 w-3" />
            </Button>
          </div>
        )
      }
    }
  ]

  // Calculate stats for quick view
  const criticalItems = submissions.filter(s => getUrgencyLevel(s.agingDays, s.followupCount).level === 'Critical').length
  const overdueItems = submissions.filter(s => s.nextFollowupAt && new Date(s.nextFollowupAt) < new Date()).length
  const avgFollowups = submissions.length > 0 ? submissions.reduce((sum, s) => sum + s.followupCount, 0) / submissions.length : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Pending Feedback</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <MessageSquare className="mr-2 h-4 w-4" />
            Bulk Email
          </Button>
          <Button variant="outline" size="sm">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Bulk Escalate
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{submissions.length}</div>
            <p className="text-sm text-muted-foreground">Total Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{criticalItems}</div>
            <p className="text-sm text-muted-foreground">Critical Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{overdueItems}</div>
            <p className="text-sm text-muted-foreground">Overdue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{avgFollowups.toFixed(1)}</div>
            <p className="text-sm text-muted-foreground">Avg Follow-ups</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {submissions.filter(s => s.agingDays <= 2).length}
            </div>
            <p className="text-sm text-muted-foreground">Recent (&lt;= 2 days)</p>
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
              <label className="text-sm font-medium">Urgency Level</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All urgency levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Client</label>
              <Select onValueChange={(value) => setFilters(prev => ({ ...prev, clientId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client-001">TechCorp</SelectItem>
                  <SelectItem value="client-002">CloudSoft</SelectItem>
                  <SelectItem value="client-003">DataTech</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Recruiter</label>
              <Select onValueChange={(value) => setFilters(prev => ({ ...prev, recruiterId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All recruiters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rec-001">John Recruiter</SelectItem>
                  <SelectItem value="rec-002">Sarah Staffing</SelectItem>
                  <SelectItem value="rec-003">Mike Talent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Aging Days</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All aging ranges" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-2">0-2 days</SelectItem>
                  <SelectItem value="3-5">3-5 days</SelectItem>
                  <SelectItem value="6-7">6-7 days</SelectItem>
                  <SelectItem value="7+">7+ days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <DataTable
        data={submissions}
        columns={columns}
        loading={loading}
      />
    </div>
  )
}