-- Add new columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_joining DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notice_period TEXT DEFAULT '3 months';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS band TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS personal_email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS temporary_address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS permanent_address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS alternate_phone TEXT;

-- Update all 18 profiles with complete data
-- Admin (Top level)
UPDATE profiles SET 
  role_title = 'Chief Technology Officer',
  date_of_joining = '2020-01-15',
  notice_period = '3 months',
  band = 'A1',
  personal_email = 'admin.personal@gmail.com',
  temporary_address = '123 Tech Street, Bangalore',
  permanent_address = '456 Permanent Avenue, Mumbai',
  alternate_phone = '+919876543210',
  manager_employee_id = NULL
WHERE email = 'admin@demo.com';

-- HR Lead (Reports to Admin)
UPDATE profiles SET 
  role_title = 'HR Lead',
  date_of_joining = '2020-03-10',
  notice_period = '3 months',
  band = 'A2',
  personal_email = 'hrlead.personal@gmail.com',
  temporary_address = '234 HR Colony, Bangalore',
  permanent_address = '567 Permanent Street, Delhi',
  alternate_phone = '+919876543211',
  manager_employee_id = (SELECT id FROM profiles WHERE email = 'admin@demo.com')
WHERE email = 'hr_lead@demo.com';

-- Delivery Head (Reports to Admin)
UPDATE profiles SET 
  role_title = 'Delivery Head',
  date_of_joining = '2020-02-20',
  notice_period = '3 months',
  band = 'A2',
  personal_email = 'deliveryhead.personal@gmail.com',
  temporary_address = '345 Delivery Lane, Hyderabad',
  permanent_address = '678 Permanent Road, Chennai',
  alternate_phone = '+919876543212',
  manager_employee_id = (SELECT id FROM profiles WHERE email = 'admin@demo.com')
WHERE email = 'delivery_head@demo.com';

-- Finance Manager (Reports to Admin)
UPDATE profiles SET 
  role_title = 'Finance Manager',
  date_of_joining = '2020-04-05',
  notice_period = '3 months',
  band = 'A2',
  personal_email = 'financemanager.personal@gmail.com',
  temporary_address = '456 Finance Park, Pune',
  permanent_address = '789 Permanent Court, Mumbai',
  alternate_phone = '+919876543213',
  manager_employee_id = (SELECT id FROM profiles WHERE email = 'admin@demo.com')
WHERE email = 'finance_manager@demo.com';

-- HR Manager (Reports to HR Lead)
UPDATE profiles SET 
  role_title = 'HR Manager',
  date_of_joining = '2020-06-15',
  notice_period = '3 months',
  band = 'B1',
  personal_email = 'hrmanager.personal@gmail.com',
  temporary_address = '567 HR Apartments, Bangalore',
  permanent_address = '890 Permanent Plaza, Kolkata',
  alternate_phone = '+919876543214',
  manager_employee_id = (SELECT id FROM profiles WHERE email = 'hr_lead@demo.com')
WHERE email = 'hr_manager@demo.com';

-- Staffing Manager (Reports to HR Lead)
UPDATE profiles SET 
  role_title = 'Staffing Manager',
  date_of_joining = '2020-07-20',
  notice_period = '3 months',
  band = 'B1',
  personal_email = 'staffingmanager.personal@gmail.com',
  temporary_address = '678 Staffing Complex, Bangalore',
  permanent_address = '901 Permanent Tower, Delhi',
  alternate_phone = '+919876543215',
  manager_employee_id = (SELECT id FROM profiles WHERE email = 'hr_lead@demo.com')
WHERE email = 'staffing_manager@demo.com';

-- Project Lead (Reports to Delivery Head)
UPDATE profiles SET 
  role_title = 'Project Lead',
  date_of_joining = '2020-08-10',
  notice_period = '3 months',
  band = 'B1',
  personal_email = 'projectlead.personal@gmail.com',
  temporary_address = '789 Project Heights, Hyderabad',
  permanent_address = '012 Permanent Estate, Chennai',
  alternate_phone = '+919876543216',
  manager_employee_id = (SELECT id FROM profiles WHERE email = 'delivery_head@demo.com')
WHERE email = 'project_lead@demo.com';

-- Recruiter (Reports to HR Manager)
UPDATE profiles SET 
  role_title = 'Senior Recruiter',
  date_of_joining = '2021-01-15',
  notice_period = '3 months',
  band = 'B2',
  personal_email = 'recruiter.personal@gmail.com',
  temporary_address = '890 Recruiter Residency, Bangalore',
  permanent_address = '123 Permanent Gardens, Mumbai',
  alternate_phone = '+919876543217',
  manager_employee_id = (SELECT id FROM profiles WHERE email = 'hr_manager@demo.com')
WHERE email = 'recruiter@demo.com';

-- Hiring Manager (Reports to Staffing Manager)
UPDATE profiles SET 
  role_title = 'Hiring Manager',
  date_of_joining = '2021-02-20',
  notice_period = '3 months',
  band = 'B2',
  personal_email = 'hiringmanager.personal@gmail.com',
  temporary_address = '901 Hiring Hub, Bangalore',
  permanent_address = '234 Permanent Villas, Delhi',
  alternate_phone = '+919876543218',
  manager_employee_id = (SELECT id FROM profiles WHERE email = 'staffing_manager@demo.com')
WHERE email = 'hiring_manager@demo.com';

-- Employee (Reports to Project Lead)
UPDATE profiles SET 
  role_title = 'Software Engineer',
  date_of_joining = '2021-05-10',
  notice_period = '3 months',
  band = 'B3',
  personal_email = 'employee.personal@gmail.com',
  temporary_address = '012 Employee Enclave, Hyderabad',
  permanent_address = '345 Permanent Meadows, Chennai',
  alternate_phone = '+919876543219',
  manager_employee_id = (SELECT id FROM profiles WHERE email = 'project_lead@demo.com')
WHERE email = 'employee@demo.com';

-- Management (Reports to Admin)
UPDATE profiles SET 
  role_title = 'General Manager',
  date_of_joining = '2020-05-15',
  notice_period = '3 months',
  band = 'A2',
  personal_email = 'management.personal@gmail.com',
  temporary_address = '123 Management Manor, Bangalore',
  permanent_address = '456 Permanent Palace, Mumbai',
  alternate_phone = '+919876543220',
  manager_employee_id = (SELECT id FROM profiles WHERE email = 'admin@demo.com')
WHERE email = 'management@demo.com';

-- Finance (Reports to Finance Manager)
UPDATE profiles SET 
  role_title = 'Finance Analyst',
  date_of_joining = '2021-03-25',
  notice_period = '3 months',
  band = 'B2',
  personal_email = 'finance.personal@gmail.com',
  temporary_address = '234 Finance Avenue, Pune',
  permanent_address = '567 Permanent Ridge, Mumbai',
  alternate_phone = '+919876543221',
  manager_employee_id = (SELECT id FROM profiles WHERE email = 'finance_manager@demo.com')
WHERE email = 'finance@demo.com';

-- Payroll (Reports to Finance Manager)
UPDATE profiles SET 
  role_title = 'Payroll Specialist',
  date_of_joining = '2021-04-10',
  notice_period = '3 months',
  band = 'B2',
  personal_email = 'payroll.personal@gmail.com',
  temporary_address = '345 Payroll Plaza, Pune',
  permanent_address = '678 Permanent Park, Delhi',
  alternate_phone = '+919876543222',
  manager_employee_id = (SELECT id FROM profiles WHERE email = 'finance_manager@demo.com')
WHERE email = 'payroll@demo.com';

-- QA Lead (Reports to Delivery Head)
UPDATE profiles SET 
  role_title = 'QA Lead',
  date_of_joining = '2020-09-15',
  notice_period = '3 months',
  band = 'B1',
  personal_email = 'qalead.personal@gmail.com',
  temporary_address = '456 QA Quarters, Bangalore',
  permanent_address = '789 Permanent Point, Chennai',
  alternate_phone = '+919876543223',
  manager_employee_id = (SELECT id FROM profiles WHERE email = 'delivery_head@demo.com')
WHERE email = 'qa_lead@demo.com';

-- Dev Lead (Reports to Delivery Head)
UPDATE profiles SET 
  role_title = 'Development Lead',
  date_of_joining = '2020-10-20',
  notice_period = '3 months',
  band = 'B1',
  personal_email = 'devlead.personal@gmail.com',
  temporary_address = '567 Dev District, Hyderabad',
  permanent_address = '890 Permanent Place, Bangalore',
  alternate_phone = '+919876543224',
  manager_employee_id = (SELECT id FROM profiles WHERE email = 'delivery_head@demo.com')
WHERE email = 'dev_lead@demo.com';

-- Support Lead (Reports to Delivery Head)
UPDATE profiles SET 
  role_title = 'Support Lead',
  date_of_joining = '2021-01-05',
  notice_period = '3 months',
  band = 'B1',
  personal_email = 'supportlead.personal@gmail.com',
  temporary_address = '678 Support Square, Pune',
  permanent_address = '901 Permanent Phase, Delhi',
  alternate_phone = '+919876543225',
  manager_employee_id = (SELECT id FROM profiles WHERE email = 'delivery_head@demo.com')
WHERE email = 'support_lead@demo.com';

-- Tech Lead (Reports to Delivery Head)
UPDATE profiles SET 
  role_title = 'Tech Lead',
  date_of_joining = '2020-11-10',
  notice_period = '3 months',
  band = 'B1',
  personal_email = 'techlead.personal@gmail.com',
  temporary_address = '789 Tech Territory, Hyderabad',
  permanent_address = '012 Permanent Precinct, Chennai',
  alternate_phone = '+919876543226',
  manager_employee_id = (SELECT id FROM profiles WHERE email = 'delivery_head@demo.com')
WHERE email = 'tech_lead@demo.com';

-- Operations (Reports to Admin)
UPDATE profiles SET 
  role_title = 'Operations Manager',
  date_of_joining = '2021-02-05',
  notice_period = '3 months',
  band = 'B1',
  personal_email = 'operations.personal@gmail.com',
  temporary_address = '890 Operations Oasis, Bangalore',
  permanent_address = '123 Permanent Province, Mumbai',
  alternate_phone = '+919876543227',
  manager_employee_id = (SELECT id FROM profiles WHERE email = 'admin@demo.com')
WHERE email = 'operations@demo.com';