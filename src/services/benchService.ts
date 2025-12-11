import { supabase } from '@/integrations/supabase/client';

export interface BenchResource {
  id: string;
  name: string;
  role: string;
  skills: string[];
  availableFrom: string;
  benchDays: number;
  avatarUrl?: string;
  status: 'unallocated' | 'rolling_off';
}

export const benchService = {
  /**
   * Get employees who are on bench (not allocated) or rolling off within 30 days
   */
  async getBenchResources(): Promise<BenchResource[]> {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    // Fetch all active employees
    const { data: employees, error: employeesError } = await supabase
      .from('profiles')
      .select('id, display_name, first_name, last_name, role_title, avatar_url, interests, date_of_joining')
      .eq('is_active', true);

    if (employeesError) {
      console.error('Error fetching employees:', employeesError);
      throw employeesError;
    }

    // Fetch all current and future allocations
    const { data: allocations, error: allocationsError } = await supabase
      .from('allocations')
      .select('employee_id, end_date, start_date, type')
      .gte('end_date', today.toISOString().split('T')[0]);

    if (allocationsError) {
      console.error('Error fetching allocations:', allocationsError);
      throw allocationsError;
    }

    // Create a map of employee_id to their latest allocation end date
    const employeeAllocationMap = new Map<string, { endDate: string | null; type: string }>();
    
    allocations?.forEach((allocation) => {
      const existing = employeeAllocationMap.get(allocation.employee_id);
      const allocationEndDate = allocation.end_date;
      
      // Keep track of the latest end date for each employee
      if (!existing || (allocationEndDate && (!existing.endDate || allocationEndDate > existing.endDate))) {
        employeeAllocationMap.set(allocation.employee_id, {
          endDate: allocationEndDate,
          type: allocation.type
        });
      }
    });

    const benchResources: BenchResource[] = [];

    employees?.forEach((employee) => {
      const allocation = employeeAllocationMap.get(employee.id);
      const employeeName = employee.display_name || 
        `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 
        'Unknown';

      // Case 1: Employee has no active allocation - completely on bench
      if (!allocation) {
        const availableFrom = employee.date_of_joining || today.toISOString().split('T')[0];
        const benchDays = Math.floor((today.getTime() - new Date(availableFrom).getTime()) / (1000 * 60 * 60 * 24));
        
        benchResources.push({
          id: employee.id,
          name: employeeName,
          role: employee.role_title || 'Not Assigned',
          skills: employee.interests || [],
          availableFrom: availableFrom,
          benchDays: Math.max(0, benchDays),
          avatarUrl: employee.avatar_url || undefined,
          status: 'unallocated'
        });
        return;
      }

      // Case 2: Employee's allocation ends within next 30 days - rolling off
      if (allocation.endDate) {
        const endDate = new Date(allocation.endDate);
        if (endDate <= thirtyDaysFromNow) {
          const daysUntilRollOff = Math.floor((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          benchResources.push({
            id: employee.id,
            name: employeeName,
            role: employee.role_title || 'Not Assigned',
            skills: employee.interests || [],
            availableFrom: allocation.endDate,
            benchDays: daysUntilRollOff < 0 ? Math.abs(daysUntilRollOff) : 0,
            avatarUrl: employee.avatar_url || undefined,
            status: 'rolling_off'
          });
        }
      }
    });

    // Sort by bench days (descending) - longest on bench first
    return benchResources.sort((a, b) => b.benchDays - a.benchDays);
  },

  /**
   * Get shadow allocations for the Shadow tab
   */
  async getShadowAllocations() {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('allocations')
      .select(`
        id,
        employee_id,
        project_id,
        start_date,
        allocation_pct,
        type,
        profiles!allocations_employee_id_fkey (
          id,
          display_name,
          first_name,
          last_name,
          role_title,
          avatar_url
        ),
        crm_projects!allocations_project_id_fkey (
          id,
          name
        )
      `)
      .eq('type', 'SHADOW')
      .gte('end_date', today);

    if (error) {
      console.error('Error fetching shadow allocations:', error);
      throw error;
    }

    return data?.map((allocation) => {
      const profile = allocation.profiles as any;
      const project = allocation.crm_projects as any;
      
      return {
        id: allocation.id,
        employeeId: allocation.employee_id,
        employeeName: profile?.display_name || 
          `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 
          'Unknown',
        role: profile?.role_title || 'Not Assigned',
        avatarUrl: profile?.avatar_url,
        targetProject: project?.name || 'Unknown Project',
        startDate: allocation.start_date,
        allocationPct: allocation.allocation_pct
      };
    }) || [];
  }
};
