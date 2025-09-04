import { useState, useEffect } from 'react'
import { Search, Pin, Users, AlertTriangle, Filter, MoreHorizontal, RefreshCw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/components/shared/DataTable'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { assignmentService } from '@/services/assignmentService'
import type { JDAssignment, AssignmentFilters, AssignmentStats } from '@/types/assignment'

interface ManageTabProps {
  filters: AssignmentFilters
  onFiltersChange: (filters: AssignmentFilters) => void
}

export function ManageTab({ filters, onFiltersChange }: ManageTabProps) {
  const [assignments, setAssignments] = useState<JDAssignment[]>([])
  const [stats, setStats] = useState<AssignmentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  useEffect(() => {
    loadData()
  }, [filters])

  const loadData = async () => {
    setLoading(true)
    try {
      const [assignmentsData, statsData] = await Promise.all([
        assignmentService.getAssignments(filters),
        assignmentService.getAssignmentStats(filters)
      ])
      setAssignments(assignmentsData)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load assignment data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignRecruiter = async (jdId: string, recruiters: string[]) => {
    await assignmentService.assignRecruiter(jdId, recruiters)
    loadData()
  }

  const handlePriorityChange = async (jdId: string, priority: 'Urgent' | 'Standard' | 'Bulk') => {
    await assignmentService.updatePriority(jdId, priority)
    loadData()
  }

  const handleNotesUpdate = async (jdId: string, notes: string) => {
    await assignmentService.updateNotes(jdId, notes)
    loadData()
  }

  const handleTogglePin = async (jdId: string) => {
    await assignmentService.togglePin(jdId)
    loadData()
  }

  const columns = [
    {
      id: 'pinned',
      header: '',
      accessor: 'isPinned' as keyof JDAssignment,
      cell: (item: JDAssignment) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleTogglePin(item.jdId)}
          className={item.isPinned ? 'text-yellow-500' : 'text-muted-foreground'}
        >
          <Pin className="h-4 w-4" />
        </Button>
      ),
      width: '60px'
    },
    {
      id: 'jdInfo',
      header: 'JD Details',
      accessor: 'jdId' as keyof JDAssignment,
      cell: (item: JDAssignment) => (
        <div>
          <div className="font-medium hover:text-primary cursor-pointer">
            {item.jdId}
          </div>
          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
            {item.title}
          </div>
          {item.jdAge > 7 && (
            <Badge variant="secondary" className="mt-1 text-xs">
              {item.jdAge} days old
            </Badge>
          )}
        </div>
      )
    },
    {
      id: 'client',
      header: 'Client',
      accessor: 'client' as keyof JDAssignment
    },
    {
      id: 'recruiters',
      header: 'Assigned Recruiters',
      accessor: 'assignedRecruiters' as keyof JDAssignment,
      cell: (item: JDAssignment) => (
        <div className="space-y-1">
          {item.assignedRecruiters.length > 0 ? (
            item.assignedRecruiters.map(recruiter => (
              <Badge key={recruiter} variant="outline" className="text-xs">
                {recruiter}
              </Badge>
            ))
          ) : (
            <Badge variant="secondary">Unassigned</Badge>
          )}
        </div>
      )
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
      id: 'sourcingChannels',
      header: 'Sourcing Channels',
      accessor: 'sourcingChannels' as keyof JDAssignment,
      cell: (item: JDAssignment) => (
        <div className="flex flex-wrap gap-1">
          {item.sourcingChannels.map(channel => (
            <Badge key={channel} variant="outline" className="text-xs">
              {channel}
            </Badge>
          ))}
        </div>
      )
    },
    {
      id: 'lastActivity',
      header: 'Last Activity',
      accessor: 'lastActivity' as keyof JDAssignment,
      cell: (item: JDAssignment) => (
        <div className="text-sm">
          {new Date(item.lastActivity).toLocaleDateString()}
        </div>
      )
    },
    {
      id: 'notes',
      header: 'Notes',
      accessor: 'notes' as keyof JDAssignment,
      cell: (item: JDAssignment) => (
        <div className="text-sm text-muted-foreground max-w-[150px] truncate">
          {item.notes || 'No notes'}
        </div>
      )
    }
  ]

  const actions = [
    {
      label: 'Assign Recruiter',
      onClick: (item: JDAssignment) => {
        // TODO: Open assign recruiter dialog
        console.log('Assign recruiter to:', item.jdId)
      }
    },
    {
      label: 'Change Priority',
      onClick: (item: JDAssignment) => {
        // TODO: Open priority change dialog
        console.log('Change priority for:', item.jdId)
      }
    },
    {
      label: 'Edit Notes',
      onClick: (item: JDAssignment) => {
        // TODO: Open notes editor
        console.log('Edit notes for:', item.jdId)
      }
    },
    {
      label: 'View Details',
      onClick: (item: JDAssignment) => {
        // TODO: Open JD details drawer
        console.log('View details for:', item.jdId)
      }
    },
    {
      label: 'Mark as Unattended',
      onClick: (item: JDAssignment) => {
        // TODO: Open unattended dialog
        console.log('Mark as unattended:', item.jdId)
      }
    }
  ]

  return (
    <div className="space-y-6">
      {/* Metrics Summary Bar */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.totalJDs}</div>
              <p className="text-xs text-muted-foreground">Total JDs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.unassigned}</div>
              <p className="text-xs text-muted-foreground">Unassigned</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
              <p className="text-xs text-muted-foreground">Urgent</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.avgJDsPerRecruiter}</div>
              <p className="text-xs text-muted-foreground">Avg/Recruiter</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.overloadedRecruiters}</div>
              <p className="text-xs text-muted-foreground">Overloaded</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.jdsOlderThan7Days}</div>
              <p className="text-xs text-muted-foreground">Aging JDs</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search JD ID or Title..."
                value={filters.jdId || ''}
                onChange={(e) => onFiltersChange({ ...filters, jdId: e.target.value })}
                className="w-full"
              />
            </div>
            
            <Select value={filters.client || 'all'} onValueChange={(value) => onFiltersChange({ ...filters, client: value === 'all' ? undefined : value })}>
              <SelectTrigger>
                <SelectValue placeholder="Client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                <SelectItem value="TechCorp">TechCorp</SelectItem>
                <SelectItem value="StartupXYZ">StartupXYZ</SelectItem>
                <SelectItem value="Enterprise Ltd">Enterprise Ltd</SelectItem>
                <SelectItem value="Innovation Inc">Innovation Inc</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.priority || 'all'} onValueChange={(value) => onFiltersChange({ ...filters, priority: value === 'all' ? undefined : value })}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="Urgent">Urgent</SelectItem>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Bulk">Bulk</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.status || 'all'} onValueChange={(value) => onFiltersChange({ ...filters, status: value === 'all' ? undefined : value })}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Assigned">Assigned</SelectItem>
                <SelectItem value="Unassigned">Unassigned</SelectItem>
                <SelectItem value="Unattended">Unattended</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.sourcingChannel || 'all'} onValueChange={(value) => onFiltersChange({ ...filters, sourcingChannel: value === 'all' ? undefined : value })}>
              <SelectTrigger>
                <SelectValue placeholder="Source Channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                <SelectItem value="Naukri">Naukri</SelectItem>
                <SelectItem value="Indeed">Indeed</SelectItem>
                <SelectItem value="Internal Referral">Internal Referral</SelectItem>
                <SelectItem value="Vendor">Vendor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectedRows.length > 0 && (
            <>
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Bulk Assign ({selectedRows.length})
              </Button>
              <Button variant="outline" size="sm">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Change Priority
              </Button>
            </>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Assignment Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            data={assignments}
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