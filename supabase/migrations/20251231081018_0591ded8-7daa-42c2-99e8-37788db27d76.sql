-- Add HIRING_MANAGER role to the REAL hrmgr@dev.local Supabase user
-- User ID: 74d4defd-450e-4b11-89ca-01a6fe4d4c4c (from auth.users)
INSERT INTO public.user_roles (user_id, role)
VALUES ('74d4defd-450e-4b11-89ca-01a6fe4d4c4c', 'HIRING_MANAGER')
ON CONFLICT (user_id, role) DO NOTHING;