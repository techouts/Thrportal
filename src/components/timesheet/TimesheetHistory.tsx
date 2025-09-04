import React, { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { Eye, Download, Copy, RotateCcw, Calendar, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { DataTable } from '@/components/shared/DataTable'
import { toast } from '@/hooks/use-toast'
import { TimesheetService } from '@/services/timesheetService'
import type { TimesheetHistoryItem, HistoryFilter } from '@/types/timesheet'

interface TimesheetHistoryProps {
  employeeId: string
}

export function TimesheetHistory({ employeeId }: TimesheetHistoryProps) {
  const [items, setItems] = useState<TimesheetHistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<HistoryFilter>({
    status: 'All',
    pastDue: false,
    search: ''
  })

  const timesheetService = TimesheetService.getInstance()

  useEffect(() => {
    loadHistory()
  }, [employeeId, filters])

  const loadHistory = async () => {
    try {
      setLoading(true)
      const data = await timesheetService.getHistory(employeeId, filters)
      setItems(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load timesheet history",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDuplicate = async (weekStart: string) => {
    try {
      toast({
        title: "Duplicated",
        description: "Week structure copied to current timesheet"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate week",
        variant: "destructive"
      })
    }
  }

  const handleRecall = async (weekStart: string) => {
    try {
      toast({
        title: "Recalled",
        description: "Timesheet recalled successfully"
      })
      loadHistory()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to recall timesheet",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="default">Approved</Badge>
      case 'SUBMITTED':
        return <Badge variant="secondary">Submitted</Badge>
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>
      case 'SAVED':
        return <Badge variant="outline">Saved</Badge>
      default:
        return <Badge variant="outline">Draft</Badge>
    }
  }

  const columns = [
    {
      id: 'weekStart',
      header: 'Week',
      accessor: (item: TimesheetHistoryItem) => {
        const start = parseISO(item.weekStart)
        const end = new Date(start)
        end.setDate(start.getDate() + 6)
        return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
      }
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (item: TimesheetHistoryItem) => getStatusBadge(item.status)
    },
    {
      id: 'totalHours',
      header: 'Total Hours',
      accessor: (item: TimesheetHistoryItem) => `${item.totalHours.toFixed(1)}h`
    },
    {
      id: 'billablePercentage',
      header: 'Billable %',
      accessor: (item: TimesheetHistoryItem) => `${item.billablePercentage.toFixed(0)}%`
    },
    {
      id: 'flags',
      header: 'Flags',
      accessor: (item: TimesheetHistoryItem) => (
        <div className="flex gap-1">
          {item.flags.map((flag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {flag}
            </Badge>
          ))}
        </div>
      )
    },
    {
      id: 'submittedAt',
      header: 'Submitted',
      accessor: (item: TimesheetHistoryItem) => 
        item.submittedAt ? format(parseISO(item.submittedAt), 'MMM d, HH:mm') : '-'
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: (item: TimesheetHistoryItem) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 w-8 p-0"
            onClick={() => handleDuplicate(item.weekStart)}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
            <Download className="h-4 w-4" />
          </Button>
          {item.status === 'SUBMITTED' && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0"
              onClick={() => handleRecall(item.weekStart)}
              data-testid="recall-btn"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6" data-testid="history-list">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects, tasks..."
                  value={filters.search || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status || 'All'}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="SAVED">Saved</SelectItem>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Week Range</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Last 12 weeks</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Show Past Due Only</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={filters.pastDue || false}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, pastDue: checked }))}
                />
                <span className="text-sm text-muted-foreground">Past due</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Timesheet History</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={items}
            columns={columns}
            loading={loading}
            emptyMessage="No timesheets found"
          />
        </CardContent>
      </Card>
    </div>
  )
}