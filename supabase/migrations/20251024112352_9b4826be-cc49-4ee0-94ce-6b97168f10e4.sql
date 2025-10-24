-- ============================================
-- PHASE 1: Trigger for Automatic Approval Steps
-- ============================================

-- Function to auto-create approval steps when JD becomes Active
CREATE OR REPLACE FUNCTION auto_create_approval_steps()
RETURNS TRIGGER AS $$
DECLARE
  approval_chain JSONB;
  chain_step JSONB;
  rule_name TEXT;
BEGIN
  -- Only proceed if status is being changed to 'Active' and no steps exist
  IF NEW.status = 'Active' AND (OLD.status IS NULL OR OLD.status != 'Active') THEN
    
    -- Check if approval steps already exist
    IF EXISTS (
      SELECT 1 FROM jd_approval_steps 
      WHERE jd_approval_id = NEW.id
    ) THEN
      RETURN NEW;
    END IF;
    
    -- Determine rule based on is_internal flag
    rule_name := CASE 
      WHEN NEW.is_internal THEN 'Internal Position Approval'
      ELSE 'External Position Approval'
    END;
    
    -- Get approval chain for the appropriate rule
    SELECT ar.approval_chain INTO approval_chain
    FROM approval_rules ar
    WHERE ar.rule_name = rule_name 
      AND ar.is_active = true
    LIMIT 1;
    
    -- If approval chain exists, create steps
    IF approval_chain IS NOT NULL THEN
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
          NEW.id,
          (chain_step->>'step')::integer,
          chain_step->>'role',
          'pending'::approval_step_status,
          (chain_step->>'sla_hours')::integer,
          CASE 
            WHEN (chain_step->>'step')::integer = 1 THEN now()
            ELSE NULL
          END
        );
      END LOOP;
      
      -- Update current_step to 1 if not already set
      IF NEW.current_step IS NULL OR NEW.current_step = 0 THEN
        NEW.current_step := 1;
      END IF;
      
      -- Set approval_status to 'pending'
      NEW.approval_status := 'pending';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_auto_create_approval_steps ON jd_approvals;
CREATE TRIGGER trigger_auto_create_approval_steps
  BEFORE INSERT OR UPDATE OF status ON jd_approvals
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_approval_steps();

-- ============================================
-- PHASE 4: Fix Existing "New role" JD
-- ============================================

-- Fix the specific "New role" JD
INSERT INTO jd_approval_steps (jd_approval_id, step_number, approver_role, status, sla_hours, assigned_at)
VALUES 
  ('73b70e35-9e9f-4314-896c-ff63ed993fe9', 1, 'MANAGEMENT', 'pending', 48, now()),
  ('73b70e35-9e9f-4314-896c-ff63ed993fe9', 2, 'HR_MANAGER', 'pending', 24, NULL)
ON CONFLICT DO NOTHING;

-- Set current_step and approval_status
UPDATE jd_approvals 
SET current_step = 1, approval_status = 'pending'
WHERE id = '73b70e35-9e9f-4314-896c-ff63ed993fe9';

-- Add MANAGEMENT role user for testing
INSERT INTO user_roles (user_id, role) 
VALUES ('80e1c9ce-49f1-415e-84eb-3f78d9c6c0be', 'MANAGEMENT')
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================
-- PHASE 6: Backfill Missing Approval Steps
-- ============================================

-- Backfill missing approval steps for all Active JDs without steps
DO $$
DECLARE
  jd_rec RECORD;
  approval_chain JSONB;
  chain_step JSONB;
  rule_name TEXT;
  existing_steps_count INTEGER;
BEGIN
  FOR jd_rec IN 
    SELECT id, is_internal 
    FROM jd_approvals 
    WHERE status = 'Active'
  LOOP
    -- Check if steps already exist
    SELECT COUNT(*) INTO existing_steps_count
    FROM jd_approval_steps
    WHERE jd_approval_id = jd_rec.id;
    
    IF existing_steps_count = 0 THEN
      -- Determine rule based on is_internal
      rule_name := CASE 
        WHEN jd_rec.is_internal THEN 'Internal Position Approval'
        ELSE 'External Position Approval'
      END;
      
      -- Get approval chain
      SELECT ar.approval_chain INTO approval_chain
      FROM approval_rules ar
      WHERE ar.rule_name = rule_name AND ar.is_active = true
      LIMIT 1;
      
      -- Create steps if chain exists
      IF approval_chain IS NOT NULL THEN
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
            'pending'::approval_step_status,
            (chain_step->>'sla_hours')::integer,
            CASE WHEN (chain_step->>'step')::integer = 1 THEN now() ELSE NULL END
          );
        END LOOP;
        
        -- Update JD approval record
        UPDATE jd_approvals 
        SET 
          current_step = 1,
          approval_status = 'pending'
        WHERE id = jd_rec.id AND (current_step IS NULL OR current_step = 0);
        
        RAISE NOTICE 'Created approval steps for JD: %', jd_rec.id;
      END IF;
    END IF;
  END LOOP;
END $$;