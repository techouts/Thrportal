import { supabase } from '@/integrations/supabase/client';
import { JDOwnership, JDStatus, SlaStatus } from '@/types/ownership';

class JDOwnershipService {
  async getApprovedJDOwnerships(): Promise<JDOwnership[]> {
    // Use server-side JOIN query to eliminate caching issues
    const { data, error } = await supabase
      .rpc('get_jd_ownerships_with_details');

    if (error) throw error;

    // Map RPC results to JDOwnership objects
    const jdOwnerships = (data || []).map((row) => {
      return {
        id: row.jd_id,
        jdId: row.jd_id,
        jdTitle: row.job_title || 'Untitled JD',
        primaryRecruiter: row.primary_recruiter_name,
        collaborators: row.collaborator_names || [],
          openPoolFlag: row.open_pool_flag,
          perRecruiterSubmissionCap: row.per_recruiter_submission_cap,
          staffingManager: row.staffing_manager_name,
          clientSpoc: row.client_spoc,
          status: (row.status || 'Active') as JDStatus,
          isLocked: row.is_locked,
          submissionsByRecruiter: {},
          submissionsToday: 0,
          submissionsTotal: 0,
          firstSubmitAge: 0,
          slaStatus: (row.sla_status || 'On Track') as SlaStatus,
          slaDeadline: row.sla_deadline || new Date().toISOString(),
          createdAt: row.created_at,
        updatedAt: row.assignment_updated_at || row.jd_updated_at,
        updatedBy: 'system'
      } as JDOwnership;
    });

    return jdOwnerships;
  }

  async updateJDOwnership(jdId: string, updates: Partial<JDOwnership> & { recruiterId?: string }): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    if (updates.recruiterId) {
      await supabase
        .from('jd_ownership_assignments')
        .upsert({
          jd_id: jdId,
          primary_recruiter_id: updates.recruiterId,
          assigned_by: user?.id,
          assigned_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'jd_id'
        });
    }

    if (updates.isLocked !== undefined) {
      await supabase
        .from('jd_ownership_metadata')
        .update({
          is_locked: updates.isLocked,
          locked_by: updates.isLocked ? user?.id : null,
          locked_at: updates.isLocked ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('jd_id', jdId);
    }
  }

  async getRecruiters(): Promise<Array<{ id: string; name: string }>> {
    const { data, error } = await supabase
      .rpc('get_recruiter_profiles');

    if (error) throw error;

    // Deduplicate by name - keep first occurrence
    const recruitersMap = new Map<string, { id: string; name: string }>();
    
    (data || []).forEach(p => {
      const name = p.display_name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unknown';
      
      if (!recruitersMap.has(name)) {
        recruitersMap.set(name, { id: p.id, name });
      }
    });
    
    return Array.from(recruitersMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async escalateToManager(jdId: string, reason: string): Promise<void> {
    console.log(`Escalating JD ${jdId} to manager: ${reason}`);
    // TODO: Implement escalation logic
  }

  async notifyRecruiter(jdId: string, message: string): Promise<void> {
    console.log(`Notifying recruiter for JD ${jdId}: ${message}`);
    // TODO: Implement notification logic
  }

  async updateCollaborators(jdId: string, collaboratorIds: string[]): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    await supabase
      .from('jd_ownership_assignments')
      .upsert({
        jd_id: jdId,
        collaborator_ids: collaboratorIds,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'jd_id'
      });
  }
}

export const jdOwnershipService = new JDOwnershipService();
