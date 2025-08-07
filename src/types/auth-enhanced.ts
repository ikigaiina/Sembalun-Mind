import type { User, Session } from '@supabase/supabase-js'

// Enhanced Auth Provider interfaces moved for React Fast Refresh compliance

export interface EnhancedAuthContextType {
  // Basic auth (inherited from Supabase)
  user: User | null
  session: Session | null
  loading: boolean
  
  // Enhanced authentication features (placeholders)
  mfaEnabled: boolean
  userRole: 'user' | 'premium' | 'admin' | 'moderator'
  permissions: string[]
  loginHistory: LoginAttempt[]
  
  // MFA methods (placeholders)
  enableMFA: () => Promise<{ error: Error | null }>
  disableMFA: () => Promise<{ error: Error | null }>
  verifyMFA: (code: string) => Promise<{ error: Error | null }>
  
  // Social authentication (placeholders)
  signInWithFacebook: () => Promise<{ error: Error | null }>
  signInWithTwitter: () => Promise<{ error: Error | null }>
  signInWithLinkedIn: () => Promise<{ error: Error | null }>
  
  // Enterprise features (placeholders)
  signInWithSSO: (provider: string) => Promise<{ error: Error | null }>
  validateEnterpriseDomain: (email: string) => Promise<boolean>
  
  // Session management (placeholders)
  refreshSession: () => Promise<{ error: Error | null }>
  invalidateAllSessions: () => Promise<{ error: Error | null }>
  getActiveSessions: () => Promise<Session[]>
  
  // Security features (placeholders)
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error: Error | null }>
  enablePasswordlessLogin: () => Promise<{ error: Error | null }>
  reportSuspiciousActivity: (activity: SuspiciousActivity) => Promise<{ error: Error | null }>
}

export interface LoginAttempt {
  id: string
  timestamp: Date
  success: boolean
  ipAddress: string
  userAgent: string
  location?: {
    country: string
    city: string
  }
}

export interface SuspiciousActivity {
  type: 'unusual_login' | 'multiple_failures' | 'new_device' | 'location_change'
  description: string
  metadata: Record<string, unknown>
}