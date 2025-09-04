import { useState, useEffect } from 'react'
import { Download, TrendingUp, Clock, AlertTriangle, Users, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/components/shared/DataTable'
import { ChartKit } from '@/components/shared/ChartKit'
import { Badge } from '@/components/ui/badge'
import { FollowupService } from '@/services/followupService'
import { DashboardSummaryDTO, FollowupFilters } from '@/types/followup'
import { useToast } from '@/hooks/use-toast'

export function DashboardTab() {
  const [summary, setSummary] = useState<DashboardSummaryDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FollowupFilters>({})
  const { toast } = useToast()

  useEffect(() => {
    loadDashboardData()
  }, [filters])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const data = await FollowupService.getDashboardSummary(filters)
      setSummary(data)
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

  const agingBucketData = summary?.agingBuckets?.map(bucket => ({
    label: bucket.range,
    value: bucket.count
  })) || []

  const recruiterColumns = [
    {
      id: 'recruiter',
      header: 'Recruiter',
      accessor: 'recruiter' as const
    },
    {
      id: 'total',
      header: 'Total Submissions',
      accessor: 'total' as const
    },
    {
      id: 'feedbackPct',
      header: 'Feedback %',
      accessor: 'feedbackPct' as const,
      cell: (item: any) => {
        if (!item) return <div>-</div>
        const pct = item.feedbackPct
        const color = pct >= 80 ? 'text-green-600' : pct >= 60 ? 'text-yellow-600' : 'text-red-600'
        return <span className={color}>{pct}%</span>
      }
    },
    {
      id: 'avgFollowups',
      header: 'Avg Follow-ups',
      accessor: 'avgFollowups' as const
    },
    {
      id: 'agingGt5',
      header: 'Aging >5 Days',
      accessor: 'agingGt5' as const,
      cell: (item: any) => {
        if (!item) return <div>-</div>
        return item.agingGt5 > 10 ? 
          <Badge variant="destructive" className="text-xs">{item.agingGt5}</Badge> :
          <Badge variant="outline" className="text-xs">{item.agingGt5}</Badge>
      }
    }
  ]

  const clientColumns = [
    {
      id: 'clientName',
      header: 'Client Name',
      accessor: 'clientName' as const
    },
    {
      id: 'avgDaysToFeedback',
      header: 'Avg Days to Feedback',
      accessor: 'avgDaysToFeedback' as const,
      cell: (item: any) => {
        if (!item) return <div>-</div>
        const days = item.avgDaysToFeedback
        const color = days <= 3 ? 'text-green-600' : days <= 5 ? 'text-yellow-600' : 'text-red-600'
        return <span className={color}>{days} days</span>
      }
    },
    {
      id: 'noFeedbackRatePct',
      header: 'No Feedback Rate',
      accessor: 'noFeedbackRatePct' as const,
      cell: (item: any) => {
        if (!item) return <div>-</div>
        const pct = item.noFeedbackRatePct
        const color = pct <= 15 ? 'text-green-600' : pct <= 25 ? 'text-yellow-600' : 'text-red-600'
        return <span className={color}>{pct}%</span>
      }
    },
    {
      id: 'escalations',
      header: 'Escalations',
      accessor: 'escalations' as const,
      cell: (item: any) => {
        if (!item) return <div>-</div>
        return item.escalations > 5 ? 
          <Badge variant="destructive" className="text-xs">{item.escalations}</Badge> :
          <Badge variant="outline" className="text-xs">{item.escalations}</Badge>
      }
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Follow-up Dashboard</h2>
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
              <Select onValueChange={(value) => setFilters(prev => ({ ...prev, clientId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client-001">TechCorp</SelectItem>
                  <SelectItem value="client-002">CloudSoft</SelectItem>
                  <SelectItem value="client-003">DataTech</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Recruiter</label>
              <Select onValueChange={(value) => setFilters(prev => ({ ...prev, recruiterId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All recruiters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rec-001">John Recruiter</SelectItem>
                  <SelectItem value="rec-002">Sarah Staffing</SelectItem>
                  <SelectItem value="rec-003">Mike Talent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">JD Code</label>
              <Select onValueChange={(value) => setFilters(prev => ({ ...prev, jdCode: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All JDs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JD-2024-001">JD-2024-001</SelectItem>
                  <SelectItem value="JD-2024-002">JD-2024-002</SelectItem>
                  <SelectItem value="JD-2024-003">JD-2024-003</SelectItem>
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
              <Users className="h-4 w-4" />
              Month Submissions
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold">{summary?.monthSubmissions || 0}</div>
            <p className="text-sm text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Feedback Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold text-green-600">{summary?.feedbackPct || 0}%</div>
            <p className="text-sm text-muted-foreground">+3.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Avg Days to Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold">{summary?.avgDaysToFeedback || 0} days</div>
            <p className="text-sm text-muted-foreground">-0.8 days from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Escalated
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold text-red-600">{summary?.escalatedCount || 0}</div>
            <p className="text-sm text-muted-foreground">+3 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aging &gt; 5 Days</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold text-orange-600">{summary?.agingGt5Count || 0}</div>
            <p className="text-sm text-muted-foreground">-5 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Due Soon</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold">{summary?.dueSoon?.length || 0}</div>
            <p className="text-sm text-muted-foreground">Next 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Aging Buckets Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartKit type="pie" data={agingBucketData} dataKey="value" height={300} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Due Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary?.dueSoon && summary.dueSoon.length > 0 ? (
                summary.dueSoon.map((item) => (
                  <div key={item.submissionId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{item.candidate}</div>
                      <div className="text-sm text-muted-foreground">{item.jdCode}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        Due: {new Date(item.due).toLocaleDateString()}
                      </div>
                      {item.lastAction && (
                        <div className="text-xs text-muted-foreground">{item.lastAction}</div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No items due soon</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recruiter Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Recruiter Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={summary?.recruiterTable || []}
            columns={recruiterColumns}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Client TAT Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Client TAT Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={summary?.clientTable || []}
            columns={clientColumns}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  )
}