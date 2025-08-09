import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, TrendingUp, Calendar, Clock, Heart, BarChart3,
  Sun, Moon, Users, Target, AlertTriangle, CheckCircle,
  Activity, Zap
} from 'lucide-react';
import { Card } from '../ui/Card';
import { useMoodTracker } from '../../hooks/useMoodTracker';
import type { MoodType, MoodEntry } from '../../types/mood';
import { getMoodColor, getMoodEmoji, getMoodLabel, moodOptions } from '../../types/mood';

interface MoodPattern {
  timeOfDay: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
  weeklyTrend: Array<{
    day: string;
    averageMood: number;
    totalEntries: number;
  }>;
  monthlyTrend: Array<{
    week: number;
    averageMood: number;
    moodVariability: number;
  }>;
  correlations: {
    bestDays: string[];
    challengingDays: string[];
    stableHours: string[];
    volatileHours: string[];
  };
  insights: {
    dominantMood: MoodType;
    moodStability: 'high' | 'medium' | 'low';
    improvementTrend: 'improving' | 'stable' | 'declining';
    recommendations: string[];
  };
}

interface Props {
  className?: string;
}

// Mood value mapping for calculations
const moodValues: Record<MoodType, number> = {
  'very-sad': 1,
  'sad': 2,
  'anxious': 2,
  'angry': 1,
  'tired': 2,
  'neutral': 3,
  'calm': 4,
  'happy': 4,
  'excited': 5,
  'very-happy': 5
};

export const MoodPatternAnalysis: React.FC<Props> = ({ 
  className = '' 
}) => {
  const { moodHistory } = useMoodTracker();

  const moodPattern: MoodPattern = useMemo(() => {
    if (moodHistory.length === 0) {
      return {
        timeOfDay: { morning: 0, afternoon: 0, evening: 0, night: 0 },
        weeklyTrend: [],
        monthlyTrend: [],
        correlations: {
          bestDays: [],
          challengingDays: [],
          stableHours: [],
          volatileHours: []
        },
        insights: {
          dominantMood: 'neutral',
          moodStability: 'medium',
          improvementTrend: 'stable',
          recommendations: []
        }
      };
    }

    // Analyze time of day patterns
    const timeOfDayData = moodHistory.reduce((acc, entry) => {
      const hour = entry.timestamp.getHours();
      const moodValue = moodValues[entry.mood];
      
      if (hour >= 6 && hour < 12) {
        acc.morning.push(moodValue);
      } else if (hour >= 12 && hour < 17) {
        acc.afternoon.push(moodValue);
      } else if (hour >= 17 && hour < 22) {
        acc.evening.push(moodValue);
      } else {
        acc.night.push(moodValue);
      }
      
      return acc;
    }, {
      morning: [] as number[],
      afternoon: [] as number[],
      evening: [] as number[],
      night: [] as number[]
    });

    const timeOfDay = {
      morning: timeOfDayData.morning.length > 0 
        ? timeOfDayData.morning.reduce((a, b) => a + b) / timeOfDayData.morning.length 
        : 0,
      afternoon: timeOfDayData.afternoon.length > 0 
        ? timeOfDayData.afternoon.reduce((a, b) => a + b) / timeOfDayData.afternoon.length 
        : 0,
      evening: timeOfDayData.evening.length > 0 
        ? timeOfDayData.evening.reduce((a, b) => a + b) / timeOfDayData.evening.length 
        : 0,
      night: timeOfDayData.night.length > 0 
        ? timeOfDayData.night.reduce((a, b) => a + b) / timeOfDayData.night.length 
        : 0
    };

    // Analyze weekly trends
    const weeklyData = moodHistory.reduce((acc, entry) => {
      const dayName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][entry.timestamp.getDay()];
      if (!acc[dayName]) {
        acc[dayName] = [];
      }
      acc[dayName].push(moodValues[entry.mood]);
      return acc;
    }, {} as Record<string, number[]>);

    const weeklyTrend = Object.entries(weeklyData).map(([day, moods]) => ({
      day,
      averageMood: moods.reduce((a, b) => a + b) / moods.length,
      totalEntries: moods.length
    }));

    // Analyze monthly trends (group by weeks)
    const now = new Date();
    const fourWeeksAgo = new Date(now);
    fourWeeksAgo.setDate(now.getDate() - 28);

    const monthlyTrend = [];
    for (let week = 0; week < 4; week++) {
      const weekStart = new Date(fourWeeksAgo);
      weekStart.setDate(fourWeeksAgo.getDate() + (week * 7));
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const weekEntries = moodHistory.filter(entry => 
        entry.timestamp >= weekStart && entry.timestamp <= weekEnd
      );
      
      if (weekEntries.length > 0) {
        const weekMoods = weekEntries.map(entry => moodValues[entry.mood]);
        const averageMood = weekMoods.reduce((a, b) => a + b) / weekMoods.length;
        
        // Calculate mood variability (standard deviation)
        const variance = weekMoods.reduce((acc, mood) => 
          acc + Math.pow(mood - averageMood, 2), 0) / weekMoods.length;
        const moodVariability = Math.sqrt(variance);
        
        monthlyTrend.push({
          week: week + 1,
          averageMood,
          moodVariability
        });
      }
    }

    // Find correlations and insights
    const bestDays = weeklyTrend
      .sort((a, b) => b.averageMood - a.averageMood)
      .slice(0, 2)
      .map(item => item.day);
    
    const challengingDays = weeklyTrend
      .sort((a, b) => a.averageMood - b.averageMood)
      .slice(0, 2)
      .map(item => item.day);

    // Find most stable and volatile time periods
    const timeOfDayEntries = Object.entries(timeOfDay)
      .filter(([, avg]) => avg > 0)
      .sort((a, b) => b[1] - a[1]);
    
    const stableHours = timeOfDayEntries.slice(0, 2).map(([period]) => {
      switch (period) {
        case 'morning': return 'Pagi (6-12)';
        case 'afternoon': return 'Siang (12-17)';
        case 'evening': return 'Sore (17-22)';
        case 'night': return 'Malam (22-6)';
        default: return period;
      }
    });
    
    const volatileHours = timeOfDayEntries.slice(-2).map(([period]) => {
      switch (period) {
        case 'morning': return 'Pagi (6-12)';
        case 'afternoon': return 'Siang (12-17)';
        case 'evening': return 'Sore (17-22)';
        case 'night': return 'Malam (22-6)';
        default: return period;
      }
    });

    // Calculate dominant mood
    const moodFrequency = moodHistory.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<MoodType, number>);
    
    const dominantMood = Object.entries(moodFrequency)
      .sort(([,a], [,b]) => b - a)[0]?.[0] as MoodType || 'neutral';

    // Calculate mood stability
    const allMoodValues = moodHistory.map(entry => moodValues[entry.mood]);
    const averageMood = allMoodValues.reduce((a, b) => a + b) / allMoodValues.length;
    const moodVariance = allMoodValues.reduce((acc, mood) => 
      acc + Math.pow(mood - averageMood, 2), 0) / allMoodValues.length;
    const moodStandardDeviation = Math.sqrt(moodVariance);
    
    let moodStability: 'high' | 'medium' | 'low' = 'medium';
    if (moodStandardDeviation < 0.8) moodStability = 'high';
    else if (moodStandardDeviation > 1.5) moodStability = 'low';

    // Calculate improvement trend (compare first half vs second half)
    const midPoint = Math.floor(moodHistory.length / 2);
    const firstHalf = moodHistory.slice(0, midPoint);
    const secondHalf = moodHistory.slice(midPoint);
    
    const firstHalfAvg = firstHalf.length > 0 
      ? firstHalf.reduce((sum, entry) => sum + moodValues[entry.mood], 0) / firstHalf.length
      : averageMood;
    
    const secondHalfAvg = secondHalf.length > 0
      ? secondHalf.reduce((sum, entry) => sum + moodValues[entry.mood], 0) / secondHalf.length
      : averageMood;
    
    let improvementTrend: 'improving' | 'stable' | 'declining' = 'stable';
    const trendDifference = secondHalfAvg - firstHalfAvg;
    
    if (trendDifference > 0.3) improvementTrend = 'improving';
    else if (trendDifference < -0.3) improvementTrend = 'declining';

    // Generate recommendations
    const recommendations = [];
    
    if (improvementTrend === 'declining') {
      recommendations.push('Pertimbangkan untuk meningkatkan frekuensi praktik meditasi');
    }
    
    if (moodStability === 'low') {
      recommendations.push('Fokus pada teknik stabilisasi emosi seperti breathing exercises');
    }
    
    if (bestDays.length > 0) {
      recommendations.push(`Manfaatkan momentum positif di hari ${bestDays.join(' dan ')}`);
    }
    
    if (challengingDays.length > 0) {
      recommendations.push(`Berikan perhatian ekstra pada hari ${challengingDays.join(' dan ')}`);
    }
    
    if (stableHours.length > 0) {
      recommendations.push(`Waktu terbaik untuk meditasi: ${stableHours[0]}`);
    }

    return {
      timeOfDay,
      weeklyTrend,
      monthlyTrend,
      correlations: {
        bestDays,
        challengingDays,
        stableHours,
        volatileHours
      },
      insights: {
        dominantMood,
        moodStability,
        improvementTrend,
        recommendations
      }
    };
  }, [moodHistory]);

  const getTimeOfDayIcon = (period: string) => {
    switch (period) {
      case 'morning': return <Sun className="w-5 h-5 text-yellow-500" />;
      case 'afternoon': return <Sun className="w-5 h-5 text-orange-500" />;
      case 'evening': return <Sun className="w-5 h-5 text-orange-600" />;
      case 'night': return <Moon className="w-5 h-5 text-indigo-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTimeOfDayLabel = (period: string) => {
    switch (period) {
      case 'morning': return 'Pagi (6-12)';
      case 'afternoon': return 'Siang (12-17)';
      case 'evening': return 'Sore (17-22)';
      case 'night': return 'Malam (22-6)';
      default: return period;
    }
  };

  const getStabilityColor = (stability: string) => {
    switch (stability) {
      case 'high': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600 bg-green-50';
      case 'stable': return 'text-blue-600 bg-blue-50';
      case 'declining': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (moodHistory.length === 0) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Analisis Pola Mood
        </h3>
        <p className="text-gray-600 mb-4">
          Mulai mencatat mood untuk mendapatkan wawasan mendalam tentang pola emosional Anda
        </p>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-heading font-bold">Analisis Pola Mood</h2>
            <p className="text-purple-100">Wawasan mendalam tentang perjalanan emosional Anda</p>
          </div>
          <Brain className="w-12 h-12 text-purple-200" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{moodHistory.length}</div>
            <div className="text-sm text-purple-200">Total Entri</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{getMoodEmoji(moodPattern.insights.dominantMood)}</div>
            <div className="text-sm text-purple-200">Mood Dominan</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {moodPattern.insights.improvementTrend === 'improving' ? '📈' :
               moodPattern.insights.improvementTrend === 'declining' ? '📉' : '➡️'}
            </div>
            <div className="text-sm text-purple-200">Tren</div>
          </div>
        </div>
      </Card>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-800">Mood Dominan</h4>
            <div className="text-2xl">{getMoodEmoji(moodPattern.insights.dominantMood)}</div>
          </div>
          <p className="text-gray-600 text-sm mb-2">
            {getMoodLabel(moodPattern.insights.dominantMood)}
          </p>
          <div 
            className="text-xs px-2 py-1 rounded-full inline-block"
            style={{ 
              backgroundColor: getMoodColor(moodPattern.insights.dominantMood) + '20',
              color: getMoodColor(moodPattern.insights.dominantMood)
            }}
          >
            Mood paling sering
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-800">Stabilitas Mood</h4>
            {moodPattern.insights.moodStability === 'high' ? <CheckCircle className="w-5 h-5 text-green-500" /> :
             moodPattern.insights.moodStability === 'low' ? <AlertTriangle className="w-5 h-5 text-red-500" /> :
             <Activity className="w-5 h-5 text-yellow-500" />}
          </div>
          <p className="text-gray-600 text-sm mb-2">
            {moodPattern.insights.moodStability === 'high' ? 'Sangat Stabil' :
             moodPattern.insights.moodStability === 'medium' ? 'Cukup Stabil' : 'Kurang Stabil'}
          </p>
          <div className={`text-xs px-2 py-1 rounded-full inline-block ${getStabilityColor(moodPattern.insights.moodStability)}`}>
            {moodPattern.insights.moodStability === 'high' ? 'Konsisten' :
             moodPattern.insights.moodStability === 'medium' ? 'Moderate' : 'Fluktuatif'}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-800">Tren Perbaikan</h4>
            <TrendingUp className={`w-5 h-5 ${
              moodPattern.insights.improvementTrend === 'improving' ? 'text-green-500' :
              moodPattern.insights.improvementTrend === 'declining' ? 'text-red-500' : 'text-blue-500'
            }`} />
          </div>
          <p className="text-gray-600 text-sm mb-2">
            {moodPattern.insights.improvementTrend === 'improving' ? 'Membaik' :
             moodPattern.insights.improvementTrend === 'declining' ? 'Menurun' : 'Stabil'}
          </p>
          <div className={`text-xs px-2 py-1 rounded-full inline-block ${getTrendColor(moodPattern.insights.improvementTrend)}`}>
            Berdasarkan pola terkini
          </div>
        </Card>
      </div>

      {/* Time of Day Patterns */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Pola Berdasarkan Waktu</h3>
          <Clock className="w-5 h-5 text-gray-500" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(moodPattern.timeOfDay).map(([period, average]) => {
            const maxAverage = Math.max(...Object.values(moodPattern.timeOfDay));
            const percentage = maxAverage > 0 ? (average / maxAverage) * 100 : 0;
            
            return (
              <div key={period} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {getTimeOfDayIcon(period)}
                </div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  {getTimeOfDayLabel(period)}
                </div>
                <div className="text-lg font-bold text-gray-900 mb-2">
                  {average > 0 ? average.toFixed(1) : '—'}
                </div>
                {average > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Weekly Patterns */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Pola Mingguan</h3>
          <Calendar className="w-5 h-5 text-gray-500" />
        </div>

        <div className="space-y-3">
          {moodPattern.weeklyTrend.map((day) => {
            const maxAverage = Math.max(...moodPattern.weeklyTrend.map(d => d.averageMood));
            const percentage = maxAverage > 0 ? (day.averageMood / maxAverage) * 100 : 0;
            
            return (
              <div key={day.day} className="flex items-center space-x-4">
                <div className="w-16 text-sm font-medium text-gray-700">
                  {day.day}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <motion.div
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                  />
                </div>
                <div className="w-12 text-sm font-semibold text-gray-900 text-right">
                  {day.averageMood.toFixed(1)}
                </div>
                <div className="w-16 text-xs text-gray-500 text-right">
                  {day.totalEntries} entri
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Monthly Trend */}
      {moodPattern.monthlyTrend.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Tren Bulanan</h3>
            <BarChart3 className="w-5 h-5 text-gray-500" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {moodPattern.monthlyTrend.map((week, index) => (
              <div key={week.week} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-600 mb-1">
                  Minggu {week.week}
                </div>
                <div className="text-xl font-bold text-gray-900 mb-1">
                  {week.averageMood.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500">
                  Variabilitas: {week.moodVariability.toFixed(1)}
                </div>
                <div className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${
                  week.moodVariability < 1 ? 'bg-green-100 text-green-700' :
                  week.moodVariability < 2 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {week.moodVariability < 1 ? 'Stabil' :
                   week.moodVariability < 2 ? 'Sedang' : 'Fluktuatif'}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Insights and Recommendations */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Wawasan & Rekomendasi</h3>
          <Zap className="w-5 h-5 text-yellow-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pattern Insights */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">📊 Pola yang Ditemukan</h4>
            <div className="space-y-2">
              {moodPattern.correlations.bestDays.length > 0 && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-sm font-medium text-green-900">Hari Terbaik</div>
                  <div className="text-sm text-green-700">
                    {moodPattern.correlations.bestDays.join(', ')}
                  </div>
                </div>
              )}
              
              {moodPattern.correlations.challengingDays.length > 0 && (
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="text-sm font-medium text-orange-900">Hari Menantang</div>
                  <div className="text-sm text-orange-700">
                    {moodPattern.correlations.challengingDays.join(', ')}
                  </div>
                </div>
              )}
              
              {moodPattern.correlations.stableHours.length > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-900">Waktu Stabil</div>
                  <div className="text-sm text-blue-700">
                    {moodPattern.correlations.stableHours.join(', ')}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">💡 Rekomendasi Personal</h4>
            <div className="space-y-2">
              {moodPattern.insights.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-2 p-3 bg-purple-50 rounded-lg">
                  <Target className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-purple-800">{recommendation}</span>
                </div>
              ))}
              
              {moodPattern.insights.recommendations.length === 0 && (
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <span className="text-sm text-gray-600">
                    Lanjutkan pola yang sudah baik ini! 🌟
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};