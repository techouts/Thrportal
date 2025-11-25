-- Create candidates tables
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  linkedin_url TEXT,
  location TEXT NOT NULL,
  current_ctc NUMERIC,
  expected_ctc NUMERIC,
  notice_period INTEGER,
  status TEXT NOT NULL DEFAULT 'New',
  source TEXT NOT NULL,
  recruiter_owner TEXT,
  skills TEXT[] DEFAULT '{}',
  experience INTEGER NOT NULL DEFAULT 0,
  consent BOOLEAN DEFAULT true,
  gdpr_compliant BOOLEAN DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS candidate_experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  designation TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  description TEXT,
  skills TEXT[] DEFAULT '{}',
  achievements TEXT[] DEFAULT '{}',
  ctc NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS candidate_education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  degree TEXT NOT NULL,
  field TEXT NOT NULL,
  institution TEXT NOT NULL,
  start_year INTEGER NOT NULL,
  end_year INTEGER,
  grade TEXT,
  type TEXT NOT NULL DEFAULT 'Degree',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS candidate_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  uploaded_by UUID REFERENCES profiles(id),
  size INTEGER NOT NULL DEFAULT 0,
  verified BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS candidate_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  direction TEXT NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id),
  attachments TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS candidate_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  changed_by UUID REFERENCES profiles(id),
  reason TEXT,
  notes TEXT,
  jd_id UUID,
  automatic_change BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS candidate_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  jd_id UUID,
  designation TEXT NOT NULL,
  ctc NUMERIC NOT NULL,
  location TEXT NOT NULL,
  joining_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Draft',
  approval_workflow JSONB DEFAULT '[]',
  terms TEXT[] DEFAULT '{}',
  sent_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  decline_reason TEXT,
  no_show_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS talent_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_public BOOLEAN DEFAULT false,
  shared_with TEXT[] DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS candidate_pool_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  pool_id UUID NOT NULL REFERENCES talent_pools(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  added_by UUID REFERENCES profiles(id),
  UNIQUE(candidate_id, pool_id)
);

CREATE TABLE IF NOT EXISTS candidate_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6'
);

CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_recruiter ON candidates(recruiter_owner);
CREATE INDEX IF NOT EXISTS idx_candidate_experience_candidate ON candidate_experience(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_education_candidate ON candidate_education(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_documents_candidate ON candidate_documents(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_communications_candidate ON candidate_communications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_timeline_candidate ON candidate_timeline(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_offers_candidate ON candidate_offers(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_pool_links_candidate ON candidate_pool_links(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_pool_links_pool ON candidate_pool_links(pool_id);

CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON candidates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

INSERT INTO candidates (id, name, email, phone, location, current_ctc, expected_ctc, notice_period, status, source, recruiter_owner, skills, experience, linkedin_url)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Sarah Johnson', 'sarah.johnson@email.com', '+1-555-0101', 'San Francisco, CA', 120000, 140000, 30, 'Shortlisted', 'LinkedIn', 'John Recruiter', ARRAY['React', 'TypeScript', 'CSS', 'JavaScript'], 5, 'https://linkedin.com/in/sarahjohnson'),
  ('22222222-2222-2222-2222-222222222222', 'Michael Chen', 'michael.chen@email.com', '+1-555-0102', 'New York, NY', 130000, 150000, 60, 'Interview Scheduled', 'Job Board', 'Jane Smith', ARRAY['Node.js', 'Python', 'PostgreSQL', 'AWS'], 7, 'https://linkedin.com/in/michaelchen'),
  ('33333333-3333-3333-3333-333333333333', 'Emily Rodriguez', 'emily.rodriguez@email.com', '+1-555-0103', 'Austin, TX', 110000, 130000, 30, 'New', 'Referral', 'Mike Johnson', ARRAY['React', 'Node.js', 'MongoDB', 'GraphQL'], 4, 'https://linkedin.com/in/emilyrodriguez'),
  ('44444444-4444-4444-4444-444444444444', 'David Kim', 'david.kim@email.com', '+1-555-0104', 'Seattle, WA', 140000, 160000, 90, 'Submitted', 'Internal Pool', 'Sarah Lee', ARRAY['Docker', 'Kubernetes', 'AWS', 'Terraform'], 8, 'https://linkedin.com/in/davidkim'),
  ('55555555-5555-5555-5555-555555555555', 'Jessica Taylor', 'jessica.taylor@email.com', '+1-555-0105', 'Boston, MA', 100000, 120000, 30, 'Offer Extended', 'Direct Application', 'Tom Wilson', ARRAY['Figma', 'UI/UX', 'User Research', 'Prototyping'], 6, 'https://linkedin.com/in/jessicataylor');

INSERT INTO candidate_experience (candidate_id, company, designation, start_date, end_date, is_current, description, skills, ctc)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Tech Corp', 'Senior Frontend Developer', '2020-01-01', NULL, true, 'Leading frontend development', ARRAY['React', 'TypeScript'], 120000),
  ('11111111-1111-1111-1111-111111111111', 'StartupXYZ', 'Frontend Developer', '2018-06-01', '2019-12-31', false, 'Built web applications', ARRAY['React', 'JavaScript'], 80000),
  ('22222222-2222-2222-2222-222222222222', 'BigTech Inc', 'Backend Engineer', '2019-03-01', NULL, true, 'Backend services', ARRAY['Node.js', 'PostgreSQL'], 130000),
  ('33333333-3333-3333-3333-333333333333', 'Digital Agency', 'Full Stack Developer', '2021-02-01', NULL, true, 'Full stack development', ARRAY['React', 'Node.js'], 110000);

INSERT INTO candidate_education (candidate_id, degree, field, institution, start_year, end_year, grade, type)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Bachelor of Science', 'Computer Science', 'Stanford University', 2013, 2017, '3.8 GPA', 'Degree'),
  ('22222222-2222-2222-2222-222222222222', 'Master of Science', 'Software Engineering', 'MIT', 2015, 2017, '3.9 GPA', 'Degree'),
  ('33333333-3333-3333-3333-333333333333', 'Bachelor of Engineering', 'Information Technology', 'University of Texas', 2017, 2021, '3.7 GPA', 'Degree'),
  ('44444444-4444-4444-4444-444444444444', 'Bachelor of Science', 'Computer Science', 'University of Washington', 2012, 2016, '3.6 GPA', 'Degree'),
  ('55555555-5555-5555-5555-555555555555', 'Bachelor of Arts', 'Design', 'Rhode Island School of Design', 2014, 2018, '3.8 GPA', 'Degree');

INSERT INTO candidate_documents (candidate_id, name, type, url, size, verified)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Sarah_Johnson_Resume.pdf', 'Resume', '/documents/sarah_resume.pdf', 245000, true),
  ('22222222-2222-2222-2222-222222222222', 'Michael_Chen_Resume.pdf', 'Resume', '/documents/michael_resume.pdf', 312000, true),
  ('33333333-3333-3333-3333-333333333333', 'Emily_Rodriguez_Resume.pdf', 'Resume', '/documents/emily_resume.pdf', 198000, false),
  ('44444444-4444-4444-4444-444444444444', 'David_Kim_Resume.pdf', 'Resume', '/documents/david_resume.pdf', 267000, true),
  ('55555555-5555-5555-5555-555555555555', 'Jessica_Taylor_Portfolio.pdf', 'Portfolio', '/documents/jessica_portfolio.pdf', 1245000, true);

INSERT INTO candidate_communications (candidate_id, type, direction, subject, content)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Email', 'Outbound', 'Interview Invitation', 'We would like to invite you for an interview...'),
  ('22222222-2222-2222-2222-222222222222', 'Phone Call', 'Outbound', 'Initial Screening', 'Discussed candidate background'),
  ('33333333-3333-3333-3333-333333333333', 'Email', 'Inbound', 'Application Received', 'Thank you for your application...'),
  ('44444444-4444-4444-4444-444444444444', 'LinkedIn Message', 'Outbound', 'Job Opportunity', 'We have an exciting opportunity...'),
  ('55555555-5555-5555-5555-555555555555', 'Email', 'Outbound', 'Offer Letter', 'Congratulations! We are pleased to extend an offer...');

INSERT INTO candidate_timeline (candidate_id, from_status, to_status, reason, automatic_change)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'New', 'Shortlisted', 'Strong technical skills', false),
  ('22222222-2222-2222-2222-222222222222', 'Shortlisted', 'Interview Scheduled', 'Scheduled for technical round', false),
  ('44444444-4444-4444-4444-444444444444', 'Shortlisted', 'Submitted', 'Submitted to client', false),
  ('55555555-5555-5555-5555-555555555555', 'Interview Completed', 'Offer Extended', 'Excellent performance', false);

INSERT INTO candidate_offers (candidate_id, designation, ctc, location, joining_date, status)
VALUES
  ('55555555-5555-5555-5555-555555555555', 'Senior UX Designer', 120000, 'Boston, MA', '2024-12-01', 'Sent');

INSERT INTO talent_pools (id, name, description, tags, is_public)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Frontend Specialists', 'High-performing frontend developers', ARRAY['React', 'Frontend', 'JavaScript'], true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Backend Engineers', 'Experienced backend engineers', ARRAY['Backend', 'Node.js', 'Python'], true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'DevOps Experts', 'DevOps and infrastructure specialists', ARRAY['DevOps', 'AWS', 'Kubernetes'], false);

INSERT INTO candidate_pool_links (candidate_id, pool_id)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('44444444-4444-4444-4444-444444444444', 'cccccccc-cccc-cccc-cccc-cccccccccccc');