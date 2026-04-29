import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Search, Edit, Trash2, ExternalLink } from 'lucide-react';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [poToDelete, setPOToDelete] = useState<PurchaseOrder | null>(null);

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
        status: selectedStatus !== 'all' ? (selectedStatus as 'Draft' | 'Active' | 'Expired' | 'Terminated') : undefined
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

  // Calculate pagination
  const totalPages = Math.ceil(pos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPOs = pos.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedClient, selectedStatus]);

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

  const handleDeletePO = async () => {
    if (!poToDelete) return;
    
    try {
      await CrmService.deletePO(poToDelete.id);
      toast({
        title: 'Success',
        description: 'Purchase Order deleted successfully'
      });
      setPOToDelete(null);
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
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Purchase Orders</CardTitle>
              <p className="text-muted-foreground text-sm mt-1">Track client purchase orders and budget utilization</p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} className="w-full sm:w-auto flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" />
              Create PO
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
                  placeholder="Search POs..."
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
          <CardTitle>Purchase Order Registry ({pos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : pos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No Purchase Orders found</div>
          ) : (
            <div className="space-y-4">
              {paginatedPOs.map((po) => (
                <div key={po.id} className="p-4 border rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-medium truncate">{po.po_number}</h3>
                        {getStatusBadge(po.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Valid: {po.valid_from} - {po.valid_to}</p>
                        <p>Total: {po.total_amount} {po.currency}</p>
                        <p>Remaining: {po.remaining_amount} {po.currency}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
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
                        onClick={() => setPOToDelete(po)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pos.length > 0 && (
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
                  Showing {startIndex + 1}-{Math.min(endIndex, pos.length)} of {pos.length}
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

      <DeleteConfirmDialog
        open={!!poToDelete}
        onOpenChange={(open) => !open && setPOToDelete(null)}
        onConfirm={handleDeletePO}
        title="Delete Purchase Order"
        description="Are you sure you want to delete this Purchase Order? This action cannot be undone."
        entityName={poToDelete?.po_number}
      />
    </div>
  );
}
