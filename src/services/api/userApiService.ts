import { supabase } from '../../config/supabaseClient';
import type { User } from '@supabase/supabase-js';

export interface UserProfile {
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

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  meditation: MeditationSettings;
  accessibility: AccessibilitySettings;
  display: DisplaySettings;
}

export interface NotificationSettings {
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
  profileVisibility: 'public' | 'private';
  shareProgress: boolean;
  locationTracking: boolean;
}

export interface MeditationSettings {
  defaultDuration: number;
  preferredVoice: string;
  backgroundSounds: boolean;
  guidanceLevel: 'minimal' | 'moderate' | 'detailed';
  musicVolume: number;
  voiceVolume: number;
  autoAdvance: boolean;
  showTimer: boolean;
  preparationTime: number;
  endingBell: boolean;
}

export interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
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
  last_session_date?: string;
  favorite_categories: string[];
  completed_programs: string[];
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  guestUsers: number;
  averageSessionTime: number;
  topCategories: { category: string; count: number }[];
}

export interface UserActivitySummary {
  userId: string;
  lastActive: string;
  sessionsThisWeek: number;
  minutesThisWeek: number;
  currentStreak: number;
  achievements: number;
  level: number;
  nextLevelProgress: number;
}

export class UserApiService {
  private static instance: UserApiService;

  static getInstance(): UserApiService {
    if (!UserApiService.instance) {
      UserApiService.instance = new UserApiService();
    }
    return UserApiService.instance;
  }

  // Authentication & Profile Management
  async getCurrentUser(): Promise<{ user: User | null; error: any }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      return { user, error };
    } catch (error) {
      console.error('Error getting current user:', error);
      return { user: null, error };
    }
  }

  async getUserProfile(userId: string): Promise<{ profile: UserProfile | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      return { profile: data, error };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return { profile: null, error };
    }
  }

  async createUserProfile(profile: Partial<UserProfile>): Promise<{ profile: UserProfile | null; error: any }> {
    try {
      const defaultPreferences = this.getDefaultPreferences();
      const defaultProgress = this.getDefaultProgress();

      const fullProfile = {
        ...profile,
        preferences: { ...defaultPreferences, ...profile.preferences },
        progress: { ...defaultProgress, ...profile.progress },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_guest: profile.is_guest || false
      };

      const { data, error } = await supabase
        .from('users')
        .insert([fullProfile])
        .select()
        .single();

      if (error) throw error;

      return { profile: data, error: null };
    } catch (error) {
      console.error('Error creating user profile:', error);
      return { profile: null, error };
    }
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<{ profile: UserProfile | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return { profile: data, error: null };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { profile: null, error };
    }
  }

  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<{ success: boolean; error: any }> {
    try {
      // Get current profile to merge preferences
      const { profile, error: fetchError } = await this.getUserProfile(userId);
      if (fetchError || !profile) {
        throw new Error('Could not fetch current profile');
      }

      const mergedPreferences = {
        ...profile.preferences,
        ...preferences,
        // Deep merge nested objects
        notifications: { ...profile.preferences.notifications, ...preferences.notifications },
        privacy: { ...profile.preferences.privacy, ...preferences.privacy },
        meditation: { ...profile.preferences.meditation, ...preferences.meditation },
        accessibility: { ...profile.preferences.accessibility, ...preferences.accessibility },
        display: { ...profile.preferences.display, ...preferences.display }
      };

      const { error } = await supabase
        .from('users')
        .update({
          preferences: mergedPreferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return { success: false, error };
    }
  }

  async deleteUserAccount(userId: string): Promise<{ success: boolean; error: any }> {
    try {
      // Delete all user data using the stored procedure
      const { error } = await supabase.rpc('delete_user_account');
      
      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting user account:', error);
      return { success: false, error };
    }
  }

  // User Analytics & Statistics
  async getUserStats(): Promise<{ stats: UserStats | null; error: any }> {
    try {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('is_guest, created_at');

      if (usersError) throw usersError;

      const { data: sessions, error: sessionsError } = await supabase
        .from('meditation_sessions')
        .select('duration_minutes, type');

      if (sessionsError) throw sessionsError;

      const totalUsers = users?.length || 0;
      const guestUsers = users?.filter(u => u.is_guest).length || 0;
      const activeUsers = totalUsers - guestUsers;

      const averageSessionTime = sessions?.length > 0 
        ? sessions.reduce((sum, s) => sum + s.duration_minutes, 0) / sessions.length 
        : 0;

      const categoryCount: { [key: string]: number } = {};
      sessions?.forEach(session => {
        categoryCount[session.type] = (categoryCount[session.type] || 0) + 1;
      });

      const topCategories = Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const stats: UserStats = {
        totalUsers,
        activeUsers,
        guestUsers,
        averageSessionTime: Math.round(averageSessionTime * 10) / 10,
        topCategories
      };

      return { stats, error: null };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return { stats: null, error };
    }
  }

  async getUserActivitySummary(userId: string): Promise<{ summary: UserActivitySummary | null; error: any }> {
    try {
      const { profile, error: profileError } = await this.getUserProfile(userId);
      if (profileError || !profile) {
        throw new Error('Could not fetch user profile');
      }

      // Get sessions from this week
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const { data: sessions, error: sessionsError } = await supabase
        .from('meditation_sessions')
        .select('duration_minutes, completed_at')
        .eq('user_id', userId)
        .gte('completed_at', weekStart.toISOString());

      if (sessionsError) throw sessionsError;

      const sessionsThisWeek = sessions?.length || 0;
      const minutesThisWeek = sessions?.reduce((sum, s) => sum + s.duration_minutes, 0) || 0;

      // Calculate user level based on total sessions
      const totalSessions = profile.progress.total_sessions;
      const level = Math.floor(totalSessions / 10) + 1; // Level up every 10 sessions
      const nextLevelProgress = ((totalSessions % 10) / 10) * 100;

      const summary: UserActivitySummary = {
        userId,
        lastActive: profile.progress.last_session_date || profile.updated_at,
        sessionsThisWeek,
        minutesThisWeek,
        currentStreak: profile.progress.current_streak,
        achievements: profile.progress.achievements.length,
        level,
        nextLevelProgress
      };

      return { summary, error: null };
    } catch (error) {
      console.error('Error getting user activity summary:', error);
      return { summary: null, error };
    }
  }

  // Guest User Management
  createGuestProfile(): UserProfile {
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: guestId,
      email: '',
      display_name: 'Tamu',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_guest: true,
      preferences: this.getDefaultPreferences(),
      progress: this.getDefaultProgress()
    };
  }

  saveGuestData(profile: UserProfile): void {
    try {
      localStorage.setItem('sembalun_guest_profile', JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving guest data:', error);
    }
  }

  getGuestData(): UserProfile | null {
    try {
      const data = localStorage.getItem('sembalun_guest_profile');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error retrieving guest data:', error);
      return null;
    }
  }

  clearGuestData(): void {
    try {
      localStorage.removeItem('sembalun_guest_profile');
    } catch (error) {
      console.error('Error clearing guest data:', error);
    }
  }

  async migrateGuestData(guestProfile: UserProfile): Promise<{ success: boolean; error: any }> {
    try {
      const { user, error: userError } = await this.getCurrentUser();
      if (userError || !user) {
        throw new Error('No authenticated user to migrate to');
      }

      const { profile: currentProfile } = await this.getUserProfile(user.id);
      
      if (currentProfile) {
        // Merge guest data with existing profile
        const mergedProgress: UserProgress = {
          total_sessions: (currentProfile.progress?.total_sessions || 0) + (guestProfile.progress?.total_sessions || 0),
          total_minutes: (currentProfile.progress?.total_minutes || 0) + (guestProfile.progress?.total_minutes || 0),
          current_streak: Math.max(currentProfile.progress?.current_streak || 0, guestProfile.progress?.current_streak || 0),
          longest_streak: Math.max(currentProfile.progress?.longest_streak || 0, guestProfile.progress?.longest_streak || 0),
          achievements: [...new Set([
            ...(currentProfile.progress?.achievements || []),
            ...(guestProfile.progress?.achievements || [])
          ])],
          last_session_date: guestProfile.progress?.last_session_date || currentProfile.progress?.last_session_date,
          favorite_categories: [...new Set([
            ...(currentProfile.progress?.favorite_categories || []),
            ...(guestProfile.progress?.favorite_categories || [])
          ])],
          completed_programs: [...new Set([
            ...(currentProfile.progress?.completed_programs || []),
            ...(guestProfile.progress?.completed_programs || [])
          ])]
        };

        await this.updateUserProfile(user.id, {
          progress: mergedProgress,
          preferences: { ...currentProfile.preferences, ...guestProfile.preferences }
        });
      } else {
        // Create new profile with guest data
        await this.createUserProfile({
          id: user.id,
          email: user.email || '',
          display_name: user.user_metadata?.display_name || guestProfile.display_name,
          avatar_url: user.user_metadata?.avatar_url,
          preferences: guestProfile.preferences,
          progress: guestProfile.progress,
          is_guest: false
        });
      }

      // Clear guest data after successful migration
      this.clearGuestData();
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error migrating guest data:', error);
      return { success: false, error };
    }
  }

  // Data Export & Privacy
  async exportUserData(userId: string): Promise<{ data: any; error: any }> {
    try {
      const { profile, error: profileError } = await this.getUserProfile(userId);
      if (profileError || !profile) {
        throw new Error('Could not fetch user profile');
      }

      // Get all user-related data
      const [sessions, achievements, moods, courses] = await Promise.all([
        supabase.from('meditation_sessions').select('*').eq('user_id', userId),
        supabase.from('achievements').select('*').eq('user_id', userId),
        supabase.from('moods').select('*').eq('user_id', userId),
        supabase.from('user_course_progress').select('*').eq('user_id', userId)
      ]);

      const exportData = {
        profile,
        sessions: sessions.data || [],
        achievements: achievements.data || [],
        moods: moods.data || [],
        courses: courses.data || [],
        exportInfo: {
          exportedAt: new Date().toISOString(),
          version: '1.0.0',
          format: 'JSON'
        }
      };

      return { data: exportData, error: null };
    } catch (error) {
      console.error('Error exporting user data:', error);
      return { data: null, error };
    }
  }

  // Helper methods
  private getDefaultPreferences(): UserPreferences {
    return {
      theme: 'auto',
      language: 'id',
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
        profileVisibility: 'private',
        shareProgress: false,
        locationTracking: false,
      },
      meditation: {
        defaultDuration: 10,
        preferredVoice: 'default',
        backgroundSounds: true,
        guidanceLevel: 'moderate',
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
        fontSize: 'medium',
        screenReader: false,
        keyboardNavigation: false,
      },
      display: {
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        weekStartsOn: 'monday',
        showStreaks: true,
        showStatistics: true,
      },
    };
  }

  private getDefaultProgress(): UserProgress {
    return {
      total_sessions: 0,
      total_minutes: 0,
      current_streak: 0,
      longest_streak: 0,
      achievements: [],
      favorite_categories: [],
      completed_programs: [],
    };
  }

  // Real-time subscriptions
  subscribeToUserChanges(userId: string, callback: (profile: UserProfile | null) => void): () => void {
    const subscription = supabase
      .channel('user_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as UserProfile || null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }
}

export const userApiService = UserApiService.getInstance();