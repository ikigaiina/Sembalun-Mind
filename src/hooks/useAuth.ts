import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import type { AuthContextType } from '../types/auth';

/**
 * Custom hook to access authentication context
 * 
 * @throws {Error} When used outside of AuthProvider
 * @returns {AuthContextType} Authentication context with user, methods, and state
 * 
 * @example
 * ```tsx
 * const { user, loading, signInWithEmail } = useAuth();
 * 
 * if (loading) return <LoadingSpinner />;
 * if (!user) return <SignInForm />;
 * return <DashboardContent />;
 * ```
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    // Development-only helpful debugging
    if (process.env.NODE_ENV === 'development') {
      console.error(
        '🚨 useAuth Hook Error: AuthContext is undefined\n' +
        '💡 Make sure your component is wrapped with <AuthProvider>\n' +
        '📍 Check your App.tsx file for the AuthProvider wrapper'
      );
    }
    
    throw new Error(
      'useAuth must be used within an AuthProvider. ' +
      'Wrap your component tree with <AuthProvider> to use authentication features.'
    );
  }
  
  // Validate context integrity in development
  if (process.env.NODE_ENV === 'development') {
    const requiredMethods = [
      'signInWithGoogle', 'signInWithApple', 'signInWithEmail',
      'signUpWithEmail', 'signOut', 'resetPassword', 'continueAsGuest'
    ];
    
    const missingMethods = requiredMethods.filter(method => 
      typeof context[method as keyof AuthContextType] !== 'function'
    );
    
    if (missingMethods.length > 0) {
      console.warn(
        '⚠️ AuthContext Warning: Missing methods detected:',
        missingMethods.join(', '),
        '\nThis might indicate an incomplete AuthProvider implementation.'
      );
    }
  }
  
  return context;
};

/**
 * Hook for optional authentication context (doesn't throw if not found)
 * Useful for components that work both with and without authentication
 * 
 * @returns {AuthContextType | null} Authentication context or null
 * 
 * @example
 * ```tsx
 * const auth = useOptionalAuth();
 * if (auth?.user) {
 *   // Show authenticated content
 * } else {
 *   // Show public content
 * }
 * ```
 */
export const useOptionalAuth = (): AuthContextType | null => {
  try {
    const context = useContext(AuthContext);
    
    // Return null if context is undefined (not wrapped in AuthProvider)
    if (context === undefined) {
      return null;
    }
    
    return context;
  } catch (error) {
    // Log error in development for debugging
    if (process.env.NODE_ENV === 'development') {
      console.warn('useOptionalAuth: Failed to get auth context:', error);
    }
    
    // Return null if context is not available instead of throwing
    return null;
  }
};

/**
 * Hook to check if user is authenticated (boolean)
 * 
 * @returns {boolean} True if user is authenticated (including guest)
 */
export const useIsAuthenticated = (): boolean => {
  const auth = useOptionalAuth();
  return Boolean(auth?.user || auth?.isGuest);
};

/**
 * Hook to get current authentication status
 * 
 * @returns Object with authentication status flags
 */
export const useAuthStatus = () => {
  const auth = useOptionalAuth();
  
  return {
    isAuthenticated: Boolean(auth?.user || auth?.isGuest),
    isGuest: Boolean(auth?.isGuest),
    isRegisteredUser: Boolean(auth?.user && !auth?.isGuest),
    isLoading: Boolean(auth?.loading),
    hasProfile: Boolean(auth?.userProfile),
  };
};