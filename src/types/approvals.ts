export type ApprovalStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'on_hold' | 'changes_requested';
export type ApprovalStepStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested' | 'skipped';
export type ApprovalAction = 'submit' | 'approve' | 'reject' | 'request_changes' | 'reassign' | 'override';
export type ApprovalWorkflowStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'changes_requested';

export type JDStatusType = 'Active' | 'Draft' | 'Closed' | 'On Hold' | 'Cancelled' | 'Target Date Expired' | ApprovalStatus;
export type JobType = 'Permanent' | 'Contract' | 'C2H' | 'Full-time';
export type PayType = 'Monthly' | 'Annually';

export interface JDApproval {
  id: string;
  jd_id: string;
  status: JDStatusType;
  approver_names?: string[] | null;
  target_date?: string | null;
  job_type?: JobType | null;
  pay_type?: PayType | null;
  ctc_monthly_min?: number | null;
  ctc_monthly_max?: number | null;
  ctc_annual_min?: number | null;
  ctc_annual_max?: number | null;
  contract_period_months?: number | null;
  employment_type?: string | null;
  submitted_at?: string | null;
  submitted_by?: string | null;
  current_step: number | null;
  headcount?: number | null;
  is_replacement: boolean | null;
  replacement_for?: string | null;
  cost_center?: string | null;
  project_name?: string | null;
  client_name?: string | null;
  salary_band_min?: number | null;
  salary_band_max?: number | null;
  currency: string | null;
  opex_capex?: string | null;
  business_justification?: string | null;
  target_first_submission_days?: number | null;
  target_doj?: string | null;
  attachments: any;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  // Job description fields
  job_title?: string | null;
  department?: string | null;
  business_unit?: string | null;
  work_location?: { city: string; mode: 'Onsite' | 'Remote' | 'Hybrid' } | null;
  is_internal?: boolean | null;
  short_summary?: string | null;
  responsibilities?: string[] | null;
  required_skills?: { mustHave: string[]; goodToHave: string[] } | null;
  experience_min?: number | null;
  experience_max?: number | null;
  positions?: number | null;
  priority?: 'Critical' | 'High' | 'Normal' | null;
  resume_deadline?: string | null;
  interview_rounds?: string[] | null;
  additional_notes?: string | null;
  approval_status?: ApprovalWorkflowStatus | null;
}

export interface JDApprovalStep {
  id: string;
  jd_approval_id: string;
  step_number: number;
  approver_id?: string | null;
  approver_role?: string | null;
  status: ApprovalStepStatus;
  sla_hours: number | null;
  assigned_at?: string | null;
  completed_at?: string | null;
  comments?: string | null;
  escalated_to?: string | null;
  escalated_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface JDAuditLog {
  id: string;
  jd_id?: string | null;
  jd_approval_id?: string | null;
  action: ApprovalAction;
  actor_id?: string | null;
  actor_role?: string | null;
  details: any;
  comments?: string | null;
  field_changes: any;
  timestamp: string;
}

export interface ApprovalRule {
  id: string;
  rule_name: string;
  conditions: any;
  approval_chain: any;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

export interface ApprovalChainStep {
  step: number;
  role: string;
  sla_hours: number;
  quorum: 'any' | 'all';
}

// Create types for insert operations
export interface CreateJDApproval {
  jd_id: string;
  status?: JDStatusType;
  approver_names?: string[];
  target_date?: string;
  job_type?: JobType;
  pay_type?: PayType;
  ctc_monthly_min?: number;
  ctc_monthly_max?: number;
  ctc_annual_min?: number;
  ctc_annual_max?: number;
  contract_period_months?: number;
  employment_type?: string;
  submitted_at?: string;
  submitted_by?: string;
  current_step?: number;
  headcount?: number;
  is_replacement?: boolean;
  replacement_for?: string;
  cost_center?: string;
  project_name?: string;
  client_name?: string;
  salary_band_min?: number;
  salary_band_max?: number;
  currency?: string;
  opex_capex?: string;
  business_justification?: string;
  target_first_submission_days?: number;
  target_doj?: string;
  attachments?: any;
  created_by?: string;
  // Job description fields
  job_title?: string;
  department?: string;
  business_unit?: string;
  work_location?: { city: string; mode: 'Onsite' | 'Remote' | 'Hybrid' };
  is_internal?: boolean;
  short_summary?: string;
  responsibilities?: string[];
  required_skills?: { mustHave: string[]; goodToHave: string[] };
  experience_min?: number;
  experience_max?: number;
  positions?: number;
  priority?: 'Critical' | 'High' | 'Normal';
  resume_deadline?: string;
  interview_rounds?: string[];
  additional_notes?: string;
  approval_status?: ApprovalWorkflowStatus;
}

export interface CreateJDApprovalStep {
  jd_approval_id: string;
  step_number: number;
  approver_id?: string;
  approver_role?: string;
  status?: ApprovalStepStatus;
  sla_hours?: number;
  assigned_at?: string;
  completed_at?: string;
  comments?: string;
  escalated_to?: string;
  escalated_at?: string;
}

export interface CreateJDAuditLog {
  jd_id?: string;
  jd_approval_id?: string;
  action: ApprovalAction;
  actor_id?: string;
  actor_role?: string;
  details?: any;
  comments?: string;
  field_changes?: any;
}