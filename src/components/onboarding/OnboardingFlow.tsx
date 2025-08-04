import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { ProfileForm } from '../account/ProfileForm';
import { MeditationExperienceForm } from '../account/MeditationExperienceForm';
import { GoalSettingForm } from '../account/GoalSettingForm';
import { EmotionalIntelligenceAssessment } from './EmotionalIntelligenceAssessment';
import { MeditationScheduleForm } from './MeditationScheduleForm';

interface OnboardingFlowProps {
  onComplete: () => void;
}

type OnboardingStep = 
  | 'welcome'
  | 'profile'
  | 'experience'
  | 'goals'
  | 'assessment'
  | 'schedule'
  | 'complete';

const STEP_TITLES = {
  welcome: 'Welcome to Sembalun',
  profile: 'Tell us about yourself',
  experience: 'Your meditation journey',
  goals: 'Set your intentions',
  assessment: 'Emotional intelligence check-in',
  schedule: 'Create your practice routine',
  complete: 'You\'re all set!'
};

const STEP_DESCRIPTIONS = {
  welcome: 'Let\'s personalize your mindfulness journey',
  profile: 'Basic information to customize your experience',
  experience: 'Help us understand your meditation background',
  goals: 'Define what you want to achieve',
  assessment: 'Understand your current emotional state',
  schedule: 'Plan your meditation routine',
  complete: 'Your personalized meditation journey begins now'
};

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const { userProfile, updateUserProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [progress, setProgress] = useState(0);

  const steps: OnboardingStep[] = useMemo(() => ['welcome', 'profile', 'experience', 'goals', 'assessment', 'schedule', 'complete'], []);

  useEffect(() => {
    const stepIndex = steps.indexOf(currentStep);
    setProgress((stepIndex / (steps.length - 1)) * 100);
  }, [currentStep, steps]);

  const nextStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleStepComplete = () => {
    if (currentStep === 'complete') {
      // Mark onboarding as completed
      updateUserProfile({
        preferences: {
          theme: 'auto' as const,
          language: 'id' as const,
          notifications: {
            daily: true,
            reminders: true,
            achievements: true,
            weeklyProgress: true,
            socialUpdates: false,
            push: true,
            email: true,
            sound: true,
            vibration: true,
          },
          privacy: {
            analytics: true,
            dataSharing: false,
            profileVisibility: 'private' as const,
            shareProgress: false,
            locationTracking: false,
          },
          meditation: {
            defaultDuration: 10,
            preferredVoice: 'default',
            backgroundSounds: true,
            guidanceLevel: 'moderate' as const,
            musicVolume: 70,
            voiceVolume: 80,
            autoAdvance: false,
            showTimer: true,
            preparationTime: 5,
            endingBell: true,
          },
          accessibility: {
            reducedMotion: false,
            highContrast: false,
            fontSize: 'medium' as const,
            screenReader: false,
            keyboardNavigation: false,
          },
          display: {
            dateFormat: 'DD/MM/YYYY' as const,
            timeFormat: '24h' as const,
            weekStartsOn: 'monday' as const,
            showStreaks: true,
            showStatistics: true,
          },
          downloadPreferences: {
            autoDownload: false,
            wifiOnly: true,
            storageLimit: 2, // 2GB default
          },
          ...userProfile?.preferences,
          onboardingCompleted: true,
        }
      });
      onComplete();
    } else {
      nextStep();
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <div className="text-center max-w-2xl mx-auto">
            <div className="mb-8">
              <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 font-heading mb-4">
                Welcome to Sembalun
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Your journey to inner peace and mindfulness starts here. Let's take a few minutes to personalize your experience.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl border border-gray-200">
                <div className="text-3xl mb-3">🧘‍♀️</div>
                <h3 className="font-semibold text-gray-900 mb-2">Personalized Practice</h3>
                <p className="text-sm text-gray-600">Customized meditation sessions based on your experience and goals</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-200">
                <div className="text-3xl mb-3">📈</div>
                <h3 className="font-semibold text-gray-900 mb-2">Track Progress</h3>
                <p className="text-sm text-gray-600">Monitor your journey with detailed insights and achievements</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-200">
                <div className="text-3xl mb-3">⏰</div>
                <h3 className="font-semibold text-gray-900 mb-2">Smart Reminders</h3>
                <p className="text-sm text-gray-600">Gentle nudges to maintain your practice routine</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-200">
                <div className="text-3xl mb-3">🌱</div>
                <h3 className="font-semibold text-gray-900 mb-2">Grow Together</h3>
                <p className="text-sm text-gray-600">Join a supportive community on the path to mindfulness</p>
              </div>
            </div>

            <Button onClick={nextStep} className="px-8 py-3">
              Let's Get Started
            </Button>
          </div>
        );

      case 'profile':
        return <ProfileForm onSuccess={handleStepComplete} />;

      case 'experience':
        return <MeditationExperienceForm onSuccess={handleStepComplete} />;

      case 'goals':
        return <GoalSettingForm onSuccess={handleStepComplete} />;

      case 'assessment':
        return <EmotionalIntelligenceAssessment onComplete={handleStepComplete} />;

      case 'schedule':
        return <MeditationScheduleForm onSuccess={handleStepComplete} />;

      case 'complete':
        return (
          <div className="text-center max-w-2xl mx-auto">
            <div className="mb-8">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 font-heading mb-4">
                You're All Set!
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Your personalized meditation journey is ready. Based on your responses, we've customized everything just for you.
              </p>
            </div>

            <div className="bg-primary/5 rounded-2xl p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Your Personalized Plan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">🎯</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Primary Goal</p>
                    <p className="text-xs text-gray-600">{userProfile?.goals?.primary || 'Stress reduction'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">⏱️</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Session Length</p>
                    <p className="text-xs text-gray-600">{userProfile?.schedule?.duration || 10} minutes</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">📅</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Frequency</p>
                    <p className="text-xs text-gray-600">{userProfile?.schedule?.frequency || 5} times per week</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">🎓</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Experience Level</p>
                    <p className="text-xs text-gray-600">{userProfile?.meditationExperience?.level || 'Beginner'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button onClick={handleStepComplete} className="px-8 py-3">
                Start My Journey
              </Button>
              <p className="text-sm text-gray-500 mt-4">
                You can always update your preferences in settings
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (currentStep === 'welcome' || currentStep === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {renderStepContent()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {STEP_TITLES[currentStep]}
              </h1>
              <p className="text-sm text-gray-600">
                {STEP_DESCRIPTIONS[currentStep]}
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-500">
                Step {steps.indexOf(currentStep)} of {steps.length - 2}
              </p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto py-8">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      {(currentStep as OnboardingStep) !== 'welcome' && (currentStep as OnboardingStep) !== 'complete' && (
        <div className="bg-white border-t border-gray-200 sticky bottom-0">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 'profile'}
              >
                Back
              </Button>
              
              <Button
                variant="outline"
                onClick={nextStep}
              >
                Skip for now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};