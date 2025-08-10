import type { UserProfile } from '../types/auth';
import type { SyncedProgress } from './progressSync';

/**
 * Advanced Progress Scaling System
 * Sistem yang dapat menyesuaikan skala progress berdasarkan penggunaan dan pertumbuhan user
 */

export interface ScalingConfig {
  // Base multipliers
  sessionMultiplier: number;
  timeMultiplier: number;
  streakMultiplier: number;
  
  // Achievement thresholds (dapat disesuaikan berdasarkan data user)
  beginnerThreshold: number;
  intermediateThreshold: number;
  advancedThreshold: number;
  
  // Dynamic scaling factors
  userGrowthFactor: number;
  engagementBonus: number;
  consistencyReward: number;
}

export interface ScaledProgress extends SyncedProgress {
  scalingLevel: number;
  nextMilestone: {
    type: 'sessions' | 'minutes' | 'streak';
    current: number;
    target: number;
    progress: number;
  };
  recommendations: string[];
  adaptiveGoals: {
    dailyMinutes: number;
    weeklyGoal: number;
    monthlyChallenge: string;
  };
}

/**
 * Configuration default yang dapat disesuaikan
 */
const DEFAULT_SCALING_CONFIG: ScalingConfig = {
  sessionMultiplier: 1.0,
  timeMultiplier: 1.0,
  streakMultiplier: 1.2,
  beginnerThreshold: 10,
  intermediateThreshold: 50,
  advancedThreshold: 200,
  userGrowthFactor: 1.1,
  engagementBonus: 1.15,
  consistencyReward: 1.25
};

/**
 * Menghitung scaling level berdasarkan total aktivitas user
 */
export function calculateScalingLevel(progress: SyncedProgress): number {
  const totalActivity = (
    progress.totalSessions * 2 +
    progress.totalMinutes * 0.1 +
    progress.currentStreak * 3 +
    progress.longestStreak * 1.5
  );
  
  // Logarithmic scaling untuk smooth progression
  return Math.floor(Math.log(Math.max(totalActivity, 1)) / Math.log(2));
}

/**
 * Menentukan next milestone berdasarkan progress saat ini
 */
export function getNextMilestone(progress: SyncedProgress, config: ScalingConfig) {
  const { totalSessions, totalMinutes, currentStreak } = progress;
  
  // Prioritize berdasarkan yang paling dekat dengan milestone
  const milestones = [
    {
      type: 'sessions' as const,
      current: totalSessions,
      target: getNextSessionMilestone(totalSessions, config),
      weight: 1
    },
    {
      type: 'minutes' as const,
      current: totalMinutes,
      target: getNextMinuteMilestone(totalMinutes, config),
      weight: 1
    },
    {
      type: 'streak' as const,
      current: currentStreak,
      target: getNextStreakMilestone(currentStreak, config),
      weight: 1.5 // Streak lebih prioritas
    }
  ];
  
  // Pilih milestone dengan progress tertinggi
  const bestMilestone = milestones.reduce((best, current) => {
    const currentProgress = current.current / current.target;
    const bestProgress = best.current / best.target;
    
    return (currentProgress * current.weight) > (bestProgress * best.weight) 
      ? current 
      : best;
  });
  
  return {
    ...bestMilestone,
    progress: Math.min(Math.round((bestMilestone.current / bestMilestone.target) * 100), 100)
  };
}

/**
 * Mendapatkan milestone session berikutnya
 */
function getNextSessionMilestone(current: number, config: ScalingConfig): number {
  if (current < config.beginnerThreshold) return config.beginnerThreshold;
  if (current < config.intermediateThreshold) return config.intermediateThreshold;
  if (current < config.advancedThreshold) return config.advancedThreshold;
  
  // Dynamic scaling untuk advanced users
  return Math.ceil(current * config.userGrowthFactor / 50) * 50;
}

/**
 * Mendapatkan milestone menit berikutnya
 */
function getNextMinuteMilestone(current: number): number {
  const standardMilestones = [30, 60, 120, 300, 600, 1200, 2400];
  
  for (const milestone of standardMilestones) {
    if (current < milestone) return milestone;
  }
  
  // Dynamic scaling untuk very advanced users
  return Math.ceil(current * 1.5 / 100) * 100;
}

/**
 * Mendapatkan milestone streak berikutnya
 */
function getNextStreakMilestone(current: number): number {
  const streakMilestones = [3, 7, 14, 30, 60, 100, 365];
  
  for (const milestone of streakMilestones) {
    if (current < milestone) return milestone;
  }
  
  return Math.ceil(current * 1.2 / 50) * 50;
}

/**
 * Generate adaptive recommendations berdasarkan progress
 */
export function generateRecommendations(progress: SyncedProgress, scalingLevel: number): string[] {
  const recommendations: string[] = [];
  const { totalSessions, totalMinutes, currentStreak, level } = progress;
  
  // Recommendations berdasarkan level
  if (level === 'Beginner') {
    recommendations.push('Mulai dengan sesi 5-10 menit setiap hari');
    if (currentStreak < 3) {
      recommendations.push('Fokus membangun konsistensi dengan target 3 hari berturut-turut');
    }
  } else if (level === 'Intermediate') {
    recommendations.push('Coba variasi teknik meditasi yang berbeda');
    if (totalMinutes > 0) {
      const avgSession = totalMinutes / totalSessions;
      if (avgSession < 15) {
        recommendations.push('Tingkatkan durasi sesi ke 15-20 menit');
      }
    }
  } else {
    recommendations.push('Eksplorasi teknik advanced seperti mindfulness mendalam');
    if (currentStreak >= 30) {
      recommendations.push('Pertimbangkan untuk menjadi mentor bagi praktisi pemula');
    }
  }
  
  // Recommendations berdasarkan scaling level
  if (scalingLevel >= 5) {
    recommendations.push('Akses fitur analytics mendalam tersedia');
  }
  
  if (scalingLevel >= 8) {
    recommendations.push('Bergabung dengan komunitas advanced practitioners');
  }
  
  return recommendations.slice(0, 3); // Limit to top 3
}

/**
 * Generate adaptive goals berdasarkan progress dan scaling
 */
export function generateAdaptiveGoals(progress: SyncedProgress, config: ScalingConfig) {
  const { totalSessions, totalMinutes, currentStreak, averageSessionLength } = progress;
  
  // Calculate adaptive daily target
  let dailyMinutes = 10; // baseline
  
  if (totalSessions > 0) {
    const recentAvg = Math.max(averageSessionLength, 5);
    dailyMinutes = Math.min(recentAvg * config.engagementBonus, 30);
  }
  
  // Adjust based on streak
  if (currentStreak >= 7) {
    dailyMinutes *= config.consistencyReward;
  }
  
  // Weekly goal calculation
  const weeklyGoal = Math.round(dailyMinutes * 7);
  
  // Monthly challenge based on level
  let monthlyChallenge = 'Praktik 15 hari dalam sebulan';
  
  if (progress.level === 'Intermediate') {
    monthlyChallenge = 'Capai 20 hari praktik dengan minimal 15 menit per sesi';
  } else if (progress.level === 'Advanced') {
    monthlyChallenge = 'Eksplorasi 3 teknik meditasi berbeda dengan 25 hari praktik';
  }
  
  return {
    dailyMinutes: Math.round(dailyMinutes),
    weeklyGoal,
    monthlyChallenge
  };
}

/**
 * Main function untuk mendapatkan scaled progress
 */
export function getScaledProgress(
  progress: SyncedProgress, 
  config: ScalingConfig = DEFAULT_SCALING_CONFIG
): ScaledProgress {
  const scalingLevel = calculateScalingLevel(progress);
  const nextMilestone = getNextMilestone(progress, config);
  const recommendations = generateRecommendations(progress, scalingLevel);
  const adaptiveGoals = generateAdaptiveGoals(progress, config);
  
  return {
    ...progress,
    scalingLevel,
    nextMilestone,
    recommendations,
    adaptiveGoals
  };
}

/**
 * Update scaling configuration berdasarkan metrics user base
 */
export function updateScalingConfig(
  currentConfig: ScalingConfig,
  userMetrics: {
    totalUsers: number;
    averageSessionsPerUser: number;
    retentionRate: number;
    engagementScore: number;
  }
): ScalingConfig {
  const { totalUsers, averageSessionsPerUser, retentionRate, engagementScore } = userMetrics;
  
  // Adjust thresholds berdasarkan user behavior
  const adjustedConfig = { ...currentConfig };
  
  if (averageSessionsPerUser > currentConfig.beginnerThreshold) {
    adjustedConfig.beginnerThreshold = Math.round(averageSessionsPerUser * 0.5);
  }
  
  if (retentionRate > 0.7) {
    adjustedConfig.consistencyReward *= 1.1;
  }
  
  if (engagementScore > 0.8) {
    adjustedConfig.engagementBonus *= 1.05;
  }
  
  // Scale difficulty based on user base size
  if (totalUsers > 10000) {
    adjustedConfig.userGrowthFactor *= 1.02;
  }
  
  return adjustedConfig;
}

/**
 * Predict future milestones berdasarkan current rate
 */
export function predictFutureMilestones(
  progress: SyncedProgress,
  daysToPredict: number = 30
): Array<{
  date: Date;
  predictedSessions: number;
  predictedMinutes: number;
  predictedStreak: number;
  likelihood: number;
}> {
  const predictions = [];
  const currentRate = progress.totalSessions / Math.max(progress.totalDays, 1);
  const averageMinutesPerDay = progress.totalMinutes / Math.max(progress.totalDays, 1);
  
  for (let day = 1; day <= daysToPredict; day += 7) { // Weekly predictions
    const date = new Date();
    date.setDate(date.getDate() + day);
    
    const predictedSessions = Math.round(progress.totalSessions + (currentRate * day));
    const predictedMinutes = Math.round(progress.totalMinutes + (averageMinutesPerDay * day));
    const predictedStreak = Math.min(progress.currentStreak + day, day); // Conservative streak prediction
    
    // Likelihood berdasarkan consistency
    const consistency = progress.currentStreak / Math.max(progress.totalDays, 1);
    const likelihood = Math.min(consistency * 100, 95); // Max 95% likelihood
    
    predictions.push({
      date,
      predictedSessions,
      predictedMinutes,
      predictedStreak,
      likelihood: Math.round(likelihood)
    });
  }
  
  return predictions;
}