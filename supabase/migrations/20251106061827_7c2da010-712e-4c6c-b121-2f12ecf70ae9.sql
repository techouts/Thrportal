-- Add policy for staff to view all user roles
CREATE POLICY "Staff can view all user roles"
ON user_roles FOR SELECT
USING (
  get_current_user_role() IN (
    'STAFFING_MANAGER',
    'HR_MANAGER',
    'ADMIN',
    'HIRING_MANAGER',
    'RECRUITER',
    'MANAGEMENT'
  )
);

-- Add policy for staff to view all profiles for assignment purposes
CREATE POLICY "Staff can view all profiles for assignment"
ON profiles FOR SELECT
USING (
  get_current_user_role() IN (
    'STAFFING_MANAGER',
    'HR_MANAGER',
    'ADMIN',
    'HIRING_MANAGER',
    'RECRUITER',
    'MANAGEMENT'
  )
);