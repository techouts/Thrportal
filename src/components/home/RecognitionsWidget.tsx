import React, { useState } from 'react'
import { Star, Heart, ThumbsUp, MessageSquare, MoreHorizontal } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Recognition {
  id: string
  giver: { name: string; avatar?: string }
  receiver: { name: string; avatar?: string }
  category: string
  message: string
  applauds: number
  timeAgo: string
}

interface RecognitionsWidgetProps {
  recognitions?: Recognition[]
}

export function RecognitionsWidget({ recognitions = [] }: RecognitionsWidgetProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  
  const defaultRecognitions: Recognition[] = [
    {
      id: '1',
      giver: { name: 'John Doe', avatar: '/avatars/john.jpg' },
      receiver: { name: 'Jane Smith', avatar: '/avatars/jane.jpg' },
      category: 'Customer Delight',
      message: 'Jane went above and beyond to help a customer resolve their complex issue. Her dedication and problem-solving skills are truly impressive.',
      applauds: 12,
      timeAgo: '2h ago'
    },
    {
      id: '2',
      giver: { name: 'Alice Chen', avatar: '/avatars/alice.jpg' },
      receiver: { name: 'Bob Wilson', avatar: '/avatars/bob.jpg' },
      category: 'Innovation',
      message: 'Bob\'s creative solution to optimize our deployment process saved us hours of work.',
      applauds: 8,
      timeAgo: '4h ago'
    },
    {
      id: '3',
      giver: { name: 'Carol Davis', avatar: '/avatars/carol.jpg' },
      receiver: { name: 'David Kim', avatar: '/avatars/david.jpg' },
      category: 'Teamwork',
      message: 'David has been an amazing mentor and teammate.',
      applauds: 15,
      timeAgo: '1d ago'
    }
  ]

  const displayRecognitions = recognitions.length > 0 ? recognitions : defaultRecognitions

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Customer Delight': 'bg-pink-100 text-pink-700',
      'Innovation': 'bg-blue-100 text-blue-700',
      'Teamwork': 'bg-green-100 text-green-700',
      'Excellence': 'bg-purple-100 text-purple-700'
    }
    return colors[category] || 'bg-gray-100 text-gray-700'
  }

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const truncateMessage = (message: string, limit: number = 80) => {
    return message.length > limit ? message.substring(0, limit) + '...' : message
  }

  return (
    <Card className="h-full border-0 shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Recent Recognitions
          </div>
          <Badge variant="secondary" className="text-xs">
            {displayRecognitions.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-48 px-6">
          <div className="space-y-3">
            {displayRecognitions.map((recognition) => (
              <div key={recognition.id} className="space-y-2">
                <div className="flex items-start gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={recognition.receiver.avatar} />
                    <AvatarFallback className="text-xs">
                      {recognition.receiver.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium truncate">
                        {recognition.receiver.name}
                      </span>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getCategoryColor(recognition.category)}`}
                      >
                        {recognition.category}
                      </Badge>
                    </div>
                    
                    <div className="text-xs text-muted-foreground mb-2">
                      <span
                        className={`cursor-pointer ${expandedId === recognition.id ? '' : 'line-clamp-2'}`}
                        onClick={() => toggleExpanded(recognition.id)}
                      >
                        {expandedId === recognition.id 
                          ? recognition.message 
                          : truncateMessage(recognition.message)
                        }
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                          <ThumbsUp className="h-2 w-2 mr-1" />
                          {recognition.applauds}
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          {recognition.timeAgo}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        by {recognition.giver.name}
                      </span>
                    </div>
                  </div>
                </div>
                
                {recognition.id !== displayRecognitions[displayRecognitions.length - 1].id && (
                  <hr className="border-muted" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}