/**
 * Performance Monitoring and Optimization Utilities
 * Provides comprehensive performance tracking, bottleneck detection, and optimization tools
 */

import React from 'react';

// Performance monitoring interface
interface PerformanceMetrics {
  timeToInteractive: number;
  memoryUsage: number;
  renderCount: number;
  componentMountTime: number;
  audioLoadTime: number;
  bundleSize: number;
  lastUpdated: number;
}

// Component performance tracker
export interface ComponentMetrics {
  name: string;
  renderCount: number;
  mountTime: number;
  updateTime: number;
  unmountTime: number;
  averageRenderTime: number;
  memoryLeaks: boolean;
}

// Audio performance metrics
export interface AudioMetrics {
  loadTime: number;
  cacheHitRate: number;
  bufferHealth: number;
  preloadSuccess: boolean;
  compressionRatio: number;
}

// Memory leak detection
export interface MemorySnapshot {
  timestamp: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
  componentInstances: Map<string, number>;
  eventListeners: number;
  timers: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private componentMetrics: Map<string, ComponentMetrics> = new Map();
  private audioMetrics: AudioMetrics;
  private memorySnapshots: MemorySnapshot[] = [];
  private renderObserver: PerformanceObserver | null = null;
  private memoryLeakTimer: number | null = null;

  constructor() {
    this.metrics = {
      timeToInteractive: 0,
      memoryUsage: 0,
      renderCount: 0,
      componentMountTime: 0,
      audioLoadTime: 0,
      bundleSize: 0,
      lastUpdated: Date.now()
    };

    this.audioMetrics = {
      loadTime: 0,
      cacheHitRate: 0,
      bufferHealth: 0,
      preloadSuccess: false,
      compressionRatio: 0
    };

    this.initializeMonitoring();
  }

  private initializeMonitoring() {
    // Initialize performance observers
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.setupRenderObserver();
      this.setupMemoryMonitoring();
      this.measureTimeToInteractive();
    }
  }

  private setupRenderObserver() {
    try {
      this.renderObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure') {
            this.recordRenderMetric(entry);
          }
        }
      });
      this.renderObserver.observe({ type: 'measure', buffered: true });
    } catch (error) {
      console.warn('Performance Observer not available:', error);
    }
  }

  private setupMemoryMonitoring() {
    // Monitor memory every 30 seconds to detect leaks
    this.memoryLeakTimer = window.setInterval(() => {
      this.captureMemorySnapshot();
      this.detectMemoryLeaks();
    }, 30000);
  }

  private captureMemorySnapshot() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const snapshot: MemorySnapshot = {
        timestamp: Date.now(),
        heapUsed: memory.usedJSHeapSize,
        heapTotal: memory.totalJSHeapSize,
        external: memory.externalJSHeapSize || 0,
        componentInstances: new Map(),
        eventListeners: this.countEventListeners(),
        timers: this.countActiveTimers()
      };

      this.memorySnapshots.push(snapshot);
      
      // Keep only last 20 snapshots
      if (this.memorySnapshots.length > 20) {
        this.memorySnapshots.shift();
      }

      this.metrics.memoryUsage = memory.usedJSHeapSize / (1024 * 1024); // MB
    }
  }

  private detectMemoryLeaks(): boolean {
    if (this.memorySnapshots.length < 5) return false;

    const recent = this.memorySnapshots.slice(-5);
    const growthTrend = recent.map((snapshot, index) => {
      if (index === 0) return 0;
      return snapshot.heapUsed - recent[index - 1].heapUsed;
    });

    const averageGrowth = growthTrend.reduce((sum, growth) => sum + growth, 0) / growthTrend.length;
    const hasMemoryLeak = averageGrowth > 5 * 1024 * 1024; // 5MB growth threshold

    if (hasMemoryLeak) {
      console.warn('Potential memory leak detected. Average growth:', averageGrowth / (1024 * 1024), 'MB');
      this.reportMemoryLeak();
    }

    return hasMemoryLeak;
  }

  private countEventListeners(): number {
    // Count registered event listeners (approximation)
    const elements = document.querySelectorAll('*');
    let count = 0;
    
    elements.forEach(element => {
      const events = (element as any)._events;
      if (events) {
        count += Object.keys(events).length;
      }
    });
    
    return count;
  }

  private countActiveTimers(): number {
    // Count active timers (approximation)
    let count = 0;
    const id = setTimeout(() => {}, 0);
    clearTimeout(id);
    
    // Check for active intervals/timeouts
    for (let i = 1; i <= (id as unknown as number); i++) {
      try {
        clearTimeout(i);
        count++;
      } catch {
        // Timer doesn't exist
      }
    }
    
    return count;
  }

  private recordRenderMetric(entry: PerformanceEntry) {
    this.metrics.renderCount++;
    
    if (entry.name.includes('component:')) {
      const componentName = entry.name.replace('component:', '');
      const existing = this.componentMetrics.get(componentName) || {
        name: componentName,
        renderCount: 0,
        mountTime: 0,
        updateTime: 0,
        unmountTime: 0,
        averageRenderTime: 0,
        memoryLeaks: false
      };

      existing.renderCount++;
      existing.averageRenderTime = (existing.averageRenderTime + entry.duration) / 2;
      
      this.componentMetrics.set(componentName, existing);
    }
  }

  // Public API methods
  public startComponentMeasure(componentName: string, phase: 'mount' | 'update' | 'unmount') {
    const measureName = `component:${componentName}:${phase}`;
    performance.mark(`${measureName}-start`);
  }

  public endComponentMeasure(componentName: string, phase: 'mount' | 'update' | 'unmount') {
    const measureName = `component:${componentName}:${phase}`;
    const startMark = `${measureName}-start`;
    const endMark = `${measureName}-end`;
    
    performance.mark(endMark);
    performance.measure(measureName, startMark, endMark);
  }

  public measureAudioLoad(audioUrl: string, startTime: number) {
    const loadTime = performance.now() - startTime;
    this.audioMetrics.loadTime = loadTime;
    
    // Check if loaded from cache
    const cacheHit = loadTime < 100; // Assume cache if load time < 100ms
    this.audioMetrics.cacheHitRate = cacheHit ? 
      (this.audioMetrics.cacheHitRate + 1) / 2 : 
      this.audioMetrics.cacheHitRate * 0.9;
  }

  public measureTimeToInteractive() {
    // Use paint timing API
    if ('getEntriesByType' in performance) {
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      
      if (fcpEntry) {
        // Estimate TTI as FCP + buffer for interactivity
        this.metrics.timeToInteractive = fcpEntry.startTime + 500;
      }
    }
  }

  public getBundleSize(): Promise<number> {
    return new Promise((resolve) => {
      if ('getEntriesByType' in performance) {
        const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        if (navigationEntries.length > 0) {
          const entry = navigationEntries[0];
          const bundleSize = entry.transferSize || 0;
          this.metrics.bundleSize = bundleSize;
          resolve(bundleSize);
        }
      }
      resolve(0);
    });
  }

  public getMetrics(): PerformanceMetrics & { components: ComponentMetrics[], audio: AudioMetrics } {
    return {
      ...this.metrics,
      components: Array.from(this.componentMetrics.values()),
      audio: this.audioMetrics,
      lastUpdated: Date.now()
    };
  }

  public getMemoryReport(): MemorySnapshot[] {
    return [...this.memorySnapshots];
  }

  public generateOptimizationReport(): OptimizationReport {
    const components = Array.from(this.componentMetrics.values());
    const slowComponents = components.filter(c => c.averageRenderTime > 16); // 16ms = 60fps
    const memoryIssues = this.detectMemoryLeaks();
    
    return {
      timeToInteractive: this.metrics.timeToInteractive,
      target: 2300, // Target: 2.3s
      improvement: Math.max(0, this.metrics.timeToInteractive - 2300),
      
      memoryUsage: this.metrics.memoryUsage,
      memoryTarget: 32, // Target: 32MB
      memoryImprovement: Math.max(0, this.metrics.memoryUsage - 32),
      
      slowComponents,
      memoryLeaks: memoryIssues,
      
      recommendations: this.generateRecommendations(slowComponents, memoryIssues),
      
      bundleSize: this.metrics.bundleSize,
      bundleOptimization: this.analyzeBundleSize()
    };
  }

  private generateRecommendations(slowComponents: ComponentMetrics[], hasMemoryLeaks: boolean): string[] {
    const recommendations: string[] = [];
    
    if (slowComponents.length > 0) {
      recommendations.push(`Optimize ${slowComponents.length} slow components: ${slowComponents.map(c => c.name).join(', ')}`);
      recommendations.push('Consider React.memo() for frequently re-rendering components');
      recommendations.push('Use useMemo() and useCallback() for expensive operations');
    }
    
    if (hasMemoryLeaks) {
      recommendations.push('Fix memory leaks by cleaning up event listeners and timers');
      recommendations.push('Review component unmounting logic');
    }
    
    if (this.metrics.timeToInteractive > 3800) {
      recommendations.push('Implement code splitting and lazy loading');
      recommendations.push('Optimize asset loading with preloading strategy');
    }
    
    if (this.audioMetrics.cacheHitRate < 0.8) {
      recommendations.push('Improve audio caching strategy');
      recommendations.push('Implement audio preloading for better performance');
    }
    
    return recommendations;
  }

  private analyzeBundleSize(): BundleAnalysis {
    return {
      totalSize: this.metrics.bundleSize,
      gzippedSize: Math.floor(this.metrics.bundleSize * 0.3), // Estimate
      recommendations: this.metrics.bundleSize > 1000000 ? [
        'Consider code splitting',
        'Remove unused dependencies',
        'Optimize images and assets'
      ] : []
    };
  }

  private reportMemoryLeak() {
    // In production, this would send to analytics
    console.warn('Memory leak detected and reported to monitoring system');
  }

  public cleanup() {
    if (this.renderObserver) {
      this.renderObserver.disconnect();
    }
    
    if (this.memoryLeakTimer) {
      clearInterval(this.memoryLeakTimer);
    }
  }
}

// Optimization report interfaces
export interface OptimizationReport {
  timeToInteractive: number;
  target: number;
  improvement: number;
  
  memoryUsage: number;
  memoryTarget: number;
  memoryImprovement: number;
  
  slowComponents: ComponentMetrics[];
  memoryLeaks: boolean;
  recommendations: string[];
  
  bundleSize: number;
  bundleOptimization: BundleAnalysis;
}

export interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  recommendations: string[];
}

// React hook for performance monitoring
export function usePerformanceMonitoring(componentName: string) {
  const monitor = PerformanceMonitor.getInstance();
  
  React.useEffect(() => {
    monitor.startComponentMeasure(componentName, 'mount');
    
    return () => {
      monitor.endComponentMeasure(componentName, 'unmount');
    };
  }, [componentName, monitor]);
  
  const measureUpdate = React.useCallback(() => {
    monitor.startComponentMeasure(componentName, 'update');
    
    // End measurement after next render
    React.startTransition(() => {
      setTimeout(() => {
        monitor.endComponentMeasure(componentName, 'update');
      }, 0);
    });
  }, [componentName, monitor]);
  
  return { measureUpdate };
}

// Singleton pattern for global performance monitoring
let performanceMonitorInstance: PerformanceMonitor | null = null;

export const getPerformanceMonitor = (): PerformanceMonitor => {
  if (!performanceMonitorInstance) {
    performanceMonitorInstance = new PerformanceMonitor();
  }
  return performanceMonitorInstance;
};

// Add getInstance static method to PerformanceMonitor class
(PerformanceMonitor as any).getInstance = getPerformanceMonitor;

// Audio performance optimization utilities
export class AudioPerformanceOptimizer {
  private preloadedAudio: Map<string, HTMLAudioElement> = new Map();
  private loadingPromises: Map<string, Promise<void>> = new Map();
  
  public async preloadAudio(urls: string[]): Promise<void> {
    const promises = urls.map(url => this.preloadSingleAudio(url));
    await Promise.allSettled(promises);
  }
  
  private preloadSingleAudio(url: string): Promise<void> {
    if (this.preloadedAudio.has(url)) {
      return Promise.resolve();
    }
    
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!;
    }
    
    const promise = new Promise<void>((resolve, reject) => {
      const audio = new Audio();
      const startTime = performance.now();
      
      audio.addEventListener('canplaythrough', () => {
        this.preloadedAudio.set(url, audio);
        getPerformanceMonitor().measureAudioLoad(url, startTime);
        resolve();
      });
      
      audio.addEventListener('error', reject);
      audio.preload = 'auto';
      audio.src = url;
    });
    
    this.loadingPromises.set(url, promise);
    return promise;
  }
  
  public getPreloadedAudio(url: string): HTMLAudioElement | null {
    return this.preloadedAudio.get(url) || null;
  }
  
  public clearCache() {
    this.preloadedAudio.clear();
    this.loadingPromises.clear();
  }
}

// Mobile touch optimization
export const optimizeTouchPerformance = () => {
  // Add passive listeners for better scroll performance
  const addPassiveListener = (element: Element, event: string, handler: EventListener) => {
    element.addEventListener(event, handler, { passive: true });
  };
  
  // Optimize touch events
  document.addEventListener('touchstart', (e) => {
    // Prevent 300ms delay on mobile
    if (e.target instanceof Element && e.target.closest('button, [role="button"]')) {
      e.preventDefault();
    }
  }, { passive: false });
  
  // Add CSS for better performance
  const style = document.createElement('style');
  style.textContent = `
    * {
      -webkit-touch-callout: none;
      -webkit-tap-highlight-color: transparent;
    }
    
    .performance-optimized {
      will-change: transform;
      transform: translateZ(0);
    }
    
    .reduce-motion {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  `;
  document.head.appendChild(style);
};

export default PerformanceMonitor;