import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AlertTriangle, FileText, DollarSign, Calendar, TrendingUp, Users } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  description?: string;
}

function KPICard({ title, value, icon, trend, description }: KPICardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
          <div className="h-8 w-8 text-muted-foreground">
            {icon}
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ContractDashboardTab() {
  const contractMetrics = {
    totalContracts: 24,
    activeContracts: 18,
    expiringSoon: 3,
    poUtilization: 75,
    sowBurnRate: 68,
    shadowApprovalsPending: 2,
    overallocatedSows: 1
  };

  const expiringContracts = [
    { id: 1, type: 'PO', title: 'PO-2024-0001', client: 'TechCorp', days: 15 },
    { id: 2, type: 'SOW', title: 'Mobile App Development', client: 'StartupInc', days: 28 },
    { id: 3, type: 'MSA', title: 'Master Agreement - RetailCorp', client: 'RetailCorp', days: 45 }
  ];

  const topClients = [
    { name: 'TechCorp Inc', contracts: 8, value: 2500000, utilization: 85 },
    { name: 'StartupInc', contracts: 4, value: 1200000, utilization: 72 },
    { name: 'RetailCorp', contracts: 6, value: 1800000, utilization: 68 }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Contracts"
          value={contractMetrics.totalContracts}
          icon={<FileText className="h-8 w-8" />}
          trend="+12% from last month"
        />
        <KPICard
          title="Active Contracts"
          value={contractMetrics.activeContracts}
          icon={<Calendar className="h-8 w-8" />}
          description="Currently in force"
        />
        <KPICard
          title="PO Utilization"
          value={`${contractMetrics.poUtilization}%`}
          icon={<DollarSign className="h-8 w-8" />}
          trend="+5% this quarter"
        />
        <KPICard
          title="SOW Burn Rate"
          value={`${contractMetrics.sowBurnRate}%`}
          icon={<TrendingUp className="h-8 w-8" />}
          description="Average across active SOWs"
        />
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Contracts Expiring Soon ({contractMetrics.expiringSoon})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiringContracts.map((contract) => (
                <div key={contract.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white rounded-lg gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{contract.type}</Badge>
                      <span className="font-medium">{contract.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{contract.client}</p>
                  </div>
                  <div className="text-right sm:text-right">
                    <p className="font-medium text-orange-600">{contract.days} days</p>
                    <p className="text-xs text-muted-foreground">to expiry</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Users className="h-5 w-5" />
              Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div>
                  <p className="font-medium">Shadow Approvals Pending</p>
                  <p className="text-sm text-muted-foreground">Client approval required for shadow resources</p>
                </div>
                <Badge variant="destructive">{contractMetrics.shadowApprovalsPending}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div>
                  <p className="font-medium">Overallocated SOWs</p>
                  <p className="text-sm text-muted-foreground">SOWs exceeding capacity limits</p>
                </div>
                <Badge variant="destructive">{contractMetrics.overallocatedSows}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Clients by Contract Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topClients.map((client, index) => (
              <div key={index} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-4">
                <div className="flex-1">
                  <h3 className="font-medium">{client.name}</h3>
                  <p className="text-sm text-muted-foreground">{client.contracts} contracts</p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  <div className="text-left sm:text-right">
                    <p className="font-medium">${client.value.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total value</p>
                  </div>
                  <div className="w-full sm:w-24">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Utilization</span>
                      <span>{client.utilization}%</span>
                    </div>
                    <Progress value={client.utilization} className="h-2" />
                  </div>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    View Details
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