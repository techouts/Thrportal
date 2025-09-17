import React from 'react'
import { FileText, Calendar, DollarSign, Clock, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ApprovalItem {
  type: 'timesheet' | 'leave' | 'expense'
  count: number
  urgent?: number
}

interface ApprovalsWidgetProps {
  approvals?: ApprovalItem[]
  isManager?: boolean
}

export function ApprovalsWidget({ 
  approvals = [],
  isManager = false 
}: ApprovalsWidgetProps) {
  const defaultApprovals: ApprovalItem[] = [
    { type: 'timesheet', count: 5, urgent: 2 },
    { type: 'leave', count: 3, urgent: 1 },
    { type: 'expense', count: 7, urgent: 0 }
  ]

  const displayApprovals = approvals.length > 0 ? approvals : defaultApprovals

  const getIcon = (type: string) => {
    switch (type) {
      case 'timesheet': return <Clock className="h-4 w-4 text-blue-600" />
      case 'leave': return <Calendar className="h-4 w-4 text-green-600" />
      case 'expense': return <DollarSign className="h-4 w-4 text-purple-600" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getLabel = (type: string) => {
    switch (type) {
      case 'timesheet': return 'Timesheets'
      case 'leave': return 'Leave Requests'
      case 'expense': return 'Expenses'
      default: return 'Items'
    }
  }

  const totalPending = displayApprovals.reduce((sum, item) => sum + item.count, 0)
  const totalUrgent = displayApprovals.reduce((sum, item) => sum + (item.urgent || 0), 0)

  if (!isManager) {
    return null
  }

  return (
    <Card className="h-full border-0 shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Approvals
          </div>
          <div className="flex items-center gap-1">
            {totalUrgent > 0 && <AlertTriangle className="h-3 w-3 text-orange-500" />}
            <Badge variant={totalUrgent > 0 ? 'destructive' : 'secondary'} className="text-xs">
              {totalPending}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-center">
          <div className="text-lg font-semibold">{totalPending}</div>
          <div className="text-xs text-muted-foreground">Pending Approvals</div>
          {totalUrgent > 0 && (
            <div className="text-xs text-orange-600 font-medium">
              {totalUrgent} urgent
            </div>
          )}
        </div>

        <div className="space-y-2">
          {displayApprovals.map((approval) => (
            <div key={approval.type} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getIcon(approval.type)}
                <span className="text-xs">{getLabel(approval.type)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs">
                  {approval.count}
                </Badge>
                {approval.urgent && approval.urgent > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {approval.urgent}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" size="sm" className="w-full">
          Review All
        </Button>
      </CardContent>
    </Card>
  )
}