import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingUp, 
  Receipt, 
  PiggyBank,
  RefreshCw,
  Download,
  Eye,
  Calendar
} from 'lucide-react';
import { FinanceSummary, FinanceFilters } from '@/types/finance';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { format } from 'date-fns';

interface FinanceSummaryTabProps {
  summary: FinanceSummary | null;
  loading: boolean;
  onRefresh: () => void;
}

export function FinanceSummaryTab({ summary, loading, onRefresh }: FinanceSummaryTabProps) {
  const [filters, setFilters] = useState<FinanceFilters>({
    period: 'FY',
    financialYear: '2023-24'
  });
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const earningsData = summary ? [
    { name: 'Basic', value: summary.earningsBreakdown.basicSalary, color: '#8884d8' },
    { name: 'HRA', value: summary.earningsBreakdown.hra, color: '#82ca9d' },
    { name: 'Allowances', value: summary.earningsBreakdown.allowances, color: '#ffc658' },
    { name: 'Bonus', value: summary.earningsBreakdown.bonus, color: '#ff7300' },
    { name: 'Incentives', value: summary.earningsBreakdown.incentives, color: '#00ff88' }
  ] : [];

  const deductionsData = summary ? [
    { name: 'TDS', value: summary.deductionsBreakdown.tds, color: '#ff4444' },
    { name: 'PF', value: summary.deductionsBreakdown.pf, color: '#ff8800' },
    { name: 'Insurance', value: summary.deductionsBreakdown.insurance, color: '#ffaa00' },
    { name: 'PT', value: summary.deductionsBreakdown.professionalTax, color: '#88ff88' },
    { name: 'Others', value: summary.deductionsBreakdown.other, color: '#8888ff' }
  ] : [];

  const monthlyPayData = summary?.monthlyData.map(item => ({
    month: item.month,
    gross: item.grossPay,
    net: item.netPay,
    deductions: item.deductions,
    tds: item.tds
  })) || [];

  // Tax deduction limits and utilization
  const section80C = { limit: 150000, used: 120000 };
  const section80D = { limit: 25000, used: 15000 };
  const hraExemption = { received: 300000, exempt: 180000, taxable: 120000 };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="rounded-2xl animate-pulse">
              <CardHeader><div className="h-4 bg-muted rounded w-24" /></CardHeader>
              <CardContent><div className="h-8 bg-muted rounded w-16" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No finance data available</p>
          <Button onClick={onRefresh} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Filters & Period Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={filters.period} onValueChange={(value: 'YTD' | 'FY' | 'MONTH') => setFilters({ ...filters, period: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="YTD">Year to Date</SelectItem>
                <SelectItem value="FY">Financial Year</SelectItem>
                <SelectItem value="MONTH">Monthly</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.financialYear || ''} onValueChange={(value) => setFilters({ ...filters, financialYear: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select FY" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2023-24">FY 2023-24</SelectItem>
                <SelectItem value="2022-23">FY 2022-23</SelectItem>
                <SelectItem value="2021-22">FY 2021-22</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {summary.regime} Regime
              </Badge>
            </div>

            <Button variant="outline" onClick={onRefresh} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Gross Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{summary.grossEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Annual total</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Take-Home</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{summary.netTakeHome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">After deductions</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              TDS Deducted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{summary.tdsDeducted.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Tax deducted</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <PiggyBank className="h-4 w-4" />
              Contributions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{summary.contributions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">PF, Insurance, etc.</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reimbursements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">₹{summary.reimbursements.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Non-taxable</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Annualized CTC
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{summary.annualizedCTC.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total package</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Breakdown */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Earnings Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={earningsData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {earningsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Net Pay Trend */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Monthly Net Pay Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyPayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']} />
                <Line type="monotone" dataKey="net" stroke="#22c55e" strokeWidth={2} name="Net Pay" />
                <Line type="monotone" dataKey="gross" stroke="#3b82f6" strokeWidth={2} name="Gross Pay" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Deduction Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Section 80C Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Used: ₹{section80C.used.toLocaleString()}</span>
                <span>Limit: ₹{section80C.limit.toLocaleString()}</span>
              </div>
              <Progress value={(section80C.used / section80C.limit) * 100} className="h-3" />
              <div className="text-sm text-muted-foreground">
                Remaining: ₹{(section80C.limit - section80C.used).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Section 80D Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Used: ₹{section80D.used.toLocaleString()}</span>
                <span>Limit: ₹{section80D.limit.toLocaleString()}</span>
              </div>
              <Progress value={(section80D.used / section80D.limit) * 100} className="h-3" />
              <div className="text-sm text-muted-foreground">
                Remaining: ₹{(section80D.limit - section80D.used).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">HRA Exemption</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Exempt: ₹{hraExemption.exempt.toLocaleString()}</span>
                <span>Received: ₹{hraExemption.received.toLocaleString()}</span>
              </div>
              <Progress value={(hraExemption.exempt / hraExemption.received) * 100} className="h-3" />
              <div className="text-sm text-muted-foreground">
                Taxable: ₹{hraExemption.taxable.toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Ledger */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Monthly Ledger
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summary.monthlyData.map((month, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-xl hover:bg-muted/50 cursor-pointer">
                <div>
                  <div className="font-medium">{month.month} {month.year}</div>
                  <div className="text-sm text-muted-foreground">
                    {month.workingDays} working days • {month.paidDays} paid days
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">₹{month.netPay.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">
                    Gross: ₹{month.grossPay.toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                    <Download className="h-4 w-4" />
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