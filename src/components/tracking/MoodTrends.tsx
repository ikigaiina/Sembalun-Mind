import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { progressService } from '../../services/progressService';
import type { MoodEntry } from '../../types/progress';

interface MoodTrendsProps {
  className?: string;
}

interface TrendData {
  average: number;
  trend: 'improving' | 'declining' | 'stable';
  data: Array<{ date: Date; value: number }>;
}

export const MoodTrends: React.FC<MoodTrendsProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [trends, setTrends] = useState<{ [key: string]: TrendData }>({});
  const [recentMoods, setRecentMoods] = useState<MoodEntry[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<7 | 30 | 90>(30);
  const [loading, setLoading] = useState(true);

  const loadMoodTrends = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [trendsData, moodsData] = await Promise.all([
        progressService.getMoodTrends(user.uid, selectedPeriod),
        progressService.getMoodEntries(user.uid, selectedPeriod * 2)
      ]);

      setTrends(trendsData);
      setRecentMoods(moodsData.slice(0, 10)); // Last 10 entries
    } catch (error) {
      console.error('Error loading mood trends:', error);
    } finally {
      setLoading(false);
    }
  }, [user, selectedPeriod]);

  useEffect(() => {
    if (user) {
      loadMoodTrends();
    }
  }, [user, loadMoodTrends]);

  const getTrendIcon = (trend: 'improving' | 'declining' | 'stable') => {
    switch (trend) {
      case 'improving':
        return { icon: '📈', color: 'text-green-600', bg: 'bg-green-100' };
      case 'declining':
        return { icon: '📉', color: 'text-red-600', bg: 'bg-red-100' };
      case 'stable':
        return { icon: '➡️', color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const getTrendText = (trend: 'improving' | 'declining' | 'stable', metric: string) => {
    const isNegativeMetric = metric === 'stress' || metric === 'anxiety';
    
    switch (trend) {
      case 'improving':
        return isNegativeMetric ? 'Menurun (Baik!)' : 'Meningkat';
      case 'declining':
        return isNegativeMetric ? 'Meningkat' : 'Menurun';
      case 'stable':
        return 'Stabil';
    }
  };

  const getMetricLabel = (metric: string) => {
    const labels: { [key: string]: string } = {
      energy: 'Energi',
      stress: 'Stres',
      focus: 'Fokus',
      happiness: 'Kebahagiaan',
      anxiety: 'Kecemasan',
      gratitude: 'Rasa Syukur'
    };
    return labels[metric] || metric;
  };

  const getMetricIcon = (metric: string) => {
    const icons: { [key: string]: string } = {
      energy: '⚡',
      stress: '😰',
      focus: '🎯',
      happiness: '😊',
      anxiety: '😟',
      gratitude: '🙏'
    };
    return icons[metric] || '📊';
  };

  const getMoodLevel = (value: number) => {
    if (value >= 4.5) return { label: 'Sangat Tinggi', color: 'text-green-700' };
    if (value >= 3.5) return { label: 'Tinggi', color: 'text-green-600' };
    if (value >= 2.5) return { label: 'Sedang', color: 'text-yellow-600' };
    if (value >= 1.5) return { label: 'Rendah', color: 'text-orange-600' };
    return { label: 'Sangat Rendah', color: 'text-red-600' };
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getOverallMoodScore = () => {
    if (Object.keys(trends).length === 0) return 0;
    
    const positiveMetrics = ['energy', 'focus', 'happiness', 'gratitude'];
    const negativeMetrics = ['stress', 'anxiety'];
    
    let totalScore = 0;
    let metricCount = 0;
    
    positiveMetrics.forEach(metric => {
      if (trends[metric]) {
        totalScore += trends[metric].average;
        metricCount++;
      }
    });
    
    negativeMetrics.forEach(metric => {
      if (trends[metric]) {
        totalScore += (6 - trends[metric].average); // Invert negative metrics
        metricCount++;
      }
    });
    
    return metricCount > 0 ? Math.round((totalScore / metricCount) * 20) : 0; // Convert to 0-100 scale
  };

  const overallScore = getOverallMoodScore();

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Tren Suasana Hati</h3>
        <div className="flex items-center space-x-2">
          {[7, 30, 90].map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period as 7 | 30 | 90)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                selectedPeriod === period
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {period} hari
            </button>
          ))}
        </div>
      </div>

      {/* Overall Score */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Skor Kesejahteraan Keseluruhan</h4>
            <p className="text-sm text-gray-600">
              Berdasarkan rata-rata semua metrik suasana hati
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{overallScore}</div>
            <div className="text-sm text-gray-500">dari 100</div>
          </div>
        </div>
      </div>

      {/* Trend Cards */}
      {Object.keys(trends).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {Object.entries(trends).map(([metric, data]) => {
            const trendStyle = getTrendIcon(data.trend);
            const level = getMoodLevel(data.average);
            
            return (
              <div key={metric} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{getMetricIcon(metric)}</span>
                    <span className="font-medium text-gray-900">
                      {getMetricLabel(metric)}
                    </span>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${trendStyle.bg} ${trendStyle.color}`}>
                    {trendStyle.icon} {getTrendText(data.trend, metric)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {data.average.toFixed(1)}
                    </div>
                    <div className={`text-sm font-medium ${level.color}`}>
                      {level.label}
                    </div>
                  </div>

                  {/* Mini Chart */}
                  <div className="flex items-end space-x-1 h-8">
                    {data.data.slice(-7).map((point, index) => (
                      <div
                        key={index}
                        className="bg-blue-200 rounded-sm w-2"
                        style={{
                          height: `${(point.value / 5) * 100}%`,
                          minHeight: '4px'
                        }}
                        title={`${formatDate(point.date)}: ${point.value}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📊</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Belum Ada Data Tren
          </h4>
          <p className="text-gray-600 mb-4">
            Mulai catat suasana hati Anda untuk melihat tren dan perkembangan
          </p>
        </div>
      )}

      {/* Recent Mood Entries */}
      {recentMoods.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Catatan Mood Terbaru</h4>
          <div className="space-y-3">
            {recentMoods.slice(0, 5).map((mood) => (
              <div
                key={mood.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-sm font-medium text-gray-900">
                    {formatDate(mood.timestamp)}
                  </div>
                  {mood.tags.length > 0 && (
                    <div className="flex space-x-1">
                      {mood.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {mood.tags.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{mood.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 text-sm">
                  <span title={`Kebahagiaan: ${mood.happiness}`}>😊 {mood.happiness}</span>
                  <span title={`Stres: ${mood.stress}`}>😰 {mood.stress}</span>
                  <span title={`Energi: ${mood.energy}`}>⚡ {mood.energy}</span>
                </div>
              </div>
            ))}
          </div>

          {recentMoods.length > 5 && (
            <div className="text-center mt-4">
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Lihat Semua Catatan →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Insights */}
      {Object.keys(trends).length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <h4 className="font-medium text-blue-900 mb-2">💡 Wawasan</h4>
          <div className="space-y-2 text-sm text-blue-800">
            {trends.happiness && trends.happiness.trend === 'improving' && (
              <p>• Tingkat kebahagiaan Anda menunjukkan tren positif - pertahankan!</p>
            )}
            {trends.stress && trends.stress.trend === 'declining' && (
              <p>• Level stres Anda menurun - praktik meditasi berhasil!</p>
            )}
            {trends.focus && trends.focus.average >= 4 && (
              <p>• Fokus Anda sangat baik, terus konsisten bermeditasi.</p>
            )}
            {overallScore >= 80 && (
              <p>• Kesejahteraan mental Anda dalam kondisi sangat baik!</p>
            )}
            {overallScore < 60 && (
              <p>• Pertimbangkan untuk meningkatkan frekuensi meditasi untuk kesejahteraan yang lebih baik.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};