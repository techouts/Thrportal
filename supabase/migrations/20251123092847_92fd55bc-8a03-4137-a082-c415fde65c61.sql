-- TEMPORARY DEVELOPMENT BYPASS FOR APPLICATIONS RLS
-- WARNING: This is for development only. DO NOT deploy to production.

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Staff can create applications" ON applications;
DROP POLICY IF EXISTS "Staff can update applications" ON applications;
DROP POLICY IF EXISTS "Staff can view all applications" ON applications;

-- Create permissive development policies
CREATE POLICY "DEV: Allow all select on applications"
  ON applications
  FOR SELECT
  USING (true);

CREATE POLICY "DEV: Allow all insert on applications"
  ON applications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "DEV: Allow all update on applications"
  ON applications
  FOR UPDATE
  USING (true);