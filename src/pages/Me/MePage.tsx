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
import { Clock, Calendar, DollarSign, Target, Users, Lightbulb, MessageSquare, CheckSquare, TrendingUp, Star } from 'lucide-react'
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
  IJP: { icon: TrendingUp, description: 'Internal job postings' },
  Referrals: { icon: Users, description: 'Employee referrals' },
  Learning: { icon: Lightbulb, description: 'Training and development' },
  Helpdesk: { icon: MessageSquare, description: 'Support tickets' }
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
        return renderGenericTab('Leave', ['Apply', 'Balance', 'History'])
      case 'Timesheet':
        return renderGenericTab('Timesheet', ['Fill', 'History', 'Client Exports'])
      case 'Expenses':
        return renderGenericTab('Expenses', ['Submit', 'Imports', 'History'])
      case 'Performance':
        return renderGenericTab('Performance', ['My Goals', '1:1s', 'Reviews', 'Feedback', 'PIP'])
      case 'IJP':
        return renderGenericTab('IJP', ['Browse', 'My Applications'])
      case 'Referrals':
        return renderGenericTab('Referrals', ['Refer', 'Status'])
      case 'Learning':
        return renderGenericTab('Learning', ['Requests', 'Assigned', 'Completed'])
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