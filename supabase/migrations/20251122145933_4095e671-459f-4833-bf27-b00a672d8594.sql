-- Create applications table
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  jd_id UUID NOT NULL REFERENCES public.jd_approvals(id) ON DELETE CASCADE,
  primary_recruiter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  submitted_by UUID NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  stage TEXT NOT NULL DEFAULT 'Submitted',
  status TEXT NOT NULL DEFAULT 'New',
  sla_status TEXT NOT NULL DEFAULT 'Green',
  round TEXT,
  status_reason TEXT,
  notes TEXT,
  last_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_via_mapping BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT applications_candidate_jd_unique UNIQUE (candidate_id, jd_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON public.applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_jd_id ON public.applications(jd_id);
CREATE INDEX IF NOT EXISTS idx_applications_submitted_by ON public.applications(submitted_by);
CREATE INDEX IF NOT EXISTS idx_applications_primary_recruiter_id ON public.applications(primary_recruiter_id);

-- Enable RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Staff can view all applications"
ON public.applications
FOR SELECT
TO authenticated
USING (
  get_current_user_role() = ANY(ARRAY['STAFFING_MANAGER', 'HR_MANAGER', 'RECRUITER', 'HIRING_MANAGER', 'MANAGEMENT', 'ADMIN'])
);

CREATE POLICY "Staff can create applications"
ON public.applications
FOR INSERT
TO authenticated
WITH CHECK (
  get_current_user_role() = ANY(ARRAY['STAFFING_MANAGER', 'HR_MANAGER', 'RECRUITER', 'HIRING_MANAGER', 'ADMIN'])
);

CREATE POLICY "Staff can update applications"
ON public.applications
FOR UPDATE
TO authenticated
USING (
  get_current_user_role() = ANY(ARRAY['STAFFING_MANAGER', 'HR_MANAGER', 'RECRUITER', 'HIRING_MANAGER', 'ADMIN'])
);

-- Add trigger for updated_at
CREATE TRIGGER update_applications_updated_at
BEFORE UPDATE ON public.applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();