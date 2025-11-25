import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Lock, 
  Plug, 
  Database,
  FileCheck,
  Settings,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { ComplianceTables } from '@/components/payroll/admin/ComplianceTables';
import { SecurityConfig } from '@/components/payroll/admin/SecurityConfig';
import { IntegrationConfig } from '@/components/payroll/admin/IntegrationConfig';
import { DataTools } from '@/components/payroll/admin/DataTools';
import { AdminPayrollService } from '@/services/adminPayrollService';
import { toast } from 'sonner';

export default function AdminPayrollPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const tab = searchParams.get('tab') || 'compliance';
  const [activeTab, setActiveTab] = useState(tab);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    complianceIssues: 0,
    securityAlerts: 1,
    integrationErrors: 1,
    lastBackup: '2024-04-01'
  });

  useEffect(() => {
    if (currentUser) {
      loadAdminData();
    }
  }, [currentUser]);

  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Load admin-specific data
      await new Promise(resolve => setTimeout(resolve, 800));
      setStats({
        complianceIssues: 0,
        securityAlerts: 1,
        integrationErrors: 1,
        lastBackup: '2024-04-01'
      });
    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/Admin/Payroll?tab=${value}`, { replace: true });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Admin Payroll" />
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
        title="Admin Payroll Configuration"
        description="Manage compliance, security, integrations, and system data"
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{stats.complianceIssues}</div>
              {stats.complianceIssues === 0 ? (
                <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                  All Good
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-xs">
                  Issues
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Configuration status</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{stats.securityAlerts}</div>
              {stats.securityAlerts > 0 && (
                <Badge variant="secondary" className="text-xs">
                  Alert
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Security alerts</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Plug className="h-4 w-4" />
              Integrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">3/4</div>
              {stats.integrationErrors > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {stats.integrationErrors} Error
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Active connections</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Database className="h-4 w-4" />
              Last Backup
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
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Compliance</span>
            {stats.complianceIssues > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs h-5 w-5 p-0 flex items-center justify-center">
                {stats.complianceIssues}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Security</span>
            {stats.securityAlerts > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs h-5 w-5 p-0 flex items-center justify-center">
                {stats.securityAlerts}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Plug className="w-4 h-4" />
            <span className="hidden sm:inline">Integrations</span>
            {stats.integrationErrors > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs h-5 w-5 p-0 flex items-center justify-center">
                {stats.integrationErrors}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            <span className="hidden sm:inline">Data</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compliance">
          <ComplianceTables />
        </TabsContent>

        <TabsContent value="security">
          <SecurityConfig />
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationConfig />
        </TabsContent>

        <TabsContent value="data">
          <DataTools />
        </TabsContent>
      </Tabs>
    </div>
  );
}