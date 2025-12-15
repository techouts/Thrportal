-- Add new personal detail fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS marital_status text,
ADD COLUMN IF NOT EXISTS is_physically_handicapped boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS nationality text DEFAULT 'Indian';