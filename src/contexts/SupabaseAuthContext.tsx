import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { 
  User as SupabaseUser, 
  Session, 
  AuthError as SupabaseAuthError,
  Provider
} from '@supabase/supabase-js';
import { supabase } from '../config/supabaseClient';
import type { 
  SupabaseAuthContextType, 
  UserProfile, 
  AuthFormErrors, 
  AuthLoadingStates 
} from '../types/auth';

// Create default preferences
const createDefaultPreferences = () => ({
  theme: 'auto' as const,
  language: 'en' as const,
  notifications: {
    daily: true,
    reminders: true,
    achievements: true,
    weeklyProgress: true,
    socialUpdates: false,
    push: true,
    email: false,
    sound: true,
    vibration: true,
  },
  privacy: {
    analytics: false,
    dataSharing: false,
    profileVisibility: 'private' as const,
    shareProgress: false,
    locationTracking: false,
  },
  meditation: {
    defaultDuration: 10,
    preferredVoice: 'default',
    backgroundSounds: true,
    guidanceLevel: 'moderate' as const,
    musicVolume: 70,
    voiceVolume: 80,
    autoAdvance: false,
    showTimer: true,
    preparationTime: 30,
    endingBell: true,
  },
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium' as const,
    screenReader: false,
    keyboardNavigation: false,
  },
  display: {
    dateFormat: 'DD/MM/YYYY' as const,
    timeFormat: '24h' as const,
    weekStartsOn: 'monday' as const,
    showStreaks: true,
    showStatistics: true,
  },
  downloadPreferences: {
    autoDownload: false,
    wifiOnly: true,
    storageLimit: 1,
  },
});

const createDefaultProgress = () => ({
  totalSessions: 0,
  totalMinutes: 0,
  streak: 0,
  longestStreak: 0,
  achievements: [],
  lastSessionDate: null,
  favoriteCategories: [],
  completedPrograms: [],
});

const createDefaultLoadingStates = (): AuthLoadingStates => ({
  loading: true,
  profileLoading: false,
  oauthLoading: false,
  emailAuthLoading: false,
  resetPasswordLoading: false,
  deleteAccountLoading: false,
});

// Create Supabase Auth Context
const SupabaseAuthContext = createContext<SupabaseAuthContextType | null>(null);

export const useSupabaseAuth = (): SupabaseAuthContextType => {
  const context = useContext(SupabaseAuthContext);
  if (!context) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

interface SupabaseAuthProviderProps {
  children: ReactNode;
}

export const SupabaseAuthProvider: React.FC<SupabaseAuthProviderProps> = ({ children }) => {
  // Core auth state
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  
  // Loading states
  const [loadingStates, setLoadingStates] = useState<AuthLoadingStates>(createDefaultLoadingStates);
  
  // Form errors
  const [formErrors, setFormErrors] = useState<AuthFormErrors>({});

  // Helper function to update loading states
  const updateLoadingState = useCallback((key: keyof AuthLoadingStates, value: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  }, []);

  // Clear specific form errors
  const clearFormErrors = useCallback((fields?: string[]) => {
    if (fields) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        fields.forEach(field => delete newErrors[field as keyof AuthFormErrors]);
        return newErrors;
      });
    } else {
      setFormErrors({});
    }
  }, []);

  // Set form errors
  const setFormErrorsCallback = useCallback((errors: Partial<AuthFormErrors>) => {
    setFormErrors(prev => ({ ...prev, ...errors }));
  }, []);

  // Load user profile from Supabase database
  const loadUserProfile = useCallback(async (userId: string) => {
    updateLoadingState('profileLoading', true);
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = row not found
        console.error('Error loading user profile:', error);
        return;
      }

      if (profile) {
        setUserProfile({
          ...profile,
          createdAt: new Date(profile.created_at),
          lastLoginAt: new Date(profile.last_login_at || profile.created_at),
          progress: profile.progress || createDefaultProgress(),
          preferences: profile.preferences || createDefaultPreferences(),
        });
      } else {
        // Create new profile if doesn't exist
        await createUserProfile(userId);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      updateLoadingState('profileLoading', false);
    }
  }, [updateLoadingState]);

  // Create new user profile
  const createUserProfile = useCallback(async (userId: string) => {
    const newProfile: Partial<UserProfile> = {
      uid: userId,
      email: user?.email || null,
      displayName: user?.user_metadata?.full_name || user?.user_metadata?.name || null,
      photoURL: user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      isGuest: false,
      preferences: createDefaultPreferences(),
      progress: createDefaultProgress(),
      totalMeditationMinutes: 0,
      completedSessions: [],
      completedCourses: [],
      currentStreak: 0,
    };

    try {
      const { error } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: newProfile.email,
          display_name: newProfile.displayName,
          avatar_url: newProfile.photoURL,
          preferences: newProfile.preferences,
          progress: newProfile.progress,
        });

      if (error) {
        console.error('Error creating user profile:', error);
        return;
      }

      setUserProfile(newProfile as UserProfile);
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  }, [user]);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await loadUserProfile(session.user.id);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          updateLoadingState('loading', false);
        }
      }
    };

    // Load guest data from localStorage
    const loadGuestData = () => {
      const guestDataStr = localStorage.getItem('guestUserData');
      if (guestDataStr && !user) {
        try {
          const guestData = JSON.parse(guestDataStr);
          setIsGuest(true);
          setUserProfile({
            ...guestData,
            createdAt: new Date(guestData.createdAt),
            lastLoginAt: new Date(guestData.lastLoginAt),
          });
        } catch (error) {
          console.error('Error loading guest data:', error);
          localStorage.removeItem('guestUserData');
        }
      }
    };

    initializeAuth();
    loadGuestData();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setIsGuest(false);
          await loadUserProfile(session.user.id);
        } else {
          setUserProfile(null);
          setIsGuest(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserProfile, updateLoadingState, user]);

  // Sign up with email and password
  const signUpWithEmail = useCallback(async (
    email: string, 
    password: string, 
    displayName?: string
  ) => {
    updateLoadingState('emailAuthLoading', true);
    clearFormErrors();

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: displayName,
            display_name: displayName,
          }
        }
      });

      if (error) {
        setFormErrorsCallback({ general: error.message });
        return { error };
      }

      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setFormErrorsCallback({ general: errorMessage });
      return { error: error as SupabaseAuthError };
    } finally {
      updateLoadingState('emailAuthLoading', false);
    }
  }, [updateLoadingState, clearFormErrors, setFormErrorsCallback]);

  // Sign in with email and password
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    updateLoadingState('emailAuthLoading', true);
    clearFormErrors();

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setFormErrorsCallback({ general: error.message });
        return { error };
      }

      setIsGuest(false);
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setFormErrorsCallback({ general: errorMessage });
      return { error: error as SupabaseAuthError };
    } finally {
      updateLoadingState('emailAuthLoading', false);
    }
  }, [updateLoadingState, clearFormErrors, setFormErrorsCallback]);

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    updateLoadingState('oauthLoading', true);
    clearFormErrors();

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) {
        setFormErrorsCallback({ general: error.message });
        return { error };
      }

      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setFormErrorsCallback({ general: errorMessage });
      return { error: error as SupabaseAuthError };
    } finally {
      updateLoadingState('oauthLoading', false);
    }
  }, [updateLoadingState, clearFormErrors, setFormErrorsCallback]);

  // Sign in with Apple
  const signInWithApple = useCallback(async () => {
    updateLoadingState('oauthLoading', true);
    clearFormErrors();

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (error) {
        setFormErrorsCallback({ general: error.message });
        return { error };
      }

      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setFormErrorsCallback({ general: errorMessage });
      return { error: error as SupabaseAuthError };
    } finally {
      updateLoadingState('oauthLoading', false);
    }
  }, [updateLoadingState, clearFormErrors, setFormErrorsCallback]);

  // Sign out
  const signOut = useCallback(async () => {
    updateLoadingState('loading', true);

    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { error };
      }

      setUserProfile(null);
      setIsGuest(false);
      clearFormErrors();
      
      return { error: null };
    } catch (error) {
      return { error: error as SupabaseAuthError };
    } finally {
      updateLoadingState('loading', false);
    }
  }, [updateLoadingState, clearFormErrors]);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    updateLoadingState('resetPasswordLoading', true);
    clearFormErrors();

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        setFormErrorsCallback({ email: error.message });
        return { error };
      }

      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setFormErrorsCallback({ general: errorMessage });
      return { error: error as SupabaseAuthError };
    } finally {
      updateLoadingState('resetPasswordLoading', false);
    }
  }, [updateLoadingState, clearFormErrors, setFormErrorsCallback]);

  // Continue as guest
  const continueAsGuest = useCallback(() => {
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const guestData = {
      uid: guestId,
      email: null,
      displayName: 'Tamu',
      photoURL: null,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      isGuest: true,
      preferences: createDefaultPreferences(),
      progress: createDefaultProgress(),
      totalMeditationMinutes: 0,
      completedSessions: [],
      completedCourses: [],
      currentStreak: 0,
    };

    localStorage.setItem('guestUserData', JSON.stringify({
      ...guestData,
      createdAt: guestData.createdAt.toISOString(),
      lastLoginAt: guestData.lastLoginAt.toISOString(),
    }));

    setIsGuest(true);
    setUserProfile(guestData);
  }, []);

  // Migrate guest data
  const migrateGuestData = useCallback(async () => {
    if (!user || isGuest) {
      throw new Error('User must be authenticated to migrate guest data');
    }

    const guestDataStr = localStorage.getItem('guestUserData');
    if (!guestDataStr) {
      console.log('No guest data found to migrate');
      return;
    }

    try {
      const guestData = JSON.parse(guestDataStr);
      
      if (userProfile) {
        // Merge guest progress with current user data
        const mergedProgress = {
          totalSessions: (userProfile.progress?.totalSessions || 0) + (guestData.progress?.totalSessions || 0),
          totalMinutes: (userProfile.progress?.totalMinutes || 0) + (guestData.progress?.totalMinutes || 0),
          streak: Math.max(userProfile.progress?.streak || 0, guestData.progress?.streak || 0),
          longestStreak: Math.max(userProfile.progress?.longestStreak || 0, guestData.progress?.longestStreak || 0),
          achievements: [...new Set([
            ...(userProfile.progress?.achievements || []),
            ...(guestData.progress?.achievements || [])
          ])],
          lastSessionDate: guestData.progress?.lastSessionDate ? 
            new Date(guestData.progress.lastSessionDate) : userProfile.progress?.lastSessionDate,
          favoriteCategories: [...new Set([
            ...(userProfile.progress?.favoriteCategories || []),
            ...(guestData.progress?.favoriteCategories || [])
          ])],
          completedPrograms: [...new Set([
            ...(userProfile.progress?.completedPrograms || []),
            ...(guestData.progress?.completedPrograms || [])
          ])]
        };

        await updateUserProfile({ progress: mergedProgress });
        localStorage.removeItem('guestUserData');
        console.log('Guest data migrated successfully');
      }
    } catch (error) {
      console.error('Error migrating guest data:', error);
      throw error;
    }
  }, [user, isGuest, userProfile]);

  // Update user profile
  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (isGuest) {
      // Update guest profile in localStorage
      const updatedProfile = { ...userProfile, ...updates } as UserProfile;
      setUserProfile(updatedProfile);
      localStorage.setItem('guestUserData', JSON.stringify({
        ...updatedProfile,
        createdAt: updatedProfile?.createdAt?.toISOString() || new Date().toISOString(),
        lastLoginAt: updatedProfile?.lastLoginAt?.toISOString() || new Date().toISOString(),
      }));
      return { error: null };
    }

    if (!user) {
      return { error: { message: 'User must be authenticated to update profile' } as SupabaseAuthError };
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({
          display_name: updates.displayName,
          avatar_url: updates.photoURL,
          preferences: updates.preferences,
          progress: updates.progress,
        })
        .eq('id', user.id);

      if (error) {
        return { error: error as SupabaseAuthError };
      }

      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
      return { error: null };
    } catch (error) {
      return { error: error as SupabaseAuthError };
    }
  }, [user, isGuest, userProfile]);

  // Send verification email
  const sendVerificationEmail = useCallback(async () => {
    if (!user || isGuest) {
      return { error: { message: 'User must be authenticated to send verification email' } as SupabaseAuthError };
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email!,
      });

      return { error };
    } catch (error) {
      return { error: error as SupabaseAuthError };
    }
  }, [user, isGuest]);

  // Delete account
  const deleteAccount = useCallback(async () => {
    if (!user || isGuest) {
      return { error: { message: 'User must be authenticated to delete account' } as SupabaseAuthError };
    }

    updateLoadingState('deleteAccountLoading', true);

    try {
      // Use the database function to delete user account
      const { error } = await supabase.rpc('delete_user_account');

      if (profileError) {
        console.error('Error deleting user profile:', profileError);
      }

      // Return result after using RPC function above

      if (error) {
        return { error: error as SupabaseAuthError };
      }

      setUserProfile(null);
      setIsGuest(false);
      return { error: null };
    } catch (error) {
      return { error: error as SupabaseAuthError };
    } finally {
      updateLoadingState('deleteAccountLoading', false);
    }
  }, [user, isGuest, updateLoadingState]);

  // Export user data
  const exportUserData = useCallback(async (): Promise<string> => {
    if (!userProfile) {
      throw new Error('No user data to export');
    }

    const exportData = {
      profile: {
        ...userProfile,
        createdAt: userProfile.createdAt.toISOString(),
        lastLoginAt: userProfile.lastLoginAt.toISOString(),
        progress: {
          ...userProfile.progress,
          lastSessionDate: userProfile.progress.lastSessionDate?.toISOString() || null,
        }
      },
      exportInfo: {
        exportedAt: new Date().toISOString(),
        appVersion: '1.0.0',
        format: 'JSON',
        dataVersion: '1.0'
      }
    };

    return JSON.stringify(exportData, null, 2);
  }, [userProfile]);

  // Reauthenticate user
  const reauthenticateUser = useCallback(async (password: string) => {
    if (!user || isGuest || !user.email) {
      return { error: { message: 'User must be authenticated with email/password to reauthenticate' } as SupabaseAuthError };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password,
      });

      return { error };
    } catch (error) {
      return { error: error as SupabaseAuthError };
    }
  }, [user, isGuest]);

  // Refresh session
  const refreshSession = useCallback(async () => {
    try {
      const { error } = await supabase.auth.refreshSession();
      return { error };
    } catch (error) {
      return { error: error as SupabaseAuthError };
    }
  }, []);

  // Memoize context value
  const value = useMemo((): SupabaseAuthContextType => ({
    user,
    session,
    userProfile,
    loading: loadingStates.loading,
    isGuest,
    signInWithGoogle,
    signInWithApple,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    resetPassword,
    continueAsGuest,
    migrateGuestData,
    updateUserProfile,
    deleteAccount,
    exportUserData,
    sendVerificationEmail,
    reauthenticateUser,
    refreshSession,
  }), [
    user,
    session,
    userProfile,
    loadingStates.loading,
    isGuest,
    signInWithGoogle,
    signInWithApple,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    resetPassword,
    continueAsGuest,
    migrateGuestData,
    updateUserProfile,
    deleteAccount,
    exportUserData,
    sendVerificationEmail,
    reauthenticateUser,
    refreshSession,
  ]);

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

export default SupabaseAuthProvider;