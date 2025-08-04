import { 
  collection, 
  doc, 
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
import { smartNotificationService } from './smartNotificationService';
import { progressService } from './progressService';
import { achievementService } from './achievementService';

export interface CelebrationEvent {
  id: string;
  userId: string;
  type: 'achievement' | 'milestone' | 'streak' | 'goal_completed' | 'personal_record' | 'consistency' | 'progress_marker';
  category: 'meditation' | 'wellbeing' | 'growth' | 'social' | 'learning';
  title: string;
  description: string;
  celebrationLevel: 'small' | 'medium' | 'major' | 'epic';
  rewards: {
    points: number;
    badges: string[];
    unlocks: string[];
    specialMessage: string;
  };
  triggerData: {
    sourceId?: string; // ID of achievement, goal, etc.
    value: number;
    threshold: number;
    context: any;
  };
  personalizedContent: {
    culturalReferences: string[];
    motivationalQuotes: string[];
    encouragementLevel: 'gentle' | 'enthusiastic' | 'inspiring' | 'proud';
  };
  celebrationActions: {
    notification: boolean;
    inAppDisplay: boolean;
    socialShare: boolean;
    emailSummary: boolean;
  };
  userEngagement: {
    viewed: boolean;
    acknowledged: boolean;
    shared: boolean;
    rating?: number; // 1-5 how meaningful the celebration felt
  };
  createdAt: Date;
  celebratedAt?: Date;
}

export interface MilestoneTracker {
  userId: string;
  milestoneType: 'session_count' | 'total_duration' | 'streak_length' | 'quality_average' | 'mood_improvement' | 'technique_mastery';
  currentValue: number;
  nextMilestone: number;
  progress: number; // 0-100%
  milestoneHistory: {
    value: number;
    achievedAt: Date;
    celebratedAs: string;
  }[];
  lastChecked: Date;
}

export interface StreakCelebration {
  userId: string;
  streakType: 'daily' | 'weekly' | 'monthly';
  currentStreak: number;
  personalBest: number;
  celebrationTriggers: number[]; // Days that trigger celebrations
  encouragementMessages: {
    current: string;
    nextMilestone: string;
    motivational: string;
  };
  streakHistory: {
    length: number;
    startDate: Date;
    endDate?: Date;
    wasCelebrated: boolean;
  }[];
}

export interface PersonalRecord {
  userId: string;
  recordType: 'longest_session' | 'highest_quality' | 'most_sessions_day' | 'biggest_mood_boost' | 'lowest_stress';
  currentRecord: {
    value: number;
    achievedAt: Date;
    sessionId?: string;
    context: any;
  };
  previousRecord?: {
    value: number;
    achievedAt: Date;
  };
  improvementPercentage: number;
}

export interface CelebrationPreferences {
  userId: string;
  celebrationStyle: 'minimal' | 'balanced' | 'enthusiastic' | 'maximum';
  culturalContext: 'indonesian' | 'universal' | 'mixed';
  preferredTone: 'gentle' | 'encouraging' | 'energetic' | 'calm';
  notificationSettings: {
    immediate: boolean;
    daily_summary: boolean;
    weekly_highlight: boolean;
    major_only: boolean;
  };
  sharingPreferences: {
    allowSocialSharing: boolean;
    anonymizeData: boolean;
    shareWithCommunity: boolean;
  };
  customCelebrations: {
    personalMilestones: number[];
    customMessages: string[];
    specialDates: Date[];
  };
  updatedAt: Date;
}

export class CelebrationService {
  private static instance: CelebrationService;

  static getInstance(): CelebrationService {
    if (!CelebrationService.instance) {
      CelebrationService.instance = new CelebrationService();
    }
    return CelebrationService.instance;
  }

  async checkAndCreateCelebrations(userId: string): Promise<CelebrationEvent[]> {
    try {
      const celebrations: CelebrationEvent[] = [];
      
      // Check for various types of achievements
      const [
        achievementCelebrations,
        milestoneCelebrations,
        streakCelebrations,
        recordCelebrations
      ] = await Promise.all([
        this.checkAchievementCelebrations(userId),
        this.checkMilestoneCelebrations(userId),
        this.checkStreakCelebrations(userId),
        this.checkPersonalRecords(userId)
      ]);

      celebrations.push(...achievementCelebrations);
      celebrations.push(...milestoneCelebrations);
      celebrations.push(...streakCelebrations);
      celebrations.push(...recordCelebrations);

      // Save celebrations and trigger notifications
      for (const celebration of celebrations) {
        await this.saveCelebration(celebration);
        await this.triggerCelebrationNotification(celebration);
      }

      return celebrations;
    } catch (error) {
      console.error('Error checking celebrations:', error);
      return [];
    }
  }

  async createAchievementCelebration(
    userId: string,
    achievementData: {
      id: string;
      title: string;
      description: string;
      type: string;
      rarity: 'common' | 'rare' | 'epic' | 'legendary';
      points: number;
    }
  ): Promise<CelebrationEvent> {
    try {
      const preferences = await this.getUserCelebrationPreferences(userId);
      const celebrationLevel = this.determineCelebrationLevel(achievementData.rarity, achievementData.points);
      
      const celebration: CelebrationEvent = {
        id: crypto.randomUUID(),
        userId,
        type: 'achievement',
        category: 'meditation',
        title: this.generateAchievementTitle(achievementData, preferences),
        description: this.generateAchievementDescription(achievementData, preferences),
        celebrationLevel,
        rewards: {
          points: achievementData.points,
          badges: [achievementData.title],
          unlocks: this.generateUnlocks(achievementData),
          specialMessage: this.generateSpecialMessage(achievementData, preferences)
        },
        triggerData: {
          sourceId: achievementData.id,
          value: achievementData.points,
          threshold: 0,
          context: achievementData
        },
        personalizedContent: {
          culturalReferences: this.getCulturalReferences(preferences.culturalContext),
          motivationalQuotes: this.getMotivationalQuotes(preferences.preferredTone),
          encouragementLevel: this.mapToneToEncouragement(preferences.preferredTone)
        },
        celebrationActions: {
          notification: true,
          inAppDisplay: true,
          socialShare: preferences.sharingPreferences.allowSocialSharing,
          emailSummary: false
        },
        userEngagement: {
          viewed: false,
          acknowledged: false,
          shared: false
        },
        createdAt: new Date()
      };

      return celebration;
    } catch (error) {
      console.error('Error creating achievement celebration:', error);
      throw error;
    }
  }

  async createMilestoneCelebration(
    userId: string,
    milestoneData: {
      type: MilestoneTracker['milestoneType'];
      value: number;
      milestone: number;
      isPersonalBest: boolean;
    }
  ): Promise<CelebrationEvent> {
    try {
      const preferences = await this.getUserCelebrationPreferences(userId);
      const celebrationLevel = this.determineMilestoneCelebrationLevel(milestoneData.milestone, milestoneData.isPersonalBest);
      
      const celebration: CelebrationEvent = {
        id: crypto.randomUUID(),
        userId,
        type: 'milestone',
        category: 'growth',
        title: this.generateMilestoneTitle(milestoneData, preferences),
        description: this.generateMilestoneDescription(milestoneData, preferences),
        celebrationLevel,
        rewards: {
          points: this.calculateMilestonePoints(milestoneData.milestone),
          badges: milestoneData.isPersonalBest ? ['Personal Best'] : [],
          unlocks: [],
          specialMessage: this.generateMilestoneMessage(milestoneData, preferences)
        },
        triggerData: {
          value: milestoneData.value,
          threshold: milestoneData.milestone,
          context: milestoneData
        },
        personalizedContent: {
          culturalReferences: this.getCulturalReferences(preferences.culturalContext),
          motivationalQuotes: this.getMotivationalQuotes(preferences.preferredTone),
          encouragementLevel: milestoneData.isPersonalBest ? 'inspiring' : 'enthusiastic'
        },
        celebrationActions: {
          notification: true,
          inAppDisplay: true,
          socialShare: milestoneData.isPersonalBest && preferences.sharingPreferences.allowSocialSharing,
          emailSummary: false
        },
        userEngagement: {
          viewed: false,
          acknowledged: false,
          shared: false
        },
        createdAt: new Date()
      };

      return celebration;
    } catch (error) {
      console.error('Error creating milestone celebration:', error);
      throw error;
    }
  }

  async createStreakCelebration(
    userId: string,
    streakData: {
      type: StreakCelebration['streakType'];
      currentStreak: number;
      isPersonalBest: boolean;
      previousBest?: number;
    }
  ): Promise<CelebrationEvent> {
    try {
      const preferences = await this.getUserCelebrationPreferences(userId);
      const celebrationLevel = this.determineStreakCelebrationLevel(streakData.currentStreak, streakData.isPersonalBest);
      
      const celebration: CelebrationEvent = {
        id: crypto.randomUUID(),
        userId,
        type: 'streak',
        category: 'wellbeing',
        title: this.generateStreakTitle(streakData, preferences),
        description: this.generateStreakDescription(streakData, preferences),
        celebrationLevel,
        rewards: {
          points: this.calculateStreakPoints(streakData.currentStreak, streakData.type),
          badges: this.generateStreakBadges(streakData),
          unlocks: [],
          specialMessage: this.generateStreakMessage(streakData, preferences)
        },
        triggerData: {
          value: streakData.currentStreak,
          threshold: 0,
          context: streakData
        },
        personalizedContent: {
          culturalReferences: this.getCulturalReferences(preferences.culturalContext),
          motivationalQuotes: this.getConsistencyQuotes(preferences.preferredTone),
          encouragementLevel: streakData.isPersonalBest ? 'inspiring' : 'enthusiastic'
        },
        celebrationActions: {
          notification: true,
          inAppDisplay: true,
          socialShare: streakData.isPersonalBest && preferences.sharingPreferences.allowSocialSharing,
          emailSummary: false
        },
        userEngagement: {
          viewed: false,
          acknowledged: false,
          shared: false
        },
        createdAt: new Date()
      };

      return celebration;
    } catch (error) {
      console.error('Error creating streak celebration:', error);
      throw error;
    }
  }

  async updateCelebrationEngagement(
    celebrationId: string,
    engagement: Partial<CelebrationEvent['userEngagement']>
  ): Promise<void> {
    try {
      const docRef = doc(db, 'celebrations', celebrationId);
      await updateDoc(docRef, {
        userEngagement: engagement,
        celebratedAt: engagement.acknowledged ? Timestamp.fromDate(new Date()) : null
      });
    } catch (error) {
      console.error('Error updating celebration engagement:', error);
      throw error;
    }
  }

  async getUserCelebrations(
    userId: string,
    limitCount: number = 20,
    unacknowledgedOnly: boolean = false
  ): Promise<CelebrationEvent[]> {
    try {
      const constraints = [
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      ];

      if (unacknowledgedOnly) {
        constraints.splice(1, 0, where('userEngagement.acknowledged', '==', false));
      }

      const q = query(collection(db, 'celebrations'), ...constraints);
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        celebratedAt: doc.data().celebratedAt?.toDate()
      })) as CelebrationEvent[];
    } catch (error) {
      console.error('Error fetching user celebrations:', error);
      return [];
    }
  }

  private async checkAchievementCelebrations(userId: string): Promise<CelebrationEvent[]> {
    try {
      // Get recent achievements that might need celebration
      const achievements = await achievementService.getUserAchievements(userId);
      const recentAchievements = achievements.filter(achievement => 
        achievement.unlockedAt && 
        (Date.now() - achievement.unlockedAt.getTime()) < (24 * 60 * 60 * 1000) // Last 24 hours
      );

      const celebrations: CelebrationEvent[] = [];
      
      for (const achievement of recentAchievements) {
        // Check if we already celebrated this achievement
        const existingCelebration = await this.checkExistingCelebration(userId, 'achievement', achievement.id);
        
        if (!existingCelebration) {
          const celebration = await this.createAchievementCelebration(userId, {
            id: achievement.id,
            title: achievement.title,
            description: achievement.description,
            type: achievement.category,
            rarity: achievement.rarity as any,
            points: (achievement.rewards as any)?.points || 100
          });
          celebrations.push(celebration);
        }
      }

      return celebrations;
    } catch (error) {
      console.error('Error checking achievement celebrations:', error);
      return [];
    }
  }

  private async checkMilestoneCelebrations(userId: string): Promise<CelebrationEvent[]> {
    try {
      const sessions = await progressService.getMeditationSessions(userId, 100);
      const celebrations: CelebrationEvent[] = [];

      // Check session count milestones
      const sessionMilestones = [10, 25, 50, 100, 200, 365, 500, 1000];
      const currentSessionCount = sessions.length;
      
      for (const milestone of sessionMilestones) {
        if (currentSessionCount >= milestone) {
          const existingCelebration = await this.checkExistingCelebration(userId, 'milestone', `sessions_${milestone}`);
          
          if (!existingCelebration) {
            const celebration = await this.createMilestoneCelebration(userId, {
              type: 'session_count',
              value: currentSessionCount,
              milestone,
              isPersonalBest: true
            });
            celebrations.push(celebration);
          }
        }
      }

      // Check total duration milestones (in hours)
      const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
      const totalHours = Math.floor(totalDuration / 60);
      const durationMilestones = [1, 5, 10, 25, 50, 100, 200];
      
      for (const milestone of durationMilestones) {
        if (totalHours >= milestone) {
          const existingCelebration = await this.checkExistingCelebration(userId, 'milestone', `duration_${milestone}h`);
          
          if (!existingCelebration) {
            const celebration = await this.createMilestoneCelebration(userId, {
              type: 'total_duration',
              value: totalHours,
              milestone,
              isPersonalBest: true
            });
            celebrations.push(celebration);
          }
        }
      }

      return celebrations;
    } catch (error) {
      console.error('Error checking milestone celebrations:', error);
      return [];
    }
  }

  private async checkStreakCelebrations(userId: string): Promise<CelebrationEvent[]> {
    try {
      const streak = await this.calculateCurrentStreak(userId);
      const celebrations: CelebrationEvent[] = [];

      // Define streak milestones
      const streakMilestones = [3, 7, 14, 21, 30, 50, 100, 365];
      
      for (const milestone of streakMilestones) {
        if (streak >= milestone) {
          const existingCelebration = await this.checkExistingCelebration(userId, 'streak', `streak_${milestone}`);
          
          if (!existingCelebration) {
            const celebration = await this.createStreakCelebration(userId, {
              type: 'daily',
              currentStreak: streak,
              isPersonalBest: true // Would check against historical data
            });
            celebrations.push(celebration);
          }
        }
      }

      return celebrations;
    } catch (error) {
      console.error('Error checking streak celebrations:', error);
      return [];
    }
  }

  private async checkPersonalRecords(userId: string): Promise<CelebrationEvent[]> {
    try {
      const sessions = await progressService.getMeditationSessions(userId, 50);
      const celebrations: CelebrationEvent[] = [];

      if (sessions.length === 0) return celebrations;

      // Check for personal records in recent sessions
      const recentSessions = sessions.slice(0, 10);
      
      for (const session of recentSessions) {
        // Check if this session set any personal records
        const records = await this.checkSessionForRecords(userId, session, sessions);
        
        for (const record of records) {
          const existingCelebration = await this.checkExistingCelebration(userId, 'personal_record', record.type);
          
          if (!existingCelebration) {
            const celebration = await this.createPersonalRecordCelebration(userId, record);
            celebrations.push(celebration);
          }
        }
      }

      return celebrations;
    } catch (error) {
      console.error('Error checking personal records:', error);
      return [];
    }
  }

  private async createPersonalRecordCelebration(userId: string, record: any): Promise<CelebrationEvent> {
    const preferences = await this.getUserCelebrationPreferences(userId);
    
    return {
      id: `${Date.now()}-${record.type}`,
      userId,
      type: 'personal_record',
      category: 'growth',
      title: this.generateRecordTitle(record, preferences),
      description: this.generateRecordDescription(record, preferences),
      celebrationLevel: 'medium',
      rewards: {
        points: 50,
        badges: ['Personal Best'],
        unlocks: [],
        specialMessage: this.generateRecordMessage(record, preferences)
      },
      triggerData: {
        value: record.value,
        threshold: record.previousBest || 0,
        context: record
      },
      personalizedContent: {
        culturalReferences: this.getCulturalReferences(preferences.culturalContext),
        motivationalQuotes: this.getGrowthQuotes(preferences.preferredTone),
        encouragementLevel: 'inspiring'
      },
      celebrationActions: {
        notification: true,
        inAppDisplay: true,
        socialShare: preferences.sharingPreferences.allowSocialSharing,
        emailSummary: false
      },
      userEngagement: {
        viewed: false,
        acknowledged: false,
        shared: false
      },
      createdAt: new Date()
    };
  }

  private async getUserCelebrationPreferences(userId: string): Promise<CelebrationPreferences> {
    try {
      const q = query(
        collection(db, 'celebration_preferences'),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Return default preferences
        return {
          userId,
          celebrationStyle: 'balanced',
          culturalContext: 'indonesian',
          preferredTone: 'encouraging',
          notificationSettings: {
            immediate: true,
            daily_summary: false,
            weekly_highlight: true,
            major_only: false
          },
          sharingPreferences: {
            allowSocialSharing: false,
            anonymizeData: true,
            shareWithCommunity: false
          },
          customCelebrations: {
            personalMilestones: [],
            customMessages: [],
            specialDates: []
          },
          updatedAt: new Date()
        };
      }

      return snapshot.docs[0].data() as CelebrationPreferences;
    } catch (error) {
      console.error('Error fetching celebration preferences:', error);
      throw error;
    }
  }

  private determineCelebrationLevel(rarity: string, points: number): CelebrationEvent['celebrationLevel'] {
    if (rarity === 'legendary' || points >= 500) return 'epic';
    if (rarity === 'epic' || points >= 200) return 'major';
    if (rarity === 'rare' || points >= 50) return 'medium';
    return 'small';
  }

  private determineMilestoneCelebrationLevel(milestone: number, isPersonalBest: boolean): CelebrationEvent['celebrationLevel'] {
    if (isPersonalBest && milestone >= 1000) return 'epic';
    if (milestone >= 500 || (isPersonalBest && milestone >= 100)) return 'major';
    if (milestone >= 100 || (isPersonalBest && milestone >= 25)) return 'medium';
    return 'small';
  }

  private determineStreakCelebrationLevel(streak: number, isPersonalBest: boolean): CelebrationEvent['celebrationLevel'] {
    if (streak >= 365) return 'epic';
    if (streak >= 100 || (isPersonalBest && streak >= 30)) return 'major';
    if (streak >= 30 || (isPersonalBest && streak >= 7)) return 'medium';
    return 'small';
  }

  private generateAchievementTitle(achievement: any, preferences: CelebrationPreferences): string {
    const enthusiasmLevel = preferences.celebrationStyle;
    
    const titles = {
      minimal: [`Achievement: ${achievement.title}`],
      balanced: [`🏆 ${achievement.title} Achieved!`, `Achievement Unlocked: ${achievement.title}`],
      enthusiastic: [`🎉 Amazing! ${achievement.title}!`, `🌟 Incredible Achievement: ${achievement.title}!`],
      maximum: [`🚀 EPIC ACHIEVEMENT! ${achievement.title}!`, `⭐ LUAR BIASA! ${achievement.title} UNLOCKED!`]
    };

    const options = titles[enthusiasmLevel] || titles.balanced;
    return options[Math.floor(Math.random() * options.length)];
  }

  private generateAchievementDescription(achievement: any, preferences: CelebrationPreferences): string {
    const culturalContext = preferences.culturalContext;
    
    if (culturalContext === 'indonesian') {
      return `${achievement.description} Kerja keras Anda membuahkan hasil yang luar biasa! 🌟`;
    }
    
    return `${achievement.description} Your dedication has paid off beautifully!`;
  }

  private generateSpecialMessage(achievement: any, preferences: CelebrationPreferences): string {
    const tone = preferences.preferredTone;
    const cultural = preferences.culturalContext;
    
    const messages = {
      gentle: {
        indonesian: 'Setiap langkah kecil membawa Anda lebih dekat dengan inner peace. Terus jaga momentum ini dengan penuh kasih sayang untuk diri sendiri. 🌸',
        universal: 'Every small step brings you closer to your true self. Continue this beautiful journey with self-compassion. 🌸'
      },
      encouraging: {
        indonesian: 'Achievement ini adalah bukti konsistensi dan dedikasi Anda! Terus semangat menjalani journey mindfulness. Anda sudah on the right track! 💪',
        universal: 'This achievement is proof of your consistency and dedication! Keep up the momentum on your mindfulness journey! 💪'
      },
      energetic: {
        indonesian: 'WOW! Achievement yang luar biasa! Anda benar-benar crushing it dalam meditation journey! Keep this fire burning! 🔥',
        universal: 'WOW! Outstanding achievement! You\'re absolutely crushing your meditation journey! Keep this fire burning! 🔥'
      },
      calm: {
        indonesian: 'Seperti air yang mengalir tenang, progress Anda konsisten dan bermakna. Achievement ini reflection dari inner growth yang beautiful. 🧘‍♀️',
        universal: 'Like calm flowing water, your progress is steady and meaningful. This achievement reflects beautiful inner growth. 🧘‍♀️'
      }
    };

    return (messages as any)[tone]?.[cultural] || messages.encouraging.indonesian;
  }

  private generateMilestoneTitle(milestone: any, preferences: CelebrationPreferences): string {
    const milestoneLabels = {
      session_count: 'Sesi Meditasi',
      total_duration: 'Total Durasi',
      streak_length: 'Streak',
      quality_average: 'Kualitas',
      mood_improvement: 'Peningkatan Mood'
    };

    const label = (milestoneLabels as any)[milestone.type] || 'Milestone';
    return `🎯 ${milestone.milestone} ${label} Milestone!`;
  }

  private generateMilestoneDescription(milestone: any, preferences: CelebrationPreferences): string {
    const descriptions = {
      session_count: `Anda telah menyelesaikan ${milestone.value} sesi meditasi! Consistency is your superpower!`,
      total_duration: `Total ${milestone.value} jam meditasi! Time well spent untuk inner growth!`,
      streak_length: `${milestone.value} hari streak! Konsistensi yang luar biasa!`,
      quality_average: `Average quality ${milestone.value}/5! Fokus dan mindfulness Anda semakin tajam!`,
      mood_improvement: `Peningkatan mood rata-rata ${milestone.value} points! Meditation really works for you!`
    };

    return (descriptions as any)[milestone.type] || `Milestone ${milestone.milestone} achieved!`;
  }

  private generateMilestoneMessage(milestone: any, preferences: CelebrationPreferences): string {
    if (preferences.culturalContext === 'indonesian') {
      return 'Setiap milestone adalah stepping stone menuju wisdom dan inner peace yang lebih dalam. Progress Anda inspiring sekali! 🌟';
    }
    return 'Every milestone is a stepping stone towards deeper wisdom and inner peace. Your progress is truly inspiring! 🌟';
  }

  private generateStreakTitle(streak: any, preferences: CelebrationPreferences): string {
    if (streak.isPersonalBest) {
      return `🔥 NEW PERSONAL BEST! ${streak.currentStreak} Day Streak!`;
    }
    return `🔥 ${streak.currentStreak} Day Meditation Streak!`;
  }

  private generateStreakDescription(streak: any, preferences: CelebrationPreferences): string {
    if (preferences.culturalContext === 'indonesian') {
      return `${streak.currentStreak} hari berturut-turut! Konsistensi adalah foundation dari transformation yang sustainable. Keep the momentum! 💪`;
    }
    return `${streak.currentStreak} consecutive days! Consistency is the foundation of sustainable transformation. Keep the momentum! 💪`;
  }

  private generateStreakMessage(streak: any, preferences: CelebrationPreferences): string {
    const messages = {
      indonesian: 'Konsistensi seperti ini yang membedakan antara hobby dan lifestyle. Anda sedang membangun habit yang akan benefit seumur hidup! 🚀',
      universal: 'This kind of consistency is what separates a hobby from a lifestyle. You\'re building habits that will benefit you for life! 🚀'
    };
    
    return (messages as any)[preferences.culturalContext] || messages.indonesian;
  }

  private calculateMilestonePoints(milestone: number): number {
    if (milestone >= 1000) return 500;
    if (milestone >= 500) return 300;
    if (milestone >= 100) return 150;
    if (milestone >= 50) return 75;
    if (milestone >= 25) return 50;
    if (milestone >= 10) return 25;
    return 10;
  }

  private calculateStreakPoints(streak: number, type: string): number {
    let basePoints = streak * 2;
    
    if (type === 'daily') basePoints *= 1;
    else if (type === 'weekly') basePoints *= 7;
    else if (type === 'monthly') basePoints *= 30;
    
    return Math.min(500, basePoints);
  }

  private generateStreakBadges(streak: any): string[] {
    const badges = [];
    
    if (streak.currentStreak >= 7) badges.push('Week Warrior');
    if (streak.currentStreak >= 30) badges.push('Month Master');
    if (streak.currentStreak >= 100) badges.push('Consistency Champion');
    if (streak.currentStreak >= 365) badges.push('Year-long Yogi');
    
    if (streak.isPersonalBest) badges.push('Personal Best');
    
    return badges;
  }

  private generateUnlocks(achievement: any): string[] {
    // Generate unlocks based on achievement type
    const unlocks = [];
    
    if (achievement.type === 'consistency') {
      unlocks.push('Advanced Scheduling Features');
    }
    
    if (achievement.type === 'quality') {
      unlocks.push('Premium Meditation Techniques');
    }
    
    return unlocks;
  }

  private getCulturalReferences(context: string): string[] {
    if (context === 'indonesian') {
      return [
        'Seperti gunung Sembalun yang menjulang tinggi',
        'Seperti air yang mengalir tenang namun kuat',
        'Bagaikan sunrise di Rinjani yang memberikan harapan baru',
        'Seperti angin pegunungan yang menyejukkan hati'
      ];
    }
    
    return [
      'Like a mountain reaching toward the sky',
      'Like water flowing with quiet strength',
      'Like the sunrise bringing new hope',
      'Like a gentle breeze that soothes the soul'
    ];
  }

  private getMotivationalQuotes(tone: string): string[] {
    const quotes = {
      gentle: [
        'Setiap napas adalah kesempatan baru untuk hadir sepenuhnya',
        'Progress terbaik adalah yang dilakukan dengan penuh kasih sayang',
        'Kecil-kecil lama-lama menjadi bukit, begitu juga dengan mindfulness'
      ],
      encouraging: [
        'Anda membuktikan bahwa consistency beats perfection!',
        'Every session brings you closer to your highest self',
        'Momentum seperti ini yang creates lasting transformation!'
      ],
      energetic: [
        'You\'re on fire! This energy is contagious!',
        'Unstoppable force meets meditation practice!',
        'This is how legends are made - one session at a time!'
      ],
      calm: [
        'In stillness, we find our greatest strength',
        'Every moment of awareness is a gift to yourself',
        'The path of mindfulness unfolds naturally, like a flower blooming'
      ]
    };
    
    return (quotes as any)[tone] || quotes.encouraging;
  }

  private getConsistencyQuotes(tone: string): string[] {
    return [
      'Consistency is the mother of mastery',
      'Small daily improvements lead to stunning results',
      'Success is the sum of small efforts repeated day in and day out'
    ];
  }

  private getGrowthQuotes(tone: string): string[] {
    return [
      'Growth begins at the edge of your comfort zone',
      'Every master was once a beginner',
      'Progress, not perfection, is the goal'
    ];
  }

  private mapToneToEncouragement(tone: string): CelebrationEvent['personalizedContent']['encouragementLevel'] {
    const mapping = {
      gentle: 'gentle' as const,
      encouraging: 'enthusiastic' as const,
      energetic: 'inspiring' as const,
      calm: 'gentle' as const
    };
    
    return (mapping as any)[tone] || 'enthusiastic';
  }

  private async saveCelebration(celebration: Omit<CelebrationEvent, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'celebrations'), {
        ...celebration,
        createdAt: Timestamp.fromDate(celebration.createdAt)
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error saving celebration:', error);
      throw error;
    }
  }

  private async triggerCelebrationNotification(celebration: CelebrationEvent): Promise<void> {
    try {
      if (celebration.celebrationActions.notification) {
        await smartNotificationService.createAchievementNotification(
          celebration.userId,
          {
            type: celebration.type as any,
            title: celebration.title,
            description: celebration.description,
            reward: celebration.rewards
          }
        );
      }
    } catch (error) {
      console.error('Error triggering celebration notification:', error);
    }
  }

  private async checkExistingCelebration(userId: string, type: string, sourceId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, 'celebrations'),
        where('userId', '==', userId),
        where('type', '==', type),
        where('triggerData.sourceId', '==', sourceId)
      );

      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking existing celebration:', error);
      return false;
    }
  }

  private async calculateCurrentStreak(userId: string): Promise<number> {
    try {
      const sessions = await progressService.getMeditationSessions(userId, 50);
      
      if (sessions.length === 0) return 0;

      const sortedSessions = sessions
        .sort((a, b) => new Date((b as any).createdAt).getTime() - new Date((a as any).createdAt).getTime())
        .map(s => new Date((s as any).createdAt));

      let streak = 0;
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      for (const sessionDate of sortedSessions) {
        const sessionDay = new Date(sessionDate);
        sessionDay.setHours(0, 0, 0, 0);

        const daysDiff = Math.floor((currentDate.getTime() - sessionDay.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff === streak) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else if (daysDiff > streak) {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Error calculating current streak:', error);
      return 0;
    }
  }

  private async checkSessionForRecords(userId: string, session: any, allSessions: any[]): Promise<any[]> {
    const records = [];
    
    // Check longest session record
    const longestSession = Math.max(...allSessions.map(s => s.duration));
    if (session.duration === longestSession && session.duration > 0) {
      records.push({
        type: 'longest_session',
        value: session.duration,
        sessionId: session.id,
        previousBest: allSessions.filter(s => s.id !== session.id).reduce((max, s) => Math.max(max, s.duration), 0)
      });
    }
    
    // Check highest quality record
    const highestQuality = Math.max(...allSessions.map(s => s.quality));
    if (session.quality === highestQuality && session.quality > 0) {
      records.push({
        type: 'highest_quality',
        value: session.quality,
        sessionId: session.id,
        previousBest: allSessions.filter(s => s.id !== session.id).reduce((max, s) => Math.max(max, s.quality), 0)
      });
    }
    
    // Check biggest mood boost
    if (session.moodBefore && session.moodAfter) {
      const moodBoost = session.moodAfter - session.moodBefore;
      const biggestBoost = Math.max(...allSessions
        .filter(s => s.moodBefore && s.moodAfter)
        .map(s => s.moodAfter - s.moodBefore));
      
      if (moodBoost === biggestBoost && moodBoost > 0) {
        records.push({
          type: 'biggest_mood_boost',
          value: moodBoost,
          sessionId: session.id,
          previousBest: allSessions
            .filter(s => s.id !== session.id && s.moodBefore && s.moodAfter)
            .reduce((max, s) => Math.max(max, s.moodAfter - s.moodBefore), 0)
        });
      }
    }
    
    return records;
  }

  private generateRecordTitle(record: any, preferences: CelebrationPreferences): string {
    const titles = {
      longest_session: `🏆 Personal Best: ${record.value} Menit Session!`,
      highest_quality: `⭐ Perfect Quality Score: ${record.value}/5!`,
      biggest_mood_boost: `😊 Amazing Mood Boost: +${record.value} Points!`,
      most_sessions_day: `🚀 Daily Record: ${record.value} Sessions!`,
      lowest_stress: `🕊️ Stress Relief Master: ${record.value}/5!`
    };
    
    return (titles as any)[record.type] || `🏆 New Personal Record!`;
  }

  private generateRecordDescription(record: any, preferences: CelebrationPreferences): string {
    const descriptions = {
      longest_session: `Sesi terpanjang Anda! ${record.value} menit full presence dan mindfulness. Commitment yang luar biasa!`,
      highest_quality: `Quality score tertinggi! ${record.value}/5 menunjukkan fokus dan awareness yang exceptional!`,
      biggest_mood_boost: `Mood improvement terbesar! +${record.value} points dari satu session. Meditation really works for you!`,
      most_sessions_day: `${record.value} session dalam satu hari! Dedication level yang incredible!`,
      lowest_stress: `Stress level terendah: ${record.value}/5. Anda master dalam stress management!`
    };
    
    return (descriptions as any)[record.type] || `Personal record baru yang amazing!`;
  }

  private generateRecordMessage(record: any, preferences: CelebrationPreferences): string {
    if (preferences.culturalContext === 'indonesian') {
      return 'Personal record seperti ini proof bahwa consistent practice membawa breakthrough. Anda sedang rewrite your own limits! 🚀';
    }
    return 'Personal records like this prove that consistent practice leads to breakthroughs. You\'re rewriting your own limits! 🚀';
  }
}

export const celebrationService = CelebrationService.getInstance();