import { offlineStorageService } from './offlineStorageService';
import { offlineMoodJournalService } from './offlineMoodJournalService';

export interface ReflectionPrompt {
  id: string;
  type: 'post_session' | 'general' | 'weekly' | 'mood_based' | 'technique_specific';
  category: 'mindfulness' | 'breathing' | 'body_scan' | 'loving_kindness' | 'general';
  prompt: string;
  followUpQuestions: string[];
  difficulty: 'easy' | 'medium' | 'deep';
  estimatedTime: number; // minutes
  triggers: {
    sessionType?: string;
    moodRange?: { min: number; max: number };
    timeOfDay?: string[];
    userLevel?: 'beginner' | 'intermediate' | 'advanced';
  };
  isPersonalized: boolean;
  createdAt: Date;
}

export interface ReflectionResponse {
  id: string;
  userId: string;
  promptId: string;
  sessionId?: string;
  responses: {
    mainPrompt: string;
    followUpAnswers: string[];
  };
  mood?: number;
  tags: string[];
  insights: string[];
  createdAt: Date;
  timeSpent: number; // seconds
}

export interface ReflectionSession {
  id: string;
  userId: string;
  sessionId?: string;
  prompts: ReflectionPrompt[];
  responses: ReflectionResponse[];
  startTime: Date;
  endTime?: Date;
  totalTime: number; // minutes
  completionRate: number; // percentage
  mood: {
    before?: number;
    after?: number;
    improvement: number;
  };
}

export interface ReflectionInsights {
  totalReflections: number;
  averageCompletionTime: number;
  mostReflectedTopics: string[];
  moodImprovementTrend: number;
  commonInsights: string[];
  growthAreas: string[];
  recommendations: string[];
}

export interface PersonalizedPromptConfig {
  userId: string;
  preferences: {
    preferredTime: number; // minutes
    difficulty: 'easy' | 'medium' | 'deep';
    categories: string[];
    moodFocused: boolean;
    sessionSpecific: boolean;
  };
  learningStyle: 'visual' | 'analytical' | 'emotional' | 'practical';
  currentGoals: string[];
  avoidedTopics: string[];
}

export class ReflectionPromptsService {
  private static instance: ReflectionPromptsService;
  private promptsCache: Map<string, ReflectionPrompt[]> = new Map();
  private activeSession: ReflectionSession | null = null;

  static getInstance(): ReflectionPromptsService {
    if (!ReflectionPromptsService.instance) {
      ReflectionPromptsService.instance = new ReflectionPromptsService();
    }
    return ReflectionPromptsService.instance;
  }

  async generatePostSessionPrompts(
    userId: string,
    sessionId: string,
    sessionData: {
      type: string;
      duration: number;
      technique: string;
      quality?: number;
      mood?: { before?: number; after?: number };
    }
  ): Promise<ReflectionPrompt[]> {
    try {
      const userConfig = await this.getPersonalizedConfig(userId);
      const basePrompts = await this.getPostSessionBasePrompts(sessionData.type);
      
      // Personalize prompts based on session and user preferences
      const personalizedPrompts = await this.personalizePrompts(
        basePrompts,
        userConfig,
        sessionData
      );

      // Select optimal number of prompts based on user preferences
      const optimalCount = this.calculateOptimalPromptCount(userConfig, sessionData.duration);
      const selectedPrompts = this.selectBestPrompts(personalizedPrompts, optimalCount, sessionData);

      console.log(`Generated ${selectedPrompts.length} post-session prompts for session ${sessionId}`);
      return selectedPrompts;
    } catch (error) {
      console.error('Error generating post-session prompts:', error);
      return await this.getFallbackPrompts();
    }
  }

  async startReflectionSession(
    userId: string,
    sessionId?: string,
    prompts?: ReflectionPrompt[]
  ): Promise<string> {
    try {
      // Get prompts if not provided
      if (!prompts) {
        if (sessionId) {
          // Get session data and generate prompts
          prompts = await this.generateContextualPrompts(userId, sessionId);
        } else {
          // Get general prompts
          prompts = await this.getGeneralPrompts(userId);
        }
      }

      const reflectionSession: ReflectionSession = {
        id: `reflection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        sessionId,
        prompts,
        responses: [],
        startTime: new Date(),
        totalTime: 0,
        completionRate: 0,
        mood: { improvement: 0 }
      };

      this.activeSession = reflectionSession;
      await this.saveReflectionSession(reflectionSession);

      console.log('Reflection session started:', reflectionSession.id);
      return reflectionSession.id;
    } catch (error) {
      console.error('Error starting reflection session:', error);
      throw error;
    }
  }

  async submitReflectionResponse(
    reflectionSessionId: string,
    promptId: string,
    response: {
      mainResponse: string;
      followUpAnswers: string[];
      timeSpent: number;
      mood?: number;
      tags?: string[];
      insights?: string[];
    }
  ): Promise<void> {
    try {
      if (!this.activeSession || this.activeSession.id !== reflectionSessionId) {
        // Load session if not active
        this.activeSession = await this.loadReflectionSession(reflectionSessionId);
      }

      if (!this.activeSession) {
        throw new Error('Reflection session not found');
      }

      const reflectionResponse: ReflectionResponse = {
        id: `response-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: this.activeSession.userId,
        promptId,
        sessionId: this.activeSession.sessionId,
        responses: {
          mainPrompt: response.mainResponse,
          followUpAnswers: response.followUpAnswers
        },
        mood: response.mood,
        tags: response.tags || [],
        insights: response.insights || [],
        createdAt: new Date(),
        timeSpent: response.timeSpent
      };

      this.activeSession.responses.push(reflectionResponse);
      this.activeSession.completionRate = (this.activeSession.responses.length / this.activeSession.prompts.length) * 100;

      // Update mood tracking
      if (response.mood) {
        if (!this.activeSession.mood.before) {
          this.activeSession.mood.before = response.mood;
        } else {
          this.activeSession.mood.after = response.mood;
          this.activeSession.mood.improvement = this.activeSession.mood.after - this.activeSession.mood.before;
        }
      }

      await this.saveReflectionSession(this.activeSession);
      
      // Also save as journal entry for integrated tracking
      await this.saveAsJournalEntry(reflectionResponse);

      console.log('Reflection response submitted:', reflectionResponse.id);
    } catch (error) {
      console.error('Error submitting reflection response:', error);
      throw error;
    }
  }

  async completeReflectionSession(reflectionSessionId: string): Promise<ReflectionInsights> {
    try {
      if (!this.activeSession || this.activeSession.id !== reflectionSessionId) {
        this.activeSession = await this.loadReflectionSession(reflectionSessionId);
      }

      if (!this.activeSession) {
        throw new Error('Reflection session not found');
      }

      this.activeSession.endTime = new Date();
      this.activeSession.totalTime = (this.activeSession.endTime.getTime() - this.activeSession.startTime.getTime()) / (1000 * 60);

      await this.saveReflectionSession(this.activeSession);
      
      // Generate insights
      const insights = await this.generateSessionInsights(this.activeSession);
      
      // Clear active session
      this.activeSession = null;

      console.log('Reflection session completed:', reflectionSessionId);
      return insights;
    } catch (error) {
      console.error('Error completing reflection session:', error);
      throw error;
    }
  }

  async getPersonalizedPrompts(
    userId: string,
    context: {
      timeAvailable?: number;
      currentMood?: number;
      recentTopics?: string[];
      sessionType?: string;
    }
  ): Promise<ReflectionPrompt[]> {
    try {
      const userConfig = await this.getPersonalizedConfig(userId);
      const recentReflections = await this.getRecentReflections(userId, 7);
      
      // Get base prompts
      let basePrompts = await this.getAllPrompts();
      
      // Filter based on context and preferences
      basePrompts = this.filterPromptsByContext(basePrompts, context, userConfig);
      
      // Remove recently used prompts to ensure variety
      basePrompts = this.removeRecentlyUsedPrompts(basePrompts, recentReflections);
      
      // Personalize and rank prompts
      const personalizedPrompts = await this.personalizePrompts(basePrompts, userConfig, context);
      
      // Select top prompts
      const count = context.timeAvailable ? Math.floor(context.timeAvailable / 3) : 3;
      return this.selectBestPrompts(personalizedPrompts, count, context);
    } catch (error) {
      console.error('Error getting personalized prompts:', error);
      return await this.getFallbackPrompts();
    }
  }

  async getReflectionHistory(userId: string, limit: number = 20): Promise<ReflectionSession[]> {
    try {
      const sessions = await this.loadUserReflectionSessions(userId);
      return sessions
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting reflection history:', error);
      return [];
    }
  }

  async generateReflectionInsights(userId: string, days: number = 30): Promise<ReflectionInsights> {
    try {
      const sessions = await this.getReflectionHistory(userId);
      const recentSessions = sessions.filter(session => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return session.startTime >= cutoffDate;
      });

      if (recentSessions.length === 0) {
        return this.getDefaultInsights();
      }

      const totalReflections = recentSessions.reduce((sum, session) => sum + session.responses.length, 0);
      const averageCompletionTime = recentSessions.reduce((sum, session) => sum + session.totalTime, 0) / recentSessions.length;

      // Analyze most reflected topics
      const allTags = recentSessions.flatMap(session => 
        session.responses.flatMap(response => response.tags)
      );
      const tagCounts = allTags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostReflectedTopics = Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([tag]) => tag);

      // Calculate mood improvement trend
      const moodSessions = recentSessions.filter(session => session.mood.improvement !== undefined);
      const moodImprovementTrend = moodSessions.length > 0
        ? moodSessions.reduce((sum, session) => sum + (session.mood.improvement || 0), 0) / moodSessions.length
        : 0;

      // Extract common insights
      const allInsights = recentSessions.flatMap(session =>
        session.responses.flatMap(response => response.insights)
      );
      const commonInsights = [...new Set(allInsights)].slice(0, 5);

      // Generate growth areas and recommendations
      const growthAreas = await this.identifyGrowthAreas(recentSessions);
      const recommendations = await this.generateRecommendations(recentSessions, userId);

      return {
        totalReflections,
        averageCompletionTime,
        mostReflectedTopics,
        moodImprovementTrend,
        commonInsights,
        growthAreas,
        recommendations
      };
    } catch (error) {
      console.error('Error generating reflection insights:', error);
      return this.getDefaultInsights();
    }
  }

  async updatePersonalizedConfig(userId: string, config: Partial<PersonalizedPromptConfig>): Promise<void> {
    try {
      const current = await this.getPersonalizedConfig(userId);
      const updated = { ...current, ...config };
      await offlineStorageService.setSetting(`reflectionConfig_${userId}`, updated);
      
      // Clear prompts cache to force regeneration
      this.promptsCache.delete(userId);
      
      console.log('Personalized reflection config updated for user:', userId);
    } catch (error) {
      console.error('Error updating personalized config:', error);
      throw error;
    }
  }

  // Private helper methods
  private async getPostSessionBasePrompts(sessionType: string): Promise<ReflectionPrompt[]> {
    const postSessionPrompts: ReflectionPrompt[] = [
      {
        id: 'post-mindfulness-1',
        type: 'post_session',
        category: 'mindfulness',
        prompt: 'Apa yang paling Anda sadari tentang pikiran Anda selama sesi ini?',
        followUpQuestions: [
          'Apakah ada pola pikiran tertentu yang berulang?',
          'Bagaimana perasaan Anda ketika menyadari pikiran-pikiran tersebut?'
        ],
        difficulty: 'easy',
        estimatedTime: 3,
        triggers: { sessionType: 'mindfulness' },
        isPersonalized: false,
        createdAt: new Date()
      },
      {
        id: 'post-breathing-1',
        type: 'post_session',
        category: 'breathing',
        prompt: 'Bagaimana ritme nafas Anda berubah selama latihan ini?',
        followUpQuestions: [
          'Kapan Anda merasa paling nyaman dengan nafas Anda?',
          'Apa yang membantu Anda fokus pada nafas?'
        ],
        difficulty: 'easy',
        estimatedTime: 3,
        triggers: { sessionType: 'breathing' },
        isPersonalized: false,
        createdAt: new Date()
      },
      {
        id: 'post-general-1',
        type: 'post_session',
        category: 'general',
        prompt: 'Apa satu hal yang ingin Anda bawa dari sesi ini ke aktivitas selanjutnya?',
        followUpQuestions: [
          'Bagaimana Anda akan mengingat perasaan ini?',
          'Kapan momen yang tepat untuk menerapkannya?'
        ],
        difficulty: 'easy',
        estimatedTime: 2,
        triggers: {},
        isPersonalized: false,
        createdAt: new Date()
      }
    ];

    return postSessionPrompts.filter(prompt => 
      !prompt.triggers.sessionType || prompt.triggers.sessionType === sessionType
    );
  }

  private async getAllPrompts(): Promise<ReflectionPrompt[]> {
    // This would load all available prompts from storage or cache
    // For now, returning a sample set
    return [
      ...await this.getPostSessionBasePrompts('general'),
      ...await this.getGeneralReflectionPrompts(),
      ...await this.getMoodBasedPrompts()
    ];
  }

  private async getGeneralReflectionPrompts(): Promise<ReflectionPrompt[]> {
    return [
      {
        id: 'general-gratitude-1',
        type: 'general',
        category: 'general',
        prompt: 'Apa tiga hal yang membuat Anda bersyukur hari ini?',
        followUpQuestions: [
          'Mengapa hal-hal tersebut bermakna bagi Anda?',
          'Bagaimana Anda bisa mengapresiasi hal-hal kecil lebih sering?'
        ],
        difficulty: 'easy',
        estimatedTime: 4,
        triggers: {},
        isPersonalized: false,
        createdAt: new Date()
      },
      {
        id: 'general-growth-1',
        type: 'general',
        category: 'general',
        prompt: 'Apa satu hal yang Anda pelajari tentang diri Anda minggu ini?',
        followUpQuestions: [
          'Bagaimana pembelajaran ini mengubah perspektif Anda?',
          'Apa yang ingin Anda eksplorasi lebih lanjut tentang diri Anda?'
        ],
        difficulty: 'medium',
        estimatedTime: 5,
        triggers: {},
        isPersonalized: false,
        createdAt: new Date()
      }
    ];
  }

  private async getMoodBasedPrompts(): Promise<ReflectionPrompt[]> {
    return [
      {
        id: 'mood-low-1',
        type: 'mood_based',
        category: 'general',
        prompt: 'Apa satu hal kecil yang bisa memperbaiki mood Anda sekarang?',
        followUpQuestions: [
          'Mengapa hal tersebut efektif untuk Anda?',
          'Kapan terakhir kali Anda melakukan hal tersebut?'
        ],
        difficulty: 'easy',
        estimatedTime: 3,
        triggers: { moodRange: { min: 1, max: 3 } },
        isPersonalized: false,
        createdAt: new Date()
      },
      {
        id: 'mood-high-1',
        type: 'mood_based',
        category: 'general',
        prompt: 'Bagaimana Anda bisa berbagi energi positif ini dengan orang lain?',
        followUpQuestions: [
          'Siapa yang bisa mendapat manfaat dari kebaikan Anda hari ini?',
          'Apa cara sederhana untuk menyebarkan kebahagiaan?'
        ],
        difficulty: 'easy',
        estimatedTime: 3,
        triggers: { moodRange: { min: 4, max: 5 } },
        isPersonalized: false,
        createdAt: new Date()
      }
    ];
  }

  private async personalizePrompts(
    prompts: ReflectionPrompt[],
    config: PersonalizedPromptConfig,
    context: any
  ): Promise<ReflectionPrompt[]> {
    // Simple personalization - in a real app, this would be more sophisticated
    return prompts.filter(prompt => {
      // Filter by difficulty preference
      if (config.preferences.difficulty !== prompt.difficulty && prompt.difficulty !== 'easy') {
        return false;
      }
      
      // Filter by categories
      if (config.preferences.categories.length > 0 && 
          !config.preferences.categories.includes(prompt.category)) {
        return false;
      }
      
      return true;
    });
  }

  private calculateOptimalPromptCount(config: PersonalizedPromptConfig, sessionDuration: number): number {
    const baseTime = config.preferences.preferredTime;
    const timePerPrompt = 3; // average minutes per prompt
    
    return Math.max(1, Math.min(5, Math.floor(baseTime / timePerPrompt)));
  }

  private selectBestPrompts(prompts: ReflectionPrompt[], count: number, context: any): ReflectionPrompt[] {
    // Sort by relevance and select top prompts
    return prompts.slice(0, count);
  }

  private filterPromptsByContext(
    prompts: ReflectionPrompt[], 
    context: any, 
    config: PersonalizedPromptConfig
  ): ReflectionPrompt[] {
    return prompts.filter(prompt => {
      // Filter by mood if provided
      if (context.currentMood && prompt.triggers.moodRange) {
        const { min, max } = prompt.triggers.moodRange;
        if (context.currentMood < min || context.currentMood > max) {
          return false;
        }
      }
      
      return true;
    });
  }

  private removeRecentlyUsedPrompts(prompts: ReflectionPrompt[], recentReflections: ReflectionSession[]): ReflectionPrompt[] {
    const recentPromptIds = recentReflections.flatMap(session => 
      session.prompts.map(prompt => prompt.id)
    );
    
    return prompts.filter(prompt => !recentPromptIds.includes(prompt.id));
  }

  private async generateContextualPrompts(userId: string, sessionId: string): Promise<ReflectionPrompt[]> {
    // Would analyze session data and generate contextual prompts
    return await this.getPostSessionBasePrompts('general');
  }

  private async getGeneralPrompts(userId: string): Promise<ReflectionPrompt[]> {
    return await this.getGeneralReflectionPrompts();
  }

  private async getFallbackPrompts(): Promise<ReflectionPrompt[]> {
    return [
      {
        id: 'fallback-1',
        type: 'general',
        category: 'general',
        prompt: 'Bagaimana perasaan Anda saat ini?',
        followUpQuestions: ['Apa yang membuat Anda merasa demikian?'],
        difficulty: 'easy',
        estimatedTime: 2,
        triggers: {},
        isPersonalized: false,
        createdAt: new Date()
      }
    ];
  }

  private async getPersonalizedConfig(userId: string): Promise<PersonalizedPromptConfig> {
    const config = await offlineStorageService.getSetting(`reflectionConfig_${userId}`);
    
    if (config) {
      return config;
    }
    
    // Default config
    return {
      userId,
      preferences: {
        preferredTime: 5,
        difficulty: 'easy',
        categories: [],
        moodFocused: true,
        sessionSpecific: true
      },
      learningStyle: 'emotional',
      currentGoals: [],
      avoidedTopics: []
    };
  }

  private async saveReflectionSession(session: ReflectionSession): Promise<void> {
    const key = `reflectionSession_${session.id}`;
    await offlineStorageService.setSetting(key, session);
  }

  private async loadReflectionSession(sessionId: string): Promise<ReflectionSession | null> {
    const key = `reflectionSession_${sessionId}`;
    return await offlineStorageService.getSetting(key);
  }

  private async loadUserReflectionSessions(userId: string): Promise<ReflectionSession[]> {
    // Mock implementation - would query actual storage
    return [];
  }

  private async saveAsJournalEntry(response: ReflectionResponse): Promise<void> {
    try {
      await offlineMoodJournalService.createJournalEntry(
        response.userId,
        {
          content: response.responses.mainPrompt,
          tags: [...response.tags, 'reflection'],
          insights: response.insights
        },
        response.sessionId
      );
    } catch (error) {
      console.error('Error saving reflection as journal entry:', error);
    }
  }

  private async getRecentReflections(userId: string, days: number): Promise<ReflectionSession[]> {
    const sessions = await this.loadUserReflectionSessions(userId);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return sessions.filter(session => session.startTime >= cutoffDate);
  }

  private async generateSessionInsights(session: ReflectionSession): Promise<ReflectionInsights> {
    // Generate insights based on current session
    return {
      totalReflections: session.responses.length,
      averageCompletionTime: session.totalTime,
      mostReflectedTopics: session.responses.flatMap(r => r.tags).slice(0, 3),
      moodImprovementTrend: session.mood.improvement || 0,
      commonInsights: session.responses.flatMap(r => r.insights).slice(0, 3),
      growthAreas: ['mindfulness', 'self-awareness'],
      recommendations: ['Continue regular reflection practice', 'Explore deeper self-inquiry']
    };
  }

  private async identifyGrowthAreas(sessions: ReflectionSession[]): Promise<string[]> {
    // Analyze sessions to identify growth areas
    return ['mindfulness', 'emotional awareness', 'stress management'];
  }

  private async generateRecommendations(sessions: ReflectionSession[], userId: string): Promise<string[]> {
    return [
      'Lanjutkan praktik refleksi rutin untuk pengembangan diri yang berkelanjutan',
      'Eksplorasi lebih dalam topik-topik yang sering muncul dalam refleksi',
      'Pertimbangkan untuk berbagi insight dengan komunitas atau mentor'
    ];
  }

  private getDefaultInsights(): ReflectionInsights {
    return {
      totalReflections: 0,
      averageCompletionTime: 0,
      mostReflectedTopics: [],
      moodImprovementTrend: 0,
      commonInsights: [],
      growthAreas: [],
      recommendations: [
        'Mulai dengan refleksi sederhana setelah sesi meditasi',
        'Fokus pada pengamatan tanpa penilaian',
        'Catat insight yang muncul untuk referensi masa depan'
      ]
    };
  }
}

export const reflectionPromptsService = ReflectionPromptsService.getInstance();