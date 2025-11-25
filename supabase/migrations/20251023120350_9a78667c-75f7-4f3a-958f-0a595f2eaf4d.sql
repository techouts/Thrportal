-- Add new columns to jd_approvals table
ALTER TABLE jd_approvals 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Draft',
ADD COLUMN IF NOT EXISTS approver_names TEXT[], 
ADD COLUMN IF NOT EXISTS target_date DATE,
ADD COLUMN IF NOT EXISTS job_type TEXT,
ADD COLUMN IF NOT EXISTS pay_type TEXT,
ADD COLUMN IF NOT EXISTS ctc_monthly_min NUMERIC,
ADD COLUMN IF NOT EXISTS ctc_monthly_max NUMERIC,
ADD COLUMN IF NOT EXISTS ctc_annual_min NUMERIC,
ADD COLUMN IF NOT EXISTS ctc_annual_max NUMERIC,
ADD COLUMN IF NOT EXISTS contract_period_months INTEGER,
ADD COLUMN IF NOT EXISTS employment_type TEXT;

-- Add check constraints
ALTER TABLE jd_approvals 
ADD CONSTRAINT jd_approvals_status_check 
CHECK (status IN ('Active', 'Draft', 'Closed', 'On Hold', 'Cancelled', 'Target Date Expired'));

ALTER TABLE jd_approvals 
ADD CONSTRAINT jd_approvals_job_type_check 
CHECK (job_type IN ('Permanent', 'Contract', 'C2H', 'Full-time') OR job_type IS NULL);

ALTER TABLE jd_approvals 
ADD CONSTRAINT jd_approvals_pay_type_check 
CHECK (pay_type IN ('Monthly', 'Annually') OR pay_type IS NULL);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_jd_approvals_status ON jd_approvals(status);
CREATE INDEX IF NOT EXISTS idx_jd_approvals_target_date ON jd_approvals(target_date);

-- Function to get approver names from approval chain
CREATE OR REPLACE FUNCTION get_approver_names_from_chain()
RETURNS TEXT[] AS $$
DECLARE
  approver_list TEXT[] := ARRAY[]::TEXT[];
  chain_step JSONB;
  approval_rule RECORD;
BEGIN
  SELECT approval_chain INTO approval_rule
  FROM approval_rules
  WHERE is_active = true 
  LIMIT 1;

  IF approval_rule.approval_chain IS NOT NULL THEN
    FOR chain_step IN SELECT * FROM jsonb_array_elements(approval_rule.approval_chain)
    LOOP
      approver_list := array_append(approver_list, chain_step->>'role');
    END LOOP;
  END IF;

  RETURN approver_list;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update existing records with default values
UPDATE jd_approvals
SET 
  status = CASE 
    WHEN submitted_at IS NOT NULL THEN 'Active'
    ELSE 'Draft'
  END,
  approver_names = COALESCE(approver_names, get_approver_names_from_chain()),
  job_type = COALESCE(job_type, 'Full-time'),
  pay_type = COALESCE(pay_type, 'Annually'),
  ctc_annual_min = COALESCE(ctc_annual_min, salary_band_min),
  ctc_annual_max = COALESCE(ctc_annual_max, salary_band_max),
  ctc_monthly_min = COALESCE(ctc_monthly_min, salary_band_min / 12),
  ctc_monthly_max = COALESCE(ctc_monthly_max, salary_band_max / 12),
  employment_type = COALESCE(employment_type, 'Full-time')
WHERE status IS NULL;