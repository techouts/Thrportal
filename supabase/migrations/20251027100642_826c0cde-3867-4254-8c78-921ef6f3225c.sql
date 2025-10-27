-- Fix stuck external JDs that were approved by STAFFING_MANAGER but didn't progress to HR_MANAGER

-- Fix the stuck "Analyst new" external JD
UPDATE jd_approvals 
SET current_step = 2, 
    approval_status = 'in_review',
    updated_at = now()
WHERE id = 'f2581bd9-9bb9-482c-883f-7dc407dcb802';

-- Activate the HR_MANAGER step for "Analyst new"
UPDATE jd_approval_steps
SET assigned_at = now(),
    updated_at = now()
WHERE jd_approval_id = 'f2581bd9-9bb9-482c-883f-7dc407dcb802'
  AND step_number = 2
  AND approver_role = 'HR_MANAGER';

-- Fix the stuck "QA Analysts" external JD
UPDATE jd_approvals 
SET current_step = 2, 
    approval_status = 'in_review',
    updated_at = now()
WHERE id = '23d50119-2481-4818-b41a-c804b068c704';

-- Activate the HR_MANAGER step for "QA Analysts"
UPDATE jd_approval_steps
SET assigned_at = now(),
    updated_at = now()
WHERE jd_approval_id = '23d50119-2481-4818-b41a-c804b068c704'
  AND step_number = 2
  AND approver_role = 'HR_MANAGER';