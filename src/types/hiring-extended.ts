// Extended Hiring Types for JD Management, CRM, Candidates, and Ownership

export type PositionType = 'INTERNAL' | 'EXTERNAL';
export type ApprovalPath = 'INTERNAL' | 'EXTERNAL';
export type JDSource = 'Manual' | 'Excel' | 'Smart';
export type JDStatus = 'Draft' | 'PendingApproval' | 'Approved' | 'Published' | 'Closed';
export type JDPriority = 'Critical' | 'High' | 'Normal';
export type EmploymentType = 'Full-time' | 'Contract' | 'C2H';
export type Currency = 'INR' | 'USD' | 'EUR';

// JD Management
export interface JobDescription {
  id: string;
  tenant_id: string;
  department: string;
  business_unit: string;
  job_title: string;
  openings: number;
  recruiter_owner_email: string;
  position_type: PositionType;
  min_ctc_annual?: number;
  max_ctc_annual?: number;
  currency: Currency;
  location?: string;
  employment_type?: EmploymentType;
  grade_level?: string;
  min_exp_years?: number;
  max_exp_years?: number;
  remote_hybrid?: 'Remote' | 'Hybrid' | 'Onsite';
  shift?: string;
  skills_primary: string[];
  skills_secondary: string[];
  must_have?: string;
  good_to_have?: string;
  job_description: string;
  project_code?: string;
  client_id?: string;
  client_name?: string;
  hiring_manager_email: string;
  priority?: JDPriority;
  expiry_date?: string;
  approval_required: boolean;
  status: JDStatus;
  approval_path: ApprovalPath;
  jd_source: JDSource;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface JDApproval {
  id: string;
  jd_id: string;
  approver_role: 'HR_MANAGER' | 'MANAGEMENT' | 'STAFFING_MANAGER';
  approver_email: string;
  approver_name: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  comment?: string;
  timestamp: string;
}

export interface JDValidationError {
  row: number;
  col: string;
  message: string;
}

export interface JDParseResult {
  confidence: number;
  draft: Partial<JobDescription>;
  suggestions: string[];
  uncertainFields: string[];
}

// CRM Types
export interface Client {
  id: string;
  tenant_id: string;
  name: string;
  industry?: string;
  tier?: 'Tier 1' | 'Tier 2' | 'Tier 3';
  owner: string;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  tenant_id: string;
  client_id: string;
  name: string;
  region?: string;
  owner: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  tenant_id: string;
  account_id: string;
  code: string;
  name: string;
  status: 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SPOC {
  id: string;
  tenant_id: string;
  account_id?: string;
  project_id?: string;
  name: string;
  email: string;
  phone?: string;
  title?: string;
  created_at: string;
  updated_at: string;
}

export type InteractionType = 'call' | 'email' | 'meeting' | 'teams' | 'whatsapp' | 'linkedin' | 'other';
export type InteractionDirection = 'outbound' | 'inbound';

export interface Interaction {
  id: string;
  tenant_id: string;
  project_id?: string;
  account_id?: string;
  client_id?: string;
  spoc_id: string;
  type: InteractionType;
  subject: string;
  notes: string;
  direction: InteractionDirection;
  link_url?: string;
  message_id?: string;
  next_followup_on?: string;
  created_by: string;
  created_at: string;
}

export type OpportunityStage = 'lead' | 'qualified' | 'submitted' | 'interview' | 'offer' | 'won' | 'lost';

export interface Opportunity {
  id: string;
  tenant_id: string;
  project_id: string;
  jd_id?: string;
  stage: OpportunityStage;
  est_value?: number;
  owner: string;
  created_at: string;
  updated_at: string;
}

// Candidates & Resumes
export interface Candidate {
  id: string;
  tenant_id: string;
  email: string;
  phone_hash: string;
  name?: string;
  location?: string;
  consent_source?: string;
  consent_ts?: string;
  global_opt_out: boolean;
  created_at: string;
  updated_at: string;
}

export interface Resume {
  id: string;
  tenant_id: string;
  candidate_id: string;
  is_master: boolean;
  client_id?: string;
  jd_id?: string;
  skills: string[];
  file_url: string;
  normalized_text?: string;
  sections_map?: Record<string, string>;
  created_by: string;
  created_at: string;
  tags: string[];
}

export type ApplicationStage = 'submitted' | 'screening' | 'technical' | 'hr' | 'client' | 'interview' | 'offer' | 'joined' | 'rejected';

export interface Application {
  id: string;
  tenant_id: string;
  candidate_id: string;
  jd_id: string;
  resume_id: string;
  stage: ApplicationStage;
  score?: number;
  created_at: string;
  updated_at: string;
}

// Ownership & Mapping
export interface ResumeOwnership {
  id: string;
  tenant_id: string;
  resume_id: string;
  candidate_id: string;
  owner_email: string;
  acquired_at: string;
  expires_at: string;
  auto_extended: boolean;
  created_at: string;
}

export interface JDMapping {
  id: string;
  tenant_id: string;
  jd_id: string;
  resume_id: string;
  proposed_by: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reviewed_by?: string;
  reviewed_at?: string;
  comment?: string;
  created_at: string;
}

// Follow-up Tasks
export interface FollowUpTask {
  id: string;
  tenant_id: string;
  assignee: string;
  title: string;
  description?: string;
  due_on: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Completed' | 'Overdue';
  context_entity_type?: 'interaction' | 'opportunity' | 'jd' | 'application';
  context_entity_id?: string;
  created_by: string;
  created_at: string;
  completed_at?: string;
}

// CRM KPIs
export interface CRMKPIs {
  activity: {
    touches_per_client: Record<string, number>;
    touches_by_channel: Record<InteractionType, number>;
    days_since_last_touch: Record<string, number>;
  };
  coverage: {
    active_spocs_per_account: Record<string, number>;
    accounts_with_recent_touches: number;
    total_accounts: number;
  };
  pipeline: {
    opportunities_per_week: Array<{ week: string; count: number }>;
    conversion_rates: Record<OpportunityStage, number>;
    stage_velocity: Record<OpportunityStage, number>;
  };
  effectiveness: {
    reply_rate_per_channel: Record<InteractionType, number>;
    win_rate_per_account: Record<string, number>;
    win_rate_per_owner: Record<string, number>;
  };
  risk: {
    stale_accounts_30d: string[];
    stale_accounts_60d: string[];
    stale_accounts_90d: string[];
    single_threaded_accounts: string[];
  };
  recruiter_contribution: {
    opps_created: Record<string, number>;
    submissions: Record<string, number>;
    interviews: Record<string, number>;
    offers: Record<string, number>;
    wins: Record<string, number>;
  };
}

// Tenant Configuration
export interface TenantConfig {
  tenant_id: string;
  currency_default: Currency;
  ownership_days: number;
  ownership_extend_on_interview_days: number;
  naukri_stepup_threshold?: number;
  followup_sla_days: number;
  email_smtp: {
    provider: string;
    host: string;
    port: number;
    user: string;
    from: string;
  };
  email_csv_enabled: boolean;
  channels_enabled: InteractionType[];
}

// API Request/Response Types
export interface CreateJDRequest {
  jd: Omit<JobDescription, 'id' | 'tenant_id' | 'status' | 'created_at' | 'updated_at'>;
}

export interface BulkJDValidateRequest {
  data: Array<Record<string, any>>;
}

export interface BulkJDValidateResponse {
  ok: boolean;
  errors: JDValidationError[];
}

export interface BulkJDCreateResponse {
  created: string[];
  failed: Array<{ row: number; error: string }>;
}

export interface SmartJDParseRequest {
  file_content: string;
  file_name: string;
}

export interface SmartJDParseResponse {
  draft: Partial<JobDescription>;
  confidence: number;
}

export interface EmailCampaignRequest {
  candidates: string[];
  template_id: string;
  subject: string;
  content: string;
}

export interface OwnershipClaimRequest {
  resume_id: string;
  candidate_id: string;
}

export interface MappingProposalRequest {
  jd_id: string;
  resume_id: string;
  reason?: string;
}

export interface MappingDecisionRequest {
  mapping_id: string;
  decision: 'approve' | 'reject';
  comment?: string;
}