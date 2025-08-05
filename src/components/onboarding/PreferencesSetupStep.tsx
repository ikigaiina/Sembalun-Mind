import React, { useState, useEffect } from 'react';
import type { UserPreferences, MeditationSchedule } from '../../types/auth';

interface PreferencesSetupStepProps {
  initialData: Partial<UserPreferences>;
  onUpdate: (data: Partial<UserPreferences & { schedule?: Partial<MeditationSchedule> }>) => void;
}

export const PreferencesSetupStep: React.FC<PreferencesSetupStepProps> = ({
  initialData,
  onUpdate
}) => {
  const [formData, setFormData] = useState({
    language: 'id' as const,
    theme: 'auto' as const,
    notifications: {
      daily: true,
      reminders: true,
      achievements: true,
      weeklyProgress: true,
      socialUpdates: false,
      push: true,
      email: false,
      sound: true,
      vibration: true,
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
    schedule: {
      preferredTimes: ['morning'] as string[],
      frequency: 'daily' as const,
      reminders: {
        enabled: true,
        times: ['07:00'],
        daysOfWeek: [1, 2, 3, 4, 5, 6, 0], // All days
      }
    },
    accessibility: {
      fontSize: 'medium' as const,
      reducedMotion: false,
      highContrast: false,
      screenReader: false,
      keyboardNavigation: false,
    },
    ...initialData
  });

  useEffect(() => {
    onUpdate(formData);
  }, [formData, onUpdate]);

  const languages = [
    { value: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
    { value: 'en', label: 'English', flag: '🇺🇸' }
  ];

  const themes = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'auto', label: 'Auto', icon: '🔄' }
  ];

  const durations = [5, 10, 15, 20, 30, 45, 60];

  const guidanceLevels = [
    {
      value: 'minimal',
      label: 'Minimal Guidance',
      description: 'Mostly silence with basic instructions'
    },
    {
      value: 'moderate',
      label: 'Moderate Guidance',
      description: 'Balanced guidance throughout the session'
    },
    {
      value: 'detailed',
      label: 'Detailed Guidance',
      description: 'Comprehensive instructions and guidance'
    }
  ];

  const preferredTimes = [
    { value: 'morning', label: 'Morning', icon: '🌅', description: '6AM - 10AM' },
    { value: 'afternoon', label: 'Afternoon', icon: '☀️', description: '12PM - 5PM' },
    { value: 'evening', label: 'Evening', icon: '🌆', description: '6PM - 9PM' },
    { value: 'night', label: 'Night', icon: '🌙', description: '9PM - 11PM' }
  ];

  const fontSizes = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
    { value: 'extra-large', label: 'Extra Large' }
  ];

  const handleLanguageSelect = (language: 'id' | 'en') => {
    setFormData(prev => ({ ...prev, language }));
  };

  const handleThemeSelect = (theme: 'light' | 'dark' | 'auto') => {
    setFormData(prev => ({ ...prev, theme }));
  };

  const handleNotificationToggle = (key: keyof typeof formData.notifications) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
  };

  const handleMeditationSettingChange = (key: keyof typeof formData.meditation, value: number | string | boolean) => {
    setFormData(prev => ({
      ...prev,
      meditation: {
        ...prev.meditation,
        [key]: value
      }
    }));
  };

  const handleTimeToggle = (time: string) => {
    setFormData(prev => {
      const currentTimes = prev.schedule.preferredTimes || [];
      const newTimes = currentTimes.includes(time)
        ? currentTimes.filter(t => t !== time)
        : [...currentTimes, time];
      
      return {
        ...prev,
        schedule: {
          ...prev.schedule,
          preferredTimes: newTimes
        }
      };
    });
  };

  const handleAccessibilityChange = (key: keyof typeof formData.accessibility, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      accessibility: {
        ...prev.accessibility,
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-8">
      {/* Language Preference */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Choose your language
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {languages.map((lang) => (
            <button
              key={lang.value}
              onClick={() => handleLanguageSelect(lang.value as 'id' | 'en')}
              className={`p-4 rounded-2xl border-2 transition-all duration-200 flex items-center space-x-3 ${
                formData.language === lang.value
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">{lang.flag}</span>
              <span className="font-medium">{lang.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Theme Preference */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Choose your theme
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themes.map((theme) => (
            <button
              key={theme.value}
              onClick={() => handleThemeSelect(theme.value as 'light' | 'dark' | 'auto')}
              className={`p-4 rounded-2xl border-2 transition-all duration-200 flex items-center justify-center space-x-3 ${
                formData.theme === theme.value
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">{theme.icon}</span>
              <span className="font-medium">{theme.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Meditation Settings */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Meditation Settings
        </h3>
        
        {/* Default Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Default session length: {formData.meditation.defaultDuration} minutes
          </label>
          <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
            {durations.map((duration) => (
              <button
                key={duration}
                onClick={() => handleMeditationSettingChange('defaultDuration', duration)}
                className={`p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                  formData.meditation.defaultDuration === duration
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {duration}m
              </button>
            ))}
          </div>
        </div>

        {/* Guidance Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Guidance level
          </label>
          <div className="space-y-3">
            {guidanceLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => handleMeditationSettingChange('guidanceLevel', level.value)}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  formData.meditation.guidanceLevel === level.value
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-900">{level.label}</div>
                <div className="text-sm text-gray-600">{level.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Audio Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
            <div>
              <div className="font-medium text-gray-900">Background sounds</div>
              <div className="text-sm text-gray-600">Play ambient sounds during meditation</div>
            </div>
            <button
              onClick={() => handleMeditationSettingChange('backgroundSounds', !formData.meditation.backgroundSounds)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.meditation.backgroundSounds ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.meditation.backgroundSounds ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
            <div>
              <div className="font-medium text-gray-900">Show timer</div>
              <div className="text-sm text-gray-600">Display remaining time during session</div>
            </div>
            <button
              onClick={() => handleMeditationSettingChange('showTimer', !formData.meditation.showTimer)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.meditation.showTimer ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.meditation.showTimer ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
            <div>
              <div className="font-medium text-gray-900">Ending bell</div>
              <div className="text-sm text-gray-600">Play gentle bell sound at session end</div>
            </div>
            <button
              onClick={() => handleMeditationSettingChange('endingBell', !formData.meditation.endingBell)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.meditation.endingBell ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.meditation.endingBell ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Preferred Times */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          When do you prefer to meditate? (Select all that apply)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {preferredTimes.map((time) => (
            <button
              key={time.value}
              onClick={() => handleTimeToggle(time.value)}
              className={`p-4 rounded-2xl border-2 transition-all duration-200 text-center ${
                formData.schedule.preferredTimes?.includes(time.value)
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">{time.icon}</div>
              <div className="font-medium text-gray-900">{time.label}</div>
              <div className="text-xs text-gray-600">{time.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Notification preferences
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
            <div>
              <div className="font-medium text-gray-900">Daily reminders</div>
              <div className="text-sm text-gray-600">Get reminded to meditate daily</div>
            </div>
            <button
              onClick={() => handleNotificationToggle('reminders')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.notifications.reminders ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.notifications.reminders ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
            <div>
              <div className="font-medium text-gray-900">Achievement notifications</div>
              <div className="text-sm text-gray-600">Celebrate your progress and milestones</div>
            </div>
            <button
              onClick={() => handleNotificationToggle('achievements')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.notifications.achievements ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.notifications.achievements ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
            <div>
              <div className="font-medium text-gray-900">Sound notifications</div>
              <div className="text-sm text-gray-600">Play sounds with notifications</div>
            </div>
            <button
              onClick={() => handleNotificationToggle('sound')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.notifications.sound ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.notifications.sound ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Accessibility */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Accessibility settings
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Font size
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {fontSizes.map((size) => (
                <button
                  key={size.value}
                  onClick={() => handleAccessibilityChange('fontSize', size.value)}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 text-sm ${
                    formData.accessibility.fontSize === size.value
                      ? 'border-primary bg-primary/5 text-primary font-medium'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
            <div>
              <div className="font-medium text-gray-900">Reduce motion</div>
              <div className="text-sm text-gray-600">Minimize animations and transitions</div>
            </div>
            <button
              onClick={() => handleAccessibilityChange('reducedMotion', !formData.accessibility.reducedMotion)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.accessibility.reducedMotion ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.accessibility.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6">
        <div className="flex items-start space-x-3">
          <svg className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-gray-800">
            <p className="font-medium mb-2">Perfect! You're all set! 🎉</p>
            <p>
              Your personalized meditation experience is ready. You can always adjust these 
              preferences later in your account settings. Welcome to your mindfulness journey!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};