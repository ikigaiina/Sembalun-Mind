import { openDB, type IDBPDatabase } from 'idb';
import { supabase } from '../config/supabaseClient';


interface OfflineData {
  id: string;
  type: 'session' | 'progress' | 'preference' | 'journal' | 'audio' | 'achievement';
  data: any;
  last_modified: number;
  syncStatus: 'pending' | 'synced' | 'conflict' | 'error';
  userId: string;
  cloudVersion?: number;
  localChanges: boolean;
}

interface SyncResult {
  success: boolean;
  syncedCount: number;
  conflictCount: number;
  errorCount: number;
  errors: Array<{ id: string; error: string; type: string }>;
}

interface OfflineSyncStatus {
  isOnline: boolean;
  lastSyncTime: number;
  pendingSyncCount: number;
  syncInProgress: boolean;
  autoSyncEnabled: boolean;
}

class EnhancedOfflineService {
  private db: IDBPDatabase | null = null;
  private readonly DB_NAME = 'SembalunOfflineDB';
  private readonly DB_VERSION = 3;
  private syncInProgress = false;
  private autoSyncInterval: NodeJS.Timeout | null = null;
  private onlineStatusCallbacks: Array<(isOnline: boolean) => void> = [];
  private syncStatusCallbacks: Array<(status: OfflineSyncStatus) => void> = [];

  async initialize(): Promise<void> {
    try {
      this.db = await openDB(this.DB_NAME, this.DB_VERSION, {
        upgrade(db, oldVersion, newVersion) {
          console.log(`Upgrading DB from ${oldVersion} to ${newVersion}`);
          
          // Create or upgrade stores
          if (!db.objectStoreNames.contains('offline_data')) {
            const offlineStore = db.createObjectStore('offline_data', { keyPath: 'id' });
            offlineStore.createIndex('userId', 'userId', { unique: false });
            offlineStore.createIndex('type', 'type', { unique: false });
            offlineStore.createIndex('syncStatus', 'syncStatus', { unique: false });
            offlineStore.createIndex('lastModified', 'lastModified', { unique: false });
          }

          if (!db.objectStoreNames.contains('cached_content')) {
            const contentStore = db.createObjectStore('cached_content', { keyPath: 'id' });
            contentStore.createIndex('type', 'type', { unique: false });
            contentStore.createIndex('downloadDate', 'downloadDate', { unique: false });
            contentStore.createIndex('accessCount', 'accessCount', { unique: false });
          }

          if (!db.objectStoreNames.contains('sync_metadata')) {
            const metadataStore = db.createObjectStore('sync_metadata', { keyPath: 'key' });
          }

          if (!db.objectStoreNames.contains('offline_analytics')) {
            const analyticsStore = db.createObjectStore('offline_analytics', { keyPath: 'id' });
            analyticsStore.createIndex('timestamp', 'timestamp', { unique: false });
            analyticsStore.createIndex('userId', 'userId', { unique: false });
          }
        }
      });

      // Set up online/offline detection
      this.setupOnlineDetection();
      
      // Enable auto-sync by default
      await this.setAutoSyncEnabled(true);
      
      console.log('Enhanced offline service initialized');
    } catch (error) {
      console.error('Failed to initialize offline service:', error);
      throw error;
    }
  }

  private setupOnlineDetection(): void {
    const updateOnlineStatus = () => {
      const isOnline = navigator.onLine;
      this.notifyOnlineStatusChange(isOnline);
      
      if (isOnline && !this.syncInProgress) {
        // Auto-sync when coming back online
        this.performBackgroundSync();
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Initial status
    updateOnlineStatus();
  }

  // Store data offline with conflict resolution
  async storeOfflineData(
    id: string,
    type: OfflineData['type'],
    data: any,
    userId: string,
    options: {
      markForSync?: boolean;
      overwriteLocal?: boolean;
      cloudVersion?: number;
    } = {}
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const {
      markForSync = true,
      overwriteLocal = false,
      cloudVersion
    } = options;

    try {
      const tx = this.db.transaction('offline_data', 'readwrite');
      const store = tx.objectStore('offline_data');
      
      // Check for existing data
      const existingData = await store.get(id);
      
      let syncStatus: OfflineData['syncStatus'] = 'pending';
      let localChanges = true;

      if (existingData && !overwriteLocal) {
        // Check for conflicts
        if (cloudVersion && existingData.cloudVersion && cloudVersion !== existingData.cloudVersion) {
          syncStatus = 'conflict';
        } else if (!markForSync) {
          syncStatus = existingData.syncStatus;
          localChanges = existingData.localChanges;
        }
      }

      const offlineData: OfflineData = {
        id,
        type,
        data,
        last_modified: Date.now(),
        syncStatus: markForSync ? 'pending' : syncStatus,
        userId,
        cloudVersion,
        localChanges: markForSync || localChanges
      };

      await store.put(offlineData);
      await tx.done;

      // Update sync status
      this.notifySyncStatusChange();

      // Auto-sync if online and enabled
      if (navigator.onLine && markForSync) {
        this.scheduleSync();
      }
    } catch (error) {
      console.error('Failed to store offline data:', error);
      throw error;
    }
  }

  // Retrieve offline data with fallback to cloud
  async getOfflineData(
    id: string,
    type?: OfflineData['type'],
    userId?: string
  ): Promise<OfflineData | null> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const tx = this.db.transaction('offline_data', 'readonly');
      const store = tx.objectStore('offline_data');
      
      const data = await store.get(id);
      
      if (data && (!type || data.type === type) && (!userId || data.userId === userId)) {
        return data;
      }

      return null;
    } catch (error) {
      console.error('Failed to get offline data:', error);
      throw error;
    }
  }

  // Get all offline data by type and user
  async getOfflineDataByType(
    type: OfflineData['type'],
    userId: string,
    options: {
      syncStatus?: OfflineData['syncStatus'];
      limit?: number;
      sortBy?: 'last_modified' | 'id';
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): Promise<OfflineData[]> {
    if (!this.db) throw new Error('Database not initialized');

    const { syncStatus, limit, sortBy = 'lastModified', sortOrder = 'desc' } = options;

    try {
      const tx = this.db.transaction('offline_data', 'readonly');
      const store = tx.objectStore('offline_data');
      
      let cursor = await store.index('userId').openCursor(IDBKeyRange.only(userId));
      const results: OfflineData[] = [];

      while (cursor) {
        const data = cursor.value;
        
        if (data.type === type && (!syncStatus || data.syncStatus === syncStatus)) {
          results.push(data);
        }
        
        cursor = await cursor.continue();
      }

      // Sort results
      results.sort((a, b) => {
        const aValue = a[sortBy === 'last_modified' ? 'last_modified' : 'id'];
        const bValue = b[sortBy === 'last_modified' ? 'last_modified' : 'id'];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        return 0;
      });

      return limit ? results.slice(0, limit) : results;
    } catch (error) {
      console.error('Failed to get offline data by type:', error);
      throw error;
    }
  }

  // Comprehensive sync with conflict resolution
  async performFullSync(userId: string): Promise<SyncResult> {
    if (!this.db || !navigator.onLine) {
      throw new Error('Cannot sync: offline or database not initialized');
    }

    if (this.syncInProgress) {
      throw new Error('Sync already in progress');
    }

    this.syncInProgress = true;
    this.notifySyncStatusChange();

    const result: SyncResult = {
      success: true,
      syncedCount: 0,
      conflictCount: 0,
      errorCount: 0,
      errors: []
    };

    try {
      // Get all pending sync items
      const pendingItems = await this.getOfflineDataByType('session', userId, { syncStatus: 'pending' });
      const conflictItems = await this.getOfflineDataByType('session', userId, { syncStatus: 'conflict' });
      
      // Sync pending items
      for (const item of pendingItems) {
        try {
          await this.syncSingleItem(item);
          result.syncedCount++;
        } catch (error) {
          result.errorCount++;
          result.errors.push({
            id: item.id,
            error: error instanceof Error ? error.message : 'Unknown error',
            type: item.type
          });
        }
      }

      // Handle conflicts
      for (const item of conflictItems) {
        try {
          await this.resolveConflict(item);
          result.syncedCount++;
        } catch (error) {
          result.conflictCount++;
          result.errors.push({
            id: item.id,
            error: error instanceof Error ? error.message : 'Conflict resolution failed',
            type: item.type
          });
        }
      }

      // Download latest data from cloud
      await this.downloadCloudData(userId);

      // Update sync metadata
      await this.updateSyncMetadata('lastSyncTime', Date.now());

      result.success = result.errorCount === 0 && result.conflictCount === 0;
    } catch (error) {
      result.success = false;
      result.errors.push({
        id: 'sync_process',
        error: error instanceof Error ? error.message : 'Sync process failed',
        type: 'system'
      });
    } finally {
      this.syncInProgress = false;
      this.notifySyncStatusChange();
    }

    return result;
  }

  private async syncSingleItem(item: OfflineData): Promise<void> {
    const collectionName = this.getCollectionName(item.type);
    // Assuming supabase is imported and initialized as 'supabase'
    // You'll need to import { supabase } from '../config/supabaseClient'; at the top of this file
    
    try {
      if (item.localChanges) {
        // Upload local changes to cloud
        const { error } = await supabase
          .from(collectionName)
          .upsert({
            ...item.data,
            id: item.id, // Ensure the ID is part of the upsert data
            last_modified: new Date().toISOString(), // Supabase uses ISO strings for timestamps
            version: (item.cloudVersion || 0) + 1
          }, { onConflict: 'id' }); // Specify conflict key for upsert

        if (error) throw error;

        // Update local status
        await this.updateOfflineDataStatus(item.id, 'synced', {
          cloudVersion: (item.cloudVersion || 0) + 1,
          localChanges: false
        });
      }
    } catch (error) {
      await this.updateOfflineDataStatus(item.id, 'error');
      throw error;
    }
  }

  private async resolveConflict(item: OfflineData): Promise<void> {
    // Simple resolution strategy: last write wins
    // In a more sophisticated system, you'd present options to the user
    
    const collectionName = this.getCollectionName(item.type);

    try {
      // Force upload local version
      const { error } = await supabase
        .from(collectionName)
        .upsert({
          ...item.data,
          id: item.id,
          last_modified: new Date().toISOString(),
          version: Date.now() // Use timestamp as version for conflicts
        }, { onConflict: 'id' });

      if (error) throw error;

      await this.updateOfflineDataStatus(item.id, 'synced', {
        cloudVersion: Date.now(),
        localChanges: false
      });
    } catch (error) {
      await this.updateOfflineDataStatus(item.id, 'error');
      throw error;
    }
  }

  private async downloadCloudData(userId: string): Promise<void> {
    const collections = ['meditation_sessions', 'user_progress', 'user_preferences'];
    
    for (const collectionName of collections) {
      try {
        const { data, error } = await supabase
          .from(collectionName)
          .select('*')
          .eq('userId', userId)
          .order('last_modified', { ascending: false });

        if (error) throw error;
        
        if (data) {
          for (const item of data) {
            const type = this.getTypeFromCollection(collectionName);
            
            await this.storeOfflineData(
              item.id,
              type,
              item,
              userId,
              {
                markForSync: false,
                overwriteLocal: false,
                cloudVersion: item.version || 1
              }
            );
          }
        }
      } catch (error) {
        console.warn(`Failed to download ${collectionName}:`, error);
      }
    }
  }

  // Content caching for offline access
  async cacheContent(
    id: string,
    type: 'audio' | 'video' | 'image' | 'text',
    url: string,
    metadata: any = {}
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      
      const cachedContent = {
        id,
        type,
        url,
        blob,
        metadata,
        downloadDate: Date.now(),
        accessCount: 0,
        size: blob.size
      };

      const tx = this.db.transaction('cached_content', 'readwrite');
      await tx.objectStore('cached_content').put(cachedContent);
      await tx.done;
    } catch (error) {
      console.error('Failed to cache content:', error);
      throw error;
    }
  }

  async getCachedContent(id: string): Promise<{ blob: Blob; metadata: any } | null> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const tx = this.db.transaction('cached_content', 'readwrite');
      const store = tx.objectStore('cached_content');
      const content = await store.get(id);

      if (content) {
        // Update access count
        content.accessCount = (content.accessCount || 0) + 1;
        await store.put(content);
        await tx.done;

        return {
          blob: content.blob,
          metadata: content.metadata
        };
      }

      return null;
    } catch (error) {
      console.error('Failed to get cached content:', error);
      throw error;
    }
  }

  // Analytics tracking for offline usage
  async trackOfflineAnalytics(
    event: string,
    data: any,
    userId: string
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const analyticsEntry = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      event,
      data,
      userId,
      timestamp: Date.now(),
      synced: false
    };

    try {
      const tx = this.db.transaction('offline_analytics', 'readwrite');
      await tx.objectStore('offline_analytics').add(analyticsEntry);
      await tx.done;
    } catch (error) {
      console.error('Failed to track offline analytics:', error);
    }
  }

  // Utility methods
  private getCollectionName(type: OfflineData['type']): string {
    const mapping = {
      session: 'meditation_sessions',
      progress: 'user_progress',
      preference: 'user_preferences',
      journal: 'journal_entries',
      audio: 'audio_content',
      achievement: 'user_achievements'
    };
    return mapping[type] || 'unknown';
  }

  private getTypeFromCollection(collectionName: string): OfflineData['type'] {
    const mapping = {
      meditation_sessions: 'session',
      user_progress: 'progress',
      user_preferences: 'preference',
      journal_entries: 'journal',
      audio_content: 'audio',
      user_achievements: 'achievement'
    } as const;
    return mapping[collectionName as keyof typeof mapping] || 'session';
  }

  private async updateOfflineDataStatus(
    id: string,
    status: OfflineData['syncStatus'],
    updates: Partial<OfflineData> = {}
  ): Promise<void> {
    if (!this.db) return;

    const tx = this.db.transaction('offline_data', 'readwrite');
    const store = tx.objectStore('offline_data');
    const data = await store.get(id);

    if (data) {
      const updatedData = {
        ...data,
        syncStatus: status,
        ...updates
      };
      await store.put(updatedData);
    }

    await tx.done;
  }

  private async updateSyncMetadata(key: string, value: any): Promise<void> {
    if (!this.db) return;

    const tx = this.db.transaction('sync_metadata', 'readwrite');
    await tx.objectStore('sync_metadata').put({ key, value });
    await tx.done;
  }

  // Background sync scheduling
  private scheduleSync(): void {
    if (this.autoSyncInterval) return;

    this.autoSyncInterval = setTimeout(() => {
      this.performBackgroundSync();
      this.autoSyncInterval = null;
    }, 5000); // 5 second delay
  }

  private async performBackgroundSync(): Promise<void> {
    if (!navigator.onLine || this.syncInProgress) return;

    try {
      // Get current user - you'd implement this based on your auth system
      const userId = localStorage.getItem('currentUserId');
      if (!userId) return;

      const result = await this.performFullSync(userId);
      
      if (result.success) {
        console.log(`Background sync completed: ${result.syncedCount} items synced`);
      } else {
        console.warn('Background sync had errors:', result.errors);
      }
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }

  // Auto-sync management
  async setAutoSyncEnabled(enabled: boolean): Promise<void> {
    await this.updateSyncMetadata('autoSyncEnabled', enabled);
    this.notifySyncStatusChange();
  }

  async isAutoSyncEnabled(): Promise<boolean> {
    if (!this.db) return false;

    const tx = this.db.transaction('sync_metadata', 'readonly');
    const metadata = await tx.objectStore('sync_metadata').get('autoSyncEnabled');
    return metadata?.value ?? true;
  }

  // Status notification system
  onOnlineStatusChange(callback: (isOnline: boolean) => void): () => void {
    this.onlineStatusCallbacks.push(callback);
    return () => {
      const index = this.onlineStatusCallbacks.indexOf(callback);
      if (index > -1) {
        this.onlineStatusCallbacks.splice(index, 1);
      }
    };
  }

  onSyncStatusChange(callback: (status: OfflineSyncStatus) => void): () => void {
    this.syncStatusCallbacks.push(callback);
    return () => {
      const index = this.syncStatusCallbacks.indexOf(callback);
      if (index > -1) {
        this.syncStatusCallbacks.splice(index, 1);
      }
    };
  }

  private notifyOnlineStatusChange(isOnline: boolean): void {
    this.onlineStatusCallbacks.forEach(callback => callback(isOnline));
  }

  private async notifySyncStatusChange(): Promise<void> {
    const status = await this.getSyncStatus();
    this.syncStatusCallbacks.forEach(callback => callback(status));
  }

  async getSyncStatus(): Promise<OfflineSyncStatus> {
    if (!this.db) {
      return {
        isOnline: navigator.onLine,
        lastSyncTime: 0,
        pendingSyncCount: 0,
        syncInProgress: this.syncInProgress,
        autoSyncEnabled: false
      };
    }

    const [lastSyncMetadata, autoSyncMetadata] = await Promise.all([
      this.db.transaction('sync_metadata', 'readonly').objectStore('sync_metadata').get('lastSyncTime'),
      this.db.transaction('sync_metadata', 'readonly').objectStore('sync_metadata').get('autoSyncEnabled')
    ]);

    // Count pending items
    const tx = this.db.transaction('offline_data', 'readonly');
    const store = tx.objectStore('offline_data');
    let pendingCount = 0;

    let cursor = await store.index('syncStatus').openCursor(IDBKeyRange.only('pending'));
    while (cursor) {
      pendingCount++;
      cursor = await cursor.continue();
    }

    return {
      isOnline: navigator.onLine,
      lastSyncTime: lastSyncMetadata?.value || 0,
      pendingSyncCount: pendingCount,
      syncInProgress: this.syncInProgress,
      autoSyncEnabled: autoSyncMetadata?.value ?? true
    };
  }

  // Cleanup methods
  async clearOldData(daysOld: number = 30): Promise<void> {
    if (!this.db) return;

    const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);

    const stores = ['offline_data', 'cached_content', 'offline_analytics'];
    
    for (const storeName of stores) {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      
      const index = storeName === 'offline_data' ? 'last_modified' : 
                   storeName === 'cached_content' ? 'downloadDate' : 'timestamp';
      
      let cursor = await store.index(index).openCursor(IDBKeyRange.upperBound(cutoffTime));
      
      while (cursor) {
        await cursor.delete();
        cursor = await cursor.continue();
      }
      
      await tx.done;
    }
  }

  async getStorageStats(): Promise<{
    totalSize: number;
    offlineDataCount: number;
    cachedContentCount: number;
    analyticsCount: number;
  }> {
    if (!this.db) {
      return { totalSize: 0, offlineDataCount: 0, cachedContentCount: 0, analyticsCount: 0 };
    }

    const [offlineData, cachedContent, analytics] = await Promise.all([
      this.db.getAll('offline_data'),
      this.db.getAll('cached_content'),
      this.db.getAll('offline_analytics')
    ]);

    const totalSize = cachedContent.reduce((sum, item) => sum + (item.size || 0), 0);

    return {
      totalSize,
      offlineDataCount: offlineData.length,
      cachedContentCount: cachedContent.length,
      analyticsCount: analytics.length
    };
  }
}

export const enhancedOfflineService = new EnhancedOfflineService();