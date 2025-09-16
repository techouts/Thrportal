import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, Filter, TrendingUp, TrendingDown, AlertTriangle, Users, Clock, Target } from 'lucide-react'
import { ChartKit } from '@/components/shared/ChartKit'
import { KPICard } from '@/components/shared/KPICard'
import { DataTable } from '@/components/shared/DataTable'
import { pipelineService } from '@/services/pipelineService'
import { PipelineMetrics, PipelineFilters } from '@/types/pipeline'

export function PipelineDashboardTab() {
  const [metrics, setMetrics] = useState<PipelineMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<PipelineFilters>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    }
  })

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

  return (
    <div className="space-y-6">
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
    </div>
  )
}