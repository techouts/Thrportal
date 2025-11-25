import React from 'react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import type { TimesheetTotals } from '@/types/timesheet'

interface OverviewBarProps {
  data: TimesheetTotals
}

export function OverviewBar({ data }: OverviewBarProps) {
  const total = data.billable + data.nonBillable + data.timeOff
  const billablePercent = total > 0 ? (data.billable / total) * 100 : 0
  const nonBillablePercent = total > 0 ? (data.nonBillable / total) * 100 : 0
  const timeOffPercent = total > 0 ? (data.timeOff / total) * 100 : 0

  return (
    <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Week Overview</h3>
        <div className="text-2xl font-bold">{total.toFixed(1)}h</div>
      </div>
      
      <div className="space-y-2">
        <div className="relative">
          <Progress value={billablePercent} className="h-6" />
          <div 
            className="absolute top-0 left-0 h-6 bg-orange-500 rounded-l-md transition-all"
            style={{ width: `${nonBillablePercent}%`, marginLeft: `${billablePercent}%` }}
          />
          <div 
            className="absolute top-0 right-0 h-6 bg-red-500 rounded-r-md transition-all"
            style={{ width: `${timeOffPercent}%` }}
          />
        </div>
        
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary" />
            <span>Billable ({data.billable.toFixed(1)}h)</span>
            <Badge variant="secondary">{billablePercent.toFixed(0)}%</Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-500" />
            <span>Non-billable ({data.nonBillable.toFixed(1)}h)</span>
            <Badge variant="secondary">{nonBillablePercent.toFixed(0)}%</Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span>Time-off ({data.timeOff.toFixed(1)}h)</span>
            <Badge variant="secondary">{timeOffPercent.toFixed(0)}%</Badge>
          </div>
        </div>
      </div>
    </div>
  )
}