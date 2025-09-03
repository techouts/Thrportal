import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ActivityItem {
  id: string
  user: {
    name: string
    avatar?: string
    initials: string
    role: string
  }
  action: string
  target: string
  timestamp: string
  status: 'approved' | 'pending' | 'rejected' | 'info'
}

const activities: ActivityItem[] = [
  {
    id: '1',
    user: {
      name: 'Sarah Johnson',
      initials: 'SJ',
      role: 'Software Engineer'
    },
    action: 'submitted leave request',
    target: 'Vacation Leave - Dec 20-25',
    timestamp: '2 hours ago',
    status: 'pending'
  },
  {
    id: '2',
    user: {
      name: 'Mike Chen',
      initials: 'MC',
      role: 'Product Manager'
    },
    action: 'approved timesheet',
    target: 'Week ending Dec 15',
    timestamp: '4 hours ago',
    status: 'approved'
  },
  {
    id: '3',
    user: {
      name: 'Emily Davis',
      initials: 'ED',
      role: 'UX Designer'
    },
    action: 'updated profile',
    target: 'Emergency contact information',
    timestamp: '1 day ago',
    status: 'info'
  },
  {
    id: '4',
    user: {
      name: 'James Wilson',
      initials: 'JW',
      role: 'HR Specialist'
    },
    action: 'rejected expense claim',
    target: 'Travel expenses - Q4 conference',
    timestamp: '2 days ago',
    status: 'rejected'
  },
  {
    id: '5',
    user: {
      name: 'Lisa Park',
      initials: 'LP',
      role: 'DevOps Engineer'
    },
    action: 'completed performance review',
    target: 'Q4 2023 Review',
    timestamp: '3 days ago',
    status: 'approved'
  }
]

function getStatusIcon(status: ActivityItem['status']) {
  switch (status) {
    case 'approved':
      return <CheckCircle className="h-3 w-3" />
    case 'rejected':
      return <XCircle className="h-3 w-3" />
    case 'pending':
      return <Clock className="h-3 w-3" />
    case 'info':
      return <AlertCircle className="h-3 w-3" />
  }
}

function getStatusBadge(status: ActivityItem['status']) {
  const baseClasses = "flex items-center gap-1 text-xs"
  
  switch (status) {
    case 'approved':
      return (
        <Badge className={cn(baseClasses, "status-approved")}>
          {getStatusIcon(status)}
          Approved
        </Badge>
      )
    case 'rejected':
      return (
        <Badge className={cn(baseClasses, "status-rejected")}>
          {getStatusIcon(status)}
          Rejected
        </Badge>
      )
    case 'pending':
      return (
        <Badge className={cn(baseClasses, "status-pending")}>
          {getStatusIcon(status)}
          Pending
        </Badge>
      )
    case 'info':
      return (
        <Badge className={cn(baseClasses, "bg-blue-100 text-blue-800 border-blue-200")}>
          {getStatusIcon(status)}
          Updated
        </Badge>
      )
  }
}

export function RecentActivity() {
  return (
    <Card className="border-0 shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          <CardDescription>Latest HR actions and updates</CardDescription>
        </div>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <Avatar className="h-10 w-10">
              <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {activity.user.initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {activity.user.name}
                </p>
                <span className="text-sm text-muted-foreground">
                  {activity.action}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {activity.target}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {activity.user.role} • {activity.timestamp}
              </p>
            </div>
            
            <div className="flex-shrink-0">
              {getStatusBadge(activity.status)}
            </div>
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <Button variant="ghost" className="w-full">
            View all activity
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}