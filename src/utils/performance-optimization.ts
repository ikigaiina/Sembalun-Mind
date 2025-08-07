/**
 * Performance Optimization Utilities
 * 2025 Production-ready performance enhancements
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * Debounced callback hook for performance optimization
 */
export const useDebounceCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
};

/**
 * Intersection Observer hook for lazy loading
 */
export const useIntersectionObserver = (
  callback: () => void,
  options?: IntersectionObserverInit
) => {
  const targetRef = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          callback();
        }
      },
      { threshold: 0.1, ...options }
    );
    
    observer.observe(target);
    
    return () => {
      observer.unobserve(target);
    };
  }, [callback, options]);
  
  return targetRef;
};

/**
 * Optimized animation frame hook
 */
export const useAnimationFrame = (callback: () => void, running: boolean = true) => {
  const requestIdRef = useRef<number>();
  
  useEffect(() => {
    const animate = () => {
      callback();
      if (running) {
        requestIdRef.current = requestAnimationFrame(animate);
      }
    };
    
    if (running) {
      requestIdRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
      }
    };
  }, [callback, running]);
};

/**
 * Memory cleanup utility
 */
export const cleanupResources = () => {
  // Force garbage collection if available (dev environments)
  if (typeof window !== 'undefined' && 'gc' in window) {
    (window as any).gc();
  }
};

/**
 * Bundle size analyzer helper
 */
export const getBundleInfo = () => {
  const modules = performance.getEntriesByType('navigation');
  const resources = performance.getEntriesByType('resource');
  
  return {
    totalModules: modules.length,
    totalResources: resources.length,
    largestResource: resources.reduce((largest, resource) => 
      resource.transferSize > largest.transferSize ? resource : largest
    , resources[0]),
    loadTime: modules[0]?.loadEventEnd - modules[0]?.fetchStart || 0
  };
};