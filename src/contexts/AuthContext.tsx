import { createContext } from 'react';
import type { AuthContextType } from '../types/auth';

/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the app.
 * Must be used within an AuthProvider.
 * 
 * @example
 * ```tsx
 * import { useAuth } from '../hooks/useAuth';
 * 
 * function MyComponent() {
 *   const { user, loading, signInWithEmail } = useAuth();
 *   
 *   if (loading) return <LoadingSpinner />;
 *   if (!user) return <SignInForm />;
 *   return <UserDashboard />;
 * }
 * ```
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Add display name for better debugging
AuthContext.displayName = 'AuthContext';