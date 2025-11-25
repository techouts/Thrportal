-- Add temporary development-only public access policies for CRM tables
-- These policies allow public read access to bypass RLS issues in development

-- CRM Clients - temporary public read access
CREATE POLICY "Development public read access for clients" 
ON public.crm_clients 
FOR SELECT 
USING (true);

-- CRM Accounts - temporary public read access  
CREATE POLICY "Development public read access for accounts"
ON public.crm_accounts
FOR SELECT
USING (true);

-- CRM Projects - temporary public read access
CREATE POLICY "Development public read access for projects" 
ON public.crm_projects
FOR SELECT
USING (true);

-- CRM SPOCs - temporary public read access
CREATE POLICY "Development public read access for spocs"
ON public.crm_spocs  
FOR SELECT
USING (true);

-- CRM Opportunities - temporary public read access
CREATE POLICY "Development public read access for opportunities"
ON public.crm_opportunities
FOR SELECT  
USING (true);

-- CRM Interactions - temporary public read access
CREATE POLICY "Development public read access for interactions"
ON public.crm_interactions
FOR SELECT
USING (true);

-- CRM Documents - temporary public read access  
CREATE POLICY "Development public read access for documents"
ON public.crm_documents
FOR SELECT
USING (true);

-- CRM Recruiter Assignments - temporary public read access
CREATE POLICY "Development public read access for recruiter assignments" 
ON public.crm_recruiter_assignments
FOR SELECT
USING (true);