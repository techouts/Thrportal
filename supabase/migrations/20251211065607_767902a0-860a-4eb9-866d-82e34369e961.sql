-- Drop the existing restrictive development policy
DROP POLICY IF EXISTS "Development write access for allocations" ON allocations;

-- Create a permissive development policy for authenticated users
CREATE POLICY "Development write access for allocations"
ON allocations
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);