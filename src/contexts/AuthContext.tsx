import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  deleteUser
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
import { auth, db, googleProvider } from '../config/firebase';
import type { AuthContextType, UserProfile } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultPreferences = {
  theme: 'auto' as const,
  language: 'en' as const,
  notifications: {
    daily: true,
    reminders: true,
    achievements: true,
  },
  privacy: {
    analytics: false,
    dataSharing: false,
  },
  meditation: {
    defaultDuration: 10,
    preferredVoice: 'default',
    backgroundSounds: true,
  },
};

const defaultProgress = {
  totalSessions: 0,
  totalMinutes: 0,
  streak: 0,
  longestStreak: 0,
  achievements: [],
  lastSessionDate: null,
  favoriteCategories: [],
  completedPrograms: [],
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, loading] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    const loadUserProfile = async (firebaseUser: FirebaseUser) => {
      setProfileLoading(true);
      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        
        if (userDoc.exists()) {
          const profileData = userDoc.data();
          setUserProfile({
            ...profileData,
            createdAt: profileData.createdAt?.toDate() || new Date(),
            lastLoginAt: profileData.lastLoginAt?.toDate() || new Date(),
            progress: {
              ...profileData.progress,
              lastSessionDate: profileData.progress?.lastSessionDate?.toDate() || null,
            },
          } as UserProfile);
        } else {
          // Create new user profile
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            createdAt: new Date(),
            lastLoginAt: new Date(),
            isGuest: false,
            preferences: defaultPreferences,
            progress: defaultProgress,
          };
          
          await setDoc(doc(db, 'users', firebaseUser.uid), {
            ...newProfile,
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
          });
          
          setUserProfile(newProfile);
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
  }, [user, isGuest]);

  const signInWithGoogle = async (): Promise<void> => {
    try {
      await signInWithPopup(auth, googleProvider);
      setIsGuest(false);
    } catch (error: any) {
      throw new AuthError(error.code, error.message);
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<void> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsGuest(false);
    } catch (error: any) {
      throw new AuthError(error.code, error.message);
    }
  };

  const signUpWithEmail = async (
    email: string, 
    password: string, 
    displayName: string
  ): Promise<void> => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      setIsGuest(false);
    } catch (error: any) {
      throw new AuthError(error.code, error.message);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      setUserProfile(null);
      setIsGuest(false);
    } catch (error: any) {
      throw new AuthError(error.code, error.message);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new AuthError(error.code, error.message);
    }
  };

  const continueAsGuest = (): void => {
    setIsGuest(true);
    setUserProfile({
      uid: 'guest',
      email: null,
      displayName: 'Guest User',
      photoURL: null,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      isGuest: true,
      preferences: defaultPreferences,
      progress: defaultProgress,
    });
  };

  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!user || isGuest) {
      throw new Error('User must be authenticated to update profile');
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        ...updates,
        lastLoginAt: serverTimestamp(),
      });

      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (error: any) {
      throw new AuthError(error.code, error.message);
    }
  };

  const deleteAccount = async (): Promise<void> => {
    if (!user || isGuest) {
      throw new Error('User must be authenticated to delete account');
    }

    try {
      // Delete user profile from Firestore
      await deleteDoc(doc(db, 'users', user.uid));
      
      // Delete Firebase Auth user
      await deleteUser(user);
      
      setUserProfile(null);
      setIsGuest(false);
    } catch (error: any) {
      throw new AuthError(error.code, error.message);
    }
  };

  const exportUserData = async (): Promise<string> => {
    if (!userProfile) {
      throw new Error('No user data to export');
    }

    const exportData = {
      profile: userProfile,
      exportedAt: new Date().toISOString(),
    };

    return JSON.stringify(exportData, null, 2);
  };

  const value: AuthContextType = {
    user: user || null,
    userProfile,
    loading: loading || profileLoading,
    isGuest,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    resetPassword,
    continueAsGuest,
    updateUserProfile,
    deleteAccount,
    exportUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export class AuthError extends Error {
  public code: string;
  
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'AuthError';
  }
}