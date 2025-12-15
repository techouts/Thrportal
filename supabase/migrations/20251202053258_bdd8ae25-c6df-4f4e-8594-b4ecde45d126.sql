-- Populate missing profile data for all 18 users with role_title, date_of_joining, band, and manager hierarchy

-- Admin (no manager, highest band)
UPDATE profiles SET 
  role_title = 'System Administrator',
  date_of_joining = '2019-01-15',
  band = 'A1',
  manager_employee_id = NULL
WHERE role = 'ADMIN';

-- HR Lead (reports to Admin)
UPDATE profiles SET 
  role_title = 'Head of Human Resources',
  date_of_joining = '2019-06-01',
  band = 'A2',
  manager_employee_id = (SELECT id FROM profiles WHERE role = 'ADMIN' LIMIT 1)
WHERE role = 'HR_LEAD';

-- HR Manager (reports to HR Lead)
UPDATE profiles SET 
  role_title = 'HR Manager',
  date_of_joining = '2020-03-15',
  band = 'B1',
  manager_employee_id = (SELECT id FROM profiles WHERE role = 'HR_LEAD' LIMIT 1)
WHERE role = 'HR_MANAGER';

-- Recruiter (reports to HR Manager)
UPDATE profiles SET 
  role_title = 'Senior Recruiter',
  date_of_joining = '2021-07-10',
  band = 'B2',
  manager_employee_id = (SELECT id FROM profiles WHERE role = 'HR_MANAGER' LIMIT 1)
WHERE role = 'RECRUITER';

-- Staffing Manager (reports to HR Lead)
UPDATE profiles SET 
  role_title = 'Staffing Operations Manager',
  date_of_joining = '2020-09-01',
  band = 'B1',
  manager_employee_id = (SELECT id FROM profiles WHERE role = 'HR_LEAD' LIMIT 1)
WHERE role = 'STAFFING_MANAGER';

-- Hiring Manager (reports to Staffing Manager)
UPDATE profiles SET 
  role_title = 'Technical Hiring Manager',
  date_of_joining = '2021-02-20',
  band = 'B2',
  manager_employee_id = (SELECT id FROM profiles WHERE role = 'STAFFING_MANAGER' LIMIT 1)
WHERE role = 'HIRING_MANAGER';

-- Delivery Head (reports to Admin)
UPDATE profiles SET 
  role_title = 'Head of Delivery',
  date_of_joining = '2019-08-10',
  band = 'A2',
  manager_employee_id = (SELECT id FROM profiles WHERE role = 'ADMIN' LIMIT 1)
WHERE role = 'DELIVERY_HEAD';

-- Project Lead (reports to Delivery Head)
UPDATE profiles SET 
  role_title = 'Senior Project Lead',
  date_of_joining = '2020-11-05',
  band = 'B1',
  manager_employee_id = (SELECT id FROM profiles WHERE role = 'DELIVERY_HEAD' LIMIT 1)
WHERE role = 'PROJECT_LEAD';

-- Employee (reports to Project Lead)
UPDATE profiles SET 
  role_title = 'Software Engineer',
  date_of_joining = '2022-04-18',
  band = 'B3',
  manager_employee_id = (SELECT id FROM profiles WHERE role = 'PROJECT_LEAD' LIMIT 1)
WHERE role = 'EMPLOYEE';

-- Finance Manager (reports to Admin)
UPDATE profiles SET 
  role_title = 'Finance Manager',
  date_of_joining = '2020-01-20',
  band = 'B1',
  manager_employee_id = (SELECT id FROM profiles WHERE role = 'ADMIN' LIMIT 1)
WHERE role = 'FINANCE_MANAGER';

-- Payroll (reports to Finance Manager)
UPDATE profiles SET 
  role_title = 'Payroll Specialist',
  date_of_joining = '2021-05-12',
  band = 'B2',
  manager_employee_id = (SELECT id FROM profiles WHERE role = 'FINANCE_MANAGER' LIMIT 1)
WHERE role = 'PAYROLL';

-- Finance (reports to Finance Manager)
UPDATE profiles SET 
  role_title = 'Finance Analyst',
  date_of_joining = '2021-09-30',
  band = 'B3',
  manager_employee_id = (SELECT id FROM profiles WHERE role = 'FINANCE_MANAGER' LIMIT 1)
WHERE role = 'FINANCE';

-- Management (reports to Admin)
UPDATE profiles SET 
  role_title = 'Senior Management',
  date_of_joining = '2019-04-01',
  band = 'A2',
  manager_employee_id = (SELECT id FROM profiles WHERE role = 'ADMIN' LIMIT 1)
WHERE role = 'MANAGEMENT';

-- Interviewer (reports to Hiring Manager)
UPDATE profiles SET 
  role_title = 'Technical Interviewer',
  date_of_joining = '2022-01-15',
  band = 'B2',
  manager_employee_id = (SELECT id FROM profiles WHERE role = 'HIRING_MANAGER' LIMIT 1)
WHERE role = 'INTERVIEWER';

-- Sales (reports to Admin)
UPDATE profiles SET 
  role_title = 'Sales Executive',
  date_of_joining = '2021-11-08',
  band = 'B2',
  manager_employee_id = (SELECT id FROM profiles WHERE role = 'ADMIN' LIMIT 1)
WHERE role = 'SALES';

-- Business Dev (reports to Admin)
UPDATE profiles SET 
  role_title = 'Business Development Manager',
  date_of_joining = '2020-07-22',
  band = 'B1',
  manager_employee_id = (SELECT id FROM profiles WHERE role = 'ADMIN' LIMIT 1)
WHERE role = 'BUSINESS_DEV';

-- Account Manager (reports to Delivery Head)
UPDATE profiles SET 
  role_title = 'Senior Account Manager',
  date_of_joining = '2021-03-10',
  band = 'B2',
  manager_employee_id = (SELECT id FROM profiles WHERE role = 'DELIVERY_HEAD' LIMIT 1)
WHERE role = 'ACCOUNT_MANAGER';

-- Compliance (reports to Admin)
UPDATE profiles SET 
  role_title = 'Compliance Officer',
  date_of_joining = '2020-12-01',
  band = 'B2',
  manager_employee_id = (SELECT id FROM profiles WHERE role = 'ADMIN' LIMIT 1)
WHERE role = 'COMPLIANCE';