import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, Clock, Calendar, Target, Star,
  Mountain, Wind, Heart, Brain, Waves, Sun, Moon,
  PieChart, Activity, Award, Zap, Filter
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface MeditationSession {
  id: string;
  type: 'guided' | 'breathing' | 'indonesian' | 'mindfulness' | 'sleep';
  duration: number;
  completedAt: Date;
  culturalElement?: string;
  region?: string;
  rating?: number;
  mood?: string;
  notes?: string;
}

interface Props {
  sessions: MeditationSession[];
  className?: string;
}

export const MeditationAnalytics: React.FC<Props> = ({
  sessions = [],
  className = ''
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [selectedSessionType, setSelectedSessionType] = useState<string>('all');

  // Filter sessions based on selected period
  const filteredSessions = useMemo(() => {
    const now = new Date();
    let startDate = new Date();

    switch (selectedPeriod) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
    }

    let filtered = sessions.filter(session => session.completedAt >= startDate);
    
    if (selectedSessionType !== 'all') {
      filtered = filtered.filter(session => session.type === selectedSessionType);
    }

    return filtered;
  }, [sessions, selectedPeriod, selectedSessionType]);

  // Calculate analytics
  const analytics = useMemo(() => {
    const totalSessions = filteredSessions.length;
    const totalMinutes = filteredSessions.reduce((sum, session) => sum + session.duration, 0);
    
    // Session type distribution
    const typeDistribution = filteredSessions.reduce((acc, session) => {
      acc[session.type] = (acc[session.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Cultural sessions count
    const culturalSessions = filteredSessions.filter(session => 
      session.type === 'indonesian' || session.culturalElement
    ).length;

    // Average rating
    const ratingSessions = filteredSessions.filter(session => session.rating);
    const averageRating = ratingSessions.length > 0
      ? ratingSessions.reduce((sum, session) => sum + (session.rating || 0), 0) / ratingSessions.length
      : 0;

    // Duration breakdown
    const durationBreakdown = {
      short: filteredSessions.filter(s => s.duration <= 5).length,
      medium: filteredSessions.filter(s => s.duration > 5 && s.duration <= 15).length,
      long: filteredSessions.filter(s => s.duration > 15).length
    };

    // Weekly pattern (last 7 days)
    const weeklyPattern = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - index);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      return {
        date,
        sessions: filteredSessions.filter(session => 
          session.completedAt >= dayStart && session.completedAt <= dayEnd
        ).length
      };
    }).reverse();

    // Most popular session type
    const mostPopularType = Object.entries(typeDistribution)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'guided';

    return {
      totalSessions,
      totalMinutes,
      typeDistribution,
      culturalSessions,
      averageRating,
      durationBreakdown,
      weeklyPattern,
      mostPopularType,
      averageSessionLength: totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0
    };
  }, [filteredSessions]);

  const sessionTypeLabels = {
    guided: { label: 'Terpandu', icon: Brain, color: 'purple' },
    breathing: { label: 'Pernapasan', icon: Wind, color: 'blue' },
    indonesian: { label: 'Indonesia', icon: Mountain, color: 'amber' },
    mindfulness: { label: 'Mindfulness', icon: Heart, color: 'green' },
    sleep: { label: 'Tidur', icon: Moon, color: 'indigo' }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-heading font-bold text-gray-800">Analisis Meditasi</h2>
          <p className="text-gray-600">Wawasan mendalam tentang praktik meditasi Anda</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Period Selector */}
          <div className="flex rounded-lg overflow-hidden border border-gray-300">
            {(['week', 'month', 'quarter'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {period === 'week' ? '1M' : period === 'month' ? '1B' : '3B'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-blue-600 font-medium">Total</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{analytics.totalSessions}</div>
          <div className="text-sm text-blue-700">Sesi Meditasi</div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-500 rounded-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-green-600 font-medium">Waktu</span>
          </div>
          <div className="text-2xl font-bold text-green-900">
            {Math.floor(analytics.totalMinutes / 60)}j {analytics.totalMinutes % 60}m
          </div>
          <div className="text-sm text-green-700">Total Praktik</div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-amber-500 rounded-lg">
              <Mountain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-amber-600 font-medium">Budaya</span>
          </div>
          <div className="text-2xl font-bold text-amber-900">{analytics.culturalSessions}</div>
          <div className="text-sm text-amber-700">Sesi Indonesia</div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Star className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-purple-600 font-medium">Rating</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {analytics.averageRating > 0 ? analytics.averageRating.toFixed(1) : '—'}
          </div>
          <div className="text-sm text-purple-700">Rata-rata</div>
        </Card>
      </div>

      {/* Session Type Distribution */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Distribusi Jenis Sesi</h3>
          <PieChart className="w-5 h-5 text-gray-500" />
        </div>

        <div className="space-y-3">
          {Object.entries(analytics.typeDistribution).map(([type, count]) => {
            const typeInfo = sessionTypeLabels[type as keyof typeof sessionTypeLabels] || 
              { label: type, icon: Activity, color: 'gray' };
            const percentage = analytics.totalSessions > 0 ? (count / analytics.totalSessions) * 100 : 0;
            
            return (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-${typeInfo.color}-100`}>
                    <typeInfo.icon className={`w-4 h-4 text-${typeInfo.color}-600`} />
                  </div>
                  <span className="font-medium text-gray-700">{typeInfo.label}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <motion.div
                      className={`bg-${typeInfo.color}-500 h-2 rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                  <div className="text-sm font-semibold text-gray-900 w-8 text-right">{count}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Weekly Activity Pattern */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Pola Aktivitas Mingguan</h3>
          <BarChart3 className="w-5 h-5 text-gray-500" />
        </div>

        <div className="space-y-3">
          {analytics.weeklyPattern.map((day, index) => {
            const dayName = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][day.date.getDay()];
            const maxSessions = Math.max(...analytics.weeklyPattern.map(d => d.sessions));
            const percentage = maxSessions > 0 ? (day.sessions / maxSessions) * 100 : 0;
            
            return (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-8 text-sm text-gray-600 text-center">{dayName}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  />
                </div>
                <div className="w-8 text-sm text-gray-700 text-right">{day.sessions}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Duration Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Durasi Sesi</h3>
            <Clock className="w-5 h-5 text-gray-500" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Pendek (≤5m)</span>
              </div>
              <span className="font-bold text-green-900">{analytics.durationBreakdown.short}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">Sedang (5-15m)</span>
              </div>
              <span className="font-bold text-blue-900">{analytics.durationBreakdown.medium}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-medium">Panjang (&gt;15m)</span>
              </div>
              <span className="font-bold text-purple-900">{analytics.durationBreakdown.long}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Insights</h3>
            <Zap className="w-5 h-5 text-gray-500" />
          </div>
          
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Award className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-900">Sesi Terfavorit</span>
              </div>
              <p className="text-sm text-amber-700">
                {sessionTypeLabels[analytics.mostPopularType as keyof typeof sessionTypeLabels]?.label || analytics.mostPopularType}
              </p>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Durasi Rata-rata</span>
              </div>
              <p className="text-sm text-blue-700">
                {analytics.averageSessionLength} menit per sesi
              </p>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Calendar className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Konsistensi</span>
              </div>
              <p className="text-sm text-green-700">
                {analytics.totalSessions > 0 ? 'Baik' : 'Perlu ditingkatkan'} - 
                {analytics.totalSessions} sesi dalam periode ini
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Session Type Filter */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Filter Jenis Sesi:</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSessionType('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedSessionType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Semua
            </button>
            {Object.entries(sessionTypeLabels).map(([type, { label }]) => (
              <button
                key={type}
                onClick={() => setSelectedSessionType(type)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedSessionType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};