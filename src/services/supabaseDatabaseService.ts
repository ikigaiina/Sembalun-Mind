import { supabase } from '../config/supabase'

export interface MeditationSession {
  id: string
  user_id: string
  type: 'breathing' | 'guided' | 'silent' | 'walking'
  duration_minutes: number
  completed_at: string
  mood_before?: string
  mood_after?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface JournalEntry {
  id: string
  user_id: string
  title?: string
  content: string
  mood?: string
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface Achievement {
  id: string
  user_id: string
  achievement_type: string
  title: string
  description: string
  icon: string
  unlocked_at: string
  created_at: string
}

export interface Course {
  id: string
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration_minutes: number
  instructor?: string
  image_url?: string
  audio_url?: string
  is_premium: boolean
  order_index: number
  created_at: string
  updated_at: string
}

export interface UserCourseProgress {
  id: string
  user_id: string
  course_id: string
  progress_percentage: number
  last_accessed_at: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export class SupabaseDatabaseService {
  // Meditation Sessions
  static async createMeditationSession(session: Omit<MeditationSession, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: MeditationSession | null; error: any }> {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not available') }
    }

    const { data, error } = await supabase
      .from('meditation_sessions')
      .insert([session])
      .select()
      .single()

    return { data, error }
  }

  static async getUserMeditationSessions(userId: string, limit?: number): Promise<{ data: MeditationSession[] | null; error: any }> {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not available') }
    }

    let query = supabase
      .from('meditation_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    return { data, error }
  }

  static async updateMeditationSession(id: string, updates: Partial<MeditationSession>): Promise<{ data: MeditationSession | null; error: any }> {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not available') }
    }

    const { data, error } = await supabase
      .from('meditation_sessions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  }

  static async deleteMeditationSession(id: string): Promise<{ error: any }> {
    if (!supabase) {
      return { error: new Error('Supabase not available') }
    }

    const { error } = await supabase
      .from('meditation_sessions')
      .delete()
      .eq('id', id)

    return { error }
  }

  // Journal Entries
  static async createJournalEntry(entry: Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: JournalEntry | null; error: any }> {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not available') }
    }

    const { data, error } = await supabase
      .from('journal_entries')
      .insert([entry])
      .select()
      .single()

    return { data, error }
  }

  static async getUserJournalEntries(userId: string, limit?: number): Promise<{ data: JournalEntry[] | null; error: any }> {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not available') }
    }

    let query = supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    return { data, error }
  }

  static async updateJournalEntry(id: string, updates: Partial<JournalEntry>): Promise<{ data: JournalEntry | null; error: any }> {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not available') }
    }

    const { data, error } = await supabase
      .from('journal_entries')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  }

  static async deleteJournalEntry(id: string): Promise<{ error: any }> {
    if (!supabase) {
      return { error: new Error('Supabase not available') }
    }

    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id)

    return { error }
  }

  // Achievements
  static async createAchievement(achievement: Omit<Achievement, 'id' | 'created_at'>): Promise<{ data: Achievement | null; error: any }> {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not available') }
    }

    const { data, error } = await supabase
      .from('achievements')
      .insert([achievement])
      .select()
      .single()

    return { data, error }
  }

  static async getUserAchievements(userId: string): Promise<{ data: Achievement[] | null; error: any }> {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not available') }
    }

    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false })

    return { data, error }
  }

  // Courses
  static async getAllCourses(): Promise<{ data: Course[] | null; error: any }> {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not available') }
    }

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('order_index', { ascending: true })

    return { data, error }
  }

  static async getCourseById(id: string): Promise<{ data: Course | null; error: any }> {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not available') }
    }

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single()

    return { data, error }
  }

  static async getCoursesByCategory(category: string): Promise<{ data: Course[] | null; error: any }> {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not available') }
    }

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('category', category)
      .order('order_index', { ascending: true })

    return { data, error }
  }

  // User Course Progress
  static async getUserCourseProgress(userId: string, courseId: string): Promise<{ data: UserCourseProgress | null; error: any }> {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not available') }
    }

    const { data, error } = await supabase
      .from('user_course_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single()

    return { data, error }
  }

  static async updateCourseProgress(
    userId: string, 
    courseId: string, 
    progressPercentage: number
  ): Promise<{ data: UserCourseProgress | null; error: any }> {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not available') }
    }

    const { data, error } = await supabase
      .from('user_course_progress')
      .upsert({
        user_id: userId,
        course_id: courseId,
        progress_percentage: progressPercentage,
        last_accessed_at: new Date().toISOString(),
        completed_at: progressPercentage >= 100 ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    return { data, error }
  }

  static async getAllUserCourseProgress(userId: string): Promise<{ data: UserCourseProgress[] | null; error: any }> {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not available') }
    }

    const { data, error } = await supabase
      .from('user_course_progress')
      .select('*')
      .eq('user_id', userId)
      .order('last_accessed_at', { ascending: false })

    return { data, error }
  }

  // Analytics and Statistics
  static async getUserStats(userId: string): Promise<{ 
    data: {
      totalSessions: number
      totalMinutes: number
      averageSessionLength: number
      currentStreak: number
      longestStreak: number
      totalAchievements: number
      coursesCompleted: number
      journalEntries: number
    } | null
    error: any 
  }> {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not available') }
    }

    try {
      // Get meditation sessions stats
      const { data: sessions, error: sessionsError } = await supabase
        .from('meditation_sessions')
        .select('duration_minutes, completed_at')
        .eq('user_id', userId)

      if (sessionsError) throw sessionsError

      // Get achievements count
      const { count: achievementsCount, error: achievementsError } = await supabase
        .from('achievements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      if (achievementsError) throw achievementsError

      // Get completed courses count
      const { count: coursesCount, error: coursesError } = await supabase
        .from('user_course_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .not('completed_at', 'is', null)

      if (coursesError) throw coursesError

      // Get journal entries count
      const { count: journalCount, error: journalError } = await supabase
        .from('journal_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      if (journalError) throw journalError

      // Calculate stats
      const totalSessions = sessions?.length || 0
      const totalMinutes = sessions?.reduce((sum, session) => sum + session.duration_minutes, 0) || 0
      const averageSessionLength = totalSessions > 0 ? totalMinutes / totalSessions : 0

      // Calculate streaks (simplified - you might want to implement more complex logic)
      const currentStreak = this.calculateCurrentStreak(sessions || [])
      const longestStreak = this.calculateLongestStreak(sessions || [])

      return {
        data: {
          totalSessions,
          totalMinutes,
          averageSessionLength: Math.round(averageSessionLength * 100) / 100,
          currentStreak,
          longestStreak,
          totalAchievements: achievementsCount || 0,
          coursesCompleted: coursesCount || 0,
          journalEntries: journalCount || 0
        },
        error: null
      }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Helper functions for streak calculation
  private static calculateCurrentStreak(sessions: { completed_at: string }[]): number {
    if (!sessions.length) return 0

    // Sort sessions by date
    const sortedSessions = sessions
      .map(s => new Date(s.completed_at))
      .sort((a, b) => b.getTime() - a.getTime())

    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const sessionDate of sortedSessions) {
      const sessionDay = new Date(sessionDate)
      sessionDay.setHours(0, 0, 0, 0)

      const diffTime = currentDate.getTime() - sessionDay.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 0 || diffDays === 1) {
        streak++
        currentDate = sessionDay
      } else if (diffDays > 1) {
        break
      }
    }

    return streak
  }

  private static calculateLongestStreak(sessions: { completed_at: string }[]): number {
    if (!sessions.length) return 0

    // Group sessions by date
    const sessionDates = sessions
      .map(s => {
        const date = new Date(s.completed_at)
        date.setHours(0, 0, 0, 0)
        return date.getTime()
      })
      .filter((date, index, arr) => arr.indexOf(date) === index) // Remove duplicates
      .sort((a, b) => a - b)

    let longestStreak = 1
    let currentStreak = 1

    for (let i = 1; i < sessionDates.length; i++) {
      const diffTime = sessionDates[i] - sessionDates[i - 1]
      const diffDays = diffTime / (1000 * 60 * 60 * 24)

      if (diffDays === 1) {
        currentStreak++
        longestStreak = Math.max(longestStreak, currentStreak)
      } else {
        currentStreak = 1
      }
    }

    return longestStreak
  }

  // Real-time subscriptions
  static subscribeToUserSessions(userId: string, callback: (payload: any) => void) {
    if (!supabase) return null

    return supabase
      .channel('user_sessions')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'meditation_sessions',
          filter: `user_id=eq.${userId}`
        }, 
        callback
      )
      .subscribe()
  }

  static subscribeToUserJournal(userId: string, callback: (payload: any) => void) {
    if (!supabase) return null

    return supabase
      .channel('user_journal')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'journal_entries',
          filter: `user_id=eq.${userId}`
        }, 
        callback
      )
      .subscribe()
  }
}