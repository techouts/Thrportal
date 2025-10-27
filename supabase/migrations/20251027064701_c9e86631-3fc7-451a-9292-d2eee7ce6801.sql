-- Fix stuck external JD that was approved by STAFFING_MANAGER but didn't advance to HR_MANAGER
UPDATE jd_approvals 
SET current_step = 2, 
    updated_at = now()
WHERE id = 'a244f12d-df51-463c-ba54-08dc1d50d036'
  AND current_step = 1;

-- Activate the HR_MANAGER step by setting assigned_at
UPDATE jd_approval_steps 
SET assigned_at = now(), 
    updated_at = now()
WHERE jd_approval_id = 'a244f12d-df51-463c-ba54-08dc1d50d036' 
  AND step_number = 2 
  AND approver_role = 'HR_MANAGER'
  AND assigned_at IS NULL;