// Core HR System Types

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  role: 'Employee' | 'Manager' | 'Recruiter' | 'HR' | 'Management' | 'Admin'
  department: string
  position: string
  employeeId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Employee {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  avatar?: string
  department: string
  position: string
  manager?: string
  location: string
  startDate: string
  status: 'active' | 'inactive' | 'pending'
  salary?: number
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
}

export interface LeaveRequest {
  id: string
  employeeId: string
  type: 'vacation' | 'sick' | 'personal' | 'maternity' | 'paternity'
  startDate: string
  endDate: string
  days: number
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  approvedBy?: string
  createdAt: string
}

export interface Attendance {
  id: string
  employeeId: string
  date: string
  checkIn?: string
  checkOut?: string
  breakTime?: number
  totalHours?: number
  status: 'present' | 'absent' | 'half-day' | 'late'
  location?: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  author: string
  department?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  publishDate: string
  expiryDate?: string
  isActive: boolean
  attachments?: string[]
}

export interface PerformanceReview {
  id: string
  employeeId: string
  reviewerId: string
  period: string
  status: 'draft' | 'in-progress' | 'completed'
  overallRating?: number
  goals: Goal[]
  feedback: string
  createdAt: string
  updatedAt: string
}

export interface Goal {
  id: string
  title: string
  description: string
  targetDate: string
  status: 'not-started' | 'in-progress' | 'completed'
  progress: number
}

export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
  timestamp: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  message: string
  code: string
  details?: any
  timestamp: string
}