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
import type { CourseProgress, MeditationSession } from '../types/progress';
import { progressService } from './progressService';

export interface LearningAnalytics {
  id: string;
  userId: string;
  courseId: string;
  currentDifficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  comprehensionScore: number; // 0-100
  completionRate: number; // 0-100
  averageSessionTime: number; // in seconds
  strugglingAreas: string[];
  strengths: string[];
  learningVelocity: number; // lessons per day
  retentionRate: number; // 0-100
  engagementLevel: 'low' | 'medium' | 'high';
  recommendedDifficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  lastAssessment: Date;
  adjustmentHistory: DifficultyAdjustment[];
}

export interface DifficultyAdjustment {
  date: Date;
  fromDifficulty: string;
  toDifficulty: string;
  reason: string;
  metrics: {
    comprehensionScore: number;
    completionRate: number;
    strugglingIndicators: string[];
  };
  automatic: boolean;
}

export interface AdaptiveContent {
  originalContentId: string;
  adaptedVersion: 'simplified' | 'standard' | 'enhanced' | 'expert';
  modifications: ContentModification[];
  targetDifficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  effectivenessScore?: number;
}

export interface ContentModification {
  type: 'pacing' | 'explanation' | 'examples' | 'exercises' | 'prerequisites';
  description: string;
  value: unknown;
}

export interface LearningPath {
  id: string;
  userId: string;
  courseId: string;
  currentLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  customizedLessons: string[];
  skipRecommendations: string[];
  additionalResources: string[];
  estimatedCompletion: Date;
  personalizedObjectives: string[];
  adaptationReason: string;
}

export class AdaptiveLearningService {
  private static instance: AdaptiveLearningService;

  static getInstance(): AdaptiveLearningService {
    if (!AdaptiveLearningService.instance) {
      AdaptiveLearningService.instance = new AdaptiveLearningService();
    }
    return AdaptiveLearningService.instance;
  }

  async analyzeLearningProgress(userId: string, courseId: string): Promise<LearningAnalytics> {
    try {
      // Get user's course progress
      const courseProgress = await this.getUserCourseProgress(userId, courseId);
      if (!courseProgress) {
        throw new Error('Course progress not found');
      }

      // Get user's session data for analysis
      const sessions = await progressService.getMeditationSessions(userId, 50);
      const courseSessions = sessions.filter(s => s.notes?.includes(courseId)); // Simplified filter

      // Analyze comprehension based on completion patterns
      const comprehensionScore = this.calculateComprehensionScore(courseProgress, courseSessions);
      
      // Calculate completion rate
      const completionRate = courseProgress.progress;
      
      // Calculate average session time
      const averageSessionTime = courseSessions.length > 0 
        ? courseSessions.reduce((sum, s) => sum + s.duration, 0) / courseSessions.length
        : 0;

      // Identify struggling areas and strengths
      const { strugglingAreas, strengths } = await this.identifyLearningPatterns(
        userId, courseId, courseSessions
      );

      // Calculate learning velocity (lessons per day)
      const learningVelocity = this.calculateLearningVelocity(courseProgress);

      // Calculate retention rate based on revisit patterns
      const retentionRate = this.calculateRetentionRate(courseSessions);

      // Determine engagement level
      const engagementLevel = this.determineEngagementLevel(
        comprehensionScore,
        completionRate,
        averageSessionTime
      );

      // Get recommended difficulty
      const recommendedDifficulty = this.recommendDifficultyLevel({
        comprehensionScore,
        completionRate,
        learningVelocity,
        retentionRate,
        engagementLevel
      });

      // Get existing analytics or create new
      const existingAnalytics = await this.getExistingAnalytics(userId, courseId);
      
      const analytics: LearningAnalytics = {
        id: existingAnalytics?.id || `analytics_${Date.now()}`,
        userId,
        courseId,
        currentDifficulty: existingAnalytics?.currentDifficulty || 'beginner',
        comprehensionScore,
        completionRate,
        averageSessionTime,
        strugglingAreas,
        strengths,
        learningVelocity,
        retentionRate,
        engagementLevel,
        recommendedDifficulty,
        lastAssessment: new Date(),
        adjustmentHistory: existingAnalytics?.adjustmentHistory || []
      };

      // Check if difficulty adjustment is needed
      if (analytics.recommendedDifficulty !== analytics.currentDifficulty) {
        await this.suggestDifficultyAdjustment(analytics);
      }

      // Save analytics
      await this.saveAnalytics(analytics);

      return analytics;
    } catch (error) {
      console.error('Error analyzing learning progress:', error);
      throw error;
    }
  }

  private calculateComprehensionScore(
    progress: CourseProgress, 
    sessions: MeditationSession[]
  ): number {
    let score = 0;
    
    // Base score from completion rate
    score += progress.progress * 0.4;
    
    // Bonus for consistent practice
    if (sessions.length >= 5) {
      const qualityScores = sessions.map(s => s.quality || 3);
      const avgQuality = qualityScores.reduce((sum, q) => sum + q, 0) / qualityScores.length;
      score += (avgQuality / 5) * 30;
    }
    
    // Bonus for time invested
    const totalTime = progress.timeSpent;
    if (totalTime > 3600) { // More than 1 hour
      score += Math.min(20, (totalTime / 3600) * 5);
    }
    
    // Penalty for long gaps between sessions
    if (sessions.length >= 2) {
      const sessionDates = sessions.map(s => s.completedAt).sort();
      const gaps = [];
      for (let i = 1; i < sessionDates.length; i++) {
        const gap = (sessionDates[i].getTime() - sessionDates[i-1].getTime()) / (1000 * 60 * 60 * 24);
        gaps.push(gap);
      }
      const avgGap = gaps.reduce((sum, g) => sum + g, 0) / gaps.length;
      if (avgGap > 3) { // More than 3 days average gap
        score -= Math.min(15, (avgGap - 3) * 2);
      }
    }
    
    return Math.max(0, Math.min(100, score));
  }

  private async identifyLearningPatterns(
    userId: string, 
    courseId: string, 
    sessions: MeditationSession[]
  ): Promise<{ strugglingAreas: string[], strengths: string[] }> {
    const strugglingAreas: string[] = [];
    const strengths: string[] = [];
    
    // Analyze session quality patterns
    const techniquePerformance: { [key: string]: number[] } = {};
    
    sessions.forEach(session => {
      session.techniques.forEach((technique: string) => {
        if (!techniquePerformance[technique]) {
          techniquePerformance[technique] = [];
        }
        techniquePerformance[technique].push(session.quality || 3);
      });
    });
    
    // Identify struggling areas (average quality < 3)
    Object.entries(techniquePerformance).forEach(([technique, qualities]) => {
      const avgQuality = qualities.reduce((sum, q) => sum + q, 0) / qualities.length;
      if (avgQuality < 3 && qualities.length >= 3) {
        strugglingAreas.push(technique);
      } else if (avgQuality >= 4 && qualities.length >= 3) {
        strengths.push(technique);
      }
    });
    
    // Add common struggling areas based on completion patterns
    const completionTimes = sessions.map(s => s.duration / s.targetDuration || 1);
    const avgCompletion = completionTimes.reduce((sum, c) => sum + c, 0) / completionTimes.length;
    
    if (avgCompletion < 0.8) {
      strugglingAreas.push('session_completion');
    }
    
    if (sessions.some(s => s.interruptions > 2)) {
      strugglingAreas.push('focus_maintenance');
    }
    
    return { strugglingAreas, strengths };
  }

  private calculateLearningVelocity(progress: CourseProgress): number {
    const daysSinceStart = Math.floor(
      (new Date().getTime() - progress.startedAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceStart === 0) return 0;
    
    return progress.completedLessons.length / daysSinceStart;
  }

  private calculateRetentionRate(sessions: MeditationSession[]): number {
    if (sessions.length < 3) return 100; // Not enough data
    
    // Calculate based on technique repetition and improvement
    const techniqueProgression: { [key: string]: number[] } = {};
    
    sessions.forEach((session) => {
      session.techniques.forEach((technique: string) => {
        if (!techniqueProgression[technique]) {
          techniqueProgression[technique] = [];
        }
        techniqueProgression[technique].push(session.quality || 3);
      });
    });
    
    let retentionScore = 0;
    let techniqueCount = 0;
    
    Object.values(techniqueProgression).forEach(qualities => {
      if (qualities.length >= 3) {
        // Check if there's improvement or maintenance
        const recentAvg = qualities.slice(-3).reduce((sum, q) => sum + q, 0) / 3;
        const earlyAvg = qualities.slice(0, 3).reduce((sum, q) => sum + q, 0) / 3;
        
        if (recentAvg >= earlyAvg) {
          retentionScore += 100;
        } else {
          retentionScore += Math.max(0, 100 - ((earlyAvg - recentAvg) * 25));
        }
        techniqueCount++;
      }
    });
    
    return techniqueCount > 0 ? retentionScore / techniqueCount : 100;
  }

  private determineEngagementLevel(
    comprehensionScore: number,
    completionRate: number,
    averageSessionTime: number
  ): 'low' | 'medium' | 'high' {
    const engagementScore = (comprehensionScore * 0.4) + (completionRate * 0.4) + 
      (Math.min(100, (averageSessionTime / 600) * 100) * 0.2);
    
    if (engagementScore >= 80) return 'high';
    if (engagementScore >= 50) return 'medium';
    return 'low';
  }

  private recommendDifficultyLevel(metrics: {
    comprehensionScore: number;
    completionRate: number;
    learningVelocity: number;
    retentionRate: number;
    engagementLevel: 'low' | 'medium' | 'high';
  }): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    const { comprehensionScore, completionRate, learningVelocity, retentionRate, engagementLevel } = metrics;
    
    // Calculate overall performance score
    const performanceScore = (
      comprehensionScore * 0.3 +
      completionRate * 0.25 +
      Math.min(100, learningVelocity * 100) * 0.2 +
      retentionRate * 0.25
    );
    
    // Adjust based on engagement level
    let adjustedScore = performanceScore;
    if (engagementLevel === 'high') adjustedScore += 10;
    else if (engagementLevel === 'low') adjustedScore -= 15;
    
    // Recommend difficulty level
    if (adjustedScore >= 85) return 'expert';
    if (adjustedScore >= 70) return 'advanced';
    if (adjustedScore >= 50) return 'intermediate';
    return 'beginner';
  }

  async suggestDifficultyAdjustment(analytics: LearningAnalytics): Promise<void> {
    const adjustment: DifficultyAdjustment = {
      date: new Date(),
      fromDifficulty: analytics.currentDifficulty,
      toDifficulty: analytics.recommendedDifficulty,
      reason: this.generateAdjustmentReason(analytics),
      metrics: {
        comprehensionScore: analytics.comprehensionScore,
        completionRate: analytics.completionRate,
        strugglingIndicators: analytics.strugglingAreas
      },
      automatic: this.shouldAutoAdjust(analytics)
    };

    analytics.adjustmentHistory.push(adjustment);

    // If automatic adjustment is recommended, apply it
    if (adjustment.automatic) {
      analytics.currentDifficulty = analytics.recommendedDifficulty;
      await this.applyDifficultyAdjustment(analytics.userId, analytics.courseId, adjustment);
    }
  }

  private generateAdjustmentReason(analytics: LearningAnalytics): string {
    const reasons: string[] = [];
    
    if (analytics.comprehensionScore >= 85) {
      reasons.push('Skor pemahaman sangat tinggi');
    }
    
    if (analytics.comprehensionScore <= 40) {
      reasons.push('Skor pemahaman perlu diperbaiki');
    }
    
    if (analytics.completionRate >= 90) {
      reasons.push('Tingkat penyelesaian sangat baik');
    }
    
    if (analytics.completionRate <= 30) {
      reasons.push('Tingkat penyelesaian rendah');
    }
    
    if (analytics.learningVelocity >= 1) {
      reasons.push('Kecepatan belajar tinggi');
    }
    
    if (analytics.learningVelocity <= 0.2) {
      reasons.push('Kecepatan belajar perlu ditingkatkan');
    }
    
    if (analytics.engagementLevel === 'high') {
      reasons.push('Tingkat engagement tinggi');
    }
    
    if (analytics.engagementLevel === 'low') {
      reasons.push('Tingkat engagement perlu diperbaiki');
    }
    
    if (analytics.strugglingAreas.length > 3) {
      reasons.push('Banyak area yang perlu perbaikan');
    }
    
    return reasons.join(', ') || 'Penyesuaian berdasarkan analisis progress keseluruhan';
  }

  private shouldAutoAdjust(analytics: LearningAnalytics): boolean {
    // Auto-adjust if performance is consistently high or low
    const performanceScore = (analytics.comprehensionScore * 0.4) + (analytics.completionRate * 0.6);
    
    // Auto-adjust up if performing very well
    if (performanceScore >= 85 && analytics.engagementLevel === 'high' && analytics.strugglingAreas.length <= 1) {
      return true;
    }
    
    // Auto-adjust down if struggling significantly
    if (performanceScore <= 40 && analytics.strugglingAreas.length >= 3) {
      return true;
    }
    
    return false;
  }

  private async applyDifficultyAdjustment(
    userId: string, 
    courseId: string, 
    adjustment: DifficultyAdjustment
  ): Promise<void> {
    try {
      // Create personalized learning path
      const learningPath = await this.createPersonalizedLearningPath(
        userId, 
        courseId, 
        adjustment.toDifficulty as 'beginner' | 'intermediate' | 'advanced' | 'expert'
      );
      
      // Save the adjustment and learning path
      await this.saveLearningPath(learningPath);
      
      console.log(`Difficulty adjusted for user ${userId} course ${courseId}: ${adjustment.fromDifficulty} → ${adjustment.toDifficulty}`);
    } catch (error) {
      console.error('Error applying difficulty adjustment:', error);
    }
  }

  private async createPersonalizedLearningPath(
    userId: string,
    courseId: string,
    targetDifficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  ): Promise<LearningPath> {
    // This would analyze the course content and create a personalized path
    // For now, we'll create a simplified version
    
    const baseLessons = ['intro', 'basics', 'practice', 'advanced', 'mastery'];
    let customizedLessons = [...baseLessons];
    let skipRecommendations: string[] = [];
    let additionalResources: string[] = [];
    
    switch (targetDifficulty) {
      case 'beginner':
        additionalResources = ['fundamentals_guide', 'beginner_tips', 'common_mistakes'];
        break;
      case 'intermediate':
        // Standard progression
        break;
      case 'advanced':
        skipRecommendations = ['intro'];
        additionalResources = ['advanced_techniques', 'deep_practice'];
        break;
      case 'expert':
        skipRecommendations = ['intro', 'basics'];
        customizedLessons = ['advanced_intro', 'expert_practice', 'mastery_intensive'];
        additionalResources = ['expert_resources', 'teaching_materials'];
        break;
    }
    
    // Estimate completion time based on difficulty and content
    const baseWeeks = 4;
    const difficultyMultiplier = {
      beginner: 1.5,
      intermediate: 1.0,
      advanced: 0.8,
      expert: 0.6
    };
    
    const estimatedWeeks = baseWeeks * difficultyMultiplier[targetDifficulty];
    const estimatedCompletion = new Date();
    estimatedCompletion.setDate(estimatedCompletion.getDate() + (estimatedWeeks * 7));
    
    return {
      id: `path_${Date.now()}_${Math.random()}`,
      userId,
      courseId,
      currentLevel: targetDifficulty,
      customizedLessons,
      skipRecommendations,
      additionalResources,
      estimatedCompletion,
      personalizedObjectives: this.generatePersonalizedObjectives(targetDifficulty),
      adaptationReason: `Disesuaikan untuk level ${targetDifficulty} berdasarkan analisis performa`
    };
  }

  private generatePersonalizedObjectives(difficulty: string): string[] {
    const objectives = {
      beginner: [
        'Memahami konsep dasar meditasi',
        'Membangun kebiasaan praktik harian',
        'Menguasai teknik pernapasan dasar'
      ],
      intermediate: [
        'Mengembangkan konsistensi praktik',
        'Menguasai berbagai teknik meditasi',
        'Meningkatkan durasi sesi meditasi'
      ],
      advanced: [
        'Mendalami praktik mindfulness',
        'Mengintegrasikan meditasi dalam kehidupan sehari-hari',
        'Mengembangkan insight mendalam'
      ],
      expert: [
        'Menguasai teknik-teknik lanjutan',
        'Mengembangkan praktik personal yang unik',
        'Memiliki kemampuan untuk membimbing orang lain'
      ]
    };
    
    return objectives[difficulty as keyof typeof objectives] || objectives.beginner;
  }

  private async getUserCourseProgress(userId: string, courseId: string): Promise<CourseProgress | null> {
    try {
      const q = query(
        collection(db, 'course_progress'),
        where('userId', '==', userId),
        where('courseId', '==', courseId),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        startedAt: doc.data().startedAt.toDate(),
        lastAccessedAt: doc.data().lastAccessedAt.toDate(),
        completedAt: doc.data().completedAt?.toDate(),
        lastModified: doc.data().lastModified.toDate()
      } as CourseProgress;
    } catch (error) {
      console.error('Error fetching course progress:', error);
      return null;
    }
  }

  private async getExistingAnalytics(userId: string, courseId: string): Promise<LearningAnalytics | null> {
    try {
      const q = query(
        collection(db, 'learning_analytics'),
        where('userId', '==', userId),
        where('courseId', '==', courseId),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        lastAssessment: doc.data().lastAssessment.toDate(),
        adjustmentHistory: doc.data().adjustmentHistory.map((adj: any) => ({
          ...adj,
          date: adj.date.toDate()
        }))
      } as LearningAnalytics;
    } catch (error) {
      console.error('Error fetching existing analytics:', error);
      return null;
    }
  }

  private async saveAnalytics(analytics: LearningAnalytics): Promise<void> {
    try {
      const analyticsData = {
        ...analytics,
        lastAssessment: Timestamp.fromDate(analytics.lastAssessment),
        adjustmentHistory: analytics.adjustmentHistory.map(adj => ({
          ...adj,
          date: Timestamp.fromDate(adj.date)
        }))
      };

      if (analytics.id.startsWith('analytics_')) {
        // New analytics
        await addDoc(collection(db, 'learning_analytics'), analyticsData);
      } else {
        // Update existing
        const docRef = doc(db, 'learning_analytics', analytics.id);
        await updateDoc(docRef, analyticsData);
      }
    } catch (error) {
      console.error('Error saving analytics:', error);
    }
  }

  private async saveLearningPath(path: LearningPath): Promise<void> {
    try {
      await addDoc(collection(db, 'learning_paths'), {
        ...path,
        estimatedCompletion: Timestamp.fromDate(path.estimatedCompletion)
      });
    } catch (error) {
      console.error('Error saving learning path:', error);
    }
  }

  async getLearningPath(userId: string, courseId: string): Promise<LearningPath | null> {
    try {
      const q = query(
        collection(db, 'learning_paths'),
        where('userId', '==', userId),
        where('courseId', '==', courseId),
        orderBy('estimatedCompletion', 'desc'),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        estimatedCompletion: doc.data().estimatedCompletion.toDate()
      } as LearningPath;
    } catch (error) {
      console.error('Error fetching learning path:', error);
      return null;
    }
  }
}

export const adaptiveLearningService = AdaptiveLearningService.getInstance();