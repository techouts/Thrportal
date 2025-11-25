-- Add foreign key constraints for contract tables
-- This fixes the 400 error by enabling PostgREST joins

ALTER TABLE public.msas 
ADD CONSTRAINT fk_msas_client_id 
FOREIGN KEY (client_id) REFERENCES public.crm_clients(id) ON DELETE CASCADE;

ALTER TABLE public.sows 
ADD CONSTRAINT fk_sows_msa_id 
FOREIGN KEY (msa_id) REFERENCES public.msas(id) ON DELETE CASCADE;

ALTER TABLE public.purchase_orders 
ADD CONSTRAINT fk_purchase_orders_client_id 
FOREIGN KEY (client_id) REFERENCES public.crm_clients(id) ON DELETE CASCADE;

-- Add documentation comments
COMMENT ON CONSTRAINT fk_msas_client_id ON public.msas IS 'Links MSAs to their client for PostgREST joins';
COMMENT ON CONSTRAINT fk_sows_msa_id ON public.sows IS 'Links SOWs to their parent MSA';
COMMENT ON CONSTRAINT fk_purchase_orders_client_id ON public.purchase_orders IS 'Links POs to their client';

-- Add a few more sample MSA records for testing
INSERT INTO public.msas (client_id, title, valid_from, valid_to, status, created_by, doc_link)
SELECT 
  c.id,
  'Master Service Agreement - ' || c.name || ' (2025)',
  CURRENT_DATE,
  CURRENT_DATE + interval '1 year',
  'active'::contract_status,
  '80e1c9ce-49f1-415e-84eb-3f78d9c6c0be'::uuid,
  'https://example.com/msa/' || LOWER(REPLACE(c.name, ' ', '-')) || '.pdf'
FROM crm_clients c
WHERE NOT EXISTS (
  SELECT 1 FROM msas m WHERE m.client_id = c.id AND m.title LIKE '%2025%'
)
LIMIT 3;