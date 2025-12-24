-- Create leave_transactions table for tracking all leave balance changes
CREATE TABLE public.leave_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL,  -- 'CL', 'COMP_OFF', 'PL', 'LOP', etc.
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('ACCRUAL', 'DEDUCTION', 'CARRY_FORWARD', 'ADJUSTMENT')),
  change NUMERIC(5,2) NOT NULL,  -- +1.25, -2, +10, etc.
  balance NUMERIC(5,2) NOT NULL,  -- Running balance after this transaction
  description TEXT,  -- 'Monthly accrual', 'Leave approved: 15-20 Dec', 'Carry forward from 2024'
  reference_id UUID,  -- Link to leave_request_id if DEDUCTION
  transaction_date DATE NOT NULL,  -- Date of transaction
  year INTEGER NOT NULL,  -- Calendar year (2025)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Indexes for performance
CREATE INDEX idx_leave_transactions_employee_year ON public.leave_transactions(employee_id, year);
CREATE INDEX idx_leave_transactions_type_date ON public.leave_transactions(leave_type, transaction_date);
CREATE INDEX idx_leave_transactions_employee_type ON public.leave_transactions(employee_id, leave_type, year);

-- Enable RLS
ALTER TABLE public.leave_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own transactions" 
ON public.leave_transactions FOR SELECT 
USING (employee_id = auth.uid());

CREATE POLICY "HR/Admin can view all transactions" 
ON public.leave_transactions FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['HR_MANAGER'::text, 'ADMIN'::text, 'MANAGEMENT'::text]));

CREATE POLICY "System can insert transactions" 
ON public.leave_transactions FOR INSERT 
WITH CHECK (true);

CREATE POLICY "HR/Admin can manage transactions" 
ON public.leave_transactions FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['HR_MANAGER'::text, 'ADMIN'::text]));

-- Development access policy
CREATE POLICY "DEV: Allow all select on leave_transactions" 
ON public.leave_transactions FOR SELECT 
USING (true);

CREATE POLICY "DEV: Allow all insert on leave_transactions" 
ON public.leave_transactions FOR INSERT 
WITH CHECK (true);

-- Create function to handle leave approval deductions
CREATE OR REPLACE FUNCTION public.handle_leave_approval_deduction()
RETURNS TRIGGER AS $$
DECLARE
  current_balance NUMERIC(5,2);
  leave_description TEXT;
BEGIN
  -- Only process when status changes to APPROVED
  IF NEW.status = 'APPROVED' AND (OLD.status IS NULL OR OLD.status != 'APPROVED') THEN
    -- Get current balance for this employee/leave_type for the current year
    SELECT COALESCE(
      (SELECT balance FROM public.leave_transactions 
       WHERE employee_id = NEW.employee_id 
         AND leave_type = NEW.leave_type 
         AND year = EXTRACT(YEAR FROM NEW.start_date)::INTEGER
       ORDER BY transaction_date DESC, created_at DESC 
       LIMIT 1),
      0
    ) INTO current_balance;
    
    -- Build description
    leave_description := 'Leave approved: ' || 
      TO_CHAR(NEW.start_date, 'DD Mon') || 
      CASE WHEN NEW.start_date != NEW.end_date 
        THEN ' - ' || TO_CHAR(NEW.end_date, 'DD Mon YYYY')
        ELSE ' ' || TO_CHAR(NEW.start_date, 'YYYY')
      END;
    
    -- Insert deduction transaction
    INSERT INTO public.leave_transactions (
      employee_id, 
      leave_type, 
      transaction_type,
      change, 
      balance, 
      description, 
      reference_id, 
      transaction_date, 
      year,
      created_by
    ) VALUES (
      NEW.employee_id, 
      NEW.leave_type, 
      'DEDUCTION',
      -ABS(NEW.total_days),
      current_balance - ABS(NEW.total_days),
      leave_description,
      NEW.id,
      COALESCE(NEW.approved_at::date, CURRENT_DATE),
      EXTRACT(YEAR FROM NEW.start_date)::INTEGER,
      NEW.approved_by
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for leave approval
DROP TRIGGER IF EXISTS trigger_leave_approval_deduction ON public.leave_requests;
CREATE TRIGGER trigger_leave_approval_deduction
AFTER UPDATE ON public.leave_requests
FOR EACH ROW EXECUTE FUNCTION public.handle_leave_approval_deduction();