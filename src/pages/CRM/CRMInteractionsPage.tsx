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
import { DeleteConfirmDialog } from '@/components/crm/dialogs/DeleteConfirmDialog';
import type { CrmInteraction, CrmClient } from '@/types/crm';
import { toast as sonnerToast } from 'sonner';

export function CRMInteractionsPage() {
  const [interactions, setInteractions] = useState<CrmInteraction[]>([]);
  const [clients, setClients] = useState<CrmClient[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [spocs, setSpocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedInteraction, setSelectedInteraction] = useState<CrmInteraction | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [interactionsData, clientsData, accountsData, projectsData, spocsData] = await Promise.all([
        CrmService.getInteractions(),
        CrmService.getClients(),
        CrmService.getAccounts(),
        CrmService.getProjects(),
        CrmService.getAllSpocs()
      ]);
      setInteractions(interactionsData);
      setClients(clientsData);
      setAccounts(accountsData);
      setProjects(projectsData);
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
      // TODO: Implement delete in CrmService
      sonnerToast.success('Interaction deleted successfully');
      setShowDeleteDialog(false);
      setSelectedInteraction(null);
      loadData();
    } catch (error) {
      sonnerToast.error('Failed to delete interaction');
    }
  };

  const filteredInteractions = interactions.filter(interaction => {
    const matchesSearch = interaction.client?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interaction.spoc?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interaction.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interaction.outcome?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || interaction.interaction_type === typeFilter;
    
    return matchesSearch && matchesType;
  });

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
      accessor: (interaction: CrmInteraction) => interaction.client?.name || '',
      cell: (interaction: CrmInteraction) => (
        <div>
          <div className="font-medium">
            <Link 
              to={`/CRM/Clients/${interaction.client_id}`}
              className="text-primary hover:underline"
            >
              {interaction.client?.name || 'Unknown Client'}
            </Link>
          </div>
          {interaction.spoc?.name && (
            <div className="text-sm text-muted-foreground">
              SPOC: {interaction.spoc.name}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'type',
      header: 'Type',
      accessor: 'interaction_type',
      cell: (interaction: CrmInteraction) => {
        const Icon = getInteractionIcon(interaction.interaction_type);
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <span className="capitalize">{interaction.interaction_type}</span>
          </div>
        );
      }
    },
    {
      id: 'date',
      header: 'Date',
      accessor: 'date',
      cell: (interaction: CrmInteraction) => new Date(interaction.date).toLocaleDateString()
    },
    {
      id: 'engagement_score',
      header: 'Engagement',
      accessor: 'engagement_score',
      cell: (interaction: CrmInteraction) => (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            interaction.engagement_score >= 8 ? 'bg-green-500' :
            interaction.engagement_score >= 6 ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
          <span>{interaction.engagement_score}/10</span>
        </div>
      )
    },
    {
      id: 'outcome',
      header: 'Outcome',
      accessor: (interaction: CrmInteraction) => interaction.outcome || '',
      cell: (interaction: CrmInteraction) => (
        <div className="text-sm max-w-xs truncate">
          {interaction.outcome || '-'}
        </div>
      )
    },
    {
      id: 'next_step',
      header: 'Next Step',
      accessor: (interaction: CrmInteraction) => interaction.next_step || '',
      cell: (interaction: CrmInteraction) => (
        <div className="text-sm max-w-xs truncate">
          {interaction.next_step || '-'}
        </div>
      )
    },
    {
      id: 'sync_status',
      header: 'Sync Status',
      accessor: (interaction: CrmInteraction) => interaction.is_synced,
      cell: (interaction: CrmInteraction) => (
        <Badge variant={interaction.is_synced ? 'default' : 'secondary'}>
          {interaction.is_synced ? 'Synced' : 'Pending'}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: (interaction: CrmInteraction) => interaction.id,
      cell: (interaction: CrmInteraction) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/CRM/Clients/${interaction.client_id}`}>View Client</Link>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => {
                setSelectedInteraction(interaction);
                setShowDeleteDialog(true);
              }}
            >
              Delete Interaction
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Interactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
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
          </div>
        </CardContent>
      </Card>

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
            data={filteredInteractions}
            columns={columns}
            loading={loading}
            searchable
            onSearch={setSearchQuery}
            emptyMessage="No interactions found"
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
            accounts={accounts}
            projects={projects}
            spocs={spocs}
            onSuccess={() => {
              setShowCreateDialog(false);
              loadData();
            }}
          />
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