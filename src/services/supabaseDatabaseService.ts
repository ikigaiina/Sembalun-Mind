import { supabase, handleSupabaseError } from '../config/supabaseClient';
import type {
  User,
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
  UserCourseProgressUpdate,
  Bookmark,
  BookmarkInsert,
  UserSetting,
  UserSettingInsert,
  UserSettingUpdate,
  Mood,
  MoodInsert,
  MoodUpdate,
  UserProgress
} from '../types/supabase';

/**
 * Supabase Database Service
 * Handles all database operations with proper error handling and type safety
 */
export class SupabaseDatabaseService {
  // ========== USER OPERATIONS ==========

  /**
   * Get user profile by ID
   */
  static async getUserProfile(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        handleSupabaseError(error);
      }

      return data;
    } catch (error) {
      handleSupabaseError(error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId: string, updates: UserUpdate): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error);
      }

      return data;
    } catch (error) {
      handleSupabaseError(error);
      return null;
    }
  }

  /**
   * Update user progress
   */
  static async updateUserProgress(userId: string, progress: Partial<UserProgress>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ progress })
        .eq('id', userId);

      if (error) {
        handleSupabaseError(error);
      }

      return true;
    } catch (error) {
      handleSupabaseError(error);
      return false;
    }
  }

  // ========== MEDITATION SESSIONS ==========

  /**
   * Create new meditation session
   */
  static async createMeditationSession(session: MeditationSessionInsert): Promise<MeditationSession | null> {
    try {
      const { data, error } = await supabase
        .from('meditation_sessions')
        .insert(session)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error);
      }

      return data;
    } catch (error) {
      handleSupabaseError(error);
      return null;
    }
  }

  /**
   * Get user's meditation sessions
   */
  static async getUserMeditationSessions(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<MeditationSession[]> {
    try {
      const { data, error } = await supabase
        .from('meditation_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        handleSupabaseError(error);
      }

      return data || [];
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  }

  /**
   * Update meditation session
   */
  static async updateMeditationSession(
    sessionId: string,
    updates: MeditationSessionUpdate
  ): Promise<MeditationSession | null> {
    try {
      const { data, error } = await supabase
        .from('meditation_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error);
      }

      return data;
    } catch (error) {
      handleSupabaseError(error);
      return null;
    }
  }

  /**
   * Get meditation statistics for user
   */
  static async getMeditationStats(userId: string): Promise<{
    totalSessions: number;
    totalMinutes: number;
    averageSession: number;
    thisWeekSessions: number;
  }> {
    try {
      // Get total stats
      const { data: totalData, error: totalError } = await supabase
        .from('meditation_sessions')
        .select('duration_minutes')
        .eq('user_id', userId);

      if (totalError) {
        handleSupabaseError(totalError);
      }

      // Get this week's sessions
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const { data: weekData, error: weekError } = await supabase
        .from('meditation_sessions')
        .select('id')
        .eq('user_id', userId)
        .gte('completed_at', weekStart.toISOString());

      if (weekError) {
        handleSupabaseError(weekError);
      }

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

  // ========== COURSES ==========

  /**
   * Get all courses
   */
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

      if (error) {
        handleSupabaseError(error);
      }

      return data || [];
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  }

  /**
   * Get course by ID
   */
  static async getCourse(courseId: string): Promise<Course | null> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) {
        handleSupabaseError(error);
      }

      return data;
    } catch (error) {
      handleSupabaseError(error);
      return null;
    }
  }

  /**
   * Create new user profile (called by auth trigger)
   */
  static async createUserProfile(userId: string, email: string, displayName?: string, avatarUrl?: string): Promise<User | null> {
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

      if (error) {
        handleSupabaseError(error);
      }

      return data;
    } catch (error) {
      handleSupabaseError(error);
      return null;
    }
  }

  // ========== JOURNAL ENTRIES ==========

  /**
   * Create new journal entry
   */
  static async createJournalEntry(entry: JournalEntryInsert): Promise<JournalEntry | null> {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert(entry)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error);
      }

      return data;
    } catch (error) {
      handleSupabaseError(error);
      return null;
    }
  }

  /**
   * Get user's journal entries
   */
  static async getUserJournalEntries(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<JournalEntry[]> {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        handleSupabaseError(error);
      }

      return data || [];
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  }

  /**
   * Update journal entry
   */
  static async updateJournalEntry(
    entryId: string,
    updates: JournalEntryUpdate
  ): Promise<JournalEntry | null> {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .update(updates)
        .eq('id', entryId)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error);
      }

      return data;
    } catch (error) {
      handleSupabaseError(error);
      return null;
    }
  }

  /**
   * Delete journal entry
   */
  static async deleteJournalEntry(entryId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId);

      if (error) {
        handleSupabaseError(error);
      }

      return true;
    } catch (error) {
      handleSupabaseError(error);
      return false;
    }
  }

  // ========== ACHIEVEMENTS ==========

  /**
   * Create new achievement
   */
  static async createAchievement(achievement: AchievementInsert): Promise<Achievement | null> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .insert(achievement)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error);
      }

      return data;
    } catch (error) {
      handleSupabaseError(error);
      return null;
    }
  }

  /**
   * Get user's achievements
   */
  static async getUserAchievements(userId: string): Promise<Achievement[]> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });

      if (error) {
        handleSupabaseError(error);
      }

      return data || [];
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  }

  // ========== BOOKMARKS ==========

  /**
   * Create bookmark
   */
  static async createBookmark(bookmark: BookmarkInsert): Promise<Bookmark | null> {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .insert(bookmark)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error);
      }

      return data;
    } catch (error) {
      handleSupabaseError(error);
      return null;
    }
  }

  /**
   * Get user's bookmarks
   */
  static async getUserBookmarks(userId: string): Promise<Bookmark[]> {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        handleSupabaseError(error);
      }

      return data || [];
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  }

  /**
   * Delete bookmark
   */
  static async deleteBookmark(bookmarkId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', bookmarkId);

      if (error) {
        handleSupabaseError(error);
      }

      return true;
    } catch (error) {
      handleSupabaseError(error);
      return false;
    }
  }

  // ========== MOODS ==========

  /**
   * Create mood entry
   */
  static async createMood(mood: MoodInsert): Promise<Mood | null> {
    try {
      const { data, error } = await supabase
        .from('moods')
        .insert(mood)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error);
      }

      return data;
    } catch (error) {
      handleSupabaseError(error);
      return null;
    }
  }

  /**
   * Get user's mood history
   */
  static async getUserMoods(
    userId: string,
    limit: number = 30,
    offset: number = 0
  ): Promise<Mood[]> {
    try {
      const { data, error } = await supabase
        .from('moods')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        handleSupabaseError(error);
      }

      return data || [];
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  }

  // ========== USER COURSE PROGRESS ==========

  /**
   * Create or update course progress
   */
  static async upsertCourseProgress(progress: UserCourseProgressInsert): Promise<UserCourseProgress | null> {
    try {
      const { data, error } = await supabase
        .from('user_course_progress')
        .upsert(progress)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error);
      }

      return data;
    } catch (error) {
      handleSupabaseError(error);
      return null;
    }
  }

  /**
   * Get user's course progress
   */
  static async getUserCourseProgress(userId: string): Promise<UserCourseProgress[]> {
    try {
      const { data, error } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', userId)
        .order('last_accessed_at', { ascending: false });

      if (error) {
        handleSupabaseError(error);
      }

      return data || [];
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  }
}

export default SupabaseDatabaseService;