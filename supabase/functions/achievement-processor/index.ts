import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AchievementRule {
  id: string
  type: 'session_count' | 'total_minutes' | 'streak' | 'consistency' | 'milestone' | 'special'
  title: string
  description: string
  icon: string
  condition: {
    operator: 'gte' | 'eq' | 'lte'
    value: number
    timeframe?: 'day' | 'week' | 'month' | 'all_time'
    additional_criteria?: Record<string, any>
  }
  points: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

const ACHIEVEMENT_RULES: AchievementRule[] = [
  // Session Count Achievements
  {
    id: 'first_session',
    type: 'session_count',
    title: 'Langkah Pertama',
    description: 'Menyelesaikan sesi meditasi pertama',
    icon: '🌱',
    condition: { operator: 'gte', value: 1 },
    points: 10,
    rarity: 'common'
  },
  {
    id: 'ten_sessions',
    type: 'session_count', 
    title: 'Pembelajar Meditasi',
    description: 'Menyelesaikan 10 sesi meditasi',
    icon: '🌿',
    condition: { operator: 'gte', value: 10 },
    points: 50,
    rarity: 'common'
  },
  {
    id: 'fifty_sessions',
    type: 'session_count',
    title: 'Meditator Berdedikasi',
    description: 'Menyelesaikan 50 sesi meditasi',
    icon: '🌳',
    condition: { operator: 'gte', value: 50 },
    points: 200,
    rarity: 'rare'
  },
  {
    id: 'hundred_sessions',
    type: 'session_count',
    title: 'Master Meditasi',
    description: 'Menyelesaikan 100 sesi meditasi',
    icon: '🏆',
    condition: { operator: 'gte', value: 100 },
    points: 500,
    rarity: 'epic'
  },

  // Time-based Achievements
  {
    id: 'one_hour_total',
    type: 'total_minutes',
    title: 'Satu Jam Ketenangan',
    description: 'Menghabiskan total 60 menit bermeditasi',
    icon: '⏰',
    condition: { operator: 'gte', value: 60 },
    points: 30,
    rarity: 'common'
  },
  {
    id: 'ten_hours_total',
    type: 'total_minutes',
    title: 'Pencari Kedamaian',
    description: 'Menghabiskan total 10 jam bermeditasi',
    icon: '🕰️',
    condition: { operator: 'gte', value: 600 },
    points: 300,
    rarity: 'rare'
  },
  {
    id: 'hundred_hours_total',
    type: 'total_minutes',
    title: 'Guru Spiritual',
    description: 'Menghabiskan total 100 jam bermeditasi',
    icon: '🌟',
    condition: { operator: 'gte', value: 6000 },
    points: 2000,
    rarity: 'legendary'
  },

  // Streak Achievements
  {
    id: 'three_day_streak',
    type: 'streak',
    title: 'Konsistensi Awal',
    description: 'Bermeditasi 3 hari berturut-turut',
    icon: '🔥',
    condition: { operator: 'gte', value: 3 },
    points: 40,
    rarity: 'common'
  },
  {
    id: 'week_streak',
    type: 'streak',
    title: 'Seminggu Penuh',
    description: 'Bermeditasi 7 hari berturut-turut',
    icon: '🌈',
    condition: { operator: 'gte', value: 7 },
    points: 100,
    rarity: 'rare'
  },
  {
    id: 'month_streak',
    type: 'streak',
    title: 'Bulan Kebijaksanaan',
    description: 'Bermeditasi 30 hari berturut-turut',
    icon: '🌙',
    condition: { operator: 'gte', value: 30 },
    points: 1000,
    rarity: 'epic'
  },
  {
    id: 'hundred_day_streak',
    type: 'streak',
    title: 'Seratus Hari Zen',
    description: 'Bermeditasi 100 hari berturut-turut',
    icon: '💎',
    condition: { operator: 'gte', value: 100 },
    points: 5000,
    rarity: 'legendary'
  },

  // Consistency Achievements
  {
    id: 'weekend_warrior',
    type: 'consistency',
    title: 'Prajurit Akhir Pekan',
    description: 'Bermeditasi di akhir pekan selama 4 minggu berturut-turut',
    icon: '🛡️',
    condition: { 
      operator: 'gte', 
      value: 4,
      timeframe: 'week',
      additional_criteria: { weekend_only: true }
    },
    points: 150,
    rarity: 'rare'
  },
  {
    id: 'early_bird',
    type: 'consistency',
    title: 'Burung Pagi',
    description: 'Bermeditasi sebelum jam 7 pagi selama 7 hari berturut-turut',
    icon: '🌅',
    condition: { 
      operator: 'gte', 
      value: 7,
      additional_criteria: { before_hour: 7 }
    },
    points: 200,
    rarity: 'rare'
  },

  // Special Milestones
  {
    id: 'all_types',
    type: 'milestone',
    title: 'Penjelajah Meditasi',
    description: 'Mencoba semua jenis meditasi (breathing, guided, silent, walking)',
    icon: '🧭',
    condition: { 
      operator: 'eq', 
      value: 4,
      additional_criteria: { unique_types: true }
    },
    points: 300,
    rarity: 'epic'
  },
  {
    id: 'long_session',
    type: 'milestone',
    title: 'Meditasi Marathon',
    description: 'Menyelesaikan sesi meditasi 60 menit atau lebih',
    icon: '🏃‍♂️',
    condition: { 
      operator: 'gte', 
      value: 60,
      additional_criteria: { single_session: true }
    },
    points: 400,
    rarity: 'epic'
  },

  // Special Events
  {
    id: 'new_year_meditation',
    type: 'special',
    title: 'Resolusi Tahun Baru',
    description: 'Bermeditasi pada tanggal 1 Januari',
    icon: '🎊',
    condition: { 
      operator: 'gte', 
      value: 1,
      additional_criteria: { date: '01-01' }
    },
    points: 100,
    rarity: 'rare'
  },
  {
    id: 'mindfulness_day',
    type: 'special',
    title: 'Hari Mindfulness',
    description: 'Bermeditasi pada Hari Mindfulness Sedunia (12 September)',
    icon: '🧘‍♀️',
    condition: { 
      operator: 'gte', 
      value: 1,
      additional_criteria: { date: '12-09' }
    },
    points: 150,
    rarity: 'rare'
  }
]

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get request data
    const { user_id, trigger_event } = await req.json()

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Fetch user data
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('progress')
      .eq('id', user_id)
      .single()

    if (userError) {
      throw new Error(`Failed to fetch user data: ${userError.message}`)
    }

    // Fetch user sessions
    const { data: sessions, error: sessionsError } = await supabaseClient
      .from('meditation_sessions')
      .select('*')
      .eq('user_id', user_id)
      .order('completed_at', { ascending: true })

    if (sessionsError) {
      throw new Error(`Failed to fetch sessions: ${sessionsError.message}`)
    }

    // Fetch existing achievements
    const { data: existingAchievements, error: achievementsError } = await supabaseClient
      .from('achievements')
      .select('achievement_type')
      .eq('user_id', user_id)

    if (achievementsError) {
      throw new Error(`Failed to fetch achievements: ${achievementsError.message}`)
    }

    const existingTypes = new Set(existingAchievements?.map(a => a.achievement_type) || [])
    const newAchievements: any[] = []

    // Calculate current stats
    const stats = calculateUserStats(sessions || [], userData?.progress || {})

    // Check each achievement rule
    for (const rule of ACHIEVEMENT_RULES) {
      if (existingTypes.has(rule.id)) continue // Already unlocked

      const isUnlocked = checkAchievementCondition(rule, stats, sessions || [])
      
      if (isUnlocked) {
        newAchievements.push({
          user_id,
          achievement_type: rule.id,
          title: rule.title,
          description: rule.description,
          icon: rule.icon,
          unlocked_at: new Date().toISOString(),
          points: rule.points,
          rarity: rule.rarity
        })
      }
    }

    // Insert new achievements
    let insertedAchievements = []
    if (newAchievements.length > 0) {
      const { data: inserted, error: insertError } = await supabaseClient
        .from('achievements')
        .insert(newAchievements)
        .select()

      if (insertError) {
        throw new Error(`Failed to insert achievements: ${insertError.message}`)
      }
      
      insertedAchievements = inserted || []

      // Update user progress with new achievements
      const updatedProgress = {
        ...userData.progress,
        achievements: [
          ...(userData.progress?.achievements || []),
          ...newAchievements.map(a => a.achievement_type)
        ]
      }

      await supabaseClient
        .from('users')
        .update({ progress: updatedProgress })
        .eq('id', user_id)
    }

    return new Response(
      JSON.stringify({
        new_achievements: insertedAchievements,
        total_new: insertedAchievements.length,
        user_stats: stats,
        trigger_event
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Achievement processor error:', error)
    
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

function calculateUserStats(sessions: any[], progress: any) {
  const totalSessions = sessions.length
  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration_minutes, 0)
  const currentStreak = calculateCurrentStreak(sessions)
  const longestStreak = calculateLongestStreak(sessions)
  
  // Session types used
  const typesUsed = new Set(sessions.map(s => s.type)).size
  
  // Longest single session
  const longestSession = Math.max(...sessions.map(s => s.duration_minutes), 0)
  
  // Recent activity patterns
  const now = new Date()
  const recentSessions = sessions.filter(s => {
    const sessionDate = new Date(s.completed_at)
    const daysDiff = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))
    return daysDiff <= 30
  })
  
  // Weekend sessions in last month
  const weekendSessions = recentSessions.filter(s => {
    const day = new Date(s.completed_at).getDay()
    return day === 0 || day === 6 // Sunday or Saturday
  })
  
  // Early morning sessions (before 7 AM)
  const earlyMorningSessions = sessions.filter(s => {
    const hour = new Date(s.completed_at).getHours()
    return hour < 7
  })

  return {
    total_sessions: totalSessions,
    total_minutes: totalMinutes,
    current_streak: currentStreak,
    longest_streak: longestStreak,
    types_used: typesUsed,
    longest_session: longestSession,
    weekend_sessions_count: weekendSessions.length,
    early_morning_count: earlyMorningSessions.length,
    sessions_this_month: recentSessions.length
  }
}

function checkAchievementCondition(
  rule: AchievementRule, 
  stats: any, 
  sessions: any[]
): boolean {
  const { condition } = rule
  let checkValue: number

  switch (rule.type) {
    case 'session_count':
      checkValue = stats.total_sessions
      break
    case 'total_minutes':
      checkValue = stats.total_minutes
      break
    case 'streak':
      checkValue = Math.max(stats.current_streak, stats.longest_streak)
      break
    case 'consistency':
      if (condition.additional_criteria?.weekend_only) {
        checkValue = calculateConsecutiveWeekends(sessions)
      } else if (condition.additional_criteria?.before_hour) {
        checkValue = calculateConsecutiveEarlyMorning(sessions, condition.additional_criteria.before_hour)
      } else {
        checkValue = 0
      }
      break
    case 'milestone':
      if (condition.additional_criteria?.unique_types) {
        checkValue = stats.types_used
      } else if (condition.additional_criteria?.single_session) {
        checkValue = stats.longest_session
      } else {
        checkValue = 0
      }
      break
    case 'special':
      if (condition.additional_criteria?.date) {
        return hasSessionOnDate(sessions, condition.additional_criteria.date)
      }
      checkValue = 0
      break
    default:
      return false
  }

  switch (condition.operator) {
    case 'gte':
      return checkValue >= condition.value
    case 'eq':
      return checkValue === condition.value
    case 'lte':
      return checkValue <= condition.value
    default:
      return false
  }
}

function calculateCurrentStreak(sessions: any[]): number {
  if (!sessions.length) return 0

  const sortedSessions = sessions
    .map(s => new Date(s.completed_at).toDateString())
    .filter((date, index, arr) => arr.indexOf(date) === index)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  let streak = 0
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()

  if (sortedSessions.includes(today) || sortedSessions.includes(yesterday)) {
    const currentDate = new Date()
    
    for (const sessionDate of sortedSessions) {
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

function calculateLongestStreak(sessions: any[]): number {
  if (!sessions.length) return 0

  const uniqueDates = [...new Set(sessions.map(s => new Date(s.completed_at).toDateString()))]
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  let longestStreak = 1
  let currentStreak = 1

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i - 1])
    const currDate = new Date(uniqueDates[i])
    const diffTime = currDate.getTime() - prevDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      currentStreak++
      longestStreak = Math.max(longestStreak, currentStreak)
    } else {
      currentStreak = 1
    }
  }

  return longestStreak
}

function calculateConsecutiveWeekends(sessions: any[]): number {
  const weekends = sessions.filter(s => {
    const day = new Date(s.completed_at).getDay()
    return day === 0 || day === 6
  })

  if (!weekends.length) return 0

  // Group by week and check for consecutive weekends
  const weekGroups: Record<string, boolean> = {}
  
  weekends.forEach(session => {
    const date = new Date(session.completed_at)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay())
    const weekKey = weekStart.toISOString().split('T')[0]
    weekGroups[weekKey] = true
  })

  const sortedWeeks = Object.keys(weekGroups).sort()
  let consecutiveWeeks = 1
  let maxConsecutive = 1

  for (let i = 1; i < sortedWeeks.length; i++) {
    const prevWeek = new Date(sortedWeeks[i - 1])
    const currWeek = new Date(sortedWeeks[i])
    const diffWeeks = Math.floor((currWeek.getTime() - prevWeek.getTime()) / (7 * 24 * 60 * 60 * 1000))

    if (diffWeeks === 1) {
      consecutiveWeeks++
      maxConsecutive = Math.max(maxConsecutive, consecutiveWeeks)
    } else {
      consecutiveWeeks = 1
    }
  }

  return maxConsecutive
}

function calculateConsecutiveEarlyMorning(sessions: any[], beforeHour: number): number {
  const earlySessions = sessions
    .filter(s => new Date(s.completed_at).getHours() < beforeHour)
    .map(s => new Date(s.completed_at).toDateString())
    .filter((date, index, arr) => arr.indexOf(date) === index)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  if (!earlySessions.length) return 0

  let maxConsecutive = 1
  let currentConsecutive = 1

  for (let i = 1; i < earlySessions.length; i++) {
    const prevDate = new Date(earlySessions[i - 1])
    const currDate = new Date(earlySessions[i])
    const diffTime = currDate.getTime() - prevDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      currentConsecutive++
      maxConsecutive = Math.max(maxConsecutive, currentConsecutive)
    } else {
      currentConsecutive = 1
    }
  }

  return maxConsecutive
}

function hasSessionOnDate(sessions: any[], targetDate: string): boolean {
  return sessions.some(session => {
    const sessionDate = new Date(session.completed_at)
    const dateString = `${String(sessionDate.getDate()).padStart(2, '0')}-${String(sessionDate.getMonth() + 1).padStart(2, '0')}`
    return dateString === targetDate
  })
}