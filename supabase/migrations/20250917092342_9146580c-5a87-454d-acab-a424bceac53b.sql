-- Temporarily disable RLS for development to allow data visibility
-- This allows viewing the existing sample data without authentication

ALTER TABLE crm_clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE crm_accounts DISABLE ROW LEVEL SECURITY; 
ALTER TABLE crm_projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE crm_spocs DISABLE ROW LEVEL SECURITY;