import { supabase } from '@/integrations/supabase/client';
import { JDOwnership, JDStatus, SlaStatus } from '@/types/ownership';

class JDOwnershipService {
  async getApprovedJDOwnerships(): Promise<JDOwnership[]> {
    const { data: jds, error } = await supabase
      .from('jd_approvals')
      .select(`
        id,
        job_title,
        status,
        client_name,
        created_at,
        updated_at
      `)
      .eq('approval_status', 'approved')
      .eq('status', 'Active');

    if (error) throw error;

    const jdOwnerships = await Promise.all(
      (jds || []).map(async (jd) => {
        const { data: assignment } = await supabase
          .from('jd_ownership_assignments')
          .select(`
            primary_recruiter_id,
            collaborator_ids,
            staffing_manager_id,
            client_spoc,
            updated_at
          `)
          .eq('jd_id', jd.id)
          .maybeSingle();

        const { data: metadata } = await supabase
          .from('jd_ownership_metadata')
          .select('*')
          .eq('jd_id', jd.id)
          .maybeSingle();

        let primaryRecruiterName = 'Unassigned';
        if (assignment?.primary_recruiter_id) {
          const { data: recruiter } = await supabase
            .from('profiles')
            .select('display_name, first_name, last_name')
            .eq('id', assignment.primary_recruiter_id)
            .maybeSingle();
          
          if (recruiter) {
            primaryRecruiterName = recruiter.display_name || 
              `${recruiter.first_name || ''} ${recruiter.last_name || ''}`.trim() || 
              'Unknown';
          }
        }

        const collaborators: string[] = [];
        if (assignment?.collaborator_ids && assignment.collaborator_ids.length > 0) {
          const { data: collabProfiles } = await supabase
            .from('profiles')
            .select('display_name, first_name, last_name')
            .in('id', assignment.collaborator_ids);
          
          collaborators.push(...(collabProfiles || []).map(p => 
            p.display_name || `${p.first_name || ''} ${p.last_name || ''}`.trim()
          ));
        }

        let staffingManagerName = 'TBD';
        if (assignment?.staffing_manager_id) {
          const { data: manager } = await supabase
            .from('profiles')
            .select('display_name, first_name, last_name')
            .eq('id', assignment.staffing_manager_id)
            .maybeSingle();
          
          if (manager) {
            staffingManagerName = manager.display_name || 
              `${manager.first_name || ''} ${manager.last_name || ''}`.trim() || 
              'TBD';
          }
        }

        return {
          id: jd.id,
          jdId: jd.id,
          jdTitle: jd.job_title || 'Untitled JD',
          primaryRecruiter: primaryRecruiterName,
          collaborators,
          openPoolFlag: metadata?.open_pool_flag || false,
          perRecruiterSubmissionCap: metadata?.per_recruiter_submission_cap || 5,
          staffingManager: staffingManagerName,
          clientSpoc: assignment?.client_spoc || jd.client_name || 'TBD',
          status: (jd.status || 'Active') as JDStatus,
          isLocked: metadata?.is_locked || false,
          submissionsByRecruiter: {},
          submissionsToday: 0,
          submissionsTotal: 0,
          firstSubmitAge: 0,
          slaStatus: (metadata?.sla_status || 'On Track') as SlaStatus,
          slaDeadline: metadata?.sla_deadline || new Date().toISOString(),
          createdAt: jd.created_at,
          updatedAt: assignment?.updated_at || jd.updated_at,
          updatedBy: 'system'
        } as JDOwnership;
      })
    );

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
}

export const jdOwnershipService = new JDOwnershipService();
