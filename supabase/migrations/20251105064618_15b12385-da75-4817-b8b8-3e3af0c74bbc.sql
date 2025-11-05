-- Create candidate_jd_links table
CREATE TABLE candidate_jd_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  jd_id UUID NOT NULL REFERENCES jd_approvals(id) ON DELETE CASCADE,
  linked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  linked_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(candidate_id, jd_id)
);

-- Enable RLS
ALTER TABLE candidate_jd_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Staff can view candidate JD links"
  ON candidate_jd_links FOR SELECT
  USING (get_current_user_role() = ANY(ARRAY['STAFFING_MANAGER', 'HR_MANAGER', 'RECRUITER', 'HIRING_MANAGER', 'MANAGEMENT', 'ADMIN']));

CREATE POLICY "Staff can manage candidate JD links"
  ON candidate_jd_links FOR ALL
  USING (get_current_user_role() = ANY(ARRAY['STAFFING_MANAGER', 'HR_MANAGER', 'RECRUITER', 'HIRING_MANAGER', 'ADMIN']));

CREATE POLICY "DEV_MODE_BYPASS_candidate_jd_links"
  ON candidate_jd_links FOR ALL
  USING (true)
  WITH CHECK (true);