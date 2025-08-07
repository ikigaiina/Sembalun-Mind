import { useContext } from 'react';
import { SupabaseAuthContext } from '../contexts/SupabaseAuthContext';

/**
 * Custom hook to access the Supabase auth context
 * Extracted for React Fast Refresh compliance
 */
export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (!context) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};