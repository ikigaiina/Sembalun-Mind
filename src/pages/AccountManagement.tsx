import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Shield, Settings, Download, Trash2, Edit3, Save, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';

interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  avatar?: string;
  location?: string;
  timezone: string;
  language: 'id' | 'en';
  joinedAt: Date;
  lastLoginAt: Date;
  emailVerified: boolean;
  phoneVerified: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  dataEncryption: boolean;
  sessionTimeout: number; // minutes
  loginHistory: Array<{
    timestamp: Date;
    device: string;
    location: string;
    ipAddress: string;
  }>;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  analyticsOptIn: boolean;
  marketingEmails: boolean;
  pushNotifications: boolean;
  dataSharing: boolean;
  activityLogging: boolean;
}

interface SubscriptionInfo {
  plan: 'free' | 'premium' | 'premium_plus';
  status: 'active' | 'cancelled' | 'expired';
  startDate: Date;
  endDate?: Date;
  renewalDate?: Date;
  paymentMethod?: string;
  features: string[];
}

const AccountManagement: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'privacy' | 'subscription' | 'data'>('profile');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Mock data - in real app, fetch from user service
    setTimeout(() => {
      setUserProfile({
        id: user?.uid || 'user123',
        email: user?.email || 'user@example.com',
        displayName: user?.displayName || 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+62812345678',
        dateOfBirth: new Date('1990-01-15'),
        avatar: user?.photoURL || undefined,
        location: 'Jakarta, Indonesia',
        timezone: 'Asia/Jakarta',
        language: 'id',
        joinedAt: new Date('2023-06-15'),
        lastLoginAt: new Date(),
        emailVerified: user?.emailVerified || false,
        phoneVerified: true
      });

      setSecuritySettings({
        twoFactorEnabled: false,
        loginNotifications: true,
        dataEncryption: true,
        sessionTimeout: 60,
        loginHistory: [
          {
            timestamp: new Date(),
            device: 'Chrome on Windows',
            location: 'Jakarta, Indonesia',
            ipAddress: '192.168.1.1'
          },
          {
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            device: 'Mobile App on Android',
            location: 'Jakarta, Indonesia',
            ipAddress: '192.168.1.2'
          }
        ]
      });

      setPrivacySettings({
        profileVisibility: 'private',
        analyticsOptIn: true,
        marketingEmails: false,
        pushNotifications: true,
        dataSharing: false,
        activityLogging: true
      });

      setSubscriptionInfo({
        plan: 'premium',
        status: 'active',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        renewalDate: new Date('2024-12-31'),
        paymentMethod: '**** **** **** 1234',
        features: [
          'Unlimited meditation sessions',
          'Premium content library',
          'Advanced analytics',
          'Priority support',
          'Offline downloads'
        ]
      });

      setIsLoading(false);
    }, 1000);
  }, [user]);

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'security' as const, label: 'Security', icon: Shield },
    { id: 'privacy' as const, label: 'Privacy', icon: Settings },
    { id: 'subscription' as const, label: 'Subscription', icon: CheckCircle },
    { id: 'data' as const, label: 'Data & Export', icon: Download }
  ];

  const handleSaveProfile = async () => {
    try {
      // In real app, call update profile API
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      setMessage({ type: 'error', text: 'Please type DELETE to confirm account deletion.' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    try {
      // In real app, call delete account API
      setMessage({ type: 'success', text: 'Account deletion initiated. You will receive a confirmation email.' });
      setShowDeleteModal(false);
      setTimeout(() => setMessage(null), 5000);
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete account. Please contact support.' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleExportData = async (format: 'json' | 'csv' | 'pdf') => {
    try {
      // In real app, call export API
      setMessage({ type: 'success', text: `Data export in ${format.toUpperCase()} format has been initiated. You will receive a download link via email.` });
      setTimeout(() => setMessage(null), 5000);
    } catch {
      setMessage({ type: 'error', text: 'Failed to export data. Please try again.' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading account information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Management</h1>
          <p className="text-gray-600">Manage your profile, security, and privacy settings</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message Banner */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <AlertTriangle className="w-5 h-5 mr-2" />
              )}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as 'profile' | 'security' | 'privacy' | 'subscription' | 'data')}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'bg-primary text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                  <div className="flex space-x-2">
                    {isEditing ? (
                      <>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSaveProfile}>
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" onClick={() => setIsEditing(true)}>
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <Input
                      value={userProfile?.firstName || ''}
                      onChange={(e) => setUserProfile(prev => prev ? { ...prev, firstName: e.target.value } : null)}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <Input
                      value={userProfile?.lastName || ''}
                      onChange={(e) => setUserProfile(prev => prev ? { ...prev, lastName: e.target.value } : null)}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <Input
                        value={userProfile?.email || ''}
                        onChange={(e) => setUserProfile(prev => prev ? { ...prev, email: e.target.value } : null)}
                        disabled={!isEditing}
                        type="email"
                      />
                      {userProfile?.emailVerified ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Button variant="outline" size="small">Verify</Button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <Input
                        value={userProfile?.phoneNumber || ''}
                        onChange={(e) => setUserProfile(prev => prev ? { ...prev, phoneNumber: e.target.value } : null)}
                        disabled={!isEditing}
                        type="tel"
                      />
                      {userProfile?.phoneVerified ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Button variant="outline" size="small">Verify</Button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <Input
                      value={userProfile?.location || ''}
                      onChange={(e) => setUserProfile(prev => prev ? { ...prev, location: e.target.value } : null)}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <Input
                        value={userProfile?.dateOfBirth?.toISOString().split('T')[0] || ''}
                        onChange={(e) => setUserProfile(prev => prev ? { ...prev, dateOfBirth: new Date(e.target.value) } : null)}
                        disabled={!isEditing}
                        type="date"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select
                      value={userProfile?.language || 'id'}
                      onChange={(e) => setUserProfile(prev => prev ? { ...prev, language: e.target.value as 'id' | 'en' } : null)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50"
                    >
                      <option value="id">Bahasa Indonesia</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Joined:</span>
                      <span className="ml-2 font-medium">{userProfile?.joinedAt.toLocaleDateString('id-ID')}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Login:</span>
                      <span className="ml-2 font-medium">{userProfile?.lastLoginAt.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                      </div>
                      <Button variant={securitySettings?.twoFactorEnabled ? 'outline' : 'primary'}>
                        {securitySettings?.twoFactorEnabled ? 'Disable' : 'Enable'}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Login Notifications</h3>
                        <p className="text-sm text-gray-600">Get notified when someone logs into your account</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={securitySettings?.loginNotifications}
                          onChange={(e) => setSecuritySettings(prev => prev ? { ...prev, loginNotifications: e.target.checked } : null)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary peer-focus:ring-opacity-25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Session Timeout</h3>
                        <p className="text-sm text-gray-600">Automatically log out after inactivity</p>
                      </div>
                      <select
                        value={securitySettings?.sessionTimeout}
                        onChange={(e) => setSecuritySettings(prev => prev ? { ...prev, sessionTimeout: parseInt(e.target.value) } : null)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={240}>4 hours</option>
                        <option value={480}>8 hours</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button variant="outline" className="w-full">
                      Change Password
                    </Button>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Login Activity</h3>
                  <div className="space-y-3">
                    {securitySettings?.loginHistory.map((login, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{login.device}</p>
                          <p className="text-sm text-gray-600">{login.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {login.timestamp.toLocaleDateString('id-ID')}
                          </p>
                          <p className="text-xs text-gray-500">{login.ipAddress}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Privacy Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Profile Visibility</h3>
                    <div className="space-y-2">
                      {(['public', 'friends', 'private'] as const).map((option) => (
                        <label key={option} className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="profileVisibility"
                            value={option}
                            checked={privacySettings?.profileVisibility === option}
                            onChange={(e) => setPrivacySettings(prev => prev ? { ...prev, profileVisibility: e.target.value as 'public' | 'friends' | 'private' } : null)}
                            className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                          />
                          <span className="capitalize text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { key: 'analyticsOptIn', label: 'Analytics & Performance', description: 'Help improve the app by sharing usage data' },
                      { key: 'marketingEmails', label: 'Marketing Emails', description: 'Receive promotional emails and newsletters' },
                      { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive meditation reminders and updates' },
                      { key: 'dataSharing', label: 'Data Sharing', description: 'Share anonymized data with research partners' },
                      { key: 'activityLogging', label: 'Activity Logging', description: 'Log your app activity for personalization' }
                    ].map((setting) => (
                      <div key={setting.key} className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{setting.label}</h3>
                          <p className="text-sm text-gray-600">{setting.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={privacySettings?.[setting.key as keyof PrivacySettings] as boolean}
                            onChange={(e) => setPrivacySettings(prev => prev ? { ...prev, [setting.key]: e.target.checked } : null)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary peer-focus:ring-opacity-25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'subscription' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Subscription Information</h2>
                  
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 capitalize">{subscriptionInfo?.plan} Plan</h3>
                      <p className="text-sm text-gray-600 capitalize">Status: {subscriptionInfo?.status}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      subscriptionInfo?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {subscriptionInfo?.status}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <span className="text-gray-600">Start Date:</span>
                      <span className="ml-2 font-medium">{subscriptionInfo?.startDate.toLocaleDateString('id-ID')}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">End Date:</span>
                      <span className="ml-2 font-medium">{subscriptionInfo?.endDate?.toLocaleDateString('id-ID')}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Next Renewal:</span>
                      <span className="ml-2 font-medium">{subscriptionInfo?.renewalDate?.toLocaleDateString('id-ID')}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="ml-2 font-medium">{subscriptionInfo?.paymentMethod}</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Plan Features</h4>
                    <ul className="space-y-2">
                      {subscriptionInfo?.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex space-x-3">
                    <Button variant="primary">Upgrade Plan</Button>
                    <Button variant="outline">Update Payment</Button>
                    <Button variant="outline">Cancel Subscription</Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Data Export</h2>
                  
                  <p className="text-gray-600 mb-6">
                    Export your meditation data, progress, and account information. 
                    The export will include all your sessions, mood entries, achievements, and settings.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Button
                      variant="outline"
                      onClick={() => handleExportData('json')}
                      className="flex flex-col items-center p-6 h-auto"
                    >
                      <Download className="w-8 h-8 mb-2" />
                      <span className="font-medium">JSON Export</span>
                      <span className="text-sm text-gray-500">Machine readable format</span>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => handleExportData('csv')}
                      className="flex flex-col items-center p-6 h-auto"
                    >
                      <Download className="w-8 h-8 mb-2" />
                      <span className="font-medium">CSV Export</span>
                      <span className="text-sm text-gray-500">Spreadsheet format</span>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => handleExportData('pdf')}
                      className="flex flex-col items-center p-6 h-auto"
                    >
                      <Download className="w-8 h-8 mb-2" />
                      <span className="font-medium">PDF Report</span>
                      <span className="text-sm text-gray-500">Human readable report</span>
                    </Button>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-red-800 mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Danger Zone
                  </h3>
                  
                  <p className="text-red-700 mb-4">
                    Once you delete your account, there is no going back. This will permanently delete your profile, 
                    meditation history, and all associated data.
                  </p>

                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Account</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-medium text-gray-900">Delete Account</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <strong>DELETE</strong> to confirm:
              </label>
              <Input
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE"
              />
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== 'DELETE'}
                className="flex-1"
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountManagement;