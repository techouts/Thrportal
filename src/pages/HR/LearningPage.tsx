import React, { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { DataTable } from '@/components/shared/DataTable'
import { KPICard } from '@/components/shared/KPICard'
import { ChartKit } from '@/components/shared/ChartKit'
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Target,
  Settings,
  BarChart3,
  Award,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Download,
  Upload
} from 'lucide-react'

const HRLearningPage = () => {
  const [activeTab, setActiveTab] = useState('catalog')

  const hrMetrics = [
    {
      title: 'Total Learners',
      value: '1,247',
      description: 'Active in platform',
      icon: Users,
      trend: { direction: 'up' as const, value: '12%', label: 'vs last month' }
    },
    {
      title: 'Course Completions',
      value: '2,156',
      description: 'This month',
      icon: CheckCircle,
      trend: { direction: 'up' as const, value: '8%', label: 'vs last month' }
    },
    {
      title: 'Learning Budget Used',
      value: '68%',
      description: '$486K of $715K',
      icon: DollarSign,
      trend: { direction: 'stable' as const, value: '2%', label: 'vs plan' }
    },
    {
      title: 'Skill Coverage',
      value: '84%',
      description: 'Critical skills',
      icon: Target,
      trend: { direction: 'up' as const, value: '5%', label: 'vs last quarter' }
    }
  ]

  const catalogData = [
    {
      id: '1',
      title: 'React Advanced Patterns',
      category: 'Technical',
      level: 'Advanced',
      duration: '35 hours',
      cost: 299,
      enrollments: 156,
      completion_rate: 87,
      rating: 4.8,
      status: 'active'
    },
    {
      id: '2',
      title: 'Leadership Fundamentals',
      category: 'Soft Skills',
      level: 'Intermediate',
      duration: '25 hours',
      cost: 399,
      enrollments: 234,
      completion_rate: 92,
      rating: 4.9,
      status: 'active'
    },
    {
      id: '3',
      title: 'Data Science Bootcamp',
      category: 'Technical',
      level: 'Beginner',
      duration: '60 hours',
      cost: 599,
      enrollments: 89,
      completion_rate: 76,
      rating: 4.7,
      status: 'draft'
    }
  ]

  const learningPaths = [
    {
      id: '1',
      title: 'Frontend Developer Journey',
      description: 'Complete path from beginner to advanced frontend development',
      courses: 8,
      duration: '240 hours',
      enrolled: 145,
      completion_rate: 73,
      mandatory: false
    },
    {
      id: '2',
      title: 'Leadership Development Program',
      description: 'Comprehensive leadership training for managers',
      courses: 6,
      duration: '180 hours',
      enrolled: 67,
      completion_rate: 89,
      mandatory: true
    },
    {
      id: '3',
      title: 'AI & Machine Learning Fundamentals',
      description: 'Introduction to AI and ML concepts and applications',
      courses: 12,
      duration: '320 hours',
      enrolled: 98,
      completion_rate: 64,
      mandatory: false
    }
  ]

  const budgetData = [
    {
      department: 'Engineering',
      allocated: 150000,
      spent: 89500,
      remaining: 60500,
      utilization: 60,
      employees: 125
    },
    {
      department: 'Sales',
      allocated: 75000,
      spent: 52300,
      remaining: 22700,
      utilization: 70,
      employees: 85
    },
    {
      department: 'Marketing',
      allocated: 60000,
      spent: 38900,
      remaining: 21100,
      utilization: 65,
      employees: 45
    },
    {
      department: 'HR',
      allocated: 40000,
      spent: 28600,
      remaining: 11400,
      utilization: 72,
      employees: 25
    }
  ]

  const adoptionData = [
    { month: 'Jan', adoption: 65, completion: 78, hours: 2450 },
    { month: 'Feb', adoption: 68, completion: 82, hours: 2680 },
    { month: 'Mar', adoption: 72, completion: 85, hours: 2890 },
    { month: 'Apr', adoption: 75, completion: 88, hours: 3120 },
    { month: 'May', adoption: 78, completion: 89, hours: 3350 },
    { month: 'Jun', adoption: 82, completion: 91, hours: 3580 }
  ]

  const catalogColumns = [
    {
      accessorKey: 'title',
      header: 'Course Title',
      cell: ({ row }: any) => (
        <div>
          <p className="font-medium">{row.original.title}</p>
          <p className="text-sm text-muted-foreground">{row.original.level} • {row.original.duration}</p>
        </div>
      )
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }: any) => (
        <Badge variant="secondary">{row.original.category}</Badge>
      )
    },
    {
      accessorKey: 'enrollments',
      header: 'Enrollments',
    },
    {
      accessorKey: 'completion_rate',
      header: 'Completion Rate',
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-2">
          <span>{row.original.completion_rate}%</span>
          <Progress value={row.original.completion_rate} className="h-2 w-16" />
        </div>
      )
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-1">
          <span>⭐</span>
          <span>{row.original.rating}</span>
        </div>
      )
    },
    {
      accessorKey: 'cost',
      header: 'Cost',
      cell: ({ row }: any) => `$${row.original.cost}`
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => (
        <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'}>
          {row.original.status}
        </Badge>
      )
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline">
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  const budgetColumns = [
    {
      accessorKey: 'department',
      header: 'Department',
    },
    {
      accessorKey: 'employees',
      header: 'Employees',
    },
    {
      accessorKey: 'allocated',
      header: 'Allocated',
      cell: ({ row }: any) => `$${row.original.allocated.toLocaleString()}`
    },
    {
      accessorKey: 'spent',
      header: 'Spent',
      cell: ({ row }: any) => `$${row.original.spent.toLocaleString()}`
    },
    {
      accessorKey: 'remaining',
      header: 'Remaining',
      cell: ({ row }: any) => `$${row.original.remaining.toLocaleString()}`
    },
    {
      accessorKey: 'utilization',
      header: 'Utilization',
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-2">
          <span>{row.original.utilization}%</span>
          <Progress value={row.original.utilization} className="h-2 w-16" />
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning & Development Management"
        description="Manage learning catalog, paths, budgets, and analytics"
        icon={BookOpen}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="catalog">Catalog</TabsTrigger>
          <TabsTrigger value="paths">Paths & Journeys</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="analytics">Adoption Analytics</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Learning Catalog Management</h3>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import Courses
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {hrMetrics.map((metric, index) => (
              <KPICard key={index} {...metric} />
            ))}
          </div>

          {/* Catalog Table */}
          <Card>
            <CardHeader>
              <CardTitle>Course Catalog</CardTitle>
              <CardDescription>
                Manage all available courses and their performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={catalogData}
                columns={catalogColumns}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paths" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Learning Paths & Journeys</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Learning Path
            </Button>
          </div>

          <div className="grid gap-4">
            {learningPaths.map((path) => (
              <Card key={path.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-lg">{path.title}</h4>
                        {path.mandatory && (
                          <Badge variant="destructive">Mandatory</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mt-1">{path.description}</p>
                      
                      <div className="flex items-center space-x-6 mt-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{path.courses} courses</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{path.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{path.enrolled} enrolled</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-4 w-4" />
                          <span>{path.completion_rate}% completion</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Completion Rate</span>
                          <span className="text-sm font-medium">{path.completion_rate}%</span>
                        </div>
                        <Progress value={path.completion_rate} className="h-2" />
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <Button size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Users className="h-4 w-4 mr-2" />
                        Assign
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="budgets" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Learning Budget Management</h3>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Allocate Budget
              </Button>
            </div>
          </div>

          {/* Budget Overview Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartKit
              type="bar"
              title="Budget Utilization by Department"
              data={budgetData.map(d => ({ name: d.department, value: d.utilization }))}
              dataKey="value"
              xAxisKey="name"
              height={300}
              colors={['#8884d8']}
            />
            <ChartKit
              type="pie"
              title="Budget Allocation Distribution"
              data={budgetData.map(d => ({ name: d.department, value: d.allocated }))}
              dataKey="value"
              height={300}
              colors={['#8884d8', '#82ca9d', '#ffc658', '#ff7300']}
            />
          </div>

          {/* Budget Table */}
          <Card>
            <CardHeader>
              <CardTitle>Department Budget Status</CardTitle>
              <CardDescription>
                Track budget allocation and utilization across departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={budgetData}
                columns={budgetColumns}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Learning Adoption Analytics</h3>
            <div className="flex space-x-2">
              <Button variant="outline">Last 30 Days</Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Analytics
              </Button>
            </div>
          </div>

          {/* Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartKit
              type="line"
              title="Learning Adoption Trend"
              data={adoptionData}
              dataKey="adoption"
              xAxisKey="month"
              height={300}
              showGrid
              colors={['#8884d8']}
            />
            <ChartKit
              type="area"
              title="Completion Rate Trend"
              data={adoptionData}
              dataKey="completion"
              xAxisKey="month"
              height={300}
              colors={['#82ca9d']}
            />
          </div>

          <ChartKit
            type="bar"
            title="Total Learning Hours by Month"
            data={adoptionData}
            dataKey="hours"
            xAxisKey="month"
            height={300}
            colors={['#ffc658']}
          />

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Leadership Fundamentals</span>
                    <Badge variant="default">92% completion</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>React Advanced Patterns</span>
                    <Badge variant="default">87% completion</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Data Science Bootcamp</span>
                    <Badge variant="secondary">76% completion</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Department Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Engineering</span>
                    <Badge variant="default">85%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Marketing</span>
                    <Badge variant="default">78%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Sales</span>
                    <Badge variant="secondary">72%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>HR</span>
                    <Badge variant="default">89%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skills Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">$2.4M</p>
                    <p className="text-sm text-muted-foreground">Estimated ROI this year</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Productivity Gain</span>
                      <span className="text-sm font-medium">+18%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Employee Retention</span>
                      <span className="text-sm font-medium">+12%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Internal Promotions</span>
                      <span className="text-sm font-medium">+25%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="governance" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Learning Governance & Policies</h3>
            <Button>Save Changes</Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Learning Policies</CardTitle>
                <CardDescription>Configure platform-wide learning policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="completion-days">Mandatory Course Completion (days)</Label>
                  <Input id="completion-days" type="number" defaultValue="30" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="budget-threshold">Budget Approval Threshold</Label>
                  <Input id="budget-threshold" type="number" defaultValue="500" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max-courses">Max Concurrent Courses per Employee</Label>
                  <Input id="max-courses" type="number" defaultValue="3" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reminder-days">Certification Expiry Reminder (days)</Label>
                  <Input id="reminder-days" type="number" defaultValue="60" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure learning platform features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-enroll">Auto-enroll New Hires</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically enroll new employees in onboarding courses
                    </p>
                  </div>
                  <Switch id="auto-enroll" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="gamification">Enable Gamification</Label>
                    <p className="text-sm text-muted-foreground">
                      Show badges, points, and leaderboards
                    </p>
                  </div>
                  <Switch id="gamification" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="peer-review">Peer Learning Reviews</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow employees to review and rate courses
                    </p>
                  </div>
                  <Switch id="peer-review" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="ai-recommendations">AI Recommendations</Label>
                    <p className="text-sm text-muted-foreground">
                      Use AI to suggest relevant courses
                    </p>
                  </div>
                  <Switch id="ai-recommendations" defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Compliance & Certifications</CardTitle>
              <CardDescription>Manage compliance requirements and certification tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="compliance-type">Compliance Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select compliance type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gdpr">GDPR Training</SelectItem>
                      <SelectItem value="security">Security Awareness</SelectItem>
                      <SelectItem value="safety">Workplace Safety</SelectItem>
                      <SelectItem value="dei">Diversity & Inclusion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="renewal-period">Renewal Period (months)</Label>
                  <Input id="renewal-period" type="number" defaultValue="12" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">1,247</p>
                  <p className="text-sm text-muted-foreground">Compliant Employees</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">23</p>
                  <p className="text-sm text-muted-foreground">Expiring Soon</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">8</p>
                  <p className="text-sm text-muted-foreground">Non-Compliant</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default HRLearningPage