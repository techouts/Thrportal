import React, { useState, useEffect, useCallback } from 'react'
import { format, startOfWeek, addDays, subWeeks } from 'date-fns'
import { Save, Send, Copy, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { WeekPicker } from './WeekPicker'
import { OverviewBar } from './OverviewBar'
import { TimesheetGrid } from './TimesheetGrid'
import { AddTimeEntryPopover } from './AddTimeEntryPopover'
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog'
import { CommentSummary } from './CommentSummary'
import { TimesheetActivity } from './TimesheetActivity'
import { TimesheetService } from '@/services/timesheetService'
import { useWeeklyAttendance } from '@/hooks/useWeeklyAttendance'
import type { 
  Timesheet, 
  TimesheetEntry, 
  TimesheetTotals, 
  TimesheetWarning, 
  NonBillableCategory,
  ProjectAssignment,
  ProjectTask,
  DailyEntry
} from '@/types/timesheet'

interface TimesheetFillProps {
  employeeId: string
}

interface DeleteDialogState {
  open: boolean
  type: 'cell' | 'row'
  rowId: string
  dayIndex?: number
  projectName?: string
  taskName?: string
}

export function TimesheetFill({ employeeId }: TimesheetFillProps) {
  const [selectedWeek, setSelectedWeek] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 })
  )
  const [timesheet, setTimesheet] = useState<Timesheet | null>(null)
  const [entries, setEntries] = useState<TimesheetEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<NonBillableCategory[]>([])
  const [projects, setProjects] = useState<ProjectAssignment[]>([])
  const [warnings, setWarnings] = useState<TimesheetWarning[]>([])
  const [missingComments, setMissingComments] = useState<{ rowId: string; dayIndex: number }[]>([])
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    open: false,
    type: 'cell',
    rowId: '',
    dayIndex: undefined
  })

  const timesheetService = TimesheetService.getInstance()
  const policy = timesheetService.getPolicy()
  
  // Fetch attendance hours for the selected week
  const { attendanceHours } = useWeeklyAttendance(employeeId, selectedWeek)

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

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
      setMissingComments([])
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
      sum + entry.daily.reduce((daySum, d) => daySum + d.hours, 0), 0
    )
    
    const byDay = Array(7).fill(0).map((_, dayIndex) => 
      entries.reduce((sum, entry) => sum + (entry.daily[dayIndex]?.hours || 0), 0)
    )
    
    const billable = entries
      .filter(entry => entry.billable)
      .reduce((sum, entry) => sum + entry.daily.reduce((daySum, d) => daySum + d.hours, 0), 0)
    
    const nonBillable = entries
      .filter(entry => !entry.billable)
      .reduce((sum, entry) => sum + entry.daily.reduce((daySum, d) => daySum + d.hours, 0), 0)

    return {
      week: weekTotal,
      byDay,
      billable,
      nonBillable,
      timeOff: 0
    }
  }

  const handleCellChange = (rowId: string, dayIndex: number, value: number, comment: string) => {
    setEntries(prev => prev.map(entry => 
      entry.rowId === rowId 
        ? { 
            ...entry, 
            daily: entry.daily.map((d, i) => 
              i === dayIndex ? { hours: value, comment } : d
            )
          }
        : entry
    ))
    
    // Clear missing comment warning for this cell if comment is provided
    if (comment.trim()) {
      setMissingComments(prev => prev.filter(
        mc => !(mc.rowId === rowId && mc.dayIndex === dayIndex)
      ))
    }
    
    // Validate and update warnings
    const updatedEntries = entries.map(entry => 
      entry.rowId === rowId 
        ? { 
            ...entry, 
            daily: entry.daily.map((d, i) => 
              i === dayIndex ? { hours: value, comment } : d
            )
          }
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
            const mondayEntry = entry.daily[0]
            return { 
              ...entry, 
              daily: [
                mondayEntry, mondayEntry, mondayEntry, mondayEntry, mondayEntry,
                { hours: 0, comment: '' }, { hours: 0, comment: '' }
              ]
            }
          }
          return entry
        }))
        break
      
      case 'splitEvenly':
        setEntries(prev => prev.map(entry => {
          if (entry.rowId === rowId) {
            const totalHours = entry.daily.reduce((sum, d) => sum + d.hours, 0)
            const evenHours = totalHours / 5
            const evenEntry: DailyEntry = { hours: evenHours, comment: '' }
            return { 
              ...entry, 
              daily: [
                evenEntry, evenEntry, evenEntry, evenEntry, evenEntry,
                { hours: 0, comment: '' }, { hours: 0, comment: '' }
              ]
            }
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
            daily: Array(7).fill(null).map(() => ({ hours: 0, comment: '' }))
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
      daily: Array(7).fill(null).map(() => ({ hours: 0, comment: '' }))
    }
    setEntries(prev => [...prev, newEntry])
  }

  const handleAddEntry = (project: ProjectAssignment, task: ProjectTask) => {
    const newEntry: TimesheetEntry = {
      rowId: `row-${Date.now()}`,
      projectId: project.projectId,
      projectName: project.name,
      taskId: task.taskId,
      taskName: task.name,
      billable: task.billable,
      daily: Array(7).fill(null).map(() => ({ hours: 0, comment: '' }))
    }
    setEntries(prev => [...prev, newEntry])
    toast({
      title: "Entry added",
      description: `${project.name} - ${task.name}`
    })
  }

  const getTasks = useCallback(async (projectId: string): Promise<ProjectTask[]> => {
    return timesheetService.getAssignedTasks(employeeId, projectId)
  }, [employeeId])

  // Delete handlers
  const handleDeleteEntryClick = (rowId: string, dayIndex: number) => {
    const entry = entries.find(e => e.rowId === rowId)
    if (!entry) return
    
    setDeleteDialog({
      open: true,
      type: 'cell',
      rowId,
      dayIndex,
      projectName: entry.projectName,
      taskName: entry.taskName
    })
  }

  const handleDeleteRowClick = (rowId: string) => {
    const entry = entries.find(e => e.rowId === rowId)
    if (!entry) return
    
    setDeleteDialog({
      open: true,
      type: 'row',
      rowId,
      projectName: entry.projectName,
      taskName: entry.taskName
    })
  }

  const handleConfirmDelete = () => {
    if (deleteDialog.type === 'cell' && deleteDialog.dayIndex !== undefined) {
      // Clear individual cell
      setEntries(prev => prev.map(entry => 
        entry.rowId === deleteDialog.rowId 
          ? { 
              ...entry, 
              daily: entry.daily.map((d, i) => 
                i === deleteDialog.dayIndex ? { hours: 0, comment: '' } : d
              )
            }
          : entry
      ))
      toast({
        title: "Entry deleted",
        description: "Time entry has been cleared"
      })
    } else if (deleteDialog.type === 'row') {
      // Clear all hours in the row
      setEntries(prev => prev.map(entry => 
        entry.rowId === deleteDialog.rowId 
          ? { 
              ...entry, 
              daily: entry.daily.map(() => ({ hours: 0, comment: '' }))
            }
          : entry
      ))
      toast({
        title: "Row cleared",
        description: "All time entries in this row have been cleared"
      })
    }
    
    setDeleteDialog(prev => ({ ...prev, open: false }))
  }

  const getDeleteDialogContent = () => {
    if (deleteDialog.type === 'cell' && deleteDialog.dayIndex !== undefined) {
      const dayName = dayNames[deleteDialog.dayIndex]
      return {
        description: `Are you sure you want to delete the time entry for ${dayName}?`,
        warning: `This will clear the hours and comment for ${deleteDialog.projectName} - ${deleteDialog.taskName} on ${dayName}.`
      }
    } else {
      return {
        description: `Are you sure you want to clear all time entries for this row?`,
        warning: `This will clear all hours and comments for ${deleteDialog.projectName} - ${deleteDialog.taskName} across all days.`
      }
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const weekStart = format(selectedWeek, 'yyyy-MM-dd')
      
      const result = await timesheetService.saveTimesheet(
        employeeId,
        weekStart,
        entries,
        'SAVED'
      )
      
      setTimesheet(result.timesheet)
      toast({
        title: "Saved",
        description: "Timesheet saved as draft"
      })
    } catch (error) {
      console.error('Save error:', error)
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
    const totals = calculateTotals()
    if (totals.week === 0) {
      toast({
        title: "Cannot submit",
        description: "Please add at least one entry",
        variant: "destructive"
      })
      return
    }
    
    // Validate comments
    const validation = timesheetService.validateCommentsForSubmit(entries)
    if (!validation.valid) {
      setMissingComments(validation.missingComments)
      toast({
        title: "Missing comments",
        description: "Please add comments to all time entries before submitting",
        variant: "destructive"
      })
      return
    }
    
    try {
      setLoading(true)
      const weekStart = format(selectedWeek, 'yyyy-MM-dd')
      
      const result = await timesheetService.saveTimesheet(
        employeeId,
        weekStart,
        entries,
        'SUBMITTED'
      )
      
      setTimesheet(result.timesheet)
      setMissingComments([])
      toast({
        title: "Submitted",
        description: "Timesheet submitted for approval"
      })
    } catch (error) {
      console.error('Submit error:', error)
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
    const lastWeekDate = subWeeks(selectedWeek, 1)
    const lastWeek = format(lastWeekDate, 'yyyy-MM-dd')
    
    try {
      setLoading(true)
      const lastTimesheet = await timesheetService.getTimesheet(employeeId, lastWeek)
      
      // Only copy if last week was SAVED or SUBMITTED
      if (!['SAVED', 'SUBMITTED', 'APPROVED'].includes(lastTimesheet.status)) {
        toast({
          title: "No data to copy",
          description: "Last week's timesheet was not saved or submitted",
          variant: "destructive"
        })
        return
      }
      
      if (lastTimesheet.entries.length > 0) {
        // Copy entries with their hours and comments
        const copiedEntries: TimesheetEntry[] = lastTimesheet.entries.map(entry => ({
          ...entry,
          rowId: `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          id: undefined, // Remove ID so it creates new entries
          daily: entry.daily.map(d => ({ hours: d.hours, comment: d.comment })) // Deep copy daily entries
        }))
        setEntries(copiedEntries)
        toast({
          title: "Copied",
          description: "Last week's timesheet copied successfully. Click Save Draft or Submit to save."
        })
      } else {
        toast({
          title: "No entries",
          description: "Last week's timesheet has no entries to copy"
        })
      }
    } catch (error) {
      console.error('Copy error:', error)
      toast({
        title: "Error",
        description: "Failed to copy last week's timesheet",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRecall = async () => {
    if (!timesheet?.id) return
    
    try {
      setLoading(true)
      await timesheetService.recallTimesheet(timesheet.id)
      await loadTimesheet()
      toast({
        title: "Recalled",
        description: "Timesheet recalled successfully"
      })
    } catch (error) {
      console.error('Recall error:', error)
      toast({
        title: "Error",
        description: "Failed to recall timesheet",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const totals = calculateTotals()
  const isReadonly = timesheet?.status === 'APPROVED' || timesheet?.status === 'SUBMITTED'
  const canEdit = !isReadonly && !loading
  const dialogContent = getDeleteDialogContent()

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
          {timesheet && timesheet.status !== 'DRAFT' && (
            <Badge variant={
              timesheet.status === 'APPROVED' ? 'default' :
              timesheet.status === 'SUBMITTED' ? 'secondary' :
              timesheet.status === 'SAVED' ? 'outline' :
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
              <Button variant="outline" size="sm" onClick={handleCopyLastWeek} disabled={loading}>
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
              onClick={handleRecall}
              disabled={loading}
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
        attendanceHours={attendanceHours}
        dailyTotals={totals.byDay}
        missingComments={missingComments}
        weekStart={selectedWeek}
        onDeleteEntry={canEdit ? handleDeleteEntryClick : undefined}
        onDeleteRow={canEdit ? handleDeleteRowClick : undefined}
        addTimeEntryContent={
          <AddTimeEntryPopover
            projects={projects}
            onSelectEntry={handleAddEntry}
            getTasks={getTasks}
            disabled={!canEdit}
          />
        }
      />

      {/* Comment Summary & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CommentSummary 
          entries={entries} 
          weekStart={selectedWeek}
        />
        <TimesheetActivity 
          timesheet={timesheet}
          entries={entries}
          weekStart={selectedWeek}
          weekEnd={addDays(selectedWeek, 6)}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
        description={dialogContent.description}
        warningMessage={dialogContent.warning}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
