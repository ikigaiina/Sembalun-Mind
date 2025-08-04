import { offlineStorageService } from './offlineStorageService';
import type { OfflineSession, OfflineAudioCache } from './offlineStorageService';

export interface DownloadProgress {
  sessionId: string;
  progress: number; // 0-100
  downloadedBytes: number;
  totalBytes: number;
  stage: 'metadata' | 'audio' | 'complete' | 'error';
  error?: string;
}

export interface DownloadQueue {
  id: string;
  sessionId: string;
  priority: 'high' | 'medium' | 'low';
  autoDownload: boolean;
  addedAt: Date;
  status: 'queued' | 'downloading' | 'completed' | 'failed';
  retryCount: number;
  maxRetries: number;
}

export interface SessionLibrary {
  id: string;
  title: string;
  description: string;
  technique: string;
  duration: number;
  instructor: string;
  audioUrl: string;
  thumbnailUrl?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'mindfulness' | 'breathing' | 'body_scan' | 'loving_kindness' | 'walking';
  tags: string[];
  rating: number;
  downloads: number;
  size: number; // in bytes
  language: 'indonesian' | 'english';
  transcript?: string;
  instructions: string[];
  isPopular: boolean;
  isFeatured: boolean;
  isNew: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DownloadPreferences {
  userId: string;
  autoDownload: boolean;
  wifiOnly: boolean;
  maxConcurrentDownloads: number;
  downloadQuality: 'low' | 'medium' | 'high';
  autoDeleteAfter: number; // days
  maxStorageSize: number; // MB
  preferredCategories: string[];
  autoDownloadNew: boolean;
  backgroundDownload: boolean;
  notifyOnComplete: boolean;
}

export class SessionDownloadService {
  private static instance: SessionDownloadService;
  private downloadQueue: Map<string, DownloadQueue> = new Map();
  private activeDownloads: Map<string, AbortController> = new Map();
  private downloadProgressCallbacks: Map<string, (progress: DownloadProgress) => void> = new Map();

  static getInstance(): SessionDownloadService {
    if (!SessionDownloadService.instance) {
      SessionDownloadService.instance = new SessionDownloadService();
    }
    return SessionDownloadService.instance;
  }

  async downloadSession(
    sessionId: string, 
    sessionData: SessionLibrary,
    userId: string,
    options: {
      priority?: 'high' | 'medium' | 'low';
      onProgress?: (progress: DownloadProgress) => void;
      forceDownload?: boolean;
    } = {}
  ): Promise<boolean> {
    try {
      // Check if already downloaded
      const existingSession = await offlineStorageService.getSession(sessionId);
      if (existingSession && existingSession.isOfflineReady && !options.forceDownload) {
        return true;
      }

      // Check preferences
      const preferences = await this.getDownloadPreferences(userId);
      if (preferences.wifiOnly && !await this.isWifiConnected()) {
        throw new Error('Download paused: WiFi required');
      }

      // Add to queue
      const queueItem: DownloadQueue = {
        id: `${sessionId}-${Date.now()}`,
        sessionId,
        priority: options.priority || 'medium',
        autoDownload: false,
        addedAt: new Date(),
        status: 'queued',
        retryCount: 0,
        maxRetries: 3
      };

      this.downloadQueue.set(queueItem.id, queueItem);

      if (options.onProgress) {
        this.downloadProgressCallbacks.set(sessionId, options.onProgress);
      }

      return await this.processDownload(queueItem, sessionData, userId);
    } catch (error) {
      console.error('Error starting download:', error);
      return false;
    }
  }

  private async processDownload(
    queueItem: DownloadQueue,
    sessionData: SessionLibrary,
    userId: string
  ): Promise<boolean> {
    const { sessionId } = queueItem;
    
    try {
      // Update status
      queueItem.status = 'downloading';
      this.downloadQueue.set(queueItem.id, queueItem);

      // Progress callback
      const progressCallback = this.downloadProgressCallbacks.get(sessionId);
      
      // Stage 1: Download metadata
      if (progressCallback) {
        progressCallback({
          sessionId,
          progress: 10,
          downloadedBytes: 0,
          totalBytes: sessionData.size,
          stage: 'metadata'
        });
      }

      // Create offline session record
      const offlineSession: OfflineSession = {
        id: `offline-${sessionId}-${Date.now()}`,
        userId,
        sessionId,
        title: sessionData.title,
        description: sessionData.description,
        technique: sessionData.technique,
        duration: sessionData.duration,
        audioUrl: sessionData.audioUrl,
        transcript: sessionData.transcript,
        instructions: sessionData.instructions,
        difficulty: sessionData.difficulty,
        category: sessionData.category,
        tags: sessionData.tags,
        downloadedAt: new Date(),
        size: sessionData.size,
        version: 1,
        isOfflineReady: false
      };

      // Save initial session data
      await offlineStorageService.saveSession(offlineSession);

      // Stage 2: Download audio
      if (progressCallback) {
        progressCallback({
          sessionId,
          progress: 20,
          downloadedBytes: 0,
          totalBytes: sessionData.size,
          stage: 'audio'
        });
      }

      const audioData = await this.downloadAudio(
        sessionData.audioUrl,
        sessionId,
        (downloaded, total) => {
          if (progressCallback) {
            progressCallback({
              sessionId,
              progress: 20 + (downloaded / total) * 70, // 20-90%
              downloadedBytes: downloaded,
              totalBytes: total,
              stage: 'audio'
            });
          }
        }
      );

      // Cache audio
      const audioCache: OfflineAudioCache = {
        id: `audio-${sessionId}-${Date.now()}`,
        sessionId,
        audioUrl: sessionData.audioUrl,
        audioData,
        mimeType: 'audio/mpeg', // Detect from response or use default
        size: audioData.byteLength,
        downloadedAt: new Date(),
        lastAccessed: new Date(),
        compressionLevel: 1
      };

      await offlineStorageService.cacheAudio(audioCache);

      // Update session as ready
      offlineSession.isOfflineReady = true;
      offlineSession.audioData = audioData;
      await offlineStorageService.saveSession(offlineSession);

      // Final progress
      if (progressCallback) {
        progressCallback({
          sessionId,
          progress: 100,
          downloadedBytes: audioData.byteLength,
          totalBytes: audioData.byteLength,
          stage: 'complete'
        });
      }

      // Update queue status
      queueItem.status = 'completed';
      this.downloadQueue.set(queueItem.id, queueItem);

      console.log(`Session ${sessionId} downloaded successfully`);
      return true;

    } catch (error) {
      console.error(`Error downloading session ${sessionId}:`, error);
      
      // Update queue status
      queueItem.status = 'failed';
      queueItem.retryCount++;
      this.downloadQueue.set(queueItem.id, queueItem);

      // Progress callback for error
      const progressCallback = this.downloadProgressCallbacks.get(sessionId);
      if (progressCallback) {
        progressCallback({
          sessionId,
          progress: 0,
          downloadedBytes: 0,
          totalBytes: 0,
          stage: 'error',
          error: error instanceof Error ? error.message : 'Download failed'
        });
      }

      // Retry if possible
      if (queueItem.retryCount < queueItem.maxRetries) {
        console.log(`Retrying download for session ${sessionId} (attempt ${queueItem.retryCount + 1})`);
        setTimeout(() => {
          this.processDownload(queueItem, sessionData, userId);
        }, 5000 * queueItem.retryCount); // Exponential backoff
      }

      return false;
    }
  }

  private async downloadAudio(
    audioUrl: string,
    sessionId: string,
    onProgress: (downloaded: number, total: number) => void
  ): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const abortController = new AbortController();
      this.activeDownloads.set(sessionId, abortController);

      fetch(audioUrl, { 
        signal: abortController.signal,
        headers: {
          'Accept': 'audio/*',
        }
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const contentLength = response.headers.get('content-length');
          const total = contentLength ? parseInt(contentLength, 10) : 0;
          let downloaded = 0;

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('Failed to get response reader');
          }

          const chunks: Uint8Array[] = [];

          const pump = (): Promise<ArrayBuffer> => {
            return reader.read().then(({ done, value }) => {
              if (done) {
                // Combine all chunks
                const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
                const result = new Uint8Array(totalLength);
                let offset = 0;
                
                for (const chunk of chunks) {
                  result.set(chunk, offset);
                  offset += chunk.length;
                }
                
                return result.buffer;
              }

              if (value) {
                chunks.push(value);
                downloaded += value.length;
                onProgress(downloaded, total || downloaded);
              }

              return pump();
            });
          };

          return pump();
        })
        .then(arrayBuffer => {
          this.activeDownloads.delete(sessionId);
          resolve(arrayBuffer);
        })
        .catch(error => {
          this.activeDownloads.delete(sessionId);
          reject(error);
        });
    });
  }

  async cancelDownload(sessionId: string): Promise<void> {
    const abortController = this.activeDownloads.get(sessionId);
    if (abortController) {
      abortController.abort();
      this.activeDownloads.delete(sessionId);
    }

    // Update queue status
    for (const [id, item] of this.downloadQueue) {
      if (item.sessionId === sessionId && item.status === 'downloading') {
        item.status = 'failed';
        this.downloadQueue.set(id, item);
        break;
      }
    }

    console.log(`Download cancelled for session ${sessionId}`);
  }

  async getDownloadedSessions(userId: string): Promise<OfflineSession[]> {
    try {
      const sessions = await offlineStorageService.getUserSessions(userId);
      return sessions.filter(session => session.isOfflineReady);
    } catch (error) {
      console.error('Error getting downloaded sessions:', error);
      return [];
    }
  }

  async deleteDownloadedSession(sessionId: string): Promise<void> {
    try {
      await offlineStorageService.deleteSession(sessionId);
      console.log(`Deleted downloaded session ${sessionId}`);
    } catch (error) {
      console.error('Error deleting downloaded session:', error);
      throw error;
    }
  }

  async getDownloadProgress(sessionId: string): Promise<DownloadProgress | null> {
    // Return current progress if download is active
    for (const [id, item] of this.downloadQueue) {
      if (item.sessionId === sessionId && item.status === 'downloading') {
        return {
          sessionId,
          progress: 50, // Placeholder - would track actual progress
          downloadedBytes: 0,
          totalBytes: 0,
          stage: 'audio'
        };
      }
    }
    return null;
  }

  async getDownloadQueue(): Promise<DownloadQueue[]> {
    return Array.from(this.downloadQueue.values());
  }

  async processAutoDownloads(userId: string): Promise<void> {
    try {
      const preferences = await this.getDownloadPreferences(userId);
      
      if (!preferences.autoDownload) return;
      if (preferences.wifiOnly && !await this.isWifiConnected()) return;

      // Get recommended sessions for auto-download
      const recommendedSessions = await this.getRecommendedSessions(userId, preferences);
      
      for (const session of recommendedSessions) {
        // Check if already downloaded
        const existingSession = await offlineStorageService.getSession(session.id);
        if (existingSession && existingSession.isOfflineReady) continue;

        // Check storage limit
        const usage = await offlineStorageService.getStorageUsage();
        const maxBytes = preferences.maxStorageSize * 1024 * 1024; // Convert MB to bytes
        
        if (usage.total + session.size > maxBytes) {
          console.log('Auto-download skipped: Storage limit reached');
          break;
        }

        // Add to download queue
        const queueItem: DownloadQueue = {
          id: `auto-${session.id}-${Date.now()}`,
          sessionId: session.id,
          priority: 'low',
          autoDownload: true,
          addedAt: new Date(),
          status: 'queued',
          retryCount: 0,
          maxRetries: 2
        };

        this.downloadQueue.set(queueItem.id, queueItem);
        
        // Process download with lower priority
        setTimeout(() => {
          this.processDownload(queueItem, session, userId);
        }, 1000); // Small delay between auto-downloads
      }
    } catch (error) {
      console.error('Error processing auto-downloads:', error);
    }
  }

  async cleanupOldDownloads(userId: string): Promise<void> {
    try {
      const preferences = await this.getDownloadPreferences(userId);
      const sessions = await offlineStorageService.getUserSessions(userId);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - preferences.autoDeleteAfter);

      for (const session of sessions) {
        // Delete old sessions that haven't been used
        if (session.downloadedAt < cutoffDate && 
            (!session.lastUsed || session.lastUsed < cutoffDate)) {
          await this.deleteDownloadedSession(session.sessionId);
          console.log(`Auto-deleted old session: ${session.title}`);
        }
      }
    } catch (error) {
      console.error('Error cleaning up old downloads:', error);
    }
  }

  private async getRecommendedSessions(
    userId: string, 
    preferences: DownloadPreferences
  ): Promise<SessionLibrary[]> {
    // Mock implementation - would integrate with recommendation service
    const mockSessions: SessionLibrary[] = [
      {
        id: 'session-1',
        title: 'Morning Mindfulness',
        description: 'Start your day with peaceful awareness',
        technique: 'mindfulness',
        duration: 10,
        instructor: 'Sembalun Guide',
        audioUrl: 'https://example.com/audio/morning-mindfulness.mp3',
        difficulty: 'beginner',
        category: 'mindfulness',
        tags: ['morning', 'beginner', 'daily'],
        rating: 4.8,
        downloads: 1250,
        size: 15 * 1024 * 1024, // 15MB
        language: 'indonesian',
        instructions: [
          'Find a comfortable position',
          'Close your eyes gently',
          'Focus on your breath',
          'Notice thoughts without judgment'
        ],
        isPopular: true,
        isFeatured: false,
        isNew: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 'session-2',
        title: 'Breathing for Calm',
        description: 'Calm your mind with focused breathing',
        technique: 'breathing',
        duration: 8,
        instructor: 'Sembalun Guide',
        audioUrl: 'https://example.com/audio/breathing-calm.mp3',
        difficulty: 'beginner',
        category: 'breathing',
        tags: ['breathing', 'calm', 'stress'],
        rating: 4.9,
        downloads: 980,
        size: 12 * 1024 * 1024, // 12MB
        language: 'indonesian',
        instructions: [
          'Sit comfortably with spine straight',
          'Breathe in slowly for 4 counts',
          'Hold for 4 counts',
          'Exhale slowly for 6 counts'
        ],
        isPopular: true,
        isFeatured: true,
        isNew: false,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      }
    ];

    // Filter by preferred categories
    return mockSessions.filter(session => 
      preferences.preferredCategories.length === 0 || 
      preferences.preferredCategories.includes(session.category)
    ).slice(0, 5); // Limit to 5 sessions
  }

  private async getDownloadPreferences(userId: string): Promise<DownloadPreferences> {
    try {
      const preferences = await offlineStorageService.getSetting(`downloadPreferences_${userId}`);
      
      if (preferences) {
        return preferences;
      }

      // Default preferences
      const defaultPreferences: DownloadPreferences = {
        userId,
        autoDownload: false,
        wifiOnly: true,
        maxConcurrentDownloads: 2,
        downloadQuality: 'medium',
        autoDeleteAfter: 30, // days
        maxStorageSize: 500, // MB
        preferredCategories: [],
        autoDownloadNew: false,
        backgroundDownload: true,
        notifyOnComplete: true
      };

      await offlineStorageService.setSetting(`downloadPreferences_${userId}`, defaultPreferences);
      return defaultPreferences;
    } catch (error) {
      console.error('Error getting download preferences:', error);
      throw error;
    }
  }

  async updateDownloadPreferences(userId: string, preferences: Partial<DownloadPreferences>): Promise<void> {
    try {
      const current = await this.getDownloadPreferences(userId);
      const updated = { ...current, ...preferences };
      await offlineStorageService.setSetting(`downloadPreferences_${userId}`, updated);
    } catch (error) {
      console.error('Error updating download preferences:', error);
      throw error;
    }
  }

  private async isWifiConnected(): Promise<boolean> {
    // Check if connected to WiFi (browser limitation - this is a simplified check)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection.type === 'wifi' || connection.effectiveType === '4g';
    }
    
    // Fallback: assume WiFi if online
    return navigator.onLine;
  }

  async getSessionLibrary(): Promise<SessionLibrary[]> {
    // Mock implementation - would fetch from server
    return await this.getRecommendedSessions('', {
      userId: '',
      autoDownload: false,
      wifiOnly: false,
      maxConcurrentDownloads: 2,
      downloadQuality: 'medium',
      autoDeleteAfter: 30,
      maxStorageSize: 500,
      preferredCategories: [],
      autoDownloadNew: false,
      backgroundDownload: true,
      notifyOnComplete: true
    });
  }

  async searchSessions(query: string, filters?: {
    category?: string;
    difficulty?: string;
    duration?: number;
    technique?: string;
  }): Promise<SessionLibrary[]> {
    const library = await this.getSessionLibrary();
    
    return library.filter(session => {
      // Text search
      const matchesQuery = !query || 
        session.title.toLowerCase().includes(query.toLowerCase()) ||
        session.description.toLowerCase().includes(query.toLowerCase()) ||
        session.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));

      // Filters
      const matchesCategory = !filters?.category || session.category === filters.category;
      const matchesDifficulty = !filters?.difficulty || session.difficulty === filters.difficulty;
      const matchesDuration = !filters?.duration || 
        Math.abs(session.duration - filters.duration) <= 2; // Within 2 minutes
      const matchesTechnique = !filters?.technique || session.technique === filters.technique;

      return matchesQuery && matchesCategory && matchesDifficulty && matchesDuration && matchesTechnique;
    });
  }
}

export const sessionDownloadService = SessionDownloadService.getInstance();