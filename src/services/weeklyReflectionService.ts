import { offlineStorageService } from './offlineStorageService';
import { journalingService } from './journalingService';
import { offlineMoodJournalService } from './offlineMoodJournalService';

// Response types based on prompt types
type ReflectionResponse = 
  | string    // for 'text', 'reflection' types
  | number    // for 'scale' types
  | string[]  // for 'choice', 'tags' types
  | { startDate: string; endDate: string; events: string[] }; // for 'timeline' type

interface WeekMoodData {
  weeklyAverage: number;
  trend: 'improving' | 'declining' | 'stable';
  dominantEmotions: string[];
}

interface WeekMeditationData {
  totalSessions: number;
  favoriteSession: string;
  qualityTrend: number;
  insights: string[];
}

interface WeekData {
  mood: WeekMoodData;
  meditation: WeekMeditationData;
}

interface UserPatterns {
  meditationTrends: string[];
  moodPatterns: string[];
  stressIndicators: string[];
  strengthAreas: string[];
  growthOpportunities: string[];
}

interface ProcessedInsights {
  sessionInsights: {
    keyLearnings: string[];
    growthAreas: string[];
    achievements: string[];
    challenges: string[];
    gratitude: string[];
  };
  recommendations: string[];
}

interface AnalyzedUserPatterns {
  preferredDifficulty: 'easy' | 'medium' | 'deep';
  preferredDay: string;
  preferredTime: string;
  commonThemes: string[];
  typicalReflectionLength: 'short' | 'medium' | 'long';
}

export interface WeeklyReflectionTemplate {
  id: string;
  name: string;
  description: string;
  category: 'mindfulness' | 'growth' | 'gratitude' | 'goals' | 'general';
  sections: Array<{
    id: string;
    title: string;
    prompts: Array<{
      id: string;
      question: string;
      type: 'text' | 'scale' | 'choice' | 'tags' | 'timeline' | 'reflection';
      required: boolean;
      placeholder?: string;
      options?: string[];
      guidance?: string;
      minLength?: number;
      maxLength?: number;
    }>;
    estimatedTime: number; // minutes
    isOptional: boolean;
  }>;
  totalEstimatedTime: number;
  difficulty: 'easy' | 'medium' | 'deep';
  frequency: 'weekly' | 'bi-weekly' | 'monthly';
  isDefault: boolean;
  customizations?: {
    allowSkipSections: boolean;
    allowCustomPrompts: boolean;
    reminderEnabled: boolean;
    preferredDay: string;
    preferredTime: string;
  };
}

export interface WeeklyReflectionSession {
  id: string;
  userId: string;
  templateId: string;
  weekStartDate: Date;
  weekEndDate: Date;
  responses: Array<{
    sectionId: string;
    promptId: string;
    response: ReflectionResponse;
    timestamp: Date;
    timeSpent: number; // seconds
  }>;
  insights: {
    keyLearnings: string[];
    growthAreas: string[];
    achievements: string[];
    challenges: string[];
    gratitude: string[];
  };
  mood: {
    weeklyAverage: number;
    trend: 'improving' | 'declining' | 'stable';
    dominantEmotions: string[];
  };
  goals: {
    completed: string[];
    inProgress: string[];
    abandoned: string[];
    newGoals: string[];
  };
  meditationReflection: {
    totalSessions: number;
    favoriteSession: string;
    qualityTrend: number;
    insights: string[];
  };
  startTime: Date;
  completionTime?: Date;
  isCompleted: boolean;
  completionRate: number; // percentage
  nextSteps: string[];
}

export interface WeeklyInsights {
  weekNumber: number;
  year: number;
  summary: {
    overallMood: number;
    productivityLevel: number;
    stressLevel: number;
    satisfactionLevel: number;
  };
  highlights: string[];
  challenges: string[];
  learnings: string[];
  gratitude: string[];
  recommendations: string[];
  comparisonToPreviousWeek: {
    moodChange: number;
    productivityChange: number;
    stressChange: number;
    keyDifferences: string[];
  };
}

export interface ReflectionSchedule {
  userId: string;
  isEnabled: boolean;
  preferredDay: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
  preferredTime: string; // HH:mm format
  reminderEnabled: boolean;
  reminderTime: string; // HH:mm format
  autoGenerate: boolean;
  templateId: string;
  timezone: string;
}

export interface WeeklyProgress {
  weeksDone: number;
  currentStreak: number;
  longestStreak: number;
  averageCompletionRate: number;
  totalReflectionTime: number; // minutes
  improvementTrends: {
    mood: 'rising' | 'falling' | 'stable';
    stress: 'rising' | 'falling' | 'stable';
    productivity: 'rising' | 'falling' | 'stable';
    satisfaction: 'rising' | 'falling' | 'stable';
  };
}

export class WeeklyReflectionService {
  private static instance: WeeklyReflectionService;
  private templatesCache: WeeklyReflectionTemplate[] = [];
  private activeSession: WeeklyReflectionSession | null = null;

  static getInstance(): WeeklyReflectionService {
    if (!WeeklyReflectionService.instance) {
      WeeklyReflectionService.instance = new WeeklyReflectionService();
    }
    return WeeklyReflectionService.instance;
  }

  constructor() {
    this.initializeDefaultTemplates();
  }

  async startWeeklyReflection(
    userId: string,
    templateId: string,
    weekStartDate?: Date
  ): Promise<string> {
    try {
      const template = await this.getTemplate(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Calculate week dates
      const startDate = weekStartDate || this.getWeekStartDate();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);

      // Gather week data for context
      const weekData = await this.gatherWeekData(userId, startDate, endDate);

      const session: WeeklyReflectionSession = {
        id: `weekly-reflection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        templateId,
        weekStartDate: startDate,
        weekEndDate: endDate,
        responses: [],
        insights: {
          keyLearnings: [],
          growthAreas: [],
          achievements: [],
          challenges: [],
          gratitude: []
        },
        mood: weekData.mood,
        goals: {
          completed: [],
          inProgress: [],
          abandoned: [],
          newGoals: []
        },
        meditationReflection: weekData.meditation,
        startTime: new Date(),
        isCompleted: false,
        completionRate: 0,
        nextSteps: []
      };

      this.activeSession = session;
      await this.saveReflectionSession(session);

      console.log('Weekly reflection session started:', session.id);
      return session.id;
    } catch (error) {
      console.error('Error starting weekly reflection:', error);
      throw error;
    }
  }

  async submitSectionResponse(
    sessionId: string,
    sectionId: string,
    responses: Array<{
      promptId: string;
      response: ReflectionResponse;
      timeSpent: number;
    }>
  ): Promise<void> {
    try {
      if (!this.activeSession || this.activeSession.id !== sessionId) {
        this.activeSession = await this.loadReflectionSession(sessionId);
      }

      if (!this.activeSession) {
        throw new Error('Reflection session not found');
      }

      // Add responses
      for (const response of responses) {
        this.activeSession.responses.push({
          sectionId,
          promptId: response.promptId,
          response: response.response,
          timestamp: new Date(),
          timeSpent: response.timeSpent
        });
      }

      // Update completion rate
      const template = await this.getTemplate(this.activeSession.templateId);
      if (template) {
        const totalPrompts = template.sections.reduce((sum, section) => sum + section.prompts.length, 0);
        this.activeSession.completionRate = (this.activeSession.responses.length / totalPrompts) * 100;
      }

      await this.saveReflectionSession(this.activeSession);
      console.log('Section responses submitted for session:', sessionId);
    } catch (error) {
      console.error('Error submitting section response:', error);
      throw error;
    }
  }

  async completeWeeklyReflection(sessionId: string): Promise<WeeklyInsights> {
    try {
      if (!this.activeSession || this.activeSession.id !== sessionId) {
        this.activeSession = await this.loadReflectionSession(sessionId);
      }

      if (!this.activeSession) {
        throw new Error('Reflection session not found');
      }

      // Process responses and generate insights
      const insights = await this.processReflectionResponses(this.activeSession);
      
      // Update session
      this.activeSession.insights = insights.sessionInsights;
      this.activeSession.completionTime = new Date();
      this.activeSession.isCompleted = true;
      this.activeSession.nextSteps = insights.recommendations;

      await this.saveReflectionSession(this.activeSession);

      // Generate weekly insights
      const weeklyInsights = await this.generateWeeklyInsights(this.activeSession);

      // Save as journal entry for record keeping
      await this.saveAsJournalEntry(this.activeSession, weeklyInsights);

      // Clear active session
      this.activeSession = null;

      console.log('Weekly reflection completed:', sessionId);
      return weeklyInsights;
    } catch (error) {
      console.error('Error completing weekly reflection:', error);
      throw error;
    }
  }

  async getWeeklyReflectionTemplates(): Promise<WeeklyReflectionTemplate[]> {
    try {
      const customTemplates = await offlineStorageService.getSetting('customWeeklyTemplates') || [];
      return [...this.templatesCache, ...customTemplates];
    } catch (error) {
      console.error('Error getting weekly reflection templates:', error);
      return this.templatesCache;
    }
  }

  async createCustomTemplate(template: Omit<WeeklyReflectionTemplate, 'id' | 'isDefault'>): Promise<string> {
    try {
      const customTemplate: WeeklyReflectionTemplate = {
        ...template,
        id: `custom-weekly-template-${Date.now()}`,
        isDefault: false
      };

      const customTemplates = await offlineStorageService.getSetting('customWeeklyTemplates') || [];
      customTemplates.push(customTemplate);
      await offlineStorageService.setSetting('customWeeklyTemplates', customTemplates);

      console.log('Custom weekly template created:', customTemplate.id);
      return customTemplate.id;
    } catch (error) {
      console.error('Error creating custom weekly template:', error);
      throw error;
    }
  }

  async getReflectionHistory(userId: string, limit: number = 10): Promise<WeeklyReflectionSession[]> {
    try {
      const sessions = await this.loadUserReflectionSessions(userId);
      return sessions
        .sort((a, b) => new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting reflection history:', error);
      return [];
    }
  }

  async getWeeklyProgress(userId: string): Promise<WeeklyProgress> {
    try {
      const sessions = await this.loadUserReflectionSessions(userId);
      const completedSessions = sessions.filter(s => s.isCompleted);

      if (completedSessions.length === 0) {
        return this.getEmptyProgress();
      }

      // Calculate streak
      const currentStreak = this.calculateCurrentStreak(completedSessions);
      const longestStreak = this.calculateLongestStreak(completedSessions);

      // Calculate averages
      const averageCompletionRate = completedSessions.reduce((sum, s) => sum + s.completionRate, 0) / completedSessions.length;
      const totalReflectionTime = completedSessions.reduce((sum, s) => {
        if (s.completionTime) {
          return sum + (s.completionTime.getTime() - s.startTime.getTime()) / (1000 * 60);
        }
        return sum;
      }, 0);

      // Analyze trends
      const improvementTrends = this.analyzeImprovementTrends(completedSessions);

      return {
        weeksDone: completedSessions.length,
        currentStreak,
        longestStreak,
        averageCompletionRate,
        totalReflectionTime,
        improvementTrends
      };
    } catch (error) {
      console.error('Error getting weekly progress:', error);
      return this.getEmptyProgress();
    }
  }

  async setupReflectionSchedule(userId: string, schedule: ReflectionSchedule): Promise<void> {
    try {
      await offlineStorageService.setSetting(`weeklyReflectionSchedule_${userId}`, schedule);
      console.log('Weekly reflection schedule updated for user:', userId);
    } catch (error) {
      console.error('Error setting up reflection schedule:', error);
      throw error;
    }
  }

  async getReflectionSchedule(userId: string): Promise<ReflectionSchedule> {
    try {
      const schedule = await offlineStorageService.getSetting(`weeklyReflectionSchedule_${userId}`);
      
      if (schedule) {
        return schedule;
      }

      // Default schedule
      return {
        userId,
        isEnabled: false,
        preferredDay: 'sunday',
        preferredTime: '19:00',
        reminderEnabled: true,
        reminderTime: '18:00',
        autoGenerate: false,
        templateId: 'comprehensive-weekly',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };
    } catch (error) {
      console.error('Error getting reflection schedule:', error);
      throw error;
    }
  }

  async generatePersonalizedTemplate(userId: string): Promise<WeeklyReflectionTemplate> {
    try {
      // Analyze user's meditation and journaling patterns
      const userPatterns = await this.analyzeUserPatterns(userId);
      
      // Create personalized template
      const template: WeeklyReflectionTemplate = {
        id: `personalized-${userId}-${Date.now()}`,
        name: 'Refleksi Mingguan Personal',
        description: 'Template yang disesuaikan dengan pola aktivitas Anda',
        category: 'general',
        sections: await this.generatePersonalizedSections(userPatterns),
        totalEstimatedTime: 15,
        difficulty: userPatterns.preferredDifficulty || 'medium',
        frequency: 'weekly',
        isDefault: false,
        customizations: {
          allowSkipSections: true,
          allowCustomPrompts: true,
          reminderEnabled: true,
          preferredDay: userPatterns.preferredDay || 'sunday',
          preferredTime: userPatterns.preferredTime || '19:00'
        }
      };

      return template;
    } catch (error) {
      console.error('Error generating personalized template:', error);
      return this.templatesCache[0]; // Fallback to default
    }
  }

  // Private helper methods
  private initializeDefaultTemplates(): void {
    this.templatesCache = [
      {
        id: 'comprehensive-weekly',
        name: 'Refleksi Mingguan Komprehensif',
        description: 'Template lengkap untuk refleksi mendalam minggu ini',
        category: 'general',
        sections: [
          {
            id: 'week-overview',
            title: 'Gambaran Umum Minggu',
            prompts: [
              {
                id: 'week-rating',
                question: 'Secara keseluruhan, bagaimana minggu ini? (1-10)',
                type: 'scale',
                required: true,
                options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
                guidance: 'Pikirkan semua aspek: pekerjaan, hubungan, kesehatan, dan kebahagiaan'
              },
              {
                id: 'week-highlights',
                question: 'Apa tiga momen terbaik minggu ini?',
                type: 'text',
                required: true,
                placeholder: '1. ...\n2. ...\n3. ...',
                guidance: 'Fokus pada momen yang membuat Anda merasa hidup dan bersyukur'
              },
              {
                id: 'week-challenges',
                question: 'Tantangan utama apa yang Anda hadapi?',
                type: 'text',
                required: false,
                placeholder: 'Ceritakan tentang kesulitan dan bagaimana Anda mengatasinya...'
              }
            ],
            estimatedTime: 5,
            isOptional: false
          },
          {
            id: 'personal-growth',
            title: 'Pertumbuhan Personal',
            prompts: [
              {
                id: 'learnings',
                question: 'Apa yang Anda pelajari tentang diri Anda minggu ini?',
                type: 'text',
                required: true,
                placeholder: 'Insight baru tentang kekuatan, kelemahan, atau pola perilaku...',
                minLength: 50
              },
              {
                id: 'growth-areas',
                question: 'Area mana yang ingin Anda kembangkan minggu depan?',
                type: 'tags',
                required: false,
                options: ['komunikasi', 'kesabaran', 'fokus', 'empati', 'disiplin', 'kreativitas', 'kepemimpinan']
              }
            ],
            estimatedTime: 4,
            isOptional: false
          },
          {
            id: 'meditation-reflection',
            title: 'Refleksi Meditasi',
            prompts: [
              {
                id: 'meditation-frequency',
                question: 'Berapa kali Anda bermeditasi minggu ini?',
                type: 'scale',
                required: false,
                options: ['0', '1-2', '3-4', '5-6', '7+']
              },
              {
                id: 'meditation-impact',
                question: 'Bagaimana meditasi mempengaruhi mood dan fokus Anda?',
                type: 'text',
                required: false,
                placeholder: 'Ceritakan perubahan yang Anda rasakan...'
              }
            ],
            estimatedTime: 3,
            isOptional: true
          },
          {
            id: 'gratitude-goals',
            title: 'Syukur & Tujuan',
            prompts: [
              {
                id: 'gratitude',
                question: 'Apa yang paling Anda syukuri minggu ini?',
                type: 'text',
                required: true,
                placeholder: 'Tuliskan hal-hal yang membuat hati Anda hangat...'
              },
              {
                id: 'next-week-focus',
                question: 'Apa fokus utama Anda untuk minggu depan?',
                type: 'text',
                required: true,
                placeholder: 'Satu atau dua hal yang ingin Anda prioritaskan...'
              }
            ],
            estimatedTime: 3,
            isOptional: false
          }
        ],
        totalEstimatedTime: 15,
        difficulty: 'medium',
        frequency: 'weekly',
        isDefault: true
      },
      {
        id: 'simple-weekly',
        name: 'Refleksi Mingguan Sederhana',
        description: 'Template singkat untuk refleksi cepat',
        category: 'general',
        sections: [
          {
            id: 'quick-check',
            title: 'Check-in Cepat',
            prompts: [
              {
                id: 'mood-week',
                question: 'Bagaimana mood Anda secara keseluruhan minggu ini?',
                type: 'scale',
                required: true,
                options: ['1', '2', '3', '4', '5']
              },
              {
                id: 'best-moment',
                question: 'Apa momen terbaik minggu ini?',
                type: 'text',
                required: true,
                placeholder: 'Satu momen yang membuat Anda bahagia...'
              },
              {
                id: 'gratitude-simple',
                question: 'Apa yang Anda syukuri?',
                type: 'text',
                required: true,
                placeholder: 'Hal yang membuat Anda bersyukur...'
              },
              {
                id: 'next-week-intention',
                question: 'Apa niat Anda untuk minggu depan?',
                type: 'text',
                required: true,
                placeholder: 'Satu hal yang ingin Anda fokuskan...'
              }
            ],
            estimatedTime: 5,
            isOptional: false
          }
        ],
        totalEstimatedTime: 5,
        difficulty: 'easy',
        frequency: 'weekly',
        isDefault: true
      }
    ];
  }

  private getWeekStartDate(date: Date = new Date()): Date {
    const startDate = new Date(date);
    const day = startDate.getDay();
    const diff = startDate.getDate() - day; // Sunday is 0
    return new Date(startDate.setDate(diff));
  }

  private async gatherWeekData(userId: string, startDate: Date, endDate: Date): Promise<WeekData> {
    try {
      // Get meditation sessions for the week
      const meditationData = await this.getWeekMeditationData(userId, startDate, endDate);
      
      // Get mood data for the week
      const moodData = await this.getWeekMoodData(userId, startDate, endDate);

      return {
        mood: moodData,
        meditation: meditationData
      };
    } catch (error) {
      console.error('Error gathering week data:', error);
      return {
        mood: {
          weeklyAverage: 3,
          trend: 'stable' as const,
          dominantEmotions: []
        },
        meditation: {
          totalSessions: 0,
          favoriteSession: '',
          qualityTrend: 0,
          insights: []
        }
      };
    }
  }

  private async getWeekMeditationData(userId: string, startDate: Date, endDate: Date): Promise<WeekMeditationData> {
    // Mock implementation - would integrate with meditation progress service
    return {
      totalSessions: 4,
      favoriteSession: 'morning-mindfulness',
      qualityTrend: 0.2,
      insights: ['Improved focus during work', 'Less reactive to stress']
    };
  }

  private async getWeekMoodData(userId: string, startDate: Date, endDate: Date): Promise<WeekMoodData> {
    try {
      const moods = await offlineMoodJournalService.getMoodHistory(userId, 7);
      
      if (moods.length === 0) {
        return {
          weeklyAverage: 3,
          trend: 'stable' as const,
          dominantEmotions: []
        };
      }

      const weeklyAverage = moods.reduce((sum, mood) => sum + mood.overall, 0) / moods.length;
      
      // Simple trend analysis
      const recentMoods = moods.slice(0, 3);
      const olderMoods = moods.slice(3, 6);
      let trend: 'improving' | 'declining' | 'stable' = 'stable';
      
      if (recentMoods.length > 0 && olderMoods.length > 0) {
        const recentAvg = recentMoods.reduce((sum, m) => sum + m.overall, 0) / recentMoods.length;
        const olderAvg = olderMoods.reduce((sum, m) => sum + m.overall, 0) / olderMoods.length;
        
        if (recentAvg > olderAvg + 0.5) trend = 'improving';
        else if (recentAvg < olderAvg - 0.5) trend = 'declining';
      }

      // Get dominant emotions
      const allTags = moods.flatMap(mood => mood.tags);
      const tagCounts = allTags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const dominantEmotions = Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([tag]) => tag);

      return {
        weeklyAverage,
        trend,
        dominantEmotions
      };
    } catch (error) {
      console.error('Error getting week mood data:', error);
      return {
        weeklyAverage: 3,
        trend: 'stable' as const,
        dominantEmotions: []
      };
    }
  }

  private async getTemplate(templateId: string): Promise<WeeklyReflectionTemplate | null> {
    const templates = await this.getWeeklyReflectionTemplates();
    return templates.find(t => t.id === templateId) || null;
  }

  private async processReflectionResponses(session: WeeklyReflectionSession): Promise<ProcessedInsights> {
    // Process responses and extract insights
    const responses = session.responses;
    
    const insights = {
      sessionInsights: {
        keyLearnings: [] as string[],
        growthAreas: [] as string[],
        achievements: [] as string[],
        challenges: [] as string[],
        gratitude: [] as string[]
      },
      recommendations: [] as string[]
    };

    // Extract insights from responses
    for (const response of responses) {
      if (response.promptId.includes('learning')) {
        insights.sessionInsights.keyLearnings.push((response.response as any).responses.mainPrompt);
      } else if (response.promptId.includes('challenge')) {
        insights.sessionInsights.challenges.push((response.response as any).responses.mainPrompt);
      } else if (response.promptId.includes('gratitude')) {
        insights.sessionInsights.gratitude.push((response.response as any).responses.mainPrompt);
      }
    }

    // Generate recommendations
    insights.recommendations = [
      'Continue regular weekly reflection practice',
      'Focus on identified growth areas',
      'Celebrate small wins and progress'
    ];

    return insights;
  }

  private async generateWeeklyInsights(session: WeeklyReflectionSession): Promise<WeeklyInsights> {
    const weekNumber = this.getWeekNumber(session.weekStartDate);
    const year = session.weekStartDate.getFullYear();

    return {
      weekNumber,
      year,
      summary: {
        overallMood: session.mood.weeklyAverage,
        productivityLevel: 7, // Would calculate from responses
        stressLevel: 4, // Would calculate from responses
        satisfactionLevel: 8 // Would calculate from responses
      },
      highlights: session.insights.achievements,
      challenges: session.insights.challenges,
      learnings: session.insights.keyLearnings,
      gratitude: session.insights.gratitude,
      recommendations: session.nextSteps,
      comparisonToPreviousWeek: {
        moodChange: 0.5, // Would calculate from previous week
        productivityChange: 0.2,
        stressChange: -0.3,
        keyDifferences: ['Improved stress management', 'Better work-life balance']
      }
    };
  }

  private async saveAsJournalEntry(session: WeeklyReflectionSession, insights: WeeklyInsights): Promise<void> {
    try {
      const content = this.formatReflectionAsJournalEntry(session, insights);
      
      await journalingService.createJournalEntry(session.userId, {
        title: `Refleksi Mingguan - ${insights.weekNumber}/${insights.year}`,
        content,
        type: 'reflection',
        tags: ['weekly-reflection', 'insights', 'growth'],
        privacy: 'private'
      });
    } catch (error) {
      console.error('Error saving reflection as journal entry:', error);
    }
  }

  private formatReflectionAsJournalEntry(session: WeeklyReflectionSession, insights: WeeklyInsights): string {
    let content = `# Refleksi Mingguan - Minggu ${insights.weekNumber}/${insights.year}\n\n`;
    
    content += `## Ringkasan\n`;
    content += `- Mood keseluruhan: ${insights.summary.overallMood}/10\n`;
    content += `- Tingkat produktivitas: ${insights.summary.productivityLevel}/10\n`;
    content += `- Tingkat stress: ${insights.summary.stressLevel}/10\n\n`;
    
    if (insights.highlights.length > 0) {
      content += `## Highlight Minggu Ini\n`;
      insights.highlights.forEach(highlight => content += `- ${highlight}\n`);
      content += '\n';
    }

    if (insights.learnings.length > 0) {
      content += `## Pembelajaran\n`;
      insights.learnings.forEach(learning => content += `- ${learning}\n`);
      content += '\n';
    }

    if (insights.gratitude.length > 0) {
      content += `## Rasa Syukur\n`;
      insights.gratitude.forEach(gratitude => content += `- ${gratitude}\n`);
      content += '\n';
    }

    return content;
  }

  private async saveReflectionSession(session: WeeklyReflectionSession): Promise<void> {
    const key = `weeklyReflectionSession_${session.id}`;
    await offlineStorageService.setSetting(key, session);
  }

  private async loadReflectionSession(sessionId: string): Promise<WeeklyReflectionSession | null> {
    const key = `weeklyReflectionSession_${sessionId}`;
    return await offlineStorageService.getSetting(key);
  }

  private async loadUserReflectionSessions(userId: string): Promise<WeeklyReflectionSession[]> {
    // Mock implementation - would query actual storage with user index
    return [];
  }

  private calculateCurrentStreak(sessions: WeeklyReflectionSession[]): number {
    // Calculate consecutive weeks of completed reflections
    return 3; // Mock implementation
  }

  private calculateLongestStreak(sessions: WeeklyReflectionSession[]): number {
    // Calculate longest consecutive streak
    return 5; // Mock implementation
  }

  private analyzeImprovementTrends(sessions: WeeklyReflectionSession[]): WeeklyProgress['improvementTrends'] {
    // Analyze trends across multiple weeks
    return {
      mood: 'rising',
      stress: 'falling',
      productivity: 'stable',
      satisfaction: 'rising'
    };
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  private async analyzeUserPatterns(userId: string): Promise<AnalyzedUserPatterns> {
    // Analyze user's meditation and journaling patterns
    return {
      preferredDifficulty: 'medium',
      preferredDay: 'sunday',
      preferredTime: '19:00',
      commonThemes: ['gratitude', 'growth', 'mindfulness'],
      typicalReflectionLength: 'medium'
    };
  }

  private async generatePersonalizedSections(patterns: AnalyzedUserPatterns): Promise<WeeklyReflectionTemplate['sections']> {
    // Generate sections based on user patterns
    return [
      {
        id: 'personalized-overview',
        title: 'Gambaran Minggu',
        prompts: [
          {
            id: 'mood-check',
            question: 'Bagaimana perasaan Anda secara keseluruhan minggu ini?',
            type: 'scale',
            required: true,
            options: ['1', '2', '3', '4', '5']
          }
        ],
        estimatedTime: 3,
        isOptional: false
      }
    ];
  }

  private getEmptyProgress(): WeeklyProgress {
    return {
      weeksDone: 0,
      currentStreak: 0,
      longestStreak: 0,
      averageCompletionRate: 0,
      totalReflectionTime: 0,
      improvementTrends: {
        mood: 'stable',
        stress: 'stable',
        productivity: 'stable',
        satisfaction: 'stable'
      }
    };
  }
}

export const weeklyReflectionService = WeeklyReflectionService.getInstance();