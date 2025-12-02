-- Add personal details columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS blood_group text,
ADD COLUMN IF NOT EXISTS family_details jsonb DEFAULT '[]'::jsonb;