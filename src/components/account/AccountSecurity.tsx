import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

interface LoginInfo {
  lastLogin: Date;
  provider: string;
  emailVerified: boolean;
  createdAt: Date;
}

export const AccountSecurity: React.FC = () => {
  const { user, userProfile, resetPassword } = useAuth();
  const [loginInfo, setLoginInfo] = useState<LoginInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setLoginInfo({
        lastLogin: userProfile?.lastLoginAt || new Date(),
        provider: user.providerData[0]?.providerId || 'email',
        emailVerified: user.emailVerified,
        createdAt: userProfile?.createdAt || new Date()
      });
    }
  }, [user, userProfile]);

  const handleSendPasswordReset = async () => {
    if (!user?.email) return;

    setLoading(true);
    setMessage('');

    try {
      await resetPassword(user.email);
      setMessage('Password reset email sent successfully!');
    } catch (error) {
      console.error('Error sending password reset:', error);
      setMessage('Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  const getProviderName = (providerId: string) => {
    switch (providerId) {
      case 'google.com':
        return 'Google';
      case 'password':
        return 'Email/Password';
      default:
        return 'Unknown';
    }
  };

  if (!user || !loginInfo) {
    return null;
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Account Security</h3>
      
      {/* Account Information */}
      <div className="space-y-4">
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
          <div>
            <div className="font-medium text-gray-900">Email Address</div>
            <div className="text-sm text-gray-600">{user.email}</div>
          </div>
          <div className="flex items-center gap-2">
            {loginInfo.emailVerified ? (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                Verified
              </span>
            ) : (
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                Unverified
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
          <div>
            <div className="font-medium text-gray-900">Sign-in Method</div>
            <div className="text-sm text-gray-600">{getProviderName(loginInfo.provider)}</div>
          </div>
          <div className="flex items-center gap-2">
            {loginInfo.provider === 'google.com' ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
          <div>
            <div className="font-medium text-gray-900">Account Created</div>
            <div className="text-sm text-gray-600">
              {loginInfo.createdAt.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
          <div>
            <div className="font-medium text-gray-900">Last Sign In</div>
            <div className="text-sm text-gray-600">
              {loginInfo.lastLogin.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Security Actions */}
      {loginInfo.provider === 'password' && (
        <div className="border-t pt-6">
          <h4 className="font-medium text-gray-900 mb-4">Security Actions</h4>
          
          {message && (
            <div className={`mb-4 p-3 rounded-2xl text-sm ${
              message.includes('successfully') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}
          
          <Button
            variant="outline"
            onClick={handleSendPasswordReset}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Sending...' : 'Send Password Reset Email'}
          </Button>
        </div>
      )}
    </div>
  );
};