
-- Step 1: Backfill leave transactions for 2025
-- First, clear any existing transactions for 2025 to avoid duplicates
DELETE FROM leave_transactions WHERE year = 2025;

-- Step 2: Insert monthly accruals for all employees with valid date_of_joining
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
  -- Loop through all active employees with valid joining dates
  FOR emp IN 
    SELECT id, date_of_joining, email 
    FROM profiles 
    WHERE date_of_joining IS NOT NULL 
      AND is_active = true
  LOOP
    running_balance := 0;
    join_month := EXTRACT(MONTH FROM emp.date_of_joining)::INTEGER;
    join_year := EXTRACT(YEAR FROM emp.date_of_joining)::INTEGER;
    
    -- Generate accruals for each month Jan-Dec 2025
    FOR month_num IN 1..12 LOOP
      month_date := make_date(2025, month_num, 1);
      
      -- Skip if employee joined after this month
      IF join_year > 2025 OR (join_year = 2025 AND join_month > month_num) THEN
        CONTINUE;
      END IF;
      
      -- Calculate accrual amount (pro-rata for joining month in 2025)
      IF join_year = 2025 AND join_month = month_num THEN
        days_in_month := EXTRACT(DAY FROM (month_date + INTERVAL '1 month - 1 day'))::INTEGER;
        days_worked := days_in_month - EXTRACT(DAY FROM emp.date_of_joining)::INTEGER + 1;
        pro_rata_amount := ROUND((accrual_rate * days_worked / days_in_month)::NUMERIC, 2);
      ELSE
        pro_rata_amount := accrual_rate;
      END IF;
      
      running_balance := running_balance + pro_rata_amount;
      
      -- Insert accrual transaction for CL (Casual Leave)
      INSERT INTO leave_transactions (
        employee_id,
        leave_type,
        transaction_type,
        change,
        balance,
        description,
        transaction_date,
        year
      ) VALUES (
        emp.id,
        'CL',
        'ACCRUAL',
        pro_rata_amount,
        running_balance,
        'Monthly accrual - ' || TO_CHAR(month_date, 'Mon YYYY'),
        month_date,
        2025
      );
    END LOOP;
  END LOOP;
END $$;

-- Step 3: Apply leave deductions with correct running balances
DO $$
DECLARE
  emp_rec RECORD;
  leave_rec RECORD;
  current_bal NUMERIC;
BEGIN
  -- For each employee with approved leaves
  FOR emp_rec IN 
    SELECT DISTINCT lr.employee_id, lr.leave_type
    FROM leave_requests lr
    WHERE lr.status = 'APPROVED'
      AND EXTRACT(YEAR FROM lr.start_date) = 2025
  LOOP
    -- Get the balance after all accruals for this employee/leave_type
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
    
    -- Insert deductions in order
    FOR leave_rec IN 
      SELECT id, start_date, end_date, total_days, approved_at
      FROM leave_requests
      WHERE employee_id = emp_rec.employee_id
        AND leave_type = emp_rec.leave_type
        AND status = 'APPROVED'
        AND EXTRACT(YEAR FROM start_date) = 2025
      ORDER BY start_date, approved_at
    LOOP
      current_bal := current_bal - ABS(leave_rec.total_days);
      
      INSERT INTO leave_transactions (
        employee_id,
        leave_type,
        transaction_type,
        change,
        balance,
        description,
        reference_id,
        transaction_date,
        year
      ) VALUES (
        emp_rec.employee_id,
        emp_rec.leave_type,
        'DEDUCTION',
        -ABS(leave_rec.total_days),
        current_bal,
        'Leave: ' || TO_CHAR(leave_rec.start_date, 'DD Mon') || 
          CASE WHEN leave_rec.start_date != leave_rec.end_date 
            THEN ' - ' || TO_CHAR(leave_rec.end_date, 'DD Mon')
            ELSE ''
          END,
        leave_rec.id,
        COALESCE(leave_rec.approved_at::date, leave_rec.start_date),
        2025
      );
    END LOOP;
  END LOOP;
END $$;
