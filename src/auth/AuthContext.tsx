import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { DEV_USERS, DEV_USER_ID_MAP } from "./devUsers";
import { roleToPermissionPatterns, matchPermission } from "../rbac/permissions";
import { AUTH_MODE, isDevAuthMode } from "@/utils/authHelpers";
export type User = { 
  id: string; 
  email: string; 
  display_name: string; 
  roles: string[];          // All assigned roles
  primaryRole: string;      // First role for display/backwards compatibility
  first_name?: string;
  last_name?: string;
  department?: string;
  employeeId?: string;
  permissions?: string[]; 
  scopes?: any;
  passwordChangeRequired?: boolean;
  gender?: string;
};

export type Profile = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  role: string;
  department?: string;
  business_unit?: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  gender?: string;
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string, userData?: { first_name?: string; last_name?: string; role?: string }) => Promise<void>;
  signOut: () => Promise<void>;
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
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to get ALL user roles from user_roles table (secure)
  const getUserRoles = async (userId: string): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .order('role');
      
      if (error) {
        console.error('[AUTH] Error fetching user roles:', error);
        return ['EMPLOYEE'];
      }
      
      const roles = data?.map(r => r.role) || [];
      return roles.length > 0 ? roles : ['EMPLOYEE'];
    } catch (error) {
      console.error('[AUTH] User roles fetch error:', error);
      return ['EMPLOYEE'];
    }
  };

  // Helper function to get user profile from Supabase
  const getUserProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('[AUTH] Error fetching profile:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('[AUTH] Profile fetch error:', error);
      return null;
    }
  };

  // Helper function to convert profile to user (fetches roles from user_roles table)
  const profileToUser = async (profile: Profile & { password_change_required?: boolean }, supabaseUser: SupabaseUser): Promise<User> => {
    // Fetch ALL roles from user_roles table (secure, used by RLS)
    const roles = await getUserRoles(profile.id);
    console.log('[AUTH] Fetched roles from user_roles:', roles);
    
    return {
      id: profile.id,
      email: profile.email,
      display_name: profile.display_name || profile.first_name || profile.email.split('@')[0],
      roles: roles,
      primaryRole: roles[0],
      first_name: profile.first_name,
      last_name: profile.last_name,
      department: profile.department,
      employeeId: profile.id,
      passwordChangeRequired: profile.password_change_required ?? false,
      gender: profile.gender,
    };
  };

  useEffect(() => {
    console.log('[AUTH] Auth mode:', AUTH_MODE);
    
    // Check for dev user in localStorage first (only in dev mode)
    if (isDevAuthMode()) {
      const storedDevUser = localStorage.getItem("dev_user");
      if (storedDevUser) {
        try {
          const userData = JSON.parse(storedDevUser);
          console.log('[AUTH] Restored dev user from localStorage:', userData);
          setUser(userData);
          setSession({ user: { id: userData.id, email: userData.email } as any, access_token: 'dev-token' } as any);
          setIsLoading(false);
          return;
        } catch (error) {
          console.error('[AUTH] Error parsing stored dev user:', error);
          localStorage.removeItem("dev_user");
        }
      }
    }

    // Set up auth state listener for production
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AUTH] Auth state changed:', event, session?.user?.email);
        setSession(session);
        
        if (session?.user) {
          // Defer profile fetch to avoid callback blocking
          setTimeout(async () => {
            const profile = await getUserProfile(session.user.id);
            if (profile) {
              const userData = await profileToUser(profile, session.user);
              setUser(userData);
              console.log('[AUTH] User profile loaded:', userData);
            } else {
              console.warn('[AUTH] No profile found for user:', session.user.id);
              // Create a basic user object from auth data
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                display_name: session.user.email?.split('@')[0] || 'User',
                roles: ['EMPLOYEE'],
                primaryRole: 'EMPLOYEE',
                employeeId: session.user.id
              });
            }
            setIsLoading(false); // Only set loading false AFTER user is set
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false); // No session = done loading
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AUTH] Initial session check:', session?.user?.email);
      if (!session) {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<User> => {
    console.log('[AUTH] Sign in attempt, auth mode:', AUTH_MODE);
    
    if (isDevAuthMode()) {
      // Dev mode authentication
      const devUser = DEV_USERS.find(u => u.email === email && u.password === password);
      if (!devUser) throw new Error("Invalid dev credentials");
      
      // Use fixed UUID from database
      const userId = DEV_USER_ID_MAP[devUser.email];
      if (!userId) throw new Error("Dev user not properly configured");
      
      const userData: User = { 
        id: userId,
        email: devUser.email, 
        display_name: devUser.display_name, 
        roles: [...devUser.roles],
        primaryRole: devUser.roles[0],
        employeeId: `EMP-${devUser.email.split('@')[0].toUpperCase()}`
      };
      
      console.log('[AUTH] Signing in dev user with fixed UUID:', userData);
      localStorage.setItem("dev_user", JSON.stringify(userData)); 
      setUser(userData); 
      setSession({ user: { id: userData.id, email: userData.email } as any, access_token: 'dev-token' } as any);
      return userData;
    }

    // Production authentication with Supabase
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error("No user returned");

      // Get user profile
      const profile = await getUserProfile(data.user.id);
      if (!profile) {
        throw new Error("User profile not found. Please contact support.");
      }

      const userData = await profileToUser(profile, data.user);
      console.log('[AUTH] Production user signed in:', userData);
      
      // Directly set user and session state (don't rely only on onAuthStateChange)
      setUser(userData);
      setSession(data.session);
      
      return userData;
    } catch (error: any) {
      console.error('[AUTH] Sign in error:', error);
      throw new Error(error.message || "Sign in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    userData?: { first_name?: string; last_name?: string; role?: string }
  ): Promise<void> => {
    
    if (isDevAuthMode()) {
      throw new Error("Sign up not available in dev mode. Use existing dev accounts.");
    }

    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: userData?.first_name || '',
            last_name: userData?.last_name || '',
            display_name: userData?.first_name 
              ? `${userData.first_name} ${userData.last_name || ''}`.trim()
              : email.split('@')[0],
            role: userData?.role || 'EMPLOYEE'
          }
        }
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('[AUTH] Sign up error:', error);
      throw new Error(error.message || "Sign up failed");
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    // Check if we have a dev user (in dev mode)
    if (isDevAuthMode()) {
      const storedDevUser = localStorage.getItem("dev_user");
      if (storedDevUser) {
        localStorage.removeItem("dev_user"); 
        setUser(null);
        setSession(null);
        return;
      }
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error('[AUTH] Sign out error:', error);
      throw new Error(error.message || "Sign out failed");
    }
  };

  const can = (perm: string): boolean => {
    if (!user) {
      console.log('[AUTH] No user, permission denied for:', perm);
      return false;
    }
    
    console.log('[AUTH] Permission check for:', perm, 'User:', user.email, 'Roles:', user.roles);
    
    // Aggregate permissions from ALL roles
    let allPermissions: string[] = [];
    for (const role of user.roles) {
      const rolePerms = roleToPermissionPatterns[role];
      if (rolePerms) {
        allPermissions = [...allPermissions, ...rolePerms];
      }
    }
    
    // Deduplicate permissions
    allPermissions = [...new Set(allPermissions)];
    
    if (allPermissions.length === 0) {
      console.log('[AUTH] No permissions found for roles:', user.roles);
      return false;
    }
    
    console.log('[AUTH] Aggregated permissions count:', allPermissions.length);
    
    // Use explicit permissions if available, otherwise use aggregated role permissions
    const perms = user.permissions && user.permissions.length > 0 ? 
      user.permissions : 
      allPermissions;
    
    const hasPermission = matchPermission(perms, perm);
    console.log('[AUTH] Permission result:', hasPermission, 'for:', perm);
    return hasPermission;
  };

  const value = useMemo(() => ({ 
    user, 
    session, 
    isLoading, 
    signIn, 
    signUp, 
    signOut, 
    can 
  }), [user, session, isLoading]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}