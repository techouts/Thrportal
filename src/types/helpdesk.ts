// Help Desk Module Types

export type TicketCategory = 'HR' | 'IT' | 'Facilities' | 'Finance' | 'Admin'

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical'

export type TicketStatus = 'New' | 'Assigned' | 'In Progress' | 'Pending Info' | 'Resolved' | 'Closed'

export type ResolutionMode = 'Email' | 'Call' | 'Meeting'

export interface TicketSubCategory {
  [key: string]: string[]
}

export const TICKET_SUBCATEGORIES: TicketSubCategory = {
  'HR': [
    'Leave/Timesheet',
    'Payroll',
    'Benefits',
    'Policy Clarification',
    'Regularization',
    'Exception Requests',
    'Employee Relations'
  ],
  'IT': [
    'System Access',
    'Hardware/Software',
    'Login/Password',
    'Network'
  ],
  'Facilities': [
    'Workstation',
    'Seating',
    'Transport',
    'Pantry',
    'Security'
  ],
  'Finance': [
    'Reimbursements',
    'Tax Queries',
    'Salary Disbursement',
    'Invoices',
    'Expense Reports'
  ],
  'Admin': [
    'General Inquiry',
    'System Administration',
    'User Management'
  ]
}

export interface TicketAttachment {
  id: string
  filename: string
  file_url: string
  file_size: number
  file_type: string
  uploaded_at: string
  uploaded_by: string
}

export interface TicketComment {
  id: string
  ticket_id: string
  comment: string
  created_by: string
  created_by_name: string
  created_at: string
  is_internal: boolean
  attachments?: TicketAttachment[]
}

export interface Ticket {
  id: string
  ticket_number: string
  category: TicketCategory
  sub_category: string
  priority: TicketPriority
  status: TicketStatus
  title: string
  description: string
  preferred_resolution_mode: ResolutionMode
  created_by: string
  created_by_name: string
  assigned_to?: string
  assigned_to_name?: string
  created_at: string
  updated_at: string
  due_date: string
  resolved_at?: string
  closed_at?: string
  sla_first_response_due: string
  sla_resolution_due: string
  is_sla_breached: boolean
  escalation_level: number
  attachments: TicketAttachment[]
  comments: TicketComment[]
  department_owner: string
}

export interface CreateTicketData {
  category: TicketCategory
  sub_category: string
  priority: TicketPriority
  title: string
  description: string
  preferred_resolution_mode: ResolutionMode
  attachments?: File[]
}

export interface TicketFilters {
  category?: TicketCategory
  status?: TicketStatus
  priority?: TicketPriority
  assigned_to?: string
  date_range?: {
    start: string
    end: string
  }
  sla_breached?: boolean
}

export interface SLARule {
  category: TicketCategory
  sub_category: string
  first_response_hours: number
  resolution_hours: number
  escalation_hours: number
  escalation_to: string
}

export interface HelpdeskDashboardMetrics {
  total_tickets: number
  open_tickets: number
  resolved_tickets: number
  sla_compliance_percentage: number
  avg_resolution_time_hours: number
  overdue_tickets: number
  critical_tickets: number
  tickets_this_month: number
  tickets_last_month: number
  category_distribution: Array<{
    category: string
    count: number
    percentage: number
  }>
  priority_distribution: Array<{
    priority: string
    count: number
    percentage: number
  }>
  status_distribution: Array<{
    status: string
    count: number
    percentage: number
  }>
  sla_trends: Array<{
    date: string
    compliance_percentage: number
  }>
  resolution_trends: Array<{
    date: string
    avg_hours: number
  }>
  department_performance: Array<{
    department: string
    sla_compliance: number
    avg_resolution_time: number
    ticket_volume: number
  }>
}

export interface FAQ {
  id: string
  category: TicketCategory
  sub_category: string
  question: string
  answer: string
  tags: string[]
  created_at: string
  updated_at: string
  view_count: number
  helpful_count: number
  is_featured: boolean
}

export interface HelpdeskSettings {
  auto_close_days: number
  max_attachment_size_mb: number
  allowed_file_types: string[]
  enable_email_notifications: boolean
  enable_sla_alerts: boolean
  escalation_enabled: boolean
  working_hours: {
    start: string
    end: string
    days: string[]
  }
}

export interface EscalationRule {
  department: string
  level: number
  role: string
  hours_after: number
  notify_users: string[]
}

export interface TicketAgingReport {
  ticket_id: string
  ticket_number: string
  category: string
  priority: string
  status: string
  age_in_hours: number
  sla_due_in_hours: number
  assigned_to: string
  created_by: string
}

// Agent role types for different departments
export type AgentRole = 'HR_Agent' | 'IT_Agent' | 'Facilities_Agent' | 'Finance_Agent' | 'Admin_Agent'

export interface DepartmentAgent {
  user_id: string
  name: string
  email: string
  role: AgentRole
  department: TicketCategory
  is_manager: boolean
  is_available: boolean
  current_ticket_load: number
  max_ticket_capacity: number
}

// Ticket assignment and workload distribution
export interface TicketAssignment {
  ticket_id: string
  assigned_to: string
  assigned_by: string
  assigned_at: string
  assignment_reason: string
  workload_score: number
}

export interface WorkloadMetrics {
  agent_id: string
  active_tickets: number
  avg_resolution_time: number
  sla_compliance_rate: number
  customer_satisfaction_score: number
  tickets_resolved_this_month: number
}