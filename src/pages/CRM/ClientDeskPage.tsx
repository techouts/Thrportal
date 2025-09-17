import React, { useState, useEffect } from 'react';
import { ChevronRight, Plus, ExternalLink, Filter, Search, MoreVertical, Users, Building, FolderOpen, Archive, Edit, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CrmService } from '@/services/crmService';
import { CreateClientForm } from '@/components/crm/forms/CreateClientForm';
import { CreateAccountForm } from '@/components/crm/forms/CreateAccountForm';
import { CreateProjectForm } from '@/components/crm/forms/CreateProjectForm';
import { CreateSpocForm } from '@/components/crm/forms/CreateSpocForm';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/auth/AuthContext';
import { cn } from '@/lib/utils';
import type { CrmClient, CrmAccount, CrmProject, CrmSpoc } from '@/types/crm';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface HierarchyNode {
  id: string;
  type: 'client' | 'account' | 'project';
  name: string;
  code?: string;
  status: string;
  parent?: string;
  children: HierarchyNode[];
  spocs: CrmSpoc[];
  data: CrmClient | CrmAccount | CrmProject;
}

export function ClientDeskPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  // Data state
  const [clients, setClients] = useState<CrmClient[]>([]);
  const [accounts, setAccounts] = useState<CrmAccount[]>([]);
  const [projects, setProjects] = useState<CrmProject[]>([]);
  const [spocs, setSpocs] = useState<CrmSpoc[]>([]);
  const [hierarchy, setHierarchy] = useState<HierarchyNode[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedNode, setSelectedNode] = useState<HierarchyNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('overview');
  const [showRightDrawer, setShowRightDrawer] = useState(false);
  const [contextEntity, setContextEntity] = useState<any>(null);

  // Form dialogs
  const [showCreateClient, setShowCreateClient] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateSpoc, setShowCreateSpoc] = useState(false);
  const [editingEntity, setEditingEntity] = useState<any>(null);

  // Permissions - simplified for now
  const canWrite = true; // TODO: Implement proper permission checking
  const canWriteProjects = true; // TODO: Implement proper permission checking

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  // Handle deep linking
  useEffect(() => {
    const entityType = searchParams.get('entity');
    const entityId = searchParams.get('id');
    
    if (entityType && entityId) {
      // Find and select the entity
      const node = findNodeById(entityId, hierarchy);
      if (node) {
        handleSelectNode(node);
        setActiveTab(entityType);
      }
    }
  }, [searchParams, hierarchy]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [clientsData, accountsData, projectsData, spocsData] = await Promise.all([
        CrmService.getClients(),
        CrmService.getAccounts(),
        CrmService.getProjects(),
        CrmService.getSpocsByClient('') // Get all SPOCs
      ]);

      setClients(clientsData);
      setAccounts(accountsData);
      setProjects(projectsData);
      setSpocs(spocsData);

      // Build hierarchy
      buildHierarchy(clientsData, accountsData, projectsData, spocsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const buildHierarchy = (clients: CrmClient[], accounts: CrmAccount[], projects: CrmProject[], spocs: CrmSpoc[]) => {
    const hierarchyMap: { [key: string]: HierarchyNode } = {};

    // Create client nodes
    clients.forEach(client => {
      hierarchyMap[`client-${client.id}`] = {
        id: `client-${client.id}`,
        type: 'client',
        name: client.name,
        status: client.status,
        children: [],
        spocs: spocs.filter(s => s.client_id === client.id && !s.account_id),
        data: client
      };
    });

    // Create account nodes
    accounts.forEach(account => {
      const accountNode: HierarchyNode = {
        id: `account-${account.id}`,
        type: 'account',
        name: account.name,
        status: 'Active', // Accounts don't have status in current schema
        parent: `client-${account.client_id}`,
        children: [],
        spocs: spocs.filter(s => s.account_id === account.id),
        data: account
      };
      
      hierarchyMap[`account-${account.id}`] = accountNode;
      
      // Add to parent client
      const parentClient = hierarchyMap[`client-${account.client_id}`];
      if (parentClient) {
        parentClient.children.push(accountNode);
      }
    });

    // Create project nodes
    projects.forEach(project => {
      const projectNode: HierarchyNode = {
        id: `project-${project.id}`,
        type: 'project',
        name: project.name,
        code: `#${project.id.slice(0, 8)}`, // Mock project code
        status: project.status || 'Planned',
        parent: project.account_id ? `account-${project.account_id}` : `client-${project.client_id}`,
        children: [],
        spocs: spocs.filter(s => s.client_id === project.client_id), // Inherit + project-specific
        data: project
      };

      hierarchyMap[`project-${project.id}`] = projectNode;

      // Add to parent account or client
      const parentAccount = project.account_id ? hierarchyMap[`account-${project.account_id}`] : null;
      const parentClient = hierarchyMap[`client-${project.client_id}`];
      
      if (parentAccount) {
        parentAccount.children.push(projectNode);
      } else if (parentClient) {
        parentClient.children.push(projectNode);
      }
    });

    const rootNodes = Object.values(hierarchyMap).filter(node => node.type === 'client');
    setHierarchy(rootNodes);
  };

  const findNodeById = (id: string, nodes: HierarchyNode[]): HierarchyNode | null => {
    for (const node of nodes) {
      if (node.id.endsWith(id)) return node;
      const found = findNodeById(id, node.children);
      if (found) return found;
    }
    return null;
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const handleSelectNode = (node: HierarchyNode) => {
    setSelectedNode(node);
    setActiveTab(node.type);
    setShowRightDrawer(false);
  };

  const handleRowClick = (entity: any, type: string) => {
    setContextEntity({ ...entity, type });
    setShowRightDrawer(true);
  };

  const handleCreateSuccess = () => {
    loadData();
    setShowCreateClient(false);
    setShowCreateAccount(false);
    setShowCreateProject(false);
    setShowCreateSpoc(false);
    setEditingEntity(null);
  };

  const filteredHierarchy = hierarchy.filter(node => {
    if (searchQuery && !node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'all' && node.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const renderHierarchyNode = (node: HierarchyNode, level = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const isSelected = selectedNode?.id === node.id;

    return (
      <div key={node.id} className="select-none">
        <div
          className={cn(
            "flex items-center gap-2 py-2 px-3 rounded-md cursor-pointer group transition-colors",
            "hover:bg-muted/50",
            isSelected && "bg-primary/10 border border-primary/20",
            level > 0 && "ml-6"
          )}
          onClick={() => handleSelectNode(node)}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
            >
              <ChevronRight className={cn("h-3 w-3 transition-transform", isExpanded && "rotate-90")} />
            </Button>
          )}
          
          {!hasChildren && <div className="w-4" />}
          
          {node.type === 'client' && <Building className="h-4 w-4 text-blue-500" />}
          {node.type === 'account' && <Users className="h-4 w-4 text-green-500" />}
          {node.type === 'project' && <FolderOpen className="h-4 w-4 text-purple-500" />}
          
          <span className="flex-1 text-sm font-medium">{node.name}</span>
          {node.code && <span className="text-xs text-muted-foreground">{node.code}</span>}
          
          <Badge variant={node.status === 'Active' ? 'default' : 'secondary'} className="text-xs">
            {node.status}
          </Badge>
          
          {node.spocs.length > 0 && (
            <div className="flex gap-1">
              {node.spocs.slice(0, 3).map((spoc, i) => (
                <Badge key={i} variant="outline" className="text-xs px-1">
                  {spoc.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </Badge>
              ))}
              {node.spocs.length > 3 && (
                <Badge variant="outline" className="text-xs px-1">+{node.spocs.length - 3}</Badge>
              )}
            </div>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {node.children.map(child => renderHierarchyNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const getTabsForNode = (node: HierarchyNode | null) => {
    if (!node) return ['overview'];
    return ['overview', node.type, 'spocs'];
  };

  const renderEntityForm = (entity: any, type: string) => {
    if (type === 'client') {
      return (
        <CreateClientForm
          mode="edit"
          initialData={entity}
          onSuccess={handleCreateSuccess}
        />
      );
    }
    // Add other entity forms as needed
    return <div>Form for {type} not implemented yet</div>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading Client Desk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Left Pane - Hierarchy */}
      <div className="w-80 border-r bg-card flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">Client Desk</h1>
            {canWrite && (
              <Dialog open={showCreateClient} onOpenChange={setShowCreateClient}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    New Client
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Client</DialogTitle>
                  </DialogHeader>
                  <CreateClientForm onSuccess={handleCreateSuccess} />
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          {/* Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="client">Clients</SelectItem>
                  <SelectItem value="account">Accounts</SelectItem>
                  <SelectItem value="project">Projects</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Planned">Planned</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Hierarchy Tree */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredHierarchy.map(node => renderHierarchyNode(node))}
        </div>
      </div>

      {/* Main Pane - Tabs */}
      <div className="flex-1 flex flex-col">
        {selectedNode ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {selectedNode.type === 'client' && <Building className="h-5 w-5 text-blue-500" />}
                  {selectedNode.type === 'account' && <Users className="h-5 w-5 text-green-500" />}
                  {selectedNode.type === 'project' && <FolderOpen className="h-5 w-5 text-purple-500" />}
                  <h2 className="text-lg font-semibold">{selectedNode.name}</h2>
                  {selectedNode.code && <span className="text-sm text-muted-foreground">{selectedNode.code}</span>}
                </div>
                
                <div className="flex items-center gap-2">
                  {selectedNode.type === 'project' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/Projects/Board?projectId=${selectedNode.data.id}`)}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Open in Project Board
                    </Button>
                  )}
                  
                  {canWrite && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setEditingEntity(selectedNode.data)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
              
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value={selectedNode.type} className="capitalize">{selectedNode.type}</TabsTrigger>
                <TabsTrigger value="spocs">SPOCs</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <TabsContent value="overview" className="p-4">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge variant="outline">{selectedNode.status}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>SPOCs:</span>
                          <span>{selectedNode.spocs.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Children:</span>
                          <span>{selectedNode.children.length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">No recent activity</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Quick Links</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedNode.type === 'project' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full justify-start"
                            onClick={() => navigate(`/Projects/Board?projectId=${selectedNode.data.id}`)}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Project Board
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          SharePoint
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value={selectedNode.type} className="p-4">
                {editingEntity && editingEntity.id === selectedNode.data.id ? (
                  renderEntityForm(editingEntity, selectedNode.type)
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium capitalize">{selectedNode.type} Details</h3>
                      {canWrite && (
                        <Button onClick={() => setEditingEntity(selectedNode.data)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      )}
                    </div>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <pre className="text-sm whitespace-pre-wrap">
                          {JSON.stringify(selectedNode.data, null, 2)}
                        </pre>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="spocs" className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">SPOCs</h3>
                  {canWrite && (
                    <Dialog open={showCreateSpoc} onOpenChange={setShowCreateSpoc}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Link SPOC
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Link SPOC</DialogTitle>
                        </DialogHeader>
                        <CreateSpocForm
                          clientId={selectedNode.type === 'client' ? selectedNode.data.id : undefined}
                          accountId={selectedNode.type === 'account' ? selectedNode.data.id : undefined}
                          onSuccess={handleCreateSuccess}
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
                
                <div className="grid gap-4">
                  {selectedNode.spocs.map(spoc => (
                    <Card key={spoc.id} className="cursor-pointer" onClick={() => handleRowClick(spoc, 'spoc')}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{spoc.name}</h4>
                            <p className="text-sm text-muted-foreground">{spoc.email}</p>
                            <p className="text-sm text-muted-foreground">{spoc.role}</p>
                          </div>
                          <div className="flex gap-1">
                            {spoc.is_primary && <Badge variant="default">Primary</Badge>}
                            <Badge variant="outline">Active</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="actions" className="p-4">
                <div className="space-y-4">
                  {selectedNode.type === 'client' && canWrite && (
                    <Dialog open={showCreateAccount} onOpenChange={setShowCreateAccount}>
                      <DialogTrigger asChild>
                        <Button className="w-full justify-start">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Account
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create Account</DialogTitle>
                        </DialogHeader>
                        <CreateAccountForm
                          clientId={selectedNode.data.id}
                          spocs={selectedNode.spocs}
                          onSuccess={handleCreateSuccess}
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                  
                  {selectedNode.type === 'account' && canWriteProjects && (
                    <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
                      <DialogTrigger asChild>
                        <Button className="w-full justify-start">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Project
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Create Project</DialogTitle>
                        </DialogHeader>
                        <CreateProjectForm
                          clientId={(selectedNode.data as CrmAccount).client_id}
                          accounts={[selectedNode.data as CrmAccount]}
                          spocs={selectedNode.spocs}
                          onSuccess={handleCreateSuccess}
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Select an Entity</h3>
              <p className="text-muted-foreground">Choose a client, account, or project from the hierarchy to view details.</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Drawer - Context */}
      <Sheet open={showRightDrawer} onOpenChange={setShowRightDrawer}>
        <SheetContent side="right" className="w-96">
          <SheetHeader>
            <SheetTitle>
              {contextEntity?.type && (
                <div className="flex items-center gap-2">
                  {contextEntity.type === 'client' && <Building className="h-5 w-5" />}
                  {contextEntity.type === 'account' && <Users className="h-5 w-5" />}
                  {contextEntity.type === 'project' && <FolderOpen className="h-5 w-5" />}
                  {contextEntity?.name}
                </div>
              )}
            </SheetTitle>
          </SheetHeader>
          
          {contextEntity && (
            <div className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs whitespace-pre-wrap">
                    {JSON.stringify(contextEntity, null, 2)}
                  </pre>
                </CardContent>
              </Card>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}