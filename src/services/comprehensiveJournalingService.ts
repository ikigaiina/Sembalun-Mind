/**
 * Comprehensive Journaling Service for Sembalun
 * Advanced journaling with Indonesian cultural integration and emotional intelligence
 */

export interface JournalEntry {
  id: string;
  timestamp: Date;
  type: 'meditation' | 'gratitude' | 'reflection' | 'mood' | 'wisdom' | 'cultural' | 'dream' | 'intention';
  title: string;
  content: string;
  mood: EmotionalState;
  tags: string[];
  culturalContext?: CulturalContext;
  attachments?: JournalAttachment[];
  privacy: 'private' | 'shared' | 'community';
  language: 'id' | 'en' | 'jv';
  weatherData?: WeatherData;
  location?: LocationData;
  meditationData?: MeditationContextData;
  insights?: AIGeneratedInsight[];
  wordCount: number;
  readingTime: number;
  favorited: boolean;
  archived: boolean;
}

export interface EmotionalState {
  primary: string; // Primary emotion in selected language
  intensity: number; // 1-10 scale
  secondary?: string[]; // Additional emotions
  energyLevel: number; // 1-10 scale
  peacefulnessLevel: number; // 1-10 scale
  gratitudeLevel: number; // 1-10 scale
  clarityLevel: number; // 1-10 scale
  stressLevel: number; // 1-10 scale (reverse)
  indonesianEmotions?: IndonesianEmotionalConcepts;
}

export interface IndonesianEmotionalConcepts {
  hati: 'tenang' | 'gelisah' | 'bahagia' | 'sedih' | 'damai'; // Heart state
  jiwa: 'tenteram' | 'resah' | 'gembira' | 'khawatir'; // Soul state
  pikiran: 'jernih' | 'kacau' | 'fokus' | 'bingung'; // Mind state
  spiritualitas: 'terhubung' | 'terpisah' | 'berkah' | 'hampa'; // Spiritual state
}

export interface CulturalContext {
  region: 'java' | 'bali' | 'sembalun' | 'sumatra' | 'general';
  practice: string;
  wisdom?: string;
  ceremony?: string;
  season?: IndonesianSeason;
  culturalEvent?: string;
}

export interface IndonesianSeason {
  name: 'musim hujan' | 'musim kemarau' | 'pancaroba';
  spiritualMeaning: string;
  recommendations: string[];
}

export interface JournalAttachment {
  id: string;
  type: 'image' | 'audio' | 'drawing' | 'voice_note';
  url: string;
  caption?: string;
  timestamp: Date;
}

export interface WeatherData {
  condition: string;
  temperature: number;
  humidity: number;
  spiritualConnection: string; // How weather relates to inner state
}

export interface LocationData {
  name: string;
  coordinates?: { lat: number; lng: number };
  significance: string; // Personal or cultural significance
}

export interface MeditationContextData {
  sessionId?: string;
  duration?: number;
  technique?: string;
  region?: string;
  beforeMood?: EmotionalState;
  afterMood?: EmotionalState;
}

export interface AIGeneratedInsight {
  type: 'pattern' | 'growth' | 'recommendation' | 'cultural_wisdom';
  content: string;
  confidence: number;
  culturalRelevance?: number;
}

export interface JournalPrompt {
  id: string;
  text: string;
  category: 'reflection' | 'gratitude' | 'intention' | 'cultural' | 'wisdom';
  culturalOrigin: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
}

export interface JournalAnalytics {
  totalEntries: number;
  averageWordsPerEntry: number;
  mostUsedTags: string[];
  emotionalTrends: EmotionalTrend[];
  writingStreak: number;
  favoriteWritingTimes: string[];
  culturalEngagement: CulturalEngagement;
  personalGrowth: GrowthMetrics;
}

export interface EmotionalTrend {
  date: string;
  averageMood: number;
  dominantEmotion: string;
  stressLevel: number;
  gratitudeLevel: number;
}

export interface CulturalEngagement {
  mostExploredRegions: string[];
  wisdomQuotesUsed: number;
  culturalPracticesTracked: string[];
  spiritualGrowthScore: number;
}

export interface GrowthMetrics {
  selfAwarenessScore: number;
  emotionalIntelligenceGrowth: number;
  mindfulnessConsistency: number;
  culturalConnectionDepth: number;
}

class ComprehensiveJournalingService {
  private entries: Map<string, JournalEntry> = new Map();
  private prompts: JournalPrompt[] = [];
  private analytics: JournalAnalytics | null = null;

  // Indonesian emotional vocabulary
  private indonesianEmotions = {
    positive: {
      id: ['bahagia', 'senang', 'gembira', 'suka cita', 'damai', 'tenang', 'tenteram', 'puas', 'lega', 'haru', 'terharu', 'bangga', 'bersyukur', 'berterima kasih', 'kagum', 'takjub'],
      en: ['happy', 'joyful', 'peaceful', 'content', 'grateful', 'proud', 'amazed', 'blessed', 'serene', 'calm', 'satisfied', 'relieved', 'moved', 'thankful', 'admiring', 'wonderful'],
      jv: ['bungah', 'seneng', 'tentrem', 'ayem', 'marem', 'legawa', 'sumringah', 'gembira', 'rena', 'meneng']
    },
    negative: {
      id: ['sedih', 'kecewa', 'marah', 'kesal', 'frustrasi', 'cemas', 'khawatir', 'takut', 'gugup', 'bingung', 'gelisah', 'stress', 'lelah', 'capek', 'hampa', 'sepi'],
      en: ['sad', 'disappointed', 'angry', 'frustrated', 'anxious', 'worried', 'scared', 'confused', 'restless', 'stressed', 'tired', 'empty', 'lonely', 'overwhelmed'],
      jv: ['sedhih', 'kuciwa', 'nesu', 'jengkel', 'was-uwas', 'wedi', 'bingung', 'gelisah', 'kesel', 'capek']
    },
    neutral: {
      id: ['biasa', 'netral', 'stabil', 'seimbang', 'normal', 'tenang', 'fokus', 'siap', 'sadar', 'hadir'],
      en: ['neutral', 'stable', 'balanced', 'normal', 'focused', 'ready', 'aware', 'present', 'centered'],
      jv: ['lumrah', 'seimbang', 'mantep', 'sadar', 'eling', 'siap']
    }
  };

  // Cultural wisdom prompts
  private culturalPrompts = {
    java: [
      "Mikul dhuwur mendhem jero - Bagaimana aku bisa membawa kehormatan tinggi dan mengubur aib dalam? Apa arti ini dalam hidupku hari ini?",
      "Sopo sing sabar, bakal pikantuk - Refleksikan momen kesabaranmu hari ini. Apa yang kamu pelajari?",
      "Jer basuki mawa beya - Setiap pencapaian memerlukan pengorbanan. Apa yang sedang kamu perjuangkan?",
      "Aja gumuyu wong lagi susah - Bagaimana aku bisa lebih empati pada penderitaan orang lain?",
      "Becik ketitik ala ketara - Kebaikan akan terlihat, kejahatan akan terbuka. Refleksikan perbuatan baikmu hari ini."
    ],
    bali: [
      "Tri Hita Karana - Bagaimana hubunganku dengan Tuhan, sesama, dan alam hari ini?",
      "Tat Tvam Asi - Engkau adalah aku. Dimana aku melihat diriku dalam orang lain hari ini?",
      "Rahayu ning buana - Kedamaian dunia dimulai dari kedamaian dalam diri. Bagaimana aku berkontribusi?",
      "Karma Phala - Refleksikan perbuatanmu hari ini. Benih apa yang kamu tanam?",
      "Ahimsa Paramo Dharma - Tanpa kekerasan adalah dharma tertinggi. Bagaimana aku menerapkan ini?"
    ],
    sembalun: [
      "Begawe bareng, behasil bareng - Bagaimana aku berkolaborasi dengan komunitas hari ini?",
      "Tindak tuhu, pikir beneh - Bertindak benar, berpikir baik. Refleksikan keputusanmu hari ini.",
      "Gumi alus, manusia becik - Bumi lembut, manusia baik. Bagaimana aku memperlakukan alam?",
      "Selamet donya akhirat - Keselamatan dunia akhirat. Apa yang aku lakukan untuk kehidupan yang bermakna?",
      "Rukun agawe santosa - Kerukunan membuat kuat. Bagaimana aku membangun harmoni?"
    ],
    sumatra: [
      "Adat basandi syarak, syarak basandi kitabullah - Bagaimana tradisi dan spiritualitas membimbing hidupku?",
      "Alam takambang jadi guru - Alam yang terbentang menjadi guru. Apa yang alam ajarkan padaku hari ini?",
      "Dimana bumi dipijak, disitu langit dijunjung - Bagaimana aku menghormati tempat dan budaya dimana aku berada?",
      "Karatau madang di hulu, babuah babungo balun - Kesabaran akan berbuah manis. Dimana aku perlu lebih sabar?",
      "Buya hamka bertuah - Kebijaksanaan guru sangat berharga. Siapa guruku hari ini?"
    ]
  };

  constructor() {
    this.loadEntries();
    this.loadPrompts();
    this.calculateAnalytics();
  }

  private loadEntries(): void {
    const stored = localStorage.getItem('comprehensiveJournalEntries');
    if (stored) {
      const entriesArray: JournalEntry[] = JSON.parse(stored);
      entriesArray.forEach(entry => {
        entry.timestamp = new Date(entry.timestamp);
        this.entries.set(entry.id, entry);
      });
    }
  }

  private saveEntries(): void {
    const entriesArray = Array.from(this.entries.values());
    localStorage.setItem('comprehensiveJournalEntries', JSON.stringify(entriesArray));
    this.calculateAnalytics();
  }

  private loadPrompts(): void {
    // Initialize cultural prompts
    Object.entries(this.culturalPrompts).forEach(([region, prompts]) => {
      prompts.forEach((promptText, index) => {
        this.prompts.push({
          id: `${region}-${index}`,
          text: promptText,
          category: 'cultural',
          culturalOrigin: region,
          difficulty: 'intermediate',
          estimatedTime: 10
        });
      });
    });

    // Add general reflection prompts
    const generalPrompts = [
      "Apa tiga hal yang membuatku bersyukur hari ini?",
      "Bagaimana meditasi mempengaruhi suasana hatiku?",
      "Apa pelajaran terpenting yang aku dapatkan hari ini?",
      "Dimana aku merasakan kedamaian paling dalam hari ini?",
      "Bagaimana aku bisa lebih hadir dalam momen-momen kecil?",
      "Apa impian atau aspirasi yang muncul dalam meditasiku?",
      "Bagaimana aku bisa lebih berkomitmen pada praktik mindfulness?",
      "Apa tantangan emosional yang aku hadapi dan bagaimana mengatasinya?",
      "Bagaimana alam mempengaruhi ketenangan batinku?",
      "Apa kebijaksanaan dari leluhur yang relevan dengan situasiku sekarang?"
    ];

    generalPrompts.forEach((prompt, index) => {
      this.prompts.push({
        id: `general-${index}`,
        text: prompt,
        category: 'reflection',
        culturalOrigin: 'general',
        difficulty: 'beginner',
        estimatedTime: 5
      });
    });
  }

  // Main journaling methods
  createEntry(entryData: Partial<JournalEntry>): JournalEntry {
    const entry: JournalEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      type: entryData.type || 'reflection',
      title: entryData.title || '',
      content: entryData.content || '',
      mood: entryData.mood || this.createEmptyMoodState(),
      tags: entryData.tags || [],
      privacy: entryData.privacy || 'private',
      language: entryData.language || 'id',
      wordCount: this.calculateWordCount(entryData.content || ''),
      readingTime: this.calculateReadingTime(entryData.content || ''),
      favorited: false,
      archived: false,
      ...entryData
    };

    this.entries.set(entry.id, entry);
    this.saveEntries();
    
    // Generate AI insights
    this.generateInsights(entry);
    
    return entry;
  }

  updateEntry(entryId: string, updates: Partial<JournalEntry>): boolean {
    const entry = this.entries.get(entryId);
    if (!entry) return false;

    const updatedEntry = {
      ...entry,
      ...updates,
      wordCount: updates.content ? this.calculateWordCount(updates.content) : entry.wordCount,
      readingTime: updates.content ? this.calculateReadingTime(updates.content) : entry.readingTime
    };

    this.entries.set(entryId, updatedEntry);
    this.saveEntries();
    return true;
  }

  deleteEntry(entryId: string): boolean {
    const deleted = this.entries.delete(entryId);
    if (deleted) {
      this.saveEntries();
    }
    return deleted;
  }

  getEntry(entryId: string): JournalEntry | null {
    return this.entries.get(entryId) || null;
  }

  getAllEntries(filters?: {
    type?: string;
    startDate?: Date;
    endDate?: Date;
    tags?: string[];
    mood?: string;
    favorited?: boolean;
    archived?: boolean;
  }): JournalEntry[] {
    let entries = Array.from(this.entries.values());

    if (filters) {
      if (filters.type) {
        entries = entries.filter(e => e.type === filters.type);
      }
      if (filters.startDate) {
        entries = entries.filter(e => e.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        entries = entries.filter(e => e.timestamp <= filters.endDate!);
      }
      if (filters.tags && filters.tags.length > 0) {
        entries = entries.filter(e => 
          filters.tags!.some(tag => e.tags.includes(tag))
        );
      }
      if (filters.favorited !== undefined) {
        entries = entries.filter(e => e.favorited === filters.favorited);
      }
      if (filters.archived !== undefined) {
        entries = entries.filter(e => e.archived === filters.archived);
      }
    }

    return entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Mood and emotion tracking
  private createEmptyMoodState(): EmotionalState {
    return {
      primary: 'netral',
      intensity: 5,
      secondary: [],
      energyLevel: 5,
      peacefulnessLevel: 5,
      gratitudeLevel: 5,
      clarityLevel: 5,
      stressLevel: 3,
      indonesianEmotions: {
        hati: 'tenang',
        jiwa: 'tenteram',
        pikiran: 'jernih',
        spiritualitas: 'terhubung'
      }
    };
  }

  getEmotionalVocabulary(language: 'id' | 'en' | 'jv' = 'id', category: 'positive' | 'negative' | 'neutral' = 'positive'): string[] {
    return this.indonesianEmotions[category][language] || this.indonesianEmotions[category].id;
  }

  analyzeMoodTrends(days: number = 30): EmotionalTrend[] {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const recentEntries = this.getAllEntries({
      startDate: cutoffDate
    });

    const trendsByDate = new Map<string, JournalEntry[]>();
    
    recentEntries.forEach(entry => {
      const dateKey = entry.timestamp.toDateString();
      if (!trendsByDate.has(dateKey)) {
        trendsByDate.set(dateKey, []);
      }
      trendsByDate.get(dateKey)!.push(entry);
    });

    const trends: EmotionalTrend[] = [];
    trendsByDate.forEach((entries, date) => {
      const avgMood = entries.reduce((sum, e) => sum + (e.mood.peacefulnessLevel || 5), 0) / entries.length;
      const avgStress = entries.reduce((sum, e) => sum + (e.mood.stressLevel || 5), 0) / entries.length;
      const avgGratitude = entries.reduce((sum, e) => sum + (e.mood.gratitudeLevel || 5), 0) / entries.length;
      
      // Find most common emotion
      const emotions = entries.map(e => e.mood.primary);
      const emotionCounts = emotions.reduce((acc, emotion) => {
        acc[emotion] = (acc[emotion] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const dominantEmotion = Object.keys(emotionCounts).reduce((a, b) => 
        emotionCounts[a] > emotionCounts[b] ? a : b
      );

      trends.push({
        date,
        averageMood: avgMood,
        dominantEmotion,
        stressLevel: avgStress,
        gratitudeLevel: avgGratitude
      });
    });

    return trends.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  // Cultural and wisdom integration
  getDailyPrompt(culturalPreference?: string): JournalPrompt {
    let availablePrompts = this.prompts;
    
    if (culturalPreference) {
      availablePrompts = this.prompts.filter(p => 
        p.culturalOrigin === culturalPreference || p.culturalOrigin === 'general'
      );
    }

    const randomIndex = Math.floor(Math.random() * availablePrompts.length);
    return availablePrompts[randomIndex];
  }

  getPromptsForCategory(category: string, culturalRegion?: string): JournalPrompt[] {
    return this.prompts.filter(p => {
      const matchesCategory = p.category === category;
      const matchesRegion = !culturalRegion || p.culturalOrigin === culturalRegion || p.culturalOrigin === 'general';
      return matchesCategory && matchesRegion;
    });
  }

  // AI-powered insights
  private generateInsights(entry: JournalEntry): void {
    const insights: AIGeneratedInsight[] = [];

    // Pattern recognition
    if (this.entries.size > 5) {
      const recentEntries = this.getAllEntries().slice(0, 5);
      const commonTags = this.findCommonPatterns(recentEntries.map(e => e.tags));
      const moodPattern = this.analyzeMoodPattern(recentEntries);
      
      if (commonTags.length > 0) {
        insights.push({
          type: 'pattern',
          content: `Tema yang sering muncul dalam jurnalmu: ${commonTags.join(', ')}. Ini menunjukkan fokus spiritualmu.`,
          confidence: 0.8,
          culturalRelevance: 0.7
        });
      }

      if (moodPattern.isImproving) {
        insights.push({
          type: 'growth',
          content: `Suasana hatimu menunjukkan peningkatan dalam ${moodPattern.improvingAreas.join(' dan ')}. Terus pertahankan praktik mindfulnessmu.`,
          confidence: 0.9,
          culturalRelevance: 0.8
        });
      }
    }

    // Cultural wisdom recommendations
    if (entry.culturalContext) {
      const wisdomInsight = this.getCulturalWisdomInsight(entry.culturalContext.region, entry.content);
      if (wisdomInsight) {
        insights.push(wisdomInsight);
      }
    }

    // Update entry with insights
    if (insights.length > 0) {
      entry.insights = insights;
      this.entries.set(entry.id, entry);
      this.saveEntries();
    }
  }

  private findCommonPatterns(tagArrays: string[][]): string[] {
    const tagFrequency = new Map<string, number>();
    tagArrays.forEach(tags => {
      tags.forEach(tag => {
        tagFrequency.set(tag, (tagFrequency.get(tag) || 0) + 1);
      });
    });

    return Array.from(tagFrequency.entries())
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, _]) => tag)
      .slice(0, 3);
  }

  private analyzeMoodPattern(entries: JournalEntry[]): { isImproving: boolean; improvingAreas: string[] } {
    if (entries.length < 3) return { isImproving: false, improvingAreas: [] };

    const recent = entries.slice(0, 2);
    const older = entries.slice(2, 4);

    const recentAvg = {
      peace: recent.reduce((sum, e) => sum + e.mood.peacefulnessLevel, 0) / recent.length,
      gratitude: recent.reduce((sum, e) => sum + e.mood.gratitudeLevel, 0) / recent.length,
      clarity: recent.reduce((sum, e) => sum + e.mood.clarityLevel, 0) / recent.length,
      stress: recent.reduce((sum, e) => sum + e.mood.stressLevel, 0) / recent.length
    };

    const olderAvg = {
      peace: older.reduce((sum, e) => sum + e.mood.peacefulnessLevel, 0) / older.length,
      gratitude: older.reduce((sum, e) => sum + e.mood.gratitudeLevel, 0) / older.length,
      clarity: older.reduce((sum, e) => sum + e.mood.clarityLevel, 0) / older.length,
      stress: older.reduce((sum, e) => sum + e.mood.stressLevel, 0) / older.length
    };

    const improvements = [];
    if (recentAvg.peace > olderAvg.peace + 0.5) improvements.push('kedamaian');
    if (recentAvg.gratitude > olderAvg.gratitude + 0.5) improvements.push('rasa syukur');
    if (recentAvg.clarity > olderAvg.clarity + 0.5) improvements.push('kejernihan pikiran');
    if (recentAvg.stress < olderAvg.stress - 0.5) improvements.push('pengurangan stress');

    return {
      isImproving: improvements.length > 0,
      improvingAreas: improvements
    };
  }

  private getCulturalWisdomInsight(region: string, content: string): AIGeneratedInsight | null {
    const wisdomMappings = {
      java: {
        keywords: ['sabar', 'kerja keras', 'usaha', 'kerendahan hati'],
        wisdom: 'Seperti pepatah Jawa: "Sopo sing sabar, bakal pikantuk" - kesabaran akan membuahkan hasil.'
      },
      bali: {
        keywords: ['harmoni', 'keseimbangan', 'alam', 'spiritual'],
        wisdom: 'Dalam filosofi Tri Hita Karana, keharmonisan dengan Tuhan, sesama, dan alam membawa kedamaian.'
      },
      sembalun: {
        keywords: ['komunitas', 'kerjasama', 'alam', 'gunung'],
        wisdom: 'Seperti dalam tradisi Sembalun: "Begawe bareng, behasil bareng" - bersama kita kuat.'
      },
      sumatra: {
        keywords: ['kebijaksanaan', 'alam', 'tradisi', 'pembelajaran'],
        wisdom: 'Mengikuti pepatah Minang: "Alam takambang jadi guru" - alam adalah guru terbaik.'
      }
    };

    const mapping = wisdomMappings[region as keyof typeof wisdomMappings];
    if (!mapping) return null;

    const hasRelevantKeywords = mapping.keywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );

    if (hasRelevantKeywords) {
      return {
        type: 'cultural_wisdom',
        content: mapping.wisdom,
        confidence: 0.85,
        culturalRelevance: 0.95
      };
    }

    return null;
  }

  // Analytics and statistics
  calculateAnalytics(): JournalAnalytics {
    const entries = this.getAllEntries();
    const totalEntries = entries.length;

    if (totalEntries === 0) {
      this.analytics = {
        totalEntries: 0,
        averageWordsPerEntry: 0,
        mostUsedTags: [],
        emotionalTrends: [],
        writingStreak: 0,
        favoriteWritingTimes: [],
        culturalEngagement: {
          mostExploredRegions: [],
          wisdomQuotesUsed: 0,
          culturalPracticesTracked: [],
          spiritualGrowthScore: 0
        },
        personalGrowth: {
          selfAwarenessScore: 0,
          emotionalIntelligenceGrowth: 0,
          mindfulnessConsistency: 0,
          culturalConnectionDepth: 0
        }
      };
      return this.analytics;
    }

    // Calculate basic metrics
    const totalWords = entries.reduce((sum, e) => sum + e.wordCount, 0);
    const averageWordsPerEntry = totalWords / totalEntries;

    // Most used tags
    const allTags = entries.flatMap(e => e.tags);
    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostUsedTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);

    // Writing streak
    const writingStreak = this.calculateWritingStreak(entries);

    // Favorite writing times
    const writingTimes = entries.map(e => e.timestamp.getHours());
    const timeGroups = writingTimes.reduce((acc, hour) => {
      const timeSlot = this.getTimeSlot(hour);
      acc[timeSlot] = (acc[timeSlot] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const favoriteWritingTimes = Object.entries(timeGroups)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([time]) => time);

    // Cultural engagement
    const culturalEntries = entries.filter(e => e.culturalContext);
    const regionCounts = culturalEntries.reduce((acc, e) => {
      if (e.culturalContext) {
        acc[e.culturalContext.region] = (acc[e.culturalContext.region] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const mostExploredRegions = Object.entries(regionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([region]) => region);

    // Personal growth metrics
    const recentEntries = entries.slice(0, 30); // Last 30 entries
    const emotionalTrends = this.analyzeMoodTrends(30);

    const personalGrowth = this.calculatePersonalGrowth(recentEntries, emotionalTrends);

    this.analytics = {
      totalEntries,
      averageWordsPerEntry,
      mostUsedTags,
      emotionalTrends,
      writingStreak,
      favoriteWritingTimes,
      culturalEngagement: {
        mostExploredRegions,
        wisdomQuotesUsed: culturalEntries.length,
        culturalPracticesTracked: [...new Set(culturalEntries.map(e => e.culturalContext?.practice).filter(Boolean))],
        spiritualGrowthScore: this.calculateSpiritualGrowthScore(culturalEntries)
      },
      personalGrowth
    };

    return this.analytics;
  }

  private calculateWritingStreak(entries: JournalEntry[]): number {
    if (entries.length === 0) return 0;

    const sortedDates = entries
      .map(e => e.timestamp.toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 1;
    let currentDate = new Date(sortedDates[0]);

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i]);
      const daysDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        streak++;
        currentDate = prevDate;
      } else {
        break;
      }
    }

    return streak;
  }

  private getTimeSlot(hour: number): string {
    if (hour >= 5 && hour < 12) return 'Pagi (05:00-12:00)';
    if (hour >= 12 && hour < 17) return 'Siang (12:00-17:00)';
    if (hour >= 17 && hour < 21) return 'Sore (17:00-21:00)';
    return 'Malam (21:00-05:00)';
  }

  private calculateSpiritualGrowthScore(culturalEntries: JournalEntry[]): number {
    if (culturalEntries.length === 0) return 0;

    let score = 0;
    const maxScore = culturalEntries.length * 10;

    culturalEntries.forEach(entry => {
      // Points for cultural context
      if (entry.culturalContext) score += 2;
      
      // Points for wisdom integration
      if (entry.culturalContext?.wisdom) score += 3;
      
      // Points for depth (word count)
      if (entry.wordCount > 100) score += 2;
      if (entry.wordCount > 300) score += 2;
      
      // Points for emotional awareness
      if (entry.mood.peacefulnessLevel > 7) score += 1;
    });

    return Math.min(100, (score / maxScore) * 100);
  }

  private calculatePersonalGrowth(entries: JournalEntry[], trends: EmotionalTrend[]): GrowthMetrics {
    const selfAwarenessScore = this.calculateSelfAwarenessScore(entries);
    const emotionalIntelligenceGrowth = this.calculateEmotionalIntelligenceGrowth(trends);
    const mindfulnessConsistency = this.calculateMindfulnessConsistency(entries);
    const culturalConnectionDepth = this.calculateCulturalConnectionDepth(entries);

    return {
      selfAwarenessScore,
      emotionalIntelligenceGrowth,
      mindfulnessConsistency,
      culturalConnectionDepth
    };
  }

  private calculateSelfAwarenessScore(entries: JournalEntry[]): number {
    if (entries.length === 0) return 0;

    let score = 0;
    entries.forEach(entry => {
      // Points for emotional vocabulary richness
      if (entry.mood.secondary && entry.mood.secondary.length > 0) score += 2;
      
      // Points for self-reflection depth
      if (entry.content.length > 200) score += 1;
      if (entry.content.toLowerCase().includes('refleksi') || 
          entry.content.toLowerCase().includes('realize') ||
          entry.content.toLowerCase().includes('sadar')) score += 2;
      
      // Points for pattern recognition
      if (entry.insights && entry.insights.length > 0) score += 1;
    });

    return Math.min(100, (score / (entries.length * 5)) * 100);
  }

  private calculateEmotionalIntelligenceGrowth(trends: EmotionalTrend[]): number {
    if (trends.length < 7) return 0;

    const recent = trends.slice(-7);
    const older = trends.slice(0, 7);

    const recentAvg = recent.reduce((sum, t) => sum + t.averageMood, 0) / recent.length;
    const olderAvg = older.reduce((sum, t) => sum + t.averageMood, 0) / older.length;

    const improvement = ((recentAvg - olderAvg) / 10) * 100;
    return Math.max(0, Math.min(100, 50 + improvement));
  }

  private calculateMindfulnessConsistency(entries: JournalEntry[]): number {
    if (entries.length === 0) return 0;

    const meditationEntries = entries.filter(e => 
      e.type === 'meditation' || 
      e.meditationData ||
      e.tags.includes('meditasi') ||
      e.tags.includes('mindfulness')
    );

    const consistency = (meditationEntries.length / entries.length) * 100;
    return Math.min(100, consistency);
  }

  private calculateCulturalConnectionDepth(entries: JournalEntry[]): number {
    if (entries.length === 0) return 0;

    let score = 0;
    const maxScore = entries.length * 5;

    entries.forEach(entry => {
      if (entry.culturalContext) {
        score += 2;
        if (entry.culturalContext.wisdom) score += 2;
        if (entry.culturalContext.ceremony) score += 1;
      }
    });

    return (score / maxScore) * 100;
  }

  // Utility methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private calculateWordCount(content: string): number {
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  private calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = this.calculateWordCount(content);
    return Math.ceil(wordCount / wordsPerMinute);
  }

  // Export methods
  exportJournal(format: 'json' | 'csv' | 'txt' = 'json', filters?: any): string {
    const entries = this.getAllEntries(filters);
    
    switch (format) {
      case 'json':
        return JSON.stringify({
          exportDate: new Date(),
          totalEntries: entries.length,
          entries: entries,
          analytics: this.analytics
        }, null, 2);
        
      case 'csv':
        return this.convertToCSV(entries);
        
      case 'txt':
        return this.convertToText(entries);
        
      default:
        return JSON.stringify(entries, null, 2);
    }
  }

  private convertToCSV(entries: JournalEntry[]): string {
    const headers = ['Tanggal', 'Judul', 'Jenis', 'Suasana Hati', 'Intensitas', 'Kata', 'Tag'];
    const rows = entries.map(entry => [
      entry.timestamp.toLocaleDateString('id-ID'),
      `"${entry.title.replace(/"/g, '""')}"`,
      entry.type,
      entry.mood.primary,
      entry.mood.intensity,
      entry.wordCount,
      entry.tags.join('; ')
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  private convertToText(entries: JournalEntry[]): string {
    return entries.map(entry => {
      const date = entry.timestamp.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      return `=== ${date} ===\n` +
             `Judul: ${entry.title}\n` +
             `Jenis: ${entry.type}\n` +
             `Suasana Hati: ${entry.mood.primary} (Intensitas: ${entry.mood.intensity}/10)\n` +
             `Tag: ${entry.tags.join(', ')}\n\n` +
             `${entry.content}\n` +
             `\n--- Kata: ${entry.wordCount} | Waktu Baca: ${entry.readingTime} menit ---\n\n\n`;
    }).join('');
  }

  // Public getter methods
  getAnalytics(): JournalAnalytics {
    return this.analytics || this.calculateAnalytics();
  }

  searchEntries(query: string, filters?: any): JournalEntry[] {
    const entries = this.getAllEntries(filters);
    const lowercaseQuery = query.toLowerCase();
    
    return entries.filter(entry =>
      entry.title.toLowerCase().includes(lowercaseQuery) ||
      entry.content.toLowerCase().includes(lowercaseQuery) ||
      entry.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      entry.mood.primary.toLowerCase().includes(lowercaseQuery)
    );
  }
}

// Export singleton instance
export const comprehensiveJournalingService = new ComprehensiveJournalingService();
export default ComprehensiveJournalingService;