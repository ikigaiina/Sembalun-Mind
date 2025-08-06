-- OAuth Provider Setup and Configuration
-- Sembalun Meditation App - Google OAuth Integration
-- Run after enhanced RLS setup

-- ============================================================================
-- PART 1: OAUTH PROVIDER CONFIGURATION FUNCTIONS
-- ============================================================================

-- Function to handle OAuth user creation/update
CREATE OR REPLACE FUNCTION public.handle_oauth_user()
RETURNS TRIGGER AS $$
DECLARE
  oauth_provider TEXT;
  oauth_data JSONB;
BEGIN
  -- Extract OAuth provider information
  oauth_provider := NEW.raw_app_meta_data->>'provider';
  oauth_data := NEW.raw_user_meta_data;

  -- Enhanced user profile creation for OAuth users
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
    COALESCE(
      oauth_data->>'full_name',
      oauth_data->>'name',
      oauth_data->>'display_name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      oauth_data->>'avatar_url',
      oauth_data->>'picture',
      oauth_data->>'profile_picture'
    ),
    -- OAuth-specific default preferences
    jsonb_build_object(
      'theme', 'auto',
      'language', CASE 
        WHEN oauth_data->>'locale' LIKE 'id%' THEN 'id'
        WHEN oauth_data->>'locale' LIKE 'en%' THEN 'en'
        ELSE 'id'
      END,
      'notifications', jsonb_build_object(
        'daily', true,
        'reminders', true,
        'achievements', true,
        'weeklyProgress', true,
        'socialUpdates', false,
        'push', true,
        'email', CASE 
          WHEN NEW.email_confirmed_at IS NOT NULL THEN true 
          ELSE false 
        END,
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
      ),
      'oauth', jsonb_build_object(
        'provider', oauth_provider,
        'verified', NEW.email_confirmed_at IS NOT NULL,
        'connected_at', NOW()
      )
    ),
    -- Default progress for OAuth users
    jsonb_build_object(
      'total_sessions', 0,
      'total_minutes', 0,
      'current_streak', 0,
      'longest_streak', 0,
      'achievements', '[]'::jsonb,
      'favorite_categories', '[]'::jsonb,
      'completed_programs', '[]'::jsonb,
      'oauth_provider', oauth_provider
    ),
    false -- OAuth users are not guest users
  )
  ON CONFLICT (id) DO UPDATE SET
    -- Update existing user with latest OAuth data
    display_name = COALESCE(
      oauth_data->>'full_name',
      oauth_data->>'name',
      oauth_data->>'display_name',
      users.display_name
    ),
    avatar_url = COALESCE(
      oauth_data->>'avatar_url',
      oauth_data->>'picture',
      oauth_data->>'profile_picture',
      users.avatar_url
    ),
    preferences = users.preferences || jsonb_build_object(
      'oauth', jsonb_build_object(
        'provider', oauth_provider,
        'verified', NEW.email_confirmed_at IS NOT NULL,
        'last_sync', NOW()
      )
    ),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 2: OAUTH SECURITY POLICIES
-- ============================================================================

-- Enhanced auth.users access for OAuth verification
CREATE OR REPLACE FUNCTION public.verify_oauth_user(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Get user record from auth.users
  SELECT * INTO user_record
  FROM auth.users
  WHERE id = user_id;

  -- Verify OAuth authentication
  IF user_record.id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if user has valid OAuth provider
  IF user_record.raw_app_meta_data->>'provider' IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Verify email confirmation for OAuth users
  IF user_record.email_confirmed_at IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 3: GOOGLE OAUTH CONFIGURATION
-- ============================================================================

-- Create OAuth provider configuration table
CREATE TABLE IF NOT EXISTS public.oauth_providers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_name TEXT UNIQUE NOT NULL,
  client_id TEXT NOT NULL,
  client_secret_hash TEXT, -- Hashed for security
  redirect_urls TEXT[] NOT NULL,
  scopes TEXT[] NOT NULL,
  enabled BOOLEAN DEFAULT true,
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on OAuth providers (admin only access)
ALTER TABLE public.oauth_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "oauth_providers_admin_only" ON public.oauth_providers
  FOR ALL USING (
    auth.jwt() ->> 'app_metadata' ? 'admin' AND
    auth.jwt() ->> 'aud' = 'authenticated'
  );

-- Insert Google OAuth configuration (update with your actual values)
INSERT INTO public.oauth_providers (
  provider_name,
  client_id,
  redirect_urls,
  scopes,
  configuration
) VALUES (
  'google',
  'your-google-client-id.apps.googleusercontent.com', -- Replace with actual client ID
  ARRAY[
    'https://your-project.supabase.co/auth/v1/callback',
    'http://localhost:3000/auth/callback',
    'https://your-domain.com/auth/callback'
  ],
  ARRAY[
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ],
  jsonb_build_object(
    'authorize_url', 'https://accounts.google.com/o/oauth2/v2/auth',
    'token_url', 'https://oauth2.googleapis.com/token',
    'user_info_url', 'https://www.googleapis.com/oauth2/v2/userinfo',
    'issuer', 'https://accounts.google.com',
    'jwks_uri', 'https://www.googleapis.com/oauth2/v3/certs'
  )
) ON CONFLICT (provider_name) DO UPDATE SET
  redirect_urls = EXCLUDED.redirect_urls,
  scopes = EXCLUDED.scopes,
  configuration = EXCLUDED.configuration,
  updated_at = NOW();

-- ============================================================================
-- PART 4: OAUTH SESSION MANAGEMENT
-- ============================================================================

-- Create OAuth sessions tracking table
CREATE TABLE IF NOT EXISTS public.oauth_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  access_token_hash TEXT, -- Hashed for security
  refresh_token_hash TEXT, -- Hashed for security
  token_expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT[],
  session_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on OAuth sessions
ALTER TABLE public.oauth_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own OAuth sessions
CREATE POLICY "oauth_sessions_own_access" ON public.oauth_sessions
  FOR ALL USING (
    auth.uid() = user_id AND
    auth.jwt() ->> 'aud' = 'authenticated'
  );

-- Create indexes for OAuth sessions
CREATE INDEX IF NOT EXISTS idx_oauth_sessions_user_id ON public.oauth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_sessions_provider ON public.oauth_sessions(provider);
CREATE INDEX IF NOT EXISTS idx_oauth_sessions_expires ON public.oauth_sessions(token_expires_at);

-- ============================================================================
-- PART 5: OAUTH TOKEN MANAGEMENT FUNCTIONS
-- ============================================================================

-- Function to clean up expired OAuth tokens
CREATE OR REPLACE FUNCTION public.cleanup_expired_oauth_tokens()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.oauth_sessions 
  WHERE token_expires_at < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to revoke OAuth session
CREATE OR REPLACE FUNCTION public.revoke_oauth_session(session_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verify user owns this session
  IF NOT EXISTS (
    SELECT 1 FROM public.oauth_sessions 
    WHERE id = session_id AND user_id = auth.uid()
  ) THEN
    RETURN FALSE;
  END IF;

  -- Delete the session
  DELETE FROM public.oauth_sessions 
  WHERE id = session_id AND user_id = auth.uid();

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 6: OAUTH SECURITY MONITORING
-- ============================================================================

-- Create OAuth audit log table
CREATE TABLE IF NOT EXISTS public.oauth_audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  provider TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'login', 'logout', 'token_refresh', 'token_revoke', 
    'profile_sync', 'permission_grant', 'permission_revoke'
  )),
  ip_address INET,
  user_agent TEXT,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on OAuth audit logs
ALTER TABLE public.oauth_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view OAuth audit logs
CREATE POLICY "oauth_audit_logs_admin_only" ON public.oauth_audit_logs
  FOR SELECT USING (
    auth.jwt() ->> 'app_metadata' ? 'admin' AND
    auth.jwt() ->> 'aud' = 'authenticated'
  );

-- Function to log OAuth events
CREATE OR REPLACE FUNCTION public.log_oauth_event(
  p_provider TEXT,
  p_event_type TEXT,
  p_event_data JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.oauth_audit_logs (
    user_id,
    provider,
    event_type,
    ip_address,
    user_agent,
    event_data
  ) VALUES (
    auth.uid(),
    p_provider,
    p_event_type,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent',
    p_event_data
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 7: OAUTH PROFILE SYNC FUNCTIONS
-- ============================================================================

-- Function to sync user profile from OAuth provider
CREATE OR REPLACE FUNCTION public.sync_oauth_profile(
  p_provider_data JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
  current_user_id UUID := auth.uid();
BEGIN
  -- Verify user is authenticated
  IF current_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Update user profile with OAuth data
  UPDATE public.users SET
    display_name = COALESCE(
      p_provider_data->>'name',
      p_provider_data->>'full_name',
      display_name
    ),
    avatar_url = COALESCE(
      p_provider_data->>'picture',
      p_provider_data->>'avatar_url',
      avatar_url
    ),
    preferences = preferences || jsonb_build_object(
      'oauth', jsonb_build_object(
        'last_sync', NOW(),
        'profile_data', p_provider_data
      )
    ),
    updated_at = NOW()
  WHERE id = current_user_id;

  -- Log the sync event
  PERFORM public.log_oauth_event(
    'google', -- Assuming Google for now
    'profile_sync',
    jsonb_build_object('synced_fields', array['name', 'picture'])
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 8: OAUTH TRIGGERS AND AUTOMATION
-- ============================================================================

-- Replace existing user creation trigger to use OAuth handler
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_oauth_user();

-- Trigger to update OAuth session on user login
CREATE OR REPLACE FUNCTION public.update_oauth_session_on_login()
RETURNS TRIGGER AS $$
BEGIN
  -- Update last_used_at for OAuth sessions
  UPDATE public.oauth_sessions 
  SET last_used_at = NOW()
  WHERE user_id = NEW.id;

  -- Log login event
  PERFORM public.log_oauth_event(
    COALESCE(NEW.raw_app_meta_data->>'provider', 'unknown'),
    'login',
    jsonb_build_object('user_id', NEW.id, 'email', NEW.email)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add updated_at trigger for OAuth tables
CREATE TRIGGER update_oauth_providers_updated_at 
  BEFORE UPDATE ON public.oauth_providers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oauth_sessions_updated_at 
  BEFORE UPDATE ON public.oauth_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 9: OAUTH RATE LIMITING
-- ============================================================================

-- OAuth-specific rate limiting
CREATE OR REPLACE FUNCTION public.oauth_rate_limit_check(
  operation_type TEXT,
  max_operations INTEGER DEFAULT 10,
  time_window INTERVAL DEFAULT '1 hour'
)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
BEGIN
  -- Count recent OAuth operations for this user
  SELECT COUNT(*) INTO current_count
  FROM public.oauth_audit_logs
  WHERE user_id = auth.uid()
    AND event_type = operation_type
    AND created_at > NOW() - time_window;

  -- Return false if rate limit exceeded
  RETURN current_count < max_operations;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 10: OAUTH CLEANUP AND MAINTENANCE
-- ============================================================================

-- Create a cleanup function for OAuth data
CREATE OR REPLACE FUNCTION public.oauth_maintenance()
RETURNS TEXT AS $$
DECLARE
  expired_sessions INTEGER;
  old_audit_logs INTEGER;
  result_text TEXT;
BEGIN
  -- Clean up expired OAuth sessions
  SELECT public.cleanup_expired_oauth_tokens() INTO expired_sessions;

  -- Clean up old audit logs (keep 90 days)
  DELETE FROM public.oauth_audit_logs 
  WHERE created_at < NOW() - INTERVAL '90 days';
  GET DIAGNOSTICS old_audit_logs = ROW_COUNT;

  -- Build result message
  result_text := format(
    'OAuth Maintenance Complete: Removed %s expired sessions, %s old audit logs',
    expired_sessions,
    old_audit_logs
  );

  RETURN result_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 11: OAUTH CONFIGURATION VALIDATION
-- ============================================================================

-- Function to validate OAuth configuration
CREATE OR REPLACE FUNCTION public.validate_oauth_config()
RETURNS TABLE(
  provider TEXT,
  status TEXT,
  issues TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    op.provider_name::TEXT,
    CASE 
      WHEN op.enabled = false THEN 'disabled'
      WHEN op.client_id IS NULL OR op.client_id = '' THEN 'invalid_client_id'
      WHEN array_length(op.redirect_urls, 1) = 0 THEN 'no_redirect_urls'
      WHEN array_length(op.scopes, 1) = 0 THEN 'no_scopes'
      ELSE 'active'
    END::TEXT,
    CASE 
      WHEN op.enabled = false THEN ARRAY['Provider is disabled']
      WHEN op.client_id IS NULL OR op.client_id = '' THEN ARRAY['Client ID is missing or empty']
      WHEN array_length(op.redirect_urls, 1) = 0 THEN ARRAY['No redirect URLs configured']
      WHEN array_length(op.scopes, 1) = 0 THEN ARRAY['No OAuth scopes configured']
      ELSE ARRAY[]::TEXT[]
    END
  FROM public.oauth_providers op;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SUCCESS MESSAGE AND INSTRUCTIONS
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔐 OAuth Setup Complete! ✅';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '1. Configure Google OAuth in Supabase Dashboard:';
  RAISE NOTICE '   - Go to Authentication > Providers';
  RAISE NOTICE '   - Enable Google provider';
  RAISE NOTICE '   - Add your Google Client ID and Secret';
  RAISE NOTICE '   - Set redirect URLs';
  RAISE NOTICE '';
  RAISE NOTICE '2. Update OAuth configuration:';
  RAISE NOTICE '   UPDATE public.oauth_providers SET';
  RAISE NOTICE '   client_id = ''your-actual-google-client-id''';
  RAISE NOTICE '   WHERE provider_name = ''google'';';
  RAISE NOTICE '';
  RAISE NOTICE '3. Test OAuth flow:';
  RAISE NOTICE '   SELECT * FROM public.validate_oauth_config();';
  RAISE NOTICE '';
  RAISE NOTICE 'Features enabled:';
  RAISE NOTICE '- Google OAuth integration';
  RAISE NOTICE '- OAuth session management';
  RAISE NOTICE '- Profile synchronization';
  RAISE NOTICE '- Security audit logging';
  RAISE NOTICE '- Rate limiting protection';
  RAISE NOTICE '- Automatic cleanup maintenance';
END $$;