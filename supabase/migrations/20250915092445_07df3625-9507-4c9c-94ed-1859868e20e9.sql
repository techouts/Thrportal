-- Create CRM module database schema

-- Clients table
CREATE TABLE public.crm_clients (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    industry TEXT,
    location TEXT,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Prospect')),
    billing_model TEXT,
    contract_type TEXT,
    sla_reference TEXT,
    health_score INTEGER DEFAULT 50 CHECK (health_score >= 0 AND health_score <= 100),
    domain TEXT,
    gst_vat TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(name, domain)
);

-- Accounts table (sub-units of clients)
CREATE TABLE public.crm_accounts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.crm_clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT, -- Department/BU/Geo - free text
    sla_override TEXT,
    primary_spoc_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- SPOCs (Single Point of Contact)
CREATE TABLE public.crm_spocs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES public.crm_clients(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.crm_accounts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT,
    email TEXT,
    phone TEXT,
    linkedin_url TEXT,
    is_primary BOOLEAN DEFAULT false,
    last_contacted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    CHECK (client_id IS NOT NULL OR account_id IS NOT NULL)
);

-- Projects table
CREATE TABLE public.crm_projects (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.crm_clients(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.crm_accounts(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    ft_target INTEGER DEFAULT 0,
    contract_target INTEGER DEFAULT 0,
    skills TEXT[],
    priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    status TEXT DEFAULT 'Planned' CHECK (status IN ('Planned', 'In-flight', 'Closed')),
    owner_id UUID REFERENCES auth.users(id),
    primary_spoc_id UUID REFERENCES public.crm_spocs(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Opportunities table
CREATE TABLE public.crm_opportunities (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.crm_clients(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.crm_accounts(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.crm_projects(id) ON DELETE SET NULL,
    jd_count INTEGER DEFAULT 0,
    ft_count INTEGER DEFAULT 0,
    contract_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Closed', 'Lost')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Interactions table
CREATE TABLE public.crm_interactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES public.crm_clients(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.crm_accounts(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.crm_projects(id) ON DELETE CASCADE,
    spoc_id UUID REFERENCES public.crm_spocs(id) ON DELETE SET NULL,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('call', 'meeting', 'email', 'whatsapp', 'linkedin', 'onsite')),
    date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    notes TEXT,
    outcome TEXT,
    next_step TEXT,
    engagement_score INTEGER DEFAULT 0,
    is_synced BOOLEAN DEFAULT false, -- for Outlook integration
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    CHECK (client_id IS NOT NULL OR account_id IS NOT NULL OR project_id IS NOT NULL)
);

-- Documents table (SharePoint links)
CREATE TABLE public.crm_documents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES public.crm_clients(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.crm_accounts(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.crm_projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    document_type TEXT CHECK (document_type IN ('MSA', 'SOW', 'Contract', 'Other')),
    sharepoint_url TEXT NOT NULL,
    valid_from DATE,
    valid_until DATE,
    renewal_alert_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    CHECK (client_id IS NOT NULL OR account_id IS NOT NULL OR project_id IS NOT NULL)
);

-- Recruiter assignments table
CREATE TABLE public.crm_recruiter_assignments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    recruiter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.crm_clients(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.crm_accounts(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.crm_projects(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    assigned_by UUID REFERENCES auth.users(id),
    CHECK (client_id IS NOT NULL OR account_id IS NOT NULL OR project_id IS NOT NULL)
);

-- Enable Row Level Security
ALTER TABLE public.crm_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_spocs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_recruiter_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for CRM tables
-- Clients policies
CREATE POLICY "Staff and recruiters can view clients" ON public.crm_clients
    FOR SELECT USING (
        get_current_user_role() = ANY(ARRAY['STAFFING_MANAGER', 'HR_MANAGER', 'RECRUITER', 'HIRING_MANAGER', 'MANAGEMENT', 'ADMIN'])
    );

CREATE POLICY "Staff managers can create/update clients" ON public.crm_clients
    FOR ALL USING (
        get_current_user_role() = ANY(ARRAY['STAFFING_MANAGER', 'HR_MANAGER', 'ADMIN'])
    );

-- Accounts policies
CREATE POLICY "Staff and recruiters can view accounts" ON public.crm_accounts
    FOR SELECT USING (
        get_current_user_role() = ANY(ARRAY['STAFFING_MANAGER', 'HR_MANAGER', 'RECRUITER', 'HIRING_MANAGER', 'MANAGEMENT', 'ADMIN'])
    );

CREATE POLICY "Staff managers can create/update accounts" ON public.crm_accounts
    FOR ALL USING (
        get_current_user_role() = ANY(ARRAY['STAFFING_MANAGER', 'HR_MANAGER', 'ADMIN'])
    );

-- SPOCs policies
CREATE POLICY "Staff and recruiters can view spocs" ON public.crm_spocs
    FOR SELECT USING (
        get_current_user_role() = ANY(ARRAY['STAFFING_MANAGER', 'HR_MANAGER', 'RECRUITER', 'HIRING_MANAGER', 'MANAGEMENT', 'ADMIN'])
    );

CREATE POLICY "Staff and recruiters can create/update spocs" ON public.crm_spocs
    FOR ALL USING (
        get_current_user_role() = ANY(ARRAY['STAFFING_MANAGER', 'HR_MANAGER', 'RECRUITER', 'HIRING_MANAGER', 'ADMIN'])
    );

-- Projects policies
CREATE POLICY "Staff and recruiters can view projects" ON public.crm_projects
    FOR SELECT USING (
        get_current_user_role() = ANY(ARRAY['STAFFING_MANAGER', 'HR_MANAGER', 'RECRUITER', 'HIRING_MANAGER', 'MANAGEMENT', 'ADMIN'])
    );

CREATE POLICY "Staff managers can create/update projects" ON public.crm_projects
    FOR ALL USING (
        get_current_user_role() = ANY(ARRAY['STAFFING_MANAGER', 'HR_MANAGER', 'ADMIN'])
    );

-- Opportunities policies
CREATE POLICY "Staff and recruiters can view opportunities" ON public.crm_opportunities
    FOR SELECT USING (
        get_current_user_role() = ANY(ARRAY['STAFFING_MANAGER', 'HR_MANAGER', 'RECRUITER', 'HIRING_MANAGER', 'MANAGEMENT', 'ADMIN'])
    );

CREATE POLICY "Staff and recruiters can create/update opportunities" ON public.crm_opportunities
    FOR ALL USING (
        get_current_user_role() = ANY(ARRAY['STAFFING_MANAGER', 'HR_MANAGER', 'RECRUITER', 'HIRING_MANAGER', 'ADMIN'])
    );

-- Interactions policies
CREATE POLICY "Staff and recruiters can view interactions" ON public.crm_interactions
    FOR SELECT USING (
        get_current_user_role() = ANY(ARRAY['STAFFING_MANAGER', 'HR_MANAGER', 'RECRUITER', 'HIRING_MANAGER', 'MANAGEMENT', 'ADMIN'])
    );

CREATE POLICY "Staff and recruiters can create/update interactions" ON public.crm_interactions
    FOR ALL USING (
        get_current_user_role() = ANY(ARRAY['STAFFING_MANAGER', 'HR_MANAGER', 'RECRUITER', 'HIRING_MANAGER', 'ADMIN'])
    );

-- Documents policies
CREATE POLICY "Staff and recruiters can view documents" ON public.crm_documents
    FOR SELECT USING (
        get_current_user_role() = ANY(ARRAY['STAFFING_MANAGER', 'HR_MANAGER', 'RECRUITER', 'HIRING_MANAGER', 'MANAGEMENT', 'ADMIN'])
    );

CREATE POLICY "Staff managers can create/update documents" ON public.crm_documents
    FOR ALL USING (
        get_current_user_role() = ANY(ARRAY['STAFFING_MANAGER', 'HR_MANAGER', 'ADMIN'])
    );

-- Recruiter assignments policies
CREATE POLICY "Staff and recruiters can view assignments" ON public.crm_recruiter_assignments
    FOR SELECT USING (
        get_current_user_role() = ANY(ARRAY['STAFFING_MANAGER', 'HR_MANAGER', 'RECRUITER', 'HIRING_MANAGER', 'MANAGEMENT', 'ADMIN'])
    );

CREATE POLICY "Staff managers can create/update assignments" ON public.crm_recruiter_assignments
    FOR ALL USING (
        get_current_user_role() = ANY(ARRAY['STAFFING_MANAGER', 'HR_MANAGER', 'ADMIN'])
    );

-- Add foreign key constraint for primary_spoc_id in accounts
ALTER TABLE public.crm_accounts 
ADD CONSTRAINT fk_crm_accounts_primary_spoc 
FOREIGN KEY (primary_spoc_id) REFERENCES public.crm_spocs(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX idx_crm_clients_status ON public.crm_clients(status);
CREATE INDEX idx_crm_clients_health_score ON public.crm_clients(health_score);
CREATE INDEX idx_crm_accounts_client_id ON public.crm_accounts(client_id);
CREATE INDEX idx_crm_spocs_client_id ON public.crm_spocs(client_id);
CREATE INDEX idx_crm_spocs_account_id ON public.crm_spocs(account_id);
CREATE INDEX idx_crm_spocs_is_primary ON public.crm_spocs(is_primary);
CREATE INDEX idx_crm_projects_client_id ON public.crm_projects(client_id);
CREATE INDEX idx_crm_projects_status ON public.crm_projects(status);
CREATE INDEX idx_crm_interactions_date ON public.crm_interactions(date);
CREATE INDEX idx_crm_recruiter_assignments_recruiter_id ON public.crm_recruiter_assignments(recruiter_id);

-- Add triggers for updated_at columns
CREATE TRIGGER update_crm_clients_updated_at
    BEFORE UPDATE ON public.crm_clients
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crm_accounts_updated_at
    BEFORE UPDATE ON public.crm_accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crm_spocs_updated_at
    BEFORE UPDATE ON public.crm_spocs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crm_projects_updated_at
    BEFORE UPDATE ON public.crm_projects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crm_opportunities_updated_at
    BEFORE UPDATE ON public.crm_opportunities
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crm_documents_updated_at
    BEFORE UPDATE ON public.crm_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();