import type { UserProfile } from '../types/auth';

/**
 * Get a proper display name for the user, avoiding generic templates
 */
export const getUserDisplayName = (
  user: any | null, 
  userProfile: UserProfile | null, 
  isGuest: boolean = false
): string => {
  if (isGuest) {
    return 'Tamu'; // Indonesian for "Guest"
  }

  // Try to get the user's actual name from profile or auth
  const displayName = userProfile?.displayName || user?.displayName;
  
  if (displayName && displayName.trim()) {
    // Extract first name if full name is provided
    const firstName = displayName.split(' ')[0];
    return firstName;
  }

  // If no display name, try to use first part of email
  const email = userProfile?.email || user?.email;
  if (email) {
    const emailPrefix = email.split('@')[0];
    // Only use email prefix if it looks like a name (not just numbers or random chars)
    if (emailPrefix && /^[a-zA-Z]/.test(emailPrefix)) {
      return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
    }
  }

  // Last resort - use a generic but personal Indonesian greeting
  return 'Sahabat';
};

/**
 * Get a personalized greeting with user's name
 */
export const getPersonalizedGreeting = (
  user: any | null, 
  userProfile: UserProfile | null, 
  isGuest: boolean = false,
  useIndonesian: boolean = true
): string => {
  const userName = getUserDisplayName(user, userProfile, isGuest);
  const hour = new Date().getHours();
  
  if (useIndonesian) {
    let timeGreeting: string;
    if (hour >= 5 && hour < 11) {
      timeGreeting = 'Selamat pagi';
    } else if (hour >= 11 && hour < 15) {
      timeGreeting = 'Selamat siang';
    } else if (hour >= 15 && hour < 18) {
      timeGreeting = 'Selamat sore';
    } else {
      timeGreeting = 'Selamat malam';
    }
    
    return `${timeGreeting}, ${userName}`;
  } else {
    let timeGreeting: string;
    if (hour < 12) {
      timeGreeting = 'Good morning';
    } else if (hour < 17) {
      timeGreeting = 'Good afternoon';
    } else {
      timeGreeting = 'Good evening';
    }
    
    return `${timeGreeting}, ${userName}`;
  }
};

/**
 * Get user's preferred language for greetings
 */
export const getUserPreferredLanguage = (userProfile: UserProfile | null): 'en' | 'id' => {
  return userProfile?.preferences?.language || 'id';
};

/**
 * Get a contextual welcome message based on user's progress
 */
export const getContextualWelcomeMessage = (
  user: any | null,
  userProfile: UserProfile | null,
  isGuest: boolean = false
): string => {
  const language = getUserPreferredLanguage(userProfile);
  const userName = getUserDisplayName(user, userProfile, isGuest);
  
  if (isGuest) {
    return language === 'id' 
      ? 'Jelajahi Sembalun sebagai tamu. Daftar untuk menyimpan progres Anda!'
      : 'Explore Sembalun as a guest. Sign up to save your progress!';
  }

  const totalSessions = userProfile?.progress?.totalSessions || 0;
  const streak = userProfile?.progress?.streak || 0;
  
  if (totalSessions === 0) {
    return language === 'id'
      ? `Selamat datang di perjalanan mindfulness, ${userName}!`
      : `Welcome to your mindfulness journey, ${userName}!`;
  }
  
  if (streak > 0) {
    return language === 'id'
      ? `Streak ${streak} hari, ${userName}! Pertahankan semangat yang luar biasa.`
      : `${streak} day streak, ${userName}! Keep up the great work.`;
  }
  
  return language === 'id'
    ? `Siap untuk sesi berikutnya, ${userName}?`
    : `Ready for your next session, ${userName}?`;
};