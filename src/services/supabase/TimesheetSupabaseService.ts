import { BaseSupabaseService } from '../base/BaseSupabaseService';
import type { FilterParams } from '../base/IService';

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

  async getTimesheetByWeek(employeeId: string, weekStart: string) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
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

      return this.createSuccessResponse(data);
    } catch (error) {
      console.error('Error fetching timesheet:', error);
      throw error;
    }
  }

  async createOrUpdateTimesheet(employeeId: string, weekStart: string, weekEnd: string) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
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

      return this.createSuccessResponse(data);
    } catch (error) {
      console.error('Error creating/updating timesheet:', error);
      throw error;
    }
  }

  async addTimesheetEntry(entry: Omit<TimesheetEntry, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await this.supabase
        .from('timesheet_entries')
        .insert(entry)
        .select()
        .single();

      if (error) this.handleSupabaseError(error);

      // Update timesheet totals
      await this.updateTimesheetTotals(entry.timesheet_id);

      return this.createSuccessResponse(data);
    } catch (error) {
      console.error('Error adding timesheet entry:', error);
      throw error;
    }
  }

  async updateTimesheetEntry(entryId: string, updates: Partial<TimesheetEntry>) {
    try {
      const { data, error } = await this.supabase
        .from('timesheet_entries')
        .update(updates)
        .eq('id', entryId)
        .select()
        .single();

      if (error) this.handleSupabaseError(error);

      // Update timesheet totals
      await this.updateTimesheetTotals(data.timesheet_id);

      return this.createSuccessResponse(data);
    } catch (error) {
      console.error('Error updating timesheet entry:', error);
      throw error;
    }
  }

  async deleteTimesheetEntry(entryId: string) {
    try {
      // Get the timesheet_id before deleting
      const { data: entryData } = await this.supabase
        .from('timesheet_entries')
        .select('timesheet_id')
        .eq('id', entryId)
        .single();

      const { error } = await this.supabase
        .from('timesheet_entries')
        .delete()
        .eq('id', entryId);

      if (error) this.handleSupabaseError(error);

      // Update timesheet totals
      if (entryData?.timesheet_id) {
        await this.updateTimesheetTotals(entryData.timesheet_id);
      }

      return this.createSuccessResponse(null, 'Entry deleted successfully');
    } catch (error) {
      console.error('Error deleting timesheet entry:', error);
      throw error;
    }
  }

  async submitTimesheet(timesheetId: string) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .update({
          status: 'SUBMITTED',
          submitted_at: new Date().toISOString()
        })
        .eq('id', timesheetId)
        .select()
        .single();

      if (error) this.handleSupabaseError(error);

      return this.createSuccessResponse(data, 'Timesheet submitted successfully');
    } catch (error) {
      console.error('Error submitting timesheet:', error);
      throw error;
    }
  }

  async getTimesheetHistory(employeeId: string, params?: FilterParams) {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*')
        .eq('employee_id', employeeId)
        .order('week_start', { ascending: false });

      const { data, error } = await query;

      if (error) this.handleSupabaseError(error);

      return this.createPaginatedResponse(data || [], {
        page: 1,
        limit: 50,
        total: data?.length || 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      });
    } catch (error) {
      console.error('Error fetching timesheet history:', error);
      throw error;
    }
  }

  private async updateTimesheetTotals(timesheetId: string) {
    try {
      // Get all entries for the timesheet
      const { data: entries, error: entriesError } = await this.supabase
        .from('timesheet_entries')
        .select('hours, is_billable')
        .eq('timesheet_id', timesheetId);

      if (entriesError) {
        console.error('Error fetching entries for total calculation:', entriesError);
        return;
      }

      const totalHours = entries?.reduce((sum, entry) => sum + (entry.hours || 0), 0) || 0;
      const billableHours = entries?.reduce((sum, entry) => 
        sum + (entry.is_billable ? (entry.hours || 0) : 0), 0) || 0;

      // Update timesheet totals
      const { error: updateError } = await this.supabase
        .from(this.tableName)
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