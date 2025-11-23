-- Create approval status enum
CREATE TYPE approval_status_type AS ENUM ('Pending', 'Approved', 'Rejected');

-- Add approval_status column to applications table
ALTER TABLE applications 
ADD COLUMN approval_status approval_status_type NOT NULL DEFAULT 'Pending';

-- Create index for performance
CREATE INDEX idx_applications_approval_status ON applications(approval_status);

-- Update existing applications to Pending (already default, but explicit)
UPDATE applications SET approval_status = 'Pending' WHERE approval_status IS NULL;