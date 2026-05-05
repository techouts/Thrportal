export type BillableType = 'BILLABLE' | 'NON_BILLABLE'

export interface AllocationRow {
  id: string                  // = users.id
  employeeId: string
  employeeCode: string | null
  preferredName: string | null
  hireDate: string | null
  department: string | null
  jobTitle: string | null
  country: string | null
  clients: string[]           // distinct clients across all allocations
  projects: string[]          // distinct projects across all allocations
  billable: BillableType      // BILLABLE if any allocation is ACTIVE
  commenced: string | null    // earliest start_date among ACTIVE allocations
  remarks: string | null
  nonBillableReason: string | null
  allocationCount: number
}

export interface ProjectOption { id: string; name: string; clientId: string | null }
export interface ClientOption  { id: string; name: string }

export interface ManagementOptions {
  countries: string[]
  departments: string[]
  jobTitles: string[]
  clients: ClientOption[]
  projects: ProjectOption[]
  billableTypes: BillableType[]
}

export interface ListResponse {
  items: AllocationRow[]
  total: number
  page: number
  pageSize: number
}

export interface LabelCount {
  label: string
  count: number
}

export interface DashboardResponse {
  topClients: LabelCount[]
  byCountry: LabelCount[]
  byDepartment: LabelCount[]
  billableByDepartment: Array<{ department: string; billable: BillableType; count: number }>
  statusBuckets: LabelCount[]
  nonBillableBreakdown: Array<{ country: string; department: string; reason: string; count: number }>
  clientProjects: { client: string | null; rows: LabelCount[] }
  filterOptions: {
    countries: string[]
    departments: string[]
    clients: string[]
    projects: string[]
  }
}

export interface Filters {
  country?: string
  department?: string
  client?: string
  project?: string
  billable?: BillableType | ''
  search?: string
}
