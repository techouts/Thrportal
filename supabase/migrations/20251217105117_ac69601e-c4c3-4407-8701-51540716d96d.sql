-- Add evidence_url column to leave_requests table for supporting attachments
ALTER TABLE leave_requests 
ADD COLUMN IF NOT EXISTS evidence_url TEXT;