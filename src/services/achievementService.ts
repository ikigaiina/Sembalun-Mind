import { 
  collection, 
  addDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Achievement, PersonalizedReward, AchievementRequirement } from '../types/personalization';
import { progressService } from './progressService';

export interface AchievementTemplate {
  id: string;
  title: string;
  description: string;
  achievementType: 'streak' | 'milestone' | 'skill' | 'consistency' | 'exploration' | 'mastery';
  iconUrl?: string;
  badgeColor: string;
  requirements: AchievementRequirement[];
  rewards: Omit<PersonalizedReward, 'id' | 'claimed' | 'claimedAt'>[];
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category: string;
  points: number;
  isActive: boolean;
}

export class AchievementService {
  private static instance: AchievementService;

  static getInstance(): AchievementService {
    if (!AchievementService.instance) {
      AchievementService.instance = new AchievementService();
    }
    return AchievementService.instance;
  }

  private readonly achievementTemplates: AchievementTemplate[] = [
    // Streak Achievements
    {
      id: 'first_week_streak',
      title: 'Seminggu Berturut-turut',
      description: 'Bermeditasi setiap hari selama 7 hari berturut-turut',
      achievementType: 'streak',
      badgeColor: '#10B981',
      requirements: [
        { type: 'streak_days', value: 7, description: 'Meditasi 7 hari berturut-turut' }
      ],
      rewards: [
        {
          type: 'badge',
          title: 'Konsistensi Pemula',
          description: 'Badge untuk pencapaian streak 7 hari'
        },
        {
          type: 'content_unlock',
          title: 'Teknik Breathing Lanjutan',
          description: 'Akses ke sesi pernapasan yang lebih mendalam',
          value: 'advanced_breathing'
        }
      ],
      rarity: 'common',
      category: 'consistency',
      points: 100,
      isActive: true
    },
    {
      id: 'month_streak_master',
      title: 'Master Konsistensi Bulanan',
      description: 'Meditasi setiap hari selama 30 hari berturut-turut',
      achievementType: 'streak',
      badgeColor: '#8B5CF6',
      requirements: [
        { type: 'streak_days', value: 30, description: 'Meditasi 30 hari berturut-turut' }
      ],
      rewards: [
        {
          type: 'certificate',
          title: 'Sertifikat Master Konsistensi',
          description: 'Sertifikat resmi untuk pencapaian luar biasa'
        },
        {
          type: 'feature_access',
          title: 'Custom Session Builder Pro',
          description: 'Akses fitur lanjutan untuk membuat sesi custom',
          value: 'session_builder_pro'
        },
        {
          type: 'discount',
          title: 'Diskon Premium 25%',
          description: 'Potongan harga untuk upgrade premium',
          value: '25_percent_off',
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      ],
      rarity: 'epic',
      category: 'consistency',
      points: 1000,
      isActive: true
    },

    // Milestone Achievements
    {
      id: 'hundred_sessions',
      title: 'Centurion Meditasi',
      description: 'Menyelesaikan 100 sesi meditasi',
      achievementType: 'milestone',
      badgeColor: '#F59E0B',
      requirements: [
        { type: 'sessions_count', value: 100, description: '100 sesi meditasi selesai' }
      ],
      rewards: [
        {
          type: 'badge',
          title: 'Centurion Badge',
          description: 'Badge eksklusif untuk 100 sesi'
        },
        {
          type: 'content_unlock',
          title: 'Master Class Collection',
          description: 'Akses ke koleksi kelas master',
          value: 'master_classes'
        }
      ],
      rarity: 'rare',
      category: 'milestone',
      points: 500,
      isActive: true
    },
    {
      id: 'ten_hours_meditation',
      title: 'Dedikasi 10 Jam',
      description: 'Menghabiskan total 10 jam untuk meditasi',
      achievementType: 'milestone',
      badgeColor: '#EF4444',
      requirements: [
        { type: 'sessions_count', value: 600, description: '600 menit (10 jam) total meditasi' }
      ],
      rewards: [
        {
          type: 'badge',
          title: 'Dedikasi Tinggi',
          description: 'Badge untuk komitmen waktu yang luar biasa'
        },
        {
          type: 'content_unlock',
          title: 'Deep Meditation Sessions',
          description: 'Sesi meditasi mendalam dan intensif',
          value: 'deep_sessions'
        }
      ],
      rarity: 'uncommon',
      category: 'milestone',
      points: 300,
      isActive: true
    },

    // Skill Achievements
    {
      id: 'technique_explorer',
      title: 'Penjelajah Teknik',
      description: 'Mencoba 5 teknik meditasi berbeda',
      achievementType: 'skill',
      badgeColor: '#06B6D4',
      requirements: [
        { type: 'sessions_count', value: 5, description: 'Mencoba 5 teknik berbeda' }
      ],
      rewards: [
        {
          type: 'badge',
          title: 'Explorer Badge',
          description: 'Badge untuk keberanian mencoba hal baru'
        },
        {
          type: 'content_unlock',
          title: 'Teknik Rahasia',
          description: 'Akses ke teknik meditasi yang jarang diketahui',
          value: 'secret_techniques'
        }
      ],
      rarity: 'common',
      category: 'exploration',
      points: 150,
      isActive: true
    },

    // Consistency Achievements
    {
      id: 'perfect_week',
      title: 'Minggu Sempurna',
      description: 'Konsistensi 100% dalam seminggu (minimal 5 sesi)',
      achievementType: 'consistency',
      badgeColor: '#10B981',
      requirements: [
        { type: 'sessions_count', value: 5, description: 'Minimal 5 sesi dalam seminggu' },
        { type: 'consistency_score', value: 100, description: 'Konsistensi 100%' }
      ],
      rewards: [
        {
          type: 'badge',
          title: 'Perfeksionis',
          description: 'Badge untuk konsistensi sempurna'
        }
      ],
      rarity: 'uncommon',
      category: 'consistency',
      points: 200,
      isActive: true
    },

    // Mastery Achievements
    {
      id: 'course_graduate',
      title: 'Lulusan Pertama',
      description: 'Menyelesaikan kursus SIY pertama',
      achievementType: 'mastery',
      badgeColor: '#8B5CF6',
      requirements: [
        { type: 'course_completion', value: 1, description: 'Menyelesaikan 1 kursus' }
      ],
      rewards: [
        {
          type: 'certificate',
          title: 'Sertifikat Penyelesaian Kursus',
          description: 'Sertifikat resmi penyelesaian kursus'
        },
        {
          type: 'content_unlock',
          title: 'Advanced Courses',
          description: 'Akses ke kursus tingkat lanjut',
          value: 'advanced_courses'
        }
      ],
      rarity: 'rare',
      category: 'mastery',
      points: 400,
      isActive: true
    },

    // Special Achievements
    {
      id: 'mood_tracker_champion',
      title: 'Champion Mood Tracking',
      description: 'Konsisten mencatat mood selama 30 hari',
      achievementType: 'consistency',
      badgeColor: '#F97316',
      requirements: [
        { type: 'mood_tracking', value: 30, description: 'Mencatat mood 30 hari' }
      ],
      rewards: [
        {
          type: 'badge',
          title: 'Mood Master',
          description: 'Badge untuk konsistensi mood tracking'
        },
        {
          type: 'feature_access',
          title: 'Advanced Mood Analytics',
          description: 'Akses ke analisis mood yang mendalam',
          value: 'mood_analytics_pro'
        }
      ],
      rarity: 'rare',
      category: 'consistency',
      points: 350,
      isActive: true
    },

    // Legendary Achievements
    {
      id: 'mindfulness_sage',
      title: 'Master Kesadaran',
      description: 'Mencapai semua pencapaian dasar dan konsistensi 365 hari',
      achievementType: 'mastery',
      badgeColor: '#DC2626',
      requirements: [
        { type: 'streak_days', value: 365, description: 'Streak 365 hari' },
        { type: 'sessions_count', value: 500, description: '500+ sesi meditasi' },
        { type: 'course_completion', value: 3, description: '3+ kursus selesai' }
      ],
      rewards: [
        {
          type: 'badge',
          title: 'Sage Badge',
          description: 'Badge legendaris untuk pencapaian tertinggi'
        },
        {
          type: 'certificate',
          title: 'Master of Mindfulness Certificate',
          description: 'Sertifikat master tertinggi'
        },
        {
          type: 'feature_access',
          title: 'Mentor Program Access',
          description: 'Akses untuk menjadi mentor bagi pemula',
          value: 'mentor_program'
        }
      ],
      rarity: 'legendary',
      category: 'mastery',
      points: 5000,
      isActive: true
    }
  ];

  async checkAndUnlockAchievements(userId: string): Promise<Achievement[]> {
    try {
      const [
        existingAchievements,
        sessions,
        streaks,
        courseProgress,
        moodEntries
      ] = await Promise.all([
        this.getUserAchievements(userId),
        progressService.getMeditationSessions(userId, 1000),
        progressService.getUserStreaks(userId),
        // courseService.getUserCourseProgress(userId), // Assuming this exists
        [], // Placeholder
        progressService.getMoodEntries(userId, 1000)
      ]);

      const unlockedAchievements: Achievement[] = [];
      const existingIds = new Set(existingAchievements.map(a => a.id));

      for (const template of this.achievementTemplates) {
        if (!template.isActive || existingIds.has(template.id)) continue;

        const meetsRequirements = this.checkRequirements(
          template.requirements,
          { 
            sessions: sessions as unknown as Record<string, unknown>[], 
            streaks: streaks as unknown as Record<string, unknown>[], 
            courseProgress, 
            moodEntries: moodEntries as unknown as Record<string, unknown>[]
          }
        );

        if (meetsRequirements) {
          const achievement = await this.unlockAchievement(userId, template);
          unlockedAchievements.push(achievement);
        }
      }

      return unlockedAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }

  private checkRequirements(
    requirements: AchievementRequirement[],
    data: {
      sessions: Array<Record<string, unknown>>;
      streaks: Array<Record<string, unknown>>;
      courseProgress: Array<Record<string, unknown>>;
      moodEntries: Array<Record<string, unknown>>;
    }
  ): boolean {
    return requirements.every(req => {
      switch (req.type) {
        case 'sessions_count':
          return data.sessions.length >= req.value;
        
        case 'streak_days': {
          const meditationStreak = data.streaks.find(s => (s as { type?: string }).type === 'meditation');
          return meditationStreak ? ((meditationStreak as { currentStreak?: number }).currentStreak || 0) >= req.value : false;
        }
        
        case 'course_completion': {
          return data.courseProgress.filter(c => (c as { isCompleted?: boolean }).isCompleted).length >= req.value;
        }
        
        case 'mood_tracking':
          return data.moodEntries.length >= req.value;
        
        case 'consistency_score': {
          // Calculate weekly consistency
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          const weekSessions = data.sessions.filter(s => (s as { completedAt?: Date }).completedAt && (s as { completedAt: Date }).completedAt >= weekAgo);
          return weekSessions.length >= 5; // At least 5 sessions this week
        }
        
        default:
          return false;
      }
    });
  }

  private async unlockAchievement(userId: string, template: AchievementTemplate): Promise<Achievement> {
    const achievement: Achievement = {
      id: template.id,
      userId,
      achievementType: template.achievementType,
      title: template.title,
      description: template.description,
      iconUrl: template.iconUrl,
      badgeColor: template.badgeColor,
      unlockedAt: new Date(),
      requirements: template.requirements,
      rewards: template.rewards.map(reward => ({
        ...reward,
        id: `reward_${Date.now()}_${Math.random()}`,
        claimed: false
      })),
      rarity: template.rarity,
      category: template.category,
      points: template.points
    };

    // Save to database
    await addDoc(collection(db, 'user_achievements'), {
      ...achievement,
      unlockedAt: Timestamp.fromDate(achievement.unlockedAt),
      rewards: achievement.rewards.map(reward => ({
        ...reward,
        validUntil: reward.validUntil ? Timestamp.fromDate(reward.validUntil) : null
      }))
    });

    return achievement;
  }

  async getUserAchievements(userId: string, category?: string): Promise<Achievement[]> {
    try {
      let q = query(
        collection(db, 'user_achievements'),
        where('userId', '==', userId),
        orderBy('unlockedAt', 'desc')
      );

      if (category) {
        q = query(q, where('category', '==', category));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        unlockedAt: doc.data().unlockedAt.toDate(),
        rewards: doc.data().rewards.map((reward: any) => ({
          ...reward,
          validUntil: reward.validUntil?.toDate()
        }))
      })) as Achievement[];
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  }

  async claimReward(userId: string, achievementId: string, rewardId: string): Promise<void> {
    try {
      const achievements = await this.getUserAchievements(userId);
      const achievement = achievements.find(a => a.id === achievementId);
      
      if (!achievement) {
        throw new Error('Achievement not found');
      }

      const reward = achievement.rewards.find(r => r.id === rewardId);
      if (!reward || reward.claimed) {
        throw new Error('Reward not available or already claimed');
      }

      // Check if reward is still valid
      if (reward.validUntil && reward.validUntil < new Date()) {
        throw new Error('Reward has expired');
      }

      // Update reward as claimed
      reward.claimed = true;
      reward.claimedAt = new Date();

      // Update in database
      const achievementQuery = query(
        collection(db, 'user_achievements'),
        where('userId', '==', userId),
        where('id', '==', achievementId),
        limit(1)
      );

      const snapshot = await getDocs(achievementQuery);
      if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;
        await updateDoc(docRef, {
          rewards: achievement.rewards.map(r => ({
            ...r,
            claimedAt: r.claimedAt ? Timestamp.fromDate(r.claimedAt) : null
          }))
        });
      }

      // Apply reward effects
      await this.applyRewardEffects(userId, reward);
    } catch (error) {
      console.error('Error claiming reward:', error);
      throw error;
    }
  }

  private async applyRewardEffects(userId: string, reward: PersonalizedReward): Promise<void> {
    switch (reward.type) {
      case 'content_unlock':
        // Update user preferences to unlock content
        // Content unlocked for user
        break;
      
      case 'feature_access':
        // Enable feature access
        // Feature enabled for user
        break;
      
      case 'discount':
        // Create discount code or flag
        // Discount applied for user
        break;
      
      case 'certificate':
        // Generate certificate
        // Certificate generated for user
        break;
      
      case 'badge':
        // Badge is automatically displayed with achievement
        // Badge awarded to user
        break;
    }
  }

  async getAchievementStats(userId: string): Promise<{
    totalAchievements: number;
    totalPoints: number;
    unclaimedRewards: number;
    rareAchievements: number;
    recentAchievements: Achievement[];
    categoryBreakdown: { [category: string]: number };
    rarityBreakdown: { [rarity: string]: number };
    completionRate: number;
  }> {
    try {
      const achievements = await this.getUserAchievements(userId);
      
      const totalAchievements = achievements.length;
      const totalPoints = achievements.reduce((sum, a) => sum + a.points, 0);
      const unclaimedRewards = achievements.reduce(
        (sum, a) => sum + a.rewards.filter(r => !r.claimed).length, 0
      );
      const rareAchievements = achievements.filter(
        a => ['rare', 'epic', 'legendary'].includes(a.rarity)
      ).length;

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentAchievements = achievements
        .filter(a => a.unlockedAt >= weekAgo)
        .slice(0, 5);

      const categoryBreakdown: { [category: string]: number } = {};
      const rarityBreakdown: { [rarity: string]: number } = {};

      achievements.forEach(achievement => {
        categoryBreakdown[achievement.category] = 
          (categoryBreakdown[achievement.category] || 0) + 1;
        rarityBreakdown[achievement.rarity] = 
          (rarityBreakdown[achievement.rarity] || 0) + 1;
      });

      const completionRate = Math.round(
        (totalAchievements / this.achievementTemplates.filter(t => t.isActive).length) * 100
      );

      return {
        totalAchievements,
        totalPoints,
        unclaimedRewards,
        rareAchievements,
        recentAchievements,
        categoryBreakdown,
        rarityBreakdown,
        completionRate
      };
    } catch (error) {
      console.error('Error getting achievement stats:', error);
      return {
        totalAchievements: 0,
        totalPoints: 0,
        unclaimedRewards: 0,
        rareAchievements: 0,
        recentAchievements: [],
        categoryBreakdown: {},
        rarityBreakdown: {},
        completionRate: 0
      };
    }
  }

  getAvailableAchievements(): AchievementTemplate[] {
    return this.achievementTemplates.filter(template => template.isActive);
  }

  async getProgressToAchievements(userId: string): Promise<{
    achievementId: string;
    title: string;
    progress: number;
    requirements: { description: string; current: number; target: number; completed: boolean }[];
  }[]> {
    try {
      const [
        existingAchievements,
        sessions,
        streaks,
        courseProgress,
        moodEntries
      ] = await Promise.all([
        this.getUserAchievements(userId),
        progressService.getMeditationSessions(userId, 1000),
        progressService.getUserStreaks(userId),
        [], // Placeholder for course progress
        progressService.getMoodEntries(userId, 1000)
      ]);

      const existingIds = new Set(existingAchievements.map(a => a.id));
      const progressList = [];

      for (const template of this.achievementTemplates) {
        if (!template.isActive || existingIds.has(template.id)) continue;

        const requirementProgress = template.requirements.map(req => {
          let current = 0;
          
          switch (req.type) {
            case 'sessions_count':
              current = sessions.length;
              break;
            case 'streak_days': {
              const meditationStreak = streaks.find(s => s.type === 'meditation');
              current = meditationStreak ? meditationStreak.currentStreak : 0;
              break;
            }
            case 'course_completion':
              current = courseProgress.filter(c => (c as any).isCompleted).length;
              break;
            case 'mood_tracking':
              current = moodEntries.length;
              break;
            case 'consistency_score': {
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              current = sessions.filter(s => s.completedAt >= weekAgo).length;
              break;
            }
          }

          return {
            description: req.description,
            current: Math.min(current, req.value),
            target: req.value,
            completed: current >= req.value
          };
        });

        const overallProgress = Math.round(
          (requirementProgress.reduce((sum, req) => 
            sum + (req.current / req.target), 0) / requirementProgress.length) * 100
        );

        progressList.push({
          achievementId: template.id,
          title: template.title,
          progress: overallProgress,
          requirements: requirementProgress
        });
      }

      return progressList.sort((a, b) => b.progress - a.progress);
    } catch (error) {
      console.error('Error getting achievement progress:', error);
      return [];
    }
  }
}

export const achievementService = AchievementService.getInstance();