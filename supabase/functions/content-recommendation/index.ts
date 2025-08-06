import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RecommendationRequest {
  user_id: string
  recommendation_type: 'courses' | 'session_types' | 'durations' | 'all'
  limit?: number
  context?: {
    current_mood?: string
    available_time?: number
    last_session_type?: string
    stress_level?: number
    goals?: string[]
  }
}

interface CourseRecommendation {
  course_id: string
  title: string
  description: string
  category: string
  difficulty: string
  duration_minutes: number
  instructor?: string
  image_url?: string
  audio_url?: string
  is_premium: boolean
  recommendation_score: number
  recommendation_reason: string
  user_progress?: number
}

interface SessionRecommendation {
  type: 'breathing' | 'guided' | 'silent' | 'walking'
  recommended_duration: number
  title: string
  description: string
  benefits: string[]
  difficulty: string
  recommendation_score: number
  recommendation_reason: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { 
      user_id, 
      recommendation_type, 
      limit = 10,
      context = {}
    }: RecommendationRequest = await req.json()

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Fetch user data and preferences
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('preferences, progress')
      .eq('id', user_id)
      .single()

    if (userError) {
      throw new Error(`Failed to fetch user data: ${userError.message}`)
    }

    // Fetch user's meditation history
    const { data: sessions, error: sessionsError } = await supabaseClient
      .from('meditation_sessions')
      .select('*')
      .eq('user_id', user_id)
      .order('completed_at', { ascending: false })
      .limit(50) // Recent 50 sessions for analysis

    if (sessionsError) {
      throw new Error(`Failed to fetch sessions: ${sessionsError.message}`)
    }

    // Fetch user's course progress
    const { data: courseProgress, error: progressError } = await supabaseClient
      .from('user_course_progress')
      .select('course_id, progress_percentage, completed_at')
      .eq('user_id', user_id)

    if (progressError) {
      throw new Error(`Failed to fetch course progress: ${progressError.message}`)
    }

    // Analyze user patterns
    const userAnalysis = analyzeUserPatterns(sessions || [], userData, courseProgress || [])

    let recommendations: any = {}

    if (recommendation_type === 'courses' || recommendation_type === 'all') {
      const { data: allCourses, error: coursesError } = await supabaseClient
        .from('courses')
        .select('*')
        .order('order_index', { ascending: true })

      if (coursesError) {
        throw new Error(`Failed to fetch courses: ${coursesError.message}`)
      }

      recommendations.courses = recommendCourses(
        allCourses || [], 
        userAnalysis, 
        courseProgress || [], 
        context,
        limit
      )
    }

    if (recommendation_type === 'session_types' || recommendation_type === 'all') {
      recommendations.session_types = recommendSessionTypes(
        userAnalysis,
        context,
        limit
      )
    }

    if (recommendation_type === 'durations' || recommendation_type === 'all') {
      recommendations.durations = recommendDurations(
        userAnalysis,
        context
      )
    }

    return new Response(
      JSON.stringify({
        recommendations,
        user_analysis: userAnalysis,
        context_used: context
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Content recommendation error:', error)
    
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

function analyzeUserPatterns(sessions: any[], userData: any, courseProgress: any[]) {
  const preferences = userData.preferences || {}
  const progress = userData.progress || {}

  // Session type preferences
  const typeCount: Record<string, number> = {}
  sessions.forEach(session => {
    typeCount[session.type] = (typeCount[session.type] || 0) + 1
  })

  const favoriteType = Object.entries(typeCount)
    .sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || 'guided'

  // Duration patterns
  const durations = sessions.map(s => s.duration_minutes)
  const avgDuration = durations.length > 0 
    ? durations.reduce((sum, d) => sum + d, 0) / durations.length 
    : preferences.meditation?.defaultDuration || 10

  // Time of day patterns
  const timeSlots: Record<string, number> = {
    morning: 0,   // 5-11
    afternoon: 0, // 12-17
    evening: 0,   // 18-23
    night: 0      // 0-4
  }

  sessions.forEach(session => {
    const hour = new Date(session.completed_at).getHours()
    if (hour >= 5 && hour <= 11) timeSlots.morning++
    else if (hour >= 12 && hour <= 17) timeSlots.afternoon++
    else if (hour >= 18 && hour <= 23) timeSlots.evening++
    else timeSlots.night++
  })

  const preferredTimeSlot = Object.entries(timeSlots)
    .sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || 'morning'

  // Experience level based on total sessions and completed courses
  let experienceLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
  const totalSessions = sessions.length
  const completedCourses = courseProgress.filter(p => p.progress_percentage >= 100).length

  if (totalSessions >= 50 || completedCourses >= 5) {
    experienceLevel = 'advanced'
  } else if (totalSessions >= 15 || completedCourses >= 2) {
    experienceLevel = 'intermediate'
  }

  // Consistency analysis
  const recentSessions = sessions.slice(0, 14) // Last 2 weeks
  const consistency = recentSessions.length / 14 // Sessions per day over 2 weeks

  // Mood analysis
  const moodSessions = sessions.filter(s => s.mood_after && s.mood_before)
  const avgMoodImprovement = moodSessions.length > 0
    ? moodSessions.reduce((sum, s) => sum + (parseInt(s.mood_after) - parseInt(s.mood_before)), 0) / moodSessions.length
    : 0

  return {
    favorite_type: favoriteType,
    type_distribution: typeCount,
    avg_duration: Math.round(avgDuration),
    preferred_time_slot: preferredTimeSlot,
    time_distribution: timeSlots,
    experience_level: experienceLevel,
    total_sessions: totalSessions,
    completed_courses: completedCourses,
    consistency_score: consistency,
    avg_mood_improvement: avgMoodImprovement,
    preferences: preferences.meditation || {},
    recent_activity: recentSessions.length,
    longest_streak: progress.longest_streak || 0
  }
}

function recommendCourses(
  allCourses: any[],
  userAnalysis: any,
  courseProgress: any[],
  context: any,
  limit: number
): CourseRecommendation[] {
  const completedCourseIds = new Set(
    courseProgress.filter(p => p.progress_percentage >= 100).map(p => p.course_id)
  )
  const inProgressCourseIds = new Set(
    courseProgress.filter(p => p.progress_percentage > 0 && p.progress_percentage < 100).map(p => p.course_id)
  )

  const scoredCourses = allCourses.map(course => {
    let score = 0
    let reasons: string[] = []

    // Skip completed courses
    if (completedCourseIds.has(course.id)) {
      return null
    }

    // Boost in-progress courses
    if (inProgressCourseIds.has(course.id)) {
      score += 50
      reasons.push('Melanjutkan kursus yang sedang berlangsung')
    }

    // Difficulty matching
    if (course.difficulty === userAnalysis.experience_level) {
      score += 30
      reasons.push(`Sesuai dengan level ${course.difficulty}`)
    } else if (
      (userAnalysis.experience_level === 'beginner' && course.difficulty === 'intermediate') ||
      (userAnalysis.experience_level === 'intermediate' && course.difficulty === 'advanced')
    ) {
      score += 15
      reasons.push('Tantangan untuk meningkatkan kemampuan')
    }

    // Duration preference
    const durationDiff = Math.abs(course.duration_minutes - userAnalysis.avg_duration)
    if (durationDiff <= 5) {
      score += 25
      reasons.push('Durasi sesuai preferensi Anda')
    } else if (durationDiff <= 10) {
      score += 10
      reasons.push('Durasi mendekati preferensi Anda')
    }

    // Context-based recommendations
    if (context.available_time) {
      if (Math.abs(course.duration_minutes - context.available_time) <= 5) {
        score += 35
        reasons.push('Sesuai dengan waktu yang Anda miliki')
      }
    }

    if (context.current_mood) {
      if (context.current_mood === 'stressed' && course.category === 'relaksasi') {
        score += 40
        reasons.push('Membantu mengurangi stres')
      } else if (context.current_mood === 'anxious' && course.category === 'pernapasan') {
        score += 40
        reasons.push('Membantu meredakan kecemasan')
      } else if (context.current_mood === 'energetic' && course.category === 'gerakan') {
        score += 40
        reasons.push('Cocok untuk energi yang tinggi')
      }
    }

    if (context.goals?.includes('sleep') && course.category === 'relaksasi') {
      score += 30
      reasons.push('Membantu meningkatkan kualitas tidur')
    }

    if (context.goals?.includes('focus') && course.category === 'konsentrasi') {
      score += 30
      reasons.push('Meningkatkan fokus dan konsentrasi')
    }

    // Popular courses get slight boost
    score += Math.min(course.order_index / 10, 5)

    // Premium content considerations
    if (course.is_premium && userAnalysis.experience_level === 'beginner') {
      score -= 10 // Slightly lower priority for beginners
    }

    // Variety bonus (encourage trying different categories)
    if (!userAnalysis.preferences.favorite_categories?.includes(course.category)) {
      score += 8
      reasons.push('Mencoba kategori baru')
    }

    return {
      course_id: course.id,
      title: course.title,
      description: course.description,
      category: course.category,
      difficulty: course.difficulty,
      duration_minutes: course.duration_minutes,
      instructor: course.instructor,
      image_url: course.image_url,
      audio_url: course.audio_url,
      is_premium: course.is_premium,
      recommendation_score: score,
      recommendation_reason: reasons.join(', ') || 'Cocok untuk Anda',
      user_progress: courseProgress.find(p => p.course_id === course.id)?.progress_percentage || 0
    }
  }).filter(Boolean) as CourseRecommendation[]

  return scoredCourses
    .sort((a, b) => b.recommendation_score - a.recommendation_score)
    .slice(0, limit)
}

function recommendSessionTypes(
  userAnalysis: any,
  context: any,
  limit: number
): SessionRecommendation[] {
  const sessionTypes = [
    {
      type: 'breathing' as const,
      title: 'Meditasi Pernapasan',
      description: 'Fokus pada napas untuk menenangkan pikiran',
      benefits: ['Mengurangi stres', 'Meningkatkan fokus', 'Mudah dilakukan'],
      difficulty: 'beginner'
    },
    {
      type: 'guided' as const,
      title: 'Meditasi Terpandu',
      description: 'Dipandu dengan instruksi suara yang jelas',
      benefits: ['Cocok untuk pemula', 'Terstruktur', 'Mudah diikuti'],
      difficulty: 'beginner'
    },
    {
      type: 'silent' as const,
      title: 'Meditasi Hening',
      description: 'Meditasi dalam keheningan tanpa panduan',
      benefits: ['Kedalaman spiritual', 'Ketenangan maksimal', 'Fleksibilitas'],
      difficulty: 'advanced'
    },
    {
      type: 'walking' as const,
      title: 'Meditasi Berjalan',
      description: 'Meditasi sambil bergerak dengan sadar',
      benefits: ['Menghubungkan dengan alam', 'Aktif bergerak', 'Mindfulness'],
      difficulty: 'intermediate'
    }
  ]

  const scoredTypes = sessionTypes.map(sessionType => {
    let score = 0
    let reasons: string[] = []

    // Base score from user's historical preference
    const userTypeCount = userAnalysis.type_distribution[sessionType.type] || 0
    const totalSessions = userAnalysis.total_sessions || 1
    const typePreference = userTypeCount / totalSessions

    if (sessionType.type === userAnalysis.favorite_type) {
      score += 30
      reasons.push('Jenis favorit Anda')
    } else if (typePreference > 0.3) {
      score += 20
      reasons.push('Sering Anda praktikkan')
    } else if (typePreference === 0) {
      score += 15
      reasons.push('Coba sesuatu yang baru')
    }

    // Difficulty matching
    if (
      (sessionType.difficulty === 'beginner' && userAnalysis.experience_level === 'beginner') ||
      (sessionType.difficulty === 'intermediate' && userAnalysis.experience_level === 'intermediate') ||
      (sessionType.difficulty === 'advanced' && userAnalysis.experience_level === 'advanced')
    ) {
      score += 25
      reasons.push(`Sesuai level ${userAnalysis.experience_level}`)
    }

    // Context-based scoring
    if (context.current_mood) {
      if (context.current_mood === 'stressed' && sessionType.type === 'breathing') {
        score += 40
        reasons.push('Pernapasan membantu mengurangi stres')
      } else if (context.current_mood === 'restless' && sessionType.type === 'walking') {
        score += 35
        reasons.push('Gerakan membantu menenangkan kegelisahan')
      } else if (context.current_mood === 'confused' && sessionType.type === 'guided') {
        score += 35
        reasons.push('Panduan membantu mengarahkan pikiran')
      } else if (context.current_mood === 'peaceful' && sessionType.type === 'silent') {
        score += 35
        reasons.push('Keheningan memperdalam kedamaian')
      }
    }

    if (context.available_time) {
      if (context.available_time <= 10 && sessionType.type === 'breathing') {
        score += 20
        reasons.push('Efektif untuk waktu singkat')
      } else if (context.available_time >= 20 && sessionType.type === 'walking') {
        score += 15
        reasons.push('Waktu cukup untuk bergerak mindful')
      }
    }

    if (context.stress_level) {
      if (context.stress_level >= 7 && sessionType.type === 'breathing') {
        score += 30
        reasons.push('Pernapasan cepat menurunkan stres')
      } else if (context.stress_level <= 3 && sessionType.type === 'silent') {
        score += 20
        reasons.push('Kondisi tenang cocok untuk keheningan')
      }
    }

    // Time-based recommendations
    const now = new Date()
    const hour = now.getHours()
    
    if (hour >= 6 && hour <= 9 && sessionType.type === 'breathing') {
      score += 15
      reasons.push('Pernapasan pagi memberi energi')
    } else if (hour >= 18 && hour <= 22 && sessionType.type === 'guided') {
      score += 15
      reasons.push('Panduan sore membantu relaksasi')
    }

    // Recommended duration based on type and user preference
    let recommendedDuration = userAnalysis.avg_duration
    
    if (context.available_time) {
      recommendedDuration = Math.min(context.available_time, recommendedDuration)
    }

    if (sessionType.type === 'walking') {
      recommendedDuration = Math.max(recommendedDuration, 15) // Walking needs more time
    } else if (sessionType.type === 'breathing') {
      recommendedDuration = Math.min(recommendedDuration, 20) // Breathing can be shorter
    }

    return {
      ...sessionType,
      recommended_duration: recommendedDuration,
      recommendation_score: score,
      recommendation_reason: reasons.length > 0 ? reasons.join(', ') : 'Cocok untuk sesi hari ini'
    }
  })

  return scoredTypes
    .sort((a, b) => b.recommendation_score - a.recommendation_score)
    .slice(0, limit)
}

function recommendDurations(userAnalysis: any, context: any) {
  const baseDuration = userAnalysis.avg_duration || 10
  const availableTime = context.available_time
  
  let recommendations = []

  if (availableTime) {
    // Recommend based on available time
    if (availableTime >= 30) {
      recommendations = [
        { duration: availableTime, reason: 'Manfaatkan waktu yang Anda miliki', priority: 'high' },
        { duration: Math.floor(availableTime * 0.75), reason: 'Sedikit lebih singkat dengan buffer waktu', priority: 'medium' },
        { duration: 15, reason: 'Sesi singkat tapi efektif', priority: 'low' }
      ]
    } else if (availableTime >= 15) {
      recommendations = [
        { duration: availableTime, reason: 'Sesuai waktu yang tersedia', priority: 'high' },
        { duration: 10, reason: 'Sesi singkat yang mudah', priority: 'medium' },
        { duration: 5, reason: 'Meditasi kilat', priority: 'low' }
      ]
    } else {
      recommendations = [
        { duration: availableTime, reason: 'Memanfaatkan waktu terbatas', priority: 'high' },
        { duration: 5, reason: 'Meditasi singkat tapi bermakna', priority: 'medium' },
        { duration: 3, reason: 'Napas sadar sejenak', priority: 'low' }
      ]
    }
  } else {
    // Recommend based on user patterns and preferences
    recommendations = [
      { duration: baseDuration, reason: 'Durasi biasa Anda', priority: 'high' },
      { duration: Math.min(baseDuration + 5, 30), reason: 'Sedikit lebih lama untuk mendalami', priority: 'medium' },
      { duration: Math.max(baseDuration - 5, 5), reason: 'Versi lebih singkat', priority: 'medium' },
    ]

    // Add context-specific recommendations
    if (context.stress_level >= 7) {
      recommendations.unshift({
        duration: 15,
        reason: 'Durasi optimal untuk meredakan stres',
        priority: 'high'
      })
    }

    if (context.current_mood === 'rushed') {
      recommendations.unshift({
        duration: 5,
        reason: 'Meditasi singkat saat terburu-buru',
        priority: 'high'
      })
    }
  }

  // Add consistency-based recommendations
  if (userAnalysis.consistency_score < 0.3) { // Low consistency
    recommendations.push({
      duration: 5,
      reason: 'Durasi pendek untuk membangun kebiasaan',
      priority: 'medium'
    })
  } else if (userAnalysis.consistency_score > 0.7) { // High consistency
    recommendations.push({
      duration: Math.min(baseDuration + 10, 45),
      reason: 'Anda siap untuk tantangan lebih lama',
      priority: 'medium'
    })
  }

  return recommendations.slice(0, 5) // Return top 5 recommendations
}