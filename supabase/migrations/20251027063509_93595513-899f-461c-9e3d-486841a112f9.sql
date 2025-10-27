-- Fix existing external JDs with incorrect approval_status
-- Update 'pending' to 'in_review' for active external JDs to ensure they appear in External Approvals tab

UPDATE jd_approvals 
SET approval_status = 'in_review',
    updated_at = now()
WHERE is_internal = false 
  AND status = 'Active' 
  AND approval_status = 'pending';

-- Add comment for clarity
COMMENT ON COLUMN jd_approvals.approval_status IS 'Approval workflow status: NULL (draft), in_review (active approval), approved (fully approved), rejected (rejected at any step)';