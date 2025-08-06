import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';

interface WelcomeBannerProps {
  user?: {
    name: string;
    currentStreak: number;
    totalSessions: number;
    level?: string;
    lastSessionDate?: Date;
  };
  todayGoal?: {
    target: number; // minutes
    completed: number;
    type: 'minutes' | 'sessions';
  };
  recommendations?: {
    id: string;
    title: string;
    description: string;
    duration: number;
    category: string;
  }[];
  onStartSession?: (sessionId?: string) => void;
  onViewProgress?: () => void;
  className?: string;
}

/**
 * Dynamic welcome banner with personalized content
 * 
 * Features:
 * - Time-based greetings
 * - Personalized recommendations
 * - Streak celebrations
 * - Goal progress display
 * - Quick action buttons
 * - Motivational messages
 * - Weather-based suggestions
 * - Accessibility support
 */
export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  user,
  todayGoal,
  recommendations = [],
  onStartSession,
  onViewProgress,
  className = ''
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [bannerVariant, setBannerVariant] = useState(0);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Rotate banner variants every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setBannerVariant(prev => (prev + 1) % 3);
    }, 30000);

    return () => clearTimer(timer);
  }, []);

  // Get time-based greeting
  const getGreeting = (): { message: string; icon: string; suggestion: string } => {
    const hour = currentTime.getHours();
    
    if (hour < 6) {
      return {
        message: 'Subuh yang tenang',
        icon: '🌙',
        suggestion: 'Mulai hari dengan meditasi pagi yang menenangkan'
      };
    } else if (hour < 11) {
      return {
        message: 'Selamat pagi',
        icon: '🌅',
        suggestion: 'Energi pagi yang segar untuk memulai hari dengan mindful'
      };
    } else if (hour < 15) {
      return {
        message: 'Selamat siang',
        icon: '☀️',
        suggestion: 'Waktunya jeda sejenak di tengah kesibukan'
      };
    } else if (hour < 18) {
      return {
        message: 'Selamat sore',
        icon: '🌤️',
        suggestion: 'Refleksi sore untuk melepas beban hari'
      };
    } else {
      return {
        message: 'Selamat malam',
        icon: '🌆',
        suggestion: 'Tenangkan pikiran sebelum beristirahat'
      };
    }
  };

  // Get motivational message based on streak
  const getStreakMessage = (): string => {
    if (!user) return 'Mulai perjalanan mindfulness-mu hari ini!';
    
    const streak = user.currentStreak;
    
    if (streak === 0) {
      return 'Hari yang tepat untuk memulai kembali!';
    } else if (streak < 7) {
      return `Hebat! ${streak} hari berturut-turut. Terus jaga konsistensi!`;
    } else if (streak < 30) {
      return `Luar biasa! ${streak} hari streak. Kamu sedang membangun kebiasaan yang baik!`;
    } else {
      return `Menakjubkan! ${streak} hari konsisten. Kamu adalah inspirasi!`;
    }
  };

  // Get goal progress percentage
  const getGoalProgress = (): number => {
    if (!todayGoal || todayGoal.target === 0) return 0;
    return Math.min((todayGoal.completed / todayGoal.target) * 100, 100);
  };

  // Get primary recommendation
  const getPrimaryRecommendation = () => {
    if (recommendations.length === 0) {
      // Default recommendations based on time
      const hour = currentTime.getHours();
      
      if (hour < 11) {
        return {
          id: 'morning-default',
          title: 'Pernapasan Pagi',
          description: 'Mulai hari dengan napas yang tenang',
          duration: 5,
          category: 'breathing'
        };
      } else if (hour < 15) {
        return {
          id: 'midday-default',
          title: 'Jeda Siang',
          description: 'Sejenak berhenti di tengah kesibukan',
          duration: 10,
          category: 'mindfulness'
        };
      } else {
        return {
          id: 'evening-default',
          title: 'Refleksi Sore',
          description: 'Lepaskan beban hari dengan tenang',
          duration: 15,
          category: 'relaxation'
        };
      }
    }
    
    return recommendations[0];
  };

  const greeting = getGreeting();
  const primaryRecommendation = getPrimaryRecommendation();
  const goalProgress = getGoalProgress();

  // Banner variants for dynamic content
  const renderBannerContent = () => {
    switch (bannerVariant) {
      case 0:
        return (
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">{greeting.icon}</span>
                <h2 className="text-xl font-heading text-gray-800">
                  {greeting.message}{user ? `, ${user.name}` : ''}
                </h2>
              </div>
              <p className="text-gray-600 font-body text-sm mb-4">
                {greeting.suggestion}
              </p>
              <div className="text-xs text-gray-500">
                {getStreakMessage()}
              </div>
            </div>
            
            <div className="ml-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🧘‍♀️</span>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div>
            <h2 className="text-lg font-heading text-gray-800 mb-3">
              Rekomendasi untuk Anda
            </h2>
            <div className="flex items-center space-x-4">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `var(--color-primary)20` }}
              >
                <span className="text-lg">
                  {primaryRecommendation.category === 'breathing' ? '💨' :
                   primaryRecommendation.category === 'mindfulness' ? '🧘‍♀️' :
                   primaryRecommendation.category === 'relaxation' ? '🌸' : '✨'}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-800 mb-1">
                  {primaryRecommendation.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {primaryRecommendation.description}
                </p>
                <div className="text-xs text-gray-500">
                  {primaryRecommendation.duration} menit
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return todayGoal && (
          <div>
            <h2 className="text-lg font-heading text-gray-800 mb-3">
              Target Hari Ini
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {todayGoal.type === 'minutes' ? 'Menit Meditasi' : 'Sesi Selesai'}
                </span>
                <span className="text-sm font-medium text-gray-800">
                  {todayGoal.completed} / {todayGoal.target}
                </span>
              </div>
              
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                  style={{ width: `${goalProgress}%` }}
                />
              </div>
              
              <div className="text-xs text-gray-500">
                {goalProgress >= 100 
                  ? '🎉 Target tercapai! Luar biasa!'
                  : `${(100 - goalProgress).toFixed(0)}% lagi untuk mencapai target`}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={`welcome-banner ${className}`} padding="medium">
      <div className="min-h-[120px] flex flex-col justify-center">
        {renderBannerContent()}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <Button
          onClick={() => onStartSession?.(primaryRecommendation.id)}
          className="flex items-center space-x-2"
          aria-label={`Mulai sesi ${primaryRecommendation.title}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15a2 2 0 012 2v.586a1 1 0 01-.293.707L12 21l-4.707-4.707A1 1 0 017 15.586V15a2 2 0 012-2h1.586a1 1 0 00.707-.293L13.707 10.293A1 1 0 0114.414 10H16" />
          </svg>
          <span>Mulai Meditasi</span>
        </Button>

        {user && (
          <button
            onClick={onViewProgress}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            aria-label="Lihat progress lengkap"
          >
            <span>Lihat Progress</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Progress Indicators */}
      <div className="flex justify-center space-x-2 mt-3">
        {[0, 1, 2].map((index) => (
          <button
            key={index}
            onClick={() => setBannerVariant(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              bannerVariant === index ? 'bg-primary' : 'bg-gray-300'
            }`}
            aria-label={`Tampilkan konten ${index + 1}`}
          />
        ))}
      </div>

      {/* Accessibility enhancements */}
      <div className="sr-only">
        <h2>Banner Selamat Datang</h2>
        <p>Waktu sekarang: {currentTime.toLocaleTimeString('id-ID')}</p>
        {user && (
          <>
            <p>Streak saat ini: {user.currentStreak} hari</p>
            <p>Total sesi: {user.totalSessions}</p>
          </>
        )}
        {todayGoal && (
          <p>
            Target hari ini: {todayGoal.completed} dari {todayGoal.target} {todayGoal.type}
            ({goalProgress.toFixed(0)}% tercapai)
          </p>
        )}
      </div>
    </Card>
  );
};