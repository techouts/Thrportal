import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, User, MessageSquare } from 'lucide-react'

interface ApplicationTimelineTabProps {
  applicationId: string
}

export const ApplicationTimelineTab: React.FC<ApplicationTimelineTabProps> = ({ applicationId }) => {
  const timelineEvents = [
    {
      id: '1',
      timestamp: '2024-01-18T10:00:00Z',
      actor: 'John Recruiter',
      action: 'Stage Changed',
      details: 'Interview → Offer',
      type: 'stage_change'
    },
    {
      id: '2',
      timestamp: '2024-01-17T14:30:00Z',
      actor: 'Sarah Manager',
      action: 'Note Added',
      details: 'Strong technical performance in Round 2',
      type: 'note'
    },
    {
      id: '3',
      timestamp: '2024-01-16T14:30:00Z',
      actor: 'John Recruiter',
      action: 'Application Created',
      details: 'Via Mapping system',
      type: 'created'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Application Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timelineEvents.map((event) => (
            <div key={event.id} className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="flex-shrink-0">
                {event.type === 'stage_change' && <MessageSquare className="h-5 w-5 text-blue-500" />}
                {event.type === 'note' && <User className="h-5 w-5 text-green-500" />}
                {event.type === 'created' && <Clock className="h-5 w-5 text-purple-500" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{event.action}</span>
                  <Badge variant="outline">{event.actor}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{event.details}</p>
                <div className="text-xs text-muted-foreground">
                  {new Date(event.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}