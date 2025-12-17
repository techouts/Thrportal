import { ApiResponse } from '@/types/attendance';
import { supabase } from '@/integrations/supabase/client';

// My Team service with real database integration for timesheets
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

  // Fetch timesheet entries for a specific timesheet
  async getTimesheetEntries(timesheetId: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('timesheet_entries')
        .select('id, entry_date, task_name, hours, comment, is_billable')
        .eq('timesheet_id', timesheetId)
        .order('entry_date', { ascending: true });

      if (error) {
        console.error('Error fetching timesheet entries:', error);
        return {
          data: [],
          message: 'Failed to fetch timesheet entries',
          success: false,
          timestamp: new Date().toISOString()
        };
      }

      return {
        data: data || [],
        message: 'Timesheet entries fetched successfully',
        success: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in getTimesheetEntries:', error);
      return {
        data: [],
        message: 'Failed to fetch timesheet entries',
        success: false,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Approval Queues - Now fetches real timesheet data from database
  async getApprovalQueues(managerId: string, statusFilter?: string): Promise<ApiResponse<any>> {
    try {
      // Get team members who report to this manager
      const { data: teamMembers, error: teamError } = await supabase
        .from('profiles')
        .select('id')
        .eq('manager_employee_id', managerId);

      if (teamError) {
        console.error('Error fetching team members:', teamError);
      }

      const teamMemberIds = teamMembers?.map(m => m.id) || [];

      // Fetch timesheets for team members based on status filter
      let timesheetApprovals: any[] = [];
      
      if (teamMemberIds.length > 0) {
        let query = supabase
          .from('timesheets')
          .select(`
            id,
            employee_id,
            week_start,
            week_end,
            total_hours,
            billable_hours,
            status,
            submitted_at,
            submission_comment
          `)
          .in('employee_id', teamMemberIds)
          .order('submitted_at', { ascending: false });

        // Apply status filter
        if (statusFilter === 'rejected') {
          query = query.eq('status', 'REJECTED');
        } else if (statusFilter === 'pending') {
          query = query.eq('status', 'SUBMITTED');
        } else {
          // 'all' - fetch both SUBMITTED and REJECTED
          query = query.in('status', ['SUBMITTED', 'REJECTED']);
        }

        const { data: timesheets, error: tsError } = await query;

        if (tsError) {
          console.error('Error fetching timesheets:', tsError);
        }

        // Fetch employee profiles for the timesheets
        if (timesheets && timesheets.length > 0) {
          const employeeIds = [...new Set(timesheets.map(ts => ts.employee_id))];
          const { data: profiles, error: profError } = await supabase
            .from('profiles')
            .select('id, display_name, employee_code')
            .in('id', employeeIds);

          if (profError) {
            console.error('Error fetching profiles:', profError);
          }

          const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

          timesheetApprovals = timesheets.map(ts => {
            const profile = profileMap.get(ts.employee_id);
            return {
              id: ts.id,
              type: 'timesheet',
              employeeName: profile?.display_name || 'Unknown',
              employeeId: profile?.employee_code || ts.employee_id,
              title: `Timesheet Week ${ts.week_start}`,
              description: `${ts.total_hours || 0} hours total (${ts.billable_hours || 0} billable)${ts.submission_comment ? ` - ${ts.submission_comment}` : ''}`,
              requestDate: ts.week_start,
              submittedAt: ts.submitted_at || new Date().toISOString(),
              priority: 'medium',
              status: ts.status === 'REJECTED' ? 'rejected' : 'pending',
              attachments: 0,
              additionalInfo: {
                totalHours: ts.total_hours,
                billableHours: ts.billable_hours,
                weekEnd: ts.week_end,
                submissionComment: ts.submission_comment
              }
            };
          });
        }
      }

      // Combine with mock data for other types (leave, expense, attendance, profile) - only for non-rejected filter
      const mockApprovals = statusFilter === 'rejected' ? [] : [
        {
          id: 'mock-1',
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
          id: 'mock-2',
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
        }
      ];

      // Combine real timesheet approvals with mock data for other types
      const allApprovals = [...timesheetApprovals, ...mockApprovals];

      return {
        data: allApprovals,
        message: 'Approval queues retrieved successfully',
        success: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in getApprovalQueues:', error);
      return {
        data: [],
        message: 'Failed to fetch approval queues',
        success: false,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Approval Actions - Now updates real timesheet status
  async approveRequest(requestId: string, comments?: string, type?: string): Promise<ApiResponse<any>> {
    try {
      // Handle timesheet approval
      if (type === 'timesheet') {
        const { data: user } = await supabase.auth.getUser();
        const approverId = user?.user?.id;

        const { error } = await supabase
          .from('timesheets')
          .update({
            status: 'APPROVED',
            approved_by: approverId,
            approved_at: new Date().toISOString(),
            approver_comment: comments || null
          })
          .eq('id', requestId);

        if (error) {
          console.error('Error approving timesheet:', error);
          return {
            data: null,
            message: 'Failed to approve timesheet',
            success: false,
            timestamp: new Date().toISOString()
          };
        }

        return {
          data: { id: requestId, status: 'APPROVED', reviewedAt: new Date().toISOString() },
          message: 'Timesheet approved successfully',
          success: true,
          timestamp: new Date().toISOString()
        };
      }

      // Mock approval for other types
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        data: { id: requestId, status: 'approved', reviewedAt: new Date().toISOString() },
        message: 'Request approved successfully',
        success: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in approveRequest:', error);
      return {
        data: null,
        message: 'Failed to approve request',
        success: false,
        timestamp: new Date().toISOString()
      };
    }
  }

  async rejectRequest(requestId: string, reason: string, type?: string): Promise<ApiResponse<any>> {
    try {
      // Handle timesheet rejection
      if (type === 'timesheet') {
        const { data: user } = await supabase.auth.getUser();
        const approverId = user?.user?.id;

        const { error } = await supabase
          .from('timesheets')
          .update({
            status: 'REJECTED',
            approved_by: approverId,
            rejected_at: new Date().toISOString(),
            approver_comment: reason
          })
          .eq('id', requestId);

        if (error) {
          console.error('Error rejecting timesheet:', error);
          return {
            data: null,
            message: 'Failed to reject timesheet',
            success: false,
            timestamp: new Date().toISOString()
          };
        }

        return {
          data: { id: requestId, status: 'REJECTED', reason, reviewedAt: new Date().toISOString() },
          message: 'Timesheet rejected successfully',
          success: true,
          timestamp: new Date().toISOString()
        };
      }

      // Mock rejection for other types
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        data: { id: requestId, status: 'rejected', reason, reviewedAt: new Date().toISOString() },
        message: 'Request rejected successfully',
        success: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in rejectRequest:', error);
      return {
        data: null,
        message: 'Failed to reject request',
        success: false,
        timestamp: new Date().toISOString()
      };
    }
  }

  async bulkApprove(requestIds: string[], type?: string): Promise<ApiResponse<any>> {
    try {
      if (type === 'timesheet') {
        const { data: user } = await supabase.auth.getUser();
        const approverId = user?.user?.id;

        const { error } = await supabase
          .from('timesheets')
          .update({
            status: 'APPROVED',
            approved_by: approverId,
            approved_at: new Date().toISOString()
          })
          .in('id', requestIds);

        if (error) {
          console.error('Error bulk approving timesheets:', error);
          return {
            data: null,
            message: 'Failed to bulk approve timesheets',
            success: false,
            timestamp: new Date().toISOString()
          };
        }
      }

      return {
        data: { approvedCount: requestIds.length, reviewedAt: new Date().toISOString() },
        message: `${requestIds.length} requests approved successfully`,
        success: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in bulkApprove:', error);
      return {
        data: null,
        message: 'Failed to bulk approve requests',
        success: false,
        timestamp: new Date().toISOString()
      };
    }
  }

  async bulkReject(requestIds: string[], reason: string, type?: string): Promise<ApiResponse<any>> {
    try {
      if (type === 'timesheet') {
        const { data: user } = await supabase.auth.getUser();
        const approverId = user?.user?.id;

        const { error } = await supabase
          .from('timesheets')
          .update({
            status: 'REJECTED',
            approved_by: approverId,
            rejected_at: new Date().toISOString(),
            approver_comment: reason
          })
          .in('id', requestIds);

        if (error) {
          console.error('Error bulk rejecting timesheets:', error);
          return {
            data: null,
            message: 'Failed to bulk reject timesheets',
            success: false,
            timestamp: new Date().toISOString()
          };
        }
      }

      return {
        data: { rejectedCount: requestIds.length, reason, reviewedAt: new Date().toISOString() },
        message: `${requestIds.length} requests rejected successfully`,
        success: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in bulkReject:', error);
      return {
        data: null,
        message: 'Failed to bulk reject requests',
        success: false,
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const myTeamService = MyTeamService.getInstance();
