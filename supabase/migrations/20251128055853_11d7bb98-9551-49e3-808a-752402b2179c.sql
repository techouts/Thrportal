-- Drop the previous policy that doesn't work
DROP POLICY IF EXISTS "Users can create interview slots" ON interview_slots;

-- Add development bypass policy for INSERT (matches applications table pattern)
CREATE POLICY "DEV: Allow all insert on interview_slots" 
ON interview_slots 
FOR INSERT 
WITH CHECK (true);

-- Add development bypass policy for UPDATE
CREATE POLICY "DEV: Allow all update on interview_slots" 
ON interview_slots 
FOR UPDATE 
USING (true);