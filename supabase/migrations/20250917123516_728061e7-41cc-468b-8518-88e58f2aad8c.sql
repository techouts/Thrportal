-- Temporarily allow public access to interview slots for development
-- This will be removed once proper authentication is implemented
CREATE POLICY "Allow public access to interview slots (development only)"
ON public.interview_slots
FOR SELECT
TO public
USING (true);