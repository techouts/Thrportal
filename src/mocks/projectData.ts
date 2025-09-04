import { faker } from '@faker-js/faker'
import { 
  Client, 
  Project, 
  Task, 
  RoleCatalog, 
  Allocation, 
  Timesheet, 
  Invoice,
  ProjectDashboardMetrics,
  UtilizationData,
  RoleHeatmapData,
  RevenueData,
  BenchEmployee,
  ShadowAllocation,
  ForecastData
} from '@/types/projects'

// Mock data generators
export const mockClients: Client[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    code: 'ACME',
    billing_name: 'Acme Corp Ltd.',
    currency: 'USD',
    manager_id: 'mgr-1',
    manager_name: 'Sarah Johnson',
    address: '123 Business Ave, New York, NY 10001',
    description: 'Leading technology solutions provider',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'TechFlow Solutions',
    code: 'TECH',
    billing_name: 'TechFlow Solutions Inc.',
    currency: 'USD',
    manager_id: 'mgr-2',
    manager_name: 'Michael Chen',
    address: '456 Innovation Blvd, San Francisco, CA 94105',
    description: 'Digital transformation consultancy',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Global Industries',
    code: 'GLOB',
    billing_name: 'Global Industries Group',
    currency: 'EUR',
    manager_id: 'mgr-3',
    manager_name: 'Emma Williams',
    address: '789 Enterprise St, London, UK',
    description: 'Manufacturing and logistics company',
    created_at: '2024-02-15T00:00:00Z',
    updated_at: '2024-02-15T00:00:00Z'
  }
]

export const mockProjects: Project[] = [
  {
    id: '1',
    client_id: '1',
    client_name: 'Acme Corporation',
    code: 'ACME-001',
    name: 'Digital Platform Modernization',
    description: 'Complete overhaul of legacy systems',
    pm_id: 'pm-1',
    pm_name: 'Alex Rodriguez',
    status: 'active',
    start_date: '2024-01-01',
    end_date: '2024-06-30',
    billing_type: 'TM',
    allow_non_billable: true,
    allow_expenses: true,
    budget: 500000,
    actual_cost: 285000,
    margin: 0.32,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z'
  },
  {
    id: '2',
    client_id: '2',
    client_name: 'TechFlow Solutions',
    code: 'TECH-001',
    name: 'Mobile App Development',
    description: 'iOS and Android application development',
    pm_id: 'pm-2',
    pm_name: 'Jessica Park',
    status: 'active',
    start_date: '2024-02-01',
    end_date: '2024-05-31',
    billing_type: 'FIXED',
    allow_non_billable: false,
    allow_expenses: true,
    budget: 200000,
    actual_cost: 120000,
    margin: 0.28,
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-03-10T00:00:00Z'
  },
  {
    id: 'bench',
    client_id: 'internal',
    client_name: 'Internal',
    code: 'BENCH',
    name: 'Bench Time',
    description: 'Unallocated employee time',
    pm_id: 'system',
    pm_name: 'System',
    status: 'active',
    start_date: '2024-01-01',
    billing_type: 'TM',
    allow_non_billable: true,
    allow_expenses: false,
    budget: 0,
    actual_cost: 45000,
    margin: -1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

export const mockTasks: Task[] = [
  {
    id: '1',
    project_id: '1',
    project_name: 'Digital Platform Modernization',
    name: 'Requirements Analysis',
    description: 'Gather and document system requirements',
    stage: 'Discovery',
    phase: '1',
    est_hours: 120,
    actual_hours: 115,
    billable: true,
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    status: 'completed',
    assignees: ['emp-1', 'emp-2'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-31T00:00:00Z'
  },
  {
    id: '2',
    project_id: '1',
    project_name: 'Digital Platform Modernization',
    name: 'System Architecture Design',
    description: 'Design scalable system architecture',
    stage: 'Design',
    phase: '2',
    est_hours: 200,
    actual_hours: 175,
    billable: true,
    start_date: '2024-02-01',
    end_date: '2024-02-29',
    status: 'in_progress',
    assignees: ['emp-3', 'emp-4'],
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-15T00:00:00Z'
  }
]

export const mockRoles: RoleCatalog[] = [
  { id: '1', name: 'Senior Developer', suggested_cost_rate: 85 },
  { id: '2', name: 'Junior Developer', suggested_cost_rate: 55 },
  { id: '3', name: 'Project Manager', suggested_cost_rate: 95 },
  { id: '4', name: 'Business Analyst', suggested_cost_rate: 75 },
  { id: '5', name: 'UI/UX Designer', suggested_cost_rate: 70 },
  { id: '6', name: 'DevOps Engineer', suggested_cost_rate: 80 }
]

export const mockAllocations: Allocation[] = [
  {
    id: '1',
    employee_id: 'emp-1',
    employee_name: 'John Smith',
    project_id: '1',
    project_name: 'Digital Platform Modernization',
    role_id: '1',
    role_name: 'Senior Developer',
    type: 'ACTIVE',
    allocation_pct: 80,
    start_date: '2024-01-01',
    end_date: '2024-06-30',
    bill_rate: 120,
    cost_rate: 85,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    employee_id: 'emp-2',
    employee_name: 'Jane Doe',
    project_id: '2',
    project_name: 'Mobile App Development',
    role_id: '5',
    role_name: 'UI/UX Designer',
    type: 'SHADOW',
    allocation_pct: 60,
    start_date: '2024-03-01',
    end_date: '2024-05-31',
    bill_rate: 95,
    cost_rate: 70,
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z'
  },
  {
    id: '3',
    employee_id: 'emp-3',
    employee_name: 'Bob Johnson',
    project_id: 'bench',
    project_name: 'Bench Time',
    role_id: '2',
    role_name: 'Junior Developer',
    type: 'BENCH',
    allocation_pct: 100,
    start_date: '2024-03-15',
    bill_rate: 0,
    cost_rate: 55,
    created_at: '2024-03-15T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z'
  }
]

export const mockTimesheets: Timesheet[] = [
  {
    id: '1',
    employee_id: 'emp-1',
    employee_name: 'John Smith',
    project_id: '1',
    project_name: 'Digital Platform Modernization',
    task_id: '1',
    task_name: 'Requirements Analysis',
    date: '2024-03-15',
    hours: 8,
    overtime_hours: 0,
    allocation_type_snapshot: 'ACTIVE',
    description: 'Completed requirements documentation',
    status: 'approved',
    approved_by: 'pm-1',
    created_at: '2024-03-15T00:00:00Z',
    updated_at: '2024-03-16T00:00:00Z'
  },
  {
    id: '2',
    employee_id: 'emp-2',
    employee_name: 'Jane Doe',
    project_id: '2',
    project_name: 'Mobile App Development',
    task_id: '2',
    task_name: 'UI Design',
    date: '2024-03-15',
    hours: 6,
    overtime_hours: 2,
    allocation_type_snapshot: 'SHADOW',
    description: 'Created mobile app wireframes',
    status: 'submitted',
    created_at: '2024-03-15T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z'
  }
]

export const mockInvoices: Invoice[] = [
  {
    id: '1',
    project_id: '1',
    project_name: 'Digital Platform Modernization',
    client_id: '1',
    client_name: 'Acme Corporation',
    amount: 85000,
    status: 'PAID',
    issued_on: '2024-02-01',
    due_on: '2024-03-01',
    paid_on: '2024-02-28',
    description: 'January 2024 - Development Services'
  },
  {
    id: '2',
    project_id: '2',
    project_name: 'Mobile App Development',
    client_id: '2',
    client_name: 'TechFlow Solutions',
    amount: 45000,
    status: 'PENDING',
    issued_on: '2024-03-01',
    due_on: '2024-04-01',
    description: 'February 2024 - Design Services'
  },
  {
    id: '3',
    project_id: '1',
    project_name: 'Digital Platform Modernization',
    client_id: '1',
    client_name: 'Acme Corporation',
    amount: 92000,
    status: 'OVERDUE',
    issued_on: '2024-01-15',
    due_on: '2024-02-15',
    description: 'December 2023 - Development Services'
  }
]

// Dashboard data
export const mockDashboardMetrics: ProjectDashboardMetrics = {
  active_projects: 8,
  core_utilization: 78.5,
  effective_utilization: 84.2,
  bench_cost_per_day: 2840,
  estimated_margin_ytd: 28.6,
  invoices_overdue: 3
}

export const mockUtilizationData: UtilizationData[] = [
  { period: '2024-01', billable: 75.2, bench: 18.3, shadow: 6.5 },
  { period: '2024-02', billable: 78.1, bench: 15.4, shadow: 6.5 },
  { period: '2024-03', billable: 82.3, bench: 12.1, shadow: 5.6 }
]

export const mockRoleHeatmapData: RoleHeatmapData[] = [
  { role: 'Senior Developer', billable_pct: 85.2, bench_pct: 8.1, shadow_pct: 6.7 },
  { role: 'Junior Developer', billable_pct: 72.5, bench_pct: 22.1, shadow_pct: 5.4 },
  { role: 'Project Manager', billable_pct: 92.1, bench_pct: 4.2, shadow_pct: 3.7 },
  { role: 'Business Analyst', billable_pct: 78.9, bench_pct: 15.2, shadow_pct: 5.9 },
  { role: 'UI/UX Designer', billable_pct: 76.3, bench_pct: 18.4, shadow_pct: 5.3 },
  { role: 'DevOps Engineer', billable_pct: 88.7, bench_pct: 7.1, shadow_pct: 4.2 }
]

export const mockRevenueData: RevenueData[] = [
  { period: '2024-01', revenue: 285000, cost: 198000, margin: 87000, shadow_cost: 12000 },
  { period: '2024-02', revenue: 312000, cost: 218000, margin: 94000, shadow_cost: 15000 },
  { period: '2024-03', revenue: 298000, cost: 205000, margin: 93000, shadow_cost: 11000 }
]

export const mockBenchEmployees: BenchEmployee[] = [
  {
    id: 'emp-3',
    name: 'Bob Johnson',
    role: 'Junior Developer',
    skills: ['React', 'JavaScript', 'Node.js'],
    available_from: '2024-03-15',
    daily_cost: 440,
    bench_days: 12,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
  },
  {
    id: 'emp-4',
    name: 'Alice Cooper',
    role: 'Business Analyst',
    skills: ['Requirements', 'Process Design', 'Stakeholder Management'],
    available_from: '2024-03-20',
    daily_cost: 600,
    bench_days: 8,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b72cceaa?w=32&h=32&fit=crop&crop=face'
  }
]

export const mockShadowAllocations: ShadowAllocation[] = [
  {
    id: '2',
    employee_id: 'emp-2',
    employee_name: 'Jane Doe',
    role: 'UI/UX Designer',
    target_project: 'Mobile App Development',
    start_date: '2024-03-01',
    allocation_pct: 60,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face'
  }
]

export const mockForecastData: ForecastData[] = [
  { week: '2024-W13', role: 'Senior Developer', needed: 5, available: 4, shadow_coverage: 80 },
  { week: '2024-W13', role: 'Junior Developer', needed: 3, available: 5, shadow_coverage: 100 },
  { week: '2024-W14', role: 'Senior Developer', needed: 6, available: 4, shadow_coverage: 67 },
  { week: '2024-W14', role: 'Junior Developer', needed: 4, available: 5, shadow_coverage: 100 }
]

// API mock functions
export const mockApiDelay = (ms: number = 1000) => 
  new Promise(resolve => setTimeout(resolve, ms))

export const generateMockTimesheet = (employeeId: string, projectId: string): Timesheet => ({
  id: faker.string.uuid(),
  employee_id: employeeId,
  employee_name: faker.person.fullName(),
  project_id: projectId,
  project_name: faker.company.buzzPhrase(),
  task_id: faker.string.uuid(),
  task_name: faker.hacker.phrase(),
  date: faker.date.recent().toISOString().split('T')[0],
  hours: faker.number.int({ min: 4, max: 8 }),
  overtime_hours: faker.number.int({ min: 0, max: 4 }),
  allocation_type_snapshot: faker.helpers.arrayElement(['ACTIVE', 'SHADOW', 'BENCH']),
  description: faker.lorem.sentence(),
  status: faker.helpers.arrayElement(['draft', 'submitted', 'approved', 'rejected']),
  created_at: faker.date.recent().toISOString(),
  updated_at: faker.date.recent().toISOString()
})

export const generateMockProject = (): Project => ({
  id: faker.string.uuid(),
  client_id: faker.string.uuid(),
  client_name: faker.company.name(),
  code: faker.string.alphanumeric(8).toUpperCase(),
  name: faker.company.buzzPhrase(),
  description: faker.lorem.paragraph(),
  pm_id: faker.string.uuid(),
  pm_name: faker.person.fullName(),
  status: faker.helpers.arrayElement(['active', 'completed', 'on_hold', 'cancelled']),
  start_date: faker.date.past().toISOString().split('T')[0],
  end_date: faker.date.future().toISOString().split('T')[0],
  billing_type: faker.helpers.arrayElement(['TM', 'FIXED', 'MILESTONE', 'RETAINER']),
  allow_non_billable: faker.datatype.boolean(),
  allow_expenses: faker.datatype.boolean(),
  budget: faker.number.int({ min: 50000, max: 1000000 }),
  actual_cost: faker.number.int({ min: 25000, max: 500000 }),
  margin: faker.number.float({ min: 0.1, max: 0.4, fractionDigits: 2 }),
  created_at: faker.date.past().toISOString(),
  updated_at: faker.date.recent().toISOString()
})