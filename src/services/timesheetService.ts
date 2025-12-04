// Timesheet service with mock data

import { format, startOfWeek, addDays, subWeeks, parseISO } from 'date-fns'
import { supabase } from '@/integrations/supabase/client'
import type { 
  Timesheet, 
  TimesheetEntry, 
  TimesheetHistoryItem, 
  NonBillableCategory, 
  ProjectAssignment, 
  ProjectTask,
  ClientExportProfile,
  ExportPreview,
  ExportRun,
  TimesheetTotals,
  TimesheetWarning,
  TimesheetPolicy,
  HistoryFilter,
  ExportFilters
} from '@/types/timesheet'

// Mock data
const mockNonBillableCategories: NonBillableCategory[] = [
  { id: 'training', name: 'Training', isActive: true },
  { id: 'presales', name: 'Pre-sales', isActive: true },
  { id: 'bench', name: 'Bench', isActive: true },
  { id: 'internal', name: 'Internal Ops', isActive: true },
  { id: 'admin', name: 'Admin', isActive: true },
  { id: 'meetings', name: 'Meetings', isActive: true }
]

const mockProjects: ProjectAssignment[] = [
  { projectId: 'p1', code: 'PRJ001', name: 'Project Alpha', client: 'Client A', billable: true, allocStart: '2024-01-01', allocEnd: '2024-12-31' },
  { projectId: 'p2', code: 'PRJ002', name: 'Project Beta', client: 'Client B', billable: true, allocStart: '2024-06-01', allocEnd: '2024-12-31' },
  { projectId: 'p3', code: 'INT001', name: 'Internal Project', client: 'Internal', billable: false }
]

const mockTasks: Record<string, ProjectTask[]> = {
  'p1': [
    { taskId: 't1', code: 'DEV', name: 'Development', billable: true },
    { taskId: 't2', code: 'TEST', name: 'Testing', billable: true },
    { taskId: 't3', code: 'DOC', name: 'Documentation', billable: false }
  ],
  'p2': [
    { taskId: 't4', code: 'ARCH', name: 'Architecture', billable: true },
    { taskId: 't5', code: 'IMPL', name: 'Implementation', billable: true }
  ],
  'p3': [
    { taskId: 't6', code: 'TRAIN', name: 'Training', billable: false },
    { taskId: 't7', code: 'MEET', name: 'Meetings', billable: false }
  ]
}

const mockExportProfiles: ClientExportProfile[] = [
  { id: 'clientA', name: 'Client A Format', format: 'XLSX', isActive: true },
  { id: 'clientB', name: 'Client B Format', format: 'CSV', isActive: true },
  { id: 'generic', name: 'Generic Export', format: 'XLSX', isActive: true }
]

const mockPolicy: TimesheetPolicy = {
  maxPerDay: 24,
  maxPerWeek: 60,
  backdateWeeksLimit: 6,
  lockAfterApproval: true
}

export class TimesheetService {
  private static instance: TimesheetService
  private timesheets: Map<string, Timesheet> = new Map()

  static getInstance(): TimesheetService {
    if (!TimesheetService.instance) {
      TimesheetService.instance = new TimesheetService()
    }
    return TimesheetService.instance
  }

  async getTimesheet(employeeId: string, weekStart: string): Promise<Timesheet> {
    const key = `${employeeId}-${weekStart}`
    
    if (!this.timesheets.has(key)) {
      // Create new timesheet
      const timesheet: Timesheet = {
        id: `ts-${Date.now()}`,
        employeeId,
        weekStart,
        status: 'DRAFT',
        totalHours: 0,
        entries: []
      }
      this.timesheets.set(key, timesheet)
    }

    return this.timesheets.get(key)!
  }

  async saveTimesheet(timesheetId: string, status: 'SAVED' | 'SUBMITTED', comment?: string): Promise<{ ok: boolean }> {
    for (const timesheet of this.timesheets.values()) {
      if (timesheet.id === timesheetId) {
        timesheet.status = status
        if (comment) timesheet.submissionComment = comment
        if (status === 'SUBMITTED') {
          timesheet.submittedAt = new Date().toISOString()
        }
        break
      }
    }
    return { ok: true }
  }

  async bulkUpsertEntries(timesheetId: string, entries: any[]): Promise<{ ok: boolean; totals: TimesheetTotals }> {
    // Mock implementation
    const totals: TimesheetTotals = {
      week: entries.reduce((sum, entry) => sum + (entry.hours || 0), 0),
      byDay: Array(7).fill(0).map((_, i) => 
        entries.filter(e => new Date(e.day).getDay() === (i + 1) % 7).reduce((sum, e) => sum + (e.hours || 0), 0)
      ),
      billable: entries.filter(e => e.workType === 'BILLABLE').reduce((sum, e) => sum + (e.hours || 0), 0),
      nonBillable: entries.filter(e => e.workType === 'NON_BILLABLE').reduce((sum, e) => sum + (e.hours || 0), 0),
      timeOff: entries.filter(e => e.workType === 'TIME_OFF').reduce((sum, e) => sum + (e.hours || 0), 0)
    }
    
    return { ok: true, totals }
  }

  async recallTimesheet(timesheetId: string): Promise<{ ok: boolean }> {
    for (const timesheet of this.timesheets.values()) {
      if (timesheet.id === timesheetId && timesheet.status === 'SUBMITTED') {
        timesheet.status = 'SAVED'
        timesheet.submittedAt = undefined
        break
      }
    }
    return { ok: true }
  }

  async getHistory(employeeId: string, filter: HistoryFilter): Promise<TimesheetHistoryItem[]> {
    const now = new Date()
    const items: TimesheetHistoryItem[] = []
    
    // Generate mock history for last 12 weeks
    for (let i = 0; i < 12; i++) {
      const weekStart = format(startOfWeek(subWeeks(now, i), { weekStartsOn: 1 }), 'yyyy-MM-dd')
      const status = i === 0 ? 'DRAFT' : i === 1 ? 'SUBMITTED' : i <= 3 ? 'APPROVED' : 'APPROVED'
      
      if (filter.status && filter.status !== 'All' && status !== filter.status) continue
      
      items.push({
        weekStart,
        status,
        totalHours: 40 + Math.random() * 8,
        billablePercentage: 80 + Math.random() * 15,
        flags: i === 1 ? ['WARNINGS'] : [],
        submittedAt: i > 0 ? subWeeks(now, i - 0.5).toISOString() : undefined,
        approvedAt: i > 1 ? subWeeks(now, i - 1).toISOString() : undefined
      })
    }
    
    return items
  }

  async getNonBillableCategories(): Promise<NonBillableCategory[]> {
    return mockNonBillableCategories
  }

  async getAssignedProjects(employeeId: string): Promise<ProjectAssignment[]> {
    try {
      const { data, error } = await supabase
        .from('crm_projects')
        .select(`
          id,
          name,
          start_date,
          end_date,
          client:crm_clients(name)
        `)
        .in('status', ['Planned', 'Active'])
        .order('name')

      if (error) {
        console.error('Error fetching projects:', error)
        return mockProjects // Fallback to mock data
      }

      if (!data || data.length === 0) {
        return mockProjects // Fallback to mock data if no projects
      }

      return data.map(project => ({
        projectId: project.id,
        code: project.id.slice(0, 8).toUpperCase(),
        name: project.name,
        client: (project.client as any)?.name || 'Unknown',
        billable: true,
        allocStart: project.start_date || undefined,
        allocEnd: project.end_date || undefined
      }))
    } catch (error) {
      console.error('Error fetching projects:', error)
      return mockProjects // Fallback to mock data
    }
  }

  async getAssignedTasks(employeeId: string, projectId: string): Promise<ProjectTask[]> {
    return mockTasks[projectId] || []
  }

  async getActiveExportProfiles(): Promise<ClientExportProfile[]> {
    return mockExportProfiles
  }

  async previewExport(profileId: string, periodStart: string, periodEnd: string, filters?: ExportFilters): Promise<ExportPreview> {
    return {
      headers: ['Date', 'Project', 'Task', 'Hours', 'Billable', 'Description'],
      rows: [
        ['2024-01-01', 'Project Alpha', 'Development', '8.0', 'Yes', 'Feature implementation'],
        ['2024-01-02', 'Project Alpha', 'Testing', '6.5', 'Yes', 'Unit testing'],
        ['2024-01-03', 'Internal Project', 'Training', '2.0', 'No', 'Team training session']
      ],
      warnings: filters?.billableOnly ? ['Non-billable entries excluded'] : undefined
    }
  }

  async runExport(profileId: string, periodStart: string, periodEnd: string, filters?: ExportFilters): Promise<{ fileRef: string; rows: number }> {
    const fileRef = `export-${profileId}-${Date.now()}.xlsx`
    return { fileRef, rows: 15 }
  }

  async getExportLogs(employeeId: string, limit: number = 20): Promise<ExportRun[]> {
    const now = new Date()
    return Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
      id: `run-${i}`,
      at: subWeeks(now, i * 2).toISOString(),
      profileName: mockExportProfiles[i % mockExportProfiles.length].name,
      rows: 15 + i * 3,
      fileRef: `export-${i}-${Date.now()}.xlsx`
    }))
  }

  getPolicy(): TimesheetPolicy {
    return mockPolicy
  }

  validateWeekEntries(entries: TimesheetEntry[], policy: TimesheetPolicy): TimesheetWarning[] {
    const warnings: TimesheetWarning[] = []
    
    entries.forEach(entry => {
      entry.daily.forEach((hours, dayIndex) => {
        if (hours > policy.maxPerDay) {
          warnings.push({
            rowId: entry.rowId,
            dayIndex,
            type: 'CAP_DAY',
            message: `Exceeds daily limit of ${policy.maxPerDay} hours`
          })
        }
      })
      
      const weekTotal = entry.daily.reduce((sum, hours) => sum + hours, 0)
      if (weekTotal > policy.maxPerWeek) {
        warnings.push({
          rowId: entry.rowId,
          type: 'CAP_WEEK',
          message: `Exceeds weekly limit of ${policy.maxPerWeek} hours`
        })
      }
    })
    
    return warnings
  }
}