import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  getDoc,
  writeBatch,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import { db } from '../config/firebase';
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
      const sessionData = {
        ...session,
        syncStatus: 'synced' as const,
        lastModified: new Date(),
        version: 1,
        completedAt: Timestamp.fromDate(session.completedAt),
        startedAt: Timestamp.fromDate(session.startedAt),
        endedAt: Timestamp.fromDate(session.endedAt)
      };

      const docRef = await addDoc(collection(db, 'meditation_sessions'), sessionData);
      
      // Update user streaks
      await this.updateUserStreaks(session.userId, 'meditation', session.completedAt);
      
      // Update cairn progress
      await this.updateCairnProgress(session.userId, 'sessions', 1);
      await this.updateCairnProgress(session.userId, 'minutes', Math.floor(session.duration / 60));

      return docRef.id;
    } catch (error) {
      console.error('Error creating meditation session:', error);
      // Add to offline queue if online save fails
      await this.addToOfflineQueue('create', 'session', '', session);
      throw error;
    }
  }

  async getMeditationSessions(
    userId: string, 
    limit_count: number = 50,
    startAfter?: Date
  ): Promise<MeditationSession[]> {
    try {
      let q = query(
        collection(db, 'meditation_sessions'),
        where('userId', '==', userId),
        orderBy('completedAt', 'desc'),
        limit(limit_count)
      );

      if (startAfter) {
        q = query(q, where('completedAt', '>=', Timestamp.fromDate(startAfter)));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        completedAt: doc.data().completedAt.toDate(),
        startedAt: doc.data().startedAt.toDate(),
        endedAt: doc.data().endedAt.toDate(),
        lastModified: doc.data().lastModified.toDate()
      })) as MeditationSession[];
    } catch (error) {
      console.error('Error fetching meditation sessions:', error);
      return [];
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
      const moodData = {
        ...mood,
        syncStatus: 'synced' as const,
        lastModified: new Date(),
        version: 1,
        timestamp: Timestamp.fromDate(mood.timestamp)
      };

      const docRef = await addDoc(collection(db, 'mood_entries'), moodData);
      
      // Update mood tracking streak
      await this.updateUserStreaks(mood.userId, 'mood_tracking', mood.timestamp);

      return docRef.id;
    } catch (error) {
      console.error('Error creating mood entry:', error);
      await this.addToOfflineQueue('create', 'mood', '', mood);
      throw error;
    }
  }

  async getMoodEntries(userId: string, limit_count: number = 100): Promise<MoodEntry[]> {
    try {
      const q = query(
        collection(db, 'mood_entries'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limit_count)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
        lastModified: doc.data().lastModified.toDate()
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
  async updateUserStreaks(userId: string, type: 'meditation' | 'mood_tracking' | 'course_study' | 'mindfulness', activityDate: Date): Promise<void> {
    try {
      const q = query(
        collection(db, 'user_streaks'),
        where('userId', '==', userId),
        where('type', '==', type)
      );

      const snapshot = await getDocs(q);
      let streak: UserStreak;

      if (snapshot.empty) {
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

        await addDoc(collection(db, 'user_streaks'), {
          ...streak,
          lastActivityDate: Timestamp.fromDate(streak.lastActivityDate),
          startDate: Timestamp.fromDate(streak.startDate),
          streakSnapshots: streak.streakSnapshots.map(s => ({
            ...s,
            date: Timestamp.fromDate(s.date)
          })),
          lastModified: Timestamp.fromDate(streak.lastModified)
        });
      } else {
        // Update existing streak
        const doc = snapshot.docs[0];
        streak = {
          id: doc.id,
          ...doc.data(),
          lastActivityDate: doc.data().lastActivityDate.toDate(),
          startDate: doc.data().startDate.toDate(),
          streakSnapshots: doc.data().streakSnapshots.map((s: any) => ({
            ...s,
            date: s.date.toDate()
          })),
          lastModified: doc.data().lastModified.toDate()
        } as UserStreak;

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

        await updateDoc(doc.ref, {
          ...streak,
          lastActivityDate: Timestamp.fromDate(streak.lastActivityDate),
          startDate: Timestamp.fromDate(streak.startDate),
          streakSnapshots: streak.streakSnapshots.map(s => ({
            ...s,
            date: Timestamp.fromDate(s.date)
          })),
          lastModified: Timestamp.fromDate(streak.lastModified)
        });
      }
    } catch (error) {
      console.error('Error updating user streaks:', error);
    }
  }

  async getUserStreaks(userId: string): Promise<UserStreak[]> {
    try {
      const q = query(
        collection(db, 'user_streaks'),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastActivityDate: doc.data().lastActivityDate.toDate(),
        startDate: doc.data().startDate.toDate(),
        streakSnapshots: doc.data().streakSnapshots.map((s: any) => ({
          ...s,
          date: s.date.toDate()
        })),
        lastModified: doc.data().lastModified.toDate()
      })) as UserStreak[];
    } catch (error) {
      console.error('Error fetching user streaks:', error);
      return [];
    }
  }

  // Cairn Progress Management
  async updateCairnProgress(userId: string, unit: 'sessions' | 'minutes' | 'days' | 'courses', increment: number): Promise<void> {
    try {
      const q = query(
        collection(db, 'cairn_progress'),
        where('userId', '==', userId),
        where('unit', '==', unit),
        where('isCompleted', '==', false)
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);

      snapshot.docs.forEach(doc => {
        const cairn = doc.data() as CairnProgress;
        const newValue = Math.min(cairn.targetValue, cairn.currentValue + increment);
        
        const updates: any = {
          currentValue: newValue,
          lastModified: Timestamp.fromDate(new Date()),
          version: cairn.version + 1
        };

        if (newValue >= cairn.targetValue && !cairn.isCompleted) {
          updates.isCompleted = true;
          updates.completedAt = Timestamp.fromDate(new Date());
        }

        batch.update(doc.ref, updates);
      });

      await batch.commit();
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
      const q = query(
        collection(db, 'course_progress'),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startedAt: doc.data().startedAt.toDate(),
        lastAccessedAt: doc.data().lastAccessedAt.toDate(),
        completedAt: doc.data().completedAt?.toDate(),
        lastModified: doc.data().lastModified.toDate()
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

    // Set up Firestore listeners for real-time updates
    const unsubscribes: (() => void)[] = [];

    // Listen to sessions
    const sessionQuery = query(
      collection(db, 'meditation_sessions'),
      where('userId', '==', userId)
    );
    unsubscribes.push(
      onSnapshot(sessionQuery, () => callback())
    );

    // Listen to moods
    const moodQuery = query(
      collection(db, 'mood_entries'),
      where('userId', '==', userId)
    );
    unsubscribes.push(
      onSnapshot(moodQuery, () => callback())
    );

    // Return cleanup function
    return () => {
      this.syncListeners.delete(listenerId);
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }
}

export const progressService = ProgressService.getInstance();