import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ChartKit } from '@/components/shared/ChartKit'
import { BarChart3, TrendingUp, Clock, AlertTriangle, Users, DollarSign } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { expensesService } from '@/services/expensesService'
import { TeamExpenseMetrics } from '@/types/expenses'

export function TeamExpenseDashboardTab() {
  const [metrics, setMetrics] = useState<TeamExpenseMetrics | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const data = await expensesService.getTeamDashboard('manager-001') // From auth context
      setMetrics(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load team expense metrics",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading dashboard...</div>
  }

  if (!metrics) {
    return <div>No data available</div>
  }

  const spendByCategoryData = Object.entries(metrics.spendByCategory).map(([category, amount]) => ({
    name: category,
    value: amount
  }))

  const agingData = Object.entries(metrics.agingBuckets).map(([bucket, count]) => ({
    name: bucket,
    value: count
  }))

  const reimbursableVsCorpData = [
    { name: 'Reimbursable', value: metrics.reimbursableVsCorp.reimbursable },
    { name: 'Corporate', value: metrics.reimbursableVsCorp.corporate }
  ]

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Team Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{metrics.totalSpend.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12% from last month</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{metrics.pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Requires your approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.teamMemberCount}</div>
            <p className="text-xs text-muted-foreground">
              Active team members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exceptions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.exceptionsCount}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">Need attention</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spend by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Spend by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartKit
              type="bar"
              data={spendByCategoryData}
              height={300}
              config={{
                xAxis: { dataKey: 'name' },
                bars: [{ dataKey: 'value', fill: 'hsl(var(--primary))' }]
              }}
            />
          </CardContent>
        </Card>

        {/* Reimbursable vs Corporate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Reimbursable vs Corporate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartKit
              type="pie"
              data={reimbursableVsCorpData}
              height={300}
              config={{
                dataKey: 'value',
                nameKey: 'name'
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Approval Times */}
        <Card>
          <CardHeader>
            <CardTitle>Approval Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Average Approval Time</span>
                <span className="font-medium">{metrics.averageApprovalTime} days</span>
              </div>
              <Progress value={75} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Target: 2 days or less
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>SLA Compliance</span>
                <span className="font-medium">87%</span>
              </div>
              <Progress value={87} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Approved within SLA timeframe
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Auto-Approval Rate</span>
                <span className="font-medium">65%</span>
              </div>
              <Progress value={65} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Claims approved without manual review
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Aging Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Approval Aging</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(metrics.agingBuckets).map(([bucket, count]) => (
                <div key={bucket} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={bucket.includes('15+') ? 'destructive' : bucket.includes('8-') ? 'default' : 'secondary'}>
                      {bucket}
                    </Badge>
                    <span className="text-sm">{count} claims</span>
                  </div>
                  <div className="text-sm font-medium">
                    {((count / Object.values(metrics.agingBuckets).reduce((a, b) => a + b, 0)) * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Unsubmitted Items</h4>
              <div className="text-2xl font-bold text-orange-600">{metrics.unsubmittedItems}</div>
              <p className="text-xs text-muted-foreground">
                Imported but not submitted
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Top Spending Category</h4>
              <div className="text-lg font-bold">
                {Object.entries(metrics.spendByCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                ₹{Object.entries(metrics.spendByCategory).sort((a, b) => b[1] - a[1])[0]?.[1]?.toLocaleString() || 0} this month
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Policy Exceptions</h4>
              <div className="text-2xl font-bold text-red-600">{metrics.exceptionsCount}</div>
              <p className="text-xs text-muted-foreground">
                Claims flagged for review
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}