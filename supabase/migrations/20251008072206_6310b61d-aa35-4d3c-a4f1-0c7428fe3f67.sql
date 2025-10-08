-- 1. Create unified SPOC links table
CREATE TABLE IF NOT EXISTS public.crm_spoc_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  spoc_id UUID NOT NULL REFERENCES public.crm_spocs(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('client', 'account', 'project')),
  entity_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('finance', 'project', 'sales', 'escalation', 'primary')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on crm_spoc_links
ALTER TABLE public.crm_spoc_links ENABLE ROW LEVEL SECURITY;

-- RLS policies for crm_spoc_links
CREATE POLICY "Staff and recruiters can view SPOC links"
  ON public.crm_spoc_links
  FOR SELECT
  USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER', 'HR_MANAGER', 'RECRUITER', 'HIRING_MANAGER', 'MANAGEMENT', 'ADMIN']));

CREATE POLICY "Staff and recruiters can manage SPOC links"
  ON public.crm_spoc_links
  FOR ALL
  USING (get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER', 'HR_MANAGER', 'RECRUITER', 'HIRING_MANAGER', 'ADMIN']));

-- 2. Rename location to region in crm_clients
ALTER TABLE public.crm_clients RENAME COLUMN location TO region;

-- 3. Add billing_currency and status to crm_accounts
ALTER TABLE public.crm_accounts ADD COLUMN IF NOT EXISTS billing_currency TEXT DEFAULT 'USD';
ALTER TABLE public.crm_accounts ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Active';

-- 4. Rename sla_reference to sla_reference_url in crm_clients (if needed)
ALTER TABLE public.crm_clients RENAME COLUMN sla_reference TO sla_reference_url;

-- 5. Create storage bucket for SLA references
INSERT INTO storage.buckets (id, name, public)
VALUES ('sla-references', 'sla-references', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for SLA references
CREATE POLICY "SLA files are publicly accessible"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'sla-references');

CREATE POLICY "Staff can upload SLA files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'sla-references' AND
    get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER', 'HR_MANAGER', 'ADMIN'])
  );

CREATE POLICY "Staff can update SLA files"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'sla-references' AND
    get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER', 'HR_MANAGER', 'ADMIN'])
  );

CREATE POLICY "Staff can delete SLA files"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'sla-references' AND
    get_current_user_role() = ANY (ARRAY['STAFFING_MANAGER', 'HR_MANAGER', 'ADMIN'])
  );