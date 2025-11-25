import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, User, Edit, Trash2, Plus, CheckCircle, XCircle } from 'lucide-react'

interface AuditEntry {
  id: string
  timestamp: string
  user: {
    name: string
    avatar?: string
    email: string
  }
  action: 'created' | 'updated' | 'deleted' | 'approved' | 'rejected' | 'submitted'
  details: string
  changes?: {
    field: string
    oldValue?: string
    newValue?: string
  }[]
  metadata?: Record<string, any>
}

interface AuditTrailProps {
  entries: AuditEntry[]
  title?: string
  compact?: boolean
  maxHeight?: string
}

export function AuditTrail({ 
  entries, 
  title = "Activity Log", 
  compact = false,
  maxHeight = "400px"
}: AuditTrailProps) {
  const getActionIcon = (action: AuditEntry['action']) => {
    switch (action) {
      case 'created':
        return <Plus className="h-4 w-4 text-green-600" />
      case 'updated':
        return <Edit className="h-4 w-4 text-blue-600" />
      case 'deleted':
        return <Trash2 className="h-4 w-4 text-red-600" />
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'submitted':
        return <Clock className="h-4 w-4 text-orange-600" />
      default:
        return <User className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getActionColor = (action: AuditEntry['action']) => {
    switch (action) {
      case 'created':
      case 'approved':
        return 'default'
      case 'updated':
      case 'submitted':
        return 'default'
      case 'deleted':
      case 'rejected':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No activity yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="space-y-4 overflow-y-auto" 
          style={{ maxHeight }}
        >
          {entries.map((entry, index) => (
            <div 
              key={entry.id} 
              className={`flex gap-3 ${compact ? 'pb-3' : 'pb-4'} ${
                index !== entries.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={entry.user.avatar} />
                <AvatarFallback>
                  {entry.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{entry.user.name}</span>
                  {getActionIcon(entry.action)}
                  <Badge 
                    variant={getActionColor(entry.action)} 
                    className="text-xs"
                  >
                    {entry.action}
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {formatTimestamp(entry.timestamp)}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground">{entry.details}</p>
                
                {entry.changes && entry.changes.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {entry.changes.map((change, changeIndex) => (
                      <div key={changeIndex} className="text-xs bg-muted/50 rounded p-2">
                        <span className="font-medium">{change.field}:</span>
                        {change.oldValue && (
                          <span className="text-red-600 line-through ml-1">
                            {change.oldValue}
                          </span>
                        )}
                        {change.newValue && (
                          <span className="text-green-600 ml-1">
                            {change.newValue}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}