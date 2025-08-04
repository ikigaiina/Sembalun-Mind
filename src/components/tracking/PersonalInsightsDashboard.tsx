import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { progressService } from '../../services/progressService';
import { cairnService } from '../../services/cairnService';
import { courseService } from '../../services/courseService';
import type { UserProgressSummary } from '../../types/progress';
import { MoodTrends } from './MoodTrends';
import { StreakManager } from './StreakManager';
import { CertificateDisplay } from './CertificateDisplay';

interface PersonalInsightsDashboardProps {
  className?: string;
}

interface InsightCard {
  id: string;
  title: string;
  description: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  icon: string;
  color: string;
  actionText?: string;
  onClick?: () => void;
}

export const PersonalInsightsDashboard: React.FC<PersonalInsightsDashboardProps> = ({ 
  className = '' 
}) => {
  const { user } = useAuth();
  const [progressSummary, setProgressSummary] = useState<UserProgressSummary | null>(null);
  const [insights, setInsights] = useState<InsightCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [activeTab, setActiveTab] = useState<'overview' | 'mood' | 'streaks' | 'certificates'>('overview');

  const generateInsights = useCallback((
    summary: UserProgressSummary,
    sessionStats: {
      totalSessions: number;
      totalMinutes: number;
    },
    cairnStats: {
      activeCairns: number;
      completedCairns: number;
    },
    courseStats: {
      completedCourses: number;
      inProgressCourses: number;
      totalCertificates: number;
    }
  ) => {
    const insights: InsightCard[] = [
      {
        id: 'total_sessions',
        title: 'Total Sesi Meditasi',
        description: `${selectedPeriod === 'week' ? 'Minggu' : selectedPeriod === 'month' ? 'Bulan' : 'Tahun'} ini`,
        value: sessionStats.totalSessions,
        trend: sessionStats.totalSessions > 0 ? 'up' : 'stable',
        icon: '🧘',
        color: 'bg-blue-100 text-blue-600',
        actionText: 'Mulai Meditasi'
      },
      {
        id: 'total_minutes',
        title: 'Total Menit Meditasi',
        description: `${Math.round(sessionStats.totalMinutes / 60)} jam praktik`,
        value: `${sessionStats.totalMinutes}m`,
        trend: sessionStats.totalMinutes > 0 ? 'up' : 'stable',
        icon: '⏱️',
        color: 'bg-green-100 text-green-600'
      },
      {
        id: 'current_streak',
        title: 'Streak Saat Ini',
        description: summary.longestStreak > summary.currentStreak 
          ? `Terpanjang: ${summary.longestStreak} hari`
          : 'Record baru!',
        value: `${summary.currentStreak} hari`,
        trend: summary.currentStreak > 0 ? 'up' : 'stable',
        icon: '🔥',
        color: 'bg-orange-100 text-orange-600',
        actionText: 'Pertahankan'
      },
      {
        id: 'consistency_score',
        title: 'Skor Konsistensi',
        description: getConsistencyDescription(summary.consistencyScore),
        value: `${summary.consistencyScore}%`,
        trend: summary.consistencyScore >= 70 ? 'up' : summary.consistencyScore >= 40 ? 'stable' : 'down',
        icon: '📊',
        color: 'bg-purple-100 text-purple-600'
      },
      {
        id: 'completed_courses',
        title: 'Kursus Diselesaikan',
        description: `${courseStats.inProgressCourses} sedang berlangsung`,
        value: courseStats.completedCourses,
        trend: courseStats.completedCourses > 0 ? 'up' : 'stable',
        icon: '🎓',
        color: 'bg-indigo-100 text-indigo-600',
        actionText: 'Lihat Kursus'
      },
      {
        id: 'certificates',
        title: 'Sertifikat Diraih',
        description: 'Pencapaian pembelajaran',
        value: courseStats.totalCertificates,
        trend: courseStats.totalCertificates > 0 ? 'up' : 'stable',
        icon: '🏆',
        color: 'bg-yellow-100 text-yellow-600',
        actionText: 'Lihat Sertifikat'
      },
      {
        id: 'cairn_progress',
        title: 'Cairn Aktif',
        description: `${cairnStats.completedCairns} telah selesai`,
        value: cairnStats.activeCairns,
        trend: cairnStats.activeCairns > 0 ? 'up' : 'stable',
        icon: '⛰️',
        color: 'bg-teal-100 text-teal-600',
        actionText: 'Lihat Cairn'
      },
      {
        id: 'mood_trend',
        title: 'Tren Kesejahteraan',
        description: getMoodTrendDescription(summary.moodTrendScore),
        value: `${summary.moodTrendScore}%`,
        trend: summary.moodTrendScore >= 70 ? 'up' : summary.moodTrendScore >= 40 ? 'stable' : 'down',
        icon: '😊',
        color: 'bg-pink-100 text-pink-600',
        actionText: 'Catat Mood'
      }
    ];

    setInsights(insights);
  }, [selectedPeriod]);

  const loadDashboardData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [summary, sessionStats, cairnStats, courseStats] = await Promise.all([
        progressService.getUserProgressSummary(user.uid),
        progressService.getSessionStats(user.uid, selectedPeriod),
        cairnService.getUserCairnStats(user.uid),
        courseService.getCourseStats(user.uid)
      ]);

      setProgressSummary(summary);
      generateInsights(summary, sessionStats, cairnStats, courseStats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, selectedPeriod, generateInsights]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, loadDashboardData]);

  const getConsistencyDescription = (score: number) => {
    if (score >= 80) return 'Luar biasa konsisten!';
    if (score >= 60) return 'Konsistensi baik';
    if (score >= 40) return 'Perlu sedikit perbaikan';
    return 'Mari tingkatkan konsistensi';
  };

  const getMoodTrendDescription = (score: number) => {
    if (score >= 80) return 'Kesejahteraan sangat baik';
    if (score >= 60) return 'Mood dalam kondisi baik';
    if (score >= 40) return 'Mood cukup stabil';
    return 'Perhatikan kesejahteraan mental';
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

  const generateRecommendations = () => {
    if (!progressSummary) return [];

    const recommendations = [];

    if (progressSummary.currentStreak === 0) {
      recommendations.push({
        title: '🚀 Mulai Streak Baru',
        description: 'Bermeditasi hari ini untuk memulai streak konsistensi yang baru.',
        action: 'Mulai Meditasi'
      });
    }

    if (progressSummary.consistencyScore < 50) {
      recommendations.push({
        title: '📅 Tingkatkan Konsistensi',
        description: 'Coba tetapkan jadwal meditasi harian yang rutin.',
        action: 'Atur Jadwal'
      });
    }

    if (progressSummary.completedCourses === 0) {
      recommendations.push({
        title: '📚 Mulai Kursus Pertama',
        description: 'Ikuti kursus SIY untuk memperdalam praktik meditasi Anda.',
        action: 'Pilih Kursus'
      });
    }

    if (progressSummary.moodTrendScore < 60) {
      recommendations.push({
        title: '😊 Pantau Kesejahteraan',
        description: 'Catat mood Anda secara rutin untuk memahami pola emosional.',
        action: 'Catat Mood'
      });
    }

    return recommendations;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse space-y-6">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard Pribadi</h2>
            <p className="text-gray-600">
              {formatDate(new Date())}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {(['week', 'month', 'year'] as const).map(period => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  selectedPeriod === period
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {period === 'week' ? 'Minggu' : period === 'month' ? 'Bulan' : 'Tahun'}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'overview', label: 'Ringkasan', icon: '📊' },
            { id: 'mood', label: 'Mood', icon: '😊' },
            { id: 'streaks', label: 'Streak', icon: '🔥' },
            { id: 'certificates', label: 'Sertifikat', icon: '🏆' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'mood' | 'streaks' | 'certificates')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Insights Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {insights.map((insight) => {
              const trendInfo = getTrendIcon(insight.trend);
              
              return (
                <div
                  key={insight.id}
                  className={`${insight.color} rounded-xl p-4 hover:shadow-lg transition-all ${
                    insight.onClick ? 'cursor-pointer' : ''
                  }`}
                  onClick={insight.onClick}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-2xl">{insight.icon}</div>
                    <div className={`text-lg ${trendInfo.color}`}>
                      {trendInfo.icon}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {insight.title}
                    </h4>
                    <div className="text-2xl font-bold">
                      {insight.value}
                    </div>
                    <p className="text-xs opacity-80">
                      {insight.description}
                    </p>
                  </div>

                  {insight.actionText && (
                    <div className="mt-3">
                      <button className="text-xs font-medium hover:underline">
                        {insight.actionText} →
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              💡 Rekomendasi Personal
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generateRecommendations().map((rec, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4"
                >
                  <h4 className="font-medium text-gray-900 mb-2">
                    {rec.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {rec.description}
                  </p>
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                    {rec.action} →
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          {progressSummary && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📈 Statistik Keseluruhan
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-gray-900">
                    {progressSummary.totalSessions}
                  </div>
                  <div className="text-sm text-gray-600">Total Sesi</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(progressSummary.totalMinutes / 60)}h
                  </div>
                  <div className="text-sm text-gray-600">Total Waktu</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-gray-900">
                    {progressSummary.earnedCertificates}
                  </div>
                  <div className="text-sm text-gray-600">Sertifikat</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-gray-900">
                    {progressSummary.overallProgress}%
                  </div>
                  <div className="text-sm text-gray-600">Progress</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'mood' && <MoodTrends />}
      {activeTab === 'streaks' && <StreakManager />}
      {activeTab === 'certificates' && <CertificateDisplay />}
    </div>
  );
};