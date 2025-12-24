
-- Step 1: Set date_of_joining for dev users
UPDATE profiles SET date_of_joining = '2020-01-01' WHERE email = 'admin@dev.local';
UPDATE profiles SET date_of_joining = '2023-06-15' WHERE email = 'manager@dev.local';

-- Step 2: Clear and rebuild leave transactions for 2025
DELETE FROM leave_transactions WHERE year = 2025;

-- Step 3: Insert monthly accruals for all employees with valid date_of_joining
DO $$
DECLARE
  emp RECORD;
  month_date DATE;
  accrual_rate NUMERIC := 1.25;
  running_balance NUMERIC := 0;
  month_num INTEGER;
  join_month INTEGER;
  join_year INTEGER;
  days_in_month INTEGER;
  days_worked INTEGER;
  pro_rata_amount NUMERIC;
BEGIN
  FOR emp IN 
    SELECT id, date_of_joining, email 
    FROM profiles 
    WHERE date_of_joining IS NOT NULL 
      AND is_active = true
  LOOP
    running_balance := 0;
    join_month := EXTRACT(MONTH FROM emp.date_of_joining)::INTEGER;
    join_year := EXTRACT(YEAR FROM emp.date_of_joining)::INTEGER;
    
    FOR month_num IN 1..12 LOOP
      month_date := make_date(2025, month_num, 1);
      
      IF join_year > 2025 OR (join_year = 2025 AND join_month > month_num) THEN
        CONTINUE;
      END IF;
      
      IF join_year = 2025 AND join_month = month_num THEN
        days_in_month := EXTRACT(DAY FROM (month_date + INTERVAL '1 month - 1 day'))::INTEGER;
        days_worked := days_in_month - EXTRACT(DAY FROM emp.date_of_joining)::INTEGER + 1;
        pro_rata_amount := ROUND((accrual_rate * days_worked / days_in_month)::NUMERIC, 2);
      ELSE
        pro_rata_amount := accrual_rate;
      END IF;
      
      running_balance := running_balance + pro_rata_amount;
      
      INSERT INTO leave_transactions (
        employee_id, leave_type, transaction_type, change, balance, description, transaction_date, year
      ) VALUES (
        emp.id, 'CL', 'ACCRUAL', pro_rata_amount, running_balance,
        'Monthly accrual - ' || TO_CHAR(month_date, 'Mon YYYY'), month_date, 2025
      );
    END LOOP;
  END LOOP;
END $$;

-- Step 4: Apply leave deductions (using lowercase 'approved' status)
DO $$
DECLARE
  emp_rec RECORD;
  leave_rec RECORD;
  current_bal NUMERIC;
BEGIN
  FOR emp_rec IN 
    SELECT DISTINCT lr.employee_id, lr.leave_type
    FROM leave_requests lr
    WHERE lr.status = 'approved'
      AND EXTRACT(YEAR FROM lr.start_date) = 2025
  LOOP
    SELECT COALESCE(
      (SELECT balance FROM leave_transactions 
       WHERE employee_id = emp_rec.employee_id 
         AND leave_type = emp_rec.leave_type
         AND year = 2025
         AND transaction_type = 'ACCRUAL'
       ORDER BY transaction_date DESC, created_at DESC 
       LIMIT 1),
      0
    ) INTO current_bal;
    
    FOR leave_rec IN 
      SELECT id, start_date, end_date, total_days, approved_at
      FROM leave_requests
      WHERE employee_id = emp_rec.employee_id
        AND leave_type = emp_rec.leave_type
        AND status = 'approved'
        AND EXTRACT(YEAR FROM start_date) = 2025
      ORDER BY start_date, approved_at
    LOOP
      current_bal := current_bal - ABS(leave_rec.total_days);
      
      INSERT INTO leave_transactions (
        employee_id, leave_type, transaction_type, change, balance, description, 
        reference_id, transaction_date, year
      ) VALUES (
        emp_rec.employee_id, emp_rec.leave_type, 'DEDUCTION', -ABS(leave_rec.total_days), current_bal,
        'Leave: ' || TO_CHAR(leave_rec.start_date, 'DD Mon') || 
          CASE WHEN leave_rec.start_date != leave_rec.end_date 
            THEN ' - ' || TO_CHAR(leave_rec.end_date, 'DD Mon') ELSE '' END,
        leave_rec.id, COALESCE(leave_rec.approved_at::date, leave_rec.start_date), 2025
      );
    END LOOP;
  END LOOP;
END $$;

-- Step 5: Update trigger to handle both uppercase and lowercase status
DROP TRIGGER IF EXISTS trigger_leave_approval_deduction ON leave_requests;

CREATE OR REPLACE FUNCTION public.handle_leave_approval_deduction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_balance NUMERIC(5,2);
  leave_description TEXT;
BEGIN
  -- Process when status is approved (case-insensitive)
  IF LOWER(NEW.status) = 'approved' AND (TG_OP = 'INSERT' OR OLD.status IS NULL OR LOWER(OLD.status) != 'approved') THEN
    SELECT COALESCE(
      (SELECT balance FROM public.leave_transactions 
       WHERE employee_id = NEW.employee_id 
         AND leave_type = NEW.leave_type 
         AND year = EXTRACT(YEAR FROM NEW.start_date)::INTEGER
       ORDER BY transaction_date DESC, created_at DESC 
       LIMIT 1),
      0
    ) INTO current_balance;
    
    leave_description := 'Leave approved: ' || 
      TO_CHAR(NEW.start_date, 'DD Mon') || 
      CASE WHEN NEW.start_date != NEW.end_date 
        THEN ' - ' || TO_CHAR(NEW.end_date, 'DD Mon YYYY')
        ELSE ' ' || TO_CHAR(NEW.start_date, 'YYYY')
      END;
    
    INSERT INTO public.leave_transactions (
      employee_id, leave_type, transaction_type, change, balance, description, 
      reference_id, transaction_date, year, created_by
    ) VALUES (
      NEW.employee_id, NEW.leave_type, 'DEDUCTION', -ABS(NEW.total_days),
      current_balance - ABS(NEW.total_days), leave_description, NEW.id,
      COALESCE(NEW.approved_at::date, CURRENT_DATE),
      EXTRACT(YEAR FROM NEW.start_date)::INTEGER, NEW.approved_by
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE TRIGGER trigger_leave_approval_deduction
  AFTER INSERT OR UPDATE ON leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_leave_approval_deduction();
