import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { useAuth, useOptionalAuth, useIsAuthenticated, useAuthStatus } from './useAuth';
import { AuthContext } from '../contexts/AuthContext';
import type { AuthContextType } from '../types/auth';

// Mock AuthContext
const mockAuthContext: AuthContextType = {
  user: null,
  userProfile: null,
  loading: false,
  isGuest: false,
  signInWithGoogle: vi.fn(),
  signInWithApple: vi.fn(),
  signInWithEmail: vi.fn(),
  signUpWithEmail: vi.fn(),
  signOut: vi.fn(),
  resetPassword: vi.fn(),
  continueAsGuest: vi.fn(),
  updateUserProfile: vi.fn(),
  deleteAccount: vi.fn(),
  exportUserData: vi.fn(),
  migrateGuestData: vi.fn(),
  sendVerificationEmail: vi.fn(),
  reauthenticateUser: vi.fn()
};

const createWrapper = (contextValue: AuthContextType | undefined) => {
  return ({ children }: { children: React.ReactNode }) => (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useAuth hook', () => {
    it('returns auth context when used within AuthProvider', () => {
      const wrapper = createWrapper(mockAuthContext);
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      expect(result.current).toBe(mockAuthContext);
    });

    it('throws error when used outside AuthProvider', () => {
      const wrapper = createWrapper(undefined);
      
      expect(() => {
        renderHook(() => useAuth(), { wrapper });
      }).toThrow('useAuth must be used within an AuthProvider');
    });

    it('throws descriptive error message', () => {
      const wrapper = createWrapper(undefined);
      
      expect(() => {
        renderHook(() => useAuth(), { wrapper });
      }).toThrow('Wrap your component tree with <AuthProvider> to use authentication features');
    });
  });

  describe('useOptionalAuth hook', () => {
    it('returns auth context when available', () => {
      const wrapper = createWrapper(mockAuthContext);
      const { result } = renderHook(() => useOptionalAuth(), { wrapper });
      
      expect(result.current).toBe(mockAuthContext);
    });

    it('returns null when context is not available', () => {
      const wrapper = createWrapper(undefined);
      const { result } = renderHook(() => useOptionalAuth(), { wrapper });
      
      expect(result.current).toBeNull();
    });

    it('returns null instead of throwing when context is undefined', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
      );
      
      const { result } = renderHook(() => useOptionalAuth(), { wrapper });
      
      expect(result.current).toBeNull();
    });
  });

  describe('useIsAuthenticated hook', () => {
    it('returns true when user is authenticated', () => {
      const contextWithUser = {
        ...mockAuthContext,
        user: { uid: 'test-uid', email: 'test@example.com' } as any
      };
      const wrapper = createWrapper(contextWithUser);
      const { result } = renderHook(() => useIsAuthenticated(), { wrapper });
      
      expect(result.current).toBe(true);
    });

    it('returns true when user is guest', () => {
      const contextWithGuest = {
        ...mockAuthContext,
        isGuest: true
      };
      const wrapper = createWrapper(contextWithGuest);
      const { result } = renderHook(() => useIsAuthenticated(), { wrapper });
      
      expect(result.current).toBe(true);
    });

    it('returns false when no user and not guest', () => {
      const wrapper = createWrapper(mockAuthContext);
      const { result } = renderHook(() => useIsAuthenticated(), { wrapper });
      
      expect(result.current).toBe(false);
    });

    it('returns false when context is not available', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
      );
      const { result } = renderHook(() => useIsAuthenticated(), { wrapper });
      
      expect(result.current).toBe(false);
    });
  });

  describe('useAuthStatus hook', () => {
    it('returns correct status for authenticated user', () => {
      const contextWithUser = {
        ...mockAuthContext,
        user: { uid: 'test-uid', email: 'test@example.com' } as any,
        userProfile: { uid: 'test-uid', displayName: 'Test User' } as any
      };
      const wrapper = createWrapper(contextWithUser);
      const { result } = renderHook(() => useAuthStatus(), { wrapper });
      
      expect(result.current).toEqual({
        isAuthenticated: true,
        isGuest: false,
        isRegisteredUser: true,
        isLoading: false,
        hasProfile: true
      });
    });

    it('returns correct status for guest user', () => {
      const contextWithGuest = {
        ...mockAuthContext,
        isGuest: true,
        userProfile: { uid: 'guest-123', displayName: 'Tamu' } as any
      };
      const wrapper = createWrapper(contextWithGuest);
      const { result } = renderHook(() => useAuthStatus(), { wrapper });
      
      expect(result.current).toEqual({
        isAuthenticated: true,
        isGuest: true,
        isRegisteredUser: false,
        isLoading: false,
        hasProfile: true
      });
    });

    it('returns correct status for loading state', () => {
      const contextLoading = {
        ...mockAuthContext,
        loading: true
      };
      const wrapper = createWrapper(contextLoading);
      const { result } = renderHook(() => useAuthStatus(), { wrapper });
      
      expect(result.current).toEqual({
        isAuthenticated: false,
        isGuest: false,
        isRegisteredUser: false,
        isLoading: true,
        hasProfile: false
      });
    });

    it('returns correct status when no context available', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
      );
      const { result } = renderHook(() => useAuthStatus(), { wrapper });
      
      expect(result.current).toEqual({
        isAuthenticated: false,
        isGuest: false,
        isRegisteredUser: false,
        isLoading: false,
        hasProfile: false
      });
    });

    it('handles edge case where user exists but no profile', () => {
      const contextWithUserNoProfile = {
        ...mockAuthContext,
        user: { uid: 'test-uid', email: 'test@example.com' } as any,
        userProfile: null
      };
      const wrapper = createWrapper(contextWithUserNoProfile);
      const { result } = renderHook(() => useAuthStatus(), { wrapper });
      
      expect(result.current).toEqual({
        isAuthenticated: true,
        isGuest: false,
        isRegisteredUser: true,
        isLoading: false,
        hasProfile: false
      });
    });
  });

  // Edge cases and error handling
  describe('Error handling and edge cases', () => {
    it('handles undefined context gracefully in useOptionalAuth', () => {
      const MockProvider = ({ children }: { children: React.ReactNode }) => {
        return (
          <AuthContext.Provider value={undefined as any}>
            {children}
          </AuthContext.Provider>
        );
      };
      
      const { result } = renderHook(() => useOptionalAuth(), { wrapper: MockProvider });
      
      expect(result.current).toBeNull();
    });

    it('maintains referential stability of hook results', () => {
      const wrapper = createWrapper(mockAuthContext);
      const { result, rerender } = renderHook(() => useAuth(), { wrapper });
      
      const firstResult = result.current;
      rerender();
      const secondResult = result.current;
      
      expect(firstResult).toBe(secondResult);
    });

    it('handles context changes properly', () => {
      const initialContext = { ...mockAuthContext, loading: true };
      const updatedContext = { ...mockAuthContext, loading: false, user: { uid: 'test' } as any };
      
      let currentContext = initialContext;
      const DynamicWrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthContext.Provider value={currentContext}>
          {children}
        </AuthContext.Provider>
      );
      
      const { result, rerender } = renderHook(() => useAuthStatus(), { wrapper: DynamicWrapper });
      
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isAuthenticated).toBe(false);
      
      // Update context
      currentContext = updatedContext;
      rerender();
      
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });
});