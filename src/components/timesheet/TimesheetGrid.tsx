import React, { useCallback } from 'react'
import { Plus, Info, AlertTriangle, Trash2 } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { TimeEntryPopover } from './TimeEntryPopover'
import type { TimesheetEntry, TimesheetWarning, TimesheetPolicy, NonBillableCategory } from '@/types/timesheet'

interface AttendanceHours {
  daily: string[]
  weekTotal: string
}

interface TimesheetGridProps {
  rows: TimesheetEntry[]
  onChangeCell: (rowId: string, dayIndex: number, value: number, comment: string) => void
  onChangeCategory: (rowId: string, categoryId: string) => void
  onRowAction: (rowId: string, action: 'fillAcross' | 'splitEvenly' | 'duplicate' | 'delete') => void
  onAddRow: () => void
  policy: TimesheetPolicy
  warnings: TimesheetWarning[]
  categories: NonBillableCategory[]
  readonly?: boolean
  attendanceHours?: AttendanceHours
  dailyTotals?: number[]
  addTimeEntryContent?: React.ReactNode
  missingComments?: { rowId: string; dayIndex: number }[]
  weekStart?: Date
  onDeleteEntry?: (rowId: string, dayIndex: number) => void
  onDeleteRow?: (rowId: string) => void
}

const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

export function TimesheetGrid({
  rows,
  onChangeCell,
  onChangeCategory,
  onRowAction,
  onAddRow,
  policy,
  warnings,
  categories,
  readonly = false,
  attendanceHours,
  dailyTotals = [],
  addTimeEntryContent,
  missingComments = [],
  weekStart,
  onDeleteEntry,
  onDeleteRow
}: TimesheetGridProps) {

  const getWarningsForCell = useCallback((rowId: string, dayIndex?: number) => {
    return warnings.filter(w => 
      w.rowId === rowId && (dayIndex === undefined || w.dayIndex === dayIndex)
    )
  }, [warnings])

  const isMissingComment = useCallback((rowId: string, dayIndex: number) => {
    return missingComments.some(mc => mc.rowId === rowId && mc.dayIndex === dayIndex)
  }, [missingComments])

  const calculateRowTotal = (row: TimesheetEntry) => {
    return row.daily.reduce((sum, d) => sum + d.hours, 0)
  }

  const rowHasAnyHours = (row: TimesheetEntry) => {
    return row.daily.some(d => d.hours > 0)
  }

  // Convert decimal hours to HH:MM format
  const formatDecimalToTime = (decimal: number): string => {
    if (!decimal || decimal === 0) return '0:00'
    const hours = Math.floor(decimal)
    const minutes = Math.round((decimal - hours) * 60)
    return `${hours}:${minutes.toString().padStart(2, '0')}`
  }

  // Get formatted date for header (e.g., "01 DEC")
  const getHeaderDate = (dayIndex: number): string => {
    if (!weekStart) return ''
    const date = addDays(weekStart, dayIndex)
    return format(date, 'dd MMM').toUpperCase()
  }

  const weekTotalHours = dailyTotals.reduce((sum, h) => sum + h, 0)

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium min-w-[300px]">Project ▸ Task</th>
                  {dayNames.map((day, index) => (
                    <th key={day} className="text-center p-3 font-medium w-20">
                      <div className="flex flex-col items-center">
                        {weekStart && (
                          <span className="text-xs text-muted-foreground">{getHeaderDate(index)}</span>
                        )}
                        <span>{day}</span>
                      </div>
                    </th>
                  ))}
                  <th className="text-center p-3 font-medium w-24">Total</th>
                </tr>
              </thead>
              <tbody>
                {/* Attendance Hours Row */}
                {attendanceHours && (
                  <tr className="border-b bg-muted/30">
                    <td className="p-3">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Attendance Hours
                      </span>
                    </td>
                    {attendanceHours.daily.map((hours, index) => (
                      <td key={index} className="p-3 text-center">
                        <span className="text-sm text-muted-foreground">{hours}</span>
                      </td>
                    ))}
                    <td className="p-3 text-center">
                      <span className="text-sm font-medium text-muted-foreground">
                        {attendanceHours.weekTotal}
                      </span>
                    </td>
                  </tr>
                )}

                {rows.map((row) => (
                  <tr key={row.rowId} className="border-b hover:bg-muted/25">
                    <td className="p-3">
                      <div className="space-y-1">
                        <div className="font-medium text-sm">
                          {row.projectName} ▸ {row.taskName}
                        </div>
                        {!row.billable && (
                          <Select
                            value={row.nonBillableCategoryId || ''}
                            onValueChange={(value) => onChangeCategory(row.rowId, value)}
                            disabled={readonly}
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        <div className="flex gap-1">
                          <Badge variant={row.billable ? 'default' : 'secondary'} className="text-xs">
                            {row.billable ? 'Billable' : 'Non-billable'}
                          </Badge>
                          {getWarningsForCell(row.rowId).length > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {getWarningsForCell(row.rowId).length} warning(s)
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    {row.daily.map((dailyEntry, dayIndex) => {
                      const cellWarnings = getWarningsForCell(row.rowId, dayIndex)
                      const hasMissingComment = isMissingComment(row.rowId, dayIndex)
                      const hasHours = dailyEntry.hours > 0
                      const hasComment = dailyEntry.comment?.trim()
                      
                      return (
                        <td key={dayIndex} className="p-1 text-center">
                          <div className="relative group">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div>
                                  <TimeEntryPopover
                                    value={dailyEntry.hours}
                                    comment={dailyEntry.comment}
                                    onChange={(value, comment) => onChangeCell(row.rowId, dayIndex, value, comment)}
                                    disabled={readonly}
                                  >
                                    <div
                                      className={cn(
                                        "h-8 flex items-center justify-center text-sm cursor-pointer rounded border-2 border-transparent hover:border-muted transition-colors",
                                        cellWarnings.length > 0 && "bg-destructive/10 text-destructive",
                                        hasMissingComment && "border-amber-500 bg-amber-50",
                                        readonly && "cursor-default hover:border-transparent"
                                      )}
                                      data-testid={`cell-${row.rowId}-${dayIndex}`}
                                    >
                                      {hasHours ? formatDecimalToTime(dailyEntry.hours) : '0:00'}
                                    </div>
                                  </TimeEntryPopover>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent 
                                side="top" 
                                className="bg-slate-800 text-white min-w-[60px] min-h-[24px]"
                              >
                                {hasComment ? (
                                  <p>{dailyEntry.comment}</p>
                                ) : (
                                  <span className="text-slate-400 text-xs">No comment</span>
                                )}
                              </TooltipContent>
                            </Tooltip>
                            
                            {/* Delete icon for individual cell */}
                            {hasHours && !readonly && onDeleteEntry && (
                              <button
                                onClick={() => onDeleteEntry(row.rowId, dayIndex)}
                                className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hidden group-hover:flex"
                                title="Delete entry"
                              >
                                <Trash2 className="h-2.5 w-2.5" />
                              </button>
                            )}
                            
                            {cellWarnings.length > 0 && (
                              <div className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
                            )}
                            {/* Missing comment warning */}
                            {hasMissingComment && (
                              <div className="mt-0.5">
                                <span className="text-[10px] text-amber-600 font-medium flex items-center justify-center gap-0.5">
                                  <AlertTriangle className="h-2.5 w-2.5" />
                                  COMMENT
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                      )
                    })}
                    
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-medium">{formatDecimalToTime(calculateRowTotal(row))}</span>
                        {rowHasAnyHours(row) && !readonly && onDeleteRow && (
                          <button
                            onClick={() => onDeleteRow(row.rowId)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            title="Delete all entries in this row"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Add Time Entry Row */}
                {!readonly && (
                  <tr className="border-b">
                    <td colSpan={9} className="p-3">
                      {addTimeEntryContent || (
                        <button
                          onClick={onAddRow}
                          className="flex items-center gap-1 text-cyan-600 hover:text-cyan-700 text-sm font-medium transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          Add Time Entry
                        </button>
                      )}
                    </td>
                  </tr>
                )}

                {/* Total Hours/Day Row */}
                {dailyTotals.length > 0 && (
                  <tr className="bg-muted/30">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Total hours/day
                        </span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Total of all time entries for each day</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </td>
                    {dailyTotals.map((total, index) => (
                      <td key={index} className="p-3 text-center">
                        <span className="text-sm font-medium">{formatDecimalToTime(total)}</span>
                      </td>
                    ))}
                    <td className="p-3 text-center">
                      <span className="text-sm font-bold">{formatDecimalToTime(weekTotalHours)}</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {warnings.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-destructive">Warnings</h4>
            <div className="space-y-1">
              {warnings.map((warning, index) => (
                <div key={index} className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                  {warning.message}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
