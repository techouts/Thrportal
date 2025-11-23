import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, User, MessageSquare, CheckCircle } from 'lucide-react'
import { ApplicationsService } from '@/services/applicationsService'
import { toast } from 'sonner'

interface ApplicationTimelineTabProps {
  applicationId: string
}

interface TimelineEvent {
  id: string
  timestamp: string
  actor: string
  action: string
  details: string
  type: string
  fromStatus?: string
  toStatus: string
  reason?: string
}

export const ApplicationTimelineTab: React.FC<ApplicationTimelineTabProps> = ({ applicationId }) => {
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTimeline()
  }, [applicationId])

  const loadTimeline = async () => {
    try {
      setLoading(true)
      const events = await ApplicationsService.getApplicationTimeline(applicationId)
      setTimelineEvents(events)
    } catch (error: any) {
      console.error('Error loading timeline:', error)
      toast.error('Failed to load timeline')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Application Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Application Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {timelineEvents.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No timeline events found</p>
        ) : (
          <div className="space-y-4">
            {timelineEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  {event.type === 'stage_change' && <MessageSquare className="h-5 w-5 text-blue-500" />}
                  {event.type === 'note' && <User className="h-5 w-5 text-green-500" />}
                  {event.type === 'status_update' && <CheckCircle className="h-5 w-5 text-purple-500" />}
                  {!['stage_change', 'note', 'status_update'].includes(event.type) && <Clock className="h-5 w-5 text-gray-500" />}
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
        )}
      </CardContent>
    </Card>
  )
}
