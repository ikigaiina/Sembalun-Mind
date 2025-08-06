import { typedSupabase as supabase } from '../config/supabase';
import { progressService } from './progressService';
import { emotionalIntelligenceService } from './emotionalIntelligenceService';
import { habitAnalyticsService } from './habitAnalyticsService';

export interface ProgressReport {
  id: string;
  userId: string;
  reportType: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  period: {
    start: Date;
    end: Date;
    label: string; // e.g., "Week 32, 2024" or "January 2024"
  };
  metrics: {
    sessions: {
      total: number;
      totalDuration: number;
      avgDuration: number;
      completionRate: number;
      qualityScore: number;
    };
    consistency: {
      meditationDays: number;
      streakLength: number;
      targetAchievement: number; // percentage
      frequencyScore: number;
    };
    wellbeing: {
      avgMoodBefore: number;
      avgMoodAfter: number;
      moodImprovement: number;
      stressReduction: number;
      energyImprovement: number;
    };
    progress: {
      cairnsCompleted: number;
      milestonesReached: number;
      achievementsUnlocked: number;
      skillsImproved: string[];
    };
  };
  insights: {
    highlights: string[];
    improvements: string[];
    challenges: string[];
    recommendations: string[];
  };
  comparisons: {
    previousPeriod: {
      sessionsChange: number;
      durationChange: number;
      consistencyChange: number;
      moodChange: number;
    };
    personal: {
      bestWeek?: Date;
      personalRecord?: string;
      growthAreas: string[];
    };
  };
  goals: {
    achieved: number;
    inProgress: number;
    upcoming: string[];
  };
  createdAt: Date;
}

export interface ReportSummary {
  reportType: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  totalReports: number;
  latestReport?: ProgressReport;
  trends: {
    sessionsPerPeriod: number[];
    consistencyPerPeriod: number[];
    moodImprovementPerPeriod: number[];
  };
}

export class ProgressReportsService {
  private static instance: ProgressReportsService;

  static getInstance(): ProgressReportsService {
    if (!ProgressReportsService.instance) {
      ProgressReportsService.instance = new ProgressReportsService();
    }
    return ProgressReportsService.instance;
  }

  async generateProgressReport(
    userId: string, 
    reportType: 'weekly' | 'monthly' | 'quarterly' | 'yearly',
    customPeriod?: { start: Date; end: Date }
  ): Promise<ProgressReport> {
    try {
      const period = customPeriod || this.getCurrentPeriod(reportType);
      const periodLabel = this.formatPeriodLabel(period, reportType);

      // Get all sessions in the period
      const sessions = await progressService.getMeditationSessions(userId, 1000);
      const periodSessions = sessions.filter(session => {
        const sessionDate = session.completedAt;
        return sessionDate >= period.start && sessionDate <= period.end;
      });

      // Get mood entries
      const moodEntries = await progressService.getMoodEntries(userId, 100);
      const periodMoodEntries = moodEntries.filter(entry => {
        const entryDate = entry.timestamp;
        return entryDate >= period.start && entryDate <= period.end;
      });

      // Calculate metrics
      const metrics = await this.calculateMetrics(periodSessions, periodMoodEntries);
      
      // Generate insights
      const insights = await this.generateInsights(userId, periodSessions, metrics, reportType);
      
      // Calculate comparisons
      const comparisons = await this.calculateComparisons(userId, period, reportType, metrics);
      
      // Get goals data
      const goals = await this.calculateGoalsProgress(userId, period);

      const report: Omit<ProgressReport, 'id'> = {
        userId,
        reportType,
        period: {
          ...period,
          label: periodLabel
        },
        metrics,
        insights,
        comparisons,
        goals,
        createdAt: new Date()
      };

      // Save report to database
      const { data, error } = await supabase.from('progress_reports').insert({
        user_id: report.userId,
        report_type: report.reportType,
        period_start: report.period.start.toISOString(),
        period_end: report.period.end.toISOString(),
        period_label: report.period.label,
        metrics: report.metrics,
        insights: report.insights,
        comparisons: report.comparisons,
        goals: report.goals,
        created_at: report.createdAt.toISOString()
      }).select();

      if (error) throw error;
      if (!data) throw new Error('Failed to create report');
      const docRef = data[0];

      return { id: docRef.id, ...report };
    } catch (error) {
      console.error('Error generating progress report:', error);
      throw error;
    }
  }

  private async calculateMetrics(sessions: any[], moodEntries: any[]) {
    const totalSessions = sessions.length;
    const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
    const avgDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;
    
    const completedSessions = sessions.filter(s => s.duration >= s.targetDuration * 0.8);
    const completionRate = totalSessions > 0 ? completedSessions.length / totalSessions : 0;
    
    const qualityScore = sessions.length > 0 
      ? sessions.reduce((sum, s) => sum + s.quality, 0) / sessions.length 
      : 0;

    // Consistency metrics
    const uniqueDays = new Set(sessions.map(s => 
      new Date(s.date).toDateString()
    )).size;
    
    const streakLength = this.calculateCurrentStreak(sessions);
    const targetDays = this.getTargetDaysForPeriod(sessions.length > 0 ? sessions[0].date : new Date());
    const targetAchievement = targetDays > 0 ? (uniqueDays / targetDays) * 100 : 0;
    const frequencyScore = Math.min(100, (totalSessions / targetDays) * 100);

    // Wellbeing metrics
    const sessionsWithMood = sessions.filter(s => s.moodBefore && s.moodAfter);
    const avgMoodBefore = sessionsWithMood.length > 0 
      ? sessionsWithMood.reduce((sum, s) => sum + s.moodBefore, 0) / sessionsWithMood.length 
      : 0;
    const avgMoodAfter = sessionsWithMood.length > 0 
      ? sessionsWithMood.reduce((sum, s) => sum + s.moodAfter, 0) / sessionsWithMood.length 
      : 0;
    const moodImprovement = avgMoodAfter - avgMoodBefore;

    const avgStressBefore = sessions.filter(s => s.stressLevel)
      .reduce((sum, s, _, arr) => sum + s.stressLevel / arr.length, 0);
    const avgEnergyAfter = sessions.filter(s => s.energyLevel)
      .reduce((sum, s, _, arr) => sum + s.energyLevel / arr.length, 0);

    return {
      sessions: {
        total: totalSessions,
        totalDuration: Math.round(totalDuration),
        avgDuration: Math.round(avgDuration * 10) / 10,
        completionRate: Math.round(completionRate * 100),
        qualityScore: Math.round(qualityScore * 10) / 10
      },
      consistency: {
        meditationDays: uniqueDays,
        streakLength,
        targetAchievement: Math.round(targetAchievement),
        frequencyScore: Math.round(frequencyScore)
      },
      wellbeing: {
        avgMoodBefore: Math.round(avgMoodBefore * 10) / 10,
        avgMoodAfter: Math.round(avgMoodAfter * 10) / 10,
        moodImprovement: Math.round(moodImprovement * 10) / 10,
        stressReduction: Math.round((5 - avgStressBefore) * 10) / 10,
        energyImprovement: Math.round((avgEnergyAfter - 3) * 10) / 10
      },
      progress: {
        cairnsCompleted: 0, // Would need cairn service integration
        milestonesReached: 0, // Would need milestone tracking
        achievementsUnlocked: 0, // Would need achievement service integration
        skillsImproved: this.identifyImprovedSkills(sessions)
      }
    };
  }

  private async generateInsights(
    userId: string, 
    sessions: any[], 
    metrics: any, 
    reportType: string
  ) {
    const highlights: string[] = [];
    const improvements: string[] = [];
    const challenges: string[] = [];
    const recommendations: string[] = [];

    // Highlights
    if (metrics.sessions.total > 0) {
      highlights.push(`Menyelesaikan ${metrics.sessions.total} sesi meditasi`);
    }
    if (metrics.consistency.streakLength > 7) {
      highlights.push(`Streak ${metrics.consistency.streakLength} hari yang luar biasa!`);
    }
    if (metrics.wellbeing.moodImprovement > 1) {
      highlights.push(`Peningkatan mood yang signifikan (+${metrics.wellbeing.moodImprovement})`);
    }
    if (metrics.sessions.completionRate > 80) {
      highlights.push(`Tingkat penyelesaian sesi yang tinggi (${metrics.sessions.completionRate}%)`);
    }

    // Improvements
    if (metrics.sessions.qualityScore > 4) {
      improvements.push('Kualitas sesi meditasi semakin membaik');
    }
    if (metrics.consistency.frequencyScore > 70) {
      improvements.push('Konsistensi meditasi yang semakin terjaga');
    }
    if (metrics.wellbeing.stressReduction > 1) {
      improvements.push('Kemampuan mengelola stress yang meningkat');
    }

    // Challenges
    if (metrics.consistency.targetAchievement < 50) {
      challenges.push('Konsistensi harian masih perlu ditingkatkan');
    }
    if (metrics.sessions.avgDuration < 10) {
      challenges.push('Durasi sesi yang masih pendek');
    }
    if (metrics.wellbeing.moodImprovement < 0.5) {
      challenges.push('Manfaat mood dari meditasi belum optimal');
    }

    // Recommendations
    if (metrics.consistency.targetAchievement < 70) {
      recommendations.push('Set alarm harian untuk reminder meditasi');
      recommendations.push('Mulai dengan target sesi yang lebih pendek tapi konsisten');
    }
    if (metrics.sessions.avgDuration < 15) {
      recommendations.push('Coba perpanjang sesi secara bertahap (tambah 2-3 menit per minggu)');
    }
    if (metrics.sessions.qualityScore < 3) {
      recommendations.push('Eksplor teknik meditasi yang berbeda untuk menemukan yang cocok');
      recommendations.push('Cari lingkungan yang lebih tenang untuk meditasi');
    }

    return {
      highlights: highlights.slice(0, 4),
      improvements: improvements.slice(0, 3),
      challenges: challenges.slice(0, 3),
      recommendations: recommendations.slice(0, 4)
    };
  }

  private async calculateComparisons(
    userId: string, 
    currentPeriod: { start: Date; end: Date }, 
    reportType: string, 
    currentMetrics: any
  ) {
    const previousPeriod = this.getPreviousPeriod(currentPeriod, reportType);
    
    // Get previous period sessions
    const allSessions = await progressService.getMeditationSessions(userId, 1000);
    const previousSessions = allSessions.filter(session => {
      const sessionDate = session.completedAt;
      return sessionDate >= previousPeriod.start && sessionDate <= previousPeriod.end;
    });

    const previousMetrics = await this.calculateMetrics(previousSessions, []);

    const sessionsChange = currentMetrics.sessions.total - previousMetrics.sessions.total;
    const durationChange = currentMetrics.sessions.avgDuration - previousMetrics.sessions.avgDuration;
    const consistencyChange = currentMetrics.consistency.frequencyScore - previousMetrics.consistency.frequencyScore;
    const moodChange = currentMetrics.wellbeing.moodImprovement - previousMetrics.wellbeing.moodImprovement;

    // Personal records and growth areas
    const growthAreas = [];
    if (sessionsChange > 0) growthAreas.push('Frekuensi meditasi');
    if (durationChange > 0) growthAreas.push('Durasi sesi');
    if (consistencyChange > 0) growthAreas.push('Konsistensi');
    if (moodChange > 0) growthAreas.push('Wellbeing');

    return {
      previousPeriod: {
        sessionsChange,
        durationChange: Math.round(durationChange * 10) / 10,
        consistencyChange: Math.round(consistencyChange),
        moodChange: Math.round(moodChange * 10) / 10
      },
      personal: {
        bestWeek: this.findBestWeek(allSessions),
        personalRecord: this.getPersonalRecord(allSessions),
        growthAreas
      }
    };
  }

  private async calculateGoalsProgress(userId: string, period: { start: Date; end: Date }) {
    // This would integrate with a goals service when available
    return {
      achieved: 0,
      inProgress: 0,
      upcoming: [
        'Meditasi konsisten 7 hari berturut-turut',
        'Mencoba 3 teknik meditasi berbeda',
        'Sesi meditasi 20 menit tanpa interupsi'
      ]
    };
  }

  async getUserReports(
    userId: string, 
    reportType?: 'weekly' | 'monthly' | 'quarterly' | 'yearly',
    limitCount: number = 10
  ): Promise<ProgressReport[]> {
    try {
      let queryBuilder = supabase
        .from('progress_reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limitCount);

      if (reportType) {
        queryBuilder = queryBuilder.eq('report_type', reportType);
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;

      return data.map(row => ({
        id: row.id,
        userId: row.user_id,
        reportType: row.report_type,
        period: {
          start: new Date(row.period_start),
          end: new Date(row.period_end),
          label: row.period_label
        },
        metrics: row.metrics,
        insights: row.insights,
        comparisons: row.comparisons,
        goals: row.goals,
        createdAt: new Date(row.created_at)
      })) as ProgressReport[];
    } catch (error) {
      console.error('Error fetching user reports:', error);
      return [];
    }
  }

  async getReportSummary(userId: string, reportType: 'weekly' | 'monthly' | 'quarterly' | 'yearly'): Promise<ReportSummary> {
    try {
      const reports = await this.getUserReports(userId, reportType, 12);
      
      const sessionsPerPeriod = reports.map(r => r.metrics.sessions.total).reverse();
      const consistencyPerPeriod = reports.map(r => r.metrics.consistency.frequencyScore).reverse();
      const moodImprovementPerPeriod = reports.map(r => r.metrics.wellbeing.moodImprovement).reverse();

      return {
        reportType,
        totalReports: reports.length,
        latestReport: reports[0] || undefined,
        trends: {
          sessionsPerPeriod,
          consistencyPerPeriod,
          moodImprovementPerPeriod
        }
      };
    } catch (error) {
      console.error('Error getting report summary:', error);
      throw error;
    }
  }

  private getCurrentPeriod(reportType: string): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);

    switch (reportType) {
      case 'weekly': {
        // Start of current week (Monday)
        const dayOfWeek = start.getDay() || 7; // Sunday = 7
        start.setDate(start.getDate() - dayOfWeek + 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      }
      case 'monthly': {
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(end.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        break;
      }
      case 'quarterly': {
        const quarter = Math.floor(start.getMonth() / 3);
        start.setMonth(quarter * 3, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(quarter * 3 + 3, 0);
        end.setHours(23, 59, 59, 999);
        break;
      }
      case 'yearly': {
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(11, 31);
        end.setHours(23, 59, 59, 999);
        break;
      }
    }

    return { start, end };
  }

  private getPreviousPeriod(currentPeriod: { start: Date; end: Date }, reportType: string): { start: Date; end: Date } {
    const start = new Date(currentPeriod.start);
    const end = new Date(currentPeriod.end);

    switch (reportType) {
      case 'weekly': {
        start.setDate(start.getDate() - 7);
        end.setDate(end.getDate() - 7);
        break;
      }
      case 'monthly': {
        start.setMonth(start.getMonth() - 1);
        end.setMonth(end.getMonth() - 1);
        break;
      }
      case 'quarterly': {
        start.setMonth(start.getMonth() - 3);
        end.setMonth(end.getMonth() - 3);
        break;
      }
      case 'yearly': {
        start.setFullYear(start.getFullYear() - 1);
        end.setFullYear(end.getFullYear() - 1);
        break;
      }
    }

    return { start, end };
  }

  private formatPeriodLabel(period: { start: Date; end: Date }, reportType: string): string {
    const start = period.start;
    const end = period.end;

    switch (reportType) {
      case 'weekly':
        return `Minggu ${Math.ceil(start.getDate() / 7)}, ${start.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;
      case 'monthly':
        return start.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      case 'quarterly': {
        const quarter = Math.floor(start.getMonth() / 3) + 1;
        return `Q${quarter} ${start.getFullYear()}`;
      }
      case 'yearly':
        return start.getFullYear().toString();
      default:
        return `${start.toLocaleDateString('id-ID')} - ${end.toLocaleDateString('id-ID')}`;
    }
  }

  private calculateCurrentStreak(sessions: any[]): number {
    if (sessions.length === 0) return 0;

    const sortedSessions = sessions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(s => new Date(s.date));

    let streak = 0;
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const sessionDate of sortedSessions) {
      const sessionDay = new Date(sessionDate);
      sessionDay.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((currentDate.getTime() - sessionDay.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === streak) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (daysDiff > streak) {
        break;
      }
    }

    return streak;
  }

  private getTargetDaysForPeriod(periodStart: Date): number {
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
    return Math.min(daysDiff + 1, 7); // Assuming weekly target
  }

  private identifyImprovedSkills(sessions: any[]): string[] {
    const skills = [];
    
    if (sessions.some(s => s.techniques.includes('mindfulness'))) {
      skills.push('Mindfulness');
    }
    if (sessions.some(s => s.techniques.includes('breathing'))) {
      skills.push('Pernapasan');
    }
    if (sessions.some(s => s.techniques.includes('body scan'))) {
      skills.push('Body Awareness');
    }
    if (sessions.some(s => s.techniques.includes('loving-kindness'))) {
      skills.push('Compassion');
    }

    return skills;
  }

  private findBestWeek(sessions: any[]): Date | undefined {
    if (sessions.length === 0) return undefined;

    const weeklyData: { [week: string]: number } = {};
    
    sessions.forEach(session => {
      const sessionDate = session.completedAt;
      const weekStart = new Date(sessionDate);
      weekStart.setDate(sessionDate.getDate() - sessionDate.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      weeklyData[weekKey] = (weeklyData[weekKey] || 0) + 1;
    });

    const bestWeekKey = Object.entries(weeklyData)
      .sort(([,a], [,b]) => b - a)[0]?.[0];

    return bestWeekKey ? new Date(bestWeekKey) : undefined;
  }

  private getPersonalRecord(sessions: any[]): string {
    if (sessions.length === 0) return 'Belum ada record';

    const longestSession = Math.max(...sessions.map(s => s.duration));
    const highestQuality = Math.max(...sessions.map(s => s.quality));
    
    if (longestSession >= 60) {
      return `Sesi terpanjang: ${longestSession} menit`;
    } else if (highestQuality >= 4.5) {
      return `Kualitas tertinggi: ${highestQuality}/5`;
    } else {
      return `Total ${sessions.length} sesi diselesaikan`;
    }
  }
}

export const progressReportsService = ProgressReportsService.getInstance();