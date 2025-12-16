import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  required?: string[];
  children: React.ReactNode;
}

export default function ProtectedRoute({ required = [], children }: ProtectedRouteProps) {
  const { user, isLoading, can } = useAuth();
  
  // Wait for auth to complete before making any decisions
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (!user) return <Navigate to="/Auth/SignIn" replace />;
  
  // If no permissions required, allow access
  if (required.length === 0) return <>{children}</>;
  
  // Check if user has any of the required permissions
  const hasPermission = required.some(permission => can(permission));
  
  return hasPermission ? <>{children}</> : <Navigate to="/403" replace />;
}
