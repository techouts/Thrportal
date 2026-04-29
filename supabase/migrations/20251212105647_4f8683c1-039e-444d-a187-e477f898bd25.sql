-- Create leave_policies table for policy configuration
CREATE TABLE public.leave_policies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  annual_quota numeric DEFAULT 0,
  accrual_rate numeric DEFAULT 0,
  accrual_frequency text DEFAULT 'monthly',
  allow_half_day boolean DEFAULT true,
  allow_negative boolean DEFAULT false,
  max_consecutive_days integer,
  advance_notice_days integer DEFAULT 0,
  backdated_limit_days integer DEFAULT 60,
  carry_forward_limit numeric DEFAULT 0,
  encashment_limit numeric DEFAULT 0,
  expiry_days integer,
  restrictions jsonb DEFAULT '[]'::jsonb,
  application_notes text,
  joining_restriction_days integer DEFAULT 0,
  notice_period_allowed boolean DEFAULT true,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leave_policies ENABLE ROW LEVEL SECURITY;

-- Everyone can view policies
CREATE POLICY "Anyone can view leave policies"
ON public.leave_policies
FOR SELECT
USING (true);

-- HR/Admin can manage policies
CREATE POLICY "HR and Admin can manage leave policies"
ON public.leave_policies
FOR ALL
USING (get_current_user_role() = ANY (ARRAY['HR_MANAGER'::text, 'ADMIN'::text]));

-- Insert the 4 leave policies
INSERT INTO public.leave_policies (code, name, description, annual_quota, accrual_rate, accrual_frequency, allow_half_day, max_consecutive_days, advance_notice_days, backdated_limit_days, carry_forward_limit, encashment_limit, restrictions, application_notes, joining_restriction_days, notice_period_allowed, display_order)
VALUES 
  ('CL', 'Casual Leave', 'General leaves for personal tasks. Must be applied 2 days in advance.', 15, 1.25, 'monthly', true, 15, 2, 60, 10, 0, 
   '["For leave duration of 2+ days, apply at least 2 calendar days before", "Can apply for past day, but not beyond 60 calendar days back", "Requires comment while applying", "Cannot apply for more than 15 consecutive days", "Cannot be applied during notice period"]'::jsonb,
   'Can be applied by you or manager. Full day and half-day options available.',
   5, false, 1),
  
  ('COMP_OFF', 'Comp Offs', 'Compensatory time off earned for working on holidays or weekends. Must be used within 60 days of earning.', 0, 0, 'none', true, null, 0, 0, 0, 0,
   '["Can apply for past day, but not beyond 60 calendar days back", "Requires comment while applying", "Must be consumed within 60 days of accrual", "Comp-off expires if not used within validity period"]'::jsonb,
   'Can be applied by you or manager. Full day and half-day options available. Earned comp-offs will expire after 60 days if not consumed.',
   0, true, 2),
  
  ('PL_PATERNITY', 'Paternity Leave', 'Leave granted to fathers for childbirth. Must be taken within 6 months of child birth.', 5, 0, 'none', false, 5, 7, 0, 0, 0,
   '["Must be taken within 6 months of child birth", "Apply at least 7 days in advance", "Cannot be split into multiple parts", "Requires supporting documentation"]'::jsonb,
   'Apply through leave portal with expected delivery date. HR will verify and approve.',
   0, true, 3),
  
  ('LOP', 'Unpaid Leave', 'Leave without pay when other leave types are exhausted or for extended absences.', 0, 0, 'none', true, null, 1, 30, 0, 0,
   '["Salary will be deducted for LOP days", "Can apply for past day, but not beyond 30 calendar days back", "Requires comment while applying", "May affect other benefits if extended"]'::jsonb,
   'Can be applied when other leave balances are exhausted. Requires manager approval.',
   0, true, 4);

-- Add trigger for updated_at
CREATE TRIGGER update_leave_policies_updated_at
BEFORE UPDATE ON public.leave_policies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();