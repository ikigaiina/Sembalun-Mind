import { typedSupabase as supabase } from '../config/supabase';
import type {
  MeditationSession,
  MoodEntry,
  CairnProgress,
  CourseProgress,
  UserStreak,
  UserInsights,
  UserProgressSummary,
  OfflineDataQueue,
  DataSyncMetadata
} from '../types/progress';

export class ProgressService {
  private static instance: ProgressService;
  private offlineQueue: OfflineDataQueue[] = [];
  private syncListeners: Map<string, () => void> = new Map();

  static getInstance(): ProgressService {
    if (!ProgressService.instance) {
      ProgressService.instance = new ProgressService();
    }
    return ProgressService.instance;
  }

  // Session Management
  async createMeditationSession(session: Omit<MeditationSession, 'id' | 'syncStatus' | 'lastModified' | 'version'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('meditation_sessions')
        .insert({
          user_id: session.userId,
          duration: session.duration,
          quality: session.quality,
          mood_before: session.moodBefore,
          mood_after: session.moodAfter,
          stress_level: session.stressLevel,
          energy_level: session.energyLevel,
          techniques: session.techniques,
          notes: session.notes,
          completed_at: session.completedAt.toISOString(),
          started_at: session.startedAt.toISOString(),
          ended_at: session.endedAt.toISOString(),
          created_at: new Date().toISOString(),
          last_modified: new Date().toISOString(),
          version: 1
        })
        .select('id')
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create session');
      const docRef = data;
      
      // Update user streaks
      await this.updateUserStreaks(session.userId, 'meditation', session.completedAt);
      
      // Update cairn progress
      await this.updateCairnProgress(session.userId, 'sessions', 1);
      await this.updateCairnProgress(session.userId, 'minutes', Math.floor(session.duration / 60));

      return data.id;
    } catch (error) {
      console.error('Error creating meditation session:', error);
      // Add to offline queue if online save fails
      await this.addToOfflineQueue('create', 'session', '', session);
      throw error;
    }
  }

    

  async getSessionStats(userId: string, period: 'week' | 'month' | 'year' = 'month'): Promise<{
    totalSessions: number;
    totalMinutes: number;
    averageQuality: number;
    consistency: number;
  }> {
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const sessions = await this.getMeditationSessions(userId, 1000, startDate);
    
    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, session) => sum + Math.floor(session.duration / 60), 0);
    const averageQuality = sessions.length > 0 
      ? sessions.reduce((sum, session) => sum + session.quality, 0) / sessions.length 
      : 0;
    
    // Calculate consistency (sessions per expected days)
    const daysDiff = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const consistency = Math.min(100, (totalSessions / daysDiff) * 100);

    return {
      totalSessions,
      totalMinutes,
      averageQuality: Math.round(averageQuality * 10) / 10,
      consistency: Math.round(consistency)
    };
  }

  // Mood Tracking
  async createMoodEntry(mood: Omit<MoodEntry, 'id' | 'syncStatus' | 'lastModified' | 'version'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .insert({
          user_id: mood.userId,
          mood_state: mood.moodState,
          timestamp: mood.timestamp.toISOString(),
          notes: mood.notes,
          sync_status: 'synced',
          last_modified: new Date().toISOString(),
          version: 1
        })
        .select('id')
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create mood entry');
      const docRef = data;
      
      // Update mood tracking streak
      await this.updateUserStreaks(mood.userId, 'mood_tracking', mood.timestamp);

      return data.id;
    } catch (error) {
      console.error('Error creating mood entry:', error);
      await this.addToOfflineQueue('create', 'mood', '', mood);
      throw error;
    }
  }

  async getMoodEntries(userId: string, limit_count: number = 100): Promise<MoodEntry[]> {
    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit_count);

      if (error) throw error;

      return data.map(row => ({
        id: row.id,
        userId: row.user_id,
        moodState: row.mood_state,
        timestamp: new Date(row.timestamp),
        notes: row.notes,
        syncStatus: row.sync_status,
        createdAt: new Date(row.created_at),
        lastModified: new Date(row.last_modified),
        version: row.version
      })) as MoodEntry[];
    } catch (error) {
      console.error('Error fetching mood entries:', error);
      return [];
    }
  }

  async getMoodTrends(userId: string, days: number = 30): Promise<{
    [key: string]: { average: number; trend: 'improving' | 'declining' | 'stable'; data: Array<{date: Date, value: number}> }
  }> {
    const moods = await this.getMoodEntries(userId, days * 2); // Get more data for trend calculation
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentMoods = moods.filter(mood => mood.timestamp >= cutoffDate);
    
    const metrics = ['energy', 'stress', 'focus', 'happiness', 'anxiety', 'gratitude'] as const;
    const trends: any = {};

    metrics.forEach(metric => {
      const values = recentMoods.map(mood => mood[metric]).filter(Boolean);
      if (values.length === 0) return;

      const average = values.reduce((sum, val) => sum + val, 0) / values.length;
      
      // Simple trend calculation - compare first half vs second half
      const midpoint = Math.floor(values.length / 2);
      const firstHalf = values.slice(0, midpoint);
      const secondHalf = values.slice(midpoint);
      
      const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
      
      let trend: 'improving' | 'declining' | 'stable' = 'stable';
      const change = secondAvg - firstAvg;
      
      if (metric === 'stress' || metric === 'anxiety') {
        // For negative metrics, declining is improving
        if (change < -0.3) trend = 'improving';
        else if (change > 0.3) trend = 'declining';
      } else {
        // For positive metrics, increasing is improving  
        if (change > 0.3) trend = 'improving';
        else if (change < -0.3) trend = 'declining';
      }

      trends[metric] = {
        average: Math.round(average * 10) / 10,
        trend,
        data: recentMoods.map(mood => ({
          date: mood.timestamp,
          value: mood[metric]
        })).filter(item => item.value).reverse()
      };
    });

    return trends;
  }

  // Streak Management
        const { data: existingStreak, error: fetchError } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .eq('type', type)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError; // PGRST116 means no rows found

      let streak: UserStreak;

      if (!existingStreak) {
        // Create new streak
        streak = {
          id: '',
          userId,
          type,
          currentStreak: 1,
          longestStreak: 1,
          lastActivityDate: activityDate,
          startDate: activityDate,
          isActive: true,
          streakSnapshots: [{
            date: activityDate,
            streakCount: 1,
            activities: [type],
            mood: undefined
          }],
          motivationLevel: 3,
          nextMilestone: 7,
          syncStatus: 'synced',
          lastModified: new Date(),
          version: 1
        };

        const { error: insertError } = await supabase
          .from('user_streaks')
          .insert({
            user_id: streak.userId,
            type: streak.type,
            current_streak: streak.currentStreak,
            longest_streak: streak.longestStreak,
            last_activity_date: streak.lastActivityDate.toISOString(),
            start_date: streak.startDate.toISOString(),
            is_active: streak.isActive,
            streak_snapshots: streak.streakSnapshots.map(s => ({
              date: s.date.toISOString(),
              streak_count: s.streakCount,
              activities: s.activities,
              mood: s.mood
            })),
            motivation_level: streak.motivationLevel,
            next_milestone: streak.nextMilestone,
            sync_status: streak.syncStatus,
            last_modified: streak.lastModified.toISOString(),
            version: streak.version
          });

        if (insertError) throw insertError;
      } else {
        // Update existing streak
        streak = {
          id: existingStreak.id,
          userId: existingStreak.user_id,
          type: existingStreak.type,
          currentStreak: existingStreak.current_streak,
          longestStreak: existingStreak.longest_streak,
          lastActivityDate: new Date(existingStreak.last_activity_date),
          startDate: new Date(existingStreak.start_date),
          isActive: existingStreak.is_active,
          streakSnapshots: existingStreak.streak_snapshots.map((s: any) => ({
            date: new Date(s.date),
            streakCount: s.streak_count,
            activities: s.activities,
            mood: s.mood
          })),
          motivationLevel: existingStreak.motivation_level,
          nextMilestone: existingStreak.next_milestone,
          syncStatus: existingStreak.sync_status,
          lastModified: new Date(existingStreak.last_modified),
          version: existingStreak.version
        };

        const daysSinceLastActivity = Math.floor(
          (activityDate.getTime() - streak.lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceLastActivity === 1) {
          // Continue streak
          streak.currentStreak += 1;
          streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
        } else if (daysSinceLastActivity > 1) {
          // Streak broken, start new
          streak.currentStreak = 1;
          streak.startDate = activityDate;
        }
        // daysSinceLastActivity === 0 means same day, don't increment

        streak.lastActivityDate = activityDate;
        streak.isActive = daysSinceLastActivity <= 1;
        streak.lastModified = new Date();
        streak.version += 1;

        // Add snapshot
        streak.streakSnapshots.push({
          date: activityDate,
          streakCount: streak.currentStreak,
          activities: [type]
        });

        // Keep only last 100 snapshots
        if (streak.streakSnapshots.length > 100) {
          streak.streakSnapshots = streak.streakSnapshots.slice(-100);
        }

        const { error: updateError } = await supabase
          .from('user_streaks')
          .update({
            current_streak: streak.currentStreak,
            longest_streak: streak.longestStreak,
            last_activity_date: streak.lastActivityDate.toISOString(),
            start_date: streak.startDate.toISOString(),
            is_active: streak.isActive,
            streak_snapshots: streak.streakSnapshots.map(s => ({
              date: s.date.toISOString(),
              streak_count: s.streakCount,
              activities: s.activities,
              mood: s.mood
            })),
            last_modified: streak.lastModified.toISOString(),
            version: streak.version
          })
          .eq('id', streak.id);

        if (updateError) throw updateError;
      }

  async getUserStreaks(userId: string): Promise<UserStreak[]> {
    try {
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      return data.map(row => ({
        id: row.id,
        userId: row.user_id,
        type: row.type,
        currentStreak: row.current_streak,
        longestStreak: row.longest_streak,
        lastActivityDate: new Date(row.last_activity_date),
        startDate: new Date(row.start_date),
        isActive: row.is_active,
        streakSnapshots: row.streak_snapshots.map((s: any) => ({
          date: new Date(s.date),
          streakCount: s.streak_count,
          activities: s.activities,
          mood: s.mood
        })),
        motivationLevel: row.motivation_level,
        nextMilestone: row.next_milestone,
        syncStatus: row.sync_status,
        lastModified: new Date(row.last_modified),
        version: row.version
      })) as UserStreak[];
    } catch (error) {
      console.error('Error fetching user streaks:', error);
      return [];
    }
  }

  // Cairn Progress Management
  async updateCairnProgress(userId: string, unit: 'sessions' | 'minutes' | 'days' | 'courses', increment: number): Promise<void> {
    try {
      const { data: existingCairns, error: fetchError } = await supabase
        .from('cairn_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('unit', unit)
        .eq('is_completed', false);

      if (fetchError) throw fetchError;

      if (existingCairns && existingCairns.length > 0) {
        for (const cairn of existingCairns) {
          const newValue = Math.min(cairn.target_value, cairn.current_value + increment);
          
          const updates: any = {
            current_value: newValue,
            last_modified: new Date().toISOString(),
            version: cairn.version + 1
          };

          if (newValue >= cairn.target_value && !cairn.is_completed) {
            updates.is_completed = true;
            updates.completed_at = new Date().toISOString();
          }

          const { error: updateError } = await supabase
            .from('cairn_progress')
            .update(updates)
            .eq('id', cairn.id);

          if (updateError) throw updateError;
        }
      }
    } catch (error) {
      console.error('Error updating cairn progress:', error);
    }
  }

  // User Progress Summary
  async getUserProgressSummary(userId: string): Promise<UserProgressSummary> {
    try {
      const [sessions, streaks, courses] = await Promise.all([
        this.getSessionStats(userId, 'year'),
        this.getUserStreaks(userId),
        this.getUserCourseProgress(userId)
      ]);

      const meditationStreak = streaks.find(s => s.type === 'meditation');
      const completedCourses = courses.filter(c => c.isCompleted).length;

      return {
        totalSessions: sessions.totalSessions,
        totalMinutes: sessions.totalMinutes,
        currentStreak: meditationStreak?.currentStreak || 0,
        longestStreak: meditationStreak?.longestStreak || 0,
        completedCourses,
        earnedCertificates: courses.reduce((sum, c) => sum + c.certificates.length, 0),
        activeCairns: 0, // Will be implemented with full cairn system
        completedCairns: 0,
        lastSessionDate: undefined, // Will get from most recent session
        consistencyScore: sessions.consistency,
        moodTrendScore: 75, // Will calculate from mood trends
        overallProgress: Math.round((sessions.consistency + 75) / 2) // Composite score
      };
    } catch (error) {
      console.error('Error getting user progress summary:', error);
      return {
        totalSessions: 0,
        totalMinutes: 0,
        currentStreak: 0,
        longestStreak: 0,
        completedCourses: 0,
        earnedCertificates: 0,
        activeCairns: 0,
        completedCairns: 0,
        consistencyScore: 0,
        moodTrendScore: 0,
        overallProgress: 0
      };
    }
  }

  // Course Progress (placeholder for full implementation)
  async getUserCourseProgress(userId: string): Promise<CourseProgress[]> {
    try {
      const { data, error } = await supabase
        .from('course_progress')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      return data.map(row => ({
        id: row.id,
        userId: row.user_id,
        courseId: row.course_id,
        courseTitle: row.course_title,
        progress: row.progress,
        isCompleted: row.is_completed,
        startedAt: new Date(row.started_at),
        lastAccessedAt: new Date(row.last_accessed_at),
        timeSpent: row.time_spent,
        completedLessons: row.completed_lessons,
        certificates: row.certificates,
        syncStatus: row.sync_status,
        lastModified: new Date(row.last_modified),
        version: row.version,
        completedAt: row.completed_at ? new Date(row.completed_at) : undefined
      })) as CourseProgress[];
    } catch (error) {
      console.error('Error fetching course progress:', error);
      return [];
    }
  }

  // Offline Queue Management
  private async addToOfflineQueue(
    action: 'create' | 'update' | 'delete',
    dataType: 'session' | 'mood' | 'cairn' | 'course' | 'streak',
    entityId: string,
    data: any
  ): Promise<void> {
    const queueItem: OfflineDataQueue = {
      id: `offline_${Date.now()}_${Math.random()}`,
      userId: data.userId || '',
      action,
      dataType,
      entityId,
      data,
      timestamp: new Date(),
      retryCount: 0,
      maxRetries: 3,
      status: 'pending'
    };

    this.offlineQueue.push(queueItem);
    
    // Store in localStorage for persistence
    localStorage.setItem('sembalun_offline_queue', JSON.stringify(this.offlineQueue));
  }

  async processOfflineQueue(): Promise<void> {
    const storedQueue = localStorage.getItem('sembalun_offline_queue');
    if (storedQueue) {
      this.offlineQueue = JSON.parse(storedQueue);
    }

    const pendingItems = this.offlineQueue.filter(item => item.status === 'pending');
    
    for (const item of pendingItems) {
      try {
        item.status = 'processing';
        
        switch (item.action) {
          case 'create':
            if (item.dataType === 'session') {
              await this.createMeditationSession(item.data as any);
            } else if (item.dataType === 'mood') {
              await this.createMoodEntry(item.data as any);
            }
            break;
          // Add other action types as needed
        }

        item.status = 'completed';
      } catch (error) {
        item.retryCount++;
        if (item.retryCount >= item.maxRetries) {
          item.status = 'failed';
        } else {
          item.status = 'pending';
        }
      }
    }

    // Update localStorage
    localStorage.setItem('sembalun_offline_queue', JSON.stringify(this.offlineQueue));
  }

  // Real-time sync listener
  subscribeToUserData(userId: string, callback: () => void): () => void {
    const listenerId = `${userId}_${Date.now()}`;
    this.syncListeners.set(listenerId, callback);

    // Supabase Realtime listeners
    const channels: any[] = [];

    // Listen to sessions
    const sessionChannel = supabase.channel(`meditation_sessions:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'meditation_sessions', filter: `user_id=eq.${userId}` },
        () => callback()
      )
      .subscribe();
    channels.push(sessionChannel);

    // Listen to moods
    const moodChannel = supabase.channel(`mood_entries:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'mood_entries', filter: `user_id=eq.${userId}` },
        () => callback()
      )
      .subscribe();
    channels.push(moodChannel);

    // Listen to streaks
    const streakChannel = supabase.channel(`user_streaks:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_streaks', filter: `user_id=eq.${userId}` },
        () => callback()
      )
      .subscribe();
    channels.push(streakChannel);

    // Listen to cairn progress
    const cairnChannel = supabase.channel(`cairn_progress:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cairn_progress', filter: `user_id=eq.${userId}` },
        () => callback()
      )
      .subscribe();
    channels.push(cairnChannel);

    // Listen to course progress
    const courseChannel = supabase.channel(`course_progress:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'course_progress', filter: `user_id=eq.${userId}` },
        () => callback()
      )
      .subscribe();
    channels.push(courseChannel);

    // Return cleanup function
    return () => {
      this.syncListeners.delete(listenerId);
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }
}

export const progressService = ProgressService.getInstance();