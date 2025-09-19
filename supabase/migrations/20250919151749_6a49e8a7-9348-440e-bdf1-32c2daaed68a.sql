-- Phase 1: Create Core HR Tables (Fixed)

-- Create employees table extending profiles with HR-specific fields
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  employee_id TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  department TEXT,
  business_unit TEXT,
  role TEXT,
  manager_id UUID REFERENCES public.employees(id),
  hire_date DATE NOT NULL,
  employment_type TEXT NOT NULL DEFAULT 'FULL_TIME',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  salary NUMERIC,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attendance_records table
CREATE TABLE public.attendance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  clock_in TIME,
  clock_out TIME,
  break_start TIME,
  break_end TIME,
  total_hours NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PRESENT',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, date)
);

-- Create leave_requests table
CREATE TABLE public.leave_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days NUMERIC NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  approved_by UUID REFERENCES public.employees(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  applied_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leave_balances table
CREATE TABLE public.leave_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL,
  total_allocated NUMERIC NOT NULL DEFAULT 0,
  used_days NUMERIC NOT NULL DEFAULT 0,
  pending_days NUMERIC NOT NULL DEFAULT 0,
  available_days NUMERIC NOT NULL DEFAULT 0,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM now()),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, leave_type, year)
);

-- Create timesheets table
CREATE TABLE public.timesheets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  total_hours NUMERIC DEFAULT 0,
  billable_hours NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES public.employees(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, week_start)
);

-- Create timesheet_entries table
CREATE TABLE public.timesheet_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timesheet_id UUID NOT NULL REFERENCES public.timesheets(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id),
  task_id UUID REFERENCES public.tasks(id),
  date DATE NOT NULL,
  hours NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  is_billable BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create announcements table
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'GENERAL',
  priority TEXT NOT NULL DEFAULT 'NORMAL',
  target_audience TEXT[] DEFAULT ARRAY['ALL'],
  author_id UUID NOT NULL REFERENCES public.employees(id),
  published_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  level TEXT NOT NULL DEFAULT 'BEGINNER',
  duration_hours INTEGER DEFAULT 0,
  format TEXT NOT NULL DEFAULT 'ONLINE',
  instructor TEXT,
  max_participants INTEGER,
  prerequisites TEXT[],
  skills TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES public.employees(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create enrollments table
CREATE TABLE public.enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'ENROLLED',
  progress NUMERIC DEFAULT 0,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  certificate_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, course_id)
);

-- Enable Row Level Security
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timesheet_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for employees
CREATE POLICY "HR and Admin can view all employees" 
ON public.employees FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['HR_MANAGER'::text, 'ADMIN'::text, 'MANAGEMENT'::text]));

CREATE POLICY "Employees can view their own record" 
ON public.employees FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "HR and Admin can manage employees" 
ON public.employees FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['HR_MANAGER'::text, 'ADMIN'::text]));

-- Create RLS Policies for attendance_records
CREATE POLICY "HR and Admin can view all attendance" 
ON public.attendance_records FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['HR_MANAGER'::text, 'ADMIN'::text, 'MANAGEMENT'::text]));

CREATE POLICY "Employees can view their own attendance" 
ON public.attendance_records FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.user_id = auth.uid()));

CREATE POLICY "HR and employees can manage attendance" 
ON public.attendance_records FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['HR_MANAGER'::text, 'ADMIN'::text]) OR 
       EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.user_id = auth.uid()));

-- Create RLS Policies for leave_requests
CREATE POLICY "HR and Admin can view all leave requests" 
ON public.leave_requests FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['HR_MANAGER'::text, 'ADMIN'::text, 'MANAGEMENT'::text]));

CREATE POLICY "Employees can view their own leave requests" 
ON public.leave_requests FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.user_id = auth.uid()));

CREATE POLICY "Employees can create their own leave requests" 
ON public.leave_requests FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.user_id = auth.uid()));

CREATE POLICY "HR and managers can update leave requests" 
ON public.leave_requests FOR UPDATE 
USING (get_current_user_role() = ANY (ARRAY['HR_MANAGER'::text, 'ADMIN'::text, 'MANAGEMENT'::text]));

-- Create RLS Policies for leave_balances
CREATE POLICY "HR and Admin can view all leave balances" 
ON public.leave_balances FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['HR_MANAGER'::text, 'ADMIN'::text, 'MANAGEMENT'::text]));

CREATE POLICY "Employees can view their own leave balances" 
ON public.leave_balances FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.user_id = auth.uid()));

CREATE POLICY "HR can manage leave balances" 
ON public.leave_balances FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['HR_MANAGER'::text, 'ADMIN'::text]));

-- Create RLS Policies for timesheets
CREATE POLICY "HR and Admin can view all timesheets" 
ON public.timesheets FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['HR_MANAGER'::text, 'ADMIN'::text, 'MANAGEMENT'::text]));

CREATE POLICY "Employees can view their own timesheets" 
ON public.timesheets FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.user_id = auth.uid()));

CREATE POLICY "Employees can manage their own timesheets" 
ON public.timesheets FOR ALL 
USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.user_id = auth.uid()) OR 
       get_current_user_role() = ANY (ARRAY['HR_MANAGER'::text, 'ADMIN'::text]));

-- Create RLS Policies for timesheet_entries
CREATE POLICY "Users can view timesheet entries they have access to" 
ON public.timesheet_entries FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.timesheets t 
               JOIN public.employees e ON e.id = t.employee_id 
               WHERE t.id = timesheet_id AND 
               (e.user_id = auth.uid() OR get_current_user_role() = ANY (ARRAY['HR_MANAGER'::text, 'ADMIN'::text, 'MANAGEMENT'::text]))));

CREATE POLICY "Users can manage timesheet entries they own" 
ON public.timesheet_entries FOR ALL 
USING (EXISTS (SELECT 1 FROM public.timesheets t 
               JOIN public.employees e ON e.id = t.employee_id 
               WHERE t.id = timesheet_id AND 
               (e.user_id = auth.uid() OR get_current_user_role() = ANY (ARRAY['HR_MANAGER'::text, 'ADMIN'::text]))));

-- Create RLS Policies for announcements
CREATE POLICY "Everyone can view active announcements" 
ON public.announcements FOR SELECT 
USING (is_active = true AND (published_at IS NULL OR published_at <= now()) AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "HR and Admin can manage announcements" 
ON public.announcements FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['HR_MANAGER'::text, 'ADMIN'::text, 'MANAGEMENT'::text]));

-- Create RLS Policies for courses
CREATE POLICY "Everyone can view active courses" 
ON public.courses FOR SELECT 
USING (is_active = true);

CREATE POLICY "HR and Admin can manage courses" 
ON public.courses FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['HR_MANAGER'::text, 'ADMIN'::text, 'MANAGEMENT'::text]));

-- Create RLS Policies for enrollments
CREATE POLICY "HR and Admin can view all enrollments" 
ON public.enrollments FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['HR_MANAGER'::text, 'ADMIN'::text, 'MANAGEMENT'::text]));

CREATE POLICY "Employees can view their own enrollments" 
ON public.enrollments FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.user_id = auth.uid()));

CREATE POLICY "Employees can enroll themselves in courses" 
ON public.enrollments FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.user_id = auth.uid()));

CREATE POLICY "Employees can update their own enrollments" 
ON public.enrollments FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = employee_id AND e.user_id = auth.uid()) OR 
       get_current_user_role() = ANY (ARRAY['HR_MANAGER'::text, 'ADMIN'::text]));

-- Create triggers for updated_at
CREATE TRIGGER update_employees_updated_at
BEFORE UPDATE ON public.employees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_attendance_records_updated_at
BEFORE UPDATE ON public.attendance_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at
BEFORE UPDATE ON public.leave_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_balances_updated_at
BEFORE UPDATE ON public.leave_balances
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_timesheets_updated_at
BEFORE UPDATE ON public.timesheets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_timesheet_entries_updated_at
BEFORE UPDATE ON public.timesheet_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at
BEFORE UPDATE ON public.announcements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON public.courses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enrollments_updated_at
BEFORE UPDATE ON public.enrollments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_employees_user_id ON public.employees(user_id);
CREATE INDEX idx_employees_department ON public.employees(department);
CREATE INDEX idx_employees_manager_id ON public.employees(manager_id);
CREATE INDEX idx_attendance_employee_date ON public.attendance_records(employee_id, date);
CREATE INDEX idx_leave_requests_employee ON public.leave_requests(employee_id);
CREATE INDEX idx_leave_balances_employee ON public.leave_balances(employee_id, year);
CREATE INDEX idx_timesheets_employee_week ON public.timesheets(employee_id, week_start);
CREATE INDEX idx_timesheet_entries_timesheet ON public.timesheet_entries(timesheet_id);
CREATE INDEX idx_enrollments_employee ON public.enrollments(employee_id);
CREATE INDEX idx_enrollments_course ON public.enrollments(course_id);