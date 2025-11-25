-- Drop existing incomplete policies
DROP POLICY IF EXISTS "Authenticated users can upload candidate documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view candidate documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete candidate documents" ON storage.objects;

-- Create comprehensive policies for candidate-documents bucket
CREATE POLICY "authenticated_users_upload_candidate_docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'candidate-documents');

CREATE POLICY "authenticated_users_update_candidate_docs"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'candidate-documents')
WITH CHECK (bucket_id = 'candidate-documents');

CREATE POLICY "authenticated_users_view_candidate_docs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'candidate-documents');

CREATE POLICY "authenticated_users_delete_candidate_docs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'candidate-documents');