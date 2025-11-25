// Home page data models for HRMS

export type Role = 'EMPLOYEE' | 'MANAGER' | 'DOTTED_LEAD' | 'HR' | 'ADMIN'

export interface Employee {
  id: string
  name: string
  email: string
  avatarUrl?: string
  managerId?: string
  dottedLeadIds?: string[]
  team: string
  locationCity?: string
  joinDate: string
  dobDayMonth: string
  birthdayVisibility: 'org' | 'team' | 'hidden'
}

export interface Recognition {
  id: string
  giverId: string
  receiverId: string
  category: 'CUSTOMER_DELIGHT' | 'INNOVATION_IMPACT' | 'TEAMWORK_COLLAB' | 'OWNERSHIP_LEADERSHIP' | 'QUALITY_EXCELLENCE' | 'RISING_STAR'
  badges: string[]
  message: string
  createdAt: string
  giver?: Employee
  receiver?: Employee
  applauds?: number
}

export interface Poll {
  id: string
  question: string
  options: { id: string; text: string }[]
  closesAt: string
  isAnonymous: true
  results: { optionId: string; pct: number }[]
  hasVoted: boolean
  userVote?: string
  participation: number
}

export interface Holiday {
  id: string
  name: string
  date: string
  region: string
}

export interface AttendanceEvent {
  id: string
  employeeId: string
  timestamp: string
  mode: 'Web' | 'Remote' | 'WFH'
  note?: string
}

export interface LeaveBalance {
  employeeId: string
  type: string
  balance: number
}

export interface LeaveUpcoming {
  id: string
  employeeId: string
  employeeName: string
  start: string
  end: string
  type: string
  status: 'APPROVED' | 'PENDING'
}

export interface Notification {
  id: string
  type: string
  title: string
  body: string
  createdAt: string
  read: boolean
}

export interface TeamAvailabilityRow {
  employeeId: string
  employeeName: string
  status: 'leave' | 'remote' | 'in_office'
  location?: string
  shift?: string
  note?: string
}

export interface BuddyAssignment {
  joinerId: string
  buddyId: string
  assignedBy: string
  assignedAt: string
}

export interface HRConfig {
  celebrationsVisibility: 'org' | 'team' | 'hidden'
  recognitionCategories: Recognition['category'][]
  badges: string[]
  coverageThreshold: number
}

export interface InspirationalQuote {
  id: string
  quote: string
  author: string
  isBookmarked?: boolean
}

export interface Celebration {
  id: string
  type: 'birthday' | 'anniversary' | 'new_joiner'
  employeeId: string
  employeeName: string
  date: string
  team: string
  years?: number
  role?: string
  managerId?: string
  managerName?: string
  buddyId?: string
  buddyName?: string
}

export interface ApprovalCounts {
  pendingTimesheets: number
  pendingLeaveRequests: number
  pendingExpenses: number
}