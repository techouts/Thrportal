-- Drop the incorrect foreign key constraint pointing to projects table
ALTER TABLE allocations DROP CONSTRAINT IF EXISTS allocations_project_id_fkey;

-- Add the correct foreign key constraint pointing to crm_projects table
ALTER TABLE allocations 
ADD CONSTRAINT allocations_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES crm_projects(id);