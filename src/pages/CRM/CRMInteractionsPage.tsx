import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MessageSquare, Calendar, Phone, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, Column } from '@/components/shared/DataTable';
import { CrmService } from '@/services/crmService';
import { useToast } from '@/hooks/use-toast';
import { CreateInteractionForm } from '@/components/crm/forms/CreateInteractionForm';
import { EditInteractionForm } from '@/components/crm/forms/EditInteractionForm';
import { DeleteConfirmDialog } from '@/components/crm/dialogs/DeleteConfirmDialog';
import type { CrmInteraction, CrmClient } from '@/types/crm';
import { toast as sonnerToast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';

export function CRMInteractionsPage() {
  const [interactions, setInteractions] = useState<CrmInteraction[]>([]);
  const [clients, setClients] = useState<CrmClient[]>([]);
  const [spocs, setSpocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedInteraction, setSelectedInteraction] = useState<CrmInteraction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [interactionsResponse, clientsData, spocsData] = await Promise.all([
        CrmService.getInteractions(),
        CrmService.getClients(),
        CrmService.getAllSpocs()
      ]);
      const interactionsData = Array.isArray(interactionsResponse) 
        ? interactionsResponse 
        : interactionsResponse.data;
      setInteractions(interactionsData);
      setClients(clientsData);
      setSpocs(spocsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load interactions data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedInteraction) return;
    
    try {
      await CrmService.deleteInteraction(selectedInteraction.id);
      toast({
        title: 'Success',
        description: 'Interaction deleted successfully.',
      });
      setShowDeleteDialog(false);
      setSelectedInteraction(null);
      await loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete interaction. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEditSuccess = async () => {
    setShowEditDialog(false);
    setSelectedInteraction(null);
    await loadData();
  };

  const filteredInteractions = interactions.filter(interaction => {
    const matchesSearch = interaction.client?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interaction.spoc?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interaction.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interaction.outcome?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || interaction.interaction_type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  // Paginated data
  const paginatedInteractions = filteredInteractions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Update total pages when filtered data changes
  React.useEffect(() => {
    const newTotalPages = Math.ceil(filteredInteractions.length / itemsPerPage);
    setTotalPages(newTotalPages);
    // Reset to page 1 if current page is out of bounds
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredInteractions.length, currentPage]);

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'call':
        return Phone;
      case 'meeting':
        return Calendar;
      case 'email':
        return MessageSquare;
      default:
        return MessageSquare;
    }
  };

  const columns: Column<CrmInteraction>[] = [
    {
      id: 'client_spoc',
      header: 'Client & SPOC',
      accessor: 'client_id' as keyof CrmInteraction,
      cell: (_value: any, row: CrmInteraction) => {
        const clientName = row.client?.name || 'Unknown Client';
        const spocName = row.spoc?.name || 'No SPOC';
        return (
          <div className="space-y-1">
            <div className="font-medium">{clientName}</div>
            <div className="text-sm text-muted-foreground">{spocName}</div>
          </div>
        );
      },
    },
    {
      id: 'employee',
      header: 'Employee',
      accessor: 'created_by' as keyof CrmInteraction,
      cell: (_value: any, row: CrmInteraction) => (
        <div className="text-sm">{row.created_by || 'Unknown'}</div>
      ),
    },
    {
      id: 'type',
      header: 'Type',
      accessor: 'interaction_type' as keyof CrmInteraction,
      cell: (_value: any, row: CrmInteraction) => {
        const Icon = getInteractionIcon(row.interaction_type);
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <span className="capitalize">{row.interaction_type}</span>
          </div>
        );
      },
    },
    {
      id: 'date',
      header: 'Date',
      accessor: 'date' as keyof CrmInteraction,
      cell: (_value: any, row: CrmInteraction) => (
        <div className="text-sm">
          {new Date(row.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </div>
      ),
      sortable: true,
    },
    {
      id: 'engagement',
      header: 'Engagement',
      accessor: 'engagement_score' as keyof CrmInteraction,
      cell: (_value: any, row: CrmInteraction) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full"
              style={{ width: `${(row.engagement_score / 10) * 100}%` }}
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {row.engagement_score}/10
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'id' as keyof CrmInteraction,
      cell: (_value: any, row: CrmInteraction) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedInteraction(row);
              setShowEditDialog(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedInteraction(row);
              setShowDeleteDialog(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const avgEngagement = interactions.length > 0 
    ? interactions.reduce((sum, i) => sum + i.engagement_score, 0) / interactions.length 
    : 0;

  const stats = [
    {
      title: 'Total Interactions',
      value: interactions.length,
      icon: MessageSquare,
      description: 'All client interactions'
    },
    {
      title: 'This Week',
      value: interactions.filter(i => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(i.date) >= weekAgo;
      }).length,
      icon: Calendar,
      description: 'Interactions this week'
    },
    {
      title: 'Avg Engagement',
      value: avgEngagement.toFixed(1),
      icon: Phone,
      description: 'Average engagement score'
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interaction Management"
        description="Track and manage all client interactions and communications"
        actions={
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Interaction
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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


      {/* Interactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Interactions</CardTitle>
          <CardDescription>
            Comprehensive log of all client communications and touchpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={paginatedInteractions}
            columns={columns}
            loading={loading}
            searchable
            onSearch={setSearchQuery}
            exportable={false}
            emptyMessage="No interactions found"
            filters={
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="onsite">Onsite</SelectItem>
                </SelectContent>
              </Select>
            }
            pagination={{
              page: currentPage,
              pageSize: itemsPerPage,
              total: filteredInteractions.length,
              onPageChange: setCurrentPage,
              onPageSizeChange: () => {},
            }}
          />
        </CardContent>
      </Card>

      {/* Create Interaction Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Log New Interaction</DialogTitle>
          </DialogHeader>
          <CreateInteractionForm
            clients={clients}
            spocs={spocs}
            onSuccess={() => {
              setShowCreateDialog(false);
              loadData();
            }}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Interaction Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Interaction</DialogTitle>
          </DialogHeader>
          {selectedInteraction && (
            <EditInteractionForm
              interaction={selectedInteraction}
              onSuccess={handleEditSuccess}
              onCancel={() => setShowEditDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Delete Interaction"
        description="Are you sure you want to delete this interaction? This action cannot be undone."
        entityName={selectedInteraction ? `${selectedInteraction.interaction_type} on ${new Date(selectedInteraction.date).toLocaleDateString()}` : ''}
      />
    </div>
  );
}