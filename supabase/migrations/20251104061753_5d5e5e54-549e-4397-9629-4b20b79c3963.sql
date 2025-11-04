-- Function to automatically update JD approval status based on approval steps
CREATE OR REPLACE FUNCTION update_jd_approval_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE jd_approvals
  SET approval_status = (
    CASE
      -- If any step is rejected, mark as rejected
      WHEN EXISTS (
        SELECT 1 FROM jd_approval_steps
        WHERE jd_approval_id = NEW.jd_approval_id
        AND status = 'rejected'
      ) THEN 'rejected'
      -- If all steps are approved, mark as approved
      WHEN NOT EXISTS (
        SELECT 1 FROM jd_approval_steps
        WHERE jd_approval_id = NEW.jd_approval_id
        AND status != 'approved'
      ) AND EXISTS (
        SELECT 1 FROM jd_approval_steps
        WHERE jd_approval_id = NEW.jd_approval_id
      ) THEN 'approved'
      -- If some steps are approved but not all, mark as in_review
      WHEN EXISTS (
        SELECT 1 FROM jd_approval_steps
        WHERE jd_approval_id = NEW.jd_approval_id
        AND status = 'approved'
      ) THEN 'in_review'
      -- Otherwise keep as pending
      ELSE 'pending'
    END
  ),
  updated_at = now()
  WHERE id = NEW.jd_approval_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on approval steps to auto-update parent approval status
CREATE TRIGGER update_approval_status_trigger
AFTER INSERT OR UPDATE OF status ON jd_approval_steps
FOR EACH ROW
EXECUTE FUNCTION update_jd_approval_status();

-- Fix existing data: Update JDs where all steps are approved
UPDATE jd_approvals ja
SET approval_status = 'approved',
    updated_at = now()
WHERE NOT EXISTS (
  SELECT 1 FROM jd_approval_steps jas
  WHERE jas.jd_approval_id = ja.id
  AND jas.status != 'approved'
)
AND EXISTS (
  SELECT 1 FROM jd_approval_steps jas
  WHERE jas.jd_approval_id = ja.id
)
AND ja.approval_status != 'approved';

-- Fix existing data: Update JDs where any step is rejected
UPDATE jd_approvals ja
SET approval_status = 'rejected',
    updated_at = now()
WHERE EXISTS (
  SELECT 1 FROM jd_approval_steps jas
  WHERE jas.jd_approval_id = ja.id
  AND jas.status = 'rejected'
)
AND ja.approval_status != 'rejected';

-- Fix existing data: Update JDs that are in review (some steps approved)
UPDATE jd_approvals ja
SET approval_status = 'in_review',
    updated_at = now()
WHERE EXISTS (
  SELECT 1 FROM jd_approval_steps jas
  WHERE jas.jd_approval_id = ja.id
  AND jas.status = 'approved'
)
AND EXISTS (
  SELECT 1 FROM jd_approval_steps jas
  WHERE jas.jd_approval_id = ja.id
  AND jas.status != 'approved'
)
AND ja.approval_status != 'in_review';