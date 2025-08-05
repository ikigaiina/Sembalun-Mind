import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import type { UserPreferences } from '../../types/auth';

interface PreferencesFormProps {
  onSuccess?: () => void;
}

export const PreferencesForm: React.FC<PreferencesFormProps> = ({ onSuccess }) => {
  const { userProfile, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'privacy' | 'meditation' | 'accessibility'>('general');

  const [formData, setFormData] = useState<UserPreferences>({
    theme: 'auto',
    language: 'en',
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
    privacy: {
      analytics: false,
      dataSharing: false,
      profileVisibility: 'private',
      shareProgress: false,
      locationTracking: false,
    },
    meditation: {
      defaultDuration: 10,
      preferredVoice: 'default',
      backgroundSounds: true,
      guidanceLevel: 'moderate',
      musicVolume: 70,
      voiceVolume: 80,
      autoAdvance: false,
      showTimer: true,
      preparationTime: 30,
      endingBell: true,
    },
    accessibility: {
      reducedMotion: false,
      highContrast: false,
      fontSize: 'medium',
      screenReader: false,
      keyboardNavigation: false,
    },
    display: {
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      weekStartsOn: 'monday',
      showStreaks: true,
      showStatistics: true,
    },
    downloadPreferences: {
      autoDownload: false,
      wifiOnly: true,
      storageLimit: 1,
    },
  });

  useEffect(() => {
    if (userProfile?.preferences) {
      setFormData(userProfile.preferences);
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateUserProfile({ preferences: formData });
      setSuccess('Preferences updated successfully!');
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = (section: keyof UserPreferences | '', key: string, value: unknown) => {
    if (section === '') {
      setFormData(prev => ({
        ...prev,
        [key]: value,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...(prev[section] as Record<string, unknown>),
          [key]: value,
        },
      }));
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'meditation', label: 'Meditation', icon: '🧘' },
    { id: 'accessibility', label: 'Accessibility', icon: '♿' },
  ];

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'light', label: 'Light', icon: '☀️' },
            { value: 'dark', label: 'Dark', icon: '🌙' },
            { value: 'auto', label: 'Auto', icon: '🌓' }
          ].map((theme) => (
            <button
              key={theme.value}
              type="button"
              onClick={() => updatePreference('', 'theme', theme.value)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                formData.theme === theme.value
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">{theme.icon}</div>
              <div className="text-sm font-medium">{theme.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Language</label>
        <select
          value={formData.language}
          onChange={(e) => updatePreference('', 'language', e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="en">English</option>
          <option value="id">Bahasa Indonesia</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Date Format</label>
        <select
          value={formData.display.dateFormat}
          onChange={(e) => updatePreference('display', 'dateFormat', e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Time Format</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: '12h', label: '12 Hour (AM/PM)' },
            { value: '24h', label: '24 Hour' }
          ].map((format) => (
            <button
              key={format.value}
              type="button"
              onClick={() => updatePreference('display', 'timeFormat', format.value)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                formData.display.timeFormat === format.value
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium">{format.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        {[
          { key: 'daily', label: 'Daily reminders', desc: 'Gentle reminders to practice meditation' },
          { key: 'reminders', label: 'Session reminders', desc: 'Notifications at your scheduled times' },
          { key: 'achievements', label: 'Achievement notifications', desc: 'Celebrate your milestones' },
          { key: 'weeklyProgress', label: 'Weekly progress', desc: 'Summary of your week' },
          { key: 'push', label: 'Push notifications', desc: 'Allow app notifications' },
          { key: 'email', label: 'Email notifications', desc: 'Receive updates via email' },
          { key: 'sound', label: 'Sound', desc: 'Play notification sounds' },
          { key: 'vibration', label: 'Vibration', desc: 'Vibrate on notifications' },
        ].map((item) => (
          <label key={item.key} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50">
            <input
              type="checkbox"
              checked={formData.notifications[item.key as keyof typeof formData.notifications] as boolean}
              onChange={(e) => updatePreference('notifications', item.key, e.target.checked)}
              className="mt-1 w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">{item.label}</div>
              <div className="text-xs text-gray-600">{item.desc}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        {[
          { key: 'analytics', label: 'Analytics', desc: 'Help improve the app with usage data' },
          { key: 'dataSharing', label: 'Data sharing', desc: 'Share anonymized data for research' },
          { key: 'shareProgress', label: 'Share progress', desc: 'Allow others to see your progress' },
          { key: 'locationTracking', label: 'Location tracking', desc: 'Use location for personalized content' },
        ].map((item) => (
          <label key={item.key} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50">
            <input
              type="checkbox"
              checked={formData.privacy[item.key as keyof typeof formData.privacy] as boolean}
              onChange={(e) => updatePreference('privacy', item.key, e.target.checked)}
              className="mt-1 w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">{item.label}</div>
              <div className="text-xs text-gray-600">{item.desc}</div>
            </div>
          </label>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Profile Visibility</label>
        <select
          value={formData.privacy.profileVisibility}
          onChange={(e) => updatePreference('privacy', 'profileVisibility', e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="private">Private</option>
          <option value="friends">Friends only</option>
          <option value="public">Public</option>
        </select>
      </div>
    </div>
  );

  const renderMeditationTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Default Session Duration</label>
        <select
          value={formData.meditation.defaultDuration}
          onChange={(e) => updatePreference('meditation', 'defaultDuration', parseInt(e.target.value))}
          className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value={5}>5 minutes</option>
          <option value={10}>10 minutes</option>
          <option value={15}>15 minutes</option>
          <option value={20}>20 minutes</option>
          <option value={30}>30 minutes</option>
          <option value={45}>45 minutes</option>
          <option value={60}>60 minutes</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Guidance Level</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'minimal', label: 'Minimal' },
            { value: 'moderate', label: 'Moderate' },
            { value: 'detailed', label: 'Detailed' }
          ].map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => updatePreference('meditation', 'guidanceLevel', level.value)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                formData.meditation.guidanceLevel === level.value
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium">{level.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Music Volume: {formData.meditation.musicVolume}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={formData.meditation.musicVolume}
            onChange={(e) => updatePreference('meditation', 'musicVolume', parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Voice Volume: {formData.meditation.voiceVolume}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={formData.meditation.voiceVolume}
            onChange={(e) => updatePreference('meditation', 'voiceVolume', parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="space-y-4">
        {[
          { key: 'backgroundSounds', label: 'Background sounds', desc: 'Play ambient sounds during meditation' },
          { key: 'showTimer', label: 'Show timer', desc: 'Display remaining time during sessions' },
          { key: 'endingBell', label: 'Ending bell', desc: 'Play a bell sound when session ends' },
          { key: 'autoAdvance', label: 'Auto advance', desc: 'Automatically start next session in programs' },
        ].map((item) => (
          <label key={item.key} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50">
            <input
              type="checkbox"
              checked={formData.meditation[item.key as keyof typeof formData.meditation] as boolean}
              onChange={(e) => updatePreference('meditation', item.key, e.target.checked)}
              className="mt-1 w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">{item.label}</div>
              <div className="text-xs text-gray-600">{item.desc}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );

  const renderAccessibilityTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Font Size</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'small', label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' },
            { value: 'extra-large', label: 'Extra Large' }
          ].map((size) => (
            <button
              key={size.value}
              type="button"
              onClick={() => updatePreference('accessibility', 'fontSize', size.value)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                formData.accessibility.fontSize === size.value
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium">{size.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {[
          { key: 'reducedMotion', label: 'Reduced motion', desc: 'Minimize animations and transitions' },
          { key: 'highContrast', label: 'High contrast', desc: 'Increase color contrast for better visibility' },
          { key: 'screenReader', label: 'Screen reader support', desc: 'Optimize for screen readers' },
          { key: 'keyboardNavigation', label: 'Keyboard navigation', desc: 'Enable full keyboard navigation' },
        ].map((item) => (
          <label key={item.key} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50">
            <input
              type="checkbox"
              checked={formData.accessibility[item.key as keyof typeof formData.accessibility] as boolean}
              onChange={(e) => updatePreference('accessibility', item.key, e.target.checked)}
              className="mt-1 w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">{item.label}</div>
              <div className="text-xs text-gray-600">{item.desc}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 font-heading mb-2">
          Preferences
        </h2>
        <p className="text-gray-600">
          Customize your Sembalun experience with these personalized settings.
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

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Tabs */}
        <div className="lg:w-1/4">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-left transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:w-3/4">
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              {activeTab === 'general' && renderGeneralTab()}
              {activeTab === 'notifications' && renderNotificationsTab()}
              {activeTab === 'privacy' && renderPrivacyTab()}
              {activeTab === 'meditation' && renderMeditationTab()}
              {activeTab === 'accessibility' && renderAccessibilityTab()}
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-primary text-white rounded-2xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};