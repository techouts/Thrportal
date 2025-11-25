-- Create storage bucket for candidate documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('candidate-documents', 'candidate-documents', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for candidate-documents bucket
CREATE POLICY "Authenticated users can upload candidate documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'candidate-documents');

CREATE POLICY "Authenticated users can view candidate documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'candidate-documents');

CREATE POLICY "Authenticated users can delete candidate documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'candidate-documents');