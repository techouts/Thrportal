import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Calendar, 
  Clock, 
  DollarSign, 
  FileText, 
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface TeamMetrics {
  teamSize: number;
  leaveRequests: {
    pending: number;
    approved: number;
    utilization: number;
  };
  attendance: {
    presentToday: number;
    avgAttendance: number;
    lateArrivals: number;
  };
  expenses: {
    pending: number;
    totalAmount: number;
    avgTurnaround: number;
  };
  timesheets: {
    pending: number;
    overdue: number;
    avgBillable: number;
  };
  performance: {
    reviewsCompleted: number;
    goalsOnTrack: number;
    pipCount: number;
  };
}

interface DashboardMetricsProps {
  metrics: TeamMetrics;
  loading?: boolean;
}

export function DashboardMetrics({ metrics, loading }: DashboardMetricsProps) {
  const leaveData = [
    { name: 'CL', value: 35, color: '#8884d8' },
    { name: 'SL', value: 25, color: '#82ca9d' },
    { name: 'PL', value: 30, color: '#ffc658' },
    { name: 'WFH', value: 10, color: '#ff7300' }
  ];

  const attendanceData = [
    { name: 'Mon', present: 12, wfh: 3, absent: 1 },
    { name: 'Tue', present: 13, wfh: 2, absent: 1 },
    { name: 'Wed', present: 11, wfh: 4, absent: 1 },
    { name: 'Thu', present: 14, wfh: 2, absent: 0 },
    { name: 'Fri', present: 12, wfh: 3, absent: 1 }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="rounded-2xl">
            <CardHeader className="animate-pulse">
              <div className="h-4 bg-muted rounded w-24" />
            </CardHeader>
            <CardContent className="animate-pulse">
              <div className="h-8 bg-muted rounded w-16 mb-2" />
              <div className="h-3 bg-muted rounded w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.teamSize}</div>
            <p className="text-xs text-muted-foreground">Active members</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Leave Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{metrics.leaveRequests.pending}</div>
              {metrics.leaveRequests.pending > 5 && (
                <Badge variant="destructive" className="text-xs">High</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Requires approval</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Attendance Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round((metrics.attendance.presentToday / metrics.teamSize) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.attendance.presentToday}/{metrics.teamSize} present
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Timesheet Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{metrics.timesheets.pending}</div>
              {metrics.timesheets.overdue > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {metrics.timesheets.overdue} overdue
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Pending submission</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Type Distribution */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Leave Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={leaveData}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {leaveData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Attendance Trend */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Weekly Attendance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="present" stackId="a" fill="#22c55e" name="Present" />
                <Bar dataKey="wfh" stackId="a" fill="#3b82f6" name="WFH" />
                <Bar dataKey="absent" stackId="a" fill="#ef4444" name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Expense Claims
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(metrics.expenses.totalAmount / 1000).toFixed(0)}K</div>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-muted-foreground">Avg turnaround:</span>
              <span className="font-medium">{metrics.expenses.avgTurnaround}d</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.performance.goalsOnTrack}%</div>
            <p className="text-xs text-muted-foreground">Goals on track</p>
            {metrics.performance.pipCount > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <AlertTriangle className="h-3 w-3 text-yellow-500" />
                <span className="text-xs text-yellow-600">{metrics.performance.pipCount} on PIP</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Billable Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.timesheets.avgBillable}%</div>
            <Progress value={metrics.timesheets.avgBillable} className="mt-2" />
            <div className="flex items-center gap-1 mt-1">
              {metrics.timesheets.avgBillable >= 80 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className="text-xs text-muted-foreground">vs target 80%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Leave Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.leaveRequests.utilization}%</div>
            <Progress value={metrics.leaveRequests.utilization} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">YTD utilization</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}