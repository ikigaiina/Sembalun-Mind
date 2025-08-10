/**
 * Content caching and performance optimization utilities
 * For enhanced content loading and user experience
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiryTime: number;
}

interface CacheMetrics {
  hits: number;
  misses: number;
  totalRequests: number;
}

class ContentCache {
  private cache: Map<string, CacheItem<any>> = new Map();
  private metrics: CacheMetrics = { hits: 0, misses: 0, totalRequests: 0 };
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 100;

  constructor() {
    // Start cleanup interval
    setInterval(() => this.cleanup(), 60 * 1000); // Cleanup every minute
  }

  /**
   * Get item from cache
   */
  get<T>(key: string): T | null {
    this.metrics.totalRequests++;
    
    const item = this.cache.get(key);
    if (!item) {
      this.metrics.misses++;
      return null;
    }

    if (Date.now() > item.expiryTime) {
      this.cache.delete(key);
      this.metrics.misses++;
      return null;
    }

    this.metrics.hits++;
    return item.data;
  }

  /**
   * Set item in cache
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    // If cache is at max size, remove oldest items
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldest();
    }

    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiryTime: Date.now() + ttl
    };

    this.cache.set(key, item);
  }

  /**
   * Clear specific cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache metrics
   */
  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  /**
   * Get cache hit rate
   */
  getHitRate(): number {
    if (this.metrics.totalRequests === 0) return 0;
    return this.metrics.hits / this.metrics.totalRequests;
  }

  /**
   * Remove expired items
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiryTime) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Evict oldest items when cache is full
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}

// Singleton instance
export const contentCache = new ContentCache();

// Content-specific caching utilities
export class ContentCacheManager {
  private static readonly CACHE_KEYS = {
    MEDITATION_SESSIONS: 'meditation_sessions',
    COURSES: 'courses',
    AMBIENT_SOUNDS: 'ambient_sounds',
    INSTRUCTORS: 'instructors',
    COMMUNITY_POSTS: 'community_posts',
    USER_PROGRESS: 'user_progress'
  };

  /**
   * Cache meditation sessions
   */
  static cacheMeditationSessions(sessions: any[], ttl: number = 10 * 60 * 1000): void {
    contentCache.set(this.CACHE_KEYS.MEDITATION_SESSIONS, sessions, ttl);
  }

  /**
   * Get cached meditation sessions
   */
  static getCachedMeditationSessions(): any[] | null {
    return contentCache.get(this.CACHE_KEYS.MEDITATION_SESSIONS);
  }

  /**
   * Cache courses
   */
  static cacheCourses(courses: any[], ttl: number = 15 * 60 * 1000): void {
    contentCache.set(this.CACHE_KEYS.COURSES, courses, ttl);
  }

  /**
   * Get cached courses
   */
  static getCachedCourses(): any[] | null {
    return contentCache.get(this.CACHE_KEYS.COURSES);
  }

  /**
   * Cache ambient sounds
   */
  static cacheAmbientSounds(sounds: any[], ttl: number = 30 * 60 * 1000): void {
    contentCache.set(this.CACHE_KEYS.AMBIENT_SOUNDS, sounds, ttl);
  }

  /**
   * Get cached ambient sounds
   */
  static getCachedAmbientSounds(): any[] | null {
    return contentCache.get(this.CACHE_KEYS.AMBIENT_SOUNDS);
  }

  /**
   * Cache instructors
   */
  static cacheInstructors(instructors: any[], ttl: number = 60 * 60 * 1000): void {
    contentCache.set(this.CACHE_KEYS.INSTRUCTORS, instructors, ttl);
  }

  /**
   * Get cached instructors
   */
  static getCachedInstructors(): any[] | null {
    return contentCache.get(this.CACHE_KEYS.INSTRUCTORS);
  }

  /**
   * Cache community posts
   */
  static cacheCommunityPosts(posts: any[], ttl: number = 2 * 60 * 1000): void {
    contentCache.set(this.CACHE_KEYS.COMMUNITY_POSTS, posts, ttl);
  }

  /**
   * Get cached community posts
   */
  static getCachedCommunityPosts(): any[] | null {
    return contentCache.get(this.CACHE_KEYS.COMMUNITY_POSTS);
  }

  /**
   * Cache user progress
   */
  static cacheUserProgress(userId: string, progress: any, ttl: number = 5 * 60 * 1000): void {
    contentCache.set(`${this.CACHE_KEYS.USER_PROGRESS}_${userId}`, progress, ttl);
  }

  /**
   * Get cached user progress
   */
  static getCachedUserProgress(userId: string): any | null {
    return contentCache.get(`${this.CACHE_KEYS.USER_PROGRESS}_${userId}`);
  }

  /**
   * Preload content for better performance
   */
  static async preloadContent(): Promise<void> {
    console.log('🚀 Starting content preload...');
    
    try {
      // Preload critical content that's likely to be accessed
      // This would normally call your content service
      const promises = [
        this.preloadMeditationSessions(),
        this.preloadPopularCourses(),
        this.preloadAmbientSounds()
      ];

      await Promise.all(promises);
      console.log('✅ Content preload completed');
    } catch (error) {
      console.error('❌ Content preload failed:', error);
    }
  }

  private static async preloadMeditationSessions(): Promise<void> {
    // Mock implementation - replace with actual API calls
    const sessions = [
      { id: 'morning', title: 'Meditasi Pagi', category: 'jeda-pagi' },
      { id: 'sleep', title: 'Tidur Nyenyak', category: 'tidur-dalam' }
    ];
    this.cacheMeditationSessions(sessions);
  }

  private static async preloadPopularCourses(): Promise<void> {
    // Mock implementation - replace with actual API calls
    const courses = [
      { id: 'siy', title: 'Search Inside Yourself', popularity: 95 },
      { id: 'beginner', title: 'Meditasi Pemula', popularity: 88 }
    ];
    this.cacheCourses(courses);
  }

  private static async preloadAmbientSounds(): Promise<void> {
    // Mock implementation - replace with actual API calls
    const sounds = [
      { id: 'rain', title: 'Hujan Tropis', category: 'nature' },
      { id: 'ocean', title: 'Ombak Laut', category: 'nature' }
    ];
    this.cacheAmbientSounds(sounds);
  }

  /**
   * Clear all content cache
   */
  static clearAllCache(): void {
    contentCache.clear();
    console.log('🧹 All content cache cleared');
  }

  /**
   * Get cache performance metrics
   */
  static getPerformanceMetrics() {
    const metrics = contentCache.getMetrics();
    const hitRate = contentCache.getHitRate();

    return {
      ...metrics,
      hitRate: Math.round(hitRate * 100),
      status: hitRate > 0.7 ? 'excellent' : hitRate > 0.5 ? 'good' : 'needs_improvement'
    };
  }
}

// Image lazy loading utility
export class ImageCache {
  private static loadedImages: Set<string> = new Set();
  private static loadingImages: Map<string, Promise<void>> = new Map();

  /**
   * Preload image
   */
  static async preloadImage(src: string): Promise<void> {
    if (this.loadedImages.has(src)) {
      return Promise.resolve();
    }

    if (this.loadingImages.has(src)) {
      return this.loadingImages.get(src)!;
    }

    const promise = new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.loadedImages.add(src);
        this.loadingImages.delete(src);
        resolve();
      };
      img.onerror = () => {
        this.loadingImages.delete(src);
        reject(new Error(`Failed to load image: ${src}`));
      };
      img.src = src;
    });

    this.loadingImages.set(src, promise);
    return promise;
  }

  /**
   * Check if image is loaded
   */
  static isImageLoaded(src: string): boolean {
    return this.loadedImages.has(src);
  }

  /**
   * Preload multiple images
   */
  static async preloadImages(sources: string[]): Promise<void> {
    const promises = sources.map(src => this.preloadImage(src));
    await Promise.allSettled(promises);
  }
}

// Content compression utilities
export class ContentCompression {
  /**
   * Compress JSON data for storage
   */
  static compressJSON(data: any): string {
    try {
      const jsonString = JSON.stringify(data);
      // Simple compression technique - in production you might use a proper compression library
      return btoa(jsonString);
    } catch (error) {
      console.error('JSON compression failed:', error);
      return JSON.stringify(data);
    }
  }

  /**
   * Decompress JSON data
   */
  static decompressJSON(compressedData: string): any {
    try {
      const jsonString = atob(compressedData);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('JSON decompression failed:', error);
      return JSON.parse(compressedData);
    }
  }
}

// Service worker integration for advanced caching
export class ServiceWorkerCache {
  /**
   * Register service worker for advanced caching
   */
  static async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker registered:', registration);
      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
      }
    }
  }

  /**
   * Clear service worker cache
   */
  static async clearServiceWorkerCache(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
      console.log('🧹 Service Worker cache cleared');
    }
  }
}

export default ContentCacheManager;