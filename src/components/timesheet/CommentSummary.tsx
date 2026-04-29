import React from 'react'
import { format, addDays } from 'date-fns'
import { MessageSquare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TimesheetEntry } from '@/types/timesheet'

interface CommentSummaryProps {
  entries: TimesheetEntry[]
  weekStart: Date
}

interface CommentItem {
  projectName: string
  taskName: string
  dayIndex: number
  date: Date
  hours: number
  comment: string
}

export function CommentSummary({ entries, weekStart }: CommentSummaryProps) {
  // Extract all comments from entries
  const comments: CommentItem[] = []
  
  entries.forEach(entry => {
    entry.daily.forEach((daily, dayIndex) => {
      if (daily.hours > 0 && daily.comment?.trim()) {
        comments.push({
          projectName: entry.projectName,
          taskName: entry.taskName,
          dayIndex,
          date: addDays(weekStart, dayIndex),
          hours: daily.hours,
          comment: daily.comment
        })
      }
    })
  })

  // Group comments by project-task
  const groupedComments = comments.reduce((acc, item) => {
    const key = `${item.projectName} - ${item.taskName}`
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(item)
    return acc
  }, {} as Record<string, CommentItem[]>)

  const formatHours = (hours: number): string => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}:${m.toString().padStart(2, '0')}`
  }

  const hasComments = comments.length > 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Comment Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasComments ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground uppercase text-xs">
                    Project-Task
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground uppercase text-xs">
                    Comment
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedComments).map(([projectTask, items]) => (
                  <tr key={projectTask} className="border-b last:border-b-0">
                    <td className="py-3 px-3 align-top">
                      <span className="font-medium text-foreground">{projectTask}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="space-y-2">
                        {items.map((item, idx) => (
                          <div key={idx} className="text-sm">
                            <div className="text-muted-foreground text-xs mb-0.5">
                              {format(item.date, 'EEE, dd MMM')} • {formatHours(item.hours)} hrs
                            </div>
                            <div className="text-foreground">{item.comment}</div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No comments added yet</p>
            <p className="text-xs mt-1">Comments will appear here when you add them to time entries</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
