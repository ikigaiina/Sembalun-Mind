-- Enhanced OAuth Setup for Google Authentication
-- Run this after setting up OAuth provider in Supabase Dashboard

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create auth configuration table for storing OAuth settings
CREATE TABLE IF NOT EXISTS auth.provider_configs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider TEXT NOT NULL,
  config JSONB NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(provider)
);

-- Insert Google OAuth configuration template
INSERT INTO auth.provider_configs (provider, config, is_enabled) VALUES (
  'google',
  '{
    "client_id": "YOUR_GOOGLE_CLIENT_ID",
    "client_secret": "YOUR_GOOGLE_CLIENT_SECRET",
    "redirect_uri": "https://your-project-ref.supabase.co/auth/v1/callback",
    "scopes": ["openid", "email", "profile"],
    "additional_params": {
      "access_type": "offline",
      "prompt": "consent"
    }
  }'::jsonb,
  true
) ON CONFLICT (provider) DO UPDATE SET
  config = EXCLUDED.config,
  updated_at = NOW();

-- Function to handle OAuth user creation with enhanced metadata
CREATE OR REPLACE FUNCTION public.handle_oauth_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle OAuth users (Google, etc.)
  IF NEW.app_metadata ->> 'provider' IN ('google', 'facebook', 'apple') THEN
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
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'display_name',
        SPLIT_PART(NEW.email, '@', 1)
      ),
      NEW.raw_user_meta_data->>'avatar_url',
      -- Default preferences with Google-specific settings
      jsonb_build_object(
        'theme', 'auto',
        'language', CASE 
          WHEN NEW.raw_user_meta_data->>'locale' LIKE 'id%' THEN 'id' 
          ELSE 'en' 
        END,
        'notifications', jsonb_build_object(
          'daily', true,
          'reminders', true,
          'achievements', true,
          'weeklyProgress', true,
          'socialUpdates', false,
          'push', true,
          'email', true, -- Enable email for OAuth users
          'sound', true,
          'vibration', true
        ),
        'privacy', jsonb_build_object(
          'analytics', false, -- More privacy-conscious default for OAuth
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
        'accessibility', jsonb_build_object(
          'reducedMotion', false,
          'highContrast', false,
          'fontSize', 'medium',
          'screenReader', false,
          'keyboardNavigation', false
        ),
        'display', jsonb_build_object(
          'dateFormat', 'DD/MM/YYYY',
          'timeFormat', '24h',
          'weekStartsOn', 'monday',
          'showStreaks', true,
          'showStatistics', true
        )
      ),
      -- Default progress for new OAuth users
      jsonb_build_object(
        'total_sessions', 0,
        'total_minutes', 0,
        'current_streak', 0,
        'longest_streak', 0,
        'achievements', '[]'::jsonb,
        'favorite_categories', '[]'::jsonb,
        'completed_programs', '[]'::jsonb
      ),
      false -- Not a guest user
    ) ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      display_name = COALESCE(EXCLUDED.display_name, users.display_name),
      avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
      updated_at = NOW();

    -- Log OAuth signup for analytics
    INSERT INTO public.user_settings (user_id, setting_key, setting_value) VALUES (
      NEW.id,
      'signup_method',
      jsonb_build_object(
        'provider', NEW.app_metadata ->> 'provider',
        'timestamp', NOW(),
        'metadata', NEW.raw_user_meta_data
      )
    ) ON CONFLICT (user_id, setting_key) DO NOTHING;

  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the trigger to use the new OAuth handler
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_oauth_user();

-- Function to sync user profile data from OAuth providers
CREATE OR REPLACE FUNCTION public.sync_oauth_profile(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
  auth_user auth.users%ROWTYPE;
BEGIN
  -- Get current auth user data
  SELECT * INTO auth_user FROM auth.users WHERE id = user_uuid;
  
  IF FOUND AND auth_user.app_metadata ->> 'provider' IN ('google', 'facebook', 'apple') THEN
    -- Update user profile with latest OAuth data
    UPDATE public.users SET
      display_name = COALESCE(
        auth_user.raw_user_meta_data->>'full_name',
        auth_user.raw_user_meta_data->>'name',
        auth_user.raw_user_meta_data->>'display_name',
        display_name
      ),
      avatar_url = COALESCE(
        auth_user.raw_user_meta_data->>'avatar_url',
        avatar_url
      ),
      updated_at = NOW()
    WHERE id = user_uuid;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle OAuth provider logout/revoke
CREATE OR REPLACE FUNCTION public.handle_oauth_revoke(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  -- Update user settings to reflect OAuth revocation
  INSERT INTO public.user_settings (user_id, setting_key, setting_value) VALUES (
    user_uuid,
    'oauth_revoked',
    jsonb_build_object(
      'revoked_at', NOW(),
      'reason', 'user_initiated'
    )
  ) ON CONFLICT (user_id, setting_key) DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    updated_at = NOW();
    
  -- Optionally disable certain features that depend on OAuth
  UPDATE public.users SET
    preferences = preferences || jsonb_build_object(
      'notifications', preferences->'notifications' || jsonb_build_object('email', false)
    )
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced user validation for OAuth users
CREATE OR REPLACE FUNCTION public.validate_oauth_user(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  auth_user auth.users%ROWTYPE;
  user_profile public.users%ROWTYPE;
BEGIN
  -- Get auth user
  SELECT * INTO auth_user FROM auth.users WHERE id = user_uuid;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Get user profile
  SELECT * INTO user_profile FROM public.users WHERE id = user_uuid;
  
  IF NOT FOUND THEN
    -- Create missing profile for OAuth user
    PERFORM public.handle_oauth_user();
    RETURN TRUE;
  END IF;
  
  -- Validate OAuth-specific requirements
  IF auth_user.app_metadata ->> 'provider' IN ('google', 'facebook', 'apple') THEN
    -- Check if email is verified (OAuth emails are pre-verified)
    IF NOT auth_user.email_confirmed_at IS NOT NULL THEN
      UPDATE auth.users SET 
        email_confirmed_at = NOW(),
        confirmed_at = NOW()
      WHERE id = user_uuid;
    END IF;
    
    RETURN TRUE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS policies for provider_configs (admin access only)
ALTER TABLE auth.provider_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only service role can access provider configs" ON auth.provider_configs
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_auth_users_provider ON auth.users USING GIN (app_metadata);
CREATE INDEX IF NOT EXISTS idx_auth_users_email_confirmed ON auth.users(email_confirmed_at) WHERE email_confirmed_at IS NOT NULL;

-- Comments for documentation
COMMENT ON TABLE auth.provider_configs IS 'OAuth provider configurations for authentication';
COMMENT ON FUNCTION public.handle_oauth_user() IS 'Handles user creation for OAuth sign-ups with provider-specific settings';
COMMENT ON FUNCTION public.sync_oauth_profile(UUID) IS 'Syncs user profile data from OAuth provider';
COMMENT ON FUNCTION public.validate_oauth_user(UUID) IS 'Validates and ensures OAuth user has complete profile';

-- Instructions for setup
-- 1. Go to Supabase Dashboard > Authentication > Settings
-- 2. Enable Google provider
-- 3. Set Client ID and Client Secret from Google OAuth2 credentials
-- 4. Add authorized domains: localhost:5173, your-domain.com
-- 5. Set redirect URI: https://your-project-ref.supabase.co/auth/v1/callback
-- 6. Update the provider_configs table with your actual Google credentials