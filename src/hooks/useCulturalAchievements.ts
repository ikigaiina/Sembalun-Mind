import { useState, useCallback, useEffect } from 'react';

// Achievement unlock logic and integration
export interface UnlockEvent {
  achievementId: string;
  title: string;
  description: string;
  reward: string;
  timestamp: Date;
}

export interface CulturalProgress {
  totalSessions: number;
  regionsExplored: string[];
  practicesCompleted: string[];
  currentStreak: number;
  longestStreak: number;
  totalHours: number;
  wisdomQuotesCollected: number;
  communityShares: number;
  lastSessionDate: Date;
  achievementPoints: number;
  unlockedAchievements: string[];
  recentUnlocks: UnlockEvent[];
}

// Mock initial progress - in real app would come from API/storage
const initialProgress: CulturalProgress = {
  totalSessions: 15,
  regionsExplored: ['sembalun', 'java', 'bali'],
  practicesCompleted: ['sunrise-meditation', 'javanese-court', 'bali-temple', 'mountain-reflection'],
  currentStreak: 7,
  longestStreak: 12,
  totalHours: 8.5,
  wisdomQuotesCollected: 5,
  communityShares: 2,
  lastSessionDate: new Date(),
  achievementPoints: 350,
  unlockedAchievements: ['first-steps', 'island-explorer', 'dedicated-soul', 'weekly-warrior'],
  recentUnlocks: []
};

export const useCulturalAchievements = () => {
  const [progress, setProgress] = useState<CulturalProgress>(initialProgress);
  const [showUnlockNotification, setShowUnlockNotification] = useState(false);
  const [pendingUnlock, setPendingUnlock] = useState<UnlockEvent | null>(null);

  // Achievement definitions for checking unlocks
  const achievementRequirements = {
    'first-steps': { type: 'sessions', value: 1 },
    'island-explorer': { type: 'regions', value: 3 },
    'archipelago-master': { type: 'regions', value: 6 },
    'dedicated-soul': { type: 'sessions', value: 10 },
    'wisdom-collector': { type: 'wisdom', value: 15 },
    'weekly-warrior': { type: 'streak', value: 7 },
    'monthly-master': { type: 'streak', value: 30 },
    'cultural-master': { type: 'practices', value: 20 },
    'time-devotee': { type: 'hours', value: 20 },
    'community-sharer': { type: 'community', value: 5 }
  };

  const achievementMetadata = {
    'first-steps': {
      title: 'Langkah Pertama',
      description: 'Selesaikan sesi meditasi budaya pertama Anda',
      reward: 'Kutipan kebijaksanaan Sembalun pertama',
      points: 50
    },
    'island-explorer': {
      title: 'Penjelajah Nusantara',
      description: 'Jelajahi 3 wilayah budaya Indonesia yang berbeda',
      reward: 'Buka wilayah Sumatra Wilderness',
      points: 150
    },
    'archipelago-master': {
      title: 'Penguasa Nusantara',
      description: 'Kuasai semua 6 wilayah budaya Indonesia',
      reward: 'Gelar istimewa untuk penjelajah sejati',
      points: 500
    },
    'dedicated-soul': {
      title: 'Jiwa Berdedikasi',
      description: 'Selesaikan 10 sesi meditasi budaya',
      reward: 'Teknik pernapasan lanjutan',
      points: 100
    },
    'wisdom-collector': {
      title: 'Pengumpul Kebijaksanaan',
      description: 'Kumpulkan 15 kutipan kebijaksanaan Indonesia',
      reward: 'Jurnal kebijaksanaan pribadi',
      points: 300
    },
    'weekly-warrior': {
      title: 'Pejuang Mingguan',
      description: 'Berlatih meditasi selama 7 hari berturut-turut',
      reward: 'Lencana api untuk konsistensi',
      points: 150
    },
    'monthly-master': {
      title: 'Master Bulanan',
      description: 'Berlatih meditasi selama 30 hari berturut-turut',
      reward: 'Gelar untuk dedikasi luar biasa',
      points: 400
    },
    'cultural-master': {
      title: 'Master Budaya',
      description: 'Kuasai 20 praktik meditasi tradisional',
      reward: 'Pengakuan sebagai ahli meditasi budaya',
      points: 600
    },
    'time-devotee': {
      title: 'Penyembah Waktu',
      description: 'Habiskan 20 jam dalam meditasi budaya',
      reward: 'Sesi meditasi diperpanjang',
      points: 250
    },
    'community-sharer': {
      title: 'Berbagi Komunitas',
      description: 'Bagikan pengalaman meditasi dengan komunitas',
      reward: 'Fitur komunitas advanced',
      points: 200
    }
  };

  // Check for achievement unlocks
  const checkForUnlocks = useCallback((newProgress: CulturalProgress) => {
    const newUnlocks: UnlockEvent[] = [];

    Object.entries(achievementRequirements).forEach(([id, req]) => {
      // Skip if already unlocked
      if (newProgress.unlockedAchievements.includes(id)) return;

      let currentValue = 0;
      let shouldUnlock = false;

      switch (req.type) {
        case 'sessions':
          currentValue = newProgress.totalSessions;
          shouldUnlock = currentValue >= req.value;
          break;
        case 'regions':
          currentValue = newProgress.regionsExplored.length;
          shouldUnlock = currentValue >= req.value;
          break;
        case 'practices':
          currentValue = newProgress.practicesCompleted.length;
          shouldUnlock = currentValue >= req.value;
          break;
        case 'streak':
          currentValue = newProgress.currentStreak;
          shouldUnlock = currentValue >= req.value;
          break;
        case 'wisdom':
          currentValue = newProgress.wisdomQuotesCollected;
          shouldUnlock = currentValue >= req.value;
          break;
        case 'hours':
          currentValue = newProgress.totalHours;
          shouldUnlock = currentValue >= req.value;
          break;
        case 'community':
          currentValue = newProgress.communityShares;
          shouldUnlock = currentValue >= req.value;
          break;
      }

      if (shouldUnlock) {
        const metadata = achievementMetadata[id as keyof typeof achievementMetadata];
        if (metadata) {
          newUnlocks.push({
            achievementId: id,
            title: metadata.title,
            description: metadata.description,
            reward: metadata.reward,
            timestamp: new Date()
          });
        }
      }
    });

    return newUnlocks;
  }, []);

  // Update session count (called after completing meditation)
  const updateSessionCount = useCallback((practiceId?: string, region?: string, duration?: number) => {
    setProgress(prev => {
      const newProgress: CulturalProgress = {
        ...prev,
        totalSessions: prev.totalSessions + 1,
        totalHours: prev.totalHours + ((duration || 15) / 60), // Convert minutes to hours
        lastSessionDate: new Date(),
        regionsExplored: region && !prev.regionsExplored.includes(region) 
          ? [...prev.regionsExplored, region]
          : prev.regionsExplored,
        practicesCompleted: practiceId && !prev.practicesCompleted.includes(practiceId)
          ? [...prev.practicesCompleted, practiceId]
          : prev.practicesCompleted
      };

      // Check for new achievements
      const newUnlocks = checkForUnlocks(newProgress);
      if (newUnlocks.length > 0) {
        // Update unlocked achievements
        newProgress.unlockedAchievements = [
          ...prev.unlockedAchievements,
          ...newUnlocks.map(u => u.achievementId)
        ];
        
        // Add points
        newProgress.achievementPoints = prev.achievementPoints + 
          newUnlocks.reduce((sum, unlock) => {
            const metadata = achievementMetadata[unlock.achievementId as keyof typeof achievementMetadata];
            return sum + (metadata?.points || 0);
          }, 0);

        // Add to recent unlocks
        newProgress.recentUnlocks = [...prev.recentUnlocks, ...newUnlocks];

        // Show notification for first unlock
        if (newUnlocks.length > 0) {
          setPendingUnlock(newUnlocks[0]);
          setShowUnlockNotification(true);
        }
      }

      return newProgress;
    });
  }, [checkForUnlocks]);

  // Update streak (called daily)
  const updateStreak = useCallback((continued: boolean) => {
    setProgress(prev => {
      const newProgress: CulturalProgress = {
        ...prev,
        currentStreak: continued ? prev.currentStreak + 1 : 0,
        longestStreak: continued 
          ? Math.max(prev.longestStreak, prev.currentStreak + 1)
          : prev.longestStreak
      };

      // Check for streak achievements
      const newUnlocks = checkForUnlocks(newProgress);
      if (newUnlocks.length > 0) {
        newProgress.unlockedAchievements = [
          ...prev.unlockedAchievements,
          ...newUnlocks.map(u => u.achievementId)
        ];
        newProgress.achievementPoints = prev.achievementPoints + 
          newUnlocks.reduce((sum, unlock) => {
            const metadata = achievementMetadata[unlock.achievementId as keyof typeof achievementMetadata];
            return sum + (metadata?.points || 0);
          }, 0);
        newProgress.recentUnlocks = [...prev.recentUnlocks, ...newUnlocks];

        if (newUnlocks.length > 0) {
          setPendingUnlock(newUnlocks[0]);
          setShowUnlockNotification(true);
        }
      }

      return newProgress;
    });
  }, [checkForUnlocks]);

  // Collect wisdom quote
  const collectWisdom = useCallback((wisdomId: string) => {
    setProgress(prev => {
      const newProgress: CulturalProgress = {
        ...prev,
        wisdomQuotesCollected: prev.wisdomQuotesCollected + 1
      };

      const newUnlocks = checkForUnlocks(newProgress);
      if (newUnlocks.length > 0) {
        newProgress.unlockedAchievements = [
          ...prev.unlockedAchievements,
          ...newUnlocks.map(u => u.achievementId)
        ];
        newProgress.achievementPoints = prev.achievementPoints + 
          newUnlocks.reduce((sum, unlock) => {
            const metadata = achievementMetadata[unlock.achievementId as keyof typeof achievementMetadata];
            return sum + (metadata?.points || 0);
          }, 0);
        newProgress.recentUnlocks = [...prev.recentUnlocks, ...newUnlocks];

        if (newUnlocks.length > 0) {
          setPendingUnlock(newUnlocks[0]);
          setShowUnlockNotification(true);
        }
      }

      return newProgress;
    });
  }, [checkForUnlocks]);

  // Share with community
  const shareWithCommunity = useCallback((content: string) => {
    setProgress(prev => {
      const newProgress: CulturalProgress = {
        ...prev,
        communityShares: prev.communityShares + 1
      };

      const newUnlocks = checkForUnlocks(newProgress);
      if (newUnlocks.length > 0) {
        newProgress.unlockedAchievements = [
          ...prev.unlockedAchievements,
          ...newUnlocks.map(u => u.achievementId)
        ];
        newProgress.achievementPoints = prev.achievementPoints + 
          newUnlocks.reduce((sum, unlock) => {
            const metadata = achievementMetadata[unlock.achievementId as keyof typeof achievementMetadata];
            return sum + (metadata?.points || 0);
          }, 0);
        newProgress.recentUnlocks = [...prev.recentUnlocks, ...newUnlocks];

        if (newUnlocks.length > 0) {
          setPendingUnlock(newUnlocks[0]);
          setShowUnlockNotification(true);
        }
      }

      return newProgress;
    });
  }, [checkForUnlocks]);

  // Dismiss unlock notification
  const dismissUnlockNotification = useCallback(() => {
    setShowUnlockNotification(false);
    setPendingUnlock(null);
  }, []);

  // Get achievement completion percentage
  const getCompletionPercentage = useCallback(() => {
    const totalAchievements = Object.keys(achievementRequirements).length;
    return Math.round((progress.unlockedAchievements.length / totalAchievements) * 100);
  }, [progress.unlockedAchievements.length]);

  return {
    progress,
    updateSessionCount,
    updateStreak,
    collectWisdom,
    shareWithCommunity,
    showUnlockNotification,
    pendingUnlock,
    dismissUnlockNotification,
    getCompletionPercentage
  };
};