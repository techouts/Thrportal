import { supabase } from '@/integrations/supabase/client';
import { 
  JDApproval, 
  JDApprovalStep, 
  JDAuditLog, 
  ApprovalRule,
  CreateJDApproval,
  CreateJDApprovalStep,
  CreateJDAuditLog
} from '@/types/approvals';

export const approvalsService = {
  // JD Approval CRUD operations
  async getJDApproval(jdId: string): Promise<JDApproval | null> {
    const { data, error } = await supabase
      .from('jd_approvals')
      .select('*')
      .eq('jd_id', jdId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching JD approval:', error);
      throw error;
    }

    return data as JDApproval;
  },

  async createJDApproval(approval: CreateJDApproval): Promise<JDApproval> {
    const { data, error } = await supabase
      .from('jd_approvals')
      .insert(approval as any)
      .select()
      .single();

    if (error) {
      console.error('Error creating JD approval:', error);
      throw error;
    }

    return data as JDApproval;
  },

  async updateJDApproval(id: string, updates: Partial<JDApproval>): Promise<JDApproval> {
    const { data, error } = await supabase
      .from('jd_approvals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating JD approval:', error);
      throw error;
    }

    return data as JDApproval;
  },

  // Approval Steps
  async getApprovalSteps(approvalId: string): Promise<JDApprovalStep[]> {
    const { data, error } = await supabase
      .from('jd_approval_steps')
      .select('*')
      .eq('jd_approval_id', approvalId)
      .order('step_number');

    if (error) {
      console.error('Error fetching approval steps:', error);
      throw error;
    }

    return data || [];
  },

  async createApprovalStep(step: CreateJDApprovalStep): Promise<JDApprovalStep> {
    const { data, error } = await supabase
      .from('jd_approval_steps')
      .insert(step as any)
      .select()
      .single();

    if (error) {
      console.error('Error creating approval step:', error);
      throw error;
    }

    return data as JDApprovalStep;
  },

  async updateApprovalStep(id: string, updates: Partial<JDApprovalStep>): Promise<JDApprovalStep> {
    const { data, error } = await supabase
      .from('jd_approval_steps')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating approval step:', error);
      throw error;
    }

    return data;
  },

  // Audit Log
  async getAuditLog(jdId?: string, approvalId?: string): Promise<JDAuditLog[]> {
    let query = supabase
      .from('jd_audit_log')
      .select('*')
      .order('timestamp', { ascending: false });

    if (jdId) {
      query = query.eq('jd_id', jdId);
    }
    if (approvalId) {
      query = query.eq('jd_approval_id', approvalId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching audit log:', error);
      throw error;
    }

    return data || [];
  },

  async createAuditEntry(entry: CreateJDAuditLog): Promise<JDAuditLog> {
    const { data, error } = await supabase
      .from('jd_audit_log')
      .insert(entry as any)
      .select()
      .single();

    if (error) {
      console.error('Error creating audit entry:', error);
      throw error;
    }

    return data as JDAuditLog;
  },

  // Approval Rules
  async getApprovalRules(): Promise<ApprovalRule[]> {
    const { data, error } = await supabase
      .from('approval_rules')
      .select('*')
      .eq('is_active', true)
      .order('created_at');

    if (error) {
      console.error('Error fetching approval rules:', error);
      throw error;
    }

    return data || [];
  },

  // Get approvals by status
  async getApprovalsByStatus(statusList: string[]): Promise<JDApproval[]> {
    const { data, error }: { data: any[] | null; error: any } = await supabase
      .from('jd_approvals')
      .select('*')
      .in('status', statusList)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching approvals by status:', error);
      throw error;
    }

    return (data || []) as JDApproval[];
  },

  // Get pending approvals for current user role
  async getPendingApprovalsForRole(role: string): Promise<{approval: JDApproval, steps: JDApprovalStep[]}[]> {
    // First get approvals that are submitted or in progress
    const { data: approvals, error: approvalsError } = await supabase
      .from('jd_approvals')
      .select('*')
      .in('status', ['submitted', 'on_hold'])
      .order('created_at', { ascending: false });

    if (approvalsError) {
      console.error('Error fetching pending approvals:', approvalsError);
      throw approvalsError;
    }

    if (!approvals) return [];

    // Get all steps for these approvals
    const approvalIds = approvals.map(a => a.id);
    const { data: steps, error: stepsError } = await supabase
      .from('jd_approval_steps')
      .select('*')
      .in('jd_approval_id', approvalIds)
      .order('step_number');

    if (stepsError) {
      console.error('Error fetching approval steps:', stepsError);
      throw stepsError;
    }

    // Filter to only approvals where the current step matches the user's role
    const result = approvals
      .map(approval => {
        const approvalSteps = steps?.filter(s => s.jd_approval_id === approval.id) || [];
        const currentStep = approvalSteps.find(s => s.status === 'pending' && s.approver_role === role);
        return currentStep ? { approval, steps: approvalSteps } : null;
      })
      .filter(Boolean) as {approval: JDApproval, steps: JDApprovalStep[]}[];

    return result;
  },

  // Workflow Actions
  async submitForApproval(jdId: string, approvalData: Partial<JDApproval>): Promise<JDApproval> {
    // First create or update the approval record
    let approval = await this.getJDApproval(jdId);
    
    if (!approval) {
      approval = await this.createJDApproval({
        ...approvalData,
        jd_id: jdId,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        current_step: 1
      });
    } else {
      approval = await this.updateJDApproval(approval.id, {
        ...approvalData,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        current_step: 1
      });
    }

    // Get default approval rule and create steps
    const rules = await this.getApprovalRules();
    const defaultRule = rules.find(rule => rule.rule_name === 'Default JD Approval');
    
    if (defaultRule && defaultRule.approval_chain) {
      // Clear existing steps
      const { error: deleteError } = await supabase
        .from('jd_approval_steps')
        .delete()
        .eq('jd_approval_id', approval.id);

      if (deleteError) {
        console.error('Error deleting existing steps:', deleteError);
      }

      // Create new steps from the approval chain
      for (const chainStep of defaultRule.approval_chain) {
        await this.createApprovalStep({
          jd_approval_id: approval.id,
          step_number: chainStep.step,
          approver_role: chainStep.role,
          sla_hours: chainStep.sla_hours,
          status: chainStep.step === 1 ? 'pending' : 'pending',
          assigned_at: chainStep.step === 1 ? new Date().toISOString() : undefined
        });
      }
    }

    // Create audit entry
    await this.createAuditEntry({
      jd_id: jdId,
      jd_approval_id: approval.id,
      action: 'submit',
      details: { submitted_for_approval: true },
      comments: 'JD submitted for approval'
    });

    return approval;
  },

  async approveStep(stepId: string, comments?: string): Promise<JDApprovalStep> {
    const step = await this.updateApprovalStep(stepId, {
      status: 'approved',
      completed_at: new Date().toISOString(),
      comments
    });

    // Create audit entry
    await this.createAuditEntry({
      jd_approval_id: step.jd_approval_id,
      action: 'approve',
      details: { step_number: step.step_number },
      comments
    });

    return step;
  },

  async rejectStep(stepId: string, comments: string): Promise<JDApprovalStep> {
    const step = await this.updateApprovalStep(stepId, {
      status: 'rejected',
      completed_at: new Date().toISOString(),
      comments
    });

    // Update overall approval status
    const { error } = await supabase
      .from('jd_approvals')
      .update({ status: 'rejected' } as any)
      .eq('id', step.jd_approval_id);

    if (error) {
      console.error('Error updating approval status:', error);
    }

    // Create audit entry
    await this.createAuditEntry({
      jd_approval_id: step.jd_approval_id,
      action: 'reject',
      details: { step_number: step.step_number },
      comments
    });

    return step;
  }
};