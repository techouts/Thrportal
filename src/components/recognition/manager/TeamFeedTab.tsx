import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Heart, MessageCircle, Star, Filter, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'

interface TeamRecognition {
  id: string
  giver: string
  receiver: string
  giverAvatar?: string
  receiverAvatar?: string
  category: string
  message: string
  points: number
  date: string
  applauds: number
  comments: number
  isHighlight?: boolean
}

export const TeamFeedTab = () => {
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [giverFilter, setGiverFilter] = useState('all')

  const teamRecognitions: TeamRecognition[] = [
    {
      id: '1',
      giver: 'Sarah Johnson',
      receiver: 'Mike Chen',
      giverAvatar: '/api/placeholder/32/32',
      receiverAvatar: '/api/placeholder/32/32',
      category: 'Customer Delight',
      message: 'Mike went above and beyond to help debug a critical customer issue. His quick thinking and dedication saved the day!',
      points: 15,
      date: '2024-01-15',
      applauds: 12,
      comments: 3,
      isHighlight: true
    },
    {
      id: '2',
      giver: 'Emily Davis',
      receiver: 'Alex Rodriguez',
      giverAvatar: '/api/placeholder/32/32',
      receiverAvatar: '/api/placeholder/32/32',
      category: 'Innovation Impact',
      message: 'Alex developed an amazing automation script that will save us hours of manual work every week.',
      points: 20,
      date: '2024-01-14',
      applauds: 18,
      comments: 5
    },
    {
      id: '3',
      giver: 'Jordan Smith',
      receiver: 'Lisa Wang',
      giverAvatar: '/api/placeholder/32/32',
      receiverAvatar: '/api/placeholder/32/32',
      category: 'Teamwork & Collaboration',
      message: 'Lisa has been an incredible mentor to our new team members. Her patience and guidance are invaluable.',
      points: 10,
      date: '2024-01-13',
      applauds: 15,
      comments: 7,
      isHighlight: true
    },
    {
      id: '4',
      giver: 'Mike Chen',
      receiver: 'Jordan Smith',
      giverAvatar: '/api/placeholder/32/32',
      receiverAvatar: '/api/placeholder/32/32',
      category: 'Quality Excellence',
      message: 'Jordan\'s attention to detail in code reviews has prevented several potential issues. Outstanding quality focus!',
      points: 15,
      date: '2024-01-12',
      applauds: 9,
      comments: 2
    },
    {
      id: '5',
      giver: 'Lisa Wang',
      receiver: 'Emily Davis',
      giverAvatar: '/api/placeholder/32/32',
      receiverAvatar: '/api/placeholder/32/32',
      category: 'Rising Star',
      message: 'Emily has shown incredible growth this quarter. Her leadership in the recent project was exemplary.',
      points: 20,
      date: '2024-01-11',
      applauds: 22,
      comments: 8,
      isHighlight: true
    }
  ]

  const topRecognitions = teamRecognitions.filter(r => r.isHighlight).slice(0, 5)

  const categories = ['Customer Delight', 'Innovation Impact', 'Teamwork & Collaboration', 'Quality Excellence', 'Rising Star', 'Ownership & Leadership']
  const teamMembers = Array.from(new Set([...teamRecognitions.map(r => r.giver), ...teamRecognitions.map(r => r.receiver)]))

  const filteredRecognitions = teamRecognitions.filter(recognition => {
    const categoryMatch = categoryFilter === 'all' || recognition.category === categoryFilter
    const giverMatch = giverFilter === 'all' || recognition.giver === giverFilter
    return categoryMatch && giverMatch
  })

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Customer Delight': 'bg-blue-100 text-blue-800',
      'Innovation Impact': 'bg-purple-100 text-purple-800',
      'Teamwork & Collaboration': 'bg-green-100 text-green-800',
      'Quality Excellence': 'bg-indigo-100 text-indigo-800',
      'Rising Star': 'bg-yellow-100 text-yellow-800',
      'Ownership & Leadership': 'bg-orange-100 text-orange-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Top Recognitions Highlight */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Top 5 Team Recognitions This Week
          </CardTitle>
          <CardDescription>
            Celebrating our team's outstanding achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topRecognitions.map((recognition, index) => (
              <div key={recognition.id} className="relative p-4 border rounded-lg bg-gradient-to-br from-primary/5 to-primary/10">
                <div className="absolute -top-2 -left-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {index + 1}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={recognition.receiverAvatar} alt={recognition.receiver} />
                      <AvatarFallback className="text-xs">{recognition.receiver.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">{recognition.receiver}</span>
                  </div>
                  <Badge className={`${getCategoryColor(recognition.category)} text-xs`}>
                    {recognition.category}
                  </Badge>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    "{recognition.message}"
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {recognition.points} pts
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {recognition.applauds}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Team Recognitions */}
      <Card>
        <CardHeader>
          <CardTitle>Team Recognition Feed</CardTitle>
          <CardDescription>
            All recognitions within your team
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filters:</span>
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
            <Select value={giverFilter} onValueChange={setGiverFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Team Members" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Team Members</SelectItem>
                {teamMembers.map((member) => (
                  <SelectItem key={member} value={member}>{member}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recognition Cards */}
          <div className="space-y-4">
            {filteredRecognitions.map((recognition) => (
              <Card key={recognition.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={recognition.giverAvatar} alt={recognition.giver} />
                        <AvatarFallback>{recognition.giver.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{recognition.giver}</div>
                        <div className="text-sm text-muted-foreground">
                          recognized {recognition.receiver} • {format(new Date(recognition.date), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {recognition.points} pts
                      </Badge>
                      {recognition.isHighlight && (
                        <Badge className="bg-primary/10 text-primary border-primary">
                          Top Recognition
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <Badge className={getCategoryColor(recognition.category)}>
                      {recognition.category}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    "{recognition.message}"
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <Heart className="h-4 w-4 mr-1" />
                        {recognition.applauds}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {recognition.comments}
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={recognition.receiverAvatar} alt={recognition.receiver} />
                        <AvatarFallback className="text-xs">{recognition.receiver.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{recognition.receiver}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredRecognitions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No recognitions found with the current filters
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}