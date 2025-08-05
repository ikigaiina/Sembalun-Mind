/**
 * React Hooks for Performance Optimization
 * Provides specialized hooks for component performance tracking and optimization
 */

import { useEffect, useCallback, useRef, useMemo, useState } from 'react';
import { getPerformanceMonitor } from '../utils/performance';

// Performance tracking hook
export function usePerformanceTracking(componentName: string) {
  const monitor = getPerformanceMonitor();
  const mountTimeRef = useRef<number>(0);
  const renderCountRef = useRef<number>(0);

  useEffect(() => {
    mountTimeRef.current = performance.now();
    monitor.startComponentMeasure(componentName, 'mount');
    
    return () => {
      monitor.endComponentMeasure(componentName, 'unmount');
    };
  }, [componentName, monitor]);

  const trackRender = useCallback(() => {
    renderCountRef.current++;
    monitor.startComponentMeasure(componentName, 'update');
    
    // Use React's scheduler to measure after render
    const timeoutId = setTimeout(() => {
      monitor.endComponentMeasure(componentName, 'update');
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [componentName, monitor]);

  return {
    trackRender,
    renderCount: renderCountRef.current,
    mountTime: mountTimeRef.current
  };
}

// Memory leak detection hook
export function useMemoryLeakDetection(componentName: string, dependencies: any[] = []) {
  const monitor = getPerformanceMonitor();
  const timersRef = useRef<Set<number>>(new Set());
  const listenersRef = useRef<Set<{ element: Element; event: string; handler: EventListener }>>(new Set());

  // Track timers
  const safeSetTimeout = useCallback((callback: () => void, delay: number) => {
    const timerId = window.setTimeout(() => {
      timersRef.current.delete(timerId);
      callback();
    }, delay);
    timersRef.current.add(timerId);
    return timerId;
  }, []);

  const safeClearTimeout = useCallback((timerId: number) => {
    window.clearTimeout(timerId);
    timersRef.current.delete(timerId);
  }, []);

  // Track event listeners
  const safeAddEventListener = useCallback((element: Element, event: string, handler: EventListener, options?: boolean | AddEventListenerOptions) => {
    element.addEventListener(event, handler, options);
    listenersRef.current.add({ element, event, handler });
  }, []);

  // Cleanup on unmount or dependency change
  useEffect(() => {
    return () => {
      // Clear all timers
      timersRef.current.forEach(timerId => {
        window.clearTimeout(timerId);
      });
      timersRef.current.clear();

      // Remove all event listeners
      listenersRef.current.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
      listenersRef.current.clear();
    };
  }, dependencies);

  // Report potential leaks
  useEffect(() => {
    const checkLeaks = () => {
      if (timersRef.current.size > 10) {
        console.warn(`${componentName}: Potential timer leak detected (${timersRef.current.size} active timers)`);
      }
      if (listenersRef.current.size > 20) {
        console.warn(`${componentName}: Potential listener leak detected (${listenersRef.current.size} active listeners)`);
      }
    };

    const intervalId = setInterval(checkLeaks, 30000); // Check every 30 seconds
    return () => clearInterval(intervalId);
  }, [componentName]);

  return {
    safeSetTimeout,
    safeClearTimeout,
    safeAddEventListener,
    activeTimers: timersRef.current.size,
    activeListeners: listenersRef.current.size
  };
}

// React render optimization hook
export function useRenderOptimization<T extends Record<string, any>>(
  deps: T,
  options: { skipMemorization?: boolean; debugName?: string } = {}
) {
  const { skipMemorization = false, debugName = 'unknown' } = options;
  const renderCountRef = useRef<number>(0);
  const lastDepsRef = useRef<T>(deps);
  const [forceUpdate, setForceUpdate] = useState<number>(0);

  // Track unnecessary re-renders
  const hasChanged = useMemo(() => {
    renderCountRef.current++;
    
    if (skipMemorization) return true;

    const changed = Object.keys(deps).some(key => {
      const hasChangedValue = deps[key] !== lastDepsRef.current[key];
      if (hasChangedValue && process.env.NODE_ENV === 'development') {
        console.log(`${debugName}: Re-render caused by ${key}`, {
          old: lastDepsRef.current[key],
          new: deps[key]
        });
      }
      return hasChangedValue;
    });

    lastDepsRef.current = deps;
    return changed;
  }, [deps, skipMemorization, debugName]);

  // Memoized values to prevent unnecessary re-renders
  const memoizedDeps = useMemo(() => deps, Object.values(deps));

  const forceRender = useCallback(() => {
    setForceUpdate(prev => prev + 1);
  }, []);

  return {
    hasChanged,
    renderCount: renderCountRef.current,
    memoizedDeps,
    forceRender,
    shouldUpdate: hasChanged || forceUpdate > 0
  };
}

// Bundle size analysis hook
export function useBundleAnalysis() {
  const [bundleSize, setBundleSize] = useState<number>(0);
  const [analysisComplete, setAnalysisComplete] = useState<boolean>(false);

  useEffect(() => {
    const analyzeBundleSize = async () => {
      const monitor = getPerformanceMonitor();
      const size = await monitor.getBundleSize();
      setBundleSize(size);
      setAnalysisComplete(true);
    };

    analyzeBundleSize();
  }, []);

  const getBundleReport = useCallback(() => {
    const sizeInMB = bundleSize / (1024 * 1024);
    const isOptimal = sizeInMB < 1; // Under 1MB is optimal
    const gzippedEstimate = bundleSize * 0.3; // Rough gzip estimation
    
    return {
      totalSize: bundleSize,
      sizeInMB: Math.round(sizeInMB * 100) / 100,
      gzippedSize: Math.round(gzippedEstimate),
      gzippedMB: Math.round((gzippedEstimate / (1024 * 1024)) * 100) / 100,
      isOptimal,
      recommendations: isOptimal ? [] : [
        'Consider implementing code splitting',
        'Review and remove unused dependencies', 
        'Optimize asset sizes (images, fonts)',
        'Use dynamic imports for large features'
      ]
    };
  }, [bundleSize]);

  return {
    bundleSize,
    analysisComplete,
    getBundleReport
  };
}

// Animation performance hook
export function useAnimationOptimization() {
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);
  const requestIdRef = useRef<number>();

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const requestOptimizedAnimationFrame = useCallback((callback: FrameRequestCallback) => {
    if (isReducedMotion) {
      // Skip animation for reduced motion preference
      return requestAnimationFrame(() => callback(performance.now()));
    }

    // Standard animation frame request
    requestIdRef.current = requestAnimationFrame(callback);
    return requestIdRef.current;
  }, [isReducedMotion]);

  const cancelOptimizedAnimationFrame = useCallback(() => {
    if (requestIdRef.current) {
      cancelAnimationFrame(requestIdRef.current);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelOptimizedAnimationFrame();
    };
  }, [cancelOptimizedAnimationFrame]);

  return {
    isReducedMotion,
    requestOptimizedAnimationFrame,
    cancelOptimizedAnimationFrame,
    getAnimationDuration: (defaultDuration: number) => isReducedMotion ? 0.01 : defaultDuration
  };
}

// Audio performance hook
export function useAudioPerformance(audioSources: string[]) {
  const [preloadStatus, setPreloadStatus] = useState<Map<string, 'loading' | 'loaded' | 'error'>>(new Map());
  const [cacheHitRate, setCacheHitRate] = useState<number>(0);
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  const preloadAudio = useCallback(async (sources: string[]) => {
    const monitor = getPerformanceMonitor();
    const loadPromises = sources.map(async (src) => {
      const startTime = performance.now();
      setPreloadStatus(prev => new Map(prev.set(src, 'loading')));

      try {
        const audio = new Audio();
        await new Promise<void>((resolve, reject) => {
          audio.addEventListener('canplaythrough', () => resolve());
          audio.addEventListener('error', reject);
          audio.preload = 'auto';
          audio.src = src;
        });

        audioElementsRef.current.set(src, audio);
        setPreloadStatus(prev => new Map(prev.set(src, 'loaded')));
        
        // Track load performance
        monitor.measureAudioLoad(src, startTime);
        
        // Update cache hit rate
        const loadTime = performance.now() - startTime;
        const isCacheHit = loadTime < 100; // Assume cache if < 100ms
        setCacheHitRate(prev => isCacheHit ? (prev + 1) / 2 : prev * 0.9);
        
      } catch (error) {
        setPreloadStatus(prev => new Map(prev.set(src, 'error')));
        console.warn(`Failed to preload audio: ${src}`, error);
      }
    });

    await Promise.allSettled(loadPromises);
  }, []);

  useEffect(() => {
    if (audioSources.length > 0) {
      preloadAudio(audioSources);
    }
  }, [audioSources, preloadAudio]);

  const getOptimizedAudio = useCallback((src: string): HTMLAudioElement | null => {
    return audioElementsRef.current.get(src) || null;
  }, []);

  const getPreloadReport = useCallback(() => {
    const total = audioSources.length;
    const loaded = Array.from(preloadStatus.values()).filter(status => status === 'loaded').length;
    const errors = Array.from(preloadStatus.values()).filter(status => status === 'error').length;
    
    return {
      total,
      loaded,
      errors,
      loading: total - loaded - errors,
      successRate: total > 0 ? loaded / total : 0,
      cacheHitRate
    };
  }, [audioSources.length, preloadStatus, cacheHitRate]);

  return {
    preloadStatus,
    getOptimizedAudio,
    getPreloadReport,
    isAllLoaded: audioSources.every(src => preloadStatus.get(src) === 'loaded')
  };
}

// Touch performance optimization hook
export function useTouchOptimization() {
  useEffect(() => {
    // Add CSS for better touch performance
    const style = document.createElement('style');
    style.id = 'touch-optimization-styles';
    style.textContent = `
      .touch-optimized {
        -webkit-touch-callout: none;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
        user-select: none;
      }
      
      .touch-optimized:active {
        transform: scale(0.98);
        transition: transform 0.1s ease;
      }
      
      @media (hover: none) and (pointer: coarse) {
        .touch-optimized {
          min-height: 44px;
          min-width: 44px;
        }
      }
    `;

    if (!document.getElementById('touch-optimization-styles')) {
      document.head.appendChild(style);
    }

    return () => {
      const existingStyle = document.getElementById('touch-optimization-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  const addTouchOptimization = useCallback((element: HTMLElement | null) => {
    if (element) {
      element.classList.add('touch-optimized');
    }
  }, []);

  const removeTouchOptimization = useCallback((element: HTMLElement | null) => {
    if (element) {
      element.classList.remove('touch-optimized');
    }
  }, []);

  return {
    addTouchOptimization,
    removeTouchOptimization
  };
}

// Overall performance dashboard hook
export function usePerformanceDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [optimizationReport, setOptimizationReport] = useState<any>(null);

  const refreshMetrics = useCallback(() => {
    const monitor = getPerformanceMonitor();
    const currentMetrics = monitor.getMetrics();
    const report = monitor.generateOptimizationReport();
    
    setMetrics(currentMetrics);
    setOptimizationReport(report);
  }, []);

  useEffect(() => {
    refreshMetrics();
    
    // Refresh metrics every 10 seconds
    const interval = setInterval(refreshMetrics, 10000);
    return () => clearInterval(interval);
  }, [refreshMetrics]);

  const getPerformanceScore = useCallback(() => {
    if (!metrics || !optimizationReport) return 0;
    
    let score = 100;
    
    // Time to Interactive penalty
    if (metrics.timeToInteractive > 3800) score -= 20;
    else if (metrics.timeToInteractive > 2300) score -= 10;
    
    // Memory usage penalty
    if (metrics.memoryUsage > 45) score -= 15;
    else if (metrics.memoryUsage > 32) score -= 7;
    
    // Slow components penalty
    score -= optimizationReport.slowComponents.length * 5;
    
    // Memory leaks penalty
    if (optimizationReport.memoryLeaks) score -= 25;
    
    // Bundle size penalty
    if (metrics.bundleSize > 2000000) score -= 15; // > 2MB
    else if (metrics.bundleSize > 1000000) score -= 8; // > 1MB
    
    return Math.max(0, Math.min(100, score));
  }, [metrics, optimizationReport]);

  return {
    metrics,
    optimizationReport,
    refreshMetrics,
    performanceScore: getPerformanceScore(),
    isLoading: !metrics || !optimizationReport
  };
}