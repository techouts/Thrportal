-- Create attendance_records table
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in TIME,
  check_out TIME,
  break_time INTEGER DEFAULT 0, -- in minutes
  total_hours NUMERIC(5,2) DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'half_day', 'work_from_home')),
  location TEXT NOT NULL CHECK (location IN ('Office', 'Remote', 'Field')),
  coordinates JSONB,
  notes TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(employee_id, date)
);

-- Add RLS policies
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Users can view their own attendance records
CREATE POLICY "Users can view own attendance"
  ON public.attendance_records
  FOR SELECT
  USING (employee_id = auth.uid());

-- Users can insert their own attendance records
CREATE POLICY "Users can insert own attendance"
  ON public.attendance_records
  FOR INSERT
  WITH CHECK (employee_id = auth.uid());

-- Users can update their own attendance records
CREATE POLICY "Users can update own attendance"
  ON public.attendance_records
  FOR UPDATE
  USING (employee_id = auth.uid());

-- Managers can view all attendance records
CREATE POLICY "Managers can view all attendance"
  ON public.attendance_records
  FOR SELECT
  USING (
    get_current_user_role() IN ('HR_MANAGER', 'STAFFING_MANAGER', 'ADMIN', 'MANAGEMENT')
  );

-- Create index for performance
CREATE INDEX idx_attendance_employee_date ON public.attendance_records(employee_id, date DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_attendance_records_updated_at
  BEFORE UPDATE ON public.attendance_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();