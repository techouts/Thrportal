import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DataTable } from '@/components/shared/DataTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Filter, Users, Building, MapPin, Calendar } from 'lucide-react';
import { CrmService } from '@/services/crmService';
import { CreateClientForm } from '@/components/crm/forms/CreateClientForm';
import type { CrmClient, CrmClientFilters } from '@/types/crm';
import { formatDistanceToNow } from 'date-fns';

export default function CRMClientsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [clients, setClients] = useState<CrmClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState<CrmClientFilters>({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    industry: searchParams.get('industry') || '',
    region: searchParams.get('region') || ''
  });

  const statusOptions = ['Active', 'Inactive', 'Prospect'];
  const industryOptions = ['Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Retail', 'Consulting'];

  useEffect(() => {
    loadClients();
  }, [filters]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await CrmService.getClients(filters);
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof CrmClientFilters, value: string) => {
    const actualValue = value === 'all' ? '' : value;
    const newFilters = { ...filters, [key]: actualValue };
    setFilters(newFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreBadge = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const columns = [
    {
      id: 'name',
      header: 'Client Name',
      accessor: 'name' as keyof CrmClient,
      cell: (client: CrmClient) => (
        <div className="space-y-1">
          <Button
            variant="link"
            className="p-0 h-auto font-medium text-left"
            onClick={() => navigate(`/CRM/Client/${client.id}`)}
          >
            {client.name}
          </Button>
          {client.domain && (
            <p className="text-xs text-muted-foreground">{client.domain}</p>
          )}
        </div>
      )
    },
    {
      id: 'industry',
      header: 'Industry',
      accessor: 'industry' as keyof CrmClient,
      cell: (client: CrmClient) => (
        <Badge variant="outline">{client.industry || 'Not specified'}</Badge>
      )
    },
    {
      id: 'region',
      header: 'Region',
      accessor: 'region' as keyof CrmClient,
      cell: (client: CrmClient) => (
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">{client.region || 'Not specified'}</span>
        </div>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status' as keyof CrmClient,
      cell: (client: CrmClient) => (
        <Badge 
          variant={client.status === 'Active' ? 'default' : client.status === 'Prospect' ? 'secondary' : 'outline'}
        >
          {client.status}
        </Badge>
      )
    },
    {
      id: 'health_score',
      header: 'Health Score',
      accessor: 'health_score' as keyof CrmClient,
      cell: (client: CrmClient) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`font-medium ${getHealthScoreColor(client.health_score)}`}>
              {client.health_score}%
            </span>
          </div>
          <Progress value={client.health_score} className="h-1 w-16" />
        </div>
      )
    },
    {
      id: 'created_at',
      header: 'Created',
      accessor: 'created_at' as keyof CrmClient,
      cell: (client: CrmClient) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {formatDistanceToNow(new Date(client.created_at), { addSuffix: true })}
        </div>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'id' as keyof CrmClient,
      cell: (client: CrmClient) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/CRM/Client/${client.id}`)}
          >
            View Details
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description="Manage client organizations and their details"
      />

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Client Management
            </CardTitle>
            <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Client
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Client</DialogTitle>
                </DialogHeader>
                <CreateClientForm 
                  onSuccess={() => {
                    setShowCreateForm(false);
                    loadClients();
                  }}
                  onCancel={() => setShowCreateForm(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.industry || 'all'} onValueChange={(value) => handleFilterChange('industry', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industryOptions.map(industry => (
                  <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Filter by region..."
              value={filters.region}
              onChange={(e) => handleFilterChange('region', e.target.value)}
            />
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold">{clients.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Building className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Clients</p>
                <p className="text-2xl font-bold">
                  {clients.filter(c => c.status === 'Active').length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <MapPin className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Prospects</p>
                <p className="text-2xl font-bold">
                  {clients.filter(c => c.status === 'Prospect').length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Filter className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Health Score</p>
                <p className="text-2xl font-bold">
                  {clients.length > 0 
                    ? Math.round(clients.reduce((sum, c) => sum + c.health_score, 0) / clients.length)
                    : 0}%
                </p>
              </div>
            </div>
          </div>

          <DataTable
            data={clients}
            columns={columns}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}