# 🗄️ Supabase Complete Setup Guide
*Comprehensive setup for Sembalun Mind meditation platform*

## 📋 Overview

This guide provides complete setup instructions for the Supabase backend that powers Sembalun Mind's meditation platform. The database supports Indonesian cultural meditation practices, advanced journaling, mood tracking, achievements, and user progress analytics.

### What You'll Set Up
- ✅ **Authentication**: Email/password + OAuth (Google, Apple) + Guest mode
- ✅ **Database**: 8 core tables with Indonesian cultural data structures  
- ✅ **Storage**: Avatar and audio file management with CDN
- ✅ **Real-time**: Live synchronization across devices
- ✅ **Security**: Row Level Security (RLS) with user isolation
- ✅ **Performance**: Optimized for Indonesian mobile networks

---

## 🚀 Quick Start (15 minutes)

### Step 1: Create Supabase Project

1. **Go to [Supabase Dashboard](https://supabase.com/dashboard)**
2. **Click "New project"**
3. **Configure project**:
   - **Name**: `sembalun-mind-meditation`
   - **Database Password**: Create strong password (save securely!)
   - **Region**: `Southeast Asia (Singapore)` (best for Indonesia)
   - **Plan**: Free tier is perfect for development

4. **Click "Create new project"** and wait 2-3 minutes

### Step 2: Get API Keys

1. **Go to Settings → API**
2. **Copy these values**:
```env
Project URL: https://xxxxx.supabase.co
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Configure Environment

1. **Copy `.env.example` to `.env.local`**:
```bash
copy .env.example .env.local
```

2. **Update `.env.local`**:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 4: Run Database Setup

1. **Go to SQL Editor in Supabase dashboard**
2. **Copy content from `supabase/complete-schema.sql`**
3. **Paste and click "Run"**
4. **Wait for "Success. No rows returned" message**

### Step 5: Test Setup

```bash
npm run test:supabase
```

**Success!** Your Supabase backend is now ready.

---

## 🗄️ Database Schema Details

### Core Tables Structure

#### **users** - Extended User Profiles
```sql
- id (UUID, Primary Key)
- email (Text, Unique) 
- display_name (Text)
- avatar_url (Text)
- preferences (JSONB) - Cultural settings, meditation preferences
- progress (JSONB) - Meditation stats, achievements, streaks
- cultural_profile (JSONB) - Regional preferences, spiritual practices
- created_at, updated_at (Timestamps)
```

#### **meditation_sessions** - Session Tracking
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → users)
- type (Text) - 'breathing', 'guided', 'silent', 'cultural'
- duration_minutes (Integer)
- technique (Text) - Specific technique used
- cultural_context (JSONB) - Regional practice, wisdom quotes
- mood_before, mood_after (Text)
- location (Text) - Optional location tracking
- notes (Text) - User reflections
- quality_rating (Integer 1-5)
- completed_at (Timestamp)
```

#### **journal_entries** - Advanced Journaling
```sql
- id (UUID, Primary Key) 
- user_id (UUID, Foreign Key → users)
- type (Text) - 'meditation', 'gratitude', 'reflection', 'cultural'
- title (Text)
- content (Text)
- mood (JSONB) - Comprehensive emotional state
- cultural_context (JSONB) - Regional wisdom, practices
- tags (Text Array)
- word_count (Integer)
- reading_time (Integer)
- privacy (Text) - 'private', 'shared', 'community' 
- insights (JSONB) - AI-generated insights
- favorited (Boolean)
- created_at, updated_at (Timestamps)
```

#### **achievements** - Indonesian Cultural Achievements
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → users)
- achievement_type (Text) - Cultural, spiritual, consistency achievements
- title (Text) - Indonesian/English titles
- description (Text)
- cultural_origin (Text) - 'java', 'bali', 'sembalun', 'sumatra'
- icon_url (Text)
- earned_at (Timestamp)
- progress_data (JSONB)
```

#### **courses** - Meditation Course Library
```sql
- id (UUID, Primary Key)
- title, description (Text)
- category (Text) - 'beginner', 'intermediate', 'advanced', 'cultural'
- cultural_region (Text) - Regional specialization
- difficulty (Text)
- duration_minutes (Integer)
- instructor (Text)
- audio_url (Text)
- transcript (Text)
- is_premium (Boolean)
- order_index (Integer)
- tags (Text Array)
```

#### **moods** - Emotional Intelligence Tracking
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → users)
- primary_emotion (Text)
- intensity (Integer 1-10)
- energy_level (Integer 1-10)
- peacefulness_level (Integer 1-10)
- gratitude_level (Integer 1-10)
- clarity_level (Integer 1-10)
- stress_level (Integer 1-10)
- cultural_emotions (JSONB) - Indonesian emotional concepts
- context (Text) - What triggered this mood
- location (Text)
- weather (JSONB)
- recorded_at (Timestamp)
```

#### **user_progress** - Analytics & Insights
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → users)
- total_sessions (Integer)
- total_minutes (Integer)
- current_streak (Integer)
- longest_streak (Integer)
- favorite_techniques (Text Array)
- progress_milestones (JSONB)
- cultural_engagement (JSONB) - Regional practice stats
- mood_trends (JSONB)
- personal_growth_metrics (JSONB)
- last_updated (Timestamp)
```

#### **notifications** - Smart Notification System
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → users)
- type (Text) - 'reminder', 'achievement', 'insight', 'cultural'
- title, message (Text)
- cultural_context (JSONB)
- scheduled_for (Timestamp)
- sent_at (Timestamp)
- read_at (Timestamp)
- action_data (JSONB)
```

---

## 🔐 Security Configuration

### Row Level Security (RLS) Policies

**All tables have RLS enabled** with these security principles:

#### User Data Isolation
```sql
-- Users can only access their own data
CREATE POLICY "Users can view own data" ON table_name
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data" ON table_name
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data" ON table_name  
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own data" ON table_name
  FOR DELETE USING (auth.uid() = user_id);
```

#### Guest Mode Support
```sql
-- Allow anonymous access for guest users
CREATE POLICY "Allow anonymous meditation sessions" ON meditation_sessions
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
```

#### Cultural Content Access
```sql
-- Public access to cultural content
CREATE POLICY "Cultural content is publicly accessible" ON courses
  FOR SELECT USING (true);
```

### Authentication Configuration

#### Redirect URLs Setup
```
Site URL: http://localhost:5173
Additional Redirect URLs:
- http://localhost:5173/auth/callback
- https://your-app-name.vercel.app/auth/callback
```

#### OAuth Providers (Optional)
- **Google**: Configure Google OAuth for quick sign-in
- **Apple**: iOS/macOS native authentication

---

## 📁 Storage Configuration

### Storage Buckets

#### **avatars** Bucket
- **Public**: Yes
- **File size limit**: 2MB  
- **Allowed types**: image/*
- **Folder structure**: `{user_id}/avatar.{ext}`

#### **audio** Bucket  
- **Public**: Yes
- **File size limit**: 50MB
- **Allowed types**: audio/*
- **Folder structure**: `meditation/{category}/{filename}.{ext}`

#### **cultural** Bucket
- **Public**: Yes
- **File size limit**: 10MB
- **Allowed types**: image/*, audio/*
- **Folder structure**: `{region}/{type}/{filename}.{ext}`

### Storage Policies

```sql
-- Avatar policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Audio content policies  
CREATE POLICY "Audio files are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'audio');

CREATE POLICY "Authenticated users can upload audio" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'audio' 
    AND auth.role() = 'authenticated'
  );

-- Cultural content policies
CREATE POLICY "Cultural content is publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'cultural');
```

---

## 🔄 Real-time Features

### Real-time Subscriptions

The app uses Supabase real-time for:

#### **Live Meditation Sessions**
```typescript
// Subscribe to session updates
const subscription = supabase
  .channel('meditation-sessions')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'meditation_sessions' },
    (payload) => {
      // Handle new session
    }
  )
  .subscribe();
```

#### **Community Features**
```typescript  
// Subscribe to community journal entries
const communitySubscription = supabase
  .channel('community-journal')
  .on('postgres_changes',
    { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'journal_entries',
      filter: 'privacy=eq.community'
    },
    (payload) => {
      // Handle community updates
    }
  )
  .subscribe();
```

#### **Achievement Notifications**
```typescript
// Subscribe to new achievements
const achievementSubscription = supabase
  .channel('user-achievements')
  .on('postgres_changes',
    {
      event: 'INSERT',
      schema: 'public', 
      table: 'achievements',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      // Celebrate new achievement
    }
  )
  .subscribe();
```

---

## 🚀 Performance Optimizations

### Database Indexing

```sql
-- Optimize user queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_display_name ON users(display_name);

-- Optimize session queries
CREATE INDEX idx_meditation_sessions_user_id ON meditation_sessions(user_id);
CREATE INDEX idx_meditation_sessions_completed_at ON meditation_sessions(completed_at DESC);
CREATE INDEX idx_meditation_sessions_type ON meditation_sessions(type);

-- Optimize journal queries
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_created_at ON journal_entries(created_at DESC);
CREATE INDEX idx_journal_entries_type ON journal_entries(type);
CREATE INDEX idx_journal_entries_tags ON journal_entries USING GIN(tags);

-- Optimize mood queries
CREATE INDEX idx_moods_user_id ON moods(user_id);
CREATE INDEX idx_moods_recorded_at ON moods(recorded_at DESC);

-- Optimize achievement queries  
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_achievements_earned_at ON achievements(earned_at DESC);
```

### Connection Pooling

```typescript
// Optimize Supabase client for Indonesian networks
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!, 
  {
    db: {
      schema: 'public',
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    },
    global: {
      headers: {
        'x-client-info': 'sembalun-mind@2.1.0'
      }
    }
  }
);
```

---

## 🔧 Troubleshooting Guide

### Common Issues & Solutions

#### **❌ "Invalid API key" Error**
**Symptoms**: Cannot connect to Supabase
**Solutions**:
- ✅ Check `.env.local` has correct `VITE_SUPABASE_ANON_KEY`
- ✅ Restart dev server after changing environment variables
- ✅ Verify key starts with `eyJ`
- ✅ No quotes around keys in `.env.local`

#### **❌ "Failed to fetch" Error**
**Symptoms**: Network requests failing
**Solutions**:
- ✅ Check `VITE_SUPABASE_URL` is correct (no trailing slash)
- ✅ Format: `https://xxxxx.supabase.co`
- ✅ Verify project is not paused (free tier auto-pauses)
- ✅ Check Indonesian network connectivity

#### **❌ Authentication Issues**
**Symptoms**: Cannot login/register
**Solutions**:
- ✅ Check redirect URLs in Supabase Auth settings
- ✅ Verify email confirmation (check spam folder)
- ✅ Test with different email provider
- ✅ Clear browser cache and localStorage

#### **❌ Database Permission Errors**
**Symptoms**: Cannot save data
**Solutions**:
- ✅ Verify RLS policies are created correctly
- ✅ Check user is authenticated before database operations
- ✅ Review SQL Editor for policy errors
- ✅ Test with different user account

#### **❌ Storage Upload Failures**
**Symptoms**: Cannot upload avatars/audio
**Solutions**:
- ✅ Check file size limits (2MB for avatars, 50MB for audio)
- ✅ Verify file types are allowed
- ✅ Check storage policies allow uploads
- ✅ Test with different file formats

---

## 🧪 Testing & Validation

### Database Testing

#### **Quick Test Script**
```bash
npm run test:supabase
```

#### **Manual Testing Checklist**
- [ ] User registration works
- [ ] Email confirmation received
- [ ] Login/logout functions
- [ ] Profile updates save correctly
- [ ] Meditation sessions record properly
- [ ] Journal entries create and update
- [ ] Mood tracking saves data
- [ ] Achievements trigger correctly
- [ ] File uploads work (avatars, audio)
- [ ] Real-time subscriptions function

#### **Data Validation**
1. **Check Supabase Dashboard → Authentication**
   - Users appear in auth.users table
   - Email confirmations processed

2. **Check Database → Table Editor**
   - `users` table has profile data
   - `meditation_sessions` has session records
   - `journal_entries` has journal data
   - `moods` has emotional tracking data

3. **Check Storage → Buckets**
   - Avatar images uploaded to `avatars/`
   - Audio files in `audio/` bucket

---

## 🌐 Production Deployment

### Environment Variables for Production

#### **Vercel Environment Variables**
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-anon-key
```

#### **Additional Production URLs**
Update Auth settings with production URLs:
```
https://your-app-name.vercel.app/auth/callback
https://sembalun-mind.vercel.app/auth/callback
```

### Production Security Checklist

- [ ] RLS enabled on all tables
- [ ] Service role key secured (not in frontend)
- [ ] Auth redirect URLs updated
- [ ] Storage policies configured
- [ ] Database backups enabled
- [ ] Monitoring alerts configured

---

## 📊 Monitoring & Maintenance

### Supabase Monitoring

#### **Database Health**
- Monitor connection counts in dashboard
- Check query performance in SQL Editor
- Review storage usage and limits
- Track authentication metrics

#### **Performance Metrics**
```sql
-- Monitor active connections
SELECT COUNT(*) FROM pg_stat_activity;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Monitor recent sessions
SELECT COUNT(*) FROM meditation_sessions 
WHERE completed_at > NOW() - INTERVAL '24 hours';
```

### Backup Strategy

#### **Automated Backups**
- Supabase handles daily automated backups
- Point-in-time recovery available
- Export important data regularly

#### **Manual Export**
```sql
-- Export user data
COPY (SELECT * FROM users) TO 'users_backup.csv' WITH CSV HEADER;

-- Export sessions
COPY (SELECT * FROM meditation_sessions) TO 'sessions_backup.csv' WITH CSV HEADER;
```

---

## 🎯 Next Steps & Advanced Features

### Immediate Enhancements

1. **Advanced Analytics**
   - Create materialized views for performance
   - Implement user behavior analytics
   - Add cultural engagement metrics

2. **Community Features** 
   - Add community journal sharing
   - Implement group meditation sessions
   - Create cultural wisdom exchange

3. **Performance Optimization**
   - Implement database connection pooling
   - Add Redis caching layer
   - Optimize queries with explain analyze

### Future Considerations

1. **Multi-Region Deployment**
   - Additional Indonesian regions
   - Data residency compliance
   - Edge function deployment

2. **Advanced Security**
   - Implement audit logging
   - Add data encryption at rest
   - Create compliance reports

3. **Scalability Preparation**
   - Database sharding strategy
   - Read replica implementation
   - Microservice architecture

---

## 📞 Support & Resources

### Documentation Links
- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **PostgreSQL Docs**: [https://postgresql.org/docs](https://postgresql.org/docs)
- **SQL Tutorial**: [https://supabase.com/docs/guides/database](https://supabase.com/docs/guides/database)

### Getting Help

1. **Check browser console** for error messages
2. **Review Supabase logs** in dashboard → Logs
3. **Test environment variables**:
   ```javascript
   console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
   console.log('Anon Key:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substr(0, 20) + '...')
   ```
4. **Verify network connectivity** to Supabase servers
5. **Check project status** in Supabase dashboard

### Success Indicators

You'll know your setup is complete when:
- ✅ No console errors about Supabase connection
- ✅ User registration and login works smoothly  
- ✅ Data appears in Supabase dashboard tables
- ✅ File uploads succeed (avatars, audio)
- ✅ Real-time features function correctly
- ✅ Meditation sessions save and load properly
- ✅ Journal entries create with cultural context

---

**🎉 Congratulations!** Your Supabase backend is now fully configured for the Sembalun Mind meditation platform. The database supports authentic Indonesian cultural practices while providing modern, scalable, and secure data management.

*Built with ❤️ for Indonesian mindfulness practitioners*