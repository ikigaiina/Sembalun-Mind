import { offlineStorageService } from './offlineStorageService';
import { offlineSyncService } from './offlineSyncService';
import { audioCacheService } from './audioCacheService';

export interface DataUsageMetrics {
  totalUsed: number; // bytes
  syncData: number;
  audioDownloads: number;
  imageCache: number;
  apiCalls: number;
  period: 'daily' | 'weekly' | 'monthly';
  timestamp: Date;
}

export interface NetworkCondition {
  type: '2g' | '3g' | '4g' | '5g' | 'wifi' | 'unknown';
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  downlink: number; // Mbps
  rtt: number; // milliseconds
  saveData: boolean;
}

export interface DataOptimizationSettings {
  userId: string;
  maxDailyUsage: number; // MB
  wifiOnlyDownloads: boolean;
  compressData: boolean;
  adaptiveQuality: boolean;
  backgroundSyncLimited: boolean;
  lowDataMode: boolean;
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'manual';
  audioQuality: 'low' | 'medium' | 'high' | 'adaptive';
  preloadContent: boolean;
}

export interface SyncOptimization {
  batchSize: number;
  compressionLevel: number;
  priorityQueue: string[];
  skipLargeFiles: boolean;
  deltaSync: boolean;
}

export interface DataSavingStrategy {
  strategy: 'aggressive' | 'balanced' | 'performance';
  audioCompression: number; // 0-100%
  imagePlaceholders: boolean;
  lazyLoading: boolean;
  cacheExpiry: number; // hours
  backgroundSyncDisabled: boolean;
}

export class MobileDataOptimizationService {
  private static instance: MobileDataOptimizationService;
  private dataUsageTracker: Map<string, DataUsageMetrics> = new Map();
  private currentNetworkCondition: NetworkCondition | null = null;
  private dataUsageAlert = false;
  private syncQueue: Array<{ type: string; data: any; priority: number; size: number }> = [];

  static getInstance(): MobileDataOptimizationService {
    if (!MobileDataOptimizationService.instance) {
      MobileDataOptimizationService.instance = new MobileDataOptimizationService();
    }
    return MobileDataOptimizationService.instance;
  }

  constructor() {
    this.initializeNetworkMonitoring();
    this.initializeDataTracking();
  }

  private initializeNetworkMonitoring(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      this.updateNetworkCondition();
      
      connection.addEventListener('change', () => {
        this.updateNetworkCondition();
        this.adaptToNetworkCondition();
      });
    }

    // Monitor save-data preference
    if ('connection' in navigator && 'saveData' in (navigator as any).connection) {
      this.monitorSaveDataPreference();
    }
  }

  private initializeDataTracking(): void {
    // Track data usage for different operations
    this.trackNetworkRequests();
    
    // Reset daily usage at midnight
    this.scheduleDailyReset();
  }

  async optimizeBackgroundSync(userId: string): Promise<SyncOptimization> {
    try {
      const settings = await this.getOptimizationSettings(userId);
      const networkCondition = await this.getCurrentNetworkCondition();
      const currentUsage = await this.getDailyDataUsage(userId);

      // Determine optimization strategy based on conditions
      const optimization: SyncOptimization = {
        batchSize: this.calculateOptimalBatchSize(networkCondition, currentUsage, settings),
        compressionLevel: this.calculateCompressionLevel(networkCondition, settings),
        priorityQueue: await this.buildPriorityQueue(userId),
        skipLargeFiles: this.shouldSkipLargeFiles(networkCondition, currentUsage, settings),
        deltaSync: this.shouldUseDeltaSync(networkCondition, settings)
      };

      console.log('Background sync optimization calculated:', optimization);
      return optimization;
    } catch (error) {
      console.error('Error optimizing background sync:', error);
      return this.getDefaultSyncOptimization();
    }
  }

  async enableIntelligentDataSaving(userId: string): Promise<DataSavingStrategy> {
    try {
      const settings = await this.getOptimizationSettings(userId);
      const networkCondition = await this.getCurrentNetworkCondition();
      const dailyUsage = await this.getDailyDataUsage(userId);
      
      // Determine data saving strategy
      let strategy: 'aggressive' | 'balanced' | 'performance' = 'balanced';
      
      if (settings.lowDataMode || dailyUsage.totalUsed > settings.maxDailyUsage * 0.8) {
        strategy = 'aggressive';
      } else if (networkCondition.effectiveType === '4g' && !settings.lowDataMode) {
        strategy = 'performance';
      }

      const dataSavingStrategy: DataSavingStrategy = {
        strategy,
        audioCompression: this.getAudioCompressionLevel(strategy, networkCondition),
        imagePlaceholders: strategy === 'aggressive',
        lazyLoading: strategy !== 'performance',
        cacheExpiry: this.getCacheExpiryHours(strategy),
        backgroundSyncDisabled: strategy === 'aggressive' && !this.isWifiConnected()
      };

      // Apply the strategy
      await this.applyDataSavingStrategy(dataSavingStrategy, userId);
      
      return dataSavingStrategy;
    } catch (error) {
      console.error('Error enabling intelligent data saving:', error);
      return this.getDefaultDataSavingStrategy();
    }
  }

  async optimizeAudioDownloads(userId: string): Promise<void> {
    try {
      const settings = await this.getOptimizationSettings(userId);
      const networkCondition = await this.getCurrentNetworkCondition();
      
      // Skip audio downloads on poor connections unless WiFi
      if (!this.isWifiConnected() && (
        networkCondition.effectiveType === 'slow-2g' || 
        networkCondition.effectiveType === '2g'
      )) {
        console.log('Skipping audio downloads due to poor network conditions');
        return;
      }

      // Optimize audio quality based on network
      const optimalQuality = await audioCacheService.getOptimalQualityForNetwork();
      
      // Queue downloads with intelligent scheduling
      await this.scheduleOptimalDownloadTimes(userId, optimalQuality);
      
    } catch (error) {
      console.error('Error optimizing audio downloads:', error);
    }
  }

  async compressSync(data: any, level: number = 50): Promise<{ compressed: any; ratio: number; savings: number }> {
    try {
      const originalSize = this.calculateDataSize(data);
      
      // Apply compression based on level
      const compressed = await this.compressData(data, level);
      const compressedSize = this.calculateDataSize(compressed);
      
      const ratio = compressedSize / originalSize;
      const savings = originalSize - compressedSize;
      
      return {
        compressed,
        ratio,
        savings
      };
    } catch (error) {
      console.error('Error compressing sync data:', error);
      return { compressed: data, ratio: 1, savings: 0 };
    }
  }

  async scheduleOptimalSyncTimes(userId: string): Promise<Date[]> {
    try {
      const settings = await this.getOptimizationSettings(userId);
      const userPatterns = await this.analyzeUserPatterns(userId);
      
      // Find optimal sync windows
      const optimalTimes: Date[] = [];
      
      // WiFi-only times (if user is usually on WiFi)
      if (userPatterns.usuallyOnWifiTimes.length > 0) {
        optimalTimes.push(...userPatterns.usuallyOnWifiTimes);
      }
      
      // Low-usage times
      optimalTimes.push(...userPatterns.lowUsageTimes);
      
      // Charging times (when device is likely stable)
      optimalTimes.push(...userPatterns.chargingTimes);
      
      return optimalTimes.slice(0, 3); // Top 3 optimal times
    } catch (error) {
      console.error('Error scheduling optimal sync times:', error);
      return [new Date()]; // Fallback to current time
    }
  }

  async trackDataUsage(operation: string, bytes: number): Promise<void> {
    try {
      const today = new Date().toDateString();
      const existing = this.dataUsageTracker.get(today) || this.createEmptyMetrics();
      
      // Update metrics based on operation type
      switch (operation) {
        case 'sync':
          existing.syncData += bytes;
          break;
        case 'audio':
          existing.audioDownloads += bytes;
          break;
        case 'image':
          existing.imageCache += bytes;
          break;
        case 'api':
          existing.apiCalls += bytes;
          break;
        default:
          existing.totalUsed += bytes;
      }
      
      existing.totalUsed = existing.syncData + existing.audioDownloads + existing.imageCache + existing.apiCalls;
      existing.timestamp = new Date();
      
      this.dataUsageTracker.set(today, existing);
      
      // Check if usage limit exceeded
      await this.checkUsageLimits(existing);
      
    } catch (error) {
      console.error('Error tracking data usage:', error);
    }
  }

  async getDailyDataUsage(userId: string): Promise<DataUsageMetrics> {
    const today = new Date().toDateString();
    return this.dataUsageTracker.get(today) || this.createEmptyMetrics();
  }

  async getWeeklyDataUsage(userId: string): Promise<DataUsageMetrics> {
    const weekMetrics = this.createEmptyMetrics();
    weekMetrics.period = 'weekly';
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayMetrics = this.dataUsageTracker.get(date.toDateString());
      
      if (dayMetrics) {
        weekMetrics.totalUsed += dayMetrics.totalUsed;
        weekMetrics.syncData += dayMetrics.syncData;
        weekMetrics.audioDownloads += dayMetrics.audioDownloads;
        weekMetrics.imageCache += dayMetrics.imageCache;
        weekMetrics.apiCalls += dayMetrics.apiCalls;
      }
    }
    
    return weekMetrics;
  }

  async getCurrentNetworkCondition(): Promise<NetworkCondition> {
    if (this.currentNetworkCondition) {
      return this.currentNetworkCondition;
    }
    
    return this.getDefaultNetworkCondition();
  }

  async updateOptimizationSettings(userId: string, settings: Partial<DataOptimizationSettings>): Promise<void> {
    try {
      const current = await this.getOptimizationSettings(userId);
      const updated = { ...current, ...settings };
      await offlineStorageService.setSetting(`dataOptimization_${userId}`, updated);
      
      // Apply new settings immediately
      if (settings.lowDataMode !== undefined) {
        await this.enableIntelligentDataSaving(userId);
      }
    } catch (error) {
      console.error('Error updating optimization settings:', error);
      throw error;
    }
  }

  // Private helper methods
  private updateNetworkCondition(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      this.currentNetworkCondition = {
        type: connection.type || 'unknown',
        effectiveType: connection.effectiveType || '4g',
        downlink: connection.downlink || 1,
        rtt: connection.rtt || 100,
        saveData: connection.saveData || false
      };
    }
  }

  private adaptToNetworkCondition(): void {
    if (!this.currentNetworkCondition) return;
    
    // Adapt sync behavior based on network
    if (this.currentNetworkCondition.effectiveType === 'slow-2g' || 
        this.currentNetworkCondition.effectiveType === '2g') {
      this.enableAggressiveDataSaving();
    } else if (this.currentNetworkCondition.type === 'wifi') {
      this.enablePerformanceMode();
    }
  }

  private calculateOptimalBatchSize(
    network: NetworkCondition, 
    usage: DataUsageMetrics, 
    settings: DataOptimizationSettings
  ): number {
    let batchSize = 10; // Default
    
    if (network.effectiveType === '4g' && this.isWifiConnected()) {
      batchSize = 50;
    } else if (network.effectiveType === '3g') {
      batchSize = 20;
    } else if (network.effectiveType === '2g' || network.effectiveType === 'slow-2g') {
      batchSize = 5;
    }
    
    // Reduce batch size if approaching usage limit
    const usageRatio = usage.totalUsed / (settings.maxDailyUsage * 1024 * 1024);
    if (usageRatio > 0.8) {
      batchSize = Math.max(1, Math.floor(batchSize * 0.3));
    }
    
    return batchSize;
  }

  private calculateCompressionLevel(network: NetworkCondition, settings: DataOptimizationSettings): number {
    if (settings.lowDataMode) return 80;
    if (network.effectiveType === 'slow-2g' || network.effectiveType === '2g') return 70;
    if (network.effectiveType === '3g') return 50;
    if (this.isWifiConnected()) return 20;
    return 40;
  }

  private async buildPriorityQueue(userId: string): Promise<string[]> {
    // Prioritize critical data first
    return [
      'meditation_progress',
      'mood_entries',
      'journal_entries',
      'user_settings',
      'audio_metadata'
    ];
  }

  private shouldSkipLargeFiles(
    network: NetworkCondition, 
    usage: DataUsageMetrics, 
    settings: DataOptimizationSettings
  ): boolean {
    if (settings.lowDataMode) return true;
    if (!this.isWifiConnected() && network.effectiveType !== '4g') return true;
    
    const usageRatio = usage.totalUsed / (settings.maxDailyUsage * 1024 * 1024);
    return usageRatio > 0.9;
  }

  private shouldUseDeltaSync(network: NetworkCondition, settings: DataOptimizationSettings): boolean {
    return !this.isWifiConnected() || settings.lowDataMode;
  }

  private getAudioCompressionLevel(strategy: string, network: NetworkCondition): number {
    switch (strategy) {
      case 'aggressive': return 80;
      case 'balanced': return 50;
      case 'performance': return 20;
      default: return 50;
    }
  }

  private getCacheExpiryHours(strategy: string): number {
    switch (strategy) {
      case 'aggressive': return 2;
      case 'balanced': return 12;
      case 'performance': return 48;
      default: return 12;
    }
  }

  private async applyDataSavingStrategy(strategy: DataSavingStrategy, userId: string): Promise<void> {
    // Update audio cache settings
    if (strategy.audioCompression > 0) {
      await audioCacheService.optimizeCache();
    }
    
    // Update sync settings
    if (strategy.backgroundSyncDisabled) {
      await offlineSyncService.updateBackgroundSyncConfig(userId, { enabled: false });
    }
    
    console.log('Data saving strategy applied:', strategy.strategy);
  }

  private async scheduleOptimalDownloadTimes(userId: string, quality: any): Promise<void> {
    const optimalTimes = await this.scheduleOptimalSyncTimes(userId);
    
    // Schedule downloads during optimal times
    optimalTimes.forEach((time, index) => {
      setTimeout(() => {
        console.log('Optimal download window opened');
        // Trigger downloads here
      }, time.getTime() - Date.now());
    });
  }

  private async analyzeUserPatterns(userId: string): Promise<{
    usuallyOnWifiTimes: Date[];
    lowUsageTimes: Date[];
    chargingTimes: Date[];
  }> {
    // Mock analysis - would analyze actual user patterns
    const now = new Date();
    return {
      usuallyOnWifiTimes: [
        new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
        new Date(now.getTime() + 8 * 60 * 60 * 1000)  // 8 hours from now
      ],
      lowUsageTimes: [
        new Date(now.getTime() + 1 * 60 * 60 * 1000), // 1 hour from now
        new Date(now.getTime() + 6 * 60 * 60 * 1000)  // 6 hours from now
      ],
      chargingTimes: [
        new Date(now.getTime() + 10 * 60 * 60 * 1000), // 10 hours from now (overnight)
      ]
    };
  }

  private compressData(data: any, level: number): Promise<any> {
    // Simplified compression simulation
    return Promise.resolve(data);
  }

  private calculateDataSize(data: any): number {
    return JSON.stringify(data).length;
  }

  private async checkUsageLimits(metrics: DataUsageMetrics): Promise<void> {
    // Alert user if approaching limit
    // Implementation would show actual alerts
  }

  private createEmptyMetrics(): DataUsageMetrics {
    return {
      totalUsed: 0,
      syncData: 0,
      audioDownloads: 0,
      imageCache: 0,
      apiCalls: 0,
      period: 'daily',
      timestamp: new Date()
    };
  }

  private async getOptimizationSettings(userId: string): Promise<DataOptimizationSettings> {
    const settings = await offlineStorageService.getSetting(`dataOptimization_${userId}`);
    
    if (settings) {
      return settings;
    }
    
    // Default settings
    return {
      userId,
      maxDailyUsage: 100, // 100MB
      wifiOnlyDownloads: true,
      compressData: true,
      adaptiveQuality: true,
      backgroundSyncLimited: true,
      lowDataMode: false,
      syncFrequency: 'hourly',
      audioQuality: 'adaptive',
      preloadContent: false
    };
  }

  private getDefaultSyncOptimization(): SyncOptimization {
    return {
      batchSize: 10,
      compressionLevel: 50,
      priorityQueue: ['meditation_progress', 'mood_entries'],
      skipLargeFiles: true,
      deltaSync: true
    };
  }

  private getDefaultDataSavingStrategy(): DataSavingStrategy {
    return {
      strategy: 'balanced',
      audioCompression: 50,
      imagePlaceholders: false,
      lazyLoading: true,
      cacheExpiry: 12,
      backgroundSyncDisabled: false
    };
  }

  private getDefaultNetworkCondition(): NetworkCondition {
    return {
      type: 'unknown',
      effectiveType: '4g',
      downlink: 1,
      rtt: 100,
      saveData: false
    };
  }

  private isWifiConnected(): boolean {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection.type === 'wifi';
    }
    return false;
  }

  private monitorSaveDataPreference(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection.saveData) {
        this.enableAggressiveDataSaving();
      }
    }
  }

  private enableAggressiveDataSaving(): void {
    console.log('Aggressive data saving mode enabled');
    // Implementation would enable aggressive settings
  }

  private enablePerformanceMode(): void {
    console.log('Performance mode enabled');
    // Implementation would enable performance settings
  }

  private trackNetworkRequests(): void {
    // Mock implementation - would track actual network requests
  }

  private scheduleDailyReset(): void {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    setTimeout(() => {
      this.dataUsageTracker.clear();
      this.scheduleDailyReset(); // Schedule next reset
    }, msUntilMidnight);
  }
}

export const mobileDataOptimizationService = MobileDataOptimizationService.getInstance();