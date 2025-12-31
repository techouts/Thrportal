import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, Settings, Users, Target } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { QuickSignIn } from '@/components/shared/QuickSignIn'
import { useAuth } from '@/auth/AuthContext'

export function HiringFeatureStatus() {
  const { user, can } = useAuth()
  
  const features = [
    {
      name: 'Hiring Settings',
      path: '/Hiring/Settings',
      permission: 'hiring.settings.*',
      description: 'Configure targets, approval rules, SLA, and hiring workflows',
      icon: Settings
    },
    {
      name: 'Pipeline - Recruiter Performance',
      path: '/Hiring/Pipeline → Recruiter Performance tab',
      permission: 'applications.pipeline.read',
      description: 'View role-based performance dashboards and targets',
      icon: Target
    },
    {
      name: 'Targets Management',
      path: '/Hiring/Settings → Targets tab',
      permission: 'hiring.settings.targets.edit',
      description: 'Set and manage recruiter and team performance targets',
      icon: Users
    }
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            New Hiring Features Status
          </CardTitle>
          <CardDescription>
            Check your access to the newly implemented features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {features.map(feature => {
            const hasAccess = can(feature.permission)
            const Icon = feature.icon
            
            return (
              <div key={feature.name} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className={`p-2 rounded-full ${hasAccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{feature.name}</h4>
                    <Badge variant={hasAccess ? 'default' : 'destructive'}>
                      {hasAccess ? 'Accessible' : 'No Access'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {feature.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <strong>Path:</strong> {feature.path}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <strong>Required:</strong> {feature.permission}
                  </p>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {!user && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Not signed in - Sign in to access features</span>
          </div>
          <QuickSignIn />
        </div>
      )}

      {user && !can('hiring.settings.*') && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-5 w-5" />
              Limited Access
            </CardTitle>
            <CardDescription className="text-amber-700">
              Your current roles ({user.roles.join(', ')}) have limited access to hiring features
            </CardDescription>
          </CardHeader>
          <CardContent className="text-amber-700">
            <p className="text-sm mb-3">
              To access all hiring features, sign in with one of these roles:
            </p>
            <ul className="text-sm space-y-1">
              <li>• <strong>HIRING_MANAGER</strong> - Full access to settings and performance</li>
              <li>• <strong>HR_MANAGER</strong> - Complete hiring management access</li>
              <li>• <strong>STAFFING_MANAGER</strong> - Team and target management</li>
              <li>• <strong>ADMIN</strong> - All permissions</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}