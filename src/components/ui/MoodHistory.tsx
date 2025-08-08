import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, Heart, Target } from 'lucide-react';
import { Card } from './Card';
import { useMoodTracker } from '../../hooks/useMoodTracker';
import type { MoodType } from '../../types/mood';
import { getMoodColor } from '../../types/mood';

interface MoodHistoryProps {
  className?: string;
  showStats?: boolean;
  showChart?: boolean;
  showCalendar?: boolean;
}

// Mood to numeric value mapping for calculations
const moodValues: Record<MoodType, number> = {
  'very-sad': 1,
  'sad': 2,
  'neutral': 3,
  'happy': 4,
  'very-happy': 5,
  'anxious': 2,
  'angry': 1,
  'calm': 4,
  'excited': 5,
  'tired': 2,
};

const moodLabels: Record<MoodType, string> = {
  'very-sad': 'Sangat Sedih',
  'sad': 'Sedih',
  'neutral': 'Biasa',
  'happy': 'Senang',
  'very-happy': 'Sangat Senang',
  'anxious': 'Cemas',
  'angry': 'Marah',
  'calm': 'Tenang',
  'excited': 'Bersemangat',
  'tired': 'Lelah',
};

const moodEmojis: Record<MoodType, string> = {
  'very-sad': '😢',
  'sad': '😔',
  'neutral': '😐',
  'happy': '😊',
  'very-happy': '😄',
  'anxious': '😰',
  'angry': '😠',
  'calm': '😌',
  'excited': '🤩',
  'tired': '😴',
};

export const MoodHistory: React.FC<MoodHistoryProps> = ({
  className = '',
  showStats = true,
  showChart = true,
  showCalendar = true,
}) => {
  const { moodHistory, getMoodStats, loading, currentMood, getTodaysMood } = useMoodTracker();
  
  // Get today's mood for better display
  const todaysMood = getTodaysMood();
  const [refreshKey, setRefreshKey] = React.useState(0);
  
  // Force refresh when mood history changes
  React.useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [moodHistory.length, currentMood]);

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg w-1/2 mx-auto"></div>
            <div className="h-40 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg"></div>
              <div className="h-24 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg"></div>
            </div>
          </div>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 animate-pulse">Memuat riwayat perasaan Anda...</p>
          </div>
        </Card>
      </div>
    );
  }

  const stats = getMoodStats();

  // Prepare chart data for weekly mood trends
  const chartData = stats.weeklyAverage.map((avg, index) => ({
    week: `W${7 - index}`,
    average: avg,
    label: `${7 - index} minggu lalu`,
  }));

  // Prepare pie chart data for mood distribution
  const pieData = Object.entries(stats.moodDistribution)
    .filter(([_, count]) => count > 0)
    .map(([mood, count]) => ({
      name: moodLabels[mood as MoodType],
      value: count,
      color: getMoodColor(mood as MoodType),
      emoji: moodEmojis[mood as MoodType],
    }));

  // Prepare recent entries for calendar view
  const recentEntries = moodHistory.slice(0, 30);

  const formatTooltipValue = (value: number) => {
    if (value === 0) return 'Tidak ada data';
    const moodNames = ['', 'Sangat Sedih', 'Sedih', 'Biasa', 'Senang', 'Sangat Senang'];
    const roundedValue = Math.max(1, Math.min(5, Math.round(value)));
    return `${value.toFixed(1)} (${moodNames[roundedValue]})`;
  };

  const getMoodEmoji = (value: number) => {
    if (value <= 1.5) return '😢'; // very-sad
    if (value <= 2.5) return '😔'; // sad  
    if (value <= 3.5) return '😐'; // neutral
    if (value <= 4.5) return '😊'; // happy
    return '😄'; // very-happy
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-2">
          Riwayat Suasana Hati
        </h2>
        <p className="text-gray-600">
          Pantau perjalanan emosional Anda dari waktu ke waktu
        </p>
      </motion.div>

      {/* Today's Summary */}
      {todaysMood && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">
                  {moodEmojis[todaysMood.mood]}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Hari Ini: {moodLabels[todaysMood.mood]}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Dicatat pada {todaysMood.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold" style={{ color: getMoodColor(todaysMood.mood) }}>
                  {moodValues[todaysMood.mood]}/5
                </div>
                <div className="text-xs text-gray-500">Skor hari ini</div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
      
      {/* Stats Cards */}
      {showStats && stats.totalEntries > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card className="p-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-600" />
              </div>
              <div className="text-2xl font-bold text-primary-600">
                {getMoodEmoji(stats.averageMood)}
              </div>
              <div className="text-xs text-gray-600">Rata-rata</div>
              <div className="text-sm font-medium text-gray-800">
                {stats.averageMood.toFixed(1)}/5
              </div>
            </div>
          </Card>

          <Card className="p-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-accent-600" />
              </div>
              <div className="text-2xl font-bold text-accent-600">
                {stats.totalEntries}
              </div>
              <div className="text-xs text-gray-600">Total Entri</div>
              <div className="text-sm font-medium text-gray-800">
                hari tercatat
              </div>
            </div>
          </Card>

          <Card className="p-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-meditation-zen-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-meditation-zen-600" />
              </div>
              <div className="text-2xl font-bold text-meditation-zen-600">
                {stats.streakDays}
              </div>
              <div className="text-xs text-gray-600">Streak</div>
              <div className="text-sm font-medium text-gray-800">
                hari berturut
              </div>
            </div>
          </Card>

          <Card className="p-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-meditation-energy-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-meditation-energy-600" />
              </div>
              <div className="text-2xl font-bold text-meditation-energy-600">
                {stats.weeklyAverage[0]?.toFixed(1) || '0'}
              </div>
              <div className="text-xs text-gray-600">Minggu Ini</div>
              <div className="text-sm font-medium text-gray-800">
                rata-rata
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Charts */}
      {showChart && stats.totalEntries > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Weekly Trend Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              Tren Mingguan
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="week" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    domain={[1, 5]} 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <Tooltip 
                    formatter={formatTooltipValue}
                    labelFormatter={(label) => {
                      const item = chartData.find(d => d.week === label);
                      return item?.label || label;
                    }}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="average" 
                    stroke="#6A8F6F" 
                    strokeWidth={3}
                    dot={{ fill: '#6A8F6F', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, fill: '#A9C1D9' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Mood Distribution Pie Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              Distribusi Suasana Hati
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [`${value} hari`, name]}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-gray-600">
                    {entry.emoji} {entry.name}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Calendar View */}
      {showCalendar && recentEntries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              30 Hari Terakhir
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                <div key={day} className="text-xs text-gray-500 text-center p-2 font-medium">
                  {day}
                </div>
              ))}
              
              {/* Calendar cells */}
              {Array.from({ length: 30 }, (_, index) => {
                const date = new Date();
                date.setDate(date.getDate() - (29 - index));
                const dateString = date.toDateString();
                
                const entry = recentEntries.find(e => 
                  e.timestamp.toDateString() === dateString
                );
                
                return (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.1 }}
                    className="aspect-square p-1 rounded-lg border-2 border-transparent hover:border-primary-200 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center relative"
                    style={{
                      backgroundColor: entry 
                        ? `${getMoodColor(entry.mood)}15` 
                        : '#f9fafb'
                    }}
                    title={entry ? 
                      `${date.getDate()}/${date.getMonth() + 1}: ${moodLabels[entry.mood]}` :
                      `${date.getDate()}/${date.getMonth() + 1}: Tidak ada data`
                    }
                  >
                    <div className="text-xs font-medium text-gray-700">
                      {date.getDate()}
                    </div>
                    {entry && (
                      <div className="text-lg leading-none">
                        {moodEmojis[entry.mood]}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
            
            {/* Calendar legend */}
            <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-gray-100"></div>
                <span>Tidak ada data</span>
              </div>
              {Object.entries(moodEmojis).map(([mood, emoji]) => (
                <div key={mood} className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: `${getMoodColor(mood as MoodType)}30` }}
                  ></div>
                  <span>{emoji} {moodLabels[mood as MoodType]}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Enhanced Empty State */}
      {stats.totalEntries === 0 && (
        <Card className="p-8 border-2 border-dashed border-gray-200 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-8"
          >
            <motion.div 
              className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
              animate={{ 
                boxShadow: ['0 4px 6px rgba(59, 130, 246, 0.3)', '0 8px 25px rgba(147, 51, 234, 0.4)', '0 4px 6px rgba(59, 130, 246, 0.3)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Heart className="w-10 h-10 text-white" />
            </motion.div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Mulai Perjalanan Emosional Anda
            </h3>
            <p className="text-gray-600 max-w-lg mx-auto mb-8 leading-relaxed text-base">
              Belum ada riwayat perasaan yang tercatat. Mulai catat perasaan Anda setiap hari untuk memahami pola emosi dan meningkatkan kesejahteraan mental.
            </p>
            <motion.div 
              className="flex justify-center space-x-3 text-3xl mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, staggerChildren: 0.1 }}
            >
              {['😢', '😔', '😐', '😊', '😄'].map((emoji, index) => (
                <motion.span
                  key={index}
                  className="hover:scale-125 transition-transform cursor-pointer"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    delay: index * 0.2,
                    ease: "easeInOut"
                  }}
                >
                  {emoji}
                </motion.span>
              ))}
            </motion.div>
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-gray-700 font-medium flex items-center justify-center">
                <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                Pilih suasana hati Anda di bagian atas untuk mulai tracking
              </p>
            </div>
          </motion.div>
        </Card>
      )}
    </div>
  );
};