-- Step 1: Add RLS policy for anon read access in dev mode
CREATE POLICY "Allow anon read for dev mode" 
ON profiles FOR SELECT 
TO anon
USING (true);

-- Step 2: Populate ALL 18 profiles with complete sample data
UPDATE profiles SET
  employee_code = 'EMP001',
  role_title = 'System Administrator',
  city = 'Mumbai',
  country = 'India',
  about = 'System administrator managing platform access and configurations.',
  interests = ARRAY['System Architecture', 'Security', 'Automation'],
  manager_employee_id = NULL
WHERE email = 'admin@demo.com';

UPDATE profiles SET
  employee_code = 'EMP002',
  role_title = 'Staffing Manager',
  city = 'Bangalore',
  country = 'India',
  about = 'Experienced staffing manager focused on talent acquisition and team building.',
  interests = ARRAY['Talent Acquisition', 'HR Tech', 'Team Building'],
  manager_employee_id = (SELECT id FROM profiles WHERE email = 'admin@demo.com')
WHERE email = 'staffing@demo.com';

UPDATE profiles SET
  employee_code = 'EMP003',
  role_title = 'HR Manager',
  city = 'Delhi',
  country = 'India',
  about = 'HR professional passionate about employee engagement and development.',
  interests = ARRAY['Employee Engagement', 'Learning & Development', 'HR Analytics'],
  manager_employee_id = (SELECT id FROM profiles WHERE email = 'admin@demo.com')
WHERE email = 'hr@demo.com';

UPDATE profiles SET
  employee_code = 'EMP004',
  role_title = 'Finance Manager',
  city = 'Mumbai',
  country = 'India',
  about = 'Finance professional managing budgets and financial planning.',
  interests = ARRAY['Financial Planning', 'Budgeting', 'Analytics'],
  manager_employee_id = (SELECT id FROM profiles WHERE email = 'admin@demo.com')
WHERE email = 'finance@demo.com';

UPDATE profiles SET
  employee_code = 'EMP005',
  role_title = 'Senior Recruiter',
  city = 'Hyderabad',
  country = 'India',
  about = 'Senior recruiter specializing in tech hiring and candidate experience.',
  interests = ARRAY['Tech Recruiting', 'Candidate Experience', 'Sourcing'],
  manager_employee_id = (SELECT id FROM profiles WHERE email = 'staffing@demo.com')
WHERE email = 'recruiter@demo.com';

UPDATE profiles SET
  employee_code = 'EMP006',
  role_title = 'Hiring Manager',
  city = 'Pune',
  country = 'India',
  about = 'Engineering manager focused on building high-performance teams.',
  interests = ARRAY['Engineering Leadership', 'Team Scaling', 'Technical Interviews'],
  manager_employee_id = (SELECT id FROM profiles WHERE email = 'admin@demo.com')
WHERE email = 'hiring@demo.com';

UPDATE profiles SET
  employee_code = 'EMP007',
  role_title = 'Senior Management',
  city = 'Mumbai',
  country = 'India',
  about = 'Senior executive overseeing strategic initiatives and business growth.',
  interests = ARRAY['Strategy', 'Business Development', 'Leadership'],
  manager_employee_id = NULL
WHERE email = 'management@demo.com';

UPDATE profiles SET
  employee_code = 'EMP008',
  role_title = 'Software Engineer',
  city = 'Chennai',
  country = 'India',
  about = 'Full-stack developer passionate about building scalable applications.',
  interests = ARRAY['React', 'Node.js', 'Cloud Architecture'],
  manager_employee_id = (SELECT id FROM profiles WHERE email = 'hiring@demo.com')
WHERE email = 'employee@demo.com';

UPDATE profiles SET
  employee_code = 'EMP009',
  role_title = 'Lead Recruiter',
  city = 'Bangalore',
  country = 'India',
  about = 'Lead recruiter managing recruitment operations and team performance.',
  interests = ARRAY['Recruitment Strategy', 'Team Management', 'Process Optimization'],
  manager_employee_id = (SELECT id FROM profiles WHERE email = 'staffing@demo.com')
WHERE email = 'recruiter2@demo.com';

UPDATE profiles SET
  employee_code = 'EMP010',
  role_title = 'Technical Recruiter',
  city = 'Gurgaon',
  country = 'India',
  about = 'Technical recruiter with expertise in engineering and product roles.',
  interests = ARRAY['Technical Hiring', 'Employer Branding', 'Diversity Hiring'],
  manager_employee_id = (SELECT id FROM profiles WHERE email = 'staffing@demo.com')
WHERE email = 'recruiter3@demo.com';

UPDATE profiles SET
  employee_code = 'EMP011',
  role_title = 'Engineering Manager',
  city = 'Bangalore',
  country = 'India',
  about = 'Engineering manager building and scaling development teams.',
  interests = ARRAY['Agile', 'Team Building', 'Technical Excellence'],
  manager_employee_id = (SELECT id FROM profiles WHERE email = 'management@demo.com')
WHERE email = 'hiring2@demo.com';

UPDATE profiles SET
  employee_code = 'EMP012',
  role_title = 'Product Manager',
  city = 'Mumbai',
  country = 'India',
  about = 'Product manager driving product strategy and roadmap execution.',
  interests = ARRAY['Product Strategy', 'User Research', 'Data Analytics'],
  manager_employee_id = (SELECT id FROM profiles WHERE email = 'management@demo.com')
WHERE email = 'hiring3@demo.com';

UPDATE profiles SET
  employee_code = 'EMP013',
  role_title = 'Senior Software Engineer',
  city = 'Pune',
  country = 'India',
  about = 'Senior engineer focused on system design and mentoring.',
  interests = ARRAY['System Design', 'Mentoring', 'Open Source'],
  manager_employee_id = (SELECT id FROM profiles WHERE email = 'hiring@demo.com')
WHERE email = 'employee2@demo.com';

UPDATE profiles SET
  employee_code = 'EMP014',
  role_title = 'QA Engineer',
  city = 'Hyderabad',
  country = 'India',
  about = 'Quality engineer ensuring product reliability and performance.',
  interests = ARRAY['Test Automation', 'Quality Assurance', 'CI/CD'],
  manager_employee_id = (SELECT id FROM profiles WHERE email = 'hiring@demo.com')
WHERE email = 'employee3@demo.com';

UPDATE profiles SET
  employee_code = 'EMP015',
  role_title = 'HR Business Partner',
  city = 'Delhi',
  country = 'India',
  about = 'HR business partner supporting organizational development.',
  interests = ARRAY['Org Development', 'Change Management', 'Employee Relations'],
  manager_employee_id = (SELECT id FROM profiles WHERE email = 'hr@demo.com')
WHERE email = 'hr2@demo.com';

UPDATE profiles SET
  employee_code = 'EMP016',
  role_title = 'Senior Financial Analyst',
  city = 'Mumbai',
  country = 'India',
  about = 'Financial analyst specializing in forecasting and reporting.',
  interests = ARRAY['Financial Modeling', 'Reporting', 'Business Intelligence'],
  manager_employee_id = (SELECT id FROM profiles WHERE email = 'finance@demo.com')
WHERE email = 'finance2@demo.com';

UPDATE profiles SET
  employee_code = 'EMP017',
  role_title = 'Staffing Coordinator',
  city = 'Chennai',
  country = 'India',
  about = 'Staffing coordinator managing resource allocation and scheduling.',
  interests = ARRAY['Resource Planning', 'Coordination', 'Process Improvement'],
  manager_employee_id = (SELECT id FROM profiles WHERE email = 'staffing@demo.com')
WHERE email = 'staffing2@demo.com';

UPDATE profiles SET
  employee_code = 'EMP018',
  role_title = 'Director of Operations',
  city = 'Bangalore',
  country = 'India',
  about = 'Director overseeing company operations and strategic initiatives.',
  interests = ARRAY['Operations', 'Strategy', 'Business Growth'],
  manager_employee_id = NULL
WHERE email = 'management2@demo.com';