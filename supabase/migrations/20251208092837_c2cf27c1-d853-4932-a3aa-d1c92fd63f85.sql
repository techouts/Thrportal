-- Drop the existing check constraint
ALTER TABLE attendance_records 
DROP CONSTRAINT IF EXISTS attendance_records_location_check;

-- Add the updated check constraint with 'WFH' included
ALTER TABLE attendance_records 
ADD CONSTRAINT attendance_records_location_check 
CHECK (location = ANY (ARRAY['Office'::text, 'Remote'::text, 'Field'::text, 'WFH'::text]));