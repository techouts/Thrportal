import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Filter, TrendingUp, TrendingDown, AlertTriangle, Users, Clock, Target, Award, Star } from 'lucide-react'
import { ChartKit } from '@/components/shared/ChartKit'
import { KPICard } from '@/components/shared/KPICard'
import { DataTable } from '@/components/shared/DataTable'
import { pipelineService } from '@/services/pipelineService'
import { PipelineMetrics, PipelineFilters } from '@/types/pipeline'

export function PipelineDashboardTab() {
  const [metrics, setMetrics] = useState<PipelineMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [activePanel, setActivePanel] = useState('overview')
  const [filters, setFilters] = useState<PipelineFilters>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    }
  })

  // Handle URL parameters for panels
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const panel = params.get('panel')
    if (panel === 'leadership' || panel === 'recruiter') {
      setActivePanel(panel)
    }
  }, [])

  useEffect(() => {
    loadMetrics()
  }, [filters])

  const loadMetrics = async () => {
    try {
      setLoading(true)
      const data = await pipelineService.getPipelineMetrics(filters)
      setMetrics(data)
    } catch (error) {
      console.error('Failed to load pipeline metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof PipelineFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  if (loading || !metrics) {
    return <div className="flex items-center justify-center h-96">Loading pipeline dashboard...</div>
  }

  const funnelData = metrics.globalFunnel.map(stage => ({
    name: stage.stage.replace('-', ' '),
    count: stage.count,
    conversion: stage.conversionRate
  }))

  const slaData = metrics.slaHealth.stageBreakdown.map(item => ({
    name: item.stage,
    onTime: item.onTime,
    overdue: item.overdue
  }))

  // Mock data for recruiter performance
  const recruiterPerformanceData = {
    targets: { submissions: 20, shortlists: 10, interviews: 5, offers: 2, joins: 1 },
    actuals: { submissions: 18, shortlists: 12, interviews: 6, offers: 2, joins: 1 },
    leaderboard: [
      { name: 'Alice Smith', score: 95, badge: 'Target Crusher' },
      { name: 'Bob Johnson', score: 87, badge: 'Consistent Performer' },
      { name: 'Current User', score: 82, badge: 'Rising Star' }
    ]
  }

  // Mock data for leadership insights
  const leadershipData = {
    clientProgress: [
      { client: 'TechCorp Inc', progress: 75, forecast: 85, gap: 10 },
      { client: 'InnovateCo', progress: 60, forecast: 70, gap: 15 }
    ],
    teamComparison: [
      { team: 'Team A', efficiency: 85, slaHealth: 90 },
      { team: 'Team B', efficiency: 78, slaHealth: 85 }
    ]
  }

  return (
    <div className="space-y-6">
      {/* Panel Switcher */}
      <Tabs value={activePanel} onValueChange={setActivePanel}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recruiter">Recruiter Performance</TabsTrigger>
          <TabsTrigger value="leadership">Leadership KPIs</TabsTrigger>
          <TabsTrigger value="insights">Insights & Nudges</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>Client</Label>
              <Select value={filters.client || 'all'} onValueChange={(value) => handleFilterChange('client', value === 'all' ? undefined : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  <SelectItem value="TechCorp Inc">TechCorp Inc</SelectItem>
                  <SelectItem value="InnovateCo">InnovateCo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>JD Title</Label>
              <Input 
                placeholder="Search JDs..."
                value={filters.jdTitle || ''}
                onChange={(e) => handleFilterChange('jdTitle', e.target.value || undefined)}
              />
            </div>
            <div>
              <Label>Recruiter</Label>
              <Select value={filters.recruiter || 'all'} onValueChange={(value) => handleFilterChange('recruiter', value === 'all' ? undefined : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Recruiters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Recruiters</SelectItem>
                  <SelectItem value="Alice Smith">Alice Smith</SelectItem>
                  <SelectItem value="Bob Johnson">Bob Johnson</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Start Date</Label>
              <Input 
                type="date"
                value={filters.dateRange?.start || ''}
                onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input 
                type="date"
                value={filters.dateRange?.end || ''}
                onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard
          title="Total Applications"
          value={metrics.totalApplications.toString()}
          trend={{ direction: 'up', value: '12%' }}
          icon={Users}
        />
        <KPICard
          title="Active JDs"
          value={metrics.totalJDs.toString()}
          trend={{ direction: 'up', value: '5%' }}
          icon={Target}
        />
        <KPICard
          title="SLA Health"
          value={`${metrics.slaHealth.onTimePercent}%`}
          trend={{ direction: 'down', value: '3%' }}
          icon={Clock}
        />
        <KPICard
          title="Headcount Progress"
          value={`${Math.round((metrics.headcountProgress.filled / metrics.headcountProgress.approved) * 100)}%`}
          trend={{ direction: 'up', value: '8%' }}
          icon={TrendingUp}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Global Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Global Pipeline Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartKit
              type="bar"
              data={funnelData}
              dataKey="count"
              xAxisKey="name"
            />
          </CardContent>
        </Card>

        {/* SLA Health */}
        <Card>
          <CardHeader>
            <CardTitle>SLA Health by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartKit
              type="bar"
              data={slaData}
              dataKey="onTime"
              xAxisKey="name"
            />
          </CardContent>
        </Card>
      </div>

      {/* Headcount Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Headcount Progress by Client</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.headcountProgress.byClient.map((client) => (
              <div key={client.client} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{client.client}</h4>
                  <p className="text-sm text-muted-foreground">
                    {client.filled} of {client.approved} positions filled
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-48 bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(client.filled / client.approved) * 100}%` }}
                    />
                  </div>
                  <Badge variant={client.remaining === 0 ? 'default' : 'secondary'}>
                    {client.remaining} remaining
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bottlenecks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Current Bottlenecks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.bottlenecks.map((bottleneck, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{bottleneck.stage}</h4>
                  <p className="text-sm text-muted-foreground">{bottleneck.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{bottleneck.count} items</p>
                  <p className="text-sm text-muted-foreground">{bottleneck.avgAgeing} days avg aging</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="recruiter" className="space-y-6">
          {/* Recruiter Performance Panel */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <KPICard
              title="Submissions"
              value={`${recruiterPerformanceData.actuals.submissions}/${recruiterPerformanceData.targets.submissions}`}
              trend={{ direction: 'up', value: '10%' }}
              icon={Users}
            />
            <KPICard
              title="Shortlists"
              value={`${recruiterPerformanceData.actuals.shortlists}/${recruiterPerformanceData.targets.shortlists}`}
              trend={{ direction: 'up', value: '20%' }}
              icon={Target}
            />
            <KPICard
              title="Interviews"
              value={`${recruiterPerformanceData.actuals.interviews}/${recruiterPerformanceData.targets.interviews}`}
              trend={{ direction: 'up', value: '20%' }}
              icon={Calendar}
            />
            <KPICard
              title="Joins"
              value={`${recruiterPerformanceData.actuals.joins}/${recruiterPerformanceData.targets.joins}`}
              trend={{ direction: 'up', value: '0%' }}
              icon={Award}
            />
          </div>

          {/* Performance Funnel Chart */}
          <Card>
            <CardHeader>
              <CardTitle>My Funnel Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartKit
                type="bar"
                data={[
                  { name: 'Submissions', target: recruiterPerformanceData.targets.submissions, actual: recruiterPerformanceData.actuals.submissions },
                  { name: 'Shortlists', target: recruiterPerformanceData.targets.shortlists, actual: recruiterPerformanceData.actuals.shortlists },
                  { name: 'Interviews', target: recruiterPerformanceData.targets.interviews, actual: recruiterPerformanceData.actuals.interviews },
                  { name: 'Offers', target: recruiterPerformanceData.targets.offers, actual: recruiterPerformanceData.actuals.offers },
                  { name: 'Joins', target: recruiterPerformanceData.targets.joins, actual: recruiterPerformanceData.actuals.joins }
                ]}
                dataKey="actual"
                xAxisKey="name"
              />
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Team Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recruiterPerformanceData.leaderboard.map((member, index) => (
                  <div key={member.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={index === 0 ? 'default' : 'secondary'}>
                        #{index + 1}
                      </Badge>
                      <div>
                        <h4 className="font-medium">{member.name}</h4>
                        <Badge variant="outline">{member.badge}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{member.score}%</p>
                      <p className="text-sm text-muted-foreground">Score</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leadership" className="space-y-6">
          {/* Leadership KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KPICard
              title="Overall Progress"
              value="68%"
              trend={{ direction: 'up', value: '5%' }}
              icon={TrendingUp}
            />
            <KPICard
              title="Team Efficiency"
              value="82%"
              trend={{ direction: 'up', value: '3%' }}
              icon={Users}
            />
            <KPICard
              title="SLA Health"
              value="85%"
              trend={{ direction: 'down', value: '2%' }}
              icon={Clock}
            />
          </div>

          {/* Client Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Client Closure Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leadershipData.clientProgress.map((client) => (
                  <div key={client.client} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{client.client}</h4>
                      <p className="text-sm text-muted-foreground">
                        Current: {client.progress}% | Forecast: {client.forecast}%
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-48 bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${client.progress}%` }}
                        />
                      </div>
                      <Badge variant={client.gap > 10 ? 'destructive' : 'secondary'}>
                        Gap: {client.gap}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Team Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartKit
                type="bar"
                data={leadershipData.teamComparison}
                dataKey="efficiency"
                xAxisKey="team"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* Insights & Nudges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Smart Insights & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-blue-50">
                  <h4 className="font-medium text-blue-900">Workload Redistribution</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Alice Smith has 15 active applications while Bob Johnson has only 5. Consider redistributing 3 applications.
                  </p>
                  <Button size="sm" className="mt-2">Redistribute</Button>
                </div>
                
                <div className="p-4 border rounded-lg bg-amber-50">
                  <h4 className="font-medium text-amber-900">Increase Sourcing</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    TechCorp Inc JDs have low submission rates. Consider increasing sourcing efforts or expanding search criteria.
                  </p>
                  <Button size="sm" className="mt-2">Review Sourcing</Button>
                </div>
                
                <div className="p-4 border rounded-lg bg-red-50">
                  <h4 className="font-medium text-red-900">Client Feedback Escalation</h4>
                  <p className="text-sm text-red-700 mt-1">
                    8 applications pending feedback for more than 5 days with InnovateCo. Consider escalating to client relationship manager.
                  </p>
                  <Button size="sm" className="mt-2">Escalate</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}