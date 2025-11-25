import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Minus, Filter } from 'lucide-react'

interface TeamMember {
  rank: number
  name: string
  role: string
  avatar?: string
  points: number
  recognitions: number
  categories: string[]
  change: number
  giveRatio: number
}

export const TeamLeaderboardTab = () => {
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [period, setPeriod] = useState('monthly')

  const teamMembers: TeamMember[] = [
    {
      rank: 1,
      name: 'Sarah Johnson',
      role: 'Senior Developer',
      avatar: '/api/placeholder/32/32',
      points: 385,
      recognitions: 23,
      categories: ['Innovation', 'Quality'],
      change: 2,
      giveRatio: 1.8
    },
    {
      rank: 2,
      name: 'Mike Chen',
      role: 'UX Designer',
      avatar: '/api/placeholder/32/32',
      points: 352,
      recognitions: 21,
      categories: ['Customer Delight', 'Innovation'],
      change: -1,
      giveRatio: 2.1
    },
    {
      rank: 3,
      name: 'Emily Davis',
      role: 'Product Manager',
      avatar: '/api/placeholder/32/32',
      points: 341,
      recognitions: 19,
      categories: ['Leadership', 'Teamwork'],
      change: 1,
      giveRatio: 1.5
    },
    {
      rank: 4,
      name: 'Alex Rodriguez',
      role: 'Marketing Lead',
      avatar: '/api/placeholder/32/32',
      points: 298,
      recognitions: 18,
      categories: ['Customer Delight', 'Rising Star'],
      change: 0,
      giveRatio: 1.9
    },
    {
      rank: 5,
      name: 'Jordan Smith',
      role: 'Junior Developer',
      avatar: '/api/placeholder/32/32',
      points: 287,
      recognitions: 16,
      categories: ['Rising Star', 'Innovation'],
      change: 3,
      giveRatio: 1.2
    },
    {
      rank: 6,
      name: 'Lisa Wang',
      role: 'Tech Lead',
      avatar: '/api/placeholder/32/32',
      points: 245,
      recognitions: 14,
      categories: ['Quality', 'Leadership'],
      change: -2,
      giveRatio: 2.3
    }
  ]

  const categoryStats = [
    { category: 'Customer Delight', count: 45, topPerformer: 'Mike Chen' },
    { category: 'Innovation Impact', count: 38, topPerformer: 'Sarah Johnson' },
    { category: 'Teamwork & Collaboration', count: 42, topPerformer: 'Emily Davis' },
    { category: 'Quality Excellence', count: 33, topPerformer: 'Lisa Wang' },
    { category: 'Rising Star', count: 28, topPerformer: 'Jordan Smith' },
    { category: 'Ownership & Leadership', count: 25, topPerformer: 'Emily Davis' }
  ]

  const categories = categoryStats.map(stat => stat.category)

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
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
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  const getGiveRatioColor = (ratio: number) => {
    if (ratio >= 2) return 'text-green-600'
    if (ratio >= 1.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Team Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Average</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">318</div>
            <p className="text-xs text-muted-foreground">Points per member</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recognitions</CardTitle>
            <Award className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">111</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participation Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95%</div>
            <p className="text-xs text-muted-foreground">Active members</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Category Performance</CardTitle>
          <CardDescription>Recognition breakdown by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryStats.map((stat) => (
              <div key={stat.category} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{stat.category}</Badge>
                  <span className="text-2xl font-bold">{stat.count}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Top performer: <span className="font-medium">{stat.topPerformer}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Team Leaderboard</CardTitle>
          <CardDescription>Monthly rankings with category-wise breakdown</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filter by:</span>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rankings */}
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <Card key={member.rank} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8">
                        {getRankIcon(member.rank)}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">{member.role}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="font-semibold text-lg">{member.points}</div>
                        <div className="text-xs text-muted-foreground">points</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{member.recognitions}</div>
                        <div className="text-xs text-muted-foreground">recognitions</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${getGiveRatioColor(member.giveRatio)}`}>
                          {member.giveRatio}:1
                        </div>
                        <div className="text-xs text-muted-foreground">give ratio</div>
                      </div>
                      <div className="flex items-center gap-1">
                        {getChangeIcon(member.change)}
                        <span className={`text-sm ${member.change > 0 ? 'text-green-600' : member.change < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                          {member.change > 0 && '+'}{member.change || '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {member.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      <span className="text-xs text-muted-foreground mr-2">Strong in:</span>
                      {member.categories.map((category, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">{category}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}