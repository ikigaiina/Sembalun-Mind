-- =====================================================
-- REALTIME CONFIGURATION FOR SEMBALUN MIND
-- Setup realtime subscriptions and triggers
-- =====================================================

-- =====================================================
-- ENABLE REALTIME ON RELEVANT TABLES
-- =====================================================

-- Core user activity tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meditation_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mood_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_achievements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_memberships;

-- Analytics tables (for live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_analytics;

-- Course progress (for live progress updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_course_progress;

-- =====================================================
-- REALTIME NOTIFICATION FUNCTIONS
-- =====================================================

-- Function to notify achievement earned
CREATE OR REPLACE FUNCTION notify_achievement_earned()
RETURNS TRIGGER AS $$
BEGIN
  -- Trigger realtime notification
  PERFORM pg_notify(
    'achievement_earned',
    json_build_object(
      'user_id', NEW.user_id,
      'achievement_id', NEW.achievement_id,
      'earned_at', NEW.earned_at,
      'type', 'achievement_earned'
    )::text
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for achievement notifications
CREATE TRIGGER trigger_achievement_notification
  AFTER INSERT ON public.user_achievements
  FOR EACH ROW EXECUTE FUNCTION notify_achievement_earned();

-- Function to notify meditation session completion
CREATE OR REPLACE FUNCTION notify_session_completed()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger for completed sessions
  IF NEW.completed_at IS NOT NULL AND (OLD.completed_at IS NULL OR OLD IS NULL) THEN
    PERFORM pg_notify(
      'session_completed',
      json_build_object(
        'user_id', NEW.user_id,
        'session_id', NEW.id,
        'duration_minutes', NEW.duration_actual_minutes,
        'type', NEW.type,
        'completed_at', NEW.completed_at,
        'event_type', 'session_completed'
      )::text
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for session completion notifications
CREATE TRIGGER trigger_session_notification
  AFTER INSERT OR UPDATE ON public.meditation_sessions
  FOR EACH ROW EXECUTE FUNCTION notify_session_completed();

-- Function to notify mood entry
CREATE OR REPLACE FUNCTION notify_mood_entry()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify mood pattern analysis system
  PERFORM pg_notify(
    'mood_entry_created',
    json_build_object(
      'user_id', NEW.user_id,
      'mood_id', NEW.id,
      'primary_mood', NEW.primary_mood,
      'mood_intensity', NEW.mood_intensity,
      'created_at', NEW.created_at,
      'event_type', 'mood_entry_created'
    )::text
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for mood entry notifications
CREATE TRIGGER trigger_mood_notification
  AFTER INSERT ON public.mood_entries
  FOR EACH ROW EXECUTE FUNCTION notify_mood_entry();

-- Function to notify progress updates
CREATE OR REPLACE FUNCTION notify_progress_update()
RETURNS TRIGGER AS $$
DECLARE
  progress_change INTEGER;
BEGIN
  -- Calculate progress change
  progress_change := NEW.progress_percentage - COALESCE(OLD.progress_percentage, 0);
  
  -- Only notify for significant progress (25% increments)
  IF progress_change >= 25 OR NEW.completed_at IS NOT NULL THEN
    PERFORM pg_notify(
      'progress_updated',
      json_build_object(
        'user_id', NEW.user_id,
        'course_id', NEW.course_id,
        'progress_percentage', NEW.progress_percentage,
        'completed_at', NEW.completed_at,
        'progress_change', progress_change,
        'event_type', 'progress_updated'
      )::text
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for progress notifications
CREATE TRIGGER trigger_progress_notification
  AFTER UPDATE ON public.user_course_progress
  FOR EACH ROW EXECUTE FUNCTION notify_progress_update();

-- =====================================================
-- COMMUNITY REALTIME FUNCTIONS
-- =====================================================

-- Function to notify community activity
CREATE OR REPLACE FUNCTION notify_community_activity()
RETURNS TRIGGER AS $$
DECLARE
  group_info RECORD;
BEGIN
  -- Get group information
  SELECT name, type INTO group_info
  FROM public.community_groups
  WHERE id = NEW.group_id;
  
  PERFORM pg_notify(
    concat('community_', NEW.group_id::text),
    json_build_object(
      'user_id', NEW.user_id,
      'group_id', NEW.group_id,
      'group_name', group_info.name,
      'group_type', group_info.type,
      'event_type', 'member_joined'
    )::text
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for community activity
CREATE TRIGGER trigger_community_notification
  AFTER INSERT ON public.community_memberships
  FOR EACH ROW EXECUTE FUNCTION notify_community_activity();

-- =====================================================
-- USER ACTIVITY SUMMARY FUNCTION
-- =====================================================

-- Function to broadcast user activity summary
CREATE OR REPLACE FUNCTION broadcast_user_activity_summary(target_user_id UUID)
RETURNS void AS $$
DECLARE
  activity_summary JSONB;
BEGIN
  -- Build comprehensive activity summary
  SELECT json_build_object(
    'user_id', target_user_id,
    'today_sessions', (
      SELECT COUNT(*) FROM public.meditation_sessions 
      WHERE user_id = target_user_id 
        AND DATE(completed_at) = CURRENT_DATE
    ),
    'today_minutes', (
      SELECT COALESCE(SUM(duration_actual_minutes), 0) FROM public.meditation_sessions 
      WHERE user_id = target_user_id 
        AND DATE(completed_at) = CURRENT_DATE
    ),
    'current_streak', (
      SELECT current_streak_days FROM public.users 
      WHERE id = target_user_id
    ),
    'total_achievements', (
      SELECT COUNT(*) FROM public.user_achievements 
      WHERE user_id = target_user_id
    ),
    'mood_today', (
      SELECT primary_mood FROM public.mood_entries 
      WHERE user_id = target_user_id 
        AND DATE(created_at) = CURRENT_DATE 
      ORDER BY created_at DESC 
      LIMIT 1
    ),
    'last_updated', NOW(),
    'event_type', 'activity_summary'
  ) INTO activity_summary;
  
  -- Broadcast to user-specific channel
  PERFORM pg_notify(
    concat('user_activity_', target_user_id::text),
    activity_summary::text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- REALTIME ANALYTICS FUNCTIONS
-- =====================================================

-- Function to update and broadcast user analytics
CREATE OR REPLACE FUNCTION update_user_analytics_realtime()
RETURNS TRIGGER AS $$
BEGIN
  -- Update daily analytics
  INSERT INTO public.user_analytics (
    user_id, period_type, period_start, period_end,
    total_sessions, total_minutes, completion_rate
  )
  SELECT 
    NEW.user_id,
    'daily',
    CURRENT_DATE,
    CURRENT_DATE,
    COUNT(*),
    SUM(duration_actual_minutes),
    AVG(completion_percentage)
  FROM public.meditation_sessions
  WHERE user_id = NEW.user_id
    AND DATE(completed_at) = CURRENT_DATE
  GROUP BY user_id
  ON CONFLICT (user_id, period_type, period_start) DO UPDATE SET
    total_sessions = EXCLUDED.total_sessions,
    total_minutes = EXCLUDED.total_minutes,
    completion_rate = EXCLUDED.completion_rate;
  
  -- Broadcast updated analytics
  PERFORM broadcast_user_activity_summary(NEW.user_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update analytics in realtime
CREATE TRIGGER trigger_realtime_analytics
  AFTER INSERT ON public.meditation_sessions
  FOR EACH ROW EXECUTE FUNCTION update_user_analytics_realtime();

-- =====================================================
-- NOTIFICATION DELIVERY FUNCTIONS
-- =====================================================

-- Function to handle notification delivery
CREATE OR REPLACE FUNCTION deliver_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Broadcast to user's notification channel
  PERFORM pg_notify(
    concat('notifications_', NEW.user_id::text),
    json_build_object(
      'notification_id', NEW.id,
      'title', NEW.title,
      'body', NEW.body,
      'category', NEW.category,
      'priority', NEW.priority,
      'created_at', NEW.created_at,
      'event_type', 'new_notification'
    )::text
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for notification delivery
CREATE TRIGGER trigger_notification_delivery
  AFTER INSERT ON public.user_notifications
  FOR EACH ROW EXECUTE FUNCTION deliver_notification();

-- =====================================================
-- REALTIME PRESENCE SYSTEM
-- =====================================================

-- Table to track user presence
CREATE TABLE public.user_presence (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  status TEXT CHECK (status IN ('online', 'away', 'offline', 'meditating')) DEFAULT 'offline',
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_activity TEXT, -- e.g., 'meditation', 'journaling', 'browsing'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for presence
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;

-- RLS for presence (users can see community members' presence only)
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can update own presence" ON public.user_presence
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Community members can see each other's presence" ON public.user_presence
  FOR SELECT USING (
    user_id IN (
      SELECT DISTINCT cm2.user_id
      FROM public.community_memberships cm1
      JOIN public.community_memberships cm2 ON cm1.group_id = cm2.group_id
      WHERE cm1.user_id = auth.uid()
    )
  );

-- Function to update user presence
CREATE OR REPLACE FUNCTION update_user_presence(
  target_user_id UUID,
  new_status TEXT,
  activity TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.user_presence (user_id, status, current_activity, last_seen)
  VALUES (target_user_id, new_status, activity, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    status = EXCLUDED.status,
    current_activity = EXCLUDED.current_activity,
    last_seen = EXCLUDED.last_seen,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- REALTIME CHANNELS DOCUMENTATION
-- =====================================================

/*
REALTIME CHANNELS AVAILABLE:

1. User-specific channels:
   - user_activity_{user_id} - Personal activity summaries
   - notifications_{user_id} - Personal notifications
   
2. Achievement channels:
   - achievement_earned - Global achievement notifications
   
3. Community channels:
   - community_{group_id} - Group-specific activities
   
4. Session channels:
   - session_completed - Global session completions
   
5. Mood channels:
   - mood_entry_created - Mood tracking updates
   
6. Progress channels:
   - progress_updated - Course progress updates

USAGE EXAMPLES:

// Subscribe to user activity
const userChannel = supabase
  .channel(`user_activity_${userId}`)
  .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
    console.log('User activity:', payload);
  })
  .subscribe();

// Subscribe to achievements
const achievementChannel = supabase
  .channel('achievement_earned')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'user_achievements' },
    (payload) => {
      console.log('New achievement:', payload);
    }
  )
  .subscribe();

// Subscribe to community activity
const communityChannel = supabase
  .channel(`community_${groupId}`)
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'community_memberships' },
    (payload) => {
      console.log('Community update:', payload);
    }
  )
  .subscribe();
*/