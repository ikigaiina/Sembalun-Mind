import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import type { MeditationExperience } from '../../types/auth';

interface MeditationExperienceFormProps {
  onSuccess?: () => void;
}

const MEDITATION_STYLES = [
  'Mindfulness',
  'Vipassana',
  'Zen',
  'Transcendental Meditation',
  'Loving-kindness (Metta)',
  'Body Scan',
  'Breath Awareness',
  'Walking Meditation',
  'Mantra Meditation',
  'Yoga Nidra',
  'Christian Contemplation',
  'Sufi Meditation',
  'Other'
];

const MOTIVATIONS = [
  'Reduce stress and anxiety',
  'Improve focus and concentration',
  'Better sleep quality',
  'Emotional regulation',
  'Spiritual growth',
  'Pain management',
  'Increase self-awareness',
  'Build compassion',
  'Manage depression',
  'Enhance creativity',
  'Improve relationships',
  'Personal development'
];

const CHALLENGES = [
  'Finding time to practice',
  'Staying focused during meditation',
  'Physical discomfort',
  'Falling asleep',
  'Racing thoughts',
  'Lack of motivation',
  'Inconsistent practice',
  'Emotional overwhelm',
  'Doubt about effectiveness',
  'No quiet space',
  'Fidgeting or restlessness',
  'Setting realistic expectations'
];

export const MeditationExperienceForm: React.FC<MeditationExperienceFormProps> = ({ onSuccess }) => {
  const { userProfile, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState<MeditationExperience>({
    level: 'beginner',
    yearsOfPractice: undefined,
    previousStyles: [],
    currentPractices: [],
    motivations: [],
    challenges: [],
  });

  useEffect(() => {
    if (userProfile?.meditationExperience) {
      setFormData(userProfile.meditationExperience);
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateUserProfile({
        meditationExperience: formData,
      });
      setSuccess('Meditation experience updated successfully!');
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update meditation experience');
    } finally {
      setLoading(false);
    }
  };

  const handleArrayToggle = (field: keyof MeditationExperience, value: string) => {
    setFormData(prev => {
      const currentArray = (prev[field] as string[]) || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      return {
        ...prev,
        [field]: newArray,
      };
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 font-heading mb-2">
          Meditation Experience
        </h2>
        <p className="text-gray-600">
          Tell us about your meditation background to help us recommend the best practices for you.
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
            What's your meditation experience level?
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { value: 'beginner', label: 'Beginner', desc: 'New to meditation or less than 6 months' },
              { value: 'intermediate', label: 'Intermediate', desc: '6 months to 2 years of practice' },
              { value: 'advanced', label: 'Advanced', desc: 'More than 2 years of regular practice' }
            ].map((level) => (
              <div
                key={level.value}
                className={`border-2 rounded-2xl p-4 cursor-pointer transition-all ${
                  formData.level === level.value
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, level: level.value as MeditationExperience['level'] }))}
              >
                <div className="text-center">
                  <h3 className="font-medium text-gray-900 mb-1">{level.label}</h3>
                  <p className="text-sm text-gray-600">{level.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {formData.level !== 'beginner' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How many years have you been practicing meditation?
            </label>
            <select
              value={formData.yearsOfPractice || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                yearsOfPractice: e.target.value ? parseInt(e.target.value) : undefined 
              }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            >
              <option value="">Select years</option>
              <option value="1">Less than 1 year</option>
              <option value="1">1 year</option>
              <option value="2">2 years</option>
              <option value="3">3 years</option>
              <option value="4">4 years</option>
              <option value="5">5 years</option>
              <option value="10">5-10 years</option>
              <option value="15">10-15 years</option>
              <option value="20">15+ years</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Which meditation styles have you tried? (Select all that apply)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {MEDITATION_STYLES.map((style) => (
              <label
                key={style}
                className={`flex items-center p-3 border-2 rounded-2xl cursor-pointer transition-all ${
                  formData.previousStyles?.includes(style)
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.previousStyles?.includes(style) || false}
                  onChange={() => handleArrayToggle('previousStyles', style)}
                  className="sr-only"
                />
                <span className="text-sm font-medium text-gray-700">{style}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            What motivates you to meditate? (Select all that apply)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MOTIVATIONS.map((motivation) => (
              <label
                key={motivation}
                className={`flex items-center p-3 border-2 rounded-2xl cursor-pointer transition-all ${
                  formData.motivations?.includes(motivation)
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.motivations?.includes(motivation) || false}
                  onChange={() => handleArrayToggle('motivations', motivation)}
                  className="sr-only"
                />
                <span className="text-sm font-medium text-gray-700">{motivation}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            What challenges do you face with meditation? (Select all that apply)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CHALLENGES.map((challenge) => (
              <label
                key={challenge}
                className={`flex items-center p-3 border-2 rounded-2xl cursor-pointer transition-all ${
                  formData.challenges?.includes(challenge)
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.challenges?.includes(challenge) || false}
                  onChange={() => handleArrayToggle('challenges', challenge)}
                  className="sr-only"
                />
                <span className="text-sm font-medium text-gray-700">{challenge}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-primary text-white rounded-2xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Experience'}
          </button>
        </div>
      </form>
    </div>
  );
};