import { offlineStorageService } from './offlineStorageService';
import { journalingService } from './journalingService';
import { offlineMoodJournalService } from './offlineMoodJournalService';

export interface GratitudeEntry {
  id: string;
  userId: string;
  date: Date;
  gratitudes: Array<{
    id: string;
    text: string;
    category: 'people' | 'experiences' | 'things' | 'opportunities' | 'nature' | 'achievements' | 'health' | 'other';
    intensity: number; // 1-5 scale
    tags: string[];
    relatedMemory?: string;
  }>;
  reflection?: string;
  mood: {
    before?: number;
    after?: number;
    improvement: number;
  };
  promptType: 'three_things' | 'detailed' | 'specific_category' | 'photo_prompt' | 'custom';
  isShared: boolean;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: 'pending' | 'synced' | 'failed';
}

export interface GratitudePrompt {
  id: string;
  type: 'general' | 'specific' | 'category_focused' | 'memory_based' | 'relationship' | 'achievement';
  prompt: string;
  category?: string;
  followUpQuestions: string[];
  difficulty: 'easy' | 'medium' | 'deep';
  estimatedTime: number; // minutes
  context: {
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
    mood?: 'low' | 'medium' | 'high';
    season?: 'spring' | 'summer' | 'fall' | 'winter';
  };
}

export interface GratitudeChallenge {
  id: string;
  name: string;
  description: string;
  duration: number; // days
  type: '30_day' | '7_day' | 'weekly' | 'monthly';
  dailyPrompts: Array<{
    day: number;
    prompt: string;
    focus?: string;
    tip?: string;
  }>;
  rewards: Array<{
    milestone: number; // day number
    title: string;
    description: string;
    badge?: string;
  }>;
  isActive: boolean;
  participants: number;
}

export interface GratitudeStats {
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
  averageMoodImprovement: number;
  mostGratefulCategories: Array<{ category: string; count: number; percentage: number }>;
  gratitudeWords: number;
  monthlyTrend: Array<{ month: string; entries: number; avgMood: number }>;
  topGratitudes: Array<{ text: string; frequency: number; lastMentioned: Date }>;
  weeklyPattern: Array<{ day: string; avgEntries: number }>;
}

export interface GratitudeInsights {
  personalityProfile: {
    type: 'appreciator' | 'achiever' | 'connector' | 'explorer' | 'nurturer';
    description: string;
    strengths: string[];
    suggestions: string[];
  };
  patterns: {
    preferredCategories: string[];
    emotionalTriggers: string[];
    timePreferences: string[];
    gratitudeStyle: 'detailed' | 'brief' | 'visual' | 'reflective';
  };
  recommendations: {
    nextPrompts: string[];
    challenges: string[];
    focusAreas: string[];
    sharingOpportunities: string[];
  };
  moodCorrelation: {
    beforeGratitude: number;
    afterGratitude: number;
    improvementRate: number;
    bestPerformingPrompts: string[];
  };
}

export interface GratitudeReminder {
  id: string;
  userId: string;
  time: string; // HH:mm format
  frequency: 'daily' | 'weekly' | 'custom';
  days: string[]; // ['monday', 'tuesday', etc.]
  message: string;
  promptType: string;
  isEnabled: boolean;
  lastSent?: Date;
}

export class GratitudeJournalService {
  private static instance: GratitudeJournalService;
  private promptsCache: GratitudePrompt[] = [];
  private challengesCache: GratitudeChallenge[] = [];
  private currentChallenge: GratitudeChallenge | null = null;

  static getInstance(): GratitudeJournalService {
    if (!GratitudeJournalService.instance) {
      GratitudeJournalService.instance = new GratitudeJournalService();
    }
    return GratitudeJournalService.instance;
  }

  constructor() {
    this.initializePrompts();
    this.initializeChallenges();
  }

  async createGratitudeEntry(
    userId: string,
    entryData: {
      gratitudes: Array<{
        text: string;
        category?: GratitudeEntry['gratitudes'][0]['category'];
        intensity?: number;
        tags?: string[];
        relatedMemory?: string;
      }>;
      reflection?: string;
      promptType?: GratitudeEntry['promptType'];
      moodBefore?: number;
      moodAfter?: number;
    }
  ): Promise<string> {
    try {
      const entry: GratitudeEntry = {
        id: `gratitude-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        date: new Date(),
        gratitudes: entryData.gratitudes.map((g, index) => ({
          id: `gratitude-item-${index}-${Date.now()}`,
          text: g.text,
          category: g.category || 'other',
          intensity: g.intensity || 4,
          tags: g.tags || [],
          relatedMemory: g.relatedMemory
        })),
        reflection: entryData.reflection,
        mood: {
          before: entryData.moodBefore,
          after: entryData.moodAfter,
          improvement: entryData.moodAfter && entryData.moodBefore 
            ? entryData.moodAfter - entryData.moodBefore 
            : 0
        },
        promptType: entryData.promptType || 'three_things',
        isShared: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        syncStatus: 'pending'
      };

      // Save to storage
      await this.saveGratitudeEntry(entry);

      // Update challenge progress if applicable
      await this.updateChallengeProgress(userId, entry);

      // Save as regular journal entry for integration
      await this.saveAsJournalEntry(entry);

      // Update stats and patterns
      await this.updateGratitudeStats(userId, entry);

      console.log('Gratitude entry created:', entry.id);
      return entry.id;
    } catch (error) {
      console.error('Error creating gratitude entry:', error);
      throw error;
    }
  }

  async getGratitudeEntries(
    userId: string,
    filters?: {
      dateRange?: { start: Date; end: Date };
      category?: string;
      minIntensity?: number;
      limit?: number;
      offset?: number;
    }
  ): Promise<GratitudeEntry[]> {
    try {
      let entries = await this.loadUserGratitudeEntries(userId);

      // Apply filters
      if (filters) {
        if (filters.dateRange) {
          entries = entries.filter(entry => 
            entry.date >= filters.dateRange!.start && 
            entry.date <= filters.dateRange!.end
          );
        }

        if (filters.category) {
          entries = entries.filter(entry =>
            entry.gratitudes.some(g => g.category === filters.category)
          );
        }

        if (filters.minIntensity) {
          entries = entries.filter(entry =>
            entry.gratitudes.some(g => g.intensity >= filters.minIntensity!)
          );
        }
      }

      // Sort by date (newest first)
      entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Apply pagination
      if (filters?.offset) {
        entries = entries.slice(filters.offset);
      }
      if (filters?.limit) {
        entries = entries.slice(0, filters.limit);
      }

      return entries;
    } catch (error) {
      console.error('Error getting gratitude entries:', error);
      return [];
    }
  }

  async getTodaysGratitudePrompt(userId: string): Promise<GratitudePrompt> {
    try {
      const userPreferences = await this.getUserGratitudePreferences(userId);
      const currentTime = new Date();
      const timeOfDay = this.getTimeOfDay(currentTime.getHours());
      const recentEntries = await this.getGratitudeEntries(userId, { limit: 5 });

      // Check if user is in a challenge
      const activeChallenge = await this.getActiveChallenge(userId);
      if (activeChallenge) {
        return await this.getChallengePromptForToday(activeChallenge, userId);
      }

      // Filter prompts based on context
      let availablePrompts = this.promptsCache.filter(prompt => {
        // Filter by time of day
        if (prompt.context.timeOfDay && prompt.context.timeOfDay !== timeOfDay) {
          return false;
        }

        // Filter by user mood if available
        if (userPreferences.lastMood && prompt.context.mood) {
          const moodLevel = userPreferences.lastMood <= 2 ? 'low' : 
                           userPreferences.lastMood <= 3 ? 'medium' : 'high';
          if (prompt.context.mood !== moodLevel) {
            return false;
          }
        }

        return true;
      });

      // Avoid recently used prompts
      const recentPromptTypes = recentEntries.map(entry => entry.promptType);
      availablePrompts = availablePrompts.filter(prompt => 
        !recentPromptTypes.includes(prompt.type as any)
      );

      // Select based on user preferences
      const selectedPrompt = this.selectOptimalPrompt(availablePrompts, userPreferences);
      
      return selectedPrompt || this.promptsCache[0]; // Fallback to first prompt
    } catch (error) {
      console.error('Error getting today\'s gratitude prompt:', error);
      return this.promptsCache[0];
    }
  }

  async getPersonalizedPrompts(userId: string, count: number = 3): Promise<GratitudePrompt[]> {
    try {
      const userInsights = await this.getGratitudeInsights(userId);
      const preferences = await this.getUserGratitudePreferences(userId);
      
      // Generate personalized prompts based on insights
      const personalizedPrompts = this.generatePersonalizedPrompts(userInsights, preferences);
      
      return personalizedPrompts.slice(0, count);
    } catch (error) {
      console.error('Error getting personalized prompts:', error);
      return this.promptsCache.slice(0, count);
    }
  }

  async startGratitudeChallenge(userId: string, challengeId: string): Promise<void> {
    try {
      const challenge = this.challengesCache.find(c => c.id === challengeId);
      if (!challenge) {
        throw new Error('Challenge not found');
      }

      // Save user's participation
      const participation = {
        userId,
        challengeId,
        startDate: new Date(),
        currentDay: 1,
        completedDays: [],
        isActive: true
      };

      await offlineStorageService.setSetting(`gratitudeChallenge_${userId}`, participation);
      
      console.log(`User ${userId} started gratitude challenge: ${challengeId}`);
    } catch (error) {
      console.error('Error starting gratitude challenge:', error);
      throw error;
    }
  }

  async getGratitudeStats(userId: string): Promise<GratitudeStats> {
    try {
      const entries = await this.getGratitudeEntries(userId);
      
      if (entries.length === 0) {
        return this.getEmptyStats();
      }

      // Calculate basic stats
      const totalEntries = entries.length;
      const currentStreak = this.calculateCurrentStreak(entries);
      const longestStreak = this.calculateLongestStreak(entries);
      
      // Calculate mood improvement
      const moodEntries = entries.filter(e => e.mood.improvement !== 0);
      const averageMoodImprovement = moodEntries.length > 0
        ? moodEntries.reduce((sum, e) => sum + e.mood.improvement, 0) / moodEntries.length
        : 0;

      // Category analysis
      const categoryStats = this.analyzeCategoryStats(entries);
      const mostGratefulCategories = this.calculateCategoryPercentages(categoryStats);

      // Calculate total words
      const gratitudeWords = entries.reduce((sum, entry) => 
        sum + entry.gratitudes.reduce((wordSum, g) => wordSum + g.text.split(' ').length, 0), 0
      );

      // Monthly trend
      const monthlyTrend = this.calculateMonthlyTrend(entries);

      // Top gratitudes (most frequently mentioned themes)
      const topGratitudes = this.findTopGratitudes(entries);

      // Weekly pattern
      const weeklyPattern = this.calculateWeeklyPattern(entries);

      return {
        totalEntries,
        currentStreak,
        longestStreak,
        averageMoodImprovement,
        mostGratefulCategories,
        gratitudeWords,
        monthlyTrend,
        topGratitudes,
        weeklyPattern
      };
    } catch (error) {
      console.error('Error getting gratitude stats:', error);
      return this.getEmptyStats();
    }
  }

  async getGratitudeInsights(userId: string): Promise<GratitudeInsights> {
    try {
      const entries = await this.getGratitudeEntries(userId);
      const stats = await this.getGratitudeStats(userId);

      if (entries.length < 5) {
        return this.getBasicInsights();
      }

      // Analyze personality profile
      const personalityProfile = this.analyzePersonalityProfile(entries, stats);

      // Analyze patterns
      const patterns = this.analyzeGratitudePatterns(entries);

      // Generate recommendations
      const recommendations = this.generateRecommendations(entries, stats, patterns);

      // Mood correlation analysis
      const moodCorrelation = this.analyzeMoodCorrelation(entries);

      return {
        personalityProfile,
        patterns,
        recommendations,
        moodCorrelation
      };
    } catch (error) {
      console.error('Error getting gratitude insights:', error);
      return this.getBasicInsights();
    }
  }

  async setupGratitudeReminders(userId: string, reminders: GratitudeReminder[]): Promise<void> {
    try {
      await offlineStorageService.setSetting(`gratitudeReminders_${userId}`, reminders);
      console.log('Gratitude reminders updated for user:', userId);
    } catch (error) {
      console.error('Error setting up gratitude reminders:', error);
      throw error;
    }
  }

  async getGratitudeReminders(userId: string): Promise<GratitudeReminder[]> {
    try {
      const reminders = await offlineStorageService.getSetting(`gratitudeReminders_${userId}`);
      return reminders || [];
    } catch (error) {
      console.error('Error getting gratitude reminders:', error);
      return [];
    }
  }

  async shareGratitudeEntry(entryId: string, platform: 'community' | 'social'): Promise<string> {
    try {
      // Mock implementation - would integrate with sharing platforms
      const shareUrl = `https://sembalun.app/gratitude/${entryId}`;
      console.log(`Gratitude entry shared to ${platform}: ${shareUrl}`);
      return shareUrl;
    } catch (error) {
      console.error('Error sharing gratitude entry:', error);
      throw error;
    }
  }

  async searchGratitude(userId: string, query: string): Promise<GratitudeEntry[]> {
    try {
      const entries = await this.getGratitudeEntries(userId);
      const lowerQuery = query.toLowerCase();

      return entries.filter(entry => 
        entry.gratitudes.some(g => 
          g.text.toLowerCase().includes(lowerQuery) ||
          g.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        ) ||
        (entry.reflection && entry.reflection.toLowerCase().includes(lowerQuery))
      );
    } catch (error) {
      console.error('Error searching gratitude entries:', error);
      return [];
    }
  }

  // Private helper methods
  private initializePrompts(): void {
    this.promptsCache = [
      {
        id: 'three-simple',
        type: 'general',
        prompt: 'Sebutkan tiga hal yang Anda syukuri hari ini',
        followUpQuestions: [
          'Mengapa hal-hal tersebut bermakna bagi Anda?',
          'Bagaimana perasaan Anda ketika memikirkannya?'
        ],
        difficulty: 'easy',
        estimatedTime: 3,
        context: {}
      },
      {
        id: 'people-appreciation',
        type: 'relationship',
        prompt: 'Pikirkan tentang seseorang yang membuat hari Anda lebih baik. Apa yang mereka lakukan?',
        followUpQuestions: [
          'Bagaimana Anda bisa menunjukkan apresiasi kepada mereka?',
          'Apa yang bisa Anda pelajari dari kebaikan mereka?'
        ],
        difficulty: 'medium',
        estimatedTime: 4,
        context: { timeOfDay: 'evening' }
      },
      {
        id: 'small-moments',
        type: 'specific',
        prompt: 'Ceritakan tentang satu momen kecil hari ini yang membuat Anda tersenyum',
        followUpQuestions: [
          'Apa yang membuat momen itu istimewa?',
          'Bagaimana Anda bisa menciptakan lebih banyak momen seperti ini?'
        ],
        difficulty: 'easy',
        estimatedTime: 3,
        context: { mood: 'low' }
      },
      {
        id: 'achievement-gratitude',
        type: 'achievement',
        prompt: 'Apa pencapaian kecil yang Anda banggakan minggu ini?',
        followUpQuestions: [
          'Siapa atau apa yang membantu Anda mencapainya?',
          'Bagaimana pencapaian ini mempengaruhi kepercayaan diri Anda?'
        ],
        difficulty: 'medium',
        estimatedTime: 5,
        context: { timeOfDay: 'morning' }
      },
      {
        id: 'nature-connection',
        type: 'category_focused',
        prompt: 'Apa dari alam sekitar yang membuat Anda merasa damai hari ini?',
        category: 'nature',
        followUpQuestions: [
          'Bagaimana alam mempengaruhi suasana hati Anda?',
          'Kapan terakhir kali Anda benar-benar merasakan koneksi dengan alam?'
        ],
        difficulty: 'medium',
        estimatedTime: 4,
        context: { season: 'spring' }
      },
      {
        id: 'comfort-gratitude',
        type: 'specific',
        prompt: 'Apa yang membuat Anda merasa nyaman dan aman hari ini?',
        followUpQuestions: [
          'Siapa yang berkontribusi pada perasaan aman ini?',
          'Bagaimana Anda bisa berbagi rasa nyaman ini dengan orang lain?'
        ],
        difficulty: 'easy',
        estimatedTime: 3,
        context: { timeOfDay: 'night', mood: 'medium' }
      }
    ];
  }

  private initializeChallenges(): void {
    this.challengesCache = [
      {
        id: '30-day-gratitude',
        name: '30 Hari Syukur',
        description: 'Bangun kebiasaan bersyukur selama 30 hari dengan prompt harian yang beragam',
        duration: 30,
        type: '30_day',
        dailyPrompts: Array.from({ length: 30 }, (_, i) => ({
          day: i + 1,
          prompt: `Hari ${i + 1}: ${this.getDailyChallengePrompt(i + 1)}`,
          focus: this.getDailyFocus(i + 1),
          tip: this.getDailyTip(i + 1)
        })),
        rewards: [
          { milestone: 7, title: 'Pemula Syukur', description: '7 hari berturut-turut!', badge: '🌱' },
          { milestone: 14, title: 'Penjelajah Syukur', description: '2 minggu konsisten!', badge: '🌿' },
          { milestone: 21, title: 'Ahli Syukur', description: '3 minggu luar biasa!', badge: '🌳' },
          { milestone: 30, title: 'Master Syukur', description: 'Selamat! 30 hari penuh!', badge: '🏆' }
        ],
        isActive: true,
        participants: 1247
      },
      {
        id: '7-day-relationships',
        name: '7 Hari Apresiasi Hubungan',
        description: 'Fokus pada orang-orang penting dalam hidup Anda',
        duration: 7,
        type: '7_day',
        dailyPrompts: [
          { day: 1, prompt: 'Keluarga yang selalu ada untuk Anda', focus: 'Keluarga' },
          { day: 2, prompt: 'Teman yang membuat Anda tertawa', focus: 'Persahabatan' },
          { day: 3, prompt: 'Mentor atau guru yang menginspirasi', focus: 'Pembelajaran' },
          { day: 4, prompt: 'Seseorang yang pernah membantu di saat sulit', focus: 'Dukungan' },
          { day: 5, prompt: 'Orang yang mengajarkan nilai-nilai penting', focus: 'Nilai' },
          { day: 6, prompt: 'Seseorang yang membuat Anda merasa dihargai', focus: 'Penghargaan' },
          { day: 7, prompt: 'Semua orang yang menjadi bagian perjalanan hidup Anda', focus: 'Komunitas' }
        ],
        rewards: [
          { milestone: 7, title: 'Konektor Hati', description: 'Menghargai semua hubungan!', badge: '💝' }
        ],
        isActive: true,
        participants: 892
      }
    ];
  }

  private getDailyChallengePrompt(day: number): string {
    const prompts = [
      'Tiga hal sederhana yang membuat hari ini istimewa',
      'Seseorang yang membuat Anda tersenyum',
      'Pengalaman belajar yang berharga',
      'Kenyamanan yang sering diabaikan',
      'Pencapaian kecil yang membanggakan',
      // ... would have 30 unique prompts
    ];
    return prompts[(day - 1) % prompts.length];
  }

  private getDailyFocus(day: number): string {
    const focuses = ['Dasar', 'Hubungan', 'Pertumbuhan', 'Kenyamanan', 'Pencapaian'];
    return focuses[(day - 1) % focuses.length];
  }

  private getDailyTip(day: number): string {
    const tips = [
      'Tuliskan dengan detail, bukan hanya daftar',
      'Pikirkan tentang perasaan, bukan hanya fakta',
      'Fokus pada hal-hal kecil yang sering terlewat',
      'Libatkan semua indra dalam refleksi Anda',
      'Hubungkan dengan nilai-nilai personal Anda'
    ];
    return tips[(day - 1) % tips.length];
  }

  private getTimeOfDay(hour: number): 'morning' | 'afternoon' | 'evening' | 'night' {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  private async getUserGratitudePreferences(userId: string): Promise<any> {
    const prefs = await offlineStorageService.getSetting(`gratitudePreferences_${userId}`);
    return prefs || {
      preferredTime: 'evening',
      difficulty: 'medium',
      categories: [],
      lastMood: 3
    };
  }

  private selectOptimalPrompt(prompts: GratitudePrompt[], preferences: any): GratitudePrompt {
    // Select prompt based on user preferences and context
    return prompts.find(p => p.difficulty === preferences.difficulty) || prompts[0];
  }

  private generatePersonalizedPrompts(insights: GratitudeInsights, preferences: any): GratitudePrompt[] {
    // Generate prompts based on user insights and patterns
    return this.promptsCache.slice(0, 3); // Simplified implementation
  }

  private async getActiveChallenge(userId: string): Promise<any> {
    const participation = await offlineStorageService.getSetting(`gratitudeChallenge_${userId}`);
    return participation?.isActive ? participation : null;
  }

  private async getChallengePromptForToday(challenge: any, userId: string): Promise<GratitudePrompt> {
    const challengeData = this.challengesCache.find(c => c.id === challenge.challengeId);
    const todayPrompt = challengeData?.dailyPrompts[challenge.currentDay - 1];
    
    return {
      id: `challenge-${challenge.challengeId}-day-${challenge.currentDay}`,
      type: 'specific',
      prompt: todayPrompt?.prompt || 'Apa yang Anda syukuri hari ini?',
      followUpQuestions: ['Mengapa hal ini bermakna dalam perjalanan syukur Anda?'],
      difficulty: 'medium',
      estimatedTime: 4,
      context: {}
    };
  }

  private async saveGratitudeEntry(entry: GratitudeEntry): Promise<void> {
    const key = `gratitudeEntry_${entry.id}`;
    await offlineStorageService.setSetting(key, entry);
  }

  private async loadUserGratitudeEntries(userId: string): Promise<GratitudeEntry[]> {
    // Mock implementation - would query actual storage with user index
    return [];
  }

  private async updateChallengeProgress(userId: string, entry: GratitudeEntry): Promise<void> {
    const challenge = await this.getActiveChallenge(userId);
    if (challenge) {
      challenge.currentDay++;
      challenge.completedDays.push(entry.date.toDateString());
      await offlineStorageService.setSetting(`gratitudeChallenge_${userId}`, challenge);
    }
  }

  private async saveAsJournalEntry(entry: GratitudeEntry): Promise<void> {
    try {
      const content = this.formatGratitudeAsJournalContent(entry);
      
      await journalingService.createJournalEntry(entry.userId, {
        title: `Jurnal Syukur - ${entry.date.toLocaleDateString('id-ID')}`,
        content,
        type: 'gratitude',
        tags: ['gratitude', 'daily-practice', ...entry.gratitudes.flatMap(g => g.tags)],
        mood: entry.mood,
        privacy: 'private'
      });
    } catch (error) {
      console.error('Error saving gratitude as journal entry:', error);
    }
  }

  private formatGratitudeAsJournalContent(entry: GratitudeEntry): string {
    let content = '# Jurnal Syukur\n\n';
    
    entry.gratitudes.forEach((gratitude, index) => {
      content += `## ${index + 1}. ${gratitude.text}\n`;
      content += `*Kategori: ${gratitude.category}*\n`;
      content += `*Intensitas: ${gratitude.intensity}/5*\n`;
      if (gratitude.relatedMemory) {
        content += `*Kenangan terkait: ${gratitude.relatedMemory}*\n`;
      }
      content += '\n';
    });

    if (entry.reflection) {
      content += `## Refleksi\n${entry.reflection}\n\n`;
    }

    return content;
  }

  private async updateGratitudeStats(userId: string, entry: GratitudeEntry): Promise<void> {
    // Update user statistics and patterns
    // Mock implementation
  }

  private calculateCurrentStreak(entries: GratitudeEntry[]): number {
    // Calculate consecutive days with gratitude entries
    if (entries.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    const currentDate = new Date(today);

    for (let i = 0; i < 365; i++) {
      const hasEntry = entries.some(entry => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === currentDate.getTime();
      });

      if (hasEntry) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  private calculateLongestStreak(entries: GratitudeEntry[]): number {
    // Implementation for calculating longest streak
    return this.calculateCurrentStreak(entries); // Simplified
  }

  private analyzeCategoryStats(entries: GratitudeEntry[]): Record<string, number> {
    const categoryStats: Record<string, number> = {};
    
    for (const entry of entries) {
      for (const gratitude of entry.gratitudes) {
        categoryStats[gratitude.category] = (categoryStats[gratitude.category] || 0) + 1;
      }
    }
    
    return categoryStats;
  }

  private calculateCategoryPercentages(categoryStats: Record<string, number>): Array<{ category: string; count: number; percentage: number }> {
    const total = Object.values(categoryStats).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(categoryStats)
      .map(([category, count]) => ({
        category,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private calculateMonthlyTrend(entries: GratitudeEntry[]): Array<{ month: string; entries: number; avgMood: number }> {
    const monthlyData: Record<string, { entries: number; totalMoodImprovement: number; count: number }> = {};
    
    for (const entry of entries) {
      const monthKey = entry.date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { entries: 0, totalMoodImprovement: 0, count: 0 };
      }
      
      monthlyData[monthKey].entries++;
      if (entry.mood.improvement !== 0) {
        monthlyData[monthKey].totalMoodImprovement += entry.mood.improvement;
        monthlyData[monthKey].count++;
      }
    }
    
    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        entries: data.entries,
        avgMood: data.count > 0 ? data.totalMoodImprovement / data.count : 0
      }))
      .slice(0, 6);
  }

  private findTopGratitudes(entries: GratitudeEntry[]): Array<{ text: string; frequency: number; lastMentioned: Date }> {
    // Simplified implementation - would use NLP to find common themes
    return [
      { text: 'Keluarga', frequency: 15, lastMentioned: new Date() },
      { text: 'Kesehatan', frequency: 12, lastMentioned: new Date() },
      { text: 'Teman', frequency: 10, lastMentioned: new Date() }
    ];
  }

  private calculateWeeklyPattern(entries: GratitudeEntry[]): Array<{ day: string; avgEntries: number }> {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const dayStats: Record<number, number> = {};
    
    for (const entry of entries) {
      const dayOfWeek = entry.date.getDay();
      dayStats[dayOfWeek] = (dayStats[dayOfWeek] || 0) + 1;
    }
    
    return days.map((day, index) => ({
      day,
      avgEntries: dayStats[index] || 0
    }));
  }

  private analyzePersonalityProfile(entries: GratitudeEntry[], stats: GratitudeStats): GratitudeInsights['personalityProfile'] {
    // Analyze gratitude patterns to determine personality type
    const topCategory = stats.mostGratefulCategories[0]?.category || 'other';
    
    let type: GratitudeInsights['personalityProfile']['type'] = 'appreciator';
    let description = '';
    let strengths: string[] = [];
    let suggestions: string[] = [];

    switch (topCategory) {
      case 'people':
        type = 'connector';
        description = 'Anda adalah orang yang menghargai hubungan dan koneksi dengan orang lain.';
        strengths = ['Empati tinggi', 'Membangun hubungan yang kuat', 'Menghargai komunitas'];
        suggestions = ['Ekspresikan apresiasi langsung kepada orang-orang', 'Pertimbangkan untuk berbagi syukur secara publik'];
        break;
      case 'achievements':
        type = 'achiever';
        description = 'Anda termotivasi oleh pencapaian dan pertumbuhan personal.';
        strengths = ['Goal-oriented', 'Self-motivated', 'Growth mindset'];
        suggestions = ['Rayakan pencapaian kecil', 'Set goals yang meaningful'];
        break;
      default:
        type = 'appreciator';
        description = 'Anda memiliki mata yang tajam untuk menghargai keindahan dalam kehidupan sehari-hari.';
        strengths = ['Mindful', 'Observant', 'Positive outlook'];
        suggestions = ['Lanjutkan praktik mindfulness', 'Bagikan perspektif positif dengan orang lain'];
    }

    return { type, description, strengths, suggestions };
  }

  private analyzeGratitudePatterns(entries: GratitudeEntry[]): GratitudeInsights['patterns'] {
    // Analyze user patterns in gratitude practice
    return {
      preferredCategories: ['people', 'experiences', 'health'],
      emotionalTriggers: ['stress', 'achievement', 'connection'],
      timePreferences: ['evening', 'morning'],
      gratitudeStyle: 'reflective'
    };
  }

  private generateRecommendations(entries: GratitudeEntry[], stats: GratitudeStats, patterns: GratitudeInsights['patterns']): GratitudeInsights['recommendations'] {
    return {
      nextPrompts: [
        'Fokus pada pengalaman sensori yang Anda syukuri',
        'Tulis tentang seseorang yang mengajarkan Anda sesuatu',
        'Refleksikan tentang tantangan yang menjadi berkat'
      ],
      challenges: ['30 Hari Syukur', '7 Hari Apresiasi Hubungan'],
      focusAreas: ['Mindfulness', 'Relationship appreciation', 'Personal growth'],
      sharingOpportunities: ['Bagikan dengan keluarga', 'Post di komunitas', 'Tulis thank you note']
    };
  }

  private analyzeMoodCorrelation(entries: GratitudeEntry[]): GratitudeInsights['moodCorrelation'] {
    const moodEntries = entries.filter(e => e.mood.before && e.mood.after);
    
    if (moodEntries.length === 0) {
      return {
        beforeGratitude: 3,
        afterGratitude: 4,
        improvementRate: 80,
        bestPerformingPrompts: []
      };
    }

    const avgBefore = moodEntries.reduce((sum, e) => sum + (e.mood.before || 0), 0) / moodEntries.length;
    const avgAfter = moodEntries.reduce((sum, e) => sum + (e.mood.after || 0), 0) / moodEntries.length;
    const improvementRate = (moodEntries.filter(e => e.mood.improvement > 0).length / moodEntries.length) * 100;

    return {
      beforeGratitude: avgBefore,
      afterGratitude: avgAfter,
      improvementRate,
      bestPerformingPrompts: ['three-simple', 'people-appreciation']
    };
  }

  private getEmptyStats(): GratitudeStats {
    return {
      totalEntries: 0,
      currentStreak: 0,
      longestStreak: 0,
      averageMoodImprovement: 0,
      mostGratefulCategories: [],
      gratitudeWords: 0,
      monthlyTrend: [],
      topGratitudes: [],
      weeklyPattern: []
    };
  }

  private getBasicInsights(): GratitudeInsights {
    return {
      personalityProfile: {
        type: 'appreciator',
        description: 'Anda baru memulai perjalanan syukur. Terus lanjutkan!',
        strengths: ['Openness to growth', 'Willingness to practice'],
        suggestions: ['Konsisten dengan praktik harian', 'Eksplorasi berbagai jenis syukur']
      },
      patterns: {
        preferredCategories: [],
        emotionalTriggers: [],
        timePreferences: [],
        gratitudeStyle: 'reflective'
      },
      recommendations: {
        nextPrompts: ['Mulai dengan hal-hal sederhana di sekitar Anda'],
        challenges: ['7 Hari Apresiasi Hubungan'],
        focusAreas: ['Konsistensi', 'Eksplorasi'],
        sharingOpportunities: ['Mulai dengan keluarga terdekat']
      },
      moodCorrelation: {
        beforeGratitude: 3,
        afterGratitude: 3,
        improvementRate: 0,
        bestPerformingPrompts: []
      }
    };
  }
}

export const gratitudeJournalService = GratitudeJournalService.getInstance();