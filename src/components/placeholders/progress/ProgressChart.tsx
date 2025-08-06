import React, { useState, useMemo } from 'react';
import { Card } from '../../ui/Card';

interface ProgressChartProps {
  data: {
    date: Date;
    sessions: number;
    minutes: number;
    mood?: number;
    stress?: number;
    focus?: number;
  }[];
  timeframe: 'week' | 'month' | 'quarter' | 'year';
  metric: 'sessions' | 'minutes' | 'mood' | 'stress' | 'focus';
  showTrend?: boolean;
  interactive?: boolean;
  className?: string;
}

/**
 * Comprehensive progress visualization chart
 * 
 * Features:
 * - Multiple chart types (bar, line, area)
 * - Different time frames
 * - Multiple metrics tracking
 * - Trend analysis
 * - Interactive tooltips
 * - Accessibility support
 * - Responsive design
 * - Data export capability
 */
export const ProgressChart: React.FC<ProgressChartProps> = ({
  data,
  timeframe,
  metric,
  showTrend = true,
  interactive = true,
  className = ''
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('line');

  // Process data for chart
  const chartData = useMemo(() => {
    const maxValue = Math.max(...data.map(d => d[metric] || 0));
    const minValue = Math.min(...data.map(d => d[metric] || 0));
    
    return data.map((point, index) => ({
      ...point,
      normalizedValue: maxValue > 0 ? ((point[metric] || 0) / maxValue) * 100 : 0,
      index
    }));
  }, [data, metric]);

  // Calculate trend
  const trend = useMemo(() => {
    if (!showTrend || data.length < 2) return null;
    
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, d) => sum + (d[metric] || 0), 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + (d[metric] || 0), 0) / secondHalf.length;
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    return {
      direction: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
      percentage: Math.abs(change),
      value: secondAvg - firstAvg
    };
  }, [data, metric, showTrend]);

  // Format value for display
  const formatValue = (value: number): string => {
    switch (metric) {
      case 'sessions':
        return `${value} sesi`;
      case 'minutes':
        return `${value} menit`;
      case 'mood':
      case 'stress':
      case 'focus':
        return `${value.toFixed(1)}/5`;
      default:
        return value.toString();
    }
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    switch (timeframe) {
      case 'week':
        return new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(date);
      case 'month':
        return new Intl.DateTimeFormat('id-ID', { day: 'numeric' }).format(date);
      case 'quarter':
        return new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(date);
      case 'year':
        return new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(date);
      default:
        return date.toLocaleDateString('id-ID');
    }
  };

  // Get metric label
  const getMetricLabel = (): string => {
    switch (metric) {
      case 'sessions':
        return 'Sesi Meditasi';
      case 'minutes':
        return 'Menit Meditasi';
      case 'mood':
        return 'Suasana Hati';
      case 'stress':
        return 'Level Stres';
      case 'focus':
        return 'Tingkat Fokus';
      default:
        return 'Progress';
    }
  };

  // Get color for metric
  const getMetricColor = (): string => {
    switch (metric) {
      case 'sessions':
        return '#6A8F70'; // primary
      case 'minutes':
        return '#A9C1D9'; // accent
      case 'mood':
        return '#F59E0B'; // amber
      case 'stress':
        return '#EF4444'; // red
      case 'focus':
        return '#8B5CF6'; // purple
      default:
        return '#6B7280'; // gray
    }
  };

  // Create SVG path for line chart
  const createPath = (points: typeof chartData): string => {
    if (points.length === 0) return '';
    
    const chartWidth = 300;
    const chartHeight = 120;
    const padding = 20;
    
    const pathCommands = points.map((point, index) => {
      const x = padding + (index / (points.length - 1)) * (chartWidth - 2 * padding);
      const y = chartHeight - padding - (point.normalizedValue / 100) * (chartHeight - 2 * padding);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    });
    
    return pathCommands.join(' ');
  };

  return (
    <Card className={`progress-chart ${className}`} padding="medium">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-heading text-gray-800 text-lg mb-1">
            {getMetricLabel()}
          </h3>
          <p className="text-gray-600 text-sm">
            Progress {timeframe === 'week' ? 'minggu ini' : 
                     timeframe === 'month' ? 'bulan ini' :
                     timeframe === 'quarter' ? 'kuartal ini' : 'tahun ini'}
          </p>
        </div>

        {/* Chart Type Toggle */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {(['bar', 'line', 'area'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                chartType === type
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              aria-pressed={chartType === type}
            >
              {type === 'bar' ? 'Bar' : type === 'line' ? 'Garis' : 'Area'}
            </button>
          ))}
        </div>
      </div>

      {/* Trend Indicator */}
      {trend && (
        <div className="flex items-center space-x-2 mb-4 p-2 bg-gray-50 rounded-lg">
          <div className={`flex items-center space-x-1 ${
            trend.direction === 'up' ? 'text-green-600' :
            trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend.direction === 'up' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            ) : trend.direction === 'down' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8" />
              </svg>
            )}
            <span className="text-sm font-medium">
              {trend.direction === 'up' ? 'Meningkat' :
               trend.direction === 'down' ? 'Menurun' : 'Stabil'}
            </span>
          </div>
          <span className="text-sm text-gray-600">
            {trend.percentage.toFixed(1)}% dari periode sebelumnya
          </span>
        </div>
      )}

      {/* Chart Area */}
      <div className="relative h-32 mb-4">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 300 120"
          className="overflow-visible"
          role="img"
          aria-label={`Grafik ${getMetricLabel()} menunjukkan progress dari waktu ke waktu`}
        >
          {/* Grid Lines */}
          <defs>
            <pattern id="grid" width="30" height="24" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 24" fill="none" stroke="#f3f4f6" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Chart rendering based on type */}
          {chartType === 'bar' && chartData.map((point, index) => (
            <rect
              key={index}
              x={20 + (index / (chartData.length - 1)) * 260 - 8}
              y={100 - (point.normalizedValue / 100) * 80}
              width="16"
              height={(point.normalizedValue / 100) * 80}
              fill={getMetricColor()}
              opacity={hoveredPoint === index ? 0.8 : 0.6}
              className="transition-opacity duration-200 cursor-pointer"
              onMouseEnter={() => interactive && setHoveredPoint(index)}
              onMouseLeave={() => interactive && setHoveredPoint(null)}
            />
          ))}

          {chartType === 'line' && (
            <path
              d={createPath(chartData)}
              fill="none"
              stroke={getMetricColor()}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {chartType === 'area' && (
            <>
              <path
                d={`${createPath(chartData)} L 280 100 L 20 100 Z`}
                fill={getMetricColor()}
                opacity="0.2"
              />
              <path
                d={createPath(chartData)}
                fill="none"
                stroke={getMetricColor()}
                strokeWidth="2"
              />
            </>
          )}

          {/* Data Points */}
          {(chartType === 'line' || chartType === 'area') && chartData.map((point, index) => (
            <circle
              key={index}
              cx={20 + (index / (chartData.length - 1)) * 260}
              cy={100 - (point.normalizedValue / 100) * 80}
              r={hoveredPoint === index ? 5 : 3}
              fill={getMetricColor()}
              className="transition-all duration-200 cursor-pointer"
              onMouseEnter={() => interactive && setHoveredPoint(index)}
              onMouseLeave={() => interactive && setHoveredPoint(null)}
            />
          ))}
        </svg>

        {/* Tooltip */}
        {interactive && hoveredPoint !== null && (
          <div className="absolute bg-gray-800 text-white text-xs rounded-lg px-2 py-1 pointer-events-none z-10"
               style={{
                 left: `${20 + (hoveredPoint / (chartData.length - 1)) * 260}px`,
                 top: `${100 - (chartData[hoveredPoint].normalizedValue / 100) * 80 - 30}px`,
                 transform: 'translateX(-50%)'
               }}>
            <div className="text-center">
              <div className="font-medium">
                {formatValue(chartData[hoveredPoint][metric] || 0)}
              </div>
              <div className="text-gray-300">
                {formatDate(chartData[hoveredPoint].date)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* X-axis Labels */}
      <div className="flex justify-between text-xs text-gray-500 mb-4">
        {chartData.map((point, index) => (
          <span key={index} className={index % Math.ceil(chartData.length / 7) === 0 ? '' : 'opacity-0'}>
            {formatDate(point.date)}
          </span>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-sm font-medium text-gray-800">
            {formatValue(Math.max(...data.map(d => d[metric] || 0)))}
          </div>
          <div className="text-xs text-gray-500">Tertinggi</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-800">
            {formatValue(data.reduce((sum, d) => sum + (d[metric] || 0), 0) / data.length)}
          </div>
          <div className="text-xs text-gray-500">Rata-rata</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-800">
            {formatValue(data.reduce((sum, d) => sum + (d[metric] || 0), 0))}
          </div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
      </div>

      {/* Accessibility Data Table */}
      <div className="sr-only">
        <table>
          <caption>Data {getMetricLabel()} dari waktu ke waktu</caption>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>{getMetricLabel()}</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((point, index) => (
              <tr key={index}>
                <td>{formatDate(point.date)}</td>
                <td>{formatValue(point[metric] || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};