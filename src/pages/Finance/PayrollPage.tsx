import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileSpreadsheet, 
  Banknote, 
  Scale, 
  Search,
  TrendingUp,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { JVExportConfig } from '@/components/payroll/finance/JVExportConfig';
import { BankBatchList } from '@/components/payroll/finance/BankBatchList';
import { ReconcileTable } from '@/components/payroll/finance/ReconcileTable';
import { AuditLogViewer } from '@/components/payroll/finance/AuditLogViewer';
import { FinancePayrollService } from '@/services/financePayrollService';
import { toast } from 'sonner';

export default function FinancePayrollPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const tab = searchParams.get('tab') || 'jv';
  const [activeTab, setActiveTab] = useState(tab);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingJV: 1,
    pendingBatches: 2,
    varianceCount: 3,
    lastReconcile: '2024-04-01'
  });

  useEffect(() => {
    if (currentUser) {
      loadFinanceData();
    }
  }, [currentUser]);

  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  const loadFinanceData = async () => {
    setLoading(true);
    try {
      // Load finance-specific payroll data
      await new Promise(resolve => setTimeout(resolve, 800));
      setStats({
        pendingJV: 1,
        pendingBatches: 2,
        varianceCount: 3,
        lastReconcile: '2024-04-01'
      });
    } catch (error) {
      toast.error('Failed to load finance data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/Finance/Payroll?tab=${value}`, { replace: true });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Finance Payroll" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
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
        title="Finance Payroll Operations"
        description="Manage journal vouchers, bank files, and reconciliation"
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Pending JV
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{stats.pendingJV}</div>
              {stats.pendingJV > 0 && (
                <Badge variant="secondary" className="text-xs">
                  Export Ready
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Journal vouchers</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Banknote className="h-4 w-4" />
              Bank Batches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{stats.pendingBatches}</div>
              {stats.pendingBatches > 0 && (
                <Badge variant="secondary" className="text-xs">
                  Processing
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Pending payment</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Variances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{stats.varianceCount}</div>
              {stats.varianceCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  Review
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Reconciliation</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Last Reconcile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Apr 1</div>
            <p className="text-xs text-muted-foreground">2024</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="jv" className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">JV Export</span>
            {stats.pendingJV > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs h-5 w-5 p-0 flex items-center justify-center">
                {stats.pendingJV}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="batches" className="flex items-center gap-2">
            <Banknote className="w-4 h-4" />
            <span className="hidden sm:inline">Bank Files</span>
            {stats.pendingBatches > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs h-5 w-5 p-0 flex items-center justify-center">
                {stats.pendingBatches}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reconcile" className="flex items-center gap-2">
            <Scale className="w-4 h-4" />
            <span className="hidden sm:inline">Reconciliation</span>
            {stats.varianceCount > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs h-5 w-5 p-0 flex items-center justify-center">
                {stats.varianceCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="audits" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Audits</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jv">
          <JVExportConfig />
        </TabsContent>

        <TabsContent value="batches">
          <BankBatchList />
        </TabsContent>

        <TabsContent value="reconcile">
          <ReconcileTable />
        </TabsContent>

        <TabsContent value="audits">
          <AuditLogViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
}