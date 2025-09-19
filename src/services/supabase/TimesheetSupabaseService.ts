import { BaseSupabaseService } from '../base/BaseSupabaseService';
import { supabase } from '@/integrations/supabase/client';
import type { FilterParams } from '../base/IService';
import { ApiResponse, PaginatedResponse } from '../base/IService';

interface Timesheet {
  id: string;
  employee_id: string;
  week_start: string;
  week_end: string;
  total_hours: number;
  billable_hours: number;
  status: string;
  submitted_at?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

interface TimesheetEntry {
  id: string;
  timesheet_id: string;
  project_id?: string;
  task_id?: string;
  date: string;
  hours: number;
  description?: string;
  is_billable: boolean;
  created_at: string;
  updated_at: string;
}

export class TimesheetSupabaseService extends BaseSupabaseService<Timesheet> {
  protected tableName = 'timesheets';

  async getTimesheetByWeek(employeeId: string, weekStart: string): Promise<ApiResponse<Timesheet | null>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName as any)
        .select(`
          *,
          timesheet_entries (
            id,
            project_id,
            task_id,
            date,
            hours,
            description,
            is_billable
          )
        `)
        .eq('employee_id', employeeId)
        .eq('week_start', weekStart)
        .single();

      if (error && error.code !== 'PGRST116') {
        this.handleSupabaseError(error);
      }

      return this.createSuccessResponse(data as Timesheet);
    } catch (error) {
      console.error('Error fetching timesheet:', error);
      throw error;
    }
  }

  async createOrUpdateTimesheet(employeeId: string, weekStart: string, weekEnd: string): Promise<ApiResponse<Timesheet>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName as any)
        .upsert({
          employee_id: employeeId,
          week_start: weekStart,
          week_end: weekEnd,
          status: 'DRAFT'
        }, {
          onConflict: 'employee_id,week_start'
        })
        .select()
        .single();

      if (error) this.handleSupabaseError(error);

      return this.createSuccessResponse(data as Timesheet);
    } catch (error) {
      console.error('Error creating/updating timesheet:', error);
      throw error;
    }
  }

  async addTimesheetEntry(entry: Omit<TimesheetEntry, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<TimesheetEntry>> {
    try {
      const { data, error } = await supabase
        .from('timesheet_entries' as any)
        .insert(entry)
        .select()
        .single();

      if (error) this.handleSupabaseError(error);

      // Update timesheet totals
      await this.updateTimesheetTotals(entry.timesheet_id);

      return this.createSuccessResponse(data as TimesheetEntry);
    } catch (error) {
      console.error('Error adding timesheet entry:', error);
      throw error;
    }
  }

  async updateTimesheetEntry(entryId: string, updates: Partial<TimesheetEntry>): Promise<ApiResponse<TimesheetEntry>> {
    try {
      const { data, error } = await supabase
        .from('timesheet_entries' as any)
        .update(updates)
        .eq('id', entryId)
        .select()
        .single();

      if (error) this.handleSupabaseError(error);

      // Update timesheet totals
      await this.updateTimesheetTotals(data.timesheet_id);

      return this.createSuccessResponse(data as TimesheetEntry);
    } catch (error) {
      console.error('Error updating timesheet entry:', error);
      throw error;
    }
  }

  async deleteTimesheetEntry(entryId: string): Promise<ApiResponse<void>> {
    try {
      // Get the timesheet_id before deleting
      const { data: entryData } = await supabase
        .from('timesheet_entries' as any)
        .select('timesheet_id')
        .eq('id', entryId)
        .single();

      const { error } = await supabase
        .from('timesheet_entries' as any)
        .delete()
        .eq('id', entryId);

      if (error) this.handleSupabaseError(error);

      // Update timesheet totals
      if (entryData?.timesheet_id) {
        await this.updateTimesheetTotals(entryData.timesheet_id);
      }

      return this.createSuccessResponse(undefined, 'Entry deleted successfully');
    } catch (error) {
      console.error('Error deleting timesheet entry:', error);
      throw error;
    }
  }

  async submitTimesheet(timesheetId: string): Promise<ApiResponse<Timesheet>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName as any)
        .update({
          status: 'SUBMITTED',
          submitted_at: new Date().toISOString()
        })
        .eq('id', timesheetId)
        .select()
        .single();

      if (error) this.handleSupabaseError(error);

      return this.createSuccessResponse(data as Timesheet, 'Timesheet submitted successfully');
    } catch (error) {
      console.error('Error submitting timesheet:', error);
      throw error;
    }
  }

  async getTimesheetHistory(employeeId: string, params?: FilterParams): Promise<PaginatedResponse<Timesheet>> {
    try {
      let query = supabase
        .from(this.tableName as any)
        .select('*', { count: 'exact' })
        .eq('employee_id', employeeId)
        .order('week_start', { ascending: false });

      // Apply filters
      if (params?.filters?.status && params.filters.status !== 'all') {
        query = query.eq('status', params.filters.status);
      }

      // Apply pagination
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) this.handleSupabaseError(error);

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      const pagination = {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };

      return this.createPaginatedResponse(data as Timesheet[] || [], pagination);
    } catch (error) {
      console.error('Error fetching timesheet history:', error);
      throw error;
    }
  }

  async approveTimesheet(timesheetId: string, approverId: string): Promise<ApiResponse<Timesheet>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName as any)
        .update({
          status: 'APPROVED',
          approved_by: approverId,
          approved_at: new Date().toISOString()
        })
        .eq('id', timesheetId)
        .select()
        .single();

      if (error) this.handleSupabaseError(error);

      return this.createSuccessResponse(data as Timesheet, 'Timesheet approved successfully');
    } catch (error) {
      console.error('Error approving timesheet:', error);
      throw error;
    }
  }

  private async updateTimesheetTotals(timesheetId: string): Promise<void> {
    try {
      // Get all entries for the timesheet
      const { data: entries, error: entriesError } = await supabase
        .from('timesheet_entries' as any)
        .select('hours, is_billable')
        .eq('timesheet_id', timesheetId);

      if (entriesError) {
        console.error('Error fetching entries for total calculation:', entriesError);
        return;
      }

      const totalHours = entries?.reduce((sum: number, entry: any) => sum + (entry.hours || 0), 0) || 0;
      const billableHours = entries?.reduce((sum: number, entry: any) => 
        sum + (entry.is_billable ? (entry.hours || 0) : 0), 0) || 0;

      // Update timesheet totals
      const { error: updateError } = await supabase
        .from(this.tableName as any)
        .update({
          total_hours: totalHours,
          billable_hours: billableHours
        })
        .eq('id', timesheetId);

      if (updateError) {
        console.error('Error updating timesheet totals:', updateError);
      }
    } catch (error) {
      console.error('Error in updateTimesheetTotals:', error);
    }
  }
}