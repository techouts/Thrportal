-- Add start_date, end_date, total_days columns to comp_off_requests
ALTER TABLE public.comp_off_requests 
ADD COLUMN IF NOT EXISTS start_date date,
ADD COLUMN IF NOT EXISTS end_date date,
ADD COLUMN IF NOT EXISTS total_days numeric DEFAULT 1;

-- Migrate existing data: copy comp_off_date to both start_date and end_date
UPDATE public.comp_off_requests 
SET start_date = comp_off_date, 
    end_date = comp_off_date, 
    total_days = CASE WHEN is_half_day THEN 0.5 ELSE 1 END
WHERE start_date IS NULL;

-- Make start_date and end_date NOT NULL after migration
ALTER TABLE public.comp_off_requests 
ALTER COLUMN start_date SET NOT NULL,
ALTER COLUMN end_date SET NOT NULL;