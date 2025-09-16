import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/shared/DataTable'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Eye, MoreHorizontal, UserPlus, Send, Calendar, MessageSquare } from 'lucide-react'
import { pipelineService } from '@/services/pipelineService'
import { JDPipeline, PipelineApplication } from '@/types/pipeline'

export function JDPipelinesTab() {
  const [jdPipelines, setJdPipelines] = useState<JDPipeline[]>([])
  const [selectedJD, setSelectedJD] = useState<JDPipeline | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadJDPipelines()
  }, [])

  const loadJDPipelines = async () => {
    try {
      setLoading(true)
      const data = await pipelineService.getJDPipelines()
      setJdPipelines(data)
    } catch (error) {
      console.error('Failed to load JD pipelines:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadJDDetail = async (jdId: string) => {
    try {
      const detail = await pipelineService.getJDPipelineDetail(jdId)
      setSelectedJD(detail)
    } catch (error) {
      console.error('Failed to load JD detail:', error)
    }
  }

  const handleReassign = async (jdId: string) => {
    // TODO: Open reassignment modal
    console.log('Reassign JD:', jdId)
  }

  const handleSendReminder = async (jdId: string) => {
    // TODO: Open reminder modal
    console.log('Send reminder for JD:', jdId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'default'
      case 'pending': return 'secondary'
      case 'rejected': return 'destructive'
      default: return 'outline'
    }
  }

  const getSLAHealthColor = (health: string) => {
    switch (health) {
      case 'good': return 'default'
      case 'warning': return 'secondary'
      case 'critical': return 'destructive'
      default: return 'outline'
    }
  }

  const filteredJDs = jdPipelines.filter(jd =>
    jd.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jd.client.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const columns = [
    {
      id: 'title',
      header: 'JD Title',
      accessor: 'title' as keyof JDPipeline,
      cell: (value: any, row: JDPipeline) => (
        <div>
          <div className="font-medium">{row.title}</div>
          <div className="text-sm text-muted-foreground">{row.client}</div>
        </div>
      )
    },
    {
      id: 'approvalStatus',
      header: 'Approval Status',
      accessor: 'approvalStatus' as keyof JDPipeline,
      cell: (value: any, row: JDPipeline) => (
        <Badge variant={getStatusColor(row.approvalStatus)}>
          {row.approvalStatus}
        </Badge>
      )
    },
    {
      id: 'headcount',
      header: 'Headcount',
      accessor: 'headcountApproved' as keyof JDPipeline,
      cell: (value: any, row: JDPipeline) => (
        <div className="text-center">
          <div className="font-medium">{row.headcountApproved}</div>
          <div className="text-sm text-muted-foreground">
            {row.headcountRemaining} remaining
          </div>
        </div>
      )
    },
    {
      id: 'submissions',
      header: 'Submissions',
      accessor: 'submissions' as keyof JDPipeline,
      cell: (value: any, row: JDPipeline) => (
        <div className="font-medium">{row.submissions}</div>
      )
    },
    {
      id: 'shortlisted',
      header: 'Shortlisted',
      accessor: 'shortlisted' as keyof JDPipeline,
      cell: (value: any, row: JDPipeline) => (
        <div className="font-medium">{row.shortlisted}</div>
      )
    },
    {
      id: 'interviews',
      header: 'Interviews',
      accessor: 'interviews' as keyof JDPipeline,
      cell: (value: any, row: JDPipeline) => (
        <div className="font-medium">{row.interviews}</div>
      )
    },
    {
      id: 'offers',
      header: 'Offers',
      accessor: 'offers' as keyof JDPipeline,
      cell: (value: any, row: JDPipeline) => (
        <div className="font-medium">{row.offers}</div>
      )
    },
    {
      id: 'joins',
      header: 'Joins',
      accessor: 'joins' as keyof JDPipeline,
      cell: (value: any, row: JDPipeline) => (
        <div className="font-medium">{row.joins}</div>
      )
    },
    {
      id: 'slaHealth',
      header: 'SLA Health',
      accessor: 'slaHealth' as keyof JDPipeline,
      cell: (value: any, row: JDPipeline) => (
        <Badge variant={getSLAHealthColor(row.slaHealth)}>
          {row.slaHealth}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'id' as keyof JDPipeline,
      cell: (value: any, row: JDPipeline) => (
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => loadJDDetail(row.id)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[800px] sm:max-w-[800px]">
              <JDPipelineDetail jd={selectedJD} />
            </SheetContent>
          </Sheet>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleReassign(row.id)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Reassign
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSendReminder(row.id)}>
                <Send className="h-4 w-4 mr-2" />
                Send Reminder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>JD Pipeline Tracker</CardTitle>
          <div className="flex gap-4">
            <Input
              placeholder="Search JDs or clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredJDs}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function JDPipelineDetail({ jd }: { jd: JDPipeline | null }) {
  if (!jd) return <div>Loading JD details...</div>

  const applicationColumns = [
    {
      id: 'candidateName',
      header: 'Candidate',
      accessor: 'candidateName' as keyof PipelineApplication,
    },
    {
      id: 'currentStatus',
      header: 'Current Round/Stage',
      accessor: 'currentStatus' as keyof PipelineApplication,
      cell: (value: any, row: PipelineApplication) => (
        <div>
          <div className="font-medium">{row.currentStatus}</div>
          {row.currentRound && (
            <div className="text-sm text-muted-foreground">{row.currentRound}</div>
          )}
        </div>
      )
    },
    {
      id: 'ageing',
      header: 'Ageing',
      accessor: 'ageing' as keyof PipelineApplication,
      cell: (value: any, row: PipelineApplication) => (
        <div className="font-medium">{row.ageing} days</div>
      )
    },
    {
      id: 'primaryRecruiter',
      header: 'Owner',
      accessor: 'primaryRecruiter' as keyof PipelineApplication,
      cell: (value: any, row: PipelineApplication) => (
        <div>
          <div className="font-medium">{row.primaryRecruiter}</div>
          <div className="text-sm text-muted-foreground">Primary</div>
        </div>
      )
    },
    {
      id: 'slaStatus',
      header: 'SLA',
      accessor: 'slaStatus' as keyof PipelineApplication,
      cell: (value: any, row: PipelineApplication) => (
        <Badge variant={row.slaStatus === 'overdue' ? 'destructive' : 'default'}>
          {row.slaStatus}
        </Badge>
      )
    },
    {
      id: 'nextAction',
      header: 'Next Action',
      accessor: 'nextAction' as keyof PipelineApplication,
      cell: (value: any, row: PipelineApplication) => (
        <div className="text-sm">{row.nextAction}</div>
      )
    },
    {
      id: 'actions',
      header: 'Quick Actions',
      accessor: 'id' as keyof PipelineApplication,
      cell: (value: any, row: PipelineApplication) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm">
            <Calendar className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <SheetHeader>
        <SheetTitle>{jd.title} - Pipeline Detail</SheetTitle>
      </SheetHeader>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">JD Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Client:</span>
              <span className="font-medium">{jd.client}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Headcount:</span>
              <span className="font-medium">{jd.headcountApproved} ({jd.headcountRemaining} remaining)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Primary Recruiter:</span>
              <span className="font-medium">{jd.primaryRecruiter}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">SLA Health:</span>
              <Badge variant={getSLAHealthColor(jd?.slaHealth || 'good')}>{jd?.slaHealth || 'good'}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pipeline Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Submissions:</span>
              <span className="font-medium">{jd.submissions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shortlisted:</span>
              <span className="font-medium">{jd.shortlisted}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Interviews:</span>
              <span className="font-medium">{jd.interviews}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Offers:</span>
              <span className="font-medium">{jd.offers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Joins:</span>
              <span className="font-medium">{jd.joins}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Candidates Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={applicationColumns}
            data={jd.applications || []}
          />
        </CardContent>
      </Card>
    </div>
  )
}