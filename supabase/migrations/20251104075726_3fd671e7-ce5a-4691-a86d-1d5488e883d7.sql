-- Drop foreign key constraints for demo/test purposes
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

-- Insert test recruiter profiles
INSERT INTO profiles (id, display_name, first_name, last_name, email, is_active)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Sara StaffingMgr', 'Sara', 'StaffingMgr', 'sara.staffingmgr@demo.com', true),
  ('22222222-2222-2222-2222-222222222222', 'Hari HiringMgr', 'Hari', 'HiringMgr', 'hari.hiringmgr@demo.com', true),
  ('33333333-3333-3333-3333-333333333333', 'Ravi Recruiter', 'Ravi', 'Recruiter', 'ravi.recruiter@demo.com', true);

-- Assign roles to the test users
INSERT INTO user_roles (user_id, role)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'STAFFING_MANAGER'),
  ('22222222-2222-2222-2222-222222222222', 'HIRING_MANAGER'),
  ('33333333-3333-3333-3333-333333333333', 'RECRUITER');