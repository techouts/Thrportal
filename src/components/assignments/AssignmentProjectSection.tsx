import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Plus, Search, Edit, Trash2, Users, DollarSign, Clock, Target } from 'lucide-react';
import { assignmentService } from '@/services/assignmentService';
import { ScorecardPanel } from '@/components/assignments/ScorecardPanel';
import { useToast } from '@/hooks/use-toast';

interface ProjectAllocation {
  id: string;
  employeeName: string;
  role: string;
  allocationPct: number;
  startDate: string;
  endDate: string;
  type: 'Active' | 'Shadow';
  utilizationPct: number;
  skills: string[];
  avatar?: string;
}

export function AssignmentProjectSection() {
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAllocation, setEditingAllocation] = useState<string | null>(null);

  // Mock data - replace with real service calls
  const allocations: ProjectAllocation[] = [
    {
      id: '1',
      employeeName: 'Sarah Chen',
      role: 'Frontend Developer',
      allocationPct: 100,
      startDate: '2024-01-01',
      endDate: '2024-06-30',
      type: 'Active',
      utilizationPct: 95,
      skills: ['React', 'TypeScript', 'UI/UX']
    },
    {
      id: '2',
      employeeName: 'Mike Johnson',
      role: 'Backend Developer',
      allocationPct: 75,
      startDate: '2024-02-01',
      endDate: '2024-08-31',
      type: 'Active',
      utilizationPct: 80,
      skills: ['Node.js', 'PostgreSQL', 'Docker']
    },
    {
      id: '3',
      employeeName: 'Emma Davis',
      role: 'QA Engineer',
      allocationPct: 50,
      startDate: '2024-03-01',
      endDate: '2024-09-30',
      type: 'Shadow',
      utilizationPct: 45,
      skills: ['Automation', 'Testing', 'Cypress']
    }
  ];

  const filteredAllocations = useMemo(() => {
    return allocations.filter(allocation => {
      const matchesSearch = searchTerm === '' || 
        allocation.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        allocation.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = selectedRole === 'all' || allocation.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [allocations, searchTerm, selectedRole]);

  const scorecardData = useMemo(() => {
    const totalEmployees = allocations.length;
    const shadowResources = allocations.filter(a => a.type === 'Shadow').length;
    const underAllocated = allocations.filter(a => a.allocationPct < 50).length;
    const overAllocated = allocations.filter(a => a.allocationPct > 100).length;
    const avgUtilization = allocations.reduce((sum, a) => sum + a.utilizationPct, 0) / totalEmployees;
    
    return {
      totalEmployees,
      shadowResources,
      shadowPct: (shadowResources / totalEmployees) * 100,
      underAllocated,
      overAllocated,
      benchEligibleIn2Weeks: 2,
      monthlyCost: 145000,
      plannedHours: 1200,
      actualHours: 1150,
      avgUtilization
    };
  }, [allocations]);

  const handleAllocationChange = (id: string, newValue: number[]) => {
    toast({
      title: "Allocation Updated",
      description: `Updated allocation to ${newValue[0]}%`,
    });
  };

  const handleAddResource = () => {
    toast({
      title: "Add Resource",
      description: "Resource search dialog would open here",
    });
  };

  return (
    <div className="grid grid-cols-4 gap-6 h-full">
      {/* Main Content - 3 columns */}
      <div className="col-span-3 space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tech-corp">Tech Corp</SelectItem>
                  <SelectItem value="startup-inc">Startup Inc</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="acc-1">Account 1</SelectItem>
                  <SelectItem value="acc-2">Account 2</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="proj-1">E-commerce Platform</SelectItem>
                  <SelectItem value="proj-2">Mobile App</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="Frontend Developer">Frontend Developer</SelectItem>
                  <SelectItem value="Backend Developer">Backend Developer</SelectItem>
                  <SelectItem value="QA Engineer">QA Engineer</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddResource} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Resource
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Allocations Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Project Allocations
              <Badge variant="secondary">{filteredAllocations.length} resources</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAllocations.map((allocation) => (
                <div key={allocation.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{allocation.employeeName}</div>
                    <div className="text-sm text-muted-foreground">{allocation.role}</div>
                    <div className="flex gap-2 mt-2">
                      {allocation.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="w-32">
                    <div className="text-sm font-medium mb-2">Allocation</div>
                    {editingAllocation === allocation.id ? (
                      <Slider
                        value={[allocation.allocationPct]}
                        onValueChange={(value) => handleAllocationChange(allocation.id, value)}
                        max={150}
                        step={5}
                        className="w-full"
                      />
                    ) : (
                      <Progress value={allocation.allocationPct} className="w-full" />
                    )}
                    <div className="text-xs text-center mt-1">{allocation.allocationPct}%</div>
                  </div>

                  <div className="w-24">
                    <div className="text-sm font-medium mb-2">Utilization</div>
                    <Progress value={allocation.utilizationPct} className="w-full" />
                    <div className="text-xs text-center mt-1">{allocation.utilizationPct}%</div>
                  </div>

                  <div className="w-32">
                    <Badge variant={allocation.type === 'Active' ? 'default' : 'secondary'}>
                      {allocation.type}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      {allocation.startDate} - {allocation.endDate}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingAllocation(
                        editingAllocation === allocation.id ? null : allocation.id
                      )}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scorecard Panel - 1 column */}
      <div className="col-span-1">
        <ScorecardPanel
          type="project"
          data={scorecardData}
        />
      </div>
    </div>
  );
}