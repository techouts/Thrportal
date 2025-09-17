-- First check if there's any authenticated user and insert a profile for them
-- If no users exist, this will do nothing
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
)
SELECT 
  u.id,
  u.email,
  'Admin',
  'User',
  'Admin User',
  'ADMIN',
  'IT',
  'Technology',
  true
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
LIMIT 1;