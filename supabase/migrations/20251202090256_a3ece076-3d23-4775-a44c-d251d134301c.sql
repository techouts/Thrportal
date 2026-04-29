-- Add development bypass RLS policies for attendance_records
CREATE POLICY "DEV: Allow all select on attendance_records"
  ON attendance_records FOR SELECT
  USING (true);

CREATE POLICY "DEV: Allow all insert on attendance_records"
  ON attendance_records FOR INSERT
  WITH CHECK (true);

CREATE POLICY "DEV: Allow all update on attendance_records"
  ON attendance_records FOR UPDATE
  USING (true)
  WITH CHECK (true);