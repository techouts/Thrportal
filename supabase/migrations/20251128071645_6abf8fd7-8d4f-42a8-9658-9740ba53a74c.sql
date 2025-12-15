-- Add DEV bypass RLS policies for slot_assignments table
CREATE POLICY "DEV: Allow all insert on slot_assignments"
ON slot_assignments FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "DEV: Allow all select on slot_assignments"
ON slot_assignments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "DEV: Allow all update on slot_assignments"
ON slot_assignments FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Add DEV bypass RLS policy for slot_change_log table
CREATE POLICY "DEV: Allow all insert on slot_change_log"
ON slot_change_log FOR INSERT
TO authenticated
WITH CHECK (true);