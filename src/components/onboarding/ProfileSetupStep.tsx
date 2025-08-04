import React, { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import type { PersonalInfo } from '../../types/auth';

interface ProfileSetupStepProps {
  initialData: Partial<PersonalInfo>;
  onUpdate: (data: Partial<PersonalInfo>) => void;
}

export const ProfileSetupStep: React.FC<ProfileSetupStepProps> = ({ initialData, onUpdate }) => {
  const [formData, setFormData] = useState<Partial<PersonalInfo>>({
    firstName: '',
    lastName: '',
    age: undefined,
    gender: undefined,
    location: {
      city: '',
      country: 'Indonesia',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    occupation: '',
    bio: '',
    ...initialData
  });

  useEffect(() => {
    onUpdate(formData);
  }, [formData, onUpdate]);

  const handleInputChange = (field: keyof PersonalInfo, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Age and Gender */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Age (Optional)
          </label>
          <input
            type="number"
            min="13"
            max="120"
            placeholder="Enter your age"
            value={formData.age || ''}
            onChange={(e) => handleInputChange('age', e.target.value ? parseInt(e.target.value) : '')}
            className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender (Optional)
          </label>
          <select
            value={formData.gender || ''}
            onChange={(e) => handleInputChange('gender', e.target.value || '')}
            className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-binary</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>
      </div>

      {/* Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="City (Optional)"
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country
          </label>
          <select
            value={formData.location?.country || 'Indonesia'}
            onChange={(e) => handleLocationChange('country', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="Indonesia">Indonesia</option>
            <option value="Malaysia">Malaysia</option>
            <option value="Singapore">Singapore</option>
            <option value="Thailand">Thailand</option>
            <option value="Philippines">Philippines</option>
            <option value="Vietnam">Vietnam</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Occupation */}
      <Input
        label="Occupation (Optional)"
        type="text"
        placeholder="What do you do for work?"
        value={formData.occupation || ''}
        onChange={(e) => handleInputChange('occupation', e.target.value)}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6" />
          </svg>
        }
      />

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tell us about yourself (Optional)
        </label>
        <textarea
          placeholder="Share a bit about yourself, your interests, or what brings you to meditation..."
          value={formData.bio || ''}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          rows={4}
          maxLength={500}
          className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
        />
        <div className="text-right text-xs text-gray-500 mt-1">
          {(formData.bio || '').length}/500 characters
        </div>
      </div>

      {/* Privacy Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Your privacy is important</p>
            <p>This information helps us personalize your experience. You can update or remove it anytime in your profile settings.</p>
          </div>
        </div>
      </div>
    </div>
  );
};