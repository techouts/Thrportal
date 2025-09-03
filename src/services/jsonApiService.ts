import { ApiResponse, PaginatedResponse, Employee, LeaveRequest, Attendance, Announcement } from '@/types'

// JSON API Service for development mode
export class JsonApiService {
  private static baseUrl = '/data'
  private static isJsonMode = import.meta.env.VITE_API_BASE_URL?.includes('/data') || true

  static async fetchJson<T>(endpoint: string): Promise<T> {
    if (!this.isJsonMode) {
      throw new Error('JsonApiService should only be used in JSON mode')
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`)
    }
    
    return response.json()
  }

  // Simulate API response format
  static wrapResponse<T>(data: T, message = 'Success'): ApiResponse<T> {
    return {
      data,
      message,
      success: true,
      timestamp: new Date().toISOString()
    }
  }

  // Simulate paginated response
  static wrapPaginatedResponse<T>(
    data: T[], 
    page = 1, 
    limit = 10,
    message = 'Success'
  ): PaginatedResponse<T> {
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedData = data.slice(startIndex, endIndex)
    
    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: data.length,
        totalPages: Math.ceil(data.length / limit)
      }
    }
  }

  // Employee endpoints
  static async getEmployees(params?: {
    page?: number
    limit?: number
    department?: string
    status?: string
    search?: string
  }): Promise<PaginatedResponse<Employee>> {
    let employees = await this.fetchJson<Employee[]>('/employees.json')
    
    // Apply filters
    if (params?.department && params.department !== 'all') {
      employees = employees.filter(emp => emp.department === params.department)
    }
    
    if (params?.status && params.status !== 'all') {
      employees = employees.filter(emp => emp.status === params.status)
    }
    
    if (params?.search) {
      const search = params.search.toLowerCase()
      employees = employees.filter(emp =>
        emp.firstName.toLowerCase().includes(search) ||
        emp.lastName.toLowerCase().includes(search) ||
        emp.email.toLowerCase().includes(search) ||
        emp.employeeId.toLowerCase().includes(search)
      )
    }

    return this.wrapPaginatedResponse(
      employees,
      params?.page || 1,
      params?.limit || 10
    )
  }

  static async getEmployeeById(id: string): Promise<ApiResponse<Employee>> {
    const employees = await this.fetchJson<Employee[]>('/employees.json')
    const employee = employees.find(emp => emp.id === id)
    
    if (!employee) {
      throw new Error('Employee not found')
    }
    
    return this.wrapResponse(employee)
  }

  // Leave requests endpoints
  static async getLeaveRequests(params?: {
    page?: number
    limit?: number
    status?: string
    employeeId?: string
  }): Promise<PaginatedResponse<LeaveRequest>> {
    let leaveRequests = await this.fetchJson<LeaveRequest[]>('/leave-requests.json')
    
    if (params?.status && params.status !== 'all') {
      leaveRequests = leaveRequests.filter(req => req.status === params.status)
    }
    
    if (params?.employeeId) {
      leaveRequests = leaveRequests.filter(req => req.employeeId === params.employeeId)
    }

    return this.wrapPaginatedResponse(
      leaveRequests,
      params?.page || 1,
      params?.limit || 10
    )
  }

  // Attendance endpoints
  static async getAttendance(params?: {
    page?: number
    limit?: number
    employeeId?: string
    date?: string
  }): Promise<PaginatedResponse<Attendance>> {
    let attendance = await this.fetchJson<Attendance[]>('/attendance.json')
    
    if (params?.employeeId) {
      attendance = attendance.filter(att => att.employeeId === params.employeeId)
    }
    
    if (params?.date) {
      attendance = attendance.filter(att => att.date === params.date)
    }

    return this.wrapPaginatedResponse(
      attendance,
      params?.page || 1,
      params?.limit || 10
    )
  }

  // Announcements endpoints
  static async getAnnouncements(params?: {
    page?: number
    limit?: number
    department?: string
  }): Promise<PaginatedResponse<Announcement>> {
    let announcements = await this.fetchJson<Announcement[]>('/announcements.json')
    
    // Filter active announcements
    announcements = announcements.filter(ann => ann.isActive)
    
    if (params?.department) {
      announcements = announcements.filter(ann => 
        !ann.department || ann.department === params.department
      )
    }

    // Sort by priority and date
    announcements.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      
      return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    })

    return this.wrapPaginatedResponse(
      announcements,
      params?.page || 1,
      params?.limit || 10
    )
  }

  // Dashboard stats
  static async getDashboardStats(): Promise<ApiResponse<any>> {
    const stats = await this.fetchJson<any>('/dashboard-stats.json')
    return this.wrapResponse(stats)
  }

  // Departments
  static async getDepartments(): Promise<ApiResponse<any[]>> {
    const departments = await this.fetchJson<any[]>('/departments.json')
    return this.wrapResponse(departments)
  }
}