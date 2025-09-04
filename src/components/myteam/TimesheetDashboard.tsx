import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  FileText, 
  AlertCircle, 
  TrendingUp,
  Users,
  Target,
  Calendar
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';

interface TimesheetMetrics {
  submissionRate: number;
  pendingSubmissions: number;
  overdueSubmissions: number;
  avgBillableHours: number;
  avgNonBillableHours: number;
  utilizationRate: number;
  projectBurnRate: number;
  pendingApprovals: number;
  teamUtilization: Array<{ name: string; billable: number; nonBillable: number; utilization: number }>;
  weeklyTrend: Array<{ week: string; submissions: number; overdue: number; billable: number }>;
}

interface TimesheetDashboardProps {
  metrics: TimesheetMetrics;
  loading?: boolean;
}

export function TimesheetDashboard({ metrics, loading }: TimesheetDashboardProps) {
  const utilizationData = [
    { name: 'Development', billable: 85, target: 80, hours: 340 },
    { name: 'Testing', billable: 78, target: 75, hours: 156 },
    { name: 'Design', billable: 82, target: 70, hours: 164 },
    { name: 'DevOps', billable: 88, target: 85, hours: 176 },
    { name: 'Support', billable: 65, target: 60, hours: 130 }
  ];

  const burnRateData = [
    { project: 'Project Alpha', budgeted: 1000, actual: 850, variance: -15 },
    { project: 'Project Beta', budgeted: 800, actual: 920, variance: 15 },
    { project: 'Project Gamma', budgeted: 1200, actual: 1100, variance: -8.3 },
    { project: 'Project Delta', budgeted: 600, actual: 580, variance: -3.3 }
  ];

  const weeklyData = [
    { week: 'Week 1', submissions: 14, overdue: 0, billable: 82 },
    { week: 'Week 2', submissions: 15, overdue: 1, billable: 78 },
    { week: 'Week 3', submissions: 13, overdue: 2, billable: 85 },
    { week: 'Week 4', submissions: 16, overdue: 0, billable: 88 }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="rounded-2xl animate-pulse">
              <CardHeader><div className="h-4 bg-muted rounded w-24" /></CardHeader>
              <CardContent><div className="h-8 bg-muted rounded w-16" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Submission Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.submissionRate}%</div>
            <Progress value={metrics.submissionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">Current week</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{metrics.overdueSubmissions}</div>
              {metrics.overdueSubmissions > 0 && (
                <Badge variant="destructive" className="text-xs">Action Required</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Submissions beyond SLA</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.utilizationRate}%</div>
            <div className="flex items-center gap-1 mt-1">
              <div className="text-xs text-muted-foreground">
                Billable: {metrics.avgBillableHours}h | Non-billable: {metrics.avgNonBillableHours}h
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Awaiting manager review</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Utilization by Role */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Team Utilization by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={utilizationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value, name) => [`${value}%`, name === 'billable' ? 'Billable' : 'Target']} />
                <Bar dataKey="target" fill="#e5e7eb" name="Target" />
                <Bar dataKey="billable" fill="#3b82f6" name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Submission Trend */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Weekly Submission Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="submissions" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} name="Submitted" />
                <Area type="monotone" dataKey="overdue" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Overdue" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Project Burn Rate Analysis */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Project Burn Rate Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {burnRateData.map((project, index) => (
              <div key={index} className="border rounded-xl p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium">{project.project}</h4>
                    <p className="text-sm text-muted-foreground">
                      Budgeted: {project.budgeted}h | Actual: {project.actual}h
                    </p>
                  </div>
                  <Badge 
                    variant={project.variance < 0 ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {project.variance > 0 ? '+' : ''}{project.variance}%
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Budget Utilization</span>
                    <span>{Math.round((project.actual / project.budgeted) * 100)}%</span>
                  </div>
                  <Progress 
                    value={Math.min((project.actual / project.budgeted) * 100, 100)} 
                    className="h-2"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Member Details */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Individual Utilization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.teamUtilization.map((member, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Billable: {member.billable}h | Non-billable: {member.nonBillable}h
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{member.utilization}%</div>
                  <div className="text-xs text-muted-foreground">Utilization</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts & Reminders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Overdue Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-xl border-red-200 bg-red-50">
                <div>
                  <div className="font-medium text-red-800">John Doe</div>
                  <div className="text-sm text-red-600">Week ending 15 Jan - 3 days overdue</div>
                </div>
                <Badge variant="destructive" className="text-xs">
                  Critical
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-xl border-yellow-200 bg-yellow-50">
                <div>
                  <div className="font-medium text-yellow-800">Jane Smith</div>
                  <div className="text-sm text-yellow-600">Week ending 22 Jan - 1 day overdue</div>
                </div>
                <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                  Reminder Sent
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-xl">
                <div>
                  <div className="font-medium">Week ending 29 Jan</div>
                  <div className="text-sm text-muted-foreground">Due in 2 days</div>
                </div>
                <Badge variant="outline">
                  Pending
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-xl">
                <div>
                  <div className="font-medium">Week ending 5 Feb</div>
                  <div className="text-sm text-muted-foreground">Due in 9 days</div>
                </div>
                <Badge variant="secondary">
                  Upcoming
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}