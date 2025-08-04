export interface AudioFile {
  id: string;
  title: string;
  url: string;
  duration: number; // in seconds
  fileSize: number;
  format: 'mp3' | 'wav' | 'ogg';
  isDownloaded?: boolean;
  lastAccessed?: Date;
}

export interface MeditationSession {
  id: string;
  title: string;
  description: string;
  category: SessionCategory;
  subcategory?: string;
  duration: number; // in minutes
  difficulty: Difficulty;
  instructor?: string;
  audioFile?: AudioFile;
  guidedScript?: GuidedScript;
  tags: string[];
  thumbnailUrl?: string;
  backgroundColor?: string;
  isNew?: boolean;
  isPremium?: boolean;
  completionCount: number;
  averageRating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GuidedScript {
  id: string;
  sessionId: string;
  content: string;
  segments: ScriptSegment[];
  language: 'id' | 'en';
  isTextToSpeechReady: boolean;
  voiceSettings?: VoiceSettings;
}

export interface ScriptSegment {
  id: string;
  timestamp: number; // seconds from start
  text: string;
  type: 'instruction' | 'pause' | 'breathing' | 'visualization';
  duration?: number;
}

export interface VoiceSettings {
  voice: string;
  speed: number;
  pitch: number;
  volume: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  category: SessionCategory;
  difficulty: Difficulty;
  instructor: string;
  sessions: string[]; // session IDs
  estimatedDuration: number; // total minutes
  thumbnailUrl?: string;
  backgroundImageUrl?: string;
  tags: string[];
  objectives: string[];
  prerequisites?: string[];
  isPremium: boolean;
  completionRate: number;
  enrollmentCount: number;
  averageRating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AmbientSound {
  id: string;
  name: string;
  description: string;
  icon: string;
  audioFile: AudioFile;
  category: 'nature' | 'urban' | 'instrumental' | 'binaural';
  tags: string[];
  isPremium: boolean;
}

export interface UserProgress {
  userId: string;
  sessionId: string;
  courseId?: string;
  completedAt?: Date;
  totalTime: number; // seconds spent
  completionPercentage: number;
  streak: number;
  favorited: boolean;
  rating?: number;
  notes?: string;
  lastAccessedAt: Date;
}

export interface ContentLibrary {
  sessions: MeditationSession[];
  courses: Course[];
  ambientSounds: AmbientSound[];
  categories: CategoryConfig[];
}

export interface CategoryConfig {
  id: SessionCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  subcategories?: string[];
}

export type SessionCategory = 
  | 'jeda-pagi'           // Morning Break
  | 'napas-hiruk'         // Breath in Chaos  
  | 'pulang-diri'         // Return to Self
  | 'tidur-dalam'         // Deep Sleep
  | 'fokus-kerja'         // Work Focus
  | 'relaksasi'           // Relaxation
  | 'kecemasan'           // Anxiety
  | 'emosi'               // Emotions
  | 'spiritual'           // Spiritual
  | 'siy-attention'       // Search Inside Yourself - Attention Training
  | 'siy-awareness'       // Search Inside Yourself - Self-Awareness
  | 'siy-regulation'      // Search Inside Yourself - Self-Regulation
  | 'siy-empathy'         // Search Inside Yourself - Empathy Development
  | 'siy-social'          // Search Inside Yourself - Social Skills
  | 'siy-happiness'       // Search Inside Yourself - Happiness & Compassion
  | 'siy-workplace';      // Search Inside Yourself - Workplace Application

export type Difficulty = 'pemula' | 'menengah' | 'lanjutan';

export interface RecommendationEngine {
  userId: string;
  preferences: UserPreferences;
  history: UserProgress[];
  recommendations: Recommendation[];
}

export interface UserPreferences {
  favoriteCategories: SessionCategory[];
  preferredDuration: number[];
  preferredDifficulty: Difficulty[];
  preferredInstructors: string[];
  ambientSoundPreferences: string[];
  notificationSettings: {
    dailyReminder: boolean;
    streakNotifications: boolean;
    newContentAlerts: boolean;
  };
}

export interface Recommendation {
  sessionId: string;
  reason: string;
  confidence: number;
  type: 'trending' | 'similar' | 'progress' | 'mood' | 'time-based';
}

export interface ContentStats {
  totalSessions: number;
  totalCourses: number;
  totalDuration: number; // minutes
  categoryCounts: Record<SessionCategory, number>;
  difficultyDistribution: Record<Difficulty, number>;
  averageRating: number;
  completionRate: number;
}

// Enhanced content management interfaces
export interface ContentUpload {
  id: string;
  fileName: string;
  originalName: string;
  fileType: 'audio' | 'image' | 'document';
  mimeType: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  storageUrl: string;
  isProcessed: boolean;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  metadata?: {
    duration?: number;
    bitrate?: number;
    sampleRate?: number;
    channels?: number;
    dimensions?: { width: number; height: number };
  };
}

export interface AdminContentManagement {
  id: string;
  title: string;
  description: string;
  contentType: 'session' | 'course' | 'ambient' | 'script';
  status: 'draft' | 'review' | 'published' | 'archived';
  visibility: 'public' | 'premium' | 'restricted';
  createdBy: string;
  lastModifiedBy: string;
  publishedAt?: Date;
  scheduledPublishAt?: Date;
  version: number;
  changelog: string[];
  approvalRequired: boolean;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface ContentCollection {
  id: string;
  name: string;
  description: string;
  type: 'playlist' | 'featured' | 'seasonal' | 'challenge';
  items: string[]; // session/course IDs
  thumbnailUrl?: string;
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserContentInteractions {
  userId: string;
  sessionId: string;
  interactions: {
    liked: boolean;
    bookmarked: boolean;
    shared: boolean;
    completed: boolean;
    timeSpent: number; // seconds
    pauseCount: number;
    skipCount: number;
    replayCount: number;
    lastPosition: number; // seconds
  };
  feedback?: {
    rating: number;
    review?: string;
    tags: string[];
    isHelpful?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalyticsData {
  sessionId: string;
  userId?: string;
  eventType: 'start' | 'pause' | 'resume' | 'complete' | 'skip' | 'like' | 'share';
  timestamp: Date;
  position?: number; // playback position in seconds
  deviceType: 'mobile' | 'tablet' | 'desktop';
  sessionDuration?: number;
  metadata?: Record<string, unknown>;
}

export interface InstructorProfile {
  id: string;
  name: string;
  bio: string;
  profileImageUrl?: string;
  credentials: string[];
  specialties: SessionCategory[];
  languages: ('id' | 'en')[];
  experience: string;
  socialLinks?: {
    website?: string;
    instagram?: string;
    youtube?: string;
  };
  isVerified: boolean;
  rating: number;
  totalSessions: number;
  joinedAt: Date;
}

export interface ContentSeries {
  id: string;
  title: string;
  description: string;
  instructor: string;
  sessions: string[]; // ordered session IDs
  category: SessionCategory;
  difficulty: Difficulty;
  estimatedWeeks: number;
  objectives: string[];
  requirements: string[];
  thumbnailUrl?: string;
  trailerVideoUrl?: string;
  isPremium: boolean;
  price?: number;
  currency?: string;
  enrollmentCount: number;
  completionRate: number;
  averageRating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MeditationChallenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  duration: number; // days
  sessions: string[];
  rewards: {
    badges: string[];
    points: number;
    unlockContent?: string[];
  };
  startDate: Date;
  endDate: Date;
  participants: number;
  completionRate: number;
  isActive: boolean;
}

export interface ContentRecommendationData {
  userId: string;
  preferences: {
    categories: SessionCategory[];
    difficulties: Difficulty[];
    durations: number[]; // preferred session lengths
    instructors: string[];
    timeOfDay: ('morning' | 'afternoon' | 'evening' | 'night')[];
    mood: string[];
  };
  behavior: {
    completionRate: number;
    averageSessionLength: number;
    mostActiveTime: string;
    preferredCategories: Record<SessionCategory, number>;
    skipPatterns: string[];
  };
  lastUpdated: Date;
}

// Search Inside Yourself specific types
export interface SIYModule {
  id: string;
  title: string;
  description: string;
  category: 'siy-attention' | 'siy-awareness' | 'siy-regulation' | 'siy-empathy' | 'siy-social' | 'siy-happiness' | 'siy-workplace';
  subcategory: string;
  exercises: SIYExercise[];
  estimatedDuration: number; // minutes
  objectives: string[];
  prerequisites: string[];
  difficulty: Difficulty;
  order: number; // for sequencing
  isCore: boolean; // core practice vs supplementary
  tags: string[];
  instructions: string[];
  tips: string[];
  scientificBackground?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SIYExercise {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  type: SIYExerciseType;
  duration: number; // minutes
  instructions: SIYInstruction[];
  audioFile?: AudioFile;
  guidedScript?: GuidedScript;
  interactiveElements?: SIYInteractiveElement[];
  reflectionPrompts?: string[];
  progressTracking?: SIYProgressMetrics;
  difficulty: Difficulty;
  order: number;
  tags: string[];
  isOptional: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type SIYExerciseType = 
  | 'breathing'           // Breathing exercises
  | 'body-scan'          // Body awareness
  | 'walking'            // Walking meditation
  | 'listening'          // Mindful listening
  | 'attention'          // Attention training
  | 'meta-attention'     // Attention to attention
  | 'emotional-body'     // Emotional body awareness
  | 'trigger-recognition' // Identifying triggers
  | 'values-clarification' // Values exercises
  | 'journaling'         // Reflective writing
  | 'assessment'         // Self-assessment
  | 'emotional-regulation' // STOP technique etc
  | 'visualization'      // Guided imagery
  | 'response-choice'    // Choosing responses
  | 'resilience'         // Building resilience
  | 'compassion'         // Self-compassion practices
  | 'communication'      // Mindful communication
  | 'leadership'         // Mindful leadership
  | 'empathy'            // Empathy development
  | 'loving-kindness'    // Loving kindness meditation
  | 'perspective-taking' // Perspective-taking exercises
  | 'micro-expressions'  // Reading facial expressions
  | 'cultural-empathy'   // Cultural understanding
  | 'mindful-speaking'   // Conscious communication
  | 'conflict-resolution' // Conflict navigation
  | 'difficult-conversations' // Hard conversations
  | 'team-building'      // Team emotional intelligence
  | 'feedback'           // Compassionate feedback
  | 'happiness'          // Joy cultivation
  | 'gratitude'          // Gratitude practices
  | 'altruism'          // Service meditation
  | 'forgiveness'        // Forgiveness practices
  | 'workplace-mindfulness' // Professional application
  | 'mindful-meetings'   // Meeting facilitation
  | 'email-communication' // Digital communication
  | 'performance-feedback' // Performance conversations
  | 'change-management';  // Managing transitions

export interface SIYInstruction {
  id: string;
  step: number;
  title: string;
  content: string;
  duration?: number; // seconds for this step
  type: 'setup' | 'practice' | 'reflection' | 'transition';
  audioStartTime?: number; // sync with audio
  visualCues?: string[];
  bodyPosture?: string;
  breathingPattern?: string;
}

export interface SIYInteractiveElement {
  id: string;
  type: 'slider' | 'scale' | 'text-input' | 'multiple-choice' | 'emotion-wheel' | 'body-map' | 'timeline';
  title: string;
  description: string;
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
  placeholder?: string;
  validation?: {
    required: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

export interface SIYProgressMetrics {
  userId: string;
  exerciseId: string;
  moduleId: string;
  completionCount: number;
  totalTimeSpent: number; // seconds
  averageRating: number;
  lastCompleted?: Date;
  streak: number;
  insights: SIYInsight[];
  measurements: SIYMeasurement[];
  milestones: SIYMilestone[];
  personalNotes: string[];
  skillLevel: 'beginner' | 'developing' | 'proficient' | 'advanced';
  createdAt: Date;
  updatedAt: Date;
}

export interface SIYInsight {
  id: string;
  type: 'pattern' | 'improvement' | 'challenge' | 'breakthrough' | 'recommendation';
  title: string;
  description: string;
  data?: Record<string, unknown>;
  createdAt: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface SIYMeasurement {
  id: string;
  metricType: 'attention-span' | 'emotional-awareness' | 'stress-level' | 'wellbeing' | 'focus-quality' | 'empathy-level' | 'social-skills' | 'happiness-index' | 'cultural-sensitivity' | 'communication-effectiveness' | 'conflict-resolution' | 'team-collaboration';
  value: number;
  scale: string; // e.g., "1-10", "1-5", "percentage"
  context?: string;
  timestamp: Date;
  exerciseId?: string;
  sessionId?: string;
}

export interface SIYMilestone {
  id: string;
  type: 'first-completion' | 'streak-achievement' | 'skill-breakthrough' | 'consistency' | 'mastery';
  title: string;
  description: string;
  achievedAt: Date;
  exerciseId?: string;
  moduleId?: string;
  badge?: string;
  points: number;
}

export interface SIYUserProfile {
  userId: string;
  currentLevel: 'foundation' | 'developing' | 'deepening' | 'integrating' | 'teaching';
  completedModules: string[];
  currentModuleId?: string;
  currentExerciseId?: string;
  practiceSchedule: SIYPracticeSchedule;
  personalGoals: string[];
  challengeAreas: string[];
  strengths: string[];
  preferences: {
    practiceTime: ('morning' | 'afternoon' | 'evening')[];
    sessionDuration: number; // preferred minutes
    reminderFrequency: 'daily' | 'weekly' | 'custom';
    guidanceLevel: 'minimal' | 'moderate' | 'detailed';
    audioPreference: 'guided' | 'music' | 'silence';
  };
  assessmentResults: SIYAssessmentResult[];
  journalEntries: SIYJournalEntry[];
  insights: SIYInsight[];
  overallProgress: {
    attentionSkill: number; // 0-100
    selfAwareness: number; // 0-100
    emotionalRegulation: number; // 0-100
    empathyDevelopment: number; // 0-100
    socialSkills: number; // 0-100
    happinessLevel: number; // 0-100
    workplaceApplication: number; // 0-100
    overallWellbeing: number; // 0-100
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface SIYPracticeSchedule {
  id: string;
  userId: string;
  type: 'daily' | 'weekly' | 'custom';
  timeSlots: {
    day: string; // 'monday', 'tuesday', etc.
    time: string; // '07:00'
    duration: number; // minutes
    moduleId?: string;
    exerciseId?: string;
  }[];
  reminders: boolean;
  adaptiveScheduling: boolean; // adjust based on progress
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SIYAssessmentResult {
  id: string;
  userId: string;
  assessmentType: 'initial' | 'progress' | 'module-completion' | 'final';
  moduleId?: string;
  scores: {
    category: string;
    score: number;
    maxScore: number;
    percentile?: number;
  }[];
  insights: string[];
  recommendations: string[];
  completedAt: Date;
  validUntil?: Date;
}

export interface SIYJournalEntry {
  id: string;
  userId: string;
  exerciseId?: string;
  moduleId?: string;
  sessionId?: string;
  type: 'reflection' | 'insight' | 'challenge' | 'breakthrough' | 'daily-check-in';
  title: string;
  content: string;
  mood?: number; // 1-10 scale
  energy?: number; // 1-10 scale
  stress?: number; // 1-10 scale
  tags: string[];
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SIYLearningPath {
  id: string;
  title: string;
  description: string;
  targetAudience: string[];
  estimatedWeeks: number;
  modules: string[]; // ordered module IDs
  prerequisites: string[];
  outcomes: string[];
  difficulty: Difficulty;
  isRecommended: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Indonesian Cultural Context Types
export interface IndonesianCulturalContext {
  id: string;
  concept: string; // e.g., "gotong-royong", "bapakisme", "harmony"
  definition: string;
  practicalApplication: string;
  mindfulnessConnection: string;
  exercises: string[]; // exercise IDs that incorporate this concept
  examples: string[];
  challenges: string[]; // potential cultural challenges
  adaptations: string[]; // how to adapt practices culturally
}

export interface SocialEIInteraction {
  id: string;
  userId: string;
  interactionType: 'empathy-practice' | 'difficult-conversation' | 'conflict-resolution' | 'team-collaboration' | 'cultural-bridge';
  context: string;
  beforeState: {
    emotionalState: string;
    stressLevel: number; // 1-10
    confidenceLevel: number; // 1-10
  };
  practiceApplied: string[];
  afterState: {
    emotionalState: string;
    stressLevel: number; // 1-10
    confidenceLevel: number; // 1-10
    satisfaction: number; // 1-10
  };
  outcomes: string[];
  learnings: string[];
  culturalFactors?: string[];
  timestamp: Date;
}

export interface WorkplaceSIYApplication {
  id: string;
  userId: string;
  workplace: string;
  position: string;
  applicationArea: 'leadership' | 'team-collaboration' | 'communication' | 'conflict-resolution' | 'performance-management' | 'cultural-bridge';
  situation: string;
  challengesFaced: string[];
  practicesUsed: string[];
  outcomes: string[];
  culturalConsiderations: string[];
  successMetrics: {
    teamHarmony: number; // 1-10
    productivity: number; // 1-10
    jobSatisfaction: number; // 1-10
    relationshipQuality: number; // 1-10
  };
  nextSteps: string[];
  createdAt: Date;
}