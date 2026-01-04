import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { DeleteConfirmDialog } from '@/components/crm/dialogs/DeleteConfirmDialog';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sowToDelete, setSOWToDelete] = useState<SOW | null>(null);

  useEffect(() => {
    loadSOWs();
    loadClients();
  }, [searchTerm, selectedClient, selectedStatus]);

  const loadSOWs = async () => {
    try {
      setLoading(true);
      const data = await CrmService.getSOWs({
        search: searchTerm,
        status: selectedStatus !== 'all' ? (selectedStatus as 'Draft' | 'Active' | 'Expired' | 'Terminated') : undefined,
        client_id: selectedClient !== 'all' ? selectedClient : undefined
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

  // Calculate pagination
  const totalPages = Math.ceil(sows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSOWs = sows.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedClient, selectedStatus]);

  const handleDeleteSOW = async () => {
    if (!sowToDelete) return;
    
    try {
      await CrmService.deleteSOW(sowToDelete.id);
      toast({
        title: 'Success',
        description: 'SOW deleted successfully'
      });
      setSOWToDelete(null);
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
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Statements of Work</CardTitle>
              <p className="text-muted-foreground text-sm mt-1">Manage project-specific work agreements</p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} className="w-full sm:w-auto flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" />
              Create SOW
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
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
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="w-full sm:w-[200px]">
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
                <SelectTrigger className="w-full sm:w-[150px]">
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
              {paginatedSOWs.map((sow) => (
                <div key={sow.id} className="p-4 border rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-medium truncate">{sow.title}</h3>
                        {getStatusBadge(sow.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Valid: {sow.valid_from} - {sow.valid_to}</p>
                        <p>Amount Cap: {sow.amount_cap} {sow.currency}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
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
                        onClick={() => setSOWToDelete(sow)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {sows.length > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t pt-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows per page:</span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}-{Math.min(endIndex, sows.length)} of {sows.length}
                </span>
              </div>
              
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page} className="hidden sm:inline-flex">
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <span className="sm:hidden text-sm px-2">
                    {currentPage} / {totalPages}
                  </span>
                  
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create SOW</DialogTitle>
          </DialogHeader>
          <CreateSOWForm 
            onSuccess={() => {
              // Close dialog immediately for instant feedback
              setShowCreateDialog(false);
              // Refresh data in background
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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={!!sowToDelete}
        onOpenChange={(open) => !open && setSOWToDelete(null)}
        onConfirm={handleDeleteSOW}
        title="Delete SOW"
        description="Are you sure you want to delete this SOW? This action cannot be undone."
        entityName={sowToDelete?.title}
      />
    </div>
  );
}
