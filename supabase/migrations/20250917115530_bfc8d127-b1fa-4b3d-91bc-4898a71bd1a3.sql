-- Fix security issues by enabling RLS on tables that are missing it
-- First, let's check which tables need RLS enabled by looking at the existing tables

-- Enable RLS on existing tables that don't have it enabled
ALTER TABLE approval_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_recruiter_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_spocs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE jd_approval_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE jd_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE jd_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE msas ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_sow_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_spoc_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE sow_po_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sows ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;

-- Fix the auto_expire_slots function to have proper search_path
CREATE OR REPLACE FUNCTION auto_expire_slots()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE interview_slots 
    SET status = 'expired',
        updated_at = now(),
        updated_by = NULL
    WHERE status = 'available' 
    AND date + to_time < now();
    
    -- Log the expiry
    INSERT INTO slot_change_log (slot_id, action, actor_id, details)
    SELECT id, 'expired', '00000000-0000-0000-0000-000000000000'::uuid, '{"auto_expired": true}'::jsonb
    FROM interview_slots 
    WHERE status = 'expired' 
    AND updated_at >= now() - INTERVAL '1 minute';
END;
$$;