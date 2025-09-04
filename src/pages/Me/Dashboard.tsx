import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Clock, 
  Calendar, 
  Coffee, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Target,
  BookOpen,
  TrendingUp,
  MapPin,
  Plus,
  ExternalLink,
  Timer,
  Receipt,
  HelpCircle,
  Heart
} from 'lucide-react'
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, PieChart, Pie, Cell, RadialBarChart, RadialBar } from 'recharts'
import { sampleMeDashboardData, type MeDashboardData } from '@/mocks/meDashboard'

const getTimeOfDay = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-IN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const StatusBadge = ({ status }: { status: 'submitted' | 'due' | 'missing' }) => {
  const variants = {
    submitted: 'bg-green-100 text-green-800',
    due: 'bg-yellow-100 text-yellow-800', 
    missing: 'bg-red-100 text-red-800'
  }
  const symbols = { submitted: '✓', due: '•', missing: '✗' }
  
  return (
    <span className={`inline-block w-4 h-4 rounded-full text-xs leading-4 text-center ${variants[status]}`}>
      {symbols[status]}
    </span>
  )
}

export default function MeDashboard() {
  const data: MeDashboardData = sampleMeDashboardData
  const partOfDay = getTimeOfDay()
  const today = new Date().toLocaleDateString('en-IN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  // Chart data preparation
  const workdayProgress = Math.round((data.workday.workedToday / data.workday.targetHoursToday) * 100)
  const weekData = data.week.days.map(day => ({
    day: new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' }),
    hours: day.effectiveHours,
    status: day.timesheet
  }))
  
  const leaveDonutData = data.leave.balances.map(balance => ({
    name: balance.type,
    value: balance.days
  }))
  
  const learningFunnelData = [
    { name: 'Assigned', value: data.learning.assigned },
    { name: 'In Progress', value: data.learning.inProgress },
    { name: 'Completed', value: data.learning.completed }
  ]

  const radialData = [{ name: 'Progress', value: workdayProgress, fill: '#22c55e' }]

  return (
    <div className="space-y-6 p-6" data-testid="me-dashboard">
      {/* Top Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <h1 className="text-2xl font-semibold text-foreground" data-testid="welcome-message">
            Good {partOfDay}, {data.user.firstName} 👋
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{today}</span>
            <Badge variant={data.workday.mode === 'WFO' ? 'default' : 'secondary'} data-testid="work-mode-badge">
              {data.workday.mode}
            </Badge>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2" data-testid="quick-actions">
          <Button size="sm" asChild>
            <Link to="/Me/Attendance?tab=Clock-in">
              <Clock className="w-4 h-4 mr-1" />
              Clock In/Out
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link to="/Me/Timesheet?tab=Fill">
              <Timer className="w-4 h-4 mr-1" />
              Fill Timesheet
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link to="/Me/Leave?tab=Apply">
              <Calendar className="w-4 h-4 mr-1" />
              Apply Leave
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link to="/Me/Expenses?tab=Submit">
              <Receipt className="w-4 h-4 mr-1" />
              Submit Expense
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link to="/Me/Helpdesk?tab=New%20Ticket">
              <HelpCircle className="w-4 h-4 mr-1" />
              New Ticket
            </Link>
          </Button>
        </div>
      </div>

      {/* Row 1 - Hero Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Workday Ring */}
        <Card className="lg:col-span-5 rounded-2xl" data-testid="workday-ring">
          <CardHeader className="p-5">
            <CardTitle className="flex items-center justify-between">
              <span>Today's Progress</span>
              <Badge variant={data.workday.isOnTimeToday === 'on-time' ? 'default' : 'destructive'}>
                {data.workday.isOnTimeToday === 'on-time' ? '✅ On Time' : '⚠️ Late'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={radialData}>
                    <RadialBar dataKey="value" cornerRadius={10} fill="#22c55e" />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{data.workday.workedToday}h</span>
                  <span className="text-sm text-muted-foreground">of {data.workday.targetHoursToday}h</span>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {data.workday.checkInAt && (
                <div className="flex justify-between">
                  <span>Checked in:</span>
                  <span>{formatTime(data.workday.checkInAt)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Break time:</span>
                <span>{data.workday.breakMinutes}m</span>
              </div>
              <div className="flex justify-between">
                <span>Last activity:</span>
                <span>{data.workday.lastActionAt ? formatTime(data.workday.lastActionAt) : '-'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* This Week Overview */}
        <Card className="lg:col-span-4 rounded-2xl" data-testid="week-overview">
          <CardHeader className="p-5">
            <CardTitle>This Week</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="h-32 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekData}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Bar dataKey="hours" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between items-center text-sm">
              {weekData.map((day, index) => (
                <div key={index} className="flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">{day.day}</span>
                  <StatusBadge status={day.status} />
                </div>
              ))}
            </div>
            <div className="mt-3 text-sm text-amber-600">
              Missing Tue & Wed → 
              <Link to="/Me/Timesheet?tab=Fill" className="ml-1 underline">
                Fill now
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming & Focus */}
        <Card className="lg:col-span-3 rounded-2xl" data-testid="upcoming-focus">
          <CardHeader className="p-5">
            <CardTitle>Upcoming & Focus</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Next 3 events</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Team standup</span>
                  <span className="text-muted-foreground">2:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Client review</span>
                  <span className="text-muted-foreground">4:30 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>1:1 with Anita</span>
                  <span className="text-muted-foreground">Tomorrow</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Focus Block</h4>
              <div className="flex gap-1">
                <Button size="sm" variant="outline">Add 30m</Button>
                <Button size="sm" variant="outline">60m</Button>
                <Button size="sm" variant="outline">90m</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2 - Core Ops */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Leave Snapshot */}
        <Card className="rounded-2xl" data-testid="leave-snapshot">
          <CardHeader className="p-5">
            <CardTitle>Leave Balance</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="flex items-center justify-center mb-4">
              <div className="w-24 h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={leaveDonutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={40}
                      dataKey="value"
                    >
                      {leaveDonutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#22c55e', '#f59e0b', '#8b5cf6'][index]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="space-y-1 text-sm mb-3">
              {data.leave.balances.map((balance, index) => (
                <div key={balance.type} className="flex justify-between">
                  <span>{balance.type}:</span>
                  <span>{balance.days} days</span>
                </div>
              ))}
            </div>
            <div className="text-sm text-muted-foreground mb-3">
              WFH: {data.leave.wfh.usedThisMonth}/{data.leave.wfh.quotaThisMonth} this month
            </div>
            <Button size="sm" className="w-full" asChild>
              <Link to="/Me/Leave?tab=Apply">Apply Leave</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card className="rounded-2xl" data-testid="expenses">
          <CardHeader className="p-5">
            <CardTitle>Expenses</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-center mb-4">
              <div className="text-2xl font-bold">₹{data.expenses.pendingAmount}</div>
              <div className="text-sm text-muted-foreground">pending</div>
            </div>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span>Last claim:</span>
                <Badge variant="secondary">{data.expenses.lastClaimStatus}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Avg cycle:</span>
                <span>{data.expenses.medianCycleDays} days</span>
              </div>
            </div>
            <Button size="sm" className="w-full" asChild>
              <Link to="/Me/Expenses?tab=Submit">Submit/Upload</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Helpdesk */}
        <Card className="rounded-2xl" data-testid="helpdesk">
          <CardHeader className="p-5">
            <CardTitle className="flex items-center justify-between">
              <span>Helpdesk</span>
              {data.helpdesk.slaRiskCount > 0 && (
                <Badge variant="destructive">SLA Risk</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="grid grid-cols-3 gap-2 text-center mb-4">
              <div>
                <div className="text-lg font-bold">{data.helpdesk.counts.open}</div>
                <div className="text-xs text-muted-foreground">Open</div>
              </div>
              <div>
                <div className="text-lg font-bold">{data.helpdesk.counts.inProgress}</div>
                <div className="text-xs text-muted-foreground">In Progress</div>
              </div>
              <div>
                <div className="text-lg font-bold">{data.helpdesk.counts.waiting}</div>
                <div className="text-xs text-muted-foreground">Waiting</div>
              </div>
            </div>
            <Button size="sm" className="w-full" asChild>
              <Link to="/Me/Helpdesk?tab=New%20Ticket">New Ticket</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Row 3 - Growth */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* My Goals */}
        <Card className="rounded-2xl" data-testid="my-goals">
          <CardHeader className="p-5">
            <CardTitle className="flex items-center justify-between">
              <span>My Goals</span>
              <span className="text-lg font-bold">{data.goals.weightedProgressPct}%</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="space-y-3">
              {data.goals.items.map((goal) => (
                <div key={goal.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="truncate">{goal.title}</span>
                    <span>{goal.progressPct}%</span>
                  </div>
                  <Progress value={goal.progressPct} className="h-2" />
                  {goal.nextUpdateDue && (
                    <div className="text-xs text-amber-600 mt-1">
                      Due: {new Date(goal.nextUpdateDue).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Button size="sm" className="w-full mt-4" asChild>
              <Link to="/Me/Performance?tab=My%20Goals">Update Goals</Link>
            </Button>
          </CardContent>
        </Card>

        {/* 1:1s & Feedback */}
        <Card className="rounded-2xl" data-testid="oneOnones-feedback">
          <CardHeader className="p-5">
            <CardTitle>1:1s & Feedback</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Last 1:1:</span>
                <span>{data.oneOnOnes.lastDate ? new Date(data.oneOnOnes.lastDate).toLocaleDateString() : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>Next 1:1:</span>
                <span>{data.oneOnOnes.nextDate ? new Date(data.oneOnOnes.nextDate).toLocaleDateString() : '-'}</span>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Button size="sm" variant="outline" className="w-full">
                Request Feedback
              </Button>
              <Button size="sm" variant="outline" className="w-full">
                Schedule 1:1
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Learning */}
        <Card className="rounded-2xl" data-testid="learning">
          <CardHeader className="p-5">
            <CardTitle className="flex items-center justify-between">
              <span>Learning</span>
              {data.learning.dueSoonCount > 0 && (
                <Badge variant="secondary">Due Soon</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="grid grid-cols-3 gap-2 text-center mb-4">
              <div>
                <div className="text-lg font-bold">{data.learning.assigned}</div>
                <div className="text-xs text-muted-foreground">Assigned</div>
              </div>
              <div>
                <div className="text-lg font-bold">{data.learning.inProgress}</div>
                <div className="text-xs text-muted-foreground">In Progress</div>
              </div>
              <div>
                <div className="text-lg font-bold">{data.learning.completed}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>
            <Button size="sm" className="w-full" asChild>
              <Link to="/Me/Learning?tab=Courses">Resume Course</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Row 4 - Opportunities & Community */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* IJP Matches */}
        <Card className="rounded-2xl" data-testid="ijp-matches">
          <CardHeader className="p-5">
            <CardTitle>IJP Matches</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="space-y-3">
              {data.ijp.slice(0, 2).map((match) => (
                <div key={match.id} className="border rounded-lg p-3">
                  <div className="font-medium text-sm mb-1">{match.title}</div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {match.bu} • {match.location}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {match.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="text-xs">Preview</Button>
                    <Button size="sm" className="text-xs">Apply</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Referrals */}
        <Card className="rounded-2xl" data-testid="referrals">
          <CardHeader className="p-5">
            <CardTitle>Referrals</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="grid grid-cols-4 gap-2 text-center mb-4">
              <div>
                <div className="text-lg font-bold">{data.referrals.funnel.referred}</div>
                <div className="text-xs text-muted-foreground">Referred</div>
              </div>
              <div>
                <div className="text-lg font-bold">{data.referrals.funnel.interviewing}</div>
                <div className="text-xs text-muted-foreground">Interview</div>
              </div>
              <div>
                <div className="text-lg font-bold">{data.referrals.funnel.offer}</div>
                <div className="text-xs text-muted-foreground">Offer</div>
              </div>
              <div>
                <div className="text-lg font-bold">{data.referrals.funnel.hired}</div>
                <div className="text-xs text-muted-foreground">Hired</div>
              </div>
            </div>
            <Button size="sm" className="w-full" asChild>
              <Link to="/Me/Referrals?tab=Refer">Refer Now</Link>
            </Button>
          </CardContent>
        </Card>

        {/* People Widget */}
        <Card className="rounded-2xl" data-testid="people-widget">
          <CardHeader className="p-5">
            <CardTitle>People</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium mb-2">Manager</div>
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">{data.people.manager.initials}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{data.people.manager.name}</span>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-2">Team</div>
                <div className="flex items-center gap-1">
                  {data.people.peers.map((peer) => (
                    <Avatar key={peer.name} className="w-6 h-6">
                      <AvatarFallback className="text-xs">{peer.initials}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>

              {data.people.celebrations.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">Celebrations</div>
                  {data.people.celebrations.map((celebration) => (
                    <div key={celebration.name} className="flex items-center gap-2 text-sm">
                      <Heart className="w-3 h-3 text-red-500" />
                      <span>{celebration.name}'s {celebration.type}</span>
                    </div>
                  ))}
                  <Button size="sm" variant="outline" className="w-full mt-2">
                    Say Congrats
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Rail - Smart Nudges (could be made collapsible in future) */}
      <Card className="rounded-2xl" data-testid="smart-nudges">
        <CardHeader className="p-5">
          <CardTitle>Smart Nudges</CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <div className="space-y-3">
            {data.nudges.map((nudge) => (
              <div key={nudge.id} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <Link to={nudge.link} className="text-sm hover:underline">
                    {nudge.text}
                  </Link>
                </div>
                <ExternalLink className="w-3 h-3 text-muted-foreground" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}