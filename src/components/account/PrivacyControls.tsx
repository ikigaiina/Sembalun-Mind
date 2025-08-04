import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';

interface PrivacySettings {
  dataCollection: {
    essential: boolean; // Always true, cannot be disabled
    analytics: boolean;
    performance: boolean;
    personalization: boolean;
    marketing: boolean;
  };
  dataSharing: {
    thirdPartyAnalytics: boolean;
    researchParticipation: boolean;
    anonymizedInsights: boolean;
    partnerIntegrations: boolean;
  };
  profileVisibility: {
    displayName: 'public' | 'friends' | 'private';
    avatar: 'public' | 'friends' | 'private';
    meditationStats: 'public' | 'friends' | 'private';
    achievements: 'public' | 'friends' | 'private';
  };
  communications: {
    productUpdates: boolean;
    marketingEmails: boolean;
    researchInvitations: boolean;
    communityNotifications: boolean;
    partnerOffers: boolean;
  };
  dataRetention: {
    autoDeleteInactive: boolean;
    retentionPeriod: 12 | 24 | 36; // months
    deleteOnRequest: boolean;
  };
  cookieConsent: {
    essential: boolean; // Always true
    functional: boolean;
    analytics: boolean;
    marketing: boolean;
    lastUpdated: string;
  };
}

export const PrivacyControls: React.FC = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDataExport, setShowDataExport] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    dataCollection: {
      essential: true,
      analytics: true,
      performance: true,
      personalization: true,
      marketing: false
    },
    dataSharing: {
      thirdPartyAnalytics: false,
      researchParticipation: false,
      anonymizedInsights: true,
      partnerIntegrations: false
    },
    profileVisibility: {
      displayName: 'public',
      avatar: 'public',
      meditationStats: 'friends',
      achievements: 'public'
    },
    communications: {
      productUpdates: true,
      marketingEmails: false,
      researchInvitations: false,
      communityNotifications: true,
      partnerOffers: false
    },
    dataRetention: {
      autoDeleteInactive: false,
      retentionPeriod: 24,
      deleteOnRequest: true
    },
    cookieConsent: {
      essential: true,
      functional: true,
      analytics: true,
      marketing: false,
      lastUpdated: new Date().toISOString()
    }
  });

  // Load existing privacy settings
  useEffect(() => {
    if (userProfile?.privacySettings) {
      setPrivacySettings(prev => ({ 
        ...prev,
        dataCollection: {
          ...prev.dataCollection,
          analytics: userProfile.privacySettings?.analytics ?? prev.dataCollection.analytics
        },
        dataSharing: typeof userProfile.privacySettings?.dataSharing === 'boolean' 
          ? {
              thirdPartyAnalytics: userProfile.privacySettings.dataSharing,
              researchParticipation: false,
              anonymizedInsights: userProfile.privacySettings.dataSharing,
              partnerIntegrations: false
            }
          : userProfile.privacySettings?.dataSharing ?? prev.dataSharing,
        profileVisibility: {
          ...prev.profileVisibility,
          displayName: userProfile.privacySettings?.profileVisibility ?? prev.profileVisibility.displayName
        }
      }));
    }
  }, [userProfile]);

  const handleSettingToggle = (category: keyof PrivacySettings, key: string, value?: string | boolean | number) => {
    setPrivacySettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value !== undefined ? value : !prev[category][key as keyof typeof prev[typeof category]]
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateUserProfile({
        privacySettings: {
          analytics: privacySettings.dataCollection.analytics,
          dataSharing: privacySettings.dataSharing,
          profileVisibility: privacySettings.profileVisibility.displayName,
          shareProgress: privacySettings.communications.communityNotifications,
          locationTracking: false,
          cookieConsent: {
            essential: true,
            functional: privacySettings.cookieConsent.functional,
            analytics: privacySettings.cookieConsent.analytics,
            marketing: privacySettings.cookieConsent.marketing,
            lastUpdated: new Date().toISOString()
          }
        }
      });
      setSuccess('Privacy settings updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const handleDataExport = async () => {
    setExportLoading(true);
    try {
      // In a real implementation, this would call an API to generate and download user data
      const userData = {
        profile: userProfile,
        privacySettings,
        exportDate: new Date().toISOString(),
        dataTypes: [
          'Profile Information',
          'Meditation History',
          'Progress Data',
          'Settings',
          'Privacy Preferences'
        ]
      };

      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sembalun-user-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccess('Your data has been exported successfully');
    } catch {
      setError('Failed to export data');
    } finally {
      setExportLoading(false);
      setShowDataExport(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await authService.deleteAccount();
      // User will be logged out automatically
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
    }
  };

  const visibilityOptions = [
    { value: 'public', label: 'Public', description: 'Visible to everyone' },
    { value: 'friends', label: 'Friends', description: 'Visible to your connections' },
    { value: 'private', label: 'Private', description: 'Only visible to you' }
  ];

  const retentionOptions = [
    { value: 12, label: '1 Year' },
    { value: 24, label: '2 Years' },
    { value: 36, label: '3 Years' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-start space-x-3">
          <svg className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Privacy & Data Controls</h3>
            <p className="text-blue-800 text-sm">
              Control how your data is collected, used, and shared. Your privacy is important to us.
            </p>
          </div>
        </div>
      </div>

      {/* Data Collection */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Data Collection</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
            <div>
              <div className="font-medium text-gray-900">Essential Data</div>
              <div className="text-sm text-gray-600">Required for core app functionality</div>
            </div>
            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-400 opacity-50">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
            </div>
          </div>

          {Object.entries(privacySettings.dataCollection).map(([key, value]) => {
            if (key === 'essential') return null;
            
            const labels = {
              analytics: { title: 'Analytics Data', desc: 'Usage patterns and app performance' },
              performance: { title: 'Performance Data', desc: 'Error reports and optimization data' },
              personalization: { title: 'Personalization Data', desc: 'Content recommendations and customization' },
              marketing: { title: 'Marketing Data', desc: 'Promotional content and targeted offers' }
            };

            return (
              <div key={key} className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
                <div>
                  <div className="font-medium text-gray-900">{labels[key as keyof typeof labels].title}</div>
                  <div className="text-sm text-gray-600">{labels[key as keyof typeof labels].desc}</div>
                </div>
                <button
                  onClick={() => handleSettingToggle('dataCollection', key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    value ? 'bg-primary' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Sharing */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Data Sharing</h4>
        <div className="space-y-4">
          {Object.entries(privacySettings.dataSharing).map(([key, value]) => {
            const labels = {
              thirdPartyAnalytics: { title: 'Third-party Analytics', desc: 'Share data with analytics providers' },
              researchParticipation: { title: 'Research Participation', desc: 'Contribute to meditation and wellness research' },
              anonymizedInsights: { title: 'Anonymized Insights', desc: 'Share anonymized usage patterns for improvement' },
              partnerIntegrations: { title: 'Partner Integrations', desc: 'Share data with connected health apps' }
            };

            return (
              <div key={key} className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
                <div>
                  <div className="font-medium text-gray-900">{labels[key as keyof typeof labels].title}</div>
                  <div className="text-sm text-gray-600">{labels[key as keyof typeof labels].desc}</div>
                </div>
                <button
                  onClick={() => handleSettingToggle('dataSharing', key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    value ? 'bg-primary' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Profile Visibility */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Profile Visibility</h4>
        <div className="space-y-4">
          {Object.entries(privacySettings.profileVisibility).map(([key, value]) => {
            const labels = {
              displayName: 'Display Name',
              avatar: 'Profile Picture',
              meditationStats: 'Meditation Statistics',
              achievements: 'Achievements & Badges'
            };

            return (
              <div key={key} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {labels[key as keyof typeof labels]}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {visibilityOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSettingToggle('profileVisibility', key, option.value)}
                      className={`p-3 rounded-xl border-2 transition-all duration-200 text-sm ${
                        value === option.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs opacity-70">{option.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Communications */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Communications</h4>
        <div className="space-y-4">
          {Object.entries(privacySettings.communications).map(([key, value]) => {
            const labels = {
              productUpdates: { title: 'Product Updates', desc: 'Important app updates and new features' },
              marketingEmails: { title: 'Marketing Emails', desc: 'Promotional content and special offers' },
              researchInvitations: { title: 'Research Invitations', desc: 'Opportunities to participate in studies' },
              communityNotifications: { title: 'Community Notifications', desc: 'Social features and community updates' },
              partnerOffers: { title: 'Partner Offers', desc: 'Deals and offers from our partners' }
            };

            return (
              <div key={key} className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
                <div>
                  <div className="font-medium text-gray-900">{labels[key as keyof typeof labels].title}</div>
                  <div className="text-sm text-gray-600">{labels[key as keyof typeof labels].desc}</div>
                </div>
                <button
                  onClick={() => handleSettingToggle('communications', key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    value ? 'bg-primary' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Retention */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Data Retention</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
            <div>
              <div className="font-medium text-gray-900">Auto-delete inactive account</div>
              <div className="text-sm text-gray-600">Automatically delete account after inactivity period</div>
            </div>
            <button
              onClick={() => handleSettingToggle('dataRetention', 'autoDeleteInactive')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                privacySettings.dataRetention.autoDeleteInactive ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacySettings.dataRetention.autoDeleteInactive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Data retention period
            </label>
            <div className="grid grid-cols-3 gap-2">
              {retentionOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSettingToggle('dataRetention', 'retentionPeriod', option.value)}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 text-sm ${
                    privacySettings.dataRetention.retentionPeriod === option.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Data Rights */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Your Data Rights</h4>
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50">
            <h5 className="font-medium text-blue-900 mb-2">Export Your Data</h5>
            <p className="text-sm text-blue-800 mb-4">
              Download a copy of your personal data in a portable format (JSON).
            </p>
            <Button
              variant="outline"
              size="small"
              onClick={() => setShowDataExport(true)}
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              Export Data
            </Button>
          </div>

          <div className="p-4 rounded-xl border border-red-200 bg-red-50">
            <h5 className="font-medium text-red-900 mb-2">Delete Account</h5>
            <p className="text-sm text-red-800 mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <Button
              variant="outline"
              size="small"
              onClick={() => setShowDeleteAccount(true)}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      {/* Cookie Consent Summary */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Cookie Preferences</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(privacySettings.cookieConsent).map(([key, value]) => {
            if (key === 'lastUpdated') return null;
            
            const labels = {
              essential: 'Essential',
              functional: 'Functional',
              analytics: 'Analytics',
              marketing: 'Marketing'
            };

            return (
              <div key={key} className="text-center">
                <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                  value ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <div className="text-sm font-medium text-gray-900">{labels[key as keyof typeof labels]}</div>
                <div className="text-xs text-gray-600">{value ? 'Allowed' : 'Blocked'}</div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Last updated: {new Date(privacySettings.cookieConsent.lastUpdated).toLocaleDateString()}
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-green-700 text-sm">
          {success}
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={loading}
          className="min-w-[120px]"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* Data Export Modal */}
      {showDataExport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Your Data</h3>
            <p className="text-gray-600 mb-6">
              We'll create a JSON file containing all your personal data including profile information,
              meditation history, settings, and preferences.
            </p>
            <div className="flex space-x-3">
              <Button
                onClick={handleDataExport}
                disabled={exportLoading}
                className="flex-1"
              >
                {exportLoading ? 'Exporting...' : 'Export Data'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDataExport(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Account</h3>
              <p className="text-gray-600">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Delete Forever
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteAccount(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};