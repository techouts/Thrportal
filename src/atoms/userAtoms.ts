import { atom } from 'jotai'
import { User } from '@/types'

// Authentication state
export const isAuthenticatedAtom = atom<boolean>(false)
export const currentUserAtom = atom<User | null>(null)
export const authTokenAtom = atom<string | null>(null)

// Session management
export const sessionAtom = atom<{
  isLoading: boolean
  error: string | null
  lastActivity: Date | null
}>({
  isLoading: false,
  error: null,
  lastActivity: null,
})

// User preferences
export const userPreferencesAtom = atom<{
  theme: 'light' | 'dark' | 'system'
  notifications: boolean
  language: string
  timezone: string
}>({
  theme: 'system',
  notifications: true,
  language: 'en',
  timezone: 'UTC',
})

// Derived atoms
export const userFullNameAtom = atom((get) => {
  const user = get(currentUserAtom)
  return user ? `${user.firstName} ${user.lastName}` : ''
})

export const userRoleAtom = atom((get) => {
  const user = get(currentUserAtom)
  return user?.role || 'employee'
})

export const isManagerAtom = atom((get) => {
  const role = get(userRoleAtom)
  return role === 'manager' || role === 'hr' || role === 'admin'
})

export const isHRAtom = atom((get) => {
  const role = get(userRoleAtom)
  return role === 'hr' || role === 'admin'
})

export const isAdminAtom = atom((get) => {
  const role = get(userRoleAtom)
  return role === 'admin'
})