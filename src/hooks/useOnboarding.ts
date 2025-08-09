import { useState, useEffect, useCallback } from 'react';

interface UserPreferences {
  culturalInterests: string[];
  experienceLevel: string;
  meditationGoals: string[];
  schedulePreferences: string[];
  preferredRegions: string[];
  sessionDuration: number;
  reminderEnabled: boolean;
  communitySharing: boolean;
}

interface OnboardingState {
  isCompleted: boolean;
  isSkipped: boolean;
  preferences: UserPreferences | null;
  showOnboarding: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  culturalInterests: [],
  experienceLevel: 'beginner',
  meditationGoals: [],
  schedulePreferences: ['morning'],
  preferredRegions: ['sembalun'],
  sessionDuration: 15,
  reminderEnabled: true,
  communitySharing: false
};

export const useOnboarding = () => {
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    isCompleted: false,
    isSkipped: false,
    preferences: null,
    showOnboarding: false
  });

  // Load onboarding state from localStorage on mount
  useEffect(() => {
    const loadOnboardingState = () => {
      try {
        const isCompleted = localStorage.getItem('sembalun-onboarding-completed') === 'true';
        const isSkipped = localStorage.getItem('sembalun-onboarding-skipped') === 'true';
        const preferencesData = localStorage.getItem('sembalun-user-preferences');
        
        let preferences: UserPreferences | null = null;
        if (preferencesData) {
          preferences = JSON.parse(preferencesData);
        }

        // Show onboarding if neither completed nor skipped
        const showOnboarding = !isCompleted && !isSkipped;

        setOnboardingState({
          isCompleted,
          isSkipped,
          preferences: preferences || (isCompleted ? DEFAULT_PREFERENCES : null),
          showOnboarding
        });
      } catch (error) {
        console.error('Error loading onboarding state:', error);
        // Reset to default state on error
        setOnboardingState({
          isCompleted: false,
          isSkipped: false,
          preferences: null,
          showOnboarding: true
        });
      }
    };

    loadOnboardingState();
  }, []);

  // Complete onboarding with preferences
  const completeOnboarding = useCallback((preferences: UserPreferences) => {
    try {
      localStorage.setItem('sembalun-onboarding-completed', 'true');
      localStorage.setItem('sembalun-user-preferences', JSON.stringify(preferences));
      localStorage.removeItem('sembalun-onboarding-skipped'); // Remove skip flag if exists
      
      setOnboardingState({
        isCompleted: true,
        isSkipped: false,
        preferences,
        showOnboarding: false
      });
    } catch (error) {
      console.error('Error saving onboarding completion:', error);
    }
  }, []);

  // Skip onboarding
  const skipOnboarding = useCallback(() => {
    try {
      localStorage.setItem('sembalun-onboarding-skipped', 'true');
      
      setOnboardingState(prev => ({
        ...prev,
        isSkipped: true,
        showOnboarding: false
      }));
    } catch (error) {
      console.error('Error saving onboarding skip:', error);
    }
  }, []);

  // Reset onboarding (force show again)
  const resetOnboarding = useCallback(() => {
    try {
      localStorage.removeItem('sembalun-onboarding-completed');
      localStorage.removeItem('sembalun-onboarding-skipped');
      localStorage.removeItem('sembalun-user-preferences');
      
      setOnboardingState({
        isCompleted: false,
        isSkipped: false,
        preferences: null,
        showOnboarding: true
      });
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  }, []);

  // Update user preferences
  const updatePreferences = useCallback((newPreferences: Partial<UserPreferences>) => {
    setOnboardingState(prev => {
      if (!prev.preferences) return prev;

      const updatedPreferences = { ...prev.preferences, ...newPreferences };
      
      try {
        localStorage.setItem('sembalun-user-preferences', JSON.stringify(updatedPreferences));
      } catch (error) {
        console.error('Error updating preferences:', error);
      }

      return {
        ...prev,
        preferences: updatedPreferences
      };
    });
  }, []);

  // Manually show onboarding (e.g., from settings)
  const showOnboardingModal = useCallback(() => {
    setOnboardingState(prev => ({
      ...prev,
      showOnboarding: true
    }));
  }, []);

  // Hide onboarding modal
  const hideOnboardingModal = useCallback(() => {
    setOnboardingState(prev => ({
      ...prev,
      showOnboarding: false
    }));
  }, []);

  // Get personalized recommendations based on preferences
  const getPersonalizedRecommendations = useCallback(() => {
    if (!onboardingState.preferences) {
      return {
        suggestedPractices: ['sembalun-sunrise-meditation'],
        suggestedDuration: 15,
        suggestedTimeOfDay: 'morning',
        personalizedMessage: 'Mulai dengan meditasi fajar Sembalun untuk memulai perjalanan spiritual Anda'
      };
    }

    const { experienceLevel, meditationGoals, preferredRegions, culturalInterests } = onboardingState.preferences;

    // Generate suggestions based on preferences
    const suggestedPractices = [];
    const suggestedDuration = experienceLevel === 'beginner' ? 10 : experienceLevel === 'intermediate' ? 20 : 30;
    
    // Add practices based on preferred regions
    if (preferredRegions.includes('sembalun')) {
      suggestedPractices.push('sembalun-sunrise-meditation');
    }
    if (preferredRegions.includes('java')) {
      suggestedPractices.push('java-court-meditation');
    }
    if (preferredRegions.includes('bali')) {
      suggestedPractices.push('bali-temple-harmony');
    }

    // Suggest time of day based on goals
    let suggestedTimeOfDay = 'morning'; // default
    if (meditationGoals.includes('better-sleep')) {
      suggestedTimeOfDay = 'evening';
    } else if (meditationGoals.includes('stress-relief')) {
      suggestedTimeOfDay = 'afternoon';
    }

    // Generate personalized message
    let personalizedMessage = 'Berdasarkan preferensi Anda, ';
    if (culturalInterests.includes('traditional-wisdom')) {
      personalizedMessage += 'kami merekomendasikan praktik dengan kebijaksanaan tradisional ';
    }
    if (preferredRegions.length > 0) {
      personalizedMessage += `dari wilayah ${preferredRegions[0]} `;
    }
    personalizedMessage += 'untuk memulai perjalanan spiritual Anda.';

    return {
      suggestedPractices: suggestedPractices.length > 0 ? suggestedPractices : ['sembalun-sunrise-meditation'],
      suggestedDuration,
      suggestedTimeOfDay,
      personalizedMessage
    };
  }, [onboardingState.preferences]);

  // Check if user should see welcome back message
  const shouldShowWelcomeBack = useCallback(() => {
    const lastSession = localStorage.getItem('sembalun-last-session');
    if (!lastSession) return false;

    const lastSessionDate = new Date(lastSession);
    const daysSinceLastSession = Math.floor((Date.now() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysSinceLastSession >= 7; // Show welcome back if more than 7 days
  }, []);

  // Get onboarding progress statistics
  const getOnboardingStats = useCallback(() => {
    if (!onboardingState.preferences) {
      return {
        completionDate: null,
        totalPreferences: 0,
        categoriesCompleted: 0
      };
    }

    const completionDate = localStorage.getItem('sembalun-onboarding-completed-date');
    const preferences = onboardingState.preferences;
    
    let categoriesCompleted = 0;
    if (preferences.culturalInterests.length > 0) categoriesCompleted++;
    if (preferences.experienceLevel) categoriesCompleted++;
    if (preferences.meditationGoals.length > 0) categoriesCompleted++;
    if (preferences.preferredRegions.length > 0) categoriesCompleted++;

    return {
      completionDate: completionDate ? new Date(completionDate) : null,
      totalPreferences: preferences.culturalInterests.length + 
                      preferences.meditationGoals.length + 
                      preferences.preferredRegions.length,
      categoriesCompleted
    };
  }, [onboardingState.preferences]);

  return {
    // State
    isOnboardingCompleted: onboardingState.isCompleted,
    isOnboardingSkipped: onboardingState.isSkipped,
    userPreferences: onboardingState.preferences,
    shouldShowOnboarding: onboardingState.showOnboarding,

    // Actions
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
    updatePreferences,
    showOnboardingModal,
    hideOnboardingModal,

    // Helpers
    getPersonalizedRecommendations,
    shouldShowWelcomeBack,
    getOnboardingStats
  };
};