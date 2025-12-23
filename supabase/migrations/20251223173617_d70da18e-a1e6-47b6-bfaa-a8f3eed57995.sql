-- Update RLS policies to include OPERATIONS_HR role for CRM tables
DROP POLICY IF EXISTS "Staff and recruiters can view clients" ON crm_clients;
CREATE POLICY "Staff and recruiters can view clients" 
ON crm_clients FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'MANAGEMENT'::text, 'ADMIN'::text, 'OPERATIONS_HR'::text]));

DROP POLICY IF EXISTS "Staff and recruiters can view accounts" ON crm_accounts;
CREATE POLICY "Staff and recruiters can view accounts" 
ON crm_accounts FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'MANAGEMENT'::text, 'ADMIN'::text, 'OPERATIONS_HR'::text]));

DROP POLICY IF EXISTS "Staff and recruiters can view projects" ON crm_projects;
CREATE POLICY "Staff and recruiters can view projects" 
ON crm_projects FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'MANAGEMENT'::text, 'ADMIN'::text, 'OPERATIONS_HR'::text]));

DROP POLICY IF EXISTS "Staff and recruiters can view spocs" ON crm_spocs;
CREATE POLICY "Staff and recruiters can view spocs" 
ON crm_spocs FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'MANAGEMENT'::text, 'ADMIN'::text, 'OPERATIONS_HR'::text]));

DROP POLICY IF EXISTS "Staff and recruiters can view interactions" ON crm_interactions;
CREATE POLICY "Staff and recruiters can view interactions" 
ON crm_interactions FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'MANAGEMENT'::text, 'ADMIN'::text, 'OPERATIONS_HR'::text]));

DROP POLICY IF EXISTS "Staff and recruiters can create/update interactions" ON crm_interactions;
CREATE POLICY "Staff and recruiters can create/update interactions" 
ON crm_interactions FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'ADMIN'::text, 'OPERATIONS_HR'::text]));

DROP POLICY IF EXISTS "Staff and recruiters can view opportunities" ON crm_opportunities;
CREATE POLICY "Staff and recruiters can view opportunities" 
ON crm_opportunities FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'MANAGEMENT'::text, 'ADMIN'::text, 'OPERATIONS_HR'::text]));

DROP POLICY IF EXISTS "Staff and recruiters can create/update opportunities" ON crm_opportunities;
CREATE POLICY "Staff and recruiters can create/update opportunities" 
ON crm_opportunities FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'ADMIN'::text, 'OPERATIONS_HR'::text]));

DROP POLICY IF EXISTS "Staff and recruiters can view documents" ON crm_documents;
CREATE POLICY "Staff and recruiters can view documents" 
ON crm_documents FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'MANAGEMENT'::text, 'ADMIN'::text, 'OPERATIONS_HR'::text]));

DROP POLICY IF EXISTS "Staff and recruiters can view assignments" ON crm_recruiter_assignments;
CREATE POLICY "Staff and recruiters can view assignments" 
ON crm_recruiter_assignments FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'MANAGEMENT'::text, 'ADMIN'::text, 'OPERATIONS_HR'::text]));

DROP POLICY IF EXISTS "Staff and recruiters can view SPOC links" ON crm_spoc_links;
CREATE POLICY "Staff and recruiters can view SPOC links" 
ON crm_spoc_links FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'MANAGEMENT'::text, 'ADMIN'::text, 'OPERATIONS_HR'::text]));

-- Update RLS policies for allocations (Projects module)
DROP POLICY IF EXISTS "Staff can view allocations" ON allocations;
CREATE POLICY "Staff can view allocations" 
ON allocations FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'RECRUITER'::text, 'HIRING_MANAGER'::text, 'MANAGEMENT'::text, 'ADMIN'::text, 'OPERATIONS_HR'::text]));