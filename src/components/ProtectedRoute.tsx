import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

interface ProtectedRouteProps {
  required?: string[];
  children: React.ReactNode;
}

export default function ProtectedRoute({ required = [], children }: ProtectedRouteProps) {
  const { user, can } = useAuth();
  
  if (!user) return <Navigate to="/Auth/SignIn" replace />;
  
  const ok = required.length === 0 || required.some(p => can(p));
  return ok ? <>{children}</> : <Navigate to="/403" replace />;
}