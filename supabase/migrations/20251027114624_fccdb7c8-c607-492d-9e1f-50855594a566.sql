-- Phase 2: Enhance candidates schema with additional fields

-- Add new columns for name breakdown
ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS middle_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Add personal details
ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS marital_status TEXT CHECK (marital_status IN ('Unmarried', 'Married')),
  ADD COLUMN IF NOT EXISTS languages_known TEXT[];

-- Add identity documents
ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS pan_card_number TEXT,
  ADD COLUMN IF NOT EXISTS aadhaar_card_number TEXT,
  ADD COLUMN IF NOT EXISTS passport_number TEXT;

-- Add extended location fields
ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS pincode TEXT,
  ADD COLUMN IF NOT EXISTS willing_to_relocate BOOLEAN DEFAULT false;

-- Add extended professional details
ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS github_url TEXT,
  ADD COLUMN IF NOT EXISTS alternate_email TEXT,
  ADD COLUMN IF NOT EXISTS job_type TEXT CHECK (job_type IN ('Permanent', 'Part Time')),
  ADD COLUMN IF NOT EXISTS preferred_shift TEXT CHECK (preferred_shift IN ('Day', 'Night', 'Flexible')),
  ADD COLUMN IF NOT EXISTS expected_ctc_type TEXT,
  ADD COLUMN IF NOT EXISTS status_extended TEXT CHECK (status_extended IN ('Available', 'Not Available', 'Do Not Call', 'Blacklist', 'Inactive', 'Placed'));

-- Make existing name nullable since we're adding first/middle/last
ALTER TABLE public.candidates
  ALTER COLUMN name DROP NOT NULL;

-- Create function to auto-generate full name from first/middle/last
CREATE OR REPLACE FUNCTION generate_full_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.first_name IS NOT NULL THEN
    NEW.name := TRIM(CONCAT(NEW.first_name, ' ', COALESCE(NEW.middle_name || ' ', ''), COALESCE(NEW.last_name, '')));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update full name automatically
DROP TRIGGER IF EXISTS update_candidate_full_name ON candidates;
CREATE TRIGGER update_candidate_full_name
  BEFORE INSERT OR UPDATE ON candidates
  FOR EACH ROW
  EXECUTE FUNCTION generate_full_name();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_candidates_first_name ON candidates(first_name);
CREATE INDEX IF NOT EXISTS idx_candidates_last_name ON candidates(last_name);
CREATE INDEX IF NOT EXISTS idx_candidates_city ON candidates(city);
CREATE INDEX IF NOT EXISTS idx_candidates_country ON candidates(country);
CREATE INDEX IF NOT EXISTS idx_candidates_status_extended ON candidates(status_extended);

-- Add comments for documentation
COMMENT ON COLUMN candidates.first_name IS 'Candidate first name';
COMMENT ON COLUMN candidates.middle_name IS 'Candidate middle name';
COMMENT ON COLUMN candidates.last_name IS 'Candidate last name';
COMMENT ON COLUMN candidates.date_of_birth IS 'Candidate date of birth';
COMMENT ON COLUMN candidates.pan_card_number IS 'PAN card number (India)';
COMMENT ON COLUMN candidates.aadhaar_card_number IS 'Aadhaar card number (India)';
COMMENT ON COLUMN candidates.willing_to_relocate IS 'Whether candidate is willing to relocate';
COMMENT ON COLUMN candidates.status_extended IS 'Extended status for availability tracking';