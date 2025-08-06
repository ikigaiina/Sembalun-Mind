-- TABLE_NAME Database Model Template
-- 
-- This is a base template for creating database schemas in Supabase.
-- Replace TABLE_NAME with your actual table name (e.g., meditation_sessions, user_profiles).
-- 
-- Features included:
-- - PostgreSQL optimized structure
-- - UUID primary keys
-- - Timestamps with timezone
-- - User relationship patterns
-- - RLS (Row Level Security) policies
-- - Indexes for performance
-- - Foreign key constraints
-- - JSON/JSONB fields for flexibility
-- - Full-text search support

-- TODO: Replace TABLE_NAME with your actual table name
CREATE TABLE IF NOT EXISTS public.TABLE_NAME (
    -- Primary key (UUID)
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User relationship (references auth.users)
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Core fields (TODO: Customize based on your needs)
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Status field with enum constraint
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'archived')),
    
    -- Categorical fields
    category VARCHAR(100),
    tags TEXT[], -- Array of tags
    
    -- Numeric fields
    sort_order INTEGER DEFAULT 0,
    priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
    
    -- Boolean fields
    is_public BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    
    -- JSON fields for flexible data
    metadata JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    data JSONB DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Soft delete support
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES auth.users(id)
);

-- TODO: Add table comment
COMMENT ON TABLE public.TABLE_NAME IS 'TODO: Add table description here';

-- TODO: Add column comments
COMMENT ON COLUMN public.TABLE_NAME.id IS 'Primary key identifier';
COMMENT ON COLUMN public.TABLE_NAME.user_id IS 'Owner of this record';
COMMENT ON COLUMN public.TABLE_NAME.name IS 'Display name or title';
COMMENT ON COLUMN public.TABLE_NAME.description IS 'Detailed description';
COMMENT ON COLUMN public.TABLE_NAME.status IS 'Current status of the record';
COMMENT ON COLUMN public.TABLE_NAME.metadata IS 'Flexible JSON data for additional properties';
COMMENT ON COLUMN public.TABLE_NAME.created_at IS 'Timestamp when record was created';
COMMENT ON COLUMN public.TABLE_NAME.updated_at IS 'Timestamp when record was last updated';

-- Indexes for performance optimization
-- TODO: Customize indexes based on your query patterns

-- Primary user queries
CREATE INDEX IF NOT EXISTS idx_TABLE_NAME_user_id ON public.TABLE_NAME(user_id);

-- Status and category filtering
CREATE INDEX IF NOT EXISTS idx_TABLE_NAME_status ON public.TABLE_NAME(status) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_TABLE_NAME_category ON public.TABLE_NAME(category) WHERE is_deleted = false;

-- Ordering and pagination
CREATE INDEX IF NOT EXISTS idx_TABLE_NAME_created_at ON public.TABLE_NAME(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_TABLE_NAME_updated_at ON public.TABLE_NAME(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_TABLE_NAME_sort_order ON public.TABLE_NAME(sort_order, name);

-- Boolean flags for filtering
CREATE INDEX IF NOT EXISTS idx_TABLE_NAME_public ON public.TABLE_NAME(is_public) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_TABLE_NAME_featured ON public.TABLE_NAME(is_featured) WHERE is_deleted = false;

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_TABLE_NAME_user_status ON public.TABLE_NAME(user_id, status) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_TABLE_NAME_user_category ON public.TABLE_NAME(user_id, category) WHERE is_deleted = false;

-- Full-text search (TODO: Customize searchable fields)
CREATE INDEX IF NOT EXISTS idx_TABLE_NAME_search ON public.TABLE_NAME 
USING gin(to_tsvector('english', name || ' ' || COALESCE(description, ''))) 
WHERE is_deleted = false;

-- JSONB indexes for metadata queries
CREATE INDEX IF NOT EXISTS idx_TABLE_NAME_metadata ON public.TABLE_NAME USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_TABLE_NAME_settings ON public.TABLE_NAME USING gin(settings);

-- Array index for tags
CREATE INDEX IF NOT EXISTS idx_TABLE_NAME_tags ON public.TABLE_NAME USING gin(tags);

-- Partial index for non-deleted records
CREATE INDEX IF NOT EXISTS idx_TABLE_NAME_active ON public.TABLE_NAME(id, user_id, status, created_at) 
WHERE is_deleted = false;

-- Row Level Security (RLS) Policies
-- TODO: Customize policies based on your access requirements

-- Enable RLS
ALTER TABLE public.TABLE_NAME ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own records
CREATE POLICY "Users can view own TABLE_NAME" ON public.TABLE_NAME
    FOR SELECT USING (
        auth.uid() = user_id 
        OR is_public = true
    );

-- Policy: Users can insert their own records
CREATE POLICY "Users can insert own TABLE_NAME" ON public.TABLE_NAME
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
    );

-- Policy: Users can update their own records
CREATE POLICY "Users can update own TABLE_NAME" ON public.TABLE_NAME
    FOR UPDATE USING (
        auth.uid() = user_id
    ) WITH CHECK (
        auth.uid() = user_id
    );

-- Policy: Users can delete their own records (soft delete)
CREATE POLICY "Users can delete own TABLE_NAME" ON public.TABLE_NAME
    FOR DELETE USING (
        auth.uid() = user_id
    );

-- Policy: Admin users can manage all records (TODO: Implement admin role)
-- CREATE POLICY "Admins can manage all TABLE_NAME" ON public.TABLE_NAME
--     FOR ALL USING (
--         EXISTS (
--             SELECT 1 FROM auth.users 
--             WHERE id = auth.uid() 
--             AND raw_user_meta_data->>'role' = 'admin'
--         )
--     );

-- Trigger function to update timestamps
CREATE OR REPLACE FUNCTION update_TABLE_NAME_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_TABLE_NAME_updated_at
    BEFORE UPDATE ON public.TABLE_NAME
    FOR EACH ROW
    EXECUTE FUNCTION update_TABLE_NAME_updated_at();

-- Trigger function for audit logging (TODO: Implement audit table)
CREATE OR REPLACE FUNCTION log_TABLE_NAME_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- TODO: Insert into audit log table
    -- INSERT INTO public.audit_log (table_name, record_id, action, old_data, new_data, user_id)
    -- VALUES (TG_TABLE_NAME, COALESCE(NEW.id, OLD.id), TG_OP, 
    --         CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    --         CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    --         auth.uid());
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Audit trigger (TODO: Enable after implementing audit table)
-- CREATE TRIGGER trigger_TABLE_NAME_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.TABLE_NAME
--     FOR EACH ROW
--     EXECUTE FUNCTION log_TABLE_NAME_changes();

-- Function to soft delete records
CREATE OR REPLACE FUNCTION soft_delete_TABLE_NAME(record_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.TABLE_NAME 
    SET 
        is_deleted = true,
        deleted_at = NOW(),
        deleted_by = auth.uid(),
        updated_at = NOW(),
        updated_by = auth.uid()
    WHERE id = record_id AND user_id = auth.uid();
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restore soft deleted records
CREATE OR REPLACE FUNCTION restore_TABLE_NAME(record_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.TABLE_NAME 
    SET 
        is_deleted = false,
        deleted_at = NULL,
        deleted_by = NULL,
        updated_at = NOW(),
        updated_by = auth.uid()
    WHERE id = record_id AND user_id = auth.uid();
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for full-text search
CREATE OR REPLACE FUNCTION search_TABLE_NAME(
    search_query TEXT,
    user_filter UUID DEFAULT NULL,
    category_filter VARCHAR DEFAULT NULL,
    status_filter VARCHAR DEFAULT 'active',
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    description TEXT,
    category VARCHAR,
    status VARCHAR,
    created_at TIMESTAMPTZ,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.name,
        t.description,
        t.category,
        t.status,
        t.created_at,
        ts_rank(
            to_tsvector('english', t.name || ' ' || COALESCE(t.description, '')),
            plainto_tsquery('english', search_query)
        ) as rank
    FROM public.TABLE_NAME t
    WHERE 
        t.is_deleted = false
        AND (user_filter IS NULL OR t.user_id = user_filter OR t.is_public = true)
        AND (category_filter IS NULL OR t.category = category_filter)
        AND (status_filter IS NULL OR t.status = status_filter)
        AND (
            search_query = '' OR
            to_tsvector('english', t.name || ' ' || COALESCE(t.description, '')) 
            @@ plainto_tsquery('english', search_query)
        )
    ORDER BY 
        CASE WHEN search_query = '' THEN 0 ELSE ts_rank(
            to_tsvector('english', t.name || ' ' || COALESCE(t.description, '')),
            plainto_tsquery('english', search_query)
        ) END DESC,
        t.is_featured DESC,
        t.sort_order ASC,
        t.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's records with pagination
CREATE OR REPLACE FUNCTION get_user_TABLE_NAME(
    target_user_id UUID,
    status_filter VARCHAR DEFAULT NULL,
    category_filter VARCHAR DEFAULT NULL,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    description TEXT,
    category VARCHAR,
    status VARCHAR,
    metadata JSONB,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.name,
        t.description,
        t.category,
        t.status,
        t.metadata,
        t.created_at,
        t.updated_at
    FROM public.TABLE_NAME t
    WHERE 
        t.user_id = target_user_id
        AND t.is_deleted = false
        AND (status_filter IS NULL OR t.status = status_filter)
        AND (category_filter IS NULL OR t.category = category_filter)
    ORDER BY 
        t.is_featured DESC,
        t.sort_order ASC,
        t.updated_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions (TODO: Customize based on your needs)
-- Grant to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.TABLE_NAME TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant to anonymous users (read-only for public records)
GRANT SELECT ON public.TABLE_NAME TO anon;

-- Example data (TODO: Remove or customize for production)
-- INSERT INTO public.TABLE_NAME (name, description, category, status, is_public, metadata)
-- VALUES 
--     ('Example Record 1', 'This is a sample record', 'sample', 'active', true, '{"sample": true}'),
--     ('Example Record 2', 'Another sample record', 'sample', 'active', false, '{"sample": true}');

/*
TODO: Additional considerations for production:

1. Backup Strategy:
   - Set up automated backups
   - Test restore procedures
   - Document backup retention policy

2. Performance Monitoring:
   - Monitor query performance
   - Set up alerts for slow queries
   - Regular index analysis

3. Data Archival:
   - Implement data archival strategy
   - Set up automated cleanup for old records
   - Consider partitioning for large tables

4. Security:
   - Review and test RLS policies
   - Implement proper admin role checks
   - Regular security audits

5. Documentation:
   - Document business rules
   - Create API documentation
   - Maintain change log

Example usage in application:

-- Get user's records
SELECT * FROM get_user_TABLE_NAME('user-uuid-here', 'active', NULL, 10, 0);

-- Search records
SELECT * FROM search_TABLE_NAME('meditation', NULL, 'wellness', 'active', 10, 0);

-- Soft delete
SELECT soft_delete_TABLE_NAME('record-uuid-here');

-- Restore record
SELECT restore_TABLE_NAME('record-uuid-here');
*/