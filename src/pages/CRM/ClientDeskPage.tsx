import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronRight, Plus, ExternalLink, Search, MoreVertical, Users, Building, FolderOpen, 
  Archive, Edit, Eye, Clock, Star, Filter, Command, Home, ArrowRight, FileText,
  Phone, Mail, Globe, Calendar, TrendingUp, Activity, Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CrmService } from '@/services/crmService';
import { CrmSpocLinkService } from '@/services/crmSpocLinkService';
import { CreateClientForm } from '@/components/crm/forms/CreateClientForm';
import { CreateAccountForm } from '@/components/crm/forms/CreateAccountForm';
import { CreateProjectForm } from '@/components/crm/forms/CreateProjectForm';
import { LinkSpocForm } from '@/components/crm/forms/LinkSpocForm';
import { EntityDetailsForm } from '@/components/crm/EntityDetailsForm';
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
  updated_at?: string;
}

interface SmartList {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  filter: (nodes: HierarchyNode[]) => HierarchyNode[];
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
  const [globalSearch, setGlobalSearch] = useState('');
  const [railSearch, setRailSearch] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedNode, setSelectedNode] = useState<HierarchyNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('overview');
  const [showInspector, setShowInspector] = useState(false);
  const [inspectorEntity, setInspectorEntity] = useState<any>(null);
  const [recentEntities, setRecentEntities] = useState<HierarchyNode[]>([]);
  const [selectedSmartList, setSelectedSmartList] = useState<string>('recents');

  // Forms
  const [showCreateClient, setShowCreateClient] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateSpoc, setShowCreateSpoc] = useState(false);
  const [showLinkSpoc, setShowLinkSpoc] = useState(false);
  const [parentContext, setParentContext] = useState<{ type: string; id: string } | null>(null);

  // Permissions - Check if user has CRM access
  const canWrite = user && ['ADMIN', 'FINANCE_MANAGER', 'HR_MANAGER', 'MANAGEMENT', 'STAFFING_MANAGER'].includes(user.role);

  // Smart lists configuration
  const smartLists: SmartList[] = [
    {
      id: 'recents',
      name: 'Recently Viewed',
      icon: Clock,
      count: recentEntities.length,
      filter: () => recentEntities
    },
    {
      id: 'active-projects',
      name: 'Active Projects', 
      icon: TrendingUp,
      count: hierarchy.filter(c => c.children.some(a => a.children.some(p => p.status === 'In-flight'))).length,
      filter: (nodes) => nodes.filter(c => c.children.some(a => a.children.some(p => p.status === 'In-flight')))
    },
    {
      id: 'needs-attention',
      name: 'Needs Attention',
      icon: Star,
      count: hierarchy.filter(c => c.spocs.length === 0).length,
      filter: (nodes) => nodes.filter(c => c.spocs.length === 0)
    }
  ];

  // Breadcrumb computation
  const getBreadcrumbs = () => {
    if (!selectedNode) return [];
    
    const breadcrumbs = [];
    let current = selectedNode;
    
    while (current) {
      breadcrumbs.unshift({
        id: current.id,
        name: current.name,
        type: current.type
      });
      
      if (current.parent) {
        current = findNodeById(current.parent.replace(/^(client|account|project)-/, ''), hierarchy, true);
      } else {
        current = null;
      }
    }
    
    return breadcrumbs;
  };

  // Load CRM data - Development mode with public access
  const loadData = async () => {
    // Debug logging
    console.log('🔍 CRM LoadData Debug:', {
      user: user ? { 
        email: user.email, 
        role: user.role, 
        id: user.id 
      } : null,
      canWrite,
      userDefined: user !== undefined,
      DEV_AUTH_MODE: true
    });

    // Temporarily bypass auth check for development - public policies in place
    console.log('🚀 Loading CRM data with public access policies...');

    try {
      setLoading(true);
      console.log('🚀 Starting CRM data fetch...');
      
      const [clientsData, accountsData, projectsData, spocsData, spocLinksData] = await Promise.all([
        CrmService.getClients(),
        CrmService.getAccounts(),
        CrmService.getProjects(),
        CrmService.getAllSpocs(),
        CrmSpocLinkService.getAllSpocLinks()
      ]);

      console.log('📊 CRM Data fetched:', {
        clients: clientsData.length,
        accounts: accountsData.length,
        projects: projectsData.length,
        spocs: spocsData.length,
        spocLinks: spocLinksData.length
      });

      setClients(clientsData);
      setAccounts(accountsData);
      setProjects(projectsData);
      setSpocs(spocsData);

      buildHierarchy(clientsData, accountsData, projectsData, spocsData, spocLinksData);
      
      toast({
        title: "CRM Data Loaded",
        description: `Loaded ${clientsData.length} clients, ${accountsData.length} accounts, ${projectsData.length} projects`,
      });
    } catch (error) {
      console.error('💥 Error loading CRM data:', error);
      toast({
        title: "Data Loading Error",
        description: "Failed to load CRM data. Please check your permissions and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load initial data when user authentication is established
  useEffect(() => {
    if (user !== undefined) { // Wait for auth to be determined
      loadData();
    }
  }, [user, canWrite]);

  // Handle deep linking
  useEffect(() => {
    const entityType = searchParams.get('entity');
    const entityId = searchParams.get('id');
    
    if (entityType && entityId && hierarchy.length > 0) {
      const node = findNodeById(entityId, hierarchy, true);
      if (node) {
        handleSelectNode(node);
        setActiveTab(entityType === 'client' ? 'client' : entityType === 'account' ? 'account' : 'project');
      }
    }
  }, [searchParams, hierarchy]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            document.getElementById('global-search')?.focus();
            break;
        }
      } else {
        switch (e.key) {
          case '/':
            e.preventDefault();
            document.getElementById('global-search')?.focus();
            break;
          case 'n':
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            e.preventDefault();
            setShowCreateClient(true);
            break;
          case 'e':
            if (!selectedNode || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            e.preventDefault();
            setActiveTab('details');
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [selectedNode]);

  const buildHierarchy = (clients: CrmClient[], accounts: CrmAccount[], projects: CrmProject[], spocs: CrmSpoc[], spocLinks: any[]) => {
    const hierarchyMap: { [key: string]: HierarchyNode } = {};

    console.log('🏗️ Building hierarchy with SPOC links:', {
      totalSpocs: spocs.length,
      totalLinks: spocLinks.length,
      spocLinksSample: spocLinks.slice(0, 3)
    });

    // Helper function to get SPOCs for an entity
    const getSpocsForEntity = (entityType: string, entityId: string) => {
      const links = spocLinks.filter(link => 
        link.entity_type === entityType && link.entity_id === entityId
      );
      
      const linkedSpocs = links.map(link => {
        const spoc = spocs.find(s => s.id === link.spoc_id);
        return spoc ? { ...spoc, link_role: link.role } : null;
      }).filter(Boolean);

      console.log(`🔗 SPOCs for ${entityType} ${entityId}:`, linkedSpocs.length);
      return linkedSpocs;
    };

    // Create client nodes
    clients.forEach(client => {
      const clientSpocs = getSpocsForEntity('client', client.id);
      hierarchyMap[`client-${client.id}`] = {
        id: `client-${client.id}`,
        type: 'client',
        name: client.name,
        status: client.status || 'Active',
        children: [],
        spocs: clientSpocs,
        data: client,
        updated_at: client.updated_at
      };
    });

    // Create account nodes
    accounts.forEach(account => {
      const accountSpocs = getSpocsForEntity('account', account.id);
      const accountNode: HierarchyNode = {
        id: `account-${account.id}`,
        type: 'account',
        name: account.name,
        status: 'Active',
        parent: `client-${account.client_id}`,
        children: [],
        spocs: accountSpocs,
        data: account,
        updated_at: account.updated_at
      };
      
      hierarchyMap[`account-${account.id}`] = accountNode;
      
      const parentClient = hierarchyMap[`client-${account.client_id}`];
      if (parentClient) {
        parentClient.children.push(accountNode);
      }
    });

    // Create project nodes
    projects.forEach(project => {
      const projectSpocs = getSpocsForEntity('project', project.id);
      const projectNode: HierarchyNode = {
        id: `project-${project.id}`,
        type: 'project',
        name: project.name,
        code: `#${project.id.slice(0, 8)}`,
        status: project.status || 'Planned',
        parent: project.account_id ? `account-${project.account_id}` : `client-${project.client_id}`,
        children: [],
        spocs: projectSpocs,
        data: project,
        updated_at: project.updated_at
      };

      hierarchyMap[`project-${project.id}`] = projectNode;

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

  const findNodeById = (id: string, nodes: HierarchyNode[], exactMatch = false): HierarchyNode | null => {
    for (const node of nodes) {
      if (exactMatch ? node.id === id : node.id.endsWith(id)) return node;
      const found = findNodeById(id, node.children, exactMatch);
      if (found) return found;
    }
    return null;
  };

  const addToRecents = (node: HierarchyNode) => {
    setRecentEntities(prev => {
      const filtered = prev.filter(r => r.id !== node.id);
      return [node, ...filtered].slice(0, 10);
    });
  };

  const handleSelectNode = (node: HierarchyNode) => {
    setSelectedNode(node);
    setActiveTab('overview');
    addToRecents(node);
    
    // Auto-expand parents
    let current = node.parent;
    while (current) {
      setExpandedNodes(prev => new Set(prev).add(current!));
      const parentNode = findNodeById(current.replace(/^(client|account|project)-/, ''), hierarchy, true);
      current = parentNode?.parent;
    }
  };

  const handleInspect = (entity: any, type: string) => {
    setInspectorEntity({ ...entity, type });
    setShowInspector(true);
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

  const handleCreateSuccess = () => {
    loadData();
    setShowCreateClient(false);
    setShowCreateAccount(false);
    setShowCreateProject(false);
    setShowCreateSpoc(false);
    setShowLinkSpoc(false);
    setParentContext(null);
    toast({
      title: "Success",
      description: "Entity created successfully",
    });
  };

  // Get filtered nodes based on smart list and search
  const getFilteredNodes = () => {
    const smartList = smartLists.find(s => s.id === selectedSmartList);
    let nodes = smartList ? smartList.filter(hierarchy) : hierarchy;
    
    if (railSearch) {
      nodes = nodes.filter(node => 
        node.name.toLowerCase().includes(railSearch.toLowerCase()) ||
        node.children.some(child => 
          child.name.toLowerCase().includes(railSearch.toLowerCase()) ||
          child.children.some(grandchild => 
            grandchild.name.toLowerCase().includes(railSearch.toLowerCase())
          )
        )
      );
    }
    
    return nodes;
  };

  const renderHierarchyNode = (node: HierarchyNode, level = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const isSelected = selectedNode?.id === node.id;

    return (
      <div key={node.id}>
        <div
          className={cn(
            "flex items-center gap-2 py-2 px-3 rounded-md cursor-pointer group transition-colors",
            "hover:bg-muted/50",
            isSelected && "bg-primary/10 border border-primary/20",
            level > 0 && "ml-4"
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
          
          <span className="flex-1 text-sm font-medium truncate">{node.name}</span>
          {node.code && <span className="text-xs text-muted-foreground">{node.code}</span>}
          
          <Badge 
            variant={node.status === 'Active' || node.status === 'In-flight' ? 'default' : 'secondary'} 
            className="text-xs"
          >
            {node.status}
          </Badge>
          
          {node.spocs.length > 0 && (
            <div className="flex gap-1">
              {node.spocs.slice(0, 2).map((spoc, i) => (
                <Badge key={i} variant="outline" className="text-xs px-1">
                  {spoc.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </Badge>
              ))}
              {node.spocs.length > 2 && (
                <Badge variant="outline" className="text-xs px-1">+{node.spocs.length - 2}</Badge>
              )}
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              handleInspect(node.data, node.type);
            }}
          >
            <Eye className="h-3 w-3" />
          </Button>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {node.children.map(child => renderHierarchyNode(child, level + 1))}
          </div>
        )}
      </div>
    );
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

  // Show access message for users without CRM permissions
  if (!user || !canWrite) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md">
          <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">CRM Access Required</h2>
          <p className="text-muted-foreground mb-4">
            You need CRM access permissions to view client data. Please sign in with an account that has Admin, Finance Manager, HR Manager, Management, or Staffing Manager role.
          </p>
          {!user && (
            <Button onClick={() => navigate('/auth')} className="mt-4">
              Sign In to Access CRM
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-background">
      {/* PAGE HEADER */}
      <div className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 flex-1">
            <Home className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Client Desk</span>
            {getBreadcrumbs().map((crumb, i) => (
              <React.Fragment key={crumb.id}>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-sm"
                  onClick={() => {
                    const node = findNodeById(crumb.id, hierarchy, true);
                    if (node) handleSelectNode(node);
                  }}
                >
                  {crumb.name}
                </Button>
              </React.Fragment>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* New Dropdown - Only shows New Client */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-1" />
                  New
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setShowCreateClient(true)}>
                  <Building className="h-4 w-4 mr-2" />
                  New Client
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="flex h-[calc(100vh-8rem)]">
        {/* LEFT RAIL */}
        <div className="w-80 border-r bg-card flex flex-col">
          {/* Smart Lists */}
          <div className="p-4 border-b">
            <Label className="text-xs font-medium text-muted-foreground uppercase">Smart Lists</Label>
            <div className="mt-2 space-y-1">
              {smartLists.map(list => (
                <Button
                  key={list.id}
                  variant={selectedSmartList === list.id ? "secondary" : "ghost"}
                  className="w-full justify-start h-8"
                  onClick={() => setSelectedSmartList(list.id)}
                >
                  <list.icon className="h-4 w-4 mr-2" />
                  <span className="flex-1 text-left">{list.name}</span>
                  <Badge variant="outline" className="text-xs">{list.count}</Badge>
                </Button>
              ))}
            </div>
          </div>

          {/* Search & Filters */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Filter current view..."
                value={railSearch}
                onChange={(e) => setRailSearch(e.target.value)}
                className="pl-10 h-8"
              />
            </div>
          </div>

          {/* Hierarchy */}
          <div className="flex-1 overflow-y-auto p-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase mb-2 block">
              {selectedSmartList === 'recents' ? 'Recent Entities' : 'Client Hierarchy'}
            </Label>
            {getFilteredNodes().map(node => renderHierarchyNode(node))}
          </div>
        </div>

        {/* CENTER WORKBENCH */}
        <div className="flex-1 flex flex-col">
          {selectedNode ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <div className="border-b p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {selectedNode.type === 'client' && <Building className="h-6 w-6 text-blue-500" />}
                    {selectedNode.type === 'account' && <Users className="h-6 w-6 text-green-500" />}
                    {selectedNode.type === 'project' && <FolderOpen className="h-6 w-6 text-purple-500" />}
                    <div>
                      <h2 className="text-xl font-semibold">{selectedNode.name}</h2>
                      {selectedNode.code && <p className="text-sm text-muted-foreground">{selectedNode.code}</p>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {selectedNode.type === 'project' && (
                      <Button 
                        variant="outline"
                        onClick={() => navigate(`/Projects/Board?projectId=${selectedNode.data.id}`)}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in Project Board
                      </Button>
                    )}
                  </div>
                </div>
                
                <TabsList className="grid w-full max-w-md grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="spocs">SPOCs</TabsTrigger>
                </TabsList>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <TabsContent value="overview" className="p-6">
                  {/* Metrics for Client and Account levels */}
                  {selectedNode.type === 'client' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Accounts</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">{selectedNode.children.filter(c => c.type === 'account').length}</p>
                          <p className="text-xs text-muted-foreground">Active accounts</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Projects</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">
                            {selectedNode.children.reduce((sum, acc) => sum + acc.children.length, 0)}
                          </p>
                          <p className="text-xs text-muted-foreground">Total projects</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">SPOCs</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">{selectedNode.spocs.length}</p>
                          <p className="text-xs text-muted-foreground">Contact points</p>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {selectedNode.type === 'account' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Projects</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">{selectedNode.children.length}</p>
                          <p className="text-xs text-muted-foreground">Active projects</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">SPOCs</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">{selectedNode.spocs.length}</p>
                          <p className="text-xs text-muted-foreground">Contact points</p>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* People Panel */}
                  <Card className="mb-6">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">People</CardTitle>
                        <Button size="sm" onClick={() => setShowLinkSpoc(true)}>
                          <Plus className="h-4 w-4 mr-1" />
                          Link SPOC
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {selectedNode.spocs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedNode.spocs.slice(0, 6).map(spoc => (
                            <div key={spoc.id} className="flex items-center gap-3 p-3 border rounded-lg">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium">
                                  {spoc.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </span>
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{spoc.name}</p>
                                <p className="text-sm text-muted-foreground">{spoc.email}</p>
                              </div>
                              <div className="flex gap-1">
                                <Badge variant="outline" className="text-xs">Finance</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">No SPOCs linked</p>
                          <Button size="sm" className="mt-2" onClick={() => setShowLinkSpoc(true)}>
                            Link First SPOC
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Quick Actions - Different for each level */}
                  {selectedNode.type !== 'project' && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {selectedNode.type === 'client' && (
                            <>
                              <Button 
                                variant="outline" 
                                className="h-16 flex-col gap-2"
                                onClick={() => {
                                  setParentContext({ type: 'client', id: selectedNode.data.id });
                                  setShowCreateAccount(true);
                                }}
                              >
                                <Plus className="h-5 w-5" />
                                Add Account
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-16 flex-col gap-2"
                                onClick={() => {
                                  setParentContext({ type: 'client', id: selectedNode.data.id });
                                  setShowCreateProject(true);
                                }}
                              >
                                <Plus className="h-5 w-5" />
                                Add Project
                              </Button>
                            </>
                          )}
                          {selectedNode.type === 'account' && (
                            <Button 
                              variant="outline" 
                              className="h-16 flex-col gap-2"
                              onClick={() => {
                                setParentContext({ type: 'account', id: selectedNode.data.id });
                                setShowCreateProject(true);
                              }}
                            >
                              <Plus className="h-5 w-5" />
                              Add Project
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="details" className="p-6">
                  <EntityDetailsForm 
                    entity={selectedNode.data}
                    entityType={selectedNode.type}
                    onSave={loadData}
                  />
                </TabsContent>

                <TabsContent value="spocs" className="p-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>SPOCs</CardTitle>
                        <Button onClick={() => setShowLinkSpoc(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Link SPOC
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {selectedNode.spocs.length > 0 ? (
                        <div className="space-y-4">
                          {selectedNode.spocs.map(spoc => (
                            <div key={spoc.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                  <span className="font-medium">
                                    {spoc.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium">{spoc.name}</p>
                                  <p className="text-sm text-muted-foreground">{spoc.email}</p>
                                  <p className="text-sm text-muted-foreground">{spoc.phone}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex gap-1">
                                  <Badge variant="outline">Finance</Badge>
                                  <Badge variant="outline">Project</Badge>
                                </div>
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="sm">
                                    <Phone className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Mail className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">No SPOCs linked</h3>
                          <p className="text-muted-foreground mb-4">Link contacts to manage communication</p>
                          <Button onClick={() => setShowLinkSpoc(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Link First SPOC
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

              </div>
            </Tabs>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Building className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Welcome to Client Desk</h2>
                <p className="text-muted-foreground mb-6">Select a client, account, or project to get started</p>
                <Button onClick={() => setShowCreateClient(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Client
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT INSPECTOR */}
      <Sheet open={showInspector} onOpenChange={setShowInspector}>
        <SheetContent className="w-96">
          <SheetHeader>
            <SheetTitle>Inspector</SheetTitle>
          </SheetHeader>
          {inspectorEntity && (
            <div className="mt-6 space-y-6">
              {/* Parent Chain */}
              <div>
                <Label className="text-sm font-medium">Parent Chain</Label>
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <p className="text-sm">Client → Account → Project</p>
                </div>
              </div>

              {/* Key Fields */}
              <div>
                <Label className="text-sm font-medium">Key Information</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant="default">{inspectorEntity.status || 'Active'}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Type</span>
                    <span className="text-sm capitalize">{inspectorEntity.type}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <Label className="text-sm font-medium">Quick Actions</Label>
                <div className="mt-2 space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in Project Board
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Globe className="h-4 w-4 mr-2" />
                    Open SharePoint
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Details
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* CREATE DIALOGS */}
      <Dialog open={showCreateClient} onOpenChange={setShowCreateClient}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Client</DialogTitle>
          </DialogHeader>
          <CreateClientForm 
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowCreateClient(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateAccount} onOpenChange={setShowCreateAccount}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Account</DialogTitle>
          </DialogHeader>
          <CreateAccountForm 
            clientId={parentContext?.type === 'client' ? parentContext.id : ''}
            spocs={spocs}
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowCreateAccount(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <CreateProjectForm 
            clientId={parentContext?.type === 'client' ? parentContext.id : 
                     (parentContext?.type === 'account' ? 
                       accounts.find(a => a.id === parentContext.id)?.client_id || '' : '')}
            accounts={accounts}
            spocs={spocs}
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowCreateProject(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showLinkSpoc} onOpenChange={setShowLinkSpoc}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Link SPOC</DialogTitle>
          </DialogHeader>
          <LinkSpocForm 
            clientId={selectedNode?.type === 'client' ? selectedNode.id.replace('client-', '') : undefined}
            accountId={selectedNode?.type === 'account' ? selectedNode.id.replace('account-', '') : undefined}
            projectId={selectedNode?.type === 'project' ? selectedNode.id.replace('project-', '') : undefined}
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowLinkSpoc(false)}
          />
        </DialogContent>
      </Dialog>
      </div>
  );
}