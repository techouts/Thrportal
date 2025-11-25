-- Insert sample user profile for created_by references
INSERT INTO profiles (id, email, first_name, last_name, display_name, role) VALUES 
('12345678-1234-1234-1234-123456789012', 'recruiter@company.com', 'Sarah', 'Johnson', 'Sarah Johnson', 'RECRUITER');

-- Insert sample interview slots using real client and project IDs
INSERT INTO interview_slots (
  client_id, 
  project_id, 
  date, 
  from_time, 
  to_time, 
  mode, 
  status, 
  panel_text, 
  notes,
  created_by,
  updated_by
) VALUES 
-- Available slots for TechCorp Solutions - Cloud Migration Project
('dc20d2d6-a2a3-4bad-a2fe-a0410e47785a', '64a6cb7c-5484-4e60-9292-3e4200720e1c', '2025-01-22', '10:00:00', '11:00:00', 'virtual', 'available', 'Technical Panel - React/Node.js', 'Senior developer position interview', '12345678-1234-1234-1234-123456789012', '12345678-1234-1234-1234-123456789012'),

('dc20d2d6-a2a3-4bad-a2fe-a0410e47785a', '64a6cb7c-5484-4e60-9292-3e4200720e1c', '2025-01-22', '14:00:00', '15:00:00', 'virtual', 'available', 'Architecture Review Panel', 'Cloud architect position', '12345678-1234-1234-1234-123456789012', '12345678-1234-1234-1234-123456789012'),

-- Booked slots for Global Finance Ltd - Trading Platform Upgrade  
('bccec51c-e6b8-4688-b91c-9c4e2a7cd7a0', '5579c196-bbbc-4600-abfb-7a441196c9b5', '2025-01-23', '09:30:00', '10:30:00', 'virtual', 'booked', 'Technical Assessment', 'Backend developer screening', '12345678-1234-1234-1234-123456789012', '12345678-1234-1234-1234-123456789012'),

('bccec51c-e6b8-4688-b91c-9c4e2a7cd7a0', '5579c196-bbbc-4600-abfb-7a441196c9b5', '2025-01-23', '15:30:00', '16:30:00', 'in_person', 'booked', 'Final Round Interview', 'Senior manager position', '12345678-1234-1234-1234-123456789012', '12345678-1234-1234-1234-123456789012'),

-- Used slots for HealthPlus Inc - Patient Portal Development
('0ffa1a6c-407c-4b0c-a8d0-280975fb27a3', '7129df32-5a1f-406e-8666-52a662d0f1ce', '2025-01-20', '11:00:00', '12:00:00', 'virtual', 'used', 'Healthcare Tech Panel', 'Full-stack developer completed', '12345678-1234-1234-1234-123456789012', '12345678-1234-1234-1234-123456789012'),

('0ffa1a6c-407c-4b0c-a8d0-280975fb27a3', '7129df32-5a1f-406e-8666-52a662d0f1ce', '2025-01-21', '13:00:00', '14:00:00', 'virtual', 'no_show', 'UI/UX Designer Panel', 'Candidate did not attend', '12345678-1234-1234-1234-123456789012', '12345678-1234-1234-1234-123456789012'),

-- Available slots for ManufacturingPro - IoT Implementation
('d3e41458-1ef1-4619-b71a-117127ebd052', '2453e255-31bd-4651-861a-049bd869174c', '2025-01-24', '10:00:00', '11:30:00', 'virtual', 'available', 'IoT Engineering Panel', 'Embedded systems specialist', '12345678-1234-1234-1234-123456789012', '12345678-1234-1234-1234-123456789012'),

('d3e41458-1ef1-4619-b71a-117127ebd052', '2453e255-31bd-4651-861a-049bd869174c', '2025-01-25', '16:00:00', '17:00:00', 'in_person', 'available', 'Technical Leadership Panel', 'Team lead position', '12345678-1234-1234-1234-123456789012', '12345678-1234-1234-1234-123456789012'),

-- Expired slot
('dc20d2d6-a2a3-4bad-a2fe-a0410e47785a', '64a6cb7c-5484-4e60-9292-3e4200720e1c', '2025-01-15', '09:00:00', '10:00:00', 'virtual', 'expired', 'DevOps Panel', 'Slot expired - not filled', '12345678-1234-1234-1234-123456789012', '12345678-1234-1234-1234-123456789012'),

-- Cancelled slot  
('bccec51c-e6b8-4688-b91c-9c4e2a7cd7a0', '5579c196-bbbc-4600-abfb-7a441196c9b5', '2025-01-26', '14:00:00', '15:00:00', 'virtual', 'cancelled', 'QA Engineer Panel', 'Cancelled by client request', '12345678-1234-1234-1234-123456789012', '12345678-1234-1234-1234-123456789012');