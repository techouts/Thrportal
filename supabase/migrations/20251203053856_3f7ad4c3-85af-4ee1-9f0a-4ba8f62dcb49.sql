-- Create leave_requests table
CREATE TABLE public.leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  leave_type text NOT NULL CHECK (leave_type IN ('CL', 'SL', 'PL', 'ML', 'PL_PATERNITY', 'COMP_OFF', 'LOP')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  total_days numeric NOT NULL DEFAULT 1,
  reason text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  notify_employee_id uuid REFERENCES public.profiles(id),
  requested_by text,
  approved_by uuid REFERENCES public.profiles(id),
  approved_at timestamp with time zone,
  rejection_reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create comp_off_requests table
CREATE TABLE public.comp_off_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  comp_off_date date NOT NULL,
  is_half_day boolean NOT NULL DEFAULT false,
  reason text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  evidence_url text,
  approved_by uuid REFERENCES public.profiles(id),
  approved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comp_off_requests ENABLE ROW LEVEL SECURITY;

-- Dev bypass policies for leave_requests
CREATE POLICY "DEV: Allow all select on leave_requests" ON public.leave_requests FOR SELECT USING (true);
CREATE POLICY "DEV: Allow all insert on leave_requests" ON public.leave_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "DEV: Allow all update on leave_requests" ON public.leave_requests FOR UPDATE USING (true) WITH CHECK (true);

-- Dev bypass policies for comp_off_requests
CREATE POLICY "DEV: Allow all select on comp_off_requests" ON public.comp_off_requests FOR SELECT USING (true);
CREATE POLICY "DEV: Allow all insert on comp_off_requests" ON public.comp_off_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "DEV: Allow all update on comp_off_requests" ON public.comp_off_requests FOR UPDATE USING (true) WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_leave_requests_employee_id ON public.leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON public.leave_requests(status);
CREATE INDEX idx_comp_off_requests_employee_id ON public.comp_off_requests(employee_id);

-- Add updated_at triggers
CREATE TRIGGER update_leave_requests_updated_at
  BEFORE UPDATE ON public.leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comp_off_requests_updated_at
  BEFORE UPDATE ON public.comp_off_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();