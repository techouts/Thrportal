-- Add document-related columns to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS work_experience jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS education_details jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS identity_documents jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS offer_letter_url text;

-- Create storage bucket for employee documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('employee-documents', 'employee-documents', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for employee documents bucket
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'employee-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view all employee documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'employee-documents');

CREATE POLICY "Users can update own documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'employee-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'employee-documents' AND auth.uid()::text = (storage.foldername(name))[1]);