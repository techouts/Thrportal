-- Phase 1: Fix JDs where MANAGEMENT has approved but workflow didn't advance

-- Fix jd_approvals table: update current_step and approval_status
UPDATE jd_approvals ja
SET 
  current_step = 2,
  approval_status = 'in_review',
  updated_at = now()
WHERE ja.is_internal = true
  AND ja.status = 'Active'
  AND ja.current_step = 1
  AND ja.approval_status = 'pending'
  AND EXISTS (
    SELECT 1 FROM jd_approval_steps jas
    WHERE jas.jd_approval_id = ja.id
      AND jas.step_number = 1
      AND jas.approver_role = 'MANAGEMENT'
      AND jas.status = 'approved'
      AND jas.completed_at IS NOT NULL
  )
  AND EXISTS (
    SELECT 1 FROM jd_approval_steps jas2
    WHERE jas2.jd_approval_id = ja.id
      AND jas2.step_number = 2
      AND jas2.approver_role = 'HR_MANAGER'
      AND jas2.status = 'pending'
  );

-- Activate the HR_MANAGER step by setting assigned_at
UPDATE jd_approval_steps jas
SET 
  assigned_at = now(),
  updated_at = now()
WHERE jas.jd_approval_id IN (
  SELECT ja.id 
  FROM jd_approvals ja
  WHERE ja.is_internal = true
    AND ja.status = 'Active'
    AND ja.current_step = 2
    AND ja.approval_status = 'in_review'
)
AND jas.step_number = 2
AND jas.approver_role = 'HR_MANAGER'
AND jas.status = 'pending'
AND jas.assigned_at IS NULL;