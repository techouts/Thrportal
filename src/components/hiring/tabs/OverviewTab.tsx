import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, TrendingDown, Clock, AlertTriangle } from 'lucide-react'
import { hiringService } from '@/services/hiringService'
import type { DashboardStats, AgingBucket, Client, HiringFilters } from '@/types/hiring'

interface OverviewTabProps {
  filters: HiringFilters
}

export function OverviewTab({ filters }: OverviewTabProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [agingBuckets, setAgingBuckets] = useState<AgingBucket[]>([])
  const [topClients, setTopClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [statsData, agingData, clientsData] = await Promise.all([
          hiringService.getDashboardStats(filters),
          hiringService.getAgingBuckets(),
          hiringService.getClients()
        ])
        
        setStats(statsData)
        setAgingBuckets(agingData)
        setTopClients(clientsData.slice(0, 5))
      } catch (error) {
        console.error('Failed to load overview data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [filters])

  const funnelData = [
    { stage: 'JDs Created', count: stats?.totalJDs || 0 },
    { stage: 'Submissions', count: stats?.weeklySubmissions || 0 },
    { stage: 'Interviews', count: Math.floor((stats?.weeklySubmissions || 0) * 0.4) },
    { stage: 'Offers', count: Math.floor((stats?.weeklySubmissions || 0) * 0.15) },
    { stage: 'Joined', count: Math.floor((stats?.weeklySubmissions || 0) * 0.08) }
  ]

  const priorityData = [
    { name: 'Urgent', value: 8, color: '#FF6B6B' },
    { name: 'Normal', value: 15, color: '#2E5BFF' },
    { name: 'Bulk', value: 12, color: '#30C85A' }
  ]

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Active JDs</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.activeJDs}</p>
                <p className="text-xs text-blue-700 dark:text-blue-300">of {stats.totalJDs} total</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Today's Submissions</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.todaySubmissions}</p>
                <p className="text-xs text-green-700 dark:text-green-300">{stats.weeklySubmissions} this week</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Avg TAT</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.avgTAT} days</p>
                <p className="text-xs text-orange-700 dark:text-orange-300">End to end</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">SLA Breaches</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.slaBreaches}</p>
                <p className="text-xs text-red-700 dark:text-red-300">{stats.pendingFeedbacks} pending</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* JD Funnel Chart */}
        <Card>
          <CardHeader>
            <CardTitle>JD Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={funnelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#2E5BFF" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* JD Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>JD Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Aging Buckets and Top Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* JD Aging Buckets */}
        <Card>
          <CardHeader>
            <CardTitle>JD Aging Buckets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agingBuckets.map((bucket, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant={index === 0 ? "default" : index === 3 ? "destructive" : "secondary"}>
                      {bucket.range}
                    </Badge>
                    <span className="text-sm font-medium">{bucket.count} JDs</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-primary" 
                        style={{ width: `${bucket.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">{bucket.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top 5 Clients */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topClients.map((client, index) => (
                <div key={client.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-muted-foreground">{client.activeJDs} active JDs</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{client.jdCount}</p>
                    <p className="text-sm text-muted-foreground">total JDs</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}