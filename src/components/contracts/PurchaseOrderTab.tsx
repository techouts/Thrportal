import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Search, Edit, Trash2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CrmService } from '@/services/crmService';
import { CreatePOForm } from './CreatePOForm';
import { EditPOForm } from './EditPOForm';
import type { PurchaseOrder } from '@/types/contracts';

export function PurchaseOrderTab() {
  const { toast } = useToast();
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    loadPOs();
    loadClients();
  }, [searchTerm, selectedClient, selectedStatus]);

  const loadPOs = async () => {
    try {
      setLoading(true);
      const data = await CrmService.getPOs({
        search: searchTerm,
        client_id: selectedClient !== 'all' ? selectedClient : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined
      });
      setPos(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load Purchase Orders',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const data = await CrmService.getClients();
      setClients(data);
    } catch (error) {
      console.error('Failed to load clients', error);
    }
  };

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

  const handleDeletePO = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Purchase Order?')) return;
    
    try {
      await CrmService.deletePO(id);
      toast({
        title: 'Success',
        description: 'Purchase Order deleted successfully'
      });
      loadPOs();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete Purchase Order',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Purchase Orders</h2>
          <p className="text-muted-foreground">Track client purchase orders and budget utilization</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create PO
        </Button>
      </div>

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
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                ))}
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

      <Card>
        <CardHeader>
          <CardTitle>Purchase Order Registry ({pos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : pos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No Purchase Orders found</div>
          ) : (
            <div className="space-y-4">
              {pos.map((po) => (
                <div key={po.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{po.po_number}</h3>
                        {getStatusBadge(po.status)}
                      </div>
                      <div className="text-sm text-muted-foreground mb-3">
                        <p>Valid: {po.valid_from} - {po.valid_to}</p>
                        <p>Total: {po.total_amount} {po.currency}</p>
                        <p>Remaining: {po.remaining_amount} {po.currency}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {po.doc_link && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={po.doc_link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingPO(po)}
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Purchase Order</DialogTitle>
          </DialogHeader>
          <CreatePOForm 
            onSuccess={() => {
              // Close dialog immediately for instant feedback
              setShowCreateDialog(false);
              // Refresh data in background
              loadPOs();
            }}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingPO} onOpenChange={(open) => !open && setEditingPO(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Purchase Order</DialogTitle>
          </DialogHeader>
          {editingPO && (
            <EditPOForm 
              po={editingPO}
              onSuccess={() => {
                setEditingPO(null);
                loadPOs();
              }}
              onCancel={() => setEditingPO(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
