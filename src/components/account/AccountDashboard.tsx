import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { AvatarUpload } from './AvatarUpload';
import { ProfileForm } from './ProfileForm';
import { MeditationExperienceForm } from './MeditationExperienceForm';
import { GoalSettingForm } from './GoalSettingForm';
import { PreferencesForm } from './PreferencesForm';
import { AccountDeletion } from './AccountDeletion';
import { getUserDisplayName } from '../../utils/user-display';

type ActiveTab = 'overview' | 'profile' | 'experience' | 'goals' | 'preferences' | 'security' | 'data';

export const AccountDashboard: React.FC = () => {
  const { user, userProfile, signOut, exportUserData, sendVerificationEmail } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);

  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const data = await exportUserData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sembalun-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const handleSendVerification = async () => {
    setVerificationLoading(true);
    try {
      await sendVerificationEmail();
    } catch (error) {
      console.error('Verification email failed:', error);
    } finally {
      setVerificationLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '👤' },
    { id: 'profile', label: 'Profile', icon: '📝' },
    { id: 'experience', label: 'Experience', icon: '🧘' },
    { id: 'goals', label: 'Goals', icon: '🎯' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'data', label: 'Data & Privacy', icon: '📊' },
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-6">
          <AvatarUpload currentPhotoURL={userProfile?.photoURL} />
          
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {getUserDisplayName(user, userProfile, false)}
            </h3>
            <p className="text-gray-600 mb-1">
              {userProfile?.email || (userProfile?.isGuest ? 'Pengguna Tamu' : 'Tidak ada Email')}
            </p>
            {userProfile?.personalInfo?.location?.city && (
              <p className="text-sm text-gray-500 mb-3">
                📍 {userProfile.personalInfo.location.city}
                {userProfile.personalInfo.location.country && `, ${userProfile.personalInfo.location.country}`}
              </p>
            )}
            
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {userProfile?.meditationExperience?.level && (
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {userProfile.meditationExperience.level} meditator
                </span>
              )}
              {!user?.emailVerified && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  Email not verified
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-primary mb-2">
            {userProfile?.progress?.totalSessions || 0}
          </div>
          <div className="text-sm text-gray-600">Total Sessions</div>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-primary mb-2">
            {userProfile?.progress?.totalMinutes || 0}
          </div>
          <div className="text-sm text-gray-600">Minutes Meditated</div>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-primary mb-2">
            {userProfile?.progress?.streak || 0}
          </div>
          <div className="text-sm text-gray-600">Day Streak</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Account Summary</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Member since</span>
            <span className="font-medium">
              {userProfile?.createdAt?.toLocaleDateString() || 'Recently'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Last login</span>
            <span className="font-medium">
              {userProfile?.lastLoginAt?.toLocaleDateString() || 'Today'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Primary goal</span>
            <span className="font-medium capitalize">
              {userProfile?.goals?.primary?.replace('-', ' ') || 'Not set'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Preferred session time</span>
            <span className="font-medium">
              {userProfile?.schedule?.duration || 10} minutes
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Email Verification</h4>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 mb-1">
              Email: {user?.email}
            </p>
            <p className={`text-sm ${user?.emailVerified ? 'text-green-600' : 'text-yellow-600'}`}>
              {user?.emailVerified ? '✅ Verified' : '⚠️ Not verified'}
            </p>
          </div>
          {!user?.emailVerified && (
            <Button
              onClick={handleSendVerification}
              disabled={verificationLoading}
            >
              {verificationLoading ? 'Sending...' : 'Send Verification'}
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <h5 className="font-medium text-gray-900">Change Password</h5>
              <p className="text-sm text-gray-600">Update your account password</p>
            </div>
            <Button variant="outline">
              Change
            </Button>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <h5 className="font-medium text-gray-900">Two-Factor Authentication</h5>
              <p className="text-sm text-gray-600">Add an extra layer of security</p>
            </div>
            <Button variant="outline">
              Enable
            </Button>
          </div>
          
          <div className="flex items-center justify-between py-3">
            <div>
              <h5 className="font-medium text-gray-900">Sign Out All Devices</h5>
              <p className="text-sm text-gray-600">Sign out from all logged-in devices</p>
            </div>
            <Button variant="outline">
              Sign Out All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDataPrivacy = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <h5 className="font-medium text-gray-900">Export Your Data</h5>
              <p className="text-sm text-gray-600">Download a copy of all your data</p>
            </div>
            <Button
              onClick={handleExportData}
              disabled={exportLoading}
              variant="outline"
            >
              {exportLoading ? 'Exporting...' : 'Export'}
            </Button>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <h5 className="font-medium text-gray-900">Data Usage</h5>
              <p className="text-sm text-gray-600">View how your data is used</p>
            </div>
            <Button variant="outline">
              View Policy
            </Button>
          </div>
          
          <div className="flex items-center justify-between py-3">
            <div>
              <h5 className="font-medium text-red-900">Delete Account</h5>
              <p className="text-sm text-red-600">Permanently delete your account and all data</p>
            </div>
            <Button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h4 className="text-lg font-semibold text-blue-900 mb-2">Privacy Notice</h4>
        <p className="text-sm text-blue-800 mb-4">
          We take your privacy seriously. Your data is encrypted and stored securely. 
          We never share your personal information with third parties without your consent.
        </p>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Your meditation data stays private</li>
          <li>• We use encryption to protect your information</li>
          <li>• You can export or delete your data anytime</li>
          <li>• We follow GDPR and other privacy regulations</li>
        </ul>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'profile':
        return <ProfileForm />;
      case 'experience':
        return <MeditationExperienceForm />;
      case 'goals':
        return <GoalSettingForm />;
      case 'preferences':
        return <PreferencesForm />;
      case 'security':
        return renderSecurity();
      case 'data':
        return renderDataPrivacy();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-heading mb-2">
            Account Settings
          </h1>
          <p className="text-gray-600">
            Manage your profile, preferences, and account security.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <nav className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2 sticky top-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
              
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={signOut}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left text-red-600 hover:bg-red-50 transition-all"
                >
                  <span className="text-lg">🚪</span>
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Account Deletion Modal */}
      {showDeleteModal && (
        <AccountDeletion onClose={() => setShowDeleteModal(false)} />
      )}
    </div>
  );
};