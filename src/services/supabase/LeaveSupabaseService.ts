import { BaseSupabaseService } from '../base/BaseSupabaseService';
import { supabase } from '@/integrations/supabase/client';
import type { LeaveRequest } from '@/types';

export class LeaveSupabaseService extends BaseSupabaseService<LeaveRequest> {
  protected tableName = 'leave_requests';

  async getLeaveBalance(employeeId: string, year?: number) {
    try {
      const targetYear = year || new Date().getFullYear();
      
      const { data, error } = await supabase
        .from('leave_balances')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('year', targetYear);

      if (error) this.handleSupabaseError(error);

      return this.createSuccessResponse(data || []);
    } catch (error) {
      console.error('Error fetching leave balance:', error);
      throw error;
    }
  }

  async submitLeaveRequest(leaveRequest: Partial<LeaveRequest>) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert(leaveRequest)
        .select()
        .single();

      if (error) this.handleSupabaseError(error);

      return this.createSuccessResponse(data, 'Leave request submitted successfully');
    } catch (error) {
      console.error('Error submitting leave request:', error);
      throw error;
    }
  }

  async approveLeaveRequest(requestId: string, approverId: string) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          status: 'APPROVED',
          approved_by: approverId,
          approved_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) this.handleSupabaseError(error);

      return this.createSuccessResponse(data, 'Leave request approved');
    } catch (error) {
      console.error('Error approving leave request:', error);
      throw error;
    }
  }

  async rejectLeaveRequest(requestId: string, approverId: string) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          status: 'REJECTED',
          approved_by: approverId,
          approved_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) this.handleSupabaseError(error);

      return this.createSuccessResponse(data, 'Leave request rejected');
    } catch (error) {
      console.error('Error rejecting leave request:', error);
      throw error;
    }
  }

  async getLeavesByEmployee(employeeId: string) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('employee_id', employeeId)
        .order('applied_date', { ascending: false });

      if (error) this.handleSupabaseError(error);

      return this.createSuccessResponse(data || []);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      throw error;
    }
  }
}