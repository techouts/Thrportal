-- Add interview_level and candidate_id to slot_assignments
ALTER TABLE slot_assignments ADD COLUMN IF NOT EXISTS interview_level text NOT NULL DEFAULT 'screening';
ALTER TABLE slot_assignments ADD COLUMN IF NOT EXISTS candidate_id uuid REFERENCES candidates(id);

-- Add cancellation_reason to interview_slots
ALTER TABLE interview_slots ADD COLUMN IF NOT EXISTS cancellation_reason text;