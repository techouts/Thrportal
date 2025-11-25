-- Update existing candidates with old text values to match real recruiters
UPDATE candidates 
SET recruiter_owner = 'Ravi Recruiter'
WHERE recruiter_owner IN ('recruiter-1', 'Tom Wilson', '');

UPDATE candidates 
SET recruiter_owner = 'Hari HiringMgr'
WHERE recruiter_owner = 'Jane Smith';

UPDATE candidates 
SET recruiter_owner = 'Shanti StaffingMgr'
WHERE recruiter_owner = 'Mike Johnson';

UPDATE candidates 
SET recruiter_owner = 'Hema HRMgr'
WHERE recruiter_owner = 'Sarah Lee';