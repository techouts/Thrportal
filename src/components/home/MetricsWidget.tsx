import React from 'react'
import { TrendingUp, Users, Calendar, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface MetricItem {
  label: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon: React.ElementType
}

interface MetricsWidgetProps {
  metrics?: MetricItem[]
}

export function MetricsWidget({ metrics }: MetricsWidgetProps) {
  const defaultMetrics: MetricItem[] = [
    { label: 'Team Present', value: '8/10', change: '+2', trend: 'up', icon: Users },
    { label: 'Coverage', value: '80%', change: '5%', trend: 'up', icon: TrendingUp },
    { label: 'Pending', value: '3', change: '+1', trend: 'down', icon: Calendar },
    { label: 'Avg Check-in', value: '9:15', change: '-5m', trend: 'up', icon: Clock }
  ]

  const displayMetrics = metrics || defaultMetrics

  return (
    <Card className="h-full border-0 shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Today's Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {displayMetrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center gap-1">
                  <Icon className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{metric.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold">{metric.value}</span>
                  {metric.change && (
                    <Badge 
                      variant="secondary" 
                      className={`text-xs h-4 ${
                        metric.trend === 'up' ? 'text-green-600' : 
                        metric.trend === 'down' ? 'text-red-600' : 
                        'text-muted-foreground'
                      }`}
                    >
                      {metric.change}
                    </Badge>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}