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
  created_at: string
  updated_at: string
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

  // Fetch manager if exists
  let manager: ProfileRow | null = null
  if (row.manager_employee_id) {
    const { data: managerData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', row.manager_employee_id)
      .maybeSingle()
    manager = managerData as unknown as ProfileRow | null
  }

  // Fetch direct reports
  const { data: reportsData } = await supabase
    .from('profiles')
    .select('*')
    .eq('manager_employee_id', userId)

  const reports = (reportsData || []) as unknown as ProfileRow[]

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

  // Fetch manager if exists
  let manager: ProfileRow | null = null
  if (row.manager_employee_id) {
    const { data: managerData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', row.manager_employee_id)
      .maybeSingle()
    manager = managerData as unknown as ProfileRow | null
  }

  // Fetch direct reports
  const { data: reportsData } = await supabase
    .from('profiles')
    .select('*')
    .eq('manager_employee_id', profileId)

  const reports = (reportsData || []) as unknown as ProfileRow[]

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
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) {
    console.error('Error updating profile:', error)
    return false
  }

  return true
}
