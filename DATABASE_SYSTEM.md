# Sembalun - Database Schema & Data Management System

## 🗄️ Database Architecture Overview

Sembalun menggunakan PostgreSQL melalui Supabase dengan skema yang dioptimalkan untuk aplikasi meditasi dengan dukungan budaya Indonesia yang kaya.

## 🏗️ Database Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    CORE TABLES                             │
├─────────────────────────────────────────────────────────────┤
│  user_profiles          • User information & preferences    │
│  cultural_traditions    • Indonesian meditation traditions  │
│  meditation_sessions    • User meditation sessions         │
│  user_progress          • Progress tracking & achievements  │
├─────────────────────────────────────────────────────────────┤
│                    CONTENT TABLES                          │
├─────────────────────────────────────────────────────────────┤
│  cultural_content      • Traditional meditation content    │
│  guided_meditations    • Audio guides & scripts           │
│  meditation_music      • Traditional Indonesian music     │
│  achievement_types     • Available achievements           │
├─────────────────────────────────────────────────────────────┤
│                    ANALYTICS TABLES                       │
├─────────────────────────────────────────────────────────────┤
│  session_analytics     • Detailed session metrics        │
│  user_feedback         • User ratings & feedback         │
│  cultural_engagement   • Cultural content engagement     │
│  app_usage_metrics     • App usage patterns              │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Core Database Schema

### User Profiles Table

```sql
-- User Profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    
    -- Cultural Preferences
    cultural_preferences JSONB DEFAULT '{
        "preferredTradition": "javanese",
        "meditationLevel": "beginner",
        "sessionPreferences": {
            "defaultDuration": 10,
            "preferredTime": "morning",
            "musicPreference": true,
            "guidanceLanguage": "indonesia"
        }
    }',
    
    -- Meditation Profile
    meditation_level meditation_level_enum DEFAULT 'beginner',
    experience_months INTEGER DEFAULT 0,
    preferred_session_duration INTEGER DEFAULT 10, -- in minutes
    preferred_time_of_day time_preference_enum DEFAULT 'morning',
    
    -- Progress Tracking
    total_sessions INTEGER DEFAULT 0,
    total_minutes INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    
    -- Personalization
    notification_preferences JSONB DEFAULT '{
        "dailyReminders": true,
        "weeklyProgress": true,
        "achievements": true,
        "culturalContent": true
    }',
    
    -- Privacy & Cultural Respect
    cultural_sharing_consent BOOLEAN DEFAULT false,
    data_sharing_preferences JSONB DEFAULT '{
        "analytics": true,
        "culturalResearch": false,
        "communityFeatures": false
    }',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_user_profiles_cultural_prefs ON user_profiles USING GIN (cultural_preferences);
CREATE INDEX idx_user_profiles_meditation_level ON user_profiles (meditation_level);
CREATE INDEX idx_user_profiles_active ON user_profiles (last_active_at);

-- Create enums
CREATE TYPE meditation_level_enum AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
CREATE TYPE time_preference_enum AS ENUM ('morning', 'afternoon', 'evening', 'flexible');
```

### Cultural Traditions Table

```sql
-- Cultural Traditions (Indonesian Meditation Traditions)
CREATE TABLE cultural_traditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL, -- 'javanese', 'balinese', 'sundanese', 'minang'
    display_name TEXT NOT NULL, -- 'Meditasi Jawa', 'Meditasi Bali', etc.
    
    -- Cultural Information
    description TEXT NOT NULL,
    historical_context TEXT,
    philosophical_background TEXT,
    traditional_practices TEXT[],
    
    -- Visual & Audio Assets
    color_palette JSONB NOT NULL DEFAULT '{
        "primary": "#8B4513",
        "secondary": "#DAA520",
        "accent": "#FFD700",
        "background": "#FFF8DC"
    }',
    
    music_assets TEXT[], -- Array of audio file URLs
    guided_meditation_scripts JSONB, -- Structured meditation scripts
    background_images TEXT[], -- Traditional artwork/photos
    
    -- Meditation Characteristics
    typical_duration_range JSONB DEFAULT '{
        "minimum": 5,
        "maximum": 60,
        "recommended": 15
    }',
    
    difficulty_progression JSONB DEFAULT '{
        "beginner": ["breathing", "awareness"],
        "intermediate": ["mindfulness", "concentration"],
        "advanced": ["insight", "wisdom"]
    }',
    
    -- Cultural Respect & Attribution
    cultural_advisors TEXT[], -- Names of cultural consultants
    source_attribution TEXT,
    cultural_notes TEXT, -- Important cultural considerations
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    requires_cultural_intro BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial cultural traditions
INSERT INTO cultural_traditions (name, display_name, description, color_palette) VALUES
('javanese', 'Meditasi Jawa', 'Praktik meditasi tradisional Jawa yang menekankan keseimbangan batin dan harmoni dengan alam', 
 '{"primary": "#8B4513", "secondary": "#DAA520", "accent": "#FFD700", "background": "#FFF8DC"}'),
('balinese', 'Meditasi Bali', 'Meditasi Hindu-Bali yang mengintegrasikan ritual spiritual dan filosofi Tri Hita Karana',
 '{"primary": "#FF6B35", "secondary": "#F7931E", "accent": "#FFD700", "background": "#FFF5EE"}'),
('sundanese', 'Meditasi Sunda', 'Praktik meditasi Sunda yang menekankan kedamaian jiwa dan kedekatan dengan alam',
 '{"primary": "#2E8B57", "secondary": "#90EE90", "accent": "#98FB98", "background": "#F0FFF0"}'),
('minang', 'Meditasi Minang', 'Meditasi tradisional Minangkabau yang mengintegrasikan nilai-nilai adat dan filosofi alam',
 '{"primary": "#800020", "secondary": "#FFD700", "accent": "#FFA500", "background": "#FFFAF0"}');
```

### Meditation Sessions Table

```sql
-- Meditation Sessions
CREATE TABLE meditation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    tradition_id UUID REFERENCES cultural_traditions(id),
    
    -- Session Details
    session_type session_type_enum NOT NULL,
    planned_duration INTEGER NOT NULL, -- in minutes
    actual_duration INTEGER, -- actual time spent (may differ from planned)
    
    -- Session Configuration
    session_config JSONB DEFAULT '{
        "musicEnabled": true,
        "guidanceEnabled": true,
        "backgroundSounds": false,
        "customInstructions": ""
    }',
    
    -- Cultural Elements Used
    cultural_elements JSONB DEFAULT '{
        "music": null,
        "guidance": null,
        "visualTheme": null,
        "traditionalElements": []
    }',
    
    -- Session Outcome
    completion_status completion_status_enum DEFAULT 'started',
    completion_percentage INTEGER DEFAULT 0, -- 0-100
    
    -- User Experience
    mood_before mood_enum,
    mood_after mood_enum,
    session_rating INTEGER CHECK (session_rating >= 1 AND session_rating <= 5),
    session_notes TEXT,
    
    -- Insights & Reflections
    key_insights TEXT[],
    challenges_faced TEXT[],
    positive_aspects TEXT[],
    
    -- Technical Metrics
    interruptions_count INTEGER DEFAULT 0,
    pause_duration INTEGER DEFAULT 0, -- total pause time in seconds
    device_type TEXT, -- 'mobile', 'desktop', 'tablet'
    
    -- Timestamps
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create enums for session types
CREATE TYPE session_type_enum AS ENUM (
    'guided_meditation',
    'breathing_exercise',
    'mindfulness_practice',
    'cultural_meditation',
    'free_meditation',
    'walking_meditation'
);

CREATE TYPE completion_status_enum AS ENUM ('started', 'paused', 'completed', 'abandoned');
CREATE TYPE mood_enum AS ENUM ('very_negative', 'negative', 'neutral', 'positive', 'very_positive');

-- Indexes for performance
CREATE INDEX idx_sessions_user_id ON meditation_sessions (user_id);
CREATE INDEX idx_sessions_tradition ON meditation_sessions (tradition_id);
CREATE INDEX idx_sessions_completed_at ON meditation_sessions (completed_at);
CREATE INDEX idx_sessions_type ON meditation_sessions (session_type);
```

### User Progress Table

```sql
-- User Progress Tracking
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Overall Statistics
    total_sessions INTEGER DEFAULT 0,
    total_minutes INTEGER DEFAULT 0,
    average_session_duration DECIMAL(5,2) DEFAULT 0,
    
    -- Streaks
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_session_date DATE,
    
    -- Cultural Progression
    cultural_mastery JSONB DEFAULT '{
        "javanese": {"level": 0, "completedSessions": 0, "masteryPoints": 0},
        "balinese": {"level": 0, "completedSessions": 0, "masteryPoints": 0},
        "sundanese": {"level": 0, "completedSessions": 0, "masteryPoints": 0},
        "minang": {"level": 0, "completedSessions": 0, "masteryPoints": 0}
    }',
    
    -- Achievements
    earned_achievements UUID[],
    achievement_points INTEGER DEFAULT 0,
    
    -- Weekly/Monthly Progress
    weekly_stats JSONB DEFAULT '{
        "sessionsThisWeek": 0,
        "minutesThisWeek": 0,
        "weekStartDate": null
    }',
    
    monthly_stats JSONB DEFAULT '{
        "sessionsThisMonth": 0,
        "minutesThisMonth": 0,
        "monthStartDate": null
    }',
    
    -- Personal Bests
    personal_bests JSONB DEFAULT '{
        "longestSession": 0,
        "mostSessionsInDay": 0,
        "perfectWeeks": 0,
        "culturalMilestones": []
    }',
    
    -- Insights & Patterns
    meditation_insights JSONB DEFAULT '{
        "preferredTimes": [],
        "mostEffectiveDurations": [],
        "culturalPreferences": {},
        "improvementAreas": []
    }',
    
    -- Metadata
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique constraint and indexes
ALTER TABLE user_progress ADD CONSTRAINT user_progress_user_id_unique UNIQUE (user_id);
CREATE INDEX idx_user_progress_streak ON user_progress (current_streak);
CREATE INDEX idx_user_progress_total ON user_progress (total_sessions, total_minutes);
```

### Cultural Content Table

```sql
-- Cultural Content (Meditation content with cultural context)
CREATE TABLE cultural_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tradition_id UUID NOT NULL REFERENCES cultural_traditions(id),
    
    -- Content Information
    title TEXT NOT NULL,
    description TEXT,
    content_type content_type_enum NOT NULL,
    
    -- Content Data
    content_data JSONB NOT NULL, -- Structured content based on type
    audio_url TEXT,
    video_url TEXT,
    image_urls TEXT[],
    
    -- Cultural Context
    cultural_significance TEXT,
    historical_background TEXT,
    traditional_usage TEXT,
    cultural_guidelines TEXT[], -- Usage guidelines to ensure respect
    
    -- Content Characteristics
    difficulty_level meditation_level_enum DEFAULT 'beginner',
    recommended_duration INTEGER, -- in minutes
    prerequisites TEXT[],
    
    -- Localization
    language_variants JSONB DEFAULT '{
        "indonesia": {"title": "", "description": "", "content": ""},
        "english": {"title": "", "description": "", "content": ""}
    }',
    
    -- Usage & Analytics
    usage_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    
    -- Status & Metadata
    is_active BOOLEAN DEFAULT true,
    requires_cultural_intro BOOLEAN DEFAULT true,
    content_version INTEGER DEFAULT 1,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE content_type_enum AS ENUM (
    'guided_meditation',
    'breathing_exercise',
    'cultural_story',
    'philosophical_teaching',
    'traditional_music',
    'meditation_instruction',
    'cultural_background'
);

-- Indexes for content discovery
CREATE INDEX idx_cultural_content_tradition ON cultural_content (tradition_id);
CREATE INDEX idx_cultural_content_type ON cultural_content (content_type);
CREATE INDEX idx_cultural_content_difficulty ON cultural_content (difficulty_level);
CREATE INDEX idx_cultural_content_rating ON cultural_content (average_rating);
```

### Achievement System

```sql
-- Achievement Types
CREATE TABLE achievement_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- Achievement Criteria
    achievement_criteria JSONB NOT NULL, -- Structured criteria for earning
    category achievement_category_enum NOT NULL,
    difficulty_tier INTEGER DEFAULT 1, -- 1-5, 1 being easiest
    
    -- Cultural Integration
    cultural_significance TEXT,
    related_tradition UUID REFERENCES cultural_traditions(id),
    
    -- Rewards
    points_awarded INTEGER DEFAULT 0,
    unlock_content UUID[], -- Content unlocked by this achievement
    
    -- Visual Assets
    icon_url TEXT,
    badge_url TEXT,
    celebration_animation TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_hidden BOOLEAN DEFAULT false, -- Hidden until criteria are met
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE achievement_category_enum AS ENUM (
    'consistency', 'duration', 'cultural_mastery', 'variety', 
    'mindfulness', 'community', 'personal_growth', 'special_events'
);

-- User Achievements (earned achievements)
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    achievement_type_id UUID NOT NULL REFERENCES achievement_types(id),
    
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    progress_data JSONB, -- Additional data about how achievement was earned
    
    UNIQUE(user_id, achievement_type_id)
);

-- Sample achievement data
INSERT INTO achievement_types (name, display_name, description, achievement_criteria, category, points_awarded) VALUES
('first_session', 'Langkah Pertama', 'Menyelesaikan sesi meditasi pertama', 
 '{"type": "session_count", "target": 1}', 'consistency', 10),
('week_warrior', 'Pejuang Mingguan', 'Bermeditasi setiap hari selama seminggu', 
 '{"type": "streak", "target": 7}', 'consistency', 50),
('cultural_explorer', 'Penjelajah Budaya', 'Mencoba semua tradisi meditasi Indonesia', 
 '{"type": "traditions_tried", "target": 4}', 'cultural_mastery', 100),
('mindful_hour', 'Satu Jam Penuh Kesadaran', 'Meditasi selama 60 menit dalam satu sesi', 
 '{"type": "single_session_duration", "target": 60}', 'duration', 75);
```

## 🔄 Database Functions & Procedures

### Progress Update Function

```sql
-- Function to update user progress after each session
CREATE OR REPLACE FUNCTION update_user_progress()
RETURNS trigger AS $$
DECLARE
    session_date DATE;
    current_progress user_progress%ROWTYPE;
    streak_broken BOOLEAN DEFAULT FALSE;
BEGIN
    -- Only process completed sessions
    IF NEW.completion_status != 'completed' THEN
        RETURN NEW;
    END IF;
    
    session_date := NEW.completed_at::DATE;
    
    -- Get current progress
    SELECT * INTO current_progress 
    FROM user_progress 
    WHERE user_id = NEW.user_id;
    
    -- Create progress record if it doesn't exist
    IF current_progress IS NULL THEN
        INSERT INTO user_progress (user_id, total_sessions, total_minutes, last_session_date, current_streak)
        VALUES (NEW.user_id, 1, NEW.actual_duration, session_date, 1);
        RETURN NEW;
    END IF;
    
    -- Calculate streak
    IF current_progress.last_session_date IS NULL THEN
        -- First session
        streak_broken := FALSE;
    ELSIF session_date = current_progress.last_session_date THEN
        -- Same day, maintain streak
        streak_broken := FALSE;
    ELSIF session_date = current_progress.last_session_date + INTERVAL '1 day' THEN
        -- Consecutive day, extend streak
        streak_broken := FALSE;
    ELSE
        -- Streak broken
        streak_broken := TRUE;
    END IF;
    
    -- Update progress
    UPDATE user_progress SET
        total_sessions = total_sessions + 1,
        total_minutes = total_minutes + NEW.actual_duration,
        average_session_duration = (total_minutes + NEW.actual_duration) / (total_sessions + 1),
        current_streak = CASE 
            WHEN streak_broken THEN 1
            WHEN session_date != last_session_date THEN current_streak + 1
            ELSE current_streak
        END,
        longest_streak = GREATEST(longest_streak, 
            CASE 
                WHEN streak_broken THEN 1
                WHEN session_date != last_session_date THEN current_streak + 1
                ELSE current_streak
            END),
        last_session_date = session_date,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    -- Update cultural mastery if this was a cultural session
    IF NEW.tradition_id IS NOT NULL THEN
        PERFORM update_cultural_mastery(NEW.user_id, NEW.tradition_id, NEW.actual_duration);
    END IF;
    
    -- Check for new achievements
    PERFORM check_achievements(NEW.user_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call progress update function
CREATE TRIGGER session_completed_trigger
    AFTER UPDATE ON meditation_sessions
    FOR EACH ROW
    WHEN (NEW.completion_status = 'completed' AND OLD.completion_status != 'completed')
    EXECUTE FUNCTION update_user_progress();
```

### Cultural Mastery Update Function

```sql
-- Function to update cultural mastery
CREATE OR REPLACE FUNCTION update_cultural_mastery(
    p_user_id UUID,
    p_tradition_id UUID,
    p_duration INTEGER
) RETURNS void AS $$
DECLARE
    tradition_name TEXT;
    current_mastery JSONB;
    updated_mastery JSONB;
    mastery_points INTEGER;
    new_level INTEGER;
BEGIN
    -- Get tradition name
    SELECT name INTO tradition_name 
    FROM cultural_traditions 
    WHERE id = p_tradition_id;
    
    -- Calculate mastery points (duration in minutes = points)
    mastery_points := p_duration;
    
    -- Get current cultural mastery
    SELECT cultural_mastery INTO current_mastery
    FROM user_progress
    WHERE user_id = p_user_id;
    
    -- Update mastery for this tradition
    updated_mastery := jsonb_set(
        current_mastery,
        ('{' || tradition_name || ',completedSessions}')::TEXT[],
        to_jsonb(COALESCE((current_mastery->>tradition_name->>'completedSessions')::INTEGER, 0) + 1)
    );
    
    updated_mastery := jsonb_set(
        updated_mastery,
        ('{' || tradition_name || ',masteryPoints}')::TEXT[],
        to_jsonb(COALESCE((current_mastery->>tradition_name->>'masteryPoints')::INTEGER, 0) + mastery_points)
    );
    
    -- Calculate new level (every 100 points = 1 level)
    new_level := ((COALESCE((current_mastery->>tradition_name->>'masteryPoints')::INTEGER, 0) + mastery_points) / 100)::INTEGER;
    
    updated_mastery := jsonb_set(
        updated_mastery,
        ('{' || tradition_name || ',level}')::TEXT[],
        to_jsonb(new_level)
    );
    
    -- Update user progress
    UPDATE user_progress 
    SET cultural_mastery = updated_mastery,
        updated_at = NOW()
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;
```

### Achievement Checking Function

```sql
-- Function to check and award achievements
CREATE OR REPLACE FUNCTION check_achievements(p_user_id UUID) RETURNS void AS $$
DECLARE
    achievement_record RECORD;
    user_stats RECORD;
    criteria JSONB;
    target_value INTEGER;
    current_value INTEGER;
BEGIN
    -- Get user statistics
    SELECT 
        up.total_sessions,
        up.total_minutes,
        up.current_streak,
        up.longest_streak,
        up.cultural_mastery,
        (SELECT COUNT(DISTINCT tradition_id) FROM meditation_sessions WHERE user_id = p_user_id) as traditions_tried,
        (SELECT MAX(actual_duration) FROM meditation_sessions WHERE user_id = p_user_id) as longest_session
    INTO user_stats
    FROM user_progress up
    WHERE up.user_id = p_user_id;
    
    -- Loop through all active achievements
    FOR achievement_record IN 
        SELECT * FROM achievement_types WHERE is_active = TRUE
    LOOP
        -- Skip if user already has this achievement
        IF EXISTS (
            SELECT 1 FROM user_achievements 
            WHERE user_id = p_user_id AND achievement_type_id = achievement_record.id
        ) THEN
            CONTINUE;
        END IF;
        
        criteria := achievement_record.achievement_criteria;
        target_value := (criteria->>'target')::INTEGER;
        
        -- Check different achievement types
        CASE criteria->>'type'
            WHEN 'session_count' THEN
                current_value := user_stats.total_sessions;
            WHEN 'streak' THEN
                current_value := user_stats.current_streak;
            WHEN 'traditions_tried' THEN
                current_value := user_stats.traditions_tried;
            WHEN 'single_session_duration' THEN
                current_value := user_stats.longest_session;
            WHEN 'total_minutes' THEN
                current_value := user_stats.total_minutes;
            ELSE
                CONTINUE;
        END CASE;
        
        -- Award achievement if criteria met
        IF current_value >= target_value THEN
            INSERT INTO user_achievements (user_id, achievement_type_id, progress_data)
            VALUES (p_user_id, achievement_record.id, 
                    jsonb_build_object(
                        'achieved_value', current_value,
                        'target_value', target_value,
                        'achievement_date', NOW()
                    ));
            
            -- Update achievement points
            UPDATE user_progress 
            SET achievement_points = achievement_points + achievement_record.points_awarded
            WHERE user_id = p_user_id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
```

## 📊 Analytics & Reporting Views

### User Progress Summary View

```sql
-- Comprehensive user progress view
CREATE VIEW user_progress_summary AS
SELECT 
    up.user_id,
    pr.full_name,
    pr.email,
    pr.cultural_preferences->>'preferredTradition' as preferred_tradition,
    pr.meditation_level,
    
    -- Session Statistics
    up.total_sessions,
    up.total_minutes,
    up.average_session_duration,
    up.current_streak,
    up.longest_streak,
    
    -- Recent Activity
    up.last_session_date,
    DATE_PART('day', NOW() - up.last_session_date) as days_since_last_session,
    
    -- Cultural Mastery
    up.cultural_mastery,
    (up.cultural_mastery->>'javanese'->>'level')::INTEGER as javanese_level,
    (up.cultural_mastery->>'balinese'->>'level')::INTEGER as balinese_level,
    (up.cultural_mastery->>'sundanese'->>'level')::INTEGER as sundanese_level,
    (up.cultural_mastery->>'minang'->>'level')::INTEGER as minang_level,
    
    -- Achievements
    up.achievement_points,
    (SELECT COUNT(*) FROM user_achievements WHERE user_id = up.user_id) as total_achievements,
    
    -- Engagement Level
    CASE 
        WHEN up.total_sessions >= 100 THEN 'expert'
        WHEN up.total_sessions >= 50 THEN 'advanced'
        WHEN up.total_sessions >= 20 THEN 'intermediate'
        WHEN up.total_sessions >= 5 THEN 'active'
        ELSE 'beginner'
    END as engagement_level,
    
    up.updated_at
FROM user_progress up
JOIN user_profiles pr ON up.user_id = pr.id;
```

### Session Analytics View

```sql
-- Session analytics for insights
CREATE VIEW session_analytics AS
SELECT 
    ms.id,
    ms.user_id,
    pr.cultural_preferences->>'preferredTradition' as user_preferred_tradition,
    ct.name as tradition_used,
    ms.session_type,
    ms.planned_duration,
    ms.actual_duration,
    ms.completion_status,
    ms.completion_percentage,
    
    -- Time Analysis
    EXTRACT(HOUR FROM ms.started_at) as session_hour,
    EXTRACT(DOW FROM ms.started_at) as day_of_week,
    DATE(ms.started_at) as session_date,
    
    -- User Experience
    ms.mood_before,
    ms.mood_after,
    CASE 
        WHEN ms.mood_before IS NOT NULL AND ms.mood_after IS NOT NULL THEN
            (CASE ms.mood_after
                WHEN 'very_positive' THEN 5
                WHEN 'positive' THEN 4
                WHEN 'neutral' THEN 3
                WHEN 'negative' THEN 2
                WHEN 'very_negative' THEN 1
            END) - 
            (CASE ms.mood_before
                WHEN 'very_positive' THEN 5
                WHEN 'positive' THEN 4
                WHEN 'neutral' THEN 3
                WHEN 'negative' THEN 2
                WHEN 'very_negative' THEN 1
            END)
    END as mood_improvement,
    
    ms.session_rating,
    ms.interruptions_count,
    
    -- Engagement Metrics
    CASE 
        WHEN ms.completion_percentage = 100 THEN 'completed'
        WHEN ms.completion_percentage >= 80 THEN 'mostly_completed'
        WHEN ms.completion_percentage >= 50 THEN 'partially_completed'
        ELSE 'minimal_engagement'
    END as engagement_level,
    
    ms.started_at,
    ms.completed_at
FROM meditation_sessions ms
JOIN user_profiles pr ON ms.user_id = pr.id
LEFT JOIN cultural_traditions ct ON ms.tradition_id = ct.id;
```

## 🔄 Database Maintenance & Optimization

### Regular Maintenance Procedures

```sql
-- Procedure to update weekly/monthly statistics
CREATE OR REPLACE FUNCTION update_periodic_stats() RETURNS void AS $$
BEGIN
    -- Update weekly stats for all users
    UPDATE user_progress 
    SET weekly_stats = jsonb_build_object(
        'sessionsThisWeek', (
            SELECT COUNT(*) FROM meditation_sessions 
            WHERE user_id = user_progress.user_id 
            AND completed_at >= date_trunc('week', NOW())
            AND completion_status = 'completed'
        ),
        'minutesThisWeek', (
            SELECT COALESCE(SUM(actual_duration), 0) FROM meditation_sessions 
            WHERE user_id = user_progress.user_id 
            AND completed_at >= date_trunc('week', NOW())
            AND completion_status = 'completed'
        ),
        'weekStartDate', date_trunc('week', NOW())
    );
    
    -- Update monthly stats for all users
    UPDATE user_progress 
    SET monthly_stats = jsonb_build_object(
        'sessionsThisMonth', (
            SELECT COUNT(*) FROM meditation_sessions 
            WHERE user_id = user_progress.user_id 
            AND completed_at >= date_trunc('month', NOW())
            AND completion_status = 'completed'
        ),
        'minutesThisMonth', (
            SELECT COALESCE(SUM(actual_duration), 0) FROM meditation_sessions 
            WHERE user_id = user_progress.user_id 
            AND completed_at >= date_trunc('month', NOW())
            AND completion_status = 'completed'
        ),
        'monthStartDate', date_trunc('month', NOW())
    );
END;
$$ LANGUAGE plpgsql;

-- Schedule this to run daily
-- In production, this would be set up as a Supabase edge function or cron job
```

### Performance Optimization

```sql
-- Additional indexes for query optimization
CREATE INDEX CONCURRENTLY idx_sessions_user_date ON meditation_sessions (user_id, started_at);
CREATE INDEX CONCURRENTLY idx_sessions_completion_status ON meditation_sessions (completion_status, completed_at);
CREATE INDEX CONCURRENTLY idx_cultural_content_active ON cultural_content (is_active, tradition_id, difficulty_level);
CREATE INDEX CONCURRENTLY idx_user_profiles_prefs ON user_profiles USING GIN (cultural_preferences);

-- Partial indexes for common queries
CREATE INDEX CONCURRENTLY idx_active_sessions ON meditation_sessions (user_id, started_at) 
    WHERE completion_status IN ('started', 'paused');
CREATE INDEX CONCURRENTLY idx_completed_sessions_recent ON meditation_sessions (user_id, completed_at) 
    WHERE completion_status = 'completed' AND completed_at >= NOW() - INTERVAL '30 days';
```

## 🚨 Data Privacy & Security

### Row Level Security Policies

```sql
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- User can only access their own data
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own sessions" ON meditation_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own progress" ON user_progress
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own achievements" ON user_achievements
    FOR SELECT USING (auth.uid() = user_id);

-- Cultural content is readable by all authenticated users
CREATE POLICY "Authenticated users can view cultural content" ON cultural_content
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view cultural traditions" ON cultural_traditions
    FOR SELECT USING (auth.role() = 'authenticated');
```

### Data Backup & Recovery

```sql
-- Function to create user data export (GDPR compliance)
CREATE OR REPLACE FUNCTION export_user_data(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    user_export JSONB;
BEGIN
    SELECT jsonb_build_object(
        'profile', (SELECT row_to_json(up.*) FROM user_profiles up WHERE id = p_user_id),
        'progress', (SELECT row_to_json(prog.*) FROM user_progress prog WHERE user_id = p_user_id),
        'sessions', (
            SELECT jsonb_agg(row_to_json(ms.*)) 
            FROM meditation_sessions ms 
            WHERE user_id = p_user_id
        ),
        'achievements', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'achievement', at.display_name,
                    'earned_at', ua.earned_at,
                    'description', at.description
                )
            )
            FROM user_achievements ua
            JOIN achievement_types at ON ua.achievement_type_id = at.id
            WHERE ua.user_id = p_user_id
        ),
        'export_date', NOW()
    ) INTO user_export;
    
    RETURN user_export;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 📈 Monitoring & Analytics

### System Health Monitoring

```sql
-- View for database health monitoring
CREATE VIEW db_health_metrics AS
SELECT 
    -- User engagement
    (SELECT COUNT(*) FROM user_profiles WHERE last_active_at >= NOW() - INTERVAL '7 days') as active_users_week,
    (SELECT COUNT(*) FROM user_profiles WHERE last_active_at >= NOW() - INTERVAL '30 days') as active_users_month,
    (SELECT COUNT(*) FROM user_profiles) as total_users,
    
    -- Session metrics
    (SELECT COUNT(*) FROM meditation_sessions WHERE started_at >= NOW() - INTERVAL '24 hours') as sessions_today,
    (SELECT AVG(actual_duration) FROM meditation_sessions WHERE completed_at >= NOW() - INTERVAL '7 days') as avg_session_duration,
    (SELECT COUNT(*) FROM meditation_sessions WHERE completion_status = 'completed' AND completed_at >= NOW() - INTERVAL '7 days') as completed_sessions_week,
    
    -- Cultural engagement
    (SELECT tradition_id, COUNT(*) as sessions_count 
     FROM meditation_sessions 
     WHERE started_at >= NOW() - INTERVAL '30 days' 
     GROUP BY tradition_id 
     ORDER BY sessions_count DESC 
     LIMIT 1) as most_popular_tradition,
    
    -- System performance
    pg_database_size(current_database()) as db_size_bytes,
    (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active') as active_connections;
```

---

## 🚀 Implementation Checklist

- [x] Core table schemas designed
- [x] User profile and cultural preferences
- [x] Meditation session tracking
- [x] Progress and achievement system
- [x] Cultural content management
- [x] Row Level Security policies
- [x] Database functions and triggers
- [x] Analytics views and reporting
- [ ] Data migration scripts
- [ ] Performance monitoring setup
- [ ] Backup and recovery procedures
- [ ] GDPR compliance tools

---

*Database ini dirancang untuk mendukung pengalaman meditasi yang kaya secara budaya sambil menjaga performa, keamanan, dan privasi pengguna.*