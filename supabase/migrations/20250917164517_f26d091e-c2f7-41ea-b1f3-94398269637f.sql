-- Create comprehensive RLS policies for all CRM tables
-- This fixes the missing CRM Client Desk data issue

-- CRM Clients policies
CREATE POLICY "Staff and recruiters can view clients" 
ON public.crm_clients 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'MANAGEMENT'::text, 'ADMIN'::text]));

CREATE POLICY "Staff managers can create/update clients" 
ON public.crm_clients 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'ADMIN'::text]));

-- CRM Accounts policies
CREATE POLICY "Staff and recruiters can view accounts" 
ON public.crm_accounts 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'MANAGEMENT'::text, 'ADMIN'::text]));

CREATE POLICY "Staff managers can create/update accounts" 
ON public.crm_accounts 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'ADMIN'::text]));

-- CRM Projects policies
CREATE POLICY "Staff and recruiters can view projects" 
ON public.crm_projects 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'MANAGEMENT'::text, 'ADMIN'::text]));

CREATE POLICY "Staff managers can create/update projects" 
ON public.crm_projects 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'ADMIN'::text]));

-- CRM SPOCs policies
CREATE POLICY "Staff and recruiters can view spocs" 
ON public.crm_spocs 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'MANAGEMENT'::text, 'ADMIN'::text]));

CREATE POLICY "Staff and recruiters can create/update spocs" 
ON public.crm_spocs 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'ADMIN'::text]));

-- CRM Opportunities policies
CREATE POLICY "Staff and recruiters can view opportunities" 
ON public.crm_opportunities 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'MANAGEMENT'::text, 'ADMIN'::text]));

CREATE POLICY "Staff and recruiters can create/update opportunities" 
ON public.crm_opportunities 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'ADMIN'::text]));

-- CRM Interactions policies
CREATE POLICY "Staff and recruiters can view interactions" 
ON public.crm_interactions 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'MANAGEMENT'::text, 'ADMIN'::text]));

CREATE POLICY "Staff and recruiters can create/update interactions" 
ON public.crm_interactions 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'ADMIN'::text]));

-- CRM Documents policies
CREATE POLICY "Staff and recruiters can view documents" 
ON public.crm_documents 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'MANAGEMENT'::text, 'ADMIN'::text]));

CREATE POLICY "Staff managers can create/update documents" 
ON public.crm_documents 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'ADMIN'::text]));

-- CRM Recruiter Assignments policies
CREATE POLICY "Staff and recruiters can view assignments" 
ON public.crm_recruiter_assignments 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'MANAGEMENT'::text, 'ADMIN'::text]));

CREATE POLICY "Staff managers can create/update assignments" 
ON public.crm_recruiter_assignments 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'ADMIN'::text]));