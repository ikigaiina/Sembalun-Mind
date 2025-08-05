import { offlineStorageService } from './offlineStorageService';
import type { 
  OfflineMoodEntry, 
  OfflineJournalEntry 
} from './offlineStorageService';
import { offlineSyncService } from './offlineSyncService';

export interface MoodPattern {
  averageMood: number;
  moodTrend: 'improving' | 'declining' | 'stable';
  stressLevel: number;
  energyLevel: number;
  commonTriggers: string[];
  timePatterns: {
    bestTimes: string[];
    challengingTimes: string[];
  };
}

export interface JournalInsight {
  commonThemes: string[];
  emotionalTrends: string[];
  growthAreas: string[];
  gratitudePatterns: string[];
  recommendedReflections: string[];
}

export interface MoodJournalStats {
  totalEntries: number;
  streakDays: number;
  averageMood: number;
  moodImprovement: number;
  journalWordCount: number;
  lastEntry: Date | null;
}

export interface QuickMoodEntry {
  overall: number;
  energy: number;
  stress: number;
  tags: string[];
  quickNote?: string;
}

export interface JournalPrompt {
  id: string;
  category: 'gratitude' | 'reflection' | 'goals' | 'challenges' | 'insights';
  prompt: string;
  followUpQuestions: string[];
  difficulty: 'easy' | 'medium' | 'deep';
}

export interface MoodMeditationRecommendation {
  sessionType: string;
  duration: number;
  reason: string;
  priority: 'low' | 'medium' | 'high';
}

export class OfflineMoodJournalService {
  private static instance: OfflineMoodJournalService;
  private moodEntryBuffer: Map<string, OfflineMoodEntry> = new Map();
  private journalEntryBuffer: Map<string, OfflineJournalEntry> = new Map();

  static getInstance(): OfflineMoodJournalService {
    if (!OfflineMoodJournalService.instance) {
      OfflineMoodJournalService.instance = new OfflineMoodJournalService();
    }
    return OfflineMoodJournalService.instance;
  }

  // Mood Entry Methods
  async logMoodEntry(
    userId: string,
    moodData: QuickMoodEntry,
    relatedSessionId?: string
  ): Promise<string> {
    try {
      const moodEntry: OfflineMoodEntry = {
        id: `mood-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        date: new Date(),
        overall: moodData.overall,
        energy: moodData.energy,
        anxiety: this.estimateAnxiety(moodData.stress, moodData.overall),
        happiness: this.estimateHappiness(moodData.overall, moodData.energy),
        stress: moodData.stress,
        focus: this.estimateFocus(moodData.energy, moodData.stress),
        tags: moodData.tags,
        notes: moodData.quickNote,
        relatedSessionId,
        syncStatus: 'pending',
        createdAt: new Date(),
        lastModified: new Date(),
        version: 1
      };

      await offlineStorageService.saveMoodEntry(moodEntry);
      this.moodEntryBuffer.set(moodEntry.id, moodEntry);

      // Trigger background sync if online
      if (navigator.onLine) {
        setTimeout(() => {
          offlineSyncService.syncAllData(userId, { force: false });
        }, 1000);
      }

      console.log('Mood entry logged successfully:', moodEntry.id);
      return moodEntry.id;
    } catch (error) {
      console.error('Error logging mood entry:', error);
      throw error;
    }
  }

  async createJournalEntry(
    userId: string,
    journalData: {
      title?: string;
      content: string;
      mood?: number;
      gratitude?: string[];
      insights?: string[];
      challenges?: string[];
      intentions?: string[];
      tags: string[];
    },
    relatedSessionId?: string
  ): Promise<string> {
    try {
      const journalEntry: OfflineJournalEntry = {
        id: `journal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        date: new Date(),
        title: journalData.title || this.generateAutoTitle(journalData.content),
        content: journalData.content,
        mood: journalData.mood,
        gratitude: journalData.gratitude || [],
        insights: journalData.insights || [],
        challenges: journalData.challenges || [],
        intentions: journalData.intentions || [],
        tags: journalData.tags,
        relatedSessionId,
        syncStatus: 'pending',
        createdAt: new Date(),
        lastModified: new Date(),
        version: 1
      };

      await offlineStorageService.saveJournalEntry(journalEntry);
      this.journalEntryBuffer.set(journalEntry.id, journalEntry);

      // Trigger background sync if online
      if (navigator.onLine) {
        setTimeout(() => {
          offlineSyncService.syncAllData(userId, { force: false });
        }, 1000);
      }

      console.log('Journal entry created successfully:', journalEntry.id);
      return journalEntry.id;
    } catch (error) {
      console.error('Error creating journal entry:', error);
      throw error;
    }
  }

  async getMoodHistory(
    userId: string, 
    days: number = 30,
    includeNotes: boolean = false
  ): Promise<OfflineMoodEntry[]> {
    try {
      const moods = await offlineStorageService.getUserMoods(userId);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const recentMoods = moods
        .filter(mood => mood.date >= cutoffDate)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      if (!includeNotes) {
        return recentMoods.map(mood => ({ ...mood, notes: undefined }));
      }

      return recentMoods;
    } catch (error) {
      console.error('Error getting mood history:', error);
      return [];
    }
  }

  async getJournalEntries(
    userId: string,
    limit: number = 10,
    category?: string
  ): Promise<OfflineJournalEntry[]> {
    try {
      const journals = await offlineStorageService.getUserJournals(userId, limit);
      
      if (category) {
        return journals.filter(journal => 
          journal.tags.includes(category) || 
          journal.title?.toLowerCase().includes(category.toLowerCase())
        );
      }

      return journals;
    } catch (error) {
      console.error('Error getting journal entries:', error);
      return [];
    }
  }

  async analyzeMoodPatterns(userId: string, days: number = 30): Promise<MoodPattern> {
    try {
      const moods = await this.getMoodHistory(userId, days, true);
      
      if (moods.length === 0) {
        return this.getDefaultMoodPattern();
      }

      const averageMood = moods.reduce((sum, mood) => sum + mood.overall, 0) / moods.length;
      const averageStress = moods.reduce((sum, mood) => sum + mood.stress, 0) / moods.length;
      const averageEnergy = moods.reduce((sum, mood) => sum + mood.energy, 0) / moods.length;

      // Calculate trend
      const recentMoods = moods.slice(0, Math.min(7, moods.length));
      const olderMoods = moods.slice(7, Math.min(14, moods.length));
      
      let moodTrend: 'improving' | 'declining' | 'stable' = 'stable';
      if (recentMoods.length > 0 && olderMoods.length > 0) {
        const recentAvg = recentMoods.reduce((sum, m) => sum + m.overall, 0) / recentMoods.length;
        const olderAvg = olderMoods.reduce((sum, m) => sum + m.overall, 0) / olderMoods.length;
        
        if (recentAvg > olderAvg + 0.3) moodTrend = 'improving';
        else if (recentAvg < olderAvg - 0.3) moodTrend = 'declining';
      }

      // Analyze common triggers
      const allTags = moods.flatMap(mood => mood.tags);
      const tagCounts = allTags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const commonTriggers = Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([tag]) => tag);

      // Analyze time patterns
      const timePatterns = this.analyzeTimePatterns(moods);

      return {
        averageMood,
        moodTrend,
        stressLevel: averageStress,
        energyLevel: averageEnergy,
        commonTriggers,
        timePatterns
      };
    } catch (error) {
      console.error('Error analyzing mood patterns:', error);
      return this.getDefaultMoodPattern();
    }
  }

  async generateJournalInsights(userId: string, days: number = 30): Promise<JournalInsight> {
    try {
      const journals = await this.getJournalEntries(userId, 50);
      const recentJournals = journals.filter(journal => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return journal.date >= cutoffDate;
      });

      if (recentJournals.length === 0) {
        return this.getDefaultJournalInsight();
      }

      // Analyze common themes
      const allContent = recentJournals.map(j => j.content.toLowerCase()).join(' ');
      const commonThemes = this.extractThemes(allContent);

      // Analyze emotional trends
      const emotionalWords = this.extractEmotionalWords(allContent);
      const emotionalTrends = Object.entries(emotionalWords)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([word]) => word);

      // Analyze gratitude patterns
      const allGratitude = recentJournals.flatMap(j => j.gratitude || []);
      const gratitudePatterns = [...new Set(allGratitude)].slice(0, 5);

      // Growth areas from challenges
      const allChallenges = recentJournals.flatMap(j => j.challenges || []);
      const growthAreas = [...new Set(allChallenges)].slice(0, 3);

      // Generate recommendations
      const recommendedReflections = this.generateReflectionRecommendations(
        commonThemes,
        emotionalTrends,
        growthAreas
      );

      return {
        commonThemes,
        emotionalTrends,
        growthAreas,
        gratitudePatterns,
        recommendedReflections
      };
    } catch (error) {
      console.error('Error generating journal insights:', error);
      return this.getDefaultJournalInsight();
    }
  }

  async getMoodJournalStats(userId: string): Promise<MoodJournalStats> {
    try {
      const [moods, journals] = await Promise.all([
        offlineStorageService.getUserMoods(userId),
        offlineStorageService.getUserJournals(userId)
      ]);

      const totalEntries = moods.length + journals.length;
      const streakDays = await this.calculateStreakDays(userId);
      const averageMood = moods.length > 0 
        ? moods.reduce((sum, mood) => sum + mood.overall, 0) / moods.length 
        : 0;

      // Calculate mood improvement (last 7 days vs previous 7 days)
      const recent = moods.slice(0, 7);
      const previous = moods.slice(7, 14);
      const moodImprovement = recent.length > 0 && previous.length > 0
        ? (recent.reduce((sum, m) => sum + m.overall, 0) / recent.length) - 
          (previous.reduce((sum, m) => sum + m.overall, 0) / previous.length)
        : 0;

      const journalWordCount = journals.reduce((count, journal) => 
        count + journal.content.split(' ').length, 0
      );

      const lastEntry = moods.length > 0 || journals.length > 0
        ? new Date(Math.max(
            moods[0]?.date.getTime() || 0,
            journals[0]?.date.getTime() || 0
          ))
        : null;

      return {
        totalEntries,
        streakDays,
        averageMood,
        moodImprovement,
        journalWordCount,
        lastEntry
      };
    } catch (error) {
      console.error('Error getting mood journal stats:', error);
      return {
        totalEntries: 0,
        streakDays: 0,
        averageMood: 0,
        moodImprovement: 0,
        journalWordCount: 0,
        lastEntry: null
      };
    }
  }

  async getRecommendedMeditation(userId: string): Promise<MoodMeditationRecommendation | null> {
    try {
      const recentMoods = await this.getMoodHistory(userId, 7);
      if (recentMoods.length === 0) return null;

      const latestMood = recentMoods[0];
      const averageStress = recentMoods.reduce((sum, mood) => sum + mood.stress, 0) / recentMoods.length;
      const averageEnergy = recentMoods.reduce((sum, mood) => sum + mood.energy, 0) / recentMoods.length;

      // High stress recommendation
      if (averageStress >= 4) {
        return {
          sessionType: 'stress_relief',
          duration: 15,
          reason: 'High stress levels detected in recent mood entries',
          priority: 'high'
        };
      }

      // Low energy recommendation
      if (averageEnergy <= 2) {
        return {
          sessionType: 'energy_boost',
          duration: 10,
          reason: 'Low energy levels detected, energizing meditation recommended',
          priority: 'medium'
        };
      }

      // Low mood recommendation
      if (latestMood.overall <= 2) {
        return {
          sessionType: 'mood_lift',
          duration: 12,
          reason: 'Recent low mood detected, mood-lifting session recommended',
          priority: 'high'
        };
      }

      // General wellness
      return {
        sessionType: 'mindfulness',
        duration: 10,
        reason: 'Regular mindfulness practice to maintain emotional balance',
        priority: 'low'
      };
    } catch (error) {
      console.error('Error getting meditation recommendation:', error);
      return null;
    }
  }

  async getJournalPrompts(category?: string, difficulty: string = 'easy'): Promise<JournalPrompt[]> {
    const allPrompts: JournalPrompt[] = [
      {
        id: 'gratitude-1',
        category: 'gratitude',
        prompt: 'Apa tiga hal yang Anda syukuri hari ini?',
        followUpQuestions: ['Mengapa hal-hal tersebut bermakna bagi Anda?', 'Bagaimana perasaan Anda saat merenungkannya?'],
        difficulty: 'easy'
      },
      {
        id: 'reflection-1',
        category: 'reflection',
        prompt: 'Momen apa yang paling berkesan hari ini?',
        followUpQuestions: ['Apa yang membuat momen tersebut berkesan?', 'Pelajaran apa yang bisa diambil?'],
        difficulty: 'easy'
      },
      {
        id: 'challenges-1',
        category: 'challenges',
        prompt: 'Tantangan apa yang Anda hadapi hari ini dan bagaimana Anda mengatasinya?',
        followUpQuestions: ['Strategi mana yang paling efektif?', 'Apa yang akan Anda lakukan berbeda?'],
        difficulty: 'medium'
      },
      {
        id: 'goals-1',
        category: 'goals',
        prompt: 'Apa satu langkah kecil yang bisa Anda ambil besok untuk mencapai tujuan Anda?',
        followUpQuestions: ['Mengapa langkah ini penting?', 'Bagaimana Anda akan memastikan melakukannya?'],
        difficulty: 'medium'
      },
      {
        id: 'insights-1',
        category: 'insights',
        prompt: 'Apa yang Anda pelajari tentang diri Anda minggu ini?',
        followUpQuestions: ['Bagaimana insight ini mengubah perspektif Anda?', 'Bagaimana Anda akan menerapkannya?'],
        difficulty: 'deep'
      }
    ];

    let filteredPrompts = allPrompts;

    if (category) {
      filteredPrompts = filteredPrompts.filter(prompt => prompt.category === category);
    }

    if (difficulty) {
      filteredPrompts = filteredPrompts.filter(prompt => prompt.difficulty === difficulty);
    }

    return filteredPrompts;
  }

  // Private helper methods
  private estimateAnxiety(stress: number, overall: number): number {
    return Math.min(5, Math.max(1, stress + (5 - overall) * 0.5));
  }

  private estimateHappiness(overall: number, energy: number): number {
    return Math.min(5, Math.max(1, (overall + energy) / 2));
  }

  private estimateFocus(energy: number, stress: number): number {
    return Math.min(5, Math.max(1, energy - (stress - 3) * 0.3));
  }

  private generateAutoTitle(content: string): string {
    const words = content.split(' ').slice(0, 5);
    return words.join(' ') + (words.length === 5 ? '...' : '');
  }

  private analyzeTimePatterns(moods: OfflineMoodEntry[]): { bestTimes: string[]; challengingTimes: string[] } {
    const timeGroups = {
      morning: moods.filter(m => m.date.getHours() >= 6 && m.date.getHours() < 12),
      afternoon: moods.filter(m => m.date.getHours() >= 12 && m.date.getHours() < 18),
      evening: moods.filter(m => m.date.getHours() >= 18 && m.date.getHours() < 24),
      night: moods.filter(m => m.date.getHours() >= 0 && m.date.getHours() < 6)
    };

    const timeAverages = Object.entries(timeGroups).map(([time, moodList]) => ({
      time,
      average: moodList.length > 0 ? moodList.reduce((sum, m) => sum + m.overall, 0) / moodList.length : 0,
      count: moodList.length
    })).filter(t => t.count > 0);

    timeAverages.sort((a, b) => b.average - a.average);

    return {
      bestTimes: timeAverages.slice(0, 2).map(t => t.time),
      challengingTimes: timeAverages.slice(-2).map(t => t.time)
    };
  }

  private extractThemes(content: string): string[] {
    const commonWords = ['work', 'family', 'meditation', 'stress', 'happiness', 'goals', 'relationships', 'health'];
    const themes = commonWords.filter(word => content.includes(word));
    return themes.slice(0, 5);
  }

  private extractEmotionalWords(content: string): Record<string, number> {
    const emotionalWords = ['happy', 'sad', 'anxious', 'calm', 'excited', 'tired', 'motivated', 'frustrated'];
    const counts: Record<string, number> = {};
    
    emotionalWords.forEach(word => {
      const matches = content.match(new RegExp(word, 'gi'));
      if (matches) {
        counts[word] = matches.length;
      }
    });

    return counts;
  }

  private generateReflectionRecommendations(
    themes: string[],
    emotions: string[],
    challenges: string[]
  ): string[] {
    return [
      'Refleksikan bagaimana meditasi mempengaruhi mood Anda',
      'Tuliskan tentang momen ketenangan hari ini',
      'Eksplorasi hubungan antara aktivitas dan tingkat energi Anda'
    ];
  }

  private async calculateStreakDays(userId: string): Promise<number> {
    try {
      const [moods, journals] = await Promise.all([
        offlineStorageService.getUserMoods(userId),
        offlineStorageService.getUserJournals(userId)
      ]);

      // Combine and sort by date
      const allEntries = [...moods, ...journals]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      if (allEntries.length === 0) return 0;

      let streak = 0;
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      for (const entry of allEntries) {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);

        if (entryDate.getTime() === currentDate.getTime()) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else if (entryDate.getTime() < currentDate.getTime()) {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Error calculating streak days:', error);
      return 0;
    }
  }

  private getDefaultMoodPattern(): MoodPattern {
    return {
      averageMood: 3,
      moodTrend: 'stable',
      stressLevel: 3,
      energyLevel: 3,
      commonTriggers: [],
      timePatterns: {
        bestTimes: ['morning'],
        challengingTimes: ['evening']
      }
    };
  }

  private getDefaultJournalInsight(): JournalInsight {
    return {
      commonThemes: [],
      emotionalTrends: [],
      growthAreas: [],
      gratitudePatterns: [],
      recommendedReflections: [
        'Mulai dengan menulis tentang hal-hal yang Anda syukuri',
        'Refleksikan pengalaman meditasi Anda',
        'Tuliskan tentang tujuan dan aspirasi Anda'
      ]
    };
  }
}

export const offlineMoodJournalService = OfflineMoodJournalService.getInstance();