-- Clean up duplicate user entries
-- Keep only the primary UUIDs from devUsers.ts and delete the duplicates

-- Delete duplicate user_roles entries
DELETE FROM user_roles WHERE user_id IN (
  '77777777-7777-7777-7777-777777777777',  -- Duplicate Hari HiringMgr
  '66666666-6666-6666-6666-666666666666',  -- Duplicate Ravi Recruiter
  '88888888-8888-8888-8888-888888888888'   -- Duplicate Sara StaffingMgr
);

-- Delete duplicate profiles entries
DELETE FROM profiles WHERE id IN (
  '77777777-7777-7777-7777-777777777777',
  '66666666-6666-6666-6666-666666666666',
  '88888888-8888-8888-8888-888888888888'
);