import { ApiResponse, PaginatedResponse, Employee, LeaveRequest, Attendance, Announcement } from '@/types'

// Recognition types
interface Recognition {
  id: string
  giverEmployeeId: string
  receiverEmployeeId: string
  giverName: string
  receiverName: string
  category: string
  categoryName: string
  message: string
  points: number
  isPublic: boolean
  dateGiven: string
  status: string
}

interface RewardCategory {
  id: string
  name: string
  description: string
  points: number
  icon: string
  color: string
  isActive: boolean
}

interface RewardRequest {
  id: string
  employeeId: string
  employeeName: string
  rewardId: string
  rewardName: string
  pointsCost: number
  requestDate: string
  status: string
  approverType: string
  approverId: string
  approverName: string
  comments: string
  approvalDate: string | null
  approvalComments: string | null
}

interface Reward {
  id: string
  name: string
  description: string
  pointsCost: number
  category: string
  isActive: boolean
  stock: number | null
  approvalRequired: boolean
  approverType: string | null
  imageUrl: string
  estimatedDelivery: string
}

interface LeaderboardData {
  organization: Array<{
    rank: number
    employeeId: string
    employeeName: string
    department: string
    totalPoints: number
    recognitionsReceived: number
    recognitionsGiven: number
    avatar: string
    pointsThisMonth: number
    lastRecognition: string
  }>
  departments: Record<string, Array<{
    rank: number
    employeeId: string
    employeeName: string
    totalPoints: number
    recognitionsReceived: number
    recognitionsGiven: number
    avatar: string
  }>>
  stats: {
    totalRecognitions: number
    totalPointsAwarded: number
    activeParticipants: number
    topCategory: string
    averagePointsPerEmployee: number
    monthOverMonthGrowth: number
  }
}

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

  // Recognition endpoints
  static async getRecognitions(params?: {
    page?: number
    limit?: number
    employeeId?: string
    category?: string
    dateFrom?: string
    dateTo?: string
  }): Promise<PaginatedResponse<Recognition>> {
    let recognitions = await this.fetchJson<Recognition[]>('/recognition-data.json')
    
    // Apply filters
    if (params?.employeeId) {
      recognitions = recognitions.filter(rec => 
        rec.giverEmployeeId === params.employeeId || 
        rec.receiverEmployeeId === params.employeeId
      )
    }
    
    if (params?.category && params.category !== 'all') {
      recognitions = recognitions.filter(rec => rec.category === params.category)
    }
    
    if (params?.dateFrom) {
      recognitions = recognitions.filter(rec => 
        new Date(rec.dateGiven) >= new Date(params.dateFrom!)
      )
    }
    
    if (params?.dateTo) {
      recognitions = recognitions.filter(rec => 
        new Date(rec.dateGiven) <= new Date(params.dateTo!)
      )
    }

    // Sort by date (newest first)
    recognitions.sort((a, b) => 
      new Date(b.dateGiven).getTime() - new Date(a.dateGiven).getTime()
    )

    return this.wrapPaginatedResponse(
      recognitions,
      params?.page || 1,
      params?.limit || 10
    )
  }

  static async getRewardCategories(): Promise<ApiResponse<RewardCategory[]>> {
    const categories = await this.fetchJson<RewardCategory[]>('/reward-categories.json')
    return this.wrapResponse(categories.filter(cat => cat.isActive))
  }

  static async getRewardRequests(params?: {
    page?: number
    limit?: number
    employeeId?: string
    status?: string
    approverType?: string
  }): Promise<PaginatedResponse<RewardRequest>> {
    let requests = await this.fetchJson<RewardRequest[]>('/reward-requests.json')
    
    if (params?.employeeId) {
      requests = requests.filter(req => req.employeeId === params.employeeId)
    }
    
    if (params?.status && params.status !== 'all') {
      requests = requests.filter(req => req.status === params.status)
    }
    
    if (params?.approverType) {
      requests = requests.filter(req => req.approverType === params.approverType)
    }

    // Sort by request date (newest first)
    requests.sort((a, b) => 
      new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()
    )

    return this.wrapPaginatedResponse(
      requests,
      params?.page || 1,
      params?.limit || 10
    )
  }

  static async getRewardsCatalog(params?: {
    page?: number
    limit?: number
    category?: string
    maxPoints?: number
  }): Promise<PaginatedResponse<Reward>> {
    let rewards = await this.fetchJson<Reward[]>('/rewards-catalog.json')
    
    // Filter active rewards
    rewards = rewards.filter(reward => reward.isActive)
    
    if (params?.category && params.category !== 'all') {
      rewards = rewards.filter(reward => reward.category === params.category)
    }
    
    if (params?.maxPoints) {
      rewards = rewards.filter(reward => reward.pointsCost <= params.maxPoints)
    }

    // Sort by points cost (lowest first)
    rewards.sort((a, b) => a.pointsCost - b.pointsCost)

    return this.wrapPaginatedResponse(
      rewards,
      params?.page || 1,
      params?.limit || 12
    )
  }

  static async getLeaderboard(type: 'organization' | 'department' = 'organization', department?: string): Promise<ApiResponse<any>> {
    const leaderboard = await this.fetchJson<LeaderboardData>('/leaderboard-data.json')
    
    if (type === 'organization') {
      return this.wrapResponse({
        rankings: leaderboard.organization,
        stats: leaderboard.stats
      })
    } else if (type === 'department' && department) {
      return this.wrapResponse({
        rankings: leaderboard.departments[department] || [],
        stats: leaderboard.stats
      })
    }
    
    return this.wrapResponse({
      rankings: [],
      stats: leaderboard.stats
    })
  }

  static async getUserPoints(employeeId: string): Promise<ApiResponse<{
    totalPoints: number
    pointsThisMonth: number
    recognitionsReceived: number
    recognitionsGiven: number
    availableBalance: number
  }>> {
    const leaderboard = await this.fetchJson<LeaderboardData>('/leaderboard-data.json')
    const requests = await this.fetchJson<RewardRequest[]>('/reward-requests.json')
    
    const userRanking = leaderboard.organization.find(user => user.employeeId === employeeId)
    
    if (!userRanking) {
      return this.wrapResponse({
        totalPoints: 0,
        pointsThisMonth: 0,
        recognitionsReceived: 0,
        recognitionsGiven: 0,
        availableBalance: 0
      })
    }
    
    // Calculate points spent on approved requests
    const approvedRequests = requests.filter(req => 
      req.employeeId === employeeId && req.status === 'approved'
    )
    const pointsSpent = approvedRequests.reduce((sum, req) => sum + req.pointsCost, 0)
    
    return this.wrapResponse({
      totalPoints: userRanking.totalPoints,
      pointsThisMonth: userRanking.pointsThisMonth,
      recognitionsReceived: userRanking.recognitionsReceived,
      recognitionsGiven: userRanking.recognitionsGiven,
      availableBalance: userRanking.totalPoints - pointsSpent
    })
  }
}