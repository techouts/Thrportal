import { useState, useEffect } from 'react'
import { Download, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/components/shared/DataTable'
import { ChartKit } from '@/components/shared/ChartKit'
import { ApplicationsService } from '@/services/applicationsService'
import { ApplicationsMetrics, RecruiterStats, VendorStats, ApplicationsFilters } from '@/types/applications'
import { useToast } from '@/hooks/use-toast'

export function DashboardTab() {
  const [metrics, setMetrics] = useState<ApplicationsMetrics | null>(null)
  const [recruiterStats, setRecruiterStats] = useState<RecruiterStats[]>([])
  const [vendorStats, setVendorStats] = useState<VendorStats[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ApplicationsFilters>({})
  const { toast } = useToast()

  useEffect(() => {
    loadDashboardData()
  }, [filters])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [metricsData, recruiterData, vendorData] = await Promise.all([
        ApplicationsService.getMetrics(filters),
        ApplicationsService.getRecruiterStats(filters),
        ApplicationsService.getVendorStats(filters)
      ])
      setMetrics(metricsData)
      setRecruiterStats(recruiterData)
      setVendorStats(vendorData)
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

  const handleExport = async (type: 'jd' | 'recruiter' | 'vendor') => {
    try {
      switch (type) {
        case 'jd':
          await ApplicationsService.exportJDSummary(filters)
          break
        case 'recruiter':
          await ApplicationsService.exportRecruiterReport(filters)
          break
        case 'vendor':
          await ApplicationsService.exportVendorReport(filters)
          break
      }
      toast({
        title: "Success",
        description: "Export started. Download will begin shortly."
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive"
      })
    }
  }

  const recruiterColumns = [
    {
      id: 'recruiter',
      header: 'Recruiter',
      accessor: 'recruiter' as keyof RecruiterStats
    },
    {
      id: 'submissions',
      header: 'Submissions',
      accessor: 'submissions' as keyof RecruiterStats
    },
    {
      id: 'shortlisted',
      header: '# Shortlisted',
      accessor: 'shortlisted' as keyof RecruiterStats
    },
    {
      id: 'avgMatch',
      header: 'Avg Match %',
      accessor: 'avgMatch' as keyof RecruiterStats,
      cell: (item: RecruiterStats) => `${item.avgMatch}%`
    },
    {
      id: 'avgTATJdToFirst',
      header: 'Avg TAT JD→1st',
      accessor: 'avgTATJdToFirst' as keyof RecruiterStats,
      cell: (item: RecruiterStats) => `${item.avgTATJdToFirst}h`
    },
    {
      id: 'avgTATSubToFeedback',
      header: 'Avg TAT Sub→FB',
      accessor: 'avgTATSubToFeedback' as keyof RecruiterStats,
      cell: (item: RecruiterStats) => `${item.avgTATSubToFeedback}h`
    }
  ]

  const vendorColumns = [
    {
      id: 'vendor',
      header: 'Vendor',
      accessor: 'vendor' as keyof VendorStats
    },
    {
      id: 'submissions',
      header: 'Submissions',
      accessor: 'submissions' as keyof VendorStats
    },
    {
      id: 'shortlistPercent',
      header: 'Shortlist %',
      accessor: 'shortlistPercent' as keyof VendorStats,
      cell: (item: VendorStats) => `${item.shortlistPercent}%`
    },
    {
      id: 'avgMatch',
      header: 'Avg Match %',
      accessor: 'avgMatch' as keyof VendorStats,
      cell: (item: VendorStats) => `${item.avgMatch}%`
    },
    {
      id: 'duplicates',
      header: 'Duplicates',
      accessor: 'duplicates' as keyof VendorStats
    }
  ]

  // Mock chart data
  const submissionsOverTimeData = [
    { label: 'Jan', value: 45 },
    { label: 'Feb', value: 52 },
    { label: 'Mar', value: 38 },
    { label: 'Apr', value: 61 },
    { label: 'May', value: 48 },
    { label: 'Jun', value: 67 }
  ]

  const sourceSplitData = [
    { label: 'Internal', value: 45 },
    { label: 'Referral', value: 25 },
    { label: 'Vendor', value: 30 }
  ]

  const coverageData = [
    { label: 'Covered JDs', value: 68 },
    { label: 'Uncovered JDs', value: 32 }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Applications Dashboard</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('jd')}>
            <Download className="mr-2 h-4 w-4" />
            JD Summary (XLS/PDF)
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('recruiter')}>
            <Download className="mr-2 h-4 w-4" />
            Recruiter Report
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('vendor')}>
            <Download className="mr-2 h-4 w-4" />
            Vendor Scorecard
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
                  <SelectItem value="techcorp">TechCorp</SelectItem>
                  <SelectItem value="cloudsoft">CloudSoft</SelectItem>
                  <SelectItem value="datatech">DataTech</SelectItem>
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
                  <SelectItem value="john">John Recruiter</SelectItem>
                  <SelectItem value="sarah">Sarah Staffing</SelectItem>
                  <SelectItem value="mike">Mike Talent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Source</label>
              <Select onValueChange={(value) => setFilters(prev => ({ ...prev, source: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Internal">Internal</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                  <SelectItem value="Vendor">Vendor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Applications</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-3xl font-bold">{metrics?.totalApplications || 0}</div>
            <p className="text-sm text-muted-foreground mt-1">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg JD↔Resume Match %</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-3xl font-bold">{metrics?.avgMatch || 0}%</div>
            <p className="text-sm text-muted-foreground mt-1">+3.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">JD Coverage (≥1 Submission)</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-3xl font-bold">{metrics?.coverage || 0}%</div>
            <p className="text-sm text-muted-foreground mt-1">-1.5% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Submissions Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartKit type="line" data={submissionsOverTimeData} dataKey="value" height={300} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Resume Source Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartKit type="pie" data={sourceSplitData} dataKey="value" height={300} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>JD Coverage Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartKit type="bar" data={coverageData} dataKey="value" height={300} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Skill Match Components</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              Radar chart placeholder
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
            data={recruiterStats}
            columns={recruiterColumns}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Vendor Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={vendorStats}
            columns={vendorColumns}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  )
}