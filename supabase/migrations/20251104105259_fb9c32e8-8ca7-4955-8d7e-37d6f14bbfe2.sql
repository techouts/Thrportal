-- Sync dev users to database
-- Insert profiles for all 18 dev users with deterministic UUIDs

INSERT INTO profiles (id, email, first_name, last_name, display_name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin@dev.local', 'Akhil', 'Admin', 'Akhil Admin'),
  ('22222222-2222-2222-2222-222222222222', 'mgmt@dev.local', 'Mona', 'Management', 'Mona Management'),
  ('33333333-3333-3333-3333-333333333333', 'viewer@dev.local', 'Vikas', 'Viewer', 'Vikas Viewer'),
  ('44444444-4444-4444-4444-444444444444', 'manager@dev.local', 'Maya', 'Manager', 'Maya Manager'),
  ('55555555-5555-5555-5555-555555555555', 'employee@dev.local', 'Esha', 'Employee', 'Esha Employee'),
  ('66666666-6666-6666-6666-666666666666', 'recruiter@dev.local', 'Ravi', 'Recruiter', 'Ravi Recruiter'),
  ('77777777-7777-7777-7777-777777777777', 'hiringmgr@dev.local', 'Hari', 'HiringMgr', 'Hari HiringMgr'),
  ('88888888-8888-8888-8888-888888888888', 'staffingmgr@dev.local', 'Sara', 'StaffingMgr', 'Sara StaffingMgr'),
  ('99999999-9999-9999-9999-999999999999', 'pl@dev.local', 'Pooja', 'ProjectLead', 'Pooja ProjectLead'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dh@dev.local', 'Dev', 'DeliveryHead', 'Dev DeliveryHead'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'hrlead@dev.local', 'Hema', 'HR Lead', 'Hema HR Lead'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'hrmgr@dev.local', 'Harsh', 'HR Manager', 'Harsh HR Manager'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'finmgr@dev.local', 'Finn', 'Finance Mgr', 'Finn Finance Mgr'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'payroll@dev.local', 'Pia', 'Payroll', 'Pia Payroll'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'fin@dev.local', 'Farah', 'Finance', 'Farah Finance'),
  ('10101010-1010-1010-1010-101010101010', 'it@dev.local', 'Inder', 'IT', 'Inder IT'),
  ('20202020-2020-2020-2020-202020202020', 'auditor@dev.local', 'Arun', 'Auditor', 'Arun Auditor'),
  ('30303030-3030-3030-3030-303030303030', 'dpo@dev.local', 'Deepa', 'DPO', 'Deepa DPO')
ON CONFLICT (id) DO NOTHING;

-- Insert corresponding roles into user_roles table
INSERT INTO user_roles (user_id, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'ADMIN'),
  ('22222222-2222-2222-2222-222222222222', 'MANAGEMENT'),
  ('33333333-3333-3333-3333-333333333333', 'VIEWER'),
  ('44444444-4444-4444-4444-444444444444', 'MANAGER'),
  ('55555555-5555-5555-5555-555555555555', 'EMPLOYEE'),
  ('66666666-6666-6666-6666-666666666666', 'RECRUITER'),
  ('77777777-7777-7777-7777-777777777777', 'HIRING_MANAGER'),
  ('88888888-8888-8888-8888-888888888888', 'STAFFING_MANAGER'),
  ('99999999-9999-9999-9999-999999999999', 'PROJECT_LEAD'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'DELIVERY_HEAD'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'HR_LEAD'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'HR_MANAGER'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'FINANCE_MANAGER'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'PAYROLL_SPECIALIST'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'FINANCE_ANALYST'),
  ('10101010-1010-1010-1010-101010101010', 'IT_HELPDESK'),
  ('20202020-2020-2020-2020-202020202020', 'AUDITOR_RO'),
  ('30303030-3030-3030-3030-303030303030', 'DPO_PRIVACY')
ON CONFLICT (user_id, role) DO NOTHING;