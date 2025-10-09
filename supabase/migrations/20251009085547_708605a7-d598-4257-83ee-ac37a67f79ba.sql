-- Create storage bucket for contracts
INSERT INTO storage.buckets (id, name, public)
VALUES ('contracts', 'contracts', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for contracts bucket
CREATE POLICY "Authenticated users can view contract files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'contracts');

CREATE POLICY "Authorized roles can upload contract files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'contracts' AND
  (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('ADMIN', 'MANAGEMENT', 'FINANCE_MANAGER', 'HR_MANAGER', 'STAFFING_MANAGER')
    )
  )
);

CREATE POLICY "Authorized roles can update contract files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'contracts' AND
  (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('ADMIN', 'MANAGEMENT', 'FINANCE_MANAGER', 'HR_MANAGER', 'STAFFING_MANAGER')
    )
  )
);

CREATE POLICY "Authorized roles can delete contract files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'contracts' AND
  (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('ADMIN', 'MANAGEMENT', 'FINANCE_MANAGER', 'HR_MANAGER', 'STAFFING_MANAGER')
    )
  )
);

-- Seed sample MSA data
INSERT INTO msas (id, client_id, title, valid_from, valid_to, doc_link, status, created_by)
SELECT 
  gen_random_uuid(),
  c.id,
  'Master Service Agreement - ' || c.name,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 year',
  'https://jflphinczkhzabmpwdok.supabase.co/storage/v1/object/public/contracts/msas/sample-' || c.id || '.pdf',
  'active'::contract_status,
  (SELECT id FROM profiles WHERE role = 'ADMIN' LIMIT 1)
FROM crm_clients c
LIMIT 3
ON CONFLICT DO NOTHING;

-- Seed sample SOW data
INSERT INTO sows (id, msa_id, title, valid_from, valid_to, amount_cap, currency, doc_link, status, created_by)
SELECT 
  gen_random_uuid(),
  m.id,
  'SOW - ' || m.title || ' - Phase 1',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '6 months',
  250000.00,
  'USD',
  'https://jflphinczkhzabmpwdok.supabase.co/storage/v1/object/public/contracts/sows/sample-' || m.id || '.pdf',
  'active'::contract_status,
  (SELECT id FROM profiles WHERE role = 'ADMIN' LIMIT 1)
FROM msas m
LIMIT 3
ON CONFLICT DO NOTHING;

-- Seed sample Purchase Order data
INSERT INTO purchase_orders (id, client_id, po_number, valid_from, valid_to, total_amount, remaining_amount, currency, doc_link, status, created_by)
SELECT 
  gen_random_uuid(),
  c.id,
  'PO-2025-' || LPAD((ROW_NUMBER() OVER ())::text, 3, '0'),
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '6 months',
  100000.00,
  75000.00,
  'USD',
  'https://jflphinczkhzabmpwdok.supabase.co/storage/v1/object/public/contracts/pos/sample-' || c.id || '.pdf',
  'active'::contract_status,
  (SELECT id FROM profiles WHERE role = 'ADMIN' LIMIT 1)
FROM crm_clients c
LIMIT 3
ON CONFLICT DO NOTHING;