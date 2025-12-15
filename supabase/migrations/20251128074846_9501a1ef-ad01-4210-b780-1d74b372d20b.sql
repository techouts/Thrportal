-- Drop existing authenticated-only DEV policies for slot_assignments
DROP POLICY IF EXISTS "DEV: Allow all insert on slot_assignments" ON public.slot_assignments;
DROP POLICY IF EXISTS "DEV: Allow all select on slot_assignments" ON public.slot_assignments;
DROP POLICY IF EXISTS "DEV: Allow all update on slot_assignments" ON public.slot_assignments;

-- Drop existing authenticated-only DEV policy for slot_change_log
DROP POLICY IF EXISTS "DEV: Allow all insert on slot_change_log" ON public.slot_change_log;

-- Recreate policies with public role (works for both anon and authenticated)
CREATE POLICY "DEV: Allow all insert on slot_assignments"
ON public.slot_assignments FOR INSERT TO public
WITH CHECK (true);

CREATE POLICY "DEV: Allow all select on slot_assignments"
ON public.slot_assignments FOR SELECT TO public
USING (true);

CREATE POLICY "DEV: Allow all update on slot_assignments"
ON public.slot_assignments FOR UPDATE TO public
USING (true) WITH CHECK (true);

CREATE POLICY "DEV: Allow all insert on slot_change_log"
ON public.slot_change_log FOR INSERT TO public
WITH CHECK (true);

CREATE POLICY "DEV: Allow all select on slot_change_log"
ON public.slot_change_log FOR SELECT TO public
USING (true);