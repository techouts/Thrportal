-- Add interviewer_details column to interview_slots
ALTER TABLE interview_slots 
ADD COLUMN IF NOT EXISTS interviewer_details JSONB DEFAULT '[]'::jsonb;

-- Create interview_panel_types master table
CREATE TABLE IF NOT EXISTS interview_panel_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default panel types
INSERT INTO interview_panel_types (name, display_order) VALUES
  ('Backend Interview Panel', 1),
  ('Frontend Interview Panel', 2),
  ('DevOps Interview Panel', 3),
  ('Full Stack Interview Panel', 4),
  ('HR Interview Panel', 5),
  ('Technical Lead Panel', 6),
  ('Management Panel', 7)
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE interview_panel_types ENABLE ROW LEVEL SECURITY;

-- RLS policies for panel types
CREATE POLICY "Anyone can view panel types" ON interview_panel_types
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage panel types" ON interview_panel_types
  FOR ALL USING (get_current_user_role() IN ('ADMIN', 'HR_MANAGER', 'STAFFING_MANAGER'));