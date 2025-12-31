-- Add HIRING_MANAGER role to hrmgr@dev.local user (if not exists)
-- The user ID is cccccccc-cccc-cccc-cccc-cccccccccccc from devUsers.ts
INSERT INTO public.user_roles (user_id, role)
VALUES ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'HIRING_MANAGER')
ON CONFLICT (user_id, role) DO NOTHING;