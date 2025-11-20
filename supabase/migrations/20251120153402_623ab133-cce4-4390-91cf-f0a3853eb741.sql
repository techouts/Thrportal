-- Create RPC function to get manager profiles with STAFFING_MANAGER or HR_MANAGER roles
CREATE OR REPLACE FUNCTION public.get_manager_profiles()
RETURNS TABLE(
  id UUID,
  display_name TEXT,
  first_name TEXT,
  last_name TEXT,
  role app_role
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.display_name,
    p.first_name,
    p.last_name,
    ur.role
  FROM profiles p
  INNER JOIN user_roles ur ON ur.user_id = p.id
  WHERE ur.role IN ('STAFFING_MANAGER', 'HR_MANAGER')
  ORDER BY p.display_name NULLS LAST;
$$;