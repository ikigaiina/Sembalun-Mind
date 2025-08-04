import { 
  collection, 
  query, 
  where, 
  getDocs,
  writeBatch,
  doc,
  deleteDoc,
  type Query,
  type DocumentData
} from 'firebase/firestore';
import { db } from '../config/firebase';

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
      const achievementsQuery = query(collection(db, 'user_achievements'));
      const achievementsSnapshot = await getDocs(achievementsQuery);
      
      const userIds = new Set<string>();
      achievementsSnapshot.docs.forEach(doc => {
        const userId = doc.data().userId;
        if (userId) userIds.add(userId);
      });

      // Also get user IDs from sessions if no achievements exist yet
      const sessionsQuery = query(collection(db, 'meditation_sessions'));
      const sessionsSnapshot = await getDocs(sessionsQuery);
      
      sessionsSnapshot.docs.forEach(doc => {
        const userId = doc.data().userId;
        if (userId) userIds.add(userId);
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
        let q: Query<DocumentData, DocumentData> = collection(db, collectionName);
        
        if (userId) {
          q = query(collection(db, collectionName), where('userId', '==', userId));
        }

        const snapshot = await getDocs(q);
        const docs = snapshot.docs.slice(0, 3); // Show max 3 sample documents
        
        preview.collections[collectionName] = {
          count: snapshot.size,
          sampleData: docs.map(doc => ({
            id: doc.id,
            data: this.sanitizeDataForPreview(doc.data())
          }))
        };

        preview.totalDocuments += snapshot.size;
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
      const q = query(
        collection(db, collectionName),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return 0;
      }

      // Batch delete untuk performa yang lebih baik
      const batch = writeBatch(db);
      let batchCount = 0;
      let totalDeleted = 0;

      for (const document of snapshot.docs) {
        batch.delete(document.ref);
        batchCount++;
        totalDeleted++;

        // Firebase batch memiliki limit 500 operasi
        if (batchCount === 500) {
          await batch.commit();
          batchCount = 0;
        }
      }

      // Commit batch terakhir jika ada
      if (batchCount > 0) {
        await batch.commit();
      }

      console.log(`Deleted ${totalDeleted} documents from ${collectionName} for user ${userId}`);
      return totalDeleted;

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
        const q = query(
          collection(db, collectionName),
          where('userId', '==', userId)
        );

        const snapshot = await getDocs(q);
        backupData.collections[collectionName] = snapshot.docs.map(doc => ({
          id: doc.id,
          data: doc.data()
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