-- Add action_url column to notifications table for approval workflow notifications
ALTER TABLE public.notifications ADD COLUMN action_url text;