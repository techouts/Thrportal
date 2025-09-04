import { useState, useEffect } from 'react'
import { Download, TrendingUp, Users, Clock, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/components/shared/DataTable'
import { ChartKit } from '@/components/shared/ChartKit'
import { Progress } from '@/components/ui/progress'
import { PipelineService } from '@/services/pipelineService'
import { PipelineMetrics, FunnelData, RecruiterPerformance, PipelineFilters } from '@/types/pipeline'
import { useToast } from '@/hooks/use-toast'

export function DashboardTab() {
  const [metrics, setMetrics] = useState<PipelineMetrics | null>(null)
  const [funnelData, setFunnelData] = useState<FunnelData[]>([])
  const [recruiterPerformance, setRecruiterPerformance] = useState<RecruiterPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<PipelineFilters>({})
  const { toast } = useToast()

  useEffect(() => {
    loadDashboardData()
  }, [filters])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [metricsData, funnelDataResult, recruiterData] = await Promise.all([
        PipelineService.getMetrics(filters),
        PipelineService.getFunnelData(filters),
        PipelineService.getRecruiterPerformance(filters)
      ])
      setMetrics(metricsData)
      setFunnelData(funnelDataResult)
      setRecruiterPerformance(recruiterData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const recruiterColumns = [
    {
      id: 'recruiterName',
      header: 'Recruiter Name',
      accessor: 'recruiterName' as keyof RecruiterPerformance
    },
    {
      id: 'submissions',
      header: 'Submissions',
      accessor: 'submissions' as keyof RecruiterPerformance
    },
    {
      id: 'l1Clears',
      header: 'L1 Clears',
      accessor: 'l1Clears' as keyof RecruiterPerformance
    },
    {
      id: 'offersMade',
      header: 'Offers Made',
      accessor: 'offersMade' as keyof RecruiterPerformance
    },
    {
      id: 'offersAccepted',
      header: 'Offers Accepted',
      accessor: 'offersAccepted' as keyof RecruiterPerformance
    },
    {
      id: 'avgTimeToOffer',
      header: 'Avg Time to Offer',
      accessor: 'avgTimeToOffer' as keyof RecruiterPerformance,
      cell: (item: RecruiterPerformance) => `${item.avgTimeToOffer} days`
    },
    {
      id: 'offerToJoinRatio',
      header: 'Offer-to-Join Ratio',
      accessor: 'offerToJoinRatio' as keyof RecruiterPerformance,
      cell: (item: RecruiterPerformance) => `${item.offerToJoinRatio}%`
    }
  ]

  // Transform daily submissions for chart
  const submissionTrendData = metrics?.dailySubmissions?.map(item => ({
    label: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: item.count
  })) || []

  // Transform funnel data for chart
  const funnelChartData = funnelData.map(item => ({
    label: item.stage,
    value: item.count
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Pipeline Dashboard</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Range</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="quarter">Quarter</SelectItem>
                  <SelectItem value="ytd">YTD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Client</label>
              <Select onValueChange={(value) => setFilters(prev => ({ ...prev, client: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TechCorp">TechCorp</SelectItem>
                  <SelectItem value="CloudSoft">CloudSoft</SelectItem>
                  <SelectItem value="DataTech">DataTech</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Recruiter</label>
              <Select onValueChange={(value) => setFilters(prev => ({ ...prev, recruiter: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All recruiters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="John Recruiter">John Recruiter</SelectItem>
                  <SelectItem value="Sarah Staffing">Sarah Staffing</SelectItem>
                  <SelectItem value="Mike Talent">Mike Talent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">JD Title</label>
              <Select onValueChange={(value) => setFilters(prev => ({ ...prev, jdTitle: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All JDs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="react-dev">Senior React Developer</SelectItem>
                  <SelectItem value="devops">DevOps Engineer</SelectItem>
                  <SelectItem value="data-scientist">Data Scientist</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Total Active JDs
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold">{metrics?.totalActiveJDs || 0}</div>
            <p className="text-sm text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Applications
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold">{metrics?.totalApplications || 0}</div>
            <p className="text-sm text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Avg Time to Offer
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold">{metrics?.avgTimeToOffer || 0} days</div>
            <p className="text-sm text-muted-foreground">-2.1 days from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Drop-off Rate</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold text-red-600">{metrics?.dropoffRate || 0}%</div>
            <p className="text-sm text-muted-foreground">+1.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Offer Acceptance</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold text-green-600">{metrics?.offerAcceptanceRatio || 0}%</div>
            <p className="text-sm text-muted-foreground">+3.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">JDs - No Submissions</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold text-orange-600">{metrics?.jdsWithNoSubmissions || 0}</div>
            <p className="text-sm text-muted-foreground">-2 from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Daily/Weekly Submission Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartKit type="line" data={submissionTrendData} dataKey="value" height={300} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Application Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {funnelData.map((stage, index) => (
                <div key={stage.stage} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{stage.stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{stage.count}</span>
                      <span className="text-sm font-medium">{stage.conversionRate.toFixed(1)}%</span>
                    </div>
                  </div>
                  <Progress value={stage.conversionRate} className="h-2" />
                  {stage.dropoffRate > 0 && (
                    <div className="text-xs text-red-600">
                      {stage.dropoffRate.toFixed(1)}% drop-off
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recruiter Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Recruiter Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={recruiterPerformance}
            columns={recruiterColumns}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  )
}