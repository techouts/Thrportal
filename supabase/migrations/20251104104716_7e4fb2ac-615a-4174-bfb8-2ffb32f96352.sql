-- Add unique constraint to jd_id to enable proper upsert behavior
ALTER TABLE jd_ownership_assignments 
ADD CONSTRAINT jd_ownership_assignments_jd_id_unique UNIQUE (jd_id);

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT jd_ownership_assignments_jd_id_unique 
ON jd_ownership_assignments 
IS 'Ensures each JD can have only one ownership assignment record, enabling upsert operations';