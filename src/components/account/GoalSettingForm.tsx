import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import type { UserGoals } from '../../types/auth';

interface GoalSettingFormProps {
  onSuccess?: () => void;
}

const PRIMARY_GOALS = [
  {
    id: 'stress-reduction',
    title: 'Stress Reduction',
    description: 'Learn to manage and reduce daily stress through mindfulness',
    icon: '🌊'
  },
  {
    id: 'focus-improvement',
    title: 'Focus Improvement',
    description: 'Enhance concentration and mental clarity for better productivity',
    icon: '🎯'
  },
  {
    id: 'sleep-quality',
    title: 'Better Sleep',
    description: 'Improve sleep quality and establish healthy bedtime routines',
    icon: '😴'
  },
  {
    id: 'emotional-growth',
    title: 'Emotional Growth',
    description: 'Develop emotional intelligence and healthier relationships',
    icon: '💚'
  },
  {
    id: 'mindfulness',
    title: 'Daily Mindfulness',
    description: 'Cultivate present-moment awareness in everyday activities',
    icon: '🧘'
  },
  {
    id: 'self-awareness',
    title: 'Self-Awareness',
    description: 'Deepen understanding of your thoughts, emotions, and patterns',
    icon: '✨'
  }
];

const SECONDARY_GOALS = [
  'Pain management',
  'Anxiety relief',
  'Depression support',
  'Anger management',
  'Grief processing',
  'Addiction recovery',
  'Creative enhancement',
  'Spiritual growth',
  'Compassion building',
  'Patience development',
  'Confidence building',
  'Decision making'
];

export const GoalSettingForm: React.FC<GoalSettingFormProps> = ({ onSuccess }) => {
  const { userProfile, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState<UserGoals>({
    primary: 'stress-reduction',
    secondary: [],
    specificTargets: {
      stressLevel: 5,
      sleepQuality: 5,
      focusTime: 30,
      emotionalBalance: 5,
    },
    timeline: 'medium-term',
  });

  useEffect(() => {
    if (userProfile?.goals) {
      setFormData(userProfile.goals);
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateUserProfile({
        goals: formData,
      });
      setSuccess('Goals updated successfully!');
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update goals');
    } finally {
      setLoading(false);
    }
  };

  const handleSecondaryGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      secondary: prev.secondary?.includes(goal)
        ? prev.secondary.filter(g => g !== goal)
        : [...(prev.secondary || []), goal]
    }));
  };

  const handleTargetChange = (target: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      specificTargets: {
        ...prev.specificTargets,
        [target]: value,
      },
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 font-heading mb-2">
          Set Your Goals
        </h2>
        <p className="text-gray-600">
          Define what you want to achieve with meditation to get personalized recommendations.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            What's your primary goal?
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PRIMARY_GOALS.map((goal) => (
              <div
                key={goal.id}
                className={`border-2 rounded-2xl p-4 cursor-pointer transition-all ${
                  formData.primary === goal.id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, primary: goal.id as UserGoals['primary'] }))}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{goal.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{goal.title}</h3>
                    <p className="text-sm text-gray-600">{goal.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Secondary goals (optional - select up to 3)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {SECONDARY_GOALS.map((goal) => (
              <label
                key={goal}
                className={`flex items-center p-3 border-2 rounded-2xl cursor-pointer transition-all ${
                  formData.secondary?.includes(goal)
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                } ${
                  (formData.secondary?.length || 0) >= 3 && !formData.secondary?.includes(goal)
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
                onClick={(e) => {
                  if ((formData.secondary?.length || 0) >= 3 && !formData.secondary?.includes(goal)) {
                    e.preventDefault();
                    return;
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.secondary?.includes(goal) || false}
                  onChange={() => handleSecondaryGoalToggle(goal)}
                  disabled={(formData.secondary?.length || 0) >= 3 && !formData.secondary?.includes(goal)}
                  className="sr-only"
                />
                <span className="text-sm font-medium text-gray-700">{goal}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Set specific targets (1-10 scale)
          </label>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-700">Current stress level</span>
                <span className="text-sm font-medium text-primary">{formData.specificTargets?.stressLevel}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.specificTargets?.stressLevel || 5}
                onChange={(e) => handleTargetChange('stressLevel', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low stress</span>
                <span>High stress</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-700">Current sleep quality</span>
                <span className="text-sm font-medium text-primary">{formData.specificTargets?.sleepQuality}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.specificTargets?.sleepQuality || 5}
                onChange={(e) => handleTargetChange('sleepQuality', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Poor sleep</span>
                <span>Excellent sleep</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-700">Daily focus time goal</span>
                <span className="text-sm font-medium text-primary">{formData.specificTargets?.focusTime} minutes</span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={formData.specificTargets?.focusTime || 30}
                onChange={(e) => handleTargetChange('focusTime', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5 min</span>
                <span>2 hours</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-700">Current emotional balance</span>
                <span className="text-sm font-medium text-primary">{formData.specificTargets?.emotionalBalance}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.specificTargets?.emotionalBalance || 5}
                onChange={(e) => handleTargetChange('emotionalBalance', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Unbalanced</span>
                <span>Very balanced</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Timeline for achieving your goals
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { value: 'short-term', label: 'Short-term', desc: '1-3 months' },
              { value: 'medium-term', label: 'Medium-term', desc: '3-12 months' },
              { value: 'long-term', label: 'Long-term', desc: '1+ years' }
            ].map((timeline) => (
              <div
                key={timeline.value}
                className={`border-2 rounded-2xl p-4 cursor-pointer transition-all ${
                  formData.timeline === timeline.value
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, timeline: timeline.value as UserGoals['timeline'] }))}
              >
                <div className="text-center">
                  <h3 className="font-medium text-gray-900 mb-1">{timeline.label}</h3>
                  <p className="text-sm text-gray-600">{timeline.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-primary text-white rounded-2xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Goals'}
          </button>
        </div>
      </form>
    </div>
  );
};