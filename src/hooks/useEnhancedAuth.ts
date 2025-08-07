import { useContext } from 'react'
import { EnhancedAuthContext } from '../components/auth/AuthProvider'

/**
 * Custom hook for enhanced authentication
 * Moved to separate file for React Fast Refresh compliance
 */
export const useEnhancedAuth = () => {
  const context = useContext(EnhancedAuthContext)
  if (context === undefined) {
    throw new Error('useEnhancedAuth must be used within an EnhancedAuthProvider')
  }
  return context
}

export default useEnhancedAuth