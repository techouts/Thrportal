import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Plus, Search, Edit, Users } from 'lucide-react';
import { ScorecardMobileWrapper } from '@/components/assignments/ScorecardMobileWrapper';
import { Combobox } from '@/components/ui/combobox';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AddResourceDialog } from '@/components/assignments/AddResourceDialog';
import { EditAllocationDialog } from '@/components/assignments/EditAllocationDialog';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProjectAllocation {
  id: string;
  employeeName: string;
  role: string;
  allocationPct: number;
  startDate: string;
  endDate: string | null;
  type: string;
  skills: string[];
}

export function AssignmentProjectSection() {
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [allocations, setAllocations] = useState<ProjectAllocation[]>([]);
  const [isAddResourceDialogOpen, setIsAddResourceDialogOpen] = useState(false);
  const [selectedAllocationForEdit, setSelectedAllocationForEdit] = useState<ProjectAllocation | null>(null);


  // Fetch clients from database
  const { data: clientsData } = useQuery({
    queryKey: ['crm-clients-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_clients')
        .select('id, name')
        .eq('status', 'Active')
        .order('name');
      if (error) throw error;
      return data || [];
    }
  });
  // Ensure clients is always an array
  const clients = Array.isArray(clientsData) ? clientsData : [];

  // Fetch accounts filtered by selected client
  const { data: accountsData } = useQuery({
    queryKey: ['crm-accounts', selectedClient],
    queryFn: async () => {
      if (!selectedClient) return [];
      const { data, error } = await supabase
        .from('crm_accounts')
        .select('id, name')
        .eq('client_id', selectedClient)
        .eq('status', 'Active')
        .order('name');
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedClient
  });
  // Ensure accounts is always an array
  const accounts = Array.isArray(accountsData) ? accountsData : [];

  // Fetch projects filtered by selected account
  const { data: projectsData } = useQuery({
    queryKey: ['crm-projects', selectedAccount],
    queryFn: async () => {
      if (!selectedAccount) return [];
      const { data, error } = await supabase
        .from('crm_projects')
        .select('id, name')
        .eq('account_id', selectedAccount)
        .order('name');
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedAccount
  });
  // Ensure projects is always an array
  const projects = Array.isArray(projectsData) ? projectsData : [];

  // Cascading reset handlers
  const handleClientChange = (clientId: string) => {
    setSelectedClient(clientId);
    setSelectedAccount('');
    setSelectedProject('');
    setHasSearched(false);
    setAllocations([]);
  };

  const handleAccountChange = (accountId: string) => {
    setSelectedAccount(accountId);
    setSelectedProject('');
    setHasSearched(false);
    setAllocations([]);
  };

  const handleProjectChange = (projectId: string) => {
    setSelectedProject(projectId);
    setHasSearched(false);
    setAllocations([]);
  };

  // Search handler - fetches allocations for selected project
  const handleSearch = async () => {
    if (!selectedProject) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('allocations')
        .select(`
          id,
          allocation_pct,
          type,
          start_date,
          end_date,
          bill_rate,
          cost_rate,
          employee_id,
          role_id,
          profiles!allocations_employee_id_fkey (id, display_name, first_name, last_name),
          roles_catalog!allocations_role_id_fkey (name)
        `)
        .eq('project_id', selectedProject);

      if (error) throw error;

      const mappedAllocations: ProjectAllocation[] = (data || []).map((alloc: any) => ({
        id: alloc.id,
        employeeName: alloc.profiles?.display_name || 
          `${alloc.profiles?.first_name || ''} ${alloc.profiles?.last_name || ''}`.trim() || 
          'Unknown',
        role: alloc.roles_catalog?.name || 'Unknown Role',
        allocationPct: alloc.allocation_pct || 0,
        startDate: alloc.start_date,
        endDate: alloc.end_date,
        type: alloc.type || 'ACTIVE',
        skills: [] // Would need a skills table
      }));

      setAllocations(mappedAllocations);
      setHasSearched(true);
    } catch (error) {
      console.error('Error fetching allocations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch project allocations",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const scorecardData = useMemo(() => {
    if (allocations.length === 0) {
      return {
        totalEmployees: 0,
        shadowResources: 0,
        shadowPct: 0,
        underAllocated: 0,
        overAllocated: 0,
        benchEligibleIn2Weeks: 0,
        monthlyCost: 0,
        plannedHours: 0,
        actualHours: 0
      };
    }

    const totalEmployees = allocations.length;
    const shadowResources = allocations.filter(a => a.type === 'SHADOW').length;
    const underAllocated = allocations.filter(a => a.allocationPct < 50).length;
    const overAllocated = allocations.filter(a => a.allocationPct > 100).length;
    
    return {
      totalEmployees,
      shadowResources,
      shadowPct: (shadowResources / totalEmployees) * 100,
      underAllocated,
      overAllocated,
      benchEligibleIn2Weeks: 0,
      monthlyCost: 0,
      plannedHours: 0,
      actualHours: 0
    };
  }, [allocations]);

  const handleEditClick = (allocation: ProjectAllocation) => {
    setSelectedAllocationForEdit(allocation);
  };

  const handleEditSuccess = () => {
    handleSearch(); // Refresh allocations
  };

  const handleAddResource = () => {
    setIsAddResourceDialogOpen(true);
  };

  const handleAddResourceSuccess = () => {
    handleSearch(); // Refresh allocations
  };

  const isSearchEnabled = selectedClient && selectedAccount && selectedProject;

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="min-w-[200px] flex-1 max-w-[250px]">
              <Label className="mb-2 block text-sm font-medium">Client</Label>
              <Combobox
                options={clients.map(c => ({ value: c.id, label: c.name }))}
                value={selectedClient}
                onChange={handleClientChange}
                placeholder="Select Client..."
                searchPlaceholder="Search clients..."
                emptyMessage="No clients found."
              />
            </div>

            <div className="min-w-[200px] flex-1 max-w-[250px]">
              <Label className="mb-2 block text-sm font-medium">Account</Label>
              <Combobox
                options={accounts.map(a => ({ value: a.id, label: a.name }))}
                value={selectedAccount}
                onChange={handleAccountChange}
                placeholder="Select Account..."
                searchPlaceholder="Search accounts..."
                emptyMessage="No accounts found."
                disabled={!selectedClient}
              />
            </div>

            <div className="min-w-[200px] flex-1 max-w-[250px]">
              <Label className="mb-2 block text-sm font-medium">Project</Label>
              <Combobox
                options={projects.map(p => ({ value: p.id, label: p.name }))}
                value={selectedProject}
                onChange={handleProjectChange}
                placeholder="Select Project..."
                searchPlaceholder="Search projects..."
                emptyMessage="No projects found."
                disabled={!selectedAccount}
              />
            </div>

            <Button 
              onClick={handleSearch}
              disabled={!isSearchEnabled || isLoading}
              className="h-10"
            >
              <Search className="h-4 w-4 mr-2" />
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Empty state - before search */}
      {!hasSearched && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-center">
              Select Client, Account, and Project, then click Search to view allocations
            </p>
          </CardContent>
        </Card>
      )}

      {/* Results - after search */}
      {hasSearched && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
          {/* Main Content - 3 columns on desktop, full on mobile */}
          <div className="col-span-1 md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span>Project Allocations</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{allocations.length} resources</Badge>
                    <Button onClick={handleAddResource} size="sm" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Resource
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {allocations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground mb-4">No allocations found for this project</p>
                    <Button onClick={handleAddResource}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Resource
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allocations.map((allocation) => (
                      <div key={allocation.id} className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{allocation.employeeName}</div>
                          <div className="text-sm text-muted-foreground">{allocation.role}</div>
                          {allocation.skills.length > 0 && (
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {allocation.skills.map((skill) => (
                                <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="w-full md:w-28">
                          <div className="text-sm font-medium mb-2">Allocation</div>
                          <Progress value={Math.min(allocation.allocationPct, 100)} className="w-full" />
                          <div className="text-xs text-center mt-1">{allocation.allocationPct}%</div>
                        </div>

                        <div className="w-full md:w-28">
                          <Badge variant={allocation.type === 'ACTIVE' ? 'default' : 'secondary'}>
                            {allocation.type}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            {allocation.startDate} - {allocation.endDate || 'Ongoing'}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClick(allocation)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Scorecard Panel - hidden on mobile, shown in drawer */}
          <ScorecardMobileWrapper
            type="project"
            data={scorecardData}
          />
        </div>
      )}

      {/* Add Resource Dialog */}
      <AddResourceDialog
        open={isAddResourceDialogOpen}
        onOpenChange={setIsAddResourceDialogOpen}
        projectId={selectedProject}
        onSuccess={handleAddResourceSuccess}
      />

      {/* Edit Allocation Dialog */}
      <EditAllocationDialog
        open={!!selectedAllocationForEdit}
        onOpenChange={(open) => !open && setSelectedAllocationForEdit(null)}
        allocation={selectedAllocationForEdit}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
