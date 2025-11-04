-- Fix RLS policy on jd_ownership_metadata table
-- The policy was missing WITH CHECK clause, causing INSERT/UPDATE operations to fail

DROP POLICY IF EXISTS "Staff managers can manage metadata" ON jd_ownership_metadata;

CREATE POLICY "Staff managers can manage metadata"
ON jd_ownership_metadata
FOR ALL
USING (
  get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'ADMIN'::text])
)
WITH CHECK (
  get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER'::text, 'HR_MANAGER'::text, 'ADMIN'::text])
);