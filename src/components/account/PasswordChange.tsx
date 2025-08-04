import React, { useState } from 'react';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../ui/Input';

interface PasswordChangeProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const PasswordChange: React.FC<PasswordChangeProps> = ({
  onSuccess,
  onError
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;

    // Check if passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      onError?.('New passwords do not match');
      return;
    }

    // Check password strength
    if (formData.newPassword.length < 6) {
      onError?.('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      // Re-authenticate user first
      const credential = EmailAuthProvider.credential(user.email, formData.currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, formData.newPassword);

      // Clear form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      onSuccess?.();
    } catch (error: unknown) {
      console.error('Error updating password:', error);
      
      const err = error as { code: string; message: string };
      if (err.code === 'auth/wrong-password') {
        onError?.('Current password is incorrect');
      } else if (err.code === 'auth/weak-password') {
        onError?.('New password is too weak');
      } else {
        onError?.('Failed to update password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  // Only show for email/password users (not Google auth users)
  if (!user?.email || user.providerData[0]?.providerId === 'google.com') {
    return null;
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Current Password"
          type="password"
          value={formData.currentPassword}
          onChange={handleInputChange('currentPassword')}
          placeholder="Enter your current password"
          required
        />
        
        <Input
          label="New Password"
          type="password"
          value={formData.newPassword}
          onChange={handleInputChange('newPassword')}
          placeholder="Enter new password (min 6 characters)"
          required
        />
        
        <Input
          label="Confirm New Password"
          type="password"
          value={formData.confirmPassword}
          onChange={handleInputChange('confirmPassword')}
          placeholder="Confirm your new password"
          required
        />
        
        <button
          type="submit"
          disabled={loading || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
          className="w-full bg-primary text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Updating Password...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};