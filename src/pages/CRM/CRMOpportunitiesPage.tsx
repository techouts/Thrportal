import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, DollarSign, TrendingUp, Target, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, Column } from '@/components/shared/DataTable';
import { CrmService } from '@/services/crmService';
import { useToast } from '@/hooks/use-toast';
import type { CrmOpportunity, CrmClient } from '@/types/crm';

export function CRMOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<CrmOpportunity[]>([]);
  const [clients, setClients] = useState<CrmClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [opportunitiesData, clientsData] = await Promise.all([
        CrmService.getOpportunities(),
        CrmService.getClients()
      ]);
      setOpportunities(opportunitiesData);
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

  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = opportunity.client?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opportunity.project?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opportunity.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || opportunity.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getOpportunityLevel = (opportunity: CrmOpportunity): string => {
    const total = opportunity.ft_count + opportunity.contract_count;
    if (total >= 10) return 'Enterprise';
    if (total >= 5) return 'Medium';
    return 'Small';
  };

  const getAgingDays = (createdAt: string): number => {
    const created = new Date(createdAt);
    const now = new Date();
    const diff = now.getTime() - created.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<CrmOpportunity | null>(null);

  const handleDelete = async () => {
    // TODO: Implement delete functionality
    setShowDeleteDialog(false);
    setSelectedOpportunity(null);
    toast({ title: 'Opportunity deleted successfully' });
  };

  const columns: Column<CrmOpportunity>[] = [
    {
      id: 'client',
      header: 'Client & Project',
      accessor: (opportunity: CrmOpportunity) => opportunity.client?.name || '',
      cell: (opportunity: CrmOpportunity) => (
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
      accessor: (opportunity: CrmOpportunity) => `${opportunity.jd_count}-${opportunity.ft_count}-${opportunity.contract_count}`,
      cell: (opportunity: CrmOpportunity) => (
        <div className="text-sm">
          <div>JDs: {opportunity.jd_count}</div>
          <div>FT: {opportunity.ft_count}</div>
          <div>Contract: {opportunity.contract_count}</div>
        </div>
      )
    },
    {
      id: 'level',
      header: 'Level',
      accessor: (opportunity: CrmOpportunity) => getOpportunityLevel(opportunity),
      cell: (opportunity: CrmOpportunity) => (
        <Badge variant={
          getOpportunityLevel(opportunity) === 'Enterprise' ? 'default' :
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
      cell: (opportunity: CrmOpportunity) => (
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
      accessor: (opportunity: CrmOpportunity) => getAgingDays(opportunity.created_at),
      cell: (opportunity: CrmOpportunity) => {
        const days = getAgingDays(opportunity.created_at);
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
      id: 'potential_value',
      header: 'Potential Value',
      accessor: (opportunity: CrmOpportunity) => opportunity.ft_count + opportunity.contract_count,
      cell: (opportunity: CrmOpportunity) => (
        <div className="text-sm">
          <div className="font-medium">
            {opportunity.ft_count + opportunity.contract_count} Hires
          </div>
        </div>
      )
    },
    {
      id: 'notes',
      header: 'Notes',
      accessor: (opportunity: CrmOpportunity) => opportunity.notes || '',
      cell: (opportunity: CrmOpportunity) => (
        <div className="text-sm text-muted-foreground max-w-xs truncate">
          {opportunity.notes || '-'}
        </div>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: (opportunity: CrmOpportunity) => opportunity.id,
      cell: (opportunity: CrmOpportunity) => (
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

  const totalValue = opportunities.reduce((sum, opp) => sum + opp.ft_count + opp.contract_count, 0);
  const totalJDs = opportunities.reduce((sum, opp) => sum + (opp.jd_count || 0), 0);

  const stats = [
    {
      title: 'Total Opportunities',
      value: opportunities.length,
      icon: Target,
      description: 'All active opportunities'
    },
    {
      title: 'Open Opportunities',
      value: opportunities.filter(o => o.status === 'Open').length,
      icon: TrendingUp,
      description: 'Opportunities to pursue'
    },
    {
      title: 'Potential Hires',
      value: totalValue,
      icon: DollarSign,
      description: 'Total hiring potential'
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Opportunity Management"
        description="Track and manage business opportunities and requirements"
        actions={
          <Button asChild>
            <Link to="/CRM/Clients">
              <Plus className="h-4 w-4 mr-2" />
              New Opportunity
            </Link>
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
          <CardTitle>Filter Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
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
        </CardContent>
      </Card>

      {/* Opportunities Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Opportunities</CardTitle>
          <CardDescription>
            Comprehensive list of all business opportunities and their potential value
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredOpportunities}
            columns={columns}
            loading={loading}
            searchable
            onSearch={setSearchQuery}
            emptyMessage="No opportunities found"
          />
        </CardContent>
      </Card>
    </div>
  );
}