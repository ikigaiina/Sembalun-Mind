import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createAuthenticatedSupabaseClient, getAuthenticatedUser } from '../_shared/auth.ts'
import { corsHeaders, createCorsResponse, handleCorsPrelight, createErrorResponse } from '../_shared/cors.ts'

interface UpdateProfileRequest {
  display_name?: string
  avatar_url?: string
  preferences?: Record<string, any>
  progress?: Record<string, any>
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsPrelight()
  }

  try {
    const { user, supabaseClient } = await getAuthenticatedUser(req)

    switch (req.method) {
      case 'GET': {
        return await getUserProfile(user.id, supabaseClient)
      }
      case 'PUT':
      case 'PATCH': {
        const updateData: UpdateProfileRequest = await req.json()
        return await updateUserProfile(user.id, updateData, supabaseClient)
      }
      case 'DELETE': {
        return await deleteUserProfile(user.id, supabaseClient)
      }
      default: {
        return createErrorResponse('Method not allowed', 405)
      }
    }

  } catch (error) {
    console.error('User profile function error:', error)
    
    if (error.message.includes('Unauthorized')) {
      return createErrorResponse('Unauthorized', 401)
    }
    
    return createErrorResponse('Internal server error', 500, error.message)
  }
})

async function getUserProfile(userId: string, supabaseClient: any) {
  try {
    const { data: profile, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // Row not found
        return createErrorResponse('Profile not found', 404)
      }
      throw error
    }

    // Get additional user statistics
    const [sessionsResult, achievementsResult, journalResult] = await Promise.allSettled([
      supabaseClient
        .from('meditation_sessions')
        .select('duration_minutes, completed_at')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(50),
      
      supabaseClient
        .from('achievements')
        .select('achievement_type, unlocked_at')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false }),
      
      supabaseClient
        .from('journal_entries')
        .select('id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)
    ])

    // Calculate statistics
    const sessions = sessionsResult.status === 'fulfilled' ? sessionsResult.value.data || [] : []
    const achievements = achievementsResult.status === 'fulfilled' ? achievementsResult.value.data || [] : []
    const journalEntries = journalResult.status === 'fulfilled' ? journalResult.value.data || [] : []

    const totalSessions = sessions.length
    const totalMinutes = sessions.reduce((sum: number, session: any) => sum + session.duration_minutes, 0)
    const currentStreak = calculateCurrentStreak(sessions)

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentSessions = sessions.filter((session: any) => 
      new Date(session.completed_at) >= sevenDaysAgo
    )

    const profileWithStats = {
      ...profile,
      statistics: {
        total_sessions: totalSessions,
        total_minutes: totalMinutes,
        current_streak: currentStreak,
        total_achievements: achievements.length,
        total_journal_entries: journalEntries.length,
        recent_sessions_count: recentSessions.length,
        last_session_date: sessions[0]?.completed_at || null,
        last_achievement_date: achievements[0]?.unlocked_at || null
      },
      recent_activity: {
        sessions: recentSessions.slice(0, 5),
        achievements: achievements.slice(0, 3),
        journal_entries: journalEntries.slice(0, 3)
      }
    }

    return createCorsResponse(profileWithStats)

  } catch (error) {
    console.error('Get profile error:', error)
    return createErrorResponse('Failed to fetch profile', 500)
  }
}

async function updateUserProfile(
  userId: string, 
  updateData: UpdateProfileRequest, 
  supabaseClient: any
) {
  try {
    // Validate update data
    const allowedFields = ['display_name', 'avatar_url', 'preferences', 'progress']
    const filteredData = Object.keys(updateData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = updateData[key as keyof UpdateProfileRequest]
        return obj
      }, {})

    if (Object.keys(filteredData).length === 0) {
      return createErrorResponse('No valid fields to update', 400)
    }

    // Add updated timestamp
    filteredData.updated_at = new Date().toISOString()

    const { data, error } = await supabaseClient
      .from('users')
      .update(filteredData)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    // Log profile update for analytics
    await supabaseClient
      .from('user_settings')
      .insert([{
        user_id: userId,
        setting_key: `profile_update_${Date.now()}`,
        setting_value: {
          action: 'profile_updated',
          fields: Object.keys(filteredData),
          timestamp: new Date().toISOString()
        }
      }])

    return createCorsResponse({
      message: 'Profile updated successfully',
      data: data
    })

  } catch (error) {
    console.error('Update profile error:', error)
    return createErrorResponse('Failed to update profile', 500)
  }
}

async function deleteUserProfile(userId: string, supabaseClient: any) {
  try {
    // This is a soft delete - we'll keep the data but mark as deleted
    // In production, you might want to implement a more comprehensive deletion process
    
    const { error } = await supabaseClient
      .from('users')
      .update({
        display_name: 'Deleted User',
        avatar_url: null,
        preferences: {},
        progress: {},
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      throw error
    }

    // Log deletion for audit purposes
    await supabaseClient
      .from('user_settings')
      .insert([{
        user_id: userId,
        setting_key: `profile_deletion_${Date.now()}`,
        setting_value: {
          action: 'profile_deleted',
          timestamp: new Date().toISOString(),
          method: 'soft_delete'
        }
      }])

    return createCorsResponse({
      message: 'Profile deleted successfully'
    })

  } catch (error) {
    console.error('Delete profile error:', error)
    return createErrorResponse('Failed to delete profile', 500)
  }
}

// Helper function to calculate current streak
function calculateCurrentStreak(sessions: Array<{ completed_at: string }>): number {
  if (!sessions.length) return 0

  const uniqueDates = [...new Set(
    sessions.map(s => new Date(s.completed_at).toDateString())
  )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  let streak = 0
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()

  // Check if there's a session today or yesterday
  if (uniqueDates.includes(today) || uniqueDates.includes(yesterday)) {
    const currentDate = new Date()
    
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