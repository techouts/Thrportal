-- Migrate attendance records from dev mock user to actual Supabase user
UPDATE attendance_records 
SET employee_id = 'fd017bbb-a24e-45fd-bf6c-6cc8e71279df'
WHERE employee_id = '11111111-1111-1111-1111-111111111111';

-- Migrate timesheets from dev mock user to actual Supabase user
UPDATE timesheets 
SET employee_id = 'fd017bbb-a24e-45fd-bf6c-6cc8e71279df'
WHERE employee_id = '11111111-1111-1111-1111-111111111111';