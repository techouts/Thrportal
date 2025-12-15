-- Seed historical attendance data for testing (past 30 days)
-- This will create sample attendance records for employee bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb

INSERT INTO attendance_records (employee_id, date, check_in, check_out, break_time, total_hours, status, location, notes)
SELECT 
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
  (CURRENT_DATE - n)::date,
  CASE 
    WHEN n % 10 = 0 THEN '09:25:00'::time  -- Late arrival (3 days)
    WHEN n % 7 = 0 THEN '09:00:00'::time   -- Remote work (2 days)
    ELSE '09:00:00'::time                   -- Regular work (25 days)
  END,
  CASE 
    WHEN n % 10 = 0 THEN '18:15:00'::time
    WHEN n % 7 = 0 THEN '17:50:00'::time
    ELSE '18:00:00'::time
  END,
  30,  -- 30 minutes break
  CASE 
    WHEN n % 10 = 0 THEN 8.33  -- Late days
    WHEN n % 7 = 0 THEN 8.33   -- Remote days
    ELSE 8.50                   -- Regular days
  END,
  CASE 
    WHEN n % 10 = 0 THEN 'late'
    WHEN n % 7 = 0 THEN 'work_from_home'
    ELSE 'present'
  END,
  CASE 
    WHEN n % 7 = 0 THEN 'Remote'
    ELSE 'Office'
  END,
  CASE 
    WHEN n % 10 = 0 THEN 'Traffic delay'
    WHEN n % 7 = 0 THEN 'Working from home'
    ELSE NULL
  END
FROM generate_series(1, 29) AS n
WHERE n NOT IN (6, 13, 20, 27)  -- Skip weekends (4 days)
ON CONFLICT (employee_id, date) DO NOTHING;