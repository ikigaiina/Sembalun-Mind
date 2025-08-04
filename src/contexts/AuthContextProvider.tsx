import React, { useEffect, useState, useCallback, useMemo } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  deleteUser,
  setPersistence,
  browserLocalPersistence,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, googleProvider, appleProvider } from '../config/firebase';
import type { AuthContextType, UserProfile } from '../types/auth';
import { AuthError } from '../utils/auth-error';
import { AuthContext } from './AuthContext';
import { syncProfileFromProvider as syncProfileUtil } from '../utils/profile-sync';

// Memoized default objects to prevent recreation on every render
const createDefaultPreferences = () => ({
  theme: 'auto' as const,
  language: 'en' as const,
  notifications: {
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
  privacy: {
    analytics: false,
    dataSharing: false,
    profileVisibility: 'private' as const,
    shareProgress: false,
    locationTracking: false,
  },
  meditation: {
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
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium' as const,
    screenReader: false,
    keyboardNavigation: false,
  },
  display: {
    dateFormat: 'DD/MM/YYYY' as const,
    timeFormat: '24h' as const,
    weekStartsOn: 'monday' as const,
    showStreaks: true,
    showStatistics: true,
  },
  downloadPreferences: {
    autoDownload: false,
    wifiOnly: true,
    storageLimit: 1, // 1GB default
  },
});

const createDefaultProgress = () => ({
  totalSessions: 0,
  totalMinutes: 0,
  streak: 0,
  longestStreak: 0,
  achievements: [],
  lastSessionDate: null,
  favoriteCategories: [],
  completedPrograms: [],
});

// Error Boundary for Auth Provider
class AuthErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): { hasError: boolean; error: Error } {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Auth Provider Error:', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center max-w-md p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.732 0L3.125 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
            <p className="text-gray-600 mb-4">There was an issue with the authentication system. Please refresh the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return <>{this.props.children}</>;
  }
}

const AuthProviderComponent: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Handle case where auth might be null (during SSR or initialization failures)
  const [user, loading] = useAuthState(auth || undefined);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const migrateGuestData = useCallback(async (): Promise<void> => {
    if (!user || isGuest) {
      throw new Error('User must be authenticated to migrate guest data');
    }

    const guestDataStr = localStorage.getItem('guestUserData');
    if (!guestDataStr) {
      console.log('No guest data found to migrate');
      return;
    }

    try {
      const guestData = JSON.parse(guestDataStr);
      
      // Get current user profile
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const currentData = userDoc.data();
        
        // Merge guest progress with current user data
        const mergedProgress = {
          totalSessions: (currentData.progress?.totalSessions || 0) + (guestData.progress?.totalSessions || 0),
          totalMinutes: (currentData.progress?.totalMinutes || 0) + (guestData.progress?.totalMinutes || 0),
          streak: Math.max(currentData.progress?.streak || 0, guestData.progress?.streak || 0),
          longestStreak: Math.max(currentData.progress?.longestStreak || 0, guestData.progress?.longestStreak || 0),
          achievements: [...new Set([
            ...(currentData.progress?.achievements || []),
            ...(guestData.progress?.achievements || [])
          ])],
          lastSessionDate: guestData.progress?.lastSessionDate ? 
            new Date(guestData.progress.lastSessionDate) : currentData.progress?.lastSessionDate,
          favoriteCategories: [...new Set([
            ...(currentData.progress?.favoriteCategories || []),
            ...(guestData.progress?.favoriteCategories || [])
          ])],
          completedPrograms: [...new Set([
            ...(currentData.progress?.completedPrograms || []),
            ...(guestData.progress?.completedPrograms || [])
          ])]
        };

        // Merge preferences (guest preferences take priority for things the user set)
        const mergedPreferences = {
          ...currentData.preferences,
          ...guestData.preferences
        };

        await updateDoc(userDocRef, {
          progress: mergedProgress,
          preferences: mergedPreferences,
          lastLoginAt: serverTimestamp(),
        });

        // Update local state
        setUserProfile(prev => prev ? {
          ...prev,
          progress: mergedProgress,
          preferences: mergedPreferences
        } : null);

        // Clear guest data after successful migration
        localStorage.removeItem('guestUserData');
        
        console.log('Guest data migrated successfully');
      }
    } catch (error) {
      console.error('Error migrating guest data:', error);
      throw new AuthError('migration-failed', 'Failed to migrate guest data');
    }
  }, [user, isGuest]);

  // Set auth persistence on initialization - only if auth is available
  useEffect(() => {
    if (auth) {
      setPersistence(auth, browserLocalPersistence).catch(console.error);
    }
  }, []);

  // Load guest data from localStorage on startup
  useEffect(() => {
    const guestDataStr = localStorage.getItem('guestUserData');
    if (guestDataStr && !user) {
      try {
        const guestData = JSON.parse(guestDataStr);
        setIsGuest(true);
        setUserProfile({
          ...guestData,
          createdAt: new Date(guestData.createdAt),
          lastLoginAt: new Date(guestData.lastLoginAt),
        });
      } catch (error) {
        console.error('Error loading guest data:', error);
        localStorage.removeItem('guestUserData');
      }
    }
  }, [user]);


  useEffect(() => {
    const loadUserProfile = async (firebaseUser: FirebaseUser) => {
      setProfileLoading(true);
      try {
        if (!db) {
          console.error('Firestore not initialized, cannot load user profile');
          return;
        }
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        
        if (userDoc.exists()) {
          let profileData = userDoc.data();
          const existingProfile = {
            ...profileData,
            uid: firebaseUser.uid,
            createdAt: profileData.createdAt?.toDate() || new Date(),
            lastLoginAt: profileData.lastLoginAt?.toDate() || new Date(),
          } as UserProfile;
          
          // Sync profile data from external provider
          const syncResult = await syncProfileUtil(firebaseUser, existingProfile);
          
          if (syncResult.hasChanges) {
            await updateDoc(doc(db, 'users', firebaseUser.uid), {
              ...syncResult.updates,
              lastLoginAt: serverTimestamp(),
            });
            
            profileData = { ...profileData, ...syncResult.updates };
          } else {
            // Just update last login
            await updateDoc(doc(db, 'users', firebaseUser.uid), {
              lastLoginAt: serverTimestamp(),
            });
          }
          
          setUserProfile({
            ...profileData,
            uid: firebaseUser.uid,
            createdAt: profileData.createdAt?.toDate() || new Date(),
            lastLoginAt: profileData.lastLoginAt?.toDate() || new Date(),
            progress: {
              ...profileData.progress,
              lastSessionDate: profileData.progress?.lastSessionDate?.toDate() || null,
            },
          } as UserProfile);
        } else {
          // Create new user profile with provider data
          const syncResult = await syncProfileUtil(firebaseUser, null);
          
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || null,
            displayName: firebaseUser.displayName || null,
            photoURL: firebaseUser.photoURL || null,
            createdAt: new Date(),
            lastLoginAt: new Date(),
            isGuest: false,
            preferences: createDefaultPreferences(),
            progress: createDefaultProgress(),
            // Ensure all optional progress fields start at zero/empty for new users
            totalMeditationMinutes: 0,
            completedSessions: [],
            completedCourses: [],
            currentStreak: 0,
            ...syncResult.updates, // Apply provider updates
          };
          
          await setDoc(doc(db, 'users', firebaseUser.uid), {
            ...newProfile,
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
          });
          
          setUserProfile(newProfile);

          // Check if there's guest data to migrate
          const guestDataStr = localStorage.getItem('guestUserData');
          if (guestDataStr) {
            try {
              await migrateGuestData();
            } catch (error) {
              console.error('Auto-migration failed, guest data preserved:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    if (user && !isGuest) {
      loadUserProfile(user);
    } else if (!user) {
      setUserProfile(null);
      setIsGuest(false);
    }
  }, [user, isGuest, migrateGuestData]);

  const signInWithGoogle = useCallback(async (): Promise<void> => {
    if (!auth || !googleProvider) {
      throw new AuthError('auth/unavailable', 'Authentication services are not available');
    }
    try {
      await signInWithPopup(auth, googleProvider);
      setIsGuest(false);
    } catch (error: unknown) {
      const err = error as { code: string; message: string };
      throw new AuthError(err.code, err.message);
    }
  }, []);

  const signInWithApple = useCallback(async (): Promise<void> => {
    if (!auth || !appleProvider) {
      throw new AuthError('auth/unavailable', 'Authentication services are not available');
    }
    try {
      await signInWithPopup(auth, appleProvider);
      setIsGuest(false);
    } catch (error: unknown) {
      const err = error as { code: string; message: string };
      throw new AuthError(err.code, err.message);
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string): Promise<void> => {
    if (!auth) {
      throw new AuthError('auth/unavailable', 'Authentication services are not available');
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsGuest(false);
    } catch (error: unknown) {
      const err = error as { code: string; message: string };
      throw new AuthError(err.code, err.message);
    }
  }, []);

  const signUpWithEmail = useCallback(async (
    email: string, 
    password: string, 
    displayName: string
  ): Promise<void> => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      
      // Send email verification
      await sendEmailVerification(result.user);
      
      setIsGuest(false);
    } catch (error: unknown) {
      const err = error as { code: string; message: string };
      throw new AuthError(err.code, err.message);
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      setUserProfile(null);
      setIsGuest(false);
    } catch (error: unknown) {
      const err = error as { code: string; message: string };
      throw new AuthError(err.code, err.message);
    }
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: unknown) {
      const err = error as { code: string; message: string };
      throw new AuthError(err.code, err.message);
    }
  }, []);

  const continueAsGuest = useCallback((): void => {
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const guestData = {
      uid: guestId,
      email: null,
      displayName: 'Tamu',
      photoURL: null,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      isGuest: true,
      preferences: createDefaultPreferences(),
      progress: createDefaultProgress(),
      // Ensure all optional progress fields start at zero/empty for guest users too
      totalMeditationMinutes: 0,
      completedSessions: [],
      completedCourses: [],
      currentStreak: 0,
    };

    // Store guest data in localStorage for migration later
    localStorage.setItem('guestUserData', JSON.stringify({
      ...guestData,
      createdAt: guestData.createdAt.toISOString(),
      lastLoginAt: guestData.lastLoginAt.toISOString(),
    }));

    setIsGuest(true);
    setUserProfile(guestData);
  }, []);

  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>): Promise<void> => {
    if (isGuest) {
      // Update guest profile in localStorage
      const updatedProfile = { ...userProfile, ...updates } as UserProfile;
      setUserProfile(updatedProfile);
      localStorage.setItem('guestUserData', JSON.stringify({
        ...updatedProfile,
        createdAt: updatedProfile?.createdAt?.toISOString() || new Date().toISOString(),
        lastLoginAt: updatedProfile?.lastLoginAt?.toISOString() || new Date().toISOString(),
      }));
      return;
    }

    if (!user) {
      throw new Error('User must be authenticated to update profile');
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        ...updates,
        lastLoginAt: serverTimestamp(),
      });

      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (error: unknown) {
      const err = error as { code: string; message: string };
      throw new AuthError(err.code, err.message);
    }
  }, [user, isGuest, userProfile]);

  const deleteAccount = useCallback(async (): Promise<void> => {
    if (!user || isGuest) {
      throw new Error('User must be authenticated to delete account');
    }

    try {
      // Delete all user subcollections and documents
      // Note: In production, you should use a Cloud Function for this
      // to ensure all data is properly deleted
      
      // Delete user profile from Firestore
      await deleteDoc(doc(db, 'users', user.uid));
      
      // TODO: Delete user subcollections (sessions, journal, etc.)
      // This should be handled by Cloud Functions in production
      // const batch = writeBatch(db);
      // const sessionsRef = collection(db, 'users', user.uid, 'sessions');
      // const journalRef = collection(db, 'users', user.uid, 'journal');
      // ... batch delete operations
      
      console.log('Account deletion: User data marked for deletion');
      
      // Delete Firebase Auth user (this must be last)
      await deleteUser(user);
      
      setUserProfile(null);
      setIsGuest(false);
      
      console.log('Account deletion completed successfully');
    } catch (error: unknown) {
      const err = error as { code: string; message: string };
      console.error('Account deletion error:', err);
      
      if (err.code === 'auth/requires-recent-login') {
        throw new AuthError(err.code, 'Please sign in again before deleting your account for security reasons.');
      }
      
      throw new AuthError(err.code, err.message);
    }
  }, [user, isGuest]);

  const exportUserData = useCallback(async (): Promise<string> => {
    if (!userProfile) {
      throw new Error('No user data to export');
    }

    // Get additional user data from Firestore if needed
    const sessions: unknown[] = [];
    const journalEntries: unknown[] = [];
    
    try {
      // You could fetch sessions and journal entries here if they exist
      // const sessionsSnapshot = await getDocs(collection(db, 'users', user!.uid, 'sessions'));
      // sessions = sessionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // const journalSnapshot = await getDocs(collection(db, 'users', user!.uid, 'journal'));
      // journalEntries = journalSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.warn('Could not fetch additional user data for export:', error);
    }

    const exportData = {
      profile: {
        ...userProfile,
        // Convert dates to ISO strings for JSON export
        createdAt: userProfile.createdAt.toISOString(),
        lastLoginAt: userProfile.lastLoginAt.toISOString(),
        progress: {
          ...userProfile.progress,
          lastSessionDate: userProfile.progress.lastSessionDate?.toISOString() || null,
        }
      },
      sessions,
      journalEntries,
      exportInfo: {
        exportedAt: new Date().toISOString(),
        appVersion: '1.0.0',
        format: 'JSON',
        dataVersion: '1.0'
      }
    };

    return JSON.stringify(exportData, null, 2);
  }, [userProfile]);

  const sendVerificationEmail = useCallback(async (): Promise<void> => {
    if (!user || isGuest) {
      throw new Error('User must be authenticated to send verification email');
    }

    try {
      await sendEmailVerification(user);
    } catch (error: unknown) {
      const err = error as { code: string; message: string };
      throw new AuthError(err.code, err.message);
    }
  }, [user, isGuest]);

  const reauthenticateUser = useCallback(async (password: string): Promise<void> => {
    if (!user || isGuest || !user.email) {
      throw new Error('User must be authenticated with email/password to reauthenticate');
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
    } catch (error: unknown) {
      const err = error as { code: string; message: string };
      throw new AuthError(err.code, err.message);
    }
  }, [user, isGuest]);

  // Memoize auth methods to prevent recreation on every render
  const authMethods = useMemo(() => ({
    signInWithGoogle,
    signInWithApple,
  }), [signInWithGoogle, signInWithApple]);

  // Memoize context value to prevent unnecessary re-renders of consuming components
  const value = useMemo((): AuthContextType => ({
    user: user || null,
    userProfile,
    loading: loading || profileLoading,
    isGuest,
    signInWithGoogle,
    signInWithApple,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    resetPassword,
    continueAsGuest,
    updateUserProfile,
    deleteAccount,
    exportUserData,
    migrateGuestData,
    sendVerificationEmail,
    reauthenticateUser,
  }), [
    user,
    userProfile,
    loading,
    profileLoading,
    isGuest,
    signInWithGoogle,
    signInWithApple,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    resetPassword,
    continueAsGuest,
    updateUserProfile,
    deleteAccount,
    exportUserData,
    migrateGuestData,
    sendVerificationEmail,
    reauthenticateUser,
  ]);

  return (
    <AuthErrorBoundary>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </AuthErrorBoundary>
  );
};

// Memoize the component to prevent unnecessary re-renders when props haven't changed
export const AuthProvider = React.memo(AuthProviderComponent);