import { useContext } from 'react';
import { SupabaseAuthContext } from '../contexts/SupabaseAuthContext';

/**
 * useAuth hook - Simple wrapper around SupabaseAuthContext for consistent API
 * Provides authentication state and methods
 */
export const useAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

// Export as default as well for flexibility
export default useAuth;