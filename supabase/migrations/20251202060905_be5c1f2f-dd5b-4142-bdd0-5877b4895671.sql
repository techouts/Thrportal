-- Fix manager hierarchy and profile data using direct UUID references

-- Admin (no manager, already correct)
UPDATE profiles SET 
  role_title = 'System Administrator',
  band = 'A3',
  date_of_joining = '2020-01-15',
  notice_period = '3 months'
WHERE id = '80e1c9ce-49f1-415e-84eb-3f78d9c6c0be';

-- HR Lead → reports to Admin
UPDATE profiles SET 
  role_title = 'HR Lead',
  band = 'A2',
  date_of_joining = '2020-06-01',
  notice_period = '3 months',
  manager_employee_id = '80e1c9ce-49f1-415e-84eb-3f78d9c6c0be'
WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

-- HR Manager → reports to HR Lead
UPDATE profiles SET 
  role_title = 'HR Manager',
  band = 'B1',
  date_of_joining = '2021-03-15',
  notice_period = '2 months',
  manager_employee_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
WHERE id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

-- Recruiter → reports to HR Manager
UPDATE profiles SET 
  role_title = 'Senior Recruiter',
  band = 'C1',
  date_of_joining = '2022-01-10',
  notice_period = '1 month',
  manager_employee_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'
WHERE id = '33333333-3333-3333-3333-333333333333';

-- Staffing Manager → reports to HR Lead
UPDATE profiles SET 
  role_title = 'Staffing Manager',
  band = 'B1',
  date_of_joining = '2021-02-01',
  notice_period = '2 months',
  manager_employee_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
WHERE id = '11111111-1111-1111-1111-111111111111';

-- Hiring Manager → reports to Staffing Manager
UPDATE profiles SET 
  role_title = 'Hiring Manager',
  band = 'B2',
  date_of_joining = '2021-08-15',
  notice_period = '2 months',
  manager_employee_id = '11111111-1111-1111-1111-111111111111'
WHERE id = '22222222-2222-2222-2222-222222222222';

-- Delivery Head → reports to Admin
UPDATE profiles SET 
  role_title = 'Delivery Head',
  band = 'A2',
  date_of_joining = '2020-04-01',
  notice_period = '3 months',
  manager_employee_id = '80e1c9ce-49f1-415e-84eb-3f78d9c6c0be'
WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- Project Lead → reports to Delivery Head
UPDATE profiles SET 
  role_title = 'Project Lead',
  band = 'B1',
  date_of_joining = '2021-07-01',
  notice_period = '2 months',
  manager_employee_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
WHERE id = '99999999-9999-9999-9999-999999999999';

-- Employee → reports to Project Lead
UPDATE profiles SET 
  role_title = 'Software Engineer',
  band = 'C1',
  date_of_joining = '2022-09-01',
  notice_period = '1 month',
  manager_employee_id = '99999999-9999-9999-9999-999999999999'
WHERE id = '55555555-5555-5555-5555-555555555555';

-- Finance Manager → reports to Admin
UPDATE profiles SET 
  role_title = 'Finance Manager',
  band = 'A2',
  date_of_joining = '2020-03-01',
  notice_period = '3 months',
  manager_employee_id = '80e1c9ce-49f1-415e-84eb-3f78d9c6c0be'
WHERE id = 'dddddddd-dddd-dddd-dddd-dddddddddddd';

-- Payroll → reports to Finance Manager
UPDATE profiles SET 
  role_title = 'Payroll Specialist',
  band = 'C1',
  date_of_joining = '2021-11-01',
  notice_period = '1 month',
  manager_employee_id = 'dddddddd-dddd-dddd-dddd-dddddddddddd'
WHERE id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

-- Finance → reports to Finance Manager
UPDATE profiles SET 
  role_title = 'Finance Analyst',
  band = 'C1',
  date_of_joining = '2022-02-15',
  notice_period = '1 month',
  manager_employee_id = 'dddddddd-dddd-dddd-dddd-dddddddddddd'
WHERE id = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

-- Manager → reports to Admin
UPDATE profiles SET 
  role_title = 'Department Manager',
  band = 'B1',
  date_of_joining = '2021-05-01',
  notice_period = '2 months',
  manager_employee_id = '80e1c9ce-49f1-415e-84eb-3f78d9c6c0be'
WHERE id = '44444444-4444-4444-4444-444444444444';

-- IT → reports to Admin
UPDATE profiles SET 
  role_title = 'IT Administrator',
  band = 'B2',
  date_of_joining = '2020-09-01',
  notice_period = '2 months',
  manager_employee_id = '80e1c9ce-49f1-415e-84eb-3f78d9c6c0be'
WHERE id = '10101010-1010-1010-1010-101010101010';

-- Auditor → reports to Admin
UPDATE profiles SET 
  role_title = 'Compliance Auditor',
  band = 'B2',
  date_of_joining = '2021-01-15',
  notice_period = '2 months',
  manager_employee_id = '80e1c9ce-49f1-415e-84eb-3f78d9c6c0be'
WHERE id = '20202020-2020-2020-2020-202020202020';

-- DPO → reports to Admin
UPDATE profiles SET 
  role_title = 'Data Protection Officer',
  band = 'A2',
  date_of_joining = '2020-07-01',
  notice_period = '3 months',
  manager_employee_id = '80e1c9ce-49f1-415e-84eb-3f78d9c6c0be'
WHERE id = '30303030-3030-3030-3030-303030303030';

-- Support → reports to Admin
UPDATE profiles SET 
  role_title = 'Support Specialist',
  band = 'C1',
  date_of_joining = '2022-04-01',
  notice_period = '1 month',
  manager_employee_id = '80e1c9ce-49f1-415e-84eb-3f78d9c6c0be'
WHERE id = '40404040-4040-4040-4040-404040404040';

-- DevOps → reports to Admin
UPDATE profiles SET 
  role_title = 'DevOps Engineer',
  band = 'B2',
  date_of_joining = '2021-10-01',
  notice_period = '2 months',
  manager_employee_id = '80e1c9ce-49f1-415e-84eb-3f78d9c6c0be'
WHERE id = '50505050-5050-5050-5050-505050505050';