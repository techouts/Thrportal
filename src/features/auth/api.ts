import { API_BASE_URL } from '@/utils/authHelpers'

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('backend_access_token') || ''
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

export interface InviteEmployeeInput {
  firstName: string
  lastName: string
  email: string
  phone: string
  role: string[]
  department?: string
  city?: string
  state?: string
  pincode?: string
  businessUnit?: string
  costCenter?: string
  employeeType?: string
  gender?: string
}

export interface InviteEmployeeResult {
  message: string
  user: { id: string; email: string; firstName: string; lastName: string; roles: string[] }
  temporaryPassword: string
  expiresInHours: number
}

export async function inviteEmployee(input: InviteEmployeeInput): Promise<InviteEmployeeResult> {
  const r = await fetch(`${API_BASE_URL}/auth/invite`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(input),
  })
  const body = await r.json()
  if (!r.ok) {
    const msg = Array.isArray(body?.message) ? body.message.join(', ') : body?.message || 'Invite failed'
    throw new Error(msg)
  }
  return body
}

export async function resetPasswordWithTemp(input: {
  email: string
  temporaryPassword: string
  newPassword: string
  confirmPassword: string
}): Promise<{ message: string; statusCode: number }> {
  const r = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const body = await r.json()
  if (!r.ok || body?.statusCode >= 400) {
    const msg = Array.isArray(body?.message) ? body.message.join(', ') : body?.message || 'Reset failed'
    throw new Error(msg)
  }
  return body
}
