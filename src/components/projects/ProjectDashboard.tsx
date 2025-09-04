import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
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
  Cell,
  PieChart,
  Pie
} from 'recharts'
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  AlertTriangle,
  Calendar,
  Target,
  Settings,
  Download,
  Filter,
  Clock,
  Percent,
  ArrowUpDown
} from 'lucide-react'
import { 
  mockDashboardMetrics,
  mockUtilizationData,
  mockRoleHeatmapData,
  mockRevenueData
} from '@/mocks/projectData'
import { KPICard } from '@/components/shared/KPICard'

export function ProjectDashboard() {
  console.log('📊 ProjectDashboard component rendering')
  
  const [includeShadow, setIncludeShadow] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [filters, setFilters] = useState({
    client: 'all',
    project: 'all',
    dateRange: '3m',
    resource: 'all',
    skill: 'all'
  })

  const metrics = mockDashboardMetrics
  const utilizationData = mockUtilizationData
  const roleData = mockRoleHeatmapData
  const revenueData = mockRevenueData

  const getUtilizationColor = (value: number) => {
    if (value >= 80) return 'hsl(var(--success))'
    if (value >= 60) return 'hsl(var(--warning))'
    return 'hsl(var(--destructive))'
  }

  const handleExport = () => {
    console.log(`Exporting data - Shadow Included: ${includeShadow ? 'Yes' : 'No'}`)
  }

  // Mock data for different tabs
  const financialData = [
    { period: 'Jan', planned_margin: 35, actual_margin: 32, billing_rate: 120, standard_rate: 100 },
    { period: 'Feb', planned_margin: 38, actual_margin: 35, billing_rate: 125, standard_rate: 100 },
    { period: 'Mar', planned_margin: 40, actual_margin: 38, billing_rate: 130, standard_rate: 100 },
  ]

  const benchData = [
    { period: 'Jan', bench_count: 12, avg_bench_days: 15, shadow_pct: 25, redeployment_rate: 85 },
    { period: 'Feb', bench_count: 8, avg_bench_days: 12, shadow_pct: 30, redeployment_rate: 90 },
    { period: 'Mar', bench_count: 6, avg_bench_days: 10, shadow_pct: 35, redeployment_rate: 95 },
  ]

  const utilizationBurnData = [
    { period: 'Jan', avg_util: 75, under_util: 15, over_util: 8, burn_rate: 40 },
    { period: 'Feb', avg_util: 78, under_util: 12, over_util: 10, burn_rate: 42 },
    { period: 'Mar', avg_util: 82, under_util: 10, over_util: 12, burn_rate: 45 },
  ]

  return (
    <div className="space-y-6">
      {/* Header with Global Controls */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive project analytics and reporting</p>
          <div className="flex items-center mt-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            Last refreshed: {new Date().toLocaleDateString()} at 6:00 AM
          </div>
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
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Global Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Select value={filters.client} onValueChange={(value) => setFilters(prev => ({ ...prev, client: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                <SelectItem value="acme">Acme Corp</SelectItem>
                <SelectItem value="techstart">TechStart Inc</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.project} onValueChange={(value) => setFilters(prev => ({ ...prev, project: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="project1">Mobile App</SelectItem>
                <SelectItem value="project2">Web Platform</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">Last Month</SelectItem>
                <SelectItem value="3m">Last 3 Months</SelectItem>
                <SelectItem value="6m">Last 6 Months</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.resource} onValueChange={(value) => setFilters(prev => ({ ...prev, resource: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Resource" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                <SelectItem value="dev">Developers</SelectItem>
                <SelectItem value="design">Designers</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.skill} onValueChange={(value) => setFilters(prev => ({ ...prev, skill: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Skill" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Skills</SelectItem>
                <SelectItem value="react">React</SelectItem>
                <SelectItem value="nodejs">Node.js</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="bench">Bench & Shadow</TabsTrigger>
          <TabsTrigger value="utilization">Utilization & Burn</TabsTrigger>
          <TabsTrigger value="reports">Custom Reports</TabsTrigger>
        </TabsList>

        {/* Management Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Active Projects"
              value={metrics.active_projects.toString()}
              description="+2 from last month"
              icon={<Users className="h-4 w-4" />}
              trend={{ direction: 'up', value: '12%', label: 'vs last month' }}
            />
            <KPICard
              title="Total Revenue"
              value={`$${(metrics.active_projects * 150000).toLocaleString()}`}
              description="Year to date"
              icon={<DollarSign className="h-4 w-4" />}
              trend={{ direction: 'up', value: '8%', label: 'vs last quarter' }}
            />
            <KPICard
              title="Gross Margin"
              value={`${metrics.estimated_margin_ytd}%`}
              description="Across all projects"
              icon={<TrendingUp className="h-4 w-4" />}
              trend={{ direction: 'up', value: '2%', label: 'vs target' }}
            />
            <KPICard
              title="Billable Utilization"
              value={`${metrics.core_utilization}%`}
              description="Core utilization rate"
              icon={<Target className="h-4 w-4" />}
              trend={{ direction: 'down', value: '3%', label: 'vs last month' }}
            />
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Revenue vs Cost vs Margin */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Revenue vs Cost vs Margin Trend
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
                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} name="Revenue" />
                    <Line type="monotone" dataKey="cost" stroke="hsl(var(--destructive))" strokeWidth={2} name="Cost" />
                    <Line type="monotone" dataKey="margin" stroke="hsl(var(--success))" strokeWidth={2} name="Margin" />
                    {includeShadow && (
                      <Line type="monotone" dataKey="shadow_cost" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" name="Shadow Cost" />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Client Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle>Top Clients by Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Acme Corp', revenue: 450000, projects: 3 },
                    { name: 'TechStart Inc', revenue: 320000, projects: 2 },
                    { name: 'Global Systems', revenue: 280000, projects: 4 },
                  ].map((client, index) => (
                    <div key={client.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="text-sm font-medium text-primary">#{index + 1}</div>
                        <div>
                          <div className="font-medium">{client.name}</div>
                          <div className="text-sm text-muted-foreground">{client.projects} projects</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${client.revenue.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Role Utilization Heatmap */}
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
        </TabsContent>

        {/* Financials Tab */}
        <TabsContent value="financials" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Planned vs Actual Margin"
              value="32% vs 35%"
              description="Actual exceeding plan"
              icon={<Target className="h-4 w-4" />}
              trend={{ direction: 'up', value: '3%', label: 'above plan' }}
            />
            <KPICard
              title="Avg Billing Rate"
              value="$125"
              description="vs $100 standard"
              icon={<DollarSign className="h-4 w-4" />}
              trend={{ direction: 'up', value: '25%', label: 'premium' }}
            />
            <KPICard
              title="Cost Variance"
              value="-5%"
              description="Under budget"
              icon={<ArrowUpDown className="h-4 w-4" />}
              trend={{ direction: 'down', value: '5%', label: 'savings' }}
            />
            <KPICard
              title="AR Outstanding"
              value="$85K"
              description="45 days average"
              icon={<AlertTriangle className="h-4 w-4" />}
              trend={{ direction: 'up', value: '12%', label: 'vs last month' }}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project P&L Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={financialData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="planned_margin" fill="hsl(var(--muted))" name="Planned Margin %" />
                    <Bar dataKey="actual_margin" fill="hsl(var(--primary))" name="Actual Margin %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing Rate vs Standard</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={financialData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, '']} />
                    <Line type="monotone" dataKey="billing_rate" stroke="hsl(var(--primary))" name="Billing Rate" />
                    <Line type="monotone" dataKey="standard_rate" stroke="hsl(var(--muted-foreground))" name="Standard Rate" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Bench & Shadow Tab */}
        <TabsContent value="bench" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Bench Headcount"
              value="8"
              description="Currently unallocated"
              icon={<Users className="h-4 w-4" />}
              trend={{ direction: 'down', value: '33%', label: 'vs last month' }}
            />
            <KPICard
              title="Avg Bench Days"
              value="12"
              description="Per resource"
              icon={<Calendar className="h-4 w-4" />}
              trend={{ direction: 'down', value: '20%', label: 'improvement' }}
            />
            <KPICard
              title="Shadow Workforce"
              value="35%"
              description="Of total allocation"
              icon={<Percent className="h-4 w-4" />}
              trend={{ direction: 'up', value: '5%', label: 'vs last quarter' }}
            />
            <KPICard
              title="Redeployment Rate"
              value="95%"
              description="Bench to active"
              icon={<Target className="h-4 w-4" />}
              trend={{ direction: 'up', value: '10%', label: 'vs target' }}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Bench Cost Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={benchData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="bench_count" stroke="hsl(var(--destructive))" name="Bench Count" />
                    <Line type="monotone" dataKey="avg_bench_days" stroke="hsl(var(--warning))" name="Avg Bench Days" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shadow Pipeline Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={benchData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, '']} />
                    <Area type="monotone" dataKey="shadow_pct" fill="hsl(var(--warning))" name="Shadow %" />
                    <Line type="monotone" dataKey="redeployment_rate" stroke="hsl(var(--success))" name="Redeployment Rate %" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Utilization & Burn Tab */}
        <TabsContent value="utilization" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Average Utilization"
              value="82%"
              description="Across all resources"
              icon={<Target className="h-4 w-4" />}
              trend={{ direction: 'up', value: '4%', label: 'vs last month' }}
            />
            <KPICard
              title="Under-utilized"
              value="10"
              description="Resources below 70%"
              icon={<AlertTriangle className="h-4 w-4" />}
              trend={{ direction: 'down', value: '17%', label: 'improvement' }}
            />
            <KPICard
              title="Over-utilized"
              value="12"
              description="Resources above 100%"
              icon={<TrendingUp className="h-4 w-4" />}
              trend={{ direction: 'up', value: '20%', label: 'vs last month' }}
            />
            <KPICard
              title="Burn Rate"
              value="45 hrs/week"
              description="Average per resource"
              icon={<Clock className="h-4 w-4" />}
              trend={{ direction: 'up', value: '7%', label: 'vs standard' }}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Utilization Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={utilizationBurnData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="under_util" fill="hsl(var(--destructive))" name="Under-utilized" />
                    <Bar dataKey="avg_util" fill="hsl(var(--success))" name="Optimal" />
                    <Bar dataKey="over_util" fill="hsl(var(--warning))" name="Over-utilized" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Burn Rate by Period</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={utilizationBurnData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} hrs/week`, '']} />
                    <Line type="monotone" dataKey="burn_rate" stroke="hsl(var(--primary))" strokeWidth={3} name="Burn Rate" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Custom Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom Report Generator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Report Type</Label>
                  <Select defaultValue="financial">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="financial">Financial Analysis</SelectItem>
                      <SelectItem value="utilization">Utilization Report</SelectItem>
                      <SelectItem value="bench">Bench Analysis</SelectItem>
                      <SelectItem value="shadow">Shadow Pipeline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Export Format</Label>
                  <Select defaultValue="excel">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleExport} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Export Note:</strong> All reports will include a header indicating "Shadow Included: {includeShadow ? 'Yes' : 'No'}" 
                  and reflect the current filter settings.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                  { category: 'Financial', metrics: ['Revenue', 'Cost', 'Margin', 'Billing Rates', 'AR Aging'] },
                  { category: 'Utilization', metrics: ['Core Util%', 'Effective Util%', 'Burn Rate', 'Overtime'] },
                  { category: 'Bench', metrics: ['Headcount', 'Avg Days', 'Cost/Day', 'Redeployment Rate'] },
                  { category: 'Shadow', metrics: ['Pipeline %', 'Conversion Rate', 'Time to Active', 'Role Distribution'] }
                ].map((section) => (
                  <div key={section.category} className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">{section.category}</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {section.metrics.map((metric) => (
                        <li key={metric}>• {metric}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}