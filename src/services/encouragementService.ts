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
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { progressService } from './progressService';
import { smartNotificationService } from './smartNotificationService';
import { emotionalIntelligenceService } from './emotionalIntelligenceService';
import { habitAnalyticsService } from './habitAnalyticsService';

export interface WeeklyProgressSummary {
  id: string;
  userId: string;
  weekOf: Date; // Start of the week (Monday)
  weekNumber: number;
  year: number;
  metrics: {
    totalSessions: number;
    totalDuration: number; // minutes
    avgSessionDuration: number;
    avgQuality: number;
    uniqueDays: number;
    consistencyRate: number; // percentage
    moodImprovement: {
      average: number;
      sessions: number;
      bestDay: Date | null;
    };
    stressReduction: {
      average: number;
      sessions: number;
      lowestStress: number;
    };
    techniques: {
      name: string;
      sessions: number;
      avgQuality: number;
    }[];
    achievements: string[];
    milestones: string[];
  };
  comparisons: {
    previousWeek: {
      sessionsChange: number;
      durationChange: number;
      qualityChange: number;
      consistencyChange: number;
    };
    personalBest: {
      isNewRecord: boolean;
      recordType?: string;
      previousRecord?: number;
    };
    communityComparison: {
      percentile: number;
      comparison: 'above_average' | 'average' | 'below_average';
    };
  };
  insights: {
    highlights: string[];
    improvements: string[];
    patterns: string[];
    recommendations: string[];
  };
  encouragement: {
    primaryMessage: string;
    motivationalQuote: string;
    nextWeekGoal: string;
    celebrationMessage?: string;
  };
  generatedAt: Date;
  deliveredAt?: Date;
  userEngagement: {
    viewed: boolean;
    rating?: number; // 1-5
    feedback?: string;
  };
}

export interface EncouragementMessage {
  id: string;
  userId: string;
  type: 'daily_motivation' | 'weekly_summary' | 'milestone_check' | 'struggle_support' | 'consistency_boost';
  context: 'new_user' | 'returning_user' | 'consistent_user' | 'struggling_user' | 'advanced_user';
  message: {
    title: string;
    content: string;
    tone: 'gentle' | 'encouraging' | 'inspiring' | 'supportive';
    culturalContext: 'indonesian' | 'universal';
  };
  triggers: {
    daysSinceLastSession?: number;
    currentStreak?: number;
    qualityDrop?: boolean;
    firstTimeUser?: boolean;
    milestone?: string;
  };
  deliveryTime: Date;
  personalizedElements: {
    userName: string;
    recentAchievements: string[];
    preferredTechniques: string[];
    motivationalStyle: string;
  };
  effectiveness: {
    opened: boolean;
    actionTaken: boolean; // Did user meditate after receiving?
    rating?: number;
  };
  createdAt: Date;
}

export interface UserEncouragementProfile {
  userId: string;
  motivationalStyle: 'gentle' | 'energetic' | 'wise' | 'supportive';
  responseToEncouragement: 'positive' | 'neutral' | 'prefer_minimal';
  preferredTiming: {
    dailyMotivation: string; // HH:MM
    weeklyReview: string; // day of week + time
    strugglingSupport: 'immediate' | 'gentle_delay';
  };
  personalContext: {
    meditationGoals: string[];
    challenges: string[];
    motivationalKeywords: string[];
    culturalPreferences: string[];
  };
  engagement: {
    totalMessagesReceived: number;
    messagesOpened: number;
    positiveResponses: number;
    averageRating: number;
  };
  lastUpdated: Date;
}

export interface ProgressPattern {
  userId: string;
  pattern: 'steadily_improving' | 'plateauing' | 'declining' | 'inconsistent' | 'sporadic_bursts';
  confidence: number; // 0-1
  duration: number; // days this pattern has been observed
  factors: {
    sessionFrequency: 'increasing' | 'stable' | 'decreasing';
    sessionQuality: 'improving' | 'stable' | 'declining';
    consistency: 'building' | 'maintaining' | 'losing';
    engagement: 'high' | 'medium' | 'low';
  };
  recommendations: {
    immediate: string[];
    strategic: string[];
    support: string[];
  };
  nextCheckDate: Date;
}

export class EncouragementService {
  private static instance: EncouragementService;

  static getInstance(): EncouragementService {
    if (!EncouragementService.instance) {
      EncouragementService.instance = new EncouragementService();
    }
    return EncouragementService.instance;
  }

  async generateWeeklyProgressSummary(userId: string): Promise<WeeklyProgressSummary> {
    try {
      const weekStart = this.getWeekStart(new Date());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      // Get week's data
      const sessions = await progressService.getMeditationSessions(userId, 100);
      const weekSessions = sessions.filter(s => {
        const sessionDate = new Date(s.completedAt);
        return sessionDate >= weekStart && sessionDate <= weekEnd;
      });

      const moodEntries = await progressService.getMoodEntries(userId, 50);
      const weekMoods = moodEntries.filter(m => {
        const moodDate = new Date(m.timestamp);
        return moodDate >= weekStart && moodDate <= weekEnd;
      });

      // Calculate metrics
      const metrics = this.calculateWeeklyMetrics(weekSessions, weekMoods);
      
      // Get comparisons
      const comparisons = await this.calculateWeeklyComparisons(userId, weekSessions, weekStart);
      
      // Generate insights
      const insights = await this.generateWeeklyInsights(userId, weekSessions, metrics, comparisons);
      
      // Create encouragement
      const encouragement = await this.generateWeeklyEncouragement(userId, metrics, insights, comparisons);

      const summary: Omit<WeeklyProgressSummary, 'id'> = {
        userId,
        weekOf: weekStart,
        weekNumber: this.getWeekNumber(weekStart),
        year: weekStart.getFullYear(),
        metrics,
        comparisons,
        insights,
        encouragement,
        generatedAt: new Date(),
        userEngagement: {
          viewed: false
        }
      };

      // Save to database
      const docRef = await addDoc(collection(db, 'weekly_summaries'), {
        ...summary,
        weekOf: Timestamp.fromDate(summary.weekOf),
        generatedAt: Timestamp.fromDate(summary.generatedAt)
      });

      const savedSummary = { id: docRef.id, ...summary };

      // Send notification
      await this.sendWeeklySummaryNotification(savedSummary);

      return savedSummary;
    } catch (error) {
      console.error('Error generating weekly progress summary:', error);
      throw error;
    }
  }

  async createEncouragementMessage(
    userId: string,
    context: EncouragementMessage['context'],
    triggers: EncouragementMessage['triggers']
  ): Promise<EncouragementMessage> {
    try {
      const profile = await this.getUserEncouragementProfile(userId);
      const recentSessions = await progressService.getMeditationSessions(userId, 10);
      
      const messageType = this.determineMessageType(context, triggers);
      const messageContent = await this.generateEncouragementContent(
        userId,
        messageType,
        context,
        triggers,
        profile,
        recentSessions
      );

      const message: Omit<EncouragementMessage, 'id'> = {
        userId,
        type: messageType,
        context,
        message: messageContent,
        triggers,
        deliveryTime: this.calculateOptimalDeliveryTime(profile, messageType),
        personalizedElements: {
          userName: await this.getUserName(userId),
          recentAchievements: await this.getRecentAchievements(userId),
          preferredTechniques: this.getPreferredTechniques(recentSessions),
          motivationalStyle: profile.motivationalStyle
        },
        effectiveness: {
          opened: false,
          actionTaken: false
        },
        createdAt: new Date()
      };

      // Save message
      const docRef = await addDoc(collection(db, 'encouragement_messages'), {
        ...message,
        deliveryTime: Timestamp.fromDate(message.deliveryTime),
        createdAt: Timestamp.fromDate(message.createdAt)
      });

      const savedMessage = { id: docRef.id, ...message };

      // Schedule delivery if not immediate
      if (message.deliveryTime <= new Date()) {
        await this.deliverEncouragementMessage(savedMessage);
      }

      return savedMessage;
    } catch (error) {
      console.error('Error creating encouragement message:', error);
      throw error;
    }
  }

  async analyzeProgressPatterns(userId: string): Promise<ProgressPattern> {
    try {
      const sessions = await progressService.getMeditationSessions(userId, 50);
      const moods = await progressService.getMoodEntries(userId, 30);
      
      if (sessions.length < 5) {
        return this.createNewUserPattern(userId);
      }

      const pattern = this.identifyProgressPattern(sessions, moods);
      const factors = this.analyzePatternFactors(sessions, moods);
      const recommendations = this.generatePatternRecommendations(pattern, factors);

      return {
        userId,
        pattern,
        confidence: this.calculatePatternConfidence(sessions.length, factors),
        duration: this.calculatePatternDuration(sessions),
        factors,
        recommendations,
        nextCheckDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week
      };
    } catch (error) {
      console.error('Error analyzing progress patterns:', error);
      throw error;
    }
  }

  async sendDailyMotivation(userId: string): Promise<void> {
    try {
      const profile = await this.getUserEncouragementProfile(userId);
      const lastSession = await this.getLastSession(userId);
      const daysSinceLastSession = lastSession 
        ? Math.floor((Date.now() - new Date(lastSession.date).getTime()) / (1000 * 60 * 60 * 24))
        : 99;

      let context: EncouragementMessage['context'] = 'consistent_user';
      let triggers: EncouragementMessage['triggers'] = {};

      if (daysSinceLastSession === 0) {
        // User already meditated today
        return;
      } else if (daysSinceLastSession === 1) {
        context = 'returning_user';
        triggers = { daysSinceLastSession };
      } else if (daysSinceLastSession > 3) {
        context = 'struggling_user';
        triggers = { daysSinceLastSession };
      }

      await this.createEncouragementMessage(userId, context, triggers);
    } catch (error) {
      console.error('Error sending daily motivation:', error);
    }
  }

  async handleUserStruggle(userId: string, strugglingDays: number): Promise<void> {
    try {
      const profile = await this.getUserEncouragementProfile(userId);
      
      // Create supportive message
      await this.createEncouragementMessage(userId, 'struggling_user', {
        daysSinceLastSession: strugglingDays
      });

      // Update user profile to track struggle
      await this.updateUserEncouragementProfile(userId, {
        personalContext: {
          ...profile.personalContext,
          challenges: [...profile.personalContext.challenges, 'recent_inconsistency']
        }
      });
    } catch (error) {
      console.error('Error handling user struggle:', error);
    }
  }

  async updateUserEngagement(
    messageId: string,
    engagement: Partial<EncouragementMessage['effectiveness']>
  ): Promise<void> {
    try {
      const docRef = doc(db, 'encouragement_messages', messageId);
      await updateDoc(docRef, {
        effectiveness: engagement
      });

      // Update user profile based on engagement
      if (engagement.rating) {
        await this.updateUserEngagementStats(messageId, engagement.rating);
      }
    } catch (error) {
      console.error('Error updating user engagement:', error);
    }
  }

  private calculateWeeklyMetrics(sessions: any[], moods: any[]) {
    const totalSessions = sessions.length;
    const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
    const avgSessionDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;
    const avgQuality = totalSessions > 0 
      ? sessions.reduce((sum, s) => sum + s.quality, 0) / totalSessions 
      : 0;

    const uniqueDays = new Set(sessions.map(s => 
      new Date(s.date).toDateString()
    )).size;
    const consistencyRate = (uniqueDays / 7) * 100;

    // Mood improvement analysis
    const moodSessions = sessions.filter(s => s.moodBefore && s.moodAfter);
    const moodImprovement = {
      average: moodSessions.length > 0 
        ? moodSessions.reduce((sum, s) => sum + (s.moodAfter - s.moodBefore), 0) / moodSessions.length 
        : 0,
      sessions: moodSessions.length,
      bestDay: moodSessions.length > 0 
        ? new Date(moodSessions.reduce((best, current) => 
            (current.moodAfter - current.moodBefore) > (best.moodAfter - best.moodBefore) ? current : best
          ).date)
        : null
    };

    // Stress reduction analysis
    const stressSessions = sessions.filter(s => s.stressLevel);
    const stressReduction = {
      average: stressSessions.length > 0
        ? stressSessions.reduce((sum, s) => sum + (5 - s.stressLevel), 0) / stressSessions.length
        : 0,
      sessions: stressSessions.length,
      lowestStress: stressSessions.length > 0
        ? Math.min(...stressSessions.map(s => s.stressLevel))
        : 5
    };

    // Technique analysis
    const techniqueMap: { [key: string]: { sessions: number; qualitySum: number } } = {};
    sessions.forEach(session => {
      session.techniques.forEach((technique: string) => {
        if (!techniqueMap[technique]) {
          techniqueMap[technique] = { sessions: 0, qualitySum: 0 };
        }
        techniqueMap[technique].sessions++;
        techniqueMap[technique].qualitySum += session.quality;
      });
    });

    const techniques = Object.entries(techniqueMap).map(([name, data]) => ({
      name,
      sessions: data.sessions,
      avgQuality: data.qualitySum / data.sessions
    })).sort((a, b) => b.sessions - a.sessions);

    return {
      totalSessions,
      totalDuration,
      avgSessionDuration: Math.round(avgSessionDuration * 10) / 10,
      avgQuality: Math.round(avgQuality * 10) / 10,
      uniqueDays,
      consistencyRate: Math.round(consistencyRate),
      moodImprovement,
      stressReduction,
      techniques,
      achievements: [], // Would be populated from achievement service
      milestones: []   // Would be populated from milestone tracking
    };
  }

  private async calculateWeeklyComparisons(userId: string, weekSessions: any[], weekStart: Date) {
    // Get previous week data
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekEnd = new Date(prevWeekStart);
    prevWeekEnd.setDate(prevWeekEnd.getDate() + 6);

    const allSessions = await progressService.getMeditationSessions(userId, 200);
    const prevWeekSessions = allSessions.filter(s => {
      const sessionDate = new Date(s.completedAt);
      return sessionDate >= prevWeekStart && sessionDate <= prevWeekEnd;
    });

    const prevWeekMetrics = this.calculateWeeklyMetrics(prevWeekSessions, []);
    const currentMetrics = this.calculateWeeklyMetrics(weekSessions, []);

    return {
      previousWeek: {
        sessionsChange: currentMetrics.totalSessions - prevWeekMetrics.totalSessions,
        durationChange: currentMetrics.totalDuration - prevWeekMetrics.totalDuration,
        qualityChange: currentMetrics.avgQuality - prevWeekMetrics.avgQuality,
        consistencyChange: currentMetrics.consistencyRate - prevWeekMetrics.consistencyRate
      },
      personalBest: {
        isNewRecord: currentMetrics.totalSessions > Math.max(...allSessions.map(s => s.duration)),
        recordType: 'sessions_per_week'
      },
      communityComparison: {
        percentile: 65, // Would be calculated from community data
        comparison: 'above_average' as const
      }
    };
  }

  private async generateWeeklyInsights(userId: string, sessions: any[], metrics: any, comparisons: any) {
    const highlights = [];
    const improvements = [];
    const patterns = [];
    const recommendations = [];

    // Generate highlights
    if (metrics.totalSessions >= 5) {
      highlights.push(`Consistency luar biasa! ${metrics.totalSessions} sesi dalam seminggu`);
    }
    if (metrics.avgQuality >= 4) {
      highlights.push(`Kualitas meditasi excellent dengan rata-rata ${metrics.avgQuality}/5`);
    }
    if (metrics.moodImprovement.average > 1) {
      highlights.push(`Mood improvement signifikan: +${metrics.moodImprovement.average.toFixed(1)} rata-rata`);
    }

    // Generate improvements
    if (comparisons.previousWeek.sessionsChange > 0) {
      improvements.push(`Peningkatan ${comparisons.previousWeek.sessionsChange} sesi dibanding minggu lalu`);
    }
    if (comparisons.previousWeek.qualityChange > 0) {
      improvements.push(`Kualitas meditasi meningkat ${comparisons.previousWeek.qualityChange.toFixed(1)} poin`);
    }

    // Generate patterns
    if (metrics.techniques.length > 0) {
      patterns.push(`Teknik favorit: ${metrics.techniques[0].name} (${metrics.techniques[0].sessions} sesi)`);
    }
    if (metrics.consistencyRate >= 80) {
      patterns.push('Pola konsistensi yang sangat baik');
    }

    // Generate recommendations
    if (metrics.consistencyRate < 60) {
      recommendations.push('Coba set reminder harian untuk meningkatkan konsistensi');
    }
    if (metrics.avgSessionDuration < 10) {
      recommendations.push('Pertimbangkan untuk memperpanjang durasi sesi secara bertahap');
    }
    if (metrics.techniques.length === 1) {
      recommendations.push('Eksplorasi teknik meditasi baru untuk variasi');
    }

    return { highlights, improvements, patterns, recommendations };
  }

  private async generateWeeklyEncouragement(userId: string, metrics: any, insights: any, comparisons: any) {
    const profile = await this.getUserEncouragementProfile(userId);
    
    let primaryMessage = '';
    let celebrationMessage = '';
    
    if (metrics.totalSessions >= 6) {
      primaryMessage = 'Minggu yang luar biasa! Konsistensi seperti ini yang membuat transformasi nyata terjadi. 🌟';
      celebrationMessage = 'Anda berada di top performance minggu ini!';
    } else if (metrics.totalSessions >= 4) {
      primaryMessage = 'Progress yang solid minggu ini! Momentum ini sangat baik untuk dilanjutkan. 💪';
    } else if (metrics.totalSessions >= 2) {
      primaryMessage = 'Setiap sesi adalah step forward. Minggu depan ada kesempatan untuk lebih konsisten. 🌱';
    } else {
      primaryMessage = 'Tidak apa-apa jika minggu ini challenging. Setiap hari adalah fresh start untuk begin again. 🌅';
    }

    const motivationalQuotes = [
      'Konsistensi kecil mengalahkan usaha besar yang sporadis',
      'Setiap napas mindful adalah gift untuk diri sendiri',
      'Progress bukan tentang perfect, tapi tentang presence',
      'Seperti air yang mengalir, biarkan practice mengalir natural'
    ];

    const nextWeekGoal = metrics.totalSessions < 4 
      ? `Target minggu depan: ${Math.min(7, metrics.totalSessions + 2)} sesi meditasi`
      : `Pertahankan momentum dengan ${Math.max(4, metrics.totalSessions)} sesi lagi`;

    return {
      primaryMessage,
      motivationalQuote: motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)],
      nextWeekGoal,
      celebrationMessage
    };
  }

  private async sendWeeklySummaryNotification(summary: WeeklyProgressSummary): Promise<void> {
    try {
      await smartNotificationService.generateWeeklyProgressSummary(summary.userId);
    } catch (error) {
      console.error('Error sending weekly summary notification:', error);
    }
  }

  private determineMessageType(
    context: EncouragementMessage['context'],
    triggers: EncouragementMessage['triggers']
  ): EncouragementMessage['type'] {
    if (triggers.firstTimeUser) return 'daily_motivation';
    if (triggers.daysSinceLastSession && triggers.daysSinceLastSession > 3) return 'struggle_support';
    if (triggers.milestone) return 'milestone_check';
    if (triggers.currentStreak && triggers.currentStreak > 0) return 'consistency_boost';
    
    return 'daily_motivation';
  }

  private async generateEncouragementContent(
    userId: string,
    type: EncouragementMessage['type'],
    context: EncouragementMessage['context'],
    triggers: EncouragementMessage['triggers'],
    profile: UserEncouragementProfile,
    recentSessions: any[]
  ): Promise<EncouragementMessage['message']> {
    const tone = profile.motivationalStyle === 'gentle' ? 'gentle' :
                 profile.motivationalStyle === 'energetic' ? 'inspiring' :
                 profile.motivationalStyle === 'wise' ? 'supportive' : 'encouraging';

    let title = '';
    let content = '';

    switch (type) {
      case 'daily_motivation': {
        title = this.generateMotivationTitle(context, profile);
        content = this.generateMotivationContent(context, profile, recentSessions);
        break;
      }
      
      case 'struggle_support': {
        title = 'Tidak apa-apa untuk restart 🌱';
        content = this.generateSupportContent(triggers.daysSinceLastSession || 0, profile);
        break;
      }
      
      case 'consistency_boost': {
        title = `${triggers.currentStreak} hari streak! 🔥`;
        content = this.generateConsistencyContent(triggers.currentStreak || 0, profile);
        break;
      }
      
      case 'milestone_check': {
        title = `Milestone Check: ${triggers.milestone}`;
        content = this.generateMilestoneContent(triggers.milestone || '', profile);
        break;
      }
      
      default: {
        title = 'Waktunya mindful moment 🧘‍♀️';
        content = 'Luangkan waktu untuk diri sendiri hari ini. Setiap napas adalah kesempatan untuk hadir sepenuhnya.';
      }
    }

    return {
      title,
      content,
      tone: tone as any,
      culturalContext: 'indonesian'
    };
  }

  private generateMotivationTitle(context: EncouragementMessage['context'], profile: UserEncouragementProfile): string {
    const titles = {
      new_user: ['Selamat datang di journey mindfulness! 🌟', 'Langkah pertama yang beautiful! ✨'],
      returning_user: ['Welcome back, mindful soul! 🙏', 'Ready untuk continue the journey? 🌸'],
      consistent_user: ['Time untuk daily dose of peace 🧘‍♀️', 'Your mindful moment awaits ☀️'],
      struggling_user: ['Gentle reminder: Anda tidak sendiri 💝', 'Soft invitation to return 🌱'],
      advanced_user: ['Deepening the practice today? 🏔️', 'Advanced soul, ready to explore? 🌊']
    };

    const options = titles[context] || titles.consistent_user;
    return options[Math.floor(Math.random() * options.length)];
  }

  private generateMotivationContent(
    context: EncouragementMessage['context'],
    profile: UserEncouragementProfile,
    recentSessions: any[]
  ): string {
    const contents = {
      new_user: 'Perjalanan seribu mil dimulai dengan satu langkah. Hari ini, langkah mindfulness Anda dimulai. Tidak perlu perfect, cukup present. 🌱',
      returning_user: 'Meditation space selalu menunggu Anda dengan open arms. 5 menit mindfulness bisa shift entire energy hari ini. Ready? 💫',
      consistent_user: `Konsistensi Anda inspiring! Hari ini adalah kesempatan untuk deepen practice dan discover new layers of awareness. 🌸`,
      struggling_user: 'Struggle adalah bagian natural dari journey. Setiap master pernah beginner. Today is perfect day untuk begin again, gently. 🌅',
      advanced_user: 'Practice Anda sudah strong foundation. Hari ini eksplorasi edge baru dari awareness dan compassion. The depth awaits. 🏔️'
    };

    return contents[context] || contents.consistent_user;
  }

  private generateSupportContent(daysSince: number, profile: UserEncouragementProfile): string {
    if (daysSince <= 7) {
      return `${daysSince} hari gap itu normal dalam journey. Yang penting bukan streak, tapi willingness untuk return. Hari ini fresh start! 🌱`;
    } else if (daysSince <= 14) {
      return `Break yang lebih panjang sometimes necessary untuk recharge. Sekarang saatnya gentle return. Start small, bahkan 3 menit sudah meaningful. 💝`;
    } else {
      return `Extended break bisa jadi wisdom body butuh rest. Sekarang energy sudah ready untuk reconnect. Welcome back dengan full acceptance dan no judgment. 🌅`;
    }
  }

  private generateConsistencyContent(streak: number, profile: UserEncouragementProfile): string {
    if (streak < 7) {
      return `${streak} hari consecutive practice! Momentum ini precious. Konsistensi seperti ini yang builds lasting transformation. Keep flowing! 🌊`;
    } else if (streak < 30) {
      return `${streak} hari streak adalah achievement yang luar biasa! Anda sudah building habit yang akan benefit seumur hidup. Incredible dedication! 🔥`;
    } else {
      return `${streak} hari streak! Ini bukan lagi habit, ini sudah lifestyle. Anda inspiring example bahwa consistency creates magic. Legend! ⭐`;
    }
  }

  private generateMilestoneContent(milestone: string, profile: UserEncouragementProfile): string {
    return `Milestone "${milestone}" reached! Setiap milestone adalah proof bahwa consistent practice membawa growth yang nyata. Proud of your journey! 🎯`;
  }

  private calculateOptimalDeliveryTime(
    profile: UserEncouragementProfile, 
    messageType: EncouragementMessage['type']
  ): Date {
    const now = new Date();
    
    switch (messageType) {
      case 'daily_motivation': {
        // Use user's preferred daily motivation time
        const [hour, minute] = profile.preferredTiming.dailyMotivation.split(':').map(Number);
        const deliveryTime = new Date(now);
        deliveryTime.setHours(hour, minute, 0, 0);
        
        // If time has passed today, schedule for tomorrow
        if (deliveryTime <= now) {
          deliveryTime.setDate(deliveryTime.getDate() + 1);
        }
        
        return deliveryTime;
      }
      
      case 'struggle_support': {
        // Immediate or gentle delay based on preference
        if (profile.preferredTiming.strugglingSupport === 'immediate') {
          return now;
        } else {
          const delayed = new Date(now);
          delayed.setHours(delayed.getHours() + 2); // 2 hour delay
          return delayed;
        }
      }
      
      default: {
        return now; // Immediate delivery for other types
      }
    }
  }

  private async getUserEncouragementProfile(userId: string): Promise<UserEncouragementProfile> {
    try {
      const q = query(
        collection(db, 'encouragement_profiles'),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Create default profile
        const defaultProfile: UserEncouragementProfile = {
          userId,
          motivationalStyle: 'supportive',
          responseToEncouragement: 'positive',
          preferredTiming: {
            dailyMotivation: '07:30',
            weeklyReview: 'sunday_19:00',
            strugglingSupport: 'gentle_delay'
          },
          personalContext: {
            meditationGoals: [],
            challenges: [],
            motivationalKeywords: [],
            culturalPreferences: ['indonesian']
          },
          engagement: {
            totalMessagesReceived: 0,
            messagesOpened: 0,
            positiveResponses: 0,
            averageRating: 0
          },
          lastUpdated: new Date()
        };

        await addDoc(collection(db, 'encouragement_profiles'), {
          ...defaultProfile,
          lastUpdated: Timestamp.fromDate(defaultProfile.lastUpdated)
        });

        return defaultProfile;
      }

      const data = snapshot.docs[0].data();
      return {
        ...data,
        lastUpdated: data.lastUpdated.toDate()
      } as UserEncouragementProfile;
    } catch (error) {
      console.error('Error fetching encouragement profile:', error);
      throw error;
    }
  }

  private identifyProgressPattern(sessions: any[], moods: any[]): ProgressPattern['pattern'] {
    if (sessions.length < 5) return 'inconsistent';

    // Analyze session frequency over time
    const recentSessions = sessions.slice(0, 14); // Last 2 weeks
    const olderSessions = sessions.slice(14, 28); // Previous 2 weeks

    const recentFreq = recentSessions.length / 14;
    const olderFreq = olderSessions.length > 0 ? olderSessions.length / 14 : 0;

    // Analyze quality trends
    const recentQuality = recentSessions.reduce((sum, s) => sum + s.quality, 0) / recentSessions.length;
    const olderQuality = olderSessions.length > 0 
      ? olderSessions.reduce((sum, s) => sum + s.quality, 0) / olderSessions.length 
      : recentQuality;

    if (recentFreq > olderFreq * 1.2 && recentQuality > olderQuality) {
      return 'steadily_improving';
    } else if (recentFreq < olderFreq * 0.8 && recentQuality < olderQuality) {
      return 'declining';
    } else if (Math.abs(recentFreq - olderFreq) < 0.1 && Math.abs(recentQuality - olderQuality) < 0.3) {
      return 'plateauing';
    } else if (this.hasLargeVariations(sessions)) {
      return 'sporadic_bursts';
    }

    return 'inconsistent';
  }

  private analyzePatternFactors(sessions: any[], moods: any[]) {
    const recentSessions = sessions.slice(0, 14);
    const olderSessions = sessions.slice(14, 28);

    return {
      sessionFrequency: (recentSessions.length > olderSessions.length ? 'increasing' : 
                       recentSessions.length < olderSessions.length ? 'decreasing' : 'stable') as 'increasing' | 'stable' | 'decreasing',
      sessionQuality: this.calculateQualityTrend(recentSessions, olderSessions),
      consistency: this.calculateConsistencyTrend(sessions),
      engagement: this.calculateEngagementLevel(sessions, moods)
    };
  }

  private generatePatternRecommendations(
    pattern: ProgressPattern['pattern'], 
    factors: ProgressPattern['factors']
  ): ProgressPattern['recommendations'] {
    const recommendations = {
      immediate: [] as string[],
      strategic: [] as string[],
      support: [] as string[]
    };

    switch (pattern) {
      case 'steadily_improving':
        recommendations.immediate.push('Pertahankan momentum yang excellent ini!');
        recommendations.strategic.push('Consider deepening practice dengan teknik advanced');
        recommendations.support.push('Share progress dengan community untuk inspiration');
        break;

      case 'declining':
        recommendations.immediate.push('Gentle return dengan session pendek 5-10 menit');
        recommendations.strategic.push('Reassess goals dan ekspektasi untuk sustainability');
        recommendations.support.push('Connect dengan meditation buddy untuk accountability');
        break;

      case 'plateauing':
        recommendations.immediate.push('Variasikan teknik untuk refresh the practice');
        recommendations.strategic.push('Set new challenges atau goals untuk growth');
        recommendations.support.push('Explore guided meditations atau workshops');
        break;

      case 'inconsistent':
        recommendations.immediate.push('Focus pada micro-habits: 3 menit daily');
        recommendations.strategic.push('Build routine yang realistic dan sustainable');
        recommendations.support.push('Use reminders dan tracking untuk consistency');
        break;

      case 'sporadic_bursts':
        recommendations.immediate.push('Balance intensive periods dengan regular practice');
        recommendations.strategic.push('Create sustainable rhythm yang prevents burnout');
        recommendations.support.push('Learn to maintain momentum between bursts');
        break;
    }

    return recommendations;
  }

  private createNewUserPattern(userId: string): ProgressPattern {
    return {
      userId,
      pattern: 'inconsistent',
      confidence: 0.3,
      duration: 0,
      factors: {
        sessionFrequency: 'stable',
        sessionQuality: 'stable',
        consistency: 'building',
        engagement: 'high'
      },
      recommendations: {
        immediate: ['Start dengan session pendek 5 menit', 'Set daily reminder'],
        strategic: ['Build habit sebelum focus pada duration', 'Explore berbagai teknik'],
        support: ['Join beginner-friendly community', 'Use guided meditations']
      },
      nextCheckDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };
  }

  private calculatePatternConfidence(sessionCount: number, factors: any): number {
    let confidence = 0.3; // Base confidence
    
    if (sessionCount >= 20) confidence += 0.3;
    if (sessionCount >= 50) confidence += 0.2;
    if (sessionCount >= 100) confidence += 0.2;
    
    return Math.min(0.9, confidence);
  }

  private calculatePatternDuration(sessions: any[]): number {
    if (sessions.length < 2) return 0;
    
    const firstSession = new Date(sessions[sessions.length - 1].date);
    const lastSession = new Date(sessions[0].date);
    
    return Math.floor((lastSession.getTime() - firstSession.getTime()) / (1000 * 60 * 60 * 24));
  }

  private hasLargeVariations(sessions: any[]): boolean {
    // Check for periods of high activity followed by low activity
    const weeklyData: { [week: string]: number } = {};
    
    sessions.forEach(session => {
      const sessionDate = session.createdAt;
      const weekKey = this.getWeekKey(sessionDate);
      weeklyData[weekKey] = (weeklyData[weekKey] || 0) + 1;
    });

    const counts = Object.values(weeklyData);
    const avg = counts.reduce((sum, count) => sum + count, 0) / counts.length;
    const variance = counts.reduce((sum, count) => sum + Math.pow(count - avg, 2), 0) / counts.length;
    
    return Math.sqrt(variance) > avg * 0.8; // High variation if std dev > 80% of mean
  }

  private calculateQualityTrend(recent: any[], older: any[]): 'improving' | 'stable' | 'declining' {
    if (older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, s) => sum + s.quality, 0) / recent.length;
    const olderAvg = older.reduce((sum, s) => sum + s.quality, 0) / older.length;
    
    const diff = recentAvg - olderAvg;
    
    if (diff > 0.3) return 'improving';
    if (diff < -0.3) return 'declining';
    return 'stable';
  }

  private calculateConsistencyTrend(sessions: any[]): 'building' | 'maintaining' | 'losing' {
    const recent14 = sessions.slice(0, 14);
    const prev14 = sessions.slice(14, 28);
    
    const recentDays = new Set(recent14.map(s => new Date(s.date).toDateString())).size;
    const prevDays = prev14.length > 0 ? new Set(prev14.map(s => new Date(s.date).toDateString())).size : 0;
    
    if (recentDays > prevDays) return 'building';
    if (recentDays < prevDays * 0.8) return 'losing';
    return 'maintaining';
  }

  private calculateEngagementLevel(sessions: any[], moods: any[]): 'high' | 'medium' | 'low' {
    const hasRecentActivity = sessions.length > 0 && 
      (Date.now() - new Date(sessions[0].date).getTime()) < (7 * 24 * 60 * 60 * 1000);
    
    const avgQuality = sessions.length > 0 
      ? sessions.reduce((sum, s) => sum + s.quality, 0) / sessions.length 
      : 0;
    
    const hasMoodTracking = moods.length > 0;
    
    if (hasRecentActivity && avgQuality >= 4 && hasMoodTracking) return 'high';
    if (hasRecentActivity && avgQuality >= 3) return 'medium';
    return 'low';
  }

  private async deliverEncouragementMessage(message: EncouragementMessage): Promise<void> {
    try {
      // Create appropriate notification based on message type
      const notificationType = message.type === 'struggle_support' ? 'mood_low' :
                              message.type === 'consistency_boost' ? 'mood_low' :
                              'stress_detected';

      await smartNotificationService.generateContextualNotification(
        message.userId,
        notificationType
      );

      // Mark as delivered
      const docRef = doc(db, 'encouragement_messages', message.id);
      await updateDoc(docRef, {
        'effectiveness.delivered': true
      });
    } catch (error) {
      console.error('Error delivering encouragement message:', error);
    }
  }

  private async updateUserEncouragementProfile(
    userId: string, 
    updates: Partial<UserEncouragementProfile>
  ): Promise<void> {
    try {
      const q = query(
        collection(db, 'encouragement_profiles'),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const docRef = doc(db, 'encouragement_profiles', snapshot.docs[0].id);
        await updateDoc(docRef, {
          ...updates,
          lastUpdated: Timestamp.fromDate(new Date())
        });
      }
    } catch (error) {
      console.error('Error updating encouragement profile:', error);
    }
  }

  private async updateUserEngagementStats(messageId: string, rating: number): Promise<void> {
    // Update user's engagement statistics based on message feedback
    // This would track how well the encouragement system is working for the user
    console.log(`Updating engagement stats for message ${messageId} with rating ${rating}`);
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

  private async getRecentAchievements(userId: string): Promise<string[]> {
    // Would fetch recent achievements
    return [];
  }

  private getPreferredTechniques(sessions: any[]): string[] {
    if (sessions.length === 0) return [];
    
    const techniqueCount: { [key: string]: number } = {};
    sessions.forEach(session => {
      session.techniques.forEach((technique: string) => {
        techniqueCount[technique] = (techniqueCount[technique] || 0) + 1;
      });
    });

    return Object.entries(techniqueCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([technique]) => technique);
  }

  private async getLastSession(userId: string): Promise<any | null> {
    const sessions = await progressService.getMeditationSessions(userId, 1);
    return sessions[0] || null;
  }

  private getWeekStart(date: Date): Date {
    const weekStart = new Date(date);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1); // Monday
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  private getWeekKey(date: Date): string {
    const year = date.getFullYear();
    const week = this.getWeekNumber(date);
    return `${year}-W${week}`;
  }
}

export const encouragementService = EncouragementService.getInstance();