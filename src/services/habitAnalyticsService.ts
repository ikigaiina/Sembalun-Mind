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
import { progressService } from './progressService';

export interface HabitPattern {
  id: string;
  userId: string;
  habitType: 'meditation_frequency' | 'session_duration' | 'time_of_day' | 'technique_preference' | 'mood_improvement';
  pattern: string;
  strength: number; // 0-1 scale
  confidence: number; // 0-1 scale
  frequency: number; // times per week/month
  lastOccurrence: Date;
  trend: 'strengthening' | 'weakening' | 'stable';
  suggestions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface HabitSuggestion {
  id: string;
  type: 'consistency' | 'duration' | 'timing' | 'technique' | 'environment';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  expectedBenefit: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeToSee: string; // e.g., "1-2 weeks"
  evidence: {
    currentBehavior: string;
    dataPoints: number;
    successRate?: number;
  };
}

export interface HabitInsight {
  category: string;
  insight: string;
  recommendation: string;
  impact: 'high' | 'medium' | 'low';
  timeframe: string;
  actionable: boolean;
}

export interface HabitFormationStage {
  stage: 'initiation' | 'learning' | 'stabilization' | 'maintenance';
  description: string;
  duration: number; // days in this stage
  challenges: string[];
  strategies: string[];
  nextMilestone: string;
}

export class HabitAnalyticsService {
  private static instance: HabitAnalyticsService;

  static getInstance(): HabitAnalyticsService {
    if (!HabitAnalyticsService.instance) {
      HabitAnalyticsService.instance = new HabitAnalyticsService();
    }
    return HabitAnalyticsService.instance;
  }

  async analyzeUserHabits(userId: string): Promise<HabitPattern[]> {
    try {
      const sessions = await progressService.getMeditationSessions(userId, 100);
      if (sessions.length < 5) return [];

      const patterns: Omit<HabitPattern, 'id'>[] = [];

      // Analyze meditation frequency pattern
      const frequencyPattern = this.analyzeMeditationFrequency(sessions);
      if (frequencyPattern) patterns.push(frequencyPattern);

      // Analyze session duration pattern
      const durationPattern = this.analyzeSessionDuration(sessions);
      if (durationPattern) patterns.push(durationPattern);

      // Analyze time of day pattern
      const timePattern = this.analyzeTimeOfDay(sessions);
      if (timePattern) patterns.push(timePattern);

      // Analyze technique preference pattern
      const techniquePattern = this.analyzeTechniquePreference(sessions);
      if (techniquePattern) patterns.push(techniquePattern);

      // Analyze mood improvement pattern
      const moodPattern = this.analyzeMoodImprovement(sessions);
      if (moodPattern) patterns.push(moodPattern);

      // Save patterns to database
      const savedPatterns: HabitPattern[] = [];
      for (const pattern of patterns) {
        const docRef = await addDoc(collection(db, 'habit_patterns'), {
          ...pattern,
          lastOccurrence: Timestamp.fromDate(pattern.lastOccurrence),
          createdAt: Timestamp.fromDate(pattern.createdAt),
          updatedAt: Timestamp.fromDate(pattern.updatedAt)
        });
        savedPatterns.push({ id: docRef.id, ...pattern });
      }

      return savedPatterns;
    } catch (error) {
      console.error('Error analyzing user habits:', error);
      return [];
    }
  }

  private analyzeMeditationFrequency(sessions: any[]): Omit<HabitPattern, 'id'> | null {
    const now = new Date();
    const last30Days = sessions.filter(s => 
      (now.getTime() - new Date(s.date).getTime()) / (1000 * 60 * 60 * 24) <= 30
    );

    if (last30Days.length < 5) return null;

    // Group sessions by week
    const weeklyFreq: { [week: string]: number } = {};
    last30Days.forEach(session => {
      const sessionDate = new Date(session.date);
      const weekKey = this.getWeekKey(sessionDate);
      weeklyFreq[weekKey] = (weeklyFreq[weekKey] || 0) + 1;
    });

    const frequencies = Object.values(weeklyFreq);
    const avgFrequency = frequencies.reduce((a, b) => a + b, 0) / frequencies.length;
    const consistency = 1 - (this.standardDeviation(frequencies) / avgFrequency);

    let pattern = '';
    let suggestions: string[] = [];

    if (avgFrequency >= 6) {
      pattern = 'Meditasi hampir setiap hari';
      suggestions = ['Pertahankan konsistensi yang luar biasa ini', 'Pertimbangkan sesi yang lebih panjang'];
    } else if (avgFrequency >= 4) {
      pattern = 'Meditasi rutin 4-5x per minggu';
      suggestions = ['Coba tambah 1-2 sesi lagi per minggu', 'Set reminder untuk hari-hari yang terlewat'];
    } else if (avgFrequency >= 2) {
      pattern = 'Meditasi 2-3x per minggu';
      suggestions = ['Mulai dengan target 4x per minggu', 'Cari waktu yang konsisten setiap hari'];
    } else {
      pattern = 'Meditasi tidak rutin';
      suggestions = ['Mulai dengan target 3x per minggu', 'Set waktu yang sama setiap hari', 'Mulai dengan sesi pendek 5-10 menit'];
    }

    return {
      userId: sessions[0].userId,
      habitType: 'meditation_frequency',
      pattern,
      strength: Math.min(1, avgFrequency / 7),
      confidence: Math.min(1, consistency),
      frequency: avgFrequency,
      lastOccurrence: new Date(sessions[0].completedAt),
      trend: this.calculateTrend(frequencies),
      suggestions,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private analyzeSessionDuration(sessions: any[]): Omit<HabitPattern, 'id'> | null {
    if (sessions.length < 5) return null;

    const durations = sessions.map(s => s.duration);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const consistency = 1 - (this.standardDeviation(durations) / avgDuration);

    let pattern = '';
    let suggestions: string[] = [];

    if (avgDuration >= 30) {
      pattern = 'Sesi meditasi panjang (30+ menit)';
      suggestions = ['Pertahankan durasi yang mendalam ini', 'Eksplorasi teknik advanced'];
    } else if (avgDuration >= 15) {
      pattern = 'Sesi meditasi menengah (15-30 menit)';
      suggestions = ['Coba perpanjang secara bertahap', 'Variasikan durasi sesuai kebutuhan'];
    } else if (avgDuration >= 8) {
      pattern = 'Sesi meditasi pendek (8-15 menit)';
      suggestions = ['Tingkatkan durasi 2-3 menit setiap minggu', 'Fokus pada kualitas daripada kuantitas'];
    } else {
      pattern = 'Sesi meditasi sangat pendek (<8 menit)';
      suggestions = ['Mulai dengan target 10 menit', 'Gunakan guided meditation untuk pemula'];
    }

    return {
      userId: sessions[0].userId,
      habitType: 'session_duration',
      pattern,
      strength: Math.min(1, avgDuration / 30),
      confidence: consistency,
      frequency: avgDuration,
      lastOccurrence: new Date(sessions[0].completedAt),
      trend: this.calculateDurationTrend(sessions),
      suggestions,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private analyzeTimeOfDay(sessions: any[]): Omit<HabitPattern, 'id'> | null {
    if (sessions.length < 5) return null;

    const timeSlots: { [slot: string]: number } = {
      'morning': 0,   // 5-11 AM
      'afternoon': 0, // 11 AM - 5 PM
      'evening': 0,   // 5-9 PM
      'night': 0      // 9 PM - 5 AM
    };

    sessions.forEach(session => {
      const hour = new Date(session.date).getHours();
      if (hour >= 5 && hour < 11) timeSlots.morning++;
      else if (hour >= 11 && hour < 17) timeSlots.afternoon++;
      else if (hour >= 17 && hour < 21) timeSlots.evening++;
      else timeSlots.night++;
    });

    const preferredTime = Object.entries(timeSlots).reduce((a, b) => 
      timeSlots[a[0]] > timeSlots[b[0]] ? a : b
    )[0];

    const timeLabels: Record<string, string> = {
      morning: 'Pagi',
      afternoon: 'Siang',
      evening: 'Sore',
      night: 'Malam'
    };

    const strength = timeSlots[preferredTime] / sessions.length;
    const preferredTimeLabel = timeLabels[preferredTime] || 'waktu pilihan Anda';
    
    let suggestions: string[] = [];
    if (strength > 0.7) {
      suggestions = [
        `Pertahankan rutinitas ${preferredTimeLabel.toLowerCase()} yang konsisten`,
        'Siapkan backup plan untuk waktu alternatif'
      ];
    } else {
      suggestions = [
        `Coba konsisten meditasi di waktu ${preferredTimeLabel.toLowerCase()}`,
        'Set alarm atau reminder untuk waktu yang sama',
        'Siapkan lingkungan meditasi yang kondusif'
      ];
    }

    return {
      userId: sessions[0].userId,
      habitType: 'time_of_day',
      pattern: `Lebih suka meditasi di waktu ${preferredTimeLabel.toLowerCase()}`,
      strength,
      confidence: strength,
      frequency: timeSlots[preferredTime],
      lastOccurrence: new Date(sessions[0].completedAt),
      trend: 'stable',
      suggestions,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private analyzeTechniquePreference(sessions: any[]): Omit<HabitPattern, 'id'> | null {
    if (sessions.length < 5) return null;

    const techniques: { [technique: string]: number } = {};
    sessions.forEach(session => {
      session.techniques.forEach((tech: string) => {
        techniques[tech] = (techniques[tech] || 0) + 1;
      });
    });

    const topTechniques = Object.entries(techniques)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    if (topTechniques.length === 0) return null;

    const [preferredTechnique, count] = topTechniques[0];
    const strength = count / sessions.length;

    let suggestions: string[] = [];
    if (strength > 0.6) {
      suggestions = [
        `Eksplorasi variasi dari teknik ${preferredTechnique}`,
        'Coba teknik komplementer untuk pengembangan holistik'
      ];
    } else {
      suggestions = [
        'Eksplorasi berbagai teknik untuk menemukan yang cocok',
        'Fokus pada 2-3 teknik utama untuk konsistensi'
      ];
    }

    return {
      userId: sessions[0].userId,
      habitType: 'technique_preference',
      pattern: `Preferensi teknik: ${preferredTechnique}`,
      strength,
      confidence: strength,
      frequency: count,
      lastOccurrence: new Date(sessions[0].completedAt),
      trend: 'stable',
      suggestions,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private analyzeMoodImprovement(sessions: any[]): Omit<HabitPattern, 'id'> | null {
    const sessionsWithMood = sessions.filter(s => s.moodBefore && s.moodAfter);
    if (sessionsWithMood.length < 5) return null;

    const improvements = sessionsWithMood.map(s => s.moodAfter - s.moodBefore);
    const avgImprovement = improvements.reduce((a, b) => a + b, 0) / improvements.length;
    const positiveImprovements = improvements.filter(imp => imp > 0).length;
    const successRate = positiveImprovements / improvements.length;

    let pattern = '';
    let suggestions: string[] = [];

    if (avgImprovement >= 1.5) {
      pattern = 'Peningkatan mood yang signifikan setelah meditasi';
      suggestions = ['Meditasi terbukti sangat efektif untuk Anda', 'Pertahankan praktik yang konsisten'];
    } else if (avgImprovement >= 0.5) {
      pattern = 'Peningkatan mood yang moderat setelah meditasi';
      suggestions = ['Coba teknik yang lebih fokus pada mood', 'Perpanjang durasi sesi'];
    } else {
      pattern = 'Peningkatan mood yang minimal';
      suggestions = ['Eksplorasi teknik loving-kindness', 'Fokus pada teknik relaksasi', 'Konsultasi dengan instruktur'];
    }

    return {
      userId: sessions[0].userId,
      habitType: 'mood_improvement',
      pattern,
      strength: Math.min(1, avgImprovement / 2),
      confidence: successRate,
      frequency: avgImprovement,
      lastOccurrence: new Date(sessions[0].completedAt),
      trend: this.calculateMoodTrend(sessionsWithMood),
      suggestions,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async generateHabitSuggestions(userId: string): Promise<HabitSuggestion[]> {
    try {
      const patterns = await this.getUserHabitPatterns(userId);
      const sessions = await progressService.getMeditationSessions(userId, 50);
      
      const suggestions: HabitSuggestion[] = [];

      // Consistency suggestions
      const frequencyPattern = patterns.find(p => p.habitType === 'meditation_frequency');
      if (frequencyPattern && frequencyPattern.strength < 0.7) {
        suggestions.push({
          id: 'consistency-1',
          type: 'consistency',
          priority: 'high',
          title: 'Tingkatkan Konsistensi Meditasi',
          description: 'Anda bermeditasi dengan frekuensi yang tidak stabil',
          action: 'Set jadwal meditasi tetap di waktu yang sama setiap hari',
          expectedBenefit: 'Meningkatkan pembentukan habit dan efektivitas praktik',
          difficulty: 'medium',
          timeToSee: '2-3 minggu',
          evidence: {
            currentBehavior: frequencyPattern.pattern,
            dataPoints: sessions.length,
            successRate: frequencyPattern.strength
          }
        });
      }

      // Duration suggestions
      const durationPattern = patterns.find(p => p.habitType === 'session_duration');
      if (durationPattern && durationPattern.frequency < 15) {
        suggestions.push({
          id: 'duration-1',
          type: 'duration',
          priority: 'medium',
          title: 'Perpanjang Durasi Sesi',
          description: 'Sesi meditasi Anda cenderung pendek',
          action: 'Tingkatkan durasi 2-3 menit setiap minggu hingga mencapai 15-20 menit',
          expectedBenefit: 'Manfaat meditasi yang lebih mendalam dan berkelanjutan',
          difficulty: 'easy',
          timeToSee: '1-2 minggu',
          evidence: {
            currentBehavior: durationPattern.pattern,
            dataPoints: sessions.length
          }
        });
      }

      // Timing suggestions
      const timePattern = patterns.find(p => p.habitType === 'time_of_day');
      if (timePattern && timePattern.strength < 0.6) {
        suggestions.push({
          id: 'timing-1',
          type: 'timing',
          priority: 'medium',
          title: 'Stabilkan Waktu Meditasi',
          description: 'Waktu meditasi Anda tidak konsisten',
          action: 'Pilih satu waktu yang paling cocok dan konsisten lakukan di waktu tersebut',
          expectedBenefit: 'Pembentukan habit yang lebih kuat dan otomatis',
          difficulty: 'medium',
          timeToSee: '2-4 minggu',
          evidence: {
            currentBehavior: timePattern.pattern,
            dataPoints: sessions.length
          }
        });
      }

      // Technique suggestions
      const techniquePattern = patterns.find(p => p.habitType === 'technique_preference');
      if (techniquePattern && techniquePattern.strength > 0.8) {
        suggestions.push({
          id: 'technique-1',
          type: 'technique',
          priority: 'low',
          title: 'Variasikan Teknik Meditasi',
          description: 'Anda terlalu fokus pada satu teknik',
          action: 'Coba teknik baru 1-2x per minggu untuk pengembangan holistik',
          expectedBenefit: 'Pengembangan keterampilan meditasi yang lebih lengkap',
          difficulty: 'easy',
          timeToSee: '1-2 minggu',
          evidence: {
            currentBehavior: techniquePattern.pattern,
            dataPoints: sessions.length
          }
        });
      }

      return suggestions.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    } catch (error) {
      console.error('Error generating habit suggestions:', error);
      return [];
    }
  }

  async getUserHabitPatterns(userId: string): Promise<HabitPattern[]> {
    try {
      const q = query(
        collection(db, 'habit_patterns'),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc'),
        limit(20)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastOccurrence: doc.data().lastOccurrence.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as HabitPattern[];
    } catch (error) {
      console.error('Error fetching habit patterns:', error);
      return [];
    }
  }

  getHabitFormationStage(daysPracticing: number, consistency: number): HabitFormationStage {
    if (daysPracticing < 7) {
      return {
        stage: 'initiation',
        description: 'Tahap awal pembentukan habit meditasi',
        duration: daysPracticing,
        challenges: ['Motivasi awal', 'Menemukan waktu yang tepat', 'Ekspektasi yang tidak realistis'],
        strategies: ['Mulai dengan sesi pendek', 'Set reminder', 'Fokus pada konsistensi'],
        nextMilestone: 'Meditasi rutin selama 1 minggu'
      };
    } else if (daysPracticing < 21) {
      return {
        stage: 'learning',
        description: 'Tahap pembelajaran dan adaptasi',
        duration: daysPracticing,
        challenges: ['Kehilangan motivasi', 'Pikiran yang wandering', 'Kebosanan'],
        strategies: ['Variasikan teknik', 'Join komunitas', 'Track progress'],
        nextMilestone: 'Meditasi rutin selama 3 minggu'
      };
    } else if (daysPracticing < 66) {
      return {
        stage: 'stabilization',
        description: 'Tahap stabilisasi habit',
        duration: daysPracticing,
        challenges: ['Plateau effect', 'Situasi mengganggu', 'Perfectionism'],
        strategies: ['Deepen practice', 'Maintain flexibility', 'Celebrate small wins'],
        nextMilestone: 'Habit yang stabil dan otomatis'
      };
    } else {
      return {
        stage: 'maintenance',
        description: 'Habit meditasi yang sudah terbentuk',
        duration: daysPracticing,
        challenges: ['Complacency', 'Life changes', 'Advanced plateaus'],
        strategies: ['Continuous learning', 'Adapt to changes', 'Mentor others'],
        nextMilestone: 'Mastery dan wisdom dalam praktik'
      };
    }
  }

  private standardDeviation(values: number[]): number {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map(value => Math.pow(value - avg, 2));
    return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / values.length);
  }

  private calculateTrend(frequencies: number[]): 'strengthening' | 'weakening' | 'stable' {
    if (frequencies.length < 3) return 'stable';
    
    const recent = frequencies.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const earlier = frequencies.slice(0, -3).reduce((a, b) => a + b, 0) / (frequencies.length - 3);
    
    const change = (recent - earlier) / earlier;
    
    if (change > 0.2) return 'strengthening';
    if (change < -0.2) return 'weakening';
    return 'stable';
  }

  private calculateDurationTrend(sessions: any[]): 'strengthening' | 'weakening' | 'stable' {
    if (sessions.length < 6) return 'stable';
    
    const recent = sessions.slice(0, 5).map(s => s.duration);
    const earlier = sessions.slice(5, 10).map(s => s.duration);
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
    
    const change = (recentAvg - earlierAvg) / earlierAvg;
    
    if (change > 0.15) return 'strengthening';
    if (change < -0.15) return 'weakening';
    return 'stable';
  }

  private calculateMoodTrend(sessions: any[]): 'strengthening' | 'weakening' | 'stable' {
    if (sessions.length < 6) return 'stable';
    
    const recent = sessions.slice(0, 5).map(s => s.moodAfter - s.moodBefore);
    const earlier = sessions.slice(5, 10).map(s => s.moodAfter - s.moodBefore);
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
    
    const change = recentAvg - earlierAvg;
    
    if (change > 0.3) return 'strengthening';
    if (change < -0.3) return 'weakening';
    return 'stable';
  }

  private getWeekKey(date: Date): string {
    const year = date.getFullYear();
    const week = Math.ceil(((date.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7);
    return `${year}-W${week}`;
  }
}

export const habitAnalyticsService = HabitAnalyticsService.getInstance();