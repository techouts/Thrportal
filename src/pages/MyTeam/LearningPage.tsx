import React, { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DataTable } from '@/components/shared/DataTable'
import { KPICard } from '@/components/shared/KPICard'
import { ChartKit } from '@/components/shared/ChartKit'
import { 
  GraduationCap, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  Target,
  Award,
  BookOpen,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Eye,
  MessageSquare
} from 'lucide-react'

const MyTeamLearningPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard')

  const teamMetrics = [
    {
      title: 'Team Adoption Rate',
      value: '84%',
      description: '+5% from last month',
      trend: { direction: 'up' as const, value: '5%', label: 'vs last month' }
    },
    {
      title: 'Completion Rate',
      value: '78%',
      description: 'Avg across all courses',
      trend: { direction: 'up' as const, value: '3%', label: 'vs last month' }
    },
    {
      title: 'Learning Hours',
      value: '145',
      description: 'This month',
      trend: { direction: 'up' as const, value: '12%', label: 'vs last month' }
    },
    {
      title: 'Skill Coverage',
      value: '72%',
      description: 'Critical skills covered',
      trend: { direction: 'up' as const, value: '8%', label: 'vs last month' }
    }
  ]

  const teamMembers = [
    {
      id: '1',
      name: 'Alice Johnson',
      role: 'Senior Developer',
      avatar: '/avatars/alice.jpg',
      activeCourses: 2,
      completedCourses: 8,
      completionRate: 85,
      learningHours: 45,
      skillGaps: 2,
      lastActivity: '2024-02-05'
    },
    {
      id: '2',
      name: 'Bob Smith',
      role: 'Frontend Developer',
      avatar: '/avatars/bob.jpg',
      activeCourses: 1,
      completedCourses: 5,
      completionRate: 75,
      learningHours: 32,
      skillGaps: 3,
      lastActivity: '2024-02-04'
    },
    {
      id: '3',
      name: 'Carol Davis',
      role: 'UX Designer',
      avatar: '/avatars/carol.jpg',
      activeCourses: 3,
      completedCourses: 12,
      completionRate: 92,
      learningHours: 58,
      skillGaps: 1,
      lastActivity: '2024-02-05'
    }
  ]

  const pendingApprovals = [
    {
      id: '1',
      employee: 'Alice Johnson',
      course: 'AWS Cloud Architect Certification',
      cost: 599,
      requestDate: '2024-02-01',
      priority: 'high',
      justification: 'Required for upcoming cloud migration project'
    },
    {
      id: '2',
      employee: 'Bob Smith',
      course: 'Advanced React Patterns',
      cost: 299,
      requestDate: '2024-02-03',
      priority: 'medium',
      justification: 'To improve frontend development skills'
    },
    {
      id: '3',
      employee: 'Carol Davis',
      course: 'Design Leadership Workshop',
      cost: 450,
      requestDate: '2024-01-30',
      priority: 'high',
      justification: 'Preparing for team lead role'
    }
  ]

  const recommendedCourses = [
    {
      id: '1',
      title: 'Microservices Architecture',
      description: 'Learn to design and implement microservices',
      duration: '30 hours',
      targetRoles: ['Senior Developer', 'Tech Lead'],
      skillsAddressed: ['System Design', 'Architecture'],
      recommendedFor: ['Alice Johnson', 'Bob Smith'],
      cost: 399
    },
    {
      id: '2',
      title: 'Team Leadership Fundamentals',
      description: 'Essential skills for new team leaders',
      duration: '25 hours',
      targetRoles: ['Team Lead', 'Senior Developer'],
      skillsAddressed: ['Leadership', 'Communication'],
      recommendedFor: ['Carol Davis'],
      cost: 299
    }
  ]

  const learningChartData = [
    { month: 'Jan', completed: 12, enrolled: 18, hours: 125 },
    { month: 'Feb', completed: 15, enrolled: 22, hours: 145 },
    { month: 'Mar', completed: 18, enrolled: 20, hours: 160 },
    { month: 'Apr', completed: 14, enrolled: 19, hours: 135 },
    { month: 'May', completed: 20, enrolled: 25, hours: 175 },
    { month: 'Jun', completed: 22, enrolled: 24, hours: 180 }
  ]

  const teamMemberColumns = [
    {
      accessorKey: 'name',
      header: 'Team Member',
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.original.avatar} />
            <AvatarFallback>{row.original.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-sm text-muted-foreground">{row.original.role}</p>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'activeCourses',
      header: 'Active',
      cell: ({ row }: any) => (
        <Badge variant="secondary">{row.original.activeCourses} courses</Badge>
      )
    },
    {
      accessorKey: 'completedCourses',
      header: 'Completed',
      cell: ({ row }: any) => (
        <span className="font-medium">{row.original.completedCourses}</span>
      )
    },
    {
      accessorKey: 'completionRate',
      header: 'Completion Rate',
      cell: ({ row }: any) => (
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-sm">{row.original.completionRate}%</span>
          </div>
          <Progress value={row.original.completionRate} className="h-2 w-20" />
        </div>
      )
    },
    {
      accessorKey: 'learningHours',
      header: 'Hours',
      cell: ({ row }: any) => (
        <span>{row.original.learningHours}h</span>
      )
    },
    {
      accessorKey: 'skillGaps',
      header: 'Skill Gaps',
      cell: ({ row }: any) => (
        <Badge 
          variant={row.original.skillGaps === 0 ? 'default' : 
                   row.original.skillGaps <= 2 ? 'secondary' : 'destructive'}
        >
          {row.original.skillGaps}
        </Badge>
      )
    }
  ]

  const approvalsColumns = [
    {
      accessorKey: 'employee',
      header: 'Employee',
    },
    {
      accessorKey: 'course',
      header: 'Course',
      cell: ({ row }: any) => (
        <div className="max-w-xs">
          <p className="font-medium truncate">{row.original.course}</p>
          <p className="text-sm text-muted-foreground">${row.original.cost}</p>
        </div>
      )
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }: any) => (
        <Badge 
          variant={row.original.priority === 'high' ? 'destructive' : 
                   row.original.priority === 'medium' ? 'default' : 'secondary'}
        >
          {row.original.priority}
        </Badge>
      )
    },
    {
      accessorKey: 'requestDate',
      header: 'Requested',
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="default">
            <ThumbsUp className="h-4 w-4 mr-1" />
            Approve
          </Button>
          <Button size="sm" variant="outline">
            <ThumbsDown className="h-4 w-4 mr-1" />
            Reject
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Learning & Development"
        description="Manage and track your team's learning progress"
        icon={GraduationCap}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Team Dashboard</TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
          <TabsTrigger value="approvals">
            Approvals
            {pendingApprovals.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0">
                {pendingApprovals.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {teamMetrics.map((metric, index) => (
              <KPICard key={index} {...metric} />
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartKit
              type="line"
              title="Learning Progress Trend"
              data={learningChartData}
              dataKey="completed"
              xAxisKey="month"
              height={300}
              showGrid
            />
            <ChartKit
              type="bar"
              title="Learning Hours by Month"
              data={learningChartData}
              dataKey="hours"
              xAxisKey="month"
              height={300}
              colors={['#8884d8']}
            />
          </div>

          {/* Team Members Table */}
          <Card>
            <CardHeader>
              <CardTitle>Team Learning Status</CardTitle>
              <CardDescription>
                Track individual progress and identify learning opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <Card key={member.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6 text-sm">
                          <div className="text-center">
                            <p className="font-medium">{member.activeCourses}</p>
                            <p className="text-muted-foreground">Active</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium">{member.completedCourses}</p>
                            <p className="text-muted-foreground">Completed</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium">{member.learningHours}h</p>
                            <p className="text-muted-foreground">Hours</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span>{member.completionRate}%</span>
                            <Progress value={member.completionRate} className="h-2 w-16" />
                          </div>
                          <Badge 
                            variant={member.skillGaps === 0 ? 'default' : 
                                     member.skillGaps <= 2 ? 'secondary' : 'destructive'}
                          >
                            {member.skillGaps} gaps
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommended" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Recommended Learning Paths</h3>
            <Button>Browse Catalog</Button>
          </div>

          <div className="grid gap-4">
            {recommendedCourses.map((course) => (
              <Card key={course.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{course.title}</h4>
                      <p className="text-muted-foreground mt-1">{course.description}</p>
                      
                      <div className="flex items-center space-x-6 mt-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Target className="h-4 w-4" />
                          <span>{course.targetRoles.join(', ')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <BookOpen className="h-4 w-4" />
                          <span>${course.cost}</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm font-medium">Skills Addressed:</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {course.skillsAddressed.map((skill) => (
                            <Badge key={skill} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3">
                        <p className="text-sm font-medium">Recommended for:</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {course.recommendedFor.map((member) => (
                            <Badge key={member} variant="outline">{member}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <Button>Assign to Team</Button>
                      <Button variant="outline">View Details</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Pending Learning Requests</h3>
            <div className="flex space-x-2">
              <Button variant="outline">Bulk Approve</Button>
              <Button variant="outline">Export</Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="space-y-4 p-6">
                {pendingApprovals.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{request.employee}</h4>
                          <p className="font-medium">{request.course}</p>
                          <p className="text-sm text-muted-foreground mt-1">{request.justification}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm">
                            <span>Cost: ${request.cost}</span>
                            <span>Requested: {request.requestDate}</span>
                            <Badge 
                              variant={request.priority === 'high' ? 'destructive' : 'default'}
                            >
                              {request.priority} priority
                            </Badge>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="outline">
                            <ThumbsDown className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Request Details */}
          <div className="grid gap-4">
            {pendingApprovals.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{request.employee}</h4>
                      <p className="text-lg font-medium mt-1">{request.course}</p>
                      <p className="text-muted-foreground mt-2">{request.justification}</p>
                      <div className="flex items-center space-x-4 mt-3 text-sm">
                        <span>Cost: ${request.cost}</span>
                        <span>Requested: {request.requestDate}</span>
                        <Badge 
                          variant={request.priority === 'high' ? 'destructive' : 'default'}
                        >
                          {request.priority} priority
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button>
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button variant="outline">
                        <ThumbsDown className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Learning Analytics & Reports</h3>
            <div className="flex space-x-2">
              <Button variant="outline">Generate Report</Button>
              <Button variant="outline">Export Data</Button>
            </div>
          </div>

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Skill Gap Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>React Development</span>
                    <Badge variant="destructive">3 gaps</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Leadership Skills</span>
                    <Badge variant="secondary">2 gaps</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>DevOps</span>
                    <Badge variant="secondary">2 gaps</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>UI/UX Design</span>
                    <Badge variant="default">1 gap</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Learning ROI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">$12,500</p>
                    <p className="text-sm text-muted-foreground">Estimated ROI this quarter</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Learning Investment</span>
                      <span className="text-sm font-medium">$8,500</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Productivity Gain</span>
                      <span className="text-sm font-medium">$21,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">ROI Percentage</span>
                      <span className="text-sm font-medium text-green-600">247%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Readiness</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Overall Readiness</span>
                      <span className="text-sm font-medium">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Technical Skills</span>
                      <span className="text-sm font-medium">82%</span>
                    </div>
                    <Progress value={82} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Soft Skills</span>
                      <span className="text-sm font-medium">74%</span>
                    </div>
                    <Progress value={74} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default MyTeamLearningPage