import { useState, useEffect } from 'react';
import { SplashScreen } from './SplashScreen';
import { OnboardingSlides } from './OnboardingSlides';
import { PersonalizationScreen, type PersonalizationGoal } from './PersonalizationScreen';
import { WelcomeScreen } from './WelcomeScreen';

export type OnboardingStep = 'splash' | 'slides' | 'personalization' | 'welcome' | 'complete';

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
}

export interface OnboardingData {
  selectedGoal?: PersonalizationGoal;
  completedAt: Date;
  skippedSteps: OnboardingStep[];
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('splash');
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({
    skippedSteps: []
  });

  // Auto-advance from splash
  const handleSplashComplete = () => {
    setCurrentStep('slides');
  };

  // Handle slides completion
  const handleSlidesComplete = () => {
    setCurrentStep('personalization');
  };

  // Handle slides skip
  const handleSlidesSkip = () => {
    setOnboardingData(prev => ({
      ...prev,
      skippedSteps: [...(prev.skippedSteps || []), 'slides']
    }));
    setCurrentStep('personalization');
  };

  // Handle personalization completion
  const handlePersonalizationComplete = (goal: PersonalizationGoal) => {
    setOnboardingData(prev => ({
      ...prev,
      selectedGoal: goal
    }));
    setCurrentStep('welcome');
  };

  // Handle personalization skip
  const handlePersonalizationSkip = () => {
    setOnboardingData(prev => ({
      ...prev,
      skippedSteps: [...(prev.skippedSteps || []), 'personalization']
    }));
    setCurrentStep('welcome');
  };

  // Handle welcome completion
  const handleWelcomeComplete = () => {
    const finalData: OnboardingData = {
      selectedGoal: onboardingData.selectedGoal,
      completedAt: new Date(),
      skippedSteps: onboardingData.skippedSteps || []
    };
    
    onComplete(finalData);
  };

  // Prevent back navigation during onboarding
  useEffect(() => {
    const handleBackButton = (e: PopStateEvent) => {
      e.preventDefault();
      // Optionally handle back button behavior for each step
      if (currentStep === 'slides') {
        // Allow going back to splash, but typically we don't want this
        return;
      }
      // For other steps, prevent default back behavior
    };

    window.addEventListener('popstate', handleBackButton);
    return () => window.removeEventListener('popstate', handleBackButton);
  }, [currentStep]);

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'splash':
        return (
          <SplashScreen 
            onComplete={handleSplashComplete}
            duration={2500}
          />
        );

      case 'slides':
        return (
          <OnboardingSlides 
            onComplete={handleSlidesComplete}
            onSkip={handleSlidesSkip}
          />
        );

      case 'personalization':
        return (
          <PersonalizationScreen 
            onComplete={handlePersonalizationComplete}
            onSkip={handlePersonalizationSkip}
          />
        );

      case 'welcome':
        return (
          <WelcomeScreen 
            onComplete={handleWelcomeComplete}
            selectedGoal={onboardingData.selectedGoal}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="onboarding-flow">
      {renderCurrentStep()}
    </div>
  );
};