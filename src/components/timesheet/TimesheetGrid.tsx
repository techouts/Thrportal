import React, { useState, useCallback } from 'react'
import { MoreHorizontal, Plus, Trash2, Copy, ArrowRight, DivideSquare, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { TimesheetEntry, TimesheetWarning, TimesheetPolicy, NonBillableCategory } from '@/types/timesheet'

interface AttendanceHours {
  daily: string[]
  weekTotal: string
}

interface TimesheetGridProps {
  rows: TimesheetEntry[]
  onChangeCell: (rowId: string, dayIndex: number, value: number) => void
  onChangeCategory: (rowId: string, categoryId: string) => void
  onRowAction: (rowId: string, action: 'fillAcross' | 'splitEvenly' | 'duplicate' | 'delete') => void
  onAddRow: () => void
  policy: TimesheetPolicy
  warnings: TimesheetWarning[]
  categories: NonBillableCategory[]
  readonly?: boolean
  attendanceHours?: AttendanceHours
  dailyTotals?: number[]
}

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

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
  dailyTotals = []
}: TimesheetGridProps) {
  const [editingCell, setEditingCell] = useState<{rowId: string, dayIndex: number} | null>(null)

  const getWarningsForCell = useCallback((rowId: string, dayIndex?: number) => {
    return warnings.filter(w => 
      w.rowId === rowId && (dayIndex === undefined || w.dayIndex === dayIndex)
    )
  }, [warnings])

  const handleCellClick = (rowId: string, dayIndex: number) => {
    if (!readonly) {
      setEditingCell({ rowId, dayIndex })
    }
  }

  const handleCellBlur = () => {
    setEditingCell(null)
  }

  const handleCellChange = (rowId: string, dayIndex: number, value: string) => {
    const numValue = Math.max(0, Math.min(24, parseFloat(value) || 0))
    onChangeCell(rowId, dayIndex, numValue)
  }

  const calculateRowTotal = (row: TimesheetEntry) => {
    return row.daily.reduce((sum, hours) => sum + hours, 0)
  }

  const formatHours = (hours: number) => {
    return hours % 1 === 0 ? hours.toString() : hours.toFixed(1)
  }

  // Convert decimal hours to HH:MM format for total row
  const formatDecimalToTime = (decimal: number): string => {
    if (!decimal || decimal === 0) return '0:00'
    const hours = Math.floor(decimal)
    const minutes = Math.round((decimal - hours) * 60)
    return `${hours}:${minutes.toString().padStart(2, '0')}`
  }

  const weekTotalHours = dailyTotals.reduce((sum, h) => sum + h, 0)

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium min-w-[300px]">Project ▸ Task</th>
                {dayNames.map(day => (
                  <th key={day} className="text-center p-3 font-medium w-20">{day}</th>
                ))}
                <th className="text-center p-3 font-medium w-20">Total</th>
                <th className="text-center p-3 font-medium w-16">Actions</th>
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
                  <td className="p-3"></td>
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
                  
                  {row.daily.map((hours, dayIndex) => {
                    const cellWarnings = getWarningsForCell(row.rowId, dayIndex)
                    const isEditing = editingCell?.rowId === row.rowId && editingCell?.dayIndex === dayIndex
                    
                    return (
                      <td key={dayIndex} className="p-1 text-center">
                        <div className="relative">
                          {isEditing ? (
                            <Input
                              type="number"
                              value={hours.toString()}
                              onChange={(e) => handleCellChange(row.rowId, dayIndex, e.target.value)}
                              onBlur={handleCellBlur}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCellBlur()
                                if (e.key === 'Escape') handleCellBlur()
                              }}
                              className="h-8 text-center text-sm border-primary"
                              step="0.1"
                              min="0"
                              max="24"
                              autoFocus
                            />
                          ) : (
                            <div
                              onClick={() => handleCellClick(row.rowId, dayIndex)}
                              className={cn(
                                "h-8 flex items-center justify-center text-sm cursor-pointer rounded border-2 border-transparent hover:border-muted transition-colors",
                                cellWarnings.length > 0 && "bg-destructive/10 text-destructive",
                                readonly && "cursor-default hover:border-transparent"
                              )}
                              data-testid={`cell-${row.rowId}-${dayIndex}`}
                            >
                              {hours > 0 ? formatHours(hours) : ''}
                            </div>
                          )}
                          {cellWarnings.length > 0 && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
                          )}
                        </div>
                      </td>
                    )
                  })}
                  
                  <td className="p-3 text-center font-medium">
                    {formatHours(calculateRowTotal(row))}
                  </td>
                  
                  <td className="p-1 text-center">
                    {!readonly && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onRowAction(row.rowId, 'fillAcross')}>
                            <ArrowRight className="mr-2 h-4 w-4" />
                            Fill Mon→Fri
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onRowAction(row.rowId, 'splitEvenly')}>
                            <DivideSquare className="mr-2 h-4 w-4" />
                            Split evenly
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onRowAction(row.rowId, 'duplicate')}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate row
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onRowAction(row.rowId, 'delete')}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete row
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </td>
                </tr>
              ))}

              {/* Total Hours/Day Row */}
              {dailyTotals.length > 0 && (
                <tr className="border-b bg-muted/30">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Total hours/day
                      </span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Total of all time entries for each day</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
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
                  <td className="p-3"></td>
                </tr>
              )}
              
              {/* Add Time Entry Link */}
              {!readonly && (
                <tr>
                  <td colSpan={10} className="p-3">
                    <button
                      onClick={onAddRow}
                      className="flex items-center gap-1 text-cyan-600 hover:text-cyan-700 text-sm font-medium transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add Time Entry
                    </button>
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
  )
}
