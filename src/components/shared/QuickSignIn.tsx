import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, UserCheck, Settings, Target } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { DEV_USERS } from '@/auth/devUsers'

export function QuickSignIn() {
  const { user, signIn } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)

  const handleSignIn = async (email: string, password: string) => {
    setLoading(email)
    try {
      await signIn(email, password)
    } catch (error) {
      console.error('Sign in failed:', error)
    } finally {
      setLoading(null)
    }
  }

  if (user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-green-500" />
            Signed In
          </CardTitle>
          <CardDescription>
            Current user: {user.display_name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Badge variant="outline">{user.role}</Badge>
            <p className="text-sm text-muted-foreground">
              You can now access features based on your role permissions.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show users with hiring.settings.* permissions
  const hiringUsers = DEV_USERS.filter(u => 
    ['ADMIN', 'HIRING_MANAGER', 'HR_MANAGER', 'STAFFING_MANAGER', 'OPERATIONS_HR'].includes(u.role)
  )

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Quick Sign In
        </CardTitle>
        <CardDescription>
          Choose a user with access to Hiring Settings and Pipeline features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {hiringUsers.map(devUser => (
          <div key={devUser.email} className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-medium">{devUser.display_name}</div>
              <div className="text-sm text-muted-foreground">{devUser.role}</div>
              <div className="flex gap-1 mt-1">
                {(devUser.role === 'HIRING_MANAGER' || devUser.role === 'HR_MANAGER' || devUser.role === 'STAFFING_MANAGER') && (
                  <Badge variant="secondary" className="text-xs">
                    <Settings className="h-3 w-3 mr-1" />
                    Settings
                  </Badge>
                )}
                {(devUser.role === 'STAFFING_MANAGER' || devUser.role === 'HIRING_MANAGER') && (
                  <Badge variant="secondary" className="text-xs">
                    <Target className="h-3 w-3 mr-1" />
                    Targets
                  </Badge>
                )}
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => handleSignIn(devUser.email, devUser.password)}
              disabled={loading === devUser.email}
            >
              {loading === devUser.email ? 'Signing in...' : 'Sign In'}
            </Button>
          </div>
        ))}
        
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <h4 className="text-sm font-medium mb-2">What you'll see after signing in:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• <strong>Hiring → Settings</strong> menu item will appear</li>
            <li>• <strong>Targets</strong> tab in Settings</li>
            <li>• <strong>Recruiter Performance</strong> tab in Pipeline</li>
            <li>• Role-based dashboard features</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}