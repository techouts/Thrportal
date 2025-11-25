-- Phase 1: Add approval_status column to jd_approvals
ALTER TABLE jd_approvals 
ADD COLUMN approval_status text DEFAULT 'pending' 
CHECK (approval_status IN ('pending', 'in_review', 'approved', 'rejected', 'changes_requested'));

CREATE INDEX idx_jd_approvals_approval_status ON jd_approvals(approval_status);

-- Update existing Active JDs to pending approval status
UPDATE jd_approvals 
SET approval_status = 'pending' 
WHERE status = 'Active';

-- Phase 2: Update approval_rules with new chains
DELETE FROM approval_rules WHERE is_active = true;

-- Internal Position: MANAGEMENT → HR_MANAGER
INSERT INTO approval_rules (rule_name, conditions, approval_chain, is_active)
VALUES (
  'Internal Position Approval',
  '{"position_type": "internal"}'::jsonb,
  '[
    {"step": 1, "role": "MANAGEMENT", "sla_hours": 48, "quorum": "any"},
    {"step": 2, "role": "HR_MANAGER", "sla_hours": 24, "quorum": "any"}
  ]'::jsonb,
  true
);

-- External Position: STAFFING_MANAGER → HR_MANAGER
INSERT INTO approval_rules (rule_name, conditions, approval_chain, is_active)
VALUES (
  'External Position Approval',
  '{"position_type": "external"}'::jsonb,
  '[
    {"step": 1, "role": "STAFFING_MANAGER", "sla_hours": 48, "quorum": "any"},
    {"step": 2, "role": "HR_MANAGER", "sla_hours": 24, "quorum": "any"}
  ]'::jsonb,
  true
);

-- Phase 3: Create approval steps for existing Active JDs
DO $$
DECLARE
  jd_rec RECORD;
  approval_chain JSONB;
  chain_step JSONB;
BEGIN
  FOR jd_rec IN 
    SELECT id, is_internal FROM jd_approvals WHERE status = 'Active'
  LOOP
    -- Get appropriate approval chain
    IF jd_rec.is_internal THEN
      SELECT ar.approval_chain INTO approval_chain 
      FROM approval_rules ar
      WHERE ar.rule_name = 'Internal Position Approval' AND ar.is_active = true;
    ELSE
      SELECT ar.approval_chain INTO approval_chain 
      FROM approval_rules ar
      WHERE ar.rule_name = 'External Position Approval' AND ar.is_active = true;
    END IF;
    
    -- Create approval steps
    FOR chain_step IN SELECT * FROM jsonb_array_elements(approval_chain)
    LOOP
      INSERT INTO jd_approval_steps (
        jd_approval_id,
        step_number,
        approver_role,
        status,
        sla_hours,
        assigned_at
      ) VALUES (
        jd_rec.id,
        (chain_step->>'step')::integer,
        chain_step->>'role',
        CASE WHEN (chain_step->>'step')::integer = 1 THEN 'pending'::approval_step_status ELSE 'pending'::approval_step_status END,
        (chain_step->>'sla_hours')::integer,
        CASE WHEN (chain_step->>'step')::integer = 1 THEN now() ELSE NULL END
      );
    END LOOP;
    
    -- Update current_step to 1
    UPDATE jd_approvals SET current_step = 1 WHERE id = jd_rec.id;
  END LOOP;
END $$;