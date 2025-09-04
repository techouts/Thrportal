import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ExpenseMetrics {
  totalSubmitted: number;
  totalApproved: number;
  totalRejected: number;
  avgExpensePerEmployee: number;
  reimbursementTurnaround: number;
  agingClaims: number;
  topClaimers: Array<{ name: string; amount: number; claims: number }>;
  categoryTrends: Array<{ category: string; amount: number; claims: number }>;
}

interface ExpensesDashboardProps {
  metrics: ExpenseMetrics;
  loading?: boolean;
}

export function ExpensesDashboard({ metrics, loading }: ExpensesDashboardProps) {
  const categoryData = [
    { name: 'Travel', value: 45, amount: 125000, color: '#8884d8' },
    { name: 'Food', value: 25, amount: 75000, color: '#82ca9d' },
    { name: 'Lodging', value: 20, amount: 60000, color: '#ffc658' },
    { name: 'Others', value: 10, amount: 30000, color: '#ff7300' }
  ];

  const monthlyTrend = [
    { month: 'Jan', amount: 45000, claims: 24 },
    { month: 'Feb', amount: 52000, claims: 28 },
    { month: 'Mar', amount: 48000, claims: 26 },
    { month: 'Apr', amount: 55000, claims: 31 },
    { month: 'May', amount: 62000, claims: 35 },
    { month: 'Jun', amount: 58000, claims: 32 }
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
              <DollarSign className="h-4 w-4" />
              Total Submitted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(metrics.totalSubmitted / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{(metrics.totalApproved / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((metrics.totalApproved / metrics.totalSubmitted) * 100)}% approval rate
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Avg Turnaround
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.reimbursementTurnaround}</div>
            <p className="text-xs text-muted-foreground">Days to reimbursement</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Aging Claims
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{metrics.agingClaims}</div>
              {metrics.agingClaims > 10 && (
                <Badge variant="destructive" className="text-xs">High</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">&gt;15 days pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Categories */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Expense Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`₹${value}K`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Monthly Expense Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => name === 'amount' ? [`₹${value}`, 'Amount'] : [value, 'Claims']} />
                <Bar dataKey="amount" fill="#8884d8" name="Amount (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Claimers & Category Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Claimers */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top 5 Claimers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.topClaimers.slice(0, 5).map((claimer, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-xl">
                  <div>
                    <div className="font-medium">{claimer.name}</div>
                    <div className="text-sm text-muted-foreground">{claimer.claims} claims</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">₹{(claimer.amount / 1000).toFixed(0)}K</div>
                    <div className="text-xs text-muted-foreground">
                      ₹{Math.round(claimer.amount / claimer.claims)}/claim
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Policy Violations & Alerts */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Policy Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-xl border-yellow-200 bg-yellow-50">
                <div>
                  <div className="font-medium text-yellow-800">Claims Above Limit</div>
                  <div className="text-sm text-yellow-600">5 claims require escalation</div>
                </div>
                <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                  Review
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-xl border-red-200 bg-red-50">
                <div>
                  <div className="font-medium text-red-800">Missing Receipts</div>
                  <div className="text-sm text-red-600">3 claims need documentation</div>
                </div>
                <Badge variant="outline" className="text-red-600 border-red-300">
                  Action Required
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-xl border-blue-200 bg-blue-50">
                <div>
                  <div className="font-medium text-blue-800">Duplicate Expenses</div>
                  <div className="text-sm text-blue-600">2 potential duplicates detected</div>
                </div>
                <Badge variant="outline" className="text-blue-600 border-blue-300">
                  Investigate
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Expense Analysis */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Team Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryData.map((category) => (
              <div key={category.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{category.name}</span>
                  <span>₹{(category.amount / 1000).toFixed(0)}K ({category.value}%)</span>
                </div>
                <Progress value={category.value} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}