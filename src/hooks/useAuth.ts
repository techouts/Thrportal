import { useAtom } from 'jotai'
import { useCallback } from 'react'
import { 
  isAuthenticatedAtom, 
  currentUserAtom, 
  authTokenAtom,
  sessionAtom,
  userPreferencesAtom
} from '@/atoms/userAtoms'
import { User } from '@/types'
import { toast } from 'sonner'

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useAtom(isAuthenticatedAtom)
  const [currentUser, setCurrentUser] = useAtom(currentUserAtom)
  const [authToken, setAuthToken] = useAtom(authTokenAtom)
  const [session, setSession] = useAtom(sessionAtom)
  const [preferences, setPreferences] = useAtom(userPreferencesAtom)

  const mockUser: User = {
    id: 'demo-user',
    email: 'demo@company.com',
    firstName: 'Demo',
    lastName: 'User',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
    role: 'manager',
    department: 'Engineering',
    position: 'Demo Manager',
    employeeId: 'DEMO001',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-09-03T00:00:00.000Z',
  }

  const login = useCallback(async (email: string, password: string) => {
    try {
      setSession(prev => ({ ...prev, isLoading: true, error: null }))
      
      if (email === 'demo@company.com' && password === 'demo123') {
        const token = 'mock-jwt-token'
        localStorage.setItem('auth_token', token)
        localStorage.setItem('user_data', JSON.stringify(mockUser))
        
        setAuthToken(token)
        setCurrentUser(mockUser)
        setIsAuthenticated(true)
        setSession(prev => ({ ...prev, isLoading: false, lastActivity: new Date() }))
        
        toast.success(`Welcome back, ${mockUser.firstName}!`)
        return { success: true, user: mockUser }
      } else {
        throw new Error('Invalid credentials')
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed'
      setSession(prev => ({ ...prev, isLoading: false, error: errorMessage }))
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [setSession, setAuthToken, setCurrentUser, setIsAuthenticated])

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    setAuthToken(null)
    setCurrentUser(null)
    setIsAuthenticated(false)
    setSession({ isLoading: false, error: null, lastActivity: null })
    toast.success('Logged out successfully')
  }, [setAuthToken, setCurrentUser, setIsAuthenticated, setSession])

  return {
    isAuthenticated,
    currentUser,
    session,
    preferences,
    actions: { login, logout }
  }
}