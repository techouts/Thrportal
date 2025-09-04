import { useState, useCallback } from 'react'
import type { User } from '@/types'
import { toast } from 'sonner'

// Simple hook without Jotai for testing
export const useAuth = () => {
  const mockUser: User = {
    id: 'demo-user',
    email: 'demo@company.com',
    firstName: 'Demo',
    lastName: 'User',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
    role: 'HR',
    department: 'Engineering',
    position: 'HR Manager',
    employeeId: 'DEMO001',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-09-03T00:00:00.000Z',
  }

  // Auto-login for demo purposes
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(mockUser)
  const [authToken, setAuthToken] = useState<string | null>('mock-jwt-token')
  const [session, setSession] = useState({
    isLoading: false,
    error: null as string | null,
    lastActivity: new Date(),
  })

  console.log('🔐 useAuth - currentUser:', currentUser)
  console.log('🔐 useAuth - isAuthenticated:', isAuthenticated)

  const login = useCallback(async (email: string, password: string) => {
    try {
      setSession((prev) => ({ ...prev, isLoading: true, error: null }))
      
      if (email === 'demo@company.com' && password === 'demo123') {
        const token = 'mock-jwt-token'
        localStorage.setItem('auth_token', token)
        localStorage.setItem('user_data', JSON.stringify(mockUser))
        
        setAuthToken(token)
        setCurrentUser(mockUser)
        setIsAuthenticated(true)
        setSession((prev) => ({ ...prev, isLoading: false, lastActivity: new Date() }))
        
        toast.success(`Welcome back, ${mockUser.firstName}!`)
        return { success: true, user: mockUser }
      } else {
        throw new Error('Invalid credentials')
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed'
      setSession((prev) => ({ ...prev, isLoading: false, error: errorMessage }))
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [mockUser])

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    setAuthToken(null)
    setCurrentUser(null)
    setIsAuthenticated(false)
    setSession({ isLoading: false, error: null, lastActivity: null })
    toast.success('Logged out successfully')
  }, [])

  return {
    isAuthenticated,
    currentUser,
    session,
    actions: { login, logout }
  }
}

// Helper hooks for Home page
export const useCurrentUser = () => {
  const { currentUser } = useAuth()
  return currentUser
}

export const useUserRole = () => {
  const { currentUser } = useAuth()
  return currentUser?.role || 'Employee'
}

export const useIsManager = () => {
  const userRole = useUserRole()
  return userRole === 'Manager' || userRole === 'HR'
}