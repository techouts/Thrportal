import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KPICard } from '@/components/shared/KPICard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Users, Clock, DollarSign, TrendingUp, Download, Calendar } from 'lucide-react';

export function BenchShadowTab() {
  const [selectedRole, setSelectedRole] = useState('all');
  const [dateRange, setDateRange] = useState('this-quarter');

  // Mock data
  const kpiData = {
    benchHeadcount: 18,
    avgBenchDays: 12.5,
    benchCostPerDay: 2850,
    shadowPctWorkforce: 24.6,
    shadowToActiveConversion: 68.5
  };

  const benchCostTrend = [
    { month: 'Jan', cost: 45000, headcount: 15 },
    { month: 'Feb', cost: 52000, headcount: 18 },
    { month: 'Mar', cost: 48000, headcount: 16 },
    { month: 'Apr', cost: 56000, headcount: 20 },
    { month: 'May', cost: 51000, headcount: 18 },
    { month: 'Jun', cost: 57000, headcount: 18 }
  ];

  const benchForecast = [
    { week: 'Week 1', releases: 3, newBench: 2, netChange: -1 },
    { week: 'Week 2', releases: 5, newBench: 3, netChange: -2 },
    { week: 'Week 3', releases: 2, newBench: 4, netChange: 2 },
    { week: 'Week 4', releases: 4, newBench: 1, netChange: -3 },
    { week: 'Week 5', releases: 6, newBench: 2, netChange: -4 },
    { week: 'Week 6', releases: 3, newBench: 3, netChange: 0 },
    { week: 'Week 7', releases: 4, newBench: 1, netChange: -3 },
    { week: 'Week 8', releases: 2, newBench: 2, netChange: 0 }
  ];

  const roleHeatmap = [
    { role: 'Frontend Developer', bench: 15, shadow: 25, active: 60, total: 20 },
    { role: 'Backend Developer', bench: 10, shadow: 20, active: 70, total: 25 },
    { role: 'QA Engineer', bench: 25, shadow: 30, active: 45, total: 12 },
    { role: 'DevOps Engineer', bench: 8, shadow: 15, active: 77, total: 8 },
    { role: 'UI/UX Designer', bench: 30, shadow: 20, active: 50, total: 10 },
    { role: 'Product Manager', bench: 5, shadow: 10, active: 85, total: 6 }
  ];

  const benchEmployees = [
    { name: 'Alex Morgan', role: 'Frontend Developer', skills: ['React', 'Vue.js'], benchDays: 8, availableFrom: '2024-07-15', dailyCost: 320 },
    { name: 'Sarah Wilson', role: 'Backend Developer', skills: ['Node.js', 'Python'], benchDays: 15, availableFrom: '2024-07-10', dailyCost: 380 },
    { name: 'Mike Chen', role: 'QA Engineer', skills: ['Automation', 'Selenium'], benchDays: 5, availableFrom: '2024-07-20', dailyCost: 280 },
    { name: 'Emma Davis', role: 'UI/UX Designer', skills: ['Figma', 'Sketch'], benchDays: 12, availableFrom: '2024-07-12', dailyCost: 300 },
    { name: 'Tom Rodriguez', role: 'DevOps Engineer', skills: ['AWS', 'Docker'], benchDays: 3, availableFrom: '2024-07-25', dailyCost: 420 }
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Controls */}
      <Card>
        <CardContent className="pt-4 md:pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-full sm:w-[180px] md:w-[200px]">
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-6">
        <KPICard
          title="Bench Headcount"
          value={kpiData.benchHeadcount.toString()}
          description="Currently unallocated"
          icon={<Users className="h-4 w-4" />}
          trend={{
            direction: 'down',
            value: '12.5',
            label: 'vs last month'
          }}
          badge={{
            text: 'Improving',
            variant: 'default'
          }}
        />
        <KPICard
          title="Avg Bench Days"
          value={kpiData.avgBenchDays.toString()}
          description="Per employee"
          icon={<Clock className="h-4 w-4" />}
          trend={{
            direction: 'up',
            value: '3.2',
            label: 'vs last month'
          }}
          badge={{
            text: 'Watch',
            variant: 'secondary'
          }}
        />
        <KPICard
          title="Bench Cost/Day"
          value={`$${kpiData.benchCostPerDay.toLocaleString()}`}
          description="Total daily cost"
          icon={<DollarSign className="h-4 w-4" />}
          trend={{
            direction: 'up',
            value: '8.5',
            label: 'vs last month'
          }}
        />
        <KPICard
          title="Shadow % Workforce"
          value={`${kpiData.shadowPctWorkforce}%`}
          description="Learning/training roles"
          icon={<TrendingUp className="h-4 w-4" />}
          trend={{
            direction: 'up',
            value: '2.1',
            label: 'vs last month'
          }}
        />
        <KPICard
          title="Shadow→Active Rate"
          value={`${kpiData.shadowToActiveConversion}%`}
          description="Conversion success"
          icon={<Calendar className="h-4 w-4" />}
          trend={{
            direction: 'up',
            value: '5.3',
            label: 'vs last month'
          }}
          badge={{
            text: 'Excellent',
            variant: 'default'
          }}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Bench Cost Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Bench Cost Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={benchCostTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="cost" orientation="left" />
                <YAxis yAxisId="headcount" orientation="right" />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'cost' ? `$${value.toLocaleString()}` : `${value} people`,
                    name === 'cost' ? 'Monthly Cost' : 'Headcount'
                  ]}
                />
                <Line yAxisId="cost" type="monotone" dataKey="cost" stroke="hsl(var(--chart-1))" strokeWidth={2} name="cost" />
                <Line yAxisId="headcount" type="monotone" dataKey="headcount" stroke="hsl(var(--chart-2))" strokeWidth={2} name="headcount" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bench Releases Forecast */}
        <Card>
          <CardHeader>
            <CardTitle>Bench Releases Forecast (8 weeks)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={benchForecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="releases" fill="hsl(var(--chart-1))" name="Releases" />
                <Bar dataKey="newBench" fill="hsl(var(--chart-2))" name="New Bench" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Role-wise Bench/Shadow Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Role-wise Allocation Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Role</th>
                  <th className="text-center p-2">Total</th>
                  <th className="text-center p-2">Active %</th>
                  <th className="text-center p-2">Shadow %</th>
                  <th className="text-center p-2">Bench %</th>
                  <th className="text-center p-2">Distribution</th>
                </tr>
              </thead>
              <tbody>
                {roleHeatmap.map((role) => (
                  <tr key={role.role} className="border-b">
                    <td className="p-2 font-medium">{role.role}</td>
                    <td className="p-2 text-center">{role.total}</td>
                    <td className="p-2 text-center">{role.active}%</td>
                    <td className="p-2 text-center">{role.shadow}%</td>
                    <td className="p-2 text-center">{role.bench}%</td>
                    <td className="p-2">
                      <div className="flex w-full h-4 rounded overflow-hidden">
                        <div 
                          className="bg-green-500" 
                          style={{ width: `${role.active}%` }}
                          title={`Active: ${role.active}%`}
                        />
                        <div 
                          className="bg-yellow-500" 
                          style={{ width: `${role.shadow}%` }}
                          title={`Shadow: ${role.shadow}%`}
                        />
                        <div 
                          className="bg-red-500" 
                          style={{ width: `${role.bench}%` }}
                          title={`Bench: ${role.bench}%`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Bench Employees List */}
      <Card>
        <CardHeader>
          <CardTitle>Current Bench Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {benchEmployees.map((employee) => (
              <div key={employee.name} className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{employee.name}</div>
                  <div className="text-sm text-muted-foreground">{employee.role}</div>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {employee.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4 md:gap-6 items-center">
                  <div className="text-center">
                    <div className="text-sm font-medium">Bench Days</div>
                    <div className="text-lg">{employee.benchDays}</div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm font-medium">Available From</div>
                    <div className="text-sm">{employee.availableFrom}</div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm font-medium">Daily Cost</div>
                    <div className="text-lg font-semibold">${employee.dailyCost}</div>
                  </div>

                  <Button size="sm">
                    Assign
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