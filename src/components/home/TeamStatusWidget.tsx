import React from 'react'
import { Users, MapPin, Home, Wifi, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface TeamMember {
  id: string
  name: string
  status: 'in_office' | 'remote' | 'wfh' | 'leave'
  avatar?: string
  location?: string
}

interface TeamStatusWidgetProps {
  teamMembers?: TeamMember[]
  isManager?: boolean
}

export function TeamStatusWidget({ 
  teamMembers = [],
  isManager = false 
}: TeamStatusWidgetProps) {
  const defaultTeamMembers: TeamMember[] = [
    { id: '1', name: 'Alice Chen', status: 'in_office', avatar: '/avatars/alice.jpg' },
    { id: '2', name: 'Bob Smith', status: 'remote', avatar: '/avatars/bob.jpg' },
    { id: '3', name: 'Carol Davis', status: 'wfh', avatar: '/avatars/carol.jpg' },
    { id: '4', name: 'David Kim', status: 'leave', avatar: '/avatars/david.jpg' },
    { id: '5', name: 'Eva Rodriguez', status: 'in_office', avatar: '/avatars/eva.jpg' },
    { id: '6', name: 'Frank Wilson', status: 'remote', avatar: '/avatars/frank.jpg' }
  ]

  const displayMembers = teamMembers.length > 0 ? teamMembers : defaultTeamMembers
  const inOffice = displayMembers.filter(m => m.status === 'in_office').length
  const total = displayMembers.length
  const coverage = Math.round((inOffice / total) * 100)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_office': return <MapPin className="h-3 w-3 text-green-600" />
      case 'remote': return <Wifi className="h-3 w-3 text-blue-600" />
      case 'wfh': return <Home className="h-3 w-3 text-purple-600" />
      case 'leave': return <div className="w-3 h-3 rounded-full bg-orange-400" />
      default: return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_office': return 'bg-green-100 text-green-700'
      case 'remote': return 'bg-blue-100 text-blue-700'
      case 'wfh': return 'bg-purple-100 text-purple-700'
      case 'leave': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (!isManager) {
    return null
  }

  return (
    <Card className="h-full border-0 shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Status
          </div>
          <div className="flex items-center gap-1">
            {coverage < 70 && <AlertTriangle className="h-3 w-3 text-orange-500" />}
            <Badge variant={coverage >= 70 ? 'secondary' : 'destructive'} className="text-xs">
              {coverage}%
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-center">
          <div className="text-lg font-semibold">{inOffice}/{total}</div>
          <div className="text-xs text-muted-foreground">In Office Today</div>
        </div>

        <div className="space-y-2">
          {displayMembers.slice(0, 6).map((member) => (
            <div key={member.id} className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={member.avatar} />
                <AvatarFallback className="text-xs">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs flex-1 truncate">{member.name}</span>
              <div className="flex items-center gap-1">
                {getStatusIcon(member.status)}
              </div>
            </div>
          ))}
          
          {displayMembers.length > 6 && (
            <div className="text-xs text-muted-foreground text-center pt-2 border-t">
              +{displayMembers.length - 6} more team members
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}