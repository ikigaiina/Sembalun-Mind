# Sembalun - State Management System

## 🧠 State Management Architecture

Sembalun menggunakan pendekatan state management yang modular dan performan, menggabungkan React Context untuk global state, Zustand untuk complex state, dan local component state untuk UI interactions.

## 🏗️ State Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    GLOBAL STATE                             │
├─────────────────────────────────────────────────────────────┤
│  React Context Providers                                    │
│  ├── AuthContext (User & Authentication)                    │
│  ├── CulturalThemeContext (Theme & Traditions)              │
│  ├── ModalContext (Modal Management)                        │
│  └── NotificationContext (App-wide Notifications)           │
├─────────────────────────────────────────────────────────────┤
│                    COMPLEX STATE (Zustand)                 │
├─────────────────────────────────────────────────────────────┤
│  Persistent Stores                                          │
│  ├── ProgressStore (User Progress & Analytics)              │
│  ├── SessionStore (Active Sessions & History)               │
│  ├── CulturalStore (Cultural Content & Preferences)         │
│  └── OfflineStore (Offline Data & Sync Queue)               │
├─────────────────────────────────────────────────────────────┤
│                    LOCAL STATE                              │
├─────────────────────────────────────────────────────────────┤
│  Component State (useState/useReducer)                      │
│  ├── Form State (Inputs, Validation)                        │
│  ├── UI State (Loading, Expanded, Selected)                 │
│  ├── Temporary Data (Session Builder, Filters)              │
│  └── Animation State (Transitions, Gestures)                │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Authentication Context

```typescript
// contexts/AuthContext.tsx
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { authApiService } from '../services/api/authApiService';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  culturalPreferences: CulturalPreferences | null;
  error: string | null;
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
  notifications: {
    dailyReminders: boolean;
    weeklyProgress: boolean;
    achievements: boolean;
    culturalContent: boolean;
  };
}

type AuthAction = 
  | { type: 'AUTH_LOADING' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User | null; session: Session | null } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'UPDATE_CULTURAL_PREFERENCES'; payload: CulturalPreferences }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_INITIALIZED' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_LOADING':
      return { ...state, isLoading: true, error: null };
      
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        session: action.payload.session,
        culturalPreferences: action.payload.user?.user_metadata?.cultural_preferences || null,
        isLoading: false,
        error: null,
      };
      
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        session: null,
        culturalPreferences: null,
        isLoading: false,
        error: action.payload,
      };
      
    case 'UPDATE_CULTURAL_PREFERENCES':
      return {
        ...state,
        culturalPreferences: action.payload,
        user: state.user ? {
          ...state.user,
          user_metadata: {
            ...state.user.user_metadata,
            cultural_preferences: action.payload,
          },
        } : null,
      };
      
    case 'CLEAR_ERROR':
      return { ...state, error: null };
      
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: true, isLoading: false };
      
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  session: null,
  isLoading: true,
  isInitialized: false,
  culturalPreferences: null,
  error: null,
};

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, culturalPrefs?: CulturalPreferences) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateCulturalPreferences: (prefs: CulturalPreferences) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      dispatch({ type: 'AUTH_LOADING' });
      
      // Get current session
      const { data: { session }, error } = await authApiService.supabaseClient.auth.getSession();
      
      if (error) throw error;
      
      dispatch({ 
        type: 'AUTH_SUCCESS', 
        payload: { user: session?.user || null, session } 
      });

      // Set up auth state listener
      authApiService.supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event);
        
        dispatch({ 
          type: 'AUTH_SUCCESS', 
          payload: { user: session?.user || null, session } 
        });
      });
      
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_INITIALIZED' });
    }
  };

  const signUp = async (email: string, password: string, culturalPrefs?: CulturalPreferences) => {
    try {
      dispatch({ type: 'AUTH_LOADING' });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const { data, error } = await authApiService.signUp({
        email,
        password,
        culturalPreferences: culturalPrefs,
      });
      
      if (error) throw error;
      
      dispatch({ 
        type: 'AUTH_SUCCESS', 
        payload: { user: data.user, session: data.session } 
      });
      
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_LOADING' });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const { data, error } = await authApiService.signIn({ email, password });
      
      if (error) throw error;
      
      dispatch({ 
        type: 'AUTH_SUCCESS', 
        payload: { user: data.user, session: data.session } 
      });
      
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      dispatch({ type: 'AUTH_LOADING' });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const { error } = await authApiService.signInWithGoogle();
      
      if (error) throw error;
      
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      dispatch({ type: 'AUTH_LOADING' });
      
      const { error } = await authApiService.signOut();
      
      if (error) throw error;
      
      dispatch({ 
        type: 'AUTH_SUCCESS', 
        payload: { user: null, session: null } 
      });
      
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      
      const { error } = await authApiService.resetPassword(email);
      
      if (error) throw error;
      
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const updateCulturalPreferences = async (prefs: CulturalPreferences) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      
      const { error } = await authApiService.updateProfile({
        culturalPreferences: prefs,
      });
      
      if (error) throw error;
      
      dispatch({ type: 'UPDATE_CULTURAL_PREFERENCES', payload: prefs });
      
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: (error as Error).message });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateCulturalPreferences,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

## 🎨 Cultural Theme Context

```typescript
// contexts/CulturalThemeContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { culturalApiService } from '../services/api/culturalApiService';
import { useAuth } from './AuthContext';

interface CulturalTradition {
  id: string;
  name: string;
  displayName: string;
  description: string;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  musicAssets: string[];
  backgroundImages: string[];
}

interface ThemeTokens {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    textMuted: string;
  };
  spacing: Record<string, string>;
  typography: Record<string, any>;
  animations: Record<string, any>;
}

interface CulturalThemeState {
  currentTradition: CulturalTradition | null;
  availableTraditions: CulturalTradition[];
  themeTokens: ThemeTokens | null;
  isLoading: boolean;
  error: string | null;
}

interface CulturalThemeContextType extends CulturalThemeState {
  switchTradition: (traditionId: string) => Promise<void>;
  resetToDefault: () => void;
  preloadTraditionAssets: (traditionId: string) => Promise<void>;
}

const CulturalThemeContext = createContext<CulturalThemeContextType | undefined>(undefined);

// Default theme tokens
const defaultThemeTokens: ThemeTokens = {
  colors: {
    primary: '#8B4513',
    secondary: '#DAA520',
    accent: '#FFD700',
    background: '#FFF8DC',
    text: '#333333',
    textMuted: '#666666',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  typography: {
    fontFamily: 'Noto Sans, Noto Sans Indonesian, system-ui, sans-serif',
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '24px',
      xxl: '32px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  animations: {
    breathing: {
      duration: '4s',
      easing: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
    },
    transition: {
      fast: '0.15s ease',
      normal: '0.3s ease',
      slow: '0.5s ease',
    },
  },
};

export const CulturalThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { culturalPreferences } = useAuth();
  const [state, setState] = useState<CulturalThemeState>({
    currentTradition: null,
    availableTraditions: [],
    themeTokens: defaultThemeTokens,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    initializeTraditions();
  }, []);

  useEffect(() => {
    // Switch to user's preferred tradition when cultural preferences change
    if (culturalPreferences?.preferredTradition && state.availableTraditions.length > 0) {
      const preferredTradition = state.availableTraditions.find(
        t => t.name === culturalPreferences.preferredTradition
      );
      if (preferredTradition && preferredTradition.id !== state.currentTradition?.id) {
        switchTradition(preferredTradition.id);
      }
    }
  }, [culturalPreferences, state.availableTraditions]);

  const initializeTraditions = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { data: traditions, error } = await culturalApiService.getCulturalTraditions();
      
      if (error) throw error;
      
      if (traditions && traditions.length > 0) {
        setState(prev => ({ 
          ...prev, 
          availableTraditions: traditions,
          currentTradition: traditions[0], // Default to first tradition
          themeTokens: generateThemeTokens(traditions[0]),
          isLoading: false 
        }));
        
        // Apply theme to CSS variables
        applyThemeToCSS(generateThemeTokens(traditions[0]));
      }
      
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: (error as Error).message, 
        isLoading: false 
      }));
    }
  };

  const switchTradition = async (traditionId: string) => {
    try {
      const tradition = state.availableTraditions.find(t => t.id === traditionId);
      
      if (!tradition) {
        throw new Error('Tradition not found');
      }

      const newThemeTokens = generateThemeTokens(tradition);
      
      setState(prev => ({
        ...prev,
        currentTradition: tradition,
        themeTokens: newThemeTokens,
      }));

      // Apply theme to CSS variables with transition
      applyThemeToCSS(newThemeTokens);
      
      // Preload tradition assets
      await preloadTraditionAssets(traditionId);
      
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: (error as Error).message 
      }));
    }
  };

  const resetToDefault = () => {
    if (state.availableTraditions.length > 0) {
      switchTradition(state.availableTraditions[0].id);
    }
  };

  const preloadTraditionAssets = async (traditionId: string) => {
    try {
      const tradition = state.availableTraditions.find(t => t.id === traditionId);
      if (!tradition) return;

      // Preload background images
      const imagePromises = tradition.backgroundImages.map(imageUrl => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageUrl;
        });
      });

      // Preload music assets (first few seconds)
      const audioPromises = tradition.musicAssets.slice(0, 3).map(audioUrl => {
        return new Promise((resolve, reject) => {
          const audio = new Audio();
          audio.oncanplaythrough = resolve;
          audio.onerror = reject;
          audio.preload = 'metadata';
          audio.src = audioUrl;
        });
      });

      await Promise.all([...imagePromises, ...audioPromises]);
      
    } catch (error) {
      console.warn('Failed to preload tradition assets:', error);
    }
  };

  const generateThemeTokens = (tradition: CulturalTradition): ThemeTokens => {
    return {
      ...defaultThemeTokens,
      colors: {
        ...defaultThemeTokens.colors,
        primary: tradition.colorPalette.primary,
        secondary: tradition.colorPalette.secondary,
        accent: tradition.colorPalette.accent,
        background: tradition.colorPalette.background,
      },
    };
  };

  const applyThemeToCSS = (tokens: ThemeTokens) => {
    const root = document.documentElement;
    
    // Apply color tokens
    Object.entries(tokens.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Apply spacing tokens
    Object.entries(tokens.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });
    
    // Apply typography tokens
    root.style.setProperty('--font-family', tokens.typography.fontFamily);
    Object.entries(tokens.typography.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value);
    });
    Object.entries(tokens.typography.fontWeight).forEach(([key, value]) => {
      root.style.setProperty(`--font-weight-${key}`, value.toString());
    });
    
    // Apply animation tokens
    root.style.setProperty('--animation-breathing-duration', tokens.animations.breathing.duration);
    root.style.setProperty('--animation-breathing-easing', tokens.animations.breathing.easing);
    Object.entries(tokens.animations.transition).forEach(([key, value]) => {
      root.style.setProperty(`--transition-${key}`, value);
    });
  };

  const value: CulturalThemeContextType = {
    ...state,
    switchTradition,
    resetToDefault,
    preloadTraditionAssets,
  };

  return (
    <CulturalThemeContext.Provider value={value}>
      {children}
    </CulturalThemeContext.Provider>
  );
};

export const useCulturalTheme = () => {
  const context = useContext(CulturalThemeContext);
  if (context === undefined) {
    throw new Error('useCulturalTheme must be used within a CulturalThemeProvider');
  }
  return context;
};
```

## 📊 Progress Store (Zustand)

```typescript
// stores/progressStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface UserProgress {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  averageSessionDuration: number;
  lastSessionDate: string | null;
}

interface CulturalMastery {
  javanese: { level: number; completedSessions: number; masteryPoints: number };
  balinese: { level: number; completedSessions: number; masteryPoints: number };
  sundanese: { level: number; completedSessions: number; masteryPoints: number };
  minang: { level: number; completedSessions: number; masteryPoints: number };
}

interface Achievement {
  id: string;
  name: string;
  displayName: string;
  description: string;
  earnedAt: string;
  points: number;
}

interface WeeklyProgress {
  sessionsThisWeek: number;
  minutesThisWeek: number;
  weekStartDate: string;
  dailyProgress: Record<string, { sessions: number; minutes: number }>;
}

interface ProgressInsights {
  preferredTimes: string[];
  mostEffectiveDurations: number[];
  culturalPreferences: Record<string, number>;
  improvementAreas: string[];
  consistencyTrend: 'improving' | 'stable' | 'declining';
}

interface ProgressState {
  // Core Progress Data
  progress: UserProgress;
  culturalMastery: CulturalMastery;
  achievements: Achievement[];
  weeklyProgress: WeeklyProgress;
  insights: ProgressInsights;
  
  // UI State
  isLoading: boolean;
  lastSyncTime: number | null;
  error: string | null;
  
  // Actions
  updateProgress: (sessionData: {
    duration: number;
    traditionId?: string;
    completionStatus: string;
    rating?: number;
  }) => void;
  addAchievement: (achievement: Achievement) => void;
  refreshProgress: () => Promise<void>;
  calculateInsights: () => void;
  getProgressForPeriod: (period: 'week' | 'month' | 'year') => any;
  resetProgress: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    immer((set, get) => ({
      // Initial State
      progress: {
        totalSessions: 0,
        totalMinutes: 0,
        currentStreak: 0,
        longestStreak: 0,
        averageSessionDuration: 0,
        lastSessionDate: null,
      },
      
      culturalMastery: {
        javanese: { level: 0, completedSessions: 0, masteryPoints: 0 },
        balinese: { level: 0, completedSessions: 0, masteryPoints: 0 },
        sundanese: { level: 0, completedSessions: 0, masteryPoints: 0 },
        minang: { level: 0, completedSessions: 0, masteryPoints: 0 },
      },
      
      achievements: [],
      
      weeklyProgress: {
        sessionsThisWeek: 0,
        minutesThisWeek: 0,
        weekStartDate: new Date().toISOString(),
        dailyProgress: {},
      },
      
      insights: {
        preferredTimes: [],
        mostEffectiveDurations: [],
        culturalPreferences: {},
        improvementAreas: [],
        consistencyTrend: 'stable',
      },
      
      isLoading: false,
      lastSyncTime: null,
      error: null,
      
      // Actions
      updateProgress: (sessionData) => set((state) => {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        // Update core progress
        state.progress.totalSessions += 1;
        state.progress.totalMinutes += sessionData.duration;
        state.progress.averageSessionDuration = 
          state.progress.totalMinutes / state.progress.totalSessions;
        
        // Update streak
        if (state.progress.lastSessionDate === today) {
          // Same day, maintain streak
        } else if (state.progress.lastSessionDate === yesterday) {
          // Consecutive day, extend streak
          state.progress.currentStreak += 1;
        } else {
          // Streak broken or first session
          state.progress.currentStreak = 1;
        }
        
        state.progress.longestStreak = Math.max(
          state.progress.longestStreak, 
          state.progress.currentStreak
        );
        state.progress.lastSessionDate = today;
        
        // Update cultural mastery if tradition specified
        if (sessionData.traditionId && sessionData.completionStatus === 'completed') {
          const traditionMap = {
            'javanese': 'javanese' as const,
            'balinese': 'balinese' as const,
            'sundanese': 'sundanese' as const,
            'minang': 'minang' as const,
          };
          
          // This would normally be fetched from tradition data
          const traditionName = traditionMap['javanese']; // Simplified for example
          
          if (traditionName && state.culturalMastery[traditionName]) {
            state.culturalMastery[traditionName].completedSessions += 1;
            state.culturalMastery[traditionName].masteryPoints += sessionData.duration;
            state.culturalMastery[traditionName].level = 
              Math.floor(state.culturalMastery[traditionName].masteryPoints / 100);
          }
        }
        
        // Update weekly progress
        const weekStart = getWeekStart();
        if (state.weeklyProgress.weekStartDate !== weekStart) {
          // New week, reset
          state.weeklyProgress.sessionsThisWeek = 1;
          state.weeklyProgress.minutesThisWeek = sessionData.duration;
          state.weeklyProgress.weekStartDate = weekStart;
          state.weeklyProgress.dailyProgress = {
            [today]: { sessions: 1, minutes: sessionData.duration }
          };
        } else {
          // Same week, update
          state.weeklyProgress.sessionsThisWeek += 1;
          state.weeklyProgress.minutesThisWeek += sessionData.duration;
          
          if (state.weeklyProgress.dailyProgress[today]) {
            state.weeklyProgress.dailyProgress[today].sessions += 1;
            state.weeklyProgress.dailyProgress[today].minutes += sessionData.duration;
          } else {
            state.weeklyProgress.dailyProgress[today] = {
              sessions: 1,
              minutes: sessionData.duration
            };
          }
        }
        
        // Trigger insights calculation
        get().calculateInsights();
      }),
      
      addAchievement: (achievement) => set((state) => {
        // Check if achievement already exists
        const exists = state.achievements.some(a => a.id === achievement.id);
        if (!exists) {
          state.achievements.push(achievement);
        }
      }),
      
      refreshProgress: async () => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });
        
        try {
          // This would fetch latest progress from API
          // const { data, error } = await progressApiService.getUserProgress();
          // if (error) throw error;
          
          set((state) => {
            state.lastSyncTime = Date.now();
            state.isLoading = false;
          });
          
        } catch (error) {
          set((state) => {
            state.error = (error as Error).message;
            state.isLoading = false;
          });
        }
      },
      
      calculateInsights: () => set((state) => {
        const { progress, weeklyProgress, culturalMastery } = state;
        
        // Calculate consistency trend
        const recentWeeks = Object.values(weeklyProgress.dailyProgress);
        if (recentWeeks.length >= 7) {
          const firstHalf = recentWeeks.slice(0, 3).reduce((sum, day) => sum + day.sessions, 0);
          const secondHalf = recentWeeks.slice(-3).reduce((sum, day) => sum + day.sessions, 0);
          
          if (secondHalf > firstHalf * 1.1) {
            state.insights.consistencyTrend = 'improving';
          } else if (secondHalf < firstHalf * 0.9) {
            state.insights.consistencyTrend = 'declining';
          } else {
            state.insights.consistencyTrend = 'stable';
          }
        }
        
        // Calculate cultural preferences
        const culturalPrefs = Object.entries(culturalMastery).reduce((acc, [tradition, data]) => {
          acc[tradition] = data.completedSessions;
          return acc;
        }, {} as Record<string, number>);
        state.insights.culturalPreferences = culturalPrefs;
        
        // Calculate improvement areas
        const areas = [];
        if (progress.currentStreak < 7) {
          areas.push('consistency');
        }
        if (progress.averageSessionDuration < 10) {
          areas.push('duration');
        }
        const activeTraditions = Object.values(culturalMastery).filter(m => m.completedSessions > 0).length;
        if (activeTraditions < 2) {
          areas.push('variety');
        }
        state.insights.improvementAreas = areas;
      }),
      
      getProgressForPeriod: (period) => {
        const state = get();
        const now = new Date();
        let startDate: Date;
        
        switch (period) {
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          case 'year':
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
        }
        
        // This would filter session data by date range
        // For now, return current progress
        return {
          sessions: state.progress.totalSessions,
          minutes: state.progress.totalMinutes,
          streak: state.progress.currentStreak,
          culturalMastery: state.culturalMastery,
        };
      },
      
      resetProgress: () => set((state) => {
        state.progress = {
          totalSessions: 0,
          totalMinutes: 0,
          currentStreak: 0,
          longestStreak: 0,
          averageSessionDuration: 0,
          lastSessionDate: null,
        };
        state.culturalMastery = {
          javanese: { level: 0, completedSessions: 0, masteryPoints: 0 },
          balinese: { level: 0, completedSessions: 0, masteryPoints: 0 },
          sundanese: { level: 0, completedSessions: 0, masteryPoints: 0 },
          minang: { level: 0, completedSessions: 0, masteryPoints: 0 },
        };
        state.achievements = [];
        state.weeklyProgress = {
          sessionsThisWeek: 0,
          minutesThisWeek: 0,
          weekStartDate: new Date().toISOString(),
          dailyProgress: {},
        };
      }),
    })),
    {
      name: 'sembalun-progress-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        progress: state.progress,
        culturalMastery: state.culturalMastery,
        achievements: state.achievements,
        weeklyProgress: state.weeklyProgress,
        insights: state.insights,
        lastSyncTime: state.lastSyncTime,
      }),
    }
  )
);

// Helper functions
function getWeekStart(): string {
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  return startOfWeek.toISOString().split('T')[0];
}
```

## 🎵 Session Store (Zustand)

```typescript
// stores/sessionStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface ActiveSession {
  id: string;
  traditionId?: string;
  sessionType: string;
  plannedDuration: number;
  startedAt: string;
  currentTime: number;
  isPaused: boolean;
  pausedAt?: string;
  totalPauseTime: number;
  sessionConfig: {
    musicEnabled: boolean;
    guidanceEnabled: boolean;
    backgroundSounds: boolean;
    customInstructions?: string;
  };
  culturalElements: {
    music?: string;
    guidance?: string;
    visualTheme?: string;
    traditionalElements: string[];
  };
}

interface SessionHistory {
  id: string;
  traditionName?: string;
  sessionType: string;
  duration: number;
  completionStatus: 'completed' | 'abandoned';
  completionPercentage: number;
  moodBefore?: string;
  moodAfter?: string;
  rating?: number;
  notes?: string;
  completedAt: string;
}

interface SessionPreset {
  id: string;
  name: string;
  traditionId?: string;
  sessionType: string;
  duration: number;
  config: any;
  culturalElements: any;
  isCustom: boolean;
}

interface SessionState {
  // Active Session
  activeSession: ActiveSession | null;
  sessionTimer: number;
  isSessionActive: boolean;
  
  // Session History
  sessionHistory: SessionHistory[];
  
  // Session Presets & Templates
  sessionPresets: SessionPreset[];
  customPresets: SessionPreset[];
  
  // Session Builder State
  sessionBuilder: {
    selectedTradition?: string;
    selectedType: string;
    selectedDuration: number;
    selectedConfig: any;
    selectedCulturalElements: any;
  };
  
  // UI State
  showSessionControls: boolean;
  showGuidanceText: boolean;
  currentGuidanceText: string;
  
  // Actions
  startSession: (sessionData: Omit<ActiveSession, 'id' | 'startedAt' | 'currentTime' | 'isPaused' | 'totalPauseTime'>) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: (endData: { 
    completionPercentage: number; 
    moodAfter?: string; 
    rating?: number; 
    notes?: string 
  }) => void;
  updateSessionTime: (currentTime: number) => void;
  
  // Session History
  addToHistory: (session: SessionHistory) => void;
  clearHistory: () => void;
  
  // Session Presets
  addCustomPreset: (preset: Omit<SessionPreset, 'id' | 'isCustom'>) => void;
  removeCustomPreset: (presetId: string) => void;
  
  // Session Builder
  updateSessionBuilder: (updates: Partial<SessionState['sessionBuilder']>) => void;
  resetSessionBuilder: () => void;
  
  // UI Actions
  toggleSessionControls: () => void;
  updateGuidanceText: (text: string) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    immer((set, get) => ({
      // Initial State
      activeSession: null,
      sessionTimer: 0,
      isSessionActive: false,
      
      sessionHistory: [],
      
      sessionPresets: [
        {
          id: 'quick-breathing',
          name: 'Pernapasan Cepat',
          sessionType: 'breathing_exercise',
          duration: 5,
          config: { musicEnabled: false, guidanceEnabled: true, backgroundSounds: false },
          culturalElements: { traditionalElements: ['breathing_focus'] },
          isCustom: false,
        },
        {
          id: 'morning-meditation',
          name: 'Meditasi Pagi',
          sessionType: 'guided_meditation',
          duration: 15,
          config: { musicEnabled: true, guidanceEnabled: true, backgroundSounds: true },
          culturalElements: { traditionalElements: ['morning_prayers', 'nature_sounds'] },
          isCustom: false,
        },
        {
          id: 'cultural-deep',
          name: 'Meditasi Budaya Mendalam',
          sessionType: 'cultural_meditation',
          duration: 30,
          config: { musicEnabled: true, guidanceEnabled: true, backgroundSounds: false },
          culturalElements: { traditionalElements: ['cultural_music', 'traditional_guidance'] },
          isCustom: false,
        },
      ],
      
      customPresets: [],
      
      sessionBuilder: {
        selectedType: 'guided_meditation',
        selectedDuration: 10,
        selectedConfig: {
          musicEnabled: true,
          guidanceEnabled: true,
          backgroundSounds: false,
        },
        selectedCulturalElements: {
          traditionalElements: [],
        },
      },
      
      showSessionControls: true,
      showGuidanceText: false,
      currentGuidanceText: '',
      
      // Actions
      startSession: (sessionData) => set((state) => {
        const newSession: ActiveSession = {
          ...sessionData,
          id: generateSessionId(),
          startedAt: new Date().toISOString(),
          currentTime: 0,
          isPaused: false,
          totalPauseTime: 0,
        };
        
        state.activeSession = newSession;
        state.isSessionActive = true;
        state.sessionTimer = 0;
        state.showGuidanceText = sessionData.sessionConfig.guidanceEnabled;
      }),
      
      pauseSession: () => set((state) => {
        if (state.activeSession && !state.activeSession.isPaused) {
          state.activeSession.isPaused = true;
          state.activeSession.pausedAt = new Date().toISOString();
        }
      }),
      
      resumeSession: () => set((state) => {
        if (state.activeSession && state.activeSession.isPaused && state.activeSession.pausedAt) {
          const pauseDuration = Date.now() - new Date(state.activeSession.pausedAt).getTime();
          state.activeSession.totalPauseTime += pauseDuration;
          state.activeSession.isPaused = false;
          delete state.activeSession.pausedAt;
        }
      }),
      
      endSession: (endData) => set((state) => {
        if (!state.activeSession) return;
        
        const session = state.activeSession;
        const actualDuration = Math.floor((session.currentTime || 0) / 60); // Convert to minutes
        
        // Add to history
        const historyEntry: SessionHistory = {
          id: session.id,
          traditionName: session.traditionId ? 'Unknown' : undefined, // Would be looked up from tradition data
          sessionType: session.sessionType,
          duration: actualDuration,
          completionStatus: endData.completionPercentage >= 80 ? 'completed' : 'abandoned',
          completionPercentage: endData.completionPercentage,
          moodAfter: endData.moodAfter,
          rating: endData.rating,
          notes: endData.notes,
          completedAt: new Date().toISOString(),
        };
        
        state.sessionHistory.unshift(historyEntry); // Add to beginning
        
        // Keep only last 100 sessions in history
        if (state.sessionHistory.length > 100) {
          state.sessionHistory = state.sessionHistory.slice(0, 100);
        }
        
        // Clear active session
        state.activeSession = null;
        state.isSessionActive = false;
        state.sessionTimer = 0;
        state.showGuidanceText = false;
        state.currentGuidanceText = '';
      }),
      
      updateSessionTime: (currentTime) => set((state) => {
        state.sessionTimer = currentTime;
        if (state.activeSession) {
          state.activeSession.currentTime = currentTime;
        }
      }),
      
      // Session History Actions
      addToHistory: (session) => set((state) => {
        state.sessionHistory.unshift(session);
        if (state.sessionHistory.length > 100) {
          state.sessionHistory = state.sessionHistory.slice(0, 100);
        }
      }),
      
      clearHistory: () => set((state) => {
        state.sessionHistory = [];
      }),
      
      // Session Presets Actions
      addCustomPreset: (preset) => set((state) => {
        const newPreset: SessionPreset = {
          ...preset,
          id: generatePresetId(),
          isCustom: true,
        };
        state.customPresets.push(newPreset);
      }),
      
      removeCustomPreset: (presetId) => set((state) => {
        state.customPresets = state.customPresets.filter(p => p.id !== presetId);
      }),
      
      // Session Builder Actions
      updateSessionBuilder: (updates) => set((state) => {
        state.sessionBuilder = { ...state.sessionBuilder, ...updates };
      }),
      
      resetSessionBuilder: () => set((state) => {
        state.sessionBuilder = {
          selectedType: 'guided_meditation',
          selectedDuration: 10,
          selectedConfig: {
            musicEnabled: true,
            guidanceEnabled: true,
            backgroundSounds: false,
          },
          selectedCulturalElements: {
            traditionalElements: [],
          },
        };
      }),
      
      // UI Actions
      toggleSessionControls: () => set((state) => {
        state.showSessionControls = !state.showSessionControls;
      }),
      
      updateGuidanceText: (text) => set((state) => {
        state.currentGuidanceText = text;
      }),
    })),
    {
      name: 'sembalun-session-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sessionHistory: state.sessionHistory,
        customPresets: state.customPresets,
        sessionBuilder: state.sessionBuilder,
      }),
    }
  )
);

// Helper functions
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generatePresetId(): string {
  return `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
```

## 🔔 Modal Context

```typescript
// contexts/ModalContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ModalType = 
  | 'auth-modal'
  | 'cultural-intro-modal'
  | 'session-complete-modal'
  | 'achievement-modal'
  | 'rating-modal'
  | 'settings-modal'
  | 'session-builder-modal'
  | 'profile-modal'
  | 'cultural-switch-modal';

interface ModalContextType {
  activeModal: ModalType | null;
  modalProps: any;
  openModal: (type: ModalType, props?: any) => void;
  closeModal: () => void;
  isModalOpen: (type: ModalType) => boolean;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [modalProps, setModalProps] = useState<any>({});

  const openModal = (type: ModalType, props = {}) => {
    setActiveModal(type);
    setModalProps(props);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalProps({});
  };

  const isModalOpen = (type: ModalType) => {
    return activeModal === type;
  };

  const value = {
    activeModal,
    modalProps,
    openModal,
    closeModal,
    isModalOpen,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
```

## 🪝 Custom Hooks for State Management

```typescript
// hooks/useSessionState.ts
import { useEffect, useCallback } from 'react';
import { useSessionStore } from '../stores/sessionStore';
import { useProgressStore } from '../stores/progressStore';

export const useSessionState = () => {
  const {
    activeSession,
    isSessionActive,
    sessionTimer,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    updateSessionTime,
  } = useSessionStore();

  const { updateProgress } = useProgressStore();

  // Session timer effect
  useEffect(() => {
    if (!isSessionActive || !activeSession || activeSession.isPaused) {
      return;
    }

    const interval = setInterval(() => {
      updateSessionTime(sessionTimer + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isSessionActive, activeSession?.isPaused, sessionTimer, updateSessionTime]);

  // Handle session completion
  const completeSession = useCallback((endData: any) => {
    if (!activeSession) return;

    // End the session in session store
    endSession(endData);

    // Update progress in progress store
    updateProgress({
      duration: Math.floor((activeSession.currentTime || 0) / 60),
      traditionId: activeSession.traditionId,
      completionStatus: endData.completionPercentage >= 80 ? 'completed' : 'abandoned',
      rating: endData.rating,
    });
  }, [activeSession, endSession, updateProgress]);

  return {
    activeSession,
    isSessionActive,
    sessionTimer,
    startSession,
    pauseSession,
    resumeSession,
    completeSession,
    formatTime: (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    },
    getProgressPercentage: () => {
      if (!activeSession) return 0;
      return Math.min((sessionTimer / (activeSession.plannedDuration * 60)) * 100, 100);
    },
  };
};

// hooks/useCulturalState.ts
import { useCulturalTheme } from '../contexts/CulturalThemeContext';
import { useAuth } from '../contexts/AuthContext';

export const useCulturalState = () => {
  const { culturalPreferences, updateCulturalPreferences } = useAuth();
  const {
    currentTradition,
    availableTraditions,
    themeTokens,
    switchTradition,
    isLoading,
  } = useCulturalTheme();

  const updatePreferredTradition = useCallback(async (traditionName: string) => {
    if (!culturalPreferences) return;

    const updatedPreferences = {
      ...culturalPreferences,
      preferredTradition: traditionName as any,
    };

    await updateCulturalPreferences(updatedPreferences);
    
    // Find and switch to the tradition
    const tradition = availableTraditions.find(t => t.name === traditionName);
    if (tradition) {
      await switchTradition(tradition.id);
    }
  }, [culturalPreferences, availableTraditions, updateCulturalPreferences, switchTradition]);

  return {
    currentTradition,
    availableTraditions,
    themeTokens,
    culturalPreferences,
    isLoading,
    updatePreferredTradition,
    switchTradition,
  };
};
```

## 📦 State Persistence Strategy

```typescript
// utils/statePersistence.ts
interface PersistenceConfig {
  key: string;
  version: number;
  migrate?: (persistedState: any, version: number) => any;
}

export class StatePersistence {
  private static migrations = {
    progressStore: {
      1: (state: any) => state, // No migration needed for v1
      2: (state: any) => {
        // Migration for v2 - add insights field if missing
        return {
          ...state,
          insights: state.insights || {
            preferredTimes: [],
            mostEffectiveDurations: [],
            culturalPreferences: {},
            improvementAreas: [],
            consistencyTrend: 'stable',
          },
        };
      },
    },
    sessionStore: {
      1: (state: any) => state,
      2: (state: any) => {
        // Migration for v2 - restructure session builder
        return {
          ...state,
          sessionBuilder: {
            ...state.sessionBuilder,
            selectedConfig: state.sessionBuilder.selectedConfig || {
              musicEnabled: true,
              guidanceEnabled: true,
              backgroundSounds: false,
            },
          },
        };
      },
    },
  };

  static getMigration(storeName: keyof typeof StatePersistence.migrations, version: number) {
    return StatePersistence.migrations[storeName]?.[version];
  }

  static migrateState(storeName: keyof typeof StatePersistence.migrations, state: any, fromVersion: number, toVersion: number) {
    let migratedState = state;
    
    for (let version = fromVersion + 1; version <= toVersion; version++) {
      const migration = StatePersistence.getMigration(storeName, version);
      if (migration) {
        migratedState = migration(migratedState);
      }
    }
    
    return migratedState;
  }

  static clearAllPersistedState() {
    const keys = [
      'sembalun-progress-store',
      'sembalun-session-store',
      'sembalun-cultural-cache',
    ];
    
    keys.forEach(key => {
      localStorage.removeItem(key);
    });
  }

  static exportUserState() {
    const progressStore = localStorage.getItem('sembalun-progress-store');
    const sessionStore = localStorage.getItem('sembalun-session-store');
    
    return {
      progress: progressStore ? JSON.parse(progressStore) : null,
      sessions: sessionStore ? JSON.parse(sessionStore) : null,
      exportedAt: new Date().toISOString(),
    };
  }

  static importUserState(stateData: any) {
    if (stateData.progress) {
      localStorage.setItem('sembalun-progress-store', JSON.stringify(stateData.progress));
    }
    
    if (stateData.sessions) {
      localStorage.setItem('sembalun-session-store', JSON.stringify(stateData.sessions));
    }
  }
}
```

---

## 🚀 Implementation Checklist

- [x] Authentication Context with cultural preferences
- [x] Cultural Theme Context with dynamic theming
- [x] Modal Context for app-wide modal management
- [x] Progress Store with Zustand and persistence
- [x] Session Store with active session management
- [x] Custom hooks for complex state logic
- [x] State persistence and migration strategies
- [x] Cross-store state synchronization
- [ ] Performance optimization with selectors
- [ ] State debugging tools (Redux DevTools)
- [ ] State testing utilities
- [ ] State documentation and TypeScript types

---

*Sistem state management ini dirancang untuk memberikan pengalaman yang konsisten dan performan sambil mendukung kekayaan budaya Indonesia dalam setiap aspek aplikasi.*