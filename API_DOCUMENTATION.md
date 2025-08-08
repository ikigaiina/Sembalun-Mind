# Sembalun Advanced Platform API Documentation

## Overview

This document provides comprehensive documentation for the Sembalun advanced Indonesian meditation platform's API, including AI personalization services, multi-agent coordination, cultural integration endpoints, and Supabase database operations.

**Version**: v2.0 Production | **Last Updated**: January 2025 | **Advanced Features**: AI Personalization, Multi-Agent Systems, Cultural Integration

## Table of Contents

### Core APIs
1. [Authentication API](#authentication-api) - Enhanced auth with Indonesian cultural preferences
2. [User Management](#user-management) - Advanced profile with AI personalization
3. [Meditation Sessions](#meditation-sessions) - Sessions with cultural context and analytics
4. [Progress Tracking](#progress-tracking) - AI-powered progress with Indonesian achievements

### Advanced Features
5. [AI Personalization Engine](#ai-personalization-engine) - Smart recommendations and adaptation
6. [Multi-Agent System](#multi-agent-system) - Task orchestration and coordination
7. [Cultural Integration](#cultural-integration) - Indonesian traditions and wisdom
8. [Offline Synchronization](#offline-synchronization) - Comprehensive offline support

### Infrastructure
9. [Real-time Subscriptions](#real-time-subscriptions) - Live data updates
10. [Performance Monitoring](#performance-monitoring) - Enterprise-grade analytics
11. [Error Handling](#error-handling) - Comprehensive error management
12. [Security & RLS](#security--rls) - Row-level security policies

## Base Configuration

### Supabase Client Setup

```typescript
// src/config/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});
```

### Environment Variables

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Authentication API

### Sign Up with Email

```typescript
POST /auth/signup
```

**Request:**
```typescript
interface SignUpRequest {
  email: string;
  password: string;
  displayName?: string;
}

const { error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securePassword123',
  options: {
    data: {
      full_name: 'John Doe',
      display_name: 'John'
    }
  }
});
```

**Response:**
```typescript
interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}
```

### Sign In with Email

```typescript
POST /auth/signin
```

**Request:**
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securePassword123'
});
```

### OAuth Sign In (Google/Apple)

```typescript
POST /auth/oauth
```

**Google Sign In:**
```typescript
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
    queryParams: {
      access_type: 'offline',
      prompt: 'consent'
    }
  }
});
```

**Apple Sign In:**
```typescript
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'apple',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
});
```

### Password Reset

```typescript
POST /auth/reset-password
```

**Request:**
```typescript
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/auth/reset-password`
});
```

### Sign Out

```typescript
POST /auth/signout
```

**Request:**
```typescript
const { error } = await supabase.auth.signOut();
```

### Get Session

```typescript
GET /auth/session
```

**Response:**
```typescript
const { data: { session }, error } = await supabase.auth.getSession();
```

## User Management

### User Profile Schema

```typescript
interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  preferences: UserPreferences;
  progress: UserProgress;
  is_guest: boolean;
  created_at: string;
  updated_at: string;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'id' | 'en';
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  meditation: MeditationSettings;
  accessibility: AccessibilitySettings;
  display: DisplaySettings;
}
```

### Get User Profile

```typescript
GET /users/{id}
```

**Implementation:**
```typescript
const getUserProfile = async (userId: string): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};
```

### Update User Profile

```typescript
PUT /users/{id}
```

**Request:**
```typescript
interface UpdateUserRequest {
  display_name?: string;
  avatar_url?: string;
  preferences?: Partial<UserPreferences>;
  progress?: Partial<UserProgress>;
}

const updateUserProfile = async (
  userId: string, 
  updates: UpdateUserRequest
): Promise<void> => {
  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId);
  
  if (error) throw error;
};
```

### Delete User Account

```typescript
DELETE /users/{id}
```

**Implementation:**
```typescript
const deleteAccount = async (userId: string): Promise<void> => {
  // Use database function for cascading deletes
  const { error } = await supabase.rpc('delete_user_account', {
    user_id: userId
  });
  
  if (error) throw error;
};
```

## Meditation Sessions

### Session Schema

```typescript
interface MeditationSession {
  id: string;
  user_id: string;
  type: 'breathing' | 'guided' | 'silent' | 'walking' | 'cultural';
  title: string;
  duration: number; // in seconds
  target_duration: number;
  completed_at: string;
  started_at: string;
  ended_at: string;
  quality: 1 | 2 | 3 | 4 | 5;
  mood_before?: MoodState;
  mood_after?: MoodState;
  techniques: string[];
  notes?: string;
  environment: 'quiet' | 'noisy' | 'nature' | 'indoor' | 'outdoor';
  interruptions: number;
  sync_status: 'synced' | 'pending' | 'conflict';
  created_at: string;
  updated_at: string;
}
```

### Create Meditation Session

```typescript
POST /meditation-sessions
```

**Request:**
```typescript
interface CreateSessionRequest {
  type: MeditationSession['type'];
  title: string;
  duration: number;
  target_duration: number;
  quality: number;
  mood_before?: MoodState;
  mood_after?: MoodState;
  techniques: string[];
  notes?: string;
  environment: MeditationSession['environment'];
  interruptions: number;
}

const createMeditationSession = async (
  userId: string,
  sessionData: CreateSessionRequest
): Promise<string> => {
  const { data, error } = await supabase
    .from('meditation_sessions')
    .insert({
      user_id: userId,
      ...sessionData,
      completed_at: new Date().toISOString(),
      started_at: new Date(Date.now() - sessionData.duration * 1000).toISOString(),
      ended_at: new Date().toISOString(),
      sync_status: 'synced'
    })
    .select('id')
    .single();
  
  if (error) throw error;
  return data.id;
};
```

### Get User Sessions

```typescript
GET /meditation-sessions?user_id={id}&limit={limit}&offset={offset}
```

**Implementation:**
```typescript
interface GetSessionsParams {
  userId: string;
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
  type?: MeditationSession['type'];
}

const getUserSessions = async (params: GetSessionsParams): Promise<MeditationSession[]> => {
  let query = supabase
    .from('meditation_sessions')
    .select('*')
    .eq('user_id', params.userId)
    .order('completed_at', { ascending: false });
  
  if (params.limit) {
    query = query.limit(params.limit);
  }
  
  if (params.offset) {
    query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
  }
  
  if (params.startDate) {
    query = query.gte('completed_at', params.startDate.toISOString());
  }
  
  if (params.endDate) {
    query = query.lte('completed_at', params.endDate.toISOString());
  }
  
  if (params.type) {
    query = query.eq('type', params.type);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};
```

### Update Meditation Session

```typescript
PUT /meditation-sessions/{id}
```

**Request:**
```typescript
interface UpdateSessionRequest {
  quality?: number;
  mood_after?: MoodState;
  notes?: string;
  techniques?: string[];
}

const updateMeditationSession = async (
  sessionId: string,
  updates: UpdateSessionRequest
): Promise<void> => {
  const { error } = await supabase
    .from('meditation_sessions')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', sessionId);
  
  if (error) throw error;
};
```

### Session Statistics

```typescript
GET /meditation-sessions/stats?user_id={id}&period={period}
```

**Implementation:**
```typescript
interface SessionStats {
  total_sessions: number;
  total_minutes: number;
  average_quality: number;
  consistency: number;
  favorite_types: Array<{ type: string; count: number }>;
  mood_improvement: number;
}

const getSessionStats = async (
  userId: string,
  period: 'week' | 'month' | 'year' = 'month'
): Promise<SessionStats> => {
  const { data, error } = await supabase.rpc('get_session_stats', {
    user_id: userId,
    period_type: period
  });
  
  if (error) throw error;
  return data;
};
```

## Progress Tracking

### Cairn Progress Schema

```typescript
interface CairnProgress {
  id: string;
  user_id: string;
  cairn_type: 'daily' | 'weekly' | 'monthly' | 'milestone' | 'achievement';
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  unit: 'sessions' | 'minutes' | 'days' | 'courses' | 'streaks';
  start_date: string;
  end_date?: string;
  completed_at?: string;
  is_completed: boolean;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: 'consistency' | 'duration' | 'variety' | 'mindfulness' | 'progress';
  rewards: CairnReward[];
  milestones: CairnMilestone[];
}
```

### Get User Progress

```typescript
GET /progress?user_id={id}
```

**Implementation:**
```typescript
const getUserProgress = async (userId: string): Promise<CairnProgress[]> => {
  const { data, error } = await supabase
    .from('cairn_progress')
    .select(`
      *,
      rewards(*),
      milestones(*)
    `)
    .eq('user_id', userId)
    .eq('is_completed', false)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};
```

### Update Cairn Progress

```typescript
PUT /progress/{cairn_id}
```

**Implementation:**
```typescript
const updateCairnProgress = async (
  userId: string,
  unit: CairnProgress['unit'],
  increment: number
): Promise<void> => {
  // Get active cairns for this unit
  const { data: cairns, error: fetchError } = await supabase
    .from('cairn_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('unit', unit)
    .eq('is_completed', false);
  
  if (fetchError) throw fetchError;
  
  // Update each active cairn
  for (const cairn of cairns || []) {
    const newValue = Math.min(cairn.target_value, cairn.current_value + increment);
    const isCompleted = newValue >= cairn.target_value;
    
    const { error: updateError } = await supabase
      .from('cairn_progress')
      .update({
        current_value: newValue,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', cairn.id);
    
    if (updateError) throw updateError;
  }
};
```

### User Streaks

```typescript
interface UserStreak {
  id: string;
  user_id: string;
  type: 'meditation' | 'mood_tracking' | 'course_study' | 'mindfulness';
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  start_date: string;
  is_active: boolean;
  motivation_level: 1 | 2 | 3 | 4 | 5;
  next_milestone: number;
}
```

### Get User Streaks

```typescript
GET /streaks?user_id={id}
```

**Implementation:**
```typescript
const getUserStreaks = async (userId: string): Promise<UserStreak[]> => {
  const { data, error } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId);
  
  if (error) throw error;
  return data || [];
};
```

### Update Streak

```typescript
PUT /streaks/{type}
```

**Implementation:**
```typescript
const updateUserStreak = async (
  userId: string,
  type: UserStreak['type'],
  activityDate: Date = new Date()
): Promise<void> => {
  // Get existing streak
  const { data: existingStreak, error: fetchError } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .eq('type', type)
    .single();
  
  if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
  
  if (!existingStreak) {
    // Create new streak
    const { error: insertError } = await supabase
      .from('user_streaks')
      .insert({
        user_id: userId,
        type,
        current_streak: 1,
        longest_streak: 1,
        last_activity_date: activityDate.toISOString(),
        start_date: activityDate.toISOString(),
        is_active: true,
        motivation_level: 3,
        next_milestone: 7
      });
    
    if (insertError) throw insertError;
  } else {
    // Update existing streak
    const lastActivity = new Date(existingStreak.last_activity_date);
    const daysDiff = Math.floor((activityDate.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    
    let newCurrentStreak = existingStreak.current_streak;
    let newStartDate = existingStreak.start_date;
    
    if (daysDiff === 1) {
      // Continue streak
      newCurrentStreak += 1;
    } else if (daysDiff > 1) {
      // Streak broken, start new
      newCurrentStreak = 1;
      newStartDate = activityDate.toISOString();
    }
    // daysDiff === 0 means same day, don't increment
    
    const { error: updateError } = await supabase
      .from('user_streaks')
      .update({
        current_streak: newCurrentStreak,
        longest_streak: Math.max(existingStreak.longest_streak, newCurrentStreak),
        last_activity_date: activityDate.toISOString(),
        start_date: newStartDate,
        is_active: daysDiff <= 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingStreak.id);
    
    if (updateError) throw updateError;
  }
};
```

## Personalization Engine

### Personalization Data Schema

```typescript
interface PersonalizationData {
  user_id: string;
  goal: 'stress' | 'focus' | 'sleep' | 'curious';
  mood?: MoodType;
  cultural_data: CulturalData;
  preferences: UserPreferences;
  behavior_analytics: BehaviorAnalytics;
  adaptive_settings: AdaptiveSettings;
  last_updated: string;
}

interface BehaviorAnalytics {
  session_history: SessionData[];
  usage_patterns: {
    active_time_slots: { [hour: number]: number };
    preferred_duration: number;
    completion_rate: number;
    streak_days: number;
    total_sessions: number;
    total_minutes: number;
  };
  mood_patterns: {
    mood_history: Array<{
      date: string;
      mood: MoodType;
      context?: string;
    }>;
    mood_trends: { [mood in MoodType]: number };
    mood_correlations: { [activity: string]: MoodType };
  };
}
```

### Get Personalized Recommendations

```typescript
GET /personalization/recommendations?user_id={id}
```

**Implementation:**
```typescript
interface MeditationRecommendation {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: string;
  reason: string;
  priority: number; // 1-5, 5 being highest
}

const getPersonalizedRecommendations = async (
  userId: string
): Promise<MeditationRecommendation[]> => {
  const { data, error } = await supabase.rpc('get_personalized_recommendations', {
    user_id: userId
  });
  
  if (error) throw error;
  return data || [];
};
```

### Get Smart Schedule

```typescript
GET /personalization/schedule?user_id={id}
```

**Implementation:**
```typescript
interface ScheduleRecommendation {
  id: string;
  time: string; // HH:MM format
  type: string;
  duration: number;
  reason: string;
  priority: 1 | 2 | 3 | 4 | 5;
  adaptable: boolean;
}

const getSmartSchedule = async (userId: string): Promise<ScheduleRecommendation[]> => {
  const { data, error } = await supabase.rpc('generate_smart_schedule', {
    user_id: userId
  });
  
  if (error) throw error;
  return data || [];
};
```

### Track User Behavior

```typescript
POST /personalization/track
```

**Request:**
```typescript
interface BehaviorTrackingRequest {
  event_type: 'session_complete' | 'mood_update' | 'preference_change' | 'content_interaction';
  event_data: Record<string, unknown>;
  timestamp?: string;
}

const trackUserBehavior = async (
  userId: string,
  tracking: BehaviorTrackingRequest
): Promise<void> => {
  const { error } = await supabase
    .from('behavior_tracking')
    .insert({
      user_id: userId,
      event_type: tracking.event_type,
      event_data: tracking.event_data,
      timestamp: tracking.timestamp || new Date().toISOString()
    });
  
  if (error) throw error;
};
```

## Cultural Content

### Cultural Theme Schema

```typescript
interface CulturalTheme {
  id: string;
  region: 'javanese' | 'balinese' | 'sundanese' | 'minang';
  name: string;
  display_name: string;
  description: string;
  color_palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  typography: {
    primary_font: string;
    heading_font: string;
    body_font: string;
  };
  patterns: string[];
  practices: string[];
  music_styles: string[];
  locations: string[];
  wisdom_quotes: WisdomQuote[];
}

interface WisdomQuote {
  id: string;
  text: string;
  author: string;
  region: string;
  context: string;
  translation?: string;
}
```

### Get Cultural Themes

```typescript
GET /cultural/themes
```

**Implementation:**
```typescript
const getCulturalThemes = async (): Promise<CulturalTheme[]> => {
  const { data, error } = await supabase
    .from('cultural_themes')
    .select('*')
    .eq('is_active', true);
  
  if (error) throw error;
  return data || [];
};
```

### Get Cultural Quotes

```typescript
GET /cultural/quotes?region={region}&limit={limit}
```

**Implementation:**
```typescript
const getCulturalQuotes = async (
  region?: string,
  limit: number = 10
): Promise<WisdomQuote[]> => {
  let query = supabase
    .from('wisdom_quotes')
    .select('*')
    .eq('is_active', true);
  
  if (region) {
    query = query.eq('region', region);
  }
  
  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
};
```

### Get Meditation Practices by Culture

```typescript
GET /cultural/practices?region={region}
```

**Implementation:**
```typescript
interface CulturalPractice {
  id: string;
  name: string;
  description: string;
  region: string;
  duration_range: [number, number];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  benefits: string[];
  audio_url?: string;
  is_guided: boolean;
}

const getCulturalPractices = async (region: string): Promise<CulturalPractice[]> => {
  const { data, error } = await supabase
    .from('cultural_practices')
    .select('*')
    .eq('region', region)
    .eq('is_active', true)
    .order('difficulty', { ascending: true });
  
  if (error) throw error;
  return data || [];
};
```

## Offline Synchronization

### Offline Queue Schema

```typescript
interface OfflineQueueItem {
  id: string;
  user_id: string;
  action: 'create' | 'update' | 'delete';
  table_name: string;
  record_id: string;
  data: Record<string, unknown>;
  timestamp: string;
  retry_count: number;
  max_retries: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
}
```

### Add to Offline Queue

```typescript
POST /offline/queue
```

**Implementation:**
```typescript
const addToOfflineQueue = async (
  userId: string,
  action: 'create' | 'update' | 'delete',
  tableName: string,
  recordId: string,
  data: Record<string, unknown>
): Promise<void> => {
  const queueItem: OfflineQueueItem = {
    id: crypto.randomUUID(),
    user_id: userId,
    action,
    table_name: tableName,
    record_id: recordId,
    data,
    timestamp: new Date().toISOString(),
    retry_count: 0,
    max_retries: 3,
    status: 'pending'
  };
  
  // Store in localStorage for persistence
  const existingQueue = JSON.parse(localStorage.getItem('offline_queue') || '[]');
  existingQueue.push(queueItem);
  localStorage.setItem('offline_queue', JSON.stringify(existingQueue));
};
```

### Process Offline Queue

```typescript
POST /offline/sync
```

**Implementation:**
```typescript
const processOfflineQueue = async (): Promise<void> => {
  const queueData = localStorage.getItem('offline_queue');
  if (!queueData) return;
  
  const queue: OfflineQueueItem[] = JSON.parse(queueData);
  const pendingItems = queue.filter(item => item.status === 'pending');
  
  for (const item of pendingItems) {
    try {
      item.status = 'processing';
      
      switch (item.action) {
        case 'create':
          await supabase.from(item.table_name).insert(item.data);
          break;
        case 'update':
          await supabase
            .from(item.table_name)
            .update(item.data)
            .eq('id', item.record_id);
          break;
        case 'delete':
          await supabase
            .from(item.table_name)
            .delete()
            .eq('id', item.record_id);
          break;
      }
      
      item.status = 'completed';
    } catch (error) {
      item.retry_count++;
      item.error_message = error instanceof Error ? error.message : 'Unknown error';
      
      if (item.retry_count >= item.max_retries) {
        item.status = 'failed';
      } else {
        item.status = 'pending';
      }
    }
  }
  
  // Update localStorage
  localStorage.setItem('offline_queue', JSON.stringify(queue));
  
  // Remove completed items
  const remainingItems = queue.filter(item => item.status !== 'completed');
  localStorage.setItem('offline_queue', JSON.stringify(remainingItems));
};
```

## Real-time Features

### Subscribe to User Data Changes

```typescript
const subscribeToUserData = (
  userId: string,
  callback: (payload: any) => void
): (() => void) => {
  const channels: any[] = [];
  
  // Subscribe to meditation sessions
  const sessionChannel = supabase
    .channel(`user_sessions:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'meditation_sessions',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
  channels.push(sessionChannel);
  
  // Subscribe to progress updates
  const progressChannel = supabase
    .channel(`user_progress:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'cairn_progress',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
  channels.push(progressChannel);
  
  // Subscribe to streak updates
  const streakChannel = supabase
    .channel(`user_streaks:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_streaks',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
  channels.push(streakChannel);
  
  // Return cleanup function
  return () => {
    channels.forEach(channel => supabase.removeChannel(channel));
  };
};
```

### Presence System

```typescript
interface UserPresence {
  user_id: string;
  is_online: boolean;
  last_seen: string;
  current_page: string;
  meditation_status?: 'idle' | 'meditating' | 'paused';
}

const trackUserPresence = (userId: string): (() => void) => {
  const channel = supabase.channel('user_presence', {
    config: { presence: { key: userId } }
  });
  
  // Track user presence
  const presence: UserPresence = {
    user_id: userId,
    is_online: true,
    last_seen: new Date().toISOString(),
    current_page: window.location.pathname,
    meditation_status: 'idle'
  };
  
  channel
    .on('presence', { event: 'sync' }, () => {
      const newState = channel.presenceState();
      console.log('Presence updated:', newState);
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('User joined:', key, newPresences);
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('User left:', key, leftPresences);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track(presence);
      }
    });
  
  // Update presence on page navigation
  const updatePresence = () => {
    presence.current_page = window.location.pathname;
    presence.last_seen = new Date().toISOString();
    channel.track(presence);
  };
  
  window.addEventListener('popstate', updatePresence);
  
  // Cleanup function
  return () => {
    window.removeEventListener('popstate', updatePresence);
    supabase.removeChannel(channel);
  };
};
```

## Error Handling

### Standard Error Response

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  hint?: string;
}

// Common error codes
const ERROR_CODES = {
  // Authentication errors
  INVALID_CREDENTIALS: 'invalid_credentials',
  EMAIL_NOT_CONFIRMED: 'email_not_confirmed',
  WEAK_PASSWORD: 'weak_password',
  
  // Database errors
  RECORD_NOT_FOUND: 'record_not_found',
  PERMISSION_DENIED: 'permission_denied',
  VALIDATION_ERROR: 'validation_error',
  
  // Network errors
  NETWORK_ERROR: 'network_error',
  TIMEOUT: 'timeout',
  
  // Application errors
  FEATURE_NOT_AVAILABLE: 'feature_not_available',
  QUOTA_EXCEEDED: 'quota_exceeded'
} as const;
```

### Error Handler Utility

```typescript
export const handleSupabaseError = (error: any): ApiError => {
  console.error('Supabase Error:', error);
  
  // Map common Supabase error codes
  switch (error.code) {
    case 'PGRST301':
      return {
        code: ERROR_CODES.NETWORK_ERROR,
        message: 'Network connection failed. Please check your internet connection.',
        details: { originalError: error }
      };
    
    case '42501':
      return {
        code: ERROR_CODES.PERMISSION_DENIED,
        message: 'Access denied. Please check your authentication status.',
        details: { originalError: error }
      };
    
    case 'PGRST116':
      return {
        code: ERROR_CODES.RECORD_NOT_FOUND,
        message: 'The requested record was not found.',
        details: { originalError: error }
      };
    
    default:
      return {
        code: 'unknown_error',
        message: error.message || 'An unexpected error occurred.',
        details: { originalError: error }
      };
  }
};
```

### Service-Level Error Handling

```typescript
export class ProgressService {
  async createMeditationSession(sessionData: CreateSessionRequest): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('meditation_sessions')
        .insert(sessionData)
        .select('id')
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('Failed to create session');
      
      return data.id;
    } catch (error) {
      // Add to offline queue if online operation fails
      await this.addToOfflineQueue('create', 'meditation_sessions', '', sessionData);
      
      // Re-throw handled error
      throw handleSupabaseError(error);
    }
  }
}
```

## Rate Limiting

### Client-Side Rate Limiting

```typescript
class RateLimiter {
  private limits = new Map<string, { count: number; resetTime: number }>();
  
  canMakeRequest(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const limit = this.limits.get(key);
    
    if (!limit || now > limit.resetTime) {
      this.limits.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (limit.count < maxRequests) {
      limit.count++;
      return true;
    }
    
    return false;
  }
  
  getRemainingRequests(key: string, maxRequests: number): number {
    const limit = this.limits.get(key);
    if (!limit) return maxRequests;
    return Math.max(0, maxRequests - limit.count);
  }
}

// Usage example
const rateLimiter = new RateLimiter();

const makeApiCall = async (endpoint: string, data: any) => {
  if (!rateLimiter.canMakeRequest(endpoint, 10, 60000)) { // 10 requests per minute
    throw new Error(`Rate limit exceeded for ${endpoint}. Please try again later.`);
  }
  
  // Make the actual API call
  return await fetch(endpoint, { method: 'POST', body: JSON.stringify(data) });
};
```

### Request Deduplication

```typescript
class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>();
  
  async deduplicate<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<T>;
    }
    
    const promise = requestFn()
      .finally(() => {
        this.pendingRequests.delete(key);
      });
    
    this.pendingRequests.set(key, promise);
    return promise;
  }
}

// Usage example
const deduplicator = new RequestDeduplicator();

const getUserData = async (userId: string) => {
  return deduplicator.deduplicate(`user-${userId}`, async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  });
};
```

## Performance Optimization

### Caching Strategy

```typescript
class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private maxSize = 100;
  
  set(key: string, data: any, ttlMs: number = 300000): void { // 5 minutes default
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }
  
  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  invalidate(pattern: string): void {
    const keysToDelete = Array.from(this.cache.keys())
      .filter(key => key.includes(pattern));
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

// Usage with API calls
const cache = new CacheManager();

const getCachedUserSessions = async (userId: string): Promise<MeditationSession[]> => {
  const cacheKey = `sessions-${userId}`;
  const cached = cache.get(cacheKey);
  
  if (cached) return cached;
  
  const sessions = await getUserSessions({ userId });
  cache.set(cacheKey, sessions, 300000); // Cache for 5 minutes
  
  return sessions;
};
```

This comprehensive API documentation provides detailed information about all the major endpoints, data structures, and integration patterns used in the Sembalun application. It serves as both a reference for developers and a guide for implementing new features that integrate with the existing API architecture.