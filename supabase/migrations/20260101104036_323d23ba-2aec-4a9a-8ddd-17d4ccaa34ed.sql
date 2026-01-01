
-- Insert CL Carry-Forward for 2026 for admin@dev.local
INSERT INTO leave_transactions (
  employee_id, leave_type, transaction_type, change, balance, 
  description, transaction_date, year, created_by
) VALUES (
  'fd017bbb-a24e-45fd-bf6c-6cc8e71279df', 
  'CL', 
  'CARRY_FORWARD', 
  10, 
  10, 
  'Carry forward from 2025',
  '2026-01-01',
  2026,
  NULL
);

-- Insert PL Initial Allocation for 2026 for admin@dev.local
INSERT INTO leave_transactions (
  employee_id, leave_type, transaction_type, change, balance, 
  description, transaction_date, year, created_by
) VALUES (
  'fd017bbb-a24e-45fd-bf6c-6cc8e71279df', 
  'PL', 
  'INITIAL_ALLOCATION', 
  5, 
  5, 
  'Annual allocation 2026',
  '2026-01-01',
  2026,
  NULL
);
