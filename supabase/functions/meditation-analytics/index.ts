import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalyticsRequest {
  user_id: string
  period: 'week' | 'month' | 'year'
  include_comparisons?: boolean
}

interface SessionAnalytics {
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
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get request data
    const { user_id, period, include_comparisons = false }: AnalyticsRequest = await req.json()

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    
    switch (period) {
      case 'week': {
        startDate.setDate(endDate.getDate() - 7)
        break
      }
      case 'month': {
        startDate.setMonth(endDate.getMonth() - 1)
        break
      }
      case 'year': {
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
      }
    }

    // Fetch meditation sessions
    const { data: sessions, error: sessionsError } = await supabaseClient
      .from('meditation_sessions')
      .select('*')
      .eq('user_id', user_id)
      .gte('completed_at', startDate.toISOString())
      .lte('completed_at', endDate.toISOString())
      .order('completed_at', { ascending: true })

    if (sessionsError) {
      throw new Error(`Failed to fetch sessions: ${sessionsError.message}`)
    }

    // Calculate analytics
    const analytics: SessionAnalytics = {
      total_sessions: sessions?.length || 0,
      total_minutes: sessions?.reduce((sum, session) => sum + session.duration_minutes, 0) || 0,
      average_session_length: 0,
      most_active_day: '',
      most_active_time: '',
      favorite_type: '',
      streak_data: {
        current_streak: 0,
        longest_streak: 0,
        streak_history: []
      },
      mood_analysis: {
        mood_before_avg: 0,
        mood_after_avg: 0,
        mood_improvement: 0
      },
      progress_trend: []
    }

    if (sessions && sessions.length > 0) {
      // Average session length
      analytics.average_session_length = Math.round(
        (analytics.total_minutes / analytics.total_sessions) * 100
      ) / 100

      // Most active day of week
      const dayCount: Record<string, number> = {}
      const timeCount: Record<number, number> = {}
      const typeCount: Record<string, number> = {}

      sessions.forEach(session => {
        const date = new Date(session.completed_at)
        const dayName = date.toLocaleDateString('id-ID', { weekday: 'long' })
        const hour = date.getHours()

        dayCount[dayName] = (dayCount[dayName] || 0) + 1
        timeCount[hour] = (timeCount[hour] || 0) + 1
        typeCount[session.type] = (typeCount[session.type] || 0) + 1
      })

      analytics.most_active_day = Object.entries(dayCount)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || ''

      const mostActiveHour = Object.entries(timeCount)
        .sort(([, a], [, b]) => b - a)[0]?.[0]
      analytics.most_active_time = mostActiveHour 
        ? `${mostActiveHour}:00` 
        : ''

      analytics.favorite_type = Object.entries(typeCount)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || ''

      // Streak calculation
      const streakData = calculateStreaks(sessions)
      analytics.streak_data = streakData

      // Mood analysis
      const moodSessions = sessions.filter(s => s.mood_before && s.mood_after)
      if (moodSessions.length > 0) {
        const moodBefore = moodSessions.reduce((sum, s) => sum + parseInt(s.mood_before), 0) / moodSessions.length
        const moodAfter = moodSessions.reduce((sum, s) => sum + parseInt(s.mood_after), 0) / moodSessions.length
        
        analytics.mood_analysis = {
          mood_before_avg: Math.round(moodBefore * 100) / 100,
          mood_after_avg: Math.round(moodAfter * 100) / 100,
          mood_improvement: Math.round((moodAfter - moodBefore) * 100) / 100
        }
      }

      // Progress trend
      analytics.progress_trend = calculateProgressTrend(sessions, period)
    }

    // Include comparisons if requested
    let comparison = null
    if (include_comparisons) {
      const prevStartDate = new Date(startDate)
      const prevEndDate = new Date(endDate)
      
      switch (period) {
        case 'week': {
          prevStartDate.setDate(prevStartDate.getDate() - 7)
          prevEndDate.setDate(prevEndDate.getDate() - 7)
          break
        }
        case 'month': {
          prevStartDate.setMonth(prevStartDate.getMonth() - 1)
          prevEndDate.setMonth(prevEndDate.getMonth() - 1)
          break
        }
        case 'year': {
          prevStartDate.setFullYear(prevStartDate.getFullYear() - 1)
          prevEndDate.setFullYear(prevEndDate.getFullYear() - 1)
          break
        }
      }

      const { data: prevSessions } = await supabaseClient
        .from('meditation_sessions')
        .select('duration_minutes')
        .eq('user_id', user_id)
        .gte('completed_at', prevStartDate.toISOString())
        .lte('completed_at', prevEndDate.toISOString())

      if (prevSessions) {
        const prevTotal = prevSessions.length
        const prevMinutes = prevSessions.reduce((sum, s) => sum + s.duration_minutes, 0)
        
        comparison = {
          sessions_change: analytics.total_sessions - prevTotal,
          sessions_change_percent: prevTotal > 0 
            ? Math.round(((analytics.total_sessions - prevTotal) / prevTotal) * 100)
            : 0,
          minutes_change: analytics.total_minutes - prevMinutes,
          minutes_change_percent: prevMinutes > 0
            ? Math.round(((analytics.total_minutes - prevMinutes) / prevMinutes) * 100)
            : 0
        }
      }
    }

    // Return analytics
    return new Response(
      JSON.stringify({
        analytics,
        comparison,
        period,
        date_range: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Analytics function error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

function calculateStreaks(sessions: any[]): {
  current_streak: number
  longest_streak: number
  streak_history: Array<{ date: string; sessions: number }>
} {
  if (!sessions.length) {
    return {
      current_streak: 0,
      longest_streak: 0,
      streak_history: []
    }
  }

  // Group sessions by date
  const sessionsByDate: Record<string, number> = {}
  sessions.forEach(session => {
    const date = new Date(session.completed_at).toDateString()
    sessionsByDate[date] = (sessionsByDate[date] || 0) + 1
  })

  const dates = Object.keys(sessionsByDate).sort()
  
  // Calculate current streak
  let currentStreak = 0
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
  
  // Check if there's a session today or yesterday
  if (sessionsByDate[today] || sessionsByDate[yesterday]) {
    let checkDate = new Date()
    
    while (true) {
      const dateStr = checkDate.toDateString()
      if (sessionsByDate[dateStr]) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0
  let tempStreak = 0
  
  for (let i = 0; i < dates.length; i++) {
    if (i === 0) {
      tempStreak = 1
    } else {
      const prevDate = new Date(dates[i - 1])
      const currDate = new Date(dates[i])
      const diffTime = currDate.getTime() - prevDate.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) {
        tempStreak++
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 1
      }
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak)

  // Create streak history
  const streakHistory = dates.map(date => ({
    date,
    sessions: sessionsByDate[date]
  }))

  return {
    current_streak: currentStreak,
    longest_streak: longestStreak,
    streak_history: streakHistory
  }
}

function calculateProgressTrend(
  sessions: any[], 
  period: 'week' | 'month' | 'year'
): Array<{ date: string; cumulative_minutes: number; sessions_count: number }> {
  if (!sessions.length) return []

  const groupedData: Record<string, { minutes: number; sessions: number }> = {}
  let cumulativeMinutes = 0

  // Group by appropriate time period
  sessions.forEach(session => {
    const date = new Date(session.completed_at)
    let key: string

    switch (period) {
      case 'week':
        key = date.toISOString().split('T')[0] // Daily
        break
      case 'month':
        // Weekly grouping
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = weekStart.toISOString().split('T')[0]
        break
      case 'year':
        // Monthly grouping
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
    }

    if (!groupedData[key]) {
      groupedData[key] = { minutes: 0, sessions: 0 }
    }
    groupedData[key].minutes += session.duration_minutes
    groupedData[key].sessions += 1
  })

  // Convert to trend array with cumulative data
  return Object.entries(groupedData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => {
      cumulativeMinutes += data.minutes
      return {
        date,
        cumulative_minutes: cumulativeMinutes,
        sessions_count: data.sessions
      }
    })
}