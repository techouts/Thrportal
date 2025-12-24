-- Add expiry_date column to leave_transactions if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'leave_transactions' 
    AND column_name = 'expiry_date'
  ) THEN
    ALTER TABLE public.leave_transactions ADD COLUMN expiry_date DATE;
  END IF;
END $$;

-- Update the check constraint to include INITIAL_ALLOCATION
ALTER TABLE public.leave_transactions DROP CONSTRAINT IF EXISTS leave_transactions_transaction_type_check;
ALTER TABLE public.leave_transactions ADD CONSTRAINT leave_transactions_transaction_type_check 
  CHECK (transaction_type = ANY (ARRAY['ACCRUAL'::text, 'DEDUCTION'::text, 'CARRY_FORWARD'::text, 'ADJUSTMENT'::text, 'INITIAL_ALLOCATION'::text]));

-- Create trigger to automatically create COMP_OFF transactions when comp_off is approved
CREATE OR REPLACE FUNCTION public.handle_comp_off_approval_transaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_balance NUMERIC(5,2);
  expiry_date_val DATE;
BEGIN
  -- Only process when status changes to approved
  IF LOWER(NEW.status) = 'approved' AND (TG_OP = 'INSERT' OR OLD.status IS NULL OR LOWER(OLD.status) != 'approved') THEN
    -- Get current COMP_OFF balance
    SELECT COALESCE(
      (SELECT balance FROM public.leave_transactions 
       WHERE employee_id = NEW.employee_id 
         AND leave_type = 'COMP_OFF' 
         AND year = EXTRACT(YEAR FROM NEW.start_date)::INTEGER
       ORDER BY transaction_date DESC, created_at DESC 
       LIMIT 1),
      0
    ) INTO current_balance;
    
    -- Calculate expiry date (90 days from comp_off_date)
    expiry_date_val := NEW.comp_off_date + INTERVAL '90 days';
    
    -- Insert ACCRUAL transaction
    INSERT INTO public.leave_transactions (
      employee_id, leave_type, transaction_type, change, balance, description, 
      reference_id, transaction_date, year, expiry_date, created_by
    ) VALUES (
      NEW.employee_id, 'COMP_OFF', 'ACCRUAL', COALESCE(NEW.total_days, 1),
      current_balance + COALESCE(NEW.total_days, 1), 
      'Comp-Off earned on ' || TO_CHAR(NEW.comp_off_date, 'DD Mon YYYY'),
      NEW.id, COALESCE(NEW.approved_at::date, CURRENT_DATE),
      EXTRACT(YEAR FROM NEW.start_date)::INTEGER, expiry_date_val, NEW.approved_by
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS trigger_comp_off_approval_transaction ON comp_off_requests;
CREATE TRIGGER trigger_comp_off_approval_transaction
  AFTER INSERT OR UPDATE ON comp_off_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_comp_off_approval_transaction();