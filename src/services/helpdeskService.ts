import { ApiResponse } from '../types'
import {
  Ticket,
  CreateTicketData,
  TicketFilters,
  HelpdeskDashboardMetrics,
  FAQ,
  TicketComment,
  TicketAttachment,
  SLARule,
  TicketCategory,
  TicketPriority,
  TicketStatus,
  TICKET_SUBCATEGORIES,
  DepartmentAgent,
  TicketAgingReport,
  WorkloadMetrics
} from '../types/helpdesk'

class HelpdeskService {
  private static instance: HelpdeskService

  static getInstance(): HelpdeskService {
    if (!HelpdeskService.instance) {
      HelpdeskService.instance = new HelpdeskService()
    }
    return HelpdeskService.instance
  }

  private generateTicketNumber(): string {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `HD${timestamp}${random}`
  }

  private calculateSLADates(category: TicketCategory, subCategory: string, createdAt: string) {
    const slaRules: Record<string, { firstResponse: number, resolution: number }> = {
      'HR-Leave/Timesheet': { firstResponse: 4, resolution: 24 },
      'HR-Payroll': { firstResponse: 6, resolution: 48 },
      'HR-Benefits': { firstResponse: 8, resolution: 72 },
      'HR-Policy Clarification': { firstResponse: 8, resolution: 72 },
      'HR-Exception Requests': { firstResponse: 4, resolution: 48 },
      'HR-Employee Relations': { firstResponse: 2, resolution: 120 },
      'IT-System Access': { firstResponse: 2, resolution: 24 },
      'IT-Hardware/Software': { firstResponse: 4, resolution: 48 },
      'IT-Login/Password': { firstResponse: 1, resolution: 4 },
      'IT-Network': { firstResponse: 2, resolution: 24 },
      'Facilities-Workstation': { firstResponse: 4, resolution: 24 },
      'Facilities-Seating': { firstResponse: 4, resolution: 48 },
      'Facilities-Transport': { firstResponse: 6, resolution: 48 },
      'Facilities-Pantry': { firstResponse: 8, resolution: 72 },
      'Facilities-Security': { firstResponse: 8, resolution: 72 },
      'Finance-Reimbursements': { firstResponse: 6, resolution: 72 },
      'Finance-Salary Disbursement': { firstResponse: 4, resolution: 24 },
      'Finance-Tax Queries': { firstResponse: 8, resolution: 72 },
      'Finance-Invoices': { firstResponse: 8, resolution: 120 }
    }

    const key = `${category}-${subCategory}`
    const sla = slaRules[key] || { firstResponse: 8, resolution: 48 }
    
    const createdDate = new Date(createdAt)
    const firstResponseDue = new Date(createdDate.getTime() + sla.firstResponse * 60 * 60 * 1000)
    const resolutionDue = new Date(createdDate.getTime() + sla.resolution * 60 * 60 * 1000)

    return {
      firstResponseDue: firstResponseDue.toISOString(),
      resolutionDue: resolutionDue.toISOString()
    }
  }

  // Employee Methods
  async createTicket(employeeId: string, ticketData: CreateTicketData): Promise<ApiResponse<Ticket>> {
    await new Promise(resolve => setTimeout(resolve, 1000))

    const now = new Date().toISOString()
    const ticketNumber = this.generateTicketNumber()
    const sla = this.calculateSLADates(ticketData.category, ticketData.sub_category, now)

    const newTicket: Ticket = {
      id: `ticket-${Date.now()}`,
      ticket_number: ticketNumber,
      category: ticketData.category,
      sub_category: ticketData.sub_category,
      priority: ticketData.priority,
      status: 'New',
      title: ticketData.title,
      description: ticketData.description,
      preferred_resolution_mode: ticketData.preferred_resolution_mode,
      created_by: employeeId,
      created_by_name: 'John Doe',
      created_at: now,
      updated_at: now,
      due_date: sla.resolutionDue,
      sla_first_response_due: sla.firstResponseDue,
      sla_resolution_due: sla.resolutionDue,
      is_sla_breached: false,
      escalation_level: 0,
      attachments: [],
      comments: [],
      department_owner: ticketData.category
    }

    return {
      success: true,
      data: newTicket,
      message: `Ticket ${ticketNumber} created successfully`,
      timestamp: new Date().toISOString()
    }
  }

  async getMyTickets(employeeId: string, filters?: TicketFilters): Promise<ApiResponse<Ticket[]>> {
    await new Promise(resolve => setTimeout(resolve, 600))

    const mockTickets: Ticket[] = [
      {
        id: '1',
        ticket_number: 'HD240001',
        category: 'IT',
        sub_category: 'Login/Password',
        priority: 'High',
        status: 'In Progress',
        title: 'Unable to login to company portal',
        description: 'I am unable to login to the company portal since yesterday. Getting invalid credentials error.',
        preferred_resolution_mode: 'Email',
        created_by: employeeId,
        created_by_name: 'John Doe',
        assigned_to: 'it-agent-1',
        assigned_to_name: 'IT Support Agent',
        created_at: '2024-02-01T09:00:00Z',
        updated_at: '2024-02-01T11:30:00Z',
        due_date: '2024-02-01T13:00:00Z',
        sla_first_response_due: '2024-02-01T10:00:00Z',
        sla_resolution_due: '2024-02-01T13:00:00Z',
        is_sla_breached: false,
        escalation_level: 0,
        attachments: [],
        comments: [
          {
            id: '1',
            ticket_id: '1',
            comment: 'We have reset your password. Please try logging in with the temporary password sent to your email.',
            created_by: 'it-agent-1',
            created_by_name: 'IT Support Agent',
            created_at: '2024-02-01T10:30:00Z',
            is_internal: false
          }
        ],
        department_owner: 'IT'
      },
      {
        id: '2',
        ticket_number: 'HD240002',
        category: 'HR',
        sub_category: 'Leave/Timesheet',
        priority: 'Medium',
        status: 'Resolved',
        title: 'Leave balance incorrect',
        description: 'My leave balance is showing incorrect information. It should be 15 days but showing 10 days.',
        preferred_resolution_mode: 'Call',
        created_by: employeeId,
        created_by_name: 'John Doe',
        assigned_to: 'hr-agent-1',
        assigned_to_name: 'HR Agent',
        created_at: '2024-01-28T14:00:00Z',
        updated_at: '2024-01-29T16:00:00Z',
        resolved_at: '2024-01-29T16:00:00Z',
        due_date: '2024-01-29T14:00:00Z',
        sla_first_response_due: '2024-01-28T18:00:00Z',
        sla_resolution_due: '2024-01-29T14:00:00Z',
        is_sla_breached: false,
        escalation_level: 0,
        attachments: [],
        comments: [
          {
            id: '2',
            ticket_id: '2',
            comment: 'Your leave balance has been corrected. The system was not accounting for your carried forward leaves.',
            created_by: 'hr-agent-1',
            created_by_name: 'HR Agent',
            created_at: '2024-01-29T16:00:00Z',
            is_internal: false
          }
        ],
        department_owner: 'HR'
      }
    ]

    return {
      success: true,
      data: mockTickets,
      message: 'Employee tickets retrieved successfully',
      timestamp: new Date().toISOString()
    }
  }

  async getFAQs(category?: TicketCategory): Promise<ApiResponse<FAQ[]>> {
    await new Promise(resolve => setTimeout(resolve, 400))

    const mockFAQs: FAQ[] = [
      {
        id: '1',
        category: 'IT',
        sub_category: 'Login/Password',
        question: 'How do I reset my password?',
        answer: 'You can reset your password by clicking the "Forgot Password" link on the login page or by contacting IT support.',
        tags: ['password', 'reset', 'login'],
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        view_count: 245,
        helpful_count: 198,
        is_featured: true
      },
      {
        id: '2',
        category: 'HR',
        sub_category: 'Leave/Timesheet',
        question: 'How do I apply for leave?',
        answer: 'Navigate to Me > Leave section in the portal and click on "Apply Leave". Fill in the required details and submit.',
        tags: ['leave', 'application', 'timesheet'],
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        view_count: 189,
        helpful_count: 156,
        is_featured: true
      },
      {
        id: '3',
        category: 'Finance',
        sub_category: 'Reimbursements',
        question: 'What documents are required for expense reimbursement?',
        answer: 'You need to provide original receipts, expense form duly filled, and manager approval for reimbursement claims.',
        tags: ['reimbursement', 'expenses', 'documents'],
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        view_count: 134,
        helpful_count: 112,
        is_featured: false
      }
    ]

    const filteredFAQs = category ? mockFAQs.filter(faq => faq.category === category) : mockFAQs

    return {
      success: true,
      data: filteredFAQs,
      message: 'FAQs retrieved successfully',
      timestamp: new Date().toISOString()
    }
  }

  // Department Methods (HR, IT, Facilities, Finance)
  async getTicketQueue(department: TicketCategory, filters?: TicketFilters): Promise<ApiResponse<Ticket[]>> {
    await new Promise(resolve => setTimeout(resolve, 800))

    const mockTickets: Ticket[] = [
      {
        id: '3',
        ticket_number: 'HD240003',
        category: department,
        sub_category: department === 'IT' ? 'System Access' : 'Leave/Timesheet',
        priority: 'Critical',
        status: 'New',
        title: 'System access required urgently',
        description: 'New employee needs immediate system access for project work.',
        preferred_resolution_mode: 'Call',
        created_by: 'emp-123',
        created_by_name: 'Jane Smith',
        created_at: '2024-02-02T08:00:00Z',
        updated_at: '2024-02-02T08:00:00Z',
        due_date: '2024-02-02T10:00:00Z',
        sla_first_response_due: '2024-02-02T10:00:00Z',
        sla_resolution_due: '2024-02-03T08:00:00Z',
        is_sla_breached: false,
        escalation_level: 0,
        attachments: [],
        comments: [],
        department_owner: department
      },
      {
        id: '4',
        ticket_number: 'HD240004',
        category: department,
        sub_category: department === 'IT' ? 'Hardware/Software' : 'Payroll',
        priority: 'Medium',
        status: 'Assigned',
        title: 'Laptop performance issues',
        description: 'Laptop is running very slowly, affecting productivity.',
        preferred_resolution_mode: 'Meeting',
        created_by: 'emp-124',
        created_by_name: 'Mike Johnson',
        assigned_to: `${department.toLowerCase()}-agent-1`,
        assigned_to_name: `${department} Agent`,
        created_at: '2024-02-01T16:00:00Z',
        updated_at: '2024-02-02T09:00:00Z',
        due_date: '2024-02-03T16:00:00Z',
        sla_first_response_due: '2024-02-01T20:00:00Z',
        sla_resolution_due: '2024-02-03T16:00:00Z',
        is_sla_breached: false,
        escalation_level: 0,
        attachments: [],
        comments: [],
        department_owner: department
      }
    ]

    return {
      success: true,
      data: mockTickets,
      message: `${department} ticket queue retrieved successfully`,
      timestamp: new Date().toISOString()
    }
  }

  async getWorkInProgress(department: TicketCategory): Promise<ApiResponse<Ticket[]>> {
    await new Promise(resolve => setTimeout(resolve, 600))

    const mockTickets: Ticket[] = [
      {
        id: '5',
        ticket_number: 'HD240005',
        category: department,
        sub_category: department === 'IT' ? 'Network' : 'Benefits',
        priority: 'High',
        status: 'In Progress',
        title: 'Network connectivity issues in conference room',
        description: 'WiFi not working in main conference room during meetings.',
        preferred_resolution_mode: 'Meeting',
        created_by: 'emp-125',
        created_by_name: 'Sarah Wilson',
        assigned_to: `${department.toLowerCase()}-agent-2`,
        assigned_to_name: `${department} Senior Agent`,
        created_at: '2024-02-01T10:00:00Z',
        updated_at: '2024-02-02T14:00:00Z',
        due_date: '2024-02-02T10:00:00Z',
        sla_first_response_due: '2024-02-01T12:00:00Z',
        sla_resolution_due: '2024-02-02T10:00:00Z',
        is_sla_breached: true,
        escalation_level: 1,
        attachments: [],
        comments: [
          {
            id: '3',
            ticket_id: '5',
            comment: 'Investigating the network infrastructure in the conference room.',
            created_by: `${department.toLowerCase()}-agent-2`,
            created_by_name: `${department} Senior Agent`,
            created_at: '2024-02-01T12:30:00Z',
            is_internal: false
          }
        ],
        department_owner: department
      }
    ]

    return {
      success: true,
      data: mockTickets,
      message: `${department} work in progress tickets retrieved successfully`,
      timestamp: new Date().toISOString()
    }
  }

  async getDashboardMetrics(department: TicketCategory): Promise<ApiResponse<HelpdeskDashboardMetrics>> {
    await new Promise(resolve => setTimeout(resolve, 1000))

    const mockMetrics: HelpdeskDashboardMetrics = {
      total_tickets: 234,
      open_tickets: 45,
      resolved_tickets: 189,
      sla_compliance_percentage: 87.5,
      avg_resolution_time_hours: 18.2,
      overdue_tickets: 8,
      critical_tickets: 3,
      tickets_this_month: 67,
      tickets_last_month: 52,
      category_distribution: [
        { category: 'System Access', count: 23, percentage: 35 },
        { category: 'Hardware/Software', count: 18, percentage: 27 },
        { category: 'Login/Password', count: 15, percentage: 23 },
        { category: 'Network', count: 10, percentage: 15 }
      ],
      priority_distribution: [
        { priority: 'Critical', count: 3, percentage: 7 },
        { priority: 'High', count: 12, percentage: 27 },
        { priority: 'Medium', count: 23, percentage: 51 },
        { priority: 'Low', count: 7, percentage: 15 }
      ],
      status_distribution: [
        { status: 'New', count: 8, percentage: 18 },
        { status: 'Assigned', count: 12, percentage: 27 },
        { status: 'In Progress', count: 15, percentage: 33 },
        { status: 'Pending Info', count: 5, percentage: 11 },
        { status: 'Resolved', count: 5, percentage: 11 }
      ],
      sla_trends: [
        { date: '2024-01-28', compliance_percentage: 85 },
        { date: '2024-01-29', compliance_percentage: 88 },
        { date: '2024-01-30', compliance_percentage: 86 },
        { date: '2024-01-31', compliance_percentage: 90 },
        { date: '2024-02-01', compliance_percentage: 87 }
      ],
      resolution_trends: [
        { date: '2024-01-28', avg_hours: 20.5 },
        { date: '2024-01-29', avg_hours: 18.2 },
        { date: '2024-01-30', avg_hours: 19.8 },
        { date: '2024-01-31', avg_hours: 16.5 },
        { date: '2024-02-01', avg_hours: 18.2 }
      ],
      department_performance: [
        { department: 'IT', sla_compliance: 87.5, avg_resolution_time: 18.2, ticket_volume: 45 },
        { department: 'HR', sla_compliance: 92.1, avg_resolution_time: 24.5, ticket_volume: 38 },
        { department: 'Finance', sla_compliance: 89.3, avg_resolution_time: 32.8, ticket_volume: 22 },
        { department: 'Facilities', sla_compliance: 84.7, avg_resolution_time: 28.9, ticket_volume: 19 }
      ]
    }

    return {
      success: true,
      data: mockMetrics,
      message: `${department} dashboard metrics retrieved successfully`,
      timestamp: new Date().toISOString()
    }
  }

  // Common Actions
  async assignTicket(ticketId: string, agentId: string, assignedBy: string): Promise<ApiResponse<Ticket>> {
    await new Promise(resolve => setTimeout(resolve, 500))

    return {
      success: true,
      data: {} as Ticket,
      message: 'Ticket assigned successfully',
      timestamp: new Date().toISOString()
    }
  }

  async updateTicketStatus(ticketId: string, status: TicketStatus, comment?: string): Promise<ApiResponse<Ticket>> {
    await new Promise(resolve => setTimeout(resolve, 500))

    return {
      success: true,
      data: {} as Ticket,
      message: 'Ticket status updated successfully',
      timestamp: new Date().toISOString()
    }
  }

  async addComment(ticketId: string, comment: string, isInternal: boolean = false, attachments?: File[]): Promise<ApiResponse<TicketComment>> {
    await new Promise(resolve => setTimeout(resolve, 400))

    const newComment: TicketComment = {
      id: `comment-${Date.now()}`,
      ticket_id: ticketId,
      comment,
      created_by: 'current-user',
      created_by_name: 'Current User',
      created_at: new Date().toISOString(),
      is_internal: isInternal,
      attachments: []
    }

    return {
      success: true,
      data: newComment,
      message: 'Comment added successfully',
      timestamp: new Date().toISOString()
    }
  }

  async getSubCategories(category: TicketCategory): Promise<string[]> {
    return TICKET_SUBCATEGORIES[category] || []
  }

  async suggestPriority(category: TicketCategory, subCategory: string): Promise<TicketPriority> {
    // Priority suggestion logic based on category and subcategory
    const criticalItems = ['Login/Password', 'System Access', 'Salary Disbursement', 'Employee Relations']
    const highItems = ['Network', 'Hardware/Software', 'Leave/Timesheet', 'Reimbursements']
    
    if (criticalItems.includes(subCategory)) return 'Critical'
    if (highItems.includes(subCategory)) return 'High'
    return 'Medium'
  }

  async bulkUpdateTickets(ticketIds: string[], updates: Partial<Ticket>): Promise<ApiResponse<void>> {
    await new Promise(resolve => setTimeout(resolve, 800))

    return {
      success: true,
      data: undefined,
      message: `${ticketIds.length} tickets updated successfully`,
      timestamp: new Date().toISOString()
    }
  }

  async escalateTicket(ticketId: string, reason: string): Promise<ApiResponse<Ticket>> {
    await new Promise(resolve => setTimeout(resolve, 600))

    return {
      success: true,
      data: {} as Ticket,
      message: 'Ticket escalated successfully',
      timestamp: new Date().toISOString()
    }
  }

  // Get tickets by department
  async getDepartmentTickets(department: TicketCategory): Promise<ApiResponse<Ticket[]>> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const mockTickets: Ticket[] = [
      {
        id: '3',
        ticket_number: 'HD240003',
        category: department,
        sub_category: department === 'IT' ? 'System Access' : department === 'Facilities' ? 'Workstation' : 'Reimbursements',
        priority: 'Critical',
        status: 'New',
        title: 'System access required urgently',
        description: 'New employee needs immediate system access for project work.',
        preferred_resolution_mode: 'Call',
        created_by: 'emp-123',
        created_by_name: 'Jane Smith',
        created_at: '2024-02-02T08:00:00Z',
        updated_at: '2024-02-02T08:00:00Z',
        due_date: '2024-02-02T10:00:00Z',
        sla_first_response_due: '2024-02-02T10:00:00Z',
        sla_resolution_due: '2024-02-03T08:00:00Z',
        is_sla_breached: false,
        escalation_level: 0,
        attachments: [],
        comments: [],
        department_owner: department
      }
    ]
    
    const departmentTickets = mockTickets.filter(ticket => ticket.category === department)
    
    return {
      success: true,
      data: departmentTickets,
      message: `${department} tickets retrieved successfully`,
      timestamp: Date.now().toString()
    }
  }
}

export const helpdeskService = HelpdeskService.getInstance()