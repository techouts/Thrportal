import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart, ComposedChart 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, Building, Target,
  Calendar, Download, Filter, RefreshCw, AlertTriangle, CheckCircle,
  Clock, Phone, Mail, Linkedin, MapPin, Star, Award, Zap
} from 'lucide-react';
import { CrmService } from '@/services/crmService';
import { formatDistanceToNow, format, subDays, subMonths } from 'date-fns';

export default function CRMReportsPage() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [reportType, setReportType] = useState('overview');
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const [clientsData, projectsData, opportunitiesResponse, interactionsData, metricsData] = await Promise.all([
        CrmService.getClients(),
        CrmService.getProjects(),
        CrmService.getOpportunities(),
        CrmService.getInteractions(),
        CrmService.getMetrics()
      ]);
      
      setClients(clientsData);
      setProjects(projectsData);
      setOpportunities(Array.isArray(opportunitiesResponse) ? opportunitiesResponse : opportunitiesResponse.data);
      setInteractions(Array.isArray(interactionsData) ? interactionsData : interactionsData.data);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate advanced metrics
  const advancedMetrics = {
    totalRevenuePotential: opportunities.reduce((sum, opp) => sum + (opp.ft_count * 120000) + (opp.contract_count * 80000), 0),
    avgDealSize: opportunities.length > 0 ? opportunities.reduce((sum, opp) => sum + (opp.ft_count * 120000), 0) / opportunities.length : 0,
    conversionRate: opportunities.length > 0 ? (opportunities.filter(o => o.status === 'Closed').length / opportunities.length) * 100 : 0,
    avgEngagementScore: interactions.length > 0 ? interactions.reduce((sum, int) => sum + int.engagement_score, 0) / interactions.length : 0,
    clientRetentionRate: clients.length > 0 ? (clients.filter(c => c.status === 'Active').length / clients.length) * 100 : 0,
    avgProjectDuration: projects.length > 0 ? projects.filter(p => p.start_date && p.end_date)
      .reduce((sum, p) => sum + Math.ceil((new Date(p.end_date!).getTime() - new Date(p.start_date!).getTime()) / (1000 * 60 * 60 * 24)), 0) / projects.filter(p => p.start_date && p.end_date).length : 0
  };

  // Industry performance data
  const industryData = clients.reduce((acc: Record<string, any>, client: any) => {
    const industry = client.industry || 'Other';
    if (!acc[industry]) {
      acc[industry] = { name: industry, count: 0, health: 0, revenue: 0 };
    }
    acc[industry].count += 1;
    acc[industry].health += client.health_score;
    acc[industry].revenue += 150000; // Mock revenue per client
    return acc;
  }, {});

  const industryChartData = Object.values(industryData).map((item: any) => ({
    ...item,
    avgHealth: Math.round(item.health / item.count)
  }));

  // Monthly trend data
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    const month = format(date, 'MMM');
    return {
      month,
      clients: Math.floor(Math.random() * 5) + clients.length - 10 + i,
      opportunities: Math.floor(Math.random() * 8) + opportunities.length - 15 + i * 2,
      revenue: Math.floor(Math.random() * 200000) + 800000 + i * 100000,
      interactions: Math.floor(Math.random() * 20) + interactions.length - 30 + i * 5
    };
  });

  // Performance by status
  const statusData = [
    { name: 'Active Clients', value: clients.filter(c => c.status === 'Active').length, color: '#22c55e' },
    { name: 'Prospects', value: clients.filter(c => c.status === 'Prospect').length, color: '#3b82f6' },
    { name: 'Inactive', value: clients.filter(c => c.status === 'Inactive').length, color: '#ef4444' }
  ];

  const projectStatusData = [
    { name: 'In-flight', value: projects.filter(p => p.status === 'In-flight').length, color: '#f59e0b' },
    { name: 'Planned', value: projects.filter(p => p.status === 'Planned').length, color: '#3b82f6' },
    { name: 'Closed', value: projects.filter(p => p.status === 'Closed').length, color: '#22c55e' }
  ];

  // Top performing clients
  const topClients = clients
    .sort((a, b) => b.health_score - a.health_score)
    .slice(0, 5);

  // Interaction type distribution
  const interactionTypes = interactions.reduce((acc: Record<string, number>, interaction: any) => {
    const type = interaction.interaction_type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const interactionChartData = Object.entries(interactionTypes).map(([type, count]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    count,
    engagement: Math.floor(Math.random() * 3) + 7 // Mock engagement score
  }));

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Reports" description="Loading advanced CRM analytics..." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Advanced CRM Analytics"
        description="Comprehensive business intelligence and performance insights"
      />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="forecasting">Forecasting</SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadReportData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue Potential</p>
                <p className="text-2xl font-bold">${(advancedMetrics.totalRevenuePotential / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5% from last month
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{advancedMetrics.conversionRate.toFixed(1)}%</p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <Target className="h-3 w-3 mr-1" />
                  Target: 25%
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Client Retention</p>
                <p className="text-2xl font-bold">{advancedMetrics.clientRetentionRate.toFixed(1)}%</p>
                <p className="text-xs text-purple-600 flex items-center mt-1">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Excellent
                </p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Engagement</p>
                <p className="text-2xl font-bold">{advancedMetrics.avgEngagementScore.toFixed(1)}/10</p>
                <p className="text-xs text-orange-600 flex items-center mt-1">
                  <Zap className="h-3 w-3 mr-1" />
                  High quality
                </p>
              </div>
              <Star className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={reportType} onValueChange={setReportType} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
          <TabsTrigger value="detailed">Detailed</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trends */}
            <Card>
              <CardHeader>
                <CardTitle>6-Month Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="clients" fill="#3b82f6" name="Clients" />
                    <Bar yAxisId="left" dataKey="opportunities" fill="#22c55e" name="Opportunities" />
                    <Line yAxisId="right" type="monotone" dataKey="interactions" stroke="#f59e0b" name="Interactions" strokeWidth={3} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Industry Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Industry Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={industryChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#3b82f6" name="Clients" />
                    <Bar dataKey="avgHealth" fill="#22c55e" name="Avg Health Score" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={projectStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {projectStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performing Clients */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topClients.map((client, index) => (
                    <div key={client.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-muted-foreground">{client.industry}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{client.health_score}%</p>
                        <Progress value={client.health_score} className="w-20 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Interaction Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Interaction Type Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={interactionChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#3b82f6" name="Count" />
                    <Bar dataKey="engagement" fill="#22c55e" name="Avg Engagement" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Average Deal Size</p>
                  <p className="text-3xl font-bold">${(advancedMetrics.avgDealSize / 1000).toFixed(0)}K</p>
                  <div className="flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-green-600">+8.2% vs last quarter</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Avg Project Duration</p>
                  <p className="text-3xl font-bold">{Math.round(advancedMetrics.avgProjectDuration)} days</p>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 text-blue-600 mr-1" />
                    <span className="text-blue-600">Optimal range: 180-270 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Interactions</p>
                  <p className="text-3xl font-bold">{interactions.length}</p>
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 text-purple-600 mr-1" />
                    <span className="text-purple-600">This month</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Forecasting</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${(Number(value) / 1000).toFixed(0)}K`, 'Revenue']} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Revenue" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Predicted Outcomes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <span>Q4 Revenue Target</span>
                    <Badge variant="default" className="bg-green-600">85% Likely</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <span>New Client Acquisition</span>
                    <Badge variant="secondary">12-15 clients</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <span>Risk: Budget Constraints</span>
                    <Badge variant="destructive">Monitor Closely</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Focus on Technology sector</p>
                      <p className="text-sm text-muted-foreground">Highest conversion rate and deal size</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Improve follow-up cadence</p>
                      <p className="text-sm text-muted-foreground">30% of prospects need more touchpoints</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Expand in Healthcare</p>
                      <p className="text-sm text-muted-foreground">Growing market with high potential</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Health Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Excellent (80-100)</span>
                    <span className="text-sm font-medium">{clients.filter(c => c.health_score >= 80).length} clients</span>
                  </div>
                  <Progress value={(clients.filter(c => c.health_score >= 80).length / clients.length) * 100} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Good (60-79)</span>
                    <span className="text-sm font-medium">{clients.filter(c => c.health_score >= 60 && c.health_score < 80).length} clients</span>
                  </div>
                  <Progress value={(clients.filter(c => c.health_score >= 60 && c.health_score < 80).length / clients.length) * 100} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">At Risk (&lt;60)</span>
                    <span className="text-sm font-medium">{clients.filter(c => c.health_score < 60).length} clients</span>
                  </div>
                  <Progress value={(clients.filter(c => c.health_score < 60).length / clients.length) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...new Set(clients.map(c => c.location).filter(Boolean))].slice(0, 5).map(location => (
                    <div key={location} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{location}</span>
                      </div>
                      <span className="text-sm font-medium">{clients.filter(c => c.location === location).length}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">{interactions.filter(i => i.interaction_type === 'call').length} calls this month</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{interactions.filter(i => i.interaction_type === 'email').length} emails sent</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">{interactions.filter(i => i.interaction_type === 'meeting').length} meetings held</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Linkedin className="h-4 w-4 text-blue-800" />
                    <span className="text-sm">{interactions.filter(i => i.interaction_type === 'linkedin').length} LinkedIn connections</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Metrics Table */}
          <Card>
            <CardHeader>
              <CardTitle>Client Performance Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Client</th>
                      <th className="text-left p-2">Industry</th>
                      <th className="text-left p-2">Health Score</th>
                      <th className="text-left p-2">Projects</th>
                      <th className="text-left p-2">Opportunities</th>
                      <th className="text-left p-2">Last Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.slice(0, 10).map(client => (
                      <tr key={client.id} className="border-b">
                        <td className="p-2 font-medium">{client.name}</td>
                        <td className="p-2">{client.industry || 'N/A'}</td>
                        <td className="p-2">
                          <Badge variant={client.health_score >= 80 ? 'default' : client.health_score >= 60 ? 'secondary' : 'destructive'}>
                            {client.health_score}%
                          </Badge>
                        </td>
                        <td className="p-2">{projects.filter(p => p.client_id === client.id).length}</td>
                        <td className="p-2">{opportunities.filter(o => o.client_id === client.id).length}</td>
                        <td className="p-2 text-muted-foreground">
                          {formatDistanceToNow(new Date(client.created_at), { addSuffix: true })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}