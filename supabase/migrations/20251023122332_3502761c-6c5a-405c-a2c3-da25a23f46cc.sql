-- Add comprehensive job description fields to jd_approvals table
ALTER TABLE jd_approvals
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS business_unit TEXT,
ADD COLUMN IF NOT EXISTS work_location JSONB DEFAULT '{"city": "", "mode": "Onsite"}'::jsonb,
ADD COLUMN IF NOT EXISTS is_internal BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS short_summary TEXT,
ADD COLUMN IF NOT EXISTS responsibilities JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS required_skills JSONB DEFAULT '{"mustHave": [], "goodToHave": []}'::jsonb,
ADD COLUMN IF NOT EXISTS experience_min INTEGER,
ADD COLUMN IF NOT EXISTS experience_max INTEGER,
ADD COLUMN IF NOT EXISTS positions INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Normal',
ADD COLUMN IF NOT EXISTS resume_deadline DATE,
ADD COLUMN IF NOT EXISTS interview_rounds JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS additional_notes TEXT;

-- Add comments for documentation
COMMENT ON COLUMN jd_approvals.job_title IS 'Job title/position name';
COMMENT ON COLUMN jd_approvals.department IS 'Department for the position';
COMMENT ON COLUMN jd_approvals.business_unit IS 'Business unit';
COMMENT ON COLUMN jd_approvals.work_location IS 'JSON object with city and mode (Onsite/Remote/Hybrid)';
COMMENT ON COLUMN jd_approvals.is_internal IS 'Flag for internal vs external position';
COMMENT ON COLUMN jd_approvals.short_summary IS 'Brief job summary';
COMMENT ON COLUMN jd_approvals.responsibilities IS 'Array of job responsibilities';
COMMENT ON COLUMN jd_approvals.required_skills IS 'JSON object with mustHave and goodToHave skill arrays';
COMMENT ON COLUMN jd_approvals.experience_min IS 'Minimum years of experience required';
COMMENT ON COLUMN jd_approvals.experience_max IS 'Maximum years of experience';
COMMENT ON COLUMN jd_approvals.positions IS 'Number of positions to fill';
COMMENT ON COLUMN jd_approvals.priority IS 'Priority level: Critical, High, Normal';
COMMENT ON COLUMN jd_approvals.resume_deadline IS 'Deadline for resume submissions';
COMMENT ON COLUMN jd_approvals.interview_rounds IS 'Array of interview round descriptions';
COMMENT ON COLUMN jd_approvals.additional_notes IS 'Additional notes/comments';