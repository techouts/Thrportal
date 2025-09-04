import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { 
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  UserPlus,
  Download,
  TrendingUp,
  Target,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { mockProjects, mockAllocations, mockRoles } from '@/mocks/projectData'
import type { Project, Allocation, RoleCatalog } from '@/types/projects'

// Mock employee data for the assignment module
const mockEmployees = [
  { id: 'emp-1', name: 'John Smith', role_id: '1', role_name: 'Senior Developer', dept: 'Engineering', location: 'New York', skills: ['React', 'TypeScript', 'Node.js'], status: 'active' },
  { id: 'emp-2', name: 'Jane Doe', role_id: '5', role_name: 'UI/UX Designer', dept: 'Design', location: 'San Francisco', skills: ['Figma', 'Design Systems', 'User Research'], status: 'active' },
  { id: 'emp-3', name: 'Bob Johnson', role_id: '2', role_name: 'Junior Developer', dept: 'Engineering', location: 'Austin', skills: ['JavaScript', 'React', 'CSS'], status: 'active' },
  { id: 'emp-4', name: 'Alice Cooper', role_id: '4', role_name: 'Business Analyst', dept: 'Business', location: 'Boston', skills: ['Requirements', 'Process Design', 'Stakeholder Management'], status: 'active' },
  { id: 'emp-5', name: 'Charlie Wilson', role_id: '3', role_name: 'Project Manager', dept: 'Management', location: 'Seattle', skills: ['Agile', 'Leadership', 'Planning'], status: 'active' }
]

interface ProjectAssignment {
  project: Project
  allocations: Allocation[]
  isExpanded: boolean
}

interface EmployeeAssignment {
  employee: typeof mockEmployees[0]
  allocations: Allocation[]
  isExpanded: boolean
  totalAllocation: number
  monthlyCost: number
}

export function ProjectAssignments() {
  const [activeTab, setActiveTab] = useState('manage')
  const [manageSubtab, setManageSubtab] = useState('project')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    project: 'all',
    client: 'all',
    pm: 'all',
    status: 'all',
    role: 'all',
    dept: 'all',
    location: 'all'
  })

  const projects = mockProjects.filter(p => p.id !== 'bench')
  const allocations = mockAllocations
  const roles = mockRoles
  const employees = mockEmployees

  // Get role rates
  const getRoleRate = (roleId: string) => {
    const role = roles.find(r => r.id === roleId)
    return role?.suggested_cost_rate || 75
  }

  // Project view data
  const projectAssignments: ProjectAssignment[] = projects.map(project => {
    const projectAllocations = allocations.filter(a => a.project_id === project.id)
    return {
      project,
      allocations: projectAllocations,
      isExpanded: expandedRows.has(`project-${project.id}`)
    }
  }).filter(pa => {
    if (!searchTerm) return true
    return pa.project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           pa.project.code.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Resource view data
  const employeeAssignments: EmployeeAssignment[] = employees.map(employee => {
    const empAllocations = allocations.filter(a => a.employee_id === employee.id)
    const totalAllocation = empAllocations.reduce((sum, a) => sum + a.allocation_pct, 0)
    const roleRate = getRoleRate(employee.role_id)
    const monthlyCost = (roleRate * totalAllocation / 100) * 22 // 22 working days per month
    
    return {
      employee,
      allocations: empAllocations,
      isExpanded: expandedRows.has(`employee-${employee.id}`),
      totalAllocation,
      monthlyCost
    }
  }).filter(ea => {
    if (!searchTerm) return true
    return ea.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           ea.employee.role_name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 80 && percentage <= 100) return 'text-success'
    if (percentage >= 50 && percentage < 80) return 'text-warning'
    return 'text-destructive'
  }

  const getUtilizationBg = (percentage: number) => {
    if (percentage >= 80 && percentage <= 100) return 'bg-success'
    if (percentage >= 50 && percentage < 80) return 'bg-warning'
    return 'bg-destructive'
  }

  // Calculate side panel data
  const calculateProjectCost = (projectId: string) => {
    const projectAllocations = allocations.filter(a => a.project_id === projectId)
    const activeCost = projectAllocations
      .filter(a => a.type === 'ACTIVE')
      .reduce((sum, a) => sum + (a.cost_rate * a.allocation_pct / 100 * 22), 0)
    const shadowCost = projectAllocations
      .filter(a => a.type === 'SHADOW')
      .reduce((sum, a) => sum + (a.cost_rate * a.allocation_pct / 100 * 22), 0)
    
    return { activeCost, shadowCost, totalCost: activeCost + shadowCost }
  }

  // Reports data
  const utilizationData = [
    { period: 'Jan', core: 75.2, effective: 81.5 },
    { period: 'Feb', core: 78.1, effective: 84.2 },
    { period: 'Mar', core: 82.3, effective: 87.1 }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Assignments</h2>
          <p className="text-muted-foreground">Manage resource allocation across projects</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="manage">Manage</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-6">
          {/* Sub-tabs for Manage */}
          <Tabs value={manageSubtab} onValueChange={setManageSubtab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="project">Project</TabsTrigger>
              <TabsTrigger value="resource">Resource</TabsTrigger>
            </TabsList>

            <TabsContent value="project" className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Main Content */}
                <div className="flex-1 space-y-4">
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Projects Table */}
                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead></TableHead>
                          <TableHead>Project Code</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>PM</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead># Employees</TableHead>
                          <TableHead>Utilization</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {projectAssignments.map(({ project, allocations, isExpanded }) => (
                          <>
                            <TableRow key={project.id} className="cursor-pointer" onClick={() => setSelectedProject(project.id)}>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleExpanded(`project-${project.id}`)
                                  }}
                                >
                                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </Button>
                              </TableCell>
                              <TableCell className="font-medium">{project.code}</TableCell>
                              <TableCell>{project.name}</TableCell>
                              <TableCell>{project.client_name}</TableCell>
                              <TableCell>{project.pm_name}</TableCell>
                              <TableCell>
                                {new Date(project.start_date).toLocaleDateString()} - {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Ongoing'}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">{allocations.length}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <div className="w-20 bg-muted rounded-full h-2">
                                    <div 
                                      className="bg-primary h-2 rounded-full" 
                                      style={{ width: `${Math.min(85, 100)}%` }}
                                    />
                                  </div>
                                  <span className="text-sm">85%</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <UserPlus className="h-4 w-4 mr-2" />
                                      Add Employee
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Add Employee to {project.name}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="employee">Select Employee</Label>
                                        <Select>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Choose employee..." />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {employees.map(emp => (
                                              <SelectItem key={emp.id} value={emp.id}>
                                                {emp.name} - {emp.role_name}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div>
                                        <Label htmlFor="allocation">Allocation %</Label>
                                        <Input id="allocation" type="number" defaultValue="100" min="0" max="100" />
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label htmlFor="start-date">Start Date</Label>
                                          <Input id="start-date" type="date" />
                                        </div>
                                        <div>
                                          <Label htmlFor="end-date">End Date</Label>
                                          <Input id="end-date" type="date" />
                                        </div>
                                      </div>
                                      <Button className="w-full">Add to Project</Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </TableCell>
                            </TableRow>
                            
                            {/* Expanded Allocations */}
                            {isExpanded && (
                              <TableRow>
                                <TableCell colSpan={9} className="bg-muted/50">
                                  <div className="p-4">
                                    <h4 className="font-medium mb-3">Team Allocations</h4>
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Employee</TableHead>
                                          <TableHead>Role</TableHead>
                                          <TableHead>Allocation %</TableHead>
                                          <TableHead>Duration</TableHead>
                                          <TableHead>Type</TableHead>
                                          <TableHead>Actions</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {allocations.map(allocation => (
                                          <TableRow key={allocation.id}>
                                            <TableCell className="flex items-center space-x-2">
                                              <Avatar className="h-6 w-6">
                                                <AvatarFallback>{allocation.employee_name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                              </Avatar>
                                              <span>{allocation.employee_name}</span>
                                            </TableCell>
                                            <TableCell>{allocation.role_name}</TableCell>
                                            <TableCell>
                                              <Input
                                                type="number"
                                                defaultValue={allocation.allocation_pct}
                                                className="w-20"
                                                min="0"
                                                max="100"
                                              />
                                            </TableCell>
                                            <TableCell>
                                              <div className="text-sm">
                                                {new Date(allocation.start_date).toLocaleDateString()}
                                                {allocation.end_date && ` - ${new Date(allocation.end_date).toLocaleDateString()}`}
                                              </div>
                                            </TableCell>
                                            <TableCell>
                                              <Badge variant={allocation.type === 'ACTIVE' ? 'default' : allocation.type === 'SHADOW' ? 'secondary' : 'outline'}>
                                                {allocation.type}
                                              </Badge>
                                            </TableCell>
                                            <TableCell>
                                              <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                  <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                  </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                  <DropdownMenuItem>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit
                                                  </DropdownMenuItem>
                                                  <DropdownMenuItem className="text-destructive">
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Remove
                                                  </DropdownMenuItem>
                                                </DropdownMenuContent>
                                              </DropdownMenu>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                </div>

                {/* Side Panel */}
                {selectedProject && (
                  <Card className="w-80">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <DollarSign className="h-5 w-5 mr-2" />
                        Monthly Budget
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {(() => {
                        const { activeCost, shadowCost, totalCost } = calculateProjectCost(selectedProject)
                        const selectedProjectData = projects.find(p => p.id === selectedProject)
                        const budget = selectedProjectData?.budget || 500000
                        const monthlyBudget = budget / 6 // Assuming 6 month project
                        
                        return (
                          <>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Active Cost</span>
                                <span className="font-medium">${activeCost.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Shadow Cost</span>
                                <span className="font-medium">${shadowCost.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between font-medium">
                                <span>Total Cost</span>
                                <span>${totalCost.toLocaleString()}</span>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Monthly Budget</span>
                                <span className="font-medium">${monthlyBudget.toLocaleString()}</span>
                              </div>
                              <Progress value={(totalCost / monthlyBudget) * 100} className="h-2" />
                              <div className="text-xs text-muted-foreground">
                                {Math.round((totalCost / monthlyBudget) * 100)}% of budget used
                              </div>
                            </div>

                            {totalCost > monthlyBudget && (
                              <div className="flex items-center space-x-2 text-destructive text-sm">
                                <AlertTriangle className="h-4 w-4" />
                                <span>Over budget by ${(totalCost - monthlyBudget).toLocaleString()}</span>
                              </div>
                            )}
                          </>
                        )
                      })()}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="resource" className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Main Content */}
                <div className="flex-1 space-y-4">
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={filters.role} onValueChange={(value) => setFilters({...filters, role: value})}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        {roles.map(role => (
                          <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filters.dept} onValueChange={(value) => setFilters({...filters, dept: value})}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Depts</SelectItem>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Management">Management</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Employees Table */}
                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead></TableHead>
                          <TableHead>Employee</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Current Projects</TableHead>
                          <TableHead>Allocation %</TableHead>
                          <TableHead>Utilization</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {employeeAssignments.map(({ employee, allocations, isExpanded, totalAllocation }) => {
                          const primaryAllocation = allocations[0]
                          const projectName = primaryAllocation?.project_name || 'Bench'
                          
                          return (
                            <>
                              <TableRow key={employee.id} className="cursor-pointer" onClick={() => setSelectedEmployee(employee.id)}>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleExpanded(`employee-${employee.id}`)
                                    }}
                                  >
                                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                  </Button>
                                </TableCell>
                                <TableCell className="flex items-center space-x-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{employee.name}</div>
                                    <div className="text-sm text-muted-foreground">{employee.dept}</div>
                                  </div>
                                </TableCell>
                                <TableCell>{employee.role_name}</TableCell>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{projectName}</div>
                                    {allocations.length > 1 && (
                                      <div className="text-sm text-muted-foreground">+{allocations.length - 1} more</div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <span className={getUtilizationColor(totalAllocation)}>{totalAllocation}%</span>
                                    {totalAllocation > 100 && <AlertTriangle className="h-4 w-4 text-destructive" />}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <div className="w-20 bg-muted rounded-full h-2">
                                      <div 
                                        className={`h-2 rounded-full ${getUtilizationBg(totalAllocation)}`}
                                        style={{ width: `${Math.min(totalAllocation, 100)}%` }}
                                      />
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={primaryAllocation?.type === 'ACTIVE' ? 'default' : primaryAllocation?.type === 'SHADOW' ? 'secondary' : 'outline'}>
                                    {primaryAllocation?.type || 'BENCH'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Assign
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Assign {employee.name} to Project</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div>
                                          <Label htmlFor="project">Select Project</Label>
                                          <Select>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Choose project..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {projects.map(project => (
                                                <SelectItem key={project.id} value={project.id}>
                                                  {project.code} - {project.name}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div>
                                          <Label htmlFor="allocation">Allocation %</Label>
                                          <Input id="allocation" type="number" defaultValue="100" min="0" max="100" />
                                        </div>
                                        <Button className="w-full">Assign to Project</Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </TableCell>
                              </TableRow>
                              
                              {/* Expanded Allocation History */}
                              {isExpanded && (
                                <TableRow>
                                  <TableCell colSpan={8} className="bg-muted/50">
                                    <div className="p-4">
                                      <h4 className="font-medium mb-3">Allocation History</h4>
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Project Code</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Allocation %</TableHead>
                                            <TableHead>Duration</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Actions</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {allocations.map(allocation => {
                                            const project = projects.find(p => p.id === allocation.project_id)
                                            return (
                                              <TableRow key={allocation.id}>
                                                <TableCell>{project?.code || 'BENCH'}</TableCell>
                                                <TableCell>{allocation.project_name}</TableCell>
                                                <TableCell>
                                                  <Input
                                                    type="number"
                                                    defaultValue={allocation.allocation_pct}
                                                    className="w-20"
                                                    min="0"
                                                    max="100"
                                                  />
                                                </TableCell>
                                                <TableCell>
                                                  <div className="text-sm">
                                                    {new Date(allocation.start_date).toLocaleDateString()}
                                                    {allocation.end_date && ` - ${new Date(allocation.end_date).toLocaleDateString()}`}
                                                  </div>
                                                </TableCell>
                                                <TableCell>
                                                  <Badge variant={allocation.type === 'ACTIVE' ? 'default' : allocation.type === 'SHADOW' ? 'secondary' : 'outline'}>
                                                    {allocation.type}
                                                  </Badge>
                                                </TableCell>
                                                <TableCell>
                                                  <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                      <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                      </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                      <DropdownMenuItem>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit
                                                      </DropdownMenuItem>
                                                      <DropdownMenuItem>
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Reallocate
                                                      </DropdownMenuItem>
                                                      <DropdownMenuItem className="text-destructive">
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Remove
                                                      </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                  </DropdownMenu>
                                                </TableCell>
                                              </TableRow>
                                            )
                                          })}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </Card>
                </div>

                {/* Employee Side Panel */}
                {selectedEmployee && (
                  <Card className="w-80">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Target className="h-5 w-5 mr-2" />
                        Employee Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {(() => {
                        const empData = employeeAssignments.find(ea => ea.employee.id === selectedEmployee)
                        if (!empData) return null
                        
                        const { employee, totalAllocation, monthlyCost } = empData
                        const benchDays = Math.floor(Math.random() * 30) // Mock bench days
                        
                        return (
                          <>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{employee.name}</div>
                                <div className="text-sm text-muted-foreground">{employee.role_name}</div>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm">Utilization</span>
                                  <span className={`text-sm font-medium ${getUtilizationColor(totalAllocation)}`}>
                                    {totalAllocation}%
                                  </span>
                                </div>
                                <Progress 
                                  value={Math.min(totalAllocation, 100)} 
                                  className="h-2"
                                />
                                {totalAllocation > 100 && (
                                  <div className="flex items-center space-x-1 mt-1 text-destructive text-xs">
                                    <AlertTriangle className="h-3 w-3" />
                                    <span>Overallocated by {totalAllocation - 100}%</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Monthly Cost</span>
                                  <span className="font-medium">${monthlyCost.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Bench Days</span>
                                  <span className="font-medium">{benchDays}</span>
                                </div>
                              </div>
                              
                              <div className="pt-2 border-t">
                                <div className="text-sm font-medium mb-2">Skills</div>
                                <div className="flex flex-wrap gap-1">
                                  {employee.skills.map(skill => (
                                    <Badge key={skill} variant="secondary" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </>
                        )
                      })()}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          {/* Report Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Core Utilization</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">78.5%</div>
                <p className="text-xs text-muted-foreground">Excludes Shadow & Bench</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Effective Utilization</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">84.2%</div>
                <p className="text-xs text-muted-foreground">Includes Shadow</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Bench Cycle</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8.5</div>
                <p className="text-xs text-muted-foreground">Days average</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Shadow Pipeline</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">76%</div>
                <p className="text-xs text-muted-foreground">Coverage next 4 weeks</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Core vs Effective Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={utilizationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, '']} />
                    <Bar dataKey="core" fill="hsl(var(--primary))" name="Core Util%" />
                    <Bar dataKey="effective" fill="hsl(var(--success))" name="Effective Util%" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Allocation Report (CSV)
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Utilization Analysis (XLSX)
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Bench Cost Report (PDF)
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground mt-4 p-2 bg-muted rounded">
                  <strong>Note:</strong> Shadow allocations excluded from financial reports by default
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}