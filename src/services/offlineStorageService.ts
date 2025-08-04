import { openDB } from 'idb';
import type { IDBPDatabase, IDBPTransaction } from 'idb';

export interface OfflineSession {
  id: string;
  userId: string;
  sessionId: string;
  title: string;
  description: string;
  technique: string;
  duration: number; // in minutes
  audioUrl?: string;
  audioData?: ArrayBuffer; // Cached audio content
  transcript?: string;
  instructions: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'mindfulness' | 'breathing' | 'body_scan' | 'loving_kindness' | 'walking';
  tags: string[];
  downloadedAt: Date;
  lastUsed?: Date;
  size: number; // in bytes
  version: number;
  isOfflineReady: boolean;
}

export interface OfflineProgress {
  id: string;
  userId: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // actual meditation time in minutes
  quality: number; // 1-5 scale
  moodBefore?: number;
  moodAfter?: number;
  stressLevel?: number;
  energyLevel?: number;
  techniques: string[];
  notes?: string;
  completionPercentage: number;
  interruptions?: number;
  environment: 'home' | 'office' | 'outdoor' | 'other';
  syncStatus: 'pending' | 'synced' | 'failed';
  createdAt: Date;
  lastModified: Date;
  version: number;
}

export interface OfflineMoodEntry {
  id: string;
  userId: string;
  date: Date;
  overall: number; // 1-5 scale
  energy: number;
  anxiety: number;
  happiness: number;
  stress: number;
  focus: number;
  tags: string[];
  notes?: string;
  relatedSessionId?: string;
  syncStatus: 'pending' | 'synced' | 'failed';
  createdAt: Date;
  lastModified: Date;
  version: number;
}

export interface OfflineJournalEntry {
  id: string;
  userId: string;
  date: Date;
  title?: string;
  content: string;
  mood?: number;
  gratitude?: string[];
  insights?: string[];
  challenges?: string[];
  intentions?: string[];
  tags: string[];
  relatedSessionId?: string;
  syncStatus: 'pending' | 'synced' | 'failed';
  createdAt: Date;
  lastModified: Date;
  version: number;
}

export interface OfflineAudioCache {
  id: string;
  sessionId: string;
  audioUrl: string;
  audioData: ArrayBuffer;
  mimeType: string;
  size: number;
  downloadedAt: Date;
  lastAccessed: Date;
  expiresAt?: Date;
  compressionLevel: number;
}

export interface SyncStatus {
  userId: string;
  lastSyncAt: Date;
  pendingSessions: number;
  pendingMoods: number;
  pendingJournals: number;
  failedSync: {
    sessions: string[];
    moods: string[];
    journals: string[];
  };
  dataUsage: {
    downloaded: number; // bytes
    uploaded: number; // bytes
    lastReset: Date;
  };
  syncPreferences: {
    wifiOnly: boolean;
    backgroundSync: boolean;
    autoDownload: boolean;
    maxCacheSize: number; // MB
    syncInterval: number; // minutes
  };
}

export class OfflineStorageService {
  private static instance: OfflineStorageService;
  private db: IDBPDatabase | null = null;
  private dbName = 'SembalunOfflineDB';
  private dbVersion = 1;

  static getInstance(): OfflineStorageService {
    if (!OfflineStorageService.instance) {
      OfflineStorageService.instance = new OfflineStorageService();
    }
    return OfflineStorageService.instance;
  }

  async initializeDB(): Promise<void> {
    try {
      this.db = await openDB(this.dbName, this.dbVersion, {
        upgrade(db, oldVersion, newVersion, transaction) {
          // Sessions store
          if (!db.objectStoreNames.contains('sessions')) {
            const sessionsStore = db.createObjectStore('sessions', { keyPath: 'id' });
            sessionsStore.createIndex('userId', 'userId', { unique: false });
            sessionsStore.createIndex('sessionId', 'sessionId', { unique: false });
            sessionsStore.createIndex('technique', 'technique', { unique: false });
            sessionsStore.createIndex('downloadedAt', 'downloadedAt', { unique: false });
            sessionsStore.createIndex('lastUsed', 'lastUsed', { unique: false });
          }

          // Progress store
          if (!db.objectStoreNames.contains('progress')) {
            const progressStore = db.createObjectStore('progress', { keyPath: 'id' });
            progressStore.createIndex('userId', 'userId', { unique: false });
            progressStore.createIndex('sessionId', 'sessionId', { unique: false });
            progressStore.createIndex('syncStatus', 'syncStatus', { unique: false });
            progressStore.createIndex('createdAt', 'createdAt', { unique: false });
            progressStore.createIndex('lastModified', 'lastModified', { unique: false });
          }

          // Mood entries store
          if (!db.objectStoreNames.contains('moods')) {
            const moodsStore = db.createObjectStore('moods', { keyPath: 'id' });
            moodsStore.createIndex('userId', 'userId', { unique: false });
            moodsStore.createIndex('date', 'date', { unique: false });
            moodsStore.createIndex('syncStatus', 'syncStatus', { unique: false });
            moodsStore.createIndex('lastModified', 'lastModified', { unique: false });
          }

          // Journal entries store
          if (!db.objectStoreNames.contains('journals')) {
            const journalsStore = db.createObjectStore('journals', { keyPath: 'id' });
            journalsStore.createIndex('userId', 'userId', { unique: false });
            journalsStore.createIndex('date', 'date', { unique: false });
            journalsStore.createIndex('syncStatus', 'syncStatus', { unique: false });
            journalsStore.createIndex('lastModified', 'lastModified', { unique: false });
          }

          // Audio cache store
          if (!db.objectStoreNames.contains('audioCache')) {
            const audioCacheStore = db.createObjectStore('audioCache', { keyPath: 'id' });
            audioCacheStore.createIndex('sessionId', 'sessionId', { unique: false });
            audioCacheStore.createIndex('downloadedAt', 'downloadedAt', { unique: false });
            audioCacheStore.createIndex('lastAccessed', 'lastAccessed', { unique: false });
            audioCacheStore.createIndex('expiresAt', 'expiresAt', { unique: false });
          }

          // Sync status store
          if (!db.objectStoreNames.contains('syncStatus')) {
            const syncStatusStore = db.createObjectStore('syncStatus', { keyPath: 'userId' });
            syncStatusStore.createIndex('lastSyncAt', 'lastSyncAt', { unique: false });
          }

          // Settings store for offline preferences
          if (!db.objectStoreNames.contains('settings')) {
            const settingsStore = db.createObjectStore('settings', { keyPath: 'key' });
          }
        },
      });

      console.log('Offline database initialized successfully');
    } catch (error) {
      console.error('Error initializing offline database:', error);
      throw error;
    }
  }

  // Session Management
  async saveSession(session: OfflineSession): Promise<void> {
    if (!this.db) await this.initializeDB();
    
    try {
      const tx = this.db!.transaction('sessions', 'readwrite');
      await tx.objectStore('sessions').put(session);
      await tx.done;
    } catch (error) {
      console.error('Error saving session:', error);
      throw error;
    }
  }

  async getSession(sessionId: string): Promise<OfflineSession | null> {
    if (!this.db) await this.initializeDB();
    
    try {
      const tx = this.db!.transaction('sessions', 'readonly');
      const sessions = await tx.objectStore('sessions').index('sessionId').getAll(sessionId);
      return sessions[0] || null;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  async getUserSessions(userId: string): Promise<OfflineSession[]> {
    if (!this.db) await this.initializeDB();
    
    try {
      const tx = this.db!.transaction('sessions', 'readonly');
      const sessions = await tx.objectStore('sessions').index('userId').getAll(userId);
      return sessions.sort((a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime());
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return [];
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    if (!this.db) await this.initializeDB();
    
    try {
      const tx = this.db!.transaction(['sessions', 'audioCache'], 'readwrite');
      
      // Delete session
      const sessions = await tx.objectStore('sessions').index('sessionId').getAll(sessionId);
      for (const session of sessions) {
        await tx.objectStore('sessions').delete(session.id);
      }
      
      // Delete associated audio cache
      const audioCaches = await tx.objectStore('audioCache').index('sessionId').getAll(sessionId);
      for (const cache of audioCaches) {
        await tx.objectStore('audioCache').delete(cache.id);
      }
      
      await tx.done;
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }

  // Progress Management
  async saveProgress(progress: OfflineProgress): Promise<void> {
    if (!this.db) await this.initializeDB();
    
    try {
      const tx = this.db!.transaction('progress', 'readwrite');
      await tx.objectStore('progress').put(progress);
      await tx.done;
    } catch (error) {
      console.error('Error saving progress:', error);
      throw error;
    }
  }

  async getProgress(progressId: string): Promise<OfflineProgress | null> {
    if (!this.db) await this.initializeDB();
    
    try {
      return await this.db!.get('progress', progressId);
    } catch (error) {
      console.error('Error getting progress:', error);
      return null;
    }
  }

  async getUserProgress(userId: string, limit?: number): Promise<OfflineProgress[]> {
    if (!this.db) await this.initializeDB();
    
    try {
      const tx = this.db!.transaction('progress', 'readonly');
      let progress = await tx.objectStore('progress').index('userId').getAll(userId);
      
      progress = progress.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      return limit ? progress.slice(0, limit) : progress;
    } catch (error) {
      console.error('Error getting user progress:', error);
      return [];
    }
  }

  async getPendingProgress(userId: string): Promise<OfflineProgress[]> {
    if (!this.db) await this.initializeDB();
    
    try {
      const tx = this.db!.transaction('progress', 'readonly');
      const allProgress = await tx.objectStore('progress').index('userId').getAll(userId);
      return allProgress.filter(p => p.syncStatus === 'pending');
    } catch (error) {
      console.error('Error getting pending progress:', error);
      return [];
    }
  }

  // Mood Management
  async saveMoodEntry(mood: OfflineMoodEntry): Promise<void> {
    if (!this.db) await this.initializeDB();
    
    try {
      const tx = this.db!.transaction('moods', 'readwrite');
      await tx.objectStore('moods').put(mood);
      await tx.done;
    } catch (error) {
      console.error('Error saving mood entry:', error);
      throw error;
    }
  }

  async getMoodEntry(moodId: string): Promise<OfflineMoodEntry | null> {
    if (!this.db) await this.initializeDB();
    
    try {
      return await this.db!.get('moods', moodId);
    } catch (error) {
      console.error('Error getting mood entry:', error);
      return null;
    }
  }

  async getUserMoods(userId: string, limit?: number): Promise<OfflineMoodEntry[]> {
    if (!this.db) await this.initializeDB();
    
    try {
      const tx = this.db!.transaction('moods', 'readonly');
      let moods = await tx.objectStore('moods').index('userId').getAll(userId);
      
      moods = moods.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      return limit ? moods.slice(0, limit) : moods;
    } catch (error) {
      console.error('Error getting user moods:', error);
      return [];
    }
  }

  async getPendingMoods(userId: string): Promise<OfflineMoodEntry[]> {
    if (!this.db) await this.initializeDB();
    
    try {
      const tx = this.db!.transaction('moods', 'readonly');
      const allMoods = await tx.objectStore('moods').index('userId').getAll(userId);
      return allMoods.filter(m => m.syncStatus === 'pending');
    } catch (error) {
      console.error('Error getting pending moods:', error);
      return [];
    }
  }

  // Journal Management
  async saveJournalEntry(journal: OfflineJournalEntry): Promise<void> {
    if (!this.db) await this.initializeDB();
    
    try {
      const tx = this.db!.transaction('journals', 'readwrite');
      await tx.objectStore('journals').put(journal);
      await tx.done;
    } catch (error) {
      console.error('Error saving journal entry:', error);
      throw error;
    }
  }

  async getJournalEntry(journalId: string): Promise<OfflineJournalEntry | null> {
    if (!this.db) await this.initializeDB();
    
    try {
      return await this.db!.get('journals', journalId);
    } catch (error) {
      console.error('Error getting journal entry:', error);
      return null;
    }
  }

  async getUserJournals(userId: string, limit?: number): Promise<OfflineJournalEntry[]> {
    if (!this.db) await this.initializeDB();
    
    try {
      const tx = this.db!.transaction('journals', 'readonly');
      let journals = await tx.objectStore('journals').index('userId').getAll(userId);
      
      journals = journals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      return limit ? journals.slice(0, limit) : journals;
    } catch (error) {
      console.error('Error getting user journals:', error);
      return [];
    }
  }

  async getPendingJournals(userId: string): Promise<OfflineJournalEntry[]> {
    if (!this.db) await this.initializeDB();
    
    try {
      const tx = this.db!.transaction('journals', 'readonly');
      const allJournals = await tx.objectStore('journals').index('userId').getAll(userId);
      return allJournals.filter(j => j.syncStatus === 'pending');
    } catch (error) {
      console.error('Error getting pending journals:', error);
      return [];
    }
  }

  // Audio Cache Management
  async cacheAudio(audioCache: OfflineAudioCache): Promise<void> {
    if (!this.db) await this.initializeDB();
    
    try {
      // Check cache size limit before adding
      await this.enforceAudioCacheLimit();
      
      const tx = this.db!.transaction('audioCache', 'readwrite');
      await tx.objectStore('audioCache').put(audioCache);
      await tx.done;
    } catch (error) {
      console.error('Error caching audio:', error);
      throw error;
    }
  }

  async getCachedAudio(sessionId: string): Promise<OfflineAudioCache | null> {
    if (!this.db) await this.initializeDB();
    
    try {
      const tx = this.db!.transaction('audioCache', 'readwrite');
      const caches = await tx.objectStore('audioCache').index('sessionId').getAll(sessionId);
      
      if (caches.length > 0) {
        const cache = caches[0];
        // Update last accessed time
        cache.lastAccessed = new Date();
        await tx.objectStore('audioCache').put(cache);
        await tx.done;
        return cache;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting cached audio:', error);
      return null;
    }
  }

  async deleteCachedAudio(sessionId: string): Promise<void> {
    if (!this.db) await this.initializeDB();
    
    try {
      const tx = this.db!.transaction('audioCache', 'readwrite');
      const caches = await tx.objectStore('audioCache').index('sessionId').getAll(sessionId);
      
      for (const cache of caches) {
        await tx.objectStore('audioCache').delete(cache.id);
      }
      
      await tx.done;
    } catch (error) {
      console.error('Error deleting cached audio:', error);
      throw error;
    }
  }

  async getAudioCacheSize(): Promise<number> {
    if (!this.db) await this.initializeDB();
    
    try {
      const tx = this.db!.transaction('audioCache', 'readonly');
      const caches = await tx.objectStore('audioCache').getAll();
      return caches.reduce((total, cache) => total + cache.size, 0);
    } catch (error) {
      console.error('Error getting audio cache size:', error);
      return 0;
    }
  }

  private async enforceAudioCacheLimit(): Promise<void> {
    const maxCacheSize = 500 * 1024 * 1024; // 500MB default
    const currentSize = await this.getAudioCacheSize();
    
    if (currentSize < maxCacheSize) return;
    
    try {
      const tx = this.db!.transaction('audioCache', 'readwrite');
      const caches = await tx.objectStore('audioCache').getAll();
      
      // Sort by last accessed (oldest first)
      caches.sort((a, b) => new Date(a.lastAccessed).getTime() - new Date(b.lastAccessed).getTime());
      
      let freedSpace = 0;
      const targetFreeSpace = maxCacheSize * 0.2; // Free 20% of max size
      
      for (const cache of caches) {
        if (freedSpace >= targetFreeSpace) break;
        
        await tx.objectStore('audioCache').delete(cache.id);
        freedSpace += cache.size;
      }
      
      await tx.done;
    } catch (error) {
      console.error('Error enforcing audio cache limit:', error);
    }
  }

  // Sync Status Management
  async getSyncStatus(userId: string): Promise<SyncStatus | null> {
    if (!this.db) await this.initializeDB();
    
    try {
      const status = await this.db!.get('syncStatus', userId);
      return status || null;
    } catch (error) {
      console.error('Error getting sync status:', error);
      return null;
    }
  }

  async updateSyncStatus(syncStatus: SyncStatus): Promise<void> {
    if (!this.db) await this.initializeDB();
    
    try {
      const tx = this.db!.transaction('syncStatus', 'readwrite');
      await tx.objectStore('syncStatus').put(syncStatus);
      await tx.done;
    } catch (error) {
      console.error('Error updating sync status:', error);
      throw error;
    }
  }

  // Utility Methods
  async isOnline(): Promise<boolean> {
    return navigator.onLine;
  }

  async getStorageUsage(): Promise<{
    sessions: number;
    progress: number;
    moods: number;
    journals: number;
    audioCache: number;
    total: number;
  }> {
    if (!this.db) await this.initializeDB();
    
    try {
      // Estimate storage usage (simplified calculation)
      const [sessions, progress, moods, journals, audioSize] = await Promise.all([
        this.db!.count('sessions'),
        this.db!.count('progress'),
        this.db!.count('moods'),
        this.db!.count('journals'),
        this.getAudioCacheSize()
      ]);

      const estimatedSizes = {
        sessions: sessions * 50 * 1024, // ~50KB per session
        progress: progress * 5 * 1024, // ~5KB per progress entry
        moods: moods * 2 * 1024, // ~2KB per mood entry
        journals: journals * 10 * 1024, // ~10KB per journal entry
        audioCache: audioSize,
        total: 0
      };

      estimatedSizes.total = Object.values(estimatedSizes).reduce((sum, size) => sum + size, 0) - audioSize + audioSize;

      return estimatedSizes;
    } catch (error) {
      console.error('Error calculating storage usage:', error);
      return {
        sessions: 0,
        progress: 0,
        moods: 0,
        journals: 0,
        audioCache: 0,
        total: 0
      };
    }
  }

  async clearAllData(userId: string): Promise<void> {
    if (!this.db) await this.initializeDB();
    
    try {
      const tx = this.db!.transaction(['sessions', 'progress', 'moods', 'journals', 'audioCache', 'syncStatus'], 'readwrite');
      
      // Clear user data from all stores
      const stores = ['sessions', 'progress', 'moods', 'journals'];
      
      for (const storeName of stores) {
        const store = tx.objectStore(storeName);
        const items = await store.index('userId').getAll(userId);
        
        for (const item of items) {
          await store.delete(item.id);
        }
      }
      
      // Clear audio cache
      const audioCaches = await tx.objectStore('audioCache').getAll();
      for (const cache of audioCaches) {
        await tx.objectStore('audioCache').delete(cache.id);
      }
      
      // Clear sync status
      await tx.objectStore('syncStatus').delete(userId);
      
      await tx.done;
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }

  // Settings Management
  async getSetting(key: string): Promise<any> {
    if (!this.db) await this.initializeDB();
    
    try {
      const setting = await this.db!.get('settings', key);
      return setting?.value || null;
    } catch (error) {
      console.error('Error getting setting:', error);
      return null;
    }
  }

  async setSetting(key: string, value: any): Promise<void> {
    if (!this.db) await this.initializeDB();
    
    try {
      const tx = this.db!.transaction('settings', 'readwrite');
      await tx.objectStore('settings').put({ key, value });
      await tx.done;
    } catch (error) {
      console.error('Error setting value:', error);
      throw error;
    }
  }
}

export const offlineStorageService = OfflineStorageService.getInstance();