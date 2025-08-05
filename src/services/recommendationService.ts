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
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { 
  ContentRecommendation, 
  UsagePattern, 
  UserPreferences,
  PersonalizedContent
} from '../types/personalization';
import type { MeditationSession, MoodEntry } from '../types/progress';
import { progressService } from './progressService';

export interface ContentItem {
  id: string;
  type: 'session' | 'course' | 'article' | 'technique';
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration?: number;
  tags: string[];
  prerequisites?: string[];
  popularity: number;
  rating: number;
}

export class RecommendationService {
  private static instance: RecommendationService;

  static getInstance(): RecommendationService {
    if (!RecommendationService.instance) {
      RecommendationService.instance = new RecommendationService();
    }
    return RecommendationService.instance;
  }

  // Sample content database - in production this would be in Firestore
  private readonly sampleContent: ContentItem[] = [
    {
      id: 'breathing_basics',
      type: 'session',
      title: 'Pernapasan Dasar untuk Pemula',
      description: 'Belajar teknik pernapasan fundamental untuk memulai praktik meditasi',
      category: 'breathing',
      difficulty: 'beginner',
      duration: 600, // 10 minutes
      tags: ['breathing', 'basics', 'stress-relief', 'beginner-friendly'],
      popularity: 95,
      rating: 4.8
    },
    {
      id: 'mindfulness_walking',
      type: 'session',
      title: 'Mindful Walking Meditation',
      description: 'Praktik kesadaran penuh sambil berjalan untuk meningkatkan konsentrasi',
      category: 'mindfulness',
      difficulty: 'intermediate',
      duration: 900, // 15 minutes
      tags: ['mindfulness', 'walking', 'awareness', 'outdoor'],
      popularity: 78,
      rating: 4.6
    },
    {
      id: 'body_scan_deep',
      type: 'session',
      title: 'Body Scan Mendalam',
      description: 'Pemindaian tubuh yang detail untuk relaksasi dan kesadaran fisik',
      category: 'body_scan',
      difficulty: 'intermediate',
      duration: 1200, // 20 minutes
      tags: ['body-scan', 'relaxation', 'awareness', 'healing'],
      popularity: 82,
      rating: 4.7
    },
    {
      id: 'loving_kindness_advanced',
      type: 'session',
      title: 'Loving Kindness Lanjutan',
      description: 'Meditasi cinta kasih untuk mengembangkan compassion dan empati',
      category: 'loving_kindness',
      difficulty: 'advanced',
      duration: 1800, // 30 minutes
      tags: ['loving-kindness', 'compassion', 'empathy', 'heart-opening'],
      popularity: 65,
      rating: 4.9
    },
    {
      id: 'stress_relief_quick',
      type: 'session',
      title: 'Stress Relief Cepat',
      description: 'Teknik cepat untuk mengurangi stres dalam situasi mendesak',
      category: 'stress_relief',
      difficulty: 'beginner',
      duration: 300, // 5 minutes
      tags: ['stress-relief', 'quick', 'emergency', 'workplace'],
      popularity: 89,
      rating: 4.5
    },
    {
      id: 'siy_foundations_course',
      type: 'course',
      title: 'Search Inside Yourself - Fondasi',
      description: 'Kursus komprehensif untuk membangun kecerdasan emosional',
      category: 'siy',
      difficulty: 'beginner',
      duration: 28800, // 8 hours
      tags: ['siy', 'emotional-intelligence', 'comprehensive', 'structured'],
      popularity: 92,
      rating: 4.9
    },
    {
      id: 'advanced_breathing_course',
      type: 'course',
      title: 'Teknik Pernapasan Lanjutan',
      description: 'Kursus mendalam tentang berbagai teknik pernapasan',
      category: 'breathing',
      difficulty: 'advanced',
      duration: 18000, // 5 hours
      tags: ['breathing', 'advanced', 'pranayama', 'energy'],
      prerequisites: ['breathing_basics'],
      popularity: 71,
      rating: 4.8
    }
  ];

  async generateRecommendations(userId: string): Promise<ContentRecommendation[]> {
    try {
      const [usagePatterns, preferences, sessions, moods] = await Promise.all([
        this.getUserUsagePatterns(userId),
        this.getUserPreferences(userId),
        progressService.getMeditationSessions(userId, 50),
        progressService.getMoodEntries(userId, 30)
      ]);

      const recommendations: ContentRecommendation[] = [];

      // Content-based recommendations
      const contentBasedRecs = await this.generateContentBasedRecommendations(
        userId, preferences, sessions, usagePatterns
      );
      recommendations.push(...contentBasedRecs);

      // Collaborative filtering recommendations
      const collaborativeRecs = await this.generateCollaborativeRecommendations(
        userId, usagePatterns
      );
      recommendations.push(...collaborativeRecs);

      // Mood-based recommendations
      const moodBasedRecs = await this.generateMoodBasedRecommendations(
        userId, moods
      );
      recommendations.push(...moodBasedRecs);

      // Time-based recommendations
      const timeBasedRecs = await this.generateTimeBasedRecommendations(
        userId, sessions
      );
      recommendations.push(...timeBasedRecs);

      // Sort by confidence and priority
      const sortedRecs = recommendations
        .sort((a, b) => {
          if (a.priority !== b.priority) {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          }
          return b.confidence - a.confidence;
        })
        .slice(0, 20); // Top 20 recommendations

      // Save recommendations to database
      await this.saveRecommendations(userId, sortedRecs);

      return sortedRecs;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  private async generateContentBasedRecommendations(
    userId: string,
    preferences: UserPreferences | null,
    sessions: MeditationSession[],
    patterns: UsagePattern[]
  ): Promise<ContentRecommendation[]> {
    const recommendations: ContentRecommendation[] = [];
    
    // Analyze user's favorite session types
    const sessionTypes = sessions.map(s => s.sessionType);
    const typeFrequency = this.calculateFrequency(sessionTypes);
    
    // Analyze preferred durations
    const durations = sessions.map(s => s.duration);
    const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length || 600;
    
    // Get content similar to user's preferences
    for (const content of this.sampleContent) {
      let confidence = 0;
      const reasons: string[] = [];

      // Check session type preference
      if (typeFrequency[content.category] || (preferences?.favoriteSessionTypes.includes(content.category))) {
        confidence += 30;
        reasons.push(`Anda sering bermeditasi ${content.category}`);
      }

      // Check duration preference
      if (content.duration && Math.abs(content.duration - avgDuration) < 300) {
        confidence += 20;
        reasons.push(`Durasi sesuai preferensi (${Math.round(avgDuration/60)} menit)`);
      }

      // Check difficulty level
      if (preferences?.difficultyLevel === content.difficulty) {
        confidence += 25;
        reasons.push(`Sesuai level kesulitan Anda`);
      }

      // Check goals alignment
      if (preferences?.goals.some(goal => 
        content.tags.some(tag => tag.includes(goal.toLowerCase()))
      )) {
        confidence += 20;
        reasons.push('Mendukung tujuan personal Anda');
      }

      // Popularity boost
      confidence += (content.popularity / 100) * 5;

      if (confidence >= 40) {
        recommendations.push({
          id: `rec_${Date.now()}_${Math.random()}`,
          userId,
          contentId: content.id,
          contentType: content.type,
          title: content.title,
          description: content.description,
          reason: reasons.join(', '),
          confidence: Math.min(100, confidence),
          priority: confidence >= 70 ? 'high' : confidence >= 50 ? 'medium' : 'low',
          category: content.category,
          estimatedDuration: content.duration,
          difficulty: content.difficulty,
          tags: content.tags,
          createdAt: new Date(),
          viewed: false,
          interacted: false
        });
      }
    }

    return recommendations;
  }

  private async generateCollaborativeRecommendations(
    userId: string,
    patterns: UsagePattern[]
  ): Promise<ContentRecommendation[]> {
    // In a real implementation, this would use collaborative filtering
    // based on similar users' behavior
    const recommendations: ContentRecommendation[] = [];
    
    // Simulate finding similar users
    const userCategories = patterns.map(p => p.sessionType);
    const categoryFreq = this.calculateFrequency(userCategories);
    
    // Find content popular among similar users
    const similarContent = this.sampleContent.filter(content => {
      return categoryFreq[content.category] > 0 && content.popularity > 80;
    });

    for (const content of similarContent.slice(0, 3)) {
      recommendations.push({
        id: `collab_${Date.now()}_${Math.random()}`,
        userId,
        contentId: content.id,
        contentType: content.type,
        title: content.title,
        description: content.description,
        reason: `Populer di kalangan pengguna dengan minat serupa (${content.popularity}% rating)`,
        confidence: content.popularity,
        priority: content.popularity >= 90 ? 'high' : 'medium',
        category: content.category,
        estimatedDuration: content.duration,
        difficulty: content.difficulty,
        tags: content.tags,
        createdAt: new Date(),
        viewed: false,
        interacted: false
      });
    }

    return recommendations;
  }

  private async generateMoodBasedRecommendations(
    userId: string,
    moods: MoodEntry[]
  ): Promise<ContentRecommendation[]> {
    const recommendations: ContentRecommendation[] = [];
    
    if (moods.length === 0) return recommendations;

    // Analyze recent mood patterns
    const recentMoods = moods.slice(0, 7); // Last 7 entries
    const avgStress = recentMoods.reduce((sum, m) => sum + m.stress, 0) / recentMoods.length;
    const avgEnergy = recentMoods.reduce((sum, m) => sum + m.energy, 0) / recentMoods.length;
    const avgFocus = recentMoods.reduce((sum, m) => sum + m.focus, 0) / recentMoods.length;

    // Recommend based on mood patterns
    let targetContent: ContentItem[] = [];
    let reason = '';

    if (avgStress >= 4) {
      targetContent = this.sampleContent.filter(c => 
        c.tags.includes('stress-relief') || c.tags.includes('relaxation')
      );
      reason = 'Untuk membantu mengurangi tingkat stres yang tinggi';
    } else if (avgEnergy <= 2) {
      targetContent = this.sampleContent.filter(c => 
        c.tags.includes('energy') || c.category === 'breathing'
      );
      reason = 'Untuk meningkatkan energi dan vitalitas';
    } else if (avgFocus <= 2.5) {
      targetContent = this.sampleContent.filter(c => 
        c.tags.includes('awareness') || c.category === 'mindfulness'
      );
      reason = 'Untuk meningkatkan fokus dan konsentrasi';
    }

    for (const content of targetContent.slice(0, 2)) {
      recommendations.push({
        id: `mood_${Date.now()}_${Math.random()}`,
        userId,
        contentId: content.id,
        contentType: content.type,
        title: content.title,
        description: content.description,
        reason,
        confidence: 75,
        priority: 'high',
        category: content.category,
        estimatedDuration: content.duration,
        difficulty: content.difficulty,
        tags: content.tags,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        viewed: false,
        interacted: false
      });
    }

    return recommendations;
  }

  private async generateTimeBasedRecommendations(
    userId: string,
    sessions: MeditationSession[]
  ): Promise<ContentRecommendation[]> {
    const recommendations: ContentRecommendation[] = [];
    
    // Analyze time patterns
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    
    // Morning recommendations (6-10 AM)
    if (hour >= 6 && hour <= 10) {
      const morningContent = this.sampleContent.filter(c => 
        c.tags.includes('energy') || c.category === 'breathing'
      );
      
      for (const content of morningContent.slice(0, 2)) {
        recommendations.push({
          id: `morning_${Date.now()}_${Math.random()}`,
          userId,
          contentId: content.id,
          contentType: content.type,
          title: content.title,
          description: content.description,
          reason: 'Sempurna untuk memulai hari dengan energi positif',
          confidence: 65,
          priority: 'medium',
          category: content.category,
          estimatedDuration: content.duration,
          difficulty: content.difficulty,
          tags: content.tags,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
          viewed: false,
          interacted: false
        });
      }
    }

    // Evening recommendations (18-22 PM)
    if (hour >= 18 && hour <= 22) {
      const eveningContent = this.sampleContent.filter(c => 
        c.tags.includes('relaxation') || c.tags.includes('stress-relief')
      );
      
      for (const content of eveningContent.slice(0, 2)) {
        recommendations.push({
          id: `evening_${Date.now()}_${Math.random()}`,
          userId,
          contentId: content.id,
          contentType: content.type,
          title: content.title,
          description: content.description,
          reason: 'Ideal untuk bersantai setelah hari yang panjang',
          confidence: 65,
          priority: 'medium',
          category: content.category,
          estimatedDuration: content.duration,
          difficulty: content.difficulty,
          tags: content.tags,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
          viewed: false,
          interacted: false
        });
      }
    }

    return recommendations;
  }

  private calculateFrequency(items: string[]): { [key: string]: number } {
    const frequency: { [key: string]: number } = {};
    items.forEach(item => {
      frequency[item] = (frequency[item] || 0) + 1;
    });
    return frequency;
  }

  private async saveRecommendations(userId: string, recommendations: ContentRecommendation[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      for (const rec of recommendations) {
        const docRef = doc(collection(db, 'content_recommendations'));
        const recData = {
          ...rec,
          createdAt: Timestamp.fromDate(rec.createdAt),
          expiresAt: rec.expiresAt ? Timestamp.fromDate(rec.expiresAt) : null
        };
        
        if (batch) {
          batch.set(docRef, recData);
        } else {
          await addDoc(collection(db, 'content_recommendations'), recData);
        }
      }
      
      if (batch) {
        await batch.commit();
      }
    } catch (error) {
      console.error('Error saving recommendations:', error);
    }
  }

  async getUserRecommendations(userId: string, limit_count: number = 10): Promise<ContentRecommendation[]> {
    try {
      const q = query(
        collection(db, 'content_recommendations'),
        where('userId', '==', userId),
        where('viewed', '==', false),
        orderBy('confidence', 'desc'),
        orderBy('createdAt', 'desc'),
        limit(limit_count)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        expiresAt: doc.data().expiresAt?.toDate()
      })) as ContentRecommendation[];
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }
  }

  async markRecommendationViewed(recommendationId: string): Promise<void> {
    try {
      const docRef = doc(db, 'content_recommendations', recommendationId);
      await updateDoc(docRef, {
        viewed: true,
        viewedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error marking recommendation as viewed:', error);
    }
  }

  async markRecommendationInteracted(recommendationId: string): Promise<void> {
    try {
      const docRef = doc(db, 'content_recommendations', recommendationId);
      await updateDoc(docRef, {
        interacted: true,
        interactedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error marking recommendation as interacted:', error);
    }
  }

  private async getUserUsagePatterns(userId: string): Promise<UsagePattern[]> {
    try {
      const q = query(
        collection(db, 'usage_patterns'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(100)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      })) as UsagePattern[];
    } catch (error) {
      console.error('Error fetching usage patterns:', error);
      return [];
    }
  }

  private async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const q = query(
        collection(db, 'user_preferences'),
        where('userId', '==', userId),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        lastUpdated: doc.data().lastUpdated.toDate()
      } as UserPreferences;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return null;
    }
  }

  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
    try {
      const existingPrefs = await this.getUserPreferences(userId);
      
      if (existingPrefs) {
        const docRef = doc(db, 'user_preferences', existingPrefs.id);
        await updateDoc(docRef, {
          ...preferences,
          lastUpdated: Timestamp.fromDate(new Date())
        });
      } else {
        await addDoc(collection(db, 'user_preferences'), {
          userId,
          ...preferences,
          lastUpdated: Timestamp.fromDate(new Date())
        });
      }
    } catch (error) {
      console.error('Error updating user preferences:', error);
    }
  }

  async trackUsagePattern(userId: string, pattern: Omit<UsagePattern, 'id' | 'userId' | 'createdAt'>): Promise<void> {
    try {
      await addDoc(collection(db, 'usage_patterns'), {
        userId,
        ...pattern,
        createdAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error tracking usage pattern:', error);
    }
  }
}

export const recommendationService = RecommendationService.getInstance();