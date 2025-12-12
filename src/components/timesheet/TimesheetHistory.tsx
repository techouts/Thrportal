import React, { useState, useEffect, useCallback } from 'react'
import { format, parseISO, addDays, subWeeks } from 'date-fns'
import { Save, Send, Copy, RotateCcw, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { HistoryWeekPicker } from './HistoryWeekPicker'
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

interface TimesheetHistoryProps {
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

export function TimesheetHistory({ employeeId }: TimesheetHistoryProps) {
  const [incompleteWeeks, setIncompleteWeeks] = useState<{ weekStart: string; status: string | null }[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedWeek, setSelectedWeek] = useState<Date | null>(null)
  const [timesheet, setTimesheet] = useState<Timesheet | null>(null)
  const [entries, setEntries] = useState<TimesheetEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [categories, setCategories] = useState<NonBillableCategory[]>([])
  const [projects, setProjects] = useState<ProjectAssignment[]>([])
  const [warnings, setWarnings] = useState<TimesheetWarning[]>([])
  const [missingComments, setMissingComments] = useState<{ rowId: string; dayIndex: number }[]>([])
  const [canCopyLastWeek, setCanCopyLastWeek] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    open: false,
    type: 'cell',
    rowId: '',
    dayIndex: undefined
  })

  const timesheetService = TimesheetService.getInstance()
  const policy = timesheetService.getPolicy()
  
  const { attendanceHours } = useWeeklyAttendance(employeeId, selectedWeek || new Date())

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  // Load incomplete weeks on mount
  useEffect(() => {
    loadIncompleteWeeks()
    loadCategories()
    loadProjects()
  }, [employeeId])

  // Load timesheet when selected week changes
  useEffect(() => {
    if (selectedWeek) {
      loadTimesheet()
      checkCanCopyLastWeek()
    }
  }, [selectedWeek, employeeId])

  const loadIncompleteWeeks = async () => {
    try {
      setInitialLoading(true)
      const weeks = await timesheetService.getIncompleteWeeks(employeeId, policy.backdateWeeksLimit)
      setIncompleteWeeks(weeks)
      
      if (weeks.length > 0) {
        // Select the most recent incomplete week (index 0)
        setCurrentIndex(0)
        setSelectedWeek(parseISO(weeks[0].weekStart))
      }
    } catch (error) {
      console.error('Error loading incomplete weeks:', error)
      toast({
        title: "Error",
        description: "Failed to load incomplete weeks",
        variant: "destructive"
      })
    } finally {
      setInitialLoading(false)
    }
  }

  const loadTimesheet = async () => {
    if (!selectedWeek) return
    
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

  const checkCanCopyLastWeek = async () => {
    if (!selectedWeek) {
      setCanCopyLastWeek(false)
      return
    }
    
    try {
      const lastWeekDate = subWeeks(selectedWeek, 1)
      const lastWeek = format(lastWeekDate, 'yyyy-MM-dd')
      const status = await timesheetService.getTimesheetStatus(employeeId, lastWeek)
      setCanCopyLastWeek(status !== null && ['SAVED', 'SUBMITTED', 'APPROVED'].includes(status))
    } catch (error) {
      console.error('Error checking last week status:', error)
      setCanCopyLastWeek(false)
    }
  }

  const handleWeekChange = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < incompleteWeeks.length) {
      setCurrentIndex(newIndex)
      setSelectedWeek(parseISO(incompleteWeeks[newIndex].weekStart))
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
    
    if (comment.trim()) {
      setMissingComments(prev => prev.filter(
        mc => !(mc.rowId === rowId && mc.dayIndex === dayIndex)
      ))
    }
    
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

  const handleConfirmDelete = async () => {
    try {
      if (deleteDialog.type === 'cell' && deleteDialog.dayIndex !== undefined) {
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
        // Find the entry to delete
        const entryToDelete = entries.find(e => e.rowId === deleteDialog.rowId)
        
        // Delete from database if timesheet exists
        if (entryToDelete && timesheet?.id) {
          await timesheetService.deleteTimesheetRow(
            timesheet.id,
            entryToDelete.projectId,
            entryToDelete.taskId
          )
        }
        
        // Remove from local state
        setEntries(prev => prev.filter(entry => entry.rowId !== deleteDialog.rowId))
        toast({
          title: "Row deleted",
          description: "Time entry row has been permanently removed"
        })
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
      toast({
        title: "Delete failed",
        description: "Could not delete the entry. Please try again.",
        variant: "destructive"
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
        description: `Are you sure you want to delete this row?`,
        warning: `This will permanently remove ${deleteDialog.projectName} - ${deleteDialog.taskName} from your timesheet.`
      }
    }
  }

  const handleSave = async () => {
    if (!selectedWeek) return
    
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
      
      // Refresh incomplete weeks list after save
      loadIncompleteWeeks()
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
    if (!selectedWeek) return
    
    const totals = calculateTotals()
    if (totals.week === 0) {
      toast({
        title: "Cannot submit",
        description: "Please add at least one entry",
        variant: "destructive"
      })
      return
    }
    
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
      
      // Refresh incomplete weeks list after submit
      loadIncompleteWeeks()
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
    if (!selectedWeek) return
    
    const lastWeekDate = subWeeks(selectedWeek, 1)
    const lastWeek = format(lastWeekDate, 'yyyy-MM-dd')
    
    try {
      setLoading(true)
      const lastTimesheet = await timesheetService.getTimesheet(employeeId, lastWeek)
      
      if (!['SAVED', 'SUBMITTED', 'APPROVED'].includes(lastTimesheet.status)) {
        toast({
          title: "No data to copy",
          description: "Last week's timesheet was not saved or submitted",
          variant: "destructive"
        })
        return
      }
      
      if (lastTimesheet.entries.length > 0) {
        const copiedEntries: TimesheetEntry[] = lastTimesheet.entries.map(entry => ({
          ...entry,
          rowId: `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          id: undefined,
          daily: entry.daily.map(d => ({ hours: d.hours, comment: d.comment }))
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
      
      // Refresh incomplete weeks list after recall
      loadIncompleteWeeks()
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

  // Loading state
  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading incomplete weeks...</div>
      </div>
    )
  }

  // Empty state - no incomplete weeks
  if (incompleteWeeks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">All caught up!</h3>
              <p className="text-muted-foreground">
                You have no incomplete timesheets within the last {policy.backdateWeeksLimit} weeks.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totals = calculateTotals()
  const isReadonly = timesheet?.status === 'APPROVED' || timesheet?.status === 'SUBMITTED'
  const canEdit = !isReadonly && !loading
  const dialogContent = getDeleteDialogContent()

  return (
    <div className="space-y-6" data-testid="history-list">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <HistoryWeekPicker
            weeks={incompleteWeeks}
            currentIndex={currentIndex}
            onChange={handleWeekChange}
          />
          {timesheet && timesheet.status !== 'DRAFT' && (
            <Badge variant={
              timesheet.status === 'APPROVED' ? 'default' :
              timesheet.status === 'SUBMITTED' ? 'secondary' :
              timesheet.status === 'SAVED' ? 'outline' :
              timesheet.status === 'REJECTED' ? 'destructive' :
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
              {canCopyLastWeek && (
                <Button variant="outline" size="sm" onClick={handleCopyLastWeek} disabled={loading}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Last Week
                </Button>
              )}
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
      {selectedWeek && (
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
      )}

      {/* Comment Summary & Activity */}
      {selectedWeek && (
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
      )}

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
