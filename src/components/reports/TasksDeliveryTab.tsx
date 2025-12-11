import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KPICard } from '@/components/shared/KPICard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Clock, AlertTriangle, CheckCircle, TrendingUp, Download, Calendar } from 'lucide-react';

export function TasksDeliveryTab() {
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedProject, setSelectedProject] = useState('all');
  const [dateRange, setDateRange] = useState('this-quarter');

  // Mock data
  const kpiData = {
    estVsActualSlippage: 18.5,
    totalTasks: 156,
    onTimeDelivery: 76.3,
    avgTaskDuration: 12.8
  };

  const taskSlippageByProject = [
    { project: 'E-commerce Platform', estimated: 520, actual: 612, slippage: 17.7, status: 'On Track' },
    { project: 'Mobile App', estimated: 380, actual: 465, slippage: 22.4, status: 'Delayed' },
    { project: 'Data Analytics', estimated: 420, actual: 385, slippage: -8.3, status: 'Ahead' },
    { project: 'Cloud Migration', estimated: 290, actual: 358, slippage: 23.4, status: 'Delayed' },
    { project: 'API Gateway', estimated: 180, actual: 195, slippage: 8.3, status: 'Slight Delay' },
    { project: 'Documentation', estimated: 120, actual: 110, slippage: -8.3, status: 'Ahead' }
  ];

  const ganttVarianceData = [
    { week: 'Week 1', planned: 15, completed: 12, variance: -20 },
    { week: 'Week 2', planned: 18, completed: 16, variance: -11 },
    { week: 'Week 3', planned: 22, completed: 25, variance: 14 },
    { week: 'Week 4', planned: 20, completed: 18, variance: -10 },
    { week: 'Week 5', planned: 16, completed: 19, variance: 19 },
    { week: 'Week 6', planned: 24, completed: 21, variance: -13 },
    { week: 'Week 7', planned: 19, completed: 22, variance: 16 },
    { week: 'Week 8', planned: 21, completed: 19, variance: -10 }
  ];

  const tasksByPhase = [
    { phase: 'Planning', total: 24, completed: 22, inProgress: 2, delayed: 0 },
    { phase: 'Design', total: 18, completed: 15, inProgress: 2, delayed: 1 },
    { phase: 'Development', total: 45, completed: 32, inProgress: 8, delayed: 5 },
    { phase: 'Testing', total: 32, completed: 28, inProgress: 3, delayed: 1 },
    { phase: 'Deployment', total: 15, completed: 12, inProgress: 2, delayed: 1 },
    { phase: 'Documentation', total: 22, completed: 20, inProgress: 1, delayed: 1 }
  ];

  const criticalTasks = [
    { task: 'User Authentication API', project: 'E-commerce Platform', estimatedHours: 40, actualHours: 58, daysOverdue: 3, assignee: 'Mike J.' },
    { task: 'Payment Gateway Integration', project: 'E-commerce Platform', estimatedHours: 60, actualHours: 75, daysOverdue: 5, assignee: 'Sarah C.' },
    { task: 'Database Migration Script', project: 'Cloud Migration', estimatedHours: 25, actualHours: 38, daysOverdue: 2, assignee: 'Alex M.' },
    { task: 'Mobile UI Components', project: 'Mobile App', estimatedHours: 35, actualHours: 42, daysOverdue: 1, assignee: 'Emma D.' },
    { task: 'API Documentation', project: 'Documentation', estimatedHours: 20, actualHours: 28, daysOverdue: 4, assignee: 'Tom R.' }
  ];

  const getSlippageColor = (slippage: number) => {
    if (slippage < -5) return 'text-green-600';
    if (slippage < 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Ahead':
        return <Badge className="bg-green-100 text-green-800">Ahead</Badge>;
      case 'On Track':
        return <Badge className="bg-blue-100 text-blue-800">On Track</Badge>;
      case 'Slight Delay':
        return <Badge className="bg-yellow-100 text-yellow-800">Slight Delay</Badge>;
      case 'Delayed':
        return <Badge className="bg-red-100 text-red-800">Delayed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Controls */}
      <Card>
        <CardContent className="pt-4 md:pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="w-full sm:w-[180px] md:w-[200px]">
                  <SelectValue placeholder="All Clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  <SelectItem value="tech-corp">Tech Corp</SelectItem>
                  <SelectItem value="startup-inc">Startup Inc</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-full sm:w-[180px] md:w-[200px]">
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  <SelectItem value="ecommerce">E-commerce Platform</SelectItem>
                  <SelectItem value="mobile">Mobile App</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-full sm:w-[140px] md:w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="this-quarter">This Quarter</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="flex items-center gap-2 w-full sm:w-auto">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <KPICard
          title="Est vs Actual Slippage"
          value={`${kpiData.estVsActualSlippage}%`}
          description="Average across all tasks"
          icon={<Clock className="h-4 w-4" />}
          trend={{
            direction: 'up',
            value: '3.2',
            label: 'vs last month'
          }}
          badge={{
            text: 'Needs Attention',
            variant: 'secondary'
          }}
        />
        <KPICard
          title="Total Tasks"
          value={kpiData.totalTasks.toString()}
          description="Active and completed"
          icon={<CheckCircle className="h-4 w-4" />}
          trend={{
            direction: 'up',
            value: '12.1',
            label: 'vs last month'
          }}
        />
        <KPICard
          title="On-time Delivery"
          value={`${kpiData.onTimeDelivery}%`}
          description="Tasks completed on schedule"
          icon={<TrendingUp className="h-4 w-4" />}
          trend={{
            direction: 'down',
            value: '4.5',
            label: 'vs last month'
          }}
          badge={{
            text: 'Below Target',
            variant: 'destructive'
          }}
        />
        <KPICard
          title="Avg Task Duration"
          value={`${kpiData.avgTaskDuration} days`}
          description="From start to completion"
          icon={<Calendar className="h-4 w-4" />}
          trend={{
            direction: 'up',
            value: '1.8',
            label: 'vs last month'
          }}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Task Slippage by Project */}
        <Card>
          <CardHeader>
            <CardTitle>Task Slippage by Project</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={taskSlippageByProject} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="project" type="category" width={120} />
                <Tooltip formatter={(value: number) => [`${value}%`, 'Slippage']} />
                <Bar dataKey="slippage" fill="hsl(var(--chart-1))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gantt Completion Variance */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Completion Variance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ganttVarianceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="planned" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Planned" />
                <Line type="monotone" dataKey="completed" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Completed" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tasks by Phase */}
      <Card>
        <CardHeader>
          <CardTitle>Task Status by Phase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Phase</th>
                  <th className="text-center p-2">Total</th>
                  <th className="text-center p-2">Completed</th>
                  <th className="text-center p-2">In Progress</th>
                  <th className="text-center p-2">Delayed</th>
                  <th className="text-center p-2">Progress</th>
                  <th className="text-center p-2">Completion %</th>
                </tr>
              </thead>
              <tbody>
                {tasksByPhase.map((phase) => (
                  <tr key={phase.phase} className="border-b">
                    <td className="p-2 font-medium">{phase.phase}</td>
                    <td className="p-2 text-center">{phase.total}</td>
                    <td className="p-2 text-center">{phase.completed}</td>
                    <td className="p-2 text-center">{phase.inProgress}</td>
                    <td className="p-2 text-center">
                      {phase.delayed > 0 ? (
                        <Badge variant="destructive">{phase.delayed}</Badge>
                      ) : (
                        phase.delayed
                      )}
                    </td>
                    <td className="p-2">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${(phase.completed / phase.total) * 100}%` }}
                        />
                      </div>
                    </td>
                    <td className="p-2 text-center font-medium">
                      {((phase.completed / phase.total) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Critical/Delayed Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Critical/Delayed Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {criticalTasks.map((task, index) => (
              <div key={index} className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{task.task}</div>
                  <div className="text-sm text-muted-foreground">{task.project}</div>
                  <div className="text-sm text-muted-foreground">Assigned to: {task.assignee}</div>
                </div>
                
                <div className="flex flex-wrap gap-4 md:gap-6 items-center">
                  <div className="text-center">
                    <div className="text-sm font-medium">Hours</div>
                    <div className="text-sm">
                      {task.actualHours}h / {task.estimatedHours}h
                    </div>
                    <div className={`text-xs font-medium ${getSlippageColor(((task.actualHours - task.estimatedHours) / task.estimatedHours) * 100)}`}>
                      {((task.actualHours - task.estimatedHours) / task.estimatedHours * 100).toFixed(1)}% over
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm font-medium">Days Overdue</div>
                    <Badge variant="destructive">{task.daysOverdue}</Badge>
                  </div>

                  <Button size="sm" variant="outline">
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}