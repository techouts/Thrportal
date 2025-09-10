import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

interface ProtectedRouteProps {
  required?: string[];
  children: React.ReactNode;
}

export default function ProtectedRoute({ required = [], children }: ProtectedRouteProps) {
  const { user, can } = useAuth();
  
  if (!user) return <Navigate to="/Auth/SignIn" replace />;
  
  // If no permissions required, allow access
  if (required.length === 0) return <>{children}</>;
  
  // Check if user has any of the required permissions
  const hasPermission = required.some(permission => can(permission));
  
  return hasPermission ? <>{children}</> : <Navigate to="/403" replace />;
}