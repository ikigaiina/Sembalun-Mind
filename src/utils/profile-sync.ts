import type { UserProfile } from '../types/auth';

export interface ProfileSyncResult {
  updates: Partial<UserProfile>;
  hasChanges: boolean;
}

export const syncProfileFromProvider = async (
  providerUser: any, 
  existingProfile?: UserProfile | null
): Promise<ProfileSyncResult> => {
  const updates: Partial<UserProfile> = {};
  let hasChanges = false;

  // Sync display name if available from provider
  if (providerUser.user_metadata?.full_name && 
      providerUser.user_metadata.full_name !== existingProfile?.displayName) {
    updates.displayName = providerUser.user_metadata.full_name;
    hasChanges = true;
  }

  // Sync email if available from provider
  if (providerUser.email && 
      providerUser.email !== existingProfile?.email) {
    updates.email = providerUser.email;
    hasChanges = true;
  }

  // Sync profile picture from provider if available
  if (providerUser.user_metadata?.avatar_url) {
    if (!existingProfile?.photoURL || existingProfile.photoURL !== providerUser.user_metadata.avatar_url) {
      updates.photoURL = providerUser.user_metadata.avatar_url;
      hasChanges = true;
    }
  }

  return { updates, hasChanges };
};

export const getDefaultProfilePictureUrl = (): string => {
  // Return a data URL or placeholder for the default Sembalun profile picture
  // This could be used as a fallback when no provider photo is available
  return '/default-profile.svg'; // Assuming we'd create an SVG file
};

export const isProviderProfilePicture = (photoURL: string | null): boolean => {
  if (!photoURL) return false;
  
  const providerDomains = [
    'googleusercontent.com',
    'platform.lookaside.facebook.com',
    'graph.facebook.com',
    'pbs.twimg.com', // Twitter
    'abs.twimg.com', // Twitter
    'cdn.auth0.com',
    'avatars.githubusercontent.com' // GitHub
  ];
  
  return providerDomains.some(domain => photoURL.includes(domain));
};