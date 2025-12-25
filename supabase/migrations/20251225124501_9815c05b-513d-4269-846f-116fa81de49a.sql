-- Backfill Maternity Leave initial allocation for ALL female employees (including Maya)
INSERT INTO leave_transactions (
  employee_id, leave_type, transaction_type, change, balance, 
  description, transaction_date, year
)
SELECT 
  p.id as employee_id,
  'ML' as leave_type,
  'INITIAL_ALLOCATION' as transaction_type,
  180 as change,
  180 as balance,
  'Annual maternity leave allocation - Jan 2025' as description,
  '2025-01-01'::date as transaction_date,
  2025 as year
FROM profiles p
WHERE p.is_active = true
  AND p.gender = 'Female'
  AND NOT EXISTS (
    SELECT 1 FROM leave_transactions lt 
    WHERE lt.employee_id = p.id 
      AND lt.leave_type = 'ML' 
      AND lt.year = 2025
  );