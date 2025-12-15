-- DEV-only policy to allow updating profiles while using dev-mode auth
CREATE POLICY "DEV: Allow all update on profiles"
ON public.profiles
FOR UPDATE
USING (true)
WITH CHECK (true);