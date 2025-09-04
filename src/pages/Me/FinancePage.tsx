import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FinanceSummaryTab } from '@/components/finance/FinanceSummaryTab';
import { TaxManagementTab } from '@/components/finance/TaxManagementTab';
import { TaxCalculatorsTab } from '@/components/finance/TaxCalculatorsTab';
import { StatementsTab } from '@/components/finance/StatementsTab';
import { 
  DollarSign, 
  Calculator, 
  FileText, 
  Receipt,
  TrendingUp,
  Shield,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { financeService } from '@/services/financeService';
import { FinanceSummary, TaxDeclaration } from '@/types/finance';
import { toast } from 'sonner';

export default function FinancePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const tab = searchParams.get('tab') || 'summary';
  const [activeTab, setActiveTab] = useState(tab);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [declarations, setDeclarations] = useState<TaxDeclaration[]>([]);

  useEffect(() => {
    if (currentUser) {
      loadFinanceData();
    }
  }, [currentUser]);

  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  const loadFinanceData = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const [summaryResponse, declarationsResponse] = await Promise.all([
        financeService.getFinanceSummary(currentUser.employeeId, { 
          period: 'FY', 
          financialYear: '2023-24' 
        }),
        financeService.getTaxDeclarations(currentUser.employeeId, '2023-24')
      ]);

      if (summaryResponse.success) {
        setSummary(summaryResponse.data);
      }

      if (declarationsResponse.success) {
        setDeclarations(declarationsResponse.data);
      }
    } catch (error) {
      toast.error('Failed to load finance data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/Me/Finance?tab=${value}`, { replace: true });
  };

  const pendingDeclarations = declarations.filter(d => d.status === 'DRAFT' || d.status === 'SUBMITTED').length;
  const verificationRequired = declarations.filter(d => d.proofSubmitted && d.status === 'SUBMITTED').length;

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Finance" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="rounded-2xl animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-24" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Employee Finance"
        description="Manage your salary, taxes, and financial documents"
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Net Take-Home
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{summary?.netTakeHome.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">This year</p>
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
            <div className="text-2xl font-bold">₹{summary?.tdsDeducted.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">Total deducted</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Declarations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{declarations.length}</div>
              {pendingDeclarations > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {pendingDeclarations} pending
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Tax declarations</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Tax Regime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.regime || 'OLD'}</div>
            <p className="text-xs text-muted-foreground">Current regime</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Summary</span>
          </TabsTrigger>
          <TabsTrigger value="taxes" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Taxes</span>
            {pendingDeclarations > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs h-5 w-5 p-0 flex items-center justify-center">
                {pendingDeclarations}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="calculators" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            <span className="hidden sm:inline">Calculators</span>
          </TabsTrigger>
          <TabsTrigger value="statements" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Statements</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <FinanceSummaryTab 
            summary={summary} 
            loading={loading}
            onRefresh={loadFinanceData}
          />
        </TabsContent>

        <TabsContent value="taxes">
          <Tabs defaultValue="manage" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manage" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Manage Declarations
                {pendingDeclarations > 0 && (
                  <Badge variant="destructive" className="ml-1 text-xs h-5 w-5 p-0 flex items-center justify-center">
                    {pendingDeclarations}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="calculators" className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Tax Calculators
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manage">
              <TaxManagementTab 
                declarations={declarations}
                loading={loading}
                onRefresh={loadFinanceData}
              />
            </TabsContent>

            <TabsContent value="calculators">
              <TaxCalculatorsTab />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="calculators">
          <TaxCalculatorsTab />
        </TabsContent>

        <TabsContent value="statements">
          <StatementsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}