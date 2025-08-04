import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { ProfileSetupStep } from './ProfileSetupStep';
import { MeditationExperienceStep } from './MeditationExperienceStep';
import { GoalsSelectionStep } from './GoalsSelectionStep';
import { PreferencesSetupStep } from './PreferencesSetupStep';
import type { UserProfile, PersonalInfo, MeditationExperience, UserGoals, UserPreferences } from '../../types/auth';

type OnboardingStepData = 
  | Partial<PersonalInfo>
  | Partial<MeditationExperience>
  | Partial<UserGoals>
  | Partial<UserPreferences>;

interface OnboardingWizardProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ isOpen, onComplete }) => {
  const { updateUserProfile, userProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [onboardingData, setOnboardingData] = useState({
    personalInfo: {} as Partial<PersonalInfo>,
    meditationExperience: {} as Partial<MeditationExperience>,
    goals: {} as Partial<UserGoals>,
    preferences: {} as Partial<UserPreferences>
  });

  const totalSteps = 4;

  if (!isOpen || !userProfile) return null;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStepUpdate = (stepData: OnboardingStepData) => {
    switch (currentStep) {
      case 1:
        setOnboardingData(prev => ({ ...prev, personalInfo: stepData as Partial<PersonalInfo> }));
        break;
      case 2:
        setOnboardingData(prev => ({ ...prev, meditationExperience: stepData as Partial<MeditationExperience> }));
        break;
      case 3:
        setOnboardingData(prev => ({ ...prev, goals: stepData as Partial<UserGoals> }));
        break;
      case 4:
        setOnboardingData(prev => ({ ...prev, preferences: stepData as Partial<UserPreferences> }));
        break;
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setError('');

    try {
      const updatedProfile: Partial<UserProfile> = {
        personalInfo: {
          ...userProfile.personalInfo,
          ...onboardingData.personalInfo
        },
        meditationExperience: {
          level: 'beginner' as const,
          ...userProfile.meditationExperience,
          ...onboardingData.meditationExperience
        },
        goals: {
          primary: 'mindfulness' as const,
          ...userProfile.goals,
          ...onboardingData.goals
        },
        preferences: {
          ...userProfile.preferences,
          ...onboardingData.preferences,
          onboardingCompleted: true
        }
      };

      await updateUserProfile(updatedProfile);
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ProfileSetupStep
            initialData={onboardingData.personalInfo}
            onUpdate={handleStepUpdate}
          />
        );
      case 2:
        return (
          <MeditationExperienceStep
            initialData={onboardingData.meditationExperience}
            onUpdate={handleStepUpdate}
          />
        );
      case 3:
        return (
          <GoalsSelectionStep
            initialData={onboardingData.goals}
            onUpdate={handleStepUpdate}
          />
        );
      case 4:
        return (
          <PreferencesSetupStep
            initialData={onboardingData.preferences}
            onUpdate={handleStepUpdate}
          />
        );
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Tell us about yourself';
      case 2:
        return 'Your meditation experience';
      case 3:
        return 'Set your goals';
      case 4:
        return 'Customize your experience';
      default:
        return '';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return 'Help us personalize your experience by sharing some basic information';
      case 2:
        return 'Share your meditation background so we can recommend the right content';
      case 3:
        return 'What would you like to achieve through meditation?';
      case 4:
        return 'Set up your preferences for notifications and meditation settings';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-8 pb-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 font-heading">
                  Welcome to Sembalun
                </h1>
                <p className="text-gray-600">
                  Let's set up your personalized meditation experience
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
            <span className="text-sm text-gray-500 font-medium min-w-0">
              {currentStep} of {totalSteps}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {getStepTitle()}
            </h2>
            <p className="text-gray-600">
              {getStepDescription()}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="mb-8">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
            <div>
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={loading}
                >
                  Previous
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="secondary"
                onClick={onComplete}
                disabled={loading}
              >
                Skip for now
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                  disabled={loading}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Completing...
                    </>
                  ) : (
                    'Complete Setup'
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};