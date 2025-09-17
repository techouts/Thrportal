import React, { useState } from 'react'
import { Gift, Cake, Star, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Celebration {
  id: string
  type: 'birthday' | 'anniversary' | 'new_joiner'
  name: string
  date: string
  years?: number
  avatar?: string
  team?: string
}

interface CelebrationsWidgetProps {
  celebrations?: Celebration[]
}

export function CelebrationsWidget({ celebrations = [] }: CelebrationsWidgetProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const defaultCelebrations: Celebration[] = [
    { id: '1', type: 'birthday', name: 'Sarah Johnson', date: 'Today', avatar: '/avatars/sarah.jpg', team: 'Engineering' },
    { id: '2', type: 'anniversary', name: 'Mike Chen', date: 'Tomorrow', years: 3, avatar: '/avatars/mike.jpg', team: 'Marketing' },
    { id: '3', type: 'new_joiner', name: 'Alex Rivera', date: 'This week', avatar: '/avatars/alex.jpg', team: 'Design' },
    { id: '4', type: 'birthday', name: 'Lisa Park', date: 'Dec 15', avatar: '/avatars/lisa.jpg', team: 'HR' }
  ]

  const displayCelebrations = celebrations.length > 0 ? celebrations : defaultCelebrations
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'birthday': return <Cake className="h-3 w-3 text-pink-600" />
      case 'anniversary': return <Star className="h-3 w-3 text-yellow-600" />
      case 'new_joiner': return <UserPlus className="h-3 w-3 text-green-600" />
      default: return <Gift className="h-3 w-3" />
    }
  }

  const getTitle = (type: string, years?: number) => {
    switch (type) {
      case 'birthday': return 'Birthday'
      case 'anniversary': return `${years} Year${years !== 1 ? 's' : ''} Anniversary`
      case 'new_joiner': return 'New Team Member'
      default: return 'Celebration'
    }
  }

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % displayCelebrations.length)
  }

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + displayCelebrations.length) % displayCelebrations.length)
  }

  if (displayCelebrations.length === 0) {
    return null
  }

  const currentCelebration = displayCelebrations[currentIndex]

  return (
    <Card className="h-full border-0 shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Celebrations
          </div>
          <Badge variant="secondary" className="text-xs">
            {displayCelebrations.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-center space-y-3">
          <Avatar className="h-12 w-12 mx-auto">
            <AvatarImage src={currentCelebration.avatar} />
            <AvatarFallback>
              {currentCelebration.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-1">
            <h4 className="font-medium text-sm">{currentCelebration.name}</h4>
            <div className="flex items-center justify-center gap-2">
              {getIcon(currentCelebration.type)}
              <span className="text-xs text-muted-foreground">
                {getTitle(currentCelebration.type, currentCelebration.years)}
              </span>
            </div>
            <Badge variant="outline" className="text-xs">
              {currentCelebration.date}
            </Badge>
          </div>
        </div>

        {displayCelebrations.length > 1 && (
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={prev}>
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <div className="flex gap-1">
              {displayCelebrations.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full ${
                    index === currentIndex ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={next}>
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        )}

        <Button variant="outline" size="sm" className="w-full">
          Send Wishes
        </Button>
      </CardContent>
    </Card>
  )
}