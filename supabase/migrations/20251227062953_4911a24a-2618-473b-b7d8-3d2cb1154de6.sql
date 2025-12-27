-- Add OPERATIONS_HR to app_role enum if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'OPERATIONS_HR' AND enumtypid = 'app_role'::regtype) THEN
    ALTER TYPE app_role ADD VALUE 'OPERATIONS_HR';
  END IF;
END $$;

-- Update get_current_user_role function to include OPERATIONS_HR in priority order
CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role::text 
  FROM public.user_roles 
  WHERE user_id = auth.uid() 
  ORDER BY 
    CASE role
      WHEN 'ADMIN' THEN 1
      WHEN 'MANAGEMENT' THEN 2
      WHEN 'FINANCE_MANAGER' THEN 3
      WHEN 'STAFFING_MANAGER' THEN 4
      WHEN 'HR_MANAGER' THEN 5
      WHEN 'OPERATIONS_HR' THEN 6
      ELSE 99
    END
  LIMIT 1
$function$;

-- Insert user_roles entry for OPERATIONS_HR user (opshr@dev.local)
INSERT INTO public.user_roles (user_id, role)
VALUES ('544b4c1c-c390-4d44-bf39-eb02c00aabf9', 'OPERATIONS_HR')
ON CONFLICT (user_id, role) DO NOTHING;