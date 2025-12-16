// Timesheet module types

export interface DailyEntry {
  hours: number
  comment: string
}

export interface TimesheetEntry {
  id?: string
  rowId: string
  projectId: string
  projectName: string
  taskId: string
  taskName: string
  billable: boolean
  nonBillableCategoryId?: string
  daily: DailyEntry[] // 7 days, Mon-Sun with hours and comment per day
  // Auto-entry fields for leave/holiday entries
  isAutoEntry?: boolean
  autoEntryType?: 'leave' | 'holiday'
  autoEntryLabel?: string
}

export interface Timesheet {
  id: string
  employeeId: string
  weekStart: string // YYYY-MM-DD format (Monday)
  weekEnd?: string
  status: 'DRAFT' | 'SAVED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  approverId?: string
  submittedAt?: string
  approvedAt?: string
  rejectedAt?: string
  approverComment?: string
  totalHours: number
  billableHours?: number
  entries: TimesheetEntry[]
  submissionComment?: string
}

export interface TimesheetWarning {
  rowId: string
  dayIndex?: number // 0-6 for Mon-Sun
  type: 'LEAVE' | 'ALLOCATION' | 'CAP_DAY' | 'CAP_WEEK' | 'MISSING_COMMENT'
  message: string
}

export interface TimesheetPolicy {
  maxPerDay: number
  maxPerWeek: number
  backdateWeeksLimit: number
  lockAfterApproval: boolean
}

export interface NonBillableCategory {
  id: string
  name: string
  isActive: boolean
}

export interface ProjectAssignment {
  projectId: string
  code: string
  name: string
  client: string
  billable: boolean
  allocStart?: string
  allocEnd?: string
}

export interface ProjectTask {
  taskId: string
  code: string
  name: string
  billable: boolean
}

export interface HistoryFilter {
  weekStart?: string
  weekEnd?: string
  status?: string
  pastDue?: boolean
  search?: string
}

export interface TimesheetHistoryItem {
  weekStart: string
  status: string
  totalHours: number
  billablePercentage: number
  flags: string[]
  submittedAt?: string
  approvedAt?: string
}

export interface ClientExportProfile {
  id: string
  name: string
  format: 'XLSX' | 'CSV'
  isActive: boolean
}

export interface ExportFilters {
  billableOnly?: boolean
  excludeCategories?: string[]
}

export interface ExportPreview {
  headers: string[]
  rows: any[][]
  warnings?: string[]
}

export interface ExportRun {
  id: string
  at: string
  profileName: string
  rows: number
  fileRef: string
}

export interface TimesheetTotals {
  week: number
  byDay: number[]
  billable: number
  nonBillable: number
  timeOff: number
}
