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
      accessorKey: 'title',
      header: 'JD Title',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.title}</div>
          <div className="text-sm text-muted-foreground">{row.original.client}</div>
        </div>
      )
    },
    {
      accessorKey: 'approvalStatus',
      header: 'Approval Status',
      cell: ({ row }: any) => (
        <Badge variant={getStatusColor(row.original.approvalStatus)}>
          {row.original.approvalStatus}
        </Badge>
      )
    },
    {
      accessorKey: 'headcount',
      header: 'Headcount',
      cell: ({ row }: any) => (
        <div className="text-center">
          <div className="font-medium">{row.original.headcountApproved}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.headcountRemaining} remaining
          </div>
        </div>
      )
    },
    {
      accessorKey: 'submissions',
      header: 'Submissions',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.submissions}</div>
      )
    },
    {
      accessorKey: 'shortlisted',
      header: 'Shortlisted',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.shortlisted}</div>
      )
    },
    {
      accessorKey: 'interviews',
      header: 'Interviews',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.interviews}</div>
      )
    },
    {
      accessorKey: 'offers',
      header: 'Offers',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.offers}</div>
      )
    },
    {
      accessorKey: 'joins',
      header: 'Joins',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.joins}</div>
      )
    },
    {
      accessorKey: 'slaHealth',
      header: 'SLA Health',
      cell: ({ row }: any) => (
        <Badge variant={getSLAHealthColor(row.original.slaHealth)}>
          {row.original.slaHealth}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => loadJDDetail(row.original.id)}
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
              <DropdownMenuItem onClick={() => handleReassign(row.original.id)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Reassign
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSendReminder(row.original.id)}>
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
      accessorKey: 'candidateName',
      header: 'Candidate',
    },
    {
      accessorKey: 'currentStatus',
      header: 'Current Round/Stage',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.currentStatus}</div>
          {row.original.currentRound && (
            <div className="text-sm text-muted-foreground">{row.original.currentRound}</div>
          )}
        </div>
      )
    },
    {
      accessorKey: 'ageing',
      header: 'Ageing',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.ageing} days</div>
      )
    },
    {
      accessorKey: 'primaryRecruiter',
      header: 'Owner',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.primaryRecruiter}</div>
          <div className="text-sm text-muted-foreground">Primary</div>
        </div>
      )
    },
    {
      accessorKey: 'slaStatus',
      header: 'SLA',
      cell: ({ row }: any) => (
        <Badge variant={row.original.slaStatus === 'overdue' ? 'destructive' : 'default'}>
          {row.original.slaStatus}
        </Badge>
      )
    },
    {
      accessorKey: 'nextAction',
      header: 'Next Action',
      cell: ({ row }: any) => (
        <div className="text-sm">{row.original.nextAction}</div>
      )
    },
    {
      id: 'actions',
      header: 'Quick Actions',
      cell: ({ row }: any) => (
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
              <Badge variant={getSLAHealthColor(jd.slaHealth)}>{jd.slaHealth}</Badge>
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