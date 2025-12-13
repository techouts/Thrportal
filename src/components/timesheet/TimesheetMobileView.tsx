import React, { useState } from 'react'
import { format, addDays } from 'date-fns'
import { ChevronRight, Clock, Briefcase } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { TimesheetEntry, TimesheetTotals, NonBillableCategory } from '@/types/timesheet'

interface TimesheetMobileViewProps {
  rows: TimesheetEntry[]
  onChangeCell: (rowId: string, dayIndex: number, value: number, comment: string) => void
  onChangeCategory: (rowId: string, categoryId: string) => void
  weekStart: Date
  totals: TimesheetTotals
  categories: NonBillableCategory[]
  readonly?: boolean
  addTimeEntryContent?: React.ReactNode
}

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function TimesheetMobileView({
  rows,
  onChangeCell,
  onChangeCategory,
  weekStart,
  totals,
  categories,
  readonly = false,
  addTimeEntryContent
}: TimesheetMobileViewProps) {
  const [editingEntry, setEditingEntry] = useState<TimesheetEntry | null>(null)
  const [editingDailyData, setEditingDailyData] = useState<{ hours: number; comment: string }[]>([])

  const formatDecimalToTime = (decimal: number): string => {
    if (!decimal || decimal === 0) return '0:00'
    const hours = Math.floor(decimal)
    const minutes = Math.round((decimal - hours) * 60)
    return `${hours}:${minutes.toString().padStart(2, '0')}`
  }

  const calculateRowTotal = (row: TimesheetEntry) => {
    return row.daily.reduce((sum, d) => sum + d.hours, 0)
  }

  const getHeaderDate = (dayIndex: number): string => {
    const date = addDays(weekStart, dayIndex)
    return format(date, 'dd MMM')
  }

  const handleOpenEditSheet = (entry: TimesheetEntry) => {
    if (readonly) return
    setEditingEntry(entry)
    setEditingDailyData(entry.daily.map(d => ({ hours: d.hours, comment: d.comment })))
  }

  const handleSaveEntry = () => {
    if (!editingEntry) return
    
    editingDailyData.forEach((data, index) => {
      onChangeCell(editingEntry.rowId, index, data.hours, data.comment)
    })
    
    setEditingEntry(null)
    setEditingDailyData([])
  }

  const handleHoursChange = (dayIndex: number, value: string) => {
    const numValue = parseFloat(value) || 0
    setEditingDailyData(prev => prev.map((d, i) => 
      i === dayIndex ? { ...d, hours: numValue } : d
    ))
  }

  const handleCommentChange = (dayIndex: number, value: string) => {
    setEditingDailyData(prev => prev.map((d, i) => 
      i === dayIndex ? { ...d, comment: value } : d
    ))
  }

  return (
    <div className="space-y-4">
      {/* Weekly Summary Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{formatDecimalToTime(totals.week)}</div>
                <div className="text-sm text-muted-foreground">
                  Week of {format(weekStart, 'MMM d, yyyy')}
                </div>
              </div>
            </div>
            <div className="text-right space-y-1">
              <Badge variant="outline" className="text-xs">
                Billable: {formatDecimalToTime(totals.billable)}
              </Badge>
              <Badge variant="secondary" className="text-xs block">
                Non-billable: {formatDecimalToTime(totals.nonBillable)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Summary Row */}
      <div className="flex gap-1 overflow-x-auto pb-2">
        {dayNames.map((day, index) => (
          <div 
            key={day} 
            className={cn(
              "flex-1 min-w-[60px] text-center p-2 rounded-lg",
              totals.byDay[index] > 0 ? "bg-primary/10" : "bg-muted/50"
            )}
          >
            <div className="text-xs text-muted-foreground">{day}</div>
            <div className="text-sm font-medium">{formatDecimalToTime(totals.byDay[index])}</div>
          </div>
        ))}
      </div>

      {/* Project Cards */}
      <div className="space-y-3">
        {rows.map((row) => {
          const rowTotal = calculateRowTotal(row)
          
          return (
            <Card 
              key={row.rowId} 
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                !readonly && "active:scale-[0.99]"
              )}
              onClick={() => handleOpenEditSheet(row)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                      row.billable ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                    )}>
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{row.projectName}</div>
                      <div className="text-sm text-muted-foreground truncate">{row.taskName}</div>
                      {!row.billable && row.nonBillableCategoryId && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {categories.find(c => c.id === row.nonBillableCategoryId)?.name || 'Non-billable'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <div className="text-lg font-semibold">{formatDecimalToTime(rowTotal)}</div>
                      <div className="text-xs text-muted-foreground">
                        {row.billable ? 'Billable' : 'Non-billable'}
                      </div>
                    </div>
                    {!readonly && <ChevronRight className="h-5 w-5 text-muted-foreground" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Add Entry Button */}
      {!readonly && addTimeEntryContent && (
        <div className="pt-2">
          {addTimeEntryContent}
        </div>
      )}

      {/* Edit Sheet */}
      <Sheet open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
        <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-left">
              {editingEntry?.projectName} - {editingEntry?.taskName}
            </SheetTitle>
          </SheetHeader>
          
          {editingEntry && (
            <div className="space-y-4 py-4">
              {/* Category selector for non-billable */}
              {!editingEntry.billable && (
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={editingEntry.nonBillableCategoryId || ''}
                    onValueChange={(value) => onChangeCategory(editingEntry.rowId, value)}
                  >
                    <SelectTrigger>
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
                </div>
              )}

              {/* Daily entries */}
              <div className="space-y-4">
                {dayNames.map((day, index) => (
                  <div key={day} className="space-y-2 p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium">
                        {day} - {getHeaderDate(index)}
                      </Label>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Hours</Label>
                        <Input
                          type="number"
                          step="0.5"
                          min="0"
                          max="24"
                          value={editingDailyData[index]?.hours || ''}
                          onChange={(e) => handleHoursChange(index, e.target.value)}
                          className="mt-1"
                          placeholder="0"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs text-muted-foreground">Comment</Label>
                        <Textarea
                          value={editingDailyData[index]?.comment || ''}
                          onChange={(e) => handleCommentChange(index, e.target.value)}
                          className="mt-1 min-h-[60px]"
                          placeholder="Add comment..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <SheetFooter className="mt-4">
            <Button variant="outline" onClick={() => setEditingEntry(null)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSaveEntry} className="flex-1">
              Save Changes
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
