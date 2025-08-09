import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, Flame, Trophy, Target, Star, CheckCircle,
  Clock, TrendingUp, Award, Zap
} from 'lucide-react';
import { Card } from '../ui/Card';
import { useMoodTracker } from '../../hooks/useMoodTracker';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  streakPercentage: number;
  recentActivity: Array<{
    date: Date;
    hasActivity: boolean;
    type?: 'mood' | 'meditation' | 'both';
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    achieved: boolean;
    icon: string;
    achievedAt?: Date;
  }>;
}

interface Props {
  className?: string;
  meditationSessions?: Array<{ completedAt: Date }>;
}

export const StreakTracker: React.FC<Props> = ({
  className = '',
  meditationSessions = []
}) => {
  const { moodHistory } = useMoodTracker();

  // Calculate streak data
  const streakData: StreakData = useMemo(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    // Combine mood and meditation activities
    const allActivities: Array<{ date: Date; type: 'mood' | 'meditation' }> = [
      ...moodHistory.map(entry => ({ date: entry.timestamp, type: 'mood' as const })),
      ...meditationSessions.map(session => ({ date: session.completedAt, type: 'meditation' as const }))
    ];

    // Group activities by date
    const activityByDate = allActivities.reduce((acc, activity) => {
      const dateStr = activity.date.toDateString();
      if (!acc[dateStr]) {
        acc[dateStr] = { mood: false, meditation: false };
      }
      acc[dateStr][activity.type] = true;
      return acc;
    }, {} as Record<string, { mood: boolean; meditation: boolean }>);

    // Calculate current streak
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let currentDate = new Date(today);
    currentDate.setHours(0, 0, 0, 0);

    // Check current streak
    while (true) {
      const dateStr = currentDate.toDateString();
      const hasActivity = activityByDate[dateStr];
      
      if (hasActivity && (hasActivity.mood || hasActivity.meditation)) {
        currentStreak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate longest streak (check last 365 days)
    const yearAgo = new Date(today);
    yearAgo.setFullYear(today.getFullYear() - 1);
    currentDate = new Date(today);
    
    while (currentDate >= yearAgo) {
      const dateStr = currentDate.toDateString();
      const hasActivity = activityByDate[dateStr];
      
      if (hasActivity && (hasActivity.mood || hasActivity.meditation)) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
      
      currentDate.setDate(currentDate.getDate() - 1);
    }

    // Generate recent activity (last 30 days)
    const recentActivity: Array<{
      date: Date;
      hasActivity: boolean;
      type?: 'mood' | 'meditation' | 'both';
    }> = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dateStr = date.toDateString();
      const dayActivity = activityByDate[dateStr];
      
      let activityType: 'mood' | 'meditation' | 'both' | undefined;
      let hasActivity = false;
      
      if (dayActivity) {
        if (dayActivity.mood && dayActivity.meditation) {
          activityType = 'both';
          hasActivity = true;
        } else if (dayActivity.mood) {
          activityType = 'mood';
          hasActivity = true;
        } else if (dayActivity.meditation) {
          activityType = 'meditation';
          hasActivity = true;
        }
      }
      
      recentActivity.push({
        date,
        hasActivity,
        type: activityType
      });
    }

    const totalActiveDays = Object.values(activityByDate).filter(
      activity => activity.mood || activity.meditation
    ).length;

    const streakPercentage = Math.min((currentStreak / 30) * 100, 100);

    // Define achievements
    const achievements = [
      {
        id: 'first-day',
        title: 'Langkah Pertama',
        description: 'Mulai perjalanan mindfulness',
        achieved: currentStreak >= 1,
        icon: '🌱',
        achievedAt: currentStreak >= 1 ? new Date() : undefined
      },
      {
        id: 'week-warrior',
        title: 'Week Warrior',
        description: '7 hari berturut-turut',
        achieved: currentStreak >= 7,
        icon: '🗓️'
      },
      {
        id: 'month-master',
        title: 'Month Master',
        description: '30 hari berturut-turut',
        achieved: currentStreak >= 30,
        icon: '📅'
      },
      {
        id: 'streak-legend',
        title: 'Streak Legend',
        description: '100 hari berturut-turut',
        achieved: currentStreak >= 100,
        icon: '🏆'
      },
      {
        id: 'consistent-practitioner',
        title: 'Praktisi Konsisten',
        description: '50 total hari aktif',
        achieved: totalActiveDays >= 50,
        icon: '⭐'
      },
      {
        id: 'dedication-master',
        title: 'Master Dedikasi',
        description: 'Streak terpanjang 60 hari',
        achieved: longestStreak >= 60,
        icon: '🎯'
      }
    ];

    return {
      currentStreak,
      longestStreak,
      totalActiveDays,
      streakPercentage,
      recentActivity,
      achievements
    };
  }, [moodHistory, meditationSessions]);

  const getActivityColor = (activity: typeof streakData.recentActivity[0]) => {
    if (!activity.hasActivity) return 'bg-gray-200';
    
    switch (activity.type) {
      case 'both':
        return 'bg-gradient-to-br from-green-400 to-blue-500';
      case 'mood':
        return 'bg-blue-400';
      case 'meditation':
        return 'bg-green-400';
      default:
        return 'bg-gray-300';
    }
  };

  const getActivityTooltip = (activity: typeof streakData.recentActivity[0]) => {
    if (!activity.hasActivity) return 'Tidak ada aktivitas';
    
    switch (activity.type) {
      case 'both':
        return 'Mood + Meditasi';
      case 'mood':
        return 'Mood tracking';
      case 'meditation':
        return 'Sesi meditasi';
      default:
        return 'Aktivitas';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Streak Display */}
      <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-100 border-orange-200">
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="w-20 h-20 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
          >
            <Flame className="w-10 h-10 text-white" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-heading font-bold text-orange-900 mb-2">
              {streakData.currentStreak}
            </h2>
            <p className="text-orange-700 font-medium">Hari Berturut-turut</p>
            <p className="text-sm text-orange-600 mt-1">
              Tetap konsisten dalam perjalanan mindfulness!
            </p>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-orange-700 mb-2">
            <span>Progress menuju 30 hari</span>
            <span>{Math.round(streakData.streakPercentage)}%</span>
          </div>
          <div className="w-full bg-orange-200 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-orange-400 to-red-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${streakData.streakPercentage}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-orange-900">{streakData.longestStreak}</div>
            <div className="text-xs text-orange-700">Streak Terpanjang</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-900">{streakData.totalActiveDays}</div>
            <div className="text-xs text-orange-700">Total Hari Aktif</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-900">
              {streakData.totalActiveDays > 0 ? Math.round((streakData.currentStreak / streakData.totalActiveDays) * 100) : 0}%
            </div>
            <div className="text-xs text-orange-700">Konsistensi</div>
          </div>
        </div>
      </Card>

      {/* Activity Calendar */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Aktivitas 30 Hari Terakhir</h3>
          <Calendar className="w-5 h-5 text-gray-500" />
        </div>

        {/* Calendar Grid */}
        <div className="space-y-3">
          {/* Week labels */}
          <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 text-center mb-2">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
              <div key={day} className="py-1">{day}</div>
            ))}
          </div>

          {/* Activity grid */}
          <div className="grid grid-cols-7 gap-1">
            {streakData.recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                className={`
                  w-8 h-8 rounded-lg ${getActivityColor(activity)} 
                  border border-white shadow-sm cursor-pointer
                  hover:scale-110 transition-transform
                `}
                title={`${activity.date.toLocaleDateString('id-ID')} - ${getActivityTooltip(activity)}`}
              >
                {activity.hasActivity && activity.type === 'both' && (
                  <div className="w-full h-full flex items-center justify-center">
                    <Star className="w-3 h-3 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-600 mt-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-200 rounded"></div>
              <span>Tidak aktif</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-400 rounded"></div>
              <span>Mood</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-400 rounded"></div>
              <span>Meditasi</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gradient-to-br from-green-400 to-blue-500 rounded"></div>
              <span>Keduanya</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Achievements */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Pencapaian Streak</h3>
          <Trophy className="w-5 h-5 text-gray-500" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {streakData.achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                p-4 rounded-lg border-2 transition-all
                ${achievement.achieved 
                  ? 'border-green-300 bg-green-50 shadow-md' 
                  : 'border-gray-200 bg-gray-50'
                }
              `}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className={`
                  text-2xl p-2 rounded-lg
                  ${achievement.achieved 
                    ? 'bg-green-100' 
                    : 'bg-gray-100 grayscale'
                  }
                `}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <h4 className={`
                    font-semibold text-sm
                    ${achievement.achieved ? 'text-green-900' : 'text-gray-600'}
                  `}>
                    {achievement.title}
                  </h4>
                  <p className={`
                    text-xs
                    ${achievement.achieved ? 'text-green-700' : 'text-gray-500'}
                  `}>
                    {achievement.description}
                  </p>
                </div>
                {achievement.achieved && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Achievement Stats */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-100 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-purple-700">Progress Pencapaian</span>
              <div className="text-2xl font-bold text-purple-900">
                {streakData.achievements.filter(a => a.achieved).length} / {streakData.achievements.length}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-purple-700 mb-1">Completion Rate</div>
              <div className="text-2xl font-bold text-purple-900">
                {Math.round((streakData.achievements.filter(a => a.achieved).length / streakData.achievements.length) * 100)}%
              </div>
            </div>
          </div>
          
          <div className="w-full bg-purple-200 rounded-full h-2 mt-3">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: `${(streakData.achievements.filter(a => a.achieved).length / streakData.achievements.length) * 100}%` 
              }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      </Card>

      {/* Motivation Messages */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-100 border-blue-200">
        <div className="text-center">
          <Zap className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            {streakData.currentStreak === 0 
              ? "Mulai streak Anda hari ini!"
              : streakData.currentStreak < 7
              ? "Bagus! Lanjutkan momentum ini!"
              : streakData.currentStreak < 30
              ? "Luar biasa! Anda menuju pencapaian besar!"
              : "Menakjubkan! Anda adalah master konsistensi!"
            }
          </h3>
          <p className="text-sm text-blue-700">
            {streakData.currentStreak === 0
              ? "Setiap perjalanan dimulai dari langkah pertama. Catat mood atau mulai sesi meditasi hari ini!"
              : streakData.currentStreak < 7
              ? "Konsistensi adalah kunci. Pertahankan momentum positif ini!"
              : streakData.currentStreak < 30
              ? "Streak yang mengesankan! Sedikit lagi menuju pencapaian 30 hari."
              : "Anda telah membangun kebiasaan yang luar biasa. Tetap pertahankan!"
            }
          </p>
        </div>
      </Card>
    </div>
  );
};