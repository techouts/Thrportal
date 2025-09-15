import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { DEV_USERS } from "./devUsers";
import { roleToPermissionPatterns, matchPermission } from "../rbac/permissions";

export type User = { 
  id: string; 
  email: string; 
  display_name: string; 
  role: string; 
  first_name?: string;
  last_name?: string;
  department?: string;
  permissions?: string[]; 
  scopes?: any 
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

  // Helper function to convert profile to user
  const profileToUser = (profile: Profile, supabaseUser: SupabaseUser): User => {
    return {
      id: profile.id,
      email: profile.email,
      display_name: profile.display_name || profile.first_name || profile.email.split('@')[0],
      role: profile.role,
      first_name: profile.first_name,
      last_name: profile.last_name,
      department: profile.department
    };
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AUTH] Auth state changed:', event, session?.user?.email);
        setSession(session);
        
        if (session?.user) {
          // Defer profile fetch to avoid callback blocking
          setTimeout(async () => {
            const profile = await getUserProfile(session.user.id);
            if (profile) {
              const userData = profileToUser(profile, session.user);
              setUser(userData);
              console.log('[AUTH] User profile loaded:', userData);
            } else {
              console.warn('[AUTH] No profile found for user:', session.user.id);
              // Create a basic user object from auth data
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                display_name: session.user.email?.split('@')[0] || 'User',
                role: 'EMPLOYEE' // Default role
              });
            }
          }, 0);
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AUTH] Initial session check:', session?.user?.email);
      // The onAuthStateChange will handle the session
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<User> => {
    const isDevMode = import.meta.env.VITE_DEV_AUTH === "true" || import.meta.env.DEV || import.meta.env.MODE === "development";
    console.log('[AUTH] Dev mode check:', isDevMode);
    
    if (isDevMode) {
      // Dev mode authentication
      const devUser = DEV_USERS.find(u => u.email === email && u.password === password);
      if (!devUser) throw new Error("Invalid dev credentials");
      
      const userData: User = { 
        id: `dev-${devUser.email}`,
        email: devUser.email, 
        display_name: devUser.display_name, 
        role: devUser.role 
      };
      
      console.log('[AUTH] Signing in dev user:', userData);
      localStorage.setItem("dev_user", JSON.stringify(userData)); 
      setUser(userData); 
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

      const userData = profileToUser(profile, data.user);
      console.log('[AUTH] Production user signed in:', userData);
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
    const isDevMode = import.meta.env.VITE_DEV_AUTH === "true" || import.meta.env.DEV || import.meta.env.MODE === "development";
    
    if (isDevMode) {
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
    const isDevMode = import.meta.env.VITE_DEV_AUTH === "true" || import.meta.env.DEV || import.meta.env.MODE === "development";
    
    if (isDevMode) {
      localStorage.removeItem("dev_user"); 
      setUser(null);
      return;
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
    
    const perms = user.permissions && user.permissions.length > 0 ? 
      user.permissions : 
      (roleToPermissionPatterns[user.role] || []);
    
    const hasPermission = matchPermission(perms, perm);
    console.log('[AUTH] Permission check:', perm, 'for role:', user.role, 'result:', hasPermission);
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