import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Target, Clock, TrendingUp, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, Column } from '@/components/shared/DataTable';
import { AdvancedFilter, FilterConfig, FilterState } from '@/components/shared/AdvancedFilter';
import { SearchAndSort, SortOption, QuickFilter } from '@/components/shared/SearchAndSort';
import { useAdvancedFilter } from '@/hooks/useAdvancedFilter';
import { CrmService } from '@/services/crmService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/auth/AuthContext';
import { useVisible } from '@/hooks/useVisible';
import type { CrmProject, CrmClient } from '@/types/crm';

export function CRMProjectsPage() {
  const [projects, setProjects] = useState<CrmProject[]>([]);
  const [clients, setClients] = useState<CrmClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const { toast } = useToast();
  const { can } = useAuth();
  
  // Permission checks
  const canCreateProjects = useVisible(['crm.projects.create', 'crm.projects.*', 'projects.create']);
  const canEditProjects = useVisible(['crm.projects.update', 'crm.projects.*', 'projects.update']);
  const canDeleteProjects = useVisible(['crm.projects.delete', 'crm.projects.*', 'projects.delete']);
  const canViewClients = useVisible(['crm.clients.read', 'crm.clients.*', 'crm.*']);
  const canCreateOpportunities = useVisible(['crm.opportunities.create', 'crm.opportunities.*', 'crm.*']);
  const canViewFinancials = useVisible(['crm.projects.financials', 'crm.reports.*', 'finance.reports.read']);
  const canExportData = useVisible(['crm.projects.export', 'crm.reports.export', 'reports.export']);

  // Advanced filtering configuration
  const filterConfigs: FilterConfig[] = [
    {
      id: 'status',
      label: 'Status',
      type: 'multiselect',
      options: [
        { value: 'Planned', label: 'Planned' },
        { value: 'In-flight', label: 'In-flight' },
        { value: 'Closed', label: 'Closed' },
        { value: 'On-hold', label: 'On-hold' }
      ]
    },
    {
      id: 'priority',
      label: 'Priority',
      type: 'multiselect',
      options: [
        { value: 'Critical', label: 'Critical' },
        { value: 'High', label: 'High' },
        { value: 'Medium', label: 'Medium' },
        { value: 'Low', label: 'Low' }
      ]
    },
    {
      id: 'client',
      label: 'Client',
      type: 'select',
      options: clients.map(client => ({ value: client.id, label: client.name }))
    },
    {
      id: 'ft_target_min',
      label: 'Min FT Target',
      type: 'number',
      placeholder: '0',
      requiresPermission: ['crm.projects.financials', 'crm.reports.*']
    },
    {
      id: 'ft_target_max',
      label: 'Max FT Target',
      type: 'number',
      placeholder: '100',
      requiresPermission: ['crm.projects.financials', 'crm.reports.*']
    },
    {
      id: 'skills',
      label: 'Required Skills',
      type: 'text',
      placeholder: 'React, Node.js, etc.'
    },
    {
      id: 'has_budget',
      label: 'Has Budget Defined',
      type: 'checkbox',
      requiresPermission: ['crm.projects.financials', 'finance.reports.read']
    }
  ];

  // Sort options based on permissions
  const sortOptions: SortOption[] = [
    { value: 'name', label: 'Project Name' },
    { value: 'client', label: 'Client Name' },
    { value: 'status', label: 'Status' },
    { value: 'priority', label: 'Priority' },
    { value: 'start_date', label: 'Start Date' },
    { 
      value: 'ft_target', 
      label: 'FT Target',
      requiresPermission: ['crm.projects.financials', 'crm.reports.*']
    },
    { 
      value: 'contract_target', 
      label: 'Contract Target',
      requiresPermission: ['crm.projects.financials', 'crm.reports.*']
    }
  ];

  // Quick filters based on permissions
  const quickFilterOptions: QuickFilter[] = [
    { 
      value: 'in_flight', 
      label: 'In-flight',
      count: projects.filter(p => p.status === 'In-flight').length
    },
    { 
      value: 'high_priority', 
      label: 'High Priority',
      count: projects.filter(p => p.priority === 'Critical' || p.priority === 'High').length
    },
    { 
      value: 'urgent_hiring', 
      label: 'Urgent Hiring',
      count: projects.filter(p => (p.ft_target || 0) > 5).length,
      requiresPermission: ['crm.projects.financials', 'hiring.dashboard.read']
    },
    { 
      value: 'needs_attention', 
      label: 'Needs Attention',
      count: projects.filter(p => p.status === 'On-hold' || p.priority === 'Critical').length
    }
  ];

  // Filter function for advanced filtering
  const projectFilterFunction = (project: CrmProject, filters: FilterState) => {
    // Text search
    const searchMatch = !searchQuery || 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.client?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.skills?.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!searchMatch) return false;

    // Status filter
    if (filters.status?.length > 0 && !filters.status.includes(project.status)) {
      return false;
    }

    // Priority filter
    if (filters.priority?.length > 0 && !filters.priority.includes(project.priority)) {
      return false;
    }

    // Client filter
    if (filters.client && filters.client !== '' && project.client_id !== filters.client) {
      return false;
    }

    // FT Target range
    if (filters.ft_target_min && (project.ft_target || 0) < parseInt(filters.ft_target_min)) {
      return false;
    }
    if (filters.ft_target_max && (project.ft_target || 0) > parseInt(filters.ft_target_max)) {
      return false;
    }

    // Skills filter
    if (filters.skills && filters.skills.trim()) {
      const skillQuery = filters.skills.toLowerCase();
      const hasSkill = project.skills?.some(skill => 
        skill.toLowerCase().includes(skillQuery)
      );
      if (!hasSkill) return false;
    }

    // Has budget filter
    if (filters.has_budget && !project.budget) {
      return false;
    }

    // Quick filters
    if (quickFilters.includes('in_flight') && project.status !== 'In-flight') {
      return false;
    }
    if (quickFilters.includes('high_priority') && 
        !['Critical', 'High'].includes(project.priority || '')) {
      return false;
    }
    if (quickFilters.includes('urgent_hiring') && (project.ft_target || 0) <= 5) {
      return false;
    }
    if (quickFilters.includes('needs_attention')) {
      const isOnHold = project.status === 'On-hold';
      const isCritical = project.priority === 'Critical';
      if (!isOnHold && !isCritical) {
        return false;
      }
    }

    return true;
  };

  // Use advanced filtering hook
  const {
    filters,
    filteredData: filteredProjects,
    savedFilters,
    handleFilterChange,
    handleReset,
    handleSave,
    getFilterStats
  } = useAdvancedFilter(projects, projectFilterFunction, {
    defaultFilters: {},
    storageKey: 'crm_projects',
    debounceMs: 250
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsData, clientsData] = await Promise.all([
        CrmService.getProjects(),
        CrmService.getClients()
      ]);
      setProjects(projectsData);
      setClients(clientsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load projects data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Sort filtered projects
  const sortedAndFilteredProjects = React.useMemo(() => {
    const sorted = [...filteredProjects].sort((a, b) => {
      let aVal: any = '';
      let bVal: any = '';

      switch (sortField) {
        case 'name':
          aVal = a.name || '';
          bVal = b.name || '';
          break;
        case 'client':
          aVal = a.client?.name || '';
          bVal = b.client?.name || '';
          break;
        case 'status':
          aVal = a.status || '';
          bVal = b.status || '';
          break;
        case 'priority':
          const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
          aVal = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bVal = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case 'start_date':
          aVal = new Date(a.start_date || '').getTime();
          bVal = new Date(b.start_date || '').getTime();
          break;
        case 'ft_target':
          aVal = a.ft_target || 0;
          bVal = b.ft_target || 0;
          break;
        case 'contract_target':
          aVal = a.contract_target || 0;
          bVal = b.contract_target || 0;
          break;
        default:
          aVal = a.name || '';
          bVal = b.name || '';
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const comparison = aVal.localeCompare(bVal);
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      const comparison = aVal - bVal;
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredProjects, sortField, sortDirection]);

  const columns: Column<CrmProject>[] = [
    {
      id: 'name',
      header: 'Project Name',
      accessor: 'name',
      cell: (project: CrmProject) => (
        <div>
          <div className="font-medium">{project.name}</div>
          <div className="text-sm text-muted-foreground">
            Client: {project.client?.name}
          </div>
        </div>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (project: CrmProject) => project.status || '',
      cell: (project: CrmProject) => (
        <Badge variant={
          project.status === 'In-flight' ? 'default' :
          project.status === 'Planned' ? 'secondary' : 'outline'
        }>
          {project.status}
        </Badge>
      )
    },
    {
      id: 'priority',
      header: 'Priority',
      accessor: (project: CrmProject) => project.priority || '',
      cell: (project: CrmProject) => (
        <Badge variant={
          project.priority === 'Critical' ? 'destructive' :
          project.priority === 'High' ? 'default' : 'secondary'
        }>
          {project.priority}
        </Badge>
      )
    },
    {
      id: 'targets',
      header: 'Targets',
      accessor: (project: CrmProject) => `${project.ft_target}-${project.contract_target}`,
      cell: (project: CrmProject) => (
        <div className="text-sm">
          <div>FT: {project.ft_target}</div>
          <div>Contract: {project.contract_target}</div>
        </div>
      )
    },
    {
      id: 'timeline',
      header: 'Timeline',
      accessor: (project: CrmProject) => project.start_date || '',
      cell: (project: CrmProject) => (
        <div className="text-sm">
          {project.start_date && <div>Start: {project.start_date}</div>}
          {project.end_date && <div>End: {project.end_date}</div>}
        </div>
      )
    },
    {
      id: 'skills',
      header: 'Skills/Roles',
      accessor: (project: CrmProject) => project.skills?.join(', ') || '',
      cell: (project: CrmProject) => (
        <div className="text-sm max-w-xs">
          {project.skills && project.skills.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {project.skills.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {project.skills.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{project.skills.length - 3} more
                </Badge>
              )}
            </div>
          ) : '-'}
        </div>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: (project: CrmProject) => project.id,
      cell: (project: CrmProject) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canViewClients && (
              <DropdownMenuItem asChild>
                <Link to={`/CRM/Clients/${project.client_id}`}>View Client</Link>
              </DropdownMenuItem>
            )}
            {canEditProjects && (
              <DropdownMenuItem>Edit Project</DropdownMenuItem>
            )}
            {canCreateOpportunities && (
              <DropdownMenuItem>Create Opportunity</DropdownMenuItem>
            )}
            {canDeleteProjects && (
              <DropdownMenuItem className="text-destructive">
                Delete Project
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  const stats = [
    {
      title: 'Total Projects',
      value: projects.length,
      icon: Target,
      description: 'All active projects'
    },
    {
      title: 'In-Flight Projects',
      value: projects.filter(p => p.status === 'In-flight').length,
      icon: TrendingUp,
      description: 'Currently active projects'
    },
    {
      title: 'Total FT Target',
      value: projects.reduce((sum, p) => sum + (p.ft_target || 0), 0),
      icon: Clock,
      description: 'Full-time hiring target'
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project Management"
        description="Manage client projects and hiring requirements"
        actions={
          canCreateProjects ? (
            <Button asChild>
              <Link to="/CRM/Clients">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Link>
            </Button>
          ) : undefined
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

      {/* Search and Quick Filters */}
      <SearchAndSort
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        sortValue={sortField}
        onSortChange={setSortField}
        sortDirection={sortDirection}
        onSortDirectionChange={setSortDirection}
        sortOptions={sortOptions}
        quickFilters={quickFilterOptions}
        selectedQuickFilters={quickFilters}
        onQuickFilterChange={setQuickFilters}
        placeholder="Search projects, clients, or skills..."
        resultCount={sortedAndFilteredProjects.length}
        totalCount={projects.length}
      />

      {/* Advanced Filters */}
      <AdvancedFilter
        title="Advanced Project Filters"
        filters={filterConfigs}
        value={filters}
        onChange={handleFilterChange}
        onReset={handleReset}
        onSave={handleSave}
        savedFilters={savedFilters}
        collapsible={true}
        showSaveLoad={canExportData}
      />

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
          <CardDescription>
            Comprehensive list of all client projects and their requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={sortedAndFilteredProjects}
            columns={columns}
            loading={loading}
            searchable={false}
            emptyMessage="No projects found matching your criteria"
          />
        </CardContent>
      </Card>
    </div>
  );
}