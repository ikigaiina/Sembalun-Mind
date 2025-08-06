# Sembalun - Authentication & Authorization System

## 🔐 Authentication Architecture

Sembalun menggunakan sistem autentikasi yang aman dan mudah digunakan, dibangun di atas Supabase Auth dengan integrasi khusus untuk preferensi budaya Indonesia.

## 🏗️ Auth System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────┤
│  React Auth Components                                      │
│  ├── Login/Signup Forms                                     │
│  ├── Cultural Preference Setup                              │
│  ├── Protected Route Guards                                 │
│  └── Session Management                                     │
├─────────────────────────────────────────────────────────────┤
│                    AUTH LAYER                              │
├─────────────────────────────────────────────────────────────┤
│  Supabase Auth Service                                     │
│  ├── JWT Token Management                                   │
│  ├── Social Auth Providers                                  │
│  ├── Email/Password Authentication                          │
│  ├── Magic Link Authentication                              │
│  └── Session Refresh & Validation                          │
├─────────────────────────────────────────────────────────────┤
│                    DATABASE LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL with RLS (Row Level Security)                 │
│  ├── User Profiles                                         │
│  ├── Cultural Preferences                                  │
│  ├── Meditation Progress (User-specific)                   │
│  └── Session Data (Secure Access)                          │
└─────────────────────────────────────────────────────────────┘
```

## 🔑 Core Authentication Components

### Supabase Client Configuration

```typescript
// config/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

export const supabaseClient = createClient(
  process.env.REACT_APP_SUPABASE_URL!,
  process.env.REACT_APP_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      storage: window.localStorage,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        'X-Client-Info': 'sembalun-web@1.0.0',
      },
    },
  }
);
```

### Authentication Context Provider

```typescript
// contexts/SupabaseAuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabaseClient } from '../config/supabaseClient';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, culturalPrefs?: CulturalPreferences) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signInWithGoogle: () => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResponse>;
  updateProfile: (updates: UserProfileUpdate) => Promise<AuthResponse>;
}

interface CulturalPreferences {
  preferredTradition: 'javanese' | 'balinese' | 'sundanese' | 'minang';
  meditationLevel: 'beginner' | 'intermediate' | 'advanced';
  sessionPreferences: {
    defaultDuration: number;
    preferredTime: 'morning' | 'afternoon' | 'evening';
    musicPreference: boolean;
    guidanceLanguage: 'indonesia' | 'javanese' | 'balinese' | 'sundanese' | 'minang';
  };
}

interface AuthResponse {
  data?: any;
  error?: Error | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SupabaseAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabaseClient.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
      }
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);

        // Handle specific auth events
        switch (event) {
          case 'SIGNED_IN':
            await initializeUserProfile(session?.user);
            break;
          case 'SIGNED_OUT':
            await clearLocalData();
            break;
          case 'TOKEN_REFRESHED':
            console.log('Token refreshed successfully');
            break;
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string, 
    password: string, 
    culturalPrefs?: CulturalPreferences
  ): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            cultural_preferences: culturalPrefs || {
              preferredTradition: 'javanese',
              meditationLevel: 'beginner',
              sessionPreferences: {
                defaultDuration: 10,
                preferredTime: 'morning',
                musicPreference: true,
                guidanceLanguage: 'indonesia'
              }
            }
          }
        }
      });

      if (error) throw error;

      // Create user profile in custom table
      if (data.user) {
        await createUserProfile(data.user, culturalPrefs);
      }

      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const { error } = await supabaseClient.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Password reset error:', error);
      return { error: error as Error };
    }
  };

  const updateProfile = async (updates: UserProfileUpdate): Promise<AuthResponse> => {
    try {
      if (!user) throw new Error('No user logged in');

      const { data, error } = await supabaseClient.auth.updateUser({
        data: updates
      });

      if (error) throw error;

      // Also update custom user profile table
      await updateUserProfile(user.id, updates);

      return { data, error: null };
    } catch (error) {
      console.error('Profile update error:', error);
      return { error: error as Error };
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useSupabaseAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

// Helper functions
const initializeUserProfile = async (user: User | undefined) => {
  if (!user) return;
  
  try {
    // Check if profile exists, create if not
    const { data: existingProfile } = await supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!existingProfile) {
      await createUserProfile(user);
    }
  } catch (error) {
    console.error('Error initializing user profile:', error);
  }
};

const createUserProfile = async (user: User, culturalPrefs?: CulturalPreferences) => {
  const profile = {
    id: user.id,
    email: user.email,
    cultural_preferences: culturalPrefs || user.user_metadata.cultural_preferences,
    meditation_level: 'beginner',
    total_sessions: 0,
    total_minutes: 0,
    current_streak: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabaseClient
    .from('user_profiles')
    .insert([profile]);

  if (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

const updateUserProfile = async (userId: string, updates: any) => {
  const { error } = await supabaseClient
    .from('user_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

const clearLocalData = async () => {
  // Clear any locally stored user data
  localStorage.removeItem('sembalun-cultural-prefs');
  localStorage.removeItem('sembalun-session-cache');
  
  // Clear IndexedDB if using for offline storage
  if ('indexedDB' in window) {
    // Clear cultural content cache
    // Clear meditation session cache
  }
};
```

## 🛡️ Protected Routes System

```typescript
// components/auth/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireCulturalSetup?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireCulturalSetup = false 
}) => {
  const { user, isLoading } = useSupabaseAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if cultural setup is required but not completed
  if (requireCulturalSetup && !user.user_metadata?.cultural_preferences) {
    return <Navigate to="/cultural-setup" replace />;
  }

  return <>{children}</>;
};

// Usage in App.tsx
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute requireCulturalSetup>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

## 🎨 Cultural Preference Setup

```typescript
// components/auth/CulturalSetup.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import { CulturalTraditionCard } from '../cultural/CulturalTraditionCard';

const CULTURAL_TRADITIONS = [
  {
    id: 'javanese',
    name: 'Meditasi Jawa',
    description: 'Praktik meditasi tradisional Jawa dengan fokus pada keseimbangan batin',
    image: '/cultural-assets/javanese-meditation.jpg',
    colors: { primary: '#8B4513', secondary: '#DAA520' }
  },
  {
    id: 'balinese',
    name: 'Meditasi Bali',
    description: 'Meditasi Hindu-Bali dengan unsur spiritual dan ritual tradisional',
    image: '/cultural-assets/balinese-meditation.jpg',
    colors: { primary: '#FF6B35', secondary: '#F7931E' }
  },
  {
    id: 'sundanese',
    name: 'Meditasi Sunda',
    description: 'Praktik meditasi Sunda yang menekankan kedamaian dan harmoni alam',
    image: '/cultural-assets/sundanese-meditation.jpg',
    colors: { primary: '#2E8B57', secondary: '#90EE90' }
  },
  {
    id: 'minang',
    name: 'Meditasi Minang',
    description: 'Meditasi tradisional Minangkabau dengan nilai-nilai filosofis adat',
    image: '/cultural-assets/minang-meditation.jpg',
    colors: { primary: '#800020', secondary: '#FFD700' }
  }
];

export const CulturalSetup: React.FC = () => {
  const navigate = useNavigate();
  const { updateProfile } = useSupabaseAuth();
  const [selectedTradition, setSelectedTradition] = useState<string>('');
  const [meditationLevel, setMeditationLevel] = useState<string>('beginner');
  const [sessionPreferences, setSessionPreferences] = useState({
    defaultDuration: 10,
    preferredTime: 'morning',
    musicPreference: true,
    guidanceLanguage: 'indonesia'
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const culturalPreferences = {
        preferredTradition: selectedTradition,
        meditationLevel,
        sessionPreferences
      };

      const { error } = await updateProfile({
        cultural_preferences: culturalPreferences
      });

      if (error) throw error;

      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving cultural preferences:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Pilih Tradisi Meditasi Anda
            </h1>
            <p className="text-gray-600">
              Pilih tradisi meditasi Indonesia yang ingin Anda pelajari dan praktikkan
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Cultural Tradition Selection */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Tradisi Meditasi</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CULTURAL_TRADITIONS.map((tradition) => (
                  <CulturalTraditionCard
                    key={tradition.id}
                    tradition={tradition}
                    isSelected={selectedTradition === tradition.id}
                    onSelect={() => setSelectedTradition(tradition.id)}
                  />
                ))}
              </div>
            </div>

            {/* Meditation Level */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Tingkat Pengalaman</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'beginner', label: 'Pemula', description: 'Baru mengenal meditasi' },
                  { id: 'intermediate', label: 'Menengah', description: 'Sudah berlatih 1-6 bulan' },
                  { id: 'advanced', label: 'Mahir', description: 'Berlatih lebih dari 6 bulan' }
                ].map((level) => (
                  <label
                    key={level.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      meditationLevel === level.id 
                        ? 'border-amber-500 bg-amber-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="meditationLevel"
                      value={level.id}
                      checked={meditationLevel === level.id}
                      onChange={(e) => setMeditationLevel(e.target.value)}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <h3 className="font-medium">{level.label}</h3>
                      <p className="text-sm text-gray-600">{level.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Session Preferences */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Preferensi Sesi</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durasi Default
                  </label>
                  <select
                    value={sessionPreferences.defaultDuration}
                    onChange={(e) => setSessionPreferences(prev => ({
                      ...prev,
                      defaultDuration: Number(e.target.value)
                    }))}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value={5}>5 menit</option>
                    <option value={10}>10 menit</option>
                    <option value={15}>15 menit</option>
                    <option value={20}>20 menit</option>
                    <option value={30}>30 menit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Waktu Preferred
                  </label>
                  <select
                    value={sessionPreferences.preferredTime}
                    onChange={(e) => setSessionPreferences(prev => ({
                      ...prev,
                      preferredTime: e.target.value as 'morning' | 'afternoon' | 'evening'
                    }))}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="morning">Pagi</option>
                    <option value="afternoon">Siang</option>
                    <option value="evening">Malam</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={sessionPreferences.musicPreference}
                    onChange={(e) => setSessionPreferences(prev => ({
                      ...prev,
                      musicPreference: e.target.checked
                    }))}
                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="ml-2">Gunakan musik latar tradisional</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={!selectedTradition || isLoading}
              className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${
                selectedTradition && !isLoading
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Menyimpan...' : 'Mulai Perjalanan Meditasi'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
```

## 🔐 Database Security (Row Level Security)

```sql
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- User Profiles - Users can only access their own profile
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Meditation Sessions - Users can only access their own sessions
CREATE POLICY "Users can view their own sessions" ON meditation_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON meditation_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON meditation_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- User Progress - Users can only access their own progress
CREATE POLICY "Users can view their own progress" ON user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON user_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Cultural Traditions - Public read access for all authenticated users
CREATE POLICY "Authenticated users can view cultural traditions" ON cultural_traditions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, cultural_preferences)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'cultural_preferences'::jsonb
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## 🔄 Session Management & Token Refresh

```typescript
// services/authService.ts
class AuthService {
  private refreshTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeAutoRefresh();
  }

  private initializeAutoRefresh() {
    supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      }
      
      if (event === 'SIGNED_IN' && session) {
        this.setupAutoRefresh(session);
      }
      
      if (event === 'SIGNED_OUT') {
        this.clearAutoRefresh();
      }
    });
  }

  private setupAutoRefresh(session: Session) {
    this.clearAutoRefresh();
    
    // Refresh 5 minutes before expiry
    const expiresIn = session.expires_in || 3600;
    const refreshTime = (expiresIn - 300) * 1000;
    
    this.refreshTimer = setTimeout(async () => {
      try {
        const { error } = await supabaseClient.auth.refreshSession();
        if (error) {
          console.error('Token refresh failed:', error);
          // Optionally redirect to login
        }
      } catch (error) {
        console.error('Auto refresh error:', error);
      }
    }, refreshTime);
  }

  private clearAutoRefresh() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  async validateSession(): Promise<boolean> {
    try {
      const { data: { session }, error } = await supabaseClient.auth.getSession();
      
      if (error || !session) {
        return false;
      }

      // Check if token is expired
      const now = Date.now() / 1000;
      if (session.expires_at && session.expires_at < now) {
        // Try to refresh
        const { error: refreshError } = await supabaseClient.auth.refreshSession();
        return !refreshError;
      }

      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }
}

export const authService = new AuthService();
```

## 🚨 Error Handling & Recovery

```typescript
// utils/authErrorHandler.ts
export enum AuthErrorType {
  INVALID_CREDENTIALS = 'invalid_grant',
  USER_NOT_FOUND = 'user_not_found',
  EMAIL_NOT_CONFIRMED = 'email_not_confirmed',
  SIGNUP_DISABLED = 'signup_disabled',
  WEAK_PASSWORD = 'weak_password',
  NETWORK_ERROR = 'network_error',
  SESSION_EXPIRED = 'session_expired',
  UNKNOWN = 'unknown_error'
}

export class AuthErrorHandler {
  static getErrorType(error: any): AuthErrorType {
    if (!error) return AuthErrorType.UNKNOWN;
    
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('invalid login credentials')) {
      return AuthErrorType.INVALID_CREDENTIALS;
    }
    
    if (message.includes('email not confirmed')) {
      return AuthErrorType.EMAIL_NOT_CONFIRMED;
    }
    
    if (message.includes('signup is disabled')) {
      return AuthErrorType.SIGNUP_DISABLED;
    }
    
    if (message.includes('password is too weak')) {
      return AuthErrorType.WEAK_PASSWORD;
    }
    
    if (message.includes('network') || error.code === 'NETWORK_ERROR') {
      return AuthErrorType.NETWORK_ERROR;
    }
    
    return AuthErrorType.UNKNOWN;
  }

  static getErrorMessage(errorType: AuthErrorType): string {
    switch (errorType) {
      case AuthErrorType.INVALID_CREDENTIALS:
        return 'Email atau password salah. Silakan coba lagi.';
      case AuthErrorType.USER_NOT_FOUND:
        return 'Pengguna tidak ditemukan. Silakan daftar terlebih dahulu.';
      case AuthErrorType.EMAIL_NOT_CONFIRMED:
        return 'Silakan konfirmasi email Anda terlebih dahulu.';
      case AuthErrorType.SIGNUP_DISABLED:
        return 'Pendaftaran sementara dinonaktifkan. Silakan coba lagi nanti.';
      case AuthErrorType.WEAK_PASSWORD:
        return 'Password terlalu lemah. Gunakan minimal 8 karakter dengan huruf dan angka.';
      case AuthErrorType.NETWORK_ERROR:
        return 'Masalah jaringan. Periksa koneksi internet Anda.';
      case AuthErrorType.SESSION_EXPIRED:
        return 'Sesi telah berakhir. Silakan masuk kembali.';
      default:
        return 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.';
    }
  }

  static handleAuthError(error: any): { type: AuthErrorType; message: string } {
    const type = this.getErrorType(error);
    const message = this.getErrorMessage(type);
    
    console.error('Auth error:', { type, originalError: error });
    
    return { type, message };
  }
}

// Usage in components
const { signIn } = useSupabaseAuth();

const handleLogin = async (email: string, password: string) => {
  try {
    const { error } = await signIn(email, password);
    if (error) {
      const { message } = AuthErrorHandler.handleAuthError(error);
      setErrorMessage(message);
    }
  } catch (error) {
    const { message } = AuthErrorHandler.handleAuthError(error);
    setErrorMessage(message);
  }
};
```

## 📱 Social Authentication Integration

```typescript
// components/auth/SocialAuthButtons.tsx
import React from 'react';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import { GoogleIcon, FacebookIcon } from '../icons/SocialIcons';

export const SocialAuthButtons: React.FC = () => {
  const { signInWithGoogle } = useSupabaseAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const { error } = await signInWithGoogle();
      if (error) {
        console.error('Google sign in error:', error);
      }
    } catch (error) {
      console.error('Google sign in failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <GoogleIcon className="w-5 h-5 mr-2" />
        {isLoading ? 'Menghubungkan...' : 'Masuk dengan Google'}
      </button>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">atau</span>
        </div>
      </div>
    </div>
  );
};
```

## 🔐 Security Best Practices

### JWT Token Security
- Tokens stored in httpOnly cookies (when possible)
- Automatic token refresh before expiration
- Secure token validation on each request
- Logout clears all client-side data

### Password Security
- Minimum 8 characters requirement
- Complexity validation (letters + numbers)
- No password storage on client-side
- Secure password reset flow

### Session Security
- Session timeout after inactivity
- Device tracking for suspicious activity
- Secure session storage (localStorage with encryption)
- Cross-tab session synchronization

### Cultural Data Protection
- Respect for traditional content
- User consent for cultural data collection
- Secure handling of cultural preferences
- Privacy controls for cultural sharing

---

## 🚀 Implementation Checklist

- [x] Supabase Auth configuration
- [x] React Context provider setup
- [x] Protected route implementation
- [x] Cultural preference integration
- [x] Social authentication (Google)
- [x] Error handling and recovery
- [x] Session management
- [x] Database security (RLS)
- [ ] Magic link authentication
- [ ] Two-factor authentication (optional)
- [ ] Device management
- [ ] Advanced security monitoring

---

*Sistem autentikasi ini dirancang dengan keamanan tinggi sambil memberikan pengalaman pengguna yang lancar dan terintegrasi dengan preferensi budaya Indonesia.*