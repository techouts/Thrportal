-- Create a security definer function to get recruiter profiles
create or replace function public.get_recruiter_profiles()
returns table (
  id uuid,
  display_name text,
  first_name text,
  last_name text
)
language sql
stable
security definer
set search_path = public
as $$
  select 
    p.id,
    p.display_name,
    p.first_name,
    p.last_name
  from profiles p
  inner join user_roles ur on ur.user_id = p.id
  where ur.role in ('RECRUITER', 'HIRING_MANAGER', 'STAFFING_MANAGER')
  order by p.display_name nulls last;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.get_recruiter_profiles() to authenticated;

-- Add comment
comment on function public.get_recruiter_profiles() is 
'Returns profiles of users with recruiter, hiring manager, or staffing manager roles. Used for assignment dropdowns.';