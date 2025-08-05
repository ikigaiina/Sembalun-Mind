import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface MeditationSession {
  id: string;
  userId: string;
  type: 'breathing' | 'mindfulness' | 'sleep' | 'focus' | 'body_scan' | 'loving_kindness';
  duration: number; // in minutes
  completed: boolean;
  mood_before?: 'very_bad' | 'bad' | 'neutral' | 'good' | 'very_good';
  mood_after?: 'very_bad' | 'bad' | 'neutral' | 'good' | 'very_good';
  focus_level?: number; // 1-10
  calmness_level?: number; // 1-10
  energy_level?: number; // 1-10
  notes?: string;
  goals_achieved?: string[];
  interruptions?: number;
  location?: string;
  weather?: string;
  time_of_day: 'morning' | 'afternoon' | 'evening' | 'night';
  created_at: Timestamp;
  completed_at?: Timestamp;
}

export interface UserProgress {
  userId: string;
  total_sessions: number;
  total_minutes: number;
  current_streak: number;
  longest_streak: number;
  last_session_date?: Timestamp;
  weekly_goal: number; // sessions per week
  daily_goal: number; // minutes per day
  favorite_session_type?: string;
  average_session_duration: number;
  mood_trend: number; // -2 to +2, based on mood changes
  consistency_score: number; // 0-100
  achievements: string[];
  milestones: {
    sessions_completed: number[];
    total_minutes: number[];
    streak_days: number[];
  };
  weekly_stats: {
    week_start: Timestamp;
    sessions: number;
    minutes: number;
    average_mood: number;
    consistency: number;
  }[];
  monthly_stats: {
    month: string; // YYYY-MM format
    sessions: number;
    minutes: number;
    streak_days: number;
    mood_improvement: number;
  }[];
  updated_at: Timestamp;
}

export interface ProgressAnalytics {
  daily_patterns: {
    [hour: string]: {
      sessions: number;
      average_duration: number;
      average_mood_improvement: number;
    };
  };
  weekly_patterns: {
    [day: string]: {
      sessions: number;
      average_duration: number;
      preferred_types: string[];
    };
  };
  session_effectiveness: {
    type: string;
    average_mood_improvement: number;
    completion_rate: number;
    average_focus: number;
    average_calmness: number;
  }[];
  mood_correlation: {
    weather?: { sunny: number; cloudy: number; rainy: number; };
    time_of_day: { morning: number; afternoon: number; evening: number; night: number; };
    session_type: { [type: string]: number };
  };
  goal_achievement: {
    weekly_goal_success_rate: number;
    daily_goal_success_rate: number;
    streak_consistency: number;
  };
}

class ProgressTrackingService {
  private readonly SESSIONS_COLLECTION = 'meditation_sessions';
  private readonly PROGRESS_COLLECTION = 'user_progress';

  // Record a new meditation session
  async recordSession(sessionData: Omit<MeditationSession, 'id' | 'created_at'>): Promise<string> {
    try {
      const sessionId = doc(collection(db, this.SESSIONS_COLLECTION)).id;
      const session: MeditationSession = {
        ...sessionData,
        id: sessionId,
        created_at: Timestamp.now()
      };

      await setDoc(doc(db, this.SESSIONS_COLLECTION, sessionId), session);
      
      // Update user progress
      await this.updateUserProgress(sessionData.userId, session);
      
      return sessionId;
    } catch (error) {
      console.error('Error recording session:', error);
      throw new Error('Failed to record meditation session');
    }
  }

  // Complete a session (update completion status and post-session data)
  async completeSession(
    sessionId: string, 
    completionData: {
      mood_after?: MeditationSession['mood_after'];
      focus_level?: number;
      calmness_level?: number;
      energy_level?: number;
      notes?: string;
      goals_achieved?: string[];
      interruptions?: number;
    }
  ): Promise<void> {
    try {
      const sessionRef = doc(db, this.SESSIONS_COLLECTION, sessionId);
      const sessionDoc = await getDoc(sessionRef);
      
      if (!sessionDoc.exists()) {
        throw new Error('Session not found');
      }

      const updates = {
        ...completionData,
        completed: true,
        completed_at: Timestamp.now()
      };

      await updateDoc(sessionRef, updates);

      // Update progress with completion
      const session = { ...sessionDoc.data(), ...updates } as MeditationSession;
      await this.updateUserProgress(session.userId, session);
    } catch (error) {
      console.error('Error completing session:', error);
      throw new Error('Failed to complete session');
    }
  }

  // Update user progress after a session
  private async updateUserProgress(userId: string, session: MeditationSession): Promise<void> {
    const progressRef = doc(db, this.PROGRESS_COLLECTION, userId);
    const progressDoc = await getDoc(progressRef);

    let progress: UserProgress;
    
    if (!progressDoc.exists()) {
      // Create new progress record
      progress = {
        userId,
        total_sessions: 0,
        total_minutes: 0,
        current_streak: 0,
        longest_streak: 0,
        weekly_goal: 5,
        daily_goal: 10,
        average_session_duration: 0,
        mood_trend: 0,
        consistency_score: 0,
        achievements: [],
        milestones: {
          sessions_completed: [],
          total_minutes: [],
          streak_days: []
        },
        weekly_stats: [],
        monthly_stats: [],
        updated_at: Timestamp.now()
      };
    } else {
      progress = progressDoc.data() as UserProgress;
    }

    // Update basic stats
    if (session.completed) {
      progress.total_sessions += 1;
      progress.total_minutes += session.duration;
      progress.average_session_duration = progress.total_minutes / progress.total_sessions;
      
      // Update streak
      const now = new Date();
      const lastSession = progress.last_session_date?.toDate();
      
      if (lastSession) {
        const daysDiff = Math.floor((now.getTime() - lastSession.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          // Consecutive day
          progress.current_streak += 1;
        } else if (daysDiff > 1) {
          // Streak broken
          progress.current_streak = 1;
        }
        // Same day = no change to streak
      } else {
        // First session
        progress.current_streak = 1;
      }
      
      progress.longest_streak = Math.max(progress.longest_streak, progress.current_streak);
      progress.last_session_date = session.completed_at || session.created_at;

      // Calculate mood trend
      if (session.mood_before && session.mood_after) {
        const moodValues = { very_bad: 1, bad: 2, neutral: 3, good: 4, very_good: 5 };
        const moodImprovement = moodValues[session.mood_after] - moodValues[session.mood_before];
        
        // Exponential moving average for mood trend
        progress.mood_trend = progress.mood_trend * 0.9 + moodImprovement * 0.1;
      }

      // Update session type preference
      const sessionTypes = await this.getUserSessionTypes(userId);
      const mostFrequentType = Object.entries(sessionTypes)
        .sort(([,a], [,b]) => b - a)[0]?.[0];
      progress.favorite_session_type = mostFrequentType;

      // Check for milestones and achievements
      await this.checkAchievements(progress);
    }

    // Calculate consistency score
    progress.consistency_score = await this.calculateConsistencyScore(userId);
    
    progress.updated_at = Timestamp.now();
    
    await setDoc(progressRef, progress);
  }

  // Get user progress
  async getUserProgress(userId: string): Promise<UserProgress | null> {
    try {
      const progressDoc = await getDoc(doc(db, this.PROGRESS_COLLECTION, userId));
      return progressDoc.exists() ? progressDoc.data() as UserProgress : null;
    } catch (error) {
      console.error('Error getting user progress:', error);
      throw new Error('Failed to get user progress');
    }
  }

  // Get user sessions with filtering
  async getUserSessions(
    userId: string, 
    options: {
      limit?: number;
      startDate?: Date;
      endDate?: Date;
      sessionType?: string;
      completed?: boolean;
    } = {}
  ): Promise<MeditationSession[]> {
    try {
      let q = query(
        collection(db, this.SESSIONS_COLLECTION),
        where('userId', '==', userId),
        orderBy('created_at', 'desc')
      );

      if (options.sessionType) {
        q = query(q, where('type', '==', options.sessionType));
      }

      if (options.completed !== undefined) {
        q = query(q, where('completed', '==', options.completed));
      }

      const snapshot = await getDocs(q);
      let sessions = snapshot.docs.map(doc => doc.data() as MeditationSession);

      // Filter by date range if provided
      if (options.startDate || options.endDate) {
        sessions = sessions.filter(session => {
          const sessionDate = session.created_at.toDate();
          if (options.startDate && sessionDate < options.startDate) return false;
          if (options.endDate && sessionDate > options.endDate) return false;
          return true;
        });
      }

      // Apply limit
      if (options.limit) {
        sessions = sessions.slice(0, options.limit);
      }

      return sessions;
    } catch (error) {
      console.error('Error getting user sessions:', error);
      throw new Error('Failed to get user sessions');
    }
  }

  // Generate comprehensive analytics
  async generateAnalytics(userId: string): Promise<ProgressAnalytics> {
    try {
      const sessions = await this.getUserSessions(userId);
      
      const analytics: ProgressAnalytics = {
        daily_patterns: {},
        weekly_patterns: {},
        session_effectiveness: [],
        mood_correlation: {
          time_of_day: { morning: 0, afternoon: 0, evening: 0, night: 0 },
          session_type: { breathing: 0, meditation: 0, mindfulness: 0 }
        },
        goal_achievement: {
          weekly_goal_success_rate: 0,
          daily_goal_success_rate: 0,
          streak_consistency: 0
        }
      };

      // Analyze daily patterns
      const hourlyData: { [hour: string]: { sessions: number; total_duration: number; mood_improvements: number[]; } } = {};
      
      sessions.forEach(session => {
        const hour = session.created_at.toDate().getHours().toString();
        
        if (!hourlyData[hour]) {
          hourlyData[hour] = { sessions: 0, total_duration: 0, mood_improvements: [] };
        }
        
        hourlyData[hour].sessions += 1;
        hourlyData[hour].total_duration += session.duration;
        
        if (session.mood_before && session.mood_after) {
          const moodValues = { very_bad: 1, bad: 2, neutral: 3, good: 4, very_good: 5 };
          const improvement = moodValues[session.mood_after] - moodValues[session.mood_before];
          hourlyData[hour].mood_improvements.push(improvement);
        }
      });

      // Convert to analytics format
      Object.entries(hourlyData).forEach(([hour, data]) => {
        analytics.daily_patterns[hour] = {
          sessions: data.sessions,
          average_duration: data.total_duration / data.sessions,
          average_mood_improvement: data.mood_improvements.length > 0 
            ? data.mood_improvements.reduce((sum, imp) => sum + imp, 0) / data.mood_improvements.length 
            : 0
        };
      });

      // Analyze weekly patterns
      const weeklyData: { [day: string]: { sessions: number; total_duration: number; types: string[]; } } = {};
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      sessions.forEach(session => {
        const dayName = dayNames[session.created_at.toDate().getDay()];
        
        if (!weeklyData[dayName]) {
          weeklyData[dayName] = { sessions: 0, total_duration: 0, types: [] };
        }
        
        weeklyData[dayName].sessions += 1;
        weeklyData[dayName].total_duration += session.duration;
        weeklyData[dayName].types.push(session.type);
      });

      Object.entries(weeklyData).forEach(([day, data]) => {
        const typeCount: { [type: string]: number } = {};
        data.types.forEach(type => {
          typeCount[type] = (typeCount[type] || 0) + 1;
        });
        
        const preferredTypes = Object.entries(typeCount)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([type]) => type);

        analytics.weekly_patterns[day] = {
          sessions: data.sessions,
          average_duration: data.total_duration / data.sessions,
          preferred_types: preferredTypes
        };
      });

      // Analyze session effectiveness by type
      const typeData: { [type: string]: { 
        mood_improvements: number[]; 
        completions: number; 
        total: number;
        focus_levels: number[];
        calmness_levels: number[];
      } } = {};

      sessions.forEach(session => {
        if (!typeData[session.type]) {
          typeData[session.type] = { 
            mood_improvements: [], 
            completions: 0, 
            total: 0,
            focus_levels: [],
            calmness_levels: []
          };
        }
        
        typeData[session.type].total += 1;
        if (session.completed) typeData[session.type].completions += 1;
        
        if (session.mood_before && session.mood_after) {
          const moodValues = { very_bad: 1, bad: 2, neutral: 3, good: 4, very_good: 5 };
          const improvement = moodValues[session.mood_after] - moodValues[session.mood_before];
          typeData[session.type].mood_improvements.push(improvement);
        }
        
        if (session.focus_level) typeData[session.type].focus_levels.push(session.focus_level);
        if (session.calmness_level) typeData[session.type].calmness_levels.push(session.calmness_level);
      });

      analytics.session_effectiveness = Object.entries(typeData).map(([type, data]) => ({
        type,
        average_mood_improvement: data.mood_improvements.length > 0 
          ? data.mood_improvements.reduce((sum, imp) => sum + imp, 0) / data.mood_improvements.length 
          : 0,
        completion_rate: data.completions / data.total,
        average_focus: data.focus_levels.length > 0 
          ? data.focus_levels.reduce((sum, focus) => sum + focus, 0) / data.focus_levels.length 
          : 0,
        average_calmness: data.calmness_levels.length > 0 
          ? data.calmness_levels.reduce((sum, calm) => sum + calm, 0) / data.calmness_levels.length 
          : 0
      }));

      // Analyze mood correlation with time of day
      const timeOfDayMood: { [time: string]: number[] } = {
        morning: [], afternoon: [], evening: [], night: []
      };

      sessions.forEach(session => {
        if (session.mood_before && session.mood_after) {
          const moodValues = { very_bad: 1, bad: 2, neutral: 3, good: 4, very_good: 5 };
          const improvement = moodValues[session.mood_after] - moodValues[session.mood_before];
          timeOfDayMood[session.time_of_day].push(improvement);
        }
      });

      Object.entries(timeOfDayMood).forEach(([timeOfDay, improvements]) => {
        analytics.mood_correlation.time_of_day[timeOfDay as keyof typeof analytics.mood_correlation.time_of_day] = 
          improvements.length > 0 
            ? improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length 
            : 0;
      });

      return analytics;
    } catch (error) {
      console.error('Error generating analytics:', error);
      throw new Error('Failed to generate analytics');
    }
  }

  // Helper methods
  private async getUserSessionTypes(userId: string): Promise<{ [type: string]: number }> {
    const sessions = await this.getUserSessions(userId);
    const typeCounts: { [type: string]: number } = {};
    
    sessions.forEach(session => {
      typeCounts[session.type] = (typeCounts[session.type] || 0) + 1;
    });
    
    return typeCounts;
  }

  private async calculateConsistencyScore(userId: string): Promise<number> {
    const sessions = await this.getUserSessions(userId, { limit: 30 }); // Last 30 sessions
    if (sessions.length === 0) return 0;

    // Calculate based on regularity of sessions
    const dates = sessions.map(s => s.created_at.toDate().toDateString());
    const uniqueDates = new Set(dates);
    
    // Score based on unique session days vs total possible days
    const dayRange = Math.max(1, Math.ceil((new Date().getTime() - sessions[sessions.length - 1].created_at.toDate().getTime()) / (1000 * 60 * 60 * 24)));
    return Math.min(100, (uniqueDates.size / dayRange) * 100);
  }

  private async checkAchievements(progress: UserProgress): Promise<void> {
    const newAchievements: string[] = [];

    // Session milestones
    const sessionMilestones = [1, 5, 10, 25, 50, 100, 250, 500, 1000];
    sessionMilestones.forEach(milestone => {
      if (progress.total_sessions >= milestone && !progress.milestones.sessions_completed.includes(milestone)) {
        progress.milestones.sessions_completed.push(milestone);
        newAchievements.push(`completed_${milestone}_sessions`);
      }
    });

    // Time milestones (in minutes)
    const timeMilestones = [60, 300, 600, 1200, 3000, 6000, 12000]; // 1hr, 5hr, 10hr, 20hr, 50hr, 100hr, 200hr
    timeMilestones.forEach(milestone => {
      if (progress.total_minutes >= milestone && !progress.milestones.total_minutes.includes(milestone)) {
        progress.milestones.total_minutes.push(milestone);
        newAchievements.push(`meditated_${milestone}_minutes`);
      }
    });

    // Streak milestones
    const streakMilestones = [3, 7, 14, 30, 60, 100, 365];
    streakMilestones.forEach(milestone => {
      if (progress.current_streak >= milestone && !progress.milestones.streak_days.includes(milestone)) {
        progress.milestones.streak_days.push(milestone);
        newAchievements.push(`streak_${milestone}_days`);
      }
    });

    // Add new achievements
    progress.achievements = [...progress.achievements, ...newAchievements];
  }

  // Export user data
  async exportUserData(userId: string): Promise<{ progress: UserProgress; sessions: MeditationSession[]; analytics: ProgressAnalytics; }> {
    try {
      const [progress, sessions, analytics] = await Promise.all([
        this.getUserProgress(userId),
        this.getUserSessions(userId),
        this.generateAnalytics(userId)
      ]);

      return {
        progress: progress!,
        sessions,
        analytics
      };
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw new Error('Failed to export user data');
    }
  }
}

export const progressTrackingService = new ProgressTrackingService();