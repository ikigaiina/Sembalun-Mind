import { supabase, handleSupabaseError } from '../config/supabaseClient';
import type { User, AuthError, Session } from '@supabase/supabase-js';
import type {
  User as UserProfile,
  UserInsert,
  UserUpdate,
  MeditationSession,
  MeditationSessionInsert,
  MeditationSessionUpdate,
  JournalEntry,
  JournalEntryInsert,
  JournalEntryUpdate,
  Achievement,
  AchievementInsert,
  Course,
  UserCourseProgress,
  UserCourseProgressInsert,
  Bookmark,
  BookmarkInsert,
  Mood,
  MoodInsert,
  UserProgress
} from '../types/supabase';

// ========== TYPES ==========
export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

export interface SignUpData {
  email: string;
  password: string;
  displayName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface UploadResult {
  path: string;
  fullPath: string;
  publicUrl: string;
}

// ========== UNIFIED SUPABASE SERVICE ==========
export class SupabaseService {
  
  // ========== STORAGE BUCKETS ==========
  private static readonly BUCKETS = {
    AVATARS: 'avatars',
    AUDIO: 'audio',
    IMAGES: 'images',
    DOCUMENTS: 'documents'
  };

  // ========== AUTHENTICATION ==========

  static async signUp({ email, password, displayName }: SignUpData): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName || email.split('@')[0] }
        }
      });

      return {
        user: data.user,
        session: data.session,
        error: error
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error as AuthError
      };
    }
  }

  static async signIn({ email, password }: SignInData): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      return {
        user: data.user,
        session: data.session,
        error: error
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error as AuthError
      };
    }
  }

  static async signInWithGoogle(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }

  static async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }

  static async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  static async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Get current session error:', error);
      return null;
    }
  }

  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }

  // ========== DATABASE OPERATIONS ==========

  // Users
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) handleSupabaseError(error);
      return data;
    } catch (error) {
      handleSupabaseError(error);
      return null;
    }
  }

  static async updateUserProfile(userId: string, updates: UserUpdate): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data;
    } catch (error) {
      handleSupabaseError(error);
      return null;
    }
  }

  static async createUserProfile(userId: string, email: string, displayName?: string, avatarUrl?: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          email,
          display_name: displayName,
          avatar_url: avatarUrl,
          is_guest: false
        })
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data;
    } catch (error) {
      handleSupabaseError(error);
      return null;
    }
  }

  // Meditation Sessions
  static async createMeditationSession(session: MeditationSessionInsert): Promise<MeditationSession | null> {
    try {
      const { data, error } = await supabase
        .from('meditation_sessions')
        .insert(session)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data;
    } catch (error) {
      handleSupabaseError(error);
      return null;
    }
  }

  static async getUserMeditationSessions(userId: string, limit: number = 50): Promise<MeditationSession[]> {
    try {
      const { data, error } = await supabase
        .from('meditation_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error) handleSupabaseError(error);
      return data || [];
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  }

  static async getMeditationStats(userId: string): Promise<{
    totalSessions: number;
    totalMinutes: number;
    averageSession: number;
    thisWeekSessions: number;
  }> {
    try {
      const { data: totalData, error: totalError } = await supabase
        .from('meditation_sessions')
        .select('duration_minutes')
        .eq('user_id', userId);

      if (totalError) handleSupabaseError(totalError);

      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const { data: weekData, error: weekError } = await supabase
        .from('meditation_sessions')
        .select('id')
        .eq('user_id', userId)
        .gte('completed_at', weekStart.toISOString());

      if (weekError) handleSupabaseError(weekError);

      const totalSessions = totalData?.length || 0;
      const totalMinutes = totalData?.reduce((sum, session) => sum + session.duration_minutes, 0) || 0;
      const averageSession = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;
      const thisWeekSessions = weekData?.length || 0;

      return {
        totalSessions,
        totalMinutes,
        averageSession,
        thisWeekSessions
      };
    } catch (error) {
      handleSupabaseError(error);
      return {
        totalSessions: 0,
        totalMinutes: 0,
        averageSession: 0,
        thisWeekSessions: 0
      };
    }
  }

  // Courses
  static async getCourses(category?: string): Promise<Course[]> {
    try {
      let query = supabase
        .from('courses')
        .select('*')
        .order('order_index', { ascending: true });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) handleSupabaseError(error);
      return data || [];
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  }

  // Journal Entries
  static async createJournalEntry(entry: JournalEntryInsert): Promise<JournalEntry | null> {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert(entry)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data;
    } catch (error) {
      handleSupabaseError(error);
      return null;
    }
  }

  static async getUserJournalEntries(userId: string, limit: number = 50): Promise<JournalEntry[]> {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) handleSupabaseError(error);
      return data || [];
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  }

  // Moods
  static async createMood(mood: MoodInsert): Promise<Mood | null> {
    try {
      const { data, error } = await supabase
        .from('moods')
        .insert(mood)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data;
    } catch (error) {
      handleSupabaseError(error);
      return null;
    }
  }

  static async getUserMoods(userId: string, limit: number = 30): Promise<Mood[]> {
    try {
      const { data, error } = await supabase
        .from('moods')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) handleSupabaseError(error);
      return data || [];
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  }

  // ========== STORAGE OPERATIONS ==========

  static async uploadAvatar(userId: string, file: File): Promise<{ data: UploadResult | null; error: any }> {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not available') };
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(this.BUCKETS.AVATARS)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) return { data: null, error };

      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKETS.AVATARS)
        .getPublicUrl(filePath);

      return {
        data: {
          path: data.path,
          fullPath: data.fullPath,
          publicUrl
        },
        error: null
      };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async uploadAudio(file: File, path?: string): Promise<{ data: UploadResult | null; error: any }> {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not available') };
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = path ? `${path}/${fileName}` : fileName;

      const { data, error } = await supabase.storage
        .from(this.BUCKETS.AUDIO)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) return { data: null, error };

      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKETS.AUDIO)
        .getPublicUrl(filePath);

      return {
        data: {
          path: data.path,
          fullPath: data.fullPath,
          publicUrl
        },
        error: null
      };
    } catch (error) {
      return { data: null, error };
    }
  }

  static getAvatarUrl(filePath: string): string | null {
    if (!supabase) return null;
    const { data } = supabase.storage
      .from(this.BUCKETS.AVATARS)
      .getPublicUrl(filePath);
    return data.publicUrl;
  }

  static getAudioUrl(filePath: string): string | null {
    if (!supabase) return null;
    const { data } = supabase.storage
      .from(this.BUCKETS.AUDIO)
      .getPublicUrl(filePath);
    return data.publicUrl;
  }

  // ========== UTILITY METHODS ==========

  static async initializeBuckets(): Promise<void> {
    if (!supabase) return;

    const buckets = Object.values(this.BUCKETS);
    
    for (const bucketName of buckets) {
      try {
        const { data: existingBucket } = await supabase.storage.getBucket(bucketName);
        
        if (!existingBucket) {
          await supabase.storage.createBucket(bucketName, {
            public: bucketName !== this.BUCKETS.DOCUMENTS,
            allowedMimeTypes: this.getAllowedMimeTypes(bucketName),
            fileSizeLimit: this.getFileSizeLimit(bucketName)
          });
        }
      } catch (error) {
        console.warn(`Could not initialize bucket ${bucketName}:`, error);
      }
    }
  }

  private static getAllowedMimeTypes(bucketName: string): string[] {
    switch (bucketName) {
      case this.BUCKETS.AVATARS:
      case this.BUCKETS.IMAGES:
        return ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      case this.BUCKETS.AUDIO:
        return ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/webm'];
      case this.BUCKETS.DOCUMENTS:
        return ['application/pdf', 'text/plain', 'application/json'];
      default:
        return [];
    }
  }

  private static getFileSizeLimit(bucketName: string): number {
    switch (bucketName) {
      case this.BUCKETS.AVATARS:
        return 2 * 1024 * 1024; // 2MB
      case this.BUCKETS.IMAGES:
        return 10 * 1024 * 1024; // 10MB
      case this.BUCKETS.AUDIO:
        return 100 * 1024 * 1024; // 100MB
      case this.BUCKETS.DOCUMENTS:
        return 50 * 1024 * 1024; // 50MB
      default:
        return 10 * 1024 * 1024; // 10MB default
    }
  }
}

// Export default for easy importing
export default SupabaseService;