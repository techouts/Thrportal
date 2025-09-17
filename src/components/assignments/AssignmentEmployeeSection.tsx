import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Plus, Search, Edit, Trash2, User, Calendar, BarChart3 } from 'lucide-react';
import { ScorecardPanel } from '@/components/assignments/ScorecardPanel';
import { useToast } from '@/hooks/use-toast';

interface EmployeeAllocation {
  id: string;
  projectCode: string;
  projectName: string;
  allocationPct: number;
  startDate: string;
  endDate: string;
  type: 'Active' | 'Shadow';
  client: string;
}

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  skills: string[];
  totalUtilization: number;
  allocations: EmployeeAllocation[];
}

export function AssignmentEmployeeSection() {
  const { toast } = useToast();
  const [selectedEmployee, setSelectedEmployee] = useState<string>('sarah-chen');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with real service calls
  const employees: Employee[] = [
    {
      id: 'sarah-chen',
      name: 'Sarah Chen',
      role: 'Frontend Developer',
      department: 'Engineering',
      skills: ['React', 'TypeScript', 'UI/UX', 'Node.js'],
      totalUtilization: 95,
      allocations: [
        {
          id: '1',
          projectCode: 'TECH-001',
          projectName: 'E-commerce Platform',
          allocationPct: 70,
          startDate: '2024-01-01',
          endDate: '2024-06-30',
          type: 'Active',
          client: 'Tech Corp'
        },
        {
          id: '2',
          projectCode: 'START-002',
          projectName: 'Mobile App',
          allocationPct: 25,
          startDate: '2024-03-01',
          endDate: '2024-08-31',
          type: 'Shadow',
          client: 'Startup Inc'
        }
      ]
    },
    {
      id: 'mike-johnson',
      name: 'Mike Johnson',
      role: 'Backend Developer',
      department: 'Engineering',
      skills: ['Node.js', 'PostgreSQL', 'Docker', 'AWS'],
      totalUtilization: 80,
      allocations: [
        {
          id: '3',
          projectCode: 'TECH-001',
          projectName: 'E-commerce Platform',
          allocationPct: 80,
          startDate: '2024-02-01',
          endDate: '2024-08-31',
          type: 'Active',
          client: 'Tech Corp'
        }
      ]
    }
  ];

  const selectedEmployeeData = employees.find(emp => emp.id === selectedEmployee);

  const scorecardData = useMemo(() => {
    if (!selectedEmployeeData) return {};
    
    const totalAllocations = selectedEmployeeData.allocations.length;
    const shadowAllocations = selectedEmployeeData.allocations.filter(a => a.type === 'Shadow').length;
    const isDedicated = selectedEmployeeData.totalUtilization >= 70;
    const isOverallocated = selectedEmployeeData.totalUtilization > 100;
    
    return {
      totalAllocations,
      currentUtilization: selectedEmployeeData.totalUtilization,
      shadowAllocations,
      isDedicated,
      isOverallocated,
      benchDays: 0,
      monthlyCost: 12000,
      topSkills: selectedEmployeeData.skills.slice(0, 3)
    };
  }, [selectedEmployeeData]);

  const handleAllocationChange = (allocationId: string, newValue: number[]) => {
    toast({
      title: "Allocation Updated",
      description: `Updated allocation to ${newValue[0]}%`,
    });
  };

  const handleAddProject = () => {
    toast({
      title: "Add Project",
      description: "Project selection dialog would open here",
    });
  };

  const handleReleaseToBench = () => {
    toast({
      title: "Release to Bench",
      description: "Employee will be moved to bench pool",
    });
  };

  return (
    <div className="grid grid-cols-4 gap-6 h-full">
      {/* Main Content - 3 columns */}
      <div className="col-span-3 space-y-6">
        {/* Employee Search & Filters */}
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
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name} - {emp.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Roles</SelectItem>
                  <SelectItem value="Frontend Developer">Frontend Developer</SelectItem>
                  <SelectItem value="Backend Developer">Backend Developer</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedDept} onValueChange={setSelectedDept}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Departments</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {selectedEmployeeData && (
          <>
            {/* Employee Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-xl font-semibold">{selectedEmployeeData.name}</div>
                      <div className="text-muted-foreground">{selectedEmployeeData.role} • {selectedEmployeeData.department}</div>
                    </div>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <Button onClick={handleAddProject} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Project
                    </Button>
                    <Button variant="outline" onClick={handleReleaseToBench}>
                      Release to Bench
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="flex-1">
                    <div className="text-sm font-medium mb-2">Skills</div>
                    <div className="flex gap-2 flex-wrap">
                      {selectedEmployeeData.skills.map((skill) => (
                        <Badge key={skill} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="w-48">
                    <div className="text-sm font-medium mb-2">Total Utilization</div>
                    <Progress value={selectedEmployeeData.totalUtilization} className="w-full" />
                    <div className="text-sm text-center mt-1">{selectedEmployeeData.totalUtilization}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Allocations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Project Allocations
                  <Badge variant="secondary">{selectedEmployeeData.allocations.length} projects</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedEmployeeData.allocations.map((allocation) => (
                    <div key={allocation.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{allocation.projectName}</div>
                        <div className="text-sm text-muted-foreground">
                          {allocation.projectCode} • {allocation.client}
                        </div>
                      </div>
                      
                      <div className="w-32">
                        <div className="text-sm font-medium mb-2">Allocation</div>
                        <Progress value={allocation.allocationPct} className="w-full" />
                        <div className="text-xs text-center mt-1">{allocation.allocationPct}%</div>
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
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Calendar className="h-4 w-4" />
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
          </>
        )}
      </div>

      {/* Scorecard Panel - 1 column */}
      <div className="col-span-1">
        <ScorecardPanel
          type="employee"
          data={scorecardData}
        />
      </div>
    </div>
  );
}