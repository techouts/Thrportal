import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { 
  Plus, 
  Search, 
  Settings,
  Users,
  CheckSquare,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Calendar,
  Download
} from 'lucide-react'
import { mockProjects, mockClients } from '@/mocks/projectData'

export function ProjectProjects() {
  const [searchQuery, setSearchQuery] = useState('')
  const [includeShadow, setIncludeShadow] = useState(false)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  const projects = mockProjects.filter(p => p.id !== 'bench') // Exclude bench project
  const clients = mockClients

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.client_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success'
      case 'completed': return 'bg-primary'
      case 'on_hold': return 'bg-warning'
      case 'cancelled': return 'bg-destructive'
      default: return 'bg-muted'
    }
  }

  const getBillingTypeColor = (type: string) => {
    switch (type) {
      case 'TM': return 'bg-blue-100 text-blue-800'
      case 'FIXED': return 'bg-green-100 text-green-800'
      case 'MILESTONE': return 'bg-purple-100 text-purple-800'
      case 'RETAINER': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Mock chart data
  const marginData = projects.map(p => ({
    name: p.code,
    planned: p.margin ? p.margin * 100 : 0,
    actual: p.margin ? (p.margin * 100) - 5 + Math.random() * 10 : 0
  }))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">Manage project lifecycle and delivery</p>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="include-shadow"
            checked={includeShadow}
            onCheckedChange={setIncludeShadow}
          />
          <Label htmlFor="include-shadow">Include Shadow</Label>
        </div>
      </div>

      <Tabs defaultValue="manage" className="space-y-6">
        <TabsList>
          <TabsTrigger value="manage">Manage</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-6">
          {/* Search and Actions */}
          <div className="flex justify-between items-center">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>

          {/* Projects Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>PM</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Billing</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead>Margin</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-muted-foreground">{project.code}</div>
                      </div>
                    </TableCell>
                    <TableCell>{project.client_name}</TableCell>
                    <TableCell>{project.pm_name}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getBillingTypeColor(project.billing_type)}>
                        {project.billing_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(project.start_date).toLocaleDateString()}</div>
                        {project.end_date && (
                          <div className="text-muted-foreground">
                            - {new Date(project.end_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {project.margin ? `${(project.margin * 100).toFixed(1)}%` : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="w-[600px] sm:w-[700px]">
                          <SheetHeader>
                            <SheetTitle>Project Setup: {project.name}</SheetTitle>
                            <SheetDescription>
                              Configure billing, team, and tasks for this project
                            </SheetDescription>
                          </SheetHeader>
                          
                          <Tabs defaultValue="billing" className="mt-6">
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="billing">
                                <DollarSign className="h-4 w-4 mr-2" />
                                Billing
                              </TabsTrigger>
                              <TabsTrigger value="team">
                                <Users className="h-4 w-4 mr-2" />
                                Team
                              </TabsTrigger>
                              <TabsTrigger value="tasks">
                                <CheckSquare className="h-4 w-4 mr-2" />
                                Tasks
                              </TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="billing" className="space-y-4 mt-4">
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Billing Type</Label>
                                    <Select defaultValue={project.billing_type}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="TM">Time & Materials</SelectItem>
                                        <SelectItem value="FIXED">Fixed Price</SelectItem>
                                        <SelectItem value="MILESTONE">Milestone</SelectItem>
                                        <SelectItem value="RETAINER">Retainer</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Budget</Label>
                                    <Input 
                                      type="number" 
                                      defaultValue={project.budget} 
                                      placeholder="0"
                                    />
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-2">
                                    <Switch defaultChecked={project.allow_non_billable} />
                                    <Label>Allow Non-billable</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Switch defaultChecked={project.allow_expenses} />
                                    <Label>Allow Expenses</Label>
                                  </div>
                                </div>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="team" className="space-y-4 mt-4">
                              <div className="space-y-4">
                                <Button variant="outline" className="w-full">
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Team Member
                                </Button>
                                <div className="text-sm text-muted-foreground">
                                  Team allocation management will be displayed here
                                </div>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="tasks" className="space-y-4 mt-4">
                              <div className="space-y-4">
                                <div className="flex space-x-2">
                                  <Button variant="outline" size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Task
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    Import Template
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Gantt View
                                  </Button>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Task management interface will be displayed here
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </SheetContent>
                      </Sheet>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          {/* Report Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {projects.filter(p => p.status === 'active').length}
                </div>
                <p className="text-xs text-muted-foreground">Currently running</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${projects.reduce((sum, p) => sum + (p.budget || 0), 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {includeShadow ? 'Shadow included' : 'Core only'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Margin</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">
                  {(projects.reduce((sum, p) => sum + (p.margin || 0), 0) / projects.length * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">Across all projects</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">At Risk</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">2</div>
                <p className="text-xs text-muted-foreground">Projects need attention</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Planned vs Actual Margin
                  {includeShadow && <Badge variant="secondary">Shadow Included</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={marginData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, '']} />
                    <Bar dataKey="planned" fill="hsl(var(--primary))" name="Planned" />
                    <Bar dataKey="actual" fill="hsl(var(--success))" name="Actual" />
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
                    Project List (CSV)
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Financial Report (XLSX)
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Margin Analysis (PDF)
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