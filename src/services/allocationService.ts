import { supabase } from '@/integrations/supabase/client';

export interface ResourceOption {
  id: string;
  displayName: string;
  email?: string;
  employeeCode?: string;
}

export interface ResourceAllocation {
  projectId: string;
  projectName: string;
  allocationPct: number;
}

export interface RoleOption {
  id: string;
  name: string;
}

export interface CreateAllocationInput {
  resourceId: string;
  projectId: string;
  roleId: string;
  resourceType: 'ACTIVE' | 'SHADOW';
  allocationPct: number;
  startDate: string;
  endDate: string;
}

export interface EmployeeDetails {
  id: string;
  displayName: string;
  roleTitle: string | null;
  department: string | null;
  employeeCode: string | null;
  email: string | null;
}

export interface EmployeeAllocation {
  id: string;
  projectId: string;
  projectName: string;
  clientName: string;
  allocationPct: number;
  type: string;
  startDate: string;
  endDate: string | null;
  roleId: string;
}

export const allocationService = {
  /**
   * Search resources from profiles table by name or employee code
   */
  async searchResources(searchTerm: string): Promise<ResourceOption[]> {
    if (!searchTerm || searchTerm.length < 2) return [];

    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, first_name, last_name, email, employee_code')
      .or(`display_name.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,employee_code.ilike.%${searchTerm}%`)
      .limit(10);

    if (error) {
      console.error('Error searching resources:', error);
      return [];
    }

    return (data || []).map(profile => ({
      id: profile.id,
      displayName: profile.display_name || 
        `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 
        'Unknown',
      email: profile.email || undefined,
      employeeCode: profile.employee_code || undefined
    }));
  },

  /**
   * Get employee details by ID
   */
  async getEmployeeById(employeeId: string): Promise<EmployeeDetails | null> {
    if (!employeeId) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, first_name, last_name, role_title, department, employee_code, email')
      .eq('id', employeeId)
      .single();

    if (error) {
      console.error('Error fetching employee:', error);
      return null;
    }

    return {
      id: data.id,
      displayName: data.display_name || 
        `${data.first_name || ''} ${data.last_name || ''}`.trim() || 
        'Unknown',
      roleTitle: data.role_title,
      department: data.department,
      employeeCode: data.employee_code,
      email: data.email
    };
  },

  /**
   * Get all allocations for an employee (active and future)
   */
  async getEmployeeAllocations(employeeId: string): Promise<EmployeeAllocation[]> {
    if (!employeeId) return [];

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('allocations')
      .select(`
        id,
        project_id,
        allocation_pct,
        type,
        start_date,
        end_date,
        role_id,
        crm_projects!inner(name, crm_clients(name))
      `)
      .eq('employee_id', employeeId)
      .or(`end_date.gte.${today},end_date.is.null`);

    if (error) {
      console.error('Error fetching employee allocations:', error);
      return [];
    }

    return (data || []).map(allocation => ({
      id: allocation.id,
      projectId: allocation.project_id || '',
      projectName: (allocation.crm_projects as any)?.name || 'Unknown Project',
      clientName: (allocation.crm_projects as any)?.crm_clients?.name || 'Unknown Client',
      allocationPct: allocation.allocation_pct,
      type: allocation.type,
      startDate: allocation.start_date,
      endDate: allocation.end_date,
      roleId: allocation.role_id
    }));
  },

  /**
   * Get all roles from roles_catalog
   */
  async getRoles(): Promise<RoleOption[]> {
    const { data, error } = await supabase
      .from('roles_catalog')
      .select('id, name')
      .order('name');

    if (error) {
      console.error('Error fetching roles:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Get active allocations for a resource
   */
  async getActiveAllocationsForResource(resourceId: string): Promise<ResourceAllocation[]> {
    if (!resourceId) return [];

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('allocations')
      .select(`
        project_id,
        allocation_pct,
        crm_projects!inner(name)
      `)
      .eq('employee_id', resourceId)
      .or(`end_date.gte.${today},end_date.is.null`);

    if (error) {
      console.error('Error fetching active allocations:', error);
      return [];
    }

    return (data || []).map(allocation => ({
      projectId: allocation.project_id || '',
      projectName: (allocation.crm_projects as any)?.name || 'Unknown Project',
      allocationPct: allocation.allocation_pct
    }));
  },

  /**
   * Create a new allocation
   */
  async createAllocation(input: CreateAllocationInput) {
    const { data, error } = await supabase
      .from('allocations')
      .insert({
        employee_id: input.resourceId,
        project_id: input.projectId,
        role_id: input.roleId,
        type: input.resourceType,
        allocation_pct: input.allocationPct,
        start_date: input.startDate,
        end_date: input.endDate,
        bill_rate: 0,
        cost_rate: 0
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
};
