import { BaseSupabaseService } from '../base/BaseSupabaseService';
import { supabase } from '@/integrations/supabase/client';
import type { Attendance } from '@/types';

export class AttendanceSupabaseService extends BaseSupabaseService<Attendance> {
  protected tableName = 'attendance_records';

  async clockIn(employeeId: string) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });

      const { data, error } = await supabase
        .from(this.tableName)
        .upsert({
          employee_id: employeeId,
          date: today,
          clock_in: currentTime,
          status: 'PRESENT'
        }, {
          onConflict: 'employee_id,date'
        })
        .select()
        .single();

      if (error) this.handleSupabaseError(error);

      return this.createSuccessResponse(data, 'Clock in successful');
    } catch (error) {
      console.error('Error clocking in:', error);
      throw error;
    }
  }

  async clockOut(employeeId: string) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });

      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          clock_out: currentTime,
          // Calculate total hours if clock_in exists
        })
        .eq('employee_id', employeeId)
        .eq('date', today)
        .select()
        .single();

      if (error) this.handleSupabaseError(error);

      return this.createSuccessResponse(data, 'Clock out successful');
    } catch (error) {
      console.error('Error clocking out:', error);
      throw error;
    }
  }

  async getAttendanceByEmployee(employeeId: string, startDate?: string, endDate?: string) {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('employee_id', employeeId)
        .order('date', { ascending: false });

      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error } = await query;

      if (error) this.handleSupabaseError(error);

      return this.createSuccessResponse(data || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      throw error;
    }
  }
}