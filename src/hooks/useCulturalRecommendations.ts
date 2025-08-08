import { useState, useCallback, useMemo } from 'react';
import { useMoodTracker } from './useMoodTracker';
import { useCulturalAchievements } from './useCulturalAchievements';

// Regional Practice Types
export type RegionType = 'sembalun' | 'java' | 'bali' | 'sumatra' | 'sulawesi' | 'nusa-tenggara';
export type PracticeCategory = 'meditation' | 'breathing' | 'reflection' | 'mindfulness' | 'spiritual' | 'healing';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
export type MoodState = 'stressed' | 'anxious' | 'sad' | 'angry' | 'neutral' | 'happy' | 'calm' | 'energized';

// Cultural Practice Definition
interface CulturalPractice {
  id: string;
  title: string;
  description: string;
  region: RegionType;
  category: PracticeCategory;
  difficulty: DifficultyLevel;
  duration: number; // in minutes
  optimalTimeOfDay: TimeOfDay[];
  moodBenefits: MoodState[]; // What moods this practice helps with
  culturalContext: string;
  elements: string[];
  wisdom: string;
  visualization?: string;
  breathingPattern?: {
    inhale: number;
    hold: number;
    exhale: number;
    pause: number;
  };
  prerequisites?: string[];
  isUnlocked: boolean;
  unlockRequirement?: string;
}

// User Preference Profile
interface UserPreferences {
  favoriteRegions: RegionType[];
  preferredCategories: PracticeCategory[];
  preferredDurations: number[]; // Preferred session lengths
  preferredTimeOfDay: TimeOfDay[];
  experienceLevel: DifficultyLevel;
  currentMoodPatterns: Record<MoodState, number>; // Frequency of each mood
  practiceHistory: string[]; // IDs of completed practices
  culturalInterests: string[];
}

// Recommendation Score and Reasoning
interface RecommendationScore {
  score: number; // 0-100
  reasoning: {
    moodMatch: number;
    timeMatch: number;
    difficultyMatch: number;
    varietyBonus: number;
    culturalProgression: number;
    personalPreference: number;
  };
}

interface CulturalRecommendation {
  practice: CulturalPractice;
  score: RecommendationScore;
  reason: string;
  category: 'perfect-match' | 'mood-booster' | 'cultural-growth' | 'variety-exploration' | 'stress-relief';
  urgency: 'high' | 'medium' | 'low';
}

// Comprehensive cultural practices database
const culturalPracticesDatabase: CulturalPractice[] = [
  // Sembalun Valley Practices
  {
    id: 'sembalun-sunrise-meditation',
    title: 'Meditasi Fajar Sembalun',
    description: 'Meditasi spiritual dengan energi matahari terbit di lembah Sembalun',
    region: 'sembalun',
    category: 'meditation',
    difficulty: 'beginner',
    duration: 15,
    optimalTimeOfDay: ['morning'],
    moodBenefits: ['stressed', 'sad', 'anxious'],
    culturalContext: 'Tradisi masyarakat Sasak yang memanfaatkan energi pagi untuk spiritual cleansing',
    elements: ['mountain visualization', 'sunrise energy', 'valley winds'],
    wisdom: 'Fajar membawa harapan baru, seperti jiwa yang terbarui setiap hari',
    visualization: 'Bayangkan diri Anda di puncak bukit Sembalun, menyaksikan matahari terbit di balik Gunung Rinjani',
    breathingPattern: { inhale: 4, hold: 2, exhale: 6, pause: 2 },
    isUnlocked: true
  },
  {
    id: 'sembalun-mountain-reflection',
    title: 'Refleksi Gunung Rinjani',
    description: 'Meditasi mendalam dengan kekuatan spiritual Gunung Rinjani',
    region: 'sembalun',
    category: 'reflection',
    difficulty: 'intermediate',
    duration: 25,
    optimalTimeOfDay: ['morning', 'afternoon'],
    moodBenefits: ['anxious', 'stressed', 'neutral'],
    culturalContext: 'Gunung Rinjani dianggap suci dan menjadi tempat spiritual journey masyarakat Lombok',
    elements: ['mountain energy', 'spiritual connection', 'inner strength'],
    wisdom: 'Gunung mengajarkan keteguhan, tinggi namun tetap rendah hati',
    visualization: 'Rasakan kekuatan dan stabilitas gunung mengalir melalui tubuh Anda',
    prerequisites: ['sembalun-sunrise-meditation'],
    isUnlocked: true
  },
  {
    id: 'sembalun-valley-winds',
    title: 'Angin Lembah Sembalun',
    description: 'Praktik mindfulness dengan ritme angin lembah yang menenangkan',
    region: 'sembalun',
    category: 'mindfulness',
    difficulty: 'beginner',
    duration: 10,
    optimalTimeOfDay: ['afternoon', 'evening'],
    moodBenefits: ['angry', 'stressed', 'anxious'],
    culturalContext: 'Angin lembah Sembalun dipercaya membawa energi penyembuhan alami',
    elements: ['wind meditation', 'natural rhythm', 'valley energy'],
    wisdom: 'Angin mengajarkan kita untuk mengalir dengan kehidupan',
    breathingPattern: { inhale: 3, hold: 1, exhale: 4, pause: 1 },
    isUnlocked: true
  },

  // Javanese Practices
  {
    id: 'java-court-meditation',
    title: 'Meditasi Keraton Jawa',
    description: 'Praktik meditasi dengan kebijaksanaan istana Jawa kuno',
    region: 'java',
    category: 'meditation',
    difficulty: 'intermediate',
    duration: 20,
    optimalTimeOfDay: ['morning', 'evening'],
    moodBenefits: ['stressed', 'anxious', 'sad'],
    culturalContext: 'Tradisi meditasi yang berasal dari keraton Yogyakarta dan Solo',
    elements: ['royal wisdom', 'cultural dignity', 'inner nobility'],
    wisdom: 'Sapa sing sabar, bakal pikoleh - Siapa yang sabar akan mendapat hasil',
    visualization: 'Duduk dengan postur bangsawan di pendopo keraton yang megah',
    prerequisites: ['sembalun-sunrise-meditation'],
    isUnlocked: false,
    unlockRequirement: 'Complete 3 Sembalun practices'
  },
  {
    id: 'java-wayang-wisdom',
    title: 'Kebijaksanaan Wayang',
    description: 'Refleksi spiritual melalui filosofi wayang dan kehidupan',
    region: 'java',
    category: 'reflection',
    difficulty: 'advanced',
    duration: 30,
    optimalTimeOfDay: ['evening', 'night'],
    moodBenefits: ['sad', 'anxious', 'neutral'],
    culturalContext: 'Wayang sebagai cermin kehidupan dan sumber kebijaksanaan hidup',
    elements: ['shadow reflection', 'life philosophy', 'character archetypes'],
    wisdom: 'Sepi ing pamrih, rame ing gawe - Tanpa pamrih, rajin berkarya',
    visualization: 'Amati bayangan kehidupan seperti pertunjukan wayang',
    prerequisites: ['java-court-meditation'],
    isUnlocked: false,
    unlockRequirement: 'Complete Java Court Meditation'
  },

  // Balinese Practices
  {
    id: 'bali-temple-harmony',
    title: 'Harmoni Pura Bali',
    description: 'Meditasi dengan energi sacred space temple Bali',
    region: 'bali',
    category: 'spiritual',
    difficulty: 'intermediate',
    duration: 18,
    optimalTimeOfDay: ['morning', 'afternoon'],
    moodBenefits: ['anxious', 'stressed', 'sad'],
    culturalContext: 'Pura sebagai sacred space untuk koneksi dengan divine energy',
    elements: ['temple energy', 'sacred geometry', 'divine connection'],
    wisdom: 'Tri Hita Karana - Harmoni dengan Tuhan, sesama, dan alam',
    visualization: 'Berada di courtyard pura yang tenang dengan aroma dupa',
    prerequisites: ['sembalun-sunrise-meditation'],
    isUnlocked: false,
    unlockRequirement: 'Complete 2 different regional practices'
  },
  {
    id: 'bali-ocean-reflection',
    title: 'Refleksi Samudra Bali',
    description: 'Meditasi dengan ritme gelombang laut dan wisdom samudra',
    region: 'bali',
    category: 'reflection',
    difficulty: 'beginner',
    duration: 12,
    optimalTimeOfDay: ['afternoon', 'evening'],
    moodBenefits: ['angry', 'stressed', 'anxious'],
    culturalContext: 'Laut sebagai simbol infinite wisdom dalam tradisi Bali',
    elements: ['ocean rhythm', 'wave meditation', 'infinite wisdom'],
    wisdom: 'Seperti laut yang tenang namun dalam, hati yang damai penuh kebijaksanaan',
    breathingPattern: { inhale: 4, hold: 1, exhale: 6, pause: 2 },
    isUnlocked: false,
    unlockRequirement: 'Complete Bali Temple Harmony'
  },

  // Sumatran Practices
  {
    id: 'sumatra-forest-meditation',
    title: 'Meditasi Hutan Sumatra',
    description: 'Koneksi spiritual dengan kekuatan hutan tropis Sumatra',
    region: 'sumatra',
    category: 'meditation',
    difficulty: 'intermediate',
    duration: 22,
    optimalTimeOfDay: ['morning', 'afternoon'],
    moodBenefits: ['stressed', 'anxious', 'sad'],
    culturalContext: 'Hutan sebagai sacred space dalam tradisi suku-suku Sumatra',
    elements: ['forest energy', 'tree wisdom', 'natural harmony'],
    wisdom: 'Pohon yang berisi selalu menunduk - kebijaksanaan membawa kerendahan hati',
    visualization: 'Duduk di bawah pohon raksasa dengan akar yang dalam',
    prerequisites: ['java-court-meditation', 'bali-temple-harmony'],
    isUnlocked: false,
    unlockRequirement: 'Explore 3 different regions'
  },

  // Sulawesi Practices
  {
    id: 'sulawesi-ancestral-wisdom',
    title: 'Kebijaksanaan Leluhur Sulawesi',
    description: 'Koneksi dengan wisdom nenek moyang melalui tradisi Toraja',
    region: 'sulawesi',
    category: 'spiritual',
    difficulty: 'advanced',
    duration: 28,
    optimalTimeOfDay: ['evening', 'night'],
    moodBenefits: ['sad', 'anxious', 'neutral'],
    culturalContext: 'Tradisi spiritual Toraja dalam menghormati dan belajar dari leluhur',
    elements: ['ancestral connection', 'ancient wisdom', 'spiritual guidance'],
    wisdom: 'Leluhur adalah guide untuk kehidupan yang bermakna',
    visualization: 'Duduk di Tongkonan dengan guidance spiritual dari leluhur',
    prerequisites: ['sumatra-forest-meditation'],
    isUnlocked: false,
    unlockRequirement: 'Complete advanced practices from 2 regions'
  },

  // Nusa Tenggara Practices
  {
    id: 'nusa-tenggara-sunrise-hope',
    title: 'Harapan Fajar Nusa Tenggara',
    description: 'Meditasi dengan energi sunrise dari timur Indonesia',
    region: 'nusa-tenggara',
    category: 'healing',
    difficulty: 'beginner',
    duration: 14,
    optimalTimeOfDay: ['morning'],
    moodBenefits: ['sad', 'anxious', 'stressed'],
    culturalContext: 'Timur Indonesia sebagai land of rising sun dan new beginnings',
    elements: ['sunrise energy', 'new hope', 'eastern wisdom'],
    wisdom: 'Matahari terbit mengajarkan bahwa setiap hari adalah kesempatan baru',
    breathingPattern: { inhale: 5, hold: 2, exhale: 5, pause: 1 },
    prerequisites: ['bali-ocean-reflection'],
    isUnlocked: false,
    unlockRequirement: 'Complete ocean-based practices'
  }
];

export const useCulturalRecommendations = () => {
  const { moodEntries } = useMoodTracker();
  const { progress } = useCulturalAchievements();

  // Mock user preferences - in real app would come from user settings/history
  const [userPreferences] = useState<UserPreferences>({
    favoriteRegions: ['sembalun', 'java'],
    preferredCategories: ['meditation', 'reflection'],
    preferredDurations: [15, 20],
    preferredTimeOfDay: ['morning', 'evening'],
    experienceLevel: 'intermediate',
    currentMoodPatterns: {
      stressed: 0.3,
      anxious: 0.2,
      sad: 0.1,
      angry: 0.05,
      neutral: 0.15,
      happy: 0.1,
      calm: 0.08,
      energized: 0.02
    },
    practiceHistory: ['sembalun-sunrise-meditation', 'sembalun-valley-winds'],
    culturalInterests: ['mountain meditation', 'traditional wisdom', 'spiritual growth']
  });

  // Get current time of day
  const getCurrentTimeOfDay = useCallback((): TimeOfDay => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  }, []);

  // Get user's recent mood state
  const getRecentMoodState = useCallback((): MoodState => {
    if (moodEntries.length === 0) return 'neutral';
    const recentEntry = moodEntries[moodEntries.length - 1];
    return recentEntry.mood as MoodState;
  }, [moodEntries]);

  // Calculate recommendation score
  const calculateRecommendationScore = useCallback((
    practice: CulturalPractice,
    currentMood: MoodState,
    currentTime: TimeOfDay
  ): RecommendationScore => {
    let score = 0;
    const reasoning = {
      moodMatch: 0,
      timeMatch: 0,
      difficultyMatch: 0,
      varietyBonus: 0,
      culturalProgression: 0,
      personalPreference: 0
    };

    // Mood matching (30% of score)
    if (practice.moodBenefits.includes(currentMood)) {
      reasoning.moodMatch = 30;
      score += 30;
    } else {
      // Partial points for related moods
      const moodSynergy = {
        stressed: ['anxious', 'sad'],
        anxious: ['stressed', 'sad'],
        sad: ['anxious', 'stressed'],
        angry: ['stressed', 'anxious'],
        neutral: ['calm', 'happy'],
        happy: ['energized', 'calm'],
        calm: ['happy', 'neutral'],
        energized: ['happy', 'neutral']
      };
      const relatedMoods = moodSynergy[currentMood] || [];
      const hasRelated = practice.moodBenefits.some(benefit => 
        relatedMoods.includes(benefit)
      );
      if (hasRelated) {
        reasoning.moodMatch = 15;
        score += 15;
      }
    }

    // Time of day matching (20% of score)
    if (practice.optimalTimeOfDay.includes(currentTime)) {
      reasoning.timeMatch = 20;
      score += 20;
    }

    // Difficulty matching (15% of score)
    const difficultyScore = {
      beginner: { beginner: 15, intermediate: 10, advanced: 5 },
      intermediate: { beginner: 5, intermediate: 15, advanced: 10 },
      advanced: { beginner: 2, intermediate: 8, advanced: 15 }
    };
    reasoning.difficultyMatch = difficultyScore[userPreferences.experienceLevel][practice.difficulty];
    score += reasoning.difficultyMatch;

    // Variety bonus (10% of score)
    if (!userPreferences.practiceHistory.includes(practice.id)) {
      reasoning.varietyBonus = 10;
      score += 10;
    }

    // Cultural progression (15% of score)
    const regionProgress = progress.regionsExplored.length;
    const isNewRegion = !progress.regionsExplored.includes(practice.region);
    if (isNewRegion && regionProgress >= 2) {
      reasoning.culturalProgression = 15;
      score += 15;
    } else if (progress.regionsExplored.includes(practice.region)) {
      reasoning.culturalProgression = 8;
      score += 8;
    }

    // Personal preference (10% of score)
    let preferenceScore = 0;
    if (userPreferences.favoriteRegions.includes(practice.region)) {
      preferenceScore += 5;
    }
    if (userPreferences.preferredCategories.includes(practice.category)) {
      preferenceScore += 3;
    }
    if (userPreferences.preferredDurations.some(dur => 
      Math.abs(dur - practice.duration) <= 5
    )) {
      preferenceScore += 2;
    }
    reasoning.personalPreference = preferenceScore;
    score += preferenceScore;

    return {
      score: Math.min(score, 100),
      reasoning
    };
  }, [userPreferences, progress]);

  // Determine recommendation category
  const getRecommendationCategory = useCallback((
    practice: CulturalPractice,
    score: RecommendationScore,
    currentMood: MoodState
  ): CulturalRecommendation['category'] => {
    if (score.reasoning.moodMatch >= 30 && score.reasoning.timeMatch >= 15) {
      return 'perfect-match';
    }
    if (score.reasoning.moodMatch >= 15 && ['stressed', 'anxious', 'sad'].includes(currentMood)) {
      return 'stress-relief';
    }
    if (score.reasoning.moodMatch >= 15) {
      return 'mood-booster';
    }
    if (score.reasoning.culturalProgression >= 10) {
      return 'cultural-growth';
    }
    return 'variety-exploration';
  }, []);

  // Generate recommendations
  const getRecommendations = useCallback((limit: number = 5): CulturalRecommendation[] => {
    const currentMood = getRecentMoodState();
    const currentTime = getCurrentTimeOfDay();

    // Filter unlocked practices
    const availablePractices = culturalPracticesDatabase.filter(practice => {
      if (practice.isUnlocked) return true;
      
      // Check if prerequisites are met
      if (practice.prerequisites) {
        return practice.prerequisites.every(prereq => 
          userPreferences.practiceHistory.includes(prereq)
        );
      }
      return false;
    });

    const recommendations: CulturalRecommendation[] = availablePractices.map(practice => {
      const score = calculateRecommendationScore(practice, currentMood, currentTime);
      const category = getRecommendationCategory(practice, score, currentMood);
      
      // Generate recommendation reason
      let reason = '';
      if (category === 'perfect-match') {
        reason = `Sempurna untuk suasana hati ${currentMood} dan waktu ${currentTime}`;
      } else if (category === 'stress-relief') {
        reason = `Dirancang khusus untuk meredakan ${currentMood === 'stressed' ? 'stres' : currentMood === 'anxious' ? 'kecemasan' : 'kesedihan'}`;
      } else if (category === 'mood-booster') {
        reason = `Dapat meningkatkan suasana hati dari ${currentMood}`;
      } else if (category === 'cultural-growth') {
        reason = `Memperluas eksplorasi budaya Indonesia`;
      } else {
        reason = `Memberikan variasi dalam praktik meditasi`;
      }

      // Determine urgency
      let urgency: CulturalRecommendation['urgency'] = 'low';
      if (score.score >= 80) urgency = 'high';
      else if (score.score >= 60) urgency = 'medium';

      return {
        practice,
        score,
        reason,
        category,
        urgency
      };
    });

    // Sort by score and return top recommendations
    return recommendations
      .sort((a, b) => b.score.score - a.score.score)
      .slice(0, limit);
  }, [
    getRecentMoodState,
    getCurrentTimeOfDay,
    calculateRecommendationScore,
    getRecommendationCategory,
    userPreferences.practiceHistory
  ]);

  // Get recommendations by category
  const getRecommendationsByCategory = useCallback((): Record<string, CulturalRecommendation[]> => {
    const allRecommendations = getRecommendations(12);
    
    const categorized = allRecommendations.reduce((acc, rec) => {
      if (!acc[rec.category]) {
        acc[rec.category] = [];
      }
      acc[rec.category].push(rec);
      return acc;
    }, {} as Record<string, CulturalRecommendation[]>);

    return categorized;
  }, [getRecommendations]);

  // Get recommendations for specific mood
  const getRecommendationsForMood = useCallback((mood: MoodState): CulturalRecommendation[] => {
    const currentTime = getCurrentTimeOfDay();
    
    const availablePractices = culturalPracticesDatabase.filter(practice => {
      return practice.isUnlocked && practice.moodBenefits.includes(mood);
    });

    return availablePractices.map(practice => {
      const score = calculateRecommendationScore(practice, mood, currentTime);
      const category = getRecommendationCategory(practice, score, mood);
      
      return {
        practice,
        score,
        reason: `Khusus dirancang untuk membantu dengan ${mood}`,
        category,
        urgency: score.score >= 70 ? 'high' : 'medium'
      };
    }).sort((a, b) => b.score.score - a.score.score);
  }, [getCurrentTimeOfDay, calculateRecommendationScore, getRecommendationCategory]);

  // Get next practices to unlock
  const getUpcomingUnlocks = useCallback((): Array<{
    practice: CulturalPractice;
    progress: number;
    nextSteps: string[];
  }> => {
    const lockedPractices = culturalPracticesDatabase.filter(p => !p.isUnlocked);
    
    return lockedPractices.map(practice => {
      let progress = 0;
      const nextSteps: string[] = [];

      if (practice.prerequisites) {
        const completedPrereqs = practice.prerequisites.filter(prereq =>
          userPreferences.practiceHistory.includes(prereq)
        );
        progress = (completedPrereqs.length / practice.prerequisites.length) * 100;
        
        const missingPrereqs = practice.prerequisites.filter(prereq =>
          !userPreferences.practiceHistory.includes(prereq)
        );
        
        missingPrereqs.forEach(prereq => {
          const prereqPractice = culturalPracticesDatabase.find(p => p.id === prereq);
          if (prereqPractice) {
            nextSteps.push(`Complete: ${prereqPractice.title}`);
          }
        });
      }

      if (practice.unlockRequirement) {
        nextSteps.push(practice.unlockRequirement);
      }

      return { practice, progress, nextSteps };
    }).filter(item => item.nextSteps.length > 0);
  }, [userPreferences.practiceHistory]);

  return {
    getRecommendations,
    getRecommendationsByCategory,
    getRecommendationsForMood,
    getUpcomingUnlocks,
    allPractices: culturalPracticesDatabase,
    userPreferences
  };
};