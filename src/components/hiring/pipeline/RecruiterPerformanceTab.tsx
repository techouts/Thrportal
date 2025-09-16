import { useState, useEffect } from 'react'
import { TrendingUp, Target, AlertTriangle, Award, Users, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { DataTable } from '@/components/shared/DataTable'
import { ChartKit } from '@/components/shared/ChartKit'
import { KPICard } from '@/components/shared/KPICard'
import { useAuth } from '@/auth/AuthContext'
import { useToast } from '@/hooks/use-toast'

interface RecruiterPerformance {
  id: string
  name: string
  submissions: { target: number; actual: number }
  shortlists: { target: number; actual: number }
  interviews: { target: number; actual: number }
  offers: { target: number; actual: number }
  joins: { target: number; actual: number }
  slaCompliance: { target: number; actual: number }
  status: 'on-track' | 'behind' | 'ahead'
  nudges: string[]
}

interface TeamPerformance {
  submissions: { target: number; actual: number }
  shortlists: { target: number; actual: number }
  interviews: { target: number; actual: number }
  offers: { target: number; actual: number }
  joins: { target: number; actual: number }
  slaCompliance: { target: number; actual: number }
}

interface ClientProgress {
  clientName: string
  totalHeadcount: number
  filledPositions: number
  progressPercent: number
  forecastGap: number
}

export function RecruiterPerformanceTab() {
  const { user, can } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [recruiterData, setRecruiterData] = useState<RecruiterPerformance[]>([])
  const [teamData, setTeamData] = useState<TeamPerformance | null>(null)
  const [clientProgress, setClientProgress] = useState<ClientProgress[]>([])

  const userRole = user?.role || 'RECRUITER'
  const isRecruiter = userRole === 'RECRUITER'
  const isStaffingManager = userRole === 'STAFFING_MANAGER' || userRole === 'HIRING_MANAGER'
  const isLeadership = ['MANAGEMENT', 'ADMIN', 'HR_MANAGER'].includes(userRole)

  useEffect(() => {
    loadPerformanceData()
  }, [])

  const loadPerformanceData = async () => {
    setLoading(true)
    try {
      // Mock data based on role
      if (isRecruiter) {
        // Single recruiter view
        const myPerformance: RecruiterPerformance = {
          id: '1',
          name: user?.display_name || 'Current User',
          submissions: { target: 25, actual: 23 },
          shortlists: { target: 15, actual: 12 },
          interviews: { target: 8, actual: 6 },
          offers: { target: 3, actual: 2 },
          joins: { target: 2, actual: 1 },
          slaCompliance: { target: 95, actual: 88 },
          status: 'behind',
          nudges: [
            'On track for submissions but 20% behind shortlist target',
            '3 SLA breaches require attention',
            'Focus on improving candidate quality for better shortlist rates'
          ]
        }
        setRecruiterData([myPerformance])
      } else {
        // Team/leadership view
        const mockRecruiterData: RecruiterPerformance[] = [
          {
            id: '1',
            name: 'Sarah Johnson',
            submissions: { target: 25, actual: 28 },
            shortlists: { target: 15, actual: 18 },
            interviews: { target: 8, actual: 9 },
            offers: { target: 3, actual: 4 },
            joins: { target: 2, actual: 3 },
            slaCompliance: { target: 95, actual: 97 },
            status: 'ahead',
            nudges: []
          },
          {
            id: '2',
            name: 'Mike Chen',
            submissions: { target: 20, actual: 18 },
            shortlists: { target: 12, actual: 10 },
            interviews: { target: 6, actual: 5 },
            offers: { target: 2, actual: 1 },
            joins: { target: 2, actual: 1 },
            slaCompliance: { target: 90, actual: 85 },
            status: 'behind',
            nudges: ['10% behind submission target', '2 overdue SLA items']
          },
          {
            id: '3',
            name: 'Emily Davis',
            submissions: { target: 22, actual: 22 },
            shortlists: { target: 13, actual: 13 },
            interviews: { target: 7, actual: 7 },
            offers: { target: 3, actual: 2 },
            joins: { target: 2, actual: 2 },
            slaCompliance: { target: 92, actual: 94 },
            status: 'on-track',
            nudges: []
          }
        ]
        setRecruiterData(mockRecruiterData)

        // Calculate team rollup
        const teamRollup: TeamPerformance = {
          submissions: {
            target: mockRecruiterData.reduce((sum, r) => sum + r.submissions.target, 0),
            actual: mockRecruiterData.reduce((sum, r) => sum + r.submissions.actual, 0)
          },
          shortlists: {
            target: mockRecruiterData.reduce((sum, r) => sum + r.shortlists.target, 0),
            actual: mockRecruiterData.reduce((sum, r) => sum + r.shortlists.actual, 0)
          },
          interviews: {
            target: mockRecruiterData.reduce((sum, r) => sum + r.interviews.target, 0),
            actual: mockRecruiterData.reduce((sum, r) => sum + r.interviews.actual, 0)
          },
          offers: {
            target: mockRecruiterData.reduce((sum, r) => sum + r.offers.target, 0),
            actual: mockRecruiterData.reduce((sum, r) => sum + r.offers.actual, 0)
          },
          joins: {
            target: mockRecruiterData.reduce((sum, r) => sum + r.joins.target, 0),
            actual: mockRecruiterData.reduce((sum, r) => sum + r.joins.actual, 0)
          },
          slaCompliance: {
            target: Math.round(mockRecruiterData.reduce((sum, r) => sum + r.slaCompliance.target, 0) / mockRecruiterData.length),
            actual: Math.round(mockRecruiterData.reduce((sum, r) => sum + r.slaCompliance.actual, 0) / mockRecruiterData.length)
          }
        }
        setTeamData(teamRollup)
      }

      // Client progress for leadership
      if (isLeadership) {
        const mockClientProgress: ClientProgress[] = [
          {
            clientName: 'TechCorp Inc',
            totalHeadcount: 50,
            filledPositions: 35,
            progressPercent: 70,
            forecastGap: 8
          },
          {
            clientName: 'StartupXYZ',
            totalHeadcount: 20,
            filledPositions: 12,
            progressPercent: 60,
            forecastGap: 5
          }
        ]
        setClientProgress(mockClientProgress)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load performance data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ahead': return 'success'
      case 'on-track': return 'secondary'
      case 'behind': return 'destructive'
      default: return 'secondary'
    }
  }

  const getPerformancePercentage = (actual: number, target: number) => {
    return target > 0 ? Math.round((actual / target) * 100) : 0
  }

  const sendReminder = (recruiterId: string) => {
    toast({
      title: 'Reminder Sent',
      description: 'Performance reminder sent to recruiter'
    })
  }

  const adjustTargets = () => {
    // Navigate to settings
    window.location.href = '/Hiring/Settings?tab=targets'
  }

  // Recruiter View
  if (isRecruiter && recruiterData.length > 0) {
    const myData = recruiterData[0]
    
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">My Performance</h2>
          <p className="text-muted-foreground">
            Track your progress against targets
          </p>
        </div>

        {/* Funnel Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Hiring Funnel Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Submissions', data: myData.submissions },
                { label: 'Shortlists', data: myData.shortlists },
                { label: 'Interviews', data: myData.interviews },
                { label: 'Offers', data: myData.offers },
                { label: 'Joins', data: myData.joins }
              ].map(item => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{item.label}</span>
                    <span>{item.data.actual} / {item.data.target}</span>
                  </div>
                  <Progress 
                    value={getPerformancePercentage(item.data.actual, item.data.target)} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Scorecard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KPICard
            title="Submission Rate"
            value={`${getPerformancePercentage(myData.submissions.actual, myData.submissions.target)}%`}
            description={`${myData.submissions.actual}/${myData.submissions.target}`}
            trend={{ direction: "up", value: "5%" }}
          />
          <KPICard
            title="Shortlist Rate"
            value={`${getPerformancePercentage(myData.shortlists.actual, myData.shortlists.target)}%`}
            description={`${myData.shortlists.actual}/${myData.shortlists.target}`}
            trend={{ direction: myData.shortlists.actual >= myData.shortlists.target ? 'up' : 'down', value: "3%" }}
          />
          <KPICard
            title="SLA Compliance"
            value={`${myData.slaCompliance.actual}%`}
            description={`Target: ${myData.slaCompliance.target}%`}
            trend={{ direction: myData.slaCompliance.actual >= myData.slaCompliance.target ? 'up' : 'down', value: "2%" }}
          />
        </div>

        {/* Nudges & Alerts */}
        {myData.nudges.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {myData.nudges.map((nudge, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                    <span className="text-sm">{nudge}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // Team Performance Table Columns
  const teamColumns = [
    {
      id: 'name',
      header: 'Recruiter',
      accessor: 'name' as const
    },
    {
      id: 'submissions',
      header: 'Submissions',
      accessor: 'submissions' as const,
      cell: ({ row }: any) => (
        <div className="text-center">
          <div className="font-medium">{row.submissions.actual} / {row.submissions.target}</div>
          <Badge variant={row.submissions.actual >= row.submissions.target ? 'default' : 'secondary'} className="text-xs">
            {getPerformancePercentage(row.submissions.actual, row.submissions.target)}%
          </Badge>
        </div>
      )
    },
    {
      id: 'shortlists',
      header: 'Shortlists',
      accessor: 'shortlists' as const,
      cell: ({ row }: any) => (
        <div className="text-center">
          <div className="font-medium">{row.shortlists.actual} / {row.shortlists.target}</div>
          <Badge variant={row.shortlists.actual >= row.shortlists.target ? 'default' : 'secondary'} className="text-xs">
            {getPerformancePercentage(row.shortlists.actual, row.shortlists.target)}%
          </Badge>
        </div>
      )
    },
    {
      id: 'interviews',
      header: 'Interviews',
      accessor: 'interviews' as const,
      cell: ({ row }: any) => (
        <div className="text-center">
          <div className="font-medium">{row.interviews.actual} / {row.interviews.target}</div>
          <Badge variant={row.interviews.actual >= row.interviews.target ? 'default' : 'secondary'} className="text-xs">
            {getPerformancePercentage(row.interviews.actual, row.interviews.target)}%
          </Badge>
        </div>
      )
    },
    {
      id: 'offers',
      header: 'Offers',
      accessor: 'offers' as const,
      cell: ({ row }: any) => (
        <div className="text-center">
          <div className="font-medium">{row.offers.actual} / {row.offers.target}</div>
          <Badge variant={row.offers.actual >= row.offers.target ? 'default' : 'secondary'} className="text-xs">
            {getPerformancePercentage(row.offers.actual, row.offers.target)}%
          </Badge>
        </div>
      )
    },
    {
      id: 'joins',
      header: 'Joins',
      accessor: 'joins' as const,
      cell: ({ row }: any) => (
        <div className="text-center">
          <div className="font-medium">{row.joins.actual} / {row.joins.target}</div>
          <Badge variant={row.joins.actual >= row.joins.target ? 'default' : 'secondary'} className="text-xs">
            {getPerformancePercentage(row.joins.actual, row.joins.target)}%
          </Badge>
        </div>
      )
    },
    {
      id: 'sla',
      header: 'SLA %',
      accessor: 'slaCompliance' as const,
      cell: ({ row }: any) => (
        <div className="text-center">
          <div className="font-medium">{row.slaCompliance.actual}%</div>
          <div className="text-xs text-muted-foreground">Target: {row.slaCompliance.target}%</div>
        </div>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status' as const,
      cell: ({ row }: any) => (
        <Badge variant={getStatusColor(row.status) as any}>
          {row.status.replace('-', ' ')}
        </Badge>
      )
    }
  ]

  // Actions are handled inline in the render section below

  // Staffing Manager / Leadership View
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {isStaffingManager ? 'Team Performance' : 'Recruiter Performance'}
          </h2>
          <p className="text-muted-foreground">
            {isStaffingManager 
              ? 'Monitor and manage team performance against targets'
              : 'Leadership view of recruiting performance across teams'
            }
          </p>
        </div>
        {isStaffingManager && (
          <Button onClick={adjustTargets} variant="outline">
            Adjust Targets
          </Button>
        )}
      </div>

      {/* Team Summary (for managers) */}
      {isStaffingManager && teamData && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Submissions', data: teamData.submissions },
            { label: 'Shortlists', data: teamData.shortlists },
            { label: 'Interviews', data: teamData.interviews },
            { label: 'Offers', data: teamData.offers },
            { label: 'Joins', data: teamData.joins },
            { label: 'SLA %', data: teamData.slaCompliance }
          ].map(item => (
            <KPICard
              key={item.label}
              title={item.label}
              value={`${item.data.actual}`}
              description={`Target: ${item.data.target}`}
              trend={{ direction: item.data.actual >= item.data.target ? 'up' : 'down', value: "2%" }}
            />
          ))}
        </div>
      )}

      {/* Client Progress (Leadership View) */}
      {isLeadership && clientProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Client Closure Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clientProgress.map(client => (
                <div key={client.clientName} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{client.clientName}</span>
                    <div className="text-sm text-muted-foreground">
                      {client.filledPositions} / {client.totalHeadcount} positions
                      {client.forecastGap > 0 && (
                        <span className="text-amber-600 ml-2">
                          Need +{client.forecastGap} more
                        </span>
                      )}
                    </div>
                  </div>
                  <Progress value={client.progressPercent} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {isStaffingManager ? 'Team Performance Dashboard' : 'Recruiter Performance Overview'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={recruiterData}
            columns={teamColumns}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Forecast Insights (Leadership) */}
      {isLeadership && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Team performance is 15% ahead of target joins for this quarter
                </p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Need +30 submissions this month to meet client commitments
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200">
                  SLA compliance has improved by 8% over last month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}