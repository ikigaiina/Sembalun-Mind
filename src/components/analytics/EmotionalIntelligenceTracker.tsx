import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { emotionalIntelligenceService } from '../../services/emotionalIntelligenceService';
import type { EmotionalIntelligenceMetric, EIGrowthInsight, EIDevelopmentGoal } from '../../services/emotionalIntelligenceService';

interface EmotionalIntelligenceTrackerProps {
  className?: string;
}

export const EmotionalIntelligenceTracker: React.FC<EmotionalIntelligenceTrackerProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'goals' | 'assessment'>('overview');
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter'>('month');
  
  const [metrics, setMetrics] = useState<EmotionalIntelligenceMetric[]>([]);
  const [insights, setInsights] = useState<EIGrowthInsight[]>([]);
  const [goals, setGoals] = useState<EIDevelopmentGoal[]>([]);
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [showSelfAssessment, setShowSelfAssessment] = useState(false);

  const [newGoal, setNewGoal] = useState<Partial<EIDevelopmentGoal>>({
    metric: 'selfAwareness',
    targetScore: 8,
    currentScore: 5,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    strategies: [],
    isActive: true
  });

  const [selfAssessment, setSelfAssessment] = useState({
    selfAwareness: 5,
    selfRegulation: 5,
    motivation: 5,
    empathy: 5,
    socialSkills: 5
  });

  const loadData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [userMetrics, growthInsights, userGoals] = await Promise.all([
        emotionalIntelligenceService.getUserEIMetrics(user.uid, timeframe),
        emotionalIntelligenceService.getEIGrowthInsights(user.uid, timeframe),
        emotionalIntelligenceService.getUserDevelopmentGoals(user.uid)
      ]);

      setMetrics(userMetrics);
      setInsights(growthInsights);
      setGoals(userGoals);
    } catch (error) {
      console.error('Error loading EI data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, timeframe]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, activeTab, timeframe, loadData]);

  const handleSelfAssessment = async () => {
    if (!user) return;

    try {
      await emotionalIntelligenceService.recordEIMetric(user.uid, {
        ...selfAssessment,
        dataSource: 'self_assessment'
      });

      setSelfAssessment({
        selfAwareness: 5,
        selfRegulation: 5,
        motivation: 5,
        empathy: 5,
        socialSkills: 5
      });
      setShowSelfAssessment(false);
      await loadData();
      
      alert('Assessment berhasil disimpan!');
    } catch (error) {
      console.error('Error saving self assessment:', error);
      alert('Gagal menyimpan assessment. Silakan coba lagi.');
    }
  };

  const handleCreateGoal = async () => {
    if (!user || !newGoal.metric || !newGoal.targetScore || !newGoal.deadline) {
      alert('Mohon lengkapi semua field yang diperlukan');
      return;
    }

    try {
      await emotionalIntelligenceService.createDevelopmentGoal(user.uid, {
        metric: newGoal.metric,
        targetScore: newGoal.targetScore,
        currentScore: newGoal.currentScore || 5,
        deadline: newGoal.deadline,
        strategies: newGoal.strategies || [],
        isActive: true
      });

      setNewGoal({
        metric: 'selfAwareness',
        targetScore: 8,
        currentScore: 5,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        strategies: [],
        isActive: true
      });
      setShowCreateGoal(false);
      await loadData();
      
      alert('Goal berhasil dibuat!');
    } catch (error) {
      console.error('Error creating goal:', error);
      alert('Gagal membuat goal. Silakan coba lagi.');
    }
  };

  const getLatestScores = () => {
    if (metrics.length === 0) {
      return {
        selfAwareness: 5,
        selfRegulation: 5,
        motivation: 5,
        empathy: 5,
        socialSkills: 5,
        overallScore: 5
      };
    }

    // Calculate average scores from recent metrics
    const recentMetrics = metrics.slice(0, Math.min(5, metrics.length));
    const totals = recentMetrics.reduce((acc, metric) => ({
      selfAwareness: acc.selfAwareness + metric.selfAwareness,
      selfRegulation: acc.selfRegulation + metric.selfRegulation,
      motivation: acc.motivation + metric.motivation,
      empathy: acc.empathy + metric.empathy,
      socialSkills: acc.socialSkills + metric.socialSkills,
      overallScore: acc.overallScore + metric.overallScore
    }), { selfAwareness: 0, selfRegulation: 0, motivation: 0, empathy: 0, socialSkills: 0, overallScore: 0 });

    const count = recentMetrics.length;
    return {
      selfAwareness: Math.round((totals.selfAwareness / count) * 10) / 10,
      selfRegulation: Math.round((totals.selfRegulation / count) * 10) / 10,
      motivation: Math.round((totals.motivation / count) * 10) / 10,
      empathy: Math.round((totals.empathy / count) * 10) / 10,
      socialSkills: Math.round((totals.socialSkills / count) * 10) / 10,
      overallScore: Math.round((totals.overallScore / count) * 10) / 10
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-blue-600 bg-blue-100';
    if (score >= 4) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return { icon: '📈', color: 'text-green-500' };
      case 'declining': return { icon: '📉', color: 'text-red-500' };
      default: return { icon: '➡️', color: 'text-gray-500' };
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const metricLabels = emotionalIntelligenceService.getEIMetricLabels();
  const metricDescriptions = emotionalIntelligenceService.getEIMetricDescriptions();
  const currentScores = getLatestScores();

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse space-y-6">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
          <h3 className="text-2xl font-bold text-gray-900">Kecerdasan Emosional</h3>
          <p className="text-gray-600">Lacak perkembangan emotional intelligence Anda</p>
        </div>
        <div className="text-3xl">🧠</div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'insights', label: 'Insights', icon: '💡' },
          { id: 'goals', label: 'Goals', icon: '🎯' },
          { id: 'assessment', label: 'Assessment', icon: '📝' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'overview' | 'insights' | 'goals' | 'assessment')}
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

      {/* Timeframe Selector */}
      {(activeTab === 'overview' || activeTab === 'insights') && (
        <div className="flex items-center space-x-2 mb-6">
          <span className="text-sm font-medium text-gray-700">Periode:</span>
          {(['week', 'month', 'quarter'] as const).map(period => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                timeframe === period
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {period === 'week' ? 'Minggu' : period === 'month' ? 'Bulan' : 'Kuartal'}
            </button>
          ))}
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="text-center bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {currentScores.overallScore}/10
            </div>
            <div className="text-lg font-semibold text-gray-900 mb-1">
              Skor Kecerdasan Emosional
            </div>
            <div className="text-sm text-gray-600">
              Rata-rata dari 5 dimensi EI
            </div>
          </div>

          {/* Individual Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(metricLabels).map(([key, label]) => {
              const score = currentScores[key as keyof typeof currentScores];
              const insight = insights.find(i => i.metric === key);
              
              return (
                <div key={key} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">{label}</h4>
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(score)}`}>
                      {score}/10
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-3">
                    {metricDescriptions[key]}
                  </p>
                  
                  {insight && (
                    <div className="flex items-center space-x-2 text-sm">
                      <span className={getTrendIcon(insight.trend).color}>
                        {getTrendIcon(insight.trend).icon}
                      </span>
                      <span className="text-gray-600">
                        {insight.change > 0 ? '+' : ''}{insight.change}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="flex space-x-3">
            <Button
              onClick={() => setShowSelfAssessment(true)}
              className="flex-1"
            >
              📝 Self Assessment
            </Button>
            <Button
              onClick={() => setActiveTab('goals')}
              variant="outline"
              className="flex-1"
            >
              🎯 Set Goals
            </Button>
          </div>
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {insights.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💡</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Belum ada insight
              </h4>
              <p className="text-gray-600 mb-4">
                Lakukan beberapa session atau assessment untuk mendapatkan insight
              </p>
            </div>
          ) : (
            insights.map((insight, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">
                      {metricLabels[insight.metric]}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Current: {insight.currentScore}/10</span>
                      <span>Previous: {insight.previousScore}/10</span>
                      <div className={`flex items-center space-x-1 ${getTrendIcon(insight.trend).color}`}>
                        <span>{getTrendIcon(insight.trend).icon}</span>
                        <span>{insight.change > 0 ? '+' : ''}{insight.change}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    insight.trend === 'improving' ? 'bg-green-100 text-green-700' :
                    insight.trend === 'declining' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {insight.trend === 'improving' ? 'Meningkat' :
                     insight.trend === 'declining' ? 'Menurun' : 'Stabil'}
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900 mb-2">💡 Rekomendasi</h5>
                  <p className="text-blue-800 text-sm">{insight.recommendation}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900">Development Goals</h4>
            <Button onClick={() => setShowCreateGoal(true)}>
              ➕ Buat Goal Baru
            </Button>
          </div>

          {goals.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Belum ada goals
              </h4>
              <p className="text-gray-600 mb-4">
                Buat goal untuk mengembangkan kecerdasan emosional Anda
              </p>
            </div>
          ) : (
            goals.map(goal => (
              <div key={goal.id} className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-1">
                      {metricLabels[goal.metric]}
                    </h5>
                    <div className="text-sm text-gray-600">
                      Target: {goal.targetScore}/10 • Deadline: {formatDate(goal.deadline)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(goal.progress)}%
                    </div>
                    <div className="text-xs text-gray-500">Progress</div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>

                {goal.strategies.length > 0 && (
                  <div>
                    <h6 className="font-medium text-gray-700 mb-2">Strategi:</h6>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {goal.strategies.map((strategy, index) => (
                        <li key={index}>• {strategy}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Assessment Tab */}
      {activeTab === 'assessment' && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Self Assessment Kecerdasan Emosional
            </h4>
            <p className="text-gray-600">
              Nilai diri Anda pada setiap dimensi EI (1-10 skala)
            </p>
          </div>

          <div className="space-y-6">
            {Object.entries(metricLabels).map(([key, label]) => (
              <div key={key} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h5 className="font-medium text-gray-900">{label}</h5>
                    <p className="text-sm text-gray-600">{metricDescriptions[key]}</p>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {selfAssessment[key as keyof typeof selfAssessment]}
                  </div>
                </div>
                
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={selfAssessment[key as keyof typeof selfAssessment]}
                  onChange={(e) => setSelfAssessment(prev => ({
                    ...prev,
                    [key]: parseInt(e.target.value)
                  }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 (Sangat Kurang)</span>
                  <span>10 (Sangat Baik)</span>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={handleSelfAssessment} className="w-full">
            💾 Simpan Assessment
          </Button>
        </div>
      )}

      {/* Self Assessment Modal */}
      {showSelfAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Self Assessment</h3>
            
            <div className="space-y-4">
              {Object.entries(metricLabels).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">{label}</span>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={selfAssessment[key as keyof typeof selfAssessment]}
                      onChange={(e) => setSelfAssessment(prev => ({
                        ...prev,
                        [key]: parseInt(e.target.value)
                      }))}
                      className="w-32"
                    />
                    <span className="w-8 text-center font-bold text-blue-600">
                      {selfAssessment[key as keyof typeof selfAssessment]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex space-x-3 mt-6">
              <Button onClick={handleSelfAssessment} className="flex-1">
                💾 Simpan
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSelfAssessment(false)}
                className="flex-1"
              >
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Goal Modal */}
      {showCreateGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Buat Development Goal</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dimensi EI
                </label>
                <select
                  value={newGoal.metric || ''}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, metric: e.target.value as 'empathy' | 'selfAwareness' | 'motivation' | 'selfRegulation' | 'socialSkills' }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.entries(metricLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Skor Saat Ini"
                  type="number"
                  min="1"
                  max="10"
                  value={newGoal.currentScore || ''}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, currentScore: parseInt(e.target.value) || 5 }))}
                />
                <Input
                  label="Target Skor"
                  type="number"
                  min="1"
                  max="10"
                  value={newGoal.targetScore || ''}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, targetScore: parseInt(e.target.value) || 8 }))}
                />
              </div>

              <Input
                label="Deadline"
                type="date"
                value={newGoal.deadline?.toISOString().split('T')[0] || ''}
                onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: new Date(e.target.value) }))}
              />
            </div>
            
            <div className="flex space-x-3 mt-6">
              <Button onClick={handleCreateGoal} className="flex-1">
                🎯 Buat Goal
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateGoal(false)}
                className="flex-1"
              >
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};