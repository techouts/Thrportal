import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KPICard } from '@/components/shared/KPICard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, TrendingUp, AlertTriangle, Target, Download } from 'lucide-react';

export function UtilizationTab() {
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [dateRange, setDateRange] = useState('this-quarter');

  // Mock data
  const kpiData = {
    coreUtilization: 78.5,
    effectiveUtilization: 85.2,
    underutilizedEmployees: 12,
    overallocatedEmployees: 5
  };

  const utilizationHistogram = [
    { range: '0-20%', count: 3, employees: ['John D.', 'Sarah K.', 'Mike R.'] },
    { range: '21-40%', count: 8, employees: [] },
    { range: '41-60%', count: 15, employees: [] },
    { range: '61-80%', count: 22, employees: [] },
    { range: '81-100%', count: 18, employees: [] },
    { range: '100%+', count: 5, employees: ['Alex M.', 'Lisa C.', 'Tom W.', 'Anna B.', 'Chris L.'] }
  ];

  const roleUtilization = [
    { role: 'Frontend Developer', utilization: 82.5, employees: 12, avgRate: 85 },
    { role: 'Backend Developer', utilization: 78.3, employees: 15, avgRate: 90 },
    { role: 'QA Engineer', utilization: 71.2, employees: 8, avgRate: 70 },
    { role: 'DevOps Engineer', utilization: 88.7, employees: 6, avgRate: 95 },
    { role: 'UI/UX Designer', utilization: 65.4, employees: 5, avgRate: 75 },
    { role: 'Product Manager', utilization: 92.1, employees: 4, avgRate: 100 }
  ];

  const utilizationSplit = [
    { name: 'Billable', value: 68.5, hours: 2740 },
    { name: 'Bench', value: 18.2, hours: 728 },
    { name: 'Shadow', value: 13.3, hours: 532 }
  ];

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Clients</SelectItem>
                  <SelectItem value="tech-corp">Tech Corp</SelectItem>
                  <SelectItem value="startup-inc">Startup Inc</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Roles</SelectItem>
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
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="this-quarter">This Quarter</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
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
          title="Core Utilization"
          value={`${kpiData.coreUtilization}%`}
          description="Billable hours only"
          icon={<Target className="h-4 w-4" />}
          trend={{
            direction: 'up',
            value: 2.3,
            label: 'vs last month'
          }}
          badge={{
            text: 'Good',
            variant: 'default'
          }}
        />
        <KPICard
          title="Effective Utilization"
          value={`${kpiData.effectiveUtilization}%`}
          description="Including shadow work"
          icon={<TrendingUp className="h-4 w-4" />}
          trend={{
            direction: 'up',
            value: 1.8,
            label: 'vs last month'
          }}
        />
        <KPICard
          title="Underutilized"
          value={kpiData.underutilizedEmployees.toString()}
          description="Below 70% utilization"
          icon={<AlertTriangle className="h-4 w-4" />}
          badge={{
            text: 'Needs Attention',
            variant: 'secondary'
          }}
        />
        <KPICard
          title="Overallocated"
          value={kpiData.overallocatedEmployees.toString()}
          description="Above 100% allocation"
          icon={<Users className="h-4 w-4" />}
          badge={{
            text: 'Risk',
            variant: 'destructive'
          }}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Utilization Histogram */}
        <Card>
          <CardHeader>
            <CardTitle>Utilization Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={utilizationHistogram}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number, name: string, props: any) => [
                    `${value} employees`,
                    'Count'
                  ]}
                  labelFormatter={(label: string) => `Utilization: ${label}`}
                />
                <Bar dataKey="count" fill="hsl(var(--chart-1))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Billable vs Bench vs Shadow Split */}
        <Card>
          <CardHeader>
            <CardTitle>Time Allocation Split</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={utilizationSplit}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {utilizationSplit.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number, name: string, props: any) => [
                  `${value}% (${props.payload.hours}h)`,
                  props.payload.name
                ]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {utilizationSplit.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{item.hours}h</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role-wise Utilization Table */}
      <Card>
        <CardHeader>
          <CardTitle>Role-wise Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Role</th>
                  <th className="text-center p-2">Employees</th>
                  <th className="text-center p-2">Avg Utilization</th>
                  <th className="text-center p-2">Avg Rate</th>
                  <th className="text-center p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {roleUtilization.map((role) => (
                  <tr key={role.role} className="border-b">
                    <td className="p-2 font-medium">{role.role}</td>
                    <td className="p-2 text-center">{role.employees}</td>
                    <td className="p-2 text-center">{role.utilization}%</td>
                    <td className="p-2 text-center">${role.avgRate}/h</td>
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center">
                        <div 
                          className="w-full max-w-[100px] bg-muted rounded-full h-2"
                        >
                          <div 
                            className={`h-2 rounded-full ${
                              role.utilization > 85 ? 'bg-green-500' :
                              role.utilization > 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(role.utilization, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}