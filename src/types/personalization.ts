export interface UserPreferences {
  id: string;
  userId: string;
  favoriteSessionTypes: string[];
  preferredDurations: number[];
  preferredTimes: string[];
  favoriteVoices: string[];
  preferredLanguage: 'id' | 'en';
  backgroundSounds: string[];
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  goals: string[];
  interests: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  motivationFactors: string[];
  lastUpdated: Date;
}

export interface ContentRecommendation {
  id: string;
  userId: string;
  contentId: string;
  contentType: 'session' | 'course' | 'article' | 'technique';
  title: string;
  description: string;
  reason: string;
  confidence: number; // 0-100
  priority: 'low' | 'medium' | 'high';
  category: string;
  estimatedDuration?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  tags: string[];
  createdAt: Date;
  expiresAt?: Date;
  viewed: boolean;
  interacted: boolean;
}

export interface UserBookmark {
  id: string;
  userId: string;
  contentId: string;
  contentType: 'session' | 'course' | 'article' | 'technique' | 'quote';
  title: string;
  description?: string;
  thumbnailUrl?: string;
  tags: string[];
  notes?: string;
  createdAt: Date;
  lastAccessedAt?: Date;
  isFavorite: boolean;
  category: string;
}

export interface CustomMeditationSession {
  id: string;
  userId: string;
  title: string;
  description: string;
  duration: number; // in seconds
  techniques: string[];
  backgroundMusic?: string;
  voiceGuidance?: string;
  structure: MeditationSegment[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  tags: string[];
  isPublic: boolean;
  likesCount: number;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MeditationSegment {
  id: string;
  type: 'breathing' | 'body_scan' | 'mindfulness' | 'loving_kindness' | 'visualization' | 'silence';
  duration: number; // in seconds
  instructions: string;
  voiceNote?: string;
  order: number;
}

export interface PersonalNote {
  id: string;
  userId: string;
  relatedContentId?: string;
  relatedContentType?: 'session' | 'course' | 'general';
  title: string;
  content: string;
  mood?: number; // 1-5
  tags: string[];
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reflection {
  id: string;
  userId: string;
  sessionId?: string;
  title: string;
  content: string;
  insights: string[];
  gratitude: string[];
  challenges: string[];
  improvements: string[];
  moodBefore?: number;
  moodAfter?: number;
  energy?: number;
  clarity?: number;
  createdAt: Date;
}

export interface Achievement {
  id: string;
  userId: string;
  achievementType: 'streak' | 'milestone' | 'skill' | 'consistency' | 'exploration' | 'mastery';
  title: string;
  description: string;
  iconUrl?: string;
  badgeColor: string;
  unlockedAt: Date;
  requirements: AchievementRequirement[];
  rewards: PersonalizedReward[];
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category: string;
  points: number;
}

export interface AchievementRequirement {
  type: 'sessions_count' | 'streak_days' | 'course_completion' | 'mood_tracking' | 'consistency_score';
  value: number;
  description: string;
}

export interface PersonalizedReward {
  id: string;
  type: 'content_unlock' | 'feature_access' | 'badge' | 'discount' | 'certificate';
  title: string;
  description: string;
  value?: string;
  validUntil?: Date;
  claimed: boolean;
  claimedAt?: Date;
}

export interface UsagePattern {
  id: string;
  userId: string;
  sessionType: string;
  duration: number;
  timeOfDay: string;
  dayOfWeek: string;
  completionRate: number;
  satisfactionRating?: number;
  frequency: number;
  createdAt: Date;
}

export interface PersonalizedContent {
  recommendations: ContentRecommendation[];
  bookmarks: UserBookmark[];
  customSessions: CustomMeditationSession[];
  notes: PersonalNote[];
  reflections: Reflection[];
  achievements: Achievement[];
  preferences: UserPreferences;
}

export interface EIGrowthMetric {
  dimension: 'self_awareness' | 'self_regulation' | 'motivation' | 'empathy' | 'social_skills';
  score: number; // 0-100
  previousScore?: number;
  trend: 'improving' | 'stable' | 'declining';
  lastAssessment: Date;
  assessmentCount: number;
}

export interface EIGrowthTracking {
  id: string;
  userId: string;
  overallScore: number;
  metrics: EIGrowthMetric[];
  strengths: string[];
  developmentAreas: string[];
  recommendations: string[];
  assessmentHistory: EIAssessment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EIAssessment {
  id: string;
  date: Date;
  overallScore: number;
  dimensionScores: { [dimension: string]: number };
  notes?: string;
  contextualFactors?: string[];
}

export interface HabitFormationAnalytics {
  id: string;
  userId: string;
  habitType: 'meditation' | 'mood_tracking' | 'reflection' | 'course_study';
  formationStage: 'initiation' | 'learning' | 'stabilization' | 'maintenance';
  currentStreak: number;
  consistency: number; // 0-100
  automaticity: number; // 0-100
  contextualCues: string[];
  barriers: string[];
  triggers: string[];
  suggestions: HabitSuggestion[];
  createdAt: Date;
  updatedAt: Date;
}

export interface HabitSuggestion {
  type: 'environmental' | 'temporal' | 'social' | 'reward' | 'reminder';
  title: string;
  description: string;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  estimatedImpact: number; // 0-100
}

export interface ProgressReport {
  id: string;
  userId: string;
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: Date;
  endDate: Date;
  
  // Key Metrics
  totalSessions: number;
  totalMinutes: number;
  averageSessionLength: number;
  consistencyScore: number;
  moodImprovement: number;
  stressReduction: number;
  
  // Achievements
  newAchievements: Achievement[];
  milestonesReached: string[];
  
  // Insights
  topTechniques: string[];
  bestTimes: string[];
  improvementAreas: string[];
  personalInsights: string[];
  
  // Comparisons
  vsLastPeriod: {
    sessionsChange: number;
    minutesChange: number;
    consistencyChange: number;
    moodChange: number;
  };
  
  // Goals
  goalsAchieved: string[];
  goalsInProgress: string[];
  suggestedGoals: string[];
  
  generatedAt: Date;
}

export interface GoalTracking {
  id: string;
  userId: string;
  goalType: 'consistency' | 'duration' | 'skill' | 'wellbeing' | 'custom';
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: 'sessions' | 'minutes' | 'days' | 'courses' | 'score';
  targetDate: Date;
  isActive: boolean;
  isAchieved: boolean;
  achievedAt?: Date;
  priority: 'low' | 'medium' | 'high';
  category: string;
  milestones: GoalMilestone[];
  adjustmentHistory: GoalAdjustment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GoalMilestone {
  id: string;
  title: string;
  targetValue: number;
  isAchieved: boolean;
  achievedAt?: Date;
  reward?: string;
}

export interface GoalAdjustment {
  date: Date;
  reason: string;
  oldTargetValue: number;
  newTargetValue: number;
  oldTargetDate: Date;
  newTargetDate: Date;
}

export interface CommunityComparison {
  id: string;
  userId: string;
  metric: 'sessions' | 'minutes' | 'consistency' | 'streak' | 'courses';
  userValue: number;
  communityAverage: number;
  percentile: number; // 0-100
  cohortSize: number;
  comparison: 'below_average' | 'average' | 'above_average' | 'top_10' | 'top_5' | 'top_1';
  anonymizedRanking?: number;
  insights: string[];
  period: 'week' | 'month' | 'quarter' | 'year';
  generatedAt: Date;
}