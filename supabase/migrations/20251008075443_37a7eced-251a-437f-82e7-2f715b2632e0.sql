-- Add development write access policies for CRM tables
-- These allow writes when auth.uid() is NULL (dev mode)
-- IMPORTANT: Remove these policies in production!

-- Clients table
CREATE POLICY "Development write access for clients"
ON crm_clients
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Accounts table  
CREATE POLICY "Development write access for accounts"
ON crm_accounts
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Projects table
CREATE POLICY "Development write access for projects"
ON crm_projects
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- SPOCs table
CREATE POLICY "Development write access for spocs"
ON crm_spocs
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- SPOC Links table
CREATE POLICY "Development write access for spoc links"
ON crm_spoc_links
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Interactions table
CREATE POLICY "Development write access for interactions"
ON crm_interactions
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Opportunities table
CREATE POLICY "Development write access for opportunities"
ON crm_opportunities
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Documents table
CREATE POLICY "Development write access for documents"
ON crm_documents
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Recruiter assignments table
CREATE POLICY "Development write access for recruiter assignments"
ON crm_recruiter_assignments
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);