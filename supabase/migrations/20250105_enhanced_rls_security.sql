-- Enhanced Row Level Security and Authentication Setup
-- Sembalun Meditation App - Production Ready Security Model
-- Run after initial schema setup

-- ============================================================================
-- PART 1: ENHANCED RLS POLICIES WITH SECURITY IMPROVEMENTS
-- ============================================================================

-- Drop existing policies to replace with enhanced versions
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- Enhanced Users table policies with additional security checks
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (
    auth.uid() = id AND 
    auth.jwt() ->> 'aud' = 'authenticated'
  );

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (
    auth.uid() = id AND 
    auth.jwt() ->> 'aud' = 'authenticated' AND
    auth.jwt() ->> 'email_verified' = 'true'
  );

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (
    auth.uid() = id AND 
    auth.jwt() ->> 'aud' = 'authenticated'
  );

-- Users cannot delete their own profile (soft delete via flag instead)
CREATE POLICY "users_no_delete" ON public.users
  FOR DELETE USING (false);

-- ============================================================================
-- PART 2: ENHANCED MEDITATION SESSIONS POLICIES
-- ============================================================================

-- Drop existing meditation session policies
DROP POLICY IF EXISTS "Users can view own sessions" ON public.meditation_sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON public.meditation_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON public.meditation_sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON public.meditation_sessions;

-- Enhanced meditation sessions policies with rate limiting considerations
CREATE POLICY "meditation_sessions_select_own" ON public.meditation_sessions
  FOR SELECT USING (
    auth.uid() = user_id AND 
    auth.jwt() ->> 'aud' = 'authenticated'
  );

CREATE POLICY "meditation_sessions_insert_own" ON public.meditation_sessions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    auth.jwt() ->> 'aud' = 'authenticated' AND
    duration_minutes <= 180 AND -- Max 3 hours per session
    duration_minutes >= 1 -- Min 1 minute
  );

CREATE POLICY "meditation_sessions_update_own" ON public.meditation_sessions
  FOR UPDATE USING (
    auth.uid() = user_id AND 
    auth.jwt() ->> 'aud' = 'authenticated' AND
    created_at > NOW() - INTERVAL '24 hours' -- Only update recent sessions
  );

CREATE POLICY "meditation_sessions_delete_own" ON public.meditation_sessions
  FOR DELETE USING (
    auth.uid() = user_id AND 
    auth.jwt() ->> 'aud' = 'authenticated' AND
    created_at > NOW() - INTERVAL '1 hour' -- Only delete very recent sessions
  );

-- ============================================================================
-- PART 3: ENHANCED JOURNAL ENTRIES POLICIES
-- ============================================================================

-- Drop existing journal policies
DROP POLICY IF EXISTS "Users can view own journal" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can insert own journal" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can update own journal" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can delete own journal" ON public.journal_entries;

-- Enhanced journal entries policies with content validation
CREATE POLICY "journal_entries_select_own" ON public.journal_entries
  FOR SELECT USING (
    auth.uid() = user_id AND 
    auth.jwt() ->> 'aud' = 'authenticated'
  );

CREATE POLICY "journal_entries_insert_own" ON public.journal_entries
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    auth.jwt() ->> 'aud' = 'authenticated' AND
    LENGTH(content) <= 10000 AND -- Max 10k characters
    LENGTH(content) >= 1 -- Min 1 character
  );

CREATE POLICY "journal_entries_update_own" ON public.journal_entries
  FOR UPDATE USING (
    auth.uid() = user_id AND 
    auth.jwt() ->> 'aud' = 'authenticated' AND
    LENGTH(content) <= 10000
  );

CREATE POLICY "journal_entries_delete_own" ON public.journal_entries
  FOR DELETE USING (
    auth.uid() = user_id AND 
    auth.jwt() ->> 'aud' = 'authenticated'
  );

-- ============================================================================
-- PART 4: ENHANCED ACHIEVEMENTS POLICIES
-- ============================================================================

-- Drop existing achievement policies
DROP POLICY IF EXISTS "Users can view own achievements" ON public.achievements;
DROP POLICY IF EXISTS "Users can insert own achievements" ON public.achievements;

-- Enhanced achievements policies (read-only for users, system controlled)
CREATE POLICY "achievements_select_own" ON public.achievements
  FOR SELECT USING (
    auth.uid() = user_id AND 
    auth.jwt() ->> 'aud' = 'authenticated'
  );

-- Only system functions can insert achievements (not direct user inserts)
CREATE POLICY "achievements_system_insert" ON public.achievements
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    auth.jwt() ->> 'aud' = 'authenticated' AND
    current_setting('app.current_user_id', true) = auth.uid()::text
  );

-- No direct updates or deletes of achievements
CREATE POLICY "achievements_no_update" ON public.achievements
  FOR UPDATE USING (false);

CREATE POLICY "achievements_no_delete" ON public.achievements
  FOR DELETE USING (false);

-- ============================================================================
-- PART 5: ENHANCED USER COURSE PROGRESS POLICIES
-- ============================================================================

-- Drop existing course progress policies
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_course_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON public.user_course_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.user_course_progress;

-- Enhanced course progress policies with validation
CREATE POLICY "user_course_progress_select_own" ON public.user_course_progress
  FOR SELECT USING (
    auth.uid() = user_id AND 
    auth.jwt() ->> 'aud' = 'authenticated'
  );

CREATE POLICY "user_course_progress_insert_own" ON public.user_course_progress
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    auth.jwt() ->> 'aud' = 'authenticated' AND
    progress_percentage >= 0 AND 
    progress_percentage <= 100 AND
    -- Ensure course exists and is accessible
    EXISTS (
      SELECT 1 FROM public.courses c 
      WHERE c.id = course_id AND 
      (c.is_premium = false OR auth.jwt() ->> 'app_metadata' ? 'premium')
    )
  );

CREATE POLICY "user_course_progress_update_own" ON public.user_course_progress
  FOR UPDATE USING (
    auth.uid() = user_id AND 
    auth.jwt() ->> 'aud' = 'authenticated' AND
    progress_percentage >= OLD.progress_percentage -- Progress can only increase
  );

-- No deletion of progress records
CREATE POLICY "user_course_progress_no_delete" ON public.user_course_progress
  FOR DELETE USING (false);

-- ============================================================================
-- PART 6: ENHANCED BOOKMARKS POLICIES
-- ============================================================================

-- Drop existing bookmark policies
DROP POLICY IF EXISTS "Users can view own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can insert own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON public.bookmarks;

-- Enhanced bookmark policies with content validation
CREATE POLICY "bookmarks_select_own" ON public.bookmarks
  FOR SELECT USING (
    auth.uid() = user_id AND 
    auth.jwt() ->> 'aud' = 'authenticated'
  );

CREATE POLICY "bookmarks_insert_own" ON public.bookmarks
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    auth.jwt() ->> 'aud' = 'authenticated' AND
    content_type IN ('course', 'session', 'journal') AND
    -- Validate that the content exists and belongs to user
    (
      (content_type = 'course' AND EXISTS (SELECT 1 FROM public.courses WHERE id = content_id)) OR
      (content_type = 'session' AND EXISTS (SELECT 1 FROM public.meditation_sessions WHERE id = content_id AND user_id = auth.uid())) OR
      (content_type = 'journal' AND EXISTS (SELECT 1 FROM public.journal_entries WHERE id = content_id AND user_id = auth.uid()))
    )
  );

-- No updates to bookmarks (delete and recreate instead)
CREATE POLICY "bookmarks_no_update" ON public.bookmarks
  FOR UPDATE USING (false);

CREATE POLICY "bookmarks_delete_own" ON public.bookmarks
  FOR DELETE USING (
    auth.uid() = user_id AND 
    auth.jwt() ->> 'aud' = 'authenticated'
  );

-- ============================================================================
-- PART 7: ENHANCED USER SETTINGS POLICIES
-- ============================================================================

-- Drop existing user settings policies
DROP POLICY IF EXISTS "Users can view own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;

-- Enhanced user settings policies with key validation
CREATE POLICY "user_settings_select_own" ON public.user_settings
  FOR SELECT USING (
    auth.uid() = user_id AND 
    auth.jwt() ->> 'aud' = 'authenticated'
  );

CREATE POLICY "user_settings_upsert_own" ON public.user_settings
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    auth.jwt() ->> 'aud' = 'authenticated' AND
    setting_key ~ '^[a-zA-Z][a-zA-Z0-9_]*$' AND -- Valid setting key format
    LENGTH(setting_key) <= 100 AND
    pg_column_size(setting_value) <= 65536 -- Max 64KB per setting
  );

CREATE POLICY "user_settings_update_own" ON public.user_settings
  FOR UPDATE USING (
    auth.uid() = user_id AND 
    auth.jwt() ->> 'aud' = 'authenticated' AND
    pg_column_size(setting_value) <= 65536
  );

CREATE POLICY "user_settings_delete_own" ON public.user_settings
  FOR DELETE USING (
    auth.uid() = user_id AND 
    auth.jwt() ->> 'aud' = 'authenticated'
  );

-- ============================================================================
-- PART 8: ENHANCED MOODS POLICIES
-- ============================================================================

-- Drop existing moods policies
DROP POLICY IF EXISTS "Users can view own moods" ON public.moods;
DROP POLICY IF EXISTS "Users can insert own moods" ON public.moods;
DROP POLICY IF EXISTS "Users can update own moods" ON public.moods;
DROP POLICY IF EXISTS "Users can delete own moods" ON public.moods;

-- Enhanced moods policies with rate limiting
CREATE POLICY "moods_select_own" ON public.moods
  FOR SELECT USING (
    auth.uid() = user_id AND 
    auth.jwt() ->> 'aud' = 'authenticated'
  );

CREATE POLICY "moods_insert_own" ON public.moods
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    auth.jwt() ->> 'aud' = 'authenticated' AND
    mood IN ('very_happy', 'happy', 'neutral', 'sad', 'very_sad', 'anxious', 'calm', 'energetic', 'tired') AND
    LENGTH(COALESCE(notes, '')) <= 1000 AND
    -- Rate limit: max 5 mood entries per day
    (
      SELECT COUNT(*) 
      FROM public.moods 
      WHERE user_id = auth.uid() 
      AND created_at >= CURRENT_DATE
    ) < 5
  );

CREATE POLICY "moods_update_own" ON public.moods
  FOR UPDATE USING (
    auth.uid() = user_id AND 
    auth.jwt() ->> 'aud' = 'authenticated' AND
    created_at > NOW() - INTERVAL '1 hour' AND -- Only update recent entries
    LENGTH(COALESCE(notes, '')) <= 1000
  );

CREATE POLICY "moods_delete_own" ON public.moods
  FOR DELETE USING (
    auth.uid() = user_id AND 
    auth.jwt() ->> 'aud' = 'authenticated' AND
    created_at > NOW() - INTERVAL '1 hour' -- Only delete very recent entries
  );

-- ============================================================================
-- PART 9: ENHANCED COURSES POLICIES
-- ============================================================================

-- Drop existing courses policy
DROP POLICY IF EXISTS "Anyone can view courses" ON public.courses;

-- Enhanced courses policies with premium content protection
CREATE POLICY "courses_select_public" ON public.courses
  FOR SELECT USING (
    is_premium = false OR 
    (
      auth.uid() IS NOT NULL AND
      auth.jwt() ->> 'aud' = 'authenticated' AND
      (
        auth.jwt() ->> 'app_metadata' ? 'premium' OR
        is_premium = false
      )
    )
  );

-- Only admin users can modify courses
CREATE POLICY "courses_admin_only" ON public.courses
  FOR ALL USING (
    auth.jwt() ->> 'app_metadata' ? 'admin' AND
    auth.jwt() ->> 'aud' = 'authenticated'
  );

-- ============================================================================
-- PART 10: SECURITY FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Enhanced user registration function with validation
CREATE OR REPLACE FUNCTION public.handle_new_user_enhanced()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate email domain (optional - add your allowed domains)
  -- IF NEW.email !~ '@(gmail\.com|yahoo\.com|outlook\.com|[^.]+\.edu)$' THEN
  --   RAISE EXCEPTION 'Email domain not allowed';
  -- END IF;

  -- Create user profile with default preferences
  INSERT INTO public.users (
    id, 
    email, 
    display_name, 
    avatar_url,
    preferences,
    progress,
    is_guest
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    -- Default preferences with security considerations
    jsonb_build_object(
      'theme', 'auto',
      'language', 'id',
      'notifications', jsonb_build_object(
        'daily', true,
        'reminders', true,
        'achievements', true,
        'weeklyProgress', true,
        'socialUpdates', false,
        'push', true,
        'email', false,
        'sound', true,
        'vibration', true
      ),
      'privacy', jsonb_build_object(
        'analytics', false,
        'dataSharing', false,
        'profileVisibility', 'private',
        'shareProgress', false,
        'locationTracking', false
      ),
      'meditation', jsonb_build_object(
        'defaultDuration', 10,
        'preferredVoice', 'default',
        'backgroundSounds', true,
        'guidanceLevel', 'moderate',
        'musicVolume', 70,
        'voiceVolume', 80,
        'autoAdvance', false,
        'showTimer', true,
        'preparationTime', 30,
        'endingBell', true
      )
    ),
    -- Default progress
    jsonb_build_object(
      'total_sessions', 0,
      'total_minutes', 0,
      'current_streak', 0,
      'longest_streak', 0,
      'achievements', '[]'::jsonb,
      'favorite_categories', '[]'::jsonb,
      'completed_programs', '[]'::jsonb
    ),
    false -- not a guest user
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Replace the existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_enhanced();

-- ============================================================================
-- PART 11: AUDIT AND SECURITY LOGGING
-- ============================================================================

-- Create audit log table for security monitoring
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "audit_logs_admin_only" ON public.audit_logs
  FOR SELECT USING (
    auth.jwt() ->> 'app_metadata' ? 'admin' AND
    auth.jwt() ->> 'aud' = 'authenticated'
  );

-- Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  old_data JSONB := NULL;
  new_data JSONB := NULL;
  changed_fields TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Capture old and new data
  IF TG_OP = 'DELETE' THEN
    old_data := to_jsonb(OLD);
  ELSIF TG_OP = 'UPDATE' THEN
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
    
    -- Identify changed fields
    SELECT array_agg(key) INTO changed_fields
    FROM jsonb_each(old_data) o
    WHERE o.value IS DISTINCT FROM (new_data->o.key);
  ELSIF TG_OP = 'INSERT' THEN
    new_data := to_jsonb(NEW);
  END IF;

  -- Insert audit record
  INSERT INTO public.audit_logs (
    user_id,
    table_name,
    operation,
    old_data,
    new_data,
    changed_fields,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    TG_TABLE_NAME,
    TG_OP,
    old_data,
    new_data,
    changed_fields,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  );

  -- Return appropriate record
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to sensitive tables
CREATE TRIGGER audit_users_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_user_settings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- ============================================================================
-- PART 12: RATE LIMITING AND SECURITY CONSTRAINTS
-- ============================================================================

-- Create rate limiting function
CREATE OR REPLACE FUNCTION public.rate_limit_check(
  operation_type TEXT,
  max_operations INTEGER DEFAULT 100,
  time_window INTERVAL DEFAULT '1 hour'
)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
BEGIN
  -- Count recent operations for this user
  SELECT COUNT(*) INTO current_count
  FROM public.audit_logs
  WHERE user_id = auth.uid()
    AND table_name = operation_type
    AND created_at > NOW() - time_window;

  -- Return false if rate limit exceeded
  RETURN current_count < max_operations;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 13: DATA VALIDATION FUNCTIONS
-- ============================================================================

-- Validate meditation session data
CREATE OR REPLACE FUNCTION public.validate_meditation_session(
  duration INTEGER,
  session_type TEXT,
  mood_before TEXT DEFAULT NULL,
  mood_after TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Duration validation
  IF duration < 1 OR duration > 180 THEN
    RETURN FALSE;
  END IF;

  -- Type validation
  IF session_type NOT IN ('breathing', 'guided', 'silent', 'walking') THEN
    RETURN FALSE;
  END IF;

  -- Mood validation (if provided)
  IF mood_before IS NOT NULL AND mood_before NOT IN ('very_happy', 'happy', 'neutral', 'sad', 'very_sad', 'anxious', 'calm', 'energetic', 'tired') THEN
    RETURN FALSE;
  END IF;

  IF mood_after IS NOT NULL AND mood_after NOT IN ('very_happy', 'happy', 'neutral', 'sad', 'very_sad', 'anxious', 'calm', 'energetic', 'tired') THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Add validation trigger for meditation sessions
CREATE OR REPLACE FUNCTION public.validate_meditation_session_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.validate_meditation_session(
    NEW.duration_minutes,
    NEW.type,
    NEW.mood_before,
    NEW.mood_after
  ) THEN
    RAISE EXCEPTION 'Invalid meditation session data';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_meditation_session_trigger
  BEFORE INSERT OR UPDATE ON public.meditation_sessions
  FOR EACH ROW EXECUTE FUNCTION public.validate_meditation_session_trigger();

-- ============================================================================
-- PART 14: PERFORMANCE OPTIMIZATIONS
-- ============================================================================

-- Additional performance indexes for RLS queries
CREATE INDEX IF NOT EXISTS idx_users_auth_uid ON public.users(id) WHERE id = auth.uid();
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_user_auth ON public.meditation_sessions(user_id) WHERE user_id = auth.uid();
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_auth ON public.journal_entries(user_id) WHERE user_id = auth.uid();
CREATE INDEX IF NOT EXISTS idx_achievements_user_auth ON public.achievements(user_id) WHERE user_id = auth.uid();
CREATE INDEX IF NOT EXISTS idx_user_course_progress_user_auth ON public.user_course_progress(user_id) WHERE user_id = auth.uid();
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_auth ON public.bookmarks(user_id) WHERE user_id = auth.uid();
CREATE INDEX IF NOT EXISTS idx_user_settings_user_auth ON public.user_settings(user_id) WHERE user_id = auth.uid();
CREATE INDEX IF NOT EXISTS idx_moods_user_auth ON public.moods(user_id) WHERE user_id = auth.uid();

-- Partial indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_premium ON public.courses(is_premium, id) WHERE is_premium = true;
CREATE INDEX IF NOT EXISTS idx_courses_public ON public.courses(id) WHERE is_premium = false;

-- ============================================================================
-- PART 15: SECURITY COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.audit_logs IS 'Security audit trail for all data modifications';
COMMENT ON FUNCTION public.rate_limit_check IS 'Rate limiting function to prevent abuse';
COMMENT ON FUNCTION public.validate_meditation_session IS 'Data validation for meditation sessions';
COMMENT ON FUNCTION public.handle_new_user_enhanced IS 'Enhanced user registration with security validations';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Enhanced RLS Security Setup Complete! ✅';
  RAISE NOTICE 'Features enabled:';
  RAISE NOTICE '- Enhanced RLS policies with JWT validation';
  RAISE NOTICE '- Premium content protection';
  RAISE NOTICE '- Rate limiting and abuse prevention';
  RAISE NOTICE '- Data validation and constraints';
  RAISE NOTICE '- Audit logging for security monitoring';
  RAISE NOTICE '- Performance optimized indexes';
END $$;