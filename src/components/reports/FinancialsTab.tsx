import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KPICard } from '@/components/shared/KPICard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Download } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export function FinancialsTab() {
  const isMobile = useIsMobile();
  const [includeShadow, setIncludeShadow] = useState(false);
  const [selectedClient, setSelectedClient] = useState('all');
  const [dateRange, setDateRange] = useState('this-quarter');

  // Mock data
  const kpiData = {
    plannedMargin: 342000,
    actualMargin: 318000,
    totalRevenue: 2150000,
    totalCost: 1832000,
    profitability: 14.8
  };

  const revenueData = [
    { month: 'Jan', revenue: 180000, cost: 152000, margin: 28000 },
    { month: 'Feb', revenue: 195000, cost: 161000, margin: 34000 },
    { month: 'Mar', revenue: 210000, cost: 178000, margin: 32000 },
    { month: 'Apr', revenue: 225000, cost: 188000, margin: 37000 },
    { month: 'May', revenue: 240000, cost: 198000, margin: 42000 },
    { month: 'Jun', revenue: 255000, cost: 215000, margin: 40000 }
  ];

  const projectPLData = [
    { project: 'E-commerce Platform', revenue: 450000, cost: 380000, margin: 70000, marginPct: 15.6 },
    { project: 'Mobile App', revenue: 320000, cost: 285000, margin: 35000, marginPct: 10.9 },
    { project: 'Data Analytics', revenue: 280000, cost: 225000, margin: 55000, marginPct: 19.6 },
    { project: 'Cloud Migration', revenue: 195000, cost: 168000, margin: 27000, marginPct: 13.8 }
  ];

  const invoiceAgingData = [
    { name: 'Current (0-30 days)', value: 65, amount: 1397500 },
    { name: 'Overdue (31-60 days)', value: 25, amount: 537500 },
    { name: 'Overdue (61-90 days)', value: 7, amount: 150500 },
    { name: 'Overdue (90+ days)', value: 3, amount: 64500 }
  ];

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

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
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">Include Shadow</span>
                <Switch checked={includeShadow} onCheckedChange={setIncludeShadow} />
              </div>
              <Button className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-6">
        <KPICard
          title="Planned vs Actual Margin"
          value={`$${kpiData.actualMargin.toLocaleString()}`}
          description={`Target: $${kpiData.plannedMargin.toLocaleString()}`}
          icon={<TrendingDown className="h-4 w-4" />}
          trend={{
            direction: 'down',
            value: '7.0',
            label: 'vs planned'
          }}
          badge={{
            text: 'Below Target',
            variant: 'destructive'
          }}
        />
        <KPICard
          title="Total Revenue"
          value={`$${kpiData.totalRevenue.toLocaleString()}`}
          description="This quarter"
          icon={<DollarSign className="h-4 w-4" />}
          trend={{
            direction: 'up',
            value: '12.5',
            label: 'vs last quarter'
          }}
        />
        <KPICard
          title="Total Cost"
          value={`$${kpiData.totalCost.toLocaleString()}`}
          description="Including shadow costs"
          icon={<AlertCircle className="h-4 w-4" />}
          trend={{
            direction: 'up',
            value: '8.3',
            label: 'vs last quarter'
          }}
        />
        <KPICard
          title="Profitability %"
          value={`${kpiData.profitability}%`}
          description="Net margin"
          icon={<TrendingUp className="h-4 w-4" />}
          trend={{
            direction: 'down',
            value: '2.1',
            label: 'vs last quarter'
          }}
        />
        <KPICard
          title="Shadow Included"
          value={includeShadow ? "Yes" : "No"}
          description="Toggle to include shadow costs"
          badge={{
            text: includeShadow ? 'All-in View' : 'Active Only',
            variant: includeShadow ? 'default' : 'secondary'
          }}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Revenue vs Cost vs Margin */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Cost vs Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="cost" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Cost" />
                <Line type="monotone" dataKey="margin" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Margin" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Invoice Aging */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Aging (AR)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={invoiceAgingData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {invoiceAgingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number, name: string, props: any) => [
                  `${value}% ($${props.payload.amount.toLocaleString()})`,
                  props.payload.name
                ]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {invoiceAgingData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">${item.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project P&L Table */}
      <Card>
        <CardHeader>
          <CardTitle>Project P&L</CardTitle>
        </CardHeader>
        <CardContent>
          {isMobile ? (
            <div className="space-y-3">
              {projectPLData.map((project) => (
                <Card key={project.project} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="font-medium">{project.project}</div>
                      <Badge variant={project.marginPct > 15 ? 'default' : project.marginPct > 10 ? 'secondary' : 'destructive'}>
                        {project.marginPct > 15 ? 'Healthy' : project.marginPct > 10 ? 'Moderate' : 'Low'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm border-t pt-3">
                      <div>
                        <span className="text-muted-foreground">Revenue: </span>
                        <span className="font-medium">${project.revenue.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cost: </span>
                        <span className="font-medium">${project.cost.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Margin: </span>
                        <span className="font-medium">${project.margin.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Margin %: </span>
                        <span className="font-medium">{project.marginPct}%</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Project</th>
                    <th className="text-right p-2">Revenue</th>
                    <th className="text-right p-2">Cost</th>
                    <th className="text-right p-2">Margin</th>
                    <th className="text-right p-2">Margin %</th>
                    <th className="text-center p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {projectPLData.map((project) => (
                    <tr key={project.project} className="border-b">
                      <td className="p-2 font-medium">{project.project}</td>
                      <td className="p-2 text-right">${project.revenue.toLocaleString()}</td>
                      <td className="p-2 text-right">${project.cost.toLocaleString()}</td>
                      <td className="p-2 text-right">${project.margin.toLocaleString()}</td>
                      <td className="p-2 text-right">{project.marginPct}%</td>
                      <td className="p-2 text-center">
                        <Badge variant={project.marginPct > 15 ? 'default' : project.marginPct > 10 ? 'secondary' : 'destructive'}>
                          {project.marginPct > 15 ? 'Healthy' : project.marginPct > 10 ? 'Moderate' : 'Low'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}