import type { User as SupabaseUser } from '@supabase/supabase-js';

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
  personalInfo?: PersonalInfo;
  meditationExperience?: MeditationExperience;
  goals?: UserGoals;
  schedule?: MeditationSchedule;
  assessments?: UserAssessments;
  meditationSchedule?: MeditationSchedule;
  privacySettings?: {
    analytics: boolean;
    dataSharing: {
      thirdPartyAnalytics: boolean;
      researchParticipation: boolean;
      anonymizedInsights: boolean;
      partnerIntegrations: boolean;
    };
    profileVisibility: 'public' | 'friends' | 'private';
    shareProgress: boolean;
    locationTracking: boolean;
    cookieConsent?: {
      essential: boolean;
      functional: boolean;
      analytics: boolean;
      marketing: boolean;
      lastUpdated: string;
    };
  };
  totalMeditationMinutes?: number;
  completedSessions?: string[];
  completedCourses?: string[];
  currentStreak?: number;
  learningPath?: string;
}

export interface PersonalInfo {
  firstName?: string;
  lastName?: string;
  age?: number;
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  location?: {
    city?: string;
    country?: string;
    timezone?: string;
  };
  occupation?: string;
  bio?: string;
}

export interface MeditationExperience {
  level: 'beginner' | 'intermediate' | 'advanced';
  yearsOfPractice?: number;
  previousStyles?: string[];
  currentPractices?: string[];
  motivations?: string[];
  challenges?: string[];
}

export interface UserGoals {
  primary: 'stress-reduction' | 'focus-improvement' | 'sleep-quality' | 'emotional-growth' | 'mindfulness' | 'self-awareness';
  secondary?: string[];
  specificTargets?: {
    stressLevel?: number; // 1-10 scale
    sleepQuality?: number; // 1-10 scale
    focusTime?: number; // minutes per day
    emotionalBalance?: number; // 1-10 scale
  };
  timeline?: 'short-term' | 'medium-term' | 'long-term'; // weeks, months, years
}

export interface MeditationSchedule {
  enabled?: boolean;
  preferredTimes?: string[]; // ['morning', 'afternoon', 'evening', 'night']
  duration?: number; // preferred session length in minutes
  frequency?: 'daily' | 'weekly' | 'custom'; // changed from number to string union
  reminders?: {
    enabled: boolean;
    times: string[]; // time strings like "07:00", "19:00"
    daysOfWeek: number[]; // 0-6, Sunday = 0
  };
  quietHours?: {
    start: string;
    end: string;
  };
  reminderSettings?: {
    enabled: boolean;
    advanceMinutes: number;
    sound: boolean;
    vibration: boolean;
  };
  flexibilityWindow?: number; // minutes before/after preferred time
  adaptiveScheduling?: boolean; // AI-powered schedule adjustments
  goalTracking?: {
    weeklyGoal: number; // minutes per week
    dailyStreak: number;
    weeklyStreak: number;
    longestStreak: number;
  };
}

export interface UserAssessments {
  emotionalIntelligence?: {
    score: number;
    completedAt: Date;
    areas: {
      selfAwareness: number;
      selfRegulation: number;
      motivation: number;
      empathy: number;
      socialSkills: number;
    };
  };
  stressLevel?: {
    score: number;
    completedAt: Date;
    factors: string[];
  };
  mindfulnessLevel?: {
    score: number;
    completedAt: Date;
    strengths: string[];
    improvements: string[];
  };
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'id';
  onboardingCompleted?: boolean;
  notifications: {
    daily: boolean;
    reminders: boolean;
    achievements: boolean;
    weeklyProgress: boolean;
    socialUpdates: boolean;
    push: boolean;
    email: boolean;
    sound: boolean;
    vibration: boolean;
  };
  privacy: {
    analytics: boolean;
    dataSharing: boolean;
    profileVisibility: 'public' | 'friends' | 'private';
    shareProgress: boolean;
    locationTracking: boolean;
  };
  meditation: {
    defaultDuration: number;
    preferredVoice: string;
    backgroundSounds: boolean;
    selectedBackgroundSound?: string;
    guidanceLevel: 'minimal' | 'moderate' | 'detailed';
    musicVolume: number; // 0-100
    voiceVolume: number; // 0-100
    autoAdvance: boolean;
    showTimer: boolean;
    preparationTime: number; // seconds
    endingBell: boolean;
  };
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large' | 'extra-large';
    screenReader: boolean;
    keyboardNavigation: boolean;
  };
  display: {
    dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
    timeFormat: '12h' | '24h';
    weekStartsOn: 'sunday' | 'monday';
    showStreaks: boolean;
    showStatistics: boolean;
  };
  downloadPreferences: {
    autoDownload: boolean;
    wifiOnly: boolean;
    storageLimit: number; // in GB
  };
  favoriteCategories?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  sessionDuration?: number | string;
  timeOfDay?: string;
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
  user: SupabaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isGuest: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  continueAsGuest: () => void;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  exportUserData: () => Promise<string>;
  migrateGuestData: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  reauthenticateUser: (password: string) => Promise<void>;
}

export interface AuthError {
  code: string;
  message: string;
}

/**
 * Authentication loading states for different operations
 */
export interface AuthLoadingStates {
  /** General authentication loading state */
  loading: boolean;
  /** Profile data loading state */
  profileLoading: boolean;
  /** OAuth provider sign-in loading */
  oauthLoading: boolean;
  /** Email/password operation loading */
  emailAuthLoading: boolean;
  /** Password reset loading */
  resetPasswordLoading: boolean;
  /** Account deletion loading */
  deleteAccountLoading: boolean;
}

/**
 * Authentication form validation errors
 */
export interface AuthFormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  displayName?: string;
  general?: string;
}

/**
 * Enhanced authentication context type with better loading states
 */
export interface EnhancedAuthContextType extends AuthContextType {
  /** Detailed loading states */
  loadingStates: AuthLoadingStates;
  /** Form validation errors */
  formErrors: AuthFormErrors;
  /** Clear specific form errors */
  clearFormErrors: (fields?: string[]) => void;
  /** Set form errors */
  setFormErrors: (errors: Partial<AuthFormErrors>) => void;
}

/**
 * Type guard to check if user is authenticated
 */
export const isAuthenticated = (user: SupabaseUser | null, isGuest: boolean): boolean => {
  return Boolean(user || isGuest);
};

/**
 * Type guard to check if user is a registered user (not guest)
 */
export const isRegisteredUser = (user: SupabaseUser | null, isGuest: boolean): boolean => {
  return Boolean(user && !isGuest);
};

/**
 * Type guard to check if error is an AuthError
 */
export const isAuthError = (error: unknown): error is AuthError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as AuthError).code === 'string' &&
    typeof (error as AuthError).message === 'string'
  );
};