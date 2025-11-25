-- Create enum for approval status
CREATE TYPE public.approval_status AS ENUM (
  'draft',
  'submitted',
  'approved',
  'rejected',
  'on_hold',
  'changes_requested'
);

-- Create enum for approval step status
CREATE TYPE public.approval_step_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'changes_requested',
  'skipped'
);

-- Create enum for approval actions
CREATE TYPE public.approval_action AS ENUM (
  'submit',
  'approve',
  'reject',
  'request_changes',
  'reassign',
  'override'
);

-- Create jd_approvals table to track overall approval workflow
CREATE TABLE public.jd_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jd_id UUID NOT NULL,
  status approval_status NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMP WITH TIME ZONE,
  submitted_by UUID REFERENCES public.profiles(id),
  current_step INTEGER DEFAULT 0,
  headcount INTEGER,
  is_replacement BOOLEAN DEFAULT false,
  replacement_for TEXT,
  cost_center TEXT,
  project_name TEXT,
  client_name TEXT,
  salary_band_min DECIMAL,
  salary_band_max DECIMAL,
  currency TEXT DEFAULT 'USD',
  opex_capex TEXT,
  business_justification TEXT,
  target_first_submission_days INTEGER,
  target_doj DATE,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Create jd_approval_steps table for individual approval steps
CREATE TABLE public.jd_approval_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jd_approval_id UUID NOT NULL REFERENCES public.jd_approvals(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  approver_id UUID REFERENCES public.profiles(id),
  approver_role TEXT,
  status approval_step_status NOT NULL DEFAULT 'pending',
  sla_hours INTEGER DEFAULT 24,
  assigned_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  comments TEXT,
  escalated_to UUID REFERENCES public.profiles(id),
  escalated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create jd_audit_log table for tracking all changes and actions
CREATE TABLE public.jd_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jd_id UUID,
  jd_approval_id UUID REFERENCES public.jd_approvals(id),
  action approval_action NOT NULL,
  actor_id UUID REFERENCES public.profiles(id),
  actor_role TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  comments TEXT,
  field_changes JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create approval_rules table for basic approval workflow configuration
CREATE TABLE public.approval_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL,
  conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
  approval_chain JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS on all tables
ALTER TABLE public.jd_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jd_approval_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jd_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_rules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for jd_approvals
CREATE POLICY "Staff and recruiters can view approvals" 
ON public.jd_approvals 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'MANAGEMENT'::text, 'ADMIN'::text]));

CREATE POLICY "Staff and recruiters can create/update approvals" 
ON public.jd_approvals 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'ADMIN'::text]));

-- Create RLS policies for jd_approval_steps
CREATE POLICY "Staff and recruiters can view approval steps" 
ON public.jd_approval_steps 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'MANAGEMENT'::text, 'ADMIN'::text]));

CREATE POLICY "Staff and recruiters can create/update approval steps" 
ON public.jd_approval_steps 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'ADMIN'::text]));

-- Create RLS policies for jd_audit_log
CREATE POLICY "Staff and recruiters can view audit log" 
ON public.jd_audit_log 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'MANAGEMENT'::text, 'ADMIN'::text]));

CREATE POLICY "Staff and recruiters can create audit entries" 
ON public.jd_audit_log 
FOR INSERT 
WITH CHECK (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'ADMIN'::text]));

-- Create RLS policies for approval_rules
CREATE POLICY "Staff can view approval rules" 
ON public.approval_rules 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'MANAGEMENT'::text, 'ADMIN'::text]));

CREATE POLICY "Managers can manage approval rules" 
ON public.approval_rules 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'ADMIN'::text]));

-- Create indexes for better performance
CREATE INDEX idx_jd_approvals_jd_id ON public.jd_approvals(jd_id);
CREATE INDEX idx_jd_approvals_status ON public.jd_approvals(status);
CREATE INDEX idx_jd_approvals_submitted_by ON public.jd_approvals(submitted_by);
CREATE INDEX idx_jd_approval_steps_jd_approval_id ON public.jd_approval_steps(jd_approval_id);
CREATE INDEX idx_jd_approval_steps_approver_id ON public.jd_approval_steps(approver_id);
CREATE INDEX idx_jd_approval_steps_status ON public.jd_approval_steps(status);
CREATE INDEX idx_jd_audit_log_jd_id ON public.jd_audit_log(jd_id);
CREATE INDEX idx_jd_audit_log_timestamp ON public.jd_audit_log(timestamp);

-- Create trigger for updating updated_at timestamps
CREATE TRIGGER update_jd_approvals_updated_at
  BEFORE UPDATE ON public.jd_approvals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jd_approval_steps_updated_at
  BEFORE UPDATE ON public.jd_approval_steps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_approval_rules_updated_at
  BEFORE UPDATE ON public.approval_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default approval rule
INSERT INTO public.approval_rules (rule_name, conditions, approval_chain, created_by) VALUES
(
  'Default JD Approval',
  '{"default": true}',
  '[
    {"step": 1, "role": "STAFFING_MANAGER", "sla_hours": 24, "quorum": "any"},
    {"step": 2, "role": "HR_MANAGER", "sla_hours": 48, "quorum": "any"}
  ]',
  (SELECT id FROM public.profiles WHERE role = 'ADMIN' LIMIT 1)
);