import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Users, Calendar, Clock, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string
  change: {
    value: string
    type: 'increase' | 'decrease' | 'neutral'
  }
  icon: React.ElementType
  description?: string
}

function MetricCard({ title, value, change, icon: Icon, description }: MetricCardProps) {
  return (
    <Card className="metric-card border-0 transition-all duration-300 hover:shadow-elevated">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-foreground">{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <Badge
            variant="secondary"
            className={cn(
              "flex items-center gap-1 text-xs",
              change.type === 'increase' && "bg-green-100 text-green-800 border-green-200",
              change.type === 'decrease' && "bg-red-100 text-red-800 border-red-200",
              change.type === 'neutral' && "bg-blue-100 text-blue-800 border-blue-200"
            )}
          >
            {change.type === 'increase' && <TrendingUp className="h-3 w-3" />}
            {change.type === 'decrease' && <TrendingDown className="h-3 w-3" />}
            {change.value}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardMetrics() {
  const metrics = [
    {
      title: "Total Employees",
      value: "1,247",
      change: { value: "+12%", type: 'increase' as const },
      icon: Users,
      description: "Active employees"
    },
    {
      title: "Leave Requests",
      value: "23",
      change: { value: "+5", type: 'increase' as const },
      icon: Calendar,
      description: "Pending approval"
    },
    {
      title: "Avg. Check-in Time",
      value: "9:15 AM",
      change: { value: "-5 min", type: 'increase' as const },
      icon: Clock,
      description: "This month"
    },
    {
      title: "Payroll Processing",
      value: "$2.4M",
      change: { value: "+8%", type: 'increase' as const },
      icon: DollarSign,
      description: "Current month"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  )
}