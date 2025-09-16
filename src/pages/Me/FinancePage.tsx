import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  FileText, 
  Calculator, 
  Receipt, 
  Upload, 
  BarChart3, 
  CreditCard,
  PieChart
} from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { toast } from 'sonner';

// Placeholder components - will be implemented based on requirements
const SummaryTab = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Net Pay</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹85,000</div>
          <p className="text-xs text-muted-foreground">Current month</p>
        </CardContent>
      </Card>
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">YTD Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹10.2L</div>
          <p className="text-xs text-muted-foreground">This fiscal year</p>
        </CardContent>
      </Card>
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Tax Paid</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹1.8L</div>
          <p className="text-xs text-muted-foreground">YTD deductions</p>
        </CardContent>
      </Card>
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Pending Proofs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">3</div>
            <Badge variant="destructive" className="text-xs">Due</Badge>
          </div>
          <p className="text-xs text-muted-foreground">Tax documents</p>
        </CardContent>
      </Card>
    </div>
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Financial Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Detailed financial summary will be displayed here.</p>
      </CardContent>
    </Card>
  </div>
);

const TaxesTab = () => (
  <Card className="rounded-2xl">
    <CardHeader>
      <CardTitle>Tax Management</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">Tax regime selection, calculators, and management tools.</p>
    </CardContent>
  </Card>
);

const PayslipsTab = () => (
  <Card className="rounded-2xl">
    <CardHeader>
      <CardTitle>Payslips</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">Monthly payslips with download and detailed view options.</p>
    </CardContent>
  </Card>
);

const DeclarationsTab = () => (
  <Card className="rounded-2xl">
    <CardHeader>
      <CardTitle>Tax Declarations</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">Form 12BB and investment declaration wizard.</p>
    </CardContent>
  </Card>
);

const ProofsTab = () => (
  <Card className="rounded-2xl">
    <CardHeader>
      <CardTitle>Investment Proofs</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">Upload and manage investment proofs and documents.</p>
    </CardContent>
  </Card>
);

const ProjectionsTab = () => (
  <Card className="rounded-2xl">
    <CardHeader>
      <CardTitle>Tax Projections</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">Tax planning and projection tools.</p>
    </CardContent>
  </Card>
);

const ReimbursementsTab = () => (
  <Card className="rounded-2xl">
    <CardHeader>
      <CardTitle>Reimbursements</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">Submit and track reimbursement claims.</p>
    </CardContent>
  </Card>
);

const StatementsTab = () => (
  <Card className="rounded-2xl">
    <CardHeader>
      <CardTitle>Statements & Reports</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">Form 16, 12BA downloads, and financial statements.</p>
    </CardContent>
  </Card>
);

export default function FinancePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const tab = searchParams.get('tab') || 'summary';
  const [activeTab, setActiveTab] = useState(tab);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      // Load finance data
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/Me/Finance?tab=${value}`, { replace: true });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Finance" />
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
        title="My Finance"
        description="Manage your payroll, taxes, and financial information"
      />

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            <span className="hidden sm:inline">Summary</span>
          </TabsTrigger>
          <TabsTrigger value="taxes" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            <span className="hidden sm:inline">Taxes</span>
          </TabsTrigger>
          <TabsTrigger value="payslips" className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            <span className="hidden sm:inline">Payslips</span>
          </TabsTrigger>
          <TabsTrigger value="declarations" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Declarations</span>
          </TabsTrigger>
          <TabsTrigger value="proofs" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Proofs</span>
          </TabsTrigger>
          <TabsTrigger value="projections" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Projections</span>
          </TabsTrigger>
          <TabsTrigger value="reimbursements" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">Reimburse</span>
          </TabsTrigger>
          <TabsTrigger value="statements" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Statements</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <SummaryTab />
        </TabsContent>

        <TabsContent value="taxes">
          <TaxesTab />
        </TabsContent>

        <TabsContent value="payslips">
          <PayslipsTab />
        </TabsContent>

        <TabsContent value="declarations">
          <DeclarationsTab />
        </TabsContent>

        <TabsContent value="proofs">
          <ProofsTab />
        </TabsContent>

        <TabsContent value="projections">
          <ProjectionsTab />
        </TabsContent>

        <TabsContent value="reimbursements">
          <ReimbursementsTab />
        </TabsContent>

        <TabsContent value="statements">
          <StatementsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
