import { BaseSupabaseService } from '../base/BaseSupabaseService';
import { supabase } from '@/integrations/supabase/client';
import type { Employee } from '@/types';

export class EmployeeSupabaseService extends BaseSupabaseService<Employee> {
  protected tableName = 'employees';

  async getCurrentEmployee(): Promise<Employee | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', (await this.getCurrentUserId()))
        .single();

      if (error && error.code !== 'PGRST116') {
        this.handleSupabaseError(error);
      }

      return data || null;
    } catch (error) {
      console.error('Error fetching current employee:', error);
      return null;
    }
  }

  async getByDepartment(department: string) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('department', department)
        .eq('status', 'ACTIVE');

      if (error) this.handleSupabaseError(error);

      return this.createSuccessResponse(data || []);
    } catch (error) {
      console.error('Error fetching employees by department:', error);
      throw error;
    }
  }

  async getManagers() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .not('manager_id', 'is', null)
        .eq('status', 'ACTIVE');

      if (error) this.handleSupabaseError(error);

      return this.createSuccessResponse(data || []);
    } catch (error) {
      console.error('Error fetching managers:', error);
      throw error;
    }
  }
}