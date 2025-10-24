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
  async getApprovalsByStatus(statusList: string[]): Promise<any[]> {
    const { data } = await supabase
      .from('jd_approvals')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!data) return [];
    
    return data.filter((item: any) => statusList.includes(item.status));
  },

  // NEW: Get pending approvals for user's role
  async getPendingApprovals(userRole: string): Promise<JDApproval[]> {
    const { data, error } = await supabase
      .from('jd_approvals')
      .select(`
        *,
        jd_approval_steps!inner(*)
      `)
      .eq('status', 'Active')
      .neq('approval_status', 'approved')
      .neq('approval_status', 'rejected')
      .eq('jd_approval_steps.approver_role', userRole)
      .eq('jd_approval_steps.status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending approvals:', error);
      throw error;
    }

    return (data || []) as any as JDApproval[];
  },

  // NEW: Get approved JDs awaiting final HR review
  async getApprovedAwaitingHR(): Promise<JDApproval[]> {
    const { data, error } = await supabase
      .from('jd_approvals')
      .select(`
        *,
        jd_approval_steps!inner(*)
      `)
      .eq('status', 'Active')
      .eq('is_internal', true)
      .eq('approval_status', 'in_review')
      .eq('jd_approval_steps.approver_role', 'HR_MANAGER')
      .eq('jd_approval_steps.status', 'pending')
      .not('jd_approval_steps.assigned_at', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching HR review queue:', error);
      throw error;
    }

    console.log(`[getApprovedAwaitingHR] Found ${data?.length || 0} JDs awaiting HR review`);
    return (data || []) as any as JDApproval[];
  },

  // NEW: Get JD approval by ID
  async getJDApprovalById(id: string): Promise<JDApproval> {
    const { data, error } = await supabase
      .from('jd_approvals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching JD approval by ID:', error);
      throw error;
    }

    return data as JDApproval;
  },

  // NEW: Approve a JD and move workflow forward
  async approveJD(
    jdApprovalId: string,
    stepId: string,
    comments?: string,
    actorId?: string,
    actorRole?: string
  ): Promise<void> {
    try {
      console.log(`[approveJD] Starting approval for JD ${jdApprovalId}, step ${stepId}`);
      
      // 1. Approve the current step
      await this.approveStep(stepId, comments);
      
      // 2. Get approval and steps
      const approval = await this.getJDApprovalById(jdApprovalId);
      const steps = await this.getApprovalSteps(jdApprovalId);
      const currentStep = approval.current_step || 1;
      const nextStepNumber = currentStep + 1;
      
      console.log(`[approveJD] Current step: ${currentStep}, looking for step: ${nextStepNumber}`);
      
      let nextStep = steps.find(s => s.step_number === nextStepNumber);
      
      // Auto-create missing next step (e.g., HR_MANAGER step)
      if (!nextStep && approval.is_internal && nextStepNumber === 2) {
        console.log(`[approveJD] HR_MANAGER step missing, auto-creating...`);
        
        const { data: createdStep, error: createError } = await supabase
          .from('jd_approval_steps')
          .insert({
            jd_approval_id: jdApprovalId,
            step_number: 2,
            approver_role: 'HR_MANAGER',
            status: 'pending',
            sla_hours: 24,
            assigned_at: null
          })
          .select()
          .single();
        
        if (createError) {
          console.error('[approveJD] Failed to create HR_MANAGER step:', createError);
          throw createError;
        }
        
        nextStep = createdStep as JDApprovalStep;
        console.log(`[approveJD] Created HR_MANAGER step:`, nextStep.id);
      }
      
      if (nextStep) {
        console.log(`[approveJD] Found next step: ${nextStep.id} (${nextStep.approver_role})`);
        
        // Move to next step - update both JD approval and next step atomically
        const assignedAt = new Date().toISOString();
        
        // Update jd_approvals
        const { error: approvalError } = await supabase
          .from('jd_approvals')
          .update({
            current_step: nextStepNumber,
            approval_status: 'in_review',
            updated_at: new Date().toISOString()
          } as any)
          .eq('id', jdApprovalId);
        
        if (approvalError) {
          console.error('[approveJD] Failed to update jd_approvals:', approvalError);
          throw approvalError;
        }
        
        console.log(`[approveJD] Updated jd_approvals: current_step=${nextStepNumber}, approval_status=in_review`);
        
        // Activate next step by setting assigned_at
        const { error: stepError } = await supabase
          .from('jd_approval_steps')
          .update({
            assigned_at: assignedAt,
            updated_at: new Date().toISOString()
          } as any)
          .eq('id', nextStep.id);
        
        if (stepError) {
          console.error('[approveJD] Failed to activate next step:', stepError);
          throw stepError;
        }
        
        console.log(`[approveJD] Activated next step ${nextStep.id}: assigned_at=${assignedAt}`);
        
      } else {
        // Final approval - no more steps
        console.log(`[approveJD] No next step found, marking as fully approved`);
        
        const { error: finalError } = await supabase
          .from('jd_approvals')
          .update({
            approval_status: 'approved',
            updated_at: new Date().toISOString()
          } as any)
          .eq('id', jdApprovalId);
        
        if (finalError) {
          console.error('[approveJD] Failed to mark as approved:', finalError);
          throw finalError;
        }
        
        console.log(`[approveJD] JD marked as fully approved`);
      }
      
      // 3. Create audit log
      await this.createAuditEntry({
        jd_approval_id: jdApprovalId,
        action: 'approve',
        actor_id: actorId,
        actor_role: actorRole,
        comments,
        details: { 
          step_id: stepId,
          next_step_activated: nextStep?.id || null
        }
      });
      
      console.log(`[approveJD] Approval completed successfully`);
      
    } catch (error) {
      console.error('[approveJD] Approval failed with error:', error);
      throw error;
    }
  },

  // NEW: Reject a JD
  async rejectJD(
    jdApprovalId: string,
    stepId: string,
    comments: string,
    actorId?: string,
    actorRole?: string
  ): Promise<void> {
    // 1. Reject the step
    await this.rejectStep(stepId, comments);

    // 2. Update approval status to rejected
    await supabase
      .from('jd_approvals')
      .update({
        approval_status: 'rejected',
        status: 'On Hold'
      } as any)
      .eq('id', jdApprovalId);

    // 3. Create audit log
    await this.createAuditEntry({
      jd_approval_id: jdApprovalId,
      action: 'reject',
      actor_id: actorId,
      actor_role: actorRole,
      comments,
      details: { step_id: stepId, reason: comments }
    });
  },

  // Get pending approvals for current user role (legacy method)
  async getPendingApprovalsForRole(role: string): Promise<any[]> {
    const approvalsResult = await supabase
      .from('jd_approvals')
      .select('*')
      .order('created_at', { ascending: false });
    
    const approvals = approvalsResult.data?.filter((item: any) => 
      ['submitted', 'on_hold'].includes(item.status)
    ) || [];

    if (approvalsResult.error) {
      console.error('Error fetching pending approvals:', approvalsResult.error);
      throw approvalsResult.error;
    }

    if (!approvals) return [];

    const approvalIds = approvals.map((a: any) => a.id);
    const stepsResult = await supabase
      .from('jd_approval_steps')
      .select('*')
      .order('step_number');
    
    const steps = stepsResult.data?.filter((step: any) => 
      approvalIds.includes(step.jd_approval_id)
    ) || [];

    if (stepsResult.error) {
      console.error('Error fetching approval steps:', stepsResult.error);
      throw stepsResult.error;
    }

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
    // First check if JD is Draft
    let approval = await this.getJDApproval(jdId);
    
    if (approval && approval.status === 'Draft') {
      throw new Error("Cannot submit Draft JDs for approval. Please change status to Active first.");
    }

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

    // Get appropriate approval rule based on is_internal
    const rules = await this.getApprovalRules();
    const ruleName = approval.is_internal 
      ? 'Internal Position Approval' 
      : 'External Position Approval';
    const rule = rules.find(r => r.rule_name === ruleName);
    
    if (rule && rule.approval_chain) {
      // Clear existing steps
      const { error: deleteError } = await supabase
        .from('jd_approval_steps')
        .delete()
        .eq('jd_approval_id', approval.id);

      if (deleteError) {
        console.error('Error deleting existing steps:', deleteError);
      }

      // Create new steps from the approval chain
      for (const chainStep of rule.approval_chain) {
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

    const { error } = await supabase
      .from('jd_approvals')
      .update({ status: 'rejected' } as any)
      .eq('id', step.jd_approval_id);

    if (error) {
      console.error('Error updating approval status:', error);
    }

    await this.createAuditEntry({
      jd_approval_id: step.jd_approval_id,
      action: 'reject',
      details: { step_number: step.step_number },
      comments
    });

    return step;
  },

  // New methods for Manual JD Creation
  async getApproverNamesFromChain(): Promise<string[]> {
    const { data, error } = await supabase.rpc('get_approver_names_from_chain');
    
    if (error) {
      console.error('Error fetching approver names:', error);
      return [];
    }
    
    return data || [];
  },

  calculateCTCValues(amount: number, payType: 'Monthly' | 'Annually'): {
    monthly: number;
    annual: number;
  } {
    if (payType === 'Monthly') {
      return {
        monthly: amount,
        annual: amount * 12
      };
    } else {
      return {
        monthly: amount / 12,
        annual: amount
      };
    }
  },

  async createJDWithStatus(
    jdData: Partial<CreateJDApproval>, 
    isDraft: boolean
  ): Promise<JDApproval> {
    const approverNames = await this.getApproverNamesFromChain();
    
    const jdApproval: CreateJDApproval = {
      ...jdData,
      jd_id: jdData.jd_id || crypto.randomUUID(),
      status: isDraft ? 'Draft' : 'Active',
      approval_status: isDraft ? undefined : 'pending',
      approver_names: approverNames,
      current_step: isDraft ? 0 : 1,
      submitted_at: isDraft ? undefined : new Date().toISOString()
    };

    const createdJD = await this.createJDApproval(jdApproval);

    // Database trigger handles approval step creation automatically
    return createdJD;
  },

  // Helper method to create approval steps
  async createApprovalStepsForJD(
    jdApprovalId: string, 
    isInternal: boolean
  ): Promise<void> {
    // Get appropriate approval rule
    const rules = await this.getApprovalRules();
    const ruleName = isInternal 
      ? 'Internal Position Approval' 
      : 'External Position Approval';
    const rule = rules.find(r => r.rule_name === ruleName);
    
    if (!rule || !rule.approval_chain) {
      console.warn(`No approval rule found for ${ruleName}`);
      return;
    }

    // Check if steps already exist (trigger may have created them)
    const existingSteps = await this.getApprovalSteps(jdApprovalId);
    if (existingSteps.length > 0) {
      console.log('Approval steps already exist, skipping creation');
      return;
    }

    // Create approval steps
    for (const chainStep of rule.approval_chain) {
      await this.createApprovalStep({
        jd_approval_id: jdApprovalId,
        step_number: chainStep.step,
        approver_role: chainStep.role,
        sla_hours: chainStep.sla_hours,
        status: chainStep.step === 1 ? 'pending' : 'pending',
        assigned_at: chainStep.step === 1 ? new Date().toISOString() : undefined
      });
    }

    // Create audit log entry
    await this.createAuditEntry({
      jd_approval_id: jdApprovalId,
      action: 'submit',
      details: { auto_created_steps: true, is_internal: isInternal },
      comments: 'Approval steps auto-created on JD activation'
    });
  },

  // Public wrapper to ensure approval steps exist
  async ensureApprovalStepsExist(jdApprovalId: string, isInternal: boolean): Promise<void> {
    const existingSteps = await this.getApprovalSteps(jdApprovalId);
    
    if (existingSteps.length === 0) {
      await this.createApprovalStepsForJD(jdApprovalId, isInternal);
    }
  }
};
