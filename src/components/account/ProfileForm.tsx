import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../ui/Input';
import type { PersonalInfo } from '../../types/auth';

interface ProfileFormProps {
  onSuccess?: () => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ onSuccess }) => {
  const { userProfile, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    age: undefined,
    gender: undefined,
    location: {
      city: '',
      country: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    occupation: '',
    bio: '',
  });

  useEffect(() => {
    if (userProfile?.personalInfo) {
      setFormData(userProfile.personalInfo);
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateUserProfile({
        personalInfo: formData,
      });
      setSuccess('Profile updated successfully!');
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof PersonalInfo, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLocationChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value,
      },
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 font-heading mb-2">
          Personal Information
        </h2>
        <p className="text-gray-600">
          Help us personalize your meditation experience by sharing some basic information.
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="First Name"
            type="text"
            placeholder="Enter your first name"
            value={formData.firstName || ''}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />

          <Input
            label="Last Name"
            type="text"
            placeholder="Enter your last name"
            value={formData.lastName || ''}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Age"
            type="number"
            placeholder="Enter your age"
            value={formData.age?.toString() || ''}
            onChange={(e) => handleInputChange('age', e.target.value ? parseInt(e.target.value) : undefined)}
            min="13"
            max="120"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <select
              value={formData.gender || ''}
              onChange={(e) => handleInputChange('gender', e.target.value || undefined)}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="City"
            type="text"
            placeholder="Enter your city"
            value={formData.location?.city || ''}
            onChange={(e) => handleLocationChange('city', e.target.value)}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />

          <Input
            label="Country"
            type="text"
            placeholder="Enter your country"
            value={formData.location?.country || ''}
            onChange={(e) => handleLocationChange('country', e.target.value)}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        <Input
          label="Occupation"
          type="text"
          placeholder="What do you do for work?"
          value={formData.occupation || ''}
          onChange={(e) => handleInputChange('occupation', e.target.value)}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
            </svg>
          }
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            placeholder="Tell us a bit about yourself and your meditation journey..."
            value={formData.bio || ''}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {(formData.bio || '').length}/500 characters
          </p>
        </div>

        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-primary text-white rounded-2xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};