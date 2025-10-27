-- Fix the stuck Python Analyst JD
UPDATE jd_approvals 
SET current_step = 2, 
    approval_status = 'in_review',
    updated_at = now()
WHERE id = '43af93b1-4f6a-432f-bfb6-104d98868486';

-- Activate the HR_MANAGER step
UPDATE jd_approval_steps
SET assigned_at = now(),
    updated_at = now()
WHERE jd_approval_id = '43af93b1-4f6a-432f-bfb6-104d98868486'
  AND step_number = 2
  AND approver_role = 'HR_MANAGER';