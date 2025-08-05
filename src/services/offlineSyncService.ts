import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { offlineStorageService } from './offlineStorageService';
import type { 
  OfflineProgress, 
  OfflineMoodEntry, 
  OfflineJournalEntry, 
  SyncStatus 
} from './offlineStorageService';

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

export interface ConflictResolution {
  type: 'local_wins' | 'remote_wins' | 'merge' | 'manual';
  strategy: 'latest_timestamp' | 'highest_version' | 'user_choice';
}

export interface SyncConflict {
  id: string;
  type: 'progress' | 'mood' | 'journal';
  localData: any;
  remoteData: any;
  conflictField: string[];
  suggestedResolution: ConflictResolution;
}

export interface BackgroundSyncConfig {
  enabled: boolean;
  syncInterval: number; // minutes
  wifiOnly: boolean;
  maxRetries: number;
  exponentialBackoff: boolean;
  syncOnAppStart: boolean;
  syncOnAppBackground: boolean;
  batchSize: number;
  priority: {
    sessions: number;
    moods: number;
    journals: number;
  };
}

export interface DataDelta {
  added: string[];
  modified: string[];
  deleted: string[];
  lastSyncTimestamp: Date;
}

export class OfflineSyncService {
  private static instance: OfflineSyncService;
  private syncInProgress = false;
  private syncQueue: Map<string, any> = new Map();
  private conflictQueue: SyncConflict[] = [];
  private retryQueue: Map<string, { data: any; retryCount: number; nextRetry: Date }> = new Map();

  static getInstance(): OfflineSyncService {
    if (!OfflineSyncService.instance) {
      OfflineSyncService.instance = new OfflineSyncService();
    }
    return OfflineSyncService.instance;
  }

  async syncAllData(userId: string, options: {
    force?: boolean;
    conflictResolution?: ConflictResolution;
    onProgress?: (progress: { stage: string; percentage: number }) => void;
  } = {}): Promise<SyncResult> {
    if (this.syncInProgress && !options.force) {
      throw new Error('Sync already in progress');
    }

    this.syncInProgress = true;
    const startTime = Date.now();
    
    try {
      const result: SyncResult = {
        success: true,
        synced: { sessions: 0, moods: 0, journals: 0 },
        failed: { sessions: [], moods: [], journals: [] },
        errors: [],
        dataUsage: 0,
        duration: 0
      };

      // Check connectivity
      if (!navigator.onLine) {
        throw new Error('No internet connection available');
      }

      // Get sync preferences
      const config = await this.getBackgroundSyncConfig(userId);
      
      // Stage 1: Sync progress/sessions (40% of progress)
      if (options.onProgress) options.onProgress({ stage: 'Syncing meditation sessions', percentage: 10 });
      
      const sessionResult = await this.syncProgressData(userId, options.conflictResolution);
      result.synced.sessions = sessionResult.synced;
      result.failed.sessions = sessionResult.failed;
      result.errors.push(...sessionResult.errors);
      result.dataUsage += sessionResult.dataUsage;

      if (options.onProgress) options.onProgress({ stage: 'Syncing meditation sessions', percentage: 40 });

      // Stage 2: Sync mood entries (30% of progress)
      if (options.onProgress) options.onProgress({ stage: 'Syncing mood entries', percentage: 50 });
      
      const moodResult = await this.syncMoodData(userId, options.conflictResolution);
      result.synced.moods = moodResult.synced;
      result.failed.moods = moodResult.failed;
      result.errors.push(...moodResult.errors);
      result.dataUsage += moodResult.dataUsage;

      if (options.onProgress) options.onProgress({ stage: 'Syncing mood entries', percentage: 70 });

      // Stage 3: Sync journal entries (30% of progress)
      if (options.onProgress) options.onProgress({ stage: 'Syncing journal entries', percentage: 80 });
      
      const journalResult = await this.syncJournalData(userId, options.conflictResolution);
      result.synced.journals = journalResult.synced;
      result.failed.journals = journalResult.failed;
      result.errors.push(...journalResult.errors);
      result.dataUsage += journalResult.dataUsage;

      if (options.onProgress) options.onProgress({ stage: 'Completing sync', percentage: 90 });

      // Update sync status
      const syncStatus: SyncStatus = {
        userId,
        lastSyncAt: new Date(),
        pendingSessions: result.failed.sessions.length,
        pendingMoods: result.failed.moods.length,
        pendingJournals: result.failed.journals.length,
        failedSync: result.failed,
        dataUsage: {
          downloaded: 0, // Would track downloads
          uploaded: result.dataUsage,
          lastReset: new Date()
        },
        syncPreferences: {
          wifiOnly: config.wifiOnly,
          backgroundSync: config.enabled,
          autoDownload: false,
          maxCacheSize: 500,
          syncInterval: config.syncInterval
        }
      };

      await offlineStorageService.updateSyncStatus(syncStatus);

      result.duration = Date.now() - startTime;
      result.success = result.errors.length === 0;

      if (options.onProgress) options.onProgress({ stage: 'Sync complete', percentage: 100 });

      return result;

    } catch (error) {
      console.error('Error during sync:', error);
      
      return {
        success: false,
        synced: { sessions: 0, moods: 0, journals: 0 },
        failed: { sessions: [], moods: [], journals: [] },
        errors: [error instanceof Error ? error.message : 'Unknown sync error'],
        dataUsage: 0,
        duration: Date.now() - startTime
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncProgressData(
    userId: string, 
    conflictResolution?: ConflictResolution
  ): Promise<{ synced: number; failed: string[]; errors: string[]; dataUsage: number }> {
    try {
      const pendingProgress = await offlineStorageService.getPendingProgress(userId);
      const synced: string[] = [];
      const failed: string[] = [];
      const errors: string[] = [];
      let dataUsage = 0;

      // Upload pending local data
      for (const progress of pendingProgress) {
        try {
          // Check for conflicts
          const conflict = await this.checkForConflicts('progress', progress);
          
          if (conflict && conflictResolution) {
            const resolved = await this.resolveConflict(conflict, conflictResolution);
            if (resolved) {
              await this.uploadProgress(resolved);
              await this.markAsSynced('progress', progress.id);
              synced.push(progress.id);
              dataUsage += this.estimateDataSize(progress);
            } else {
              failed.push(progress.id);
              this.conflictQueue.push(conflict);
            }
          } else if (!conflict) {
            await this.uploadProgress(progress);
            await this.markAsSynced('progress', progress.id);
            synced.push(progress.id);
            dataUsage += this.estimateDataSize(progress);
          } else {
            failed.push(progress.id);
            this.conflictQueue.push(conflict);
          }
        } catch (error) {
          console.error(`Error syncing progress ${progress.id}:`, error);
          failed.push(progress.id);
          errors.push(`Progress ${progress.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Download remote changes
      await this.downloadRemoteProgress(userId);

      return {
        synced: synced.length,
        failed,
        errors,
        dataUsage
      };
    } catch (error) {
      console.error('Error syncing progress data:', error);
      return {
        synced: 0,
        failed: [],
        errors: [error instanceof Error ? error.message : 'Progress sync failed'],
        dataUsage: 0
      };
    }
  }

  private async syncMoodData(
    userId: string, 
    conflictResolution?: ConflictResolution
  ): Promise<{ synced: number; failed: string[]; errors: string[]; dataUsage: number }> {
    try {
      const pendingMoods = await offlineStorageService.getPendingMoods(userId);
      const synced: string[] = [];
      const failed: string[] = [];
      const errors: string[] = [];
      let dataUsage = 0;

      for (const mood of pendingMoods) {
        try {
          const conflict = await this.checkForConflicts('mood', mood);
          
          if (conflict && conflictResolution) {
            const resolved = await this.resolveConflict(conflict, conflictResolution);
            if (resolved) {
              await this.uploadMood(resolved);
              await this.markAsSynced('mood', mood.id);
              synced.push(mood.id);
              dataUsage += this.estimateDataSize(mood);
            } else {
              failed.push(mood.id);
              this.conflictQueue.push(conflict);
            }
          } else if (!conflict) {
            await this.uploadMood(mood);
            await this.markAsSynced('mood', mood.id);
            synced.push(mood.id);
            dataUsage += this.estimateDataSize(mood);
          } else {
            failed.push(mood.id);
            this.conflictQueue.push(conflict);
          }
        } catch (error) {
          console.error(`Error syncing mood ${mood.id}:`, error);
          failed.push(mood.id);
          errors.push(`Mood ${mood.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      await this.downloadRemoteMoods(userId);

      return {
        synced: synced.length,
        failed,
        errors,
        dataUsage
      };
    } catch (error) {
      console.error('Error syncing mood data:', error);
      return {
        synced: 0,
        failed: [],
        errors: [error instanceof Error ? error.message : 'Mood sync failed'],
        dataUsage: 0
      };
    }
  }

  private async syncJournalData(
    userId: string, 
    conflictResolution?: ConflictResolution
  ): Promise<{ synced: number; failed: string[]; errors: string[]; dataUsage: number }> {
    try {
      const pendingJournals = await offlineStorageService.getPendingJournals(userId);
      const synced: string[] = [];
      const failed: string[] = [];
      const errors: string[] = [];
      let dataUsage = 0;

      for (const journal of pendingJournals) {
        try {
          const conflict = await this.checkForConflicts('journal', journal);
          
          if (conflict && conflictResolution) {
            const resolved = await this.resolveConflict(conflict, conflictResolution);
            if (resolved) {
              await this.uploadJournal(resolved);
              await this.markAsSynced('journal', journal.id);
              synced.push(journal.id);
              dataUsage += this.estimateDataSize(journal);
            } else {
              failed.push(journal.id);
              this.conflictQueue.push(conflict);
            }
          } else if (!conflict) {
            await this.uploadJournal(journal);
            await this.markAsSynced('journal', journal.id);
            synced.push(journal.id);
            dataUsage += this.estimateDataSize(journal);
          } else {
            failed.push(journal.id);
            this.conflictQueue.push(conflict);
          }
        } catch (error) {
          console.error(`Error syncing journal ${journal.id}:`, error);
          failed.push(journal.id);
          errors.push(`Journal ${journal.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      await this.downloadRemoteJournals(userId);

      return {
        synced: synced.length,
        failed,
        errors,
        dataUsage
      };
    } catch (error) {
      console.error('Error syncing journal data:', error);
      return {
        synced: 0,
        failed: [],
        errors: [error instanceof Error ? error.message : 'Journal sync failed'],
        dataUsage: 0
      };
    }
  }

  private async uploadProgress(progress: OfflineProgress): Promise<void> {
    try {
      const firebaseData = {
        userId: progress.userId,
        sessionId: progress.sessionId,
        startTime: Timestamp.fromDate(progress.startTime),
        endTime: progress.endTime ? Timestamp.fromDate(progress.endTime) : null,
        duration: progress.duration,
        quality: progress.quality,
        moodBefore: progress.moodBefore,
        moodAfter: progress.moodAfter,
        stressLevel: progress.stressLevel,
        energyLevel: progress.energyLevel,
        techniques: progress.techniques,
        notes: progress.notes,
        completionPercentage: progress.completionPercentage,
        interruptions: progress.interruptions,
        environment: progress.environment,
        createdAt: Timestamp.fromDate(progress.createdAt),
        lastModified: Timestamp.fromDate(progress.lastModified),
        version: progress.version
      };

      await addDoc(collection(db, 'meditation_sessions'), firebaseData);
    } catch (error) {
      console.error('Error uploading progress:', error);
      throw error;
    }
  }

  private async uploadMood(mood: OfflineMoodEntry): Promise<void> {
    try {
      const firebaseData = {
        userId: mood.userId,
        date: Timestamp.fromDate(mood.date),
        overall: mood.overall,
        energy: mood.energy,
        anxiety: mood.anxiety,
        happiness: mood.happiness,
        stress: mood.stress,
        focus: mood.focus,
        tags: mood.tags,
        notes: mood.notes,
        relatedSessionId: mood.relatedSessionId,
        createdAt: Timestamp.fromDate(mood.createdAt),
        lastModified: Timestamp.fromDate(mood.lastModified),
        version: mood.version
      };

      await addDoc(collection(db, 'mood_entries'), firebaseData);
    } catch (error) {
      console.error('Error uploading mood:', error);
      throw error;
    }
  }

  private async uploadJournal(journal: OfflineJournalEntry): Promise<void> {
    try {
      const firebaseData = {
        userId: journal.userId,
        date: Timestamp.fromDate(journal.date),
        title: journal.title,
        content: journal.content,
        mood: journal.mood,
        gratitude: journal.gratitude,
        insights: journal.insights,
        challenges: journal.challenges,
        intentions: journal.intentions,
        tags: journal.tags,
        relatedSessionId: journal.relatedSessionId,
        createdAt: Timestamp.fromDate(journal.createdAt),
        lastModified: Timestamp.fromDate(journal.lastModified),
        version: journal.version
      };

      await addDoc(collection(db, 'journal_entries'), firebaseData);
    } catch (error) {
      console.error('Error uploading journal:', error);
      throw error;
    }
  }

  private async downloadRemoteProgress(userId: string): Promise<void> {
    try {
      const lastSync = await this.getLastSyncTimestamp(userId);
      
      const q = query(
        collection(db, 'meditation_sessions'),
        where('userId', '==', userId),
        where('lastModified', '>', Timestamp.fromDate(lastSync)),
        orderBy('lastModified', 'desc'),
        limit(100)
      );

      const snapshot = await getDocs(q);
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        
        const offlineProgress: OfflineProgress = {
          id: doc.id,
          userId: data.userId,
          sessionId: data.sessionId,
          startTime: data.startTime.toDate(),
          endTime: data.endTime?.toDate(),
          duration: data.duration,
          quality: data.quality,
          moodBefore: data.moodBefore,
          moodAfter: data.moodAfter,
          stressLevel: data.stressLevel,
          energyLevel: data.energyLevel,
          techniques: data.techniques,
          notes: data.notes,
          completionPercentage: data.completionPercentage,
          interruptions: data.interruptions,
          environment: data.environment,
          syncStatus: 'synced',
          createdAt: data.createdAt.toDate(),
          lastModified: data.lastModified.toDate(),
          version: data.version
        };

        await offlineStorageService.saveProgress(offlineProgress);
      }
    } catch (error) {
      console.error('Error downloading remote progress:', error);
    }
  }

  private async downloadRemoteMoods(userId: string): Promise<void> {
    try {
      const lastSync = await this.getLastSyncTimestamp(userId);
      
      const q = query(
        collection(db, 'mood_entries'),
        where('userId', '==', userId),
        where('lastModified', '>', Timestamp.fromDate(lastSync)),
        orderBy('lastModified', 'desc'),
        limit(100)
      );

      const snapshot = await getDocs(q);
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        
        const offlineMood: OfflineMoodEntry = {
          id: doc.id,
          userId: data.userId,
          date: data.date.toDate(),
          overall: data.overall,
          energy: data.energy,
          anxiety: data.anxiety,
          happiness: data.happiness,
          stress: data.stress,
          focus: data.focus,
          tags: data.tags,
          notes: data.notes,
          relatedSessionId: data.relatedSessionId,
          syncStatus: 'synced',
          createdAt: data.createdAt.toDate(),
          lastModified: data.lastModified.toDate(),
          version: data.version
        };

        await offlineStorageService.saveMoodEntry(offlineMood);
      }
    } catch (error) {
      console.error('Error downloading remote moods:', error);
    }
  }

  private async downloadRemoteJournals(userId: string): Promise<void> {
    try {
      const lastSync = await this.getLastSyncTimestamp(userId);
      
      const q = query(
        collection(db, 'journal_entries'),
        where('userId', '==', userId),
        where('lastModified', '>', Timestamp.fromDate(lastSync)),
        orderBy('lastModified', 'desc'),
        limit(100)
      );

      const snapshot = await getDocs(q);
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        
        const offlineJournal: OfflineJournalEntry = {
          id: doc.id,
          userId: data.userId,
          date: data.date.toDate(),
          title: data.title,
          content: data.content,
          mood: data.mood,
          gratitude: data.gratitude,
          insights: data.insights,
          challenges: data.challenges,
          intentions: data.intentions,
          tags: data.tags,
          relatedSessionId: data.relatedSessionId,
          syncStatus: 'synced',
          createdAt: data.createdAt.toDate(),
          lastModified: data.lastModified.toDate(),
          version: data.version
        };

        await offlineStorageService.saveJournalEntry(offlineJournal);
      }
    } catch (error) {
      console.error('Error downloading remote journals:', error);
    }
  }

  private async checkForConflicts(type: string, localData: any): Promise<SyncConflict | null> {
    try {
      // Check if remote version exists and differs
      const collectionName = type === 'progress' ? 'meditation_sessions' :
                            type === 'mood' ? 'mood_entries' : 'journal_entries';
      
      const q = query(
        collection(db, collectionName),
        where('userId', '==', localData.userId),
        where('id', '==', localData.id)
      );

      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const remoteData = snapshot.docs[0].data();
        
        // Check for version conflicts
        if (remoteData.version !== localData.version || 
            remoteData.lastModified.toDate() !== localData.lastModified) {
          
          const conflictFields = this.identifyConflictFields(localData, remoteData);
          
          if (conflictFields.length > 0) {
            return {
              id: localData.id,
              type: type as any,
              localData,
              remoteData,
              conflictField: conflictFields,
              suggestedResolution: this.suggestResolution(localData, remoteData)
            };
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error checking for conflicts:', error);
      return null;
    }
  }

  private identifyConflictFields(localData: any, remoteData: any): string[] {
    const conflicts: string[] = [];
    const fieldsToCheck = ['content', 'notes', 'quality', 'mood', 'tags'];
    
    for (const field of fieldsToCheck) {
      if (localData[field] !== remoteData[field]) {
        conflicts.push(field);
      }
    }
    
    return conflicts;
  }

  private suggestResolution(localData: any, remoteData: any): ConflictResolution {
    // Suggest resolution based on timestamps
    const localTime = new Date(localData.lastModified);
    const remoteTime = remoteData.lastModified.toDate ? remoteData.lastModified.toDate() : new Date(remoteData.lastModified);
    
    if (localTime > remoteTime) {
      return { type: 'local_wins', strategy: 'latest_timestamp' };
    } else if (remoteTime > localTime) {
      return { type: 'remote_wins', strategy: 'latest_timestamp' };
    } else {
      return { type: 'merge', strategy: 'user_choice' };
    }
  }

  private async resolveConflict(conflict: SyncConflict, resolution: ConflictResolution): Promise<any | null> {
    switch (resolution.type) {
      case 'local_wins':
        return conflict.localData;
      
      case 'remote_wins':
        return conflict.remoteData;
      
      case 'merge':
        return this.mergeData(conflict.localData, conflict.remoteData);
      
      case 'manual': {
        // Add to manual resolution queue
        this.conflictQueue.push(conflict);
        return null;
      }
      
      default:
        return null;
    }
  }

  private mergeData(localData: any, remoteData: any): any {
    // Simple merge strategy - combine non-conflicting fields
    const merged = { ...localData };
    
    // Use latest timestamp for version
    if (new Date(remoteData.lastModified) > new Date(localData.lastModified)) {
      merged.lastModified = remoteData.lastModified;
      merged.version = Math.max(localData.version, remoteData.version) + 1;
    }
    
    // Merge arrays (e.g., tags)
    if (Array.isArray(localData.tags) && Array.isArray(remoteData.tags)) {
      merged.tags = [...new Set([...localData.tags, ...remoteData.tags])];
    }
    
    return merged;
  }

  private async markAsSynced(type: string, id: string): Promise<void> {
    try {
      switch (type) {
        case 'progress': {
          const progress = await offlineStorageService.getProgress(id);
          if (progress) {
            progress.syncStatus = 'synced';
            await offlineStorageService.saveProgress(progress);
          }
          break;
        }
        case 'mood': {
          const mood = await offlineStorageService.getMoodEntry(id);
          if (mood) {
            mood.syncStatus = 'synced';
            await offlineStorageService.saveMoodEntry(mood);
          }
          break;
        }
        case 'journal': {
          const journal = await offlineStorageService.getJournalEntry(id);
          if (journal) {
            journal.syncStatus = 'synced';
            await offlineStorageService.saveJournalEntry(journal);
          }
          break;
        }
      }
    } catch (error) {
      console.error(`Error marking ${type} as synced:`, error);
    }
  }

  private estimateDataSize(data: any): number {
    // Rough estimation of data size in bytes
    return JSON.stringify(data).length;
  }

  private async getLastSyncTimestamp(userId: string): Promise<Date> {
    try {
      const syncStatus = await offlineStorageService.getSyncStatus(userId);
      return syncStatus?.lastSyncAt || new Date(0); // Epoch if no previous sync
    } catch (error) {
      console.error('Error getting last sync timestamp:', error);
      return new Date(0);
    }
  }

  async scheduleBackgroundSync(userId: string): Promise<void> {
    try {
      const config = await this.getBackgroundSyncConfig(userId);
      
      if (!config.enabled) return;

      // Check if sync is needed
      const lastSync = await this.getLastSyncTimestamp(userId);
      const timeSinceLastSync = Date.now() - lastSync.getTime();
      const syncIntervalMs = config.syncInterval * 60 * 1000; // Convert to milliseconds

      if (timeSinceLastSync < syncIntervalMs) {
        console.log('Background sync not needed yet');
        return;
      }

      // Check connectivity requirements
      if (config.wifiOnly && !await this.isWifiConnected()) {
        console.log('Background sync skipped: WiFi required');
        return;
      }

      // Perform background sync
      console.log('Starting background sync...');
      
      const result = await this.syncAllData(userId, {
        conflictResolution: { type: 'local_wins', strategy: 'latest_timestamp' }
      });

      console.log('Background sync completed:', result);
    } catch (error) {
      console.error('Error in background sync:', error);
    }
  }

  async getBackgroundSyncConfig(userId: string): Promise<BackgroundSyncConfig> {
    try {
      const config = await offlineStorageService.getSetting(`backgroundSyncConfig_${userId}`);
      
      if (config) {
        return config;
      }

      // Default configuration
      const defaultConfig: BackgroundSyncConfig = {
        enabled: true,
        syncInterval: 30, // 30 minutes
        wifiOnly: true,
        maxRetries: 3,
        exponentialBackoff: true,
        syncOnAppStart: true,
        syncOnAppBackground: false,
        batchSize: 50,
        priority: {
          sessions: 1,
          moods: 2,
          journals: 3
        }
      };

      await offlineStorageService.setSetting(`backgroundSyncConfig_${userId}`, defaultConfig);
      return defaultConfig;
    } catch (error) {
      console.error('Error getting background sync config:', error);
      throw error;
    }
  }

  async updateBackgroundSyncConfig(userId: string, config: Partial<BackgroundSyncConfig>): Promise<void> {
    try {
      const current = await this.getBackgroundSyncConfig(userId);
      const updated = { ...current, ...config };
      await offlineStorageService.setSetting(`backgroundSyncConfig_${userId}`, updated);
    } catch (error) {
      console.error('Error updating background sync config:', error);
      throw error;
    }
  }

  async getPendingSyncCount(userId: string): Promise<{ sessions: number; moods: number; journals: number; total: number }> {
    try {
      const [sessions, moods, journals] = await Promise.all([
        offlineStorageService.getPendingProgress(userId),
        offlineStorageService.getPendingMoods(userId),
        offlineStorageService.getPendingJournals(userId)
      ]);

      return {
        sessions: sessions.length,
        moods: moods.length,
        journals: journals.length,
        total: sessions.length + moods.length + journals.length
      };
    } catch (error) {
      console.error('Error getting pending sync count:', error);
      return { sessions: 0, moods: 0, journals: 0, total: 0 };
    }
  }

  async getConflicts(): Promise<SyncConflict[]> {
    return [...this.conflictQueue];
  }

  async resolveManualConflict(conflictId: string, resolution: ConflictResolution): Promise<void> {
    const conflictIndex = this.conflictQueue.findIndex(c => c.id === conflictId);
    
    if (conflictIndex === -1) {
      throw new Error('Conflict not found');
    }

    const conflict = this.conflictQueue[conflictIndex];
    const resolved = await this.resolveConflict(conflict, resolution);
    
    if (resolved) {
      // Upload resolved data
      switch (conflict.type) {
        case 'progress': {
          await this.uploadProgress(resolved);
          await this.markAsSynced('progress', resolved.id);
          break;
        }
        case 'mood': {
          await this.uploadMood(resolved);
          await this.markAsSynced('mood', resolved.id);
          break;
        }
        case 'journal': {
          await this.uploadJournal(resolved);
          await this.markAsSynced('journal', resolved.id);
          break;
        }
      }
      
      // Remove from conflict queue
      this.conflictQueue.splice(conflictIndex, 1);
    }
  }

  private async isWifiConnected(): Promise<boolean> {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection.type === 'wifi' || connection.effectiveType === '4g';
    }
    return navigator.onLine;
  }

  async forceSyncNow(userId: string): Promise<SyncResult> {
    return await this.syncAllData(userId, { force: true });
  }
}

export const offlineSyncService = OfflineSyncService.getInstance();