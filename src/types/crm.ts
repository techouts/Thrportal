export interface CrmClient {
  id: string;
  name: string;
  industry?: string;
  region?: string;
  status: 'Active' | 'Inactive' | 'Prospect';
  billing_model?: string;
  contract_type?: string;
  sla_reference_url?: string;
  health_score: number;
  domain?: string;
  gst_vat?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface CrmAccount {
  id: string;
  client_id: string;
  name: string;
  type?: string;
  sla_override?: string;
  primary_spoc_id?: string;
  billing_currency?: string;
  status?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  // Relations
  client?: CrmClient;
  primary_spoc?: CrmSpoc;
}

export interface CrmSpoc {
  id: string;
  client_id?: string;
  account_id?: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  is_primary: boolean;
  last_contacted_at?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  // Relations
  client?: CrmClient;
  account?: CrmAccount;
}

export interface CrmProject {
  id: string;
  client_id: string;
  account_id?: string;
  name: string;
  start_date?: string;
  end_date?: string;
  ft_target: number;
  contract_target: number;
  skills?: string[];
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Planned' | 'In-flight' | 'Closed' | 'On-hold';
  budget?: number;
  owner_id?: string;
  primary_spoc_id?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  // Relations
  client?: CrmClient;
  account?: CrmAccount;
  primary_spoc?: CrmSpoc;
}

export interface CrmOpportunity {
  id: string;
  client_id: string;
  account_id?: string;
  project_id?: string;
  ft_count: number;
  contract_count: number;
  estimation_cost?: number;
  currency: string;
  status: 'Open' | 'In Progress' | 'Closed' | 'Lost';
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  // Relations
  client?: CrmClient;
  account?: CrmAccount;
  project?: CrmProject;
}

export interface CrmInteraction {
  id: string;
  client_id?: string;
  account_id?: string;
  project_id?: string;
  spoc_id?: string;
  interaction_type: 'call' | 'meeting' | 'email' | 'whatsapp' | 'linkedin' | 'onsite';
  date: string;
  notes?: string;
  outcome?: string;
  next_step?: string;
  engagement_score: number;
  is_synced: boolean;
  created_at: string;
  created_by?: string;
  // Relations
  client?: CrmClient;
  account?: CrmAccount;
  project?: CrmProject;
  spoc?: CrmSpoc;
}

export interface CrmDocument {
  id: string;
  client_id?: string;
  account_id?: string;
  project_id?: string;
  name: string;
  document_type?: 'MSA' | 'SOW' | 'Contract' | 'Other';
  sharepoint_url: string;
  valid_from?: string;
  valid_until?: string;
  renewal_alert_sent: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  // Relations
  client?: CrmClient;
  account?: CrmAccount;
  project?: CrmProject;
}

export interface CrmRecruiterAssignment {
  id: string;
  recruiter_id: string;
  client_id?: string;
  account_id?: string;
  project_id?: string;
  assigned_at: string;
  assigned_by?: string;
  // Relations
  client?: CrmClient;
  account?: CrmAccount;
  project?: CrmProject;
}

export interface CrmSpocLink {
  id: string;
  spoc_id: string;
  entity_type: 'client' | 'account' | 'project';
  entity_id: string;
  role: 'finance' | 'project' | 'sales' | 'escalation' | 'primary';
  created_at: string;
  created_by?: string;
  // Relations
  spoc?: CrmSpoc;
}

// Filters and API types
export interface CrmClientFilters {
  industry?: string;
  region?: string;
  status?: string;
  assigned_recruiter?: string;
  search?: string;
}

export interface CrmMetrics {
  total_clients: number;
  active_clients: number;
  total_jds: number;
  avg_health_score: number;
  sla_compliance: number;
  recent_interactions: number;
}

export interface CrmKPIs {
  client_engagement: {
    avg_response_time: number;
    fulfillment_rate: number;
    last_engagement_avg_days: number;
    sla_compliance_percent: number;
  };
  hiring_outcomes: {
    total_jds: number;
    ft_hires: number;
    contract_hires: number;
    closure_rate: number;
  };
  business_growth: {
    active_opportunities: number;
    pipeline_value: number;
    monthly_growth: number;
  };
}