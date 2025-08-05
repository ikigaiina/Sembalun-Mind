/**
 * Performance Dashboard Component
 * Displays real-time performance metrics and optimization recommendations
 */

import React, { useState } from 'react';
import { usePerformanceDashboard, useBundleAnalysis } from '../../hooks/usePerformanceOptimization';

interface PerformanceDashboardProps {
  className?: string;
  showDetailed?: boolean;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  className = '',
  showDetailed = false
}) => {
  const { metrics, optimizationReport, refreshMetrics, performanceScore, isLoading } = usePerformanceDashboard();
  const { getBundleReport, analysisComplete } = useBundleAnalysis();
  const [showRecommendations, setShowRecommendations] = useState(false);

  if (isLoading || !metrics || !optimizationReport) {
    return (
      <div className={`p-6 bg-white rounded-lg shadow-sm ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const bundleReport = analysisComplete ? getBundleReport() : null;
  // const getScoreColor = (score: number) => {
  //   if (score >= 80) return 'text-green-600';
  //   if (score >= 60) return 'text-yellow-600';
  //   return 'text-red-600';
  // };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className={`p-6 bg-white rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Performance Dashboard</h3>
            <p className="text-sm text-gray-600">Real-time optimization metrics</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBadge(performanceScore)}`}>
            Score: {Math.round(performanceScore)}
          </div>
          <button
            onClick={refreshMetrics}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            title="Refresh metrics"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Time to Interactive */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Time to Interactive</p>
              <p className={`text-2xl font-bold ${metrics.timeToInteractive > 3800 ? 'text-red-600' : metrics.timeToInteractive > 2300 ? 'text-yellow-600' : 'text-green-600'}`}>
                {(metrics.timeToInteractive / 1000).toFixed(1)}s
              </p>
            </div>
            <div className="text-xs text-gray-500">
              Target: 2.3s
            </div>
          </div>
          {metrics.timeToInteractive > 2300 && (
            <div className="mt-2 text-xs text-red-600">
              {((metrics.timeToInteractive - 2300) / 1000).toFixed(1)}s over target
            </div>
          )}
        </div>

        {/* Memory Usage */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Memory Usage</p>
              <p className={`text-2xl font-bold ${metrics.memoryUsage > 45 ? 'text-red-600' : metrics.memoryUsage > 32 ? 'text-yellow-600' : 'text-green-600'}`}>
                {Math.round(metrics.memoryUsage)}MB
              </p>
            </div>
            <div className="text-xs text-gray-500">
              Target: 32MB
            </div>
          </div>
          {metrics.memoryUsage > 32 && (
            <div className="mt-2 text-xs text-red-600">
              {Math.round(metrics.memoryUsage - 32)}MB over target
            </div>
          )}
        </div>

        {/* Component Renders */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Render Count</p>
              <p className="text-2xl font-bold text-blue-600">
                {metrics.renderCount}
              </p>
            </div>
            <div className="text-xs text-gray-500">
              Total
            </div>
          </div>
          {optimizationReport.slowComponents.length > 0 && (
            <div className="mt-2 text-xs text-yellow-600">
              {optimizationReport.slowComponents.length} slow components
            </div>
          )}
        </div>

        {/* Bundle Size */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bundle Size</p>
              <p className={`text-2xl font-bold ${bundleReport && !bundleReport.isOptimal ? 'text-yellow-600' : 'text-green-600'}`}>
                {bundleReport ? bundleReport.sizeInMB : (metrics.bundleSize / (1024 * 1024)).toFixed(1)}MB
              </p>
            </div>
            <div className="text-xs text-gray-500">
              {bundleReport ? `${bundleReport.gzippedMB}MB gzipped` : 'Analyzing...'}
            </div>
          </div>
        </div>
      </div>

      {/* Audio Performance */}
      {metrics.audio && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Audio Performance</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Load Time:</span>
              <span className="ml-2 font-medium">{Math.round(metrics.audio.loadTime)}ms</span>
            </div>
            <div>
              <span className="text-blue-700">Cache Hit Rate:</span>
              <span className="ml-2 font-medium">{Math.round(metrics.audio.cacheHitRate * 100)}%</span>
            </div>
            <div>
              <span className="text-blue-700">Buffer Health:</span>
              <span className="ml-2 font-medium">{Math.round(metrics.audio.bufferHealth * 100)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Component Metrics */}
      {showDetailed && metrics.components && metrics.components.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Component Performance</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {metrics.components.map((component: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{component.name}</div>
                  <div className="text-xs text-gray-600">
                    {component.renderCount} renders • Avg: {component.averageRenderTime.toFixed(1)}ms
                  </div>
                </div>
                {component.averageRenderTime > 16 && (
                  <div className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                    Slow
                  </div>
                )}
                {component.memoryLeaks && (
                  <div className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded ml-2">
                    Memory Leak
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {optimizationReport.recommendations.length > 0 && (
        <div>
          <button
            onClick={() => setShowRecommendations(!showRecommendations)}
            className="flex items-center justify-between w-full p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-sm font-medium text-orange-900">
                {optimizationReport.recommendations.length} Optimization Recommendations
              </span>
            </div>
            <svg 
              className={`w-4 h-4 text-orange-600 transform transition-transform ${showRecommendations ? 'rotate-180' : ''}`} 
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showRecommendations && (
            <div className="mt-3 space-y-2">
              {optimizationReport.recommendations.map((recommendation: string, index: number) => (
                <div key={index} className="flex items-start space-x-2 p-3 bg-white border border-orange-200 rounded">
                  <div className="w-4 h-4 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs text-orange-600 font-bold">{index + 1}</span>
                  </div>
                  <p className="text-sm text-gray-700 flex-1">{recommendation}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Last updated: {new Date(metrics.lastUpdated).toLocaleTimeString()}</span>
          <span>Performance monitoring active</span>
        </div>
      </div>
    </div>
  );
};