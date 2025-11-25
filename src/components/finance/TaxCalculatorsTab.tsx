import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  Home, 
  TrendingUp, 
  RefreshCw,
  DollarSign,
  PiggyBank,
  Building,
  ArrowRight
} from 'lucide-react';
import { financeService } from '@/services/financeService';
import { HRACalculation, TDSCalculation, RegimeComparison } from '@/types/finance';
import { toast } from 'sonner';

export function TaxCalculatorsTab() {
  const [activeCalculator, setActiveCalculator] = useState('hra');

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            Tax Calculators & Planning Tools
          </CardTitle>
          <p className="text-muted-foreground">
            Calculate your tax savings and plan your investments
          </p>
        </CardHeader>
      </Card>

      <Tabs value={activeCalculator} onValueChange={setActiveCalculator} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hra" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">HRA Calculator</span>
          </TabsTrigger>
          <TabsTrigger value="regime" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Old vs New</span>
          </TabsTrigger>
          <TabsTrigger value="tds" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">TDS Calculator</span>
          </TabsTrigger>
          <TabsTrigger value="planner" className="flex items-center gap-2">
            <PiggyBank className="w-4 h-4" />
            <span className="hidden sm:inline">80C Planner</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hra">
          <HRACalculatorComponent />
        </TabsContent>

        <TabsContent value="regime">
          <RegimeComparisonComponent />
        </TabsContent>

        <TabsContent value="tds">
          <TDSCalculatorComponent />
        </TabsContent>

        <TabsContent value="planner">
          <InvestmentPlannerComponent />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function HRACalculatorComponent() {
  const [inputs, setInputs] = useState({
    basicSalary: 50000,
    hraReceived: 25000,
    rentPaid: 20000,
    cityType: 'METRO' as 'METRO' | 'NON_METRO'
  });
  const [result, setResult] = useState<HRACalculation | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateHRA = async () => {
    setLoading(true);
    try {
      const response = await financeService.calculateHRA(
        inputs.basicSalary * 12,
        inputs.hraReceived * 12,
        inputs.rentPaid * 12,
        inputs.cityType
      );
      setResult(response.data);
    } catch (error) {
      toast.error('Failed to calculate HRA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>HRA Calculator Inputs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Basic Salary (Monthly)</Label>
            <Input 
              type="number"
              value={inputs.basicSalary}
              onChange={(e) => setInputs({ ...inputs, basicSalary: Number(e.target.value) })}
              placeholder="Enter basic salary"
            />
          </div>

          <div className="space-y-2">
            <Label>HRA Received (Monthly)</Label>
            <Input 
              type="number"
              value={inputs.hraReceived}
              onChange={(e) => setInputs({ ...inputs, hraReceived: Number(e.target.value) })}
              placeholder="Enter HRA amount"
            />
          </div>

          <div className="space-y-2">
            <Label>Rent Paid (Monthly)</Label>
            <Input 
              type="number"
              value={inputs.rentPaid}
              onChange={(e) => setInputs({ ...inputs, rentPaid: Number(e.target.value) })}
              placeholder="Enter rent amount"
            />
          </div>

          <div className="space-y-2">
            <Label>City Type</Label>
            <Select value={inputs.cityType} onValueChange={(value: 'METRO' | 'NON_METRO') => setInputs({ ...inputs, cityType: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="METRO">Metro City (50% of Basic)</SelectItem>
                <SelectItem value="NON_METRO">Non-Metro City (40% of Basic)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={calculateHRA} disabled={loading} className="w-full">
            {loading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
            Calculate HRA Exemption
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>HRA Calculation Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600">
                  ₹{result.exemption.toLocaleString()}
                </div>
                <div className="text-sm text-green-700">Annual Exemption</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl">
                <div className="text-2xl font-bold text-red-600">
                  ₹{result.taxableHRA.toLocaleString()}
                </div>
                <div className="text-sm text-red-700">Taxable HRA</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Calculation Breakdown:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Actual HRA Received:</span>
                  <span>₹{result.breakdown.actualHRA.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>City-based Limit ({result.cityType}):</span>
                  <span>₹{result.breakdown.cityBasedLimit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rent - 10% of Basic:</span>
                  <span>₹{result.breakdown.rentMinusBasic.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Exempt Amount (Minimum):</span>
                  <span>₹{result.breakdown.exemptAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl">
              <p className="text-sm text-blue-700">
                <strong>Tax Saving:</strong> Approximately ₹{Math.round(result.exemption * 0.3).toLocaleString()} 
                (assuming 30% tax bracket)
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function RegimeComparisonComponent() {
  const [inputs, setInputs] = useState({
    grossSalary: 1200000,
    section80C: 150000,
    section80D: 25000,
    hraExemption: 180000,
    otherDeductions: 50000
  });
  const [comparison, setComparison] = useState<RegimeComparison | null>(null);
  const [loading, setLoading] = useState(false);

  const compareRegimes = async () => {
    setLoading(true);
    try {
      // Mock comparison for demo
      const mockComparison: RegimeComparison = {
        oldRegime: {
          financialYear: '2023-24',
          regime: 'OLD',
          grossIncome: inputs.grossSalary,
          exemptions: inputs.hraExemption,
          deductions: inputs.section80C + inputs.section80D + inputs.otherDeductions,
          taxableIncome: inputs.grossSalary - inputs.hraExemption - inputs.section80C - inputs.section80D - inputs.otherDeductions,
          taxLiability: 125000,
          tdsDeducted: 0,
          projectedTDS: 125000,
          refundDue: 0,
          shortfall: 0,
          monthlyTDS: 10417,
          remainingMonths: 12
        },
        newRegime: {
          financialYear: '2023-24',
          regime: 'NEW',
          grossIncome: inputs.grossSalary,
          exemptions: 50000,
          deductions: 0,
          taxableIncome: inputs.grossSalary - 50000,
          taxLiability: 135000,
          tdsDeducted: 0,
          projectedTDS: 135000,
          refundDue: 0,
          shortfall: 0,
          monthlyTDS: 11250,
          remainingMonths: 12
        },
        savings: -10000,
        recommendation: 'OLD'
      };
      setComparison(mockComparison);
    } catch (error) {
      toast.error('Failed to compare regimes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Input Your Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Annual Gross Salary</Label>
              <Input 
                type="number"
                value={inputs.grossSalary}
                onChange={(e) => setInputs({ ...inputs, grossSalary: Number(e.target.value) })}
                placeholder="Enter gross salary"
              />
            </div>

            <div className="space-y-2">
              <Label>Section 80C Investments</Label>
              <Input 
                type="number"
                value={inputs.section80C}
                onChange={(e) => setInputs({ ...inputs, section80C: Number(e.target.value) })}
                placeholder="PPF, ELSS, etc."
              />
            </div>

            <div className="space-y-2">
              <Label>Section 80D (Health Insurance)</Label>
              <Input 
                type="number"
                value={inputs.section80D}
                onChange={(e) => setInputs({ ...inputs, section80D: Number(e.target.value) })}
                placeholder="Health insurance premiums"
              />
            </div>

            <div className="space-y-2">
              <Label>HRA Exemption</Label>
              <Input 
                type="number"
                value={inputs.hraExemption}
                onChange={(e) => setInputs({ ...inputs, hraExemption: Number(e.target.value) })}
                placeholder="Exempt HRA amount"
              />
            </div>

            <div className="space-y-2">
              <Label>Other Deductions</Label>
              <Input 
                type="number"
                value={inputs.otherDeductions}
                onChange={(e) => setInputs({ ...inputs, otherDeductions: Number(e.target.value) })}
                placeholder="Other eligible deductions"
              />
            </div>

            <div className="flex items-end">
              <Button onClick={compareRegimes} disabled={loading} className="w-full">
                {loading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                Compare Regimes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {comparison && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Old Tax Regime
                {comparison.recommendation === 'OLD' && (
                  <Badge className="bg-green-100 text-green-800">Recommended</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Gross Income:</span>
                  <span>₹{comparison.oldRegime.grossIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Exemptions:</span>
                  <span>₹{comparison.oldRegime.exemptions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Deductions:</span>
                  <span>₹{comparison.oldRegime.deductions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Taxable Income:</span>
                  <span>₹{comparison.oldRegime.taxableIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-red-600 border-t pt-2">
                  <span>Tax Liability:</span>
                  <span>₹{comparison.oldRegime.taxLiability.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                New Tax Regime
                {comparison.recommendation === 'NEW' && (
                  <Badge className="bg-green-100 text-green-800">Recommended</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Gross Income:</span>
                  <span>₹{comparison.newRegime.grossIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Standard Deduction:</span>
                  <span>₹{comparison.newRegime.exemptions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Other Deductions:</span>
                  <span>₹{comparison.newRegime.deductions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Taxable Income:</span>
                  <span>₹{comparison.newRegime.taxableIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-red-600 border-t pt-2">
                  <span>Tax Liability:</span>
                  <span>₹{comparison.newRegime.taxLiability.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {comparison && (
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>Comparison Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="text-3xl font-bold mb-2">
                {comparison.savings < 0 ? (
                  <span className="text-red-600">₹{Math.abs(comparison.savings).toLocaleString()} more</span>
                ) : (
                  <span className="text-green-600">₹{comparison.savings.toLocaleString()} savings</span>
                )}
              </div>
              <div className="text-lg">
                {comparison.recommendation === 'OLD' ? 'Old Regime' : 'New Regime'} is better
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                {comparison.savings < 0 
                  ? `New regime costs ₹${Math.abs(comparison.savings).toLocaleString()} more in taxes`
                  : `You save ₹${comparison.savings.toLocaleString()} by choosing ${comparison.recommendation.toLowerCase()} regime`
                }
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TDSCalculatorComponent() {
  const [inputs, setInputs] = useState({
    grossSalary: 100000,
    exemptions: 50000,
    deductions: 25000
  });
  const [result, setResult] = useState<TDSCalculation | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateTDS = async () => {
    setLoading(true);
    try {
      const response = await financeService.calculateTDS(
        inputs.grossSalary * 12,
        inputs.exemptions,
        inputs.deductions
      );
      setResult(response.data);
    } catch (error) {
      toast.error('Failed to calculate TDS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>TDS Calculator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Monthly Gross Salary</Label>
            <Input 
              type="number"
              value={inputs.grossSalary}
              onChange={(e) => setInputs({ ...inputs, grossSalary: Number(e.target.value) })}
              placeholder="Enter monthly salary"
            />
          </div>

          <div className="space-y-2">
            <Label>Annual Exemptions</Label>
            <Input 
              type="number"
              value={inputs.exemptions}
              onChange={(e) => setInputs({ ...inputs, exemptions: Number(e.target.value) })}
              placeholder="HRA, LTA, etc."
            />
          </div>

          <div className="space-y-2">
            <Label>Annual Deductions</Label>
            <Input 
              type="number"
              value={inputs.deductions}
              onChange={(e) => setInputs({ ...inputs, deductions: Number(e.target.value) })}
              placeholder="80C, 80D, etc."
            />
          </div>

          <Button onClick={calculateTDS} disabled={loading} className="w-full">
            {loading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
            Calculate TDS
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>TDS Calculation Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">
                  ₹{Math.round(result.monthlyTDS).toLocaleString()}
                </div>
                <div className="text-sm text-blue-700">Monthly TDS</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="text-2xl font-bold text-purple-600">
                  {result.effectiveRate.toFixed(2)}%
                </div>
                <div className="text-sm text-purple-700">Effective Rate</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Calculation Details:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Annual Gross Salary:</span>
                  <span>₹{result.grossSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Less: Exemptions:</span>
                  <span>₹{result.exemptions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Less: Deductions:</span>
                  <span>₹{result.deductions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Taxable Income:</span>
                  <span>₹{result.taxableIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-red-600 border-t pt-2">
                  <span>Annual Tax Liability:</span>
                  <span>₹{Math.round(result.taxLiability).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InvestmentPlannerComponent() {
  const [targetAmount, setTargetAmount] = useState(150000);
  const [currentAmount, setCurrentAmount] = useState(80000);
  
  const gap = targetAmount - currentAmount;
  const monthsRemaining = 4; // Assume 4 months left in FY
  const monthlyInvestment = gap > 0 ? Math.ceil(gap / monthsRemaining) : 0;

  const investments = [
    { name: 'Public Provident Fund (PPF)', min: 500, max: 150000, risk: 'Low', returns: '7.1%', liquidity: '15 years' },
    { name: 'Equity Linked Savings Scheme (ELSS)', min: 500, max: 150000, risk: 'High', returns: '12-15%', liquidity: '3 years' },
    { name: 'National Savings Certificate (NSC)', min: 1000, max: 150000, risk: 'Low', returns: '6.8%', liquidity: '5 years' },
    { name: 'Tax Saving Fixed Deposit', min: 1000, max: 150000, risk: 'Low', returns: '5-6%', liquidity: '5 years' },
    { name: 'Life Insurance Premium', min: 500, max: 150000, risk: 'Low', returns: 'Insurance', liquidity: 'Varies' },
  ];

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Section 80C Investment Planner</CardTitle>
          <p className="text-muted-foreground">Plan your tax-saving investments for maximum benefit</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Target Investment (80C Limit)</Label>
              <Input 
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(Number(e.target.value))}
                max={150000}
              />
              <p className="text-xs text-muted-foreground">Maximum limit: ₹1,50,000</p>
            </div>

            <div className="space-y-2">
              <Label>Current Investments</Label>
              <Input 
                type="number"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Remaining Gap</Label>
              <div className="text-2xl font-bold text-red-600">
                ₹{Math.max(0, gap).toLocaleString()}
              </div>
              {gap > 0 && (
                <p className="text-sm text-muted-foreground">
                  ₹{monthlyInvestment.toLocaleString()} per month for {monthsRemaining} months
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Investment Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {investments.map((investment, index) => (
              <div key={index} className="border rounded-xl p-4 hover:bg-muted/50">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{investment.name}</h4>
                  <Badge variant="outline" className={
                    investment.risk === 'Low' ? 'text-green-600 border-green-200' :
                    investment.risk === 'High' ? 'text-red-600 border-red-200' :
                    'text-yellow-600 border-yellow-200'
                  }>
                    {investment.risk} Risk
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Min Investment:</span>
                    <div className="font-medium">₹{investment.min.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expected Returns:</span>
                    <div className="font-medium">{investment.returns}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Lock-in Period:</span>
                    <div className="font-medium">{investment.liquidity}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tax Benefit:</span>
                    <div className="font-medium">Up to ₹1.5L</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {gap > 0 && (
        <Card className="rounded-2xl shadow-sm border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">Investment Recommendation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-orange-700">
                You need to invest ₹{gap.toLocaleString()} more to reach your target of ₹{targetAmount.toLocaleString()}.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl">
                  <h4 className="font-medium mb-2">Conservative Approach</h4>
                  <p className="text-sm text-muted-foreground">
                    Mix of PPF (₹{Math.min(gap, 70000).toLocaleString()}) and NSC (₹{Math.max(0, gap - 70000).toLocaleString()}) 
                    for stable returns with capital protection.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl">
                  <h4 className="font-medium mb-2">Aggressive Approach</h4>
                  <p className="text-sm text-muted-foreground">
                    Invest entire ₹{gap.toLocaleString()} in ELSS for potentially higher returns 
                    with 3-year lock-in period.
                  </p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl">
                <h4 className="font-medium mb-2 text-green-700">Potential Tax Savings</h4>
                <p className="text-sm">
                  By investing ₹{gap.toLocaleString()}, you can save approximately <span className="font-bold">₹{Math.round(gap * 0.3).toLocaleString()}</span> in taxes 
                  (assuming 30% tax bracket).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}