import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { progressService } from '../../services/progressService';
import type { MeditationSession } from '../../types/progress';

interface MeditationStatisticsProps {
  className?: string;
}

interface StatCard {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  icon: string;
  color: string;
  subtitle?: string;
}

interface TrendData {
  date: string;
  sessions: number;
  minutes: number;
  quality: number;
}

const getStartDate = (period: string): Date => {
  const now = new Date();
  const start = new Date(now);

  switch (period) {
    case 'week':
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      start.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 1);
      break;
  }

  return start;
};

const getPreviousStartDate = (period: string, currentStart: Date): Date => {
  const previous = new Date(currentStart);

  switch (period) {
    case 'week':
      previous.setDate(previous.getDate() - 7);
      break;
    case 'month':
      previous.setMonth(previous.getMonth() - 1);
      break;
    case 'quarter':
      previous.setMonth(previous.getMonth() - 3);
      break;
    case 'year':
      previous.setFullYear(previous.getFullYear() - 1);
      break;
  }

  return previous;
};

const getPeriodLabel = (period: string): string => {
  const labels = {
    week: 'Minggu',
    month: 'Bulan',
    quarter: 'Kuartal',
    year: 'Tahun'
  };
  return labels[period as keyof typeof labels] || 'Periode';
};

const getConsistencyScore = (sessions: MeditationSession[], period: string): string => {
  if (sessions.length === 0) return '0%';

  const days = period === 'week' ? 7 : period === 'month' ? 30 : period === 'quarter' ? 90 : 365;
  const uniqueDays = new Set(sessions.map(s => s.completedAt.toDateString())).size;
  const score = Math.round((uniqueDays / days) * 100);
  
  return `${Math.min(score, 100)}%`;
};

const generateTechniqueStatistics = (sessions: MeditationSession[]) => {
  const techniqueMap: { [technique: string]: { count: number; qualities: number[]; minutes: number } } = {};

  sessions.forEach(session => {
    session.techniques.forEach(technique => {
      if (!techniqueMap[technique]) {
        techniqueMap[technique] = { count: 0, qualities: [], minutes: 0 };
      }
      techniqueMap[technique].count++;
      techniqueMap[technique].qualities.push(session.quality);
      techniqueMap[technique].minutes += Math.floor(session.duration / 60);
    });
  });

  return Object.entries(techniqueMap)
    .map(([technique, data]) => ({
      technique,
      count: data.count,
      avgQuality: Math.round((data.qualities.reduce((sum, q) => sum + q, 0) / data.qualities.length) * 10) / 10,
      totalMinutes: data.minutes
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
};

const generateTimeStatistics = (sessions: MeditationSession[]) => {
  const hourMap: { [hour: number]: { count: number; qualities: number[] } } = {};

  sessions.forEach(session => {
    const hour = session.completedAt.getHours();
    if (!hourMap[hour]) {
      hourMap[hour] = { count: 0, qualities: [] };
    }
    hourMap[hour].count++;
    hourMap[hour].qualities.push(session.quality);
  });

  return Object.entries(hourMap)
    .map(([hour, data]) => ({
      hour: parseInt(hour),
      count: data.count,
      avgQuality: Math.round((data.qualities.reduce((sum, q) => sum + q, 0) / data.qualities.length) * 10) / 10
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
};

const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
  switch (trend) {
    case 'up':
      return { icon: '📈', color: 'text-green-500' };
    case 'down':
      return { icon: '📉', color: 'text-red-500' };
    case 'stable':
      return { icon: '➡️', color: 'text-gray-500' };
    default:
      return { icon: '➡️', color: 'text-gray-500' };
  }
};

const getTimeLabel = (hour: number): string => {
  if (hour < 6) return `${hour}:00 (Dini Hari)`;
  if (hour < 12) return `${hour}:00 (Pagi)`;
  if (hour < 18) return `${hour}:00 (Siang)`;
  return `${hour}:00 (Malam)`;
};

const generateStatistics = (currentSessions: MeditationSession[], previousSessions: MeditationSession[], period: string): StatCard[] => {
  // Current period calculations
  const totalSessions = currentSessions.length;
  const totalMinutes = currentSessions.reduce((sum, s) => sum + Math.floor(s.duration / 60), 0);
  const avgQuality = currentSessions.length > 0 
    ? currentSessions.reduce((sum, s) => sum + s.quality, 0) / currentSessions.length 
    : 0;
  const completionRate = currentSessions.length > 0
    ? (currentSessions.filter(s => s.duration >= s.targetDuration * 0.8).length / currentSessions.length) * 100
    : 0;

  // Previous period calculations for comparison
  const prevTotalSessions = previousSessions.length;
  const prevTotalMinutes = previousSessions.reduce((sum, s) => sum + Math.floor(s.duration / 60), 0);
  const prevAvgQuality = previousSessions.length > 0 
    ? previousSessions.reduce((sum, s) => sum + s.quality, 0) / previousSessions.length 
    : 0;

  // Calculate changes
  const sessionsChange = prevTotalSessions > 0 
    ? ((totalSessions - prevTotalSessions) / prevTotalSessions) * 100 
    : 0;
  const minutesChange = prevTotalMinutes > 0 
    ? ((totalMinutes - prevTotalMinutes) / prevTotalMinutes) * 100 
    : 0;
  const qualityChange = prevAvgQuality > 0 
    ? ((avgQuality - prevAvgQuality) / prevAvgQuality) * 100 
    : 0;

  return [
    {
      title: 'Total Sesi',
      value: totalSessions,
      change: Math.round(sessionsChange),
      trend: sessionsChange > 5 ? 'up' : sessionsChange < -5 ? 'down' : 'stable',
      icon: '🧘',
      color: 'bg-blue-100 text-blue-600',
      subtitle: `${getPeriodLabel(period)} ini`
    },
    {
      title: 'Total Menit',
      value: totalMinutes,
      change: Math.round(minutesChange),
      trend: minutesChange > 5 ? 'up' : minutesChange < -5 ? 'down' : 'stable',
      icon: '⏱️',
      color: 'bg-green-100 text-green-600',
      subtitle: `${Math.round(totalMinutes / 60 * 10) / 10} jam praktik`
    },
    {
      title: 'Kualitas Rata-rata',
      value: `${Math.round(avgQuality * 10) / 10}/5`,
      change: Math.round(qualityChange),
      trend: qualityChange > 2 ? 'up' : qualityChange < -2 ? 'down' : 'stable',
      icon: '⭐',
      color: 'bg-yellow-100 text-yellow-600',
      subtitle: 'Rating subjektif sesi'
    },
    {
      title: 'Tingkat Penyelesaian',
      value: `${Math.round(completionRate)}%`,
      trend: completionRate >= 80 ? 'up' : completionRate >= 60 ? 'stable' : 'down',
      icon: '✅',
      color: 'bg-purple-100 text-purple-600',
      subtitle: 'Sesi diselesaikan dengan baik'
    },
    {
      title: 'Rata-rata per Sesi',
      value: `${totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0} menit`,
      icon: '📊',
      color: 'bg-indigo-100 text-indigo-600',
      subtitle: 'Durasi rata-rata sesi'
    },
    {
      title: 'Konsistensi',
      value: getConsistencyScore(currentSessions, period),
      icon: '🎯',
      color: 'bg-teal-100 text-teal-600',
      subtitle: 'Skor konsistensi praktik'
    }
  ];
};

const generateTrendData = (sessions: MeditationSession[], period: string): TrendData[] => {
  const trends: TrendData[] = [];
  const startDate = getStartDate(period);
  const now = new Date();

  // Generate date range based on period
  const intervals = period === 'week' ? 7 : period === 'month' ? 30 : period === 'quarter' ? 12 : 12;
  const intervalType = period === 'quarter' || period === 'year' ? 'week' : 'day';

  for (let i = 0; i < intervals; i++) {
    const date = new Date(startDate);
    
    if (intervalType === 'day') {
      date.setDate(startDate.getDate() + i);
    } else {
      date.setDate(startDate.getDate() + (i * 7));
    }

    if (date > now) break;

    const dateStr = intervalType === 'day' 
      ? date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
      : `Minggu ${Math.floor(i / 7) + 1}`;

    const daySessions = intervalType === 'day'
      ? sessions.filter(s => s.completedAt.toDateString() === date.toDateString())
      : sessions.filter(s => {
          const weekStart = new Date(date);
          const weekEnd = new Date(date);
          weekEnd.setDate(weekEnd.getDate() + 6);
          return s.completedAt >= weekStart && s.completedAt <= weekEnd;
        });

    const totalMinutes = daySessions.reduce((sum, s) => sum + Math.floor(s.duration / 60), 0);
    const avgQuality = daySessions.length > 0 
      ? daySessions.reduce((sum, s) => sum + s.quality, 0) / daySessions.length 
      : 0;

    trends.push({
      date: dateStr,
      sessions: daySessions.length,
      minutes: totalMinutes,
      quality: Math.round(avgQuality * 10) / 10
    });
  }

  return trends;
};

export const MeditationStatistics: React.FC<MeditationStatisticsProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [stats, setStats] = useState<StatCard[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [techniqueStats, setTechniqueStats] = useState<{ technique: string; count: number; avgQuality: number; totalMinutes: number }[]>([]);
  const [timeStats, setTimeStats] = useState<{ hour: number; count: number; avgQuality: number }[]>([]);

  const loadStatistics = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get sessions for selected period
      const startDate = getStartDate(selectedPeriod);
      const userSessions = await progressService.getMeditationSessions(user.uid, 1000);
      const periodSessions = userSessions.filter(session => session.completedAt >= startDate);
      setSessions(periodSessions);

      // Calculate comparison period for trends
      const previousStartDate = getPreviousStartDate(selectedPeriod, startDate);
      const previousSessions = userSessions.filter(session => 
        session.completedAt >= previousStartDate && session.completedAt < startDate
      );

      // Generate statistics
      const currentStats = generateStatistics(periodSessions, previousSessions, selectedPeriod);
      setStats(currentStats);

      // Generate trend data
      const trends = generateTrendData(periodSessions, selectedPeriod);
      setTrendData(trends);

      // Generate technique statistics
      const techniques = generateTechniqueStatistics(periodSessions);
      setTechniqueStats(techniques);

      // Generate time-of-day statistics
      const timeAnalysis = generateTimeStatistics(periodSessions);
      setTimeStats(timeAnalysis);

    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  }, [user, selectedPeriod]);

  useEffect(() => {
    if (user) {
      loadStatistics();
    }
  }, [user, loadStatistics]);

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse space-y-6">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Statistik Meditasi</h3>
          <p className="text-gray-600">Analisis mendalam praktik meditasi Anda</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {(['week', 'month', 'quarter', 'year'] as const).map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                selectedPeriod === period
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {getPeriodLabel(period)}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, index) => {
          const trendInfo = getTrendIcon(stat.trend);
          
          return (
            <div key={index} className={`${stat.color} rounded-xl p-4`}>
              <div className="flex items-start justify-between mb-3">
                <div className="text-2xl">{stat.icon}</div>
                {stat.change !== undefined && (
                  <div className={`flex items-center space-x-1 text-sm ${trendInfo.color}`}>
                    <span>{trendInfo.icon}</span>
                    <span>{stat.change > 0 ? '+' : ''}{stat.change}%</span>
                  </div>
                )}
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">
                  {stat.title}
                </h4>
                <div className="text-2xl font-bold mb-1">
                  {stat.value}
                </div>
                {stat.subtitle && (
                  <p className="text-xs opacity-80">
                    {stat.subtitle}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Trend Chart */}
      {trendData.length > 0 && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Tren Aktivitas</h4>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-end justify-between space-x-2 h-32">
              {trendData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="flex-1 flex items-end">
                    <div 
                      className="bg-blue-500 rounded-t-sm w-full min-h-[4px] transition-all hover:bg-blue-600"
                      style={{ 
                        height: `${Math.max(4, (data.sessions / Math.max(...trendData.map(d => d.sessions))) * 100)}%` 
                      }}
                      title={`${data.date}: ${data.sessions} sesi, ${data.minutes} menit, kualitas ${data.quality}`}
                    />
                  </div>
                  <div className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-left">
                    {data.date}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
              <span>Jumlah Sesi per {selectedPeriod === 'week' || selectedPeriod === 'month' ? 'Hari' : 'Minggu'}</span>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Sesi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Technique Analysis */}
      {techniqueStats.length > 0 && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Analisis Teknik</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {techniqueStats.map((technique, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900">{technique.technique}</h5>
                  <span className="text-sm text-gray-500">{technique.count}x</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Kualitas Rata-rata:</span>
                    <span className="font-medium">{technique.avgQuality}/5 ⭐</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Waktu:</span>
                    <span className="font-medium">{technique.totalMinutes} menit</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${(technique.count / Math.max(...techniqueStats.map(t => t.count))) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time of Day Analysis */}
      {timeStats.length > 0 && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Waktu Optimal Meditasi</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {timeStats.map((timeStat, index) => (
              <div key={index} className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900">{getTimeLabel(timeStat.hour)}</h5>
                  <span className="text-sm text-purple-600 font-medium">{timeStat.count} sesi</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Kualitas Rata-rata:</span>
                  <span className="font-medium text-purple-700">{timeStat.avgQuality}/5</span>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-purple-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${(timeStat.avgQuality / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-blue-900 mb-4">💡 Insight & Rekomendasi</h4>
        <div className="space-y-3 text-sm text-blue-800">
          {sessions.length === 0 && (
            <p>• Mulai praktik meditasi rutin untuk melihat insight yang lebih mendalam</p>
          )}
          
          {sessions.length > 0 && (
            <>
              {stats[0]?.trend === 'up' && (
                <p>• Luar biasa! Frekuensi meditasi Anda meningkat {stats[0].change}% dibanding periode sebelumnya</p>
              )}
              
              {techniqueStats.length > 0 && techniqueStats[0].count > techniqueStats[1]?.count * 2 && (
                <p>• Anda sangat fokus pada teknik "{techniqueStats[0].technique}". Coba variasikan dengan teknik lain untuk pengalaman yang lebih kaya</p>
              )}
              
              {timeStats.length > 0 && timeStats[0].avgQuality >= 4 && (
                <p>• Waktu optimal Anda untuk meditasi adalah {getTimeLabel(timeStats[0].hour).toLowerCase()} dengan kualitas rata-rata {timeStats[0].avgQuality}/5</p>
              )}
              
              {stats.find(s => s.title === 'Tingkat Penyelesaian')?.trend === 'down' && (
                <p>• Tingkat penyelesaian sesi menurun. Coba kurangi target durasi atau pilih sesi yang lebih sesuai dengan kondisi Anda</p>
              )}
              
              {parseInt(stats.find(s => s.title === 'Konsistensi')?.value.toString().replace('%', '') || '0') >= 70 && (
                <p>• Konsistensi Anda sangat baik! Pertahankan ritme ini untuk hasil yang optimal</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
