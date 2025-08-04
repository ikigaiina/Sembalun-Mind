import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { habitAnalyticsService } from '../../services/habitAnalyticsService';
import type { HabitPattern, HabitSuggestion, HabitFormationStage } from '../../services/habitAnalyticsService';
import { progressService } from '../../services/progressService';
import type { MeditationSession } from '../../types/progress';

interface HabitFormationTrackerProps {
  className?: string;
}

interface HabitAnalytics {
  totalSessions: number;
  daysPracticing: number;
  consistency: number;
  avgSessionsPerWeek: number;
  longestStreak: number;
}

export const HabitFormationTracker: React.FC<HabitFormationTrackerProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'patterns' | 'suggestions' | 'formation'>('overview');
  
  const [patterns, setPatterns] = useState<HabitPattern[]>([]);
  const [suggestions, setSuggestions] = useState<HabitSuggestion[]>([]);
  const [formationStage, setFormationStage] = useState<HabitFormationStage | null>(null);
  const [analytics, setAnalytics] = useState<HabitAnalytics | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [userPatterns, habitSuggestions] = await Promise.all([
        habitAnalyticsService.getUserHabitPatterns(user.uid),
        habitAnalyticsService.generateHabitSuggestions(user.uid)
      ]);

      setPatterns(userPatterns);
      setSuggestions(habitSuggestions);

      // Calculate formation stage
      const sessions = await progressService.getMeditationSessions(user.uid, 100);
      if (sessions.length > 0) {
        const firstSession = new Date(sessions[sessions.length - 1].completedAt);
        const daysPracticing = Math.floor((Date.now() - firstSession.getTime()) / (1000 * 60 * 60 * 24));
        
        // Calculate consistency
        const last30Days = sessions.filter(s => 
          (Date.now() - new Date(s.completedAt).getTime()) / (1000 * 60 * 60 * 24) <= 30
        );
        const consistency = last30Days.length / 30;

        const stage = habitAnalyticsService.getHabitFormationStage(daysPracticing, consistency);
        setFormationStage(stage);

        // Set analytics summary
        setAnalytics({
          totalSessions: sessions.length,
          daysPracticing,
          consistency: Math.round(consistency * 100),
          avgSessionsPerWeek: Math.round((sessions.length / (daysPracticing / 7)) * 10) / 10,
          longestStreak: await calculateLongestStreak(sessions)
        });
      }
    } catch (error) {
      console.error('Error loading habit data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, activeTab, loadData]);

  const calculateLongestStreak = async (sessions: MeditationSession[]): Promise<number> => {
    // Sort sessions by date
    const sortedSessions = sessions.sort((a, b) => 
      new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    );

    let longestStreak = 0;
    let currentStreak = 0;
    let lastDate: Date | null = null;

    for (const session of sortedSessions) {
      const sessionDate = new Date(session.completedAt);
      sessionDate.setHours(0, 0, 0, 0);

      if (lastDate) {
        const daysDiff = Math.floor((sessionDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          currentStreak++;
        } else if (daysDiff === 0) {
          // Same day, don't change streak
        } else {
          longestStreak = Math.max(longestStreak, currentStreak);
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      
      lastDate = new Date(sessionDate);
    }

    return Math.max(longestStreak, currentStreak);
  };

  const analyzeHabits = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await habitAnalyticsService.analyzeUserHabits(user.uid);
      await loadData();
      alert('Analisis habit berhasil diperbarui!');
    } catch (error) {
      console.error('Error analyzing habits:', error);
      alert('Gagal menganalisis habit. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const getPatternIcon = (habitType: string): string => {
    switch (habitType) {
      case 'meditation_frequency': return '📅';
      case 'session_duration': return '⏰';
      case 'time_of_day': return '🕐';
      case 'technique_preference': return '🧘';
      case 'mood_improvement': return '😊';
      default: return '📊';
    }
  };

  const getPatternTitle = (habitType: string): string => {
    switch (habitType) {
      case 'meditation_frequency': return 'Frekuensi Meditasi';
      case 'session_duration': return 'Durasi Sesi';
      case 'time_of_day': return 'Waktu Meditasi';
      case 'technique_preference': return 'Preferensi Teknik';
      case 'mood_improvement': return 'Peningkatan Mood';
      default: return 'Pattern';
    }
  };

  const getTrendIcon = (trend: string): { icon: string; color: string } => {
    switch (trend) {
      case 'strengthening': return { icon: '📈', color: 'text-green-500' };
      case 'weakening': return { icon: '📉', color: 'text-red-500' };
      default: return { icon: '➡️', color: 'text-gray-500' };
    }
  };

  const getStrengthColor = (strength: number): string => {
    if (strength >= 0.8) return 'bg-green-500';
    if (strength >= 0.6) return 'bg-blue-500';
    if (strength >= 0.4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSuggestionIcon = (type: string): string => {
    switch (type) {
      case 'consistency': return '📊';
      case 'duration': return '⏰';
      case 'timing': return '🕐';
      case 'technique': return '🧘';
      case 'environment': return '🏡';
      default: return '💡';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStageIcon = (stage: string): string => {
    switch (stage) {
      case 'initiation': return '🌱';
      case 'learning': return '📚';
      case 'stabilization': return '⚖️';
      case 'maintenance': return '🏆';
      default: return '🎯';
    }
  };

  const getStageColor = (stage: string): string => {
    switch (stage) {
      case 'initiation': return 'bg-yellow-50 border-yellow-200';
      case 'learning': return 'bg-blue-50 border-blue-200';
      case 'stabilization': return 'bg-purple-50 border-purple-200';
      case 'maintenance': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse space-y-6">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Analisis Pembentukan Habit</h3>
          <p className="text-gray-600">Lacak perkembangan habit meditasi Anda</p>
        </div>
        <div className="text-3xl">🔄</div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'patterns', label: 'Patterns', icon: '🔍' },
          { id: 'suggestions', label: 'Saran', icon: '💡' },
          { id: 'formation', label: 'Tahapan', icon: '🎯' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'overview' | 'patterns' | 'suggestions' | 'formation')}
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

      {/* Overview Tab */}
      {activeTab === 'overview' && analytics && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{analytics.totalSessions}</div>
              <div className="text-sm text-blue-700">Total Sesi</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{analytics.daysPracticing}</div>
              <div className="text-sm text-green-700">Hari Praktik</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{analytics.consistency}%</div>
              <div className="text-sm text-purple-700">Konsistensi</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{analytics.longestStreak}</div>
              <div className="text-sm text-orange-700">Streak Terpanjang</div>
            </div>
          </div>

          {/* Formation Stage Summary */}
          {formationStage && (
            <div className={`border rounded-xl p-6 ${getStageColor(formationStage.stage)}`}>
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl">{getStageIcon(formationStage.stage)}</span>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    Tahap: {formationStage.stage.charAt(0).toUpperCase() + formationStage.stage.slice(1)}
                  </h4>
                  <p className="text-gray-700">{formationStage.description}</p>
                </div>
              </div>
              <div className="bg-white bg-opacity-50 rounded-lg p-4">
                <p className="text-sm text-gray-800">
                  <strong>Next Milestone:</strong> {formationStage.nextMilestone}
                </p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex space-x-3">
            <Button onClick={analyzeHabits} className="flex-1">
              🔄 Analisis Ulang
            </Button>
            <Button
              onClick={() => setActiveTab('suggestions')}
              variant="outline"
              className="flex-1"
            >
              💡 Lihat Saran
            </Button>
          </div>
        </div>
      )}

      {/* Patterns Tab */}
      {activeTab === 'patterns' && (
        <div className="space-y-6">
          {patterns.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Belum ada pattern terdeteksi
              </h4>
              <p className="text-gray-600 mb-4">
                Lakukan beberapa sesi meditasi untuk mulai mendeteksi pattern
              </p>
              <Button onClick={analyzeHabits}>
                🔄 Analisis Habit
              </Button>
            </div>
          ) : (
            patterns.map(pattern => (
              <div key={pattern.id} className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getPatternIcon(pattern.habitType)}</span>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {getPatternTitle(pattern.habitType)}
                      </h4>
                      <p className="text-gray-600">{pattern.pattern}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`flex items-center space-x-1 ${getTrendIcon(pattern.trend).color}`}>
                      <span>{getTrendIcon(pattern.trend).icon}</span>
                      <span className="text-sm font-medium">
                        {pattern.trend === 'strengthening' ? 'Menguat' :
                         pattern.trend === 'weakening' ? 'Melemah' : 'Stabil'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Strength Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Kekuatan Pattern</span>
                    <span>{Math.round(pattern.strength * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getStrengthColor(pattern.strength)}`}
                      style={{ width: `${pattern.strength * 100}%` }}
                    />
                  </div>
                </div>

                {/* Suggestions */}
                {pattern.suggestions.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-medium text-blue-900 mb-2">💡 Saran</h5>
                    <ul className="text-sm text-blue-800 space-y-1">
                      {pattern.suggestions.map((suggestion, index) => (
                        <li key={index}>• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Suggestions Tab */}
      {activeTab === 'suggestions' && (
        <div className="space-y-6">
          {suggestions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💡</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Belum ada saran
              </h4>
              <p className="text-gray-600 mb-4">
                Habit Anda sudah sangat baik atau butuh lebih banyak data untuk analisis
              </p>
            </div>
          ) : (
            suggestions.map(suggestion => (
              <div key={suggestion.id} className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getSuggestionIcon(suggestion.type)}</span>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{suggestion.title}</h4>
                      <p className="text-gray-600">{suggestion.description}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(suggestion.priority)}`}>
                    {suggestion.priority === 'high' ? 'Prioritas Tinggi' :
                     suggestion.priority === 'medium' ? 'Prioritas Sedang' : 'Prioritas Rendah'}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h5 className="font-medium text-green-900 mb-2">🎯 Action Plan</h5>
                    <p className="text-sm text-green-800">{suggestion.action}</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-medium text-blue-900 mb-2">🏆 Expected Benefit</h5>
                    <p className="text-sm text-blue-800">{suggestion.expectedBenefit}</p>
                  </div>
                </div>

                <div className="flex justify-between text-sm text-gray-600">
                  <span>
                    Kesulitan: <span className="font-medium">
                      {suggestion.difficulty === 'easy' ? 'Mudah' :
                       suggestion.difficulty === 'medium' ? 'Sedang' : 'Sulit'}
                    </span>
                  </span>
                  <span>
                    Waktu melihat hasil: <span className="font-medium">{suggestion.timeToSee}</span>
                  </span>
                </div>

                {suggestion.evidence && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h6 className="font-medium text-gray-700 mb-2">📊 Data Pendukung:</h6>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>• Perilaku saat ini: {suggestion.evidence.currentBehavior}</div>
                      <div>• Data points: {suggestion.evidence.dataPoints} sesi</div>
                      {suggestion.evidence.successRate && (
                        <div>• Success rate: {Math.round(suggestion.evidence.successRate * 100)}%</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Formation Tab */}
      {activeTab === 'formation' && formationStage && (
        <div className="space-y-6">
          <div className={`border rounded-xl p-6 ${getStageColor(formationStage.stage)}`}>
            <div className="text-center mb-6">
              <span className="text-6xl">{getStageIcon(formationStage.stage)}</span>
              <h4 className="text-2xl font-bold text-gray-900 mt-4">
                Tahap {formationStage.stage.charAt(0).toUpperCase() + formationStage.stage.slice(1)}
              </h4>
              <p className="text-gray-700 mt-2">{formationStage.description}</p>
              <div className="text-sm text-gray-600 mt-2">
                Durasi: {formationStage.duration} hari
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Challenges */}
              <div className="bg-white bg-opacity-70 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">⚠️</span>
                  Challenges di Tahap Ini
                </h5>
                <ul className="space-y-2">
                  {formationStage.challenges.map((challenge, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {challenge}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Strategies */}
              <div className="bg-white bg-opacity-70 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">💡</span>
                  Strategi yang Disarankan
                </h5>
                <ul className="space-y-2">
                  {formationStage.strategies.map((strategy, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {strategy}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 bg-white bg-opacity-70 rounded-lg p-4 text-center">
              <h5 className="font-semibold text-gray-900 mb-2">🎯 Next Milestone</h5>
              <p className="text-gray-700">{formationStage.nextMilestone}</p>
            </div>
          </div>

          {/* Progress Timeline */}
          <div className="border border-gray-200 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-6">Habit Formation Timeline</h4>
            
            <div className="space-y-4">
              {[
                { stage: 'initiation', days: '1-7 hari', title: 'Initiation', desc: 'Memulai habit baru' },
                { stage: 'learning', days: '1-3 minggu', title: 'Learning', desc: 'Pembelajaran dan adaptasi' },
                { stage: 'stabilization', days: '3-9 minggu', title: 'Stabilization', desc: 'Stabilisasi habit' },
                { stage: 'maintenance', days: '9+ minggu', title: 'Maintenance', desc: 'Habit yang terbentuk' }
              ].map((stage, index) => (
                <div key={stage.stage} className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                    formationStage.stage === stage.stage 
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : index < ['initiation', 'learning', 'stabilization', 'maintenance'].indexOf(formationStage.stage)
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}>
                    <span>{getStageIcon(stage.stage)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h5 className="font-medium text-gray-900">{stage.title}</h5>
                      <span className="text-sm text-gray-500">{stage.days}</span>
                    </div>
                    <p className="text-sm text-gray-600">{stage.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};