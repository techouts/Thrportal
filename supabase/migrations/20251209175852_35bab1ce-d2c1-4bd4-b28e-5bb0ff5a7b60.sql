-- Step 1: Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;

-- Step 2: Create a new admin policy using the has_role() function
-- The has_role() function is SECURITY DEFINER and bypasses RLS
CREATE POLICY "Admins can manage all roles"
ON user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'ADMIN'))
WITH CHECK (public.has_role(auth.uid(), 'ADMIN'));