-- Drop circular dependency policies on user_roles
DROP POLICY IF EXISTS "Staff can view all user roles" ON user_roles;

-- Drop circular dependency policies on profiles
DROP POLICY IF EXISTS "Staff can view all profiles for assignment" ON profiles;
DROP POLICY IF EXISTS "HR and Admin can view all profiles" ON profiles;

-- Temporary: Allow all authenticated users to view user_roles
-- This bypasses the circular dependency during development
CREATE POLICY "temp_dev_allow_authenticated_view_user_roles"
ON user_roles FOR SELECT
TO authenticated
USING (true);

-- Temporary: Allow all authenticated users to view profiles
-- This bypasses the circular dependency during development
CREATE POLICY "temp_dev_allow_authenticated_view_profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);