import { supabase } from '@/integrations/supabase/client';
import type { ClientSpocMapping } from '@/types/ownership';

export class ClientSpocMappingService {
  
  // Get all mappings with calculated metrics
  static async getAllMappings(): Promise<ClientSpocMapping[]> {
    const { data: mappings, error } = await supabase
      .from('client_spoc_mappings')
      .select(`
        *,
        client:crm_clients!client_id(name),
        primary_spoc:profiles!primary_spoc_id(id, display_name, first_name, last_name),
        secondary_spoc:profiles!secondary_spoc_id(id, display_name, first_name, last_name)
      `);

    if (error) throw error;

    // For each mapping, fetch assigned recruiters and calculate metrics
    const enrichedMappings = await Promise.all(
      (mappings || []).map(async (mapping: any) => {
        // Get recruiter names
        const recruiterNames = await this.getRecruiterNames(mapping.assigned_recruiter_ids || []);
        
        // Calculate metrics
        const metrics = await this.calculateMetrics(mapping.client_id);
        
        return {
          id: mapping.id,
          clientId: mapping.client_id,
          clientName: mapping.client?.name || 'Unknown',
          primarySpoc: this.formatUserName(mapping.primary_spoc),
          secondarySpoc: mapping.secondary_spoc ? this.formatUserName(mapping.secondary_spoc) : undefined,
          assignedRecruiters: recruiterNames,
          ...metrics,
          createdAt: mapping.created_at,
          updatedAt: mapping.updated_at,
        } as ClientSpocMapping;
      })
    );

    return enrichedMappings;
  }

  // Create new mapping
  static async createMapping(data: {
    clientId: string;
    primarySpocId: string;
    secondarySpocId?: string;
    assignedRecruiterIds: string[];
  }) {
    const { data: currentUser } = await supabase.auth.getUser();
    
    const { data: mapping, error } = await supabase
      .from('client_spoc_mappings')
      .insert({
        client_id: data.clientId,
        primary_spoc_id: data.primarySpocId,
        secondary_spoc_id: data.secondarySpocId || null,
        assigned_recruiter_ids: data.assignedRecruiterIds,
        created_by: currentUser?.user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    return mapping;
  }

  // Update mapping
  static async updateMapping(id: string, data: {
    primarySpocId?: string;
    secondarySpocId?: string;
    assignedRecruiterIds?: string[];
  }) {
    const { error } = await supabase
      .from('client_spoc_mappings')
      .update({
        primary_spoc_id: data.primarySpocId,
        secondary_spoc_id: data.secondarySpocId,
        assigned_recruiter_ids: data.assignedRecruiterIds,
      })
      .eq('id', id);

    if (error) throw error;
  }

  // Delete mapping
  static async deleteMapping(id: string) {
    const { error } = await supabase
      .from('client_spoc_mappings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Helper: Get recruiter names
  private static async getRecruiterNames(recruiterIds: string[]): Promise<string[]> {
    if (!recruiterIds || recruiterIds.length === 0) return [];

    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, first_name, last_name')
      .in('id', recruiterIds);

    return (data || []).map(user => this.formatUserName(user));
  }

  // Helper: Format user name
  private static formatUserName(user: any): string {
    if (!user) return 'Unknown';
    return user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown';
  }

  // Helper: Calculate metrics for a client
  private static async calculateMetrics(clientId: string) {
    // First, get the client name from the client_id
    const { data: client } = await supabase
      .from('crm_clients')
      .select('name')
      .eq('id', clientId)
      .single();

    // Get active JDs count using the client name
    const { count: jdCount } = await supabase
      .from('jd_approvals')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Active')
      .eq('approval_status', 'approved')
      .eq('client_name', client?.name || '');

    // For now, return default values for other metrics
    // TODO: Implement actual calculation logic based on your business rules
    return {
      jdCount: jdCount || 0,
      avgTurnaroundTime: 0, // Calculate from candidate_timeline or similar
      feedbackAgeing: 0, // Calculate from feedback data
      slaAdherence: 100, // Calculate based on SLA rules
    };
  }

  // Get users with specific roles for SPOC selection
  static async getUsersByRoles(roles: string[]) {
    // Use the same RPC that works in JD Ownership tab (SECURITY DEFINER bypasses RLS)
    const { data, error } = await supabase.rpc('get_recruiter_profiles');

    if (error) {
      console.error('Error fetching users by roles:', error);
      throw error;
    }

    // The RPC already returns users with recruiter-related roles
    return (data || []).map(user => ({
      id: user.id,
      display_name: user.display_name,
      first_name: user.first_name,
      last_name: user.last_name,
    }));
  }

  // Get all recruiters
  static async getAllRecruiters() {
    // Use the same method since the RPC returns all recruiter-related roles
    return this.getUsersByRoles(['RECRUITER', 'HIRING_MANAGER', 'STAFFING_MANAGER']);
  }
}
