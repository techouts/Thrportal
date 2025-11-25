-- Create table for JD recruiter assignments
CREATE TABLE jd_ownership_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jd_id UUID NOT NULL REFERENCES jd_approvals(id) ON DELETE CASCADE,
  primary_recruiter_id UUID REFERENCES profiles(id),
  collaborator_ids UUID[] DEFAULT '{}',
  staffing_manager_id UUID REFERENCES profiles(id),
  client_spoc TEXT,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  assigned_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create table for JD ownership metadata
CREATE TABLE jd_ownership_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jd_id UUID NOT NULL UNIQUE REFERENCES jd_approvals(id) ON DELETE CASCADE,
  is_locked BOOLEAN DEFAULT false,
  locked_by UUID REFERENCES profiles(id),
  locked_at TIMESTAMPTZ,
  open_pool_flag BOOLEAN DEFAULT false,
  per_recruiter_submission_cap INTEGER DEFAULT 5,
  sla_deadline TIMESTAMPTZ,
  sla_status TEXT DEFAULT 'On Track',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_jd_ownership_assignments_jd_id ON jd_ownership_assignments(jd_id);
CREATE INDEX idx_jd_ownership_assignments_primary ON jd_ownership_assignments(primary_recruiter_id);
CREATE INDEX idx_jd_ownership_metadata_jd_id ON jd_ownership_metadata(jd_id);

-- Enable RLS
ALTER TABLE jd_ownership_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE jd_ownership_metadata ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assignments
CREATE POLICY "Staff can view assignments" ON jd_ownership_assignments
  FOR SELECT USING (
    get_current_user_role() IN ('STAFFING_MANAGER', 'HR_MANAGER', 'RECRUITER', 'HIRING_MANAGER', 'MANAGEMENT', 'ADMIN')
  );

CREATE POLICY "Staff managers can manage assignments" ON jd_ownership_assignments
  FOR ALL USING (
    get_current_user_role() IN ('STAFFING_MANAGER', 'HR_MANAGER', 'ADMIN')
  );

-- RLS Policies for metadata
CREATE POLICY "Staff can view metadata" ON jd_ownership_metadata
  FOR SELECT USING (
    get_current_user_role() IN ('STAFFING_MANAGER', 'HR_MANAGER', 'RECRUITER', 'HIRING_MANAGER', 'MANAGEMENT', 'ADMIN')
  );

CREATE POLICY "Staff managers can manage metadata" ON jd_ownership_metadata
  FOR ALL USING (
    get_current_user_role() IN ('STAFFING_MANAGER', 'HR_MANAGER', 'ADMIN')
  );

-- Initialize ownership metadata for all approved JDs
INSERT INTO jd_ownership_metadata (jd_id, open_pool_flag, per_recruiter_submission_cap, sla_status, sla_deadline)
SELECT 
  id,
  false,
  5,
  'On Track',
  created_at + INTERVAL '30 days'
FROM jd_approvals
WHERE approval_status = 'approved'
ON CONFLICT (jd_id) DO NOTHING;

-- Initialize ownership assignments for approved JDs
INSERT INTO jd_ownership_assignments (jd_id, client_spoc)
SELECT 
  id,
  COALESCE(client_name, 'TBD')
FROM jd_approvals
WHERE approval_status = 'approved'
AND NOT EXISTS (
  SELECT 1 FROM jd_ownership_assignments WHERE jd_id = jd_approvals.id
);

-- Add update trigger for updated_at columns
CREATE TRIGGER update_jd_ownership_assignments_updated_at
BEFORE UPDATE ON jd_ownership_assignments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jd_ownership_metadata_updated_at
BEFORE UPDATE ON jd_ownership_metadata
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();