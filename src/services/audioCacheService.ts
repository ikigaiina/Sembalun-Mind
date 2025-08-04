import { offlineStorageService, type OfflineAudioCache } from './offlineStorageService';

export interface AudioQuality {
  bitrate: number;
  format: 'mp3' | 'ogg' | 'webm';
  size: number;
}

export interface CompressionOptions {
  quality: 'low' | 'medium' | 'high';
  maxBitrate: number;
  adaptiveStreaming: boolean;
}

export interface AudioCacheStats {
  totalSize: number;
  itemCount: number;
  oldestCache: Date | null;
  newestCache: Date | null;
  cacheHitRate: number;
  compressionRatio: number;
}

export interface AudioStreamingConfig {
  chunkSize: number;
  preloadTime: number;
  adaptiveQuality: boolean;
  bufferSize: number;
  qualityTiers: AudioQuality[];
}

export interface AudioPreloadStrategy {
  strategy: 'eager' | 'lazy' | 'predictive' | 'contextual';
  priority: 'high' | 'medium' | 'low';
  conditions: {
    wifiOnly: boolean;
    batteryLevel: number;
    timeOfDay: string[];
    userBehavior: string[];
  };
}

export class AudioCacheService {
  private static instance: AudioCacheService;
  private audioContext: AudioContext | null = null;
  private compressionWorker: Worker | null = null;
  private cacheHits = 0;
  private cacheMisses = 0;
  private preloadQueue: Map<string, AudioPreloadStrategy> = new Map();

  static getInstance(): AudioCacheService {
    if (!AudioCacheService.instance) {
      AudioCacheService.instance = new AudioCacheService();
    }
    return AudioCacheService.instance;
  }

  constructor() {
    this.initializeAudioContext();
    this.initializeCompressionWorker();
  }

  private initializeAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('AudioContext not supported:', error);
    }
  }

  private initializeCompressionWorker(): void {
    if (typeof Worker !== 'undefined') {
      try {
        const workerCode = `
          self.onmessage = function(e) {
            const { audioData, compressionLevel } = e.data;
            
            // Simulate audio compression (simplified)
            const compressionRatio = Math.max(0.1, 1 - (compressionLevel * 0.3));
            const compressedSize = Math.floor(audioData.byteLength * compressionRatio);
            
            // Create compressed version (placeholder - would use actual compression)
            const compressedData = new ArrayBuffer(compressedSize);
            const view = new Uint8Array(compressedData);
            const originalView = new Uint8Array(audioData);
            
            // Simple downsampling simulation
            for (let i = 0; i < compressedSize; i++) {
              const sourceIndex = Math.floor(i / compressionRatio);
              view[i] = originalView[Math.min(sourceIndex, originalView.length - 1)];
            }
            
            self.postMessage({
              compressedData,
              originalSize: audioData.byteLength,
              compressedSize,
              compressionRatio: compressionRatio
            });
          };
        `;
        
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        this.compressionWorker = new Worker(URL.createObjectURL(blob));
      } catch (error) {
        console.warn('Worker not supported:', error);
      }
    }
  }

  async cacheAudioWithCompression(
    sessionId: string,
    audioUrl: string,
    audioData: ArrayBuffer,
    options: CompressionOptions = {
      quality: 'medium',
      maxBitrate: 128,
      adaptiveStreaming: false
    }
  ): Promise<string> {
    try {
      const compressionLevel = this.getCompressionLevel(options.quality);
      const compressedData = await this.compressAudio(audioData, compressionLevel);

      const audioCache: OfflineAudioCache = {
        id: `audio-cache-${sessionId}-${Date.now()}`,
        sessionId,
        audioUrl,
        audioData: compressedData.data,
        mimeType: this.detectMimeType(audioUrl),
        size: compressedData.data.byteLength,
        downloadedAt: new Date(),
        lastAccessed: new Date(),
        compressionLevel,
        expiresAt: this.calculateExpirationDate(options.quality)
      };

      await offlineStorageService.cacheAudio(audioCache);
      
      console.log(`Audio cached with ${compressionLevel * 100}% compression ratio:`, {
        originalSize: audioData.byteLength,
        compressedSize: compressedData.data.byteLength,
        savingsBytes: audioData.byteLength - compressedData.data.byteLength,
        compressionRatio: compressedData.ratio
      });

      return audioCache.id;
    } catch (error) {
      console.error('Error caching audio with compression:', error);
      throw error;
    }
  }

  async getCachedAudio(sessionId: string): Promise<ArrayBuffer | null> {
    try {
      const cachedAudio = await offlineStorageService.getCachedAudio(sessionId);
      
      if (cachedAudio) {
        this.cacheHits++;
        
        // Check if expired
        if (cachedAudio.expiresAt && new Date() > cachedAudio.expiresAt) {
          await this.removeCachedAudio(sessionId);
          this.cacheMisses++;
          return null;
        }

        return cachedAudio.audioData;
      }

      this.cacheMisses++;
      return null;
    } catch (e) {
      console.error('Error getting cached audio:', e);
      this.cacheMisses++;
      return null;
    }
  }

  async createAudioBlob(audioData: ArrayBuffer, mimeType: string = 'audio/mpeg'): Promise<Blob> {
    return new Blob([audioData], { type: mimeType });
  }

  async createAudioUrl(audioData: ArrayBuffer, mimeType: string = 'audio/mpeg'): Promise<string> {
    const blob = await this.createAudioBlob(audioData, mimeType);
    return URL.createObjectURL(blob);
  }

  async preloadAudioForSession(
    sessionId: string, 
    strategy: AudioPreloadStrategy = {
      strategy: 'contextual',
      priority: 'medium',
      conditions: {
        wifiOnly: true,
        batteryLevel: 30,
        timeOfDay: ['morning', 'evening'],
        userBehavior: ['regular_user']
      }
    }
  ): Promise<void> {
    try {
      // Check if already cached
      const cached = await this.getCachedAudio(sessionId);
      if (cached) return;

      // Check preload conditions
      if (!await this.shouldPreload(strategy)) {
        this.preloadQueue.set(sessionId, strategy);
        return;
      }

      // Add to preload queue with priority
      this.preloadQueue.set(sessionId, strategy);
      
      // Process queue based on priority
      await this.processPreloadQueue();
    } catch (error) {
      console.error('Error preloading audio:', error);
    }
  }

  private async shouldPreload(strategy: AudioPreloadStrategy): Promise<boolean> {
    const conditions = strategy.conditions;

    // Check WiFi requirement
    if (conditions.wifiOnly && !await this.isWifiConnected()) {
      return false;
    }

    // Check battery level
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery?.();
        if (battery.level * 100 < conditions.batteryLevel) {
          return false;
        }
      } catch (error) {
        // Battery API not supported, continue
      }
    }

    // Check time of day
    const currentHour = new Date().getHours();
    const timeOfDay = this.getTimeOfDay(currentHour);
    if (conditions.timeOfDay.length > 0 && !conditions.timeOfDay.includes(timeOfDay)) {
      return false;
    }

    return true;
  }

  private async processPreloadQueue(): Promise<void> {
    const sortedQueue = Array.from(this.preloadQueue.entries())
      .sort(([, a], [, b]) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

    for (const [sessionId, strategy] of sortedQueue.slice(0, 3)) { // Process top 3
      try {
        // Mock preload - would actually fetch and cache audio
        console.log(`Preloading audio for session ${sessionId} with ${strategy.strategy} strategy`);
        this.preloadQueue.delete(sessionId);
      } catch (error) {
        console.error(`Error preloading session ${sessionId}:`, error);
      }
    }
  }

  async getCacheStats(): Promise<AudioCacheStats> {
    try {
      const cacheSize = await offlineStorageService.getAudioCacheSize();
      const usage = await offlineStorageService.getStorageUsage();
      
      const hitRate = this.cacheHits + this.cacheMisses > 0 
        ? this.cacheHits / (this.cacheHits + this.cacheMisses) 
        : 0;

      // Mock compression ratio calculation
      const compressionRatio = 0.7; // Would calculate actual ratio

      return {
        totalSize: cacheSize,
        itemCount: usage.audioCache,
        oldestCache: null, // Would query actual data
        newestCache: new Date(),
        cacheHitRate: hitRate,
        compressionRatio
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        totalSize: 0,
        itemCount: 0,
        oldestCache: null,
        newestCache: null,
        cacheHitRate: 0,
        compressionRatio: 0
      };
    }
  }

  async optimizeCache(): Promise<void> {
    try {
      // Remove expired items
      await this.cleanupExpiredCache();
      
      // Enforce size limits
      await this.enforceCacheSizeLimit();
      
      // Optimize frequently accessed items
      await this.optimizeFrequentlyAccessed();
      
      console.log('Audio cache optimization completed');
    } catch (error) {
      console.error('Error optimizing cache:', error);
    }
  }

  async removeCachedAudio(sessionId: string): Promise<void> {
    try {
      await offlineStorageService.deleteCachedAudio(sessionId);
    } catch (error) {
      console.error('Error removing cached audio:', error);
      throw error;
    }
  }

  async clearExpiredCache(): Promise<void> {
    try {
      await this.cleanupExpiredCache();
      console.log('Expired cache cleared');
    } catch (error) {
      console.error('Error clearing expired cache:', error);
      throw error;
    }
  }

  async prefetchRecommendedSessions(userId: string): Promise<void> {
    try {
      // Mock implementation - would integrate with recommendation service
      const recommendedSessions = ['session-1', 'session-2', 'session-3'];
      
      for (const sessionId of recommendedSessions) {
        await this.preloadAudioForSession(sessionId, {
          strategy: 'predictive',
          priority: 'low',
          conditions: {
            wifiOnly: true,
            batteryLevel: 50,
            timeOfDay: [],
            userBehavior: ['predictive_user']
          }
        });
      }
    } catch (error) {
      console.error('Error prefetching recommended sessions:', error);
    }
  }

  async getOptimalQualityForNetwork(): Promise<AudioQuality> {
    try {
      const connection = (navigator as any).connection || this.getNetworkConnection();
      
      if (connection.effectiveType === '4g' || connection.type === 'wifi') {
        return { bitrate: 320, format: 'mp3', size: 15 * 1024 * 1024 };
      } else if (connection.effectiveType === '3g') {
        return { bitrate: 128, format: 'mp3', size: 8 * 1024 * 1024 };
      } else {
        return { bitrate: 64, format: 'ogg', size: 4 * 1024 * 1024 };
      }
    } catch (error) {
      console.error('Error determining optimal quality:', error);
      return { bitrate: 128, format: 'mp3', size: 8 * 1024 * 1024 };
    }
  }

  private async compressAudio(audioData: ArrayBuffer, compressionLevel: number): Promise<{ data: ArrayBuffer; ratio: number }> {
    return new Promise((resolve, reject) => {
      if (this.compressionWorker) {
        this.compressionWorker.onmessage = (e) => {
          const { compressedData, compressionRatio } = e.data;
          resolve({ data: compressedData, ratio: compressionRatio });
        };
        
        this.compressionWorker.onerror = reject;
        this.compressionWorker.postMessage({ audioData, compressionLevel });
      } else {
        // Fallback: simple size reduction simulation
        const ratio = Math.max(0.1, 1 - (compressionLevel * 0.3));
        const compressedSize = Math.floor(audioData.byteLength * ratio);
        const compressedData = audioData.slice(0, compressedSize);
        resolve({ data: compressedData, ratio });
      }
    });
  }

  private getCompressionLevel(quality: string): number {
    switch (quality) {
      case 'high': return 0.2; // 20% compression
      case 'medium': return 0.5; // 50% compression
      case 'low': return 0.8; // 80% compression
      default: return 0.5;
    }
  }

  private detectMimeType(audioUrl: string): string {
    const extension = audioUrl.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'mp3': return 'audio/mpeg';
      case 'ogg': return 'audio/ogg';
      case 'webm': return 'audio/webm';
      case 'wav': return 'audio/wav';
      default: return 'audio/mpeg';
    }
  }

  private calculateExpirationDate(quality: string): Date {
    const expiration = new Date();
    switch (quality) {
      case 'high':
        expiration.setDate(expiration.getDate() + 30); // 30 days
        break;
      case 'medium':
        expiration.setDate(expiration.getDate() + 14); // 14 days
        break;
      case 'low':
        expiration.setDate(expiration.getDate() + 7); // 7 days
        break;
      default:
        expiration.setDate(expiration.getDate() + 14);
    }
    return expiration;
  }

  private async cleanupExpiredCache(): Promise<void> {
    // Mock implementation - would query and remove expired items
    console.log('Cleaning up expired cache items');
  }

  private async enforceCacheSizeLimit(): Promise<void> {
    // Mock implementation - would enforce size limits
    console.log('Enforcing cache size limits');
  }

  private async optimizeFrequentlyAccessed(): Promise<void> {
    // Mock implementation - would optimize frequently accessed items
    console.log('Optimizing frequently accessed items');
  }

  private async isWifiConnected(): Promise<boolean> {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection || navigator.connection;
      return connection.type === 'wifi';
    }
    return navigator.onLine;
  }

  private getTimeOfDay(hour: number): string {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  private getNetworkConnection(): any {
    if ('connection' in navigator) {
      return (navigator as any).connection;
    }
    return { effectiveType: '4g', type: 'unknown' };
  }
}

export const audioCacheService = AudioCacheService.getInstance();