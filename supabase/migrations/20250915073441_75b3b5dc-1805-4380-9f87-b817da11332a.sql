-- Create profiles table for user information including roles
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'EMPLOYEE',
  department TEXT,
  business_unit TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "HR and Admin can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('HR_MANAGER', 'HR_LEAD', 'ADMIN', 'MANAGEMENT')
  )
);

CREATE POLICY "HR and Admin can update profiles" 
ON public.profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('HR_MANAGER', 'ADMIN')
  )
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    first_name, 
    last_name,
    display_name,
    role
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'EMPLOYEE')
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Insert dev users profiles for existing auth users (if any)
-- This is safe as it will only insert if the profile doesn't exist
INSERT INTO public.profiles (id, email, first_name, last_name, display_name, role, department, is_active)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin@dev.local', 'Akhil', 'Admin', 'Akhil Admin', 'ADMIN', 'Administration', true),
  ('00000000-0000-0000-0000-000000000002', 'mgmt@dev.local', 'Mona', 'Management', 'Mona Management', 'MANAGEMENT', 'Executive', true),
  ('00000000-0000-0000-0000-000000000003', 'viewer@dev.local', 'Vikas', 'Viewer', 'Vikas Viewer', 'VIEWER', 'General', true),
  ('00000000-0000-0000-0000-000000000004', 'manager@dev.local', 'Maya', 'Manager', 'Maya Manager', 'MANAGER', 'Operations', true),
  ('00000000-0000-0000-0000-000000000005', 'employee@dev.local', 'Esha', 'Employee', 'Esha Employee', 'EMPLOYEE', 'General', true),
  ('00000000-0000-0000-0000-000000000006', 'recruiter@dev.local', 'Ravi', 'Recruiter', 'Ravi Recruiter', 'RECRUITER', 'Human Resources', true),
  ('00000000-0000-0000-0000-000000000007', 'hiringmgr@dev.local', 'Hari', 'HiringMgr', 'Hari HiringMgr', 'HIRING_MANAGER', 'Human Resources', true),
  ('00000000-0000-0000-0000-000000000008', 'staffingmgr@dev.local', 'Sara', 'StaffingMgr', 'Sara StaffingMgr', 'STAFFING_MANAGER', 'Human Resources', true),
  ('00000000-0000-0000-0000-000000000009', 'pl@dev.local', 'Pooja', 'ProjectLead', 'Pooja ProjectLead', 'PROJECT_LEAD', 'Engineering', true),
  ('00000000-0000-0000-0000-000000000010', 'dh@dev.local', 'Dev', 'DeliveryHead', 'Dev DeliveryHead', 'DELIVERY_HEAD', 'Engineering', true),
  ('00000000-0000-0000-0000-000000000011', 'hrlead@dev.local', 'Hema', 'HR Lead', 'Hema HR Lead', 'HR_LEAD', 'Human Resources', true),
  ('00000000-0000-0000-0000-000000000012', 'hrmgr@dev.local', 'Harsh', 'HR Manager', 'Harsh HR Manager', 'HR_MANAGER', 'Human Resources', true),
  ('00000000-0000-0000-0000-000000000013', 'payroll@dev.local', 'Pia', 'Payroll', 'Pia Payroll', 'PAYROLL_SPECIALIST', 'Finance', true),
  ('00000000-0000-0000-0000-000000000014', 'fin@dev.local', 'Farah', 'Finance', 'Farah Finance', 'FINANCE_ANALYST', 'Finance', true),
  ('00000000-0000-0000-0000-000000000015', 'it@dev.local', 'Inder', 'IT', 'Inder IT', 'IT_HELPDESK', 'Information Technology', true),
  ('00000000-0000-0000-0000-000000000016', 'auditor@dev.local', 'Arun', 'Auditor', 'Arun Auditor', 'AUDITOR_RO', 'Compliance', true),
  ('00000000-0000-0000-0000-000000000017', 'dpo@dev.local', 'Deepa', 'DPO', 'Deepa DPO', 'DPO_PRIVACY', 'Legal', true)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_department ON public.profiles(department);
CREATE INDEX idx_profiles_is_active ON public.profiles(is_active);