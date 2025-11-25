-- Create client_spoc_mappings table
CREATE TABLE IF NOT EXISTS client_spoc_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES crm_clients(id) ON DELETE CASCADE,
  primary_spoc_id UUID NOT NULL REFERENCES profiles(id),
  secondary_spoc_id UUID REFERENCES profiles(id),
  assigned_recruiter_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

-- Add trigger for updated_at
CREATE TRIGGER update_client_spoc_mappings_updated_at
  BEFORE UPDATE ON client_spoc_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_client_spoc_mappings_client_id ON client_spoc_mappings(client_id);
CREATE INDEX idx_client_spoc_mappings_primary_spoc ON client_spoc_mappings(primary_spoc_id);

-- Add RLS policies
ALTER TABLE client_spoc_mappings ENABLE ROW LEVEL SECURITY;

-- Staff can view mappings
CREATE POLICY "Staff can view client SPOC mappings"
  ON client_spoc_mappings FOR SELECT
  USING (get_current_user_role() IN ('STAFFING_MANAGER', 'HR_MANAGER', 'RECRUITER', 'HIRING_MANAGER', 'MANAGEMENT', 'ADMIN'));

-- Managers can manage mappings
CREATE POLICY "Managers can manage client SPOC mappings"
  ON client_spoc_mappings FOR ALL
  USING (get_current_user_role() IN ('STAFFING_MANAGER', 'HR_MANAGER', 'ADMIN'));

-- Development bypass
CREATE POLICY "Development write access for client_spoc_mappings"
  ON client_spoc_mappings FOR ALL
  USING (true)
  WITH CHECK (true);