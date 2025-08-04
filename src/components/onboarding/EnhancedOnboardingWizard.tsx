import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { ProfileSetupStep } from './ProfileSetupStep';
import { MeditationExperienceStep } from './MeditationExperienceStep';
import { SIYAssessmentStep, type SIYAssessment } from './SIYAssessmentStep';
import { GoalsSelectionStep } from './GoalsSelectionStep';
import { PreferencesSetupStep } from './PreferencesSetupStep';
import type { UserProfile, PersonalInfo, MeditationExperience, UserGoals, UserPreferences } from '../../types/auth';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  focusArea: string;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  duration: string;
  modules: LearningModule[];
  primarySkills: string[];
  learningStyle: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
}

type OnboardingStepData = 
  | Partial<PersonalInfo>
  | Partial<MeditationExperience>
  | Partial<SIYAssessment>
  | Partial<UserGoals>
  | Partial<UserPreferences>;

interface EnhancedOnboardingData {
  personalInfo: Partial<PersonalInfo>;
  meditationExperience: Partial<MeditationExperience>;
  siyAssessment: Partial<SIYAssessment>;
  goals: Partial<UserGoals>;
  preferences: Partial<UserPreferences>;
  recommendedPath?: LearningPath;
}

interface EnhancedOnboardingWizardProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const EnhancedOnboardingWizard: React.FC<EnhancedOnboardingWizardProps> = ({ 
  isOpen, 
  onComplete 
}) => {
  const { updateUserProfile, userProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [onboardingData, setOnboardingData] = useState<EnhancedOnboardingData>({
    personalInfo: {},
    meditationExperience: {},
    siyAssessment: {},
    goals: {},
    preferences: {}
  });

  const totalSteps = 6; // Profile, Experience, SIY Assessment, Goals, Preferences, Learning Path

  if (!isOpen || !userProfile) return null;

  const generateLearningPath = (data: EnhancedOnboardingData): LearningPath => {
    const { siyAssessment, goals, meditationExperience } = data;
    
    // Determine difficulty level based on meditation experience
    let difficultyLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
    if (meditationExperience.level === 'intermediate') difficultyLevel = 'intermediate';
    if (meditationExperience.level === 'advanced') difficultyLevel = 'advanced';

    // Create modules based on SIY assessment focus areas
    const focusAreas = siyAssessment.primaryFocusAreas || ['Self-Awareness', 'Self-Regulation'];
    const primaryGoal = goals.primary || 'stress-reduction';
    const learningStyle = siyAssessment.learningStyle || 'mixed';

    const modulesByFocusArea: Record<string, LearningModule[]> = {
      'Self-Awareness': [
        {
          id: 'sa1',
          title: 'Mindful Awareness Foundation',
          description: 'Develop basic mindfulness skills and emotional recognition',
          estimatedTime: '2 weeks',
          focusArea: 'Self-Awareness'
        },
        {
          id: 'sa2',
          title: 'Body Awareness Practice',
          description: 'Learn to notice physical sensations and body-mind connection',
          estimatedTime: '2 weeks',
          focusArea: 'Self-Awareness'
        },
        {
          id: 'sa3',
          title: 'Values and Triggers Exploration',
          description: 'Identify personal values and emotional triggers',
          estimatedTime: '3 weeks',
          focusArea: 'Self-Awareness'
        }
      ],
      'Self-Regulation': [
        {
          id: 'sr1',
          title: 'Emotional Regulation Techniques',
          description: 'Master techniques for managing difficult emotions',
          estimatedTime: '3 weeks',
          focusArea: 'Self-Regulation'
        },
        {
          id: 'sr2',
          title: 'Stress Management Toolkit',
          description: 'Build a comprehensive stress management practice',
          estimatedTime: '2 weeks',
          focusArea: 'Self-Regulation'
        },
        {
          id: 'sr3',
          title: 'Adaptive Responses',
          description: 'Develop flexibility and resilience in challenging situations',
          estimatedTime: '3 weeks',
          focusArea: 'Self-Regulation'
        }
      ],
      'Motivation': [
        {
          id: 'm1',
          title: 'Inner Drive Discovery',
          description: 'Connect with your intrinsic motivation and purpose',
          estimatedTime: '2 weeks',
          focusArea: 'Motivation'
        },
        {
          id: 'm2',
          title: 'Resilience Building',
          description: 'Strengthen your ability to bounce back from setbacks',
          estimatedTime: '3 weeks',
          focusArea: 'Motivation'
        },
        {
          id: 'm3',
          title: 'Optimistic Mindset',
          description: 'Cultivate positive outlook and growth mindset',
          estimatedTime: '2 weeks',
          focusArea: 'Motivation'
        }
      ],
      'Empathy': [
        {
          id: 'e1',
          title: 'Perspective Taking Practice',
          description: 'Develop ability to understand others\' viewpoints',
          estimatedTime: '2 weeks',
          focusArea: 'Empathy'
        },
        {
          id: 'e2',
          title: 'Compassion Cultivation',
          description: 'Build loving-kindness and self-compassion practices',
          estimatedTime: '3 weeks',
          focusArea: 'Empathy'
        },
        {
          id: 'e3',
          title: 'Social Awareness Skills',
          description: 'Enhance ability to read social situations and emotions',
          estimatedTime: '2 weeks',
          focusArea: 'Empathy'
        }
      ],
      'Social Skills': [
        {
          id: 'ss1',
          title: 'Mindful Communication',
          description: 'Practice conscious listening and speaking',
          estimatedTime: '3 weeks',
          focusArea: 'Social Skills'
        },
        {
          id: 'ss2',
          title: 'Conflict Resolution',
          description: 'Learn to navigate disagreements with wisdom',
          estimatedTime: '2 weeks',
          focusArea: 'Social Skills'
        },
        {
          id: 'ss3',
          title: 'Leadership Presence',
          description: 'Develop authentic leadership and influence skills',
          estimatedTime: '3 weeks',
          focusArea: 'Social Skills'
        }
      ]
    };

    // Select modules based on focus areas
    const selectedModules = focusAreas.flatMap(area => 
      modulesByFocusArea[area]?.slice(0, 2) || []
    );

    // Add goal-specific module
    if (primaryGoal === 'stress-reduction') {
      selectedModules.push({
        id: 'stress1',
        title: 'Stress-Free Living',
        description: 'Comprehensive stress reduction and relaxation techniques',
        estimatedTime: '4 weeks',
        focusArea: 'Applied Practice'
      });
    } else if (primaryGoal === 'focus-improvement') {
      selectedModules.push({
        id: 'focus1',
        title: 'Focused Attention Training',
        description: 'Enhance concentration and mental clarity',
        estimatedTime: '4 weeks',
        focusArea: 'Applied Practice'
      });
    }

    const pathTitles = {
      beginner: 'Foundation Path',
      intermediate: 'Growth Path',
      advanced: 'Mastery Path'
    };

    const totalWeeks = selectedModules.reduce((sum, module) => {
      const weeks = parseInt(module.estimatedTime.split(' ')[0]);
      return sum + weeks;
    }, 0);

    return {
      id: `path-${Date.now()}`,
      title: `Personalized ${pathTitles[difficultyLevel]}`,
      description: `A customized SIY learning journey focusing on ${focusAreas.join(' and ')} to help you achieve ${goals.primary?.replace('-', ' ')} goals.`,
      duration: `${totalWeeks} weeks`,
      modules: selectedModules,
      primarySkills: focusAreas,
      learningStyle,
      difficultyLevel
    };
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      
      // Generate learning path after SIY assessment
      if (currentStep === 3) {
        const path = generateLearningPath(onboardingData);
        setOnboardingData(prev => ({ ...prev, recommendedPath: path }));
      }
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
        setOnboardingData(prev => ({ ...prev, siyAssessment: stepData as Partial<SIYAssessment> }));
        break;
      case 4:
        setOnboardingData(prev => ({ ...prev, goals: stepData as Partial<UserGoals> }));
        break;
      case 5:
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
          ...userProfile.meditationExperience,
          ...onboardingData.meditationExperience,
          level: onboardingData.meditationExperience?.level || 'beginner'
        },
        goals: {
          ...userProfile.goals,
          ...onboardingData.goals,
          primary: onboardingData.goals?.primary || 'stress-reduction'
        },
        preferences: {
          ...userProfile.preferences,
          ...onboardingData.preferences,
          onboardingCompleted: true
        },
        // Store SIY assessment and learning path
        assessments: onboardingData.siyAssessment as any,
        learningPath: typeof onboardingData.recommendedPath === 'string' ? onboardingData.recommendedPath : onboardingData.recommendedPath?.id
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
          <SIYAssessmentStep
            initialData={onboardingData.siyAssessment}
            onUpdate={handleStepUpdate}
          />
        );
      case 4:
        return (
          <GoalsSelectionStep
            initialData={onboardingData.goals}
            onUpdate={handleStepUpdate}
          />
        );
      case 5:
        return (
          <PreferencesSetupStep
            initialData={onboardingData.preferences}
            onUpdate={handleStepUpdate}
          />
        );
      case 6:
        return renderLearningPath();
      default:
        return null;
    }
  };

  const renderLearningPath = () => {
    const path = onboardingData.recommendedPath;
    if (!path) return null;

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Personalized Learning Path</h3>
          <p className="text-gray-600">Based on your assessment, we've created a customized journey for you</p>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-purple/10 rounded-2xl p-6 border border-primary/20">
          <div className="text-center mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">{path.title}</h4>
            <p className="text-gray-700 mb-4">{path.description}</p>
            <div className="inline-flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {path.duration}
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {path.modules.length} modules
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {path.difficultyLevel}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="font-medium text-gray-900">Learning Modules:</h5>
            {path.modules.map((module, index) => (
              <div key={module.id} className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full text-white text-xs flex items-center justify-center font-semibold mt-0.5">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h6 className="font-medium text-gray-900">{module.title}</h6>
                    <p className="text-sm text-gray-600 mb-2">{module.description}</p>
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {module.estimatedTime}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {module.focusArea}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h6 className="font-medium text-gray-900 mb-2">Primary Skills</h6>
                <div className="flex flex-wrap gap-2">
                  {path.primarySkills.map((skill) => (
                    <span key={skill} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-lg">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h6 className="font-medium text-gray-900 mb-2">Learning Style</h6>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-lg">
                  {path.learningStyle} learner
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-green-800">
              <p className="font-medium mb-2">Ready to Begin Your Journey! 🌟</p>
              <p>
                Your personalized SIY learning path has been created based on your unique profile and goals. 
                You can start immediately and adjust the pace as needed. Remember, consistency is more important 
                than perfection - even 10 minutes a day can create meaningful change.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Tell us about yourself';
      case 2:
        return 'Your meditation experience';
      case 3:
        return 'SIY Emotional Intelligence Assessment';
      case 4:
        return 'Set your goals';
      case 5:
        return 'Customize your experience';
      case 6:
        return 'Your personalized learning path';
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
        return 'Assess your current emotional intelligence to create your personalized learning path';
      case 4:
        return 'What would you like to achieve through meditation and emotional intelligence training?';
      case 5:
        return 'Set up your preferences for notifications and meditation settings';
      case 6:
        return 'Review your customized SIY learning journey and get ready to start';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
                  Welcome to Sembalun SIY
                </h1>
                <p className="text-gray-600">
                  Let's create your personalized Search Inside Yourself journey
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
              {currentStep < 6 && (
                <Button
                  variant="secondary"
                  onClick={onComplete}
                  disabled={loading}
                >
                  Skip for now
                </Button>
              )}

              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                  disabled={loading}
                >
                  {currentStep === 3 ? 'Generate Learning Path' : 'Next'}
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
                    'Start My Journey'
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