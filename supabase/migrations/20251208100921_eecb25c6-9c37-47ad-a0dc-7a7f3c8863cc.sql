-- Fix storage policies - remove auth checks for dev mode
DROP POLICY IF EXISTS "Users can upload attendance documents" ON storage.objects;
DROP POLICY IF EXISTS "DEV: Allow authenticated uploads to attendance-documents" ON storage.objects;
DROP POLICY IF EXISTS "DEV: Allow all uploads to attendance-documents" ON storage.objects;

-- Create a truly permissive DEV policy (no auth checks at all)
CREATE POLICY "DEV: Allow all uploads to attendance-documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'attendance-documents');

-- Also allow reading/selecting files from the bucket
CREATE POLICY "DEV: Allow all reads from attendance-documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'attendance-documents');

-- Make attendance_record_id nullable for synthetic absent records
ALTER TABLE public.attendance_regularization_requests 
ALTER COLUMN attendance_record_id DROP NOT NULL;

-- Drop the foreign key constraint since synthetic IDs don't exist in attendance_records
ALTER TABLE public.attendance_regularization_requests 
DROP CONSTRAINT IF EXISTS attendance_regularization_requests_attendance_record_id_fkey;