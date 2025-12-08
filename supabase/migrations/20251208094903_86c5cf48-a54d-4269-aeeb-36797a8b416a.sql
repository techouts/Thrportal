-- Create attendance_regularization_requests table
CREATE TABLE public.attendance_regularization_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES profiles(id),
  attendance_record_id UUID NOT NULL REFERENCES attendance_records(id),
  attendance_date DATE NOT NULL,
  reason TEXT NOT NULL,
  document_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.attendance_regularization_requests ENABLE ROW LEVEL SECURITY;

-- DEV bypass policies
CREATE POLICY "DEV: Allow all select on attendance_regularization_requests"
  ON public.attendance_regularization_requests FOR SELECT USING (true);

CREATE POLICY "DEV: Allow all insert on attendance_regularization_requests"
  ON public.attendance_regularization_requests FOR INSERT WITH CHECK (true);

CREATE POLICY "DEV: Allow all update on attendance_regularization_requests"
  ON public.attendance_regularization_requests FOR UPDATE USING (true) WITH CHECK (true);

-- Production policies
CREATE POLICY "Users can view own regularization requests"
  ON public.attendance_regularization_requests FOR SELECT
  USING (employee_id = auth.uid());

CREATE POLICY "Users can insert own regularization requests"
  ON public.attendance_regularization_requests FOR INSERT
  WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Managers can view all regularization requests"
  ON public.attendance_regularization_requests FOR SELECT
  USING (get_current_user_role() IN ('HR_MANAGER', 'STAFFING_MANAGER', 'ADMIN', 'MANAGEMENT'));

CREATE POLICY "Managers can update regularization requests"
  ON public.attendance_regularization_requests FOR UPDATE
  USING (get_current_user_role() IN ('HR_MANAGER', 'STAFFING_MANAGER', 'ADMIN'));

-- Create updated_at trigger
CREATE TRIGGER update_attendance_regularization_requests_updated_at
  BEFORE UPDATE ON public.attendance_regularization_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for attendance documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('attendance-documents', 'attendance-documents', true);

-- Storage policies for attendance-documents bucket
CREATE POLICY "Users can upload attendance documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'attendance-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own attendance documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'attendance-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view attendance documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'attendance-documents');