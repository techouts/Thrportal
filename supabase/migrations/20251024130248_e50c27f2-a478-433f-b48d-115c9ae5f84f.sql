-- Phase 2: Clean up duplicate approval steps and prevent future duplicates

-- Delete duplicate steps, keeping ONLY the LAST created (most recent) for each jd_approval_id + step_number
DELETE FROM jd_approval_steps
WHERE id IN (
  SELECT id FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY jd_approval_id, step_number 
        ORDER BY created_at DESC
      ) as rn
    FROM jd_approval_steps
  ) t
  WHERE rn > 1
);

-- Add unique constraint to prevent future duplicates
ALTER TABLE jd_approval_steps 
ADD CONSTRAINT unique_jd_approval_step 
UNIQUE (jd_approval_id, step_number);