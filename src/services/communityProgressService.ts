import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  getAggregateFromServer,
  average,
  count
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { progressService } from './progressService';

export interface CommunityStats {
  totalUsers: number;
  totalSessions: number;
  avgSessionsPerUser: number;
  avgSessionDuration: number;
  popularTechniques: TechniquePopularity[];
  meditationTrends: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
  demographics: {
    experienceLevel: { [key: string]: number };
    preferredTime: { [key: string]: number };
    sessionLength: { [key: string]: number };
  };
}

export interface TechniquePopularity {
  technique: string;
  usage: number;
  avgRating: number;
  userCount: number;
}

export interface UserComparison {
  userId: string;
  metric: 'sessions' | 'duration' | 'consistency' | 'quality' | 'streak';
  userValue: number;
  communityAverage: number;
  percentile: number; // 0-100, where user ranks compared to others
  rank: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  comparison: 'above_average' | 'average' | 'below_average';
  anonymizedComparisons: {
    betterThan: number; // percentage of users
    similarTo: number; // percentage of users
    behindFrom: number; // percentage of users
  };
}

export interface CommunityInsight {
  type: 'trending_technique' | 'popular_time' | 'average_duration' | 'consistency_benchmark' | 'quality_standard';
  title: string;
  description: string;
  value: number | string;
  unit?: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  relevance: 'high' | 'medium' | 'low';
}

export interface AnonymizedPeerData {
  id: string; // Anonymous identifier
  metric: number;
  experience: 'beginner' | 'intermediate' | 'advanced';
  isUserData: boolean; // True for current user's data
}

export class CommunityProgressService {
  private static instance: CommunityProgressService;

  static getInstance(): CommunityProgressService {
    if (!CommunityProgressService.instance) {
      CommunityProgressService.instance = new CommunityProgressService();
    }
    return CommunityProgressService.instance;
  }

  async getCommunityStats(): Promise<CommunityStats> {
    try {
      // In a real implementation, this would aggregate anonymized data
      // For demo purposes, we'll return mock community data
      return {
        totalUsers: 15247,
        totalSessions: 89634,
        avgSessionsPerUser: 5.9,
        avgSessionDuration: 18.4,
        popularTechniques: [
          { technique: 'Mindfulness', usage: 34.2, avgRating: 4.3, userCount: 5214 },
          { technique: 'Breathing', usage: 28.7, avgRating: 4.5, userCount: 4373 },
          { technique: 'Body Scan', usage: 19.3, avgRating: 4.2, userCount: 2943 },
          { technique: 'Loving-kindness', usage: 12.1, avgRating: 4.4, userCount: 1845 },
          { technique: 'Walking Meditation', usage: 5.7, avgRating: 4.1, userCount: 869 }
        ],
        meditationTrends: {
          daily: [23, 45, 67, 89, 112, 98, 76, 54, 43, 38, 42, 48],
          weekly: [234, 267, 298, 312, 289, 276, 254, 243, 231, 245, 267, 289],
          monthly: [1205, 1298, 1432, 1567, 1234, 1123, 998, 876, 945, 1034, 1156, 1287]
        },
        demographics: {
          experienceLevel: {
            'beginner': 45.2,
            'intermediate': 32.8,
            'advanced': 18.6,
            'expert': 3.4
          },
          preferredTime: {
            'morning': 42.3,
            'afternoon': 18.7,
            'evening': 31.2,
            'night': 7.8
          },
          sessionLength: {
            '5-10 min': 38.4,
            '10-20 min': 41.7,
            '20-30 min': 15.3,
            '30+ min': 4.6
          }
        }
      };
    } catch (error) {
      console.error('Error fetching community stats:', error);
      throw error;
    }
  }

  async getUserComparison(userId: string, metric: UserComparison['metric']): Promise<UserComparison> {
    try {
      const sessions = await progressService.getMeditationSessions(userId, 100);
      const userValue = this.calculateUserMetric(sessions, metric);
      
      // In real implementation, this would query aggregated community data
      const communityData = await this.getCommunityMetricData(metric);
      const percentile = this.calculatePercentile(userValue, communityData);
      
      return {
        userId,
        metric,
        userValue,
        communityAverage: communityData.average,
        percentile,
        rank: this.determineRank(percentile),
        comparison: this.determineComparison(percentile),
        anonymizedComparisons: {
          betterThan: percentile,
          similarTo: Math.max(0, Math.min(20, 100 - Math.abs(percentile - 50) * 2)),
          behindFrom: 100 - percentile
        }
      };
    } catch (error) {
      console.error('Error getting user comparison:', error);
      throw error;
    }
  }

  async getCommunityInsights(): Promise<CommunityInsight[]> {
    try {
      // Mock insights based on community trends
      return [
        {
          type: 'trending_technique',
          title: 'Teknik Trending',
          description: 'Breathing meditation sedang populer di komunitas',
          value: 'Breathing',
          trend: 'increasing',
          relevance: 'high'
        },
        {
          type: 'popular_time',
          title: 'Waktu Favorit',
          description: 'Mayoritas komunitas bermeditasi di pagi hari',
          value: 'Pagi (06:00-10:00)',
          trend: 'stable',
          relevance: 'medium'
        },
        {
          type: 'average_duration',
          title: 'Durasi Rata-rata Komunitas',
          description: 'Rata-rata durasi sesi meditasi di komunitas',
          value: 18.4,
          unit: 'menit',
          trend: 'increasing',
          relevance: 'high'
        },
        {
          type: 'consistency_benchmark',
          title: 'Benchmark Konsistensi',
          description: 'Rata-rata komunitas bermeditasi 6 kali per minggu',
          value: 5.9,
          unit: 'sesi/minggu',
          trend: 'stable',
          relevance: 'high'
        },
        {
          type: 'quality_standard',
          title: 'Standar Kualitas',
          description: 'Rata-rata rating kualitas sesi di komunitas',
          value: 4.2,
          unit: '/5',
          trend: 'increasing',
          relevance: 'medium'
        }
      ];
    } catch (error) {
      console.error('Error fetching community insights:', error);
      return [];
    }
  }

  async getAnonymizedPeerData(userId: string, metric: UserComparison['metric'], sampleSize: number = 50): Promise<AnonymizedPeerData[]> {
    try {
      const userSessions = await progressService.getMeditationSessions(userId, 100);
      const userValue = this.calculateUserMetric(userSessions, metric);
      const userExperience = this.determineExperienceLevel(userSessions);

      // Generate anonymized peer data for demonstration
      // In real implementation, this would fetch anonymized aggregate data
      const peerData: AnonymizedPeerData[] = [];
      
      // Add user's own data (anonymized)
      peerData.push({
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        metric: userValue,
        experience: userExperience,
        isUserData: true
      });

      // Generate sample peer data around similar experience levels
      for (let i = 0; i < sampleSize - 1; i++) {
        const experience = this.randomExperienceLevel(userExperience);
        const baseValue = this.getBaseValueForExperience(metric, experience);
        const variation = baseValue * (0.3 + Math.random() * 0.4); // ±30-70% variation
        
        peerData.push({
          id: 'peer-' + Math.random().toString(36).substr(2, 9),
          metric: Math.round((baseValue + (Math.random() - 0.5) * variation) * 10) / 10,
          experience,
          isUserData: false
        });
      }

      return peerData.sort((a, b) => b.metric - a.metric);
    } catch (error) {
      console.error('Error fetching anonymized peer data:', error);
      return [];
    }
  }

  async generateProgressComparison(userId: string): Promise<{
    overallRanking: UserComparison;
    metricComparisons: UserComparison[];
    insights: string[];
    recommendations: string[];
  }> {
    try {
      const metrics: UserComparison['metric'][] = ['sessions', 'duration', 'consistency', 'quality', 'streak'];
      const comparisons = await Promise.all(
        metrics.map(metric => this.getUserComparison(userId, metric))
      );

      // Calculate overall ranking based on weighted average
      const weights = { sessions: 0.3, duration: 0.2, consistency: 0.3, quality: 0.15, streak: 0.05 };
      const weightedPercentile = comparisons.reduce((sum, comp) => 
        sum + comp.percentile * weights[comp.metric], 0
      );

      const overallRanking: UserComparison = {
        userId,
        metric: 'sessions', // This would be 'overall' in a real implementation
        userValue: weightedPercentile,
        communityAverage: 50,
        percentile: weightedPercentile,
        rank: this.determineRank(weightedPercentile),
        comparison: this.determineComparison(weightedPercentile),
        anonymizedComparisons: {
          betterThan: weightedPercentile,
          similarTo: Math.max(0, Math.min(20, 100 - Math.abs(weightedPercentile - 50) * 2)),
          behindFrom: 100 - weightedPercentile
        }
      };

      const insights = this.generateProgressInsights(comparisons);
      const recommendations = this.generateProgressRecommendations(comparisons);

      return {
        overallRanking,
        metricComparisons: comparisons,
        insights,
        recommendations
      };
    } catch (error) {
      console.error('Error generating progress comparison:', error);
      throw error;
    }
  }

  private calculateUserMetric(sessions: any[], metric: UserComparison['metric']): number {
    if (sessions.length === 0) return 0;

    switch (metric) {
      case 'sessions': {
        return sessions.length;
      }
      case 'duration': {
        return sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length;
      }
      case 'consistency': {
        const uniqueDays = new Set(sessions.map(s => 
          new Date(s.date).toDateString()
        )).size;
        return (uniqueDays / 30) * 100; // Consistency percentage over 30 days
      }
      case 'quality': {
        return sessions.reduce((sum, s) => sum + s.quality, 0) / sessions.length;
      }
      case 'streak': {
        return this.calculateCurrentStreak(sessions);
      }
      default: {
        return 0;
      }
    }
  }

  private async getCommunityMetricData(metric: UserComparison['metric']): Promise<{ average: number; distribution: number[] }> {
    // Mock community data - in real implementation, this would query aggregated data
    const mockData = {
      sessions: { average: 22.3, distribution: Array.from({length: 1000}, () => Math.random() * 50) },
      duration: { average: 18.4, distribution: Array.from({length: 1000}, () => 10 + Math.random() * 40) },
      consistency: { average: 65.7, distribution: Array.from({length: 1000}, () => Math.random() * 100) },
      quality: { average: 4.2, distribution: Array.from({length: 1000}, () => 3 + Math.random() * 2) },
      streak: { average: 8.9, distribution: Array.from({length: 1000}, () => Math.random() * 30) }
    };

    return mockData[metric];
  }

  private calculatePercentile(userValue: number, communityData: { average: number; distribution: number[] }): number {
    const sorted = [...communityData.distribution].sort((a, b) => a - b);
    const index = sorted.findIndex(value => value >= userValue);
    
    if (index === -1) return 100; // User is above all community values
    return Math.round((index / sorted.length) * 100);
  }

  private determineRank(percentile: number): UserComparison['rank'] {
    if (percentile >= 90) return 'expert';
    if (percentile >= 70) return 'advanced';
    if (percentile >= 40) return 'intermediate';
    return 'beginner';
  }

  private determineComparison(percentile: number): UserComparison['comparison'] {
    if (percentile >= 60) return 'above_average';
    if (percentile >= 40) return 'average';
    return 'below_average';
  }

  private determineExperienceLevel(sessions: any[]): 'beginner' | 'intermediate' | 'advanced' {
    const totalSessions = sessions.length;
    const avgDuration = sessions.length > 0 
      ? sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length 
      : 0;

    if (totalSessions >= 50 && avgDuration >= 20) return 'advanced';
    if (totalSessions >= 20 && avgDuration >= 15) return 'intermediate';
    return 'beginner';
  }

  private randomExperienceLevel(userExperience: string): 'beginner' | 'intermediate' | 'advanced' {
    // Generate similar experience levels with some variation
    const experiences: ('beginner' | 'intermediate' | 'advanced')[] = ['beginner', 'intermediate', 'advanced'];
    const currentIndex = experiences.indexOf(userExperience as any);
    
    // 60% same level, 30% adjacent levels, 10% other
    const rand = Math.random();
    if (rand < 0.6) return userExperience as any;
    if (rand < 0.9) {
      const adjacentIndex = Math.random() < 0.5 
        ? Math.max(0, currentIndex - 1)
        : Math.min(experiences.length - 1, currentIndex + 1);
      return experiences[adjacentIndex];
    }
    return experiences[Math.floor(Math.random() * experiences.length)];
  }

  private getBaseValueForExperience(metric: UserComparison['metric'], experience: string): number {
    const baseValues = {
      beginner: { sessions: 10, duration: 8, consistency: 30, quality: 3.2, streak: 3 },
      intermediate: { sessions: 25, duration: 15, consistency: 60, quality: 4.0, streak: 8 },
      advanced: { sessions: 45, duration: 25, consistency: 80, quality: 4.5, streak: 15 }
    };

    return baseValues[experience as keyof typeof baseValues][metric];
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

  private generateProgressInsights(comparisons: UserComparison[]): string[] {
    const insights: string[] = [];

    const strongMetrics = comparisons.filter(c => c.percentile >= 70);
    const weakMetrics = comparisons.filter(c => c.percentile < 40);

    if (strongMetrics.length > 0) {
      const best = strongMetrics.reduce((a, b) => a.percentile > b.percentile ? a : b);
      insights.push(`Anda unggul dalam ${this.getMetricLabel(best.metric)} (top ${100 - best.percentile}% komunitas)`);
    }

    if (weakMetrics.length > 0) {
      const weakest = weakMetrics.reduce((a, b) => a.percentile < b.percentile ? a : b);
      insights.push(`Area yang bisa ditingkatkan: ${this.getMetricLabel(weakest.metric)}`);
    }

    const averagePercentile = comparisons.reduce((sum, c) => sum + c.percentile, 0) / comparisons.length;
    if (averagePercentile >= 60) {
      insights.push('Secara keseluruhan, progress Anda di atas rata-rata komunitas');
    } else if (averagePercentile >= 40) {
      insights.push('Progress Anda sejajar dengan rata-rata komunitas');
    } else {
      insights.push('Ada ruang untuk improvement dibanding komunitas');
    }

    return insights;
  }

  private generateProgressRecommendations(comparisons: UserComparison[]): string[] {
    const recommendations: string[] = [];

    comparisons.forEach(comp => {
      if (comp.percentile < 30) {
        switch (comp.metric) {
          case 'sessions': {
            recommendations.push('Tingkatkan frekuensi meditasi - coba target minimal 4x per minggu');
            break;
          }
          case 'duration': {
            recommendations.push('Perpanjang durasi sesi secara bertahap - tambah 2-3 menit setiap minggu');
            break;
          }
          case 'consistency': {
            recommendations.push('Buat jadwal meditasi tetap - konsistensi adalah kunci utama');
            break;
          }
          case 'quality': {
            recommendations.push('Fokus pada kualitas sesi - cari teknik yang paling cocok untuk Anda');
            break;
          }
          case 'streak': {
            recommendations.push('Bangun habit harian - mulai dengan komitmen meditasi 5 menit setiap hari');
            break;
          }
        }
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('Progress Anda sangat baik! Terus pertahankan konsistensi dan eksplorasi teknik baru');
    }

    return recommendations.slice(0, 3); // Limit to top 3 recommendations
  }

  private getMetricLabel(metric: string): string {
    const labels = {
      sessions: 'jumlah sesi',
      duration: 'durasi meditasi',
      consistency: 'konsistensi',
      quality: 'kualitas sesi',
      streak: 'streak harian'
    };
    return labels[metric as keyof typeof labels] || metric;
  }

  async submitAnonymizedData(userId: string): Promise<void> {
    try {
      // In real implementation, this would anonymize and submit user data
      // to community aggregated statistics while preserving privacy
      
      const sessions = await progressService.getMeditationSessions(userId, 100);
      const anonymizedData = {
        totalSessions: sessions.length,
        avgDuration: sessions.length > 0 ? sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length : 0,
        techniques: sessions.flatMap(s => s.techniques),
        experienceLevel: this.determineExperienceLevel(sessions),
        timestamp: new Date()
      };

      // This would be submitted to an aggregated collection without user identification
      await addDoc(collection(db, 'community_anonymized_data'), {
        ...anonymizedData,
        timestamp: Timestamp.fromDate(anonymizedData.timestamp)
      });

      console.log('Anonymous data submitted to community stats');
    } catch (error) {
      console.error('Error submitting anonymized data:', error);
      // Don't throw error - this is optional background operation
    }
  }
}

export const communityProgressService = CommunityProgressService.getInstance();