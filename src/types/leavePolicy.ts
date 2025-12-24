export interface LeavePolicy {
  id: string;
  code: string;
  name: string;
  description: string | null;
  annual_quota: number;
  accrual_rate: number;
  accrual_frequency: 'monthly' | 'quarterly' | 'yearly' | 'none';
  allow_half_day: boolean;
  allow_negative: boolean;
  max_consecutive_days: number | null;
  advance_notice_days: number;
  backdated_limit_days: number;
  carry_forward_limit: number;
  encashment_limit: number;
  expiry_days: number | null;
  restrictions: string[];
  application_notes: string | null;
  joining_restriction_days: number;
  notice_period_allowed: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface LeaveTransaction {
  id: string;
  date: string;
  change: number;
  balance: number;
  description?: string;
  transactionType?: 'ACCRUAL' | 'DEDUCTION' | 'CARRY_FORWARD' | 'ADJUSTMENT';
}

export interface LeavePolicyBalance {
  policy: LeavePolicy;
  available: number;
  consumed: number;
  total: number;
  transactions: LeaveTransaction[];
}
