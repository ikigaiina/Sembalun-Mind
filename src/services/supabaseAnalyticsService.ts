import { supabase } from '../config/supabase'

export interface AnalyticsData {
  total_sessions: number
  total_minutes: number
  average_session_length: number
  most_active_day: string
  most_active_time: string
  favorite_type: string
  streak_data: {
    current_streak: number
    longest_streak: number
    streak_history: Array<{
      date: string
      sessions: number
    }>
  }
  mood_analysis: {
    mood_before_avg: number
    mood_after_avg: number
    mood_improvement: number
  }
  progress_trend: Array<{
    date: string
    cumulative_minutes: number
    sessions_count: number
  }>
  comparison?: {
    sessions_change: number
    sessions_change_percent: number
    minutes_change: number
    minutes_change_percent: number
  }
}

export interface UserAnalytics {
  analytics: AnalyticsData
  period: 'week' | 'month' | 'year'
  date_range: {
    start: string
    end: string
  }
}

export class SupabaseAnalyticsService {
  // Get comprehensive analytics for a user
  static async getUserAnalytics(
    userId: string,
    period: 'week' | 'month' | 'year' = 'month',
    includeComparisons: boolean = true
  ): Promise<{ data: UserAnalytics | null; error: any }> {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not available') }
    }

    try {
      // Call the meditation-analytics Edge Function
      const { data, error } = await supabase.functions.invoke('meditation-analytics', {
        body: {
          user_id: userId,
          period,
          include_comparisons: includeComparisons
        }
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Analytics service error:', error)
      return { data: null, error }
    }
  }

  // Get real-time session statistics
  static async getSessionStats(userId: string): Promise<{
    data: {
      today_sessions: number
      today_minutes: number
      week_sessions: number
      week_minutes: number
      current_streak: number
    } | null
    error: any
  }> {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not available') }
    }

    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay())

      // Get today's sessions
      const { data: todaySessions, error: todayError } = await supabase
        .from('meditation_sessions')
        .select('duration_minutes')
        .eq('user_id', userId)
        .gte('completed_at', today.toISOString())

      if (todayError) throw todayError

      // Get this week's sessions
      const { data: weekSessions, error: weekError } = await supabase
        .from('meditation_sessions')
        .select('duration_minutes, completed_at')
        .eq('user_id', userId)
        .gte('completed_at', weekStart.toISOString())

      if (weekError) throw weekError

      // Calculate streak
      const { data: allSessions, error: streakError } = await supabase
        .from('meditation_sessions')
        .select('completed_at')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(100)

      if (streakError) throw streakError

      const currentStreak = this.calculateCurrentStreak(allSessions || [])

      return {
        data: {
          today_sessions: todaySessions?.length || 0,
          today_minutes: todaySessions?.reduce((sum, s) => sum + s.duration_minutes, 0) || 0,
          week_sessions: weekSessions?.length || 0,
          week_minutes: weekSessions?.reduce((sum, s) => sum + s.duration_minutes, 0) || 0,
          current_streak: currentStreak
        },
        error: null
      }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Get mood insights
  static async getMoodInsights(userId: string, days: number = 30): Promise<{
    data: {
      mood_trend: Array<{
        date: string
        mood_before: number
        mood_after: number
        improvement: number
      }>
      average_improvement: number
      best_day: string
      most_improved_session_type: string
    } | null
    error: any
  }> {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not available') }
    }

    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data: sessions, error } = await supabase
        .from('meditation_sessions')
        .select('completed_at, mood_before, mood_after, type')
        .eq('user_id', userId)
        .gte('completed_at', startDate.toISOString())
        .not('mood_before', 'is', null)
        .not('mood_after', 'is', null)
        .order('completed_at', { ascending: true })

      if (error) throw error

      if (!sessions || sessions.length === 0) {
        return {
          data: {
            mood_trend: [],
            average_improvement: 0,
            best_day: '',
            most_improved_session_type: ''
          },
          error: null
        }
      }

      // Process mood data
      const moodTrend = sessions.map(session => {
        const moodBefore = parseInt(session.mood_before)
        const moodAfter = parseInt(session.mood_after)
        return {
          date: new Date(session.completed_at).toISOString().split('T')[0],
          mood_before: moodBefore,
          mood_after: moodAfter,
          improvement: moodAfter - moodBefore
        }
      })

      const averageImprovement = moodTrend.reduce((sum, m) => sum + m.improvement, 0) / moodTrend.length

      // Find best day (highest improvement)
      const bestDay = moodTrend.reduce((best, current) => 
        current.improvement > best.improvement ? current : best
      ).date

      // Find most improved session type
      const typeImprovements: Record<string, number[]> = {}
      sessions.forEach(session => {
        const improvement = parseInt(session.mood_after) - parseInt(session.mood_before)
        if (!typeImprovements[session.type]) {
          typeImprovements[session.type] = []
        }
        typeImprovements[session.type].push(improvement)
      })

      const avgByType = Object.entries(typeImprovements).map(([type, improvements]) => ({
        type,
        avgImprovement: improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length
      }))

      const mostImprovedType = avgByType.reduce((best, current) =>
        current.avgImprovement > best.avgImprovement ? current : best
      ).type

      return {
        data: {
          mood_trend: moodTrend,
          average_improvement: Math.round(averageImprovement * 100) / 100,
          best_day: bestDay,
          most_improved_session_type: mostImprovedType
        },
        error: null
      }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Get consistency metrics
  static async getConsistencyMetrics(userId: string): Promise<{
    data: {
      consistency_score: number
      best_time_of_day: string
      most_consistent_weekday: string
      monthly_consistency: Array<{
        month: string
        sessions: number
        consistency_score: number
      }>
    } | null
    error: any
  }> {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not available') }
    }

    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: sessions, error } = await supabase
        .from('meditation_sessions')
        .select('completed_at')
        .eq('user_id', userId)
        .gte('completed_at', thirtyDaysAgo.toISOString())
        .order('completed_at', { ascending: true })

      if (error) throw error

      if (!sessions || sessions.length === 0) {
        return {
          data: {
            consistency_score: 0,
            best_time_of_day: 'morning',
            most_consistent_weekday: 'monday',
            monthly_consistency: []
          },
          error: null
        }
      }

      // Calculate consistency score (sessions per day over 30 days)
      const consistencyScore = (sessions.length / 30) * 100

      // Analyze time of day patterns
      const timeSlots = { morning: 0, afternoon: 0, evening: 0, night: 0 }
      const weekdays = {
        sunday: 0, monday: 0, tuesday: 0, wednesday: 0,
        thursday: 0, friday: 0, saturday: 0
      }

      sessions.forEach(session => {
        const date = new Date(session.completed_at)
        const hour = date.getHours()
        const day = date.toLocaleDateString('en-US', { weekday: 'lowercase' })

        // Time slots
        if (hour >= 5 && hour < 12) timeSlots.morning++
        else if (hour >= 12 && hour < 17) timeSlots.afternoon++
        else if (hour >= 17 && hour < 22) timeSlots.evening++
        else timeSlots.night++

        // Weekdays
        if (weekdays.hasOwnProperty(day)) {
          weekdays[day as keyof typeof weekdays]++
        }
      })

      const bestTimeOfDay = Object.entries(timeSlots)
        .sort(([, a], [, b]) => b - a)[0][0]

      const mostConsistentWeekday = Object.entries(weekdays)
        .sort(([, a], [, b]) => b - a)[0][0]

      // Monthly consistency (last 6 months)
      const monthlyData: Record<string, number> = {}
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

      const { data: monthlySessions, error: monthlyError } = await supabase
        .from('meditation_sessions')
        .select('completed_at')
        .eq('user_id', userId)
        .gte('completed_at', sixMonthsAgo.toISOString())

      if (!monthlyError && monthlySessions) {
        monthlySessions.forEach(session => {
          const monthKey = new Date(session.completed_at).toISOString().substring(0, 7)
          monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1
        })
      }

      const monthlyConsistency = Object.entries(monthlyData).map(([month, sessions]) => {
        const daysInMonth = new Date(
          parseInt(month.split('-')[0]),
          parseInt(month.split('-')[1]),
          0
        ).getDate()
        return {
          month,
          sessions,
          consistency_score: Math.round((sessions / daysInMonth) * 100)
        }
      }).sort((a, b) => a.month.localeCompare(b.month))

      return {
        data: {
          consistency_score: Math.round(consistencyScore),
          best_time_of_day: bestTimeOfDay,
          most_consistent_weekday: mostConsistentWeekday,
          monthly_consistency: monthlyConsistency
        },
        error: null
      }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Track event for analytics
  static async trackEvent(
    userId: string,
    event: string,
    properties?: Record<string, any>
  ): Promise<{ error: any }> {
    if (!supabase) {
      return { error: new Error('Supabase not available') }
    }

    try {
      // For now, we'll store events in user_settings table
      // In production, you might want a dedicated events table
      const eventData = {
        user_id: userId,
        setting_key: `analytics_event_${Date.now()}`,
        setting_value: {
          event,
          properties: properties || {},
          timestamp: new Date().toISOString()
        }
      }

      const { error } = await supabase
        .from('user_settings')
        .insert([eventData])

      return { error }
    } catch (error) {
      return { error }
    }
  }

  // Helper method to calculate current streak
  private static calculateCurrentStreak(sessions: Array<{ completed_at: string }>): number {
    if (!sessions.length) return 0

    const uniqueDates = [...new Set(
      sessions.map(s => new Date(s.completed_at).toDateString())
    )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    let streak = 0
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()

    // Check if there's a session today or yesterday
    if (uniqueDates.includes(today) || uniqueDates.includes(yesterday)) {
      let currentDate = new Date()
      
      for (const sessionDate of uniqueDates) {
        const checkDate = currentDate.toDateString()
        if (sessionDate === checkDate) {
          streak++
          currentDate.setDate(currentDate.getDate() - 1)
        } else {
          break
        }
      }
    }

    return streak
  }

  // Export user data for analytics
  static async exportUserData(userId: string): Promise<{
    data: {
      sessions: any[]
      achievements: any[]
      progress: any
      journal_entries: any[]
    } | null
    error: any
  }> {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not available') }
    }

    try {
      // Fetch all user data
      const [sessionsResult, achievementsResult, userResult, journalResult] = await Promise.all([
        supabase
          .from('meditation_sessions')
          .select('*')
          .eq('user_id', userId)
          .order('completed_at', { ascending: true }),
        
        supabase
          .from('achievements')
          .select('*')
          .eq('user_id', userId)
          .order('unlocked_at', { ascending: true }),
        
        supabase
          .from('users')
          .select('progress, preferences')
          .eq('id', userId)
          .single(),
        
        supabase
          .from('journal_entries')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: true })
      ])

      if (sessionsResult.error) throw sessionsResult.error
      if (achievementsResult.error) throw achievementsResult.error
      if (userResult.error) throw userResult.error
      if (journalResult.error) throw journalResult.error

      return {
        data: {
          sessions: sessionsResult.data || [],
          achievements: achievementsResult.data || [],
          progress: userResult.data?.progress || {},
          journal_entries: journalResult.data || []
        },
        error: null
      }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Get achievement progress
  static async getAchievementProgress(userId: string): Promise<{
    data: {
      unlocked_count: number
      total_possible: number
      recent_achievements: any[]
      next_achievements: any[]
    } | null
    error: any
  }> {
    try {
      // This would typically call the achievement-processor function
      // For now, return basic data structure
      const { data: achievements, error } = await supabase
        ?.from('achievements')
        .select('*')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false })
        .limit(5) || { data: null, error: new Error('Supabase not available') }

      if (error) throw error

      return {
        data: {
          unlocked_count: achievements?.length || 0,
          total_possible: 25, // Based on achievement rules
          recent_achievements: achievements || [],
          next_achievements: [] // Would be calculated based on user progress
        },
        error: null
      }
    } catch (error) {
      return { data: null, error }
    }
  }
}