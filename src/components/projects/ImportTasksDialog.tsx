import { useState, useCallback } from 'react'
import * as XLSX from 'xlsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { taskService, CreateTaskInput } from '@/services/taskService'

interface ImportTasksDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  onSuccess: () => void
}

interface ParsedTask {
  name: string
  description: string | null
  estHours: number
  actualHours: number | null
  billable: boolean
  startDate: string | null
  endDate: string | null
  status: string
  isValid: boolean
  errors: string[]
}

const VALID_STATUSES = ['not_started', 'in_progress', 'completed', 'blocked']

export function ImportTasksDialog({ open, onOpenChange, projectId, onSuccess }: ImportTasksDialogProps) {
  const [parsedTasks, setParsedTasks] = useState<ParsedTask[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const { toast } = useToast()

  const resetState = useCallback(() => {
    setParsedTasks([])
    setFileName(null)
  }, [])

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetState()
    }
    onOpenChange(newOpen)
  }

  const downloadTemplate = () => {
    const templateData = [
      {
        'Task Name': 'Example Task 1',
        'Description': 'Task description here',
        'Estimated Hours': 8,
        'Actual Hours': 0,
        'Billable': 'Yes',
        'Start Date': '2024-01-15',
        'End Date': '2024-01-20',
        'Status': 'not_started'
      },
      {
        'Task Name': 'Example Task 2',
        'Description': '',
        'Estimated Hours': 4,
        'Actual Hours': 2,
        'Billable': 'No',
        'Start Date': '',
        'End Date': '',
        'Status': 'in_progress'
      }
    ]

    const ws = XLSX.utils.json_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Tasks')
    
    // Add column widths
    ws['!cols'] = [
      { wch: 25 }, { wch: 35 }, { wch: 15 }, { wch: 12 },
      { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 15 }
    ]

    XLSX.writeFile(wb, 'task_import_template.xlsx')
  }

  const parseBillable = (value: any): boolean => {
    if (typeof value === 'boolean') return value
    if (typeof value === 'number') return value === 1
    if (typeof value === 'string') {
      const lower = value.toLowerCase().trim()
      return lower === 'yes' || lower === 'true' || lower === '1'
    }
    return true // Default to billable
  }

  const parseDate = (value: any): string | null => {
    if (!value) return null
    if (typeof value === 'number') {
      // Excel date serial number
      const date = XLSX.SSF.parse_date_code(value)
      if (date) {
        return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`
      }
    }
    if (typeof value === 'string' && value.trim()) {
      const parsed = new Date(value)
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0]
      }
    }
    return null
  }

  const validateTask = (task: Partial<ParsedTask>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    if (!task.name || task.name.trim() === '') {
      errors.push('Task name is required')
    } else if (task.name.length > 255) {
      errors.push('Task name must be less than 255 characters')
    }
    
    if (task.estHours === undefined || task.estHours === null || isNaN(task.estHours)) {
      errors.push('Estimated hours is required')
    } else if (task.estHours < 0) {
      errors.push('Estimated hours must be positive')
    }
    
    if (task.status && !VALID_STATUSES.includes(task.status)) {
      errors.push(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`)
    }

    return { isValid: errors.length === 0, errors }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        const tasks: ParsedTask[] = jsonData.map((row: any) => {
          const task: Partial<ParsedTask> = {
            name: row['Task Name'] || row['task_name'] || row['name'] || '',
            description: row['Description'] || row['description'] || null,
            estHours: Number(row['Estimated Hours'] || row['est_hours'] || row['estHours'] || 0),
            actualHours: row['Actual Hours'] !== undefined && row['Actual Hours'] !== '' 
              ? Number(row['Actual Hours'] || row['actual_hours'] || row['actualHours']) 
              : null,
            billable: parseBillable(row['Billable'] || row['billable']),
            startDate: parseDate(row['Start Date'] || row['start_date'] || row['startDate']),
            endDate: parseDate(row['End Date'] || row['end_date'] || row['endDate']),
            status: (row['Status'] || row['status'] || 'not_started').toLowerCase().trim(),
          }

          const validation = validateTask(task)
          return {
            ...task,
            isValid: validation.isValid,
            errors: validation.errors
          } as ParsedTask
        })

        setParsedTasks(tasks)

        if (tasks.length === 0) {
          toast({
            title: 'No tasks found',
            description: 'The uploaded file contains no task data.',
            variant: 'destructive'
          })
        }
      } catch (error) {
        console.error('Error parsing file:', error)
        toast({
          title: 'Error parsing file',
          description: 'Please ensure the file is a valid Excel file.',
          variant: 'destructive'
        })
      }
    }

    reader.readAsArrayBuffer(file)
    // Reset input so same file can be uploaded again
    event.target.value = ''
  }

  const handleImport = async () => {
    const validTasks = parsedTasks.filter(t => t.isValid)
    if (validTasks.length === 0) {
      toast({
        title: 'No valid tasks',
        description: 'Please fix the validation errors before importing.',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    try {
      const tasksToCreate: CreateTaskInput[] = validTasks.map(task => ({
        projectId,
        name: task.name,
        description: task.description,
        estHours: task.estHours,
        actualHours: task.actualHours,
        billable: task.billable,
        startDate: task.startDate,
        endDate: task.endDate,
        status: task.status
      }))

      await taskService.createTasksBulk(tasksToCreate)

      const skippedCount = parsedTasks.length - validTasks.length
      toast({
        title: 'Import successful',
        description: `${validTasks.length} task(s) imported${skippedCount > 0 ? `, ${skippedCount} skipped` : ''}.`
      })

      onSuccess()
      handleOpenChange(false)
    } catch (error) {
      console.error('Error importing tasks:', error)
      toast({
        title: 'Import failed',
        description: 'An error occurred while importing tasks. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const validCount = parsedTasks.filter(t => t.isValid).length
  const invalidCount = parsedTasks.length - validCount

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import Tasks from Excel
          </DialogTitle>
          <DialogDescription>
            Upload an Excel file to bulk import tasks. Download the template for the correct format.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4">
          {/* Upload Section */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="file-upload" className="sr-only">Upload Excel file</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="flex-1"
                />
                {fileName && (
                  <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                    {fileName}
                  </span>
                )}
              </div>
            </div>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* Preview Section */}
          {parsedTasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Preview ({parsedTasks.length} tasks)</h4>
                <div className="flex items-center gap-2">
                  {validCount > 0 && (
                    <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {validCount} valid
                    </Badge>
                  )}
                  {invalidCount > 0 && (
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {invalidCount} invalid
                    </Badge>
                  )}
                </div>
              </div>

              <div className="border rounded-md max-h-[300px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30px]">Status</TableHead>
                      <TableHead>Task Name</TableHead>
                      <TableHead>Est. Hours</TableHead>
                      <TableHead>Billable</TableHead>
                      <TableHead>Task Status</TableHead>
                      <TableHead>Errors</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedTasks.map((task, index) => (
                      <TableRow key={index} className={!task.isValid ? 'bg-destructive/5' : ''}>
                        <TableCell>
                          {task.isValid ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium truncate max-w-[200px]">
                          {task.name || <span className="text-muted-foreground italic">Empty</span>}
                        </TableCell>
                        <TableCell>{task.estHours}</TableCell>
                        <TableCell>{task.billable ? 'Yes' : 'No'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {task.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-destructive text-xs">
                          {task.errors.join(', ')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {parsedTasks.length === 0 && (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                Upload an Excel file or download the template to get started
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={validCount === 0 || isLoading}
          >
            {isLoading ? 'Importing...' : `Import ${validCount} Task${validCount !== 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
