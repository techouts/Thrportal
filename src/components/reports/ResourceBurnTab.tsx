import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KPICard } from '@/components/shared/KPICard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { Clock, CheckCircle, AlertTriangle, TrendingUp, Download, User } from 'lucide-react';

export function ResourceBurnTab() {
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [dateRange, setDateRange] = useState('this-month');

  // Mock data
  const kpiData = {
    avgBurnHoursPerWeek: 42.5,
    timesheetCompliance: 89.2,
    topOverallocatedCount: 5,
    topUnderutilizedCount: 8
  };

  const burnByEmployee = [
    { name: 'Sarah C.', planned: 40, actual: 45, efficiency: 112 },
    { name: 'Mike J.', planned: 40, actual: 38, efficiency: 95 },
    { name: 'Emma D.', planned: 30, actual: 35, efficiency: 117 },
    { name: 'Alex M.', planned: 40, actual: 48, efficiency: 120 },
    { name: 'Tom R.', planned: 35, actual: 32, efficiency: 91 },
    { name: 'Lisa W.', planned: 40, actual: 42, efficiency: 105 },
    { name: 'Chris L.', planned: 40, actual: 36, efficiency: 90 },
    { name: 'Anna B.', planned: 30, actual: 33, efficiency: 110 }
  ];

  const utilizationDistribution = [
    { range: 'Severely Under (<50%)', count: 3, color: '#ef4444' },
    { range: 'Under (50-70%)', count: 5, color: '#f97316' },
    { range: 'Optimal (70-90%)', count: 18, color: '#22c55e' },
    { range: 'High (90-100%)', count: 12, color: '#3b82f6' },
    { range: 'Over (100%+)', count: 5, color: '#8b5cf6' }
  ];

  const overallocatedEmployees = [
    { name: 'Alex Morgan', role: 'Frontend Developer', allocation: 125, projects: 3, lastUpdate: '2024-07-15' },
    { name: 'Sarah Wilson', role: 'Backend Developer', allocation: 110, projects: 2, lastUpdate: '2024-07-14' },
    { name: 'Mike Chen', role: 'DevOps Engineer', allocation: 135, projects: 4, lastUpdate: '2024-07-16' },
    { name: 'Emma Davis', role: 'Product Manager', allocation: 105, projects: 2, lastUpdate: '2024-07-15' },
    { name: 'Tom Rodriguez', role: 'QA Engineer', allocation: 115, projects: 3, lastUpdate: '2024-07-13' }
  ];

  const underutilizedEmployees = [
    { name: 'Chris Lee', role: 'UI/UX Designer', utilization: 45, benchDays: 8, skillGaps: ['Advanced Figma', 'Prototyping'] },
    { name: 'Anna Brown', role: 'Frontend Developer', utilization: 55, benchDays: 5, skillGaps: ['React Native', 'GraphQL'] },
    { name: 'John Smith', role: 'Backend Developer', utilization: 35, benchDays: 12, skillGaps: ['Microservices', 'Kubernetes'] },
    { name: 'Lisa Garcia', role: 'QA Engineer', utilization: 60, benchDays: 3, skillGaps: ['API Testing', 'Load Testing'] },
    { name: 'David Kim', role: 'Data Analyst', utilization: 40, benchDays: 10, skillGaps: ['Machine Learning', 'Python'] }
  ];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  <SelectItem value="sarah-c">Sarah Chen</SelectItem>
                  <SelectItem value="mike-j">Mike Johnson</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="frontend">Frontend Developer</SelectItem>
                  <SelectItem value="backend">Backend Developer</SelectItem>
                  <SelectItem value="qa">QA Engineer</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="this-quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-6">
        <KPICard
          title="Avg Burn Hours/Week"
          value={`${kpiData.avgBurnHoursPerWeek}h`}
          description="Across all employees"
          icon={<Clock className="h-4 w-4" />}
          trend={{
            direction: 'up',
            value: '2.1',
            label: 'vs last week'
          }}
        />
        <KPICard
          title="Timesheet Compliance"
          value={`${kpiData.timesheetCompliance}%`}
          description="On-time submissions"
          icon={<CheckCircle className="h-4 w-4" />}
          trend={{
            direction: 'down',
            value: '1.3',
            label: 'vs last week'
          }}
          badge={{
            text: 'Good',
            variant: 'default'
          }}
        />
        <KPICard
          title="Overallocated Employees"
          value={kpiData.topOverallocatedCount.toString()}
          description="Above 100% allocation"
          icon={<AlertTriangle className="h-4 w-4" />}
          badge={{
            text: 'High Risk',
            variant: 'destructive'
          }}
        />
        <KPICard
          title="Underutilized Employees"
          value={kpiData.topUnderutilizedCount.toString()}
          description="Below 70% utilization"
          icon={<TrendingUp className="h-4 w-4" />}
          badge={{
            text: 'Opportunity',
            variant: 'secondary'
          }}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Burn by Employee */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Burn: Planned vs Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={burnByEmployee}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="planned" fill="hsl(var(--chart-1))" name="Planned Hours" />
                <Bar dataKey="actual" fill="hsl(var(--chart-2))" name="Actual Hours" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Over/Under Utilization Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Utilization Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={utilizationDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--chart-1))" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {utilizationDistribution.map((item) => (
                <div key={item.range} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.range}</span>
                  </div>
                  <span className="font-medium">{item.count} employees</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Overallocated Employees */}
      <Card>
        <CardHeader>
          <CardTitle>Top Overallocated Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {overallocatedEmployees.map((employee) => (
              <div key={employee.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{employee.name}</div>
                    <div className="text-sm text-muted-foreground">{employee.role}</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm font-medium">Allocation</div>
                  <Badge variant="destructive">{employee.allocation}%</Badge>
                </div>

                <div className="text-center">
                  <div className="text-sm font-medium">Projects</div>
                  <div className="text-lg">{employee.projects}</div>
                </div>

                <div className="text-center">
                  <div className="text-sm font-medium">Last Update</div>
                  <div className="text-sm">{employee.lastUpdate}</div>
                </div>

                <Button size="sm" variant="outline">
                  Rebalance
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Underutilized Employees */}
      <Card>
        <CardHeader>
          <CardTitle>Top Underutilized Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {underutilizedEmployees.map((employee) => (
              <div key={employee.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{employee.name}</div>
                    <div className="text-sm text-muted-foreground">{employee.role}</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm font-medium">Utilization</div>
                  <Badge variant="secondary">{employee.utilization}%</Badge>
                </div>

                <div className="text-center">
                  <div className="text-sm font-medium">Bench Days</div>
                  <div className="text-lg">{employee.benchDays}</div>
                </div>

                <div className="flex-1 max-w-[200px]">
                  <div className="text-sm font-medium mb-2">Skill Gaps</div>
                  <div className="flex gap-1 flex-wrap">
                    {employee.skillGaps.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                    ))}
                  </div>
                </div>

                <Button size="sm" variant="outline">
                  Upskill
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}