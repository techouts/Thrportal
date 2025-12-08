-- Add DEV bypass policy for storage uploads to attendance-documents bucket
CREATE POLICY "DEV: Allow authenticated uploads to attendance-documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'attendance-documents' AND auth.role() = 'authenticated');