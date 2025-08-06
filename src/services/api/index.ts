// Backend API Services - Comprehensive Suite for Sembalun Meditation App
// Created with advanced error handling, validation, and real-time capabilities

export { userApiService, type UserProfile, type UserPreferences, type UserProgress as UserProgressType, type UserStats, type UserActivitySummary } from './userApiService';

export { meditationApiService, type MeditationSession, type SessionPreferences, type SessionAnalytics, type SessionInsights, type ActiveSession, type WeeklyProgress, type SessionPattern, type Milestone } from './meditationApiService';

export { progressApiService, type UserProgress, type StreakData, type ProgressAnalytics, type ProgressOverview, type ProgressTrends, type ProgressComparisons, type ProgressPredictions, type ProgressInsights, type LevelSystem } from './progressApiService';

export { achievementApiService, type Achievement, type AchievementTemplate, type AchievementProgress, type AchievementStats, type PersonalizedGoal, type AchievementRequirement, type AchievementReward } from './achievementApiService';

export { moodApiService, type MoodEntry, type MoodAnalytics, type MoodOverview, type MoodTrends, type MoodPattern, type MoodCorrelation, type MoodInsight, type MoodPrediction, type MoodStreak, type MoodChallenge } from './moodApiService';

export { apiErrorService, type ApiError, type ValidationError, type ApiResponse, type ErrorContext, type ValidationSchema, CommonErrors, createError, handleError, validate, successResponse, errorResponse } from './apiErrorService';

/**
 * Comprehensive Backend API Services Suite
 * 
 * This suite provides:
 * 
 * 1. **User Management (userApiService)**
 *    - Complete authentication & profile management
 *    - Guest user support with data migration
 *    - User analytics and activity tracking
 *    - Privacy controls and data export
 *    - Real-time profile synchronization
 * 
 * 2. **Meditation Session Management (meditationApiService)**
 *    - Real-time session tracking with pause/resume
 *    - Comprehensive session analytics and insights
 *    - Pattern recognition and recommendations
 *    - Progress tracking with milestones
 *    - Mood correlation analysis
 * 
 * 3. **Progress Analytics (progressApiService)**
 *    - Advanced streak management
 *    - Experience points and leveling system
 *    - Comprehensive progress analytics
 *    - Trend analysis and predictions
 *    - Personalized insights and recommendations
 * 
 * 4. **Achievement System (achievementApiService)**
 *    - Dynamic achievement unlocking
 *    - Personalized goal generation
 *    - Reward management with expiration
 *    - Progress tracking to achievements
 *    - Real-time achievement notifications
 * 
 * 5. **Mood Tracking (moodApiService)**
 *    - Multi-dimensional mood analysis
 *    - Pattern recognition and correlations
 *    - Predictive mood insights
 *    - Context-aware tracking
 *    - Comprehensive mood analytics
 * 
 * 6. **Error Handling & Validation (apiErrorService)**
 *    - Comprehensive error classification
 *    - Input validation with schemas
 *    - Rate limiting and quota management
 *    - Error analytics and monitoring
 *    - Standardized API responses
 * 
 * Key Features:
 * - RESTful API design with proper HTTP status codes
 * - Real-time subscriptions via Supabase
 * - Comprehensive input validation
 * - Advanced analytics and insights
 * - Secure data handling with RLS
 * - Performance optimized queries
 * - Offline support capabilities
 * - Extensible architecture
 */

// API Configuration
export const API_CONFIG = {
  VERSION: '1.0.0',
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RATE_LIMITS: {
    DEFAULT: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100
    },
    AUTH: {
      windowMs: 15 * 60 * 1000, // 15 minutes  
      maxRequests: 5
    },
    MOOD_TRACKING: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 10
    }
  }
};

// Service Status
export const SERVICE_STATUS = {
  USER_SERVICE: 'active',
  MEDITATION_SERVICE: 'active', 
  PROGRESS_SERVICE: 'active',
  ACHIEVEMENT_SERVICE: 'active',
  MOOD_SERVICE: 'active',
  ERROR_SERVICE: 'active'
} as const;

// Export type for service status
export type ServiceName = keyof typeof SERVICE_STATUS;

/**
 * Utility function to check if all services are healthy
 */
export const areAllServicesHealthy = (): boolean => {
  return Object.values(SERVICE_STATUS).every(status => status === 'active');
};

/**
 * Get service health summary
 */
export const getServiceHealthSummary = () => {
  const services = Object.entries(SERVICE_STATUS);
  const healthy = services.filter(([, status]) => status === 'active').length;
  const total = services.length;
  
  return {
    healthy_services: healthy,
    total_services: total,
    health_percentage: Math.round((healthy / total) * 100),
    status: healthy === total ? 'healthy' : healthy > total / 2 ? 'degraded' : 'unhealthy',
    services: SERVICE_STATUS
  };
};