-- Insert some test profiles for dev users if they don't exist
-- Using proper UUID format with gen_random_uuid()
INSERT INTO public.profiles (id, email, first_name, last_name, display_name, role, is_active)
SELECT 
  gen_random_uuid(),
  email,
  first_name,
  last_name,
  display_name,
  role,
  is_active
FROM (VALUES 
  ('john.smith@thr.com', 'John', 'Smith', 'John Smith', 'EMPLOYEE', true),
  ('sarah.johnson@thr.com', 'Sarah', 'Johnson', 'Sarah Johnson', 'EMPLOYEE', true),
  ('michael.chen@thr.com', 'Michael', 'Chen', 'Michael Chen', 'MANAGER', true),
  ('emily.davis@thr.com', 'Emily', 'Davis', 'Emily Davis', 'MANAGER', true),
  ('david.wilson@thr.com', 'David', 'Wilson', 'David Wilson', 'HR_MANAGER', true),
  ('amanda.rodriguez@thr.com', 'Amanda', 'Rodriguez', 'Amanda Rodriguez', 'ADMIN', true),
  ('demo@company.com', 'Demo', 'User', 'Demo User', 'MANAGER', true)
) AS dev_users(email, first_name, last_name, display_name, role, is_active)
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE profiles.email = dev_users.email
);