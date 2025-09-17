-- First, let's insert a sample admin profile that can be used for testing
-- Note: In production, this should be created through proper authentication flow

-- Insert a test admin profile (this is for development/testing only)
INSERT INTO public.profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    display_name, 
    role
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'admin@test.com',
    'Admin',
    'User', 
    'Admin User',
    'ADMIN'
) ON CONFLICT (id) DO UPDATE SET
    role = 'ADMIN',
    email = 'admin@test.com',
    display_name = 'Admin User';

-- Update RLS policies to also allow access for unauthenticated users (for development)
-- This is temporary to allow data visibility during development

CREATE POLICY "Allow development access to clients" ON crm_clients
FOR SELECT 
USING (true);

CREATE POLICY "Allow development access to accounts" ON crm_accounts  
FOR SELECT
USING (true);

CREATE POLICY "Allow development access to projects" ON crm_projects
FOR SELECT 
USING (true);

CREATE POLICY "Allow development access to spocs" ON crm_spocs
FOR SELECT
USING (true);