import { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { KPICard } from '@/components/shared/KPICard'
import { ChartKit } from '@/components/shared/ChartKit'
import { DataTable } from '@/components/shared/DataTable'
import { FormKit } from '@/components/shared/FormKit'
import Dashboard from './Dashboard'
import Profile from './Profile'
import { TimesheetModule } from '@/components/timesheet/TimesheetModule'
// Import Performance Components
import { CycleTimeline } from '@/features/performance/components/shared/CycleTimeline'
import { MyGoalsTab } from '@/features/performance/components/employee/MyGoalsTab'
import { OneOnOnesTab } from '@/features/performance/components/employee/OneOnOnesTab'
import { ReviewsTab } from '@/features/performance/components/employee/ReviewsTab'
import { FeedbackTab } from '@/features/performance/components/employee/FeedbackTab'
import { PIPTab } from '@/features/performance/components/employee/PIPTab'
import LeavePage from '@/pages/Me/LeavePage'
import LearningPage from '@/pages/Me/LearningPage'
import RecognitionPage from '@/pages/Me/RecognitionPage'
import FinancePage from '@/pages/Me/FinancePage'
import { Clock, Calendar, DollarSign, Target, Users, Lightbulb, MessageSquare, CheckSquare, TrendingUp, Star, FileText, AlertTriangle, HelpCircle, Briefcase } from 'lucide-react'
import { moduleRegistry } from '@/lib/moduleRegistry'
import { z } from 'zod'

interface MePageProps {
  defaultTab: string
}

const tabConfig = {
  Dashboard: { icon: TrendingUp, description: 'Personal overview and metrics' },
  Profile: { icon: Users, description: 'Personal information and settings' },
  Attendance: { icon: Clock, description: 'Time tracking and attendance' },
  Leave: { icon: Calendar, description: 'Leave applications and balance' },
  Timesheet: { icon: Clock, description: 'Time logging and reports' },
  Expenses: { icon: DollarSign, description: 'Expense management' },
  Performance: { icon: Target, description: 'Goals and reviews' },
  IJP: { icon: Briefcase, description: 'Internal job postings' },
  Referrals: { icon: Users, description: 'Employee referrals' },
  Learning: { icon: Lightbulb, description: 'Training and development' },
  Recognition: { icon: Star, description: 'Employee recognition' },
  Finance: { icon: DollarSign, description: 'Payroll and tax management' },
  Helpdesk: { icon: HelpCircle, description: 'Support tickets' }
}

export default function MePage({ defaultTab }: MePageProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  // Register module spec
  const moduleSpec = moduleRegistry.getModuleSpec(`/Me/${defaultTab}`) || 
    moduleRegistry.registerModuleSpec(`/Me/${defaultTab}`, {
      brdStatus: 'draft',
      promptStatus: 'pending',
      description: `Employee self-service - ${tabConfig[defaultTab as keyof typeof tabConfig]?.description}`
    })

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Hours This Week"
          value="42.5"
          trend={{ direction: "up", value: "+2.5", label: "vs last week" }}
          description="vs last week"
          icon={<Clock className="h-4 w-4" />}
        />
        <KPICard
          title="Leave Balance"
          value="18"
          description="days remaining"
          icon={<Calendar className="h-4 w-4" />}
        />
        <KPICard
          title="Pending Expenses"
          value="$234"
          description="awaiting approval"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <KPICard
          title="Goal Progress"
          value="75%"
          trend={{ direction: "up", value: "+15%", label: "quarterly goals" }}
          description="quarterly goals"
          icon={<Target className="h-4 w-4" />}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <ChartKit
          title="Weekly Hours"
          type="line"
          dataKey="value"
          data={[
            { name: 'Mon', value: 8.5 },
            { name: 'Tue', value: 8.0 },
            { name: 'Wed', value: 7.5 },
            { name: 'Thu', value: 9.0 },
            { name: 'Fri', value: 8.5 }
          ]}
        />
        <ChartKit
          title="Goal Progress"
          type="pie"
          dataKey="value"
          data={[
            { name: 'Completed', value: 75 },
            { name: 'Remaining', value: 25 }
          ]}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-green-600" />
              <span>Clocked in at 9:00 AM</span>
              <Badge variant="outline">Today</Badge>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span>Leave request approved</span>
              <Badge variant="outline">Yesterday</Badge>
            </div>
            <div className="flex items-center gap-3">
              <Target className="h-4 w-4 text-purple-600" />
              <span>Goal milestone achieved</span>
              <Badge variant="outline">2 days ago</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderProfile = () => (
    <Profile isOwnProfile={true} />
  )

  const renderAttendance = () => (
    <Tabs defaultValue="stats" className="space-y-4">
      <TabsList>
        <TabsTrigger value="stats">Stats</TabsTrigger>
        <TabsTrigger value="clockin">Clock-in</TabsTrigger>
        <TabsTrigger value="logs">Logs</TabsTrigger>
      </TabsList>
      
      <TabsContent value="stats" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KPICard
            title="Today's Hours"
            value="7.5"
            description="out of 8.0"
            icon={<Clock className="h-4 w-4" />}
          />
          <KPICard
            title="This Week"
            value="37.5"
            description="hours logged"
            icon={<Calendar className="h-4 w-4" />}
          />
          <KPICard
            title="This Month"
            value="162"
            description="hours logged"
            icon={<TrendingUp className="h-4 w-4" />}
          />
        </div>
        
        <ChartKit
          title="Daily Hours This Week"
          type="bar"
          dataKey="value"
          data={[
            { name: 'Mon', value: 8.0 },
            { name: 'Tue', value: 7.5 },
            { name: 'Wed', value: 8.5 },
            { name: 'Thu', value: 8.0 },
            { name: 'Fri', value: 5.5 }
          ]}
        />
      </TabsContent>
      
      <TabsContent value="clockin" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Quick Clock Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button className="flex-1">Clock In</Button>
              <Button variant="outline" className="flex-1">Clock Out</Button>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Last action: Clocked in at 9:00 AM
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="logs">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Logs</CardTitle>
            <CardDescription>Your attendance history</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={[]}
              columns={[
                { id: 'date', header: 'Date', accessor: 'date' },
                { id: 'clockIn', header: 'Clock In', accessor: 'clockIn' },
                { id: 'clockOut', header: 'Clock Out', accessor: 'clockOut' },
                { id: 'hours', header: 'Hours', accessor: 'hours' },
                { id: 'status', header: 'Status', accessor: 'status' }
              ]}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )

  const renderGenericTab = (tabName: string, tabs: string[]) => (
    <Tabs defaultValue={tabs[0]} className="space-y-4">
      <TabsList>
        {tabs.map(tab => (
          <TabsTrigger key={tab} value={tab}>{tab}</TabsTrigger>
        ))}
      </TabsList>
      
      {tabs.map(tab => (
        <TabsContent key={tab} value={tab}>
          <Card>
            <CardHeader>
              <CardTitle>{tab}</CardTitle>
              <CardDescription>
                {tabName} - {tab} content will be implemented here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This section is ready for {tabName.toLowerCase()} {tab.toLowerCase()} functionality.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  )

  
  const renderPerformance = () => {
    const [activePerformanceTab, setActivePerformanceTab] = useState("goals");

    // Mock data for cycle timeline
    const mockWindows = [
      {
        stage: "goal_setting" as const,
        openAt: "2024-01-01T00:00:00Z",
        dueAt: "2024-01-31T23:59:59Z",
        closeAt: "2024-02-05T23:59:59Z",
        isLocked: false,
      },
      {
        stage: "mid_year" as const,
        openAt: "2024-06-01T00:00:00Z",
        dueAt: "2024-06-30T23:59:59Z",
        closeAt: "2024-07-05T23:59:59Z",
        isLocked: false,
      },
      {
        stage: "year_end" as const,
        openAt: "2024-11-01T00:00:00Z",
        dueAt: "2024-11-30T23:59:59Z",
        closeAt: "2024-12-05T23:59:59Z",
        isLocked: false,
      },
      {
        stage: "rating_discussion" as const,
        openAt: "2024-12-15T00:00:00Z",
        dueAt: "2024-12-31T23:59:59Z",
        closeAt: "2025-01-05T23:59:59Z",
        isLocked: false,
      },
    ];

    const performanceTabs = [
      {
        id: "goals",
        label: "My Goals",
        icon: Target,
        component: MyGoalsTab,
      },
      {
        id: "oneOnOnes",
        label: "1:1s",
        icon: Users,
        component: OneOnOnesTab,
      },
      {
        id: "reviews",
        label: "Reviews",
        icon: FileText,
        component: ReviewsTab,
      },
      {
        id: "feedback",
        label: "Feedback",
        icon: MessageSquare,
        component: FeedbackTab,
      },
      {
        id: "pip",
        label: "PIP",
        icon: AlertTriangle,
        component: PIPTab,
      },
    ];

    const handleStageClick = (stage: any) => {
      console.log("Stage clicked:", stage);
    };

    const handlePrimaryAction = () => {
      const activeStage = mockWindows.find(w => {
        const now = new Date();
        const openAt = new Date(w.openAt);
        const dueAt = new Date(w.dueAt);
        return now >= openAt && now <= dueAt;
      });
      
      if (activeStage?.stage === "mid_year") {
        setActivePerformanceTab("reviews");
      }
    };

    return (
      <div className="space-y-6">
        <CycleTimeline
          cycleName="FY 2024 Performance Cycle"
          windows={mockWindows}
          onStageClick={handleStageClick}
          primaryAction={{
            label: "Complete Mid-Year Review",
            onClick: handlePrimaryAction,
            variant: "default",
          }}
        />

        <Tabs value={activePerformanceTab} onValueChange={setActivePerformanceTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            {performanceTabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {performanceTabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <tab.component />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <div className="min-h-screen bg-background">
            <Dashboard />
          </div>
        )
      case 'Profile':
        return renderProfile()
      case 'Attendance':
        return renderAttendance()
      case 'Leave':
        return <LeavePage />
      case 'Timesheet':
        return (
          <div className="min-h-screen">
            <TimesheetModule employeeId="demo-user" />
          </div>
        )
      case 'Performance':
        return renderPerformance()
      case 'Learning':
        return <LearningPage />
      case 'Recognition':
        return <RecognitionPage />
      case 'Finance':
        return <FinancePage />
      case 'Expenses':
        return renderGenericTab('Expenses', ['Submit', 'Imports', 'History'])
      case 'IJP':
        return renderGenericTab('IJP', ['Browse', 'My Applications'])
      case 'Referrals':
        return renderGenericTab('Referrals', ['Refer', 'Status'])
      case 'Helpdesk':
        return renderGenericTab('Helpdesk', ['New Ticket', 'My Tickets', 'FAQs'])
      default:
        return renderDashboard()
    }
  }

  const currentTabIcon = tabConfig[activeTab as keyof typeof tabConfig]?.icon || Users

  return (
    <div className="space-y-6">
      <PageHeader 
        title={`Me - ${activeTab}`}
        description={tabConfig[activeTab as keyof typeof tabConfig]?.description || 'Personal dashboard'}
        breadcrumbs={[
          { label: 'Me', href: '/Me/Dashboard' },
          { label: activeTab, href: `/Me/${activeTab}` }
        ]}
        moduleSpec={moduleSpec}
        icon={currentTabIcon}
      />

      {renderContent()}
    </div>
  )
}