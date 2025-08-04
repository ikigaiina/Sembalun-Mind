import type { AudioFile } from '../types/content';

interface AudioStreamOptions {
  quality: 'low' | 'medium' | 'high';
  adaptive: boolean;
  preloadBufferSize: number; // MB
}

interface AudioCache {
  audio: HTMLAudioElement;
  lastAccessed: Date;
  size: number;
  isStreaming: boolean;
}

export class AudioService {
  private cache: Map<string, AudioCache> = new Map();
  private downloadQueue: Set<string> = new Set();
  private streamingOptions: AudioStreamOptions = {
    quality: 'medium',
    adaptive: true,
    preloadBufferSize: 2
  };
  private maxCacheSize: number = 100 * 1024 * 1024; // 100MB

  /**
   * Load and cache audio file with enhanced caching
   */
  async loadAudio(audioFile: AudioFile): Promise<HTMLAudioElement> {
    if (this.cache.has(audioFile.id)) {
      const cached = this.cache.get(audioFile.id)!;
      cached.lastAccessed = new Date();
      return cached.audio;
    }

    return new Promise((resolve, reject) => {
      const audio = new Audio();
      
      audio.addEventListener('canplaythrough', () => {
        this.manageCacheSize();
        this.cache.set(audioFile.id, {
          audio,
          lastAccessed: new Date(),
          size: audioFile.fileSize,
          isStreaming: false
        });
        resolve(audio);
      });

      audio.addEventListener('error', () => {
        reject(new Error(`Failed to load audio: ${audioFile.title}`));
      });

      audio.src = this.getOptimalAudioUrl(audioFile);
      audio.preload = 'metadata';
    });
  }

  /**
   * Get optimal audio URL based on device capabilities and settings
   */
  private getOptimalAudioUrl(audioFile: AudioFile): string {
    // For now, return the original URL
    // In production, you might have multiple quality versions
    return audioFile.url;
  }

  /**
   * Manage cache size by removing least recently used items
   */
  private manageCacheSize(): void {
    const currentSize = Array.from(this.cache.values())
      .reduce((total, item) => total + item.size, 0);

    if (currentSize > this.maxCacheSize) {
      const sortedEntries = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.lastAccessed.getTime() - b.lastAccessed.getTime());

      // Remove oldest 25% of cache
      const removeCount = Math.floor(sortedEntries.length * 0.25);
      for (let i = 0; i < removeCount; i++) {
        const [id, item] = sortedEntries[i];
        item.audio.pause();
        item.audio.src = '';
        this.cache.delete(id);
      }
    }
  }

  /**
   * Stream audio with progressive loading and adaptive quality
   */
  async streamAudio(audioFile: AudioFile): Promise<HTMLAudioElement> {
    const audio = new Audio();
    audio.src = this.getStreamingUrl(audioFile);
    audio.preload = 'none';
    
    // Enable crossorigin for CORS handling
    audio.crossOrigin = 'anonymous';
    
    // Setup progressive loading
    this.setupProgressiveLoading(audio);
    
    // Enable streaming
    audio.load();
    
    this.manageCacheSize();
    this.cache.set(audioFile.id, {
      audio,
      lastAccessed: new Date(),
      size: audioFile.fileSize,
      isStreaming: true
    });
    
    return audio;
  }

  /**
   * Get streaming URL with quality parameters
   */
  private getStreamingUrl(audioFile: AudioFile): string {
    const baseUrl = audioFile.url;
    const quality = this.determineOptimalQuality();
    
    // Add quality parameters if supported by backend
    if (baseUrl.includes('?')) {
      return `${baseUrl}&quality=${quality}&streaming=true`;
    } else {
      return `${baseUrl}?quality=${quality}&streaming=true`;
    }
  }

  /**
   * Determine optimal quality based on network and device
   */
  private determineOptimalQuality(): string {
    const connection = (navigator as Navigator & { connection?: { effectiveType: string; downlink: number; rtt: number } }).connection;
    if (!connection) {
      return this.streamingOptions.quality;
    }

    const effectiveType = connection.effectiveType;

    if (effectiveType === '4g' || effectiveType === '5g') {
      return 'high';
    } else if (effectiveType === '3g') {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Setup progressive loading for streaming
   */
  private setupProgressiveLoading(audio: HTMLAudioElement): void {
    let hasEnoughBuffer = false;

    audio.addEventListener('progress', () => {
      if (audio.buffered.length > 0) {
        const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
        const currentTime = audio.currentTime;
        const bufferAhead = bufferedEnd - currentTime;

        // Ensure we have enough buffer (configurable)
        hasEnoughBuffer = bufferAhead > this.streamingOptions.preloadBufferSize * 1024 * 1024 / (128 * 1024); // rough estimate
      }
    });

    audio.addEventListener('waiting', () => {
      if (!hasEnoughBuffer) {
        // Could implement buffer recovery strategies here
        console.log('Audio buffering...');
      }
    });
  }

  /**
   * Download audio for offline use
   */
  async downloadAudio(audioFile: AudioFile): Promise<void> {
    if (this.downloadQueue.has(audioFile.id)) {
      return;
    }

    this.downloadQueue.add(audioFile.id);

    try {
      const response = await fetch(audioFile.url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      
      // Store in cache
      const audio = new Audio(audioUrl);
      await new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve);
        audio.addEventListener('error', reject);
      });

      this.cache.set(audioFile.id, {
        audio,
        lastAccessed: new Date(),
        size: audioFile.fileSize,
        isStreaming: false
      });
      
      // Store in local storage metadata
      this.markAsDownloaded(audioFile.id);
      
    } catch (error) {
      console.error(`Failed to download audio ${audioFile.id}:`, error);
      throw error;
    } finally {
      this.downloadQueue.delete(audioFile.id);
    }
  }

  /**
   * Check if audio is available offline
   */
  isDownloaded(audioId: string): boolean {
    const downloaded = localStorage.getItem('downloadedAudio');
    if (!downloaded) return false;
    
    const downloadedList = JSON.parse(downloaded);
    return downloadedList.includes(audioId);
  }

  /**
   * Mark audio as downloaded
   */
  private markAsDownloaded(audioId: string): void {
    const downloaded = localStorage.getItem('downloadedAudio');
    const downloadedList = downloaded ? JSON.parse(downloaded) : [];
    
    if (!downloadedList.includes(audioId)) {
      downloadedList.push(audioId);
      localStorage.setItem('downloadedAudio', JSON.stringify(downloadedList));
    }
  }

  /**
   * Get cached audio
   */
  getCachedAudio(audioId: string): HTMLAudioElement | null {
    const cached = this.cache.get(audioId);
    if (cached) {
      cached.lastAccessed = new Date();
      return cached.audio;
    }
    return null;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.forEach(cached => {
      cached.audio.pause();
      cached.audio.src = '';
    });
    this.cache.clear();
  }

  /**
   * Get cache size info
   */
  getCacheInfo(): { 
    count: number; 
    totalSize: number; 
    streamingCount: number;
    oldestAccess: Date | null;
    newestAccess: Date | null;
  } {
    const values = Array.from(this.cache.values());
    const totalSize = values.reduce((sum, item) => sum + item.size, 0);
    const streamingCount = values.filter(item => item.isStreaming).length;
    const accessTimes = values.map(item => item.lastAccessed);
    
    return {
      count: this.cache.size,
      totalSize,
      streamingCount,
      oldestAccess: accessTimes.length > 0 ? new Date(Math.min(...accessTimes.map(d => d.getTime()))) : null,
      newestAccess: accessTimes.length > 0 ? new Date(Math.max(...accessTimes.map(d => d.getTime()))) : null
    };
  }

  /**
   * Set streaming options
   */
  setStreamingOptions(options: Partial<AudioStreamOptions>): void {
    this.streamingOptions = { ...this.streamingOptions, ...options };
  }

  /**
   * Get streaming options
   */
  getStreamingOptions(): AudioStreamOptions {
    return { ...this.streamingOptions };
  }

  /**
   * Set max cache size
   */
  setMaxCacheSize(sizeInMB: number): void {
    this.maxCacheSize = sizeInMB * 1024 * 1024;
    this.manageCacheSize(); // Clean up if necessary
  }

  /**
   * Get network status and quality recommendation
   */
  getNetworkStatus(): {
    effectiveType: string;
    downlink: number;
    rtt: number;
    recommendedQuality: string;
  } {
    const connection = (navigator as Navigator & { connection?: { effectiveType: string; downlink: number; rtt: number } }).connection;
    if (!connection) {
      return {
        effectiveType: 'unknown',
        downlink: 0,
        rtt: 0,
        recommendedQuality: 'medium'
      };
    }

    return {
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || 0,
      rtt: connection.rtt || 0,
      recommendedQuality: this.determineOptimalQuality()
    };
  }

  /**
   * Preload essential audio files
   */
  async preloadEssentials(audioFiles: AudioFile[]): Promise<void> {
    const essentials = audioFiles.slice(0, 5); // Load first 5
    const promises = essentials.map(audio => this.loadAudio(audio));
    
    try {
      await Promise.allSettled(promises);
    } catch (error) {
      console.warn('Some audio files failed to preload:', error);
    }
  }
}

export class AudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private audioService: AudioService;
  
  public onTimeUpdate?: (currentTime: number, duration: number) => void;
  public onEnded?: () => void;
  public onError?: (error: string) => void;
  public onLoadStart?: () => void;
  public onCanPlay?: () => void;

  constructor(audioService: AudioService) {
    this.audioService = audioService;
  }

  /**
   * Load and prepare audio file
   */
  async load(audioFile: AudioFile): Promise<void> {
    try {
      this.onLoadStart?.();
      
      // Try to get from cache first
      let audio = this.audioService.getCachedAudio(audioFile.id);
      
      if (!audio) {
        // Check if downloaded for offline use
        if (this.audioService.isDownloaded(audioFile.id)) {
          audio = await this.audioService.loadAudio(audioFile);
        } else {
          audio = await this.audioService.streamAudio(audioFile);
        }
      }

      // Clean up previous audio
      if (this.audio) {
        this.cleanup();
      }

      this.audio = audio;
      this.setupEventListeners();
      
      this.onCanPlay?.();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.onError?.(errorMessage);
    }
  }

  /**
   * Play audio
   */
  async play(): Promise<void> {
    if (!this.audio) {
      throw new Error('No audio loaded');
    }

    try {
      await this.audio.play();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to play';
      this.onError?.(errorMessage);
    }
  }

  /**
   * Pause audio
   */
  pause(): void {
    if (this.audio) {
      this.audio.pause();
    }
  }

  /**
   * Stop audio and reset position
   */
  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
  }

  /**
   * Seek to specific time
   */
  seek(timeInSeconds: number): void {
    if (this.audio) {
      this.audio.currentTime = Math.max(0, Math.min(timeInSeconds, this.audio.duration || 0));
    }
  }

  /**
   * Set playback speed
   */
  setPlaybackRate(rate: number): void {
    if (this.audio) {
      this.audio.playbackRate = Math.max(0.25, Math.min(2.0, rate));
    }
  }

  /**
   * Set volume
   */
  setVolume(volume: number): void {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Get current state
   */
  getState(): {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    playbackRate: number;
  } {
    if (!this.audio) {
      return {
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 1,
        playbackRate: 1
      };
    }

    return {
      isPlaying: !this.audio.paused,
      currentTime: this.audio.currentTime,
      duration: this.audio.duration || 0,
      volume: this.audio.volume,
      playbackRate: this.audio.playbackRate
    };
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    if (!this.audio) return;

    this.audio.addEventListener('timeupdate', () => {
      if (this.audio) {
        this.onTimeUpdate?.(this.audio.currentTime, this.audio.duration || 0);
      }
    });

    this.audio.addEventListener('ended', () => {
      this.onEnded?.();
    });

    this.audio.addEventListener('error', () => {
      this.onError?.('Audio playback error');
    });
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.removeEventListener('timeupdate', () => {});
      this.audio.removeEventListener('ended', () => {});
      this.audio.removeEventListener('error', () => {});
    }
  }

  /**
   * Destroy player and cleanup
   */
  destroy(): void {
    this.cleanup();
    this.audio = null;
  }
}

// Singleton instance
export const audioService = new AudioService();