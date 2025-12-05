// Timesheet service with database integration

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
  ExportFilters,
  DailyEntry
} from '@/types/timesheet'

// Mock data for categories and tasks (will be replaced with DB later)
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

const genericTasks: ProjectTask[] = [
  { taskId: 't1', code: 'DEV', name: 'Development', billable: true },
  { taskId: 't2', code: 'TEST', name: 'Testing', billable: true },
  { taskId: 't3', code: 'DESIGN', name: 'Design', billable: true },
  { taskId: 't4', code: 'REQ', name: 'Requirements', billable: true },
  { taskId: 't5', code: 'DOC', name: 'Documentation', billable: false },
  { taskId: 't6', code: 'DEPLOY', name: 'Deployment', billable: true },
  { taskId: 't7', code: 'REVIEW', name: 'Code Review', billable: true },
  { taskId: 't8', code: 'MEET', name: 'Meetings', billable: false },
  { taskId: 't9', code: 'SUPPORT', name: 'Support', billable: true },
  { taskId: 't10', code: 'PLAN', name: 'Planning', billable: true },
]

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

  static getInstance(): TimesheetService {
    if (!TimesheetService.instance) {
      TimesheetService.instance = new TimesheetService()
    }
    return TimesheetService.instance
  }

  // Helper to create empty daily entries
  private createEmptyDailyEntries(): DailyEntry[] {
    return Array(7).fill(null).map(() => ({ hours: 0, comment: '' }))
  }

  // Fetch timesheet from database
  async getTimesheet(employeeId: string, weekStart: string): Promise<Timesheet> {
    const weekEnd = format(addDays(parseISO(weekStart), 6), 'yyyy-MM-dd')

    // Try to fetch existing timesheet
    const { data: timesheetData, error: timesheetError } = await supabase
      .from('timesheets')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('week_start', weekStart)
      .maybeSingle()

    if (timesheetError) {
      console.error('Error fetching timesheet:', timesheetError)
      throw timesheetError
    }

    // If no timesheet exists, return a new draft
    if (!timesheetData) {
      return {
        id: '',
        employeeId,
        weekStart,
        weekEnd,
        status: 'DRAFT',
        totalHours: 0,
        billableHours: 0,
        entries: []
      }
    }

    // Fetch entries for the timesheet
    const { data: entriesData, error: entriesError } = await supabase
      .from('timesheet_entries')
      .select('*')
      .eq('timesheet_id', timesheetData.id)
      .order('entry_date')

    if (entriesError) {
      console.error('Error fetching entries:', entriesError)
      throw entriesError
    }

    // Group entries by project+task to build TimesheetEntry rows
    const entryMap = new Map<string, TimesheetEntry>()
    
    for (const entry of (entriesData || [])) {
      const key = `${entry.project_id || 'none'}-${entry.task_id || 'none'}`
      const entryDate = parseISO(entry.entry_date)
      const dayIndex = (entryDate.getDay() + 6) % 7 // Convert Sun=0 to Mon=0
      
      if (!entryMap.has(key)) {
        entryMap.set(key, {
          id: entry.id,
          rowId: `row-${entry.project_id}-${entry.task_id}`,
          projectId: entry.project_id || '',
          projectName: '', // Will be populated below
          taskId: entry.task_id || '',
          taskName: entry.task_name || '',
          billable: entry.is_billable ?? true,
          daily: this.createEmptyDailyEntries()
        })
      }
      
      const timesheetEntry = entryMap.get(key)!
      timesheetEntry.daily[dayIndex] = {
        hours: Number(entry.hours) || 0,
        comment: entry.comment || ''
      }
    }

    // Populate project names
    const entries = Array.from(entryMap.values())
    const projectIds = [...new Set(entries.map(e => e.projectId).filter(Boolean))]
    
    if (projectIds.length > 0) {
      const { data: projectsData } = await supabase
        .from('crm_projects')
        .select('id, name')
        .in('id', projectIds)
      
      const projectMap = new Map((projectsData || []).map(p => [p.id, p.name]))
      
      for (const entry of entries) {
        entry.projectName = projectMap.get(entry.projectId) || 'Unknown Project'
      }
    }

    return {
      id: timesheetData.id,
      employeeId: timesheetData.employee_id,
      weekStart: timesheetData.week_start,
      weekEnd: timesheetData.week_end,
      status: timesheetData.status as Timesheet['status'],
      totalHours: Number(timesheetData.total_hours) || 0,
      billableHours: Number(timesheetData.billable_hours) || 0,
      submittedAt: timesheetData.submitted_at || undefined,
      approvedAt: timesheetData.approved_at || undefined,
      approverComment: timesheetData.approver_comment || undefined,
      submissionComment: timesheetData.submission_comment || undefined,
      entries
    }
  }

  // Save timesheet to database
  async saveTimesheet(
    employeeId: string,
    weekStart: string,
    entries: TimesheetEntry[],
    status: 'SAVED' | 'SUBMITTED',
    submissionComment?: string
  ): Promise<{ ok: boolean; timesheet: Timesheet }> {
    const weekEnd = format(addDays(parseISO(weekStart), 6), 'yyyy-MM-dd')
    
    // Calculate totals
    let totalHours = 0
    let billableHours = 0
    
    for (const entry of entries) {
      const entryTotal = entry.daily.reduce((sum, d) => sum + d.hours, 0)
      totalHours += entryTotal
      if (entry.billable) {
        billableHours += entryTotal
      }
    }

    // Upsert timesheet
    const { data: timesheetData, error: timesheetError } = await supabase
      .from('timesheets')
      .upsert({
        employee_id: employeeId,
        week_start: weekStart,
        week_end: weekEnd,
        status,
        total_hours: totalHours,
        billable_hours: billableHours,
        submission_comment: submissionComment || null,
        submitted_at: status === 'SUBMITTED' ? new Date().toISOString() : null
      }, {
        onConflict: 'employee_id,week_start'
      })
      .select()
      .single()

    if (timesheetError) {
      console.error('Error saving timesheet:', timesheetError)
      throw timesheetError
    }

    const timesheetId = timesheetData.id

    // Delete existing entries and insert new ones
    await supabase
      .from('timesheet_entries')
      .delete()
      .eq('timesheet_id', timesheetId)

    // Prepare entries for insert
    const entriesToInsert: any[] = []
    
    for (const entry of entries) {
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const dailyEntry = entry.daily[dayIndex]
        if (dailyEntry.hours > 0 || dailyEntry.comment) {
          const entryDate = format(addDays(parseISO(weekStart), dayIndex), 'yyyy-MM-dd')
          
          entriesToInsert.push({
            timesheet_id: timesheetId,
            project_id: entry.projectId || null,
            task_id: entry.taskId,
            task_name: entry.taskName,
            entry_date: entryDate,
            hours: dailyEntry.hours,
            comment: dailyEntry.comment || null,
            is_billable: entry.billable
          })
        }
      }
    }

    if (entriesToInsert.length > 0) {
      const { error: entriesError } = await supabase
        .from('timesheet_entries')
        .insert(entriesToInsert)

      if (entriesError) {
        console.error('Error saving entries:', entriesError)
        throw entriesError
      }
    }

    return {
      ok: true,
      timesheet: {
        id: timesheetId,
        employeeId,
        weekStart,
        weekEnd,
        status,
        totalHours,
        billableHours,
        submissionComment,
        submittedAt: status === 'SUBMITTED' ? new Date().toISOString() : undefined,
        entries
      }
    }
  }

  async recallTimesheet(timesheetId: string): Promise<{ ok: boolean }> {
    const { error } = await supabase
      .from('timesheets')
      .update({
        status: 'SAVED',
        submitted_at: null
      })
      .eq('id', timesheetId)
      .eq('status', 'SUBMITTED')

    if (error) {
      console.error('Error recalling timesheet:', error)
      throw error
    }

    return { ok: true }
  }

  async getHistory(employeeId: string, filter: HistoryFilter): Promise<TimesheetHistoryItem[]> {
    let query = supabase
      .from('timesheets')
      .select('*')
      .eq('employee_id', employeeId)
      .order('week_start', { ascending: false })
      .limit(20)

    if (filter.status && filter.status !== 'All') {
      query = query.eq('status', filter.status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching history:', error)
      // Return mock data as fallback
      return this.getMockHistory(filter)
    }

    return (data || []).map(ts => ({
      weekStart: ts.week_start,
      status: ts.status,
      totalHours: Number(ts.total_hours) || 0,
      billablePercentage: ts.total_hours > 0 
        ? (Number(ts.billable_hours) / Number(ts.total_hours)) * 100 
        : 0,
      flags: [],
      submittedAt: ts.submitted_at || undefined,
      approvedAt: ts.approved_at || undefined
    }))
  }

  private getMockHistory(filter: HistoryFilter): TimesheetHistoryItem[] {
    const now = new Date()
    const items: TimesheetHistoryItem[] = []
    
    for (let i = 0; i < 12; i++) {
      const weekStart = format(startOfWeek(subWeeks(now, i), { weekStartsOn: 1 }), 'yyyy-MM-dd')
      const status = i === 0 ? 'DRAFT' : i === 1 ? 'SUBMITTED' : 'APPROVED'
      
      if (filter.status && filter.status !== 'All' && status !== filter.status) continue
      
      items.push({
        weekStart,
        status,
        totalHours: 40 + Math.random() * 8,
        billablePercentage: 80 + Math.random() * 15,
        flags: [],
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
        return mockProjects
      }

      if (!data || data.length === 0) {
        return mockProjects
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
      return mockProjects
    }
  }

  async getAssignedTasks(employeeId: string, projectId: string): Promise<ProjectTask[]> {
    return genericTasks
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
      entry.daily.forEach((dailyEntry, dayIndex) => {
        if (dailyEntry.hours > policy.maxPerDay) {
          warnings.push({
            rowId: entry.rowId,
            dayIndex,
            type: 'CAP_DAY',
            message: `Exceeds daily limit of ${policy.maxPerDay} hours`
          })
        }
      })
      
      const weekTotal = entry.daily.reduce((sum, d) => sum + d.hours, 0)
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

  // Validate that all entries with hours have comments (for submission)
  validateCommentsForSubmit(entries: TimesheetEntry[]): { valid: boolean; missingComments: { rowId: string; dayIndex: number }[] } {
    const missingComments: { rowId: string; dayIndex: number }[] = []
    
    for (const entry of entries) {
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const daily = entry.daily[dayIndex]
        if (daily.hours > 0 && !daily.comment.trim()) {
          missingComments.push({ rowId: entry.rowId, dayIndex })
        }
      }
    }

    return {
      valid: missingComments.length === 0,
      missingComments
    }
  }
}
