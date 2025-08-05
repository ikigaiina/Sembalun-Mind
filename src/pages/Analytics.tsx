import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Calendar, TrendingUp, TrendingDown, Target, Clock, Heart, Brain, Award } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface MeditationStats {
  totalSessions: number;
  totalMinutes: number;
  averageSessionLength: number;
  currentStreak: number;
  longestStreak: number;
  weeklyGoal: number;
  weeklyProgress: number;
  monthlyGoal: number;
  monthlyProgress: number;
}

interface MoodStats {
  averageMood: number;
  moodTrend: 'improving' | 'declining' | 'stable';
  dominantEmotions: Array<{ emotion: string; percentage: number; color: string }>;
  moodVariability: number;
}

interface ProgressData {
  date: string;
  sessions: number;
  minutes: number;
  mood: number;
  stress: number;
  focus: number;
}

interface CategoryStats {
  name: string;
  sessions: number;
  minutes: number;
  color: string;
}

interface AchievementStats {
  total: number;
  recent: Array<{
    id: string;
    name: string;
    description: string;
    earnedAt: Date;
    category: string;
  }>;
}

const Analytics: React.FC = () => {
  const [meditationStats, setMeditationStats] = useState<MeditationStats | null>(null);
  const [moodStats, setMoodStats] = useState<MoodStats | null>(null);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [achievements, setAchievements] = useState<AchievementStats | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data - in real app, fetch from analytics service
    setTimeout(() => {
      setMeditationStats({
        totalSessions: 156,
        totalMinutes: 2340,
        averageSessionLength: 15,
        currentStreak: 12,
        longestStreak: 28,
        weeklyGoal: 7,
        weeklyProgress: 5,
        monthlyGoal: 30,
        monthlyProgress: 23
      });

      setMoodStats({
        averageMood: 7.2,
        moodTrend: 'improving',
        dominantEmotions: [
          { emotion: 'Calm', percentage: 35, color: '#10B981' },
          { emotion: 'Happy', percentage: 25, color: '#F59E0B' },
          { emotion: 'Focused', percentage: 20, color: '#3B82F6' },
          { emotion: 'Peaceful', percentage: 12, color: '#8B5CF6' },
          { emotion: 'Energetic', percentage: 8, color: '#EF4444' }
        ],
        moodVariability: 6.8
      });

      const mockProgressData: ProgressData[] = [
        { date: '2024-01-01', sessions: 1, minutes: 15, mood: 6, stress: 4, focus: 7 },
        { date: '2024-01-02', sessions: 2, minutes: 25, mood: 7, stress: 3, focus: 8 },
        { date: '2024-01-03', sessions: 1, minutes: 10, mood: 6, stress: 5, focus: 6 },
        { date: '2024-01-04', sessions: 2, minutes: 30, mood: 8, stress: 2, focus: 9 },
        { date: '2024-01-05', sessions: 1, minutes: 20, mood: 7, stress: 3, focus: 8 },
        { date: '2024-01-06', sessions: 3, minutes: 45, mood: 9, stress: 1, focus: 9 },
        { date: '2024-01-07', sessions: 2, minutes: 30, mood: 8, stress: 2, focus: 8 },
        { date: '2024-01-08', sessions: 1, minutes: 15, mood: 7, stress: 3, focus: 7 },
        { date: '2024-01-09', sessions: 2, minutes: 35, mood: 8, stress: 2, focus: 9 },
        { date: '2024-01-10', sessions: 1, minutes: 20, mood: 7, stress: 4, focus: 7 },
        { date: '2024-01-11', sessions: 2, minutes: 40, mood: 9, stress: 1, focus: 9 },
        { date: '2024-01-12', sessions: 3, minutes: 50, mood: 9, stress: 1, focus: 10 },
        { date: '2024-01-13', sessions: 2, minutes: 30, mood: 8, stress: 2, focus: 8 },
        { date: '2024-01-14', sessions: 1, minutes: 15, mood: 7, stress: 3, focus: 7 }
      ];
      setProgressData(mockProgressData);

      setCategoryStats([
        { name: 'Mindfulness', sessions: 45, minutes: 675, color: '#10B981' },
        { name: 'Sleep', sessions: 32, minutes: 960, color: '#3B82F6' },
        { name: 'Stress Relief', sessions: 28, minutes: 420, color: '#F59E0B' },
        { name: 'Focus', sessions: 25, minutes: 375, color: '#8B5CF6' },
        { name: 'Movement', sessions: 18, minutes: 270, color: '#EC4899' },
        { name: 'Breathing', sessions: 15, minutes: 225, color: '#EF4444' }
      ]);

      setAchievements({
        total: 24,
        recent: [
          {
            id: '1',
            name: 'Consistency Master',
            description: 'Meditated for 7 days in a row',
            earnedAt: new Date('2024-01-10'),
            category: 'Consistency'
          },
          {
            id: '2',
            name: 'Time Warrior',
            description: 'Completed 1000 minutes of meditation',
            earnedAt: new Date('2024-01-08'),
            category: 'Duration'
          },
          {
            id: '3',
            name: 'Mood Booster',
            description: 'Improved mood rating by 2 points',
            earnedAt: new Date('2024-01-05'),
            category: 'Wellness'
          }
        ]
      });

      setIsLoading(false);
    }, 1000);
  }, [timeRange]);

  const getTimeRangeData = () => {
    switch (timeRange) {
      case 'week':
        return progressData.slice(-7);
      case 'month':
        return progressData.slice(-30);
      case 'year':
        return progressData; // Would be last 365 days
      default:
        return progressData;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const getStreakIcon = (streak: number) => {
    if (streak >= 30) return '🔥';
    if (streak >= 14) return '⚡';
    if (streak >= 7) return '✨';
    return '💫';
  };

  const getMoodTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'declining': return <TrendingDown className="w-5 h-5 text-red-500" />;
      default: return <Target className="w-5 h-5 text-blue-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Analytics</h1>
              <p className="text-gray-600">Track your meditation journey and progress</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="flex space-x-2">
                {(['week', 'month', 'year'] as const).map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range ? 'primary' : 'outline'}
                    onClick={() => setTimeRange(range)}
                    className="capitalize"
                  >
                    {range}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-3xl font-bold text-gray-900">{meditationStats?.totalSessions}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>+12% from last month</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Minutes</p>
                <p className="text-3xl font-bold text-gray-900">{meditationStats?.totalMinutes}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>+8% from last month</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Streak</p>
                <p className="text-3xl font-bold text-gray-900 flex items-center">
                  {meditationStats?.currentStreak}
                  <span className="ml-2 text-2xl">{getStreakIcon(meditationStats?.currentStreak || 0)}</span>
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Award className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Longest streak: {meditationStats?.longestStreak} days
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Mood</p>
                <p className="text-3xl font-bold text-gray-900 flex items-center">
                  {moodStats?.averageMood}
                  <span className="ml-2">{getMoodTrendIcon(moodStats?.moodTrend || 'stable')}</span>
                </p>
              </div>
              <div className="p-3 bg-pink-100 rounded-full">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500 capitalize">
                Trend: {moodStats?.moodTrend}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Session Progress */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Meditation Progress</h3>
              <div className="flex space-x-2">
                <Button
                  variant={chartType === 'area' ? 'primary' : 'outline'}
                  size="small"
                  onClick={() => setChartType('area')}
                >
                  Area
                </Button>
                <Button
                  variant={chartType === 'bar' ? 'primary' : 'outline'}
                  size="small"
                  onClick={() => setChartType('bar')}
                >
                  Bar
                </Button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              {chartType === 'area' ? (
                <AreaChart data={getTimeRangeData()}>
                  <defs>
                    <linearGradient id="sessionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDate} />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => formatDate(value as string)}
                    formatter={(value, name) => [value, name === 'sessions' ? 'Sessions' : 'Minutes']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sessions" 
                    stroke="#3B82F6" 
                    fill="url(#sessionGradient)" 
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="minutes" 
                    stroke="#10B981" 
                    fill="transparent" 
                    strokeWidth={2}
                  />
                </AreaChart>
              ) : (
                <BarChart data={getTimeRangeData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDate} />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => formatDate(value as string)}
                    formatter={(value, name) => [value, name === 'sessions' ? 'Sessions' : 'Minutes']}
                  />
                  <Bar dataKey="sessions" fill="#3B82F6" />
                  <Bar dataKey="minutes" fill="#10B981" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Mood & Wellness Trends */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood & Wellness Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getTimeRangeData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatDate} />
                <YAxis domain={[0, 10]} />
                <Tooltip 
                  labelFormatter={(value) => formatDate(value as string)}
                />
                <Line type="monotone" dataKey="mood" stroke="#EC4899" strokeWidth={2} name="Mood" />
                <Line type="monotone" dataKey="stress" stroke="#EF4444" strokeWidth={2} name="Stress" />
                <Line type="monotone" dataKey="focus" stroke="#8B5CF6" strokeWidth={2} name="Focus" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories and Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Category Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="sessions"
                >
                  {categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip                   formatter={(value) => [value, 'Sessions']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Goals Progress */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Goals Progress</h3>
            <div className="space-y-6">
              {/* Weekly Goal */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Weekly Goal</span>
                  <span className="text-sm text-gray-900">
                    {meditationStats?.weeklyProgress}/{meditationStats?.weeklyGoal} sessions
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${Math.min(((meditationStats?.weeklyProgress || 0) / (meditationStats?.weeklyGoal || 1)) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>

              {/* Monthly Goal */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Monthly Goal</span>
                  <span className="text-sm text-gray-900">
                    {meditationStats?.monthlyProgress}/{meditationStats?.monthlyGoal} sessions
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ 
                      width: `${Math.min(((meditationStats?.monthlyProgress || 0) / (meditationStats?.monthlyGoal || 1)) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>

              {/* Mood Distribution */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Dominant Emotions</h4>
                <div className="space-y-2">
                  {moodStats?.dominantEmotions.map((emotion, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: emotion.color }}
                        ></div>
                        <span className="text-sm text-gray-600">{emotion.emotion}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {emotion.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Achievements</h3>
            <div className="text-sm text-gray-500">
              Total: {achievements?.total} achievements
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {achievements?.recent.map((achievement) => (
              <div key={achievement.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-full">
                    <Award className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{achievement.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">{achievement.category}</span>
                      <span className="text-xs text-gray-500">
                        {achievement.earnedAt.toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export and Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Export Your Data</h3>
              <p className="text-sm text-gray-600 mt-1">
                Download your meditation data and progress reports
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Export PDF Report</span>
              </Button>
              <Button variant="primary" className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Share Progress</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;