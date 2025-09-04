import { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string | number
  description?: string
  icon?: ReactNode
  trend?: {
    direction: 'up' | 'down' | 'neutral'
    value: string
    label?: string
  }
  badge?: {
    text: string
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  }
  onClick?: () => void
  testId?: string
}

export function KPICard({
  title,
  value,
  description,
  icon,
  trend,
  badge,
  onClick,
  testId = "kpi-card"
}: KPICardProps) {
  const getTrendIcon = () => {
    switch (trend?.direction) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-600" />
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-600" />
      case 'neutral':
        return <Minus className="h-3 w-3 text-muted-foreground" />
      default:
        return null
    }
  }

  const getTrendColor = () => {
    switch (trend?.direction) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      case 'neutral':
        return 'text-muted-foreground'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <Card 
      className={`${onClick ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''}`}
      onClick={onClick}
      data-test-id={testId}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          {badge && (
            <Badge variant={badge.variant || 'secondary'} className="text-xs">
              {badge.text}
            </Badge>
          )}
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        
        <div className="flex items-center justify-between mt-2">
          {description && (
            <p className="text-xs text-muted-foreground flex-1">
              {description}
            </p>
          )}
          
          {trend && (
            <div className={`flex items-center gap-1 text-xs ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>{trend.value}</span>
              {trend.label && (
                <span className="text-muted-foreground ml-1">
                  {trend.label}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}