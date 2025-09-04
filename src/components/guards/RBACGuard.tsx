import { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import rolePolicies from '../../../config/rolePolicies.json'

interface RBACGuardProps {
  children: ReactNode
  permission?: string
  route?: string
  fallback?: ReactNode
}

export function RBACGuard({ children, permission, route, fallback = null }: RBACGuardProps) {
  const { currentUser } = useAuth()
  
  console.log('🛡️ RBACGuard - route:', route, 'currentUser:', currentUser)
  
  if (!currentUser) {
    console.log('🛡️ RBACGuard - No current user, returning fallback')
    return <>{fallback}</>
  }

  const userRole = currentUser.role
  const hasAccess = checkAccess(userRole, permission, route)
  
  console.log('🛡️ RBACGuard - userRole:', userRole, 'hasAccess:', hasAccess)
  
  return hasAccess ? <>{children}</> : <>{fallback}</>
}

function checkAccess(userRole: string, permission?: string, route?: string): boolean {
  const roleConfig = rolePolicies.roles[userRole as keyof typeof rolePolicies.roles]
  
  if (!roleConfig) return false
  
  // Check route-based access
  if (route) {
    const routeGuards = rolePolicies.routeGuards
    const matchingRoute = Object.keys(routeGuards).find(pattern => {
      // Handle exact match
      if (pattern === route) return true
      
      // Handle wildcard patterns
      if (pattern.includes('*')) {
        const basePattern = pattern.replace('/*', '')
        const regexPattern = pattern.replace('*', '.*')
        
        // Match both "/Home" against "/Home/*" and "/Home/something" against "/Home/*"
        return route === basePattern || route.match(new RegExp(`^${regexPattern}$`))
      }
      
      return false
    })
    
    if (matchingRoute) {
      const allowedRoles = routeGuards[matchingRoute as keyof typeof routeGuards]
      if (allowedRoles.includes('*') || allowedRoles.includes(userRole)) {
        return true
      }
    }
    return false
  }
  
  // Check permission-based access
  if (permission) {
    return hasPermission(roleConfig, permission)
  }
  
  return true
}

function hasPermission(roleConfig: any, permission: string): boolean {
  // Check direct permissions
  if (roleConfig.permissions?.includes(permission)) return true
  
  // Check wildcard permissions
  if (roleConfig.permissions?.includes('*:*')) return true
  
  // Check inherited permissions
  if (roleConfig.inherits) {
    for (const inheritedRole of roleConfig.inherits) {
      const inheritedRoleConfig = rolePolicies.roles[inheritedRole as keyof typeof rolePolicies.roles]
      if (inheritedRoleConfig && hasPermission(inheritedRoleConfig, permission)) {
        return true
      }
    }
  }
  
  return false
}

export { checkAccess }