-- Step 1: Insert Maternity Leave policy
INSERT INTO leave_policies (
  code, name, description, annual_quota, accrual_rate, accrual_frequency, 
  allow_half_day, allow_negative, max_consecutive_days, advance_notice_days, 
  backdated_limit_days, carry_forward_limit, encashment_limit, expiry_days,
  restrictions, application_notes, joining_restriction_days, notice_period_allowed, 
  is_active, display_order
) VALUES (
  'ML', 
  'Maternity Leave',
  'Maternity leave is provided to female employees for childbirth and post-delivery care. This leave is available as per the Maternity Benefit Act.',
  180,
  0,
  'none',
  false,
  false,
  180,
  60,
  0,
  0,
  0,
  NULL,
  '["Only full day leave allowed", "Apply at least 2 months in advance", "Comment is mandatory", "Not available during notice period"]'::jsonb,
  'You can apply for only full day of Maternity Leave. Please apply at least 2 months before the expected date.',
  0,
  false,
  true,
  3
) ON CONFLICT (code) DO NOTHING;

-- Step 2: Update test user genders based on their names
UPDATE profiles SET gender = 'Female' WHERE email IN ('sara@example.com', 'hema@example.com');
UPDATE profiles SET gender = 'Male' WHERE email IN ('ravi@example.com', 'harsh@example.com', 'admin@example.com');

-- Step 3: Backfill Maternity Leave initial allocation for female employees
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