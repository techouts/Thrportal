import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CrmService } from '@/services/crmService';
import { CreateSOWForm } from './CreateSOWForm';
import { EditSOWForm } from './EditSOWForm';
import type { SOW } from '@/types/contracts';

export function SOWTab() {
  const { toast } = useToast();
  const [sows, setSows] = useState<SOW[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSOW, setEditingSOW] = useState<SOW | null>(null);
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    loadSOWs();
    loadClients();
  }, [searchTerm, selectedClient, selectedStatus]);

  const loadSOWs = async () => {
    try {
      setLoading(true);
      const data = await CrmService.getSOWs({
        search: searchTerm,
        status: selectedStatus !== 'all' ? selectedStatus : undefined
      }) as any;
      setSows(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load SOWs',
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

  const handleDeleteSOW = async (id: string) => {
    if (!confirm('Are you sure you want to delete this SOW?')) return;
    
    try {
      await CrmService.deleteSOW(id);
      toast({
        title: 'Success',
        description: 'SOW deleted successfully'
      });
      loadSOWs();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete SOW',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Statements of Work</h2>
          <p className="text-muted-foreground">Manage project-specific work agreements</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create SOW
        </Button>
      </div>

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
          <CardTitle>SOW Registry ({sows.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : sows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No SOWs found</div>
          ) : (
            <div className="space-y-4">
              {sows.map((sow) => (
                <div key={sow.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{sow.title}</h3>
                        {getStatusBadge(sow.status)}
                      </div>
                      <div className="text-sm text-muted-foreground mb-3">
                        <p>Valid: {sow.valid_from} - {sow.valid_to}</p>
                        <p>Amount Cap: {sow.amount_cap} {sow.currency}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingSOW(sow)}
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create SOW</DialogTitle>
          </DialogHeader>
          <CreateSOWForm 
            onSuccess={() => {
              setShowCreateDialog(false);
              loadSOWs();
            }}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingSOW} onOpenChange={(open) => !open && setEditingSOW(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit SOW</DialogTitle>
          </DialogHeader>
          {editingSOW && (
            <EditSOWForm 
              sow={editingSOW}
              onSuccess={() => {
                setEditingSOW(null);
                loadSOWs();
              }}
              onCancel={() => setEditingSOW(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
