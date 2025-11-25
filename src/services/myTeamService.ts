import { ApiResponse } from '@/types/attendance';

// Mock data for My Team module
export class MyTeamService {
  private static instance: MyTeamService;

  static getInstance(): MyTeamService {
    if (!MyTeamService.instance) {
      MyTeamService.instance = new MyTeamService();
    }
    return MyTeamService.instance;
  }

  // Dashboard Metrics
  async getDashboardMetrics(managerId: string): Promise<ApiResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      data: {
        teamSize: 16,
        leaveRequests: {
          pending: 8,
          approved: 24,
          utilization: 67
        },
        attendance: {
          presentToday: 14,
          avgAttendance: 92,
          lateArrivals: 2
        },
        expenses: {
          pending: 5,
          totalAmount: 285000,
          avgTurnaround: 4
        },
        timesheets: {
          pending: 3,
          overdue: 1,
          avgBillable: 78
        },
        performance: {
          reviewsCompleted: 12,
          goalsOnTrack: 85,
          pipCount: 1
        }
      },
      message: 'Dashboard metrics retrieved successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  // Leave Management
  async getLeaveMetrics(managerId: string): Promise<ApiResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return {
      data: {
        totalRequests: 45,
        pendingRequests: 8,
        approvedRequests: 35,
        rejectedRequests: 2,
        utilizationRate: 67,
        leaveTypeBreakdown: [
          { type: 'CL', count: 18, percentage: 40 },
          { type: 'SL', count: 12, percentage: 27 },
          { type: 'PL', count: 10, percentage: 22 },
          { type: 'WFH', count: 5, percentage: 11 }
        ],
        conflictingLeaves: 3,
        teamCalendar: [
          {
            employeeId: 'EMP001',
            employeeName: 'John Doe',
            leaves: [
              { id: '1', type: 'CL', startDate: '2024-02-15', endDate: '2024-02-16', status: 'approved' }
            ],
            wfhDays: ['2024-02-20', '2024-02-22']
          },
          {
            employeeId: 'EMP002',
            employeeName: 'Jane Smith',
            leaves: [
              { id: '2', type: 'SL', startDate: '2024-02-18', endDate: '2024-02-19', status: 'pending_L1' }
            ],
            wfhDays: []
          }
        ]
      },
      message: 'Leave metrics retrieved successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  // Expense Management
  async getExpenseMetrics(managerId: string): Promise<ApiResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return {
      data: {
        totalSubmitted: 285000,
        totalApproved: 245000,
        totalRejected: 15000,
        avgExpensePerEmployee: 17800,
        reimbursementTurnaround: 4,
        agingClaims: 12,
        topClaimers: [
          { name: 'Alice Johnson', amount: 45000, claims: 8 },
          { name: 'Bob Wilson', amount: 38000, claims: 6 },
          { name: 'Carol Davis', amount: 32000, claims: 7 },
          { name: 'David Brown', amount: 28000, claims: 5 },
          { name: 'Eve Miller', amount: 25000, claims: 4 }
        ],
        categoryTrends: [
          { category: 'Travel', amount: 125000, claims: 28 },
          { category: 'Food', amount: 75000, claims: 45 },
          { category: 'Lodging', amount: 60000, claims: 15 },
          { category: 'Others', amount: 25000, claims: 12 }
        ]
      },
      message: 'Expense metrics retrieved successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  // Timesheet Management
  async getTimesheetMetrics(managerId: string): Promise<ApiResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return {
      data: {
        submissionRate: 87,
        pendingSubmissions: 3,
        overdueSubmissions: 1,
        avgBillableHours: 32,
        avgNonBillableHours: 8,
        utilizationRate: 78,
        projectBurnRate: 92,
        pendingApprovals: 5,
        teamUtilization: [
          { name: 'John Doe', billable: 35, nonBillable: 5, utilization: 88 },
          { name: 'Jane Smith', billable: 30, nonBillable: 10, utilization: 75 },
          { name: 'Mike Johnson', billable: 38, nonBillable: 2, utilization: 95 },
          { name: 'Sarah Wilson', billable: 28, nonBillable: 12, utilization: 70 }
        ],
        weeklyTrend: [
          { week: 'Week 1', submissions: 14, overdue: 0, billable: 82 },
          { week: 'Week 2', submissions: 15, overdue: 1, billable: 78 },
          { week: 'Week 3', submissions: 13, overdue: 2, billable: 85 },
          { week: 'Week 4', submissions: 16, overdue: 0, billable: 88 }
        ]
      },
      message: 'Timesheet metrics retrieved successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  // Profile Changes
  async getProfileChangeMetrics(managerId: string): Promise<ApiResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return {
      data: {
        totalChanges: 28,
        pendingChanges: 8,
        approvedChanges: 18,
        rejectedChanges: 2,
        sensitiveChanges: 6,
        changesByCategory: [
          { category: 'Personal Info', count: 8, sensitive: true },
          { category: 'Contact Details', count: 12, sensitive: false },
          { category: 'Bank Details', count: 4, sensitive: true },
          { category: 'Emergency Contact', count: 4, sensitive: false }
        ],
        recentChanges: [
          {
            id: '1',
            employeeName: 'John Doe',
            changeType: 'Bank Details',
            field: 'Account Number',
            oldValue: '****1234',
            newValue: '****5678',
            status: 'pending',
            submittedAt: '2024-02-20T10:30:00Z',
            sensitive: true
          },
          {
            id: '2',
            employeeName: 'Jane Smith',
            changeType: 'Contact Details',
            field: 'Phone Number',
            oldValue: '+91 98765 43210',
            newValue: '+91 98765 43211',
            status: 'approved',
            submittedAt: '2024-02-19T14:20:00Z',
            sensitive: false,
            reviewedBy: 'Manager'
          }
        ]
      },
      message: 'Profile change metrics retrieved successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  // Approval Queues
  async getApprovalQueues(managerId: string): Promise<ApiResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      data: [
        {
          id: '1',
          type: 'leave',
          employeeName: 'John Doe',
          employeeId: 'EMP001',
          title: 'Casual Leave Request',
          description: 'Family function - 2 days leave',
          requestDate: '2024-02-25',
          submittedAt: '2024-02-20T09:30:00Z',
          priority: 'medium',
          status: 'pending',
          attachments: 0
        },
        {
          id: '2',
          type: 'expense',
          employeeName: 'Jane Smith',
          employeeId: 'EMP002',
          title: 'Travel Expense Claim',
          description: 'Client visit - airfare and hotel',
          amount: 25000,
          requestDate: '2024-02-18',
          submittedAt: '2024-02-19T16:45:00Z',
          priority: 'high',
          status: 'pending',
          attachments: 4
        },
        {
          id: '3',
          type: 'attendance',
          employeeName: 'Mike Johnson',
          employeeId: 'EMP003',
          title: 'Late Arrival Regularization',
          description: 'Traffic jam - arrived 30 mins late',
          requestDate: '2024-02-19',
          submittedAt: '2024-02-19T18:20:00Z',
          priority: 'low',
          status: 'pending',
          attachments: 0
        },
        {
          id: '4',
          type: 'timesheet',
          employeeName: 'Sarah Wilson',
          employeeId: 'EMP004',
          title: 'Timesheet Correction',
          description: 'Missed logging hours for Project Alpha',
          requestDate: '2024-02-16',
          submittedAt: '2024-02-17T11:15:00Z',
          priority: 'medium',
          status: 'escalated',
          attachments: 1
        },
        {
          id: '5',
          type: 'profile',
          employeeName: 'Alice Brown',
          employeeId: 'EMP005',
          title: 'Bank Account Change',
          description: 'Updated bank account for salary',
          requestDate: '2024-02-20',
          submittedAt: '2024-02-20T14:30:00Z',
          priority: 'critical',
          status: 'pending',
          attachments: 2
        }
      ],
      message: 'Approval queues retrieved successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  // Approval Actions
  async approveRequest(requestId: string, comments?: string): Promise<ApiResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      data: { id: requestId, status: 'approved', reviewedAt: new Date().toISOString() },
      message: 'Request approved successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  async rejectRequest(requestId: string, reason: string): Promise<ApiResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      data: { id: requestId, status: 'rejected', reason, reviewedAt: new Date().toISOString() },
      message: 'Request rejected successfully',
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  async bulkApprove(requestIds: string[]): Promise<ApiResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      data: { approvedCount: requestIds.length, reviewedAt: new Date().toISOString() },
      message: `${requestIds.length} requests approved successfully`,
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  async bulkReject(requestIds: string[], reason: string): Promise<ApiResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      data: { rejectedCount: requestIds.length, reason, reviewedAt: new Date().toISOString() },
      message: `${requestIds.length} requests rejected successfully`,
      success: true,
      timestamp: new Date().toISOString()
    };
  }
}

export const myTeamService = MyTeamService.getInstance();