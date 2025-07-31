import type { User as FirebaseUser } from 'firebase/auth';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Date;
  lastLoginAt: Date;
  isGuest: boolean;
  preferences: UserPreferences;
  progress: UserProgress;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'id';
  notifications: {
    daily: boolean;
    reminders: boolean;
    achievements: boolean;
  };
  privacy: {
    analytics: boolean;
    dataSharing: boolean;
  };
  meditation: {
    defaultDuration: number;
    preferredVoice: string;
    backgroundSounds: boolean;
  };
}

export interface UserProgress {
  totalSessions: number;
  totalMinutes: number;
  streak: number;
  longestStreak: number;
  achievements: string[];
  lastSessionDate: Date | null;
  favoriteCategories: string[];
  completedPrograms: string[];
}

export interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isGuest: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  continueAsGuest: () => void;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  exportUserData: () => Promise<string>;
}

export interface AuthError {
  code: string;
  message: string;
}