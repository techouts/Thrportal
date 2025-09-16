import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChartKit } from '@/components/shared/ChartKit'
import { KPICard } from '@/components/shared/KPICard'
import { Target, TrendingUp, AlertTriangle, Users, Clock, Brain } from 'lucide-react'
import { pipelineService } from '@/services/pipelineService'
import { LeadershipInsight, ClientProgress } from '@/types/pipeline'

export function LeadershipViewTab() {
  const [insights, setInsights] = useState<LeadershipInsight[]>([])
  const [clientProgress, setClientProgress] = useState<ClientProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeadershipData()
  }, [])

  const loadLeadershipData = async () => {
    try {
      setLoading(true)
      const [insightsData, progressData] = await Promise.all([
        pipelineService.getLeadershipInsights(),
        pipelineService.getClientProgress()
      ])
      setInsights(insightsData)
      setClientProgress(progressData)
    } catch (error) {
      console.error('Failed to load leadership data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDrillDown = (clientId: string) => {
    // TODO: Navigate to client detail view
    console.log('Drill down to client:', clientId)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading leadership dashboard...</div>
  }

  const progressData = clientProgress.map(client => ({
    name: client.clientName,
    progress: client.progressPercent,
    filled: client.filledPositions,
    total: client.totalHeadcount
  }))

  const slaData = clientProgress.map(client => ({
    name: client.clientName,
    avgFeedbackTime: client.avgFeedbackTime,
    breaches: client.slaBreaches
  }))

  const forecastData = clientProgress.map(client => ({
    name: client.clientName,
    submissionsNeeded: client.forecast.submissionsNeeded,
    estimatedDays: client.forecast.estimatedCompletionDays
  }))

  const totalHeadcount = clientProgress.reduce((sum, client) => sum + client.totalHeadcount, 0)
  const totalFilled = clientProgress.reduce((sum, client) => sum + client.filledPositions, 0)
  const avgSLA = clientProgress.reduce((sum, client) => sum + client.avgFeedbackTime, 0) / clientProgress.length
  const totalBreaches = clientProgress.reduce((sum, client) => sum + client.slaBreaches, 0)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'default'
      default: return 'outline'
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'redistribution': return Users
      case 'sourcing': return Target
      case 'sla-breach': return AlertTriangle
      case 'forecast': return TrendingUp
      default: return Brain
    }
  }

  return (
    <div className="space-y-6">
      {/* Executive KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard
          title="Overall Progress"
          value={`${Math.round((totalFilled / totalHeadcount) * 100)}%`}
          description={`${totalFilled} of ${totalHeadcount} positions`}
          icon={Target}
        />
        <KPICard
          title="Avg Client SLA"
          value={`${avgSLA.toFixed(1)} days`}
          icon={Clock}
          variant={avgSLA > 3 ? 'destructive' : 'default'}
        />
        <KPICard
          title="SLA Breaches"
          value={totalBreaches}
          icon={AlertTriangle}
          variant={totalBreaches > 10 ? 'destructive' : 'default'}
        />
        <KPICard
          title="Active Insights"
          value={insights.filter(i => i.actionable).length}
          icon={Brain}
        />
      </div>

      {/* Client Closure Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Client Closure Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartKit
            type="bar"
            data={progressData}
            config={{
              xField: 'name',
              yField: 'progress',
              colorField: 'name'
            }}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client SLA Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Client SLA Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartKit
              type="scatter"
              data={slaData}
              config={{
                xField: 'avgFeedbackTime',
                yField: 'breaches',
                colorField: 'name'
              }}
            />
          </CardContent>
        </Card>

        {/* Forecast Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Completion Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartKit
              type="bar"
              data={forecastData}
              config={{
                xField: 'name',
                yField: 'estimatedDays',
                colorField: 'name'
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Client Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Client Progress Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clientProgress.map((client) => (
              <div key={client.clientId} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-lg">{client.clientName}</h4>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDrillDown(client.clientId)}
                  >
                    View Details
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <p className="font-semibold">{client.progressPercent}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Positions</p>
                    <p className="font-semibold">{client.filledPositions}/{client.totalHeadcount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Feedback Time</p>
                    <p className="font-semibold">{client.avgFeedbackTime} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">SLA Breaches</p>
                    <Badge variant={client.slaBreaches > 5 ? 'destructive' : 'default'}>
                      {client.slaBreaches}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Submissions Needed</p>
                    <p className="font-semibold">{client.forecast.submissionsNeeded}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Est. Completion</p>
                    <p className="font-semibold">{client.forecast.estimatedCompletionDays} days</p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${client.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strategic Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Strategic Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => {
              const IconComponent = getInsightIcon(insight.type)
              return (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5" />
                      <h4 className="font-semibold">{insight.title}</h4>
                    </div>
                    <Badge variant={getPriorityColor(insight.priority)}>
                      {insight.priority} priority
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-3">{insight.description}</p>
                  {insight.actionable && (
                    <Button variant="outline" size="sm">
                      Take Action
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}