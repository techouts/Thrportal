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
import { CreateMSAForm } from './CreateMSAForm';
import { EditMSAForm } from './EditMSAForm';
import type { MSA } from '@/types/contracts';

export function MSATab() {
  const { toast } = useToast();
  const [msas, setMsas] = useState<MSA[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingMSA, setEditingMSA] = useState<MSA | null>(null);
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    loadMSAs();
    loadClients();
  }, [searchTerm, selectedClient, selectedStatus]);

  const loadMSAs = async () => {
    try {
      setLoading(true);
      const data = await CrmService.getMSAs({
        search: searchTerm,
        client_id: selectedClient !== 'all' ? selectedClient : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined
      });
      setMsas(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load MSAs',
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

  const handleDeleteMSA = async (id: string) => {
    if (!confirm('Are you sure you want to delete this MSA?')) return;
    
    try {
      await CrmService.deleteMSA(id);
      toast({
        title: 'Success',
        description: 'MSA deleted successfully'
      });
      loadMSAs();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete MSA',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Master Service Agreements</h2>
          <p className="text-muted-foreground">Manage framework agreements with clients</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create MSA
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search MSAs..."
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
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>MSA Registry ({msas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : msas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No MSAs found</div>
          ) : (
            <div className="space-y-4">
              {msas.map((msa) => (
                <div key={msa.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{msa.title}</h3>
                      {getStatusBadge(msa.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Valid: {msa.valid_from} - {msa.valid_to}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {msa.doc_link && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={msa.doc_link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingMSA(msa)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteMSA(msa.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
            <DialogTitle>Create MSA</DialogTitle>
          </DialogHeader>
          <CreateMSAForm 
            clients={clients}
            onSuccess={() => {
              setShowCreateDialog(false);
              loadMSAs();
            }}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingMSA} onOpenChange={(open) => !open && setEditingMSA(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit MSA</DialogTitle>
          </DialogHeader>
          {editingMSA && (
            <EditMSAForm 
              msa={editingMSA}
              onSuccess={() => {
                setEditingMSA(null);
                loadMSAs();
              }}
              onCancel={() => setEditingMSA(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
