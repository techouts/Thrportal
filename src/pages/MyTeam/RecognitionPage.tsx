import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Award, Clock, CheckCircle } from 'lucide-react'
import { TeamFeedTab } from '@/components/recognition/manager/TeamFeedTab'
import { TeamLeaderboardTab } from '@/components/recognition/manager/TeamLeaderboardTab'
import { RewardApprovalsTab } from '@/components/recognition/manager/RewardApprovalsTab'
import { PageHeader } from '@/components/shared/PageHeader'

const RecognitionPage = () => {
  const [activeTab, setActiveTab] = useState('team-feed')

  const stats = [
    {
      title: 'Team Members',
      value: '24',
      description: 'Active team size',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Monthly Recognitions',
      value: '47',
      description: 'Given this month',
      icon: Award,
      color: 'text-green-600'
    },
    {
      title: 'Pending Approvals',
      value: '3',
      description: 'Reward requests',
      icon: Clock,
      color: 'text-orange-600'
    },
    {
      title: 'Approved This Month',
      value: '12',
      description: 'Reward approvals',
      icon: CheckCircle,
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Team Recognition"
        description="Manage team recognitions, view leaderboards, and approve reward requests"
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
        <TabsList className="grid grid-cols-3 w-full max-w-xl">
          <TabsTrigger value="team-feed">Team Feed</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="approvals">Reward Approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="team-feed">
          <TeamFeedTab />
        </TabsContent>

        <TabsContent value="leaderboard">
          <TeamLeaderboardTab />
        </TabsContent>

        <TabsContent value="approvals">
          <RewardApprovalsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default RecognitionPage