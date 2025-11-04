-- DEV MODE ONLY: Temporary RLS bypass for jd_ownership_assignments
-- ⚠️ WARNING: Remove this policy before deploying to production!
-- This allows anon role to perform all operations for local development testing

CREATE POLICY "DEV_MODE_BYPASS_jd_ownership_assignments"
ON public.jd_ownership_assignments
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- Add a comment to remind developers this is temporary
COMMENT ON POLICY "DEV_MODE_BYPASS_jd_ownership_assignments" ON public.jd_ownership_assignments 
IS 'TEMPORARY DEV POLICY - Remove before production deployment. Allows anon role to bypass RLS for local development.';