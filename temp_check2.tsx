import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { PersonalizationGoal, OnboardingData } from '../types/onboarding';
import type { MoodType } from '../types/mood';

interface PersonalizationData {
  goal?: PersonalizationGoal;
  mood?: MoodType;
  completedOnboarding: boolean;
  preferences: UserPreferences;
  userProfile: UserProfile;
  behaviorAnalytics: BehaviorAnalytics;
  adaptiveSettings: AdaptiveSettings;
  lastUpdated: Date;
}

interface UserPreferences {
  preferredSessionLength: number; // in minutes
  preferredTime: 'morning' | 'afternoon' | 'evening' | 'any';
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  favoriteTypes: string[];
  reminderEnabled: boolean;
  reminderTime?: string;
  // Audio preferences
  audioPreferences: {
    guidanceLanguage: 'id' | 'en' | 'both';
    voiceGender: 'male' | 'female' | 'any';
    backgroundSounds: boolean;
    ambientVolume: number;
    guidanceVolume: number;
    preferredInstructor?: string;
  };
  // Visual preferences
  visualPreferences: {
    colorScheme: 'auto' | 'light' | 'dark' | 'high-contrast';
    animationLevel: 'full' | 'reduced' | 'none';
    fontSize: 'small' | 'medium' | 'large';
    breathingVisualization: 'circle' | 'mandala' | 'nature' | 'abstract';
  };
  // Accessibility
  accessibility: {
    screenReader: boolean;
    reducedMotion: boolean;
    highContrast: boolean;
    largeText: boolean;
    voiceCommands: boolean;
    hapticFeedback: boolean;
  };
}

interface UserProfile {
  demographics: {
    ageRange?: '18-25' | '26-35' | '36-45' | '46-55' | '55+';
    lifestyle?: 'student' | 'working' | 'parent' | 'retired' | 'entrepreneur';
    stressLevel: 1 | 2 | 3 | 4 | 5;
    fitnessLevel?: 'low' | 'moderate' | 'high';
    meditationExperience: 'none' | 'beginner' | 'intermediate' | 'advanced';
  };
  healthData: {
    chronicConditions?: string[];
    sleepPattern?: 'early-bird' | 'night-owl' | 'irregular';
    energyLevels?: { morning: number; afternoon: number; evening: number };
    stressTriggers?: string[];
    relaxationTechniques?: string[];
  };
  lifestyle: {
    workSchedule?: 'regular' | 'shift' | 'flexible' | 'irregular';
    exerciseRoutine?: string[];
    socialActivity: 'introvert' | 'extrovert' | 'ambivert';
    techComfort: 'low' | 'medium' | 'high';
    culturalBackground?: string;
    spokenLanguages: string[];
  };
  goals: {
    primary: PersonalizationGoal;
    secondary?: PersonalizationGoal[];
    specificObjectives?: string[];
    timeframe?: 'short' | 'medium' | 'long';
    measurableTargets?: { [key: string]: number };
  };
}

interface BehaviorAnalytics {
  sessionHistory: SessionData[];
  usagePatterns: {
    activeTimeSlots: { [hour: number]: number }; // Usage frequency by hour
    preferredDuration: number; // Most common session length
    completionRate: number; // Percentage of sessions completed
    streakDays: number;
    totalSessions: number;
    totalMinutes: number;
  };
  moodPatterns: {
    moodHistory: { date: string; mood: MoodType; context?: string }[];
    moodTrends: { [mood in MoodType]: number };
    moodCorrelations: { [activity: string]: MoodType };
  };
  progressMetrics: {
    skillProgression: { [skill: string]: number };
    difficultyProgression: number;
    achievementUnlocked: string[];
    personalBests: { [metric: string]: number };
  };
  environmentalData: {
    location?: { latitude: number; longitude: number; city: string };
    weather?: { condition: string; temperature: number };
    timeZone: string;
    seasonalPatterns?: { [season: string]: any };
  };
}

interface AdaptiveSettings {
  dynamicDifficulty: boolean;
  smartScheduling: boolean;
  contextualRecommendations: boolean;
  moodBasedContent: boolean;
  weatherBasedContent: boolean;
  biometricIntegration: boolean;
  socialFeatures: boolean;
  gamificationLevel: 'none' | 'minimal' | 'moderate' | 'full';
  aiCoaching: boolean;
  predictiveInsights: boolean;
}

interface SessionData {
  id: string;
  date: Date;
  type: string;
  duration: number;
  completed: boolean;
  rating?: 1 | 2 | 3 | 4 | 5;
  moodBefore?: MoodType;
  moodAfter?: MoodType;
  notes?: string;
  context?: {
    location: string;
    weather?: string;
    stressLevel?: number;
    energyLevel?: number;
  };
}

interface PersonalizationContextType {
  personalization: PersonalizationData | null;
  setPersonalization: (data: Partial<PersonalizationData>) => void;
  updateFromOnboarding: (onboardingData: OnboardingData) => void;
  
  // Content Recommendations
  getPersonalizedRecommendations: () => MeditationRecommendation[];
  getSmartSchedule: () => ScheduleRecommendation[];
  getContextualContent: () => ContextualContent;
  
  // Personalized UI/UX
  getPersonalizedQuote: () => PersonalizedQuote;
  getPersonalizedGreeting: () => string;
  getAdaptiveTheme: () => AdaptiveTheme;
  getDashboardLayout: () => DashboardConfig;
  
  // Analytics and Insights
  getBehaviorInsights: () => BehaviorInsights;
  getProgressInsights: () => ProgressInsights;
  getPredictiveInsights: () => PredictiveInsights;
  
  // Session Management
  trackSession: (sessionData: SessionData) => void;
  updateMoodPattern: (mood: MoodType, context?: string) => void;
  updateUserProfile: (profileData: Partial<UserProfile>) => void;
  
  // Adaptive Learning
  adaptDifficulty: (performance: number) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  
  // Environmental Context
  updateEnvironmentalContext: (context: EnvironmentalContext) => void;
  getWeatherBasedRecommendations: () => MeditationRecommendation[];
  
  // Utility
  isPersonalized: boolean;
  resetPersonalization: () => void;
  exportPersonalData: () => any;
  importPersonalData: (data: any) => void;
}

interface MeditationRecommendation {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: string;
  reason: string; // Why this is recommended
  priority: number; // 1-5, 5 being highest priority
}

interface PersonalizedQuote {
  text: string;
  author: string;
  context: string; // Why this quote fits the user
}

interface ScheduleRecommendation {
  id: string;
  time: string; // HH:MM format
  type: string;
  duration: number;
  reason: string;
  priority: 1 | 2 | 3 | 4 | 5;
  adaptable: boolean;
}

interface ContextualContent {
  recommendations: MeditationRecommendation[];
  mood: string;
  weather?: string;
  timeOfDay: string;
  location?: string;
  stressLevel?: number;
  energyLevel?: number;
}

interface AdaptiveTheme {
  colorScheme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  accentColor: string;
  backgroundGradient: string[];
  fontSize: number;
  animationSpeed: number;
  visualComplexity: 'minimal' | 'moderate' | 'rich';
}

interface DashboardConfig {
  layout: 'simple' | 'detailed' | 'comprehensive';
  sections: {
    mood: { enabled: boolean; position: number; size: 'small' | 'medium' | 'large' };
    recommendations: { enabled: boolean; position: number; size: 'small' | 'medium' | 'large' };
    progress: { enabled: boolean; position: number; size: 'small' | 'medium' | 'large' };
    schedule: { enabled: boolean; position: number; size: 'small' | 'medium' | 'large' };
    insights: { enabled: boolean; position: number; size: 'small' | 'medium' | 'large' };
    community: { enabled: boolean; position: number; size: 'small' | 'medium' | 'large' };
  };
  quickActions: string[];
  prominentFeatures: string[];
}

interface BehaviorInsights {
  patterns: {
    mostActiveHours: number[];
    preferredSessionLength: number;
    completionTrends: { period: string; rate: number }[];
    moodCorrelations: { activity: string; mood: MoodType; correlation: number }[];
  };
  achievements: {
    streaks: { current: number; longest: number };
    milestones: { name: string; achieved: boolean; progress: number }[];
    improvements: { metric: string; improvement: number; period: string }[];
  };
  recommendations: string[];
}

interface ProgressInsights {
  skillProgress: {
    concentration: number;
    mindfulness: number;
    stressManagement: number;
    emotionalRegulation: number;
    sleep: number;
  };
  trendsAnalysis: {
    improving: string[];
    plateauing: string[];
    declining: string[];
  };
  nextGoals: {
    shortTerm: string[];
    mediumTerm: string[];
    longTerm: string[];
  };
  personalizedTips: string[];
}

interface PredictiveInsights {
  optimalTimes: { activity: string; time: string; confidence: number }[];
  moodPredictions: { date: string; predictedMood: MoodType; confidence: number }[];
  motivationTips: string[];
  riskFactors: { factor: string; risk: 'low' | 'medium' | 'high'; mitigation: string }[];
  opportunities: { opportunity: string; benefit: string; effort: 'low' | 'medium' | 'high' }[];
}

interface EnvironmentalContext {
  location?: { latitude: number; longitude: number; city: string; country: string };
  weather?: {
    condition: string;
    temperature: number;
    humidity: number;
    pressure: number;
    uvIndex: number;
  };
  timeZone: string;
  season: 'spring' | 'summer' | 'fall' | 'winter';
  timeOfDay: 'early-morning' | 'morning' | 'afternoon' | 'evening' | 'night' | 'late-night';
  noise: 'quiet' | 'moderate' | 'noisy';
  lighting: 'bright' | 'moderate' | 'dim';
  socialContext: 'alone' | 'with-others' | 'in-public';
}

const PersonalizationContext = createContext<PersonalizationContextType | undefined>(undefined);

const STORAGE_KEY = 'sembalun_personalization';

// Default recommendations based on goals
const recommendationDatabase = {
  stress: [
    {
      id: 'stress-1',
      title: 'Pernapasan Tenang Sembalun',
      description: 'Teknik pernapasan yang terinspirasi dari ketenangan pegunungan Sembalun untuk meredakan stres',
      duration: 5,
      difficulty: 'beginner' as const,
      type: 'breathing',
      reason: 'Dirancang khusus untuk mengelola stres dengan teknik pernapasan yang terbukti efektif',
      priority: 5
    },
    {
      id: 'stress-2',
      title: 'Body Scan Relaksasi',
      description: 'Melepaskan ketegangan tubuh dan pikiran melalui pemindaian kesadaran tubuh',
      duration: 10,
      difficulty: 'beginner' as const,
      type: 'body-scan',
      reason: 'Membantu melepaskan ketegangan fisik yang sering muncul akibat stres',
      priority: 4
    }
  ],
  focus: [
    {
      id: 'focus-1',
      title: 'Konsentrasi Satu Titik',
      description: 'Latihan fokus pada satu objek untuk meningkatkan konsentrasi dan kejernihan mental',
      duration: 8,
      difficulty: 'intermediate' as const,
      type: 'focus',
      reason: 'Metode terbukti untuk meningkatkan kemampuan fokus dan konsentrasi',
      priority: 5
    },
    {
      id: 'focus-2',
      title: 'Mindful Breathing Fokus',
      description: 'Pernapasan sadar untuk melatih perhatian dan meningkatkan fokus',
      duration: 6,
      difficulty: 'beginner' as const,
      type: 'breathing',
      reason: 'Fondasi dasar untuk mengembangkan kemampuan fokus yang lebih baik',
      priority: 4
    }
  ],
  sleep: [
    {
      id: 'sleep-1',
      title: 'Relaksasi Malam Sembalun',
      description: 'Ritual malam yang menenangkan untuk mempersiapkan tidur berkualitas',
      duration: 15,
      difficulty: 'beginner' as const,
      type: 'sleep',
      reason: 'Dirancang khusus untuk membantu transisi dari aktivitas harian ke istirahat malam',
      priority: 5
    },
    {
      id: 'sleep-2',
      title: 'Progressive Muscle Relaxation',
      description: 'Relaksasi otot progresif untuk melepaskan ketegangan sebelum tidur',
      duration: 12,
      difficulty: 'beginner' as const,
      type: 'body-scan',
      reason: 'Teknik efektif untuk melepaskan ketegangan fisik yang mengganggu tidur',
      priority: 4
    }
  ],
  curious: [
    {
      id: 'curious-1',
      title: 'Pengenalan Mindfulness Nusantara',
      description: 'Eksplorasi dasar-dasar mindfulness dengan sentuhan kearifan lokal Indonesia',
      duration: 7,
      difficulty: 'beginner' as const,
      type: 'mindfulness',
      reason: 'Pengenalan yang sempurna untuk memahami konsep dasar mindfulness',
      priority: 5
    },
    {
      id: 'curious-2',
      title: 'Meditasi Loving-Kindness',
      description: 'Mengembangkan welas asih dan cinta kasih melalui praktik metta',
      duration: 10,
      difficulty: 'intermediate' as const,
      type: 'loving-kindness',
      reason: 'Eksplorasi aspek emosional dari praktik mindfulness',
      priority: 4
    }
  ]
};

// Personalized quotes based on goals
const quotesDatabase = {
  stress: [
    {
      text: "Seperti gunung Sembalun yang tetap tenang meski diterpa angin, kita pun bisa menemukan ketenangan di tengah badai kehidupan.",
      author: "Pepatah Sasak",
      context: "Mengingatkan bahwa ketenangan dapat ditemukan bahkan dalam situasi yang menantang"
    },
    {
      text: "Napas adalah jembatan antara tubuh dan pikiran, antara kegelisahan dan kedamaian.",
      author: "Filosofi Mindfulness",
      context: "Menekankan kekuatan pernapasan dalam mengelola stres"
    }
  ],
  focus: [
    {
      text: "Pohon yang kuat tumbuh dengan akar yang dalam dan fokus yang mantap ke arah sinar matahari.",
      author: "Kebijaksanaan Alam",
      context: "Mengajarkan pentingnya fokus yang mantap untuk pertumbuhan"
    },
    {
      text: "Dalam keheningan pikiran yang terfokus, kita menemukan kejernihan yang sesungguhnya.",
      author: "Tradisi Kontemplasi",
      context: "Menghubungkan fokus dengan kejernihan mental"
    }
  ],
  sleep: [
    {
      text: "Malam adalah guru terbaik tentang melepaskan - melepaskan hari yang telah berlalu untuk menyambut yang baru.",
      author: "Refleksi Malam",
      context: "Membantu transisi mental dari aktivitas ke istirahat"
    },
    {
      text: "Tidur adalah meditasi alami, waktu ketika jiwa beristirahat dan memulihkan diri.",
      author: "Kearifan Tradisional",
      context: "Membingkai tidur sebagai praktik spiritual"
    }
  ],
  curious: [
    {
      text: "Perjalanan seribu mil dimulai dengan satu langkah, begitu pula perjalanan ke dalam diri dimulai dengan satu napas.",
      author: "Adaptasi Lao Tzu",
      context: "Mendorong eksplorasi dengan langkah kecil namun bermakna"
    },
    {
      text: "Kebijaksaan sejati adalah mengetahui bahwa kita tidak tahu - dan dari sanalah pembelajaran dimulai.",
      author: "Filosofi Pembelajaran",
      context: "Merayakan sikap ingin tahu dan keterbukaan untuk belajar"
    }
  ]
};

// Default user profile for new users
const getDefaultUserProfile = (): UserProfile => ({
  demographics: {
    stressLevel: 3,
    meditationExperience: 'none'
  },
  healthData: {},
  lifestyle: {
    socialActivity: 'ambivert',
    techComfort: 'medium',
    spokenLanguages: ['id', 'en']
  },
  goals: {
    primary: 'curious'
  }
});

// Default preferences for new users
const getDefaultPreferences = (): UserPreferences => ({
  preferredSessionLength: 5,
  preferredTime: 'any',
  difficultyLevel: 'beginner',
  favoriteTypes: [],
  reminderEnabled: false,
  audioPreferences: {
    guidanceLanguage: 'id',
    voiceGender: 'any',
    backgroundSounds: true,
    ambientVolume: 0.5,
    guidanceVolume: 0.8
  },
  visualPreferences: {
    colorScheme: 'auto',
    animationLevel: 'full',
    fontSize: 'medium',
    breathingVisualization: 'circle'
  },
  accessibility: {
    screenReader: false,
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    voiceCommands: false,
    hapticFeedback: false
  }
});

// Default behavior analytics
const getDefaultBehaviorAnalytics = (): BehaviorAnalytics => ({
  sessionHistory: [],
  usagePatterns: {
    activeTimeSlots: {},
    preferredDuration: 5,
    completionRate: 0,
    streakDays: 0,
    totalSessions: 0,
    totalMinutes: 0
  },
  moodPatterns: {
    moodHistory: [],
    moodTrends: {
      'very-sad': 0,
      'sad': 0,
      'neutral': 0,
      'happy': 0,
      'very-happy': 0
    },
    moodCorrelations: {}
  },
  progressMetrics: {
    skillProgression: {},
    difficultyProgression: 0,
    achievementUnlocked: [],
    personalBests: {}
  },
  environmentalData: {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  }
});

// Default adaptive settings
const getDefaultAdaptiveSettings = (): AdaptiveSettings => ({
  dynamicDifficulty: true,
  smartScheduling: true,
  contextualRecommendations: true,
  moodBasedContent: true,
  weatherBasedContent: false,
  biometricIntegration: false,
  socialFeatures: false,
  gamificationLevel: 'moderate',
  aiCoaching: true,
  predictiveInsights: true
});

export const PersonalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [personalization, setPersonalizationState] = useState<PersonalizationData | null>(null);
  const [environmentalContext, setEnvironmentalContext] = useState<EnvironmentalContext>({
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    season: getCurrentSeason(),
    timeOfDay: getCurrentTimeOfDay(),
    noise: 'quiet',
    lighting: 'moderate',
    socialContext: 'alone'
  });

  // Helper functions
  function getCurrentSeason(): 'spring' | 'summer' | 'fall' | 'winter' {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  function getCurrentTimeOfDay(): 'early-morning' | 'morning' | 'afternoon' | 'evening' | 'night' | 'late-night' {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 7) return 'early-morning';
    if (hour >= 7 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    if (hour >= 21 && hour < 24) return 'night';
    return 'late-night';
  }

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPersonalizationState({
          ...parsed,
          lastUpdated: new Date(parsed.lastUpdated),
          // Ensure new fields exist with defaults
          userProfile: { ...getDefaultUserProfile(), ...parsed.userProfile },
          behaviorAnalytics: { ...getDefaultBehaviorAnalytics(), ...parsed.behaviorAnalytics },
          adaptiveSettings: { ...getDefaultAdaptiveSettings(), ...parsed.adaptiveSettings }
        });
      } catch (error) {
        console.error('Failed to parse personalization data:', error);
        // Initialize with defaults if parsing fails
        initializeWithDefaults();
      }
    } else {
      initializeWithDefaults();
    }
  }, []);

  // Initialize with default values
  const initializeWithDefaults = () => {
    setPersonalizationState({
      completedOnboarding: false,
      preferences: getDefaultPreferences(),
      userProfile: getDefaultUserProfile(),
      behaviorAnalytics: getDefaultBehaviorAnalytics(),
      adaptiveSettings: getDefaultAdaptiveSettings(),
      lastUpdated: new Date()
    });
  };

  // Save to localStorage whenever personalization changes
  useEffect(() => {
    if (personalization) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(personalization));
    }
  }, [personalization]);

  // Update environmental context periodically
  useEffect(() => {
    const updateEnvironmentalContext = () => {
      setEnvironmentalContext(prev => ({
        ...prev,
        timeOfDay: getCurrentTimeOfDay(),
        season: getCurrentSeason()
      }));
    };

    const interval = setInterval(updateEnvironmentalContext, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const setPersonalization = (data: Partial<PersonalizationData>) => {
    setPersonalizationState(prev => {
      const updated = {
        ...prev,
        ...data,
        lastUpdated: new Date()
      } as PersonalizationData;
      
      return updated;
    });
  };

  const updateFromOnboarding = (onboardingData: OnboardingData) => {
    const preferences: UserPreferences = {
      preferredSessionLength: onboardingData.timeCommitment || 5,
      preferredTime: 'any',
      difficultyLevel: onboardingData.experience as 'beginner' | 'intermediate' | 'advanced',
      favoriteTypes: [],
      reminderEnabled: onboardingData.preferences?.notifications || false,
      audioPreferences: {
        guidanceLanguage: onboardingData.preferences?.language || 'id',
        voiceGender: 'any',
        backgroundSounds: true,
        ambientVolume: 0.5,
        guidanceVolume: 0.8
      },
      visualPreferences: {
        colorScheme: onboardingData.preferences?.theme || 'auto',
        animationLevel: 'full',
        fontSize: 'medium',
        breathingVisualization: 'circle'
      },
      accessibility: {
        screenReader: false,
        reducedMotion: false,
        highContrast: false,
        largeText: false,
        voiceCommands: false,
        hapticFeedback: onboardingData.preferences?.vibrations || false
      }
    };

    // Customize preferences based on goal
    if (onboardingData.goal === 'sleep') {
      preferences.preferredTime = 'evening';
      preferences.preferredSessionLength = 10;
      preferences.favoriteTypes = ['sleep-meditation', 'body-scan', 'relaxation'];
    } else if (onboardingData.goal === 'focus') {
      preferences.preferredTime = 'morning';
      preferences.preferredSessionLength = 8;
      preferences.favoriteTypes = ['concentration', 'mindfulness', 'breathing'];
    } else if (onboardingData.goal === 'stress') {
      preferences.preferredSessionLength = 5;
      preferences.favoriteTypes = ['breathing', 'body-scan', 'calming'];
    } else if (onboardingData.goal === 'curious') {
      preferences.preferredSessionLength = 6;
      preferences.favoriteTypes = ['beginner', 'variety', 'guided'];
    }

    // Adjust preferences based on mood
    if (onboardingData.selectedMood) {
      if (onboardingData.selectedMood === 'anxious') {
        preferences.preferredSessionLength = Math.max(3, preferences.preferredSessionLength - 2);
        preferences.favoriteTypes = ['calming', 'anxiety-relief', ...preferences.favoriteTypes];
      } else if (onboardingData.selectedMood === 'energetic') {
        preferences.preferredSessionLength += 2;
        preferences.favoriteTypes = ['focus', 'concentration', ...preferences.favoriteTypes];
      } else if (onboardingData.selectedMood === 'sad') {
        preferences.favoriteTypes = ['loving-kindness', 'self-compassion', ...preferences.favoriteTypes];
      }
    }

    // Create comprehensive personalization data
    const updatedPersonalization = {
      goal: onboardingData.selectedGoal || onboardingData.goal,
      mood: onboardingData.selectedMood,
      completedOnboarding: true,
      preferences,
      userProfile: {
        ...personalization?.userProfile,
        goals: {
          primary: onboardingData.selectedGoal || onboardingData.goal || 'curious',
          secondary: [],
          timeframe: 'medium' as const,
          measurableTargets: getInitialTargets(onboardingData.selectedGoal || onboardingData.goal)
        },
        demographics: {
          ...personalization?.userProfile?.demographics,
          stressLevel: onboardingData.selectedMood === 'anxious' ? 4 : 
                      onboardingData.selectedMood === 'sad' ? 3 : 2,
          meditationExperience: 'beginner' as const
        }
      },
      behaviorAnalytics: personalization?.behaviorAnalytics || {
        sessionHistory: [],
        usagePatterns: {
          activeTimeSlots: {},
          preferredDuration: preferences.preferredSessionLength,
          completionRate: 0,
          streakDays: 0,
          totalSessions: 0,
          totalMinutes: 0
        },
        moodPatterns: {
          moodHistory: onboardingData.selectedMood ? [{
            date: new Date().toISOString(),
            mood: onboardingData.selectedMood,
            context: 'onboarding'
          }] : [],
          moodTrends: onboardingData.selectedMood ? {
            [onboardingData.selectedMood]: 1,
            happy: 0, sad: 0, anxious: 0, calm: 0, energetic: 0, angry: 0
          } : { happy: 0, sad: 0, anxious: 0, calm: 0, energetic: 0, angry: 0 },
          moodCorrelations: {}
        },
        progressMetrics: {
          skillProgression: {},
          difficultyProgression: 0,
          achievementUnlocked: []
        }
      },
      adaptiveSettings: getAdaptiveSettings(onboardingData.selectedGoal || onboardingData.goal, onboardingData.selectedMood),
      lastUpdated: new Date()
    };

    setPersonalization(updatedPersonalization);
    
    // Persist to localStorage
    try {
      localStorage.setItem('sembalun-personalization', JSON.stringify(updatedPersonalization));
    } catch (error) {
      console.warn('Failed to save personalization:', error);
    }
  };

  // Helper function for initial targets based on goal
  const getInitialTargets = (goal?: PersonalizationGoal): { [key: string]: number } => {
    if (!goal) return {};
    
    const targets = {
      stress: { 'daily-sessions': 1, 'weekly-minutes': 35, 'stress-level-reduction': 2 },
      focus: { 'daily-sessions': 1, 'session-duration': 10, 'focus-score': 7 },
      sleep: { 'bedtime-sessions': 5, 'sleep-quality': 8, 'weekly-consistency': 6 },
      curious: { 'different-techniques': 5, 'weekly-sessions': 4, 'exploration-score': 10 }
    };
    
    return targets[goal] || {};
  };

  // Helper function for adaptive settings
  const getAdaptiveSettings = (goal?: PersonalizationGoal, mood?: MoodType): AdaptiveSettings => {
    return {
      difficultyProgression: 0.1,
      sessionAdaptation: true,
      smartReminders: true,
      contentFiltering: {
        showAdvanced: false,
        prioritizeGoal: true,
        moodAware: !!mood
      },
      uiCustomization: {
        primaryColor: goal === 'sleep' ? '#6366f1' : 
                     goal === 'focus' ? '#10b981' :
                     goal === 'stress' ? '#f59e0b' : '#6366f1',
        accentColor: '#8b5cf6',
        fontScale: 1.0,
        spacing: 'comfortable'
}
export {}
