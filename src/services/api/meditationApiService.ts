import { supabase } from '../../config/supabaseClient';
import { userApiService } from './userApiService';

export interface MeditationSession {
  id: string;
  user_id: string;
  type: 'breathing' | 'guided' | 'silent' | 'walking';
  duration_minutes: number;
  completed_at: string;
  mood_before?: string;
  mood_after?: string;
  notes?: string;
  quality_rating?: number; // 1-5 scale
  focus_level?: number; // 1-5 scale
  relaxation_level?: number; // 1-5 scale
  created_at: string;
  updated_at: string;
}

export interface SessionPreferences {
  preferredTypes: string[];
  preferredDurations: number[];
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  backgroundSounds: boolean;
  guidanceLevel: 'minimal' | 'moderate' | 'detailed';
  reminderFrequency: 'daily' | 'weekly' | 'custom';
}

export interface SessionAnalytics {
  totalSessions: number;
  totalMinutes: number;
  averageRating: number;
  averageFocus: number;
  averageRelaxation: number;
  favoriteType: string;
  favoriteTime: string;
  consistencyScore: number;
  moodImprovement: number;
  weeklyProgress: WeeklyProgress[];
  typeDistribution: { type: string; count: number; percentage: number }[];
}

export interface WeeklyProgress {
  week: string;
  sessions: number;
  minutes: number;
  averageRating: number;
  streak: number;
}

export interface SessionInsights {
  recommendations: string[];
  patterns: SessionPattern[];
  achievements: string[];
  nextMilestones: Milestone[];
}

export interface SessionPattern {
  type: 'time' | 'mood' | 'duration' | 'quality';
  description: string;
  trend: 'improving' | 'declining' | 'stable';
  confidence: number;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  progress: number;
  estimatedCompletion: string;
}

export interface ActiveSession {
  id: string;
  userId: string;
  type: string;
  startedAt: string;
  plannedDuration: number;
  isActive: boolean;
  pausedAt?: string;
  totalPausedTime: number;
  currentPhase: 'preparation' | 'session' | 'completion';
  heartRate?: number[];
  backgroundSound?: string;
  guidanceLevel: string;
}

export class MeditationApiService {
  private static instance: MeditationApiService;
  private activeSessions: Map<string, ActiveSession> = new Map();

  static getInstance(): MeditationApiService {
    if (!MeditationApiService.instance) {
      MeditationApiService.instance = new MeditationApiService();
    }
    return MeditationApiService.instance;
  }

  // Session Management
  async createSession(sessionData: Omit<MeditationSession, 'id' | 'created_at' | 'updated_at'>): Promise<{ session: MeditationSession | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('meditation_sessions')
        .insert([{
          ...sessionData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Update user progress
      await this.updateUserProgress(sessionData.user_id, data);

      return { session: data, error: null };
    } catch (error) {
      console.error('Error creating meditation session:', error);
      return { session: null, error };
    }
  }

  async getUserSessions(userId: string, limit: number = 50, offset: number = 0): Promise<{ sessions: MeditationSession[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('meditation_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return { sessions: data || [], error: null };
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      return { sessions: [], error };
    }
  }

  async getSession(sessionId: string): Promise<{ session: MeditationSession | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('meditation_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) throw error;

      return { session: data, error: null };
    } catch (error) {
      console.error('Error fetching session:', error);
      return { session: null, error };
    }
  }

  async updateSession(sessionId: string, updates: Partial<MeditationSession>): Promise<{ session: MeditationSession | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('meditation_sessions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;

      return { session: data, error: null };
    } catch (error) {
      console.error('Error updating session:', error);
      return { session: null, error };
    }
  }

  async deleteSession(sessionId: string): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase
        .from('meditation_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting session:', error);
      return { success: false, error };
    }
  }

  // Active Session Management
  async startSession(userId: string, type: string, plannedDuration: number, preferences: Partial<SessionPreferences> = {}): Promise<{ session: ActiveSession | null; error: any }> {
    try {
      const sessionId = `active_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const activeSession: ActiveSession = {
        id: sessionId,
        userId,
        type,
        startedAt: new Date().toISOString(),
        plannedDuration,
        isActive: true,
        totalPausedTime: 0,
        currentPhase: 'preparation',
        guidanceLevel: preferences.guidanceLevel || 'moderate'
      };

      this.activeSessions.set(sessionId, activeSession);

      // Store in database for persistence
      const { error } = await supabase
        .from('active_sessions')
        .insert([activeSession]);

      if (error) {
        console.error('Warning: Could not persist active session:', error);
        // Continue anyway, session is still tracked in memory
      }

      return { session: activeSession, error: null };
    } catch (error) {
      console.error('Error starting session:', error);
      return { session: null, error };
    }
  }

  async pauseSession(sessionId: string): Promise<{ success: boolean; error: any }> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error('Active session not found');
      }

      session.pausedAt = new Date().toISOString();
      session.isActive = false;

      this.activeSessions.set(sessionId, session);

      return { success: true, error: null };
    } catch (error) {
      console.error('Error pausing session:', error);
      return { success: false, error };
    }
  }

  async resumeSession(sessionId: string): Promise<{ success: boolean; error: any }> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session || !session.pausedAt) {
        throw new Error('Session not found or not paused');
      }

      const pausedDuration = new Date().getTime() - new Date(session.pausedAt).getTime();
      session.totalPausedTime += pausedDuration;
      session.pausedAt = undefined;
      session.isActive = true;

      this.activeSessions.set(sessionId, session);

      return { success: true, error: null };
    } catch (error) {
      console.error('Error resuming session:', error);
      return { success: false, error };
    }
  }

  async completeSession(sessionId: string, completion: {
    moodBefore?: string;
    moodAfter?: string;
    qualityRating?: number;
    focusLevel?: number;
    relaxationLevel?: number;
    notes?: string;
  }): Promise<{ session: MeditationSession | null; error: any }> {
    try {
      const activeSession = this.activeSessions.get(sessionId);
      if (!activeSession) {
        throw new Error('Active session not found');
      }

      const actualDuration = Math.round(
        (new Date().getTime() - new Date(activeSession.startedAt).getTime() - activeSession.totalPausedTime) / (1000 * 60)
      );

      const sessionData: Omit<MeditationSession, 'id' | 'created_at' | 'updated_at'> = {
        user_id: activeSession.userId,
        type: activeSession.type as any,
        duration_minutes: actualDuration,
        completed_at: new Date().toISOString(),
        mood_before: completion.moodBefore,
        mood_after: completion.moodAfter,
        quality_rating: completion.qualityRating,
        focus_level: completion.focusLevel,
        relaxation_level: completion.relaxationLevel,
        notes: completion.notes
      };

      const { session, error } = await this.createSession(sessionData);

      if (!error) {
        // Clean up active session
        this.activeSessions.delete(sessionId);
        await supabase.from('active_sessions').delete().eq('id', sessionId);
      }

      return { session, error };
    } catch (error) {
      console.error('Error completing session:', error);
      return { session: null, error };
    }
  }

  getActiveSession(sessionId: string): ActiveSession | null {
    return this.activeSessions.get(sessionId) || null;
  }

  getUserActiveSessions(userId: string): ActiveSession[] {
    return Array.from(this.activeSessions.values()).filter(session => session.userId === userId);
  }

  // Analytics & Insights
  async getSessionAnalytics(userId: string, period: 'week' | 'month' | 'year' | 'all' = 'month'): Promise<{ analytics: SessionAnalytics | null; error: any }> {
    try {
      let dateFilter = '';
      const now = new Date();

      switch (period) {
        case 'week': {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateFilter = weekAgo.toISOString();
          break;
        }
        case 'month': {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          dateFilter = monthAgo.toISOString();
          break;
        }
        case 'year': {
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          dateFilter = yearAgo.toISOString();
          break;
        }
        default: {
          dateFilter = '';
        }
      }

      let query = supabase
        .from('meditation_sessions')
        .select('*')
        .eq('user_id', userId);

      if (dateFilter) {
        query = query.gte('completed_at', dateFilter);
      }

      const { data: sessions, error } = await query.order('completed_at', { ascending: false });

      if (error) throw error;

      if (!sessions || sessions.length === 0) {
        return {
          analytics: {
            totalSessions: 0,
            totalMinutes: 0,
            averageRating: 0,
            averageFocus: 0,
            averageRelaxation: 0,
            favoriteType: '',
            favoriteTime: '',
            consistencyScore: 0,
            moodImprovement: 0,
            weeklyProgress: [],
            typeDistribution: []
          },
          error: null
        };
      }

      // Calculate analytics
      const totalSessions = sessions.length;
      const totalMinutes = sessions.reduce((sum, s) => sum + s.duration_minutes, 0);
      
      const ratingSessions = sessions.filter(s => s.quality_rating);
      const averageRating = ratingSessions.length > 0 
        ? ratingSessions.reduce((sum, s) => sum + (s.quality_rating || 0), 0) / ratingSessions.length
        : 0;

      const focusSessions = sessions.filter(s => s.focus_level);
      const averageFocus = focusSessions.length > 0
        ? focusSessions.reduce((sum, s) => sum + (s.focus_level || 0), 0) / focusSessions.length
        : 0;

      const relaxationSessions = sessions.filter(s => s.relaxation_level);
      const averageRelaxation = relaxationSessions.length > 0
        ? relaxationSessions.reduce((sum, s) => sum + (s.relaxation_level || 0), 0) / relaxationSessions.length
        : 0;

      // Type distribution
      const typeCount: { [key: string]: number } = {};
      sessions.forEach(session => {
        typeCount[session.type] = (typeCount[session.type] || 0) + 1;
      });

      const typeDistribution = Object.entries(typeCount)
        .map(([type, count]) => ({
          type,
          count,
          percentage: Math.round((count / totalSessions) * 100)
        }))
        .sort((a, b) => b.count - a.count);

      const favoriteType = typeDistribution[0]?.type || '';

      // Time analysis
      const timeCount: { [key: string]: number } = {};
      sessions.forEach(session => {
        const hour = new Date(session.completed_at).getHours();
        let timeSlot: string;
        if (hour < 6) timeSlot = 'night';
        else if (hour < 12) timeSlot = 'morning';
        else if (hour < 18) timeSlot = 'afternoon';
        else timeSlot = 'evening';
        
        timeCount[timeSlot] = (timeCount[timeSlot] || 0) + 1;
      });

      const favoriteTime = Object.entries(timeCount)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

      // Consistency score (sessions per week)
      const weeksInPeriod = period === 'week' ? 1 : period === 'month' ? 4 : period === 'year' ? 52 : Math.ceil(totalSessions / 7);
      const consistencyScore = Math.min(100, Math.round((totalSessions / weeksInPeriod) * 20));

      // Mood improvement
      const moodSessions = sessions.filter(s => s.mood_before && s.mood_after);
      let moodImprovement = 0;
      if (moodSessions.length > 0) {
        const moodValues: { [key: string]: number } = {
          'very_sad': 1, 'sad': 2, 'neutral': 3, 'happy': 4, 'very_happy': 5
        };
        
        const improvements = moodSessions.map(s => {
          const before = moodValues[s.mood_before!] || 3;
          const after = moodValues[s.mood_after!] || 3;
          return after - before;
        });

        moodImprovement = Math.round(
          (improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length) * 100
        ) / 100;
      }

      // Weekly progress
      const weeklyProgress = this.calculateWeeklyProgress(sessions);

      const analytics: SessionAnalytics = {
        totalSessions,
        totalMinutes,
        averageRating: Math.round(averageRating * 10) / 10,
        averageFocus: Math.round(averageFocus * 10) / 10,
        averageRelaxation: Math.round(averageRelaxation * 10) / 10,
        favoriteType,
        favoriteTime,
        consistencyScore,
        moodImprovement,
        weeklyProgress,
        typeDistribution
      };

      return { analytics, error: null };
    } catch (error) {
      console.error('Error getting session analytics:', error);
      return { analytics: null, error };
    }
  }

  async getSessionInsights(userId: string): Promise<{ insights: SessionInsights | null; error: any }> {
    try {
      const { analytics, error: analyticsError } = await this.getSessionAnalytics(userId, 'month');
      if (analyticsError || !analytics) {
        throw new Error('Could not get analytics for insights');
      }

      const recommendations: string[] = [];
      const patterns: SessionPattern[] = [];
      const achievements: string[] = [];
      const nextMilestones: Milestone[] = [];

      // Generate recommendations
      if (analytics.averageRating < 3) {
        recommendations.push('Coba eksperimen dengan teknik meditasi yang berbeda untuk meningkatkan kualitas sesi Anda');
      }

      if (analytics.consistencyScore < 50) {
        recommendations.push('Tetapkan pengingat harian untuk meningkatkan konsistensi latihan meditasi');
      }

      if (analytics.favoriteTime === 'night' && analytics.averageRating < 4) {
        recommendations.push('Coba bermeditasi di pagi atau sore hari untuk hasil yang lebih optimal');
      }

      // Identify patterns
      if (analytics.weeklyProgress.length >= 4) {
        const recentWeeks = analytics.weeklyProgress.slice(-4);
        const sessionTrend = this.calculateTrend(recentWeeks.map(w => w.sessions));
        
        patterns.push({
          type: 'time',
          description: `Frekuensi sesi meditasi Anda menunjukkan tren ${sessionTrend === 'improving' ? 'meningkat' : sessionTrend === 'declining' ? 'menurun' : 'stabil'}`,
          trend: sessionTrend,
          confidence: 0.8
        });
      }

      // Check achievements
      if (analytics.totalSessions >= 7) {
        achievements.push('Konsisten 7 hari berturut-turut');
      }
      if (analytics.totalSessions >= 30) {
        achievements.push('Mencapai 30 sesi meditasi');
      }
      if (analytics.totalMinutes >= 300) {
        achievements.push('Total 5 jam meditasi');
      }

      // Generate milestones
      const nextSessionMilestone = Math.ceil(analytics.totalSessions / 10) * 10;
      nextMilestones.push({
        id: 'sessions',
        title: `${nextSessionMilestone} Sesi Meditasi`,
        description: `Capai ${nextSessionMilestone} sesi meditasi total`,
        target: nextSessionMilestone,
        current: analytics.totalSessions,
        progress: (analytics.totalSessions / nextSessionMilestone) * 100,
        estimatedCompletion: this.estimateCompletion(
          nextSessionMilestone - analytics.totalSessions,
          analytics.consistencyScore / 20 // sessions per week
        )
      });

      const insights: SessionInsights = {
        recommendations,
        patterns,
        achievements,
        nextMilestones
      };

      return { insights, error: null };
    } catch (error) {
      console.error('Error getting session insights:', error);
      return { insights: null, error };
    }
  }

  // Helper methods
  private async updateUserProgress(userId: string, session: MeditationSession): Promise<void> {
    try {
      const { profile } = await userApiService.getUserProfile(userId);
      if (!profile) return;

      const updatedProgress = {
        ...profile.progress,
        total_sessions: profile.progress.total_sessions + 1,
        total_minutes: profile.progress.total_minutes + session.duration_minutes,
        last_session_date: session.completed_at
      };

      // Update streak
      const lastSessionDate = profile.progress.last_session_date 
        ? new Date(profile.progress.last_session_date)
        : null;
      
      const today = new Date(session.completed_at);
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

      if (!lastSessionDate || lastSessionDate.toDateString() === yesterday.toDateString()) {
        updatedProgress.current_streak = profile.progress.current_streak + 1;
        updatedProgress.longest_streak = Math.max(
          profile.progress.longest_streak,
          updatedProgress.current_streak
        );
      } else if (lastSessionDate.toDateString() !== today.toDateString()) {
        updatedProgress.current_streak = 1;
      }

      await userApiService.updateUserProfile(userId, { progress: updatedProgress });
    } catch (error) {
      console.error('Error updating user progress:', error);
    }
  }

  private calculateWeeklyProgress(sessions: MeditationSession[]): WeeklyProgress[] {
    const weeklyData: { [week: string]: WeeklyProgress } = {};

    sessions.forEach(session => {
      const sessionDate = new Date(session.completed_at);
      const weekStart = new Date(sessionDate);
      weekStart.setDate(sessionDate.getDate() - sessionDate.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          week: weekKey,
          sessions: 0,
          minutes: 0,
          averageRating: 0,
          streak: 0
        };
      }

      weeklyData[weekKey].sessions += 1;
      weeklyData[weekKey].minutes += session.duration_minutes;
      
      if (session.quality_rating) {
        const currentAvg = weeklyData[weekKey].averageRating;
        const currentCount = weeklyData[weekKey].sessions;
        weeklyData[weekKey].averageRating = 
          ((currentAvg * (currentCount - 1)) + session.quality_rating) / currentCount;
      }
    });

    return Object.values(weeklyData)
      .sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime())
      .slice(-8); // Last 8 weeks
  }

  private calculateTrend(values: number[]): 'improving' | 'declining' | 'stable' {
    if (values.length < 2) return 'stable';

    const mid = Math.floor(values.length / 2);
    const firstHalf = values.slice(0, mid);
    const secondHalf = values.slice(mid);

    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    const change = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (change > 10) return 'improving';
    if (change < -10) return 'declining';
    return 'stable';
  }

  private estimateCompletion(remaining: number, sessionsPerWeek: number): string {
    if (sessionsPerWeek <= 0) return 'Tidak dapat diprediksi';

    const weeksToComplete = Math.ceil(remaining / sessionsPerWeek);
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + (weeksToComplete * 7));

    return completionDate.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Real-time subscriptions
  subscribeToUserSessions(userId: string, callback: (session: MeditationSession) => void): () => void {
    const subscription = supabase
      .channel('user_sessions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'meditation_sessions',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as MeditationSession);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }
}

export const meditationApiService = MeditationApiService.getInstance();