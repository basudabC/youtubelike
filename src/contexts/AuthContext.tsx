import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Database, DatabaseUser } from '@/types/database';

interface AuthContextType {
  user: DatabaseUser | null;
  session: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Database['public']['Tables']['users']['Update']) => Promise<{ error: any }>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DatabaseUser | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUser(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const result = await supabase.auth.signInWithPassword({ email, password });

    // If login successful, check user status
    if (result.data?.user && !result.error) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('status, rejection_reason')
        .eq('id', result.data.user.id)
        .single();

      if (userError) {
        return { error: userError };
      }

      // Block non-approved users
      if (userData && (userData as any).status === 'pending') {
        await supabase.auth.signOut();
        return {
          error: {
            message: 'Your account is pending admin approval. Please wait for approval to access the platform.'
          }
        };
      }

      if (userData && (userData as any).status === 'rejected') {
        await supabase.auth.signOut();
        return {
          error: {
            message: `Your account has been rejected. Reason: ${(userData as any).rejection_reason || 'No reason provided'}`
          }
        };
      }
    }

    return result;
  };

  const signUp = async (email: string, password: string, username: string) => {
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });
    return result;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const updateProfile = async (updates: Database['public']['Tables']['users']['Update']) => {
    if (!user) return { error: { message: 'No user logged in' } };

    const result = await supabase
      .from('users')
      .update(updates as unknown as never)
      .eq('id', user.id);

    if (!result.error) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
    }

    return result;
  };

  const isAdminUser = user?.role === 'admin';

  // Debug logging
  if (user) {
    console.log('[AuthContext] User role:', user.role, 'isAdmin:', isAdminUser);
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAdmin: isAdminUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
