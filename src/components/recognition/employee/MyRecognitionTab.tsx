import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Filter, Heart, MessageCircle, Star, Award } from 'lucide-react'
import { format } from 'date-fns'

interface Recognition {
  id: string
  category: string
  message: string
  points: number
  giver: string
  receiver: string
  giverAvatar?: string
  receiverAvatar?: string
  date: string
  visibility: 'public' | 'private'
  badges?: string[]
  applauds: number
  comments: number
}

export const MyRecognitionTab = () => {
  const [activeSubTab, setActiveSubTab] = useState('received')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

  const receivedRecognitions: Recognition[] = [
    {
      id: '1',
      category: 'Customer Delight',
      message: 'Sarah went above and beyond to help a customer resolve a complex issue, staying late to ensure everything was perfect.',
      points: 15,
      giver: 'Mike Chen',
      receiver: 'You',
      giverAvatar: '/api/placeholder/32/32',
      date: '2024-01-15',
      visibility: 'public',
      badges: ['Customer Champion'],
      applauds: 12,
      comments: 3
    },
    {
      id: '2',
      category: 'Innovation Impact',
      message: 'Brilliant solution to optimize our database queries. Reduced response time by 40%!',
      points: 20,
      giver: 'Emily Davis',
      receiver: 'You',
      giverAvatar: '/api/placeholder/32/32',
      date: '2024-01-10',
      visibility: 'public',
      badges: ['Tech Innovator'],
      applauds: 18,
      comments: 5
    },
    {
      id: '3',
      category: 'Teamwork & Collaboration',
      message: 'Always willing to help team members and share knowledge. Great mentor!',
      points: 10,
      giver: 'Alex Rodriguez',
      receiver: 'You',
      giverAvatar: '/api/placeholder/32/32',
      date: '2024-01-08',
      visibility: 'private',
      badges: ['Team Player'],
      applauds: 8,
      comments: 2
    }
  ]

  const givenRecognitions: Recognition[] = [
    {
      id: '4',
      category: 'Quality Excellence',
      message: 'Exceptional attention to detail in code reviews. Caught several critical issues.',
      points: 15,
      giver: 'You',
      receiver: 'Lisa Wang',
      receiverAvatar: '/api/placeholder/32/32',
      date: '2024-01-12',
      visibility: 'public',
      badges: ['Excellence'],
      applauds: 10,
      comments: 1
    },
    {
      id: '5',
      category: 'Rising Star',
      message: 'Incredible growth and learning ability. Led the project migration successfully.',
      points: 20,
      giver: 'You',
      receiver: 'Jordan Smith',
      receiverAvatar: '/api/placeholder/32/32',
      date: '2024-01-09',
      visibility: 'public',
      badges: ['Rising Star'],
      applauds: 15,
      comments: 4
    }
  ]

  const categories = ['Customer Delight', 'Innovation Impact', 'Teamwork & Collaboration', 'Quality Excellence', 'Rising Star', 'Ownership & Leadership']

  const filterRecognitions = (recognitions: Recognition[]) => {
    return recognitions.filter(recognition => {
      const categoryMatch = categoryFilter === 'all' || recognition.category === categoryFilter
      const dateMatch = dateFilter === 'all' || 
        (dateFilter === 'this-month' && new Date(recognition.date).getMonth() === new Date().getMonth()) ||
        (dateFilter === 'last-month' && new Date(recognition.date).getMonth() === new Date().getMonth() - 1) ||
        (dateFilter === 'this-year' && new Date(recognition.date).getFullYear() === new Date().getFullYear())
      
      return categoryMatch && dateMatch
    })
  }

  const RecognitionCard = ({ recognition }: { recognition: Recognition }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={recognition.giverAvatar || recognition.receiverAvatar} />
              <AvatarFallback>
                {(recognition.giver === 'You' ? recognition.receiver : recognition.giver).split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">
                {recognition.giver === 'You' ? recognition.receiver : recognition.giver}
              </div>
              <div className="text-sm text-muted-foreground">
                {recognition.giver === 'You' ? 'You recognized' : 'Recognized you'} • {format(new Date(recognition.date), 'MMM d, yyyy')}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {recognition.points} pts
            </Badge>
            {recognition.visibility === 'private' && (
              <Badge variant="outline">Private</Badge>
            )}
          </div>
        </div>

        <div className="mb-3">
          <Badge className="mb-2">{recognition.category}</Badge>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          "{recognition.message}"
        </p>

        {recognition.badges && recognition.badges.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {recognition.badges.map((badge, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                <Award className="h-3 w-3 mr-1" />
                {badge}
              </Badge>
            ))}
          </div>
        )}

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
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Recognition</CardTitle>
          <CardDescription>View recognition you've received and given to others</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="space-y-6">
            <TabsList className="grid grid-cols-2 w-full max-w-md">
              <TabsTrigger value="received">Received ({receivedRecognitions.length})</TabsTrigger>
              <TabsTrigger value="given">Given ({givenRecognitions.length})</TabsTrigger>
            </TabsList>

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
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <TabsContent value="received" className="space-y-4">
              {filterRecognitions(receivedRecognitions).map((recognition) => (
                <RecognitionCard key={recognition.id} recognition={recognition} />
              ))}
              {filterRecognitions(receivedRecognitions).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No recognitions found with the current filters
                </div>
              )}
            </TabsContent>

            <TabsContent value="given" className="space-y-4">
              {filterRecognitions(givenRecognitions).map((recognition) => (
                <RecognitionCard key={recognition.id} recognition={recognition} />
              ))}
              {filterRecognitions(givenRecognitions).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No recognitions found with the current filters
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}