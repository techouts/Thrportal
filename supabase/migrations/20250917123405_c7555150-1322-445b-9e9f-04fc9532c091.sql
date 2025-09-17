-- Insert a sample admin profile for development/testing
-- This will allow the authenticated user to access interview slots data
INSERT INTO public.profiles (
  id,
  email,
  first_name,
  last_name,
  display_name,
  role,
  department,
  business_unit,
  is_active
) VALUES (
  '6b6dc436-b373-45c8-857e-cf01a4932e47'::uuid,
  'admin@dev.local',
  'Admin',
  'User',
  'Admin User',
  'ADMIN',
  'IT',
  'Technology',
  true
) ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  email = EXCLUDED.email,
  display_name = EXCLUDED.display_name,
  department = EXCLUDED.department,
  business_unit = EXCLUDED.business_unit,
  updated_at = now();