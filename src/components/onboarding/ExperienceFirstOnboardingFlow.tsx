import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedOnboardingStrategy, type OnboardingStep, type OnboardingStrategy } from './EnhancedOnboardingStrategy';
import { usePersonalization } from '../../contexts/PersonalizationContext';
import type { CulturalData } from './CulturalPersonalizationScreen';
import type { MoodType } from '../../types/mood';
import type { PersonalizationGoal } from '../../types/onboarding';

interface StepData {
  cultural?: CulturalData;
  experienceRating?: number;
  moodBefore?: MoodType;
  moodAfter?: MoodType;
  goal?: PersonalizationGoal;
  progressSaved?: boolean;
  socialProofSeen?: boolean;
  authenticatedUser?: boolean;
}

interface ExperienceFirstOnboardingFlowProps {
  onComplete: (data: OnboardingCompletionData) => void;
  onClose?: () => void;
  culturalHints?: Partial<CulturalData>;
}

export interface OnboardingCompletionData {
  strategy: OnboardingStrategy;
  completedSteps: OnboardingStep[];
  stepData: StepData;
  conversionMetrics: {
    culturalRelevance: number;
    experienceCompletion: number;
    moodImprovement: number;
    valuePerceived: number;
    conversionReadiness: number;
  };
  completedAt: Date;
  totalTimeSpent: number;
}

export const ExperienceFirstOnboardingFlow: React.FC<ExperienceFirstOnboardingFlowProps> = ({
  onComplete,
  onClose,
  culturalHints
}) => {
  const { updateFromOnboarding } = usePersonalization();
  
  const [completedSteps, setCompletedSteps] = useState<OnboardingStep[]>([]);
  const [stepData, setStepData] = useState<StepData>({});
  const [startTime] = useState<number>(Date.now());
  const [isCompleting, setIsCompleting] = useState(false);

  // Handle step completion
  const handleStepComplete = useCallback((step: OnboardingStep, data: StepData) => {
    console.log(`Step ${step} completed with data:`, data);
    
    setCompletedSteps(prev => [...prev, step]);
    setStepData(prev => ({ ...prev, ...data }));

    // Track step completion in analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'onboarding_step_complete', {
        step_name: step,
        step_number: completedSteps.length + 1,
        cultural_data: data.cultural ? 'provided' : 'not_provided',
        experience_rating: data.experienceRating || 'not_provided',
        mood_improvement: data.moodBefore && data.moodAfter ? 'tracked' : 'not_tracked'
      });
    }
  }, [completedSteps.length]);

  // Handle flow completion
  const handleFlowComplete = useCallback((finalData: StepData & { strategy: OnboardingStrategy }) => {
    if (isCompleting) return; // Prevent double completion
    
    setIsCompleting(true);
    
    const totalTimeSpent = (Date.now() - startTime) / 1000; // in seconds
    
    // Calculate conversion metrics
    const culturalRelevance = finalData.cultural ? 85 : 0;
    const experienceCompletion = finalData.experienceRating ? finalData.experienceRating * 20 : 0;
    
    let moodImprovement = 0;
    if (finalData.moodBefore && finalData.moodAfter) {
      const moodValues = {
        'very-sad': 1, 'sad': 2, 'neutral': 3, 'happy': 4, 'very-happy': 5,
        'anxious': 1.5, 'calm': 4.5, 'energetic': 4.2, 'angry': 1.8
      };
      const before = moodValues[finalData.moodBefore] || 3;
      const after = moodValues[finalData.moodAfter] || 3;
      moodImprovement = Math.max(0, ((after - before) / before) * 100);
    }

    const valuePerceived = Math.min(100, 
      (culturalRelevance * 0.3) + 
      (experienceCompletion * 0.4) + 
      (moodImprovement * 0.3)
    );

    const conversionReadiness = Math.min(100,
      valuePerceived * 0.7 + 
      (completedSteps.length / 5) * 100 * 0.3
    );

    const completionData: OnboardingCompletionData = {
      strategy: finalData.strategy,
      completedSteps: [...completedSteps, 'complete' as OnboardingStep],
      stepData: finalData,
      conversionMetrics: {
        culturalRelevance,
        experienceCompletion,
        moodImprovement,
        valuePerceived,
        conversionReadiness
      },
      completedAt: new Date(),
      totalTimeSpent
    };

    // Update PersonalizationContext if user saved progress
    if (finalData.progressSaved && finalData.cultural && finalData.goal) {
      updateFromOnboarding({
        selectedGoal: finalData.goal,
        selectedMood: finalData.moodAfter,
        culturalData: finalData.cultural,
        completedAt: new Date(),
        skippedSteps: [],
        totalSteps: 5,
        completedSteps: completedSteps.length + 1
      });
    }

    // Track completion analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'onboarding_complete', {
        strategy: finalData.strategy,
        steps_completed: completedSteps.length,
        user_authenticated: finalData.authenticatedUser,
        progress_saved: finalData.progressSaved,
        time_spent_seconds: totalTimeSpent,
        conversion_readiness: conversionReadiness,
        cultural_relevance: culturalRelevance,
        experience_completion: experienceCompletion,
        mood_improvement: moodImprovement
      });
    }

    // Store completion data in localStorage for analytics
    try {
      const onboardingAnalytics = {
        completedAt: new Date().toISOString(),
        strategy: finalData.strategy,
        metrics: completionData.conversionMetrics,
        timeSpent: totalTimeSpent,
        userFlow: completedSteps
      };
      
      localStorage.setItem('sembalun_onboarding_analytics', JSON.stringify(onboardingAnalytics));
    } catch (error) {
      console.warn('Failed to store onboarding analytics:', error);
    }

    // Call completion handler
    onComplete(completionData);
  }, [completedSteps, startTime, isCompleting, updateFromOnboarding, onComplete]);

  return (
    <div className="experience-first-onboarding min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-meditation-zen-50">
      {/* Close button for development/testing */}
      {onClose && process.env.NODE_ENV === 'development' && (
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-50 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
          title="Close onboarding (dev only)"
        >
          <span className="text-lg">✕</span>
        </button>
      )}

      {/* Main onboarding flow */}
      <AnimatePresence mode="wait">
        {!isCompleting && (
          <motion.div
            key="onboarding-strategy"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6 }}
          >
            <EnhancedOnboardingStrategy
              onStepComplete={handleStepComplete}
              onFlowComplete={handleFlowComplete}
              culturalHints={culturalHints}
              initialStep="cultural"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion animation */}
      <AnimatePresence>
        {isCompleting && (
          <motion.div
            key="completion-animation"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-white/95 backdrop-blur-sm"
          >
            <div className="text-center">
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                }}
                className="w-20 h-20 mx-auto mb-6"
              >
                <div className="w-full h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl text-white">✨</span>
                </div>
              </motion.div>
              
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-2xl font-heading font-bold text-gray-800 mb-2"
              >
                Selamat! Perjalanan Dimulai 🎉
              </motion.h2>
              
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-gray-600"
              >
                Menyiapkan pengalaman meditasi yang dipersonalisasi untuk Anda...
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExperienceFirstOnboardingFlow;