-- Create recruiter_manager_mappings table (referencing profiles, not auth.users)
CREATE TABLE public.recruiter_manager_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,
  assigned_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(recruiter_id)
);

-- Enable RLS
ALTER TABLE public.recruiter_manager_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Staff can view recruiter manager mappings"
  ON public.recruiter_manager_mappings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Managers can manage recruiter manager mappings"
  ON public.recruiter_manager_mappings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('STAFFING_MANAGER', 'HR_MANAGER', 'ADMIN')
    )
  );

-- Add updated_at trigger
CREATE TRIGGER update_recruiter_manager_mappings_updated_at
  BEFORE UPDATE ON public.recruiter_manager_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE public.recruiter_manager_mappings IS 'Maps recruiters to their staffing managers for reporting hierarchy';

-- Populate with existing recruiters (only those that exist in profiles)
INSERT INTO public.recruiter_manager_mappings (recruiter_id, manager_id, assigned_at, assigned_by)
SELECT 
  p.id,
  NULL,
  NULL,
  NULL
FROM public.profiles p
INNER JOIN public.user_roles ur ON ur.user_id = p.id
WHERE ur.role = 'RECRUITER'
ON CONFLICT (recruiter_id) DO NOTHING;

-- Create function to get recruiter manager mappings with aggregated data
CREATE OR REPLACE FUNCTION public.get_recruiter_manager_mappings()
RETURNS TABLE(
  id UUID,
  recruiter_id UUID,
  recruiter_name TEXT,
  manager_id UUID,
  manager_name TEXT,
  active_jds INTEGER,
  active_candidates INTEGER,
  workload_score INTEGER,
  assigned_at TIMESTAMPTZ,
  assigned_by UUID
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    rmm.id,
    rmm.recruiter_id,
    COALESCE(
      rp.display_name, 
      TRIM(CONCAT(rp.first_name, ' ', COALESCE(rp.last_name, ''))),
      'Unknown Recruiter'
    ) as recruiter_name,
    rmm.manager_id,
    CASE 
      WHEN rmm.manager_id IS NULL THEN 'Unassigned'
      ELSE COALESCE(
        mp.display_name,
        TRIM(CONCAT(mp.first_name, ' ', COALESCE(mp.last_name, ''))),
        'Unknown Manager'
      )
    END as manager_name,
    
    COALESCE((
      SELECT COUNT(*)::INTEGER
      FROM jd_ownership_assignments joa
      INNER JOIN jd_approvals ja ON ja.id = joa.jd_id
      WHERE joa.primary_recruiter_id = rmm.recruiter_id
        AND ja.status = 'Active'
        AND ja.approval_status = 'approved'
    ), 0) as active_jds,
    
    COALESCE((
      SELECT COUNT(*)::INTEGER
      FROM candidates c
      WHERE c.recruiter_owner = COALESCE(
        rp.display_name, 
        TRIM(CONCAT(rp.first_name, ' ', COALESCE(rp.last_name, '')))
      )
    ), 0) as active_candidates,
    
    0 as workload_score,
    
    rmm.assigned_at,
    rmm.assigned_by
    
  FROM recruiter_manager_mappings rmm
  INNER JOIN profiles rp ON rp.id = rmm.recruiter_id
  LEFT JOIN profiles mp ON mp.id = rmm.manager_id
  ORDER BY recruiter_name;
$$;