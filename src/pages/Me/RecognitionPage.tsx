import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Award, Gift, Trophy, TrendingUp } from 'lucide-react'
import { GiveRecognitionTab } from '@/components/recognition/employee/GiveRecognitionTab'
import { MyRecognitionTab } from '@/components/recognition/employee/MyRecognitionTab'
import { LeaderboardTab } from '@/components/recognition/employee/LeaderboardTab'
import { RewardsTab } from '@/components/recognition/employee/RewardsTab'
import { PageHeader } from '@/components/shared/PageHeader'

const RecognitionPage = () => {
  const [activeTab, setActiveTab] = useState('give')

  const stats = [
    {
      title: 'Recognition Points',
      value: '1,247',
      description: 'Total earned this year',
      icon: Award,
      color: 'text-blue-600'
    },
    {
      title: 'Reward Points',
      value: '385',
      description: 'Available to redeem',
      icon: Gift,
      color: 'text-green-600'
    },
    {
      title: 'Current Rank',
      value: '#12',
      description: 'In department',
      icon: Trophy,
      color: 'text-yellow-600'
    },
    {
      title: 'Monthly Growth',
      value: '+15%',
      description: 'From last month',
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Recognition & Rewards"
        description="Give and receive recognition, track your achievements, and redeem rewards"
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
          <TabsTrigger value="give">Give Recognition</TabsTrigger>
          <TabsTrigger value="my-recognition">My Recognition</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="give">
          <GiveRecognitionTab />
        </TabsContent>

        <TabsContent value="my-recognition">
          <MyRecognitionTab />
        </TabsContent>

        <TabsContent value="leaderboard">
          <LeaderboardTab />
        </TabsContent>

        <TabsContent value="rewards">
          <RewardsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default RecognitionPage