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
import { notesService } from './notesService';

export interface EmotionalIntelligenceMetric {
  id: string;
  userId: string;
  date: Date;
  selfAwareness: number; // 1-10 scale
  selfRegulation: number; // 1-10 scale
  motivation: number; // 1-10 scale
  empathy: number; // 1-10 scale
  socialSkills: number; // 1-10 scale
  overallScore: number; // calculated average
  dataSource: 'meditation_session' | 'mood_tracking' | 'reflection' | 'self_assessment';
  contextData?: {
    sessionId?: string;
    moodBefore?: number;
    moodAfter?: number;
    stressLevel?: number;
    energyLevel?: number;
  };
}

export interface EIGrowthInsight {
  metric: keyof Omit<EmotionalIntelligenceMetric, 'id' | 'userId' | 'date' | 'overallScore' | 'dataSource' | 'contextData'>;
  currentScore: number;
  previousScore: number;
  change: number;
  trend: 'improving' | 'declining' | 'stable';
  recommendation: string;
  timeframe: 'week' | 'month' | 'quarter';
}

export interface EIDevelopmentGoal {
  id: string;
  userId: string;
  metric: keyof Omit<EmotionalIntelligenceMetric, 'id' | 'userId' | 'date' | 'overallScore' | 'dataSource' | 'contextData'>;
  targetScore: number;
  currentScore: number;
  deadline: Date;
  strategies: string[];
  progress: number; // 0-100%
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class EmotionalIntelligenceService {
  private static instance: EmotionalIntelligenceService;

  static getInstance(): EmotionalIntelligenceService {
    if (!EmotionalIntelligenceService.instance) {
      EmotionalIntelligenceService.instance = new EmotionalIntelligenceService();
    }
    return EmotionalIntelligenceService.instance;
  }

  async recordEIMetric(
    userId: string,
    metric: Omit<EmotionalIntelligenceMetric, 'id' | 'userId' | 'date' | 'overallScore'>
  ): Promise<string> {
    try {
      const overallScore = (
        metric.selfAwareness + 
        metric.selfRegulation + 
        metric.motivation + 
        metric.empathy + 
        metric.socialSkills
      ) / 5;

      const eiMetric: Omit<EmotionalIntelligenceMetric, 'id'> = {
        userId,
        date: new Date(),
        ...metric,
        overallScore: Math.round(overallScore * 10) / 10
      };

      const docRef = await addDoc(collection(db, 'ei_metrics'), {
        ...eiMetric,
        date: Timestamp.fromDate(eiMetric.date)
      });

      return docRef.id;
    } catch (error) {
      console.error('Error recording EI metric:', error);
      throw error;
    }
  }

  async analyzeSessionForEI(userId: string, sessionId: string): Promise<void> {
    try {
      // Get session data
      const sessions = await progressService.getMeditationSessions(userId, 1);
      const session = sessions.find(s => s.id === sessionId);
      if (!session) return;

      // Calculate EI metrics based on session data
      const moodImprovement = session.moodAfter && session.moodBefore ? 
        (session.moodAfter.happiness - session.moodBefore.happiness) : 0;
      const qualityScore = session.quality;
      const completionRate = session.duration / session.targetDuration;

      // Self-awareness: based on mood tracking accuracy and self-reflection
      const selfAwareness = Math.min(10, 
        5 + (session.moodBefore ? 2 : 0) + (session.moodAfter ? 2 : 0) + (qualityScore > 3 ? 1 : 0)
      );

      // Self-regulation: based on mood improvement and session completion
      const selfRegulation = Math.min(10, 
        5 + Math.max(0, moodImprovement) + (completionRate >= 0.8 ? 2 : 0) + (qualityScore >= 4 ? 1 : 0)
      );

      // Motivation: based on session consistency and quality
      const motivation = Math.min(10, 
        3 + qualityScore + (completionRate >= 1 ? 2 : 0)
      );

      // Empathy and social skills: harder to measure from individual sessions
      // Use baseline values that improve with loving-kindness practices
      const hasLovingKindness = session.techniques.some(t => 
        t.toLowerCase().includes('loving') || t.toLowerCase().includes('compassion')
      );
      const empathy = hasLovingKindness ? 7 : 6;
      const socialSkills = hasLovingKindness ? 6 : 5;

      await this.recordEIMetric(userId, {
        selfAwareness,
        selfRegulation,
        motivation,
        empathy,
        socialSkills,
        dataSource: 'meditation_session',
        contextData: {
          sessionId,
          moodBefore: session.moodBefore?.happiness,
          moodAfter: session.moodAfter?.happiness,
          stressLevel: session.moodBefore?.stress,
          energyLevel: session.moodBefore?.energy
        }
      });
    } catch (error) {
      console.error('Error analyzing session for EI:', error);
    }
  }

  async getUserEIMetrics(
    userId: string, 
    timeframe: 'week' | 'month' | 'quarter' | 'year' = 'month',
    limitCount: number = 100
  ): Promise<EmotionalIntelligenceMetric[]> {
    try {
      const startDate = this.getStartDate(timeframe);
      
      const q = query(
        collection(db, 'ei_metrics'),
        where('userId', '==', userId),
        where('date', '>=', Timestamp.fromDate(startDate)),
        orderBy('date', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
      })) as EmotionalIntelligenceMetric[];
    } catch (error) {
      console.error('Error fetching EI metrics:', error);
      return [];
    }
  }

  async getEIGrowthInsights(
    userId: string,
    timeframe: 'week' | 'month' | 'quarter' = 'month'
  ): Promise<EIGrowthInsight[]> {
    try {
      const currentMetrics = await this.getUserEIMetrics(userId, timeframe);
      const previousMetrics = await this.getPreviousMetrics(userId, timeframe);

      if (currentMetrics.length === 0) return [];

      const currentAvg = this.calculateAverageScores(currentMetrics);
      const previousAvg = this.calculateAverageScores(previousMetrics);

      const insights: EIGrowthInsight[] = [];
      const metricNames: (keyof typeof currentAvg)[] = [
        'selfAwareness', 'selfRegulation', 'motivation', 'empathy', 'socialSkills'
      ];

      for (const metric of metricNames) {
        const currentScore = currentAvg[metric];
        const previousScore = previousAvg[metric] || currentScore;
        const change = currentScore - previousScore;
        
        let trend: EIGrowthInsight['trend'] = 'stable';
        if (change > 0.3) trend = 'improving';
        else if (change < -0.3) trend = 'declining';

        const recommendation = this.getRecommendation(metric, currentScore, trend);

        insights.push({
          metric,
          currentScore: Math.round(currentScore * 10) / 10,
          previousScore: Math.round(previousScore * 10) / 10,
          change: Math.round(change * 10) / 10,
          trend,
          recommendation,
          timeframe
        });
      }

      return insights.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
    } catch (error) {
      console.error('Error getting EI growth insights:', error);
      return [];
    }
  }

  private calculateAverageScores(metrics: EmotionalIntelligenceMetric[]) {
    if (metrics.length === 0) {
      return {
        selfAwareness: 5,
        selfRegulation: 5,
        motivation: 5,
        empathy: 5,
        socialSkills: 5
      };
    }

    const totals = metrics.reduce(
      (acc, metric) => ({
        selfAwareness: acc.selfAwareness + metric.selfAwareness,
        selfRegulation: acc.selfRegulation + metric.selfRegulation,
        motivation: acc.motivation + metric.motivation,
        empathy: acc.empathy + metric.empathy,
        socialSkills: acc.socialSkills + metric.socialSkills
      }),
      { selfAwareness: 0, selfRegulation: 0, motivation: 0, empathy: 0, socialSkills: 0 }
    );

    return {
      selfAwareness: totals.selfAwareness / metrics.length,
      selfRegulation: totals.selfRegulation / metrics.length,
      motivation: totals.motivation / metrics.length,
      empathy: totals.empathy / metrics.length,
      socialSkills: totals.socialSkills / metrics.length
    };
  }

  private async getPreviousMetrics(userId: string, timeframe: string): Promise<EmotionalIntelligenceMetric[]> {
    try {
      const currentStart = this.getStartDate(timeframe);
      const previousStart = this.getPreviousStartDate(timeframe, currentStart);
      
      const q = query(
        collection(db, 'ei_metrics'),
        where('userId', '==', userId),
        where('date', '>=', Timestamp.fromDate(previousStart)),
        where('date', '<', Timestamp.fromDate(currentStart)),
        orderBy('date', 'desc'),
        limit(100)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
      })) as EmotionalIntelligenceMetric[];
    } catch (error) {
      console.error('Error fetching previous EI metrics:', error);
      return [];
    }
  }

  private getStartDate(timeframe: string): Date {
    const now = new Date();
    const start = new Date(now);

    switch (timeframe) {
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
    }

    return start;
  }

  private getPreviousStartDate(timeframe: string, currentStart: Date): Date {
    const previous = new Date(currentStart);

    switch (timeframe) {
      case 'week':
        previous.setDate(previous.getDate() - 7);
        break;
      case 'month':
        previous.setMonth(previous.getMonth() - 1);
        break;
      case 'quarter':
        previous.setMonth(previous.getMonth() - 3);
        break;
      case 'year':
        previous.setFullYear(previous.getFullYear() - 1);
        break;
    }

    return previous;
  }

  private getRecommendation(
    metric: string, 
    currentScore: number, 
    trend: EIGrowthInsight['trend']
  ): string {
    const recommendations: { [key: string]: { [key in EIGrowthInsight['trend']]: string[] } } = {
      selfAwareness: {
        improving: [
          'Terus latihan mindfulness untuk memperdalam kesadaran diri',
          'Coba teknik body scan untuk meningkatkan awareness',
          'Pertahankan konsistensi mood tracking'
        ],
        declining: [
          'Perbanyak sesi meditasi mindfulness',
          'Mulai jurnal refleksi harian',
          'Fokus pada present moment awareness'
        ],
        stable: [
          'Tingkatkan variasi teknik meditasi',
          'Coba sesi meditasi yang lebih panjang',
          'Tambahkan refleksi mendalam setelah meditasi'
        ]
      },
      selfRegulation: {
        improving: [
          'Eksplor teknik pernapasan yang lebih advanced',
          'Praktikkan response flexibility dalam situasi sulit',
          'Gunakan meditasi sebagai anchor saat emosi intens'
        ],
        declining: [
          'Fokus pada breathing techniques untuk regulasi emosi',
          'Perbanyak sesi body scan untuk relaksasi',
          'Gunakan loving-kindness untuk self-compassion'
        ],
        stable: [
          'Coba 4-7-8 breathing untuk kontrol emosi',
          'Integrasikan mindful breaks di aktivitas harian',
          'Praktikkan STOP technique (Stop, Take a breath, Observe, Proceed)'
        ]
      },
      motivation: {
        improving: [
          'Set goals yang lebih menantang dalam praktik',
          'Eksplor aspek filosofis dari meditasi',
          'Bagikan progress dengan komunitas'
        ],
        declining: [
          'Kembali ke tujuan awal bermeditasi',
          'Variasikan teknik untuk mencegah kebosanan',
          'Bergabung dengan grup meditasi untuk motivasi'
        ],
        stable: [
          'Set mini-goals harian yang achievable',
          'Coba guided meditations dengan tema inspiratif',
          'Baca tentang manfaat meditasi untuk motivasi'
        ]
      },
      empathy: {
        improving: [
          'Dalami loving-kindness meditation',
          'Praktikkan compassion untuk diri dan orang lain',
          'Coba tonglen (giving and receiving) meditation'
        ],
        declining: [
          'Mulai dengan loving-kindness untuk diri sendiri',
          'Praktikkan forgiveness meditation',
          'Fokus pada interconnectedness semua makhluk'
        ],
        stable: [
          'Variasikan objek loving-kindness (keluarga, teman, stranger)',
          'Coba metta meditation dengan visualisasi',
          'Praktikkan gratitude untuk orang-orang di hidup Anda'
        ]
      },
      socialSkills: {
        improving: [
          'Terapkan mindfulness dalam interaksi sosial',
          'Praktikkan active listening',
          'Gunakan compassion dalam komunikasi'
        ],
        declining: [
          'Mulai dengan mindful communication exercises',
          'Fokus pada present moment saat berbicara dengan orang',
          'Praktikkan patience dan understanding'
        ],
        stable: [
          'Coba group meditation untuk interaksi sosial',
          'Praktikkan non-judgmental awareness terhadap orang lain',
          'Gunakan breathing space sebelum merespond dalam percakapan'
        ]
      }
    };

    const metricRecs = recommendations[metric];
    if (!metricRecs) return 'Terus konsisten dalam praktik meditasi Anda';

    const trendRecs = metricRecs[trend];
    if (!trendRecs || trendRecs.length === 0) return 'Terus konsisten dalam praktik meditasi Anda';

    // Return a random recommendation from the appropriate category
    return trendRecs[Math.floor(Math.random() * trendRecs.length)];
  }

  async createDevelopmentGoal(
    userId: string,
    goal: Omit<EIDevelopmentGoal, 'id' | 'userId' | 'progress' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      const goalData: Omit<EIDevelopmentGoal, 'id'> = {
        userId,
        ...goal,
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'ei_goals'), {
        ...goalData,
        deadline: Timestamp.fromDate(goalData.deadline),
        createdAt: Timestamp.fromDate(goalData.createdAt),
        updatedAt: Timestamp.fromDate(goalData.updatedAt)
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating EI development goal:', error);
      throw error;
    }
  }

  async getUserDevelopmentGoals(userId: string): Promise<EIDevelopmentGoal[]> {
    try {
      const q = query(
        collection(db, 'ei_goals'),
        where('userId', '==', userId),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        deadline: doc.data().deadline.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as EIDevelopmentGoal[];
    } catch (error) {
      console.error('Error fetching EI development goals:', error);
      return [];
    }
  }

  async updateGoalProgress(goalId: string, newCurrentScore: number): Promise<void> {
    try {
      const goals = await this.getUserDevelopmentGoals(''); // This would need the userId in practice
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const progress = Math.min(100, Math.max(0, 
        ((newCurrentScore - goal.currentScore) / (goal.targetScore - goal.currentScore)) * 100
      ));

      const docRef = doc(db, 'ei_goals', goalId);
      await updateDoc(docRef, {
        currentScore: newCurrentScore,
        progress,
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error updating goal progress:', error);
      throw error;
    }
  }

  getEIMetricLabels(): { [key: string]: string } {
    return {
      selfAwareness: 'Kesadaran Diri',
      selfRegulation: 'Regulasi Diri',
      motivation: 'Motivasi',
      empathy: 'Empati',
      socialSkills: 'Keterampilan Sosial'
    };
  }

  getEIMetricDescriptions(): { [key: string]: string } {
    return {
      selfAwareness: 'Kemampuan mengenali dan memahami emosi, kekuatan, dan kelemahan diri',
      selfRegulation: 'Kemampuan mengelola emosi dan reaksi dalam berbagai situasi',
      motivation: 'Dorongan internal untuk mencapai tujuan dan berkembang',
      empathy: 'Kemampuan memahami dan merasakan emosi orang lain',
      socialSkills: 'Kemampuan berinteraksi dan berkomunikasi efektif dengan orang lain'
    };
  }
}

export const emotionalIntelligenceService = EmotionalIntelligenceService.getInstance();