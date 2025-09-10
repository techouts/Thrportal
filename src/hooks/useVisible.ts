import { useAuth } from "../auth/AuthContext";

export function useVisible(requiresAny?: string[]) {
  const { can } = useAuth();
  if (!requiresAny || requiresAny.length === 0) return true;
  return requiresAny.some(p => can(p));
}