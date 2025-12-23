-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create index for faster queries
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(user_id, read);

-- RLS Policies
-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- System/Admin can insert notifications for any user
CREATE POLICY "DEV: Allow all insert on notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();