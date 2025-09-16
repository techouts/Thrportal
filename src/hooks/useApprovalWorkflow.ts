import { useState, useEffect } from 'react';
import { approvalsService } from '@/services/approvalsService';
import { 
  JDApproval, 
  JDApprovalStep, 
  ApprovalRule, 
  ApprovalStatus,
  ApprovalStepStatus 
} from '@/types/approvals';
import { useToast } from '@/hooks/use-toast';

export interface ApprovalWorkflowState {
  approval: JDApproval | null;
  steps: JDApprovalStep[];
  currentStep: JDApprovalStep | null;
  nextStep: JDApprovalStep | null;
  canApprove: boolean;
  isLoading: boolean;
}

export function useApprovalWorkflow(jdId: string) {
  const [state, setState] = useState<ApprovalWorkflowState>({
    approval: null,
    steps: [],
    currentStep: null,
    nextStep: null,
    canApprove: false,
    isLoading: true
  });
  const { toast } = useToast();

  const loadApprovalWorkflow = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const approval = await approvalsService.getJDApproval(jdId);
      if (!approval) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          approval: null,
          steps: [],
          currentStep: null,
          nextStep: null,
          canApprove: false
        }));
        return;
      }

      const steps = await approvalsService.getApprovalSteps(approval.id);
      const currentStep = steps.find(step => step.status === 'pending') || null;
      const nextStepIndex = currentStep ? currentStep.step_number : steps.length;
      const nextStep = steps.find(step => step.step_number === nextStepIndex + 1) || null;

      setState({
        approval,
        steps,
        currentStep,
        nextStep,
        canApprove: !!currentStep,
        isLoading: false
      });
    } catch (error) {
      console.error('Error loading approval workflow:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: "Error",
        description: "Failed to load approval workflow",
        variant: "destructive"
      });
    }
  };

  const submitForApproval = async (approvalData: Partial<JDApproval>) => {
    try {
      await approvalsService.submitForApproval(jdId, approvalData);
      await loadApprovalWorkflow();
      toast({
        title: "Success",
        description: "JD submitted for approval"
      });
    } catch (error) {
      console.error('Error submitting for approval:', error);
      toast({
        title: "Error",
        description: "Failed to submit for approval",
        variant: "destructive"
      });
    }
  };

  const approveCurrentStep = async (comments?: string) => {
    if (!state.currentStep) return;

    try {
      await approvalsService.approveStep(state.currentStep.id, comments);
      
      // Check if this was the final step
      const isLastStep = !state.nextStep;
      if (isLastStep) {
        // Update approval status to approved
        await approvalsService.updateJDApproval(state.approval!.id, {
          status: 'approved' as ApprovalStatus
        });
      } else {
        // Assign next step
        await approvalsService.updateApprovalStep(state.nextStep!.id, {
          assigned_at: new Date().toISOString(),
          status: 'pending' as ApprovalStepStatus
        });
      }

      await loadApprovalWorkflow();
      toast({
        title: "Success",
        description: isLastStep ? "JD fully approved!" : "Step approved, moved to next approver"
      });
    } catch (error) {
      console.error('Error approving step:', error);
      toast({
        title: "Error",
        description: "Failed to approve step",
        variant: "destructive"
      });
    }
  };

  const rejectCurrentStep = async (comments: string) => {
    if (!state.currentStep) return;

    try {
      await approvalsService.rejectStep(state.currentStep.id, comments);
      await loadApprovalWorkflow();
      toast({
        title: "JD Rejected",
        description: "JD has been rejected and returned to submitter"
      });
    } catch (error) {
      console.error('Error rejecting step:', error);
      toast({
        title: "Error",
        description: "Failed to reject step",
        variant: "destructive"
      });
    }
  };

  const requestChanges = async (comments: string) => {
    if (!state.currentStep || !state.approval) return;

    try {
      await approvalsService.updateApprovalStep(state.currentStep.id, {
        status: 'changes_requested' as ApprovalStepStatus,
        comments,
        completed_at: new Date().toISOString()
      });

      await approvalsService.updateJDApproval(state.approval.id, {
        status: 'changes_requested' as ApprovalStatus
      });

      await approvalsService.createAuditEntry({
        jd_id: jdId,
        jd_approval_id: state.approval.id,
        action: 'request_changes',
        details: { step_number: state.currentStep.step_number },
        comments
      });

      await loadApprovalWorkflow();
      toast({
        title: "Changes Requested",
        description: "JD returned to submitter for changes"
      });
    } catch (error) {
      console.error('Error requesting changes:', error);
      toast({
        title: "Error",
        description: "Failed to request changes",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (jdId) {
      loadApprovalWorkflow();
    }
  }, [jdId]);

  return {
    ...state,
    actions: {
      submitForApproval,
      approveCurrentStep,
      rejectCurrentStep,
      requestChanges,
      refresh: loadApprovalWorkflow
    }
  };
}