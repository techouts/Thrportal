import { supabase } from '@/integrations/supabase/client';

/**
 * Get the current auth mode from environment
 * 'dev' = use localStorage dev_user
 * 'supabase' = use real Supabase auth
 */
export const AUTH_MODE = import.meta.env.VITE_AUTH_MODE || 'dev';

export const isDevAuthMode = () => AUTH_MODE === 'dev';
export const isSupabaseAuthMode = () => AUTH_MODE === 'supabase';

/**
 * Get current user ID - works in both dev and supabase modes
 */
export async function getCurrentUserId(): Promise<string> {
  if (isDevAuthMode()) {
    const storedDevUser = localStorage.getItem('dev_user');
    if (storedDevUser) {
      const devUser = JSON.parse(storedDevUser);
      return devUser.id;
    }
  }
  
  // Fall back to Supabase auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  return user.id;
}

/**
 * Get current user data - works in both dev and supabase modes
 */
export async function getCurrentUser(): Promise<{ id: string; email: string } | null> {
  if (isDevAuthMode()) {
    const storedDevUser = localStorage.getItem('dev_user');
    if (storedDevUser) {
      const devUser = JSON.parse(storedDevUser);
      return { id: devUser.id, email: devUser.email };
    }
  }
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return { id: user.id, email: user.email || '' };
}
