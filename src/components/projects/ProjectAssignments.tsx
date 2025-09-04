import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { 
  MoreHorizontal,
  ArrowRight,
  CheckCircle,
  Clock,
  UserX,
  Edit,
  TrendingUp,
  Target,
  Calendar,
  DollarSign,
  Download
} from 'lucide-react'
import { mockAllocations, mockBenchEmployees, mockShadowAllocations } from '@/mocks/projectData'

export function ProjectAssignments() {
  const [selectedAllocation, setSelectedAllocation] = useState<string | null>(null)

  const allocations = mockAllocations
  const benchEmployees = mockBenchEmployees
  const shadowAllocations = mockShadowAllocations

  const benchAllocations = allocations.filter(a => a.type === 'BENCH')
  const shadowAllocs = allocations.filter(a => a.type === 'SHADOW')
  const activeAllocations = allocations.filter(a => a.type === 'ACTIVE')

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BENCH': return 'bg-muted text-muted-foreground'
      case 'SHADOW': return 'bg-warning text-warning-foreground'
      case 'ACTIVE': return 'bg-success text-success-foreground'
      default: return 'bg-muted'
    }
  }

  // Mock utilization data
  const utilizationData = [
    { period: 'Jan', core: 75.2, effective: 81.5 },
    { period: 'Feb', core: 78.1, effective: 84.2 },
    { period: 'Mar', core: 82.3, effective: 87.1 }
  ]

  const AllocationCard = ({ allocation, type }: { allocation: any, type: string }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{getInitials(allocation.employee_name || allocation.name)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{allocation.employee_name || allocation.name}</div>
              <div className="text-sm text-muted-foreground">{allocation.role_name || allocation.role}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm font-medium">{allocation.allocation_pct}%</div>
              <div className="text-xs text-muted-foreground">
                {allocation.project_name || allocation.target_project || 'Available'}
              </div>
            </div>
            
            <Badge className={getTypeColor(type)}>
              {type}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {type === 'BENCH' && (
                  <>
                    <DropdownMenuItem>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Move to Shadow
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Allocate to Project
                    </DropdownMenuItem>
                  </>
                )}
                {type === 'SHADOW' && (
                  <>
                    <DropdownMenuItem>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm to Active
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <UserX className="h-4 w-4 mr-2" />
                      Release
                    </DropdownMenuItem>
                  </>
                )}
                {type === 'ACTIVE' && (
                  <>
                    <DropdownMenuItem>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Redeploy
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <UserX className="h-4 w-4 mr-2" />
                      Unallocate
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Allocation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {allocation.start_date && (
          <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
            <span>Start: {new Date(allocation.start_date).toLocaleDateString()}</span>
            {allocation.end_date && (
              <span>End: {new Date(allocation.end_date).toLocaleDateString()}</span>
            )}
            {allocation.daily_cost && (
              <span>${allocation.daily_cost}/day</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Assignments</h2>
          <p className="text-muted-foreground">Manage resource allocation across projects</p>
        </div>
      </div>

      <Tabs defaultValue="manage" className="space-y-6">
        <TabsList>
          <TabsTrigger value="manage">Manage</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-6">
          {/* Kanban View */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Bench Column */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Bench ({benchEmployees.length})
                  </span>
                  <Badge variant="outline">${benchEmployees.reduce((sum, emp) => sum + emp.daily_cost, 0)}/day</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {benchEmployees.map((employee) => (
                    <Card key={employee.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={employee.avatar} />
                              <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{employee.name}</div>
                              <div className="text-sm text-muted-foreground">{employee.role}</div>
                            </div>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <ArrowRight className="h-4 w-4 mr-2" />
                                Move to Shadow
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Allocate to Project
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        <div className="mt-3 space-y-2">
                          <div className="flex flex-wrap gap-1">
                            {employee.skills.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Available: {new Date(employee.available_from).toLocaleDateString()}</span>
                            <span>${employee.daily_cost}/day</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {employee.bench_days} days on bench
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shadow Column */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <ArrowRight className="h-5 w-5 mr-2" />
                    Shadow ({shadowAllocs.length})
                  </span>
                  <Badge variant="outline" className="bg-warning text-warning-foreground">
                    KT/Forecast
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shadowAllocs.map((allocation) => (
                    <AllocationCard 
                      key={allocation.id} 
                      allocation={allocation} 
                      type="SHADOW" 
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Active Column */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Active ({activeAllocations.length})
                  </span>
                  <Badge variant="outline" className="bg-success text-success-foreground">
                    Contracted
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeAllocations.map((allocation) => (
                    <AllocationCard 
                      key={allocation.id} 
                      allocation={allocation} 
                      type="ACTIVE" 
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Allocation Rules */}
          <Card>
            <CardHeader>
              <CardTitle>Allocation Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-muted rounded-full"></div>
                  <span><strong>Bench:</strong> Unallocated employees (auto-assigned)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <span><strong>Shadow:</strong> Knowledge transfer/forecast (timesheet eligible)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span><strong>Active:</strong> Contracted allocation (timesheet eligible)</span>
                </div>
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <strong>Validation:</strong> Total daily allocation ≤ 100% per employee
                </div>
              </div>
            </CardContent>
          </Card>
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
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
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
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}