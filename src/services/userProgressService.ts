import type { 
  UserProgress, 
  UserContentInteractions, 
  AnalyticsData,
  MeditationSession,
  ContentRecommendationData,
  SessionCategory,
  Difficulty
} from '../types/content';
import { contentDatabase } from './contentDatabase';

export class UserProgressService {
  private readonly STREAK_KEY = 'meditation_streak';
  private readonly LAST_SESSION_KEY = 'last_session_date';
  private readonly TOTAL_TIME_KEY = 'total_meditation_time';
  private readonly SESSIONS_COUNT_KEY = 'completed_sessions_count';

  /**
   * Track a meditation session start
   */
  async startSession(
    userId: string, 
    sessionId: string, 
    courseId?: string
  ): Promise<void> {
    try {
      const analyticsData: AnalyticsData = {
        sessionId,
        userId,
        eventType: 'start',
        timestamp: new Date(),
        deviceType: this.getDeviceType(),
        metadata: {
          courseId,
          startTime: Date.now()
        }
      };

      await contentDatabase.logAnalyticsEvent(analyticsData);
    } catch (error) {
      console.error('Error tracking session start:', error);
    }
  }

  /**
   * Track meditation session completion with comprehensive progress update
   */
  async completeSession(
    userId: string, 
    sessionId: string, 
    sessionDuration: number, // in seconds
    courseId?: string
  ): Promise<void> {
    try {
      const now = new Date();

      // Update user progress
      const progressData: UserProgress = {
        userId,
        sessionId,
        courseId,
        completedAt: now,
        totalTime: sessionDuration,
        completionPercentage: 100,
        streak: await this.calculateStreak(userId),
        favorited: false,
        lastAccessedAt: now
      };

      await contentDatabase.updateUserProgress(progressData);

      // Update user interactions
      const interactions: UserContentInteractions = {
        userId,
        sessionId,
        interactions: {
          liked: false,
          bookmarked: false,
          shared: false,
          completed: true,
          timeSpent: sessionDuration,
          pauseCount: 0,
          skipCount: 0,
          replayCount: 0,
          lastPosition: sessionDuration
        },
        createdAt: now,
        updatedAt: now
      };

      await contentDatabase.updateUserInteraction(interactions);

      // Log analytics
      const analyticsData: AnalyticsData = {
        sessionId,
        userId,
        eventType: 'complete',
        timestamp: now,
        position: sessionDuration,
        deviceType: this.getDeviceType(),
        sessionDuration,
        metadata: {
          courseId,
          completionTime: Date.now()
        }
      };

      await contentDatabase.logAnalyticsEvent(analyticsData);

      // Update local storage stats
      this.updateLocalStats(sessionDuration);

    } catch (error) {
      console.error('Error tracking session completion:', error);
      throw error;
    }
  }

  /**
   * Track user interaction with content
   */
  async trackInteraction(
    userId: string,
    sessionId: string,
    interactionType: 'like' | 'bookmark' | 'share' | 'pause' | 'skip' | 'replay',
    metadata?: Record<string, unknown>
  ): Promise<void> {
    try {
      // Log analytics event
      const analyticsData: AnalyticsData = {
        sessionId,
        userId,
        eventType: interactionType as AnalyticsData['eventType'],
        timestamp: new Date(),
        deviceType: this.getDeviceType(),
        metadata
      };

      await contentDatabase.logAnalyticsEvent(analyticsData);

      // Update interaction counts
      const existingInteractions = await contentDatabase.getUserInteractions(userId, sessionId);
      const currentInteraction = existingInteractions[0];

      if (currentInteraction) {
        const updatedInteractions: UserContentInteractions = {
          ...currentInteraction,
          interactions: {
            ...currentInteraction.interactions,
            [interactionType === 'like' ? 'liked' : interactionType === 'bookmark' ? 'bookmarked' : interactionType === 'share' ? 'shared' : 'completed']: 
              interactionType !== 'pause' && interactionType !== 'skip' && interactionType !== 'replay',
            pauseCount: interactionType === 'pause' ? currentInteraction.interactions.pauseCount + 1 : currentInteraction.interactions.pauseCount,
            skipCount: interactionType === 'skip' ? currentInteraction.interactions.skipCount + 1 : currentInteraction.interactions.skipCount,
            replayCount: interactionType === 'replay' ? currentInteraction.interactions.replayCount + 1 : currentInteraction.interactions.replayCount
          },
          updatedAt: new Date()
        };

        await contentDatabase.updateUserInteraction(updatedInteractions);
      }

    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  }

  /**
   * Get user's meditation statistics
   */
  async getUserStats(userId: string): Promise<{
    totalSessions: number;
    totalTime: number; // in minutes
    currentStreak: number;
    longestStreak: number;
    averageSessionLength: number;
    completionRate: number;
    favoriteCategories: string[];
    recentSessions: UserProgress[];
  }> {
    try {
      const userProgress = await contentDatabase.getUserProgress(userId);

      const completedSessions = userProgress.filter(p => p.completionPercentage >= 100);
      const totalTime = completedSessions.reduce((sum, session) => sum + session.totalTime, 0);
      const averageSessionLength = completedSessions.length > 0 ? totalTime / completedSessions.length : 0;

      // Calculate completion rate
      const allSessions = await contentDatabase.getSessions();
      const completionRate = allSessions.length > 0 ? (completedSessions.length / allSessions.length) * 100 : 0;

      // Get favorite categories (most completed)
      const categoryCounts: Record<string, number> = {};
      for (const progress of completedSessions) {
        const session = await contentDatabase.getSession(progress.sessionId);
        if (session) {
          categoryCounts[session.category] = (categoryCounts[session.category] || 0) + 1;
        }
      }

      const favoriteCategories = Object.entries(categoryCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([category]) => category);

      return {
        totalSessions: completedSessions.length,
        totalTime: Math.round(totalTime / 60), // Convert to minutes
        currentStreak: await this.getCurrentStreak(userId),
        longestStreak: await this.getLongestStreak(userId),
        averageSessionLength: Math.round(averageSessionLength / 60), // Convert to minutes
        completionRate: Math.round(completionRate),
        favoriteCategories,
        recentSessions: userProgress
          .sort((a, b) => b.lastAccessedAt.getTime() - a.lastAccessedAt.getTime())
          .slice(0, 10)
      };

    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        totalSessions: 0,
        totalTime: 0,
        currentStreak: 0,
        longestStreak: 0,
        averageSessionLength: 0,
        completionRate: 0,
        favoriteCategories: [],
        recentSessions: []
      };
    }
  }

  /**
   * Calculate and update user's meditation streak
   */
  private async calculateStreak(userId: string): Promise<number> {
    try {
      const userProgress = await contentDatabase.getUserProgress(userId);
      const completedSessions = userProgress
        .filter(p => p.completionPercentage >= 100 && p.completedAt)
        .sort((a, b) => b.completedAt!.getTime() - a.completedAt!.getTime());

      if (completedSessions.length === 0) return 0;

      let streak = 1;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if user has meditated today
      const lastSession = completedSessions[0];
      const lastSessionDate = new Date(lastSession.completedAt!);
      lastSessionDate.setHours(0, 0, 0, 0);

      if (lastSessionDate.getTime() !== today.getTime()) {
        // Check if it was yesterday
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastSessionDate.getTime() !== yesterday.getTime()) {
          return 0; // Streak broken
        }
      }

      // Count consecutive days
      let currentDate = new Date(lastSessionDate);
      for (let i = 1; i < completedSessions.length; i++) {
        const sessionDate = new Date(completedSessions[i].completedAt!);
        sessionDate.setHours(0, 0, 0, 0);
        
        const expectedDate = new Date(currentDate);
        expectedDate.setDate(expectedDate.getDate() - 1);
        
        if (sessionDate.getTime() === expectedDate.getTime()) {
          streak++;
          currentDate = sessionDate;
        } else {
          break;
        }
      }

      // Update local storage
      localStorage.setItem(`${this.STREAK_KEY}_${userId}`, streak.toString());
      return streak;

    } catch (error) {
      console.error('Error calculating streak:', error);
      return 0;
    }
  }

  /**
   * Get current meditation streak
   */
  private async getCurrentStreak(userId: string): Promise<number> {
    try {
      const cached = localStorage.getItem(`${this.STREAK_KEY}_${userId}`);
      if (cached) {
        return parseInt(cached, 10);
      }
      return await this.calculateStreak(userId);
    } catch (error) {
      console.error('Error getting current streak:', error);
      return 0;
    }
  }

  /**
   * Get longest meditation streak
   */
  private async getLongestStreak(userId: string): Promise<number> {
    try {
      const userProgress = await contentDatabase.getUserProgress(userId);
      const completedSessions = userProgress
        .filter(p => p.completionPercentage >= 100 && p.completedAt)
        .sort((a, b) => a.completedAt!.getTime() - b.completedAt!.getTime());

      if (completedSessions.length === 0) return 0;

      let longestStreak = 1;
      let currentStreak = 1;
      
      for (let i = 1; i < completedSessions.length; i++) {
        const currentDate = new Date(completedSessions[i].completedAt!);
        currentDate.setHours(0, 0, 0, 0);
        
        const previousDate = new Date(completedSessions[i - 1].completedAt!);
        previousDate.setHours(0, 0, 0, 0);
        
        const diffTime = currentDate.getTime() - previousDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        if (diffDays === 1) {
          currentStreak++;
          longestStreak = Math.max(longestStreak, currentStreak);
        } else {
          currentStreak = 1;
        }
      }

      return longestStreak;
    } catch (error) {
      console.error('Error getting longest streak:', error);
      return 0;
    }
  }

  /**
   * Update local storage statistics
   */
  private updateLocalStats(sessionDuration: number): void {
    try {
      // Update total time
      const currentTime = parseInt(localStorage.getItem(this.TOTAL_TIME_KEY) || '0', 10);
      localStorage.setItem(this.TOTAL_TIME_KEY, (currentTime + sessionDuration).toString());

      // Update session count
      const currentCount = parseInt(localStorage.getItem(this.SESSIONS_COUNT_KEY) || '0', 10);
      localStorage.setItem(this.SESSIONS_COUNT_KEY, (currentCount + 1).toString());

      // Update last session date
      localStorage.setItem(this.LAST_SESSION_KEY, new Date().toISOString());
    } catch (error) {
      console.error('Error updating local stats:', error);
    }
  }

  /**
   * Get device type for analytics
   */
  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const userAgent = navigator.userAgent;
    
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile';
    }
    
    return 'desktop';
  }

  /**
   * Get user's content preferences for recommendations
   */
  async getUserPreferences(userId: string): Promise<ContentRecommendationData> {
    try {
      const userProgress = await contentDatabase.getUserProgress(userId);

      // Analyze completed sessions to determine preferences
      const completedSessions: MeditationSession[] = [];
      const categoryCounts: Record<string, number> = {};
      const difficultyCounts: Record<string, number> = {};
      const instructorCounts: Record<string, number> = {};
      
      for (const progress of userProgress.filter(p => p.completionPercentage >= 100)) {
        const session = await contentDatabase.getSession(progress.sessionId);
        if (session) {
          completedSessions.push(session);
          categoryCounts[session.category] = (categoryCounts[session.category] || 0) + 1;
          difficultyCounts[session.difficulty] = (difficultyCounts[session.difficulty] || 0) + 1;
          if (session.instructor) {
            instructorCounts[session.instructor] = (instructorCounts[session.instructor] || 0) + 1;
          }
        }
      }

      // Calculate completion rate
      const allSessions = await contentDatabase.getSessions();
      const completionRate = allSessions.length > 0 ? (completedSessions.length / allSessions.length) * 100 : 0;

      // Calculate average session length
      const totalTime = userProgress.reduce((sum, p) => sum + p.totalTime, 0);
      const averageSessionLength = userProgress.length > 0 ? totalTime / userProgress.length : 0;

      // Determine most active time (this would need session timestamps)
      const mostActiveTime = 'evening'; // Placeholder

      return {
        userId,
        preferences: {
          categories: Object.entries(categoryCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([category]) => category as SessionCategory),
          difficulties: Object.entries(difficultyCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([difficulty]) => difficulty as Difficulty),
          durations: this.getPreferredDurations(completedSessions),
          instructors: Object.entries(instructorCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([instructor]) => instructor),
          timeOfDay: ['evening'], // Placeholder
          mood: [] // Placeholder
        },
        behavior: {
          completionRate: completionRate / 100,
          averageSessionLength,
          mostActiveTime,
          preferredCategories: categoryCounts as Record<SessionCategory, number>,
          skipPatterns: [] // Placeholder
        },
        lastUpdated: new Date()
      };

    } catch (error) {
      console.error('Error getting user preferences:', error);
      return {
        userId,
        preferences: {
          categories: [],
          difficulties: [],
          durations: [],
          instructors: [],
          timeOfDay: [],
          mood: []
        },
        behavior: {
          completionRate: 0,
          averageSessionLength: 0,
          mostActiveTime: 'evening',
          preferredCategories: {} as Record<SessionCategory, number>,
          skipPatterns: []
        },
        lastUpdated: new Date()
      };
    }
  }

  /**
   * Get preferred session durations based on completed sessions
   */
  private getPreferredDurations(sessions: MeditationSession[]): number[] {
    const durations = sessions.map(s => s.duration);
    const durationCounts: Record<number, number> = {};
    
    durations.forEach(duration => {
      durationCounts[duration] = (durationCounts[duration] || 0) + 1;
    });

    return Object.entries(durationCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([duration]) => parseInt(duration, 10));
  }

  /**
   * Reset user progress (for development/testing)
   */
  async resetUserProgress(userId: string): Promise<void> {
    try {
      localStorage.removeItem(`${this.STREAK_KEY}_${userId}`);
      localStorage.removeItem(this.TOTAL_TIME_KEY);
      localStorage.removeItem(this.SESSIONS_COUNT_KEY);
      localStorage.removeItem(this.LAST_SESSION_KEY);
      
      console.log('User progress reset locally');
      // Note: Firebase data would need to be cleared through Firebase console or admin SDK
    } catch (error) {
      console.error('Error resetting user progress:', error);
    }
  }
}

// Singleton instance
export const userProgressService = new UserProgressService();