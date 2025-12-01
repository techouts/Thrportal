-- Step 1: Add missing columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS employee_code TEXT,
ADD COLUMN IF NOT EXISTS role_title TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS cost_center TEXT,
ADD COLUMN IF NOT EXISTS manager_employee_id UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS about TEXT,
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';

-- Step 2: Update all 18 dev user profiles with sample data

-- Admin (reports to no one)
UPDATE public.profiles SET
  employee_code = 'EMP001',
  role_title = 'System Administrator',
  city = 'Hyderabad',
  country = 'India',
  cost_center = 'CC-ADMIN-001',
  about = 'Experienced system administrator managing HRMS platform operations and user access.',
  interests = ARRAY['Technology', 'Automation', 'Cloud Computing']
WHERE email = 'admin@demo.com';

-- HR Manager (reports to admin)
UPDATE public.profiles SET
  employee_code = 'EMP002',
  role_title = 'HR Manager',
  city = 'Bangalore',
  country = 'India',
  cost_center = 'CC-HR-001',
  manager_employee_id = (SELECT id FROM public.profiles WHERE email = 'admin@demo.com'),
  about = 'Leading HR operations with focus on employee engagement and talent management.',
  interests = ARRAY['Employee Wellness', 'Leadership Development', 'Yoga']
WHERE email = 'hr.manager@demo.com';

-- Recruiter (reports to HR Manager)
UPDATE public.profiles SET
  employee_code = 'EMP003',
  role_title = 'Senior Recruiter',
  city = 'Mumbai',
  country = 'India',
  cost_center = 'CC-HR-002',
  manager_employee_id = (SELECT id FROM public.profiles WHERE email = 'hr.manager@demo.com'),
  about = 'Passionate about finding the right talent and building diverse teams.',
  interests = ARRAY['Talent Acquisition', 'Networking', 'Cricket']
WHERE email = 'recruiter@demo.com';

-- Interviewer (reports to HR Manager)
UPDATE public.profiles SET
  employee_code = 'EMP004',
  role_title = 'Technical Interviewer',
  city = 'Chennai',
  country = 'India',
  cost_center = 'CC-TECH-001',
  manager_employee_id = (SELECT id FROM public.profiles WHERE email = 'hr.manager@demo.com'),
  about = 'Conducting technical interviews and assessing candidate skills.',
  interests = ARRAY['Coding', 'Mentoring', 'Photography']
WHERE email = 'interviewer@demo.com';

-- Finance Manager (reports to admin)
UPDATE public.profiles SET
  employee_code = 'EMP005',
  role_title = 'Finance Manager',
  city = 'Hyderabad',
  country = 'India',
  cost_center = 'CC-FIN-001',
  manager_employee_id = (SELECT id FROM public.profiles WHERE email = 'admin@demo.com'),
  about = 'Managing financial operations and ensuring compliance.',
  interests = ARRAY['Financial Planning', 'Investment', 'Reading']
WHERE email = 'finance.manager@demo.com';

-- Employee (reports to HR Manager)
UPDATE public.profiles SET
  employee_code = 'EMP006',
  role_title = 'Software Engineer',
  city = 'Pune',
  country = 'India',
  cost_center = 'CC-TECH-002',
  manager_employee_id = (SELECT id FROM public.profiles WHERE email = 'hr.manager@demo.com'),
  about = 'Full-stack developer working on enterprise applications.',
  interests = ARRAY['Open Source', 'Gaming', 'Music']
WHERE email = 'employee@demo.com';

-- Approver (reports to Finance Manager)
UPDATE public.profiles SET
  employee_code = 'EMP007',
  role_title = 'Senior Approver',
  city = 'Delhi',
  country = 'India',
  cost_center = 'CC-FIN-002',
  manager_employee_id = (SELECT id FROM public.profiles WHERE email = 'finance.manager@demo.com'),
  about = 'Reviewing and approving financial and operational requests.',
  interests = ARRAY['Process Improvement', 'Governance', 'Travel']
WHERE email = 'approver@demo.com';

-- Viewer (reports to HR Manager)
UPDATE public.profiles SET
  employee_code = 'EMP008',
  role_title = 'HR Analyst',
  city = 'Kolkata',
  country = 'India',
  cost_center = 'CC-HR-003',
  manager_employee_id = (SELECT id FROM public.profiles WHERE email = 'hr.manager@demo.com'),
  about = 'Analyzing HR metrics and generating insights for decision making.',
  interests = ARRAY['Data Analytics', 'Visualization', 'Cooking']
WHERE email = 'viewer@demo.com';

-- Super Admin (reports to no one - top level)
UPDATE public.profiles SET
  employee_code = 'EMP009',
  role_title = 'Super Administrator',
  city = 'Hyderabad',
  country = 'India',
  cost_center = 'CC-EXEC-001',
  about = 'Overseeing all system operations with full administrative privileges.',
  interests = ARRAY['Strategy', 'Innovation', 'Golf']
WHERE email = 'superadmin@demo.com';

-- CRM Admin (reports to admin)
UPDATE public.profiles SET
  employee_code = 'EMP010',
  role_title = 'CRM Administrator',
  city = 'Bangalore',
  country = 'India',
  cost_center = 'CC-SALES-001',
  manager_employee_id = (SELECT id FROM public.profiles WHERE email = 'admin@demo.com'),
  about = 'Managing customer relationships and CRM system configuration.',
  interests = ARRAY['Customer Success', 'Sales Strategy', 'Badminton']
WHERE email = 'crm.admin@demo.com';

-- CRM Viewer (reports to CRM Admin)
UPDATE public.profiles SET
  employee_code = 'EMP011',
  role_title = 'CRM Analyst',
  city = 'Mumbai',
  country = 'India',
  cost_center = 'CC-SALES-002',
  manager_employee_id = (SELECT id FROM public.profiles WHERE email = 'crm.admin@demo.com'),
  about = 'Analyzing customer data and supporting sales operations.',
  interests = ARRAY['Market Research', 'Presentation', 'Movies']
WHERE email = 'crm.viewer@demo.com';

-- Staffing Manager (reports to HR Manager)
UPDATE public.profiles SET
  employee_code = 'EMP012',
  role_title = 'Staffing Manager',
  city = 'Chennai',
  country = 'India',
  cost_center = 'CC-HR-004',
  manager_employee_id = (SELECT id FROM public.profiles WHERE email = 'hr.manager@demo.com'),
  about = 'Managing workforce planning and resource allocation.',
  interests = ARRAY['Resource Planning', 'Team Building', 'Tennis']
WHERE email = 'staffing.manager@demo.com';

-- Delivery Lead (reports to admin)
UPDATE public.profiles SET
  employee_code = 'EMP013',
  role_title = 'Delivery Lead',
  city = 'Pune',
  country = 'India',
  cost_center = 'CC-DELIVERY-001',
  manager_employee_id = (SELECT id FROM public.profiles WHERE email = 'admin@demo.com'),
  about = 'Leading project delivery and ensuring client satisfaction.',
  interests = ARRAY['Project Management', 'Agile', 'Hiking']
WHERE email = 'delivery.lead@demo.com';

-- Account Manager (reports to CRM Admin)
UPDATE public.profiles SET
  employee_code = 'EMP014',
  role_title = 'Account Manager',
  city = 'Delhi',
  country = 'India',
  cost_center = 'CC-SALES-003',
  manager_employee_id = (SELECT id FROM public.profiles WHERE email = 'crm.admin@demo.com'),
  about = 'Managing key client accounts and driving business growth.',
  interests = ARRAY['Client Relations', 'Negotiation', 'Swimming']
WHERE email = 'account.manager@demo.com';

-- Sales Head (reports to admin)
UPDATE public.profiles SET
  employee_code = 'EMP015',
  role_title = 'Sales Head',
  city = 'Mumbai',
  country = 'India',
  cost_center = 'CC-SALES-004',
  manager_employee_id = (SELECT id FROM public.profiles WHERE email = 'admin@demo.com'),
  about = 'Driving sales strategy and leading the sales team.',
  interests = ARRAY['Business Development', 'Leadership', 'Running']
WHERE email = 'sales.head@demo.com';

-- Timesheet Admin (reports to Finance Manager)
UPDATE public.profiles SET
  employee_code = 'EMP016',
  role_title = 'Timesheet Administrator',
  city = 'Hyderabad',
  country = 'India',
  cost_center = 'CC-FIN-003',
  manager_employee_id = (SELECT id FROM public.profiles WHERE email = 'finance.manager@demo.com'),
  about = 'Managing timesheet submissions and ensuring accurate billing.',
  interests = ARRAY['Time Management', 'Excel', 'Gardening']
WHERE email = 'timesheet.admin@demo.com';

-- Project Manager (reports to Delivery Lead)
UPDATE public.profiles SET
  employee_code = 'EMP017',
  role_title = 'Project Manager',
  city = 'Bangalore',
  country = 'India',
  cost_center = 'CC-DELIVERY-002',
  manager_employee_id = (SELECT id FROM public.profiles WHERE email = 'delivery.lead@demo.com'),
  about = 'Planning and executing projects while managing stakeholder expectations.',
  interests = ARRAY['Scrum', 'Risk Management', 'Chess']
WHERE email = 'project.manager@demo.com';

-- Resource Manager (reports to Staffing Manager)
UPDATE public.profiles SET
  employee_code = 'EMP018',
  role_title = 'Resource Manager',
  city = 'Chennai',
  country = 'India',
  cost_center = 'CC-HR-005',
  manager_employee_id = (SELECT id FROM public.profiles WHERE email = 'staffing.manager@demo.com'),
  about = 'Coordinating resource allocation across multiple projects.',
  interests = ARRAY['Capacity Planning', 'Optimization', 'Cycling']
WHERE email = 'resource.manager@demo.com';