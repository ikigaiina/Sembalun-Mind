import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '../config/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signInWithGoogle: () => Promise<{ error: AuthError | null }>
  signInWithApple: () => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updateProfile: (updates: Record<string, unknown>) => Promise<{ error: AuthError | null }>
  deleteAccount: () => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useSupabaseAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider')
  }
  return context
}

interface SupabaseAuthProviderProps {
  children: ReactNode
}

export const SupabaseAuthProvider: React.FC<SupabaseAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      console.warn('Supabase client not available')
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        
        // Handle auth events
        switch (event) {
          case 'SIGNED_IN':
            console.log('✅ User signed in:', session?.user?.email)
            break
          case 'SIGNED_OUT':
            console.log('👋 User signed out')
            break
          case 'TOKEN_REFRESHED':
            console.log('🔄 Token refreshed')
            break
          case 'USER_UPDATED':
            console.log('👤 User updated')
            break
          case 'PASSWORD_RECOVERY':
            console.log('🔐 Password recovery initiated')
            break
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, metadata?: Record<string, unknown>) => {
    if (!supabase) {
      return { error: new Error('Supabase client not available') as AuthError }
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: new Error('Supabase client not available') as AuthError }
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    if (!supabase) {
      return { error: new Error('Supabase client not available') as AuthError }
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  const signInWithApple = async () => {
    if (!supabase) {
      return { error: new Error('Supabase client not available') as AuthError }
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  const signOut = async () => {
    if (!supabase) {
      return { error: new Error('Supabase client not available') as AuthError }
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    if (!supabase) {
      return { error: new Error('Supabase client not available') as AuthError }
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  const updateProfile = async (updates: Record<string, unknown>) => {
    if (!supabase) {
      return { error: new Error('Supabase client not available') as AuthError }
    }

    try {
      const { error } = await supabase.auth.updateUser({
        data: updates
      })
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  const deleteAccount = async () => {
    if (!supabase || !user) {
      return { error: new Error('User not authenticated') as AuthError }
    }

    try {
      // Note: Account deletion should be handled via RPC call to a secure function
      // This is a placeholder - implement proper account deletion in your Supabase functions
      const { error } = await supabase.rpc('delete_user_account')
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithApple,
    signOut,
    resetPassword,
    updateProfile,
    deleteAccount
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default SupabaseAuthProvider