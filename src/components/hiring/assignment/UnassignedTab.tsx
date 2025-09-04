import { useState, useEffect } from 'react'
import { Users, Clock, AlertTriangle, UserCheck, MoreHorizontal } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/shared/DataTable'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { assignmentService } from '@/services/assignmentService'
import type { JDAssignment, AssignmentFilters } from '@/types/assignment'

interface UnassignedTabProps {
  filters: AssignmentFilters
}

export function UnassignedTab({ filters }: UnassignedTabProps) {
  const [unassignedJDs, setUnassignedJDs] = useState<JDAssignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUnassignedJDs()
  }, [filters])

  const loadUnassignedJDs = async () => {
    setLoading(true)
    try {
      const data = await assignmentService.getUnassignedJDs()
      setUnassignedJDs(data)
    } catch (error) {
      console.error('Failed to load unassigned JDs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAssign = async (jdId: string, recruiter: string) => {
    await assignmentService.assignRecruiter(jdId, [recruiter])
    loadUnassignedJDs()
  }

  const columns = [
    {
      id: 'jdInfo',
      header: 'JD Details',
      accessor: 'jdId' as keyof JDAssignment,
      cell: (item: JDAssignment) => (
        <div>
          <div className="font-medium">{item.jdId}</div>
          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
            {item.title}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge 
              variant={item.jdAge > 7 ? 'destructive' : item.jdAge > 3 ? 'secondary' : 'default'}
              className="text-xs"
            >
              <Clock className="h-3 w-3 mr-1" />
              {item.jdAge} days old
            </Badge>
          </div>
        </div>
      )
    },
    {
      id: 'client',
      header: 'Client',
      accessor: 'client' as keyof JDAssignment
    },
    {
      id: 'priority',
      header: 'Priority',
      accessor: 'priority' as keyof JDAssignment,
      cell: (item: JDAssignment) => (
        <Badge 
          variant={item.priority === 'Urgent' ? 'destructive' : 
                  item.priority === 'Standard' ? 'default' : 'secondary'}
        >
          {item.priority}
        </Badge>
      )
    },
    {
      id: 'suggestedRecruiter',
      header: 'Suggested Recruiter',
      accessor: 'id' as keyof JDAssignment,
      cell: (item: JDAssignment) => {
        // Mock AI suggestion logic
        const suggestions = ['Alice Johnson', 'Bob Smith', 'Carol Davis']
        const suggested = suggestions[Math.floor(Math.random() * suggestions.length)]
        return (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <UserCheck className="h-3 w-3 mr-1" />
              {suggested}
            </Badge>
            <span className="text-xs text-muted-foreground">Low load</span>
          </div>
        )
      }
    },
    {
      id: 'sourcingChannels',
      header: 'Suggested Channels',
      accessor: 'sourcingChannels' as keyof JDAssignment,
      cell: (item: JDAssignment) => (
        <div className="flex flex-wrap gap-1">
          {['LinkedIn', 'Naukri'].map(channel => (
            <Badge key={channel} variant="outline" className="text-xs">
              {channel}
            </Badge>
          ))}
        </div>
      )
    },
    {
      id: 'urgencyIndicator',
      header: 'Urgency',
      accessor: 'jdAge' as keyof JDAssignment,
      cell: (item: JDAssignment) => {
        if (item.jdAge > 7 && item.priority === 'Urgent') {
          return (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Critical
            </Badge>
          )
        }
        if (item.jdAge > 7) {
          return (
            <Badge variant="secondary" className="text-xs">
              Aging
            </Badge>
          )
        }
        return (
          <Badge variant="default" className="text-xs">
            Normal
          </Badge>
        )
      }
    }
  ]

  const actions = [
    {
      label: 'Quick Assign',
      onClick: (item: JDAssignment) => {
        // TODO: Open quick assign dialog
        console.log('Quick assign:', item.jdId)
      }
    },
    {
      label: 'Assign with Channels',
      onClick: (item: JDAssignment) => {
        // TODO: Open detailed assignment dialog
        console.log('Assign with channels:', item.jdId)
      }
    },
    {
      label: 'Add to Watch List',
      onClick: (item: JDAssignment) => {
        // TODO: Add to watch list
        console.log('Add to watch list:', item.jdId)
      }
    }
  ]

  const criticalJDs = unassignedJDs.filter(jd => jd.jdAge > 7 && jd.priority === 'Urgent')
  const agingJDs = unassignedJDs.filter(jd => jd.jdAge > 7)

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{unassignedJDs.length}</div>
            <p className="text-xs text-muted-foreground">Total Unassigned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{criticalJDs.length}</div>
            <p className="text-xs text-muted-foreground">Critical (Urgent + Aging)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{agingJDs.length}</div>
            <p className="text-xs text-muted-foreground">Aging (&gt;7 days)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {unassignedJDs.filter(jd => jd.priority === 'Urgent').length}
            </div>
            <p className="text-xs text-muted-foreground">Urgent Priority</p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {criticalJDs.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Critical Unassigned JDs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {criticalJDs.map(jd => (
                <div key={jd.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div>
                    <span className="font-medium">{jd.jdId}</span>
                    <span className="text-sm text-muted-foreground ml-2">{jd.title}</span>
                    <Badge variant="destructive" className="ml-2 text-xs">
                      {jd.jdAge} days
                    </Badge>
                  </div>
                  <Button size="sm" onClick={() => handleQuickAssign(jd.jdId, 'Alice Johnson')}>
                    Quick Assign
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Users className="h-4 w-4 mr-2" />
            Bulk Assign
          </Button>
          <Button variant="outline" size="sm">
            Auto-Assign by Load
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          Showing unassigned JDs sorted by age and priority
        </div>
      </div>

      {/* Unassigned JDs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Unassigned Job Descriptions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={unassignedJDs}
            columns={columns}
            loading={loading}
            actions={(row) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {actions.map((action, index) => (
                    <DropdownMenuItem key={index} onClick={() => action.onClick(row)}>
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            searchable={false}
          />
        </CardContent>
      </Card>
    </div>
  )
}