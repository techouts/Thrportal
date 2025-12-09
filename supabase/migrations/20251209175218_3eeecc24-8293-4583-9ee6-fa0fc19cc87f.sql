-- Add ADMIN role to user_roles for the Supabase user
INSERT INTO user_roles (user_id, role) 
VALUES ('fd017bbb-a24e-45fd-bf6c-6cc8e71279df', 'ADMIN')
ON CONFLICT (user_id, role) DO NOTHING;