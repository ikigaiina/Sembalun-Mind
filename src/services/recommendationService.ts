import { typedSupabase as supabase } from '../config/supabase';
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
      // Supabase doesn't have a direct batch write for inserts like Firestore
      // We'll insert them one by one, or use a single insert with an array of objects
      // For simplicity, using individual inserts for now.
      // For large batches, consider a Supabase Edge Function or a single insert with an array.

      const payload = recommendations.map(rec => ({
        user_id: rec.userId,
        content_id: rec.contentId,
        content_type: rec.contentType,
        title: rec.title,
        description: rec.description,
        reason: rec.reason,
        confidence: rec.confidence,
        priority: rec.priority,
        category: rec.category,
        estimated_duration: rec.estimatedDuration,
        difficulty: rec.difficulty,
        tags: rec.tags,
        created_at: rec.createdAt.toISOString(),
        expires_at: rec.expiresAt ? rec.expiresAt.toISOString() : null,
        viewed: rec.viewed,
        interacted: rec.interacted
      }));

      const { error } = await supabase
        .from('content_recommendations')
        .insert(payload);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving recommendations:', error);
    }
  }

  async getUserRecommendations(userId: string, limit_count: number = 10): Promise<ContentRecommendation[]> {
    try {
      const { data, error } = await supabase
        .from('content_recommendations')
        .select('*')
        .eq('user_id', userId)
        .eq('viewed', false)
        .order('confidence', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit_count);

      if (error) throw error;

      return data.map(row => ({
        id: row.id,
        userId: row.user_id,
        contentId: row.content_id,
        contentType: row.content_type,
        title: row.title,
        description: row.description,
        reason: row.reason,
        confidence: row.confidence,
        priority: row.priority,
        category: row.category,
        estimatedDuration: row.estimated_duration,
        difficulty: row.difficulty,
        tags: row.tags,
        createdAt: new Date(row.created_at),
        expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
        viewed: row.viewed,
        interacted: row.interacted
      })) as ContentRecommendation[];
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }
  }

  async markRecommendationViewed(recommendationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('content_recommendations')
        .update({
          viewed: true,
          viewed_at: new Date().toISOString()
        })
        .eq('id', recommendationId);
      if (error) throw error;
    } catch (error) {
      console.error('Error marking recommendation as viewed:', error);
    }
  }

  async markRecommendationInteracted(recommendationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('content_recommendations')
        .update({
          interacted: true,
          interacted_at: new Date().toISOString()
        })
        .eq('id', recommendationId);
      if (error) throw error;
    } catch (error) {
      console.error('Error marking recommendation as interacted:', error);
    }
  }

  private async getUserUsagePatterns(userId: string): Promise<UsagePattern[]> {
    try {
      const { data, error } = await supabase
        .from('usage_patterns')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      return data.map(row => ({
        id: row.id,
        userId: row.user_id,
        sessionType: row.session_type,
        duration: row.duration,
        moodBefore: row.mood_before,
        moodAfter: row.mood_after,
        createdAt: new Date(row.created_at)
      })) as UsagePattern[];
    } catch (error) {
      console.error('Error fetching usage patterns:', error);
      return [];
    }
  }

  private async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        throw error;
      }

      if (!data) return null;

      return {
        id: data.id,
        userId: data.user_id,
        favoriteSessionTypes: data.favorite_session_types,
        preferredDuration: data.preferred_duration,
        difficultyLevel: data.difficulty_level,
        goals: data.goals,
        notificationPreferences: data.notification_preferences,
        culturalContext: data.cultural_context,
        lastUpdated: new Date(data.last_updated)
      } as UserPreferences;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return null;
    }
  }

  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
    try {
      const existingPrefs = await this.getUserPreferences(userId);
      
      const payload: any = {
        favorite_session_types: preferences.favoriteSessionTypes,
        preferred_duration: preferences.preferredDuration,
        difficulty_level: preferences.difficultyLevel,
        goals: preferences.goals,
        notification_preferences: preferences.notificationPreferences,
        cultural_context: preferences.culturalContext,
        last_updated: new Date().toISOString()
      };

      if (existingPrefs) {
        const { error } = await supabase
          .from('user_preferences')
          .update(payload)
          .eq('id', existingPrefs.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_preferences')
          .insert({
            user_id: userId,
            ...payload
          });
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating user preferences:', error);
    }
  }

  async trackUsagePattern(userId: string, pattern: Omit<UsagePattern, 'id' | 'userId' | 'createdAt'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('usage_patterns')
        .insert({
          user_id: userId,
          session_type: pattern.sessionType,
          duration: pattern.duration,
          mood_before: pattern.moodBefore,
          mood_after: pattern.moodAfter,
          created_at: new Date().toISOString()
        });
      if (error) throw error;
    } catch (error) {
      console.error('Error tracking usage pattern:', error);
    }
  }
}

export const recommendationService = RecommendationService.getInstance();