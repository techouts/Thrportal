-- Drop existing approval_status if it exists and recreate
DROP TYPE IF EXISTS public.approval_status CASCADE;

-- Create enums for better type safety
CREATE TYPE public.contract_status AS ENUM ('draft', 'active', 'expired', 'terminated');
CREATE TYPE public.invoice_status AS ENUM ('draft', 'submitted', 'approved', 'paid', 'rejected');
CREATE TYPE public.parser_status AS ENUM ('pending', 'success', 'failed', 'manual');
CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');

-- MSA (Master Service Agreement) table
CREATE TABLE public.msas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  title TEXT NOT NULL,
  valid_from DATE NOT NULL,
  valid_to DATE NOT NULL,
  doc_link TEXT,
  status contract_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- SOW (Statement of Work) table
CREATE TABLE public.sows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  msa_id UUID NOT NULL,
  title TEXT NOT NULL,
  valid_from DATE NOT NULL,
  valid_to DATE NOT NULL,
  role_caps JSONB DEFAULT '{}',
  amount_cap NUMERIC(12,2),
  currency TEXT DEFAULT 'USD',
  rate_cards JSONB DEFAULT '{}',
  status contract_status NOT NULL DEFAULT 'draft',
  doc_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- PO (Purchase Order) table
CREATE TABLE public.purchase_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  po_number TEXT NOT NULL,
  valid_from DATE NOT NULL,
  valid_to DATE NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL,
  remaining_amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  doc_link TEXT,
  status contract_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- SOW-PO Junction table
CREATE TABLE public.sow_po_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sow_id UUID NOT NULL,
  po_id UUID NOT NULL,
  allocated_amount NUMERIC(12,2) NOT NULL,
  priority_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(sow_id, po_id)
);

-- Project-SOW Junction table
CREATE TABLE public.project_sow_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  sow_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, sow_id)
);

-- Enhanced Assignments table (replacing existing if needed)
CREATE TABLE public.contract_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  sow_id UUID,
  role TEXT NOT NULL,
  location_type TEXT CHECK (location_type IN ('onsite', 'offshore', 'hybrid')),
  billable_flag BOOLEAN DEFAULT true,
  shadow_flag BOOLEAN DEFAULT false,
  client_approval_flag BOOLEAN DEFAULT false,
  start_date DATE NOT NULL,
  end_date DATE,
  allocation_pct NUMERIC(5,2) DEFAULT 100.00,
  bill_rate NUMERIC(10,2) DEFAULT 0,
  cost_rate NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  project_id UUID,
  invoice_number TEXT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status invoice_status NOT NULL DEFAULT 'draft',
  po_id UUID,
  sow_id UUID,
  parser_status parser_status DEFAULT 'pending',
  file_link TEXT,
  parsed_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Invoice Line Items table
CREATE TABLE public.invoice_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL,
  employee_id UUID,
  role TEXT,
  hours NUMERIC(8,2),
  amount NUMERIC(10,2) NOT NULL,
  sow_id UUID,
  po_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Approval Log table
CREATE TABLE public.approval_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  reason TEXT NOT NULL,
  justification TEXT,
  status approval_status NOT NULL DEFAULT 'pending',
  approved_by UUID,
  requested_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.msas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sow_po_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_sow_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_logs ENABLE ROW LEVEL SECURITY;