-- Create holidays table
CREATE TABLE public.holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL DEFAULT 'national',
  is_optional BOOLEAN DEFAULT false,
  location TEXT DEFAULT 'India',
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;

-- Everyone can read holidays
CREATE POLICY "Anyone can view holidays" 
  ON public.holidays FOR SELECT 
  USING (true);

-- HR/Admin can manage holidays
CREATE POLICY "HR can manage holidays" 
  ON public.holidays FOR ALL 
  USING (get_current_user_role() IN ('HR_MANAGER', 'ADMIN'))
  WITH CHECK (get_current_user_role() IN ('HR_MANAGER', 'ADMIN'));

-- Development access
CREATE POLICY "Development write access for holidays"
  ON public.holidays FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert 2025 holidays
INSERT INTO public.holidays (name, date, type, year) VALUES
  ('New Year', '2025-01-01', 'national', 2025),
  ('Sankranthi', '2025-01-14', 'national', 2025),
  ('Holi', '2025-03-14', 'national', 2025),
  ('Ramzan', '2025-03-31', 'national', 2025),
  ('Good Friday', '2025-04-18', 'national', 2025),
  ('Rakhi', '2025-08-09', 'national', 2025),
  ('Independence Day', '2025-08-15', 'national', 2025),
  ('Janmasthami', '2025-08-16', 'national', 2025),
  ('Ganesh Chaturthi', '2025-08-27', 'national', 2025),
  ('Gandhi Jayanthi', '2025-10-02', 'national', 2025),
  ('Diwali', '2025-10-20', 'national', 2025),
  ('Christmas', '2025-12-25', 'national', 2025);

-- Create trigger for updated_at
CREATE TRIGGER update_holidays_updated_at
  BEFORE UPDATE ON public.holidays
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();