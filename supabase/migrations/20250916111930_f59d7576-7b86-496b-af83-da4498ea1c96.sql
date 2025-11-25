-- Create function to get current user role for RLS policies
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'EMPLOYEE'
  );
$$;

-- Ensure profiles table has proper structure for authentication
ALTER TABLE public.profiles 
ALTER COLUMN email SET NOT NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Insert some test profiles for dev users if they don't exist
INSERT INTO public.profiles (id, email, first_name, last_name, display_name, role, is_active)
VALUES 
  ('dev-john.smith@thr.com', 'john.smith@thr.com', 'John', 'Smith', 'John Smith', 'EMPLOYEE', true),
  ('dev-sarah.johnson@thr.com', 'sarah.johnson@thr.com', 'Sarah', 'Johnson', 'Sarah Johnson', 'EMPLOYEE', true),
  ('dev-michael.chen@thr.com', 'michael.chen@thr.com', 'Michael', 'Chen', 'Michael Chen', 'MANAGER', true),
  ('dev-emily.davis@thr.com', 'emily.davis@thr.com', 'Emily', 'Davis', 'Emily Davis', 'MANAGER', true),
  ('dev-david.wilson@thr.com', 'david.wilson@thr.com', 'David', 'Wilson', 'David Wilson', 'HR_MANAGER', true),
  ('dev-amanda.rodriguez@thr.com', 'amanda.rodriguez@thr.com', 'Amanda', 'Rodriguez', 'Amanda Rodriguez', 'ADMIN', true),
  ('dev-demo@company.com', 'demo@company.com', 'Demo', 'User', 'Demo User', 'MANAGER', true)
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  display_name = EXCLUDED.display_name,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  is_active = EXCLUDED.is_active;