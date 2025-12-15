-- Update attendance records for all approved regularizations that weren't properly reflected
UPDATE attendance_records ar
SET 
  status = 'present',
  notes = 'Regularized by manager',
  approved_by = arr.approved_by
FROM attendance_regularization_requests arr
WHERE arr.attendance_record_id = ar.id
  AND arr.status = 'approved'
  AND ar.status != 'present';