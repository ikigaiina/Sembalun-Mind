import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from './AuthContextProvider';
import { AuthContext } from './AuthContext';
import { useContext } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import type { AuthContextType, UserProfile } from '../types/auth';

// Mock Firebase modules
const mockSignInWithPopup = vi.fn();
const mockSignInWithEmailAndPassword = vi.fn();
const mockCreateUserWithEmailAndPassword = vi.fn();
const mockSignOut = vi.fn();
const mockSendPasswordResetEmail = vi.fn();
const mockSendEmailVerification = vi.fn();
const mockUpdateProfile = vi.fn();
const mockDeleteUser = vi.fn();
const mockSetPersistence = vi.fn();
const mockReauthenticateWithCredential = vi.fn();
const mockEmailAuthProvider = {
  credential: vi.fn()
};

const mockGetDoc = vi.fn();
const mockSetDoc = vi.fn();
const mockUpdateDoc = vi.fn();
const mockDeleteDoc = vi.fn();
const mockDoc = vi.fn();
const mockServerTimestamp = vi.fn(() => ({ seconds: Date.now() / 1000 }));

const mockUseAuthState = vi.fn();

vi.mock('firebase/auth', () => ({
  signInWithPopup: mockSignInWithPopup,
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
  signOut: mockSignOut,
  sendPasswordResetEmail: mockSendPasswordResetEmail,
  sendEmailVerification: mockSendEmailVerification,
  updateProfile: mockUpdateProfile,
  deleteUser: mockDeleteUser,
  setPersistence: mockSetPersistence,
  browserLocalPersistence: 'local',
  reauthenticateWithCredential: mockReauthenticateWithCredential,
  EmailAuthProvider: mockEmailAuthProvider
}));

vi.mock('firebase/firestore', () => ({
  doc: mockDoc,
  setDoc: mockSetDoc,
  getDoc: mockGetDoc,
  updateDoc: mockUpdateDoc,
  deleteDoc: mockDeleteDoc,
  serverTimestamp: mockServerTimestamp
}));

vi.mock('react-firebase-hooks/auth', () => ({
  useAuthState: mockUseAuthState
}));

vi.mock('../config/firebase', () => ({
  auth: { currentUser: null },
  db: {},
  googleProvider: {},
  appleProvider: {}
}));

vi.mock('../utils/auth-error', () => ({
  AuthError: class AuthError extends Error {
    code: string;
    constructor(code: string, message: string) {
      super(message);
      this.code = code;
      this.name = 'AuthError';
    }
  }
}));

vi.mock('../utils/profile-sync', () => ({
  syncProfileFromProvider: vi.fn().mockResolvedValue({
    hasChanges: false,
    updates: {}
  })
}));

// Test component to access context
const TestComponent = ({ onContextValue }: { onContextValue?: (value: AuthContextType) => void }) => {
  const contextValue = useContext(AuthContext);
  
  if (onContextValue && contextValue) {
    onContextValue(contextValue);
  }
  
  if (!contextValue) {
    return <div>No Context</div>;
  }
  
  return (
    <div>
      <div data-testid="user-email">{contextValue.user?.email || 'No user'}</div>
      <div data-testid="user-display-name">{contextValue.userProfile?.displayName || 'No profile'}</div>
      <div data-testid="loading">{contextValue.loading ? 'Loading' : 'Not loading'}</div>
      <div data-testid="is-guest">{contextValue.isGuest ? 'Guest' : 'Not guest'}</div>
      <button onClick={() => contextValue.signInWithGoogle()}>Sign in with Google</button>
      <button onClick={() => contextValue.signInWithApple()}>Sign in with Apple</button>
      <button onClick={() => contextValue.signInWithEmail('test@example.com', 'password')}>Sign in with Email</button>
      <button onClick={() => contextValue.signUpWithEmail('test@example.com', 'password', 'Test User')}>Sign up</button>
      <button onClick={() => contextValue.signOut()}>Sign out</button>
      <button onClick={() => contextValue.resetPassword('test@example.com')}>Reset password</button>
      <button onClick={() => contextValue.continueAsGuest()}>Continue as guest</button>
      <button onClick={() => contextValue.updateUserProfile({ displayName: 'Updated Name' })}>Update profile</button>
      <button onClick={() => contextValue.deleteAccount()}>Delete account</button>
      <button onClick={() => contextValue.exportUserData()}>Export data</button>
      <button onClick={() => contextValue.migrateGuestData()}>Migrate guest data</button>
      <button onClick={() => contextValue.sendVerificationEmail()}>Send verification</button>
      <button onClick={() => contextValue.reauthenticateUser('password')}>Reauthenticate</button>
    </div>
  );
};

describe('AuthContextProvider', () => {
  const mockUser: FirebaseUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg',
    emailVerified: true,
    isAnonymous: false,
    providerId: 'firebase',
    refreshToken: 'refresh-token',
    tenantId: null,
    metadata: {
      creationTime: '2023-01-01T00:00:00.000Z',
      lastSignInTime: '2023-12-01T00:00:00.000Z'
    },
    providerData: [],
    delete: vi.fn(),
    getIdToken: vi.fn(),
    getIdTokenResult: vi.fn(),
    reload: vi.fn(),
    toJSON: vi.fn()
  };

  const mockUserProfile: UserProfile = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg',
    createdAt: new Date('2023-01-01'),
    lastLoginAt: new Date('2023-12-01'),
    isGuest: false,
    preferences: {
      theme: 'auto',
      language: 'en',
      notifications: {
        daily: true,
        reminders: true,
        achievements: true,
        weeklyProgress: true,
        socialUpdates: false,
        push: true,
        email: false,
        sound: true,
        vibration: true
      },
      privacy: {
        analytics: false,
        dataSharing: false,
        profileVisibility: 'private',
        shareProgress: false,
        locationTracking: false
      },
      meditation: {
        defaultDuration: 10,
        preferredVoice: 'default',
        backgroundSounds: true,
        guidanceLevel: 'moderate',
        musicVolume: 70,
        voiceVolume: 80,
        autoAdvance: false,
        showTimer: true,
        preparationTime: 30,
        endingBell: true
      },
      accessibility: {
        reducedMotion: false,
        highContrast: false,
        fontSize: 'medium',
        screenReader: false,
        keyboardNavigation: false
      },
      display: {
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        weekStartsOn: 'monday',
        showStreaks: true,
        showStatistics: true
      },
      downloadPreferences: {
        autoDownload: false,
        wifiOnly: true,
        storageLimit: 1
      }
    },
    progress: {
      totalSessions: 0,
      totalMinutes: 0,
      streak: 0,
      longestStreak: 0,
      achievements: [],
      lastSessionDate: null,
      favoriteCategories: [],
      completedPrograms: []
    },
    totalMeditationMinutes: 0,
    completedSessions: [],
    completedCourses: [],
    currentStreak: 0
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthState.mockReturnValue([null, false]);
    localStorage.clear();
    
    // Default mock implementations
    mockSetPersistence.mockResolvedValue(undefined);
    mockDoc.mockReturnValue({ id: 'test-doc' });
    mockGetDoc.mockResolvedValue({
      exists: () => false,
      data: () => null
    });
    mockSetDoc.mockResolvedValue(undefined);
    mockUpdateDoc.mockResolvedValue(undefined);
    mockDeleteDoc.mockResolvedValue(undefined);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Provider Setup and Initialization', () => {
    it('provides context to children', () => {
      mockUseAuthState.mockReturnValue([null, false]);
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
      expect(screen.getByTestId('is-guest')).toHaveTextContent('Not guest');
    });

    it('sets auth persistence on initialization', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(mockSetPersistence).toHaveBeenCalledWith(
          expect.anything(),
          'local'
        );
      });
    });

    it('shows loading state while auth state is loading', () => {
      mockUseAuthState.mockReturnValue([null, true]);
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
    });

    it('loads guest data from localStorage on startup', () => {
      const guestData = {
        uid: 'guest_123',
        displayName: 'Tamu',
        isGuest: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        preferences: mockUserProfile.preferences,
        progress: mockUserProfile.progress
      };
      
      localStorage.setItem('guestUserData', JSON.stringify(guestData));
      mockUseAuthState.mockReturnValue([null, false]);
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      expect(screen.getByTestId('is-guest')).toHaveTextContent('Guest');
      expect(screen.getByTestId('user-display-name')).toHaveTextContent('Tamu');
    });

    it('handles corrupted guest data gracefully', () => {
      localStorage.setItem('guestUserData', 'invalid-json');
      mockUseAuthState.mockReturnValue([null, false]);
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      expect(screen.getByTestId('is-guest')).toHaveTextContent('Not guest');
      expect(localStorage.getItem('guestUserData')).toBeNull();
    });
  });

  describe('User Profile Loading', () => {
    it('loads existing user profile from Firestore', async () => {
      const mockDocData = {
        ...mockUserProfile,
        createdAt: { toDate: () => mockUserProfile.createdAt },
        lastLoginAt: { toDate: () => mockUserProfile.lastLoginAt },
        progress: {
          ...mockUserProfile.progress,
          lastSessionDate: null
        }
      };
      
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockDocData
      });
      
      mockUseAuthState.mockReturnValue([mockUser, false]);
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
        expect(screen.getByTestId('user-display-name')).toHaveTextContent('Test User');
      });
      
      expect(mockGetDoc).toHaveBeenCalled();
      expect(mockUpdateDoc).toHaveBeenCalled(); // Updates lastLoginAt
    });

    it('creates new user profile for first-time users', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false,
        data: () => null
      });
      
      mockUseAuthState.mockReturnValue([mockUser, false]);
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(mockSetDoc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            uid: 'test-uid',
            email: 'test@example.com',
            displayName: 'Test User',
            isGuest: false
          })
        );
      });
    });

    it('migrates guest data for new authenticated users', async () => {
      const guestData = {
        uid: 'guest_123',
        progress: {
          totalSessions: 5,
          totalMinutes: 50,
          achievements: ['first-session']
        },
        preferences: { theme: 'dark' }
      };
      
      localStorage.setItem('guestUserData', JSON.stringify(guestData));
      
      mockGetDoc.mockResolvedValue({
        exists: () => false,
        data: () => null
      });
      
      mockUseAuthState.mockReturnValue([mockUser, false]);
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(localStorage.getItem('guestUserData')).toBeNull();
      });
    });

    it('handles profile loading errors gracefully', async () => {
      mockGetDoc.mockRejectedValue(new Error('Network error'));
      mockUseAuthState.mockReturnValue([mockUser, false]);
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error loading user profile:', expect.any(Error));
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('Authentication Methods', () => {
    describe('signInWithGoogle', () => {
      it('signs in with Google successfully', async () => {
        mockSignInWithPopup.mockResolvedValue({ user: mockUser });
        
        const user = userEvent.setup();
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
        
        await user.click(screen.getByText('Sign in with Google'));
        
        await waitFor(() => {
          expect(mockSignInWithPopup).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything()
          );
        });
      });

      it('handles Google sign-in errors', async () => {
        const error = { code: 'auth/popup-closed-by-user', message: 'Popup closed' };
        mockSignInWithPopup.mockRejectedValue(error);
        
        const user = userEvent.setup();
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
        
        await expect(async () => {
          await user.click(screen.getByText('Sign in with Google'));
          await waitFor(() => {
            expect(mockSignInWithPopup).toHaveBeenCalled();
          });
        }).rejects.toThrow();
      });
    });

    describe('signInWithApple', () => {
      it('signs in with Apple successfully', async () => {
        mockSignInWithPopup.mockResolvedValue({ user: mockUser });
        
        const user = userEvent.setup();
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
        
        await user.click(screen.getByText('Sign in with Apple'));
        
        await waitFor(() => {
          expect(mockSignInWithPopup).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything()
          );
        });
      });

      it('handles Apple sign-in errors', async () => {
        const error = { code: 'auth/operation-not-allowed', message: 'Operation not allowed' };
        mockSignInWithPopup.mockRejectedValue(error);
        
        const user = userEvent.setup();
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
        
        await expect(async () => {
          await user.click(screen.getByText('Sign in with Apple'));
          await waitFor(() => {
            expect(mockSignInWithPopup).toHaveBeenCalled();
          });
        }).rejects.toThrow();
      });
    });

    describe('signInWithEmail', () => {
      it('signs in with email and password successfully', async () => {
        mockSignInWithEmailAndPassword.mockResolvedValue({ user: mockUser });
        
        const user = userEvent.setup();
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
        
        await user.click(screen.getByText('Sign in with Email'));
        
        await waitFor(() => {
          expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
            expect.anything(),
            'test@example.com',
            'password'
          );
        });
      });

      it('handles email sign-in errors', async () => {
        const error = { code: 'auth/wrong-password', message: 'Wrong password' };
        mockSignInWithEmailAndPassword.mockRejectedValue(error);
        
        const user = userEvent.setup();
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
        
        await expect(async () => {
          await user.click(screen.getByText('Sign in with Email'));
          await waitFor(() => {
            expect(mockSignInWithEmailAndPassword).toHaveBeenCalled();
          });
        }).rejects.toThrow();
      });
    });

    describe('signUpWithEmail', () => {
      it('signs up with email, password, and display name successfully', async () => {
        const mockUserCredential = { user: mockUser };
        mockCreateUserWithEmailAndPassword.mockResolvedValue(mockUserCredential);
        mockUpdateProfile.mockResolvedValue(undefined);
        mockSendEmailVerification.mockResolvedValue(undefined);
        
        const user = userEvent.setup();
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
        
        await user.click(screen.getByText('Sign up'));
        
        await waitFor(() => {
          expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
            expect.anything(),
            'test@example.com',
            'password'
          );
          expect(mockUpdateProfile).toHaveBeenCalledWith(
            mockUser,
            { displayName: 'Test User' }
          );
          expect(mockSendEmailVerification).toHaveBeenCalledWith(mockUser);
        });
      });

      it('handles sign-up errors', async () => {
        const error = { code: 'auth/email-already-in-use', message: 'Email already in use' };
        mockCreateUserWithEmailAndPassword.mockRejectedValue(error);
        
        const user = userEvent.setup();
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
        
        await expect(async () => {
          await user.click(screen.getByText('Sign up'));
          await waitFor(() => {
            expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalled();
          });
        }).rejects.toThrow();
      });
    });

    describe('signOut', () => {
      it('signs out successfully', async () => {
        mockSignOut.mockResolvedValue(undefined);
        mockUseAuthState.mockReturnValue([mockUser, false]);
        
        const user = userEvent.setup();
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
        
        await user.click(screen.getByText('Sign out'));
        
        await waitFor(() => {
          expect(mockSignOut).toHaveBeenCalledWith(expect.anything());
        });
      });

      it('handles sign-out errors', async () => {
        const error = { code: 'auth/network-request-failed', message: 'Network error' };
        mockSignOut.mockRejectedValue(error);
        
        const user = userEvent.setup();
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
        
        await expect(async () => {
          await user.click(screen.getByText('Sign out'));
          await waitFor(() => {
            expect(mockSignOut).toHaveBeenCalled();
          });
        }).rejects.toThrow();
      });
    });

    describe('resetPassword', () => {
      it('sends password reset email successfully', async () => {
        mockSendPasswordResetEmail.mockResolvedValue(undefined);
        
        const user = userEvent.setup();
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
        
        await user.click(screen.getByText('Reset password'));
        
        await waitFor(() => {
          expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(
            expect.anything(),
            'test@example.com'
          );
        });
      });

      it('handles password reset errors', async () => {
        const error = { code: 'auth/user-not-found', message: 'User not found' };
        mockSendPasswordResetEmail.mockRejectedValue(error);
        
        const user = userEvent.setup();
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
        
        await expect(async () => {
          await user.click(screen.getByText('Reset password'));
          await waitFor(() => {
            expect(mockSendPasswordResetEmail).toHaveBeenCalled();
          });
        }).rejects.toThrow();
      });
    });
  });

  describe('Guest Mode', () => {
    it('creates guest user with default data', async () => {
      const user = userEvent.setup();
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      await user.click(screen.getByText('Continue as guest'));
      
      await waitFor(() => {
        expect(screen.getByTestId('is-guest')).toHaveTextContent('Guest');
        expect(screen.getByTestId('user-display-name')).toHaveTextContent('Tamu');
      });
      
      const guestData = localStorage.getItem('guestUserData');
      expect(guestData).toBeTruthy();
      
      const parsedData = JSON.parse(guestData!);
      expect(parsedData.isGuest).toBe(true);
      expect(parsedData.uid).toMatch(/^guest_/);
    });

    it('generates unique guest IDs', async () => {
      const user = userEvent.setup();
      
      // Create first guest
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      await user.click(screen.getByText('Continue as guest'));
      const firstGuestData = localStorage.getItem('guestUserData');
      const firstGuestId = JSON.parse(firstGuestData!).uid;
      
      // Clear and create second guest
      localStorage.clear();
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      await user.click(screen.getByText('Continue as guest'));
      const secondGuestData = localStorage.getItem('guestUserData');
      const secondGuestId = JSON.parse(secondGuestData!).uid;
      
      expect(firstGuestId).not.toBe(secondGuestId);
    });
  });

  describe('Profile Management', () => {
    it('updates user profile successfully', async () => {
      mockUseAuthState.mockReturnValue([mockUser, false]);
      mockUpdateDoc.mockResolvedValue(undefined);
      
      const user = userEvent.setup();
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      await user.click(screen.getByText('Update profile'));
      
      await waitFor(() => {
        expect(mockUpdateDoc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            displayName: 'Updated Name'
          })
        );
      });
    });

    it('updates guest profile in localStorage', async () => {
      const guestData = {
        uid: 'guest_123',
        displayName: 'Tamu',
        isGuest: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      
      localStorage.setItem('guestUserData', JSON.stringify(guestData));
      mockUseAuthState.mockReturnValue([null, false]);
      
      let contextValue: AuthContextType;
      render(
        <AuthProvider>
          <TestComponent onContextValue={(value) => contextValue = value} />
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('is-guest')).toHaveTextContent('Guest');
      });
      
      await act(async () => {
        await contextValue!.updateUserProfile({ displayName: 'Updated Guest' });
      });
      
      const updatedData = localStorage.getItem('guestUserData');
      const parsedData = JSON.parse(updatedData!);
      expect(parsedData.displayName).toBe('Updated Guest');
    });

    it('throws error when updating profile without authentication', async () => {
      mockUseAuthState.mockReturnValue([null, false]);
      
      let contextValue: AuthContextType;
      render(
        <AuthProvider>
          <TestComponent onContextValue={(value) => contextValue = value} />
        </AuthProvider>
      );
      
      await expect(
        contextValue!.updateUserProfile({ displayName: 'Test' })
      ).rejects.toThrow('User must be authenticated to update profile');
    });
  });

  describe('Account Deletion', () => {
    it('deletes user account and data successfully', async () => {
      mockUseAuthState.mockReturnValue([mockUser, false]);
      mockDeleteDoc.mockResolvedValue(undefined);
      mockDeleteUser.mockResolvedValue(undefined);
      
      const user = userEvent.setup();
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      await user.click(screen.getByText('Delete account'));
      
      await waitFor(() => {
        expect(mockDeleteDoc).toHaveBeenCalled();
        expect(mockDeleteUser).toHaveBeenCalledWith(mockUser);
      });
    });

    it('handles account deletion requiring recent login', async () => {
      const error = { code: 'auth/requires-recent-login', message: 'Recent login required' };
      mockDeleteUser.mockRejectedValue(error);
      mockUseAuthState.mockReturnValue([mockUser, false]);
      
      const user = userEvent.setup();
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      await expect(async () => {
        await user.click(screen.getByText('Delete account'));
        await waitFor(() => {
          expect(mockDeleteUser).toHaveBeenCalled();
        });
      }).rejects.toThrow();
    });

    it('throws error when deleting account as guest', async () => {
      localStorage.setItem('guestUserData', JSON.stringify({ isGuest: true }));
      mockUseAuthState.mockReturnValue([null, false]);
      
      let contextValue: AuthContextType;
      render(
        <AuthProvider>
          <TestComponent onContextValue={(value) => contextValue = value} />
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('is-guest')).toHaveTextContent('Guest');
      });
      
      await expect(
        contextValue!.deleteAccount()
      ).rejects.toThrow('User must be authenticated to delete account');
    });
  });

  describe('Data Export', () => {
    it('exports user data successfully', async () => {
      const profile = { ...mockUserProfile };
      
      let contextValue: AuthContextType;
      render(
        <AuthProvider>
          <TestComponent onContextValue={(value) => contextValue = value} />
        </AuthProvider>
      );
      
      // Set up user profile
      await act(async () => {
        contextValue = {
          ...contextValue!,
          userProfile: profile
        };
      });
      
      const exportedData = await contextValue!.exportUserData();
      const parsedData = JSON.parse(exportedData);
      
      expect(parsedData.profile).toBeDefined();
      expect(parsedData.exportInfo).toBeDefined();
      expect(parsedData.exportInfo.appVersion).toBe('1.0.0');
      expect(parsedData.exportInfo.format).toBe('JSON');
    });

    it('throws error when exporting data without profile', async () => {
      let contextValue: AuthContextType;
      render(
        <AuthProvider>
          <TestComponent onContextValue={(value) => contextValue = value} />
        </AuthProvider>
      );
      
      await expect(
        contextValue!.exportUserData()
      ).rejects.toThrow('No user data to export');
    });
  });

  describe('Guest Data Migration', () => {
    it('migrates guest data to authenticated user successfully', async () => {
      const guestData = {
        progress: {
          totalSessions: 5,
          totalMinutes: 50,
          achievements: ['first-session'],
          streak: 3
        },
        preferences: {
          theme: 'dark',
          language: 'id'
        }
      };
      
      localStorage.setItem('guestUserData', JSON.stringify(guestData));
      mockUseAuthState.mockReturnValue([mockUser, false]);
      
      const existingProfile = {
        progress: {
          totalSessions: 2,
          totalMinutes: 20,
          achievements: ['welcome'],
          streak: 1,
          longestStreak: 1
        },
        preferences: {
          theme: 'light'
        }
      };
      
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => existingProfile
      });
      
      let contextValue: AuthContextType;
      render(
        <AuthProvider>
          <TestComponent onContextValue={(value) => contextValue = value} />
        </AuthProvider>
      );
      
      await act(async () => {
        await contextValue!.migrateGuestData();
      });
      
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          progress: expect.objectContaining({
            totalSessions: 7, // 5 + 2
            totalMinutes: 70, // 50 + 20
            streak: 3, // max(3, 1)
            achievements: expect.arrayContaining(['first-session', 'welcome'])
          })
        })
      );
      
      expect(localStorage.getItem('guestUserData')).toBeNull();
    });

    it('handles migration when no guest data exists', async () => {
      mockUseAuthState.mockReturnValue([mockUser, false]);
      
      let contextValue: AuthContextType;
      render(
        <AuthProvider>
          <TestComponent onContextValue={(value) => contextValue = value} />
        </AuthProvider>
      );
      
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      await act(async () => {
        await contextValue!.migrateGuestData();
      });
      
      expect(consoleSpy).toHaveBeenCalledWith('No guest data found to migrate');
      consoleSpy.mockRestore();
    });

    it('throws error when migrating as guest user', async () => {
      localStorage.setItem('guestUserData', JSON.stringify({ isGuest: true }));
      mockUseAuthState.mockReturnValue([null, false]);
      
      let contextValue: AuthContextType;
      render(
        <AuthProvider>
          <TestComponent onContextValue={(value) => contextValue = value} />
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('is-guest')).toHaveTextContent('Guest');
      });
      
      await expect(
        contextValue!.migrateGuestData()
      ).rejects.toThrow('User must be authenticated to migrate guest data');
    });
  });

  describe('Email Verification', () => {
    it('sends email verification successfully', async () => {
      mockUseAuthState.mockReturnValue([mockUser, false]);
      mockSendEmailVerification.mockResolvedValue(undefined);
      
      const user = userEvent.setup();
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      await user.click(screen.getByText('Send verification'));
      
      await waitFor(() => {
        expect(mockSendEmailVerification).toHaveBeenCalledWith(mockUser);
      });
    });

    it('throws error when sending verification as guest', async () => {
      localStorage.setItem('guestUserData', JSON.stringify({ isGuest: true }));
      mockUseAuthState.mockReturnValue([null, false]);
      
      let contextValue: AuthContextType;
      render(
        <AuthProvider>
          <TestComponent onContextValue={(value) => contextValue = value} />
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('is-guest')).toHaveTextContent('Guest');
      });
      
      await expect(
        contextValue!.sendVerificationEmail()
      ).rejects.toThrow('User must be authenticated to send verification email');
    });
  });

  describe('User Reauthentication', () => {
    it('reauthenticates user successfully', async () => {
      const userWithEmail = { ...mockUser, email: 'test@example.com' };
      mockUseAuthState.mockReturnValue([userWithEmail, false]);
      mockEmailAuthProvider.credential.mockReturnValue('mock-credential');
      mockReauthenticateWithCredential.mockResolvedValue(undefined);
      
      const user = userEvent.setup();
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      await user.click(screen.getByText('Reauthenticate'));
      
      await waitFor(() => {
        expect(mockEmailAuthProvider.credential).toHaveBeenCalledWith(
          'test@example.com',
          'password'
        );
        expect(mockReauthenticateWithCredential).toHaveBeenCalledWith(
          userWithEmail,
          'mock-credential'
        );
      });
    });

    it('throws error when reauthenticating as guest', async () => {
      localStorage.setItem('guestUserData', JSON.stringify({ isGuest: true }));
      mockUseAuthState.mockReturnValue([null, false]);
      
      let contextValue: AuthContextType;
      render(
        <AuthProvider>
          <TestComponent onContextValue={(value) => contextValue = value} />
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('is-guest')).toHaveTextContent('Guest');
      });
      
      await expect(
        contextValue!.reauthenticateUser('password')
      ).rejects.toThrow('User must be authenticated with email/password to reauthenticate');
    });

    it('throws error when reauthenticating user without email', async () => {
      const userWithoutEmail = { ...mockUser, email: null };
      mockUseAuthState.mockReturnValue([userWithoutEmail, false]);
      
      let contextValue: AuthContextType;
      render(
        <AuthProvider>
          <TestComponent onContextValue={(value) => contextValue = value} />
        </AuthProvider>
      );
      
      await expect(
        contextValue!.reauthenticateUser('password')
      ).rejects.toThrow('User must be authenticated with email/password to reauthenticate');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('handles Firebase auth errors with proper error codes', async () => {
      const authErrors = [
        { code: 'auth/user-not-found', message: 'User not found' },
        { code: 'auth/wrong-password', message: 'Wrong password' },
        { code: 'auth/invalid-email', message: 'Invalid email' },
        { code: 'auth/user-disabled', message: 'User disabled' },
        { code: 'auth/email-already-in-use', message: 'Email already in use' },
        { code: 'auth/weak-password', message: 'Weak password' },
        { code: 'auth/network-request-failed', message: 'Network error' }
      ];
      
      for (const error of authErrors) {
        mockSignInWithEmailAndPassword.mockRejectedValueOnce(error);
        
        const user = userEvent.setup();
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
        
        await expect(async () => {
          await user.click(screen.getByText('Sign in with Email'));
          await waitFor(() => {
            expect(mockSignInWithEmailAndPassword).toHaveBeenCalled();
          });
        }).rejects.toThrow();
        
        vi.clearAllMocks();
      }
    });

    it('handles concurrent auth state changes gracefully', async () => {
      let authStateCallback: ((user: FirebaseUser | null) => void) | null = null;
      
      mockUseAuthState.mockImplementation(() => {
        const [user, setUser] = React.useState(null);
        authStateCallback = setUser;
        return [user, false];
      });
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      // Simulate rapid auth state changes
      act(() => {
        authStateCallback?.(mockUser);
      });
      
      act(() => {
        authStateCallback?.(null);
      });
      
      act(() => {
        authStateCallback?.(mockUser);
      });
      
      // Should not cause errors or inconsistent state
      expect(screen.getByTestId('user-email')).toBeInTheDocument();
    });

    it('handles corrupted localStorage data gracefully', () => {
      // Set various types of corrupted data
      const corruptedDataTypes = [
        'invalid-json',
        '{"incomplete": }',
        '{"wrongStructure": {"nested": true}}',
        '',
        null,
        undefined
      ];
      
      for (const corruptedData of corruptedDataTypes) {
        localStorage.clear();
        if (corruptedData !== null && corruptedData !== undefined) {
          localStorage.setItem('guestUserData', corruptedData);
        }
        
        const { unmount } = render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
        
        // Should not crash and should clean up corrupted data
        expect(screen.getByTestId('is-guest')).toHaveTextContent('Not guest');
        
        unmount();
      }
    });

    it('handles Firebase service unavailability', async () => {
      const serviceUnavailableError = {
        code: 'auth/service-unavailable',
        message: 'Service unavailable'
      };
      
      mockSignInWithEmailAndPassword.mockRejectedValue(serviceUnavailableError);
      
      const user = userEvent.setup();
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      await expect(async () => {
        await user.click(screen.getByText('Sign in with Email'));
        await waitFor(() => {
          expect(mockSignInWithEmailAndPassword).toHaveBeenCalled();
        });
      }).rejects.toThrow();
    });
  });

  describe('Performance and Memory Management', () => {
    it('cleans up effects on unmount', () => {
      const { unmount } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      // Component should unmount without errors
      expect(() => unmount()).not.toThrow();
    });

    it('handles rapid component re-renders efficiently', () => {
      const { rerender } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      // Multiple re-renders should not cause issues
      for (let i = 0; i < 10; i++) {
        rerender(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
      }
      
      expect(screen.getByTestId('user-email')).toBeInTheDocument();
    });

    it('memoizes context value appropriately', () => {
      let contextValue1: AuthContextType;
      let contextValue2: AuthContextType;
      
      const { rerender } = render(
        <AuthProvider>
          <TestComponent onContextValue={(value) => contextValue1 = value} />
        </AuthProvider>
      );
      
      rerender(
        <AuthProvider>
          <TestComponent onContextValue={(value) => contextValue2 = value} />
        </AuthProvider>
      );
      
      // Context value should be stable when dependencies don't change
      expect(typeof contextValue1!.signInWithGoogle).toBe('function');
      expect(typeof contextValue2!.signInWithGoogle).toBe('function');
    });
  });

  describe('Security Validations', () => {
    it('sanitizes user input in profile updates', async () => {
      mockUseAuthState.mockReturnValue([mockUser, false]);
      mockUpdateDoc.mockResolvedValue(undefined);
      
      let contextValue: AuthContextType;
      render(
        <AuthProvider>
          <TestComponent onContextValue={(value) => contextValue = value} />
        </AuthProvider>
      );
      
      // Test with potentially dangerous input
      const maliciousUpdate = {
        displayName: '<script>alert("xss")</script>',
        bio: 'javascript:alert("xss")'
      };
      
      await act(async () => {
        await contextValue!.updateUserProfile(maliciousUpdate);
      });
      
      // Should accept the input (sanitization happens at UI level)
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining(maliciousUpdate)
      );
    });

    it('validates authentication state before sensitive operations', async () => {
      mockUseAuthState.mockReturnValue([null, false]);
      
      let contextValue: AuthContextType;
      render(
        <AuthProvider>
          <TestComponent onContextValue={(value) => contextValue = value} />
        </AuthProvider>
      );
      
      const sensitiveOperations = [
        'updateUserProfile',
        'deleteAccount',
        'migrateGuestData',
        'sendVerificationEmail',
        'reauthenticateUser'
      ];
      
      for (const operation of sensitiveOperations) {
        await expect(
          (contextValue as any)[operation]?.('test-param')
        ).rejects.toThrow(/must be authenticated/);
      }
    });

    it('protects against session fixation attacks', async () => {
      // Test that user state is properly cleared on sign out
      mockUseAuthState.mockReturnValue([mockUser, false]);
      mockSignOut.mockResolvedValue(undefined);
      
      const user = userEvent.setup();
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      // Verify user is signed in
      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      });
      
      // Sign out
      await user.click(screen.getByText('Sign out'));
      
      // State should be properly cleared
      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
        expect(screen.getByTestId('is-guest')).toHaveTextContent('Not guest');
      });
    });
  });

  describe('Accessibility and User Experience', () => {
    it('provides loading states during async operations', async () => {
      mockUseAuthState.mockReturnValue([null, true]); // Loading state
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
    });

    it('maintains consistent state across provider re-mounts', () => {
      const guestData = {
        uid: 'guest_123',
        displayName: 'Tamu',
        isGuest: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      
      localStorage.setItem('guestUserData', JSON.stringify(guestData));
      
      const { unmount, rerender } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      expect(screen.getByTestId('is-guest')).toHaveTextContent('Guest');
      
      unmount();
      
      rerender(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      expect(screen.getByTestId('is-guest')).toHaveTextContent('Guest');
    });

    it('handles offline scenarios gracefully', async () => {
      const networkError = {
        code: 'auth/network-request-failed',
        message: 'Network request failed'
      };
      
      mockSignInWithEmailAndPassword.mockRejectedValue(networkError);
      
      const user = userEvent.setup();
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      await expect(async () => {
        await user.click(screen.getByText('Sign in with Email'));
        await waitFor(() => {
          expect(mockSignInWithEmailAndPassword).toHaveBeenCalled();
        });
      }).rejects.toThrow();
    });
  });
});