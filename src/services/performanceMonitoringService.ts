/**
 * Performance Monitoring Service for Sembalun
 * Tracks app performance, user engagement, and meditation effectiveness
 */

export interface PerformanceMetrics {
  // Core Web Vitals
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
  
  // App-specific metrics
  appLoadTime: number;
  meditationStartTime: number;
  sessionCompletionRate: number;
  navigationTiming: number;
  errorRate: number;
  
  // User engagement
  sessionDuration: number;
  pagesPerSession: number;
  bounceRate: number;
  
  // Meditation-specific
  meditationCompletionRate: number;
  averageSessionLength: number;
  streakConsistency: number;
  
  timestamp: number;
  userAgent: string;
  connection?: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

export interface UserEngagementMetrics {
  dailyActiveTime: number;
  featuresUsed: string[];
  mostUsedFeature: string;
  meditationPreferences: {
    duration: number;
    region: string;
    technique: string;
  };
  completedSessions: number;
  skippedSessions: number;
  averageMoodImprovement: number;
}

export interface ErrorMetrics {
  type: 'javascript' | 'network' | 'resource' | 'custom';
  message: string;
  stack?: string;
  url: string;
  timestamp: number;
  userAgent: string;
  userId?: string;
}

class PerformanceMonitoringService {
  private metrics: PerformanceMetrics[] = [];
  private engagementMetrics: UserEngagementMetrics[] = [];
  private errorMetrics: ErrorMetrics[] = [];
  private sessionStartTime: number = Date.now();
  private pageViewStartTime: number = Date.now();
  private observer?: PerformanceObserver;

  constructor() {
    this.initializeMonitoring();
    this.setupErrorHandling();
    this.trackPageVisibility();
  }

  private initializeMonitoring(): void {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.startPerformanceMonitoring();
      });
    } else {
      this.startPerformanceMonitoring();
    }
  }

  private startPerformanceMonitoring(): void {
    this.measureCoreWebVitals();
    this.measureAppSpecificMetrics();
    this.setupPerformanceObserver();
    this.schedulePeriodicReporting();
  }

  private measureCoreWebVitals(): void {
    // First Contentful Paint
    this.measureFCP();
    
    // Largest Contentful Paint
    this.measureLCP();
    
    // First Input Delay
    this.measureFID();
    
    // Cumulative Layout Shift
    this.measureCLS();
    
    // Time to Interactive (approximation)
    this.measureTTI();
  }

  private measureFCP(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.recordMetric('firstContentfulPaint', entry.startTime);
        }
      }
    });
    
    observer.observe({ type: 'paint', buffered: true });
  }

  private measureLCP(): void {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.recordMetric('largestContentfulPaint', lastEntry.startTime);
    });
    
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  }

  private measureFID(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric('firstInputDelay', entry.processingStart - entry.startTime);
      }
    });
    
    observer.observe({ type: 'first-input', buffered: true });
  }

  private measureCLS(): void {
    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      this.recordMetric('cumulativeLayoutShift', clsValue);
    });
    
    observer.observe({ type: 'layout-shift', buffered: true });
  }

  private measureTTI(): void {
    // Simplified TTI measurement
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      const tti = navigationEntry.domContentLoadedEventEnd - navigationEntry.fetchStart;
      this.recordMetric('timeToInteractive', tti);
    }
  }

  private measureAppSpecificMetrics(): void {
    // App load time
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      const loadTime = navigationEntry.loadEventEnd - navigationEntry.fetchStart;
      this.recordMetric('appLoadTime', loadTime);
    }

    // Navigation timing
    this.measureNavigationPerformance();
    
    // Resource loading performance
    this.measureResourcePerformance();
  }

  private measureNavigationPerformance(): void {
    const navigationEntries = performance.getEntriesByType('navigation');
    if (navigationEntries.length > 0) {
      const entry = navigationEntries[0] as PerformanceNavigationTiming;
      const navigationTime = entry.domContentLoadedEventEnd - entry.fetchStart;
      this.recordMetric('navigationTiming', navigationTime);
    }
  }

  private measureResourcePerformance(): void {
    const resourceEntries = performance.getEntriesByType('resource');
    let slowResourceCount = 0;
    
    resourceEntries.forEach(entry => {
      if (entry.duration > 1000) { // Resources taking more than 1 second
        slowResourceCount++;
      }
    });

    // Calculate error rate based on slow resources
    const errorRate = (slowResourceCount / resourceEntries.length) * 100;
    this.recordMetric('errorRate', errorRate);
  }

  private setupPerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.analyzePerformanceEntry(entry);
        }
      });

      // Observe different types of performance entries
      try {
        this.observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
      } catch (error) {
        console.warn('Performance Observer not fully supported:', error);
      }
    }
  }

  private analyzePerformanceEntry(entry: PerformanceEntry): void {
    // Log slow operations
    if (entry.duration > 100) {
      console.warn(`Slow operation detected: ${entry.name} took ${entry.duration}ms`);
      
      // Store slow operation data
      const slowOperation = {
        name: entry.name,
        duration: entry.duration,
        timestamp: Date.now(),
        type: entry.entryType
      };
      
      this.storeSlowOperation(slowOperation);
    }
  }

  private storeSlowOperation(operation: any): void {
    let slowOperations = JSON.parse(localStorage.getItem('slowOperations') || '[]');
    slowOperations.push(operation);
    
    // Keep only last 50 slow operations
    if (slowOperations.length > 50) {
      slowOperations = slowOperations.slice(-50);
    }
    
    localStorage.setItem('slowOperations', JSON.stringify(slowOperations));
  }

  private recordMetric(key: keyof PerformanceMetrics, value: number): void {
    const existingMetrics = this.getCurrentMetrics();
    existingMetrics[key] = value;
    this.updateCurrentMetrics(existingMetrics);
  }

  private getCurrentMetrics(): Partial<PerformanceMetrics> {
    const stored = sessionStorage.getItem('currentPerformanceMetrics');
    return stored ? JSON.parse(stored) : {};
  }

  private updateCurrentMetrics(metrics: Partial<PerformanceMetrics>): void {
    sessionStorage.setItem('currentPerformanceMetrics', JSON.stringify(metrics));
  }

  private setupErrorHandling(): void {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.recordError({
        type: 'javascript',
        message: event.message,
        stack: event.error?.stack,
        url: event.filename || window.location.href,
        timestamp: Date.now(),
        userAgent: navigator.userAgent
      });
    });

    // Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.recordError({
        type: 'javascript',
        message: `Unhandled Promise Rejection: ${event.reason}`,
        url: window.location.href,
        timestamp: Date.now(),
        userAgent: navigator.userAgent
      });
    });

    // Resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.recordError({
          type: 'resource',
          message: `Failed to load resource: ${(event.target as any)?.src || (event.target as any)?.href}`,
          url: window.location.href,
          timestamp: Date.now(),
          userAgent: navigator.userAgent
        });
      }
    }, true);
  }

  private recordError(error: ErrorMetrics): void {
    this.errorMetrics.push(error);
    
    // Store in localStorage for persistence
    const storedErrors = JSON.parse(localStorage.getItem('errorMetrics') || '[]');
    storedErrors.push(error);
    
    // Keep only last 100 errors
    if (storedErrors.length > 100) {
      storedErrors.splice(0, storedErrors.length - 100);
    }
    
    localStorage.setItem('errorMetrics', JSON.stringify(storedErrors));
    
    console.error('Error recorded:', error);
  }

  private trackPageVisibility(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.pageViewStartTime = Date.now();
      } else {
        const sessionDuration = Date.now() - this.pageViewStartTime;
        this.recordEngagementMetric('sessionDuration', sessionDuration);
      }
    });

    // Track session duration on unload
    window.addEventListener('beforeunload', () => {
      const totalSessionDuration = Date.now() - this.sessionStartTime;
      this.recordEngagementMetric('sessionDuration', totalSessionDuration);
      this.saveMetrics();
    });
  }

  private recordEngagementMetric(key: keyof UserEngagementMetrics, value: any): void {
    const engagement = this.getCurrentEngagementMetrics();
    (engagement as any)[key] = value;
    sessionStorage.setItem('currentEngagementMetrics', JSON.stringify(engagement));
  }

  private getCurrentEngagementMetrics(): Partial<UserEngagementMetrics> {
    const stored = sessionStorage.getItem('currentEngagementMetrics');
    return stored ? JSON.parse(stored) : {
      dailyActiveTime: 0,
      featuresUsed: [],
      completedSessions: 0,
      skippedSessions: 0
    };
  }

  // Public methods for tracking specific events
  trackMeditationStart(sessionType: string, duration: number): void {
    const startTime = performance.now();
    this.recordMetric('meditationStartTime', startTime);
    
    // Track meditation preferences
    const engagement = this.getCurrentEngagementMetrics();
    if (!engagement.meditationPreferences) {
      engagement.meditationPreferences = { duration: 0, region: '', technique: '' };
    }
    engagement.meditationPreferences.duration = duration;
    engagement.meditationPreferences.technique = sessionType;
    
    this.recordEngagementMetric('meditationPreferences', engagement.meditationPreferences);
  }

  trackMeditationCompletion(completed: boolean, actualDuration: number): void {
    const engagement = this.getCurrentEngagementMetrics();
    
    if (completed) {
      engagement.completedSessions = (engagement.completedSessions || 0) + 1;
    } else {
      engagement.skippedSessions = (engagement.skippedSessions || 0) + 1;
    }

    const completionRate = engagement.completedSessions / 
      (engagement.completedSessions + engagement.skippedSessions) * 100;
    
    this.recordMetric('meditationCompletionRate', completionRate);
    this.recordMetric('averageSessionLength', actualDuration);
    
    sessionStorage.setItem('currentEngagementMetrics', JSON.stringify(engagement));
  }

  trackFeatureUsage(featureName: string): void {
    const engagement = this.getCurrentEngagementMetrics();
    if (!engagement.featuresUsed) {
      engagement.featuresUsed = [];
    }
    
    engagement.featuresUsed.push(featureName);
    
    // Calculate most used feature
    const featureCounts: Record<string, number> = {};
    engagement.featuresUsed.forEach(feature => {
      featureCounts[feature] = (featureCounts[feature] || 0) + 1;
    });
    
    const mostUsed = Object.entries(featureCounts)
      .sort(([, a], [, b]) => b - a)[0];
    
    if (mostUsed) {
      engagement.mostUsedFeature = mostUsed[0];
    }
    
    sessionStorage.setItem('currentEngagementMetrics', JSON.stringify(engagement));
  }

  trackMoodImprovement(beforeMood: number, afterMood: number): void {
    const improvement = afterMood - beforeMood;
    const engagement = this.getCurrentEngagementMetrics();
    
    // Calculate running average of mood improvement
    const currentAverage = engagement.averageMoodImprovement || 0;
    const sessionCount = (engagement.completedSessions || 0) + 1;
    const newAverage = (currentAverage * (sessionCount - 1) + improvement) / sessionCount;
    
    this.recordEngagementMetric('averageMoodImprovement', newAverage);
  }

  private schedulePeriodicReporting(): void {
    // Report metrics every 5 minutes
    setInterval(() => {
      this.saveMetrics();
      this.analyzePerformance();
    }, 5 * 60 * 1000);

    // Report metrics immediately after 30 seconds (to capture initial load)
    setTimeout(() => {
      this.saveMetrics();
    }, 30000);
  }

  private saveMetrics(): void {
    const currentMetrics = this.getCurrentMetrics();
    const currentEngagement = this.getCurrentEngagementMetrics();

    // Complete the metrics object
    const completeMetrics: PerformanceMetrics = {
      firstContentfulPaint: currentMetrics.firstContentfulPaint || 0,
      largestContentfulPaint: currentMetrics.largestContentfulPaint || 0,
      firstInputDelay: currentMetrics.firstInputDelay || 0,
      cumulativeLayoutShift: currentMetrics.cumulativeLayoutShift || 0,
      timeToInteractive: currentMetrics.timeToInteractive || 0,
      appLoadTime: currentMetrics.appLoadTime || 0,
      meditationStartTime: currentMetrics.meditationStartTime || 0,
      sessionCompletionRate: currentMetrics.sessionCompletionRate || 0,
      navigationTiming: currentMetrics.navigationTiming || 0,
      errorRate: currentMetrics.errorRate || 0,
      sessionDuration: currentEngagement.dailyActiveTime || 0,
      pagesPerSession: 1, // Simplified for SPA
      bounceRate: currentEngagement.skippedSessions || 0,
      meditationCompletionRate: currentMetrics.meditationCompletionRate || 0,
      averageSessionLength: currentMetrics.averageSessionLength || 0,
      streakConsistency: this.calculateStreakConsistency(),
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      connection: this.getConnectionType(),
      deviceType: this.getDeviceType()
    };

    // Store in localStorage
    const storedMetrics = JSON.parse(localStorage.getItem('performanceMetrics') || '[]');
    storedMetrics.push(completeMetrics);
    
    // Keep only last 100 metrics
    if (storedMetrics.length > 100) {
      storedMetrics.splice(0, storedMetrics.length - 100);
    }
    
    localStorage.setItem('performanceMetrics', JSON.stringify(storedMetrics));
  }

  private calculateStreakConsistency(): number {
    // Get meditation history from localStorage
    const history = JSON.parse(localStorage.getItem('meditationHistory') || '[]');
    if (history.length === 0) return 0;

    // Calculate consistency over last 30 days
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentSessions = history.filter((session: any) => session.timestamp > thirtyDaysAgo);
    
    // Simple consistency metric: sessions per day over last 30 days
    const daysWithSessions = new Set(
      recentSessions.map((session: any) => 
        new Date(session.timestamp).toDateString()
      )
    ).size;
    
    return (daysWithSessions / 30) * 100;
  }

  private getConnectionType(): string {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    return connection?.effectiveType || 'unknown';
  }

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width <= 768) return 'mobile';
    if (width <= 1024) return 'tablet';
    return 'desktop';
  }

  private analyzePerformance(): void {
    const metrics = this.getCurrentMetrics();
    const warnings: string[] = [];

    // Analyze Core Web Vitals
    if (metrics.largestContentfulPaint && metrics.largestContentfulPaint > 2500) {
      warnings.push('LCP is poor (>2.5s)');
    }
    if (metrics.firstInputDelay && metrics.firstInputDelay > 100) {
      warnings.push('FID is poor (>100ms)');
    }
    if (metrics.cumulativeLayoutShift && metrics.cumulativeLayoutShift > 0.1) {
      warnings.push('CLS is poor (>0.1)');
    }

    if (warnings.length > 0) {
      console.warn('Performance issues detected:', warnings);
    }
  }

  // Public method to get performance report
  getPerformanceReport(): {
    currentMetrics: Partial<PerformanceMetrics>;
    historicalMetrics: PerformanceMetrics[];
    engagementMetrics: Partial<UserEngagementMetrics>;
    errorMetrics: ErrorMetrics[];
    slowOperations: any[];
  } {
    return {
      currentMetrics: this.getCurrentMetrics(),
      historicalMetrics: JSON.parse(localStorage.getItem('performanceMetrics') || '[]'),
      engagementMetrics: this.getCurrentEngagementMetrics(),
      errorMetrics: JSON.parse(localStorage.getItem('errorMetrics') || '[]'),
      slowOperations: JSON.parse(localStorage.getItem('slowOperations') || '[]')
    };
  }

  // Method to export metrics for analysis
  exportMetrics(): string {
    const report = this.getPerformanceReport();
    return JSON.stringify(report, null, 2);
  }
}

// Export singleton instance
export const performanceMonitoringService = new PerformanceMonitoringService();
export default PerformanceMonitoringService;