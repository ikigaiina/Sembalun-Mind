/**
 * Comprehensive TypeScript type definitions for Supabase integration
 * Generated from system architecture design
 */

import type { PostgrestError, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// ========================================
// Core Database Types
// ========================================

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: UserInsert;
        Update: UserUpdate;
      };
      meditation_sessions: {
        Row: MeditationSession;
        Insert: MeditationSessionInsert;
        Update: MeditationSessionUpdate;
      };
      journal_entries: {
        Row: JournalEntry;
        Insert: JournalEntryInsert;
        Update: JournalEntryUpdate;
      };
      achievements: {
        Row: Achievement;
        Insert: AchievementInsert;
        Update: AchievementUpdate;
      };
      courses: {
        Row: Course;
        Insert: CourseInsert;
        Update: CourseUpdate;
      };
      user_course_progress: {
        Row: UserCourseProgress;
        Insert: UserCourseProgressInsert;
        Update: UserCourseProgressUpdate;
      };
      bookmarks: {
        Row: Bookmark;
        Insert: BookmarkInsert;
        Update: BookmarkUpdate;
      };
      user_settings: {
        Row: UserSetting;
        Insert: UserSettingInsert;
        Update: UserSettingUpdate;
      };
      moods: {
        Row: Mood;
        Insert: MoodInsert;
        Update: MoodUpdate;
      };
    };
    Views: {
      user_analytics: {
        Row: UserAnalytics;
      };
    };
    Functions: {
      calculate_user_stats: {
        Args: { user_uuid: string };
        Returns: UserStats;
      };
      calculate_current_streak: {
        Args: { user_uuid: string };
        Returns: number;
      };
    };
  };
}

// ========================================
// User Types (Matching Database Schema)
// ========================================

export interface User {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  preferences: UserPreferences;
  progress: UserProgress;
  is_guest: boolean;
}

export interface SupabaseUser extends User {}

export interface UserInsert {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  preferences?: UserPreferences;
  progress?: UserProgress;
  is_guest?: boolean;
}

export interface UserUpdate {
  email?: string;
  display_name?: string;
  avatar_url?: string;
  preferences?: UserPreferences;
  progress?: UserProgress;
  is_guest?: boolean;
}

export interface SupabaseUserInsert extends UserInsert {}
export interface SupabaseUserUpdate extends UserUpdate {}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'id';
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
  meditation: MeditationPreferences;
  accessibility: AccessibilitySettings;
  display: DisplaySettings;
}

export interface NotificationPreferences {
  daily: boolean;
  reminders: boolean;
  achievements: boolean;
  weeklyProgress: boolean;
  socialUpdates: boolean;
  push: boolean;
  email: boolean;
  sound: boolean;
  vibration: boolean;
}

export interface PrivacySettings {
  analytics: boolean;
  dataSharing: boolean;
  profileVisibility: 'public' | 'friends' | 'private';
  shareProgress: boolean;
  locationTracking: boolean;
}

export interface MeditationPreferences {
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
}

export interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  screenReader: boolean;
  keyboardNavigation: boolean;
}

export interface DisplaySettings {
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  weekStartsOn: 'sunday' | 'monday';
  showStreaks: boolean;
  showStatistics: boolean;
}

export interface UserProgress {
  total_sessions: number;
  total_minutes: number;
  current_streak: number;
  longest_streak: number;
  achievements: string[];
  favorite_categories: string[];
  completed_programs: string[];
}

// ========================================
// Meditation Session Types
// ========================================

export interface MeditationSession {
  id: string;
  user_id: string;
  type: MeditationSessionType;
  duration_minutes: number;
  completed_at: string;
  mood_before?: string;
  mood_after?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MeditationSessionInsert {
  id?: string;
  user_id: string;
  type: MeditationSessionType;
  duration_minutes: number;
  completed_at: string;
  mood_before?: string;
  mood_after?: string;
  notes?: string;
}

export interface MeditationSessionUpdate {
  type?: MeditationSessionType;
  duration_minutes?: number;
  completed_at?: string;
  mood_before?: string;
  mood_after?: string;
  notes?: string;
}

export type MeditationSessionType = 'breathing' | 'guided' | 'silent' | 'walking';

// ========================================
// Journal Entry Types
// ========================================

export interface JournalEntry {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  mood?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface JournalEntryInsert {
  id?: string;
  user_id: string;
  title?: string;
  content: string;
  mood?: string;
  tags?: string[];
}

export interface JournalEntryUpdate {
  title?: string;
  content?: string;
  mood?: string;
  tags?: string[];
}

// ========================================
// Achievement Types
// ========================================

export interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  title: string;
  description: string;
  icon: string;
  unlocked_at: string;
  created_at: string;
}

export interface AchievementInsert {
  id?: string;
  user_id: string;
  achievement_type: string;
  title: string;
  description: string;
  icon: string;
  unlocked_at: string;
}

export interface AchievementUpdate {
  achievement_type?: string;
  title?: string;
  description?: string;
  icon?: string;
  unlocked_at?: string;
}

// ========================================
// Course Types
// ========================================

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: CourseDifficulty;
  duration_minutes: number;
  instructor?: string;
  image_url?: string;
  audio_url?: string;
  is_premium: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface CourseInsert {
  id?: string;
  title: string;
  description: string;
  category: string;
  difficulty: CourseDifficulty;
  duration_minutes: number;
  instructor?: string;
  image_url?: string;
  audio_url?: string;
  is_premium?: boolean;
  order_index?: number;
}

export interface CourseUpdate {
  title?: string;
  description?: string;
  category?: string;
  difficulty?: CourseDifficulty;
  duration_minutes?: number;
  instructor?: string;
  image_url?: string;
  audio_url?: string;
  is_premium?: boolean;
  order_index?: number;
}

export type CourseDifficulty = 'beginner' | 'intermediate' | 'advanced';

// ========================================
// User Course Progress Types
// ========================================

export interface UserCourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  progress_percentage: number;
  last_accessed_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserCourseProgressInsert {
  id?: string;
  user_id: string;
  course_id: string;
  progress_percentage?: number;
  last_accessed_at: string;
  completed_at?: string;
}

export interface UserCourseProgressUpdate {
  progress_percentage?: number;
  last_accessed_at?: string;
  completed_at?: string;
}

// ========================================
// Bookmark Types
// ========================================

export interface Bookmark {
  id: string;
  user_id: string;
  content_type: BookmarkContentType;
  content_id: string;
  created_at: string;
}

export interface BookmarkInsert {
  id?: string;
  user_id: string;
  content_type: BookmarkContentType;
  content_id: string;
}

export interface BookmarkUpdate {
  content_type?: BookmarkContentType;
  content_id?: string;
}

export type BookmarkContentType = 'course' | 'session' | 'journal';

// ========================================
// User Settings Types
// ========================================

export interface UserSetting {
  id: string;
  user_id: string;
  setting_key: string;
  setting_value: any; // JSONB
  created_at: string;
  updated_at: string;
}

export interface UserSettingInsert {
  id?: string;
  user_id: string;
  setting_key: string;
  setting_value: any;
}

export interface UserSettingUpdate {
  setting_key?: string;
  setting_value?: any;
}

// ========================================
// Mood Types
// ========================================

export interface Mood {
  id: string;
  user_id: string;
  mood: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MoodInsert {
  id?: string;
  user_id: string;
  mood: string;
  notes?: string;
}

export interface MoodUpdate {
  mood?: string;
  notes?: string;
}

// ========================================
// Analytics Types
// ========================================

export interface UserAnalytics {
  id: string;
  display_name?: string;
  signup_date: string;
  total_sessions: number;
  total_minutes: number;
  active_days: number;
  avg_session_duration: number;
  achievements_count: number;
  journal_entries_count: number;
  days_since_signup: number;
}

export interface UserStats {
  total_sessions: number;
  total_minutes: number;
  current_streak: number;
  favorite_category: string;
  last_session: string;
  achievements_count: number;
}

// ========================================
// Database Operation Types
// ========================================

export type DatabaseResult<T> = {
  data: T | null;
  error: PostgrestError | null;
  count?: number;
};

export type DatabaseListResult<T> = {
  data: T[] | null;
  error: PostgrestError | null;
  count?: number;
};

// ========================================
// Real-time Types
// ========================================

export type RealtimePayload<T = any> = RealtimePostgresChangesPayload<T>;

export interface RealtimeSubscriptionConfig<T = any> {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  schema?: string;
  filter?: string;
  callback: (payload: RealtimePayload<T>) => void;
}

export interface PresenceState {
  user_id: string;
  username: string;
  status: 'online' | 'meditating' | 'away';
  activity?: string;
  joined_at: string;
}

// ========================================
// Query Builder Types
// ========================================

export interface QueryOptions<T = any> {
  select?: string;
  filters?: QueryFilter[];
  orderBy?: {
    column: string;
    ascending?: boolean;
  };
  limit?: number;
  offset?: number;
}

export interface QueryFilter {
  column: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'is';
  value: any;
}

export interface BatchQuery {
  id?: string;
  table: string;
  options: QueryOptions<any>;
}

export interface BatchQueryResult<T = any> {
  queryId: string;
  data: T[] | null;
  error: PostgrestError | null;
  count?: number;
  executionTime: number;
}

// ========================================
// Offline Sync Types
// ========================================

export interface OfflineRecord {
  id: string;
  sync_status: SyncStatus;
  last_modified: string;
  version: number;
}

export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'conflict' | 'failed';

export interface SyncConflict<T = any> {
  id: string;
  table_name: string;
  record_id: string;
  local_data: T & OfflineRecord;
  remote_data: T & OfflineRecord;
  conflict_fields: string[];
  created_at: string;
}

export interface ConflictResolution<T = any> {
  resolution_type: 'accept_local' | 'accept_remote' | 'merge' | 'manual';
  resolved_data: T;
  metadata: {
    strategy: string;
    timestamp: string;
    [key: string]: any;
  };
}

export interface SyncResult {
  success: boolean;
  synced: {
    sessions: number;
    moods: number;
    journals: number;
  };
  failed: {
    sessions: string[];
    moods: string[];
    journals: string[];
  };
  errors: string[];
  dataUsage: number; // bytes
  duration: number; // milliseconds
}

// ========================================
// Performance Monitoring Types
// ========================================

export interface ConnectionHealth {
  status: 'excellent' | 'good' | 'poor' | 'disconnected';
  latency: number;
  lastCheck: Date;
  error?: string;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  queryPerformance: {
    averageLatency: number;
    errorRate: number;
    totalQueries: number;
  };
  memoryUsage: number;
  timestamp: Date;
}

export interface NetworkQuality {
  latency: number;
  online: boolean;
  connectionType: string;
  timestamp: Date;
  error?: string;
}

// ========================================
// Authentication Types
// ========================================

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: SupabaseUser;
}

export interface AuthError {
  code: string;
  message: string;
}

export interface AuthState {
  user: SupabaseUser | null;
  session: AuthSession | null;
  loading: boolean;
  error: AuthError | null;
}

// ========================================
// Security Types
// ========================================

export type SecurityEvent = 
  | 'LOGIN_ATTEMPT'
  | 'LOGIN_FAILURE'
  | 'LOGIN_SUCCESS'
  | 'LOGOUT'
  | 'PASSWORD_CHANGE'
  | 'ACCOUNT_LOCKED'
  | 'XSS_ATTEMPT'
  | 'CSRF_ATTEMPT'
  | 'RATE_LIMIT_EXCEEDED'
  | 'SUSPICIOUS_ACTIVITY'
  | 'DATA_BREACH_ATTEMPT'
  | 'INVALID_SESSION_DETECTED'
  | 'DATA_INTEGRITY_VIOLATION'
  | 'CONSOLE_ACCESS_EXCESSIVE';

export interface SecurityAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  data: any;
  timestamp: Date;
  acknowledged: boolean;
}

// ========================================
// Utility Types
// ========================================

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// ========================================
// API Response Types
// ========================================

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// ========================================
// Type Guards
// ========================================

export const isSupabaseUser = (obj: any): obj is SupabaseUser => {
  return obj && typeof obj.id === 'string' && typeof obj.email === 'string';
};

export const isMeditationSession = (obj: any): obj is MeditationSession => {
  return obj && typeof obj.id === 'string' && typeof obj.user_id === 'string' && 
         ['breathing', 'guided', 'silent', 'walking'].includes(obj.type);
};

export const isJournalEntry = (obj: any): obj is JournalEntry => {
  return obj && typeof obj.id === 'string' && typeof obj.user_id === 'string' && 
         typeof obj.content === 'string';
};

export const isDatabaseError = (error: any): error is PostgrestError => {
  return error && typeof error.code === 'string' && typeof error.message === 'string';
};

export const isSyncConflict = (obj: any): obj is SyncConflict => {
  return obj && typeof obj.id === 'string' && typeof obj.table_name === 'string' &&
         obj.local_data && obj.remote_data && Array.isArray(obj.conflict_fields);
};

// ========================================
// Helper Types for Complex Operations
// ========================================

export type TableName = keyof Database['public']['Tables'];

export type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row'];

export type TableInsert<T extends TableName> = Database['public']['Tables'][T]['Insert'];

export type TableUpdate<T extends TableName> = Database['public']['Tables'][T]['Update'];

export type FunctionName = keyof Database['public']['Functions'];

export type FunctionArgs<T extends FunctionName> = Database['public']['Functions'][T]['Args'];

export type FunctionReturns<T extends FunctionName> = Database['public']['Functions'][T]['Returns'];

// ========================================
// Export All Types
// ========================================

export type {
  Database,
  SupabaseUser,
  MeditationSession,
  JournalEntry,
  Achievement,
  Course,
  UserCourseProgress,
  Bookmark,
  UserSetting,
  Mood,
  UserAnalytics,
  UserStats,
  UserPreferences,
  NotificationPreferences,
  PrivacySettings,
  MeditationPreferences,
  AccessibilitySettings,
  DisplaySettings,
  UserProgress
};