import type { Course } from '../components/ui/CourseCard';
import type { Session } from '../components/ui/SessionLibrary';
import type { UserProfile } from '../types/auth';

// Mock user data - in a real app this would come from a user context or API

export interface RecommendationScore {
  id: string;
  score: number;
  reasons: string[];
}

// Mock user profile - using generic placeholder
export const MOCK_USER: UserProfile = {
  uid: 'user-1',
  email: 'user@example.com',
  displayName: 'User',
  photoURL: null,
  createdAt: new Date(),
  lastLoginAt: new Date(),
  isGuest: false,
  preferences: {
    theme: 'auto',
    language: 'id',
    notifications: {
      daily: true,
      reminders: true,
      achievements: true,
      weeklyProgress: true,
      socialUpdates: false,
      push: true,
      email: false,
      sound: true,
      vibration: true,
    },
    privacy: {
      analytics: false,
      dataSharing: false,
      profileVisibility: 'private',
      shareProgress: false,
      locationTracking: false,
    },
    meditation: {
      defaultDuration: 10,
      preferredVoice: 'default',
      backgroundSounds: false,
      guidanceLevel: 'moderate',
      musicVolume: 50,
      voiceVolume: 70,
      autoAdvance: false,
      showTimer: true,
      preparationTime: 0,
      endingBell: true,
    },
    accessibility: {
      reducedMotion: false,
      highContrast: false,
      fontSize: 'medium',
      screenReader: false,
      keyboardNavigation: false,
    },
    display: {
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      weekStartsOn: 'monday',
      showStreaks: true,
      showStatistics: true,
    },
    downloadPreferences: {
      autoDownload: false,
      wifiOnly: true,
      storageLimit: 1,
    },
    favoriteCategories: ['Stres', 'Tidur'],
    difficulty: 'beginner',
    sessionDuration: 'short',
    timeOfDay: 'evening'
  },
  progress: {
    totalSessions: 10,
    totalMinutes: 45,
    streak: 3,
    longestStreak: 5,
    achievements: [],
    lastSessionDate: new Date(),
    favoriteCategories: ['Stres', 'Tidur'],
    completedPrograms: []
  },
  completedSessions: ['2', '5'],
  completedCourses: [],
  currentStreak: 3,
  totalMeditationMinutes: 45
};

export const getPersonalizedRecommendations = (
  courses: Course[],
  sessions: Session[],
  user: UserProfile = MOCK_USER
): {
  recommendedCourses: Course[];
  recommendedSessions: Session[];
  dailyRecommendation: Course | Session | null;
} => {
  // Score courses based on user preferences and behavior
  const scoreCourse = (course: Course): RecommendationScore => {
    let score = 0;
    const reasons: string[] = [];

    // Category preference match
    if (user.preferences.favoriteCategories?.includes(course.category)) {
      score += 30;
      reasons.push(`Cocok dengan minat ${course.category.toLowerCase()}`);
    }

    // Difficulty match (convert between Indonesian and English)
    const difficultyMap: { [key: string]: string } = {
      'Pemula': 'beginner',
      'Menengah': 'intermediate', 
      'Lanjutan': 'advanced'
    };
    const userDifficulty = difficultyMap[course.difficulty] || course.difficulty;
    if (userDifficulty === user.preferences.difficulty) {
      score += 20;
      reasons.push(`Sesuai tingkat ${course.difficulty}`);
    }

    // Progress-based scoring
    if (course.isStarted && course.progress > 0 && course.progress < 100) {
      score += 25;
      reasons.push('Lanjutkan progres kursus');
    }

    // Beginner boost for new users
    if ((user.totalMeditationMinutes || 0) < 60 && course.difficulty === 'Pemula') {
      score += 15;
      reasons.push('Cocok untuk pemula');
    }

    // Duration preference
    const courseDurationMinutes = parseInt(course.duration);
    if (user.preferences.sessionDuration === 'short' && courseDurationMinutes <= 10) {
      score += 10;
    } else if (user.preferences.sessionDuration === 'medium' && courseDurationMinutes <= 20) {
      score += 10;
    } else if (user.preferences.sessionDuration === 'long' && courseDurationMinutes > 20) {
      score += 10;
    }

    return { id: course.id, score, reasons };
  };

  // Score sessions based on user preferences and behavior
  const scoreSession = (session: Session): RecommendationScore => {
    let score = 0;
    const reasons: string[] = [];

    // Time of day recommendations
    const currentHour = new Date().getHours();
    if (currentHour >= 6 && currentHour <= 10 && session.category === 'Jeda Pagi') {
      score += 25;
      reasons.push('Cocok untuk pagi hari');
    } else if (currentHour >= 11 && currentHour <= 16 && session.category === 'Napas di Tengah Hiruk') {
      score += 25;
      reasons.push('Sempurna untuk istirahat siang');
    } else if (currentHour >= 17 && currentHour <= 21 && session.category === 'Pulang ke Diri') {
      score += 25;
      reasons.push('Ideal untuk sore hari');
    } else if (currentHour >= 21 || currentHour <= 5) {
      if (session.category === 'Tidur yang Dalam') {
        score += 30;
        reasons.push('Bantu persiapan tidur');
      }
    }

    // User preference category matching
    const sessionCategoryKeywords = session.category.toLowerCase();
    user.preferences.favoriteCategories?.forEach(category => {
      if (sessionCategoryKeywords.includes(category.toLowerCase())) {
        score += 20;
        reasons.push(`Sesuai minat ${category.toLowerCase()}`);
      }
    });

    // Difficulty match (convert between Indonesian and English)
    const sessionDifficultyMap: { [key: string]: string } = {
      'Pemula': 'beginner',
      'Menengah': 'intermediate', 
      'Lanjutan': 'advanced'
    };
    const sessionDifficulty = sessionDifficultyMap[session.difficulty] || session.difficulty;
    if (sessionDifficulty === user.preferences.difficulty) {
      score += 15;
      reasons.push(`Tingkat ${session.difficulty}`);
    }

    // Favorite sessions boost
    if (session.isFavorite) {
      score += 10;
      reasons.push('Sesi favorit');
    }

    // Avoid completed sessions (unless it's been a while)
    if (user.completedSessions?.includes(session.id)) {
      score -= 15;
    } else {
      score += 5;
      reasons.push('Belum pernah dicoba');
    }

    // Duration preference
    const sessionDurationMinutes = parseInt(session.duration);
    if (user.preferences.sessionDuration === 'short' && sessionDurationMinutes <= 5) {
      score += 10;
      reasons.push('Durasi pendek');
    } else if (user.preferences.sessionDuration === 'medium' && sessionDurationMinutes <= 15) {
      score += 10;
      reasons.push('Durasi sedang');
    } else if (user.preferences.sessionDuration === 'long' && sessionDurationMinutes > 15) {
      score += 10;
      reasons.push('Durasi panjang');
    }

    return { id: session.id, score, reasons };
  };

  // Generate recommendations
  const courseScores = courses.map(scoreCourse).sort((a, b) => b.score - a.score);
  const sessionScores = sessions.map(scoreSession).sort((a, b) => b.score - a.score);

  const recommendedCourses = courseScores
    .slice(0, 3)
    .map(score => courses.find(c => c.id === score.id)!)
    .filter(Boolean);

  const recommendedSessions = sessionScores
    .slice(0, 5)
    .map(score => sessions.find(s => s.id === score.id)!)
    .filter(Boolean);

  // Daily recommendation (top scoring item)
  const topCourseScore = courseScores[0];
  const topSessionScore = sessionScores[0];
  
  let dailyRecommendation: Course | Session | null = null;
  if (topCourseScore && topSessionScore) {
    if (topCourseScore.score > topSessionScore.score) {
      dailyRecommendation = courses.find(c => c.id === topCourseScore.id) || null;
    } else {
      dailyRecommendation = sessions.find(s => s.id === topSessionScore.id) || null;
    }
  } else if (topCourseScore) {
    dailyRecommendation = courses.find(c => c.id === topCourseScore.id) || null;
  } else if (topSessionScore) {
    dailyRecommendation = sessions.find(s => s.id === topSessionScore.id) || null;
  }

  return {
    recommendedCourses,
    recommendedSessions,
    dailyRecommendation
  };
};

export const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return 'Selamat pagi';
  } else if (hour >= 12 && hour < 17) {
    return 'Selamat siang';
  } else if (hour >= 17 && hour < 21) {
    return 'Selamat sore';
  } else {
    return 'Selamat malam';
  }
};

export const getTimeBasedRecommendation = (): string => {
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour < 10) {
    return 'Mulai hari dengan tenang ✨';
  } else if (hour >= 10 && hour < 12) {
    return 'Jeda sejenak untuk fokus 🎯';
  } else if (hour >= 12 && hour < 17) {
    return 'Reset energi di tengah hari 🌊';
  } else if (hour >= 17 && hour < 21) {
    return 'Waktunya pulang ke diri 🌸';
  } else {
    return 'Bersiap untuk tidur nyenyak 🌙';
  }
};