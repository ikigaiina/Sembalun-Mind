import type { UserProfile } from '../types/auth';

/**
 * Utility to verify that a user profile has fresh/zero progress
 * Useful for testing and development purposes
 */
export const hasZeroProgress = (userProfile: UserProfile): boolean => {
  const progress = userProfile.progress;
  
  // Check main progress object
  const mainProgressIsZero = (
    progress.totalSessions === 0 &&
    progress.totalMinutes === 0 &&
    progress.streak === 0 &&
    progress.longestStreak === 0 &&
    progress.achievements.length === 0 &&
    progress.lastSessionDate === null &&
    progress.favoriteCategories.length === 0 &&
    progress.completedPrograms.length === 0
  );
  
  // Check optional progress fields
  const optionalProgressIsZero = (
    (userProfile.totalMeditationMinutes ?? 0) === 0 &&
    (userProfile.completedSessions ?? []).length === 0 &&
    (userProfile.completedCourses ?? []).length === 0 &&
    (userProfile.currentStreak ?? 0) === 0
  );
  
  return mainProgressIsZero && optionalProgressIsZero;
};

/**
 * Get a summary of progress values for debugging
 */
export const getProgressSummary = (userProfile: UserProfile): Record<string, unknown> => {
  return {
    // Main progress
    totalSessions: userProfile.progress.totalSessions,
    totalMinutes: userProfile.progress.totalMinutes,
    streak: userProfile.progress.streak,
    longestStreak: userProfile.progress.longestStreak,
    achievementsCount: userProfile.progress.achievements.length,
    lastSessionDate: userProfile.progress.lastSessionDate,
    favoriteCategoriesCount: userProfile.progress.favoriteCategories.length,
    completedProgramsCount: userProfile.progress.completedPrograms.length,
    
    // Optional progress fields
    totalMeditationMinutes: userProfile.totalMeditationMinutes ?? 0,
    completedSessionsCount: (userProfile.completedSessions ?? []).length,
    completedCoursesCount: (userProfile.completedCourses ?? []).length,
    currentStreak: userProfile.currentStreak ?? 0,
  };
};

/**
 * Log progress summary for debugging (only in development)
 */
export const debugProgressStatus = (userProfile: UserProfile, label = 'User Progress'): void => {
  if (import.meta.env.DEV) {
    const isZero = hasZeroProgress(userProfile);
    const summary = getProgressSummary(userProfile);
    
    console.group(`🔍 ${label}`);
    console.log(`Fresh progress: ${isZero ? '✅ Yes' : '❌ No'}`);
    console.log('Progress values:', summary);
    console.groupEnd();
  }
};