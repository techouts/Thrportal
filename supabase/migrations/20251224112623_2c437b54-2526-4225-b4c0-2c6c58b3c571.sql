-- Backfill Paternity Leave initial allocation for all active employees
INSERT INTO leave_transactions (
  employee_id, leave_type, transaction_type, change, balance, 
  description, transaction_date, year
)
SELECT 
  p.id as employee_id,
  'PL' as leave_type,
  'INITIAL_ALLOCATION' as transaction_type,
  5 as change,
  5 as balance,
  'Annual paternity leave allocation - Jan 2025' as description,
  '2025-01-01'::date as transaction_date,
  2025 as year
FROM profiles p
WHERE p.is_active = true
  AND p.date_of_joining IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM leave_transactions lt 
    WHERE lt.employee_id = p.id 
      AND lt.leave_type = 'PL' 
      AND lt.year = 2025
  );

-- Backfill Comp-Off transactions from approved comp_off_requests  
DO $$
DECLARE
  emp_rec RECORD;
  req RECORD;
  running_balance NUMERIC := 0;
BEGIN
  -- Process each employee with approved comp-offs
  FOR emp_rec IN 
    SELECT DISTINCT employee_id 
    FROM comp_off_requests 
    WHERE status = 'approved'
      AND EXTRACT(YEAR FROM start_date) = 2025
  LOOP
    running_balance := 0;
    
    -- Process each approved comp-off request for this employee
    FOR req IN 
      SELECT 
        id, employee_id, comp_off_date, start_date, end_date, 
        total_days, approved_at, reason
      FROM comp_off_requests
      WHERE employee_id = emp_rec.employee_id
        AND status = 'approved'
        AND EXTRACT(YEAR FROM start_date) = 2025
      ORDER BY comp_off_date, approved_at
    LOOP
      running_balance := running_balance + COALESCE(req.total_days, 1);
      
      -- Insert ACCRUAL transaction for comp-off earned (skip if already exists)
      INSERT INTO leave_transactions (
        employee_id, leave_type, transaction_type, change, balance, 
        description, reference_id, transaction_date, year, expiry_date
      ) 
      SELECT 
        req.employee_id, 'COMP_OFF', 'ACCRUAL', COALESCE(req.total_days, 1), running_balance,
        'Comp-Off earned on ' || TO_CHAR(req.comp_off_date, 'DD Mon YYYY'),
        req.id, COALESCE(req.approved_at::date, req.start_date), 2025,
        req.comp_off_date + INTERVAL '90 days'
      WHERE NOT EXISTS (
        SELECT 1 FROM leave_transactions 
        WHERE reference_id = req.id 
          AND leave_type = 'COMP_OFF'
      );
    END LOOP;
  END LOOP;
END $$;