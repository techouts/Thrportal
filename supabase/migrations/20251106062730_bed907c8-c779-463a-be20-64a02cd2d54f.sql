-- Add foreign key constraint from user_roles.user_id to profiles.id
-- This enables PostgREST to perform joins when querying user_roles with profiles
ALTER TABLE user_roles 
ADD CONSTRAINT user_roles_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;