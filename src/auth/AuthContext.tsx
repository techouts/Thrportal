import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEV_USERS } from "./devUsers";
import { roleToPermissionPatterns, matchPermission } from "../rbac/permissions";

export type User = { 
  id?: string; 
  email: string; 
  display_name: string; 
  role: string; 
  permissions?: string[]; 
  scopes?: any 
};

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => void;
  can: (perm: string) => boolean;
}

const AuthCtx = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthCtx);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => { 
    const raw = localStorage.getItem("dev_user"); 
    if (raw) setUser(JSON.parse(raw)); 
  }, []);

  const signIn = async (email: string, password: string): Promise<User> => {
    if (import.meta.env.VITE_DEV_AUTH === "true" || import.meta.env.DEV) {
      const u = DEV_USERS.find(u => u.email === email && u.password === password);
      if (!u) throw new Error("Invalid dev credentials");
      const devUser: User = { email: u.email, display_name: u.display_name, role: u.role };
      localStorage.setItem("dev_user", JSON.stringify(devUser)); 
      setUser(devUser); 
      return devUser;
    }
    // Real auth (Supabase/Auth0/OIDC) to be wired later
    throw new Error("Real auth not wired yet");
  };

  const signOut = () => { 
    localStorage.removeItem("dev_user"); 
    setUser(null); 
  };

  const can = (perm: string): boolean => {
    if (!user) return false;
    const perms = user.permissions && user.permissions.length > 0 ? 
      user.permissions : 
      (roleToPermissionPatterns[user.role] || []);
    return matchPermission(perms, perm);
  };

  const value = useMemo(() => ({ user, signIn, signOut, can }), [user]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}