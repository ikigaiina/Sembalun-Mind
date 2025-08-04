import React, { useState, useEffect } from 'react';
import type { UserGoals } from '../../types/auth';

interface GoalsSelectionStepProps {
  initialData: Partial<UserGoals>;
  onUpdate: (data: Partial<UserGoals>) => void;
}

export const GoalsSelectionStep: React.FC<GoalsSelectionStepProps> = ({
  initialData,
  onUpdate
}) => {
  const [formData, setFormData] = useState<Partial<UserGoals>>({
    primary: 'stress-reduction',
    secondary: [],
    specificTargets: {},
    timeline: 'medium-term',
    ...initialData
  });

  useEffect(() => {
    onUpdate(formData);
  }, [formData, onUpdate]);

  const primaryGoals = [
    {
      value: 'stress-reduction',
      title: 'Reduce Stress & Anxiety',
      description: 'Find calm and peace in daily life',
      icon: '🧘‍♀️',
      color: 'from-blue-100 to-cyan-100'
    },
    {
      value: 'focus-improvement',
      title: 'Improve Focus',
      description: 'Enhance concentration and productivity',
      icon: '🎯',
      color: 'from-purple-100 to-pink-100'
    },
    {
      value: 'sleep-quality',
      title: 'Better Sleep',
      description: 'Achieve deeper, more restful sleep',
      icon: '😴',
      color: 'from-indigo-100 to-blue-100'
    },
    {
      value: 'emotional-growth',
      title: 'Emotional Growth',
      description: 'Better understand and manage emotions',
      icon: '💖',
      color: 'from-rose-100 to-pink-100'
    },
    {
      value: 'mindfulness',
      title: 'Mindful Living',
      description: 'Be more present in everyday moments',
      icon: '🌸',
      color: 'from-green-100 to-emerald-100'
    },
    {
      value: 'self-awareness',
      title: 'Self-Discovery',
      description: 'Develop deeper self-understanding',
      icon: '✨',
      color: 'from-yellow-100 to-orange-100'
    }
  ];

  const secondaryGoals = [
    'Improve relationships',
    'Boost creativity',
    'Manage pain',
    'Increase patience',
    'Build confidence',
    'Develop compassion',
    'Enhance performance',
    'Spiritual growth',
    'Habit formation',
    'Anger management',
    'Overcome addictions',
    'Find life purpose'
  ];

  const timelines = [
    {
      value: 'short-term',
      title: 'Short-term',
      description: '1-4 weeks',
      icon: '⚡'
    },
    {
      value: 'medium-term',
      title: 'Medium-term',
      description: '1-6 months',
      icon: '🌱'
    },
    {
      value: 'long-term',
      title: 'Long-term',
      description: '6+ months',
      icon: '🌳'
    }
  ];

  const handlePrimaryGoalSelect = (goal: UserGoals['primary']) => {
    setFormData(prev => ({ ...prev, primary: goal }));
  };

  const handleSecondaryGoalToggle = (goal: string) => {
    setFormData(prev => {
      const currentSecondary = prev.secondary || [];
      const newSecondary = currentSecondary.includes(goal)
        ? currentSecondary.filter(g => g !== goal)
        : [...currentSecondary, goal];
      
      return { ...prev, secondary: newSecondary };
    });
  };

  const handleSpecificTargetChange = (target: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      specificTargets: {
        ...prev.specificTargets,
        [target]: value
      }
    }));
  };

  const handleTimelineSelect = (timeline: UserGoals['timeline']) => {
    setFormData(prev => ({ ...prev, timeline }));
  };

  const renderSpecificTargets = () => {
    const targets = [];

    if (formData.primary === 'stress-reduction') {
      targets.push(
        <div key="stress" className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Current stress level (1-10): {formData.specificTargets?.stressLevel || 5}
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.specificTargets?.stressLevel || 5}
            onChange={(e) => handleSpecificTargetChange('stressLevel', parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Very Low</span>
            <span>Moderate</span>
            <span>Very High</span>
          </div>
        </div>
      );
    }

    if (formData.primary === 'sleep-quality') {
      targets.push(
        <div key="sleep" className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Current sleep quality (1-10): {formData.specificTargets?.sleepQuality || 5}
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.specificTargets?.sleepQuality || 5}
            onChange={(e) => handleSpecificTargetChange('sleepQuality', parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Very Poor</span>
            <span>Average</span>
            <span>Excellent</span>
          </div>
        </div>
      );
    }

    if (formData.primary === 'focus-improvement') {
      targets.push(
        <div key="focus" className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Desired daily focus time: {formData.specificTargets?.focusTime || 30} minutes
          </label>
          <input
            type="range"
            min="10"
            max="120"
            step="10"
            value={formData.specificTargets?.focusTime || 30}
            onChange={(e) => handleSpecificTargetChange('focusTime', parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>10 min</span>
            <span>60 min</span>
            <span>120 min</span>
          </div>
        </div>
      );
    }

    if (formData.primary === 'emotional-growth') {
      targets.push(
        <div key="emotional" className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Current emotional balance (1-10): {formData.specificTargets?.emotionalBalance || 5}
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.specificTargets?.emotionalBalance || 5}
            onChange={(e) => handleSpecificTargetChange('emotionalBalance', parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Very Unbalanced</span>
            <span>Balanced</span>
            <span>Very Balanced</span>
          </div>
        </div>
      );
    }

    return targets;
  };

  return (
    <div className="space-y-8">
      {/* Primary Goal */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          What's your main goal for meditation?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {primaryGoals.map((goal) => (
            <button
              key={goal.value}
              onClick={() => handlePrimaryGoalSelect(goal.value as UserGoals['primary'])}
              className={`p-6 rounded-2xl border-2 transition-all duration-200 text-left relative overflow-hidden ${
                formData.primary === goal.value
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${goal.color} opacity-20`} />
              <div className="relative">
                <div className="text-3xl mb-3">{goal.icon}</div>
                <h4 className="font-semibold text-gray-900 mb-2">{goal.title}</h4>
                <p className="text-sm text-gray-600">{goal.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Specific Targets */}
      {renderSpecificTargets().length > 0 && (
        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Help us personalize your experience
          </h3>
          <div className="space-y-6">
            {renderSpecificTargets()}
          </div>
        </div>
      )}

      {/* Secondary Goals */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Any additional goals? (Optional - select up to 3)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {secondaryGoals.map((goal) => (
            <button
              key={goal}
              onClick={() => handleSecondaryGoalToggle(goal)}
              disabled={
                !formData.secondary?.includes(goal) && 
                (formData.secondary?.length || 0) >= 3
              }
              className={`p-3 rounded-xl border-2 transition-all duration-200 text-sm ${
                formData.secondary?.includes(goal)
                  ? 'border-primary bg-primary/5 text-primary font-medium'
                  : (formData.secondary?.length || 0) >= 3
                  ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {goal}
            </button>
          ))}
        </div>
        {(formData.secondary?.length || 0) > 0 && (
          <p className="text-sm text-gray-500 mt-2">
            {formData.secondary?.length || 0}/3 additional goals selected
          </p>
        )}
      </div>

      {/* Timeline */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          What's your timeline for seeing results?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {timelines.map((timeline) => (
            <button
              key={timeline.value}
              onClick={() => handleTimelineSelect(timeline.value as UserGoals['timeline'])}
              className={`p-6 rounded-2xl border-2 transition-all duration-200 text-center ${
                formData.timeline === timeline.value
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-3xl mb-3">{timeline.icon}</div>
              <h4 className="font-semibold text-gray-900 mb-2">{timeline.title}</h4>
              <p className="text-sm text-gray-600">{timeline.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Motivation Message */}
      <div className="bg-gradient-to-r from-primary/10 to-purple-100 rounded-2xl p-6">
        <div className="flex items-start space-x-3">
          <svg className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <div className="text-sm text-gray-800">
            <p className="font-medium mb-2">You're on the right path! 🌟</p>
            <p>
              Setting clear intentions is the first step toward meaningful change. 
              We'll create a personalized meditation journey that aligns with your goals 
              and fits your timeline. Remember, every small step counts!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};