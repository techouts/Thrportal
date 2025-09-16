-- Create roles catalog table for standard rates
CREATE TABLE public.roles_catalog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  standard_rate NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tasks table for project tasks
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  stage TEXT,
  phase TEXT,
  est_hours NUMERIC(8,2) NOT NULL DEFAULT 0,
  actual_hours NUMERIC(8,2) DEFAULT 0,
  billable BOOLEAN NOT NULL DEFAULT true,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'blocked')),
  assignees TEXT[], -- Array of user IDs
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create allocations table for resource allocation
CREATE TABLE public.allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  project_id UUID REFERENCES public.projects(id), -- NULL for bench allocations
  role_id UUID NOT NULL REFERENCES public.roles_catalog(id),
  type TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (type IN ('BENCH', 'SHADOW', 'ACTIVE')),
  allocation_pct NUMERIC(5,2) NOT NULL DEFAULT 100.00 CHECK (allocation_pct >= 0 AND allocation_pct <= 200),
  start_date DATE NOT NULL,
  end_date DATE,
  bill_rate NUMERIC(10,2) NOT NULL DEFAULT 0,
  cost_rate NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.roles_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allocations ENABLE ROW LEVEL SECURITY;

-- RLS policies for roles_catalog
CREATE POLICY "Staff can view roles catalog" 
ON public.roles_catalog 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'MANAGEMENT'::text, 'ADMIN'::text]));

CREATE POLICY "HR and admin can manage roles catalog" 
ON public.roles_catalog 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['HR_MANAGER'::text, 'ADMIN'::text]));

-- RLS policies for tasks
CREATE POLICY "Staff can view tasks" 
ON public.tasks 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'MANAGEMENT'::text, 'ADMIN'::text]));

CREATE POLICY "Staff managers can manage tasks" 
ON public.tasks 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'ADMIN'::text]));

-- RLS policies for allocations
CREATE POLICY "Staff can view allocations" 
ON public.allocations 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'MANAGEMENT'::text, 'ADMIN'::text]));

CREATE POLICY "Staff managers can manage allocations" 
ON public.allocations 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'ADMIN'::text]));

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_roles_catalog_updated_at
BEFORE UPDATE ON public.roles_catalog
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_allocations_updated_at
BEFORE UPDATE ON public.allocations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_allocations_employee_id ON public.allocations(employee_id);
CREATE INDEX idx_allocations_project_id ON public.allocations(project_id);
CREATE INDEX idx_allocations_type ON public.allocations(type);
CREATE INDEX idx_allocations_dates ON public.allocations(start_date, end_date);

-- Insert some standard roles
INSERT INTO public.roles_catalog (name, standard_rate) VALUES
('Senior Developer', 95.00),
('Mid-Level Developer', 75.00),
('Junior Developer', 55.00),
('Tech Lead', 120.00),
('Project Manager', 85.00),
('Business Analyst', 70.00),
('DevOps Engineer', 90.00),
('QA Engineer', 65.00),
('UI/UX Designer', 80.00),
('Data Analyst', 75.00);