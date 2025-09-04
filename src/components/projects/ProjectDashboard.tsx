import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts'
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  AlertTriangle,
  Calendar,
  Target,
  Settings
} from 'lucide-react'
import { 
  mockDashboardMetrics,
  mockUtilizationData,
  mockRoleHeatmapData,
  mockRevenueData
} from '@/mocks/projectData'

export function ProjectDashboard() {
  console.log('📊 ProjectDashboard component rendering')
  
  const [includeShadow, setIncludeShadow] = useState(false)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  const metrics = mockDashboardMetrics
  const utilizationData = mockUtilizationData
  const roleData = mockRoleHeatmapData
  const revenueData = mockRevenueData

  const getUtilizationColor = (value: number) => {
    if (value >= 80) return 'hsl(var(--success))'
    if (value >= 60) return 'hsl(var(--warning))'
    return 'hsl(var(--destructive))'
  }

  return (
    <div className="space-y-6">
      {/* Header with Global Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Dashboard</h1>
          <p className="text-muted-foreground">Overview of all project activities and metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="include-shadow"
              checked={includeShadow}
              onCheckedChange={setIncludeShadow}
            />
            <Label htmlFor="include-shadow">Include Shadow</Label>
          </div>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Layout
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.active_projects}</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Core Util%</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: getUtilizationColor(metrics.core_utilization) }}>
              {metrics.core_utilization}%
            </div>
            <p className="text-xs text-muted-foreground">Excludes Shadow & Bench</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Effective Util%</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: getUtilizationColor(metrics.effective_utilization) }}>
              {metrics.effective_utilization}%
            </div>
            <p className="text-xs text-muted-foreground">Includes Shadow</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bench Cost/Day</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.bench_cost_per_day.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Daily unallocated cost</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Est. Margin (YTD)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{metrics.estimated_margin_ytd}%</div>
            <p className="text-xs text-muted-foreground">Year to date margin</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{metrics.invoices_overdue}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue vs Cost vs Margin */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Revenue vs Cost vs Margin
              {includeShadow && <Badge variant="secondary">Shadow Included</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Revenue"
                />
                <Line 
                  type="monotone" 
                  dataKey="cost" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  name="Cost"
                />
                <Line 
                  type="monotone" 
                  dataKey="margin" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={2}
                  name="Margin"
                />
                {includeShadow && (
                  <Line 
                    type="monotone" 
                    dataKey="shadow_cost" 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Shadow Cost"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Utilization Split */}
        <Card>
          <CardHeader>
            <CardTitle>Utilization Split by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={utilizationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, '']} />
                <Area 
                  type="monotone" 
                  dataKey="billable" 
                  stackId="1"
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))"
                  name="Billable"
                />
                <Area 
                  type="monotone" 
                  dataKey="shadow" 
                  stackId="1"
                  stroke="hsl(var(--warning))" 
                  fill="hsl(var(--warning))"
                  name="Shadow"
                />
                <Area 
                  type="monotone" 
                  dataKey="bench" 
                  stackId="1"
                  stroke="hsl(var(--muted-foreground))" 
                  fill="hsl(var(--muted-foreground))"
                  name="Bench"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Role Heat Tiles */}
        <Card>
          <CardHeader>
            <CardTitle>Role Utilization Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={roleData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="role" type="category" width={80} />
                <Tooltip formatter={(value) => [`${value}%`, '']} />
                <Bar dataKey="billable_pct" stackId="1" fill="hsl(var(--primary))" name="Billable" />
                <Bar dataKey="shadow_pct" stackId="1" fill="hsl(var(--warning))" name="Shadow" />
                <Bar dataKey="bench_pct" stackId="1" fill="hsl(var(--muted-foreground))" name="Bench" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <Card>
        <CardContent className="py-4">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Last updated daily • Include Shadow: {includeShadow ? 'ON' : 'OFF'}</span>
            </div>
            <div>
              Dashboard refreshed at 6:00 AM daily
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}