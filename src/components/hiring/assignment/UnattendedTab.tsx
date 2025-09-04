import { useState, useEffect } from 'react'
import { AlertTriangle, Clock, MessageSquare, RotateCcw, MoreHorizontal } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/shared/DataTable'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { assignmentService } from '@/services/assignmentService'
import type { UnattendedJD } from '@/types/assignment'

export function UnattendedTab() {
  const [unattendedJDs, setUnattendedJDs] = useState<UnattendedJD[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    loadUnattendedJDs()
  }, [])

  const loadUnattendedJDs = async () => {
    setLoading(true)
    try {
      const data = await assignmentService.getUnattendedJDs()
      setUnattendedJDs(data)
    } catch (error) {
      console.error('Failed to load unattended JDs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReactivate = async (jdId: string) => {
    // TODO: Implement reactivation logic
    console.log('Reactivate JD:', jdId)
  }

  const handleUpdateStatus = async (id: string, status: string, reason: string) => {
    // TODO: Implement status update logic
    console.log('Update status:', id, status, reason)
  }

  const filteredData = statusFilter === 'all' 
    ? unattendedJDs 
    : unattendedJDs.filter(jd => jd.status === statusFilter)

  const columns = [
    {
      id: 'jdInfo',
      header: 'JD Details',
      accessor: 'jdId' as keyof UnattendedJD,
      cell: (item: UnattendedJD) => (
        <div>
          <div className="font-medium">{item.jdId}</div>
          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
            {item.title}
          </div>
        </div>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status' as keyof UnattendedJD,
      cell: (item: UnattendedJD) => {
        const variant = item.status === 'Do Not Work' ? 'destructive' :
                       item.status === 'Blocked' ? 'secondary' : 'default'
        return (
          <Badge variant={variant}>
            {item.status}
          </Badge>
        )
      }
    },
    {
      id: 'reason',
      header: 'Reason',
      accessor: 'reason' as keyof UnattendedJD,
      cell: (item: UnattendedJD) => (
        <div className="max-w-[200px]">
          <div className="font-medium text-sm">{item.reason}</div>
          {item.notes && (
            <div className="text-xs text-muted-foreground truncate">
              {item.notes}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'assignedRecruiters',
      header: 'Assigned Recruiters',
      accessor: 'assignedRecruiters' as keyof UnattendedJD,
      cell: (item: UnattendedJD) => (
        <div className="space-y-1">
          {item.assignedRecruiters && item.assignedRecruiters.length > 0 ? (
            item.assignedRecruiters.map(recruiter => (
              <Badge key={recruiter} variant="outline" className="text-xs">
                {recruiter}
              </Badge>
            ))
          ) : (
            <Badge variant="secondary" className="text-xs">None</Badge>
          )}
        </div>
      )
    },
    {
      id: 'markedBy',
      header: 'Marked By',
      accessor: 'markedBy' as keyof UnattendedJD,
      cell: (item: UnattendedJD) => (
        <div>
          <div className="text-sm font-medium">{item.markedBy}</div>
          <div className="text-xs text-muted-foreground">
            {new Date(item.markedDate).toLocaleDateString()}
          </div>
        </div>
      )
    },
    {
      id: 'lastUpdated',
      header: 'Last Updated',
      accessor: 'lastUpdated' as keyof UnattendedJD,
      cell: (item: UnattendedJD) => {
        const daysSince = Math.floor((Date.now() - new Date(item.lastUpdated).getTime()) / (1000 * 60 * 60 * 24))
        return (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {daysSince === 0 ? 'Today' : `${daysSince} days ago`}
            </span>
          </div>
        )
      }
    }
  ]

  const actions = [
    {
      label: 'Reactivate',
      onClick: (item: UnattendedJD) => handleReactivate(item.jdId),
      icon: RotateCcw
    },
    {
      label: 'Update Status',
      onClick: (item: UnattendedJD) => {
        // TODO: Open status update dialog
        console.log('Update status for:', item.jdId)
      }
    },
    {
      label: 'Add Comment',
      onClick: (item: UnattendedJD) => {
        // TODO: Open comment dialog
        console.log('Add comment for:', item.jdId)
      },
      icon: MessageSquare
    },
    {
      label: 'View History',
      onClick: (item: UnattendedJD) => {
        // TODO: Open history dialog
        console.log('View history for:', item.jdId)
      }
    }
  ]

  const statusCounts = unattendedJDs.reduce((acc, jd) => {
    acc[jd.status] = (acc[jd.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{unattendedJDs.length}</div>
            <p className="text-xs text-muted-foreground">Total Unattended</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {statusCounts['Do Not Work'] || 0}
            </div>
            <p className="text-xs text-muted-foreground">Do Not Work</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {statusCounts['On Hold'] || 0}
            </div>
            <p className="text-xs text-muted-foreground">On Hold</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {statusCounts['Blocked'] || 0}
            </div>
            <p className="text-xs text-muted-foreground">Blocked</p>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">Manager Actions Required</h3>
              <p className="text-sm text-blue-700 mt-1">
                Only Managers can mark JDs as unattended or change their status. 
                Recruiters cannot self-decline assignments. Use the audit trail to track all changes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="On Hold">On Hold</SelectItem>
            <SelectItem value="Do Not Work">Do Not Work</SelectItem>
            <SelectItem value="Blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="text-sm text-muted-foreground">
          Showing {filteredData.length} of {unattendedJDs.length} unattended JDs
        </div>
      </div>

      {/* Unattended JDs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Unattended Job Descriptions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={filteredData}
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