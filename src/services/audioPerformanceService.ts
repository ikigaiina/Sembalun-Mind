/**
 * Audio Performance Service
 * Handles audio preloading, caching, and performance optimization
 */

import React from 'react';

export interface AudioCacheEntry {
  url: string;
  audio: HTMLAudioElement;
  loadTime: number;
  lastAccessed: number;
  size: number;
  compressionRatio: number;
}

export interface AudioPerformanceConfig {
  maxCacheSize: number; // in bytes
  maxCacheEntries: number;
  preloadStrategy: 'eager' | 'lazy' | 'intersection';
  compressionLevel: 'high' | 'medium' | 'low';
  bufferSize: number; // in seconds
}

class AudioPerformanceService {
  private cache: Map<string, AudioCacheEntry> = new Map();
  private preloadPromises: Map<string, Promise<void>> = new Map();
  private intersectionObserver: IntersectionObserver | null = null;
  private config: AudioPerformanceConfig;
  private totalCacheSize: number = 0;
  
  constructor(config: Partial<AudioPerformanceConfig> = {}) {
    this.config = {
      maxCacheSize: 50 * 1024 * 1024, // 50MB
      maxCacheEntries: 100,
      preloadStrategy: 'intersection',
      compressionLevel: 'medium',
      bufferSize: 10,
      ...config
    };
    
    this.initializeIntersectionObserver();
    this.setupPerformanceMonitoring();
  }

  private initializeIntersectionObserver() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const audioUrl = entry.target.getAttribute('data-audio-preload');
              if (audioUrl) {
                this.preloadAudio(audioUrl);
              }
            }
          });
        },
        {
          rootMargin: '200px', // Preload when 200px before entering viewport
          threshold: 0.1
        }
      );
    }
  }

  private setupPerformanceMonitoring() {
    // Monitor memory usage every 30 seconds
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.cleanupCache();
        this.reportCacheMetrics();
      }, 30000);
    }
  }

  public async preloadAudio(url: string, priority: 'high' | 'normal' | 'low' = 'normal'): Promise<void> {
    // Check if already cached
    if (this.cache.has(url)) {
      this.updateLastAccessed(url);
      return Promise.resolve();
    }

    // Check if already preloading
    if (this.preloadPromises.has(url)) {
      return this.preloadPromises.get(url)!;
    }

    const startTime = performance.now();
    const promise = this.loadAudioFile(url, startTime, priority);
    this.preloadPromises.set(url, promise);

    try {
      await promise;
    } finally {
      this.preloadPromises.delete(url);
    }
  }

  private async loadAudioFile(url: string, startTime: number, priority: 'high' | 'normal' | 'low'): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      let resolved = false;

      const cleanup = () => {
        audio.removeEventListener('canplaythrough', onCanPlayThrough);
        audio.removeEventListener('error', onError);
        audio.removeEventListener('loadeddata', onLoadedData);
      };

      const onCanPlayThrough = () => {
        if (resolved) return;
        resolved = true;
        cleanup();

        const loadTime = performance.now() - startTime;
        const estimatedSize = this.estimateAudioSize(audio);
        
        const cacheEntry: AudioCacheEntry = {
          url,
          audio,
          loadTime,
          lastAccessed: Date.now(),
          size: estimatedSize,
          compressionRatio: this.calculateCompressionRatio(audio)
        };

        this.addToCache(cacheEntry);
        resolve();
      };

      const onLoadedData = () => {
        // Basic loading complete, can start playback but may buffer
        if (priority === 'high' && !resolved) {
          onCanPlayThrough();
        }
      };

      const onError = (error: any) => {
        if (resolved) return;
        resolved = true;
        cleanup();
        console.warn(`Failed to preload audio: ${url}`, error);
        reject(new Error(`Audio load failed: ${url}`));
      };

      // Set up event listeners
      audio.addEventListener('canplaythrough', onCanPlayThrough);
      audio.addEventListener('loadeddata', onLoadedData);
      audio.addEventListener('error', onError);

      // Configure audio for optimal loading
      audio.preload = priority === 'high' ? 'auto' : 'metadata';
      audio.crossOrigin = 'anonymous';
      
      // Set source and start loading
      audio.src = url;
    });
  }

  private estimateAudioSize(audio: HTMLAudioElement): number {
    // Rough estimation based on duration and quality
    const duration = audio.duration || 0;
    const bitrate = 128000; // Assume 128kbps for estimation
    return Math.floor((duration * bitrate) / 8);
  }

  private calculateCompressionRatio(audio: HTMLAudioElement): number {
    // Estimate compression ratio based on format and quality
    const src = audio.src.toLowerCase();
    if (src.includes('.mp3')) return 0.1; // MP3 is ~10% of original
    if (src.includes('.ogg')) return 0.15; // OGG is ~15% of original
    if (src.includes('.wav')) return 1.0; // WAV is uncompressed
    return 0.12; // Default assumption
  }

  private addToCache(entry: AudioCacheEntry) {
    // Check cache limits before adding
    if (this.cache.size >= this.config.maxCacheEntries) {
      this.evictLeastRecentlyUsed();
    }

    if (this.totalCacheSize + entry.size > this.config.maxCacheSize) {
      this.evictBySize(entry.size);
    }

    this.cache.set(entry.url, entry);
    this.totalCacheSize += entry.size;
  }

  private evictLeastRecentlyUsed() {
    let oldestEntry: [string, AudioCacheEntry] | null = null;
    
    for (const [url, entry] of this.cache.entries()) {
      if (!oldestEntry || entry.lastAccessed < oldestEntry[1].lastAccessed) {
        oldestEntry = [url, entry];
      }
    }

    if (oldestEntry) {
      this.removeFromCache(oldestEntry[0]);
    }
  }

  private evictBySize(requiredSize: number) {
    const entries = Array.from(this.cache.entries()).sort(
      (a, b) => a[1].lastAccessed - b[1].lastAccessed
    );

    let freedSize = 0;
    for (const [url, entry] of entries) {
      this.removeFromCache(url);
      freedSize += entry.size;
      
      if (freedSize >= requiredSize) {
        break;
      }
    }
  }

  private removeFromCache(url: string) {
    const entry = this.cache.get(url);
    if (entry) {
      this.totalCacheSize -= entry.size;
      this.cache.delete(url);
      
      // Clean up audio element
      entry.audio.src = '';
      entry.audio.remove();
    }
  }

  private updateLastAccessed(url: string) {
    const entry = this.cache.get(url);
    if (entry) {
      entry.lastAccessed = Date.now();
    }
  }

  private cleanupCache() {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes

    for (const [url, entry] of this.cache.entries()) {
      if (now - entry.lastAccessed > maxAge) {
        this.removeFromCache(url);
      }
    }
  }

  private reportCacheMetrics() {
    const metrics = this.getCacheMetrics();
    console.log('Audio Cache Metrics:', metrics);
    
    // In production, send to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'audio_cache_metrics', {
        cache_size: metrics.totalSize,
        cache_entries: metrics.entryCount,
        hit_rate: metrics.hitRate,
        average_load_time: metrics.averageLoadTime
      });
    }
  }

  public getCachedAudio(url: string): HTMLAudioElement | null {
    const entry = this.cache.get(url);
    if (entry) {
      this.updateLastAccessed(url);
      return entry.audio.cloneNode() as HTMLAudioElement;
    }
    return null;
  }

  public getCacheMetrics() {
    const entries = Array.from(this.cache.values());
    const totalLoadTime = entries.reduce((sum, entry) => sum + entry.loadTime, 0);
    
    return {
      entryCount: this.cache.size,
      totalSize: this.totalCacheSize,
      averageLoadTime: entries.length > 0 ? totalLoadTime / entries.length : 0,
      hitRate: this.calculateHitRate(),
      compressionRatio: this.calculateAverageCompression(),
      oldestEntry: Math.min(...entries.map(e => e.lastAccessed)),
      newestEntry: Math.max(...entries.map(e => e.lastAccessed))
    };
  }

  private calculateHitRate(): number {
    // This would be tracked over time in a real implementation
    // For now, return a placeholder based on cache size
    return Math.min(0.9, this.cache.size / this.config.maxCacheEntries);
  }

  private calculateAverageCompression(): number {
    const entries = Array.from(this.cache.values());
    if (entries.length === 0) return 0;
    
    const totalCompression = entries.reduce((sum, entry) => sum + entry.compressionRatio, 0);
    return totalCompression / entries.length;
  }

  public observeElement(element: Element, audioUrl: string) {
    if (this.intersectionObserver && this.config.preloadStrategy === 'intersection') {
      element.setAttribute('data-audio-preload', audioUrl);
      this.intersectionObserver.observe(element);
    }
  }

  public unobserveElement(element: Element) {
    if (this.intersectionObserver) {
      this.intersectionObserver.unobserve(element);
    }
  }

  public preloadAudioArray(urls: string[], strategy: 'sequential' | 'parallel' = 'parallel'): Promise<void[]> {
    if (strategy === 'parallel') {
      return Promise.allSettled(urls.map(url => this.preloadAudio(url)))
        .then(results => results.map((result, index) => {
          if (result.status === 'rejected') {
            console.warn(`Failed to preload audio ${urls[index]}:`, result.reason);
          }
        }));
    } else {
      return urls.reduce(async (previousPromise, url) => {
        await previousPromise;
        return this.preloadAudio(url);
      }, Promise.resolve()) as Promise<any>;
    }
  }

  public optimizeForMobile() {
    // Reduce cache size and preload less aggressively on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      this.config.maxCacheSize = Math.floor(this.config.maxCacheSize * 0.5);
      this.config.maxCacheEntries = Math.floor(this.config.maxCacheEntries * 0.7);
      this.config.preloadStrategy = 'lazy';
    }
  }

  public clearCache() {
    for (const url of this.cache.keys()) {
      this.removeFromCache(url);
    }
    this.totalCacheSize = 0;
  }

  public destroy() {
    this.clearCache();
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }
}

// Singleton instance
let audioPerformanceServiceInstance: AudioPerformanceService | null = null;

export const getAudioPerformanceService = (config?: Partial<AudioPerformanceConfig>): AudioPerformanceService => {
  if (!audioPerformanceServiceInstance) {
    audioPerformanceServiceInstance = new AudioPerformanceService(config);
  }
  return audioPerformanceServiceInstance;
};

// React hook for audio performance
export function useAudioPerformance(audioUrls: string[] = []) {
  const service = getAudioPerformanceService();
  
  React.useEffect(() => {
    if (audioUrls.length > 0) {
      service.preloadAudioArray(audioUrls, 'parallel');
    }
  }, [audioUrls, service]);

  const getCachedAudio = React.useCallback((url: string) => {
    return service.getCachedAudio(url);
  }, [service]);

  const preloadAudio = React.useCallback((url: string, priority: 'high' | 'normal' | 'low' = 'normal') => {
    return service.preloadAudio(url, priority);
  }, [service]);

  const observeElement = React.useCallback((element: Element, audioUrl: string) => {
    service.observeElement(element, audioUrl);
  }, [service]);

  return {
    getCachedAudio,
    preloadAudio,
    observeElement,
    cacheMetrics: service.getCacheMetrics()
  };
}

export default AudioPerformanceService;