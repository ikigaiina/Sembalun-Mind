import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  type User,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInAnonymously,
  linkWithCredential,
  multiFactor,
  PhoneAuthProvider,
  RecaptchaVerifier
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { auth, db, googleProvider, appleProvider } from '../config/firebase';
import type { UserProfile } from '../types/auth';
import { AuthError } from '../utils/auth-error';

export class AuthService {
  private static instance: AuthService;
  
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Enhanced authentication methods
  async signInWithGoogle(): Promise<User> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await this.handlePostSignIn(result.user);
      return result.user;
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  async signInWithApple(): Promise<User> {
    try {
      const result = await signInWithPopup(auth, appleProvider);
      await this.handlePostSignIn(result.user);
      return result.user;
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await this.handlePostSignIn(result.user);
      return result.user;
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  async signUpWithEmail(email: string, password: string, displayName: string): Promise<User> {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(result.user, { displayName });
      
      // Send verification email
      await sendEmailVerification(result.user);
      
      // Create user profile
      await this.createUserProfile(result.user);
      
      return result.user;
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  async signInAnonymously(): Promise<User> {
    try {
      const result = await signInAnonymously(auth);
      await this.createUserProfile(result.user, true);
      return result.user;
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  async linkEmailToAnonymous(email: string, password: string): Promise<User> {
    const user = auth.currentUser;
    if (!user || !user.isAnonymous) {
      throw new Error('No anonymous user found to link');
    }

    try {
      const credential = EmailAuthProvider.credential(email, password);
      const result = await linkWithCredential(user, credential);
      
      // Send verification email
      await sendEmailVerification(result.user);
      
      // Update profile to no longer be guest
      await this.updateUserProfile(result.user.uid, { isGuest: false });
      
      return result.user;
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  async linkGoogleToAnonymous(): Promise<User> {
    const user = auth.currentUser;
    if (!user || !user.isAnonymous) {
      throw new Error('No anonymous user found to link');
    }

    try {
      const result = await linkWithCredential(user, GoogleAuthProvider.credential());
      await this.updateUserProfile(result.user.uid, { isGuest: false });
      return result.user;
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/auth?mode=signin`,
        handleCodeInApp: false,
      });
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('User must be authenticated with email/password');
    }

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  async sendVerificationEmail(): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user signed in');
    }

    try {
      await sendEmailVerification(user, {
        url: `${window.location.origin}/profile`,
        handleCodeInApp: false,
      });
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  async deleteAccount(password?: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user signed in');
    }

    try {
      // Re-authenticate if password provided
      if (password && user.email) {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
      }

      // Delete user data from Firestore
      await this.deleteUserData(user.uid);

      // Delete Firebase Auth user
      await deleteUser(user);
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  async reauthenticate(password: string): Promise<void> {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('User must be authenticated with email/password');
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  // User Profile Management
  async createUserProfile(user: User, isGuest: boolean = false): Promise<UserProfile> {
    const profile: UserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      isGuest,
      preferences: this.getDefaultPreferences(),
      progress: this.getDefaultProgress(),
    };

    try {
      await setDoc(doc(db, 'users', user.uid), {
        ...profile,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });

      return profile;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw new Error('Failed to create user profile');
    }
  }

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docSnap = await getDoc(doc(db, 'users', uid));
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
          progress: {
            ...data.progress,
            lastSessionDate: data.progress?.lastSessionDate?.toDate() || null,
          },
        } as UserProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new Error('Failed to fetch user profile');
    }
  }

  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...updates,
        lastLoginAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
  }

  async deleteUserData(uid: string): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Delete main user document
      batch.delete(doc(db, 'users', uid));

      // Delete user subcollections
      const subcollections = [
        'sessions',
        'journal',
        'progress',
        'achievements',
        'preferences'
      ];

      for (const subcollection of subcollections) {
        const q = query(collection(db, 'users', uid, subcollection));
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
      }

      await batch.commit();
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw new Error('Failed to delete user data');
    }
  }

  async exportUserData(uid: string): Promise<any> {
    try {
      const profile = await this.getUserProfile(uid);
      if (!profile) {
        throw new Error('User profile not found');
      }

      // Fetch additional user data
      const userData = {
        profile,
        sessions: [],
        journal: [],
        achievements: [],
        exportInfo: {
          exportedAt: new Date().toISOString(),
          version: '1.0.0',
          format: 'JSON'
        }
      };

      // TODO: Fetch sessions, journal entries, etc.
      // This would involve querying subcollections

      return userData;
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw new Error('Failed to export user data');
    }
  }

  // Session Management
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  async refreshToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;

    try {
      return await user.getIdToken(true);
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  // Two-Factor Authentication
  async enableMFA(phoneNumber: string, _recaptchaVerifier: RecaptchaVerifier): Promise<string> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user signed in');
    }

    try {
      const multiFactorUser = multiFactor(user);
      const phoneInfoOptions = {
        phoneNumber,
        session: await multiFactorUser.getSession()
      };

      // Note: This is a simplified example - full MFA implementation requires more steps
      // phoneAuthCredential would be used in full implementation
      PhoneAuthProvider.credential(phoneInfoOptions.session.toString(), '');
      return 'verification-id';
    } catch (error: unknown) {
      throw this.handleAuthError(error);
    }
  }

  // Helper methods
  private async handlePostSignIn(user: User): Promise<void> {
    try {
      // Update last login time
      await updateDoc(doc(db, 'users', user.uid), {
        lastLoginAt: serverTimestamp(),
      });
    } catch (error) {
      // If user profile doesn't exist, create it
      await this.createUserProfile(user);
    }
  }

  private handleAuthError(error: unknown): AuthError {
    const authError = error as { code?: string; message?: string };
    let message = authError.message || 'An authentication error occurred';

    switch (authError.code) {
      case 'auth/user-not-found':
        message = 'No account found with this email address';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password';
        break;
      case 'auth/email-already-in-use':
        message = 'An account with this email already exists';
        break;
      case 'auth/weak-password':
        message = 'Password must be at least 6 characters';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address';
        break;
      case 'auth/requires-recent-login':
        message = 'Please sign in again to continue';
        break;
      case 'auth/too-many-requests':
        message = 'Too many failed attempts. Please try again later';
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Please check your connection';
        break;
      case 'auth/popup-closed-by-user':
        message = 'Sign-in was cancelled';
        break;
      case 'auth/cancelled-popup-request':
        message = 'Sign-in was cancelled';
        break;
    }

    return new AuthError(authError.code || 'auth/unknown', message);
  }

  private getDefaultPreferences() {
    return {
      theme: 'auto' as const,
      language: 'id' as const,
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
        storageLimit: 2,
      },
    };
  }

  private getDefaultProgress() {
    return {
      totalSessions: 0,
      totalMinutes: 0,
      streak: 0,
      longestStreak: 0,
      achievements: [],
      lastSessionDate: null,
      favoriteCategories: [],
      completedPrograms: [],
    };
  }
}

export const authService = AuthService.getInstance();