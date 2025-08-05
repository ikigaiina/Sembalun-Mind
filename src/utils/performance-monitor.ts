/**
 * Performance Monitor - Temporary stub
 * Will be restored after fixing build issues
 */

import React from 'react';

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  updateRenderMetrics(id: string, duration: number): void {
    // Stub implementation
  }

  getMetrics(): any {
    return {};
  }
}

export const usePerformanceTracking = (componentName: string) => {
  return {
    measureRender: () => {}
  };
};

export const withPerformanceTracking = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) => {
  return WrappedComponent;
};

export default PerformanceMonitor;