-- Add new columns for project estimation
ALTER TABLE crm_opportunities 
ADD COLUMN estimation_cost DECIMAL(15,2),
ADD COLUMN currency TEXT DEFAULT 'INR';

-- Remove jd_count column
ALTER TABLE crm_opportunities 
DROP COLUMN jd_count;