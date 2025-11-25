import { atom } from 'jotai'

// UI state management
export const sidebarCollapsedAtom = atom<boolean>(false)
export const mobileMenuOpenAtom = atom<boolean>(false)
export const loadingAtom = atom<boolean>(false)
export const globalErrorAtom = atom<string | null>(null)

// Modal states
export const modalsAtom = atom<{
  addEmployee: boolean
  editEmployee: boolean
  confirmDelete: boolean
  leaveRequest: boolean
}>({
  addEmployee: false,
  editEmployee: false,
  confirmDelete: false,
  leaveRequest: false,
})

// Toast notifications
export const toastAtom = atom<{
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
  duration?: number
} | null>(null)

// Dashboard state
export const dashboardStatsAtom = atom<{
  totalEmployees: number
  pendingLeaves: number
  avgCheckInTime: string
  payrollStatus: 'processing' | 'completed' | 'pending'
}>({
  totalEmployees: 0,
  pendingLeaves: 0,
  avgCheckInTime: '09:15',
  payrollStatus: 'pending',
})

// Page state
export const currentPageAtom = atom<string>('Dashboard')
export const breadcrumbsAtom = atom<{ label: string; href?: string }[]>([])

// Search state
export const globalSearchAtom = atom<string>('')
export const searchResultsAtom = atom<any[]>([])
export const searchLoadingAtom = atom<boolean>(false)

// Derived atoms
export const hasErrorAtom = atom((get) => {
  const globalError = get(globalErrorAtom)
  return globalError !== null
})

export const isAnyModalOpenAtom = atom((get) => {
  const modals = get(modalsAtom)
  return Object.values(modals).some(isOpen => isOpen)
})