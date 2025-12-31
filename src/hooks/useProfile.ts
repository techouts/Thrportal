import { useAuth } from "@/auth/AuthContext";

export function useProfile() {
  const { user } = useAuth();
  
  return {
    profile: user ? {
      id: user.id,
      email: user.email,
      roles: user.roles,
      primaryRole: user.primaryRole,
      first_name: user.first_name,
      last_name: user.last_name,
      display_name: user.display_name
    } : null
  };
}
