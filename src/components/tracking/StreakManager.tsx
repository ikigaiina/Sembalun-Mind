import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { progressService } from '../../services/progressService';
import type { UserStreak } from '../../types/progress';

interface StreakManagerProps {
  className?: string;
}

export const StreakManager: React.FC<StreakManagerProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [streaks, setStreaks] = useState<UserStreak[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStreak, setSelectedStreak] = useState<UserStreak | null>(null);

  const loadStreaks = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const userStreaks = await progressService.getUserStreaks(user.uid);
      setStreaks(userStreaks);
    } catch (error) {
      console.error('Error loading streaks:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadStreaks();
    }
  }, [user, loadStreaks]);

  const getStreakIcon = (type: string) => {
    const icons = {
      meditation: '🧘',
      mood_tracking: '📊',
      course_study: '📚',
      mindfulness: '✨'
    };
    return icons[type as keyof typeof icons] || '⭐';
  };

  const getStreakTitle = (type: string) => {
    const titles = {
      meditation: 'Meditasi Harian',
      mood_tracking: 'Tracking Mood',
      course_study: 'Belajar Kursus',
      mindfulness: 'Praktik Mindfulness'
    };
    return titles[type as keyof typeof titles] || type;
  };

  const getStreakColor = (streak: UserStreak) => {
    if (!streak.isActive) return 'bg-gray-100 border-gray-200';
    
    if (streak.currentStreak >= 30) return 'bg-purple-100 border-purple-300';
    if (streak.currentStreak >= 14) return 'bg-blue-100 border-blue-300';
    if (streak.currentStreak >= 7) return 'bg-green-100 border-green-300';
    if (streak.currentStreak >= 3) return 'bg-yellow-100 border-yellow-300';
    return 'bg-orange-100 border-orange-300';
  };

  const getStreakBadge = (currentStreak: number) => {
    if (currentStreak >= 100) return { badge: '🏆', title: 'Centurion', color: 'text-purple-600' };
    if (currentStreak >= 50) return { badge: '💎', title: 'Diamond', color: 'text-blue-600' };
    if (currentStreak >= 30) return { badge: '🥇', title: 'Gold', color: 'text-yellow-600' };
    if (currentStreak >= 14) return { badge: '🥈', title: 'Silver', color: 'text-gray-600' };
    if (currentStreak >= 7) return { badge: '🥉', title: 'Bronze', color: 'text-orange-600' };
    if (currentStreak >= 3) return { badge: '🌟', title: 'Rising', color: 'text-green-600' };
    return { badge: '🔥', title: 'Started', color: 'text-red-600' };
  };

  const getMotivationalMessage = (streak: UserStreak) => {
    const { currentStreak, type, isActive } = streak;
    
    if (!isActive) {
      return {
        message: "Jangan menyerah! Mulai lagi hari ini dan bangun kebiasaan positif.",
        action: "Mulai Lagi",
        color: "text-gray-600"
      };
    }

    const messages = {
      meditation: {
        1: "Langkah pertama yang hebat! Lanjutkan besok.",
        3: "Konsistensi mulai terbentuk! Keep going!",
        7: "Satu minggu penuh! Anda sudah membangun kebiasaan.",
        14: "Dua minggu luar biasa! Meditasi sudah jadi bagian hidup Anda.",
        30: "Sebulan penuh! Anda adalah inspirasi bagi banyak orang.",
        50: "Pencapaian luar biasa! Anda telah mentransformasi hidup.",
        100: "Centurion! Anda adalah master meditasi sejati."
      },
      mood_tracking: {
        1: "Mulai memahami diri sendiri! Terus pantau mood Anda.",
        3: "Pola mulai terlihat! Data ini sangat berharga.",
        7: "Self-awareness Anda meningkat pesat!",
        14: "Anda sudah jadi ahli dalam memahami emosi diri.",
        30: "Master mood tracking! Emotional intelligence tinggi.",
        50: "Insight mendalam tentang diri sudah Anda miliki.",
        100: "Guru kesadaran emosional!"
      }
    };

    const typeMessages = messages[type as keyof typeof messages] || messages.meditation;
    
    let message = typeMessages[100];
    if (currentStreak < 100) message = typeMessages[50];
    if (currentStreak < 50) message = typeMessages[30];
    if (currentStreak < 30) message = typeMessages[14];
    if (currentStreak < 14) message = typeMessages[7];
    if (currentStreak < 7) message = typeMessages[3];
    if (currentStreak < 3) message = typeMessages[1];

    return {
      message,
      action: "Lanjutkan",
      color: "text-green-600"
    };
  };

  const getNextMilestone = (currentStreak: number) => {
    const milestones = [3, 7, 14, 21, 30, 50, 75, 100, 150, 200, 365];
    return milestones.find(m => m > currentStreak) || currentStreak + 50;
  };

  const formatLastActivity = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Baru saja';
    if (diffInHours < 24) return `${diffInHours} jam yang lalu`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Kemarin';
    if (diffInDays < 7) return `${diffInDays} hari yang lalu`;
    
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const calculateProgress = (current: number, next: number) => {
    const previous = current === 0 ? 0 : 
      current < 3 ? 0 :
      current < 7 ? 3 :
      current < 14 ? 7 :
      current < 21 ? 14 :
      current < 30 ? 21 :
      current < 50 ? 30 :
      current < 75 ? 50 :
      current < 100 ? 75 :
      current < 150 ? 100 :
      current < 200 ? 150 : 200;
    
    return Math.min(100, ((current - previous) / (next - previous)) * 100);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Streak Aktivitas</h3>
          <p className="text-gray-600">
            Konsistensi adalah kunci kesuksesan
          </p>
        </div>
        <div className="text-3xl">🔥</div>
      </div>

      {streaks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚀</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Mulai Streak Pertama Anda
          </h4>
          <p className="text-gray-600 mb-4">
            Bangun kebiasaan positif dan lihat perkembangan konsistensi Anda
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {streaks.map((streak) => {
            const badge = getStreakBadge(streak.currentStreak);
            const motivation = getMotivationalMessage(streak);
            const nextMilestone = getNextMilestone(streak.currentStreak);
            const progress = calculateProgress(streak.currentStreak, nextMilestone);

            return (
              <div
                key={streak.id}
                className={`border-2 rounded-xl p-4 transition-all hover:shadow-md ${getStreakColor(streak)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getStreakIcon(streak.type)}</div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {getStreakTitle(streak.type)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Terakhir: {formatLastActivity(streak.lastActivityDate)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{badge.badge}</span>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {streak.currentStreak}
                        </div>
                        <div className={`text-xs font-medium ${badge.color}`}>
                          {badge.title}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress to Next Milestone */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">
                      Menuju {nextMilestone} hari
                    </span>
                    <span className="font-medium">
                      {nextMilestone - streak.currentStreak} hari lagi
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Motivation Message */}
                <div className="bg-white bg-opacity-50 rounded-lg p-3 mb-3">
                  <p className={`text-sm ${motivation.color} mb-2`}>
                    {motivation.message}
                  </p>
                  {streak.longestStreak > streak.currentStreak && (
                    <p className="text-xs text-gray-500">
                      Record terbaik: {streak.longestStreak} hari
                    </p>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      {streak.currentStreak}
                    </div>
                    <div className="text-xs text-gray-600">Saat Ini</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      {streak.longestStreak}
                    </div>
                    <div className="text-xs text-gray-600">Terpanjang</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      {Math.floor((new Date().getTime() - streak.startDate.getTime()) / (1000 * 60 * 60 * 24))}
                    </div>
                    <div className="text-xs text-gray-600">Hari Total</div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-4">
                  <button
                    onClick={() => setSelectedStreak(streak)}
                    className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                      streak.isActive
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {streak.isActive ? '🔥 Pertahankan Streak!' : '🚀 Mulai Lagi'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Streak Detail Modal */}
      {selectedStreak && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">
                {getStreakIcon(selectedStreak.type)}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {getStreakTitle(selectedStreak.type)}
              </h3>
              <div className="text-3xl font-bold text-blue-600">
                {selectedStreak.currentStreak} Hari
              </div>
            </div>

            {/* Streak History Chart */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Riwayat 30 Hari Terakhir</h4>
              <div className="flex items-end justify-between space-x-1 h-20 bg-gray-50 rounded-lg p-2">
                {selectedStreak.streakSnapshots.slice(-30).map((snapshot, index) => (
                  <div
                    key={index}
                    className="bg-blue-400 rounded-sm flex-1"
                    style={{
                      height: `${Math.max(10, (snapshot.streakCount / Math.max(...selectedStreak.streakSnapshots.map(s => s.streakCount))) * 100)}%`,
                      minHeight: '4px'
                    }}
                    title={`${snapshot.date.toLocaleDateString('id-ID')}: ${snapshot.streakCount} hari`}
                  />
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Pencapaian</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl mb-1">🥇</div>
                  <div className="text-sm font-medium text-gray-900">
                    {selectedStreak.longestStreak}
                  </div>
                  <div className="text-xs text-gray-600">Streak Terpanjang</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl mb-1">📅</div>
                  <div className="text-sm font-medium text-gray-900">
                    {Math.floor((new Date().getTime() - selectedStreak.startDate.getTime()) / (1000 * 60 * 60 * 24))}
                  </div>
                  <div className="text-xs text-gray-600">Hari Bergabung</div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedStreak(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  // In real implementation, this would trigger the activity
                  setSelectedStreak(null);
                }}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Lakukan Aktivitas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};