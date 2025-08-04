import type { User as FirebaseUser } from 'firebase/auth';
import type { UserProfile } from '../types/auth';

export interface ProfileSyncResult {
  updates: Partial<UserProfile>;
  hasChanges: boolean;
}

export const syncProfileFromProvider = async (
  firebaseUser: FirebaseUser, 
  existingProfile?: UserProfile | null
): Promise<ProfileSyncResult> => {
  const updates: Partial<UserProfile> = {};
  let hasChanges = false;

  // Sync display name if available from provider
  if (firebaseUser.displayName && 
      firebaseUser.displayName !== existingProfile?.displayName) {
    updates.displayName = firebaseUser.displayName;
    hasChanges = true;
  }

  // Sync email if available from provider
  if (firebaseUser.email && 
      firebaseUser.email !== existingProfile?.email) {
    updates.email = firebaseUser.email;
    hasChanges = true;
  }

  // Sync profile picture from provider if available and no custom picture is set
  if (firebaseUser.photoURL) {
    // Only update if:
    // 1. No existing photo URL, OR
    // 2. Existing photo is from a provider (contains 'googleusercontent' or 'platform.lookaside'), OR
    // 3. This is a new user (no existing profile)
    const isProviderPhoto = existingProfile?.photoURL?.includes('googleusercontent') ||
                           existingProfile?.photoURL?.includes('platform.lookaside') ||
                           existingProfile?.photoURL?.includes('graph.facebook') ||
                           existingProfile?.photoURL?.includes('twimg.com');
    
    if (!existingProfile?.photoURL || isProviderPhoto || !existingProfile) {
      updates.photoURL = firebaseUser.photoURL;
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