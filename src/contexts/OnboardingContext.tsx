import { useState, useEffect, type ReactNode } from 'react';
import { type OnboardingData } from '../pages/onboarding';
import { OnboardingContext, type OnboardingContextType } from './OnboardingContextTypes';

interface OnboardingProviderProps {
  children: ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const ONBOARDING_STORAGE_KEY = 'sembalun_onboarding';
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load onboarding state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      
      if (import.meta.env?.DEV) {
        console.log('Onboarding: Checking localStorage for saved data:', saved);
      }
      
      if (saved) {
        const data = JSON.parse(saved) as OnboardingData;
        if (import.meta.env?.DEV) {
          console.log('Onboarding: Found saved data, setting as complete:', data);
        }
        setOnboardingData(data);
        setIsOnboardingComplete(true);
      } else {
        if (import.meta.env?.DEV) {
          console.log('Onboarding: No saved data found, should show onboarding');
        }
        setIsOnboardingComplete(false);
      }
    } catch (error) {
      console.warn('Failed to load onboarding data:', error);
      setIsOnboardingComplete(false);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const completeOnboarding = (data: OnboardingData) => {
    setOnboardingData(data);
    setIsOnboardingComplete(true);
    
    // Save to localStorage
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save onboarding data:', error);
    }
  };

  const resetOnboarding = () => {
    setOnboardingData(null);
    setIsOnboardingComplete(false);
    
    // Clear from localStorage
    try {
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear onboarding data:', error);
    }
  };

  const value: OnboardingContextType = {
    isOnboardingComplete,
    onboardingData,
    completeOnboarding,
    resetOnboarding
  };

  // Show loading state while checking onboarding status
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="text-center">
          <div className="flex justify-center space-x-1 mb-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full animate-pulse"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  animationDelay: `${i * 0.2}s`,
                  opacity: 0.6
                }}
              />
            ))}
          </div>
          <p className="text-gray-600 font-body text-sm">Memuat Sembalun...</p>
        </div>
      </div>
    );
  }

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

