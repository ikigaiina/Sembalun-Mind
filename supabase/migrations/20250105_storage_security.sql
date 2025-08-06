-- Storage Bucket Security Setup
-- Sembalun Meditation App - Secure File Upload and Access
-- Run after OAuth setup

-- ============================================================================
-- PART 1: STORAGE BUCKETS CREATION
-- ============================================================================

-- Create storage buckets with appropriate settings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES 
  (
    'avatars',
    'avatars',
    true, -- Public access for avatar images
    2097152, -- 2MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'audio',
    'audio',
    true, -- Public access for meditation audio
    52428800, -- 50MB limit
    ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac']
  ),
  (
    'images',
    'images',
    true, -- Public access for course/content images
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
  ),
  (
    'documents',
    'documents',
    false, -- Private access for user documents
    10485760, -- 10MB limit
    ARRAY['application/pdf', 'text/plain', 'application/json', 'text/markdown']
  ),
  (
    'exports',
    'exports',
    false, -- Private access for data exports
    104857600, -- 100MB limit
    ARRAY['application/json', 'text/csv', 'application/zip']
  )
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================================================
-- PART 2: AVATAR STORAGE POLICIES
-- ============================================================================

-- Public read access for avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Users can upload their own avatar
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1] AND
    -- Validate file path structure: avatars/{user_id}/{filename}
    array_length(storage.foldername(name), 1) = 2 AND
    -- Ensure authenticated user
    auth.jwt() ->> 'aud' = 'authenticated'
  );

-- Users can update their own avatar
CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1] AND
    auth.jwt() ->> 'aud' = 'authenticated'
  );

-- Users can delete their own avatar
CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1] AND
    auth.jwt() ->> 'aud' = 'authenticated'
  );

-- ============================================================================
-- PART 3: AUDIO STORAGE POLICIES
-- ============================================================================

-- Public read access for audio files
CREATE POLICY "Audio files are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'audio');

-- Only admins can upload audio files
CREATE POLICY "Admins can upload audio files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'audio' AND
    auth.jwt() ->> 'app_metadata' ? 'admin' AND
    auth.jwt() ->> 'aud' = 'authenticated'
  );

-- Only admins can update audio files
CREATE POLICY "Admins can update audio files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'audio' AND
    auth.jwt() ->> 'app_metadata' ? 'admin' AND
    auth.jwt() ->> 'aud' = 'authenticated'
  );

-- Only admins can delete audio files
CREATE POLICY "Admins can delete audio files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'audio' AND
    auth.jwt() ->> 'app_metadata' ? 'admin' AND
    auth.jwt() ->> 'aud' = 'authenticated'
  );

-- ============================================================================
-- PART 4: IMAGES STORAGE POLICIES
-- ============================================================================

-- Public read access for images  
CREATE POLICY "Images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

-- Admins can upload images
CREATE POLICY "Admins can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'images' AND
    auth.jwt() ->> 'app_metadata' ? 'admin' AND
    auth.jwt() ->> 'aud' = 'authenticated'
  );

-- Users can upload images to their own folders
CREATE POLICY "Users can upload to own image folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'images' AND
    auth.uid()::text = (storage.foldername(name))[1] AND
    array_length(storage.foldername(name), 1) >= 2 AND
    auth.jwt() ->> 'aud' = 'authenticated'
  );

-- Admins can update any images
CREATE POLICY "Admins can update images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'images' AND
    auth.jwt() ->> 'app_metadata' ? 'admin' AND
    auth.jwt() ->> 'aud' = 'authenticated'
  );

-- Users can update their own images
CREATE POLICY "Users can update own images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'images' AND
    auth.uid()::text = (storage.foldername(name))[1] AND
    auth.jwt() ->> 'aud' = 'authenticated'
  );

-- Admins can delete any images
CREATE POLICY "Admins can delete images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'images' AND
    auth.jwt() ->> 'app_metadata' ? 'admin' AND
    auth.jwt() ->> 'aud' = 'authenticated'
  );

-- Users can delete their own images
CREATE POLICY "Users can delete own images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'images' AND
    auth.uid()::text = (storage.foldername(name))[1] AND
    auth.jwt() ->> 'aud' = 'authenticated'
  );

-- ============================================================================
-- PART 5: DOCUMENTS STORAGE POLICIES
-- ============================================================================

-- Users can read their own documents
CREATE POLICY "Users can read own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1] AND
    auth.jwt() ->> 'aud' = 'authenticated'
  );

-- Admins can read all documents
CREATE POLICY "Admins can read all documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND
    auth.jwt() ->> 'app_metadata' ? 'admin' AND
    auth.jwt() ->> 'aud' = 'authenticated'
  );

-- Users can upload to their own documents folder
CREATE POLICY "Users can upload own documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1] AND
    array_length(storage.foldername(name), 1) >= 2 AND
    auth.jwt() ->> 'aud' = 'authenticated' AND
    -- Rate limit: max 10 documents per day
    (
      SELECT COUNT(*) 
      FROM storage.objects 
      WHERE bucket_id = 'documents' 
      AND (storage.foldername(name))[1] = auth.uid()::text
      AND created_at >= CURRENT_DATE
    ) < 10
  );

-- Users can update their own documents
CREATE POLICY "Users can update own documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1] AND
    auth.jwt() ->> 'aud' = 'authenticated'
  );

-- Users can delete their own documents
CREATE POLICY "Users can delete own documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1] AND
    auth.jwt() ->> 'aud' = 'authenticated'
  );

-- ============================================================================
-- PART 6: EXPORTS STORAGE POLICIES
-- ============================================================================

-- Users can read their own exports
CREATE POLICY "Users can read own exports" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'exports' AND
    auth.uid()::text = (storage.foldername(name))[1] AND
    auth.jwt() ->> 'aud' = 'authenticated'
  );

-- System can create exports for users
CREATE POLICY "System can create exports" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'exports' AND
    auth.uid()::text = (storage.foldername(name))[1] AND
    array_length(storage.foldername(name), 1) >= 2 AND
    auth.jwt() ->> 'aud' = 'authenticated' AND
    -- Filename must include timestamp for uniqueness
    name ~ '\d{4}-\d{2}-\d{2}'
  );

-- Users can delete their own exports
CREATE POLICY "Users can delete own exports" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'exports' AND
    auth.uid()::text = (storage.foldername(name))[1] AND
    auth.jwt() ->> 'aud' = 'authenticated'
  );

-- No direct updates to exports (recreate instead)
CREATE POLICY "No updates to exports" ON storage.objects
  FOR UPDATE USING (bucket_id != 'exports');

-- ============================================================================
-- PART 7: STORAGE SECURITY FUNCTIONS
-- ============================================================================

-- Function to validate file upload
CREATE OR REPLACE FUNCTION public.validate_file_upload(
  bucket_name TEXT,
  file_path TEXT,
  file_size BIGINT,
  mime_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  bucket_config RECORD;
  user_id UUID := auth.uid();
  user_folder TEXT;
BEGIN
  -- Get bucket configuration
  SELECT * INTO bucket_config
  FROM storage.buckets
  WHERE id = bucket_name;

  -- Check if bucket exists
  IF bucket_config.id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check file size limit
  IF file_size > bucket_config.file_size_limit THEN
    RETURN FALSE;
  END IF;

  -- Check MIME type
  IF NOT (mime_type = ANY(bucket_config.allowed_mime_types)) THEN
    RETURN FALSE;
  END IF;

  -- Validate folder structure for user-specific buckets
  IF bucket_name IN ('avatars', 'documents', 'exports') THEN
    user_folder := (storage.foldername(file_path))[1];
    IF user_folder != user_id::text THEN
      RETURN FALSE;
    END IF;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up orphaned files
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_files()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- Clean up avatar files for deleted users
  DELETE FROM storage.objects
  WHERE bucket_id = 'avatars'
  AND NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id::text = (storage.foldername(name))[1]
  );
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  -- Clean up old export files (older than 30 days)
  DELETE FROM storage.objects
  WHERE bucket_id = 'exports'
  AND created_at < NOW() - INTERVAL '30 days';

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user storage usage
CREATE OR REPLACE FUNCTION public.get_user_storage_usage(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE(
  bucket_name TEXT,
  file_count BIGINT,
  total_size BIGINT,
  size_mb NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    so.bucket_id::TEXT,
    COUNT(*)::BIGINT,
    COALESCE(SUM(so.metadata->>'size')::BIGINT, 0),
    ROUND(COALESCE(SUM(so.metadata->>'size')::BIGINT, 0) / 1024.0 / 1024.0, 2)
  FROM storage.objects so
  WHERE (storage.foldername(so.name))[1] = user_uuid::text
  GROUP BY so.bucket_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 8: STORAGE AUDIT LOGGING
-- ============================================================================

-- Create storage audit log table
CREATE TABLE IF NOT EXISTS public.storage_audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  bucket_id TEXT NOT NULL,
  object_name TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  file_size BIGINT,
  mime_type TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on storage audit logs
ALTER TABLE public.storage_audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own storage audit logs
CREATE POLICY "storage_audit_own_access" ON public.storage_audit_logs
  FOR SELECT USING (
    auth.uid() = user_id AND
    auth.jwt() ->> 'aud' = 'authenticated'
  );

-- Admins can view all storage audit logs
CREATE POLICY "storage_audit_admin_access" ON public.storage_audit_logs
  FOR SELECT USING (
    auth.jwt() ->> 'app_metadata' ? 'admin' AND
    auth.jwt() ->> 'aud' = 'authenticated'
  );

-- Create index for storage audit logs
CREATE INDEX IF NOT EXISTS idx_storage_audit_user_id ON public.storage_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_storage_audit_bucket ON public.storage_audit_logs(bucket_id);
CREATE INDEX IF NOT EXISTS idx_storage_audit_created_at ON public.storage_audit_logs(created_at DESC);

-- ============================================================================
-- PART 9: STORAGE TRIGGERS
-- ============================================================================

-- Function to log storage operations
CREATE OR REPLACE FUNCTION public.log_storage_operation()
RETURNS TRIGGER AS $$
BEGIN
  -- Log storage operations
  INSERT INTO public.storage_audit_logs (
    user_id,
    bucket_id,
    object_name,
    operation,
    file_size,
    mime_type,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    COALESCE(NEW.bucket_id, OLD.bucket_id),
    COALESCE(NEW.name, OLD.name),
    TG_OP,
    CASE 
      WHEN NEW.metadata IS NOT NULL THEN (NEW.metadata->>'size')::BIGINT
      WHEN OLD.metadata IS NOT NULL THEN (OLD.metadata->>'size')::BIGINT
      ELSE NULL
    END,
    CASE 
      WHEN NEW.metadata IS NOT NULL THEN NEW.metadata->>'mimetype'
      WHEN OLD.metadata IS NOT NULL THEN OLD.metadata->>'mimetype'
      ELSE NULL
    END,
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

-- Add storage audit triggers
CREATE TRIGGER storage_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON storage.objects
  FOR EACH ROW EXECUTE FUNCTION public.log_storage_operation();

-- ============================================================================
-- PART 10: STORAGE MAINTENANCE FUNCTIONS
-- ============================================================================

-- Function for comprehensive storage maintenance
CREATE OR REPLACE FUNCTION public.storage_maintenance()
RETURNS TEXT AS $$
DECLARE
  orphaned_files INTEGER;
  old_audit_logs INTEGER;
  result_text TEXT;
BEGIN
  -- Clean up orphaned files
  SELECT public.cleanup_orphaned_files() INTO orphaned_files;

  -- Clean up old audit logs (keep 90 days)
  DELETE FROM public.storage_audit_logs 
  WHERE created_at < NOW() - INTERVAL '90 days';
  GET DIAGNOSTICS old_audit_logs = ROW_COUNT;

  -- Build result message
  result_text := format(
    'Storage Maintenance Complete: Removed %s orphaned files, %s old audit logs',
    orphaned_files,
    old_audit_logs
  );

  RETURN result_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 11: STORAGE HELPER FUNCTIONS
-- ============================================================================

-- Function to generate secure upload URL
CREATE OR REPLACE FUNCTION public.generate_upload_url(
  bucket_name TEXT,
  file_path TEXT,
  expires_in INTEGER DEFAULT 300 -- 5 minutes
)
RETURNS JSON AS $$
DECLARE
  user_id UUID := auth.uid();
  signed_url TEXT;
BEGIN
  -- Validate user authentication
  IF user_id IS NULL THEN
    RETURN json_build_object('error', 'Authentication required');
  END IF;

  -- Validate bucket access
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets 
    WHERE id = bucket_name
  ) THEN
    RETURN json_build_object('error', 'Invalid bucket');
  END IF;

  -- For user-specific buckets, ensure correct folder structure
  IF bucket_name IN ('avatars', 'documents', 'exports') THEN
    IF (storage.foldername(file_path))[1] != user_id::text THEN
      RETURN json_build_object('error', 'Invalid file path');
    END IF;
  END IF;

  -- Return upload information
  RETURN json_build_object(
    'bucket', bucket_name,
    'path', file_path,
    'expires_in', expires_in,
    'max_file_size', (
      SELECT file_size_limit 
      FROM storage.buckets 
      WHERE id = bucket_name
    ),
    'allowed_types', (
      SELECT allowed_mime_types 
      FROM storage.buckets 
      WHERE id = bucket_name
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📁 Storage Security Setup Complete! ✅';
  RAISE NOTICE '';
  RAISE NOTICE 'Storage Buckets Created:';
  RAISE NOTICE '- avatars (public, 2MB limit, images only)';
  RAISE NOTICE '- audio (public, 50MB limit, audio only)';
  RAISE NOTICE '- images (public, 5MB limit, images only)';
  RAISE NOTICE '- documents (private, 10MB limit, docs only)';
  RAISE NOTICE '- exports (private, 100MB limit, data files)';
  RAISE NOTICE '';
  RAISE NOTICE 'Security Features:';
  RAISE NOTICE '- User-specific folder isolation';
  RAISE NOTICE '- File type and size validation';
  RAISE NOTICE '- Rate limiting for uploads';
  RAISE NOTICE '- Comprehensive audit logging';
  RAISE NOTICE '- Automatic cleanup maintenance';
  RAISE NOTICE '- Admin-only access to system files';
  RAISE NOTICE '';
  RAISE NOTICE 'Test your storage:';
  RAISE NOTICE '  SELECT * FROM public.get_user_storage_usage();';
  RAISE NOTICE '  SELECT public.storage_maintenance();';
END $$;