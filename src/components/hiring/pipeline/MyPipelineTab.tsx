import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/shared/DataTable'
import { KPICard } from '@/components/shared/KPICard'
import { ChartKit } from '@/components/shared/ChartKit'
import { Calendar, Clock, CheckCircle, AlertCircle, Users, TrendingUp } from 'lucide-react'
import { pipelineService } from '@/services/pipelineService'
import { RecruiterPipelineStats, PipelineApplication } from '@/types/pipeline'

export function MyPipelineTab() {
  const [stats, setStats] = useState<RecruiterPipelineStats | null>(null)
  const [myApplications, setMyApplications] = useState<PipelineApplication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMyPipeline()
  }, [])

  const loadMyPipeline = async () => {
    try {
      setLoading(true)
      const [statsData, applicationsData] = await Promise.all([
        pipelineService.getRecruiterStats(),
        pipelineService.getMyApplications('current-user')
      ])
      setStats(statsData)
      setMyApplications(applicationsData)
    } catch (error) {
      console.error('Failed to load my pipeline:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    // TODO: Implement status update
    console.log('Update status:', applicationId, newStatus)
  }

  const handleScheduleInterview = async (applicationId: string) => {
    // TODO: Implement interview scheduling
    console.log('Schedule interview:', applicationId)
  }

  const handleSendReminder = async (applicationId: string) => {
    // TODO: Implement reminder sending
    console.log('Send reminder:', applicationId)
  }

  if (loading || !stats) {
    return <div className="flex items-center justify-center h-96">Loading your pipeline...</div>
  }

  const funnelData = [
    ...stats.funnel.asSubmitter.map(stage => ({
      name: stage.stage.replace('-', ' '),
      value: stage.count,
      type: 'Submitter'
    })),
    ...stats.funnel.asPrimary.map(stage => ({
      name: stage.stage.replace('-', ' '),
      value: stage.count,
      type: 'Primary'
    }))
  ]

  const columns = [
    {
      id: 'jdTitle',
      header: 'JD',
      accessor: 'jdTitle' as keyof PipelineApplication,
      cell: (value: any, row: PipelineApplication) => (
        <div>
          <div className="font-medium">{row.jdTitle}</div>
          <div className="text-sm text-muted-foreground">{row.client}</div>
        </div>
      )
    },
    {
      id: 'candidateName',
      header: 'Candidate',
      accessor: 'candidateName' as keyof PipelineApplication,
    },
    {
      id: 'currentStatus',
      header: 'Stage/Round',
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
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.ageing} days</span>
          {row.ageing > 7 && (
            <AlertCircle className="h-4 w-4 text-amber-500" />
          )}
        </div>
      )
    },
    {
      id: 'slaStatus',
      header: 'SLA',
      accessor: 'slaStatus' as keyof PipelineApplication,
      cell: (value: any, row: PipelineApplication) => (
        <Badge variant={row.slaStatus === 'overdue' ? 'destructive' : 
                       row.slaStatus === 'due-today' ? 'secondary' : 'default'}>
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
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleScheduleInterview(row.id)}
          >
            <Calendar className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleSendReminder(row.id)}
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard
          title="Active JDs"
          value={stats.activeJDs.toString()}
          icon={Users}
        />
        <KPICard
          title="Active Candidates"
          value={stats.activeCandidates.toString()}
          icon={Users}
        />
        <KPICard
          title="Shortlist Rate"
          value={`${stats.shortlistPercent}%`}
          icon={TrendingUp}
        />
        <KPICard
          title="Join Rate"
          value={`${stats.joinPercent}%`}
          icon={CheckCircle}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>My Pipeline Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartKit
              type="bar"
              data={funnelData}
              dataKey="value"
              xAxisKey="name"
            />
          </CardContent>
        </Card>

        {/* SLA Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle>SLA Heatmap</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                <span>Due Today</span>
              </div>
              <Badge variant="secondary">{stats.slaHeatmap.dueToday}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span>Overdue</span>
              </div>
              <Badge variant="destructive">{stats.slaHeatmap.overdue}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My To-Do */}
      <Card>
        <CardHeader>
          <CardTitle>My To-Do List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.todos.map((todo) => (
              <div key={todo.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{todo.description}</h4>
                  <p className="text-sm text-muted-foreground">
                    {todo.jdTitle} - {todo.candidateName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={todo.priority === 'high' ? 'destructive' : 
                                 todo.priority === 'medium' ? 'secondary' : 'default'}>
                    {todo.priority}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{todo.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* My Applications */}
      <Card>
        <CardHeader>
          <CardTitle>My Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={myApplications}
          />
        </CardContent>
      </Card>
    </div>
  )
}