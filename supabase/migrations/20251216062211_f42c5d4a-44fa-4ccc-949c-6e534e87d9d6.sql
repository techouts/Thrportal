-- Set employee_type = 'FTE' for admin@dev.local
UPDATE profiles 
SET employee_type = 'FTE' 
WHERE email = 'admin@dev.local';