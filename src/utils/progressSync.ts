import type { UserProfile } from '../types/auth';

/**
 * Utility untuk memastikan progress user sinkron dan konsisten di seluruh aplikasi
 */

export interface SyncedProgress {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  averageSessionLength: number;
  completedToday: boolean;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  completionRate: number;
  totalDays: number;
  mindfulnessScore: number;
}

/**
 * Mendapatkan progress yang sinkron dari user profile
 * Memastikan semua nilai dimulai dari 0 untuk user baru
 */
export function getSyncedProgress(userProfile: UserProfile | null | undefined): SyncedProgress {
  // Fallback ke 0 untuk semua nilai jika tidak ada data
  const totalSessions = userProfile?.progress?.totalSessions 
    ?? userProfile?.completedSessions?.length 
    ?? 0;
    
  const totalMinutes = userProfile?.progress?.totalMinutes 
    ?? userProfile?.totalMeditationMinutes 
    ?? 0;
    
  const currentStreak = userProfile?.progress?.streak 
    ?? userProfile?.currentStreak 
    ?? 0;
    
  const longestStreak = userProfile?.progress?.longestStreak 
    ?? Math.max(currentStreak, 0);
    
  const averageSessionLength = totalSessions > 0 
    ? Math.round(totalMinutes / totalSessions) 
    : 0;
    
  const completedToday = userProfile?.progress?.todayCompleted 
    ?? false;
    
  const level = totalSessions === 0 ? 'Beginner' : 
               totalSessions < 10 ? 'Beginner' : 
               totalSessions < 50 ? 'Intermediate' : 
               'Advanced';
               
  const completionRate = totalSessions > 0 
    ? Math.min(Math.round((totalSessions / (totalSessions + Math.max(1, Math.floor(totalSessions * 0.1)))) * 100), 100) 
    : 0;
    
  const totalDays = userProfile?.progress?.totalDays 
    ?? (Math.max(Math.ceil(totalSessions / 1.5), currentStreak) || 0);
    
  const mindfulnessScore = totalSessions === 0 
    ? 0 
    : Math.min(Math.round((totalSessions * 0.15 + currentStreak * 0.1 + 5) * 10) / 10, 10);

  return {
    totalSessions,
    totalMinutes,
    currentStreak,
    longestStreak,
    averageSessionLength,
    completedToday,
    level,
    completionRate,
    totalDays,
    mindfulnessScore
  };
}

/**
 * Membuat default progress untuk user baru
 */
export function createDefaultProgress(): SyncedProgress {
  return {
    totalSessions: 0,
    totalMinutes: 0,
    currentStreak: 0,
    longestStreak: 0,
    averageSessionLength: 0,
    completedToday: false,
    level: 'Beginner',
    completionRate: 0,
    totalDays: 0,
    mindfulnessScore: 0
  };
}

/**
 * Memperbarui progress setelah session selesai
 */
export function updateProgressAfterSession(
  currentProgress: SyncedProgress, 
  sessionMinutes: number
): SyncedProgress {
  const newTotalSessions = currentProgress.totalSessions + 1;
  const newTotalMinutes = currentProgress.totalMinutes + sessionMinutes;
  
  // Update streak logic - simplified for now
  const newCurrentStreak = currentProgress.completedToday 
    ? currentProgress.currentStreak 
    : currentProgress.currentStreak + 1;
    
  const newLongestStreak = Math.max(currentProgress.longestStreak, newCurrentStreak);
  
  return {
    ...currentProgress,
    totalSessions: newTotalSessions,
    totalMinutes: newTotalMinutes,
    currentStreak: newCurrentStreak,
    longestStreak: newLongestStreak,
    averageSessionLength: Math.round(newTotalMinutes / newTotalSessions),
    completedToday: true,
    level: newTotalSessions === 0 ? 'Beginner' : 
           newTotalSessions < 10 ? 'Beginner' : 
           newTotalSessions < 50 ? 'Intermediate' : 'Advanced',
    completionRate: Math.min(Math.round((newTotalSessions / (newTotalSessions + Math.max(1, Math.floor(newTotalSessions * 0.1)))) * 100), 100),
    totalDays: Math.max(Math.ceil(newTotalSessions / 1.5), newCurrentStreak),
    mindfulnessScore: Math.min(Math.round((newTotalSessions * 0.15 + newCurrentStreak * 0.1 + 5) * 10) / 10, 10)
  };
}

/**
 * Memvalidasi dan membersihkan data progress yang tidak valid
 */
export function validateProgress(progress: Partial<SyncedProgress>): SyncedProgress {
  return {
    totalSessions: Math.max(0, Math.floor(progress.totalSessions || 0)),
    totalMinutes: Math.max(0, Math.floor(progress.totalMinutes || 0)),
    currentStreak: Math.max(0, Math.floor(progress.currentStreak || 0)),
    longestStreak: Math.max(0, Math.floor(progress.longestStreak || 0)),
    averageSessionLength: Math.max(0, Math.floor(progress.averageSessionLength || 0)),
    completedToday: Boolean(progress.completedToday),
    level: progress.level || 'Beginner',
    completionRate: Math.max(0, Math.min(100, Math.floor(progress.completionRate || 0))),
    totalDays: Math.max(0, Math.floor(progress.totalDays || 0)),
    mindfulnessScore: Math.max(0, Math.min(10, Number(progress.mindfulnessScore || 0)))
  };
}