export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'streak' | 'session_count' | 'time_total' | 'consistency' | 'milestone';
  requirement: number;
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const calculateRealAchievements = (userStats: {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  daysActive: number;
  createdAt?: Date;
}): Achievement[] => {
  const achievements: Achievement[] = [
    // Beginner achievements
    {
      id: 'first_session',
      name: 'Langkah Pertama',
      description: 'Menyelesaikan sesi meditasi pertama',
      icon: '🌱',
      type: 'session_count',
      requirement: 1,
      earned: userStats.totalSessions >= 1,
      earnedDate: userStats.totalSessions >= 1 ? userStats.createdAt?.toISOString().split('T')[0] : undefined,
      rarity: 'common'
    },
    {
      id: 'three_day_streak',
      name: 'Konsisten 3 Hari',
      description: 'Bermeditasi selama 3 hari berturut-turut',
      icon: '🔥',
      type: 'streak',
      requirement: 3,
      earned: userStats.currentStreak >= 3,
      progress: userStats.currentStreak < 3 ? Math.round((userStats.currentStreak / 3) * 100) : undefined,
      rarity: 'common'
    },
    {
      id: 'week_streak',
      name: 'Seminggu Penuh',
      description: 'Bermeditasi selama 7 hari berturut-turut',
      icon: '⭐',
      type: 'streak',
      requirement: 7,
      earned: userStats.currentStreak >= 7,
      progress: userStats.currentStreak < 7 ? Math.round((userStats.currentStreak / 7) * 100) : undefined,
      rarity: 'rare'
    },
    {
      id: 'hour_total',
      name: 'Satu Jam Perjalanan',
      description: 'Total 60 menit waktu meditasi',
      icon: '⏰',
      type: 'time_total',
      requirement: 60,
      earned: userStats.totalMinutes >= 60,
      progress: userStats.totalMinutes < 60 ? Math.round((userStats.totalMinutes / 60) * 100) : undefined,
      rarity: 'common'
    },
    {
      id: 'ten_sessions',
      name: 'Dedikasi Konsisten',
      description: 'Menyelesaikan 10 sesi meditasi',
      icon: '💯',
      type: 'session_count',
      requirement: 10,
      earned: userStats.totalSessions >= 10,
      progress: userStats.totalSessions < 10 ? Math.round((userStats.totalSessions / 10) * 100) : undefined,
      rarity: 'rare'
    },
    
    // Intermediate achievements
    {
      id: 'month_streak',
      name: 'Bulan Emas',
      description: 'Bermeditasi selama 30 hari berturut-turut',
      icon: '🏆',
      type: 'streak',
      requirement: 30,
      earned: userStats.longestStreak >= 30,
      progress: userStats.longestStreak < 30 ? Math.round((userStats.longestStreak / 30) * 100) : undefined,
      rarity: 'epic'
    },
    {
      id: 'five_hours',
      name: 'Perjalanan Mendalam',
      description: 'Total 5 jam waktu meditasi',
      icon: '🧘‍♀️',
      type: 'time_total',
      requirement: 300,
      earned: userStats.totalMinutes >= 300,
      progress: userStats.totalMinutes < 300 ? Math.round((userStats.totalMinutes / 300) * 100) : undefined,
      rarity: 'rare'
    },
    {
      id: 'fifty_sessions',
      name: 'Praktisi Berpengalaman',
      description: 'Menyelesaikan 50 sesi meditasi',
      icon: '🎯',
      type: 'session_count',
      requirement: 50,
      earned: userStats.totalSessions >= 50,
      progress: userStats.totalSessions < 50 ? Math.round((userStats.totalSessions / 50) * 100) : undefined,
      rarity: 'epic'
    },
    
    // Advanced achievements
    {
      id: 'hundred_days',
      name: 'Master Mindfulness',
      description: 'Bermeditasi selama 100 hari berturut-turut',
      icon: '👑',
      type: 'streak',
      requirement: 100,
      earned: userStats.longestStreak >= 100,
      progress: userStats.longestStreak < 100 ? Math.round((userStats.longestStreak / 100) * 100) : undefined,
      rarity: 'legendary'
    },
    {
      id: 'twenty_hours',
      name: 'Jiwa Tenang',
      description: 'Total 20 jam waktu meditasi',
      icon: '✨',
      type: 'time_total',
      requirement: 1200,
      earned: userStats.totalMinutes >= 1200,
      progress: userStats.totalMinutes < 1200 ? Math.round((userStats.totalMinutes / 1200) * 100) : undefined,
      rarity: 'epic'
    }
  ];

  // Sort achievements: earned first, then by progress
  return achievements.sort((a, b) => {
    if (a.earned && !b.earned) return -1;
    if (!a.earned && b.earned) return 1;
    if (!a.earned && !b.earned) {
      return (b.progress || 0) - (a.progress || 0);
    }
    return 0;
  });
};

export const getRarityColor = (rarity: Achievement['rarity']) => {
  switch (rarity) {
    case 'common': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'rare': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'epic': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'legendary': return 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-gray-100 text-gray-800';
  }
};