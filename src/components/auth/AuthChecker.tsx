import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { User } from '@supabase/supabase-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, LogIn, UserPlus } from 'lucide-react'

interface AuthCheckerProps {
  children: React.ReactNode
}

export function AuthChecker({ children }: AuthCheckerProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setError('')

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: 'ADMIN', // Default role for development
              first_name: 'Admin',
              last_name: 'User'
            }
          }
        })
        if (error) throw error
        setError('Check your email for verification link!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) throw error
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleDemoSignIn = async () => {
    setAuthLoading(true)
    setError('')

    try {
      // Try to sign in with demo credentials
      const { error } = await supabase.auth.signInWithPassword({
        email: 'admin@demo.com',
        password: 'demo123456'
      })
      
      if (error) {
        // If demo user doesn't exist, create it
        const { error: signUpError } = await supabase.auth.signUp({
          email: 'admin@demo.com',
          password: 'demo123456',
          options: {
            data: {
              role: 'ADMIN',
              first_name: 'Demo',
              last_name: 'Admin'
            }
          }
        })
        if (signUpError) throw signUpError
        setError('Demo user created! Check email or try signing in again.')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setAuthLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <LogIn className="h-5 w-5" />
              {isSignUp ? 'Create Account' : 'Sign In Required'}
            </CardTitle>
            <CardDescription>
              {isSignUp ? 'Create an account to access the CRM system' : 'Please sign in to access CRM data'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant={error.includes('Check your email') ? 'default' : 'destructive'}>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={authLoading}>
                {authLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Button>
            </form>
            
            <div className="text-center space-y-2">
              <Button
                variant="outline"
                onClick={handleDemoSignIn}
                disabled={authLoading}
                className="w-full"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Use Demo Account
              </Button>
              
              <Button
                variant="link"
                onClick={() => setIsSignUp(!isSignUp)}
                className="w-full"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}