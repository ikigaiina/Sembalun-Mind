-- Advanced Row Level Security and Data Protection
-- This migration enhances security with sophisticated RLS policies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Security audit table for tracking sensitive operations
CREATE TABLE IF NOT EXISTS public.security_audit (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  table_name TEXT,
  record_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- User activity tracking
CREATE TABLE IF NOT EXISTS public.user_activity (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enhanced security function to log sensitive operations
CREATE OR REPLACE FUNCTION public.log_security_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Log security-sensitive operations
  INSERT INTO public.security_audit (
    user_id,
    event_type,
    table_name,
    record_id,
    old_data,
    new_data,
    created_at
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id::TEXT, OLD.id::TEXT),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    NOW()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced RLS policies with time-based and rate limiting concepts

-- Users table - enhanced security
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

CREATE POLICY "Users can view own profile with audit" ON public.users
  FOR SELECT USING (
    auth.uid() = id 
    AND (
      -- Additional security: check if account is not locked
      NOT COALESCE((preferences->>'account_locked')::boolean, false)
    )
  );

CREATE POLICY "Users can update own profile with validation" ON public.users
  FOR UPDATE USING (
    auth.uid() = id 
    AND (
      -- Rate limiting: prevent too frequent updates
      updated_at < NOW() - INTERVAL '1 minute'
      OR auth.jwt() ->> 'role' = 'service_role'
    )
  )
  WITH CHECK (
    auth.uid() = id
    AND email IS NOT NULL
    AND display_name IS NOT NULL
  );

CREATE POLICY "Users can insert own profile on signup" ON public.users
  FOR INSERT WITH CHECK (
    auth.uid() = id
    AND email IS NOT NULL
    AND NOT is_guest = true -- Prevent direct guest account creation via SQL
  );

-- Meditation sessions - enhanced with data validation
DROP POLICY IF EXISTS "Users can view own sessions" ON public.meditation_sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON public.meditation_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON public.meditation_sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON public.meditation_sessions;

CREATE POLICY "Users can view own meditation sessions" ON public.meditation_sessions
  FOR SELECT USING (
    auth.uid() = user_id
    AND (
      -- Allow viewing recent sessions without restriction
      completed_at > NOW() - INTERVAL '30 days'
      OR auth.jwt() ->> 'role' = 'service_role'
    )
  );

CREATE POLICY "Users can insert valid meditation sessions" ON public.meditation_sessions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND duration_minutes > 0
    AND duration_minutes <= 180 -- Max 3 hours
    AND completed_at <= NOW()
    AND completed_at > NOW() - INTERVAL '24 hours' -- Can't log sessions older than 24h
    AND type IN ('breathing', 'guided', 'silent', 'walking')
  );

CREATE POLICY "Users can update recent meditation sessions" ON public.meditation_sessions
  FOR UPDATE USING (
    auth.uid() = user_id
    AND completed_at > NOW() - INTERVAL '7 days' -- Can only edit sessions from last 7 days
  )
  WITH CHECK (
    auth.uid() = user_id
    AND duration_minutes > 0
    AND duration_minutes <= 180
  );

CREATE POLICY "Users can delete recent meditation sessions" ON public.meditation_sessions
  FOR DELETE USING (
    auth.uid() = user_id
    AND completed_at > NOW() - INTERVAL '24 hours' -- Can only delete sessions from last 24h
  );

-- Journal entries - enhanced privacy protection
DROP POLICY IF EXISTS "Users can view own journal" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can insert own journal" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can update own journal" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can delete own journal" ON public.journal_entries;

CREATE POLICY "Users can view own journal entries" ON public.journal_entries
  FOR SELECT USING (
    auth.uid() = user_id
    AND (
      -- Enhanced privacy: check if journal sharing is enabled
      (SELECT preferences->>'privacy'->>'shareProgress' FROM public.users WHERE id = auth.uid()) != 'true'
      OR auth.uid() = user_id
    )
  );

CREATE POLICY "Users can insert journal entries with limits" ON public.journal_entries
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND LENGTH(content) <= 10000 -- Max 10k characters
    AND LENGTH(title) <= 200
    AND (
      -- Rate limiting: max 10 entries per day
      (
        SELECT COUNT(*) 
        FROM public.journal_entries 
        WHERE user_id = auth.uid() 
        AND created_at > CURRENT_DATE
      ) < 10
      OR auth.jwt() ->> 'role' = 'service_role'
    )
  );

CREATE POLICY "Users can update own journal entries" ON public.journal_entries
  FOR UPDATE USING (
    auth.uid() = user_id
    AND created_at > NOW() - INTERVAL '30 days' -- Can only edit entries from last 30 days
  )
  WITH CHECK (
    auth.uid() = user_id
    AND LENGTH(content) <= 10000
    AND LENGTH(COALESCE(title, '')) <= 200
  );

CREATE POLICY "Users can delete own journal entries" ON public.journal_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Enhanced achievements security
DROP POLICY IF EXISTS "Users can view own achievements" ON public.achievements;
DROP POLICY IF EXISTS "Users can insert own achievements" ON public.achievements;

CREATE POLICY "Users can view own achievements" ON public.achievements
  FOR SELECT USING (auth.uid() = user_id);

-- Achievements should only be inserted by system/service role
CREATE POLICY "Only system can insert achievements" ON public.achievements
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' = 'service_role'
    OR (
      auth.uid() = user_id
      AND achievement_type IN ('manual_entry') -- Allow only manual achievements by users
    )
  );

-- User course progress with anti-cheating measures
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_course_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON public.user_course_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.user_course_progress;

CREATE POLICY "Users can view own course progress" ON public.user_course_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert course progress" ON public.user_course_progress
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND progress_percentage >= 0
    AND progress_percentage <= 100
    AND last_accessed_at <= NOW()
  );

CREATE POLICY "Users can update course progress with validation" ON public.user_course_progress
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND progress_percentage >= 0
    AND progress_percentage <= 100
    AND (
      -- Progress can only increase or stay the same (anti-cheating)
      progress_percentage >= (
        SELECT progress_percentage 
        FROM public.user_course_progress 
        WHERE id = NEW.id
      )
      OR auth.jwt() ->> 'role' = 'service_role'
    )
    AND last_accessed_at <= NOW()
  );

-- User settings with sensitive data protection
DROP POLICY IF EXISTS "Users can view own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;

CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR SELECT USING (
    auth.uid() = user_id
    AND (
      -- Hide sensitive settings from client
      setting_key NOT IN ('internal_config', 'admin_notes', 'system_flags')
      OR auth.jwt() ->> 'role' = 'service_role'
    )
  );

CREATE POLICY "Users can insert own settings" ON public.user_settings
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND setting_key NOT IN ('internal_config', 'admin_notes', 'system_flags')
    AND LENGTH(setting_key) <= 100
  );

CREATE POLICY "Users can update own settings" ON public.user_settings
  FOR UPDATE USING (
    auth.uid() = user_id
    AND setting_key NOT IN ('internal_config', 'admin_notes', 'system_flags')
  )
  WITH CHECK (
    auth.uid() = user_id
    AND LENGTH(setting_key) <= 100
  );

-- Security audit table policies
ALTER TABLE public.security_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only service role can access audit logs" ON public.security_audit
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- User activity policies  
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity" ON public.user_activity
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert user activity" ON public.user_activity
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' = 'service_role'
    OR auth.uid() = user_id
  );

-- Security triggers for sensitive tables
CREATE TRIGGER users_security_audit
  AFTER UPDATE OR DELETE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.log_security_event();

CREATE TRIGGER meditation_sessions_security_audit
  AFTER DELETE ON public.meditation_sessions
  FOR EACH ROW EXECUTE FUNCTION public.log_security_event();

CREATE TRIGGER achievements_security_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.achievements
  FOR EACH ROW EXECUTE FUNCTION public.log_security_event();

-- Function to check user rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  user_uuid UUID,
  action_type TEXT,
  max_actions INTEGER,
  time_window INTERVAL
)
RETURNS BOOLEAN AS $$
DECLARE
  action_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO action_count
  FROM public.user_activity
  WHERE user_id = user_uuid
  AND activity_type = action_type
  AND created_at > NOW() - time_window;
  
  RETURN action_count < max_actions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log user activity
CREATE OR REPLACE FUNCTION public.log_user_activity(
  user_uuid UUID,
  activity TEXT,
  activity_details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_activity (user_id, activity_type, details)
  VALUES (user_uuid, activity, activity_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced data validation function
CREATE OR REPLACE FUNCTION public.validate_user_data(
  table_name TEXT,
  data JSONB
)
RETURNS BOOLEAN AS $$
BEGIN
  CASE table_name
    WHEN 'meditation_sessions' THEN
      RETURN (
        (data->>'duration_minutes')::INTEGER BETWEEN 1 AND 180 AND
        (data->>'type') IN ('breathing', 'guided', 'silent', 'walking') AND
        (data->>'completed_at')::TIMESTAMP <= NOW()
      );
    WHEN 'journal_entries' THEN
      RETURN (
        LENGTH(data->>'content') <= 10000 AND
        LENGTH(COALESCE(data->>'title', '')) <= 200
      );
    WHEN 'users' THEN
      RETURN (
        data->>'email' IS NOT NULL AND
        data->>'email' ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
      );
    ELSE
      RETURN TRUE;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for security and performance
CREATE INDEX IF NOT EXISTS idx_security_audit_user_id ON public.security_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_created_at ON public.security_audit(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type_time ON public.user_activity(activity_type, created_at DESC);

-- Comments for documentation
COMMENT ON TABLE public.security_audit IS 'Audit trail for security-sensitive operations';
COMMENT ON TABLE public.user_activity IS 'User activity tracking for rate limiting and analytics';
COMMENT ON FUNCTION public.check_rate_limit IS 'Checks if user has exceeded rate limits for specific actions';
COMMENT ON FUNCTION public.validate_user_data IS 'Validates user input data for security and integrity';