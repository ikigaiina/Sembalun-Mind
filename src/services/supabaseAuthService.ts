import { supabase } from '../config/supabase'
import type { User, Session, AuthError } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  email: string
  display_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
  preferences?: {
    theme: 'light' | 'dark' | 'auto'
    language: string
    notifications: {
      daily: boolean
      reminders: boolean
      achievements: boolean
      weeklyProgress: boolean
      socialUpdates: boolean
      push: boolean
      email: boolean
      sound: boolean
      vibration: boolean
    }
    privacy: {
      analytics: boolean
      dataSharing: boolean
      profileVisibility: 'public' | 'private'
      shareProgress: boolean
      locationTracking: boolean
    }
    meditation: {
      defaultDuration: number
      preferredVoice: string
      backgroundSounds: boolean
      guidanceLevel: 'minimal' | 'moderate' | 'detailed'
      musicVolume: number
      voiceVolume: number
      autoAdvance: boolean
      showTimer: boolean
      preparationTime: number
      endingBell: boolean
    }
    accessibility: {
      reducedMotion: boolean
      highContrast: boolean
      fontSize: 'small' | 'medium' | 'large'
      screenReader: boolean
      keyboardNavigation: boolean
    }
    display: {
      dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
      timeFormat: '12h' | '24h'
      weekStartsOn: 'sunday' | 'monday'
      showStreaks: boolean
      showStatistics: boolean
    }
  }
  progress?: {
    total_sessions: number
    total_minutes: number
    current_streak: number
    longest_streak: number
    achievements: string[]
    last_session_date?: string
    favorite_categories: string[]
    completed_programs: string[]
  }
  is_guest: boolean
}

export class SupabaseAuthService {
  static async getCurrentUser(): Promise<User | null> {
    if (!supabase) return null
    
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  static async getCurrentSession(): Promise<Session | null> {
    if (!supabase) return null
    
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }

  static async signUp(email: string, password: string, metadata?: any): Promise<{ user: User | null; error: AuthError | null }> {
    if (!supabase) {
      return { user: null, error: new Error('Supabase not available') as AuthError }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })

    return { user: data.user, error }
  }

  static async signIn(email: string, password: string): Promise<{ user: User | null; error: AuthError | null }> {
    if (!supabase) {
      return { user: null, error: new Error('Supabase not available') as AuthError }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    return { user: data.user, error }
  }

  static async signInWithGoogle(): Promise<{ error: AuthError | null }> {
    if (!supabase) {
      return { error: new Error('Supabase not available') as AuthError }
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    return { error }
  }

  static async signInWithApple(): Promise<{ error: AuthError | null }> {
    if (!supabase) {
      return { error: new Error('Supabase not available') as AuthError }
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    return { error }
  }

  static async signOut(): Promise<{ error: AuthError | null }> {
    if (!supabase) {
      return { error: new Error('Supabase not available') as AuthError }
    }

    const { error } = await supabase.auth.signOut()
    return { error }
  }

  static async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    if (!supabase) {
      return { error: new Error('Supabase not available') as AuthError }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })

    return { error }
  }

  static async updateProfile(updates: Partial<UserProfile>): Promise<{ error: AuthError | null }> {
    if (!supabase) {
      return { error: new Error('Supabase not available') as AuthError }
    }

    const { error } = await supabase.auth.updateUser({
      data: updates
    })

    return { error }
  }

  static async getUserProfile(userId: string): Promise<{ profile: UserProfile | null; error: any }> {
    if (!supabase) {
      return { profile: null, error: new Error('Supabase not available') }
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    return { profile: data, error }
  }

  static async createUserProfile(profile: Partial<UserProfile>): Promise<{ error: any }> {
    if (!supabase) {
      return { error: new Error('Supabase not available') }
    }

    const { error } = await supabase
      .from('users')
      .insert([profile])

    return { error }
  }

  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<{ error: any }> {
    if (!supabase) {
      return { error: new Error('Supabase not available') }
    }

    const { error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    return { error }
  }

  static async deleteAccount(): Promise<{ error: AuthError | null }> {
    if (!supabase) {
      return { error: new Error('Supabase not available') as AuthError }
    }

    const user = await this.getCurrentUser()
    if (!user) {
      return { error: new Error('No user to delete') as AuthError }
    }

    // Delete user profile from database
    await supabase
      .from('users')
      .delete()
      .eq('id', user.id)

    // Note: This will need to be implemented as an RPC function in Supabase
    // for proper account deletion including auth user
    const { error } = await supabase.rpc('delete_user_account')

    return { error }
  }

  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } }

    return supabase.auth.onAuthStateChange(callback)
  }

  // Guest user functionality
  static createGuestUser(): UserProfile {
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      id: guestId,
      email: '',
      display_name: 'Tamu',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_guest: true,
      preferences: {
        theme: 'auto',
        language: 'id',
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
          profileVisibility: 'private',
          shareProgress: false,
          locationTracking: false,
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
          endingBell: true,
        },
        accessibility: {
          reducedMotion: false,
          highContrast: false,
          fontSize: 'medium',
          screenReader: false,
          keyboardNavigation: false,
        },
        display: {
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '24h',
          weekStartsOn: 'monday',
          showStreaks: true,
          showStatistics: true,
        },
      },
      progress: {
        total_sessions: 0,
        total_minutes: 0,
        current_streak: 0,
        longest_streak: 0,
        achievements: [],
        favorite_categories: [],
        completed_programs: [],
      },
    }
  }

  static saveGuestData(profile: UserProfile): void {
    localStorage.setItem('supabase_guest_data', JSON.stringify(profile))
  }

  static getGuestData(): UserProfile | null {
    const data = localStorage.getItem('supabase_guest_data')
    return data ? JSON.parse(data) : null
  }

  static clearGuestData(): void {
    localStorage.removeItem('supabase_guest_data')
  }

  static async migrateGuestData(guestProfile: UserProfile): Promise<{ error: any }> {
    const user = await this.getCurrentUser()
    if (!user) {
      return { error: new Error('No authenticated user to migrate to') }
    }

    try {
      // Get current user profile
      const { profile: currentProfile } = await this.getUserProfile(user.id)
      
      if (currentProfile) {
        // Merge guest data with existing profile
        const mergedProgress = {
          total_sessions: (currentProfile.progress?.total_sessions || 0) + (guestProfile.progress?.total_sessions || 0),
          total_minutes: (currentProfile.progress?.total_minutes || 0) + (guestProfile.progress?.total_minutes || 0),
          current_streak: Math.max(currentProfile.progress?.current_streak || 0, guestProfile.progress?.current_streak || 0),
          longest_streak: Math.max(currentProfile.progress?.longest_streak || 0, guestProfile.progress?.longest_streak || 0),
          achievements: [...new Set([
            ...(currentProfile.progress?.achievements || []),
            ...(guestProfile.progress?.achievements || [])
          ])],
          last_session_date: guestProfile.progress?.last_session_date || currentProfile.progress?.last_session_date,
          favorite_categories: [...new Set([
            ...(currentProfile.progress?.favorite_categories || []),
            ...(guestProfile.progress?.favorite_categories || [])
          ])],
          completed_programs: [...new Set([
            ...(currentProfile.progress?.completed_programs || []),
            ...(guestProfile.progress?.completed_programs || [])
          ])]
        }

        await this.updateUserProfile(user.id, {
          progress: mergedProgress,
          preferences: { ...currentProfile.preferences, ...guestProfile.preferences }
        })
      } else {
        // Create new profile with guest data
        await this.createUserProfile({
          id: user.id,
          email: user.email || '',
          display_name: user.user_metadata?.display_name || guestProfile.display_name,
          avatar_url: user.user_metadata?.avatar_url,
          preferences: guestProfile.preferences,
          progress: guestProfile.progress,
          is_guest: false
        })
      }

      // Clear guest data after successful migration
      this.clearGuestData()
      
      return { error: null }
    } catch (error) {
      console.error('Error migrating guest data:', error)
      return { error }
    }
  }
}