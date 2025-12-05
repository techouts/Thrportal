import React from 'react'
import { format } from 'date-fns'
import { Activity, CheckCircle, Send, RotateCcw, XCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { Timesheet, TimesheetEntry } from '@/types/timesheet'

interface TimesheetActivityProps {
  timesheet: Timesheet | null
  entries: TimesheetEntry[]
  weekStart: Date
  weekEnd: Date
}

interface ActivityItem {
  id: string
  action: 'submitted' | 'approved' | 'rejected' | 'recalled' | 'saved'
  actorName: string
  timestamp: Date
  details?: string
  taskCount?: number
}

export function TimesheetActivity({ timesheet, entries, weekStart, weekEnd }: TimesheetActivityProps) {
  // Generate activity items based on timesheet status
  const activities: ActivityItem[] = []
  
  if (timesheet) {
    const taskCount = entries.filter(e => e.daily.some(d => d.hours > 0)).length
    
    if (timesheet.status === 'APPROVED' && timesheet.approvedAt) {
      activities.push({
        id: 'approved',
        action: 'approved',
        actorName: 'Manager',
        timestamp: new Date(timesheet.approvedAt),
        details: `time entries for ${taskCount} task${taskCount !== 1 ? 's' : ''}`,
        taskCount
      })
    }
    
    if ((timesheet.status === 'SUBMITTED' || timesheet.status === 'APPROVED') && timesheet.submittedAt) {
      activities.push({
        id: 'submitted',
        action: 'submitted',
        actorName: 'You',
        timestamp: new Date(timesheet.submittedAt),
        details: `weekly timesheet with ${taskCount} task${taskCount !== 1 ? 's' : ''}`,
        taskCount
      })
    }
    
    if (timesheet.status === 'REJECTED' && timesheet.rejectedAt) {
      activities.push({
        id: 'rejected',
        action: 'rejected',
        actorName: 'Manager',
        timestamp: new Date(timesheet.rejectedAt),
        details: timesheet.approverComment || 'Timesheet rejected',
        taskCount
      })
    }
    
    if (timesheet.status === 'SAVED') {
      activities.push({
        id: 'saved',
        action: 'saved',
        actorName: 'You',
        timestamp: new Date(),
        details: `draft saved with ${taskCount} task${taskCount !== 1 ? 's' : ''}`,
        taskCount
      })
    }
  }

  // Sort by timestamp descending
  activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  const getActionIcon = (action: ActivityItem['action']) => {
    switch (action) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'submitted':
        return <Send className="h-4 w-4 text-blue-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'recalled':
        return <RotateCcw className="h-4 w-4 text-amber-500" />
      case 'saved':
        return <Clock className="h-4 w-4 text-muted-foreground" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getActionText = (activity: ActivityItem) => {
    switch (activity.action) {
      case 'approved':
        return `approved timesheet`
      case 'submitted':
        return `submitted weekly timesheet`
      case 'rejected':
        return `rejected timesheet`
      case 'recalled':
        return `recalled timesheet`
      case 'saved':
        return `saved timesheet as draft`
      default:
        return activity.action
    }
  }

  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return '1d ago'
    if (diffDays < 7) return `${diffDays}d ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
    return format(date, 'dd MMM yyyy')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const hasActivity = activities.length > 0
  const dateRange = `${format(weekStart, 'dd')}-${format(weekEnd, 'dd MMM yyyy')}`

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Timesheet Activity
          <span className="text-xs font-normal text-muted-foreground">({dateRange})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasActivity ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-muted">
                    {getInitials(activity.actorName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    {getActionIcon(activity.action)}
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.actorName}</span>{' '}
                        <span className="text-muted-foreground">{getActionText(activity)}</span>
                      </p>
                      {activity.details && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {activity.details}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {getRelativeTime(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No activity yet</p>
            <p className="text-xs mt-1">Activity will appear here when you save or submit</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
