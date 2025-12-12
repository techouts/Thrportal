import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, DollarSign, TrendingUp, Target, MoreHorizontal, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, Column } from '@/components/shared/DataTable';
import { CrmService } from '@/services/crmService';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import type { CrmOpportunity, CrmClient } from '@/types/crm';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { CreateOpportunityForm } from '@/components/crm/forms/CreateOpportunityForm';
import { EditOpportunityForm } from '@/components/crm/forms/EditOpportunityForm';

export function CRMOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<CrmOpportunity[]>([]);
  const [clients, setClients] = useState<CrmClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { toast } = useToast();

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, statusFilter]);

  // Load data when filters change ONLY (NOT on page change)
  useEffect(() => {
    loadData();
  }, [debouncedSearchQuery, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [opportunitiesData, clientsData] = await Promise.all([
        CrmService.getOpportunities({
          search: debouncedSearchQuery,
          status: statusFilter,
          // Fetch ALL data - no page/limit params
        }),
        CrmService.getClients()
      ]);
      // Store ALL opportunities
      setOpportunities(Array.isArray(opportunitiesData) ? opportunitiesData : opportunitiesData.data);
      setClients(clientsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load opportunities data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getOpportunityLevel = (opportunity: CrmOpportunity): string => {
    // Prioritize estimation_cost (in INR)
    if (opportunity.estimation_cost) {
      if (opportunity.estimation_cost < 1000000) return 'Small';      // < ₹10L
      if (opportunity.estimation_cost <= 2500000) return 'Medium';    // ₹10L-25L
      return 'Large';                                                  // > ₹25L
    }
    
    // Fallback to total positions
    const totalPositions = opportunity.ft_count + opportunity.contract_count;
    if (totalPositions <= 5) return 'Small';      // 1-5 positions
    if (totalPositions <= 10) return 'Medium';    // 6-10 positions
    return 'Large';                                // >10 positions
  };

  const getAgingDays = (updatedAt: string | undefined): number => {
    if (!updatedAt) return 0;
    const updated = new Date(updatedAt);
    if (isNaN(updated.getTime())) return 0;
    const now = new Date();
    const diff = now.getTime() - updated.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  // Client-side pagination calculations
  const totalPages = Math.ceil(opportunities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOpportunities = opportunities.slice(startIndex, endIndex);

  // Reset to page 1 if current page exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<CrmOpportunity | null>(null);

  const handleDelete = async () => {
    if (!selectedOpportunity) return;
    
    try {
      await CrmService.deleteOpportunity(selectedOpportunity.id);
      setShowDeleteDialog(false);
      setSelectedOpportunity(null);
      loadData();
      toast({ 
        title: 'Success',
        description: 'Opportunity deleted successfully' 
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete opportunity',
        variant: 'destructive'
      });
    }
  };

  const columns: Column<CrmOpportunity>[] = [
    {
      id: 'client',
      header: 'Client & Project',
      accessor: (opportunity: CrmOpportunity) => opportunity.client?.name || '',
      cell: (_value: any, opportunity: CrmOpportunity) => (
        <div>
          <div className="font-medium">
            <Link 
              to={`/CRM/Clients/${opportunity.client_id}`}
              className="text-primary hover:underline"
            >
              {opportunity.client?.name || 'Unknown Client'}
            </Link>
          </div>
          {opportunity.project?.name && (
            <div className="text-sm text-muted-foreground">
              Project: {opportunity.project.name}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'requirements',
      header: 'Requirements',
      accessor: (opportunity: CrmOpportunity) => `${opportunity.ft_count}-${opportunity.contract_count}`,
      cell: (_value: any, opportunity: CrmOpportunity) => (
        <div className="text-sm">
          <div>FT: {opportunity.ft_count}</div>
          <div>Contract: {opportunity.contract_count}</div>
          {opportunity.estimation_cost && (
            <div className="text-xs text-muted-foreground mt-1">
              Est: {opportunity.currency} {opportunity.estimation_cost.toLocaleString()}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'level',
      header: 'Level',
      accessor: (opportunity: CrmOpportunity) => getOpportunityLevel(opportunity),
      cell: (_value: any, opportunity: CrmOpportunity) => (
            <Badge variant={
              getOpportunityLevel(opportunity) === 'Large' ? 'default' :
              getOpportunityLevel(opportunity) === 'Medium' ? 'secondary' : 'outline'
            }>
              {getOpportunityLevel(opportunity)}
        </Badge>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (opportunity: CrmOpportunity) => opportunity.status || '',
      cell: (_value: any, opportunity: CrmOpportunity) => (
        <Badge variant={
          opportunity.status === 'Open' ? 'default' :
          opportunity.status === 'In Progress' ? 'secondary' :
          opportunity.status === 'Closed' ? 'outline' : 'destructive'
        }>
          {opportunity.status}
        </Badge>
      )
    },
    {
      id: 'aging',
      header: 'Aging',
      accessor: (opportunity: CrmOpportunity) => getAgingDays(opportunity.updated_at),
      cell: (_value: any, opportunity: CrmOpportunity) => {
        const days = getAgingDays(opportunity.updated_at);
        return (
          <div className="text-sm">
            <div className={days > 30 ? 'text-orange-600' : ''}>
              {days} days
            </div>
          </div>
        );
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: (opportunity: CrmOpportunity) => opportunity.id,
      cell: (_value: any, opportunity: CrmOpportunity) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => {
              setSelectedOpportunity(opportunity);
              setShowEditDialog(true);
            }}>
              Edit Opportunity
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => {
                setSelectedOpportunity(opportunity);
                setShowDeleteDialog(true);
              }}
            >
              Delete Opportunity
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  const stats = [
    {
      title: 'Total Opportunities',
      value: opportunities.length,
      icon: Target,
      description: 'All tracked opportunities'
    },
    {
      title: 'Open Opportunities',
      value: opportunities.filter(o => o.status === 'Open').length,
      icon: TrendingUp,
      description: 'Currently active opportunities'
    }
  ];

  return (
    <div className="space-y-6 overflow-x-hidden">
      <PageHeader
        title="Opportunity Management"
        description="Track and manage business opportunities and requirements"
        actions={
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Opportunity
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Opportunities Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Opportunities</CardTitle>
          <CardDescription>
            Comprehensive list of all business opportunities and their potential value
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Filter Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by client, project, or notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="Lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* DataTable without built-in pagination */}
            <DataTable
              data={paginatedOpportunities}
              columns={columns}
              loading={loading}
              emptyMessage="No opportunities found"
            />

            {/* Custom Pagination UI */}
            {opportunities.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t pt-4">
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
                    Showing {startIndex + 1}-{Math.min(endIndex, opportunities.length)} of {opportunities.length}
                  </span>
                </div>
                
                <Pagination>
                  <PaginationContent className="flex-wrap">
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
          </div>
        </CardContent>
      </Card>

      {/* Create Opportunity Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Opportunity</DialogTitle>
            </DialogHeader>
            <CreateOpportunityForm
              clients={clients}
              onSuccess={() => {
                setShowCreateDialog(false);
                loadData();
              }}
              onCancel={() => {
                setShowCreateDialog(false);
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Opportunity Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Opportunity</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Note: Client cannot be changed after creation
              </DialogDescription>
            </DialogHeader>
            {selectedOpportunity && (
              <EditOpportunityForm
                opportunity={selectedOpportunity}
                onSuccess={() => {
                  setShowEditDialog(false);
                  setSelectedOpportunity(null);
                  loadData();
                  toast({
                    title: 'Success',
                    description: 'Opportunity updated successfully'
                  });
                }}
                onCancel={() => {
                  setShowEditDialog(false);
                  setSelectedOpportunity(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Opportunity</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this opportunity for{' '}
                <span className="font-semibold">{selectedOpportunity?.client?.name}</span>?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setShowDeleteDialog(false);
                setSelectedOpportunity(null);
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}