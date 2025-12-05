-- Create timesheets table
CREATE TABLE public.timesheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  week_end date NOT NULL,
  total_hours numeric DEFAULT 0,
  billable_hours numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SAVED', 'SUBMITTED', 'APPROVED', 'REJECTED')),
  submission_comment text,
  submitted_at timestamptz,
  approved_by uuid REFERENCES public.profiles(id),
  approved_at timestamptz,
  approver_comment text,
  rejected_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, week_start)
);

-- Create timesheet_entries table
CREATE TABLE public.timesheet_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timesheet_id uuid NOT NULL REFERENCES public.timesheets(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.crm_projects(id),
  task_id text,
  task_name text,
  entry_date date NOT NULL,
  hours numeric NOT NULL DEFAULT 0,
  comment text,
  is_billable boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(timesheet_id, project_id, task_id, entry_date)
);

-- Indexes for performance
CREATE INDEX idx_timesheets_employee_id ON public.timesheets(employee_id);
CREATE INDEX idx_timesheets_week_start ON public.timesheets(week_start);
CREATE INDEX idx_timesheets_status ON public.timesheets(status);
CREATE INDEX idx_timesheet_entries_timesheet_id ON public.timesheet_entries(timesheet_id);
CREATE INDEX idx_timesheet_entries_entry_date ON public.timesheet_entries(entry_date);

-- Triggers for updated_at
CREATE TRIGGER update_timesheets_updated_at
  BEFORE UPDATE ON public.timesheets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_timesheet_entries_updated_at
  BEFORE UPDATE ON public.timesheet_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timesheet_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for timesheets
CREATE POLICY "Employees can view own timesheets" ON public.timesheets
  FOR SELECT USING (employee_id = auth.uid());

CREATE POLICY "Employees can create own timesheets" ON public.timesheets
  FOR INSERT WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Employees can update own draft timesheets" ON public.timesheets
  FOR UPDATE USING (
    employee_id = auth.uid() 
    AND status IN ('DRAFT', 'SAVED', 'REJECTED')
  );

CREATE POLICY "Managers can view all timesheets" ON public.timesheets
  FOR SELECT USING (
    get_current_user_role() IN ('HR_MANAGER', 'STAFFING_MANAGER', 'ADMIN', 'MANAGEMENT')
  );

CREATE POLICY "Managers can update timesheets for approval" ON public.timesheets
  FOR UPDATE USING (
    get_current_user_role() IN ('HR_MANAGER', 'STAFFING_MANAGER', 'ADMIN', 'MANAGEMENT')
  );

-- RLS Policies for timesheet_entries
CREATE POLICY "Users can view entries for accessible timesheets" ON public.timesheet_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.timesheets 
      WHERE timesheets.id = timesheet_entries.timesheet_id 
      AND (
        timesheets.employee_id = auth.uid()
        OR get_current_user_role() IN ('HR_MANAGER', 'STAFFING_MANAGER', 'ADMIN', 'MANAGEMENT')
      )
    )
  );

CREATE POLICY "Employees can manage entries for own timesheets" ON public.timesheet_entries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.timesheets 
      WHERE timesheets.id = timesheet_entries.timesheet_id 
      AND timesheets.employee_id = auth.uid()
      AND timesheets.status IN ('DRAFT', 'SAVED', 'REJECTED')
    )
  );

-- DEV mode policies (for development/testing)
CREATE POLICY "DEV: Allow all select on timesheets" ON public.timesheets
  FOR SELECT USING (true);

CREATE POLICY "DEV: Allow all insert on timesheets" ON public.timesheets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "DEV: Allow all update on timesheets" ON public.timesheets
  FOR UPDATE USING (true);

CREATE POLICY "DEV: Allow all select on timesheet_entries" ON public.timesheet_entries
  FOR SELECT USING (true);

CREATE POLICY "DEV: Allow all insert on timesheet_entries" ON public.timesheet_entries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "DEV: Allow all update on timesheet_entries" ON public.timesheet_entries
  FOR UPDATE USING (true);

CREATE POLICY "DEV: Allow all delete on timesheet_entries" ON public.timesheet_entries
  FOR DELETE USING (true);