import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AuthModal } from '../components/auth/AuthModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PasswordChange } from '../components/account/PasswordChange';
import { AccountSecurity } from '../components/account/AccountSecurity';
import { OfflineModeManager } from '../components/offline/OfflineModeManager';
import { SessionExporter } from '../components/export/SessionExporter';
import { EnhancedSettingsPanel } from '../components/enhanced/EnhancedSettingsPanel';

export const Settings: React.FC = () => {
  const { user, userProfile, isGuest, signOut, updateUserProfile, deleteAccount, exportUserData, reauthenticateUser } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReauthenticate, setShowReauthenticate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reauthPassword, setReauthPassword] = useState('');

  const [formData, setFormData] = useState({
    displayName: userProfile?.displayName || '',
    notifications: userProfile?.preferences?.notifications || {
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
    privacy: userProfile?.preferences?.privacy || {
      analytics: false,
      dataSharing: false,
      profileVisibility: 'private' as const,
      shareProgress: false,
      locationTracking: false,
    },
    meditation: userProfile?.preferences?.meditation || {
      defaultDuration: 10,
      preferredVoice: 'default',
      backgroundSounds: true,
      guidanceLevel: 'moderate' as const,
      musicVolume: 70,
      voiceVolume: 80,
      autoAdvance: false,
      showTimer: true,
      preparationTime: 30,
      endingBell: true,
    },
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest || !user) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateUserProfile({
        displayName: formData.displayName,
        preferences: {
          theme: userProfile?.preferences?.theme || 'auto',
          language: userProfile?.preferences?.language || 'en',
          notifications: formData.notifications,
          privacy: formData.privacy,
          meditation: formData.meditation,
          accessibility: userProfile?.preferences?.accessibility || {
            reducedMotion: false,
            highContrast: false,
            fontSize: 'medium' as const,
            screenReader: false,
            keyboardNavigation: false,
          },
          display: userProfile?.preferences?.display || {
            dateFormat: 'DD/MM/YYYY' as const,
            timeFormat: '24h' as const,
            weekStartsOn: 'monday' as const,
            showStreaks: true,
            showStatistics: true,
          },
          downloadPreferences: userProfile?.preferences?.downloadPreferences || {
            autoDownload: false,
            wifiOnly: true,
            storageLimit: 2,
          },
        },
      });
      setSuccess('Settings updated successfully!');
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await exportUserData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sembalun-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setSuccess('Data exported successfully!');
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to export data');
    }
  };

  const handleDeleteAccount = async () => {
    if (isGuest || !user) return;

    setLoading(true);
    setError('');

    try {
      await deleteAccount();
      setSuccess('Account deleted successfully');
    } catch (err: unknown) {
      const error = err as Error;
      if (error.message.includes('Please sign in again before deleting')) {
        setShowDeleteConfirm(false);
        setShowReauthenticate(true);
        setError('');
      } else {
        setError(error.message || 'Failed to delete account');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReauthenticate = async () => {
    if (!reauthPassword.trim()) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await reauthenticateUser(reauthPassword);
      setShowReauthenticate(false);
      setReauthPassword('');
      // Now try to delete account again
      await deleteAccount();
      setSuccess('Account deleted successfully');
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  if (isGuest) {
    return (
      <>
        <div className="min-h-screen bg-background p-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4 font-heading">
                  Settings
                </h1>
                <p className="text-gray-600 mb-8">
                  You're currently using Sembalun as a guest. Sign up to save your preferences and access all features.
                </p>
                <Button 
                  onClick={() => setShowAuthModal(true)}
                  variant="breathing"
                  size="lg"
                >
                  Create Account
                </Button>
              </div>
            </div>
          </div>
        </div>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultMode="signup"
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-heading">Settings</h1>
              <p className="text-gray-600">Manage your account and preferences</p>
            </div>
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

          <form onSubmit={handleUpdateProfile} className="space-y-8">
            {/* Profile Settings */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Profile</h3>
              <div className="space-y-4">
                <Input
                  label="Display Name"
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="Your display name"
                />
                <div className="text-sm text-gray-600">
                  <strong>Email:</strong> {user?.email}
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Notifications</h3>
              <div className="space-y-3">
                {Object.entries(formData.notifications).map(([key, value]) => (
                  <label key={key} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={typeof value === 'boolean' ? value : false}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, [key]: e.target.checked }
                      }))}
                      className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-gray-700 capitalize">
                      {key === 'daily' && 'Daily meditation reminders'}
                      {key === 'reminders' && 'Session reminders'}
                      {key === 'achievements' && 'Achievement notifications'}
                      {key === 'weeklyProgress' && 'Weekly progress reports'}
                      {key === 'socialUpdates' && 'Social updates'}
                      {key === 'push' && 'Push notifications'}
                      {key === 'email' && 'Email notifications'}
                      {key === 'sound' && 'Sound notifications'}
                      {key === 'vibration' && 'Vibration notifications'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Privacy Settings */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Privacy</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Visibility
                  </label>
                  <select
                    value={formData.privacy.profileVisibility}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, profileVisibility: e.target.value as 'public' | 'friends' | 'private' }
                    }))}
                    className="block w-full rounded-2xl border-2 border-gray-200 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
                  >
                    <option value="public">Public</option>
                    <option value="friends">Friends Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                
                {Object.entries(formData.privacy).map(([key, value]) => {
                  if (key === 'profileVisibility') return null;
                  return (
                    <label key={key} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={typeof value === 'boolean' ? value : false}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          privacy: { ...prev.privacy, [key]: e.target.checked }
                        }))}
                        className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <span className="text-gray-700 capitalize">
                        {key === 'analytics' && 'Allow analytics data collection'}
                        {key === 'dataSharing' && 'Share anonymous usage data'}
                        {key === 'shareProgress' && 'Share progress with community'}
                        {key === 'locationTracking' && 'Allow location tracking'}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Meditation Preferences */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Meditation</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Session Duration (minutes)
                  </label>
                  <select
                    value={formData.meditation.defaultDuration}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      meditation: { ...prev.meditation, defaultDuration: parseInt(e.target.value) }
                    }))}
                    className="block w-full rounded-2xl border-2 border-gray-200 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
                  >
                    <option value={5}>5 minutes</option>
                    <option value={10}>10 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={20}>20 minutes</option>
                    <option value={30}>30 minutes</option>
                  </select>
                </div>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.meditation.backgroundSounds}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      meditation: { ...prev.meditation, backgroundSounds: e.target.checked }
                    }))}
                    className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-gray-700">Enable background sounds</span>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              variant="breathing"
              size="lg"
              disabled={loading}
              isLoading={loading}
              className="w-full"
            >
              Save Settings
            </Button>
          </form>
        </div>

        {/* Password Change Component */}
        <PasswordChange
          onSuccess={() => setSuccess('Password updated successfully!')}
          onError={(error) => setError(error)}
        />

        {/* Account Security Component */}
        <AccountSecurity />

        {/* Enhanced Settings Panel */}
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Pengaturan Lanjutan</h3>
          <EnhancedSettingsPanel />
        </div>

        {/* Offline Mode Manager */}
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Mode Offline</h3>
          <OfflineModeManager />
        </div>

        {/* Data Export/Import */}
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Kelola Data</h3>
          <SessionExporter />
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-3xl p-8 shadow-lg space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">Account Actions</h3>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="secondary"
              onClick={handleExportData}
              className="flex-1"
            >
              Export My Data (Simple)
            </Button>
            
            <Button
              variant="outline"
              onClick={() => signOut()}
              className="flex-1"
            >
              Sign Out
            </Button>
          </div>

          <div className="border-t pt-6">
            <h4 className="text-lg font-medium text-gray-900 mb-2">Danger Zone</h4>
            <p className="text-gray-600 text-sm mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete Account</h3>
              <p className="text-gray-600 mb-6">
                This action cannot be undone. All your data, progress, and settings will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteAccount}
                  variant="destructive"
                  disabled={loading}
                  isLoading={loading}
                  className="flex-1"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Re-authentication Modal */}
      {showReauthenticate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Confirm Your Identity</h3>
              <p className="text-gray-600 mb-6">
                For security reasons, please enter your password to confirm account deletion.
              </p>
              <div className="mb-6">
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={reauthPassword}
                  onChange={(e) => setReauthPassword(e.target.value)}
                  className="text-center"
                />
              </div>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReauthenticate(false);
                    setReauthPassword('');
                    setError('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReauthenticate}
                  variant="breathing"
                  disabled={loading || !reauthPassword.trim()}
                  isLoading={loading}
                  className="flex-1"
                >
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};