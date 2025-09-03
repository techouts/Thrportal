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

  // Mock user for development
  const mockUser: User = {
    id: '1',
    email: 'john.doe@company.com',
    firstName: 'John',
    lastName: 'Doe',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
    role: 'manager',
    department: 'Engineering',
    position: 'Engineering Manager',
    employeeId: 'EMP001',
    isActive: true,
    createdAt: '2022-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
  }

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      setSession(prev => ({ ...prev, isLoading: true, error: null }))
      
      // For now, simulate login. Replace with actual API call when backend is ready
      if (email === 'demo@company.com' && password === 'demo123') {
        const token = 'mock-jwt-token'
        
        // Store in localStorage
        localStorage.setItem('auth_token', token)
        localStorage.setItem('user_data', JSON.stringify(mockUser))
        
        // Update atoms
        setAuthToken(token)
        setCurrentUser(mockUser)
        setIsAuthenticated(true)
        setSession(prev => ({ 
          ...prev, 
          isLoading: false, 
          lastActivity: new Date() 
        }))
        
        toast.success(`Welcome back, ${mockUser.firstName}!`)
        
        return { success: true, user: mockUser }
      } else {
        throw new Error('Invalid credentials')
      }
      
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed'
      setSession(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }))
      
      toast.error(errorMessage)
      
      return { success: false, error: errorMessage }
    }
  }, [setSession, setAuthToken, setCurrentUser, setIsAuthenticated])

  // Logout function
  const logout = useCallback(() => {
    // Clear localStorage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    
    // Reset atoms
    setAuthToken(null)
    setCurrentUser(null)
    setIsAuthenticated(false)
    setSession({
      isLoading: false,
      error: null,
      lastActivity: null,
    })
    
    toast.success('Logged out successfully')
  }, [setAuthToken, setCurrentUser, setIsAuthenticated, setSession])

  // Check authentication status (on app startup)
  const checkAuth = useCallback(() => {
    try {
      const token = localStorage.getItem('auth_token')
      const userData = localStorage.getItem('user_data')
      
      if (token && userData) {
        const user = JSON.parse(userData)
        setAuthToken(token)
        setCurrentUser(user)
        setIsAuthenticated(true)
        setSession(prev => ({ 
          ...prev, 
          lastActivity: new Date() 
        }))
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error checking auth status:', error)
      logout()
      return false
    }
  }, [setAuthToken, setCurrentUser, setIsAuthenticated, setSession, logout])

  // Update user preferences
  const updatePreferences = useCallback((updates: Partial<typeof preferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }))
    
    // Persist to localStorage
    const updatedPreferences = { ...preferences, ...updates }
    localStorage.setItem('user_preferences', JSON.stringify(updatedPreferences))
  }, [preferences, setPreferences])

  // Update last activity
  const updateActivity = useCallback(() => {
    setSession(prev => ({ 
      ...prev, 
      lastActivity: new Date() 
    }))
  }, [setSession])

  return {
    isAuthenticated,
    currentUser,
    session,
    preferences,
    actions: {
      login,
      logout,
      checkAuth,
      updatePreferences,
      updateActivity,
    }
  }
}