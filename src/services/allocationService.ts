import { supabase } from '@/integrations/supabase/client';

export interface ResourceOption {
  id: string;
  displayName: string;
  email?: string;
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

export const allocationService = {
  /**
   * Search resources from profiles table by name
   */
  async searchResources(searchTerm: string): Promise<ResourceOption[]> {
    if (!searchTerm || searchTerm.length < 2) return [];

    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, first_name, last_name, email')
      .or(`display_name.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
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
      email: profile.email || undefined
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
