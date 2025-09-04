import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Position,
  NodeProps,
  MarkerType
} from '@xyflow/react';
import ELK from 'elkjs/lib/elk.bundled.js';
import { Search, Filter, Users, Building, ExpandIcon, User, ZoomIn, Target } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Toggle } from '@/components/ui/toggle';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { mockOrgNodes, mockOrgEdges } from '@/mocks/orgData';
import type { OrgNode } from '@/types/org';

import '@xyflow/react/dist/style.css';

const elk = new ELK();

// Layout algorithm using ELK
const getLayoutedElements = async (nodes: Node[], edges: Edge[]) => {
  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'DOWN',
      'elk.spacing.nodeNode': '50',
      'elk.layered.spacing.nodeNodeBetweenLayers': '80'
    },
    children: nodes.map((node) => ({
      id: node.id,
      width: 280,
      height: 120
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target]
    }))
  };

  const layoutedGraph = await elk.layout(graph);

  const layoutedNodes = nodes.map((node) => {
    const layoutNode = layoutedGraph.children?.find((lgNode) => lgNode.id === node.id);
    return {
      ...node,
      position: {
        x: layoutNode?.x ?? 0,
        y: layoutNode?.y ?? 0
      }
    };
  });

  return { nodes: layoutedNodes, edges };
};

// Custom node component
function OrgNodeComponent({ data, selected }: NodeProps) {
  const { employee, onExpand, onViewProfile, isExpanded } = data as {
    employee: OrgNode;
    onExpand: (id: string) => void;
    onViewProfile: (id: string) => void;
    isExpanded: boolean;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className={`w-70 ${selected ? 'ring-2 ring-primary' : ''} hover:shadow-md transition-shadow`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={employee.avatar_url} />
            <AvatarFallback>{getInitials(employee.display_name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{employee.display_name}</h3>
            <p className="text-xs text-muted-foreground truncate">{employee.title}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">{employee.dept}</Badge>
          {employee.direct_reports_count > 0 && (
            <Badge variant="secondary" className="text-xs">
              {employee.direct_reports_count} reports
            </Badge>
          )}
        </div>

        <div className="flex gap-1">
          {employee.has_reports && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs px-2 py-1"
              onClick={() => onExpand(employee.id)}
            >
              <ExpandIcon className="h-3 w-3 mr-1" />
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="text-xs px-2 py-1"
            onClick={() => onViewProfile(employee.id)}
          >
            <User className="h-3 w-3 mr-1" />
            Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

const nodeTypes = {
  orgNode: OrgNodeComponent
};

interface OrgStructureProps {
  className?: string;
}

export function OrgStructure({ className }: OrgStructureProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [depthLevel, setDepthLevel] = useState([2]);
  const [showPeers, setShowPeers] = useState(false);
  const [showDottedLines, setShowDottedLines] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<OrgNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Get initial center node from URL or default to current user
  const centerNodeId = searchParams.get('node') || 'emp2'; // Default to Pavan Kumar

  // Filter and process org data
  const filteredOrgData = useMemo(() => {
    let filteredNodes = mockOrgNodes;
    
    if (selectedDepartment !== 'all') {
      filteredNodes = filteredNodes.filter(node => node.dept === selectedDepartment);
    }
    
    if (selectedCity !== 'all') {
      filteredNodes = filteredNodes.filter(node => node.city === selectedCity);
    }

    if (searchQuery.trim()) {
      filteredNodes = filteredNodes.filter(node =>
        node.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return { nodes: filteredNodes, edges: mockOrgEdges };
  }, [selectedDepartment, selectedCity, searchQuery]);

  // Build hierarchy tree from center node
  const buildHierarchy = useCallback((centerNodeId: string, depth: number) => {
    const { nodes: orgNodes, edges: orgEdges } = filteredOrgData;
    const centerNode = orgNodes.find(n => n.id === centerNodeId);
    if (!centerNode) return { nodes: [], edges: [] };

    const resultNodes = new Set<string>();
    const resultEdges = new Set<string>();

    // Add center node
    resultNodes.add(centerNodeId);

    // Add nodes above (managers) - up to depth levels
    let currentNodes = [centerNodeId];
    for (let i = 0; i < depth; i++) {
      const nextNodes: string[] = [];
      currentNodes.forEach(nodeId => {
        const node = orgNodes.find(n => n.id === nodeId);
        if (node?.manager_id) {
          resultNodes.add(node.manager_id);
          nextNodes.push(node.manager_id);
          const edge = orgEdges.find(e => e.from === node.manager_id && e.to === nodeId);
          if (edge) resultEdges.add(`${edge.from}-${edge.to}`);
        }
      });
      currentNodes = nextNodes;
    }

    // Add nodes below (reports) - up to depth levels
    currentNodes = [centerNodeId];
    for (let i = 0; i < depth; i++) {
      const nextNodes: string[] = [];
      currentNodes.forEach(nodeId => {
        orgEdges.forEach(edge => {
          if (edge.from === nodeId) {
            resultNodes.add(edge.to);
            nextNodes.push(edge.to);
            resultEdges.add(`${edge.from}-${edge.to}`);
          }
        });
      });
      currentNodes = nextNodes;
    }

    const hierarchyNodes = Array.from(resultNodes).map(nodeId => orgNodes.find(n => n.id === nodeId)!).filter(Boolean);
    const hierarchyEdges = Array.from(resultEdges).map(edgeKey => {
      const [from, to] = edgeKey.split('-');
      return orgEdges.find(e => e.from === from && e.to === to)!;
    }).filter(Boolean);

    return { nodes: hierarchyNodes, edges: hierarchyEdges };
  }, [filteredOrgData]);

  // Convert to React Flow format
  const convertToFlowElements = useCallback(async (hierarchyData: { nodes: OrgNode[], edges: any[] }) => {
    const flowNodes: Node[] = hierarchyData.nodes.map(node => ({
      id: node.id,
      type: 'orgNode',
      position: { x: 0, y: 0 }, // Will be set by layout
      data: {
        employee: node,
        isExpanded: expandedNodes.has(node.id),
        onExpand: (nodeId: string) => {
          setExpandedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(nodeId)) {
              newSet.delete(nodeId);
            } else {
              newSet.add(nodeId);
            }
            return newSet;
          });
        },
        onViewProfile: (nodeId: string) => {
          const employee = hierarchyData.nodes.find(n => n.id === nodeId);
          setSelectedEmployee(employee || null);
        }
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top
    }));

    const flowEdges: Edge[] = hierarchyData.edges.map((edge, index) => ({
      id: `${edge.from}-${edge.to}`,
      source: edge.from,
      target: edge.to,
      type: 'smoothstep',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 15,
        height: 15
      },
      style: {
        stroke: edge.type === 'dotted' ? '#94a3b8' : '#64748b',
        strokeDasharray: edge.type === 'dotted' ? '5,5' : undefined,
        strokeWidth: 2
      }
    }));

    return getLayoutedElements(flowNodes, flowEdges);
  }, [expandedNodes]);

  // Load hierarchy data
  useEffect(() => {
    const loadHierarchy = async () => {
      setLoading(true);
      const hierarchyData = buildHierarchy(centerNodeId, depthLevel[0]);
      const { nodes: layoutedNodes, edges: layoutedEdges } = await convertToFlowElements(hierarchyData);
      
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      setLoading(false);
    };

    loadHierarchy();
  }, [centerNodeId, depthLevel, buildHierarchy, convertToFlowElements, setNodes, setEdges]);

  const handleCenterOnMe = () => {
    setSearchParams({ node: 'emp2', depth: '2' }); // Center on Pavan Kumar
  };

  const handleFit = () => {
    // This would trigger the fitView function in ReactFlow
    window.dispatchEvent(new CustomEvent('fit-view'));
  };

  if (loading) {
    return <OrgStructureSkeleton />;
  }

  return (
    <div className={`${className} h-[800px] relative`}>
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-10 bg-background/95 backdrop-blur-sm border rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-lg font-semibold">Org Structure</h1>
          
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Dept" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Depts</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Product">Product</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                <SelectItem value="Bangalore">Bangalore</SelectItem>
                <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                <SelectItem value="Mumbai">Mumbai</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Depth:</span>
            <div className="w-20">
              <Slider
                value={depthLevel}
                onValueChange={setDepthLevel}
                max={5}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
            <span className="text-sm text-muted-foreground">{depthLevel[0]}</span>
          </div>

          <div className="flex gap-1">
            <Toggle pressed={showPeers} onPressedChange={setShowPeers} size="sm">
              <Users className="h-4 w-4" />
            </Toggle>
            <Toggle pressed={showDottedLines} onPressedChange={setShowDottedLines} size="sm">
              <Building className="h-4 w-4" />
            </Toggle>
          </div>

          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={handleCenterOnMe}>
              <Target className="h-4 w-4 mr-1" />
              Center on Me
            </Button>
            <Button variant="outline" size="sm" onClick={handleFit}>
              <ZoomIn className="h-4 w-4 mr-1" />
              Fit
            </Button>
          </div>
        </div>
      </div>

      {/* React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        className="bg-background"
        minZoom={0.2}
        maxZoom={2}
      >
        <Controls position="bottom-left" />
        <MiniMap
          position="bottom-right"
          nodeColor="#64748b"
          maskColor="rgba(0, 0, 0, 0.2)"
        />
        <Background />
      </ReactFlow>

      {/* Profile Drawer */}
      <Sheet open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Employee Profile</SheetTitle>
          </SheetHeader>
          {selectedEmployee && (
            <div className="mt-6 space-y-4">
              <div className="text-center">
                <Avatar className="h-20 w-20 mx-auto mb-4">
                  <AvatarImage src={selectedEmployee.avatar_url} />
                  <AvatarFallback>
                    {selectedEmployee.display_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-medium">{selectedEmployee.display_name}</h3>
                <p className="text-muted-foreground">{selectedEmployee.title}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Department:</span>
                  <Badge variant="outline">{selectedEmployee.dept}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Location:</span>
                  <span className="text-sm text-muted-foreground">
                    {[selectedEmployee.city, selectedEmployee.country].filter(Boolean).join(', ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Direct Reports:</span>
                  <span className="text-sm text-muted-foreground">
                    {selectedEmployee.direct_reports_count}
                  </span>
                </div>
              </div>

              <Button className="w-full">
                View Full Profile
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function OrgStructureSkeleton() {
  return (
    <div className="h-[800px] relative">
      <div className="absolute top-4 left-4 right-4 z-10 bg-background border rounded-lg p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-20" />
          <div className="flex gap-1">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
          </div>
          <div className="flex gap-1">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-16" />
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Skeleton className="h-8 w-48 mx-auto mb-4" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
      </div>
    </div>
  );
}