import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { AlertTriangle, ExternalLink, Clock, DollarSign, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContractSummary {
  id: string;
  type: 'MSA' | 'SOW' | 'PO';
  title: string;
  client: string;
  validFrom: string;
  validTo: string;
  amount?: number;
  currency: string;
  status: 'active' | 'expiring' | 'expired';
  daysToExpiry: number;
  utilization?: number;
}

export function ProjectContractsPage() {
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for contract summaries
  const contracts: ContractSummary[] = [
    {
      id: '1',
      type: 'MSA',
      title: 'Master Service Agreement - TechCorp',
      client: 'TechCorp Inc',
      validFrom: '2024-01-01',
      validTo: '2024-12-31',
      currency: 'USD',
      status: 'active',
      daysToExpiry: 45
    },
    {
      id: '2',
      type: 'SOW',
      title: 'E-commerce Platform Development',
      client: 'TechCorp Inc',
      validFrom: '2024-02-01',
      validTo: '2024-08-31',
      amount: 500000,
      currency: 'USD',
      status: 'active',
      daysToExpiry: 120,
      utilization: 75
    },
    {
      id: '3',
      type: 'PO',
      title: 'PO-2024-0001',
      client: 'TechCorp Inc',
      validFrom: '2024-02-01',
      validTo: '2024-06-30',
      amount: 250000,
      currency: 'USD',
      status: 'expiring',
      daysToExpiry: 15,
      utilization: 85
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'expiring':
        return <Badge variant="destructive">Expiring Soon</Badge>;
      case 'expired':
        return <Badge variant="secondary">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewInCRM = () => {
    toast({
      title: "Redirecting to CRM",
      description: "Opening contract management in CRM module",
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-none space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Project Contracts</h1>
            <p className="text-muted-foreground">Read-only view of contract metadata for operational purposes</p>
          </div>
          <Button onClick={handleViewInCRM} className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            Manage in CRM
          </Button>
        </div>

        {/* Expiry Alerts */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Contract Expiry Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-orange-700">
              <p>• PO-2024-0001 expires in 15 days (June 30, 2024)</p>
              <p>• SOW-DEV-001 requires renewal action within 30 days</p>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search contracts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  <SelectItem value="techcorp">TechCorp Inc</SelectItem>
                  <SelectItem value="startup">Startup Inc</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Contracts List */}
        <Card>
          <CardHeader>
            <CardTitle>Active Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contracts.map((contract) => (
                <div key={contract.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline">{contract.type}</Badge>
                      <h3 className="font-medium">{contract.title}</h3>
                      {getStatusBadge(contract.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Client: {contract.client}</p>
                      <p>Valid: {contract.validFrom} - {contract.validTo}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {contract.amount && (
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <DollarSign className="h-4 w-4" />
                          {contract.amount.toLocaleString()} {contract.currency}
                        </div>
                        {contract.utilization && (
                          <div className="text-xs text-muted-foreground">
                            {contract.utilization}% utilized
                          </div>
                        )}
                      </div>
                    )}

                    <div className="text-center">
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-4 w-4" />
                        {contract.daysToExpiry} days
                      </div>
                      <div className="text-xs text-muted-foreground">to expiry</div>
                    </div>

                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}