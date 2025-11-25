-- Create the core projects table that references CRM accounts
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES public.crm_accounts(id),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  pm_user_id UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold', 'cancelled')),
  start_date DATE NOT NULL,
  end_date DATE,
  billing_type TEXT NOT NULL DEFAULT 'TM' CHECK (billing_type IN ('TM', 'FIXED', 'MILESTONE', 'RETAINER')),
  allow_non_billable BOOLEAN NOT NULL DEFAULT true,
  allow_expenses BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project SPOC links table to link CRM contacts to projects with roles
CREATE TABLE public.project_spoc_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.crm_spocs(id),
  role TEXT NOT NULL CHECK (role IN ('Delivery', 'Finance', 'Escalation')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, contact_id, role)
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_spoc_links ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for projects
CREATE POLICY "Staff and managers can view projects" 
ON public.projects 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'MANAGEMENT'::text, 'ADMIN'::text]));

CREATE POLICY "Staff managers can create/update projects" 
ON public.projects 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'ADMIN'::text]));

-- Create RLS policies for project SPOC links
CREATE POLICY "Staff and managers can view project SPOCs" 
ON public.project_spoc_links 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'MANAGEMENT'::text, 'ADMIN'::text]));

CREATE POLICY "Staff managers can manage project SPOCs" 
ON public.project_spoc_links 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'ADMIN'::text]));

-- Create trigger for automatic timestamp updates on projects
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_projects_account_id ON public.projects(account_id);
CREATE INDEX idx_projects_pm_user_id ON public.projects(pm_user_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_project_spoc_links_project_id ON public.project_spoc_links(project_id);
CREATE INDEX idx_project_spoc_links_contact_id ON public.project_spoc_links(contact_id);