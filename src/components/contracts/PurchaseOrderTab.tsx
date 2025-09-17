import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, DollarSign, Calendar, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PurchaseOrderData {
  id: string;
  poNumber: string;
  client: string;
  validFrom: string;
  validTo: string;
  totalAmount: number;
  remainingAmount: number;
  currency: string;
  status: 'draft' | 'active' | 'expired' | 'terminated';
  utilization: number;
  linkedSOWs: string[];
  docLink?: string;
}

export function PurchaseOrderTab() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const purchaseOrders: PurchaseOrderData[] = [
    {
      id: '1',
      poNumber: 'PO-2024-0001',
      client: 'TechCorp Inc',
      validFrom: '2024-02-01',
      validTo: '2024-06-30',
      totalAmount: 250000,
      remainingAmount: 62500,
      currency: 'USD',
      status: 'active',
      utilization: 75,
      linkedSOWs: ['SOW-ECOMMERCE-001'],
      docLink: '#'
    },
    {
      id: '2',
      poNumber: 'PO-2024-0002',
      client: 'StartupInc',
      validFrom: '2024-03-01',
      validTo: '2024-09-30',
      totalAmount: 180000,
      remainingAmount: 108000,
      currency: 'USD',
      status: 'active',
      utilization: 40,
      linkedSOWs: ['SOW-MOBILE-001'],
      docLink: '#'
    },
    {
      id: '3',
      poNumber: 'PO-2024-0003',
      client: 'RetailCorp',
      validFrom: '2024-01-15',
      validTo: '2024-05-15',
      totalAmount: 200000,
      remainingAmount: 10000,
      currency: 'USD',
      status: 'active',
      utilization: 95,
      linkedSOWs: ['SOW-ANALYTICS-001']
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

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 75) return 'text-orange-600';
    return 'text-green-600';
  };

  const handleCreatePO = () => {
    toast({
      title: "Create Purchase Order",
      description: "Purchase Order creation dialog would open here",
    });
  };

  const handleEditPO = (id: string) => {
    toast({
      title: "Edit Purchase Order",
      description: `Editing PO ${id}`,
    });
  };

  const handleDeletePO = (id: string) => {
    toast({
      title: "Delete Purchase Order",
      description: `PO ${id} deletion confirmation would appear`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header and Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Purchase Orders</h2>
          <p className="text-muted-foreground">Track client purchase orders and budget utilization</p>
        </div>
        <Button onClick={handleCreatePO} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create PO
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
                  placeholder="Search POs..."
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

      {/* Purchase Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Order Registry ({purchaseOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {purchaseOrders.map((po) => (
              <div key={po.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{po.poNumber}</h3>
                      {getStatusBadge(po.status)}
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">
                      <p>Client: {po.client}</p>
                      <p>Valid: {po.validFrom} - {po.validTo}</p>
                      <p>Linked SOWs: {po.linkedSOWs.join(', ')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {po.docLink && (
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPO(po.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePO(po.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Total Amount */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-medium">Total Amount</span>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">
                        {po.totalAmount.toLocaleString()} {po.currency}
                      </p>
                      <p className="text-xs text-muted-foreground">authorized</p>
                    </div>
                  </div>

                  {/* Remaining Amount */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Remaining</span>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">
                        {po.remainingAmount.toLocaleString()} {po.currency}
                      </p>
                      <p className="text-xs text-muted-foreground">available</p>
                    </div>
                  </div>

                  {/* Utilization */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Utilization</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Progress value={po.utilization} className="flex-1" />
                        <span className={`text-sm font-medium ${getUtilizationColor(po.utilization)}`}>
                          {po.utilization}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">budget consumed</p>
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