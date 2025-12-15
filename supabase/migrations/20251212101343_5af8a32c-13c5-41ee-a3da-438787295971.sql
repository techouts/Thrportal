-- Add new employment fields to profiles table
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS employee_type text,
  ADD COLUMN IF NOT EXISTS shifts text,
  ADD COLUMN IF NOT EXISTS week_off text,
  ADD COLUMN IF NOT EXISTS leaves_policy text,
  ADD COLUMN IF NOT EXISTS attendance_policy text,
  ADD COLUMN IF NOT EXISTS work_location text;

-- Add comments for documentation
COMMENT ON COLUMN profiles.employee_type IS 'FTE, FTDE (Full-Time Deputy Employee), Intern';
COMMENT ON COLUMN profiles.shifts IS 'Regular, US Shift, Day Light Saving';
COMMENT ON COLUMN profiles.week_off IS 'Sat-Sun Off, Sun Off';
COMMENT ON COLUMN profiles.leaves_policy IS 'Standard, Client Support, Interns';
COMMENT ON COLUMN profiles.attendance_policy IS 'Work from Office, Client Support';
COMMENT ON COLUMN profiles.work_location IS 'Hyderabad, Bangalore';