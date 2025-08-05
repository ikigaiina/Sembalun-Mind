import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs,
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { progressService } from './progressService';
import { habitAnalyticsService } from './habitAnalyticsService';
import { emotionalIntelligenceService } from './emotionalIntelligenceService';

export interface SmartNotification {
  id: string;
  userId: string;
  type: 'reminder' | 'contextual' | 'achievement' | 'milestone' | 'progress' | 'encouragement';
  category: 'meditation_reminder' | 'stress_alert' | 'mood_check' | 'celebration' | 'weekly_summary' | 'goal_reminder';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledTime: Date;
  deliveredTime?: Date;
  isRead: boolean;
  isDelivered: boolean;
  data?: {
    sessionId?: string;
    achievementId?: string;
    goalId?: string;
    moodScore?: number;
    stressLevel?: number;
    context?: any;
  };
  triggers: NotificationTrigger[];
  personalizedContent: {
    userName: string;
    preferredTechnique?: string;
    motivationalTone: 'gentle' | 'encouraging' | 'energetic' | 'calm';
    culturalContext: 'indonesian' | 'universal';
  };
  deliveryMethod: 'push' | 'email' | 'in_app' | 'silent';
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationTrigger {
  type: 'time_based' | 'behavior_based' | 'mood_based' | 'streak_based' | 'goal_based';
  condition: string;
  value: any;
  isActive: boolean;
}

export interface UserNotificationPreferences {
  userId: string;
  enableSmartReminders: boolean;
  enableContextualNotifications: boolean;
  enableAchievementNotifications: boolean;
  enableProgressSummaries: boolean;
  quietHours: {
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
  preferredTimes: string[]; // Array of preferred time slots
  frequency: 'minimal' | 'moderate' | 'frequent';
  motivationalTone: 'gentle' | 'encouraging' | 'energetic' | 'calm';
  languagePreference: 'indonesian' | 'english';
  deliveryMethods: {
    push: boolean;
    email: boolean;
    inApp: boolean;
  };
  customSettings: {
    stressThreshold: number; // 1-5 scale
    moodThreshold: number;   // 1-5 scale
    streakReminders: boolean;
    goalDeadlineAlerts: boolean;
    weeklyReports: boolean;
  };
  updatedAt: Date;
}

export interface NotificationAnalytics {
  userId: string;
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalActedUpon: number;
  engagementRate: number;
  optimalTimes: string[];
  effectiveCategories: string[];
  responsePatterns: {
    byTimeOfDay: { [hour: string]: number };
    byDayOfWeek: { [day: string]: number };
    byCategory: { [category: string]: number };
  };
}

export interface SmartScheduleRecommendation {
  userId: string;
  recommendedTimes: {
    time: string;
    confidence: number;
    reason: string;
    dayOfWeek?: number; // 0-6, Sunday=0
  }[];
  personalizedMessage: string;
  basedOnData: {
    historicalSessions: number;
    moodPatterns: boolean;
    stressPatterns: boolean;
    habitAnalysis: boolean;
  };
}

export class SmartNotificationService {
  private static instance: SmartNotificationService;

  static getInstance(): SmartNotificationService {
    if (!SmartNotificationService.instance) {
      SmartNotificationService.instance = new SmartNotificationService();
    }
    return SmartNotificationService.instance;
  }

  async createIntelligentReminder(userId: string, behaviorData: any): Promise<string> {
    try {
      const preferences = await this.getUserPreferences(userId);
      const sessions = await progressService.getMeditationSessions(userId, 30);
      const optimalTimes = await this.calculateOptimalTimes(userId, sessions);
      
      const notification = await this.generateBehaviorBasedReminder(
        userId, 
        behaviorData, 
        preferences, 
        optimalTimes
      );

      const docRef = await addDoc(collection(db, 'smart_notifications'), {
        ...notification,
        scheduledTime: Timestamp.fromDate(notification.scheduledTime),
        createdAt: Timestamp.fromDate(notification.createdAt),
        updatedAt: Timestamp.fromDate(notification.updatedAt)
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating intelligent reminder:', error);
      throw error;
    }
  }

  async generateContextualNotification(
    userId: string, 
    context: 'stress_detected' | 'mood_low' | 'energy_low' | 'anxiety_high'
  ): Promise<string> {
    try {
      const preferences = await this.getUserPreferences(userId);
      const recentMoods = await progressService.getMoodEntries(userId, 5);
      
      const notification = await this.createContextualNotification(
        userId, 
        context, 
        preferences, 
        recentMoods
      );

      const docRef = await addDoc(collection(db, 'smart_notifications'), {
        ...notification,
        scheduledTime: Timestamp.fromDate(notification.scheduledTime),
        deliveredTime: Timestamp.fromDate(new Date()), // Immediate delivery
        createdAt: Timestamp.fromDate(notification.createdAt),
        updatedAt: Timestamp.fromDate(notification.updatedAt)
      });

      // Trigger immediate delivery for contextual notifications
      await this.deliverNotification(docRef.id);

      return docRef.id;
    } catch (error) {
      console.error('Error generating contextual notification:', error);
      throw error;
    }
  }

  async scheduleOptimalMeditationTimes(userId: string): Promise<SmartScheduleRecommendation> {
    try {
      const sessions = await progressService.getMeditationSessions(userId, 100);
      const moodEntries = await progressService.getMoodEntries(userId, 50);
      const habits = await habitAnalyticsService.getUserHabitPatterns(userId);
      
      const analysis = this.analyzeUserPatterns(sessions, moodEntries, habits);
      const recommendations = this.generateTimeRecommendations(analysis);
      
      // Schedule notifications for recommended times
      for (const rec of recommendations.recommendedTimes.slice(0, 3)) {
        await this.scheduleRecurringReminder(userId, rec.time, rec.reason);
      }

      return {
        userId,
        recommendedTimes: recommendations.recommendedTimes,
        personalizedMessage: recommendations.personalizedMessage,
        basedOnData: {
          historicalSessions: sessions.length,
          moodPatterns: moodEntries.length > 0,
          stressPatterns: sessions.some(s => (s as any).stressLevel),
          habitAnalysis: habits.length > 0
        }
      };
    } catch (error) {
      console.error('Error scheduling optimal meditation times:', error);
      throw error;
    }
  }

  async createAchievementNotification(
    userId: string, 
    achievementData: { 
      type: 'achievement' | 'milestone' | 'streak' | 'goal_completed';
      title: string;
      description: string;
      reward?: any;
    }
  ): Promise<string> {
    try {
      const preferences = await this.getUserPreferences(userId);
      
      const notification: Omit<SmartNotification, 'id'> = {
        userId,
        type: 'achievement',
        category: 'celebration',
        title: this.generateCelebrationTitle(achievementData, preferences),
        message: this.generateCelebrationMessage(achievementData, preferences),
        priority: 'high',
        scheduledTime: new Date(), // Immediate
        isRead: false,
        isDelivered: false,
        data: {
          achievementId: achievementData.title,
          context: achievementData
        },
        triggers: [{
          type: 'behavior_based',
          condition: 'achievement_unlocked',
          value: achievementData.type,
          isActive: true
        }],
        personalizedContent: {
          userName: await this.getUserName(userId),
          motivationalTone: preferences.motivationalTone,
          culturalContext: 'indonesian'
        },
        deliveryMethod: 'push',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'smart_notifications'), {
        ...notification,
        scheduledTime: Timestamp.fromDate(notification.scheduledTime),
        createdAt: Timestamp.fromDate(notification.createdAt),
        updatedAt: Timestamp.fromDate(notification.updatedAt)
      });

      // Immediate delivery for achievements
      await this.deliverNotification(docRef.id);

      return docRef.id;
    } catch (error) {
      console.error('Error creating achievement notification:', error);
      throw error;
    }
  }

  async generateWeeklyProgressSummary(userId: string): Promise<string> {
    try {
      const preferences = await this.getUserPreferences(userId);
      const weeklyData = await this.getWeeklyProgressData(userId);
      
      const summary = this.createProgressSummary(weeklyData, preferences);
      const encouragement = this.generateWeeklyEncouragement(weeklyData, preferences);

      const notification: Omit<SmartNotification, 'id'> = {
        userId,
        type: 'progress',
        category: 'weekly_summary',
        title: summary.title,
        message: summary.message,
        priority: 'medium',
        scheduledTime: this.getNextSundayEvening(),
        isRead: false,
        isDelivered: false,
        data: {
          context: {
            weeklyData,
            encouragement,
            insights: summary.insights
          }
        },
        triggers: [{
          type: 'time_based',
          condition: 'weekly_schedule',
          value: 'sunday_evening',
          isActive: true
        }],
        personalizedContent: {
          userName: await this.getUserName(userId),
          motivationalTone: preferences.motivationalTone,
          culturalContext: 'indonesian'
        },
        deliveryMethod: preferences.deliveryMethods.push ? 'push' : 'in_app',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'smart_notifications'), {
        ...notification,
        scheduledTime: Timestamp.fromDate(notification.scheduledTime),
        createdAt: Timestamp.fromDate(notification.createdAt),
        updatedAt: Timestamp.fromDate(notification.updatedAt)
      });

      return docRef.id;
    } catch (error) {
      console.error('Error generating weekly progress summary:', error);
      throw error;
    }
  }

  async updateUserPreferences(
    userId: string, 
    preferences: Partial<UserNotificationPreferences>
  ): Promise<void> {
    try {
      const existingPrefs = await this.getUserPreferences(userId);
      const updatedPrefs = {
        ...existingPrefs,
        ...preferences,
        updatedAt: new Date()
      };

      // Update or create preferences document
      const q = query(
        collection(db, 'notification_preferences'),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        await addDoc(collection(db, 'notification_preferences'), {
          ...updatedPrefs,
          updatedAt: Timestamp.fromDate(updatedPrefs.updatedAt)
        });
      } else {
        const docRef = doc(db, 'notification_preferences', snapshot.docs[0].id);
        await updateDoc(docRef, {
          ...updatedPrefs,
          updatedAt: Timestamp.fromDate(updatedPrefs.updatedAt)
        });
      }

      // Reschedule notifications based on new preferences
      await this.rescheduleUserNotifications(userId);
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  async getUserNotifications(
    userId: string, 
    unreadOnly: boolean = false,
    limitCount: number = 20
  ): Promise<SmartNotification[]> {
    try {
      const constraints = [
        where('userId', '==', userId),
        orderBy('scheduledTime', 'desc'),
        limit(limitCount)
      ];

      if (unreadOnly) {
        constraints.splice(1, 0, where('isRead', '==', false));
      }

      const q = query(collection(db, 'smart_notifications'), ...constraints);
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        scheduledTime: doc.data().scheduledTime.toDate(),
        deliveredTime: doc.data().deliveredTime?.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as SmartNotification[];
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return [];
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const docRef = doc(db, 'smart_notifications', notificationId);
      await updateDoc(docRef, {
        isRead: true,
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async getNotificationAnalytics(userId: string): Promise<NotificationAnalytics> {
    try {
      const notifications = await this.getUserNotifications(userId, false, 100);
      
      const analytics = this.calculateNotificationAnalytics(notifications);
      return {
        userId,
        ...analytics
      };
    } catch (error) {
      console.error('Error getting notification analytics:', error);
      throw error;
    }
  }

  private async generateBehaviorBasedReminder(
    userId: string,
    behaviorData: any,
    preferences: UserNotificationPreferences,
    optimalTimes: string[]
  ): Promise<Omit<SmartNotification, 'id'>> {
    const userName = await this.getUserName(userId);
    const nextOptimalTime = this.getNextOptimalTime(optimalTimes);
    
    let title = '';
    let message = '';
    let priority: SmartNotification['priority'] = 'medium';

    // Analyze behavior patterns to generate appropriate reminder
    if (behaviorData.daysSinceLastSession > 3) {
      priority = 'high';
      title = `${userName}, sudah ${behaviorData.daysSinceLastSession} hari nih!`;
      message = this.getBehaviorBasedMessage('long_absence', preferences.motivationalTone);
    } else if (behaviorData.streakBroken) {
      priority = 'medium';
      title = `Ayo mulai streak baru, ${userName}!`;
      message = this.getBehaviorBasedMessage('streak_broken', preferences.motivationalTone);
    } else if (behaviorData.consistencyDropping) {
      priority = 'medium';
      title = `Konsistensi adalah kunci, ${userName}`;
      message = this.getBehaviorBasedMessage('consistency_reminder', preferences.motivationalTone);
    } else {
      title = `Waktunya meditasi, ${userName}!`;
      message = this.getBehaviorBasedMessage('regular_reminder', preferences.motivationalTone);
    }

    return {
      userId,
      type: 'reminder',
      category: 'meditation_reminder',
      title,
      message,
      priority,
      scheduledTime: nextOptimalTime,
      isRead: false,
      isDelivered: false,
      data: {
        context: behaviorData
      },
      triggers: [{
        type: 'behavior_based',
        condition: 'session_gap',
        value: behaviorData.daysSinceLastSession,
        isActive: true
      }],
      personalizedContent: {
        userName,
        preferredTechnique: behaviorData.preferredTechnique,
        motivationalTone: preferences.motivationalTone,
        culturalContext: 'indonesian'
      },
      deliveryMethod: preferences.deliveryMethods.push ? 'push' : 'in_app',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private async createContextualNotification(
    userId: string,
    context: string,
    preferences: UserNotificationPreferences,
    recentMoods: any[]
  ): Promise<Omit<SmartNotification, 'id'>> {
    const userName = await this.getUserName(userId);
    
    const contextualMessages = {
      stress_detected: {
        title: `${userName}, detected stress tinggi nih`,
        message: 'Yuk luangkan 5 menit untuk breathing meditation. Dijamin pikiran jadi lebih tenang! 🌸',
        priority: 'high' as const
      },
      mood_low: {
        title: `${userName}, butuh mood booster?`,
        message: 'Coba loving-kindness meditation untuk mengangkat mood. Self-compassion itu penting lho! 💝',
        priority: 'medium' as const
      },
      energy_low: {
        title: `Energi drop, ${userName}?`,
        message: 'Energizing breath work bisa bantu restore energi. 10 menit aja sudah cukup! ⚡',
        priority: 'medium' as const
      },
      anxiety_high: {
        title: `${userName}, anxiety lagi tinggi ya?`,
        message: 'Body scan meditation bisa bantu calm the nervous system. Safe space for you! 🕊️',
        priority: 'high' as const
      }
    };

    const contextData = contextualMessages[context as keyof typeof contextualMessages];

    return {
      userId,
      type: 'contextual',
      category: context === 'stress_detected' || context === 'anxiety_high' ? 'stress_alert' : 'mood_check',
      title: contextData.title,
      message: contextData.message,
      priority: contextData.priority,
      scheduledTime: new Date(), // Immediate
      isRead: false,
      isDelivered: false,
      data: {
        context: {
          trigger: context,
          recentMoods: recentMoods.slice(0, 3)
        }
      },
      triggers: [{
        type: 'mood_based',
        condition: context,
        value: recentMoods[0]?.overall || 0,
        isActive: true
      }],
      personalizedContent: {
        userName,
        motivationalTone: preferences.motivationalTone,
        culturalContext: 'indonesian'
      },
      deliveryMethod: 'push',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private async getUserPreferences(userId: string): Promise<UserNotificationPreferences> {
    try {
      const q = query(
        collection(db, 'notification_preferences'),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Return default preferences
        return {
          userId,
          enableSmartReminders: true,
          enableContextualNotifications: true,
          enableAchievementNotifications: true,
          enableProgressSummaries: true,
          quietHours: { start: '22:00', end: '07:00' },
          preferredTimes: ['07:00', '12:00', '19:00'],
          frequency: 'moderate',
          motivationalTone: 'encouraging',
          languagePreference: 'indonesian',
          deliveryMethods: { push: true, email: false, inApp: true },
          customSettings: {
            stressThreshold: 3,
            moodThreshold: 3,
            streakReminders: true,
            goalDeadlineAlerts: true,
            weeklyReports: true
          },
          updatedAt: new Date()
        };
      }

      const data = snapshot.docs[0].data();
      return {
        ...data,
        updatedAt: data.updatedAt.toDate()
      } as UserNotificationPreferences;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      throw error;
    }
  }

  private async calculateOptimalTimes(userId: string, sessions: any[]): Promise<string[]> {
    if (sessions.length === 0) {
      return ['07:00', '12:00', '19:00']; // Default times
    }

    // Analyze when user typically meditates
    const timeFrequency: { [time: string]: number } = {};
    
    sessions.forEach(session => {
      const hour = new Date(session.date).getHours();
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      timeFrequency[timeSlot] = (timeFrequency[timeSlot] || 0) + 1;
    });

    // Get top 3 most frequent times
    return Object.entries(timeFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([time]) => time);
  }

  private analyzeUserPatterns(sessions: any[], moodEntries: any[], habits: any[]) {
    // Analyze best meditation times based on mood improvement
    const timeEffectiveness: { [hour: number]: { count: number; avgImprovement: number } } = {};
    
    sessions.forEach(session => {
      if (session.moodBefore && session.moodAfter) {
        const hour = new Date(session.date).getHours();
        const improvement = session.moodAfter - session.moodBefore;
        
        if (!timeEffectiveness[hour]) {
          timeEffectiveness[hour] = { count: 0, avgImprovement: 0 };
        }
        
        timeEffectiveness[hour].count++;
        timeEffectiveness[hour].avgImprovement = 
          (timeEffectiveness[hour].avgImprovement * (timeEffectiveness[hour].count - 1) + improvement) / 
          timeEffectiveness[hour].count;
      }
    });

    return {
      timeEffectiveness,
      totalSessions: sessions.length,
      hasHabits: habits.length > 0,
      consistencyPattern: this.analyzeConsistency(sessions)
    };
  }

  private generateTimeRecommendations(analysis: any): {
    recommendedTimes: SmartScheduleRecommendation['recommendedTimes'];
    personalizedMessage: string;
  } {
    const recommendations: SmartScheduleRecommendation['recommendedTimes'] = [];
    
    // Sort times by effectiveness
    const sortedTimes = Object.entries(analysis.timeEffectiveness)
      .sort(([,a], [,b]) => (b as any).avgImprovement - (a as any).avgImprovement)
      .slice(0, 3);

    sortedTimes.forEach(([hour, data]: [string, any]) => {
      recommendations.push({
        time: `${hour.padStart(2, '0')}:00`,
        confidence: Math.min(0.9, data.count / 10), // Higher confidence with more data
        reason: `Berdasarkan ${data.count} sesi, waktu ini memberikan peningkatan mood rata-rata ${data.avgImprovement.toFixed(1)}`
      });
    });

    // Add default recommendations if not enough data
    if (recommendations.length < 3) {
      const defaultTimes = [
        { time: '07:00', reason: 'Pagi hari ideal untuk memulai hari dengan mindful' },
        { time: '12:00', reason: 'Istirahat siang untuk reset energi' },
        { time: '19:00', reason: 'Sore hari untuk relaksasi setelah aktivitas' }
      ];
      
      defaultTimes.forEach(defaultTime => {
        if (!recommendations.some(r => r.time === defaultTime.time)) {
          recommendations.push({
            ...defaultTime,
            confidence: 0.5
          });
        }
      });
    }

    const personalizedMessage = analysis.totalSessions > 10 
      ? `Berdasarkan ${analysis.totalSessions} sesi meditasi Anda, kami merekomendasikan waktu-waktu optimal ini`
      : 'Berdasarkan research dan best practices, waktu-waktu ini ideal untuk meditasi';

    return {
      recommendedTimes: recommendations.slice(0, 3),
      personalizedMessage
    };
  }

  private async scheduleRecurringReminder(userId: string, time: string, reason: string): Promise<void> {
    // This would integrate with a scheduling system (like cron jobs or cloud functions)
    // For demo purposes, we'll create the next few reminders
    
    const preferences = await this.getUserPreferences(userId);
    const userName = await this.getUserName(userId);
    
    for (let days = 1; days <= 7; days++) {
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + days);
      const [hour, minute] = time.split(':');
      scheduledDate.setHours(parseInt(hour), parseInt(minute), 0, 0);

      const notification: Omit<SmartNotification, 'id'> = {
        userId,
        type: 'reminder',
        category: 'meditation_reminder',
        title: `Waktunya meditasi, ${userName}!`,
        message: `${reason}. Yuk luangkan waktu untuk diri sendiri! 🧘‍♀️`,
        priority: 'medium',
        scheduledTime: scheduledDate,
        isRead: false,
        isDelivered: false,
        triggers: [{
          type: 'time_based',
          condition: 'optimal_time',
          value: time,
          isActive: true
        }],
        personalizedContent: {
          userName,
          motivationalTone: preferences.motivationalTone,
          culturalContext: 'indonesian'
        },
        deliveryMethod: preferences.deliveryMethods.push ? 'push' : 'in_app',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(db, 'smart_notifications'), {
        ...notification,
        scheduledTime: Timestamp.fromDate(notification.scheduledTime),
        createdAt: Timestamp.fromDate(notification.createdAt),
        updatedAt: Timestamp.fromDate(notification.updatedAt)
      });
    }
  }

  private generateCelebrationTitle(achievementData: any, preferences: UserNotificationPreferences): string {
    const celebrations = {
      gentle: [
        '🌸 Pencapaian baru!',
        '✨ Progress yang indah!',
        '🕊️ Milestone tercapai!'
      ],
      encouraging: [
        '🎉 Hebat sekali!',
        '🏆 Achievement unlocked!',
        '⭐ Luar biasa!'
      ],
      energetic: [
        '🚀 Amazing achievement!',
        '💪 Kamu keren banget!',
        '🔥 On fire nih!'
      ],
      calm: [
        '🧘‍♀️ Pencapaian yang bermakna',
        '🌅 Progress yang tenang',
        '💫 Milestone dengan grace'
      ]
    };

    const options = celebrations[preferences.motivationalTone];
    return options[Math.floor(Math.random() * options.length)];
  }

  private generateCelebrationMessage(achievementData: any, preferences: UserNotificationPreferences): string {
    const messages = {
      achievement: 'Kerja keras Anda membuahkan hasil! Terus jaga momentum ini ya! 🌟',
      milestone: `${achievementData.description}. Setiap langkah kecil membawa Anda lebih dekat dengan inner peace! 🙏`,
      streak: `Streak ${achievementData.title}! Konsistensi adalah kunci kesuksesan dalam meditasi. Proud of you! 💝`,
      goal_completed: `Goal "${achievementData.title}" completed! Saatnya set goal baru untuk melanjutkan journey ini! 🎯`
    };

    return messages[achievementData.type as keyof typeof messages] || messages.achievement;
  }

  private getBehaviorBasedMessage(type: string, tone: string): string {
    const messages = {
      long_absence: {
        gentle: 'Tidak apa-apa jika sempat break. Yuk mulai lagi dengan session pendek, 5 menit aja dulu! 🌸',
        encouraging: 'Time to get back on track! Meditation menunggu Anda. Let\'s restart the journey! 💪',
        energetic: 'Miss you di meditation space! Ayo comeback dengan session yang energizing! 🚀',
        calm: 'Space untuk meditasi selalu terbuka untuk Anda. Mulai dengan napas yang dalam... 🧘‍♀️'
      },
      streak_broken: {
        gentle: 'Streak putus tapi semangat tidak! Every day is a new beginning. Mulai dari hari ini ya! 🌅',
        encouraging: 'Streak baru dimulai hari ini! Satu sesi kecil sudah cukup untuk membangun momentum! ⭐',
        energetic: 'Streak reset = fresh start! Let\'s build an even better streak starting now! 🔥',
        calm: 'Tidak ada yang namanya gagal dalam meditasi. Hanya ada practice. Mari lanjutkan... 🕊️'
      },
      consistency_reminder: {
        gentle: 'Konsistensi kecil lebih berharga dari session panjang sesekali. 5 menit hari ini? 🌸',
        encouraging: 'Consistency is your superpower! Satu session hari ini untuk maintain momentum! 💫',
        energetic: 'Keep the fire burning! Daily practice = daily wins! Let\'s go! 🚀',
        calm: 'Seperti air yang mengalir, biarkan meditasi menjadi bagian natural dari hari Anda... 🌊'
      },
      regular_reminder: {
        gentle: 'Moment tenang menanti Anda. Ready untuk session yang refreshing? 🌺',
        encouraging: 'Your daily dose of mindfulness is ready! Time to recharge your inner battery! ⚡',
        energetic: 'Meditation time! Let\'s make today even more awesome with some mindful moments! 🌟',
        calm: 'Saatnya kembali ke center. Breath, mindfulness, dan inner peace menanti... 🧘‍♀️'
      }
    };

    return (messages as any)[type]?.[tone] || 
           'Waktunya meditasi! Yuk luangkan waktu untuk diri sendiri 🧘‍♀️';
  }

  private async getUserName(userId: string): Promise<string> {
    try {
      // Fetch actual user profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const displayName = userData.displayName;
        if (displayName && displayName.trim()) {
          // Return first name only
          return displayName.split(' ')[0];
        }
        
        // Try email prefix if no display name
        const email = userData.email;
        if (email) {
          const emailPrefix = email.split('@')[0];
          if (emailPrefix && /^[a-zA-Z]/.test(emailPrefix)) {
            return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user name:', error);
    }
    
    // Fallback to generic Indonesian greeting
    return 'Sahabat';
  }

  private getNextOptimalTime(optimalTimes: string[]): Date {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Find next optimal time today
    for (const timeStr of optimalTimes) {
      const [hour] = timeStr.split(':').map(Number);
      if (hour > currentHour) {
        const nextTime = new Date(now);
        nextTime.setHours(hour, 0, 0, 0);
        return nextTime;
      }
    }
    
    // If no optimal time today, use first optimal time tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const [hour] = optimalTimes[0].split(':').map(Number);
    tomorrow.setHours(hour, 0, 0, 0);
    return tomorrow;
  }

  private getNextSundayEvening(): Date {
    const now = new Date();
    const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + daysUntilSunday);
    nextSunday.setHours(19, 0, 0, 0); // 7 PM
    return nextSunday;
  }

  private async getWeeklyProgressData(userId: string) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const sessions = await progressService.getMeditationSessions(userId, 50);
    const weekSessions = sessions.filter(s => new Date(s.completedAt) >= weekAgo);
    
    return {
      totalSessions: weekSessions.length,
      totalDuration: weekSessions.reduce((sum, s) => sum + s.duration, 0),
      avgQuality: weekSessions.length > 0 
        ? weekSessions.reduce((sum, s) => sum + s.quality, 0) / weekSessions.length 
        : 0,
      techniques: [...new Set(weekSessions.flatMap(s => s.techniques))],
      moodImprovement: weekSessions
        .filter(s => s.moodBefore && s.moodAfter)
        .reduce((sum, s) => sum + ((Number(s.moodAfter) || 0) - (Number(s.moodBefore) || 0)), 0)
    };
  }

  private createProgressSummary(weeklyData: any, preferences: UserNotificationPreferences) {
    const insights = [];
    
    if (weeklyData.totalSessions >= 5) {
      insights.push('Konsistensi meditasi Anda excellent minggu ini! 🌟');
    } else if (weeklyData.totalSessions >= 3) {
      insights.push('Good job maintaining regular practice! 👏');
    } else {
      insights.push('Ada space untuk improve consistency minggu depan 💪');
    }

    if (weeklyData.avgQuality >= 4) {
      insights.push('Kualitas sesi meditasi Anda sangat baik! 🧘‍♀️');
    }

    if (weeklyData.moodImprovement > 0) {
      insights.push(`Mood improvement total: +${weeklyData.moodImprovement.toFixed(1)} points! 😊`);
    }

    return {
      title: '📊 Weekly Progress Summary',
      message: `Minggu ini: ${weeklyData.totalSessions} sesi, ${Math.round(weeklyData.totalDuration)} menit total. ${insights[0]}`,
      insights
    };
  }

  private generateWeeklyEncouragement(weeklyData: any, preferences: UserNotificationPreferences): string {
    if (weeklyData.totalSessions >= 6) {
      return 'Amazing dedication! Anda benar-benar committed dengan inner growth journey! 🌟';
    } else if (weeklyData.totalSessions >= 4) {
      return 'Solid practice minggu ini! Every session counts dalam building mindfulness habit 💫';
    } else if (weeklyData.totalSessions >= 2) {
      return 'Good start! Minggu depan coba aim for satu session lagi ya! Small steps, big impact 🌱';
    } else {
      return 'Setiap journey punya rhythm-nya sendiri. Minggu depan = fresh opportunity! 🌅';
    }
  }

  private analyzeConsistency(sessions: any[]): any {
    // Implementation for consistency analysis
    const last7Days = sessions.filter(s => {
      const sessionDate = new Date(s.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return sessionDate >= weekAgo;
    });

    return {
      weeklyFrequency: last7Days.length,
      isImproving: last7Days.length > sessions.length / 4, // Rough estimate
      avgGap: this.calculateAverageGap(sessions)
    };
  }

  private calculateAverageGap(sessions: any[]): number {
    if (sessions.length < 2) return 0;
    
    const sortedSessions = sessions
      .map(s => new Date(s.date))
      .sort((a, b) => a.getTime() - b.getTime());
    
    let totalGap = 0;
    for (let i = 1; i < sortedSessions.length; i++) {
      const gap = (sortedSessions[i].getTime() - sortedSessions[i-1].getTime()) / (1000 * 60 * 60 * 24);
      totalGap += gap;
    }
    
    return totalGap / (sortedSessions.length - 1);
  }

  private async deliverNotification(notificationId: string): Promise<void> {
    // This would integrate with push notification service (FCM, etc.)
    // For demo purposes, just mark as delivered
    try {
      const docRef = doc(db, 'smart_notifications', notificationId);
      await updateDoc(docRef, {
        isDelivered: true,
        deliveredTime: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error delivering notification:', error);
    }
  }

  private async rescheduleUserNotifications(userId: string): Promise<void> {
    // Cancel existing scheduled notifications and create new ones based on updated preferences
    // This would involve more complex scheduling logic in production
    console.log(`Rescheduling notifications for user ${userId}`);
  }

  private calculateNotificationAnalytics(notifications: SmartNotification[]): Omit<NotificationAnalytics, 'userId'> {
    const total = notifications.length;
    const delivered = notifications.filter(n => n.isDelivered).length;
    const read = notifications.filter(n => n.isRead).length;
    
    return {
      totalSent: total,
      totalDelivered: delivered,
      totalRead: read,
      totalActedUpon: 0, // Would need to track actions
      engagementRate: total > 0 ? (read / total) * 100 : 0,
      optimalTimes: ['07:00', '19:00'], // Would calculate from data
      effectiveCategories: ['achievement', 'reminder'],
      responsePatterns: {
        byTimeOfDay: {},
        byDayOfWeek: {},
        byCategory: {}
      }
    };
  }
}

export const smartNotificationService = SmartNotificationService.getInstance();