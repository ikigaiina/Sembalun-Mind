import React, { useState, useEffect } from 'react';
import type { MeditationExperience } from '../../types/auth';

interface MeditationExperienceStepProps {
  initialData: Partial<MeditationExperience>;
  onUpdate: (data: Partial<MeditationExperience>) => void;
}

export const MeditationExperienceStep: React.FC<MeditationExperienceStepProps> = ({ 
  initialData, 
  onUpdate 
}) => {
  const [formData, setFormData] = useState<Partial<MeditationExperience>>({
    level: 'beginner',
    yearsOfPractice: undefined,
    previousStyles: [],
    currentPractices: [],
    motivations: [],
    challenges: [],
    ...initialData
  });

  useEffect(() => {
    onUpdate(formData);
  }, [formData, onUpdate]);

  const experienceLevels = [
    {
      value: 'beginner',
      title: 'Beginner',
      description: 'New to meditation or just getting started',
      icon: '🌱'
    },
    {
      value: 'intermediate',
      title: 'Intermediate',
      description: 'Some experience with regular practice',
      icon: '🌿'
    },
    {
      value: 'advanced',
      title: 'Advanced',
      description: 'Experienced practitioner with deep knowledge',
      icon: '🌳'
    }
  ];

  const meditationStyles = [
    'Mindfulness',
    'Vipassana',
    'Zen',
    'Transcendental Meditation',
    'Loving-kindness',
    'Body scan',
    'Breathing meditation',
    'Walking meditation',
    'Mantra meditation',
    'Guided visualization',
    'Yoga meditation',
    'Christian contemplation',
    'Islamic meditation',
    'Buddhist meditation'
  ];

  const currentPractices = [
    'Daily meditation',
    'Weekly meditation',
    'Meditation apps',
    'Group meditation',
    'Retreat participation',
    'Yoga practice',
    'Mindful breathing',
    'Body awareness',
    'Gratitude practice',
    'Journaling',
    'Walking meditation',
    'Prayer/spiritual practice'
  ];

  const motivations = [
    'Reduce stress and anxiety',
    'Improve focus and concentration',
    'Better sleep quality',
    'Emotional regulation',
    'Spiritual growth',
    'Self-awareness',
    'Pain management',
    'Performance enhancement',
    'Relationship improvement',
    'General wellbeing',
    'Mindful living',
    'Personal development'
  ];

  const challenges = [
    'Finding time to practice',
    'Staying consistent',
    'Dealing with wandering mind',
    'Physical discomfort',
    'Falling asleep during meditation',
    'Lack of motivation',
    'Not seeing progress',
    'Choosing the right technique',
    'Creating quiet space',
    'Dealing with emotions',
    'Self-doubt',
    'Comparing with others'
  ];

  const handleLevelSelect = (level: MeditationExperience['level']) => {
    setFormData(prev => ({ ...prev, level }));
  };

  const handleArrayToggle = (field: keyof MeditationExperience, value: string) => {
    setFormData(prev => {
      const currentArray = (prev[field] as string[]) || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      return { ...prev, [field]: newArray };
    });
  };

  const handleYearsChange = (years: number) => {
    setFormData(prev => ({ ...prev, yearsOfPractice: years }));
  };

  return (
    <div className="space-y-8">
      {/* Experience Level */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          What's your meditation experience level?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {experienceLevels.map((level) => (
            <button
              key={level.value}
              onClick={() => handleLevelSelect(level.value as MeditationExperience['level'])}
              className={`p-6 rounded-2xl border-2 transition-all duration-200 text-left ${
                formData.level === level.value
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-3xl mb-3">{level.icon}</div>
              <h4 className="font-semibold text-gray-900 mb-2">{level.title}</h4>
              <p className="text-sm text-gray-600">{level.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Years of Practice */}
      {formData.level !== 'beginner' && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            How many years have you been practicing?
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 10, 15, 20].map((years) => (
              <button
                key={years}
                onClick={() => handleYearsChange(years)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  formData.yearsOfPractice === years
                    ? 'border-primary bg-primary/5 text-primary font-semibold'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {years}+ year{years > 1 ? 's' : ''}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Previous Styles (for non-beginners) */}
      {formData.level !== 'beginner' && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            What meditation styles have you tried? (Optional)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {meditationStyles.map((style) => (
              <button
                key={style}
                onClick={() => handleArrayToggle('previousStyles', style)}
                className={`p-3 rounded-xl border-2 transition-all duration-200 text-sm ${
                  formData.previousStyles?.includes(style)
                    ? 'border-primary bg-primary/5 text-primary font-medium'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Current Practices */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          What wellness practices are you currently doing? (Optional)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {currentPractices.map((practice) => (
            <button
              key={practice}
              onClick={() => handleArrayToggle('currentPractices', practice)}
              className={`p-3 rounded-xl border-2 transition-all duration-200 text-sm ${
                formData.currentPractices?.includes(practice)
                  ? 'border-primary bg-primary/5 text-primary font-medium'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {practice}
            </button>
          ))}
        </div>
      </div>

      {/* Motivations */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          What motivates you to meditate? (Select up to 5)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {motivations.map((motivation) => (
            <button
              key={motivation}
              onClick={() => handleArrayToggle('motivations', motivation)}
              disabled={
                !formData.motivations?.includes(motivation) && 
                (formData.motivations?.length || 0) >= 5
              }
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-sm text-left ${
                formData.motivations?.includes(motivation)
                  ? 'border-primary bg-primary/5 text-primary font-medium'
                  : (formData.motivations?.length || 0) >= 5
                  ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {motivation}
            </button>
          ))}
        </div>
        {(formData.motivations?.length || 0) > 0 && (
          <p className="text-sm text-gray-500 mt-2">
            {formData.motivations?.length || 0}/5 motivations selected
          </p>
        )}
      </div>

      {/* Challenges */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          What challenges do you face with meditation? (Optional)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {challenges.map((challenge) => (
            <button
              key={challenge}
              onClick={() => handleArrayToggle('challenges', challenge)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-sm text-left ${
                formData.challenges?.includes(challenge)
                  ? 'border-orange-300 bg-orange-50 text-orange-700 font-medium'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {challenge}
            </button>
          ))}
        </div>
      </div>

      {/* Insight Box */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
        <div className="flex items-start space-x-3">
          <svg className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <div className="text-sm text-green-800">
            <p className="font-medium mb-2">Great job sharing your experience!</p>
            <p>
              This information helps us recommend the perfect meditation content for your journey. 
              Whether you're just starting or deepening your practice, we'll personalize everything 
              to match your needs and goals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};