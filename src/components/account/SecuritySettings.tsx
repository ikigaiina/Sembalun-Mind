import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { authService } from '../../services/authService';
import { multiFactor, PhoneAuthProvider, PhoneMultiFactorGenerator } from 'firebase/auth';

export const SecuritySettings: React.FC = () => {
  const { user, userProfile, sendVerificationEmail, reauthenticateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [setupStep, setSetupStep] = useState<'phone' | 'verify' | 'complete'>('phone');

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [reauthForm, setReauthForm] = useState({
    password: ''
  });

  useEffect(() => {
    if (user) {
      const mfaInfo = multiFactor(user).enrolledFactors;
      setTwoFactorEnabled(mfaInfo.length > 0);
    }
  }, [user]);

  const handleSendVerification = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await sendVerificationEmail();
      setSuccess('Verification email sent! Please check your inbox.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await authService.updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setSuccess('Password updated successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordChange(false);
    } catch (err) {
      if (err instanceof Error && err.message.includes('requires-recent-login')) {
        setPendingAction('password-change');
        setShowReauthModal(true);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to update password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReauthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await reauthenticateUser(reauthForm.password);
      setShowReauthModal(false);
      setReauthForm({ password: '' });
      
      // Execute pending action
      if (pendingAction === 'password-change') {
        await authService.updatePassword(reauthForm.password, passwordForm.newPassword);
        setSuccess('Password updated successfully');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordChange(false);
      } else if (pendingAction === 'disable-2fa') {
        const mfaUser = multiFactor(user!);
        const enrolledFactors = mfaUser.enrolledFactors;
        if (enrolledFactors.length > 0) {
          await mfaUser.unenroll(enrolledFactors[0]);
          setTwoFactorEnabled(false);
          setSuccess('Two-factor authentication disabled successfully!');
        }
      }
      
      setPendingAction(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorSetup = async () => {
    if (!user) return;
    
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const session = await multiFactor(user).getSession();
      const phoneAuthCredential = PhoneAuthProvider.credential(verificationId, verificationCode);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(phoneAuthCredential);
      
      await multiFactor(user).enroll(multiFactorAssertion, session.toString());
      
      setTwoFactorEnabled(true);
      setShowTwoFactorSetup(false);
      setSetupStep('phone');
      setPhoneNumber('');
      setVerificationCode('');
      setVerificationId('');
      setSuccess('Two-factor authentication enabled successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enable two-factor authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableTwoFactor = async () => {
    if (!user) return;
    
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const mfaUser = multiFactor(user);
      const enrolledFactors = mfaUser.enrolledFactors;
      
      if (enrolledFactors.length > 0) {
        await mfaUser.unenroll(enrolledFactors[0]);
        setTwoFactorEnabled(false);
        setSuccess('Two-factor authentication disabled successfully!');
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('requires-recent-login')) {
        setPendingAction('disable-2fa');
        setShowReauthModal(true);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to disable two-factor authentication');
      }
    } finally {
      setLoading(false);
    }
  };

  const getLastSignInMethod = () => {
    if (!user) return 'Unknown';
    
    const providers = user.providerData;
    if (providers.length === 0) return 'Email/Password';
    
    const provider = providers[0];
    switch (provider.providerId) {
      case 'google.com':
        return 'Google';
      case 'apple.com':
        return 'Apple';
      case 'password':
        return 'Email/Password';
      default:
        return provider.providerId;
    }
  };

  const formatLastSignIn = () => {
    if (!user?.metadata.lastSignInTime) return 'Unknown';
    
    const date = new Date(user.metadata.lastSignInTime);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Account Status */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <div className="font-medium text-gray-900">Email Address</div>
              <div className="text-sm text-gray-600">{user?.email || 'Not set'}</div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              user?.emailVerified 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {user?.emailVerified ? '✅ Verified' : '⚠️ Unverified'}
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <div className="font-medium text-gray-900">Account Type</div>
              <div className="text-sm text-gray-600">
                {userProfile?.isGuest ? 'Guest Account' : 'Full Account'}
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              userProfile?.isGuest 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {userProfile?.isGuest ? 'Guest' : 'Member'}
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <div className="font-medium text-gray-900">Sign-in Method</div>
              <div className="text-sm text-gray-600">{getLastSignInMethod()}</div>
            </div>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <div className="font-medium text-gray-900">Last Sign-in</div>
              <div className="text-sm text-gray-600">{formatLastSignIn()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Verification */}
      {!user?.emailVerified && user?.email && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div className="flex-1">
              <h5 className="font-medium text-yellow-900 mb-2">Email Verification Required</h5>
              <p className="text-sm text-yellow-800 mb-4">
                Please verify your email address to secure your account and enable all features.
              </p>
              <Button
                size="small"
                onClick={handleSendVerification}
                disabled={loading}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                {loading ? 'Sending...' : 'Send Verification Email'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Messages */}
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

      {/* Password Management */}
      {user?.email && !userProfile?.isGuest && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Password & Authentication</h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <div className="font-medium text-gray-900">Password</div>
                <div className="text-sm text-gray-600">
                  Last updated: {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown'}
                </div>
              </div>
              <Button
                variant="outline"
                size="small"
                onClick={() => setShowPasswordChange(!showPasswordChange)}
              >
                Change Password
              </Button>
            </div>

            {showPasswordChange && (
              <form onSubmit={handlePasswordChange} className="bg-gray-50 rounded-xl p-4 space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  required
                />
                
                <Input
                  label="New Password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  required
                  minLength={6}
                />
                
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  minLength={6}
                />

                <div className="flex space-x-3">
                  <Button
                    size="small"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </Button>
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => {
                      setShowPasswordChange(false);
                      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {/* Two-Factor Authentication */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <div className="font-medium text-gray-900">Two-Factor Authentication</div>
                <div className="text-sm text-gray-600">
                  {twoFactorEnabled 
                    ? '✅ Enabled - Your account has an extra layer of security' 
                    : 'Add an extra layer of security to your account'
                  }
                </div>
              </div>
              <Button
                variant={twoFactorEnabled ? "outline" : "primary"}
                size="small"
                onClick={twoFactorEnabled ? handleDisableTwoFactor : () => setShowTwoFactorSetup(true)}
                disabled={loading}
              >
                {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
              </Button>
            </div>

            {/* Active Sessions (Placeholder) */}
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium text-gray-900">Active Sessions</div>
                <div className="text-sm text-gray-600">Manage devices signed into your account</div>
              </div>
              <Button
                variant="outline"
                size="small"
                disabled
                className="opacity-50"
              >
                Manage Sessions
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Security Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h4 className="text-lg font-semibold text-blue-900 mb-4">Security Best Practices</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start space-x-2">
            <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Use a strong, unique password for your account</span>
          </li>
          <li className="flex items-start space-x-2">
            <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Keep your email address verified and up to date</span>
          </li>
          <li className="flex items-start space-x-2">
            <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Sign out of shared or public devices</span>
          </li>
          <li className="flex items-start space-x-2">
            <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Review your privacy settings regularly</span>
          </li>
        </ul>
      </div>

      {/* Two-Factor Authentication Setup Modal */}
      {showTwoFactorSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Enable Two-Factor Authentication
              </h3>
              <p className="text-sm text-gray-600">
                Add an extra layer of security by requiring a verification code from your phone.
              </p>
            </div>

            {setupStep === 'phone' && (
              <div className="space-y-4">
                <Input
                  label="Phone Number"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+62 812 3456 7890"
                  required
                />
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    📱 We'll send a verification code to this number. Standard SMS rates may apply.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={() => setSetupStep('verify')}
                    disabled={!phoneNumber || loading}
                    className="flex-1"
                  >
                    Send Code
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowTwoFactorSetup(false);
                      setSetupStep('phone');
                      setPhoneNumber('');
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {setupStep === 'verify' && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Enter the verification code sent to <strong>{phoneNumber}</strong>
                  </p>
                </div>

                <Input
                  label="Verification Code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  required
                  autoFocus
                />

                <div className="flex space-x-3">
                  <Button
                    onClick={handleTwoFactorSetup}
                    disabled={!verificationCode || loading}
                    className="flex-1"
                  >
                    {loading ? 'Verifying...' : 'Verify & Enable'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSetupStep('phone')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-700"
                    onClick={() => setSetupStep('phone')}
                  >
                    Change phone number
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reauthentication Modal */}
      {showReauthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Confirm Your Identity
              </h3>
              <p className="text-sm text-gray-600">
                Please enter your password to continue with this security action.
              </p>
            </div>

            <form onSubmit={handleReauthenticate} className="space-y-4">
              <Input
                label="Password"
                type="password"
                value={reauthForm.password}
                onChange={(e) => setReauthForm({ password: e.target.value })}
                required
                autoFocus
              />

              <div className="flex space-x-3">
                <Button
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Verifying...' : 'Confirm'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReauthModal(false);
                    setPendingAction(null);
                    setReauthForm({ password: '' });
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};