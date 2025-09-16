import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Users, 
  DollarSign, 
  AlertCircle,
  Download,
  RefreshCw,
  Calendar,
  Filter,
  Settings,
  BarChart3
} from 'lucide-react';
import { KPICard } from '@/components/shared/KPICard';
import { useAuth } from '@/auth/AuthContext';
import { useVisible } from '@/hooks/useVisible';

interface AnalyticsDashboardProps {
  className?: string;
}

export function AnalyticsDashboard({ className = "" }: AnalyticsDashboardProps) {
  const { can } = useAuth();
  const [timeRange, setTimeRange] = useState('3m');
  const [includeProjections, setIncludeProjections] = useState(false);
  const [activeMetrics, setActiveMetrics] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Permission checks for different analytics sections
  const canViewFinancials = useVisible(['finance.reports.read', 'analytics.financials', 'reports.*']);
  const canViewProjections = useVisible(['analytics.projections', 'management.*', 'reports.*']);
  const canExportAnalytics = useVisible(['analytics.export', 'reports.export', 'reports.*']);

  // Mock analytics data - in real app, this would come from API based on timeRange
  const kpiData = {
    totalRevenue: 2840000,
    revenueGrowth: 12.5,
    activeProjects: 18,
    projectsGrowth: -2.8,
    utilization: 78.5,
    utilizationGrowth: 5.2,
    clientSatisfaction: 4.6,
    satisfactionGrowth: 8.7
  };

  const revenueData = [
    { month: 'Jan', revenue: 234000, projectedRevenue: 240000, cost: 180000, margin: 54000 },
    { month: 'Feb', revenue: 267000, projectedRevenue: 265000, cost: 195000, margin: 72000 },
    { month: 'Mar', revenue: 298000, projectedRevenue: 295000, cost: 215000, margin: 83000 },
    { month: 'Apr', revenue: 285000, projectedRevenue: 290000, cost: 210000, margin: 75000 },
    { month: 'May', revenue: 315000, projectedRevenue: 320000, cost: 225000, margin: 90000 },
    { month: 'Jun', revenue: 342000, projectedRevenue: 345000, cost: 240000, margin: 102000 }
  ];

  const utilizationData = [
    { department: 'Engineering', billable: 82, shadow: 12, bench: 6 },
    { department: 'Design', billable: 75, shadow: 15, bench: 10 },
    { department: 'Data Science', billable: 88, shadow: 8, bench: 4 },
    { department: 'QA', billable: 70, shadow: 20, bench: 10 },
    { department: 'DevOps', billable: 85, shadow: 10, bench: 5 }
  ];

  const clientEngagementData = [
    { metric: 'Health Score', current: 4.2, target: 4.5, benchmark: 3.8 },
    { metric: 'SLA Compliance', current: 96, target: 98, benchmark: 92 },
    { metric: 'Response Time (hrs)', current: 8, target: 6, benchmark: 12 },
    { metric: 'Renewal Rate', current: 89, target: 95, benchmark: 85 }
  ];

  const projectPerformanceData = [
    { status: 'On Track', count: 12, percentage: 67 },
    { status: 'At Risk', count: 4, percentage: 22 },
    { status: 'Delayed', count: 2, percentage: 11 }
  ];

  const hiringMetricsData = [
    { month: 'Jan', hires: 8, applications: 145, timeToHire: 28 },
    { month: 'Feb', hires: 12, applications: 178, timeToHire: 25 },
    { month: 'Mar', hires: 15, applications: 203, timeToHire: 22 },
    { month: 'Apr', hires: 10, applications: 167, timeToHire: 30 },
    { month: 'May', hires: 18, applications: 234, timeToHire: 20 },
    { month: 'Jun', hires: 22, applications: 289, timeToHire: 18 }
  ];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--success))'];

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const handleExport = () => {
    // Simulate export functionality
    console.log('Exporting analytics data...');
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Real-time business intelligence and performance metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          
          {canViewProjections && (
            <div className="flex items-center space-x-2">
              <Switch
                id="projections"
                checked={includeProjections}
                onCheckedChange={setIncludeProjections}
              />
              <Label htmlFor="projections" className="text-sm">Include Projections</Label>
            </div>
          )}
          
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {canExportAnalytics && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Revenue"
          value={`$${(kpiData.totalRevenue / 1000000).toFixed(1)}M`}
          description={`${timeRange === '1m' ? 'This month' : `Last ${timeRange}`}`}
          icon={<DollarSign className="h-4 w-4" />}
          trend={{
            direction: kpiData.revenueGrowth > 0 ? 'up' : 'down',
            value: `${Math.abs(kpiData.revenueGrowth)}%`,
            label: 'vs previous period'
          }}
        />
        
        <KPICard
          title="Active Projects"
          value={kpiData.activeProjects.toString()}
          description="Currently in progress"
          icon={<Target className="h-4 w-4" />}
          trend={{
            direction: kpiData.projectsGrowth > 0 ? 'up' : 'down',
            value: `${Math.abs(kpiData.projectsGrowth)}%`,
            label: 'vs previous period'
          }}
        />
        
        <KPICard
          title="Avg Utilization"
          value={`${kpiData.utilization}%`}
          description="Billable utilization rate"
          icon={<Users className="h-4 w-4" />}
          trend={{
            direction: kpiData.utilizationGrowth > 0 ? 'up' : 'down',
            value: `${Math.abs(kpiData.utilizationGrowth)}%`,
            label: 'vs previous period'
          }}
        />
        
        <KPICard
          title="Client Satisfaction"
          value={kpiData.clientSatisfaction.toString()}
          description="Average rating (5.0 scale)"
          icon={<TrendingUp className="h-4 w-4" />}
          trend={{
            direction: kpiData.satisfactionGrowth > 0 ? 'up' : 'down',
            value: `${Math.abs(kpiData.satisfactionGrowth)}%`,
            label: 'vs previous period'
          }}
        />
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeMetrics} onValueChange={setActiveMetrics} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="hiring">Hiring</TabsTrigger>
          {canViewFinancials && <TabsTrigger value="financial">Financial</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Revenue & Margin Trend
                  {includeProjections && <Badge variant="secondary">Projections Included</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stackId="1" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))"
                      fillOpacity={0.6}
                      name="Revenue"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="margin" 
                      stackId="2" 
                      stroke="hsl(var(--success))" 
                      fill="hsl(var(--success))"
                      fillOpacity={0.6}
                      name="Margin"
                    />
                    {includeProjections && (
                      <Area 
                        type="monotone" 
                        dataKey="projectedRevenue" 
                        stroke="hsl(var(--muted-foreground))" 
                        fill="none"
                        strokeDasharray="5 5"
                        name="Projected Revenue"
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Utilization by Department */}
            <Card>
              <CardHeader>
                <CardTitle>Utilization by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={utilizationData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="department" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="billable" stackId="1" fill="hsl(var(--primary))" name="Billable" />
                    <Bar dataKey="shadow" stackId="1" fill="hsl(var(--warning))" name="Shadow" />
                    <Bar dataKey="bench" stackId="1" fill="hsl(var(--muted))" name="Bench" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Project Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={projectPerformanceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      label={({ status, percentage }) => `${status}: ${percentage}%`}
                    >
                      {projectPerformanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clientEngagementData.map((metric, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{metric.metric}</span>
                        <span className="font-medium">{metric.current}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${(metric.current / metric.target) * 100}%`,
                            maxWidth: '100%'
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Target: {metric.target}</span>
                        <span>Industry: {metric.benchmark}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 border rounded-lg">
                    <AlertCircle className="h-4 w-4 text-warning mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium">2 Projects At Risk</div>
                      <div className="text-muted-foreground">Review timeline and resources</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 border rounded-lg">
                    <TrendingDown className="h-4 w-4 text-destructive mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium">Utilization Below Target</div>
                      <div className="text-muted-foreground">QA team at 70% utilization</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 border rounded-lg">
                    <TrendingUp className="h-4 w-4 text-success mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium">Strong Client Growth</div>
                      <div className="text-muted-foreground">3 new clients this month</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          {/* Project-specific analytics */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Timeline Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Delivered Value"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cost" 
                      stroke="hsl(var(--destructive))" 
                      strokeWidth={2}
                      name="Project Cost"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Allocation Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={utilizationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="billable" fill="hsl(var(--primary))" name="Billable %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          {/* Client-specific analytics */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Client Health Score Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey={(data) => 4.2 + Math.sin(data.month.charCodeAt(0)) * 0.3} 
                      stroke="hsl(var(--success))" 
                      strokeWidth={2}
                      name="Avg Health Score"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Frequency</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hiringMetricsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="applications" fill="hsl(var(--primary))" name="Client Interactions" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hiring" className="space-y-6">
          {/* Hiring-specific analytics */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Hiring Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={hiringMetricsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="hires" 
                      stroke="hsl(var(--success))" 
                      strokeWidth={2}
                      name="Successful Hires"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="timeToHire" 
                      stroke="hsl(var(--warning))" 
                      strokeWidth={2}
                      name="Time to Hire (days)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Application to Hire Conversion</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={hiringMetricsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="applications" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                      name="Applications"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="hires" 
                      stroke="hsl(var(--success))" 
                      fill="hsl(var(--success))"
                      fillOpacity={0.6}
                      name="Hires"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {canViewFinancials && (
          <TabsContent value="financial" className="space-y-6">
            {/* Financial analytics */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>P&L Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="hsl(var(--success))" 
                        fill="hsl(var(--success))"
                        fillOpacity={0.6}
                        name="Revenue"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="cost" 
                        stroke="hsl(var(--destructive))" 
                        fill="hsl(var(--destructive))"
                        fillOpacity={0.6}
                        name="Cost"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Margin Analysis by Project</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, '']} />
                      <Bar 
                        dataKey={(data) => ((data.revenue - data.cost) / data.revenue * 100)} 
                        fill="hsl(var(--primary))" 
                        name="Margin %"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}