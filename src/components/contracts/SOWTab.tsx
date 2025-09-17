import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, DollarSign, Users, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SOWData {
  id: string;
  title: string;
  msa: string;
  client: string;
  validFrom: string;
  validTo: string;
  amountCap: number;
  currency: string;
  status: 'draft' | 'active' | 'expired' | 'terminated';
  burnRate: number;
  allocatedEmployees: number;
  roleCaps: Record<string, number>;
  overallocated: boolean;
}

export function SOWTab() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const sows: SOWData[] = [
    {
      id: '1',
      title: 'E-commerce Platform Development',
      msa: 'MSA-TECHCORP-2024',
      client: 'TechCorp Inc',
      validFrom: '2024-02-01',
      validTo: '2024-08-31',
      amountCap: 500000,
      currency: 'USD',
      status: 'active',
      burnRate: 75,
      allocatedEmployees: 8,
      roleCaps: { 'Frontend Developer': 3, 'Backend Developer': 3, 'QA Engineer': 2 },
      overallocated: false
    },
    {
      id: '2',
      title: 'Mobile App Development',
      msa: 'MSA-STARTUP-2024',
      client: 'StartupInc',
      validFrom: '2024-03-01',
      validTo: '2024-09-30',
      amountCap: 300000,
      currency: 'USD',
      status: 'active',
      burnRate: 68,
      allocatedEmployees: 5,
      roleCaps: { 'Mobile Developer': 3, 'UI/UX Designer': 1, 'QA Engineer': 1 },
      overallocated: false
    },
    {
      id: '3',
      title: 'Data Analytics Platform',
      msa: 'MSA-RETAIL-2024',
      client: 'RetailCorp',
      validFrom: '2024-01-15',
      validTo: '2024-07-15',
      amountCap: 400000,
      currency: 'USD',
      status: 'active',
      burnRate: 95,
      allocatedEmployees: 7,
      roleCaps: { 'Data Engineer': 3, 'Data Scientist': 2, 'Backend Developer': 2 },
      overallocated: true
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      case 'terminated':
        return <Badge variant="outline">Terminated</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getBurnRateColor = (burnRate: number) => {
    if (burnRate >= 90) return 'text-red-600';
    if (burnRate >= 75) return 'text-orange-600';
    return 'text-green-600';
  };

  const handleCreateSOW = () => {
    toast({
      title: "Create SOW",
      description: "SOW creation dialog would open here",
    });
  };

  const handleEditSOW = (id: string) => {
    toast({
      title: "Edit SOW",
      description: `Editing SOW ${id}`,
    });
  };

  const handleDeleteSOW = (id: string) => {
    toast({
      title: "Delete SOW",
      description: `SOW ${id} deletion confirmation would appear`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header and Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Statements of Work</h2>
          <p className="text-muted-foreground">Manage project-specific work agreements with role caps and budgets</p>
        </div>
        <Button onClick={handleCreateSOW} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create SOW
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search SOWs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                <SelectItem value="techcorp">TechCorp Inc</SelectItem>
                <SelectItem value="startup">StartupInc</SelectItem>
                <SelectItem value="retail">RetailCorp</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* SOW List */}
      <Card>
        <CardHeader>
          <CardTitle>SOW Registry ({sows.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sows.map((sow) => (
              <div key={sow.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{sow.title}</h3>
                      {getStatusBadge(sow.status)}
                      {sow.overallocated && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Overallocated
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">
                      <p>MSA: {sow.msa} | Client: {sow.client}</p>
                      <p>Valid: {sow.validFrom} - {sow.validTo}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditSOW(sow.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSOW(sow.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Budget Information */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-medium">Budget</span>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">
                        {sow.amountCap.toLocaleString()} {sow.currency}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={sow.burnRate} className="flex-1" />
                        <span className={`text-sm font-medium ${getBurnRateColor(sow.burnRate)}`}>
                          {sow.burnRate}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">burn rate</p>
                    </div>
                  </div>

                  {/* Resource Allocation */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">Resources</span>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{sow.allocatedEmployees}</p>
                      <p className="text-xs text-muted-foreground">allocated employees</p>
                    </div>
                  </div>

                  {/* Role Caps */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Role Caps</span>
                    </div>
                    <div className="space-y-1">
                      {Object.entries(sow.roleCaps).map(([role, cap]) => (
                        <div key={role} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{role}</span>
                          <span className="font-medium">{cap}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}