import { typedSupabase as supabase } from '../config/supabase';
import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';

export interface ResetOptions {
  resetAchievements?: boolean;
  resetProgress?: boolean;
  resetStreaks?: boolean;
  resetMoodEntries?: boolean;
  resetCairnProgress?: boolean;
  resetCourseProgress?: boolean;
  confirmReset?: boolean;
}

export class AchievementResetService {
  private static instance: AchievementResetService;

  static getInstance(): AchievementResetService {
    if (!AchievementResetService.instance) {
      AchievementResetService.instance = new AchievementResetService();
    }
    return AchievementResetService.instance;
  }

  /**
   * Reset pencapaian untuk pengguna tertentu
   */
  async resetUserAchievements(userId: string, options: ResetOptions = {}): Promise<{
    success: boolean;
    message: string;
    deletedCounts: {
      achievements: number;
      sessions: number;
      streaks: number;
      moodEntries: number;
      cairnProgress: number;
      courseProgress: number;
    };
  }> {
    const {
      resetAchievements = true,
      resetProgress = true,
      resetStreaks = true,
      resetMoodEntries = true,
      resetCairnProgress = true,
      resetCourseProgress = true,
      confirmReset = false
    } = options;

    if (!confirmReset) {
      return {
        success: false,
        message: 'Reset dibatalkan - confirmReset harus true untuk melanjutkan',
        deletedCounts: {
          achievements: 0,
          sessions: 0,
          streaks: 0,
          moodEntries: 0,
          cairnProgress: 0,
          courseProgress: 0
        }
      };
    }

    try {
      const deletedCounts = {
        achievements: 0,
        sessions: 0,
        streaks: 0,
        moodEntries: 0,
        cairnProgress: 0,
        courseProgress: 0
      };

      // Reset achievements
      if (resetAchievements) {
        deletedCounts.achievements = await this.deleteCollection('user_achievements', userId);
      }

      // Reset meditation sessions
      if (resetProgress) {
        deletedCounts.sessions = await this.deleteCollection('meditation_sessions', userId);
      }

      // Reset streaks
      if (resetStreaks) {
        deletedCounts.streaks = await this.deleteCollection('user_streaks', userId);
      }

      // Reset mood entries
      if (resetMoodEntries) {
        deletedCounts.moodEntries = await this.deleteCollection('mood_entries', userId);
      }

      // Reset cairn progress
      if (resetCairnProgress) {
        deletedCounts.cairnProgress = await this.deleteCollection('cairn_progress', userId);
      }

      // Reset course progress
      if (resetCourseProgress) {
        deletedCounts.courseProgress = await this.deleteCollection('course_progress', userId);
      }

      const totalDeleted = Object.values(deletedCounts).reduce((sum, count) => sum + count, 0);

      return {
        success: true,
        message: `Berhasil mereset data pengguna. Total ${totalDeleted} dokumen dihapus.`,
        deletedCounts
      };

    } catch (error) {
      console.error('Error resetting user achievements:', error);
      return {
        success: false,
        message: `Gagal mereset pencapaian: ${error instanceof Error ? error.message : 'Unknown error'}`,
        deletedCounts: {
          achievements: 0,
          sessions: 0,
          streaks: 0,
          moodEntries: 0,
          cairnProgress: 0,
          courseProgress: 0
        }
      };
    }
  }

  /**
   * Reset pencapaian untuk semua pengguna (Admin only)
   */
  async resetAllUsersAchievements(options: ResetOptions = {}): Promise<{
    success: boolean;
    message: string;
    totalUsersAffected: number;
    totalDeleted: number;
  }> {
    const { confirmReset = false } = options;

    if (!confirmReset) {
      return {
        success: false,  
        message: 'Reset dibatalkan - confirmReset harus true untuk melanjutkan',
        totalUsersAffected: 0,
        totalDeleted: 0
      };
    }

    try {
      // Get all unique user IDs from achievements
      const { data: achievements, error: achievementsError } = await supabase
        .from('user_achievements')
        .select('user_id');
      if (achievementsError) throw achievementsError;

      const userIds = new Set<string>();
      achievements.forEach(row => {
        if (row.user_id) userIds.add(row.user_id);
      });

      const { data: sessions, error: sessionsError } = await supabase
        .from('meditation_sessions')
        .select('user_id');
      if (sessionsError) throw sessionsError;
      
      sessions.forEach(row => {
        if (row.user_id) userIds.add(row.user_id);
      });

      let totalDeleted = 0;
      const userResults: Array<{userId: string, deleted: number}> = [];

      // Reset for each user
      for (const userId of userIds) {
        const result = await this.resetUserAchievements(userId, { ...options, confirmReset: true });
        if (result.success) {
          const userDeleted = Object.values(result.deletedCounts).reduce((sum, count) => sum + count, 0);
          totalDeleted += userDeleted;
          userResults.push({ userId, deleted: userDeleted });
        }
      }

      return {
        success: true,
        message: `Berhasil mereset pencapaian untuk ${userIds.size} pengguna. Total ${totalDeleted} dokumen dihapus.`,
        totalUsersAffected: userIds.size,
        totalDeleted
      };

    } catch (error) {
      console.error('Error resetting all users achievements:', error);
      return {
        success: false,
        message: `Gagal mereset semua pencapaian: ${error instanceof Error ? error.message : 'Unknown error'}`,
        totalUsersAffected: 0,
        totalDeleted: 0
      };
    }
  }

  /**
   * Preview apa yang akan dihapus tanpa benar-benar menghapus
   */
  async previewReset(userId?: string): Promise<{
    collections: {
      [collectionName: string]: {
        count: number;
        sampleData: Array<{id: string, data: any}>;
      };
    };
    totalDocuments: number;
  }> {
    try {
      const collections = [
        'user_achievements',
        'meditation_sessions', 
        'user_streaks',
        'mood_entries',
        'cairn_progress',
        'course_progress'
      ];

      const preview: any = { collections: {}, totalDocuments: 0 };

      for (const collectionName of collections) {
        let queryBuilder = supabase.from(collectionName).select('*', { count: 'exact' });
        
        if (userId) {
          queryBuilder = queryBuilder.eq('user_id', userId);
        }

        const { data, count, error } = await queryBuilder.limit(3);
        if (error) throw error;
        
        preview.collections[collectionName] = {
          count: count || 0,
          sampleData: data ? data.map(row => ({
            id: row.id, // Assuming 'id' column exists
            data: this.sanitizeDataForPreview(row)
          })) : []
        };

        preview.totalDocuments += (count || 0);
      }

      return preview;

    } catch (error) {
      console.error('Error previewing reset:', error);
      return {
        collections: {},
        totalDocuments: 0
      };
    }
  }

  /**
   * Helper untuk menghapus koleksi berdasarkan userId
   */
  private async deleteCollection(collectionName: string, userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from(collectionName)
        .delete({ count: 'exact' })
        .eq('user_id', userId); // Assuming 'user_id' is the column name in Supabase

      if (error) {
        throw error;
      }

      console.log(`Deleted ${count} documents from ${collectionName} for user ${userId}`);
      return count || 0;

    } catch (error) {
      console.error(`Error deleting from ${collectionName}:`, error);
      return 0;
    }
  }

  /**
   * Sanitize data untuk preview (menghilangkan data sensitif)
   */
  private sanitizeDataForPreview(data: any): any {
    const sanitized = { ...data };
    
    // Remove sensitive or large fields
    delete sanitized.userId; // Keep privacy
    delete sanitized.streakSnapshots; // Large array
    delete sanitized.rewards; // Large object
    
    // Convert timestamps for readability
    Object.keys(sanitized).forEach(key => {
      if (sanitized[key] && typeof sanitized[key].toDate === 'function') {
        sanitized[key] = sanitized[key].toDate().toISOString();
      }
    });

    return sanitized;
  }

  /**
   * Backup data sebelum reset (optional)
   */
  async backupUserData(userId: string): Promise<{
    success: boolean;
    backupData?: any;
    message: string;
  }> {
    try {
      const collections = [
        'user_achievements',
        'meditation_sessions',
        'user_streaks', 
        'mood_entries',
        'cairn_progress',
        'course_progress'
      ];

      const backupData: any = {
        userId,
        timestamp: new Date().toISOString(),
        collections: {}
      };

      for (const collectionName of collections) {
        const { data, error } = await supabase
          .from(collectionName)
          .select('*')
          .eq('user_id', userId);
        
        if (error) throw error;

        backupData.collections[collectionName] = data.map(row => ({
          id: row.id, // Assuming 'id' column exists
          data: row
        }));
      }

      // Save backup to localStorage (for simple backup)
      const backupKey = `sembalun_backup_${userId}_${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify(backupData));

      return {
        success: true,
        backupData,
        message: `Backup berhasil disimpan dengan key: ${backupKey}`
      };

    } catch (error) {
      console.error('Error backing up user data:', error);
      return {
        success: false,
        message: `Gagal backup data: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

export const achievementResetService = AchievementResetService.getInstance();