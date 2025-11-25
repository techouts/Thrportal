import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Upload, 
  Play, 
  CheckCircle2, 
  Users, 
  CreditCard,
  FileText,
  BarChart3,
  Database,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { usePayrollRunStore } from '@/stores/payrollStore';
import { PayrollSetupForm } from '@/components/payroll/hr/PayrollSetupForm';
import { PayrollInputsImporter } from '@/components/payroll/hr/PayrollInputsImporter';
import { PayrollRunsTable } from '@/components/payroll/hr/PayrollRunsTable';
import { PayrollValidationTable } from '@/components/payroll/hr/PayrollValidationTable';
import { PayrollApprovalsList } from '@/components/payroll/hr/PayrollApprovalsList';
import { PaymentsBatchGen } from '@/components/payroll/hr/PaymentsBatchGen';
import { StatutoryHelpers } from '@/components/payroll/hr/StatutoryHelpers';
import { FnFSettlement } from '@/components/payroll/hr/FnFSettlement';
import { PayrollReportsList } from '@/components/payroll/hr/PayrollReportsList';
import { PayrollMastersManager } from '@/components/payroll/hr/PayrollMastersManager';
import { toast } from 'sonner';

export default function PayrollPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const tab = searchParams.get('tab') || 'setup';
  const [activeTab, setActiveTab] = useState(tab);
  const { runs, exceptions, loading, loadRuns } = usePayrollRunStore();

  useEffect(() => {
    if (currentUser) {
      loadRuns();
    }
  }, [currentUser, loadRuns]);

  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/HR/Payroll?tab=${value}`, { replace: true });
  };

  const pendingRuns = runs.filter(r => r.status === 'DRAFT' || r.status === 'SIMULATED').length;
  const totalExceptions = Object.values(exceptions).flat().length;

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Payroll Management" />
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
        title="Payroll Management"
        description="Manage payroll setup, processing, and compliance"
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Play className="h-4 w-4" />
              Active Runs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{pendingRuns}</div>
              {pendingRuns > 0 && (
                <Badge variant="secondary" className="text-xs">
                  In Progress
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Pending processing</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">255</div>
            <p className="text-xs text-muted-foreground">Active payroll</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Exceptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{totalExceptions}</div>
              {totalExceptions > 0 && (
                <Badge variant="destructive" className="text-xs">
                  Need Review
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Current period</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹6.38Cr</div>
            <p className="text-xs text-muted-foreground">Current month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="setup" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Setup</span>
          </TabsTrigger>
          <TabsTrigger value="inputs" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Inputs</span>
          </TabsTrigger>
          <TabsTrigger value="runs" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            <span className="hidden sm:inline">Runs</span>
            {pendingRuns > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs h-5 w-5 p-0 flex items-center justify-center">
                {pendingRuns}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="validation" className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span className="hidden sm:inline">Validation</span>
            {totalExceptions > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs h-5 w-5 p-0 flex items-center justify-center">
                {totalExceptions}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approvals" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Approvals</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="setup">
          <PayrollSetupForm />
        </TabsContent>

        <TabsContent value="inputs">
          <PayrollInputsImporter />
        </TabsContent>

        <TabsContent value="runs">
          <PayrollRunsTable runs={runs} />
        </TabsContent>

        <TabsContent value="validation">
          <PayrollValidationTable exceptions={exceptions} />
        </TabsContent>

        <TabsContent value="approvals">
          <PayrollApprovalsList />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentsBatchGen />
        </TabsContent>

        <TabsContent value="statutory">
          <StatutoryHelpers />
        </TabsContent>

        <TabsContent value="fnf">
          <FnFSettlement />
        </TabsContent>

        <TabsContent value="reports">
          <PayrollReportsList />
        </TabsContent>

        <TabsContent value="masters">
          <PayrollMastersManager />
        </TabsContent>

        {/* Second Level Tabs */}
        <Tabs defaultValue="payments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="statutory" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Statutory
            </TabsTrigger>
            <TabsTrigger value="fnf" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              F&F
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="masters" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Masters
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </Tabs>
    </div>
  );
}