import type { 
  MeditationSession, 
  Course, 
  Recommendation,
  ContentRecommendationData,
  SessionCategory,
  Difficulty
} from '../types/content';
import { contentDatabase } from './contentDatabase';
import { userProgressService } from './userProgressService';

export class RecommendationEngine {
  
  /**
   * Get personalized recommendations for a user
   */
  async getRecommendations(
    userId: string, 
    limit: number = 10
  ): Promise<Recommendation[]> {
    try {
      const [userPreferences, allSessions] = await Promise.all([
        userProgressService.getUserPreferences(userId),
        contentDatabase.getSessions()
      ]);

      // Get different types of recommendations
      const trendingRecs = await this.getTrendingRecommendations(allSessions, Math.ceil(limit * 0.3));
      const similarRecs = await this.getSimilarContentRecommendations(userId, userPreferences, allSessions, Math.ceil(limit * 0.3));
      const progressRecs = await this.getProgressBasedRecommendations(userId, userPreferences, allSessions, Math.ceil(limit * 0.2));
      const moodRecs = await this.getMoodBasedRecommendations(userPreferences, allSessions, Math.ceil(limit * 0.2));

      // Combine and deduplicate
      const allRecs = [...trendingRecs, ...similarRecs, ...progressRecs, ...moodRecs];
      const uniqueRecs = this.deduplicateRecommendations(allRecs);

      // Sort by confidence and return top results
      return uniqueRecs
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, limit);

    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  /**
   * Get trending content recommendations
   */
  private async getTrendingRecommendations(
    allSessions: MeditationSession[],
    limit: number
  ): Promise<Recommendation[]> {
    return allSessions
      .sort((a, b) => b.completionCount - a.completionCount)
      .slice(0, limit)
      .map(session => ({
        sessionId: session.id,
        reason: `Populer dengan ${session.completionCount} penyelesaian`,
        confidence: this.calculateTrendingConfidence(session),
        type: 'trending' as const
      }));
  }

  /**
   * Get similar content recommendations based on user history
   */
  private async getSimilarContentRecommendations(
    userId: string,
    userPreferences: ContentRecommendationData,
    allSessions: MeditationSession[],
    limit: number
  ): Promise<Recommendation[]> {
    const userProgress = await contentDatabase.getUserProgress(userId);
    const completedSessionIds = userProgress
      .filter(p => p.completionPercentage >= 100)
      .map(p => p.sessionId);

    // Find sessions similar to user's completed sessions
    const availableSessions = allSessions.filter(session => 
      !completedSessionIds.includes(session.id)
    );

    const similarSessions = availableSessions
      .map(session => ({
        session,
        similarity: this.calculateContentSimilarity(session, userPreferences)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return similarSessions.map(({ session, similarity }) => ({
      sessionId: session.id,
      reason: this.generateSimilarityReason(session, userPreferences),
      confidence: similarity,
      type: 'similar' as const
    }));
  }

  /**
   * Get progress-based recommendations
   */
  private async getProgressBasedRecommendations(
    userId: string,
    userPreferences: ContentRecommendationData,
    allSessions: MeditationSession[],
    limit: number
  ): Promise<Recommendation[]> {
    const userProgress = await contentDatabase.getUserProgress(userId);
    const completedSessionIds = userProgress
      .filter(p => p.completionPercentage >= 100)
      .map(p => p.sessionId);

    // Recommend next difficulty level
    const userDifficulties = userPreferences.preferences.difficulties;
    const nextDifficulty = this.getNextDifficulty(userDifficulties);

    if (!nextDifficulty) return [];

    const progressSessions = allSessions
      .filter(session => 
        !completedSessionIds.includes(session.id) &&
        session.difficulty === nextDifficulty &&
        userPreferences.preferences.categories.includes(session.category)
      )
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, limit);

    return progressSessions.map(session => ({
      sessionId: session.id,
      reason: `Tingkatkan ke level ${nextDifficulty} dalam kategori yang Anda sukai`,
      confidence: 0.8,
      type: 'progress' as const
    }));
  }

  /**
   * Get mood-based recommendations
   */
  private async getMoodBasedRecommendations(
    _userPreferences: ContentRecommendationData,
    allSessions: MeditationSession[],
    limit: number
  ): Promise<Recommendation[]> {
    // Get current time to suggest appropriate content
    const currentHour = new Date().getHours();
    const timeOfDay = this.getTimeOfDay(currentHour);
    
    const moodCategories = this.getMoodCategories(timeOfDay);
    
    const moodSessions = allSessions
      .filter(session => moodCategories.includes(session.category))
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, limit);

    return moodSessions.map(session => ({
      sessionId: session.id,
      reason: this.generateMoodReason(session.category, timeOfDay),
      confidence: 0.7,
      type: 'mood' as const
    }));
  }

  /**
   * Get time-based recommendations
   */
  async getTimeBasedRecommendations(): Promise<Recommendation[]> {
    const currentHour = new Date().getHours();
    const timeOfDay = this.getTimeOfDay(currentHour);
    
    const allSessions = await contentDatabase.getSessions();
    const timeCategories = this.getTimeCategoriesForTime(timeOfDay);
    
    const timeSessions = allSessions
      .filter(session => timeCategories.includes(session.category))
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 5);

    return timeSessions.map(session => ({
      sessionId: session.id,
      reason: this.generateTimeReason(timeOfDay),
      confidence: 0.75,
      type: 'time-based' as const
    }));
  }

  /**
   * Calculate content similarity based on user preferences
   */
  private calculateContentSimilarity(
    session: MeditationSession,
    userPreferences: ContentRecommendationData
  ): number {
    let score = 0;

    // Category match
    if (userPreferences.preferences.categories.includes(session.category)) {
      score += 0.4;
    }

    // Difficulty match
    if (userPreferences.preferences.difficulties.includes(session.difficulty)) {
      score += 0.3;
    }

    // Duration preference
    if (userPreferences.preferences.durations.includes(session.duration)) {
      score += 0.2;
    }

    // Instructor preference
    if (session.instructor && userPreferences.preferences.instructors.includes(session.instructor)) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Calculate trending confidence based on session metrics
   */
  private calculateTrendingConfidence(session: MeditationSession): number {
    const baseScore = 0.6;
    const completionBonus = Math.min(session.completionCount / 1000, 0.3);
    const ratingBonus = Math.min((session.averageRating - 3) / 5, 0.1);
    
    return Math.min(baseScore + completionBonus + ratingBonus, 1.0);
  }

  /**
   * Get next difficulty level for progression
   */
  private getNextDifficulty(currentDifficulties: Difficulty[]): Difficulty | null {
    if (currentDifficulties.includes('pemula') && !currentDifficulties.includes('menengah')) {
      return 'menengah';
    }
    if (currentDifficulties.includes('menengah') && !currentDifficulties.includes('lanjutan')) {
      return 'lanjutan';
    }
    return null;
  }

  /**
   * Get time of day based on hour
   */
  private getTimeOfDay(hour: number): 'morning' | 'afternoon' | 'evening' | 'night' {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  /**
   * Get mood categories for time of day
   */
  private getMoodCategories(timeOfDay: string): SessionCategory[] {
    switch (timeOfDay) {
      case 'morning':
        return ['jeda-pagi', 'fokus-kerja'];
      case 'afternoon':
        return ['napas-hiruk', 'fokus-kerja', 'relaksasi'];
      case 'evening':
        return ['pulang-diri', 'relaksasi', 'emosi'];
      case 'night':
        return ['tidur-dalam', 'relaksasi', 'spiritual'];
      default:
        return ['relaksasi'];
    }
  }

  /**
   * Get categories appropriate for specific time
   */
  private getTimeCategoriesForTime(timeOfDay: string): SessionCategory[] {
    return this.getMoodCategories(timeOfDay);
  }

  /**
   * Generate similarity reason text
   */
  private generateSimilarityReason(
    session: MeditationSession,
    userPreferences: ContentRecommendationData
  ): string {
    if (userPreferences.preferences.categories.includes(session.category)) {
      return `Sesuai dengan minat Anda pada kategori ${this.getCategoryDisplayName(session.category)}`;
    }
    if (userPreferences.preferences.difficulties.includes(session.difficulty)) {
      return `Sesuai dengan level ${session.difficulty} yang biasa Anda pilih`;
    }
    return `Direkomendasikan berdasarkan preferensi Anda`;
  }

  /**
   * Generate mood-based reason text
   */
  private generateMoodReason(_category: SessionCategory, timeOfDay: string): string {
    const timeDisplayNames = {
      'morning': 'pagi',
      'afternoon': 'siang',
      'evening': 'sore',
      'night': 'malam'
    };

    return `Cocok untuk waktu ${timeDisplayNames[timeOfDay as keyof typeof timeDisplayNames]} ini`;
  }

  /**
   * Generate time-based reason text
   */
  private generateTimeReason(timeOfDay: string): string {
    const messages = {
      'morning': 'Sempurna untuk memulai hari Anda',
      'afternoon': 'Ideal untuk jeda siang hari',
      'evening': 'Cocok untuk relaksasi sore',
      'night': 'Membantu persiapan tidur malam'
    };

    return messages[timeOfDay as keyof typeof messages] || 'Direkomendasikan untuk saat ini';
  }

  /**
   * Get category display name in Indonesian
   */
  private getCategoryDisplayName(category: SessionCategory): string {
    const displayNames = {
      'jeda-pagi': 'Jeda Pagi',
      'napas-hiruk': 'Napas di Tengah Hiruk',
      'pulang-diri': 'Pulang ke Diri',
      'tidur-dalam': 'Tidur yang Dalam',
      'fokus-kerja': 'Fokus Kerja',
      'relaksasi': 'Relaksasi',
      'kecemasan': 'Kecemasan',
      'emosi': 'Keseimbangan Emosi',
      'spiritual': 'Spiritual',
      'siy-attention': 'SIY - Perhatian',
      'siy-awareness': 'SIY - Kesadaran',
      'siy-regulation': 'SIY - Regulasi',
      'siy-empathy': 'SIY - Empati',
      'siy-social': 'SIY - Sosial',
      'siy-happiness': 'SIY - Kebahagiaan',
      'siy-workplace': 'SIY - Tempat Kerja'
    } as Record<string, string>;

    return displayNames[category] || category;
  }

  /**
   * Remove duplicate recommendations
   */
  private deduplicateRecommendations(recommendations: Recommendation[]): Recommendation[] {
    const seen = new Set<string>();
    return recommendations.filter(rec => {
      if (seen.has(rec.sessionId)) {
        return false;
      }
      seen.add(rec.sessionId);
      return true;
    });
  }

  /**
   * Get recommendations for new users (no history)
   */
  async getNewUserRecommendations(): Promise<Recommendation[]> {
    try {
      const allSessions = await contentDatabase.getSessions();
      
      // For new users, recommend popular beginner sessions
      const beginnerSessions = allSessions
        .filter(session => session.difficulty === 'pemula')
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 8);

      const recommendations: Recommendation[] = beginnerSessions.map(session => ({
        sessionId: session.id,
        reason: 'Sesi populer untuk pemula',
        confidence: 0.8,
        type: 'trending'
      }));

      // Add some variety with different categories
      const categories: SessionCategory[] = ['jeda-pagi', 'relaksasi', 'napas-hiruk'];
      for (const category of categories) {
        const categorySessions = allSessions
          .filter(session => 
            session.category === category && 
            session.difficulty === 'pemula' &&
            !recommendations.some(rec => rec.sessionId === session.id)
          )
          .sort((a, b) => b.averageRating - a.averageRating)
          .slice(0, 1);

        categorySessions.forEach(session => {
          recommendations.push({
            sessionId: session.id,
            reason: `Pengenalan ${this.getCategoryDisplayName(category)}`,
            confidence: 0.7,
            type: 'similar'
          });
        });
      }

      return recommendations.slice(0, 10);

    } catch (error) {
      console.error('Error getting new user recommendations:', error);
      return [];
    }
  }

  /**
   * Get course recommendations based on user progress
   */
  async getCourseRecommendations(userId: string): Promise<{
    courseId: string;
    reason: string;
    confidence: number;
  }[]> {
    try {
      const [userPreferences, allCourses] = await Promise.all([
        userProgressService.getUserPreferences(userId),
        contentDatabase.getCourses()
      ]);

      const recommendations = allCourses
        .map(course => ({
          courseId: course.id,
          reason: this.generateCourseReason(course, userPreferences),
          confidence: this.calculateCourseConfidence(course, userPreferences)
        }))
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5);

      return recommendations;

    } catch (error) {
      console.error('Error getting course recommendations:', error);
      return [];
    }
  }

  /**
   * Generate course recommendation reason
   */
  private generateCourseReason(
    course: Course,
    userPreferences: ContentRecommendationData
  ): string {
    if (userPreferences.preferences.categories.includes(course.category)) {
      return `Kursus ${this.getCategoryDisplayName(course.category)} yang sesuai dengan minat Anda`;
    }
    if (userPreferences.preferences.difficulties.includes(course.difficulty)) {
      return `Kursus level ${course.difficulty} yang sesuai dengan kemampuan Anda`;
    }
    return `Kursus yang direkomendasikan untuk pengembangan diri`;
  }

  /**
   * Calculate course recommendation confidence
   */
  private calculateCourseConfidence(
    course: Course,
    userPreferences: ContentRecommendationData
  ): number {
    let score = 0.5;

    if (userPreferences.preferences.categories.includes(course.category)) {
      score += 0.3;
    }
    if (userPreferences.preferences.difficulties.includes(course.difficulty)) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }
}

// Singleton instance
export const recommendationEngine = new RecommendationEngine();