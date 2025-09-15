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
import { CrmService } from '@/services/crmService';
import { useToast } from '@/hooks/use-toast';
import type { CrmProject, CrmClient } from '@/types/crm';

export function CRMProjectsPage() {
  const [projects, setProjects] = useState<CrmProject[]>([]);
  const [clients, setClients] = useState<CrmClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const { toast } = useToast();

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

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.client?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.skills?.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

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
            <DropdownMenuItem asChild>
              <Link to={`/CRM/Clients/${project.client_id}`}>View Client</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Edit Project</DropdownMenuItem>
            <DropdownMenuItem>Create Opportunity</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Delete Project
            </DropdownMenuItem>
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
          <Button asChild>
            <Link to="/CRM/Clients">
              <Plus className="h-4 w-4 mr-2" />
              New Project
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
          <CardTitle>Filter Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Planned">Planned</SelectItem>
                <SelectItem value="In-flight">In-flight</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

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
            data={filteredProjects}
            columns={columns}
            loading={loading}
            searchable
            onSearch={setSearchQuery}
            emptyMessage="No projects found"
          />
        </CardContent>
      </Card>
    </div>
  );
}