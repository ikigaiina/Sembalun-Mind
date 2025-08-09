import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Calendar, Target, Award, Clock, Brain, Heart, 
  BarChart3, PieChart, Activity, Star, Zap, Mountain, Waves,
  Sun, Moon, Wind, Filter, ChevronDown, ChevronUp, Download,
  Share2, Trophy, Flame, Eye, EyeOff, RefreshCw
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useMoodTracker } from '../../hooks/useMoodTracker';
import type { MoodType, MoodEntry } from '../../types/mood';
import { getMoodColor, getMoodEmoji, getMoodLabel } from '../../types/mood';

interface MeditationSession {
  id: string;
  type: 'guided' | 'breathing' | 'indonesian' | 'mindfulness';
  duration: number;
  completedAt: Date;
  culturalElement?: string;
  mood?: MoodType;
  rating?: number;
  notes?: string;
}

interface ProgressMetrics {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  averageRating: number;
  completionRate: number;
  culturalSessionsCount: number;
  favoriteSessionType: string;
}

interface Props {
  className?: string;
}

export const ComprehensiveProgressDashboard: React.FC<Props> = ({ 
  className = '' 
}) => {
  const { moodHistory, getMoodStats } = useMoodTracker();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'overview' | 'mood' | 'meditation' | 'cultural' | 'achievements'>('overview');
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['overview']);

  // Mock meditation session data - in real app would come from a hook
  const [meditationSessions] = useState<MeditationSession[]>([
    {
      id: '1',
      type: 'indonesian',
      duration: 10,
      completedAt: new Date(Date.now() - 86400000), // yesterday
      culturalElement: 'Sembalun Valley Sunrise',
      mood: 'calm',
      rating: 5,
      notes: 'Sangat menenangkan'
    },
    {
      id: '2', 
      type: 'breathing',
      duration: 5,
      completedAt: new Date(Date.now() - 172800000), // 2 days ago
      mood: 'happy',
      rating: 4
    },
    {
      id: '3',
      type: 'guided',
      duration: 15,
      completedAt: new Date(Date.now() - 259200000), // 3 days ago
      mood: 'neutral',
      rating: 4
    }
  ]);

  const moodStats = getMoodStats();

  // Calculate progress metrics
  const progressMetrics: ProgressMetrics = useMemo(() => {
    const totalSessions = meditationSessions.length;
    const totalMinutes = meditationSessions.reduce((sum, session) => sum + session.duration, 0);
    
    // Calculate streaks
    const sortedSessions = [...meditationSessions].sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let currentDate = new Date();
    
    for (const session of sortedSessions) {
      const sessionDate = new Date(session.completedAt);
      const diffDays = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        currentStreak++;
        tempStreak++;
        currentDate = sessionDate;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
        break;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    const averageRating = meditationSessions.reduce((sum, session) => sum + (session.rating || 0), 0) / totalSessions || 0;
    const culturalSessionsCount = meditationSessions.filter(session => session.type === 'indonesian' || session.culturalElement).length;
    
    // Find favorite session type
    const sessionTypeCounts = meditationSessions.reduce((acc, session) => {
      acc[session.type] = (acc[session.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const favoriteSessionType = Object.entries(sessionTypeCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'guided';

    return {
      totalSessions,
      totalMinutes,
      currentStreak,
      longestStreak,
      averageRating,
      completionRate: 85, // Mock completion rate
      culturalSessionsCount,
      favoriteSessionType
    };
  }, [meditationSessions]);

  // Filter data based on timeframe
  const getFilteredData = (timeframe: string) => {
    const now = new Date();
    let startDate = new Date();
    
    switch (timeframe) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return {
      moodEntries: moodHistory.filter(entry => entry.timestamp >= startDate),
      sessions: meditationSessions.filter(session => session.completedAt >= startDate)
    };
  };

  const filteredData = getFilteredData(selectedTimeframe);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}j ${mins}m`;
    }
    return `${mins}m`;
  };

  // Render overview section
  const renderOverviewSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-blue-600 font-medium">Total</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{progressMetrics.totalSessions}</div>
          <div className="text-sm text-blue-700">Sesi Meditasi</div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-500 rounded-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-green-600 font-medium">Waktu</span>
          </div>
          <div className="text-2xl font-bold text-green-900">{formatDuration(progressMetrics.totalMinutes)}</div>
          <div className="text-sm text-green-700">Total Praktik</div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-500 rounded-lg">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-orange-600 font-medium">Streak</span>
          </div>
          <div className="text-2xl font-bold text-orange-900">{progressMetrics.currentStreak}</div>
          <div className="text-sm text-orange-700">Hari Berturut</div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Star className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-purple-600 font-medium">Rating</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">{progressMetrics.averageRating.toFixed(1)}</div>
          <div className="text-sm text-purple-700">Rata-rata</div>
        </Card>
      </div>

      {/* Progress Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Perkembangan Mingguan</h3>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600">7 hari terakhir</span>
          </div>
        </div>
        
        {/* Simple bar chart visualization */}
        <div className="space-y-3">
          {Array.from({ length: 7 }, (_, index) => {
            const dayName = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][index];
            const sessionsCount = Math.floor(Math.random() * 3); // Mock data
            const maxSessions = 3;
            const percentage = (sessionsCount / maxSessions) * 100;
            
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
                <div className="w-8 text-sm text-gray-700 text-right">{sessionsCount}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Cultural Progress */}
      <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-100 border-amber-200">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-amber-500 rounded-lg mr-3">
            <Mountain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-amber-900">Perjalanan Budaya Indonesia</h3>
            <p className="text-sm text-amber-700">Eksplorasi tradisi meditasi Nusantara</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-900">{progressMetrics.culturalSessionsCount}</div>
            <div className="text-sm text-amber-700">Sesi Budaya</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-900">3</div>
            <div className="text-sm text-amber-700">Tradisi Dipelajari</div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-amber-700">Kemajuan eksplorasi budaya</span>
          <span className="font-semibold text-amber-900">75%</span>
        </div>
        <div className="w-full bg-amber-200 rounded-full h-2 mt-2">
          <motion.div
            className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "75%" }}
            transition={{ duration: 1 }}
          />
        </div>
      </Card>
    </motion.div>
  );

  // Render mood analytics section
  const renderMoodSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Mood Distribution */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribusi Perasaan</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(moodStats.moodDistribution).map(([mood, count]) => {
            const percentage = moodStats.totalEntries > 0 ? (count / moodStats.totalEntries) * 100 : 0;
            return (
              <div key={mood} className="text-center p-3 rounded-lg bg-gray-50">
                <div className="text-2xl mb-1">{getMoodEmoji(mood as MoodType)}</div>
                <div className="text-sm font-medium text-gray-700">{getMoodLabel(mood as MoodType)}</div>
                <div className="text-lg font-bold" style={{ color: getMoodColor(mood as MoodType) }}>
                  {count}
                </div>
                <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Mood Trends */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tren Perasaan</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Heart className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium text-blue-900">Rata-rata Mood</div>
                <div className="text-sm text-blue-700">{selectedTimeframe} terakhir</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-900">{moodStats.averageMood.toFixed(1)}/5</div>
              <div className="text-sm text-blue-700">
                {moodStats.averageMood >= 4 ? '🌟 Excellent' :
                 moodStats.averageMood >= 3 ? '😊 Good' :
                 moodStats.averageMood >= 2 ? '😐 Fair' : '😔 Needs Attention'}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Flame className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-green-900">Streak Mood</div>
                <div className="text-sm text-green-700">Hari berturut-turut mencatat</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-900">{moodStats.streakDays}</div>
              <div className="text-sm text-green-700">hari</div>
            </div>
          </div>

          {moodStats.mostCommonMood && (
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{getMoodEmoji(moodStats.mostCommonMood)}</div>
                <div>
                  <div className="font-medium text-purple-900">Mood Terfavorit</div>
                  <div className="text-sm text-purple-700">Perasaan yang paling sering</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-purple-900">
                  {getMoodLabel(moodStats.mostCommonMood)}
                </div>
                <div className="text-sm text-purple-700">
                  {moodStats.moodDistribution[moodStats.mostCommonMood]} kali
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );

  // Render meditation analytics section
  const renderMeditationSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Session Types */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Jenis Sesi Favorit</h3>
        <div className="space-y-3">
          {[
            { type: 'indonesian', label: 'Meditasi Indonesia', icon: Mountain, count: 5, color: 'amber' },
            { type: 'breathing', label: 'Latihan Pernapasan', icon: Wind, count: 3, color: 'blue' },
            { type: 'guided', label: 'Meditasi Terpandu', icon: Brain, count: 2, color: 'purple' },
            { type: 'mindfulness', label: 'Mindfulness', icon: Heart, count: 1, color: 'green' }
          ].map(({ type, label, icon: Icon, count, color }) => {
            const total = meditationSessions.length;
            const percentage = total > 0 ? (count / total) * 100 : 0;
            
            return (
              <div key={type} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-${color}-100`}>
                    <Icon className={`w-4 h-4 text-${color}-600`} />
                  </div>
                  <span className="font-medium text-gray-700">{label}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`w-16 bg-${color}-200 rounded-full h-2`}>
                    <div 
                      className={`bg-${color}-500 h-2 rounded-full`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-8 text-right">{count}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Completion Insights */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Wawasan Penyelesaian</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-100 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700">Tingkat Penyelesaian</span>
              <Trophy className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-900">{progressMetrics.completionRate}%</div>
            <div className="text-sm text-green-700">Sesi yang diselesaikan</div>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-blue-50 to-sky-100 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700">Durasi Rata-rata</span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {Math.round(progressMetrics.totalMinutes / progressMetrics.totalSessions || 0)}m
            </div>
            <div className="text-sm text-blue-700">Per sesi</div>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-heading font-bold">Dashboard Kemajuan</h1>
            <p className="text-blue-100">Pantau perjalanan mindfulness Anda</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <Download className="w-4 h-4 mr-2" />
              Ekspor
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <Share2 className="w-4 h-4 mr-2" />
              Bagikan
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{progressMetrics.totalSessions}</div>
            <div className="text-sm text-blue-200">Total Sesi</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{formatDuration(progressMetrics.totalMinutes)}</div>
            <div className="text-sm text-blue-200">Total Waktu</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{progressMetrics.currentStreak}</div>
            <div className="text-sm text-blue-200">Streak Hari</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{moodStats.totalEntries}</div>
            <div className="text-sm text-blue-200">Mood Logs</div>
          </div>
        </div>
      </Card>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 space-x-0 sm:space-x-4">
        {/* Timeframe Selector */}
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Periode:</span>
          <div className="flex rounded-lg overflow-hidden border border-gray-300">
            {(['week', 'month', 'quarter', 'year'] as const).map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-3 py-1 text-sm font-medium transition-colors ${
                  selectedTimeframe === timeframe
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {timeframe === 'week' ? '1M' :
                 timeframe === 'month' ? '1B' :
                 timeframe === 'quarter' ? '3B' : '1T'}
              </button>
            ))}
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetailedView(!showDetailedView)}
            className="text-gray-600 hover:text-gray-800"
          >
            {showDetailedView ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showDetailedView ? 'Ringkas' : 'Detail'}
          </Button>
        </div>
      </div>

      {/* Metric Selection Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'overview', label: 'Ringkasan', icon: Activity },
          { id: 'mood', label: 'Perasaan', icon: Heart },
          { id: 'meditation', label: 'Meditasi', icon: Brain },
          { id: 'cultural', label: 'Budaya', icon: Mountain },
          { id: 'achievements', label: 'Pencapaian', icon: Trophy }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSelectedMetric(id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedMetric === id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {selectedMetric === 'overview' && renderOverviewSection()}
        {selectedMetric === 'mood' && renderMoodSection()}
        {selectedMetric === 'meditation' && renderMeditationSection()}
        {selectedMetric === 'cultural' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Praktik Budaya Indonesia</h3>
              <p className="text-gray-600">
                Jelajahi dan kuasai tradisi meditasi Nusantara yang kaya akan kebijaksanaan lokal
              </p>
            </div>
            
            {/* Cultural Progress Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-100 border-emerald-200">
                <div className="text-center">
                  <Mountain className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-emerald-900">{progressMetrics.culturalSessionsCount}</div>
                  <div className="text-sm text-emerald-700">Sesi Budaya</div>
                </div>
              </Card>
              
              <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200">
                <div className="text-center">
                  <Target className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-amber-900">3</div>
                  <div className="text-sm text-amber-700">Wilayah Aktif</div>
                </div>
              </Card>
              
              <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
                <div className="text-center">
                  <Star className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-900">75%</div>
                  <div className="text-sm text-purple-700">Kemajuan</div>
                </div>
              </Card>
              
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200">
                <div className="text-center">
                  <Award className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-900">2</div>
                  <div className="text-sm text-blue-700">Pencapaian</div>
                </div>
              </Card>
            </div>
            
            {/* Cultural Practices Learned */}
            <Card className="p-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Praktik yang Dipelajari</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Sembalun Valley Dawn', region: 'NTB', completed: true },
                  { name: 'Javanese Royal Court', region: 'Jawa', completed: true },
                  { name: 'Balinese Temple Reflection', region: 'Bali', completed: true },
                  { name: 'Borobudur Sunrise', region: 'Jawa', completed: false },
                  { name: 'Prambanan Meditation', region: 'Jawa', completed: false },
                  { name: 'Lombok Sacred Waters', region: 'NTB', completed: false }
                ].map((practice, index) => (
                  <div 
                    key={index}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      practice.completed ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${
                      practice.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    <div className="flex-1">
                      <div className={`font-medium text-sm ${
                        practice.completed ? 'text-green-900' : 'text-gray-600'
                      }`}>
                        {practice.name}
                      </div>
                      <div className={`text-xs ${
                        practice.completed ? 'text-green-700' : 'text-gray-500'
                      }`}>
                        {practice.region}
                      </div>
                    </div>
                    {practice.completed && (
                      <div className="text-green-600">
                        <Star className="w-4 h-4 fill-current" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
            
            {/* Regional Exploration */}
            <Card className="p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Eksplorasi Regional</h4>
              <div className="space-y-4">
                {[
                  { region: 'Sembalun Valley', progress: 85, sessions: 1, color: 'emerald' },
                  { region: 'Java Traditions', progress: 65, sessions: 1, color: 'amber' },
                  { region: 'Balinese Harmony', progress: 40, sessions: 1, color: 'blue' },
                  { region: 'Sumatra Wilderness', progress: 0, sessions: 0, color: 'gray', locked: true },
                ].map((region, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg bg-${region.color}-100 flex items-center justify-center ${
                      region.locked ? 'opacity-50' : ''
                    }`}>
                      <Mountain className={`w-6 h-6 text-${region.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium ${region.locked ? 'text-gray-500' : 'text-gray-800'}`}>
                          {region.region}
                        </span>
                        {region.locked && (
                          <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                            Terkunci
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <motion.div
                            className={`bg-${region.color}-500 h-2 rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${region.progress}%` }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {region.sessions} sesi
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-100 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-900">Tip Budaya</h5>
                    <p className="text-sm text-blue-700">
                      Selesaikan 5 sesi Sembalun untuk membuka tradisi Sumatra yang penuh dengan kebijaksanaan hutan
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
        {selectedMetric === 'achievements' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Sistem pencapaian akan segera hadir!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Refresh Button */}
      <div className="text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.reload()}
          className="text-gray-500 hover:text-gray-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Muat Ulang Data
        </Button>
      </div>
    </div>
  );
};