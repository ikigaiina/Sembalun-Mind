export interface MeditationSession {
  id: string;
  userId: string;
  sessionType: 'breathing' | 'guided' | 'siy_module' | 'free_meditation' | 'body_scan';
  title: string;
  duration: number; // in seconds
  targetDuration: number; // planned duration
  completedAt: Date;
  startedAt: Date;
  endedAt: Date;
  quality: 1 | 2 | 3 | 4 | 5; // user-rated session quality
  notes?: string;
  moodBefore?: MoodEntry;
  moodAfter?: MoodEntry;
  techniques: string[];
  interruptions: number;
  environment: 'quiet' | 'noisy' | 'nature' | 'indoor' | 'outdoor';
  device: 'mobile' | 'tablet' | 'desktop';
  syncStatus: 'synced' | 'pending' | 'conflict';
  lastModified: Date;
  version: number;
}

export interface MoodEntry {
  id: string;
  userId: string;
  timestamp: Date;
  energy: 1 | 2 | 3 | 4 | 5; // very low to very high
  stress: 1 | 2 | 3 | 4 | 5; // very low to very high
  focus: 1 | 2 | 3 | 4 | 5; // very scattered to very focused
  happiness: 1 | 2 | 3 | 4 | 5; // very sad to very happy
  anxiety: 1 | 2 | 3 | 4 | 5; // very calm to very anxious
  gratitude: 1 | 2 | 3 | 4 | 5; // very ungrateful to very grateful
  notes?: string;
  tags: string[];
  sessionId?: string; // linked to meditation session if applicable
  syncStatus: 'synced' | 'pending' | 'conflict';
  lastModified: Date;
  version: number;
}

export interface CairnProgress {
  id: string;
  userId: string;
  cairnType: 'daily' | 'weekly' | 'monthly' | 'milestone' | 'achievement';
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: 'sessions' | 'minutes' | 'days' | 'courses' | 'streaks';
  startDate: Date;
  endDate?: Date;
  completedAt?: Date;
  isCompleted: boolean;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: 'consistency' | 'duration' | 'variety' | 'mindfulness' | 'progress';
  rewards: CairnReward[];
  milestones: CairnMilestone[];
  syncStatus: 'synced' | 'pending' | 'conflict';
  lastModified: Date;
  version: number;
}

export interface CairnMilestone {
  id: string;
  title: string;
  description: string;
  threshold: number;
  reward?: CairnReward;
  completedAt?: Date;
  isCompleted: boolean;
}

export interface CairnReward {
  id: string;
  type: 'badge' | 'certificate' | 'content_unlock' | 'feature_unlock';
  title: string;
  description: string;
  iconUrl?: string;
  value?: string; // for content/feature unlocks
  earnedAt?: Date;
}

export interface CourseProgress {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  moduleId?: string;
  moduleTitle?: string;
  lessonId?: string;
  lessonTitle?: string;
  progress: number; // 0-100 percentage
  isCompleted: boolean;
  completedAt?: Date;
  startedAt: Date;
  lastAccessedAt: Date;
  timeSpent: number; // in seconds
  completedLessons: string[];
  certificates: Certificate[];
  notes?: string;
  syncStatus: 'synced' | 'pending' | 'conflict';
  lastModified: Date;
  version: number;
}

export interface Certificate {
  id: string;
  courseId: string;
  userId: string;
  title: string;
  description: string;
  issuedAt: Date;
  certificateUrl?: string;
  verificationCode: string;
  skills: string[];
  completionTime: number; // total time spent in seconds
}

export interface UserStreak {
  id: string;
  userId: string;
  type: 'meditation' | 'mood_tracking' | 'course_study' | 'mindfulness';
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
  startDate: Date;
  isActive: boolean;
  streakSnapshots: StreakSnapshot[];
  motivationLevel: 1 | 2 | 3 | 4 | 5;
  nextMilestone: number;
  syncStatus: 'synced' | 'pending' | 'conflict';
  lastModified: Date;
  version: number;
}

export interface StreakSnapshot {
  date: Date;
  streakCount: number;
  activities: string[];
  mood?: number;
}

export interface UserInsights {
  id: string;
  userId: string;
  generatedAt: Date;
  period: 'week' | 'month' | 'quarter' | 'year';
  totalSessions: number;
  totalMinutes: number;
  averageSessionLength: number;
  consistencyScore: number; // 0-100
  improvementAreas: string[];
  strengths: string[];
  moodTrends: MoodTrend[];
  preferredTechniques: TechniqueStats[];
  bestTimes: TimeStats[];
  recommendations: InsightRecommendation[];
  achievements: Achievement[];
  syncStatus: 'synced' | 'pending' | 'conflict';
  lastModified: Date;
  version: number;
}

export interface MoodTrend {
  metric: 'energy' | 'stress' | 'focus' | 'happiness' | 'anxiety' | 'gratitude';
  trend: 'improving' | 'declining' | 'stable';
  changePercentage: number;
  averageValue: number;
  dataPoints: { date: Date; value: number }[];
}

export interface TechniqueStats {
  technique: string;
  sessionsCount: number;
  totalMinutes: number;
  averageQuality: number;
  preferenceScore: number;
}

export interface TimeStats {
  hour: number;
  sessionsCount: number;
  averageQuality: number;
  completionRate: number;
}

export interface InsightRecommendation {
  id: string;
  type: 'technique' | 'schedule' | 'duration' | 'consistency' | 'content';
  title: string;
  description: string;
  actionItems: string[];
  confidence: number; // 0-100
  priority: 'low' | 'medium' | 'high';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconUrl?: string;
  earnedAt: Date;
  category: 'consistency' | 'milestone' | 'special' | 'mastery';
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
}

export interface DataSyncMetadata {
  id: string;
  userId: string;
  dataType: 'session' | 'mood' | 'cairn' | 'course' | 'streak' | 'insights';
  entityId: string;
  lastSyncedAt: Date;
  deviceId: string;
  conflictResolution?: 'manual' | 'auto_latest' | 'auto_merge';
  syncVersion: number;
  checksumHash: string;
}

export interface OfflineDataQueue {
  id: string;
  userId: string;
  action: 'create' | 'update' | 'delete';
  dataType: 'session' | 'mood' | 'cairn' | 'course' | 'streak';
  entityId: string;
  data: Record<string, unknown>;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface UserProgressSummary {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  completedCourses: number;
  earnedCertificates: number;
  activeCairns: number;
  completedCairns: number;
  lastSessionDate?: Date;
  consistencyScore: number;
  moodTrendScore: number;
  overallProgress: number;
}