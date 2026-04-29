-- Drop the existing foreign key constraint
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_project_id_fkey;

-- Add new foreign key referencing crm_projects
ALTER TABLE tasks 
ADD CONSTRAINT tasks_project_id_fkey 
FOREIGN KEY (project_id) 
REFERENCES crm_projects(id) 
ON DELETE CASCADE;