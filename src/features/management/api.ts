import { API_BASE_URL } from '@/utils/authHelpers'
import type {
  AllocationRow,
  DashboardResponse,
  Filters,
  ListResponse,
  ManagementOptions,
} from './types'

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('backend_access_token') || ''
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

function qs(filters: Filters & { page?: number; pageSize?: number }) {
  const p = new URLSearchParams()
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') p.set(k, String(v))
  })
  return p.toString() ? `?${p.toString()}` : ''
}

// --- token refresh (single-flight) --------------------------------------------
let refreshInFlight: Promise<string | null> | null = null

async function tryRefresh(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight
  refreshInFlight = (async () => {
    const refreshToken = localStorage.getItem('backend_refresh_token')
    if (!refreshToken) return null
    try {
      const r = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
      if (!r.ok) return null
      const body = await r.json()
      const newToken = body?.access_token as string | undefined
      if (!newToken) return null
      localStorage.setItem('backend_access_token', newToken)
      if (body?.refresh_token) localStorage.setItem('backend_refresh_token', body.refresh_token)
      return newToken
    } catch {
      return null
    } finally {
      refreshInFlight = null
    }
  })()
  return refreshInFlight
}

function signOutAndRedirect() {
  localStorage.removeItem('backend_user')
  localStorage.removeItem('backend_access_token')
  localStorage.removeItem('backend_refresh_token')
  if (!window.location.pathname.startsWith('/Auth/')) {
    window.location.href = '/Auth/SignIn'
  }
}

/**
 * Wrapper around fetch that transparently handles 401:
 * 1. tries POST /auth/refresh with the stored refresh_token
 * 2. retries the original request once with the new access_token
 * 3. if either step fails, clears auth storage and redirects to Sign In
 */
async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = { ...authHeaders(), ...(init.headers as Record<string, string> | undefined) }
  let res = await fetch(input, { ...init, headers })
  if (res.status !== 401) return res

  const newToken = await tryRefresh()
  if (!newToken) {
    signOutAndRedirect()
    throw new Error('Session expired. Please sign in again.')
  }

  const retryHeaders = {
    ...headers,
    Authorization: `Bearer ${newToken}`,
  }
  res = await fetch(input, { ...init, headers: retryHeaders })
  if (res.status === 401) {
    signOutAndRedirect()
    throw new Error('Session expired. Please sign in again.')
  }
  return res
}

// --- endpoints ---------------------------------------------------------------

export async function fetchDashboard(filters: Filters): Promise<DashboardResponse> {
  const r = await apiFetch(`${API_BASE_URL}/management/dashboard${qs(filters)}`)
  if (!r.ok) throw new Error(`dashboard failed: ${r.status}`)
  return r.json()
}

export async function fetchAllocations(
  filters: Filters,
  page = 1,
  pageSize = 50,
): Promise<ListResponse> {
  const r = await apiFetch(
    `${API_BASE_URL}/management/allocations${qs({ ...filters, page, pageSize })}`,
  )
  if (!r.ok) throw new Error(`list failed: ${r.status}`)
  return r.json()
}

export async function fetchOptions(): Promise<ManagementOptions> {
  const r = await apiFetch(`${API_BASE_URL}/management/options`)
  if (!r.ok) throw new Error(`options failed: ${r.status}`)
  return r.json()
}

/**
 * Update employee-level fields on the dashboard row. Project assignments
 * (client/project/billable/commenced) are not editable from here — those are
 * managed in their own UI.
 */
export async function updateRow(payload: {
  userId: string
  department?: string
  country?: string
  jobTitle?: string
  hireDate?: string
  preferredName?: string
  // allocation-side updates: omit these to leave allocations untouched
  projectIds?: string[]
  clientIds?: string[]
  billable?: 'BILLABLE' | 'NON_BILLABLE'
  commenced?: string
}): Promise<AllocationRow> {
  const r = await apiFetch(`${API_BASE_URL}/management/rows`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  if (!r.ok) {
    const txt = await r.text().catch(() => '')
    throw new Error(`update failed: ${r.status} ${txt}`.trim())
  }
  return r.json()
}
