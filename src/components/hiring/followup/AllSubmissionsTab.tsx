import { useState, useEffect } from 'react'
import { Download, Filter, Calendar, Clock, MoreHorizontal, MessageSquare, AlertTriangle, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/components/shared/DataTable'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { FollowupService } from '@/services/followupService'
import { FollowupSubmissionDTO, FollowupFilters, FollowupStatus } from '@/types/followup'
import { useToast } from '@/hooks/use-toast'

export function AllSubmissionsTab() {
  const [submissions, setSubmissions] = useState<FollowupSubmissionDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FollowupFilters>({})
  const [selectedSubmission, setSelectedSubmission] = useState<FollowupSubmissionDTO | null>(null)
  const [followupNote, setFollowupNote] = useState('')
  const [nextFollowupDate, setNextFollowupDate] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    loadSubmissions()
  }, [filters])

  const loadSubmissions = async () => {
    try {
      setLoading(true)
      const data = await FollowupService.getSubmissions(filters)
      setSubmissions(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load submissions",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id: string, status: FollowupStatus) => {
    try {
      await FollowupService.updateSubmissionStatus(id, status)
      toast({
        title: "Success",
        description: "Status updated successfully"
      })
      loadSubmissions()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      })
    }
  }

  const handleScheduleFollowup = async () => {
    if (!selectedSubmission || !nextFollowupDate) return
    
    try {
      await FollowupService.scheduleFollowup(selectedSubmission.id, nextFollowupDate, followupNote)
      toast({
        title: "Success",
        description: "Follow-up scheduled successfully"
      })
      setSelectedSubmission(null)
      setFollowupNote('')
      setNextFollowupDate('')
      loadSubmissions()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule follow-up",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: FollowupStatus) => {
    const variants = {
      'SUBMITTED': { variant: 'secondary' as const, color: 'bg-blue-100 text-blue-700' },
      'AWAITING_FEEDBACK': { variant: 'outline' as const, color: 'bg-yellow-100 text-yellow-700' },
      'FEEDBACK_RECEIVED': { variant: 'default' as const, color: 'bg-green-100 text-green-700' },
      'REJECTED': { variant: 'destructive' as const, color: 'bg-red-100 text-red-700' },
      'ON_HOLD': { variant: 'outline' as const, color: 'bg-gray-100 text-gray-700' },
      'FOLLOWUP_SCHEDULED': { variant: 'outline' as const, color: 'bg-purple-100 text-purple-700' },
      'ESCALATED': { variant: 'destructive' as const, color: 'bg-red-200 text-red-800' },
      'CLOSED': { variant: 'outline' as const, color: 'bg-gray-100 text-gray-700' }
    }
    return variants[status] || { variant: 'secondary' as const, color: '' }
  }

  const getAgingBadge = (days: number) => {
    if (days > 7) return <Badge variant="destructive" className="text-xs">{days} days</Badge>
    if (days > 3) return <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">{days} days</Badge>
    return <Badge variant="outline" className="text-xs">{days} days</Badge>
  }

  const ScheduleFollowupDialog = ({ submission }: { submission: FollowupSubmissionDTO }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" onClick={() => setSelectedSubmission(submission)}>
          <Calendar className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Follow-up - {submission.candidateName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Next Follow-up Date</label>
            <Input
              type="datetime-local"
              value={nextFollowupDate}
              onChange={(e) => setNextFollowupDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Note (Optional)</label>
            <Textarea
              placeholder="Add a note about this follow-up..."
              value={followupNote}
              onChange={(e) => setFollowupNote(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelectedSubmission(null)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleFollowup}>
              Schedule Follow-up
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  const columns = [
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
      id: 'jdInfo',
      header: 'JD Code / Client',
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
      id: 'status',
      header: 'Status',
      accessor: 'status' as keyof FollowupSubmissionDTO,
      cell: (item: FollowupSubmissionDTO) => {
        if (!item) return <div>-</div>
        return (
          <Select
            value={item.status}
            onValueChange={(value: FollowupStatus) => handleStatusUpdate(item.id, value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue>
                <Badge className={getStatusBadge(item.status).color}>
                  {item.status.replace('_', ' ')}
                </Badge>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SUBMITTED">Submitted</SelectItem>
              <SelectItem value="AWAITING_FEEDBACK">Awaiting Feedback</SelectItem>
              <SelectItem value="FEEDBACK_RECEIVED">Feedback Received</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="ON_HOLD">On Hold</SelectItem>
              <SelectItem value="FOLLOWUP_SCHEDULED">Follow-up Scheduled</SelectItem>
              <SelectItem value="ESCALATED">Escalated</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
        )
      }
    },
    {
      id: 'submissionAt',
      header: 'Submitted',
      accessor: 'submissionAt' as keyof FollowupSubmissionDTO,
      cell: (item: FollowupSubmissionDTO) => {
        if (!item || !item.submissionAt) return <div>-</div>
        return new Date(item.submissionAt).toLocaleDateString()
      }
    },
    {
      id: 'aging',
      header: 'Aging',
      accessor: 'agingDays' as keyof FollowupSubmissionDTO,
      cell: (item: FollowupSubmissionDTO) => {
        if (!item || typeof item.agingDays !== 'number') return <div>-</div>
        return getAgingBadge(item.agingDays)
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
      id: 'nextFollowup',
      header: 'Next Follow-up',
      accessor: 'nextFollowupAt' as keyof FollowupSubmissionDTO,
      cell: (item: FollowupSubmissionDTO) => {
        if (!item || !item.nextFollowupAt) return <div>-</div>
        const date = new Date(item.nextFollowupAt)
        const isOverdue = date < new Date()
        return (
          <div className={isOverdue ? 'text-red-600' : ''}>
            {date.toLocaleDateString()}
            {isOverdue && <div className="text-xs">Overdue</div>}
          </div>
        )
      }
    },
    {
      id: 'flags',
      header: 'Flags',
      accessor: 'escalationFlag' as keyof FollowupSubmissionDTO,
      cell: (item: FollowupSubmissionDTO) => {
        if (!item) return <div>-</div>
        return (
          <div className="flex gap-1">
            {item.escalationFlag && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Escalated
              </Badge>
            )}
            {item.jdMatchScore && item.jdMatchScore > 80 && (
              <Badge variant="default" className="text-xs bg-green-100 text-green-700">
                High Match
              </Badge>
            )}
          </div>
        )
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'id' as keyof FollowupSubmissionDTO,
      cell: (item: FollowupSubmissionDTO) => {
        if (!item) return <div>-</div>
        return (
          <div className="flex items-center gap-1">
            <ScheduleFollowupDialog submission={item} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send Email
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Phone className="mr-2 h-4 w-4" />
                    WhatsApp
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Escalate
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      }
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">All Submissions</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{submissions.length}</div>
            <p className="text-sm text-muted-foreground">Total Submissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {submissions.filter(s => s.status === 'AWAITING_FEEDBACK').length}
            </div>
            <p className="text-sm text-muted-foreground">Awaiting Feedback</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {submissions.filter(s => s.escalationFlag).length}
            </div>
            <p className="text-sm text-muted-foreground">Escalated</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {submissions.filter(s => s.agingDays > 5).length}
            </div>
            <p className="text-sm text-muted-foreground">Aging &gt; 5 Days</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {submissions.filter(s => s.status === 'FEEDBACK_RECEIVED').length}
            </div>
            <p className="text-sm text-muted-foreground">Feedback Received</p>
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
              <label className="text-sm font-medium">JD Code</label>
              <Input 
                placeholder="Search JD..."
                onChange={(e) => setFilters(prev => ({ ...prev, jdCode: e.target.value || undefined }))}
              />
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
              <label className="text-sm font-medium">Status</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="AWAITING_FEEDBACK">Awaiting Feedback</SelectItem>
                  <SelectItem value="FEEDBACK_RECEIVED">Feedback Received</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="ESCALATED">Escalated</SelectItem>
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