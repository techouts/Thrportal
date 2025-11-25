// Contract management types

export interface MSA {
  id: string;
  client_id?: string;
  clientId: string;
  title: string;
  valid_from?: string;
  validFrom: string;
  valid_to?: string;
  validTo: string;
  doc_link?: string;
  status: 'Draft' | 'Active' | 'Expired' | 'Terminated';
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface SOW {
  id: string;
  msa_id?: string;
  msaId: string;
  title: string;
  valid_from?: string;
  validFrom: string;
  valid_to?: string;
  validTo: string;
  role_caps?: Record<string, number>;
  amount_cap?: number;
  amountCap?: number;
  currency: string;
  rate_cards?: Record<string, number>;
  status: 'Draft' | 'Active' | 'Expired' | 'Terminated';
  doc_link?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface PurchaseOrder {
  id: string;
  client_id?: string;
  clientId: string;
  po_number?: string;
  poNumber: string;
  valid_from?: string;
  validFrom: string;
  valid_to?: string;
  validTo: string;
  total_amount?: number;
  totalAmount: number;
  remaining_amount?: number;
  remainingAmount: number;
  currency: string;
  doc_link?: string;
  status: 'Draft' | 'Active' | 'Expired' | 'Terminated';
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface SOWPOAllocation {
  id: string;
  sow_id: string;
  po_id: string;
  allocated_amount: number;
  priority_order: number;
  created_at: string;
}

export interface ProjectSOWLink {
  id: string;
  project_id: string;
  sow_id: string;
  created_at: string;
}

export interface ContractAssignment {
  id: string;
  project_id: string;
  employee_id: string;
  sow_id?: string;
  role: string;
  location_type?: 'onsite' | 'offshore' | 'hybrid';
  billable_flag: boolean;
  shadow_flag: boolean;
  client_approval_flag: boolean;
  start_date: string;
  end_date?: string;
  allocation_pct: number;
  bill_rate: number;
  cost_rate: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface Invoice {
  id: string;
  client_id: string;
  project_id?: string;
  invoice_number?: string;
  period_start: string;
  period_end: string;
  amount: number;
  currency: string;
  status: 'draft' | 'submitted' | 'approved' | 'paid' | 'rejected';
  po_id?: string;
  sow_id?: string;
  parser_status: 'pending' | 'success' | 'failed' | 'manual';
  file_link?: string;
  parsed_data: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface InvoiceLine {
  id: string;
  invoice_id: string;
  employee_id?: string;
  role?: string;
  hours?: number;
  amount: number;
  sow_id?: string;
  po_id?: string;
  created_at: string;
}

export interface ApprovalLog {
  id: string;
  entity_type: string;
  entity_id: string;
  reason: string;
  justification?: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  requested_by?: string;
  approved_at?: string;
  created_at: string;
}

export interface ContractValidation {
  type: 'warning' | 'error' | 'info';
  message: string;
  field?: string;
}

export interface ContractMetrics {
  total_contracts: number;
  active_contracts: number;
  expiring_soon: number; // within 30 days
  po_utilization: number; // percentage
  sow_burn_rate: number; // percentage
  shadow_approvals_pending: number;
  overallocated_sows: number;
}

// Filter types for API queries
export interface MSAFilters {
  client_id?: string;
  status?: 'Draft' | 'Active' | 'Expired' | 'Terminated';
  search?: string;
}

export interface SOWFilters {
  msa_id?: string;
  client_id?: string;
  status?: 'Draft' | 'Active' | 'Expired' | 'Terminated';
  search?: string;
}

export interface POFilters {
  client_id?: string;
  status?: 'Draft' | 'Active' | 'Expired' | 'Terminated';
  search?: string;
}

// Create input types (omit auto-generated fields)
export type CreateMSAInput = Omit<MSA, 'id' | 'created_at' | 'updated_at' | 'created_by'>;

export type CreateSOWInput = Omit<SOW, 'id' | 'created_at' | 'updated_at' | 'created_by'>;

export type CreatePOInput = Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at' | 'created_by'>;

// Update input types (all fields optional, immutable fields omitted)
export type UpdateMSAInput = Partial<Omit<MSA, 'id' | 'created_at' | 'created_by'>>;

export type UpdateSOWInput = Partial<Omit<SOW, 'id' | 'created_at' | 'created_by'>>;

export type UpdatePOInput = Partial<Omit<PurchaseOrder, 'id' | 'created_at' | 'created_by'>>;