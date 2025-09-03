import { atom } from 'jotai'
import type { User } from '@/types'

// Simple atoms without dependencies
export const isAuthenticatedAtom = atom(false)
export const currentUserAtom = atom<User | null>(null)
export const authTokenAtom = atom<string | null>(null)

export const sessionAtom = atom({
  isLoading: false,
  error: null as string | null,
  lastActivity: null as Date | null,
})

export const userPreferencesAtom = atom({
  theme: 'system' as 'light' | 'dark' | 'system',
  notifications: true,
  language: 'en',
  timezone: 'UTC',
})