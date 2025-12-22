import { supabase } from '@/integrations/supabase/client'
import type { EmployeeProfile, ProfileUpdateData } from '@/types/profile'

export interface ProfileRow {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  display_name: string | null
  role: string
  phone: string | null
  department: string | null
  business_unit: string | null
  avatar_url: string | null
  employee_code: string | null
  role_title: string | null
  city: string | null
  country: string | null
  cost_center: string | null
  manager_employee_id: string | null
  about: string | null
  interests: string[] | null
  date_of_joining: string | null
  notice_period: string | null
  band: string | null
  personal_email: string | null
  temporary_address: string | null
  permanent_address: string | null
  alternate_phone: string | null
  date_of_birth: string | null
  blood_group: string | null
  family_details: any | null
  created_at: string
  updated_at: string
  // New employment fields
  employee_type: string | null
  shifts: string | null
  week_off: string | null
  leaves_policy: string | null
  attendance_policy: string | null
  work_location: string | null
  // New personal fields
  gender: string | null
  marital_status: string | null
  is_physically_handicapped: boolean | null
  nationality: string | null
}

function mapRowToEmployeeProfile(row: ProfileRow, manager?: ProfileRow | null, reports?: ProfileRow[]): EmployeeProfile {
  return {
    id: row.id,
    employee_code: row.employee_code || 'N/A',
    first_name: row.first_name || '',
    last_name: row.last_name || '',
    role_title: row.role_title || row.role || 'Employee',
    email: row.email,
    phone: row.phone || undefined,
    city: row.city || undefined,
    country: row.country || undefined,
    business_unit_id: undefined,
    department_id: undefined,
    cost_center_id: undefined,
    manager_employee_id: row.manager_employee_id || undefined,
    about: row.about || undefined,
    interests: row.interests || [],
    photo_url: row.avatar_url || undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
    date_of_joining: row.date_of_joining || undefined,
    notice_period: row.notice_period || undefined,
    band: row.band || undefined,
    personal_email: row.personal_email || undefined,
    temporary_address: row.temporary_address || undefined,
    permanent_address: row.permanent_address || undefined,
    alternate_phone: row.alternate_phone || undefined,
    date_of_birth: row.date_of_birth || undefined,
    blood_group: row.blood_group || undefined,
    family_details: row.family_details || [],
    // New personal fields
    gender: row.gender || undefined,
    marital_status: row.marital_status || undefined,
    is_physically_handicapped: row.is_physically_handicapped || false,
    nationality: row.nationality || undefined,
    // New employment fields
    employee_type: row.employee_type || undefined,
    shifts: row.shifts || undefined,
    week_off: row.week_off || undefined,
    leaves_policy: row.leaves_policy || undefined,
    attendance_policy: row.attendance_policy || undefined,
    work_location: row.work_location || undefined,
    business_unit: row.business_unit ? { id: '1', name: row.business_unit } : undefined,
    department: row.department ? { id: '1', name: row.department } : undefined,
    cost_center: row.cost_center ? { id: '1', code: row.cost_center, name: row.cost_center } : undefined,
    manager: manager ? {
      id: manager.id,
      first_name: manager.first_name || '',
      last_name: manager.last_name || '',
      role_title: manager.role_title || manager.role || 'Manager',
      email: manager.email,
      photo_url: manager.avatar_url || undefined
    } : undefined,
    reports: reports?.map(r => ({
      id: r.id,
      first_name: r.first_name || '',
      last_name: r.last_name || '',
      role_title: r.role_title || r.role || 'Employee',
      email: r.email,
      photo_url: r.avatar_url || undefined
    })) || []
  }
}


export async function getCurrentProfile(userId: string): Promise<EmployeeProfile | null> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error || !profile) {
    console.error('Error fetching profile:', error)
    return null
  }

  const row = profile as unknown as ProfileRow

  // Fetch manager and reports in PARALLEL
  const [managerResult, reportsResult] = await Promise.all([
    // Fetch manager if exists
    row.manager_employee_id 
      ? supabase.from('profiles').select('*').eq('id', row.manager_employee_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    
    // Fetch direct reports
    supabase.from('profiles').select('*').eq('manager_employee_id', userId)
  ])

  const manager = managerResult.data as unknown as ProfileRow | null
  const reports = (reportsResult.data || []) as unknown as ProfileRow[]

  return mapRowToEmployeeProfile(row, manager, reports)
}

export async function getProfileById(profileId: string): Promise<EmployeeProfile | null> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .maybeSingle()

  if (error || !profile) {
    console.error('Error fetching profile:', error)
    return null
  }

  const row = profile as unknown as ProfileRow

  // Fetch manager and reports in PARALLEL
  const [managerResult, reportsResult] = await Promise.all([
    // Fetch manager if exists
    row.manager_employee_id 
      ? supabase.from('profiles').select('*').eq('id', row.manager_employee_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    
    // Fetch direct reports
    supabase.from('profiles').select('*').eq('manager_employee_id', profileId)
  ])

  const manager = managerResult.data as unknown as ProfileRow | null
  const reports = (reportsResult.data || []) as unknown as ProfileRow[]

  return mapRowToEmployeeProfile(row, manager, reports)
}

export async function updateProfile(userId: string, data: ProfileUpdateData): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({
      phone: data.phone,
      city: data.city,
      country: data.country,
      about: data.about,
      interests: data.interests,
      personal_email: data.personal_email,
      temporary_address: data.temporary_address,
      permanent_address: data.permanent_address,
      alternate_phone: data.alternate_phone,
      date_of_birth: data.date_of_birth || null,
      blood_group: data.blood_group,
      family_details: data.family_details as any,
      gender: data.gender,
      marital_status: data.marital_status,
      is_physically_handicapped: data.is_physically_handicapped,
      nationality: data.nationality,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) {
    console.error('Error updating profile:', error)
    return false
  }

  return true
}
