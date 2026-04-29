-- Add INSERT policy for slot creation that allows dev mode
CREATE POLICY "Users can create interview slots" 
ON interview_slots 
FOR INSERT 
WITH CHECK (
  get_current_user_role() IN ('STAFFING_MANAGER', 'ADMIN', 'RECRUITER', 'HIRING_MANAGER', 'HR_MANAGER')
  OR
  EXISTS (SELECT 1 FROM profiles WHERE id = created_by)
);