# Database Schema Documentation

This document provides comprehensive documentation for the database schema and data management in the Sembalun meditation app.

## 🗄️ Database Architecture

The application uses **PostgreSQL** via **Supabase** with the following architectural principles:

- **Row Level Security (RLS)** for data isolation
- **JSONB columns** for flexible data structures
- **Triggers** for automatic timestamp updates
- **Indexes** for optimal query performance
- **Foreign key constraints** for data integrity

## 📊 Core Tables

### 1. Users Table (`public.users`)

Primary user profile table extending Supabase Auth users.

```sql
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  preferences JSONB DEFAULT '{...}'::jsonb,
  progress JSONB DEFAULT '{...}'::jsonb,
  is_guest BOOLEAN DEFAULT FALSE
);
```

#### User Preferences Schema
```typescript
interface UserPreferences {
  theme: 'auto' | 'light' | 'dark';
  language: 'en' | 'id';
  notifications: {
    daily: boolean;
    reminders: boolean;
    achievements: boolean;
    weeklyProgress: boolean;
    socialUpdates: boolean;
    push: boolean;
    email: boolean;
    sound: boolean;
    vibration: boolean;
  };
  privacy: {
    analytics: boolean;
    dataSharing: boolean;
    profileVisibility: 'public' | 'friends' | 'private';
    shareProgress: boolean;
    locationTracking: boolean;
  };
  meditation: {
    defaultDuration: number;
    preferredVoice: string;
    backgroundSounds: boolean;
    guidanceLevel: 'minimal' | 'moderate' | 'detailed';
    musicVolume: number;
    voiceVolume: number;
    autoAdvance: boolean;
    showTimer: boolean;
    preparationTime: number;
    endingBell: boolean;
  };
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
    screenReader: boolean;
    keyboardNavigation: boolean;
  };
  display: {
    dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
    timeFormat: '12h' | '24h';
    weekStartsOn: 'sunday' | 'monday';
    showStreaks: boolean;
    showStatistics: boolean;
  };
}
```

#### User Progress Schema
```typescript
interface UserProgress {
  total_sessions: number;
  total_minutes: number;
  current_streak: number;
  longest_streak: number;
  achievements: string[];
  favorite_categories: string[];
  completed_programs: string[];
}
```

### 2. Meditation Sessions Table (`public.meditation_sessions`)

Records of completed meditation sessions.

```sql
CREATE TABLE public.meditation_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('breathing', 'guided', 'silent', 'walking')),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  mood_before TEXT,
  mood_after TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

#### Session Types
- **`breathing`**: Focused breathing exercises
- **`guided`**: Voice-guided meditation sessions
- **`silent`**: Timer-only meditation
- **`walking`**: Moving meditation practices

#### Mood Values
Standard mood values: `'very_low'`, `'low'`, `'neutral'`, `'good'`, `'excellent'`

### 3. Journal Entries Table (`public.journal_entries`)

User meditation reflections and journaling.

```sql
CREATE TABLE public.journal_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  mood TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

#### Tag Examples
Common tags: `['gratitude', 'insight', 'challenge', 'breakthrough', 'reflection', 'goal']`

### 4. Courses Table (`public.courses`)

Available meditation courses and content.

```sql
CREATE TABLE public.courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  instructor TEXT,
  image_url TEXT,
  audio_url TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

#### Course Categories
- `'pemula'` (Beginner)
- `'pernapasan'` (Breathing)
- `'gerakan'` (Movement)
- `'relaksasi'` (Relaxation)
- `'kasih'` (Loving-kindness)
- `'lanjutan'` (Advanced)

### 5. User Course Progress Table (`public.user_course_progress`)

Tracks individual user progress through courses.

```sql
CREATE TABLE public.user_course_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  last_accessed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, course_id)
);
```

### 6. Achievements Table (`public.achievements`)

User achievement and milestone records.

```sql
CREATE TABLE public.achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  achievement_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

#### Achievement Types
- `'first_session'`: First meditation session
- `'streak_7'`: 7-day streak
- `'streak_30'`: 30-day streak
- `'sessions_10'`: 10 sessions completed
- `'sessions_100'`: 100 sessions milestone
- `'minutes_60'`: 60 minutes total
- `'minutes_1000'`: 1000 minutes milestone
- `'course_complete'`: Course completion
- `'category_master'`: Master a meditation category

### 7. Bookmarks Table (`public.bookmarks`)

User bookmarks for courses, sessions, and journal entries.

```sql
CREATE TABLE public.bookmarks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('course', 'session', 'journal')),
  content_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

### 8. User Settings Table (`public.user_settings`)

Extended user settings that don't fit in JSONB preferences.

```sql
CREATE TABLE public.user_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, setting_key)
);
```

#### Common Setting Keys
- `'notification_schedule'`: Custom notification timing
- `'download_preferences'`: Offline content settings
- `'biometric_data'`: Health integration settings
- `'social_connections'`: Friend and community connections
- `'custom_goals'`: Personal meditation goals

### 9. Moods Table (`public.moods`)

Daily mood tracking independent of meditation sessions.

```sql
CREATE TABLE public.moods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  mood TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

## 🔍 Database Indexes

Performance-optimized indexes for common queries:

```sql
-- Session queries
CREATE INDEX idx_meditation_sessions_user_id ON public.meditation_sessions(user_id);
CREATE INDEX idx_meditation_sessions_completed_at ON public.meditation_sessions(completed_at DESC);

-- Journal queries
CREATE INDEX idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX idx_journal_entries_created_at ON public.journal_entries(created_at DESC);

-- Achievement queries
CREATE INDEX idx_achievements_user_id ON public.achievements(user_id);

-- Course progress queries
CREATE INDEX idx_user_course_progress_user_id ON public.user_course_progress(user_id);
CREATE INDEX idx_user_course_progress_course_id ON public.user_course_progress(course_id);

-- Bookmark queries
CREATE INDEX idx_bookmarks_user_id ON public.bookmarks(user_id);

-- Course queries
CREATE INDEX idx_courses_category ON public.courses(category);
CREATE INDEX idx_courses_order_index ON public.courses(order_index);

-- Mood queries
CREATE INDEX idx_moods_user_id ON public.moods(user_id);
CREATE INDEX idx_moods_created_at ON public.moods(created_at DESC);
```

## 🔒 Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

### Users Table Policies
```sql
-- Users can view own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert own profile
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### Session Policies
```sql
-- Users can view own sessions
CREATE POLICY "Users can view own sessions" ON public.meditation_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert own sessions
CREATE POLICY "Users can insert own sessions" ON public.meditation_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update own sessions
CREATE POLICY "Users can update own sessions" ON public.meditation_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete own sessions
CREATE POLICY "Users can delete own sessions" ON public.meditation_sessions
  FOR DELETE USING (auth.uid() = user_id);
```

### Similar patterns for all other user-specific tables

### Public Data Policies
```sql
-- Courses are public for reading
CREATE POLICY "Anyone can view courses" ON public.courses
  FOR SELECT USING (true);
```

## ⚙️ Database Functions

### Automatic Timestamp Updates
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### User Profile Creation
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Account Deletion
```sql
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS VOID AS $$
DECLARE
  user_id UUID := auth.uid();
BEGIN
  -- Delete user data (will cascade to related tables)
  DELETE FROM public.users WHERE id = user_id;
  
  -- Note: Actual auth.users deletion should be handled carefully
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 🌱 Sample Data

### Default Courses
```sql
INSERT INTO public.courses (title, description, category, difficulty, duration_minutes, instructor, is_premium, order_index) VALUES
('Pengenalan Meditasi', 'Pembelajaran dasar tentang meditasi untuk pemula', 'pemula', 'beginner', 10, 'Guru Sembalun', false, 1),
('Pernapasan Mindful', 'Teknik pernapasan untuk menenangkan pikiran', 'pernapasan', 'beginner', 15, 'Guru Sembalun', false, 2),
('Meditasi Berjalan', 'Meditasi sambil berjalan untuk menghubungkan dengan alam', 'gerakan', 'intermediate', 20, 'Guru Sembalun', false, 3),
('Scanning Tubuh', 'Teknik relaksasi dengan memindai seluruh tubuh', 'relaksasi', 'beginner', 25, 'Guru Sembalun', true, 4),
('Meditasi Cinta Kasih', 'Mengembangkan rasa kasih dan compassion', 'kasih', 'intermediate', 30, 'Guru Sembalun', true, 5),
('Meditasi Lanjutan', 'Teknik meditasi untuk praktisi berpengalaman', 'lanjutan', 'advanced', 45, 'Guru Sembalun', true, 6);
```

## 💾 Storage Buckets

### Supabase Storage Configuration
```sql
-- Storage buckets (configured via Supabase dashboard)
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('avatars', 'avatars', true),
  ('audio', 'audio', true),
  ('images', 'images', true),
  ('documents', 'documents', false);
```

### Storage Policies
```sql
-- Avatar access policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## 🔄 Database Migrations

### Migration File Structure
```
supabase/
├── migrations/
│   ├── 001_initial_schema.sql
│   ├── 002_add_rls_policies.sql
│   ├── 003_add_indexes.sql
│   ├── 004_add_functions.sql
│   └── 005_add_sample_data.sql
└── seed.sql
```

### Migration Best Practices
1. **Incremental Changes**: Each migration should be atomic and reversible
2. **Data Preservation**: Always preserve existing data during schema changes
3. **Testing**: Test migrations on development data before production
4. **Rollback Plans**: Prepare rollback strategies for critical migrations

## 📊 Query Optimization

### Common Query Patterns

#### Get User Sessions with Statistics
```sql
SELECT 
  DATE_TRUNC('day', completed_at) as session_date,
  COUNT(*) as session_count,
  SUM(duration_minutes) as total_minutes,
  AVG(duration_minutes) as avg_duration
FROM meditation_sessions 
WHERE user_id = $1 
  AND completed_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', completed_at)
ORDER BY session_date DESC;
```

#### Calculate User Streak
```sql
WITH daily_sessions AS (
  SELECT DISTINCT DATE(completed_at) as session_date
  FROM meditation_sessions 
  WHERE user_id = $1
  ORDER BY session_date DESC
),
streak_calc AS (
  SELECT 
    session_date,
    ROW_NUMBER() OVER (ORDER BY session_date DESC) as rn,
    session_date - INTERVAL '1 day' * ROW_NUMBER() OVER (ORDER BY session_date DESC) as streak_group
  FROM daily_sessions
)
SELECT COUNT(*) as current_streak
FROM streak_calc
WHERE streak_group = (
  SELECT streak_group 
  FROM streak_calc 
  WHERE session_date = CURRENT_DATE
);
```

## 🚨 Data Backup & Recovery

### Backup Strategy
1. **Automatic Backups**: Supabase provides automated daily backups
2. **Point-in-Time Recovery**: Available for critical data recovery
3. **Export Procedures**: Regular data exports for additional security
4. **Disaster Recovery**: Multi-region backup strategy

### Data Retention
- **Session Data**: Retained indefinitely (user-controlled deletion)
- **Journal Entries**: Permanent retention unless user requests deletion
- **User Preferences**: Retained for active accounts
- **Analytics Data**: Aggregated data retained, detailed data pruned after 2 years

## 📈 Performance Monitoring

### Key Metrics
- Query response times
- Index usage statistics
- Table size and growth
- Connection pool utilization
- Cache hit ratios

### Monitoring Queries
```sql
-- Slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 1000
ORDER BY mean_exec_time DESC;

-- Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

This comprehensive database documentation covers the complete data architecture and management strategy for the Sembalun meditation application.