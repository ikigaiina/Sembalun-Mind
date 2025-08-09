-- =====================================================
-- STORAGE BUCKETS CONFIGURATION FOR SEMBALUN MIND
-- Complete storage setup for all media types
-- =====================================================

-- Create Storage Buckets
-- Note: These commands should be run in Supabase Dashboard or via API

-- 1. Avatar Storage (Public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'avatars', 
  'avatars', 
  true, 
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- 2. Audio Content Storage (Public)  
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'audio', 
  'audio', 
  true, 
  52428800, -- 50MB limit
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a']
);

-- 3. Journal Voice Recordings (Private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'journal-audio', 
  'journal-audio', 
  false, 
  10485760, -- 10MB limit
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm']
);

-- 4. Course Images and Media (Public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'course-media', 
  'course-media', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
);

-- 5. Cultural Practice Media (Public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'cultural-media', 
  'cultural-media', 
  true, 
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/mp3', 'video/mp4']
);

-- 6. User Generated Content (Private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'user-content', 
  'user-content', 
  false, 
  20971520, -- 20MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'audio/mpeg', 'audio/mp3']
);

-- =====================================================
-- STORAGE POLICIES
-- =====================================================

-- Avatar Storage Policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Audio Content Policies (Public Read)
CREATE POLICY "Audio content is publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'audio');

-- Only admins can upload audio content
CREATE POLICY "Only admins can upload audio content" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'audio' 
    AND auth.jwt() ->> 'role' = 'admin'
  );

-- Journal Audio Policies (Private)
CREATE POLICY "Users can access own journal audio" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'journal-audio' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload journal audio" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'journal-audio' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own journal audio" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'journal-audio' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Course Media Policies (Public Read)
CREATE POLICY "Course media is publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'course-media');

-- Cultural Media Policies (Public Read)
CREATE POLICY "Cultural media is publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'cultural-media');

-- User Content Policies (Private)
CREATE POLICY "Users can manage own content" ON storage.objects
  FOR ALL USING (
    bucket_id = 'user-content' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- =====================================================
-- HELPER FUNCTIONS FOR STORAGE
-- =====================================================

-- Function to generate secure filename
CREATE OR REPLACE FUNCTION generate_secure_filename(original_name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN concat(
    extract(epoch from now())::text, 
    '_',
    encode(gen_random_bytes(8), 'hex'),
    '_',
    regexp_replace(lower(original_name), '[^a-z0-9._-]', '_', 'g')
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get avatar URL
CREATE OR REPLACE FUNCTION get_avatar_url(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  avatar_path TEXT;
BEGIN
  SELECT name INTO avatar_path 
  FROM storage.objects 
  WHERE bucket_id = 'avatars' 
    AND name LIKE user_id::text || '/%'
  ORDER BY created_at DESC 
  LIMIT 1;
  
  IF avatar_path IS NOT NULL THEN
    RETURN concat('https://your-supabase-url.supabase.co/storage/v1/object/public/avatars/', avatar_path);
  ELSE
    RETURN NULL;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old files
CREATE OR REPLACE FUNCTION cleanup_old_user_files()
RETURNS void AS $$
BEGIN
  -- Delete journal audio older than 1 year
  DELETE FROM storage.objects
  WHERE bucket_id = 'journal-audio'
    AND created_at < NOW() - INTERVAL '1 year';
    
  -- Delete old avatar versions (keep only latest)
  WITH ranked_avatars AS (
    SELECT name, 
           ROW_NUMBER() OVER (
             PARTITION BY (storage.foldername(name))[1] 
             ORDER BY created_at DESC
           ) as rn
    FROM storage.objects
    WHERE bucket_id = 'avatars'
  )
  DELETE FROM storage.objects
  WHERE name IN (
    SELECT name FROM ranked_avatars WHERE rn > 1
  ) AND bucket_id = 'avatars';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STORAGE USAGE TRACKING
-- =====================================================

-- Table to track storage usage per user
CREATE TABLE public.user_storage_usage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  bucket_name TEXT NOT NULL,
  total_size_bytes BIGINT DEFAULT 0,
  file_count INTEGER DEFAULT 0,
  last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, bucket_name)
);

-- Function to calculate user storage usage
CREATE OR REPLACE FUNCTION calculate_user_storage_usage(target_user_id UUID)
RETURNS void AS $$
DECLARE
  bucket_record RECORD;
  usage_size BIGINT;
  file_count INTEGER;
BEGIN
  FOR bucket_record IN 
    SELECT DISTINCT bucket_id as bucket_name 
    FROM storage.objects 
    WHERE (storage.foldername(name))[1] = target_user_id::text
  LOOP
    SELECT 
      COALESCE(SUM(metadata->>'size')::BIGINT, 0),
      COUNT(*)
    INTO usage_size, file_count
    FROM storage.objects
    WHERE bucket_id = bucket_record.bucket_name
      AND (storage.foldername(name))[1] = target_user_id::text;
    
    INSERT INTO public.user_storage_usage 
      (user_id, bucket_name, total_size_bytes, file_count)
    VALUES 
      (target_user_id, bucket_record.bucket_name, usage_size, file_count)
    ON CONFLICT (user_id, bucket_name) DO UPDATE SET
      total_size_bytes = EXCLUDED.total_size_bytes,
      file_count = EXCLUDED.file_count,
      last_calculated = NOW();
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STORAGE RLS POLICIES
-- =====================================================

ALTER TABLE public.user_storage_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own storage usage" ON public.user_storage_usage
  FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- SCHEDULED CLEANUP (via pg_cron if available)
-- =====================================================

-- Note: This requires pg_cron extension
-- SELECT cron.schedule('cleanup-storage', '0 2 * * *', 'SELECT cleanup_old_user_files();');

-- =====================================================
-- SAMPLE USAGE EXAMPLES
-- =====================================================

-- Example: Upload avatar
-- 1. Generate secure filename: SELECT generate_secure_filename('profile.jpg');
-- 2. Upload to: /avatars/{user_id}/{secure_filename}
-- 3. Update user record: UPDATE users SET avatar_url = get_avatar_url(user_id);

-- Example: Upload journal audio
-- 1. Upload to: /journal-audio/{user_id}/{journal_entry_id}.mp3
-- 2. Update journal entry: UPDATE journal_entries SET voice_recording_url = '...';

-- Example: Check storage usage
-- SELECT * FROM user_storage_usage WHERE user_id = auth.uid();