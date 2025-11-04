-- Drop and recreate get_jd_ownerships_with_details function to include collaborator names
DROP FUNCTION IF EXISTS get_jd_ownerships_with_details();

CREATE OR REPLACE FUNCTION get_jd_ownerships_with_details()
RETURNS TABLE (
  jd_id uuid,
  job_title text,
  status text,
  client_name text,
  created_at timestamptz,
  jd_updated_at timestamptz,
  primary_recruiter_id uuid,
  primary_recruiter_name text,
  collaborator_ids uuid[],
  collaborator_names text[],
  staffing_manager_id uuid,
  staffing_manager_name text,
  client_spoc text,
  assignment_updated_at timestamptz,
  is_locked boolean,
  open_pool_flag boolean,
  per_recruiter_submission_cap integer,
  sla_status text,
  sla_deadline timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    jd.id as jd_id,
    jd.job_title,
    jd.status,
    jd.client_name,
    jd.created_at,
    jd.updated_at as jd_updated_at,
    
    -- Assignment data
    oa.primary_recruiter_id,
    COALESCE(
      pr.display_name, 
      TRIM(CONCAT(pr.first_name, ' ', COALESCE(pr.last_name, ''))),
      'Unassigned'
    ) as primary_recruiter_name,
    oa.collaborator_ids,
    COALESCE(
      (SELECT array_agg(COALESCE(p.display_name, TRIM(CONCAT(p.first_name, ' ', COALESCE(p.last_name, '')))))
       FROM profiles p
       WHERE p.id = ANY(oa.collaborator_ids)
      ), 
      ARRAY[]::text[]
    ) as collaborator_names,
    oa.staffing_manager_id,
    COALESCE(
      sm.display_name,
      TRIM(CONCAT(sm.first_name, ' ', COALESCE(sm.last_name, ''))),
      'TBD'
    ) as staffing_manager_name,
    COALESCE(oa.client_spoc, jd.client_name, 'TBD') as client_spoc,
    oa.updated_at as assignment_updated_at,
    
    -- Metadata
    COALESCE(om.is_locked, false) as is_locked,
    COALESCE(om.open_pool_flag, false) as open_pool_flag,
    COALESCE(om.per_recruiter_submission_cap, 5) as per_recruiter_submission_cap,
    COALESCE(om.sla_status, 'On Track') as sla_status,
    om.sla_deadline
    
  FROM jd_approvals jd
  LEFT JOIN jd_ownership_assignments oa ON oa.jd_id = jd.id
  LEFT JOIN jd_ownership_metadata om ON om.jd_id = jd.id
  LEFT JOIN profiles pr ON pr.id = oa.primary_recruiter_id
  LEFT JOIN profiles sm ON sm.id = oa.staffing_manager_id
  WHERE jd.approval_status = 'approved'
    AND jd.status = 'Active'
  ORDER BY jd.created_at DESC;
$$;