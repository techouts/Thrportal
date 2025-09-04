import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, BarChart3, Users, Clock } from 'lucide-react'
import { ApprovalsTab } from '@/components/recognition/hr/ApprovalsTab'
import { SettingsTab } from '@/components/recognition/hr/SettingsTab'
import { AnalyticsTab } from '@/components/recognition/hr/AnalyticsTab'
import { HRLeaderboardTab } from '@/components/recognition/hr/HRLeaderboardTab'
import { PageHeader } from '@/components/shared/PageHeader'

const RecognitionPage = () => {
  const [activeTab, setActiveTab] = useState('approvals')

  const stats = [
    {
      title: 'Pending Approvals',
      value: '8',
      description: 'Reward requests to review',
      icon: Clock,
      color: 'text-orange-600'
    },
    {
      title: 'Monthly Budget',
      value: '$2,450',
      description: 'Remaining this month',
      icon: BarChart3,
      color: 'text-green-600'
    },
    {
      title: 'Active Users',
      value: '247',
      description: 'Participating employees',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Categories',
      value: '6',
      description: 'Recognition types',
      icon: Settings,
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Recognition Administration"
        description="Manage recognition system, approvals, analytics, and organization-wide settings"
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="approvals">
          <ApprovalsTab />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsTab />
        </TabsContent>

        <TabsContent value="leaderboard">
          <HRLeaderboardTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default RecognitionPage