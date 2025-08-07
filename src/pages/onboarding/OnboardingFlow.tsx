import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SplashScreen } from './SplashScreen';
import { OnboardingSlides } from './OnboardingSlides';
import { PersonalizationScreen, type PersonalizationGoal } from './PersonalizationScreen';
import { WelcomeScreen } from './WelcomeScreen';
import { CulturalPersonalizationScreen, type CulturalData } from '../../components/onboarding/CulturalPersonalizationScreen';
import ExperienceFirstOnboardingFlow, { type OnboardingCompletionData } from '../../components/onboarding/ExperienceFirstOnboardingFlow';
import { CairnIcon } from '../../components/ui';
import type { MoodType } from '../../types/mood';

export type OnboardingStep = 'splash' | 'slides' | 'cultural' | 'personalization' | 'welcome' | 'complete';
export type OnboardingFlowType = 'traditional' | 'experience-first';

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
  flowType?: OnboardingFlowType;
  culturalHints?: Partial<CulturalData>;
}

export interface OnboardingData {
  selectedGoal?: PersonalizationGoal;
  selectedMood?: MoodType;
  culturalData?: CulturalData;
  completedAt: Date;
  skippedSteps: OnboardingStep[];
  totalSteps: number;
  completedSteps: number;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ 
  onComplete, 
  flowType = 'experience-first', // Default to experience-first for better conversion
  culturalHints 
}) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('splash');
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({
    skippedSteps: [],
    totalSteps: 5,
    completedSteps: 0
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [useExperienceFirst, setUseExperienceFirst] = useState(flowType === 'experience-first');
  
  // Step configuration for progress tracking
  const stepConfig = {
    splash: { order: 0, title: 'Selamat Datang', duration: 2500, showInProgress: false },
    slides: { order: 1, title: 'Pengenalan', duration: null, showInProgress: true },
    cultural: { order: 2, title: 'Budaya', duration: null, showInProgress: true },
    personalization: { order: 3, title: 'Personalisasi', duration: null, showInProgress: true },
    welcome: { order: 4, title: 'Siap Memulai', duration: null, showInProgress: true }
  };

  // Total visible steps (excluding splash)
  const totalVisibleSteps = Object.values(stepConfig).filter(step => step.showInProgress).length;

  // Calculate progress percentage
  const getProgressPercentage = () => {
    const config = stepConfig[currentStep];
    if (!config?.showInProgress) return 0;
    return (config.order / totalVisibleSteps) * 100;
  };

  // Get current step number for display
  const getCurrentStepNumber = () => {
    const config = stepConfig[currentStep];
    return config?.showInProgress ? config.order : 0;
  };

  // Transition helper with animation state
  const transitionToStep = (nextStep: OnboardingStep, delay = 300) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(nextStep);
      setOnboardingData(prev => ({
        ...prev,
        completedSteps: stepConfig[nextStep]?.order || prev.completedSteps
      }));
      setIsTransitioning(false);
    }, delay);
  };

  // Auto-advance from splash
  const handleSplashComplete = () => {
    transitionToStep('slides');
  };

  // Handle slides completion
  const handleSlidesComplete = () => {
    transitionToStep('cultural');
  };

  // Handle slides skip
  const handleSlidesSkip = () => {
    setOnboardingData(prev => ({
      ...prev,
      skippedSteps: [...(prev.skippedSteps || []), 'slides']
    }));
    transitionToStep('cultural');
  };

  // Handle cultural completion
  const handleCulturalComplete = (culturalData: CulturalData) => {
    setOnboardingData(prev => ({
      ...prev,
      culturalData
    }));
    transitionToStep('personalization');
  };

  // Handle cultural skip
  const handleCulturalSkip = () => {
    setOnboardingData(prev => ({
      ...prev,
      skippedSteps: [...(prev.skippedSteps || []), 'cultural']
    }));
    transitionToStep('personalization');
  };

  // Handle personalization completion
  const handlePersonalizationComplete = (goal: PersonalizationGoal, mood?: MoodType) => {
    setOnboardingData(prev => ({
      ...prev,
      selectedGoal: goal,
      selectedMood: mood
    }));
    transitionToStep('welcome');
  };

  // Handle personalization skip
  const handlePersonalizationSkip = () => {
    setOnboardingData(prev => ({
      ...prev,
      skippedSteps: [...(prev.skippedSteps || []), 'personalization']
    }));
    transitionToStep('welcome');
  };

  // Handle welcome completion
  const handleWelcomeComplete = () => {
    const finalData: OnboardingData = {
      selectedGoal: onboardingData.selectedGoal,
      selectedMood: onboardingData.selectedMood,
      culturalData: onboardingData.culturalData,
      completedAt: new Date(),
      skippedSteps: onboardingData.skippedSteps || [],
      totalSteps: onboardingData.totalSteps || 5,
      completedSteps: 5
    };
    
    onComplete(finalData);
  };

  // Handle experience-first flow completion
  const handleExperienceFirstComplete = (completionData: OnboardingCompletionData) => {
    // Convert to traditional OnboardingData format
    const finalData: OnboardingData = {
      selectedGoal: completionData.stepData.goal,
      selectedMood: completionData.stepData.moodAfter,
      culturalData: completionData.stepData.cultural,
      completedAt: completionData.completedAt,
      skippedSteps: [], // Experience-first flow has built-in skip logic
      totalSteps: 5,
      completedSteps: completionData.completedSteps.length
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

  // Progress indicator component
  const ProgressIndicator = () => (
    <motion.div 
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: currentStep !== 'splash' ? 1 : 0, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-sm mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <CairnIcon size={20} progress={getProgressPercentage()} className="text-primary-600" />
            <span className="text-xs font-medium text-gray-600">
              {stepConfig[currentStep]?.title}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {getCurrentStepNumber()}/{totalVisibleSteps}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${getProgressPercentage()}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );

  // Render current step with enhanced animations
  const renderCurrentStep = () => {
    const stepVariants = {
      initial: { opacity: 0, x: 50, scale: 0.95 },
      animate: { 
        opacity: isTransitioning ? 0.3 : 1, 
        x: 0, 
        scale: 1,
        transition: {
          duration: 0.6,
          ease: "easeOut"
        }
      },
      exit: { 
        opacity: 0, 
        x: -50, 
        scale: 0.95,
        transition: {
          duration: 0.4,
          ease: "easeIn"
        }
      }
    };

    switch (currentStep) {
      case 'splash':
        return (
          <motion.div
            key="splash"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <SplashScreen 
              onComplete={handleSplashComplete}
              duration={stepConfig.splash.duration}
            />
          </motion.div>
        );

      case 'slides':
        return (
          <motion.div
            key="slides"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <OnboardingSlides 
              onComplete={handleSlidesComplete}
              onSkip={handleSlidesSkip}
            />
          </motion.div>
        );

      case 'cultural':
        return (
          <motion.div
            key="cultural"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <CulturalPersonalizationScreen 
              onComplete={handleCulturalComplete}
              onSkip={handleCulturalSkip}
            />
          </motion.div>
        );

      case 'personalization':
        return (
          <motion.div
            key="personalization"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <PersonalizationScreen 
              onComplete={handlePersonalizationComplete}
              onSkip={handlePersonalizationSkip}
            />
          </motion.div>
        );

      case 'welcome':
        return (
          <motion.div
            key="welcome"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <WelcomeScreen 
              onComplete={handleWelcomeComplete}
              selectedGoal={onboardingData.selectedGoal}
            />
          </motion.div>
        );

      default:
        return null;
    }
  };

  // Render experience-first flow if selected
  if (useExperienceFirst) {
    return (
      <ExperienceFirstOnboardingFlow
        onComplete={handleExperienceFirstComplete}
        culturalHints={culturalHints}
      />
    );
  }

  // Traditional onboarding flow
  return (
    <div className="onboarding-flow relative min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-meditation-zen-50">
      {/* Flow Switch Toggle (for development/testing) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={() => setUseExperienceFirst(!useExperienceFirst)}
            className="bg-white rounded-lg px-3 py-2 text-xs shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            title="Switch onboarding flow"
          >
            {useExperienceFirst ? '📊 Experience-First' : '📋 Traditional'}
          </button>
        </div>
      )}

      {/* Progress Indicator */}
      <ProgressIndicator />
      
      {/* Transition Overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-primary-600 z-40 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {renderCurrentStep()}
      </AnimatePresence>

      {/* Loading State */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <CairnIcon size={24} className="text-primary-600" />
                </motion.div>
                <span className="font-medium text-gray-700 text-sm">
                  Menyiapkan langkah selanjutnya...
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};