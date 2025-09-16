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
      accessorKey: 'jdTitle',
      header: 'JD',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.jdTitle}</div>
          <div className="text-sm text-muted-foreground">{row.original.client}</div>
        </div>
      )
    },
    {
      accessorKey: 'candidateName',
      header: 'Candidate',
    },
    {
      accessorKey: 'currentStatus',
      header: 'Stage/Round',
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
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.original.ageing} days</span>
          {row.original.ageing > 7 && (
            <AlertCircle className="h-4 w-4 text-amber-500" />
          )}
        </div>
      )
    },
    {
      accessorKey: 'slaStatus',
      header: 'SLA',
      cell: ({ row }: any) => (
        <Badge variant={row.original.slaStatus === 'overdue' ? 'destructive' : 
                       row.original.slaStatus === 'due-today' ? 'secondary' : 'default'}>
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
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleScheduleInterview(row.original.id)}
          >
            <Calendar className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleSendReminder(row.original.id)}
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
          value={stats.activeJDs}
          icon={Users}
        />
        <KPICard
          title="Active Candidates"
          value={stats.activeCandidates}
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
              config={{
                xField: 'name',
                yField: 'value',
                colorField: 'type',
                stackField: 'type'
              }}
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