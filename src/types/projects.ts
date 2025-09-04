// Projects Module Types

export interface Client {
  id: string
  name: string
  code: string
  billing_name: string
  currency: string
  manager_id: string
  manager_name?: string
  address?: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  client_id: string
  client_name?: string
  code: string
  name: string
  description?: string
  pm_id: string
  pm_name?: string
  status: 'active' | 'completed' | 'on_hold' | 'cancelled'
  start_date: string
  end_date?: string
  billing_type: 'TM' | 'FIXED' | 'MILESTONE' | 'RETAINER'
  allow_non_billable: boolean
  allow_expenses: boolean
  budget?: number
  actual_cost?: number
  margin?: number
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  project_id: string
  project_name?: string
  name: string
  description?: string
  stage: string
  phase: string
  est_hours: number
  actual_hours?: number
  billable: boolean
  start_date: string
  end_date?: string
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked'
  assignees?: string[]
  created_at: string
  updated_at: string
}

export interface RoleCatalog {
  id: string
  name: string
  suggested_cost_rate: number
}

export interface Allocation {
  id: string
  employee_id: string
  employee_name?: string
  project_id?: string
  project_name?: string
  role_id: string
  role_name?: string
  type: 'BENCH' | 'SHADOW' | 'ACTIVE'
  allocation_pct: number
  start_date: string
  end_date?: string
  bill_rate: number
  cost_rate: number
  created_at: string
  updated_at: string
}

export interface Timesheet {
  id: string
  employee_id: string
  employee_name?: string
  project_id: string
  project_name?: string
  task_id: string
  task_name?: string
  date: string
  hours: number
  overtime_hours: number
  allocation_type_snapshot: 'BENCH' | 'SHADOW' | 'ACTIVE'
  description?: string
  approved_by?: string
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  project_id: string
  project_name?: string
  client_id: string
  client_name?: string
  amount: number
  status: 'PAID' | 'PENDING' | 'OVERDUE'
  issued_on: string
  due_on: string
  paid_on?: string
  description?: string
}

// Dashboard & Reporting Types
export interface ProjectDashboardMetrics {
  active_projects: number
  core_utilization: number
  effective_utilization: number
  bench_cost_per_day: number
  estimated_margin_ytd: number
  invoices_overdue: number
}

export interface UtilizationData {
  period: string
  billable: number
  bench: number
  shadow: number
}

export interface RoleHeatmapData {
  role: string
  billable_pct: number
  bench_pct: number
  shadow_pct: number
}

export interface RevenueData {
  period: string
  revenue: number
  cost: number
  margin: number
  shadow_cost?: number
}

export interface BenchEmployee {
  id: string
  name: string
  role: string
  skills: string[]
  available_from: string
  daily_cost: number
  bench_days: number
  avatar?: string
}

export interface ShadowAllocation {
  id: string
  employee_id: string
  employee_name: string
  role: string
  target_project: string
  start_date: string
  allocation_pct: number
  avatar?: string
}

export interface ForecastData {
  week: string
  role: string
  needed: number
  available: number
  shadow_coverage: number
}

// Filter types
export interface ProjectFilters {
  clientId?: string
  projectId?: string
  pmId?: string
  dateRange?: {
    start: string
    end: string
  }
  includeShadow?: boolean
}

// API Response types
export interface ProjectApiResponse<T> {
  data: T
  message: string
  success: boolean
  includeShadow?: boolean
  timestamp: string
}

export interface ProjectPaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  includeShadow?: boolean
}