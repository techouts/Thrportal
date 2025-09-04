import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trophy, Medal, Award, TrendingUp, Filter, Star, Crown } from 'lucide-react'

interface LeaderboardEntry {
  rank: number
  name: string
  department: string
  avatar?: string
  points: number
  recognitions: number
  categories: string[]
  change: number
  isCurrentUser?: boolean
}

export const LeaderboardTab = () => {
  const [period, setPeriod] = useState('monthly')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [viewType, setViewType] = useState('overall')

  const monthlyLeaderboard: LeaderboardEntry[] = [
    { rank: 1, name: 'Emily Davis', department: 'Product', avatar: '/api/placeholder/32/32', points: 385, recognitions: 23, categories: ['Innovation', 'Leadership'], change: 2 },
    { rank: 2, name: 'Alex Rodriguez', department: 'Marketing', avatar: '/api/placeholder/32/32', points: 352, recognitions: 21, categories: ['Customer Delight', 'Teamwork'], change: -1 },
    { rank: 3, name: 'Lisa Wang', department: 'Engineering', avatar: '/api/placeholder/32/32', points: 341, recognitions: 19, categories: ['Quality', 'Innovation'], change: 1 },
    { rank: 4, name: 'Mike Chen', department: 'Design', avatar: '/api/placeholder/32/32', points: 298, recognitions: 18, categories: ['Innovation', 'Quality'], change: 0 },
    { rank: 5, name: 'Jordan Smith', department: 'Engineering', avatar: '/api/placeholder/32/32', points: 287, recognitions: 16, categories: ['Rising Star', 'Teamwork'], change: 3 },
    { rank: 12, name: 'You', department: 'Engineering', points: 185, recognitions: 11, categories: ['Customer Delight', 'Innovation'], change: 1, isCurrentUser: true },
  ]

  const departments = ['Engineering', 'Product', 'Marketing', 'Design', 'Sales', 'HR']

  const spotlightRecognitions = [
    {
      id: '1',
      title: 'Customer Hero of the Week',
      recipient: 'Sarah Johnson',
      department: 'Support',
      description: 'Resolved 50+ customer issues with 100% satisfaction rating',
      avatar: '/api/placeholder/32/32',
      category: 'Customer Delight',
      points: 50
    },
    {
      id: '2',
      title: 'Innovation Champion',
      recipient: 'David Kim',
      department: 'Engineering',
      description: 'Developed new automation tool saving 20 hours/week',
      avatar: '/api/placeholder/32/32',
      category: 'Innovation Impact',
      points: 75
    },
    {
      id: '3',
      title: 'Team Collaboration Star',
      recipient: 'Maria Garcia',
      department: 'Product',
      description: 'Led cross-functional initiative improving team efficiency',
      avatar: '/api/placeholder/32/32',
      category: 'Teamwork & Collaboration',
      points: 40
    }
  ]

  const filterLeaderboard = (entries: LeaderboardEntry[]) => {
    if (departmentFilter === 'all') return entries
    return entries.filter(entry => entry.department === departmentFilter)
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-muted-foreground">{rank}</span>
    }
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (change < 0) return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
    return <span className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Recognition Leaderboard
          </CardTitle>
          <CardDescription>See who's leading in recognition across the organization</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={period} onValueChange={setPeriod} className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="grid grid-cols-3 w-full max-w-md">
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
                <TabsTrigger value="annual">Annual</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span className="text-sm font-medium">Filter:</span>
                </div>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="monthly" className="space-y-6">
              {/* Spotlight Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Weekly Spotlight
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {spotlightRecognitions.map((spotlight) => (
                    <Card key={spotlight.id} className="border-2 border-yellow-200 bg-yellow-50/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={spotlight.avatar} alt={spotlight.recipient} />
                            <AvatarFallback>{spotlight.recipient.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{spotlight.recipient}</div>
                            <div className="text-sm text-muted-foreground">{spotlight.department}</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="font-medium text-sm">{spotlight.title}</div>
                          <p className="text-xs text-muted-foreground">{spotlight.description}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{spotlight.category}</Badge>
                            <Badge className="bg-yellow-100 text-yellow-800">+{spotlight.points} pts</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Leaderboard */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Monthly Rankings</h3>
                <div className="space-y-3">
                  {filterLeaderboard(monthlyLeaderboard).map((entry) => (
                    <Card key={entry.rank} className={`transition-all hover:shadow-md ${entry.isCurrentUser ? 'border-2 border-primary bg-primary/5' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-8">
                              {getRankIcon(entry.rank)}
                            </div>
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={entry.avatar} alt={entry.name} />
                              <AvatarFallback>{entry.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className={`font-medium ${entry.isCurrentUser ? 'text-primary' : ''}`}>
                                {entry.name} {entry.isCurrentUser && '(You)'}
                              </div>
                              <div className="text-sm text-muted-foreground">{entry.department}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <div className="font-semibold text-lg">{entry.points}</div>
                              <div className="text-xs text-muted-foreground">points</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{entry.recognitions}</div>
                              <div className="text-xs text-muted-foreground">recognitions</div>
                            </div>
                            <div className="flex items-center gap-1">
                              {getChangeIcon(entry.change)}
                              <span className={`text-sm ${entry.change > 0 ? 'text-green-600' : entry.change < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                                {entry.change > 0 && '+'}{entry.change}
                              </span>
                            </div>
                          </div>
                        </div>

                        {entry.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {entry.categories.map((category, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">{category}</Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="quarterly">
              <div className="text-center py-8 text-muted-foreground">
                Quarterly leaderboard data will be available here
              </div>
            </TabsContent>

            <TabsContent value="annual">
              <div className="text-center py-8 text-muted-foreground">
                Annual leaderboard data will be available here
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}