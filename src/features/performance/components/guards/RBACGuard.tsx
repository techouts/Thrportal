import { ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldX } from "lucide-react";

export type UserRole = "EMPLOYEE" | "MANAGER" | "HR" | "ADMIN";

interface RBACGuardProps {
  children: ReactNode;
  requiredRoles: UserRole[];
  userRole?: UserRole;
  fallback?: ReactNode;
}

// Mock user role - in real app this would come from auth context
const getCurrentUserRole = (): UserRole => {
  // This would typically come from your auth context/state
  const role = localStorage.getItem('user_role') as UserRole;
  return role || "EMPLOYEE";
};

export function RBACGuard({ 
  children, 
  requiredRoles, 
  userRole = getCurrentUserRole(),
  fallback 
}: RBACGuardProps) {
  const hasPermission = requiredRoles.includes(userRole);

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Alert variant="destructive">
        <ShieldX className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to access this section. Required role: {requiredRoles.join(" or ")}.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}

// Convenience hooks for role checking
export const useRBAC = () => {
  const userRole = getCurrentUserRole();
  
  const hasRole = (roles: UserRole[]) => roles.includes(userRole);
  const isEmployee = () => userRole === "EMPLOYEE";
  const isManager = () => userRole === "MANAGER";
  const isHR = () => userRole === "HR";
  const isAdmin = () => userRole === "ADMIN";
  
  return {
    userRole,
    hasRole,
    isEmployee,
    isManager,
    isHR,
    isAdmin,
  };
};