import React, { useState, useEffect } from 'react'
import { format, startOfWeek, addDays, subWeeks } from 'date-fns'
import { Save, Send, Copy, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { WeekPicker } from './WeekPicker'
import { OverviewBar } from './OverviewBar'
import { TimesheetGrid } from './TimesheetGrid'
import { TimesheetService } from '@/services/timesheetService'
import type { 
  Timesheet, 
  TimesheetEntry, 
  TimesheetTotals, 
  TimesheetWarning, 
  NonBillableCategory,
  ProjectAssignment,
  ProjectTask
} from '@/types/timesheet'

interface TimesheetFillProps {
  employeeId: string
}

export function TimesheetFill({ employeeId }: TimesheetFillProps) {
  const [selectedWeek, setSelectedWeek] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 })
  )
  const [timesheet, setTimesheet] = useState<Timesheet | null>(null)
  const [entries, setEntries] = useState<TimesheetEntry[]>([])
  const [submissionComment, setSubmissionComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<NonBillableCategory[]>([])
  const [projects, setProjects] = useState<ProjectAssignment[]>([])
  const [warnings, setWarnings] = useState<TimesheetWarning[]>([])

  const timesheetService = TimesheetService.getInstance()
  const policy = timesheetService.getPolicy()

  useEffect(() => {
    loadTimesheet()
    loadCategories()
    loadProjects()
  }, [selectedWeek, employeeId])

  const loadTimesheet = async () => {
    try {
      setLoading(true)
      const weekStart = format(selectedWeek, 'yyyy-MM-dd')
      const data = await timesheetService.getTimesheet(employeeId, weekStart)
      setTimesheet(data)
      setEntries(data.entries)
      setSubmissionComment(data.submissionComment || '')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load timesheet",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await timesheetService.getNonBillableCategories()
      setCategories(data)
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const loadProjects = async () => {
    try {
      const data = await timesheetService.getAssignedProjects(employeeId)
      setProjects(data)
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
  }

  const calculateTotals = (): TimesheetTotals => {
    const weekTotal = entries.reduce((sum, entry) => 
      sum + entry.daily.reduce((daySum, hours) => daySum + hours, 0), 0
    )
    
    const byDay = Array(7).fill(0).map((_, dayIndex) => 
      entries.reduce((sum, entry) => sum + (entry.daily[dayIndex] || 0), 0)
    )
    
    const billable = entries
      .filter(entry => entry.billable)
      .reduce((sum, entry) => sum + entry.daily.reduce((daySum, hours) => daySum + hours, 0), 0)
    
    const nonBillable = entries
      .filter(entry => !entry.billable)
      .reduce((sum, entry) => sum + entry.daily.reduce((daySum, hours) => daySum + hours, 0), 0)

    return {
      week: weekTotal,
      byDay,
      billable,
      nonBillable,
      timeOff: 0 // Implement time-off logic
    }
  }

  const handleCellChange = (rowId: string, dayIndex: number, value: number) => {
    setEntries(prev => prev.map(entry => 
      entry.rowId === rowId 
        ? { ...entry, daily: entry.daily.map((h, i) => i === dayIndex ? value : h) }
        : entry
    ))
    
    // Validate and update warnings
    const updatedEntries = entries.map(entry => 
      entry.rowId === rowId 
        ? { ...entry, daily: entry.daily.map((h, i) => i === dayIndex ? value : h) }
        : entry
    )
    setWarnings(timesheetService.validateWeekEntries(updatedEntries, policy))
  }

  const handleCategoryChange = (rowId: string, categoryId: string) => {
    setEntries(prev => prev.map(entry => 
      entry.rowId === rowId 
        ? { ...entry, nonBillableCategoryId: categoryId }
        : entry
    ))
  }

  const handleRowAction = (rowId: string, action: string) => {
    switch (action) {
      case 'fillAcross':
        setEntries(prev => prev.map(entry => {
          if (entry.rowId === rowId) {
            const mondayHours = entry.daily[0] || 0
            return { ...entry, daily: [mondayHours, mondayHours, mondayHours, mondayHours, mondayHours, 0, 0] }
          }
          return entry
        }))
        break
      
      case 'splitEvenly':
        setEntries(prev => prev.map(entry => {
          if (entry.rowId === rowId) {
            const totalHours = entry.daily.reduce((sum, h) => sum + h, 0)
            const evenHours = totalHours / 5 // Split across weekdays
            return { ...entry, daily: [evenHours, evenHours, evenHours, evenHours, evenHours, 0, 0] }
          }
          return entry
        }))
        break
      
      case 'duplicate':
        const entryToDuplicate = entries.find(e => e.rowId === rowId)
        if (entryToDuplicate) {
          const newEntry: TimesheetEntry = {
            ...entryToDuplicate,
            rowId: `row-${Date.now()}`,
            daily: [0, 0, 0, 0, 0, 0, 0]
          }
          setEntries(prev => [...prev, newEntry])
        }
        break
      
      case 'delete':
        setEntries(prev => prev.filter(entry => entry.rowId !== rowId))
        break
    }
  }

  const handleAddRow = () => {
    if (projects.length === 0) {
      toast({
        title: "No projects available",
        description: "Please contact HR to get project assignments",
        variant: "destructive"
      })
      return
    }
    
    const firstProject = projects[0]
    const newEntry: TimesheetEntry = {
      rowId: `row-${Date.now()}`,
      projectId: firstProject.projectId,
      projectName: firstProject.name,
      taskId: 'default',
      taskName: 'Default Task',
      billable: firstProject.billable,
      daily: [0, 0, 0, 0, 0, 0, 0]
    }
    setEntries(prev => [...prev, newEntry])
  }

  const handleSave = async () => {
    if (!timesheet) return
    
    try {
      setLoading(true)
      await timesheetService.saveTimesheet(timesheet.id, 'SAVED', submissionComment)
      toast({
        title: "Saved",
        description: "Timesheet saved as draft"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save timesheet",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!timesheet) return
    
    const totals = calculateTotals()
    if (totals.week === 0) {
      toast({
        title: "Cannot submit",
        description: "Please add at least one entry",
        variant: "destructive"
      })
      return
    }
    
    try {
      setLoading(true)
      await timesheetService.saveTimesheet(timesheet.id, 'SUBMITTED', submissionComment)
      toast({
        title: "Submitted",
        description: "Timesheet submitted for approval"
      })
      loadTimesheet() // Reload to get updated status
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit timesheet",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLastWeek = async () => {
    const lastWeek = format(subWeeks(selectedWeek, 1), 'yyyy-MM-dd')
    try {
      const lastTimesheet = await timesheetService.getTimesheet(employeeId, lastWeek)
      if (lastTimesheet.entries.length > 0) {
        const copiedEntries = lastTimesheet.entries.map(entry => ({
          ...entry,
          rowId: `row-${Date.now()}-${Math.random()}`,
          daily: [0, 0, 0, 0, 0, 0, 0] // Reset hours but keep structure
        }))
        setEntries(copiedEntries)
        toast({
          title: "Copied",
          description: "Last week's structure copied successfully"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy last week",
        variant: "destructive"
      })
    }
  }

  const totals = calculateTotals()
  const isReadonly = timesheet?.status === 'APPROVED' || timesheet?.status === 'SUBMITTED'
  const canEdit = !isReadonly && !loading

  return (
    <div className="space-y-6" data-testid="timesheet-grid">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <WeekPicker
            value={selectedWeek}
            onChange={setSelectedWeek}
            backdateLimit={policy.backdateWeeksLimit}
          />
          {timesheet && (
            <Badge variant={
              timesheet.status === 'APPROVED' ? 'default' :
              timesheet.status === 'SUBMITTED' ? 'secondary' :
              'outline'
            }>
              {timesheet.status}
            </Badge>
          )}
          <div className="text-lg font-semibold">
            {totals.week.toFixed(1)}h
          </div>
        </div>
        
        <div className="flex gap-2">
          {canEdit && (
            <>
              <Button variant="outline" size="sm" onClick={handleCopyLastWeek}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Last Week
              </Button>
              <Button variant="outline" size="sm" onClick={handleSave} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </Button>
              <Button 
                size="sm" 
                onClick={handleSubmit} 
                disabled={loading}
                data-testid="submit-btn"
              >
                <Send className="mr-2 h-4 w-4" />
                Submit
              </Button>
            </>
          )}
          {timesheet?.status === 'SUBMITTED' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => timesheetService.recallTimesheet(timesheet.id)}
              data-testid="recall-btn"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Recall
            </Button>
          )}
        </div>
      </div>

      {/* Overview */}
      <OverviewBar data={totals} />

      {/* Grid */}
      <TimesheetGrid
        rows={entries}
        onChangeCell={handleCellChange}
        onChangeCategory={handleCategoryChange}
        onRowAction={handleRowAction}
        onAddRow={handleAddRow}
        policy={policy}
        warnings={warnings}
        categories={categories}
        readonly={isReadonly}
      />

      {/* Submission Comment */}
      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Submission Comment (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={submissionComment}
              onChange={(e) => setSubmissionComment(e.target.value)}
              placeholder="Add any comments or notes for your manager..."
              rows={3}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}