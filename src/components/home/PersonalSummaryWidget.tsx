import React from 'react'
import { Calendar, Gift, MapPin, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface PersonalSummaryWidgetProps {
  leaveBalance?: number
  nextHoliday?: { name: string; date: string; days: number }
  upcomingEvents?: Array<{ type: string; title: string; date: string }>
}

export function PersonalSummaryWidget({ 
  leaveBalance = 18, 
  nextHoliday = { name: 'Christmas', date: 'Dec 25', days: 22 },
  upcomingEvents = []
}: PersonalSummaryWidgetProps) {
  const totalLeave = 25
  const leaveUsed = totalLeave - leaveBalance

  return (
    <Card className="h-full border-0 shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Personal Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Leave Balance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Leave Balance</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {leaveBalance} days
            </Badge>
          </div>
          <Progress value={(leaveBalance / totalLeave) * 100} className="h-2" />
          <div className="text-xs text-muted-foreground">
            {leaveUsed} used • {leaveBalance} remaining
          </div>
        </div>

        {/* Next Holiday */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Gift className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Next Holiday</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{nextHoliday.name}</div>
              <div className="text-xs text-muted-foreground">{nextHoliday.date}</div>
            </div>
            <Badge variant="outline" className="text-xs">
              {nextHoliday.days} days
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
          <div className="text-center">
            <div className="text-sm font-semibold text-green-600">9:15</div>
            <div className="text-xs text-muted-foreground">Avg Check-in</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-blue-600">95%</div>
            <div className="text-xs text-muted-foreground">Attendance</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}