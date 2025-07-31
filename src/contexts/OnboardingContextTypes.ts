import { createContext } from 'react';
import { type OnboardingData } from '../pages/onboarding';

export interface OnboardingContextType {
  isOnboardingComplete: boolean;
  onboardingData: OnboardingData | null;
  completeOnboarding: (data: OnboardingData) => void;
  resetOnboarding: () => void;
}

export const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);