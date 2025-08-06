import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { isProviderProfilePicture } from '../../utils/profile-sync';

export const ProfileSyncStatus: React.FC = () => {
  const { user, userProfile } = useAuth();

  if (!user || !userProfile) return null;

  const hasProviderData = user.providerData && user.providerData.length > 0;
  const syncedFromProvider = hasProviderData && (
    userProfile.displayName === user.displayName ||
    userProfile.email === user.email ||
    isProviderProfilePicture(userProfile.photoURL)
  );

  const providerNames = user.providerData?.map(provider => {
    switch (provider.providerId) {
      case 'google.com': return 'Google';
      case 'apple.com': return 'Apple';
      case 'facebook.com': return 'Facebook';
      default: return provider.providerId;
    }
  }).join(', ') || '';

  if (!hasProviderData) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
      <div className="flex items-center gap-2 text-blue-700">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-medium">Profile Sync Status</span>
      </div>
      <p className="text-blue-600 mt-1">
        {syncedFromProvider 
          ? `Profile synced from ${providerNames}` 
          : `Connected to ${providerNames} but using local profile data`
        }
      </p>
      {import.meta.env.DEV && (
        <div className="mt-2 text-xs text-blue-500 space-y-1">
          <div>Display Name: {userProfile.displayName === user.displayName ? '✓ Synced' : '○ Local'}</div>
          <div>Email: {userProfile.email === user.email ? '✓ Synced' : '○ Local'}</div>
          <div>Photo: {isProviderProfilePicture(userProfile.photoURL) ? '✓ Provider' : '○ Default/Custom'}</div>
        </div>
      )}
    </div>
  );
};