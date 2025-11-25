-- Drop the existing BEFORE trigger
DROP TRIGGER IF EXISTS trigger_auto_create_approval_steps ON jd_approvals;

-- Recreate the function for AFTER trigger
CREATE OR REPLACE FUNCTION public.auto_create_approval_steps()
RETURNS TRIGGER AS $$
DECLARE
  approval_chain JSONB;
  chain_step JSONB;
  rule_name TEXT;
  steps_exist BOOLEAN;
BEGIN
  IF NEW.status = 'Active' AND (TG_OP = 'INSERT' OR (OLD.status IS DISTINCT FROM NEW.status)) THEN
    
    SELECT EXISTS (
      SELECT 1 FROM jd_approval_steps 
      WHERE jd_approval_id = NEW.id
    ) INTO steps_exist;
    
    IF steps_exist THEN
      RETURN NEW;
    END IF;
    
    rule_name := CASE 
      WHEN NEW.is_internal THEN 'Internal Position Approval'
      ELSE 'External Position Approval'
    END;
    
    SELECT ar.approval_chain INTO approval_chain
    FROM approval_rules ar
    WHERE ar.rule_name = rule_name 
      AND ar.is_active = true
    LIMIT 1;
    
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
      
      UPDATE jd_approvals 
      SET 
        current_step = COALESCE(current_step, 1),
        approval_status = COALESCE(approval_status, 'pending')
      WHERE id = NEW.id 
        AND (current_step IS NULL OR current_step = 0);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create AFTER trigger
CREATE TRIGGER trigger_auto_create_approval_steps
  AFTER INSERT OR UPDATE OF status ON jd_approvals
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_approval_steps();