import { offlineStorageService } from './offlineStorageService';
import { offlineMoodJournalService } from './offlineMoodJournalService';
import type { OfflineJournalEntry } from './offlineStorageService';

export interface JournalEntry {
  id: string;
  userId: string;
  title?: string;
  content: string;
  type: 'free_form' | 'guided' | 'gratitude' | 'reflection' | 'mood_based';
  mood?: {
    before?: number;
    after?: number;
    dominant?: string[];
  };
  tags: string[];
  emotions: {
    primary: string;
    secondary: string[];
    intensity: number; // 1-10
  };
  metadata: {
    wordCount: number;
    writingTime: number; // seconds
    prompt?: string;
    templateId?: string;
  };
  attachments?: {
    type: 'audio' | 'image' | 'link';
    url: string;
    description?: string;
  }[];
  privacy: 'private' | 'shared' | 'anonymous';
  isStarred: boolean;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: 'pending' | 'synced' | 'failed';
}

export interface MoodTag {
  id: string;
  name: string;
  color: string;
  category: 'emotion' | 'activity' | 'location' | 'people' | 'weather' | 'custom';
  emoji: string;
  frequency: number;
  lastUsed?: Date;
}

export interface JournalTemplate {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  prompts: Array<{
    id: string;
    question: string;
    type: 'text' | 'scale' | 'choice' | 'tags';
    required: boolean;
    placeholder?: string;
    options?: string[];
    maxLength?: number;
  }>;
  estimatedTime: number; // minutes
  category: string;
  isDefault: boolean;
  customizations?: {
    allowSkip: boolean;
    allowModification: boolean;
    reminderTime?: string;
  };
}

export interface WritingAnalytics {
  totalEntries: number;
  totalWords: number;
  averageWordsPerEntry: number;
  writingStreak: number;
  longestStreak: number;
  averageWritingTime: number;
  mostUsedTags: Array<{ tag: string; count: number }>;
  emotionalTrends: Array<{ emotion: string; trend: 'rising' | 'falling' | 'stable' }>;
  writingPatterns: {
    preferredTime: string;
    averageLength: 'short' | 'medium' | 'long';
    commonThemes: string[];
  };
}

export interface SmartSuggestions {
  prompts: string[];
  tags: string[];
  emotions: string[];
  followUpQuestions: string[];
  relatedEntries: JournalEntry[];
}

export class JournalingService {
  private static instance: JournalingService;
  private moodTagsCache: MoodTag[] = [];
  private templatesCache: JournalTemplate[] = [];
  private writingSessionActive = false;
  private writingStartTime: Date | null = null;

  static getInstance(): JournalingService {
    if (!JournalingService.instance) {
      JournalingService.instance = new JournalingService();
    }
    return JournalingService.instance;
  }

  constructor() {
    this.initializeDefaultTags();
    this.initializeDefaultTemplates();
  }

  async createJournalEntry(
    userId: string,
    entryData: {
      title?: string;
      content: string;
      type?: JournalEntry['type'];
      mood?: JournalEntry['mood'];
      tags?: string[];
      emotions?: Partial<JournalEntry['emotions']>;
      templateId?: string;
      privacy?: JournalEntry['privacy'];
    }
  ): Promise<string> {
    try {
      const writingTime = this.writingSessionActive && this.writingStartTime 
        ? Math.floor((Date.now() - this.writingStartTime.getTime()) / 1000)
        : 0;

      const entry: JournalEntry = {
        id: `journal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        title: entryData.title || this.generateAutoTitle(entryData.content),
        content: entryData.content,
        type: entryData.type || 'free_form',
        mood: entryData.mood,
        tags: entryData.tags || [],
        emotions: {
          primary: entryData.emotions?.primary || this.detectPrimaryEmotion(entryData.content),
          secondary: entryData.emotions?.secondary || [],
          intensity: entryData.emotions?.intensity || this.detectEmotionalIntensity(entryData.content)
        },
        metadata: {
          wordCount: this.countWords(entryData.content),
          writingTime,
          templateId: entryData.templateId
        },
        privacy: entryData.privacy || 'private',
        isStarred: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        syncStatus: 'pending'
      };

      // Save to storage
      await this.saveJournalEntry(entry);

      // Update tag frequencies
      await this.updateTagFrequencies(entry.tags);

      // Also save to mood journal service for integrated tracking
      await this.saveToMoodJournalService(entry);

      // Reset writing session
      this.endWritingSession();

      console.log('Journal entry created:', entry.id);
      return entry.id;
    } catch (error) {
      console.error('Error creating journal entry:', error);
      throw error;
    }
  }

  async updateJournalEntry(
    userId: string,
    entryId: string,
    updates: Partial<JournalEntry>
  ): Promise<void> {
    try {
      const entry = await this.getJournalEntry(entryId);
      
      if (!entry || entry.userId !== userId) {
        throw new Error('Journal entry not found or access denied');
      }

      const updatedEntry: JournalEntry = {
        ...entry,
        ...updates,
        updatedAt: new Date(),
        syncStatus: 'pending'
      };

      // Recalculate metadata if content changed
      if (updates.content) {
        updatedEntry.metadata.wordCount = this.countWords(updates.content);
        updatedEntry.emotions.primary = this.detectPrimaryEmotion(updates.content);
        updatedEntry.emotions.intensity = this.detectEmotionalIntensity(updates.content);
      }

      await this.saveJournalEntry(updatedEntry);
      
      console.log('Journal entry updated:', entryId);
    } catch (error) {
      console.error('Error updating journal entry:', error);
      throw error;
    }
  }

  async deleteJournalEntry(userId: string, entryId: string): Promise<void> {
    try {
      const entry = await this.getJournalEntry(entryId);
      
      if (!entry || entry.userId !== userId) {
        throw new Error('Journal entry not found or access denied');
      }

      await this.deleteEntryFromStorage(entryId);
      
      console.log('Journal entry deleted:', entryId);
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      throw error;
    }
  }

  async getJournalEntry(entryId: string): Promise<JournalEntry | null> {
    try {
      return await this.loadJournalEntry(entryId);
    } catch (error) {
      console.error('Error getting journal entry:', error);
      return null;
    }
  }

  async getUserJournalEntries(
    userId: string,
    filters?: {
      type?: JournalEntry['type'];
      tags?: string[];
      dateRange?: { start: Date; end: Date };
      mood?: number;
      starred?: boolean;
      limit?: number;
      offset?: number;
    }
  ): Promise<JournalEntry[]> {
    try {
      let entries = await this.loadUserJournalEntries(userId);

      // Apply filters
      if (filters) {
        if (filters.type) {
          entries = entries.filter(entry => entry.type === filters.type);
        }

        if (filters.tags && filters.tags.length > 0) {
          entries = entries.filter(entry => 
            filters.tags!.some(tag => entry.tags.includes(tag))
          );
        }

        if (filters.dateRange) {
          entries = entries.filter(entry => 
            entry.createdAt >= filters.dateRange!.start && 
            entry.createdAt <= filters.dateRange!.end
          );
        }

        if (filters.mood !== undefined) {
          entries = entries.filter(entry => 
            entry.mood?.before === filters.mood || entry.mood?.after === filters.mood
          );
        }

        if (filters.starred !== undefined) {
          entries = entries.filter(entry => entry.isStarred === filters.starred);
        }
      }

      // Sort by creation date (newest first)
      entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Apply pagination
      if (filters?.offset) {
        entries = entries.slice(filters.offset);
      }
      if (filters?.limit) {
        entries = entries.slice(0, filters.limit);
      }

      return entries;
    } catch (error) {
      console.error('Error getting user journal entries:', error);
      return [];
    }
  }

  async searchJournalEntries(
    userId: string,
    query: string,
    options?: {
      includeContent?: boolean;
      includeTags?: boolean;
      includeEmotions?: boolean;
      fuzzyMatch?: boolean;
    }
  ): Promise<JournalEntry[]> {
    try {
      const entries = await this.loadUserJournalEntries(userId);
      const searchOptions = {
        includeContent: true,
        includeTags: true,
        includeEmotions: true,
        fuzzyMatch: false,
        ...options
      };

      const lowerQuery = query.toLowerCase();

      return entries.filter(entry => {
        // Search in title
        if (entry.title?.toLowerCase().includes(lowerQuery)) {
          return true;
        }

        // Search in content
        if (searchOptions.includeContent && entry.content.toLowerCase().includes(lowerQuery)) {
          return true;
        }

        // Search in tags
        if (searchOptions.includeTags && entry.tags.some(tag => 
          tag.toLowerCase().includes(lowerQuery)
        )) {
          return true;
        }

        // Search in emotions
        if (searchOptions.includeEmotions && (
          entry.emotions.primary.toLowerCase().includes(lowerQuery) ||
          entry.emotions.secondary.some(emotion => emotion.toLowerCase().includes(lowerQuery))
        )) {
          return true;
        }

        return false;
      });
    } catch (error) {
      console.error('Error searching journal entries:', error);
      return [];
    }
  }

  async getMoodTags(): Promise<MoodTag[]> {
    try {
      // Load custom tags and merge with defaults
      const customTags = await offlineStorageService.getSetting('customMoodTags') || [];
      return [...this.moodTagsCache, ...customTags];
    } catch (error) {
      console.error('Error getting mood tags:', error);
      return this.moodTagsCache;
    }
  }

  async createCustomMoodTag(tag: Omit<MoodTag, 'id' | 'frequency' | 'lastUsed'>): Promise<string> {
    try {
      const customTag: MoodTag = {
        ...tag,
        id: `custom-tag-${Date.now()}`,
        frequency: 0,
        lastUsed: new Date()
      };

      const customTags = await offlineStorageService.getSetting('customMoodTags') || [];
      customTags.push(customTag);
      await offlineStorageService.setSetting('customMoodTags', customTags);

      console.log('Custom mood tag created:', customTag.id);
      return customTag.id;
    } catch (error) {
      console.error('Error creating custom mood tag:', error);
      throw error;
    }
  }

  async getJournalTemplates(): Promise<JournalTemplate[]> {
    try {
      const customTemplates = await offlineStorageService.getSetting('customJournalTemplates') || [];
      return [...this.templatesCache, ...customTemplates];
    } catch (error) {
      console.error('Error getting journal templates:', error);
      return this.templatesCache;
    }
  }

  async createCustomTemplate(template: Omit<JournalTemplate, 'id' | 'isDefault'>): Promise<string> {
    try {
      const customTemplate: JournalTemplate = {
        ...template,
        id: `custom-template-${Date.now()}`,
        isDefault: false
      };

      const customTemplates = await offlineStorageService.getSetting('customJournalTemplates') || [];
      customTemplates.push(customTemplate);
      await offlineStorageService.setSetting('customJournalTemplates', customTemplates);

      console.log('Custom journal template created:', customTemplate.id);
      return customTemplate.id;
    } catch (error) {
      console.error('Error creating custom template:', error);
      throw error;
    }
  }

  async getWritingAnalytics(userId: string, period: 'week' | 'month' | 'year' = 'month'): Promise<WritingAnalytics> {
    try {
      const entries = await this.getUserJournalEntries(userId);
      
      if (entries.length === 0) {
        return this.getEmptyAnalytics();
      }

      // Filter entries by period
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (period) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      const periodEntries = entries.filter(entry => entry.createdAt >= cutoffDate);

      // Calculate analytics
      const totalWords = periodEntries.reduce((sum, entry) => sum + entry.metadata.wordCount, 0);
      const averageWordsPerEntry = periodEntries.length > 0 ? totalWords / periodEntries.length : 0;
      const averageWritingTime = periodEntries.reduce((sum, entry) => sum + entry.metadata.writingTime, 0) / periodEntries.length;

      // Calculate writing streak
      const writingStreak = this.calculateWritingStreak(entries);
      const longestStreak = this.calculateLongestStreak(entries);

      // Most used tags
      const tagCounts = this.calculateTagFrequencies(periodEntries);
      const mostUsedTags = Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([tag, count]) => ({ tag, count }));

      // Emotional trends
      const emotionalTrends = this.analyzeEmotionalTrends(periodEntries);

      // Writing patterns
      const writingPatterns = this.analyzeWritingPatterns(periodEntries);

      return {
        totalEntries: periodEntries.length,
        totalWords,
        averageWordsPerEntry,
        writingStreak,
        longestStreak,
        averageWritingTime,
        mostUsedTags,
        emotionalTrends,
        writingPatterns
      };
    } catch (error) {
      console.error('Error getting writing analytics:', error);
      return this.getEmptyAnalytics();
    }
  }

  async getSmartSuggestions(userId: string, context?: {
    currentMood?: number;
    recentTags?: string[];
    time?: 'morning' | 'afternoon' | 'evening' | 'night';
  }): Promise<SmartSuggestions> {
    try {
      const recentEntries = await this.getUserJournalEntries(userId, { limit: 10 });
      const allTags = await this.getMoodTags();

      // Generate personalized prompts
      const prompts = this.generatePersonalizedPrompts(recentEntries, context);

      // Suggest relevant tags
      const suggestedTags = this.suggestRelevantTags(recentEntries, allTags, context);

      // Suggest emotions
      const suggestedEmotions = this.suggestRelevantEmotions(recentEntries, context);

      // Generate follow-up questions
      const followUpQuestions = this.generateFollowUpQuestions(recentEntries);

      // Find related entries
      const relatedEntries = this.findRelatedEntries(recentEntries, context);

      return {
        prompts,
        tags: suggestedTags,
        emotions: suggestedEmotions,
        followUpQuestions,
        relatedEntries
      };
    } catch (error) {
      console.error('Error getting smart suggestions:', error);
      return {
        prompts: ['Bagaimana perasaan Anda hari ini?'],
        tags: [],
        emotions: [],
        followUpQuestions: [],
        relatedEntries: []
      };
    }
  }

  startWritingSession(): void {
    this.writingSessionActive = true;
    this.writingStartTime = new Date();
  }

  endWritingSession(): void {
    this.writingSessionActive = false;
    this.writingStartTime = null;
  }

  // Private helper methods
  private initializeDefaultTags(): void {
    this.moodTagsCache = [
      { id: 'happy', name: 'Bahagia', color: '#10B981', category: 'emotion', emoji: '😊', frequency: 0 },
      { id: 'sad', name: 'Sedih', color: '#3B82F6', category: 'emotion', emoji: '😢', frequency: 0 },
      { id: 'anxious', name: 'Cemas', color: '#F59E0B', category: 'emotion', emoji: '😰', frequency: 0 },
      { id: 'calm', name: 'Tenang', color: '#10B981', category: 'emotion', emoji: '😌', frequency: 0 },
      { id: 'excited', name: 'Antusias', color: '#EF4444', category: 'emotion', emoji: '🤩', frequency: 0 },
      { id: 'tired', name: 'Lelah', color: '#6B7280', category: 'emotion', emoji: '😴', frequency: 0 },
      { id: 'work', name: 'Kerja', color: '#8B5CF6', category: 'activity', emoji: '💼', frequency: 0 },
      { id: 'family', name: 'Keluarga', color: '#EC4899', category: 'people', emoji: '👨‍👩‍👧‍👦', frequency: 0 },
      { id: 'meditation', name: 'Meditasi', color: '#10B981', category: 'activity', emoji: '🧘‍♀️', frequency: 0 },
      { id: 'gratitude', name: 'Syukur', color: '#F59E0B', category: 'emotion', emoji: '🙏', frequency: 0 }
    ];
  }

  private initializeDefaultTemplates(): void {
    this.templatesCache = [
      {
        id: 'daily-reflection',
        name: 'Refleksi Harian',
        description: 'Template untuk refleksi harian singkat',
        type: 'daily',
        prompts: [
          {
            id: 'mood-check',
            question: 'Bagaimana mood Anda hari ini?',
            type: 'scale',
            required: true,
            options: ['1', '2', '3', '4', '5']
          },
          {
            id: 'highlights',
            question: 'Apa momen terbaik hari ini?',
            type: 'text',
            required: false,
            placeholder: 'Ceritakan momen yang membuat Anda bahagia...'
          },
          {
            id: 'challenges',
            question: 'Tantangan apa yang Anda hadapi?',
            type: 'text',
            required: false,
            placeholder: 'Bagaimana Anda mengatasinya?'
          }
        ],
        estimatedTime: 5,
        category: 'reflection',
        isDefault: true
      },
      {
        id: 'gratitude-journal',
        name: 'Jurnal Syukur',
        description: 'Fokus pada hal-hal yang patut disyukuri',
        type: 'daily',
        prompts: [
          {
            id: 'gratitude-1',
            question: 'Apa tiga hal yang Anda syukuri hari ini?',
            type: 'text',
            required: true,
            placeholder: '1. ...\n2. ...\n3. ...'
          },
          {
            id: 'why-grateful',
            question: 'Mengapa hal-hal tersebut bermakna bagi Anda?',
            type: 'text',
            required: false,
            placeholder: 'Refleksikan lebih dalam...'
          }
        ],
        estimatedTime: 3,
        category: 'gratitude',
        isDefault: true
      }
    ];
  }

  private generateAutoTitle(content: string): string {
    const words = content.trim().split(' ').slice(0, 6);
    return words.join(' ') + (words.length === 6 ? '...' : '');
  }

  private detectPrimaryEmotion(content: string): string {
    const emotionKeywords = {
      happy: ['senang', 'bahagia', 'gembira', 'ceria', 'suka'],
      sad: ['sedih', 'kecewa', 'murung', 'melankolis'],
      anxious: ['cemas', 'khawatir', 'gelisah', 'takut'],
      calm: ['tenang', 'damai', 'rileks', 'santai'],
      excited: ['antusias', 'semangat', 'excited', 'energik'],
      tired: ['lelah', 'capek', 'exhausted', 'fatigue']
    };

    const lowerContent = content.toLowerCase();
    
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        return emotion;
      }
    }

    return 'neutral';
  }

  private detectEmotionalIntensity(content: string): number {
    const intensityIndicators = {
      high: ['sangat', 'amat', 'sekali', 'banget', 'extremely'],
      medium: ['cukup', 'lumayan', 'agak', 'somewhat'],
      low: ['sedikit', 'slightly', 'a little']
    };

    const lowerContent = content.toLowerCase();

    if (intensityIndicators.high.some(indicator => lowerContent.includes(indicator))) {
      return Math.floor(Math.random() * 3) + 8; // 8-10
    } else if (intensityIndicators.medium.some(indicator => lowerContent.includes(indicator))) {
      return Math.floor(Math.random() * 3) + 5; // 5-7
    } else if (intensityIndicators.low.some(indicator => lowerContent.includes(indicator))) {
      return Math.floor(Math.random() * 3) + 2; // 2-4
    }

    return 5; // neutral
  }

  private countWords(content: string): number {
    return content.trim().split(/\s+/).length;
  }

  private async saveJournalEntry(entry: JournalEntry): Promise<void> {
    const key = `journalEntry_${entry.id}`;
    await offlineStorageService.setSetting(key, entry);
  }

  private async loadJournalEntry(entryId: string): Promise<JournalEntry | null> {
    const key = `journalEntry_${entryId}`;
    return await offlineStorageService.getSetting(key);
  }

  private async deleteEntryFromStorage(entryId: string): Promise<void> {
    const key = `journalEntry_${entryId}`;
    await offlineStorageService.setSetting(key, null);
  }

  private async loadUserJournalEntries(userId: string): Promise<JournalEntry[]> {
    // Mock implementation - would query actual storage with user index
    return [];
  }

  private async updateTagFrequencies(tags: string[]): Promise<void> {
    const allTags = await this.getMoodTags();
    
    for (const tagName of tags) {
      const tag = allTags.find(t => t.name === tagName);
      if (tag) {
        tag.frequency++;
        tag.lastUsed = new Date();
      }
    }
  }

  private async saveToMoodJournalService(entry: JournalEntry): Promise<void> {
    try {
      await offlineMoodJournalService.createJournalEntry(
        entry.userId,
        {
          title: entry.title,
          content: entry.content,
          mood: entry.mood?.after || entry.mood?.before,
          tags: entry.tags
        }
      );
    } catch (error) {
      console.error('Error saving to mood journal service:', error);
    }
  }

  private calculateWritingStreak(entries: JournalEntry[]): number {
    if (entries.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    const currentDate = new Date(today);

    for (let i = 0; i < 365; i++) { // Check up to a year
      const hasEntry = entries.some(entry => {
        const entryDate = new Date(entry.createdAt);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === currentDate.getTime();
      });

      if (hasEntry) {
        streak++;
      } else {
        break;
      }

      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  }

  private calculateLongestStreak(entries: JournalEntry[]): number {
    // Implementation for calculating longest streak
    return this.calculateWritingStreak(entries); // Simplified
  }

  private calculateTagFrequencies(entries: JournalEntry[]): Record<string, number> {
    const tagCounts: Record<string, number> = {};
    
    for (const entry of entries) {
      for (const tag of entry.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }
    
    return tagCounts;
  }

  private analyzeEmotionalTrends(entries: JournalEntry[]): Array<{ emotion: string; trend: 'rising' | 'falling' | 'stable' }> {
    // Simplified emotion trend analysis
    return [
      { emotion: 'happy', trend: 'rising' },
      { emotion: 'calm', trend: 'stable' },
      { emotion: 'anxious', trend: 'falling' }
    ];
  }

  private analyzeWritingPatterns(entries: JournalEntry[]): WritingAnalytics['writingPatterns'] {
    const wordCounts = entries.map(entry => entry.metadata.wordCount);
    const averageLength = wordCounts.reduce((sum, count) => sum + count, 0) / wordCounts.length;
    
    return {
      preferredTime: 'evening', // Would analyze actual time patterns
      averageLength: averageLength < 50 ? 'short' : averageLength < 200 ? 'medium' : 'long',
      commonThemes: ['meditation', 'gratitude', 'reflection']
    };
  }

  private generatePersonalizedPrompts(entries: JournalEntry[], context?: any): string[] {
    const basePrompts = [
      'Apa yang Anda rasakan saat ini?',
      'Ceritakan tentang momen terbaik hari ini',
      'Apa yang Anda syukuri hari ini?',
      'Tantangan apa yang Anda hadapi dan bagaimana mengatasinya?'
    ];

    // Would analyze context and recent entries to personalize
    return basePrompts.slice(0, 3);
  }

  private suggestRelevantTags(entries: JournalEntry[], allTags: MoodTag[], context?: any): string[] {
    // Get frequently used tags
    const recentTags = entries.flatMap(entry => entry.tags);
    const tagFreq = this.calculateTagFrequencies(entries);
    
    return Object.keys(tagFreq)
      .sort((a, b) => tagFreq[b] - tagFreq[a])
      .slice(0, 5);
  }

  private suggestRelevantEmotions(entries: JournalEntry[], context?: any): string[] {
    return ['calm', 'grateful', 'reflective', 'hopeful', 'content'];
  }

  private generateFollowUpQuestions(entries: JournalEntry[]): string[] {
    return [
      'Bagaimana perasaan ini mempengaruhi hari Anda?',
      'Apa yang ingin Anda lakukan berbeda besok?',
      'Siapa yang bisa Anda bagikan cerita ini?'
    ];
  }

  private findRelatedEntries(entries: JournalEntry[], context?: any): JournalEntry[] {
    // Find entries with similar tags or emotions
    return entries.slice(0, 3);
  }

  private getEmptyAnalytics(): WritingAnalytics {
    return {
      totalEntries: 0,
      totalWords: 0,
      averageWordsPerEntry: 0,
      writingStreak: 0,
      longestStreak: 0,
      averageWritingTime: 0,
      mostUsedTags: [],
      emotionalTrends: [],
      writingPatterns: {
        preferredTime: 'evening',
        averageLength: 'medium',
        commonThemes: []
      }
    };
  }
}

export const journalingService = JournalingService.getInstance();