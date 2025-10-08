-- Drop the CHECK constraint that requires client_id OR account_id
-- This constraint is no longer needed since we use crm_spoc_links for relationships
ALTER TABLE crm_spocs DROP CONSTRAINT IF EXISTS crm_spocs_check;