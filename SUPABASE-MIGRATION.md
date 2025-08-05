# Supabase Migration Guide

## Overview

This project has been successfully migrated from Firebase to Supabase. This document outlines the changes made and how to set up the project with Supabase.

## What Changed

### 1. Dependencies
- **Removed**: `firebase`, `react-firebase-hooks`
- **Added**: `@supabase/supabase-js`

### 2. Configuration
- **Firebase config** (`src/config/firebase.ts`) → **Supabase config** (`src/config/supabase.ts`)
- Environment variables changed from Firebase to Supabase format

### 3. Authentication
- **Firebase Auth** → **Supabase Auth**
- New auth context: `src/contexts/SupabaseAuthContext.tsx`
- New auth service: `src/services/supabaseAuthService.ts`
- OAuth providers (Google, Apple) now use Supabase OAuth

### 4. Database
- **Firestore** → **PostgreSQL with Supabase**
- Database service: `src/services/supabaseDatabaseService.ts`
- SQL schema: `supabase/schema.sql`
- Row Level Security (RLS) enabled for all tables

### 5. Storage
- **Firebase Storage** → **Supabase Storage**
- Storage service: `src/services/supabaseStorageService.ts`
- Bucket-based file organization

### 6. Authentication Flow
- New sign-in page: `src/pages/SignInPage.tsx`
- Auth callback handling: `src/pages/AuthCallback.tsx`
- Password reset flow: `src/pages/AuthResetPassword.tsx`

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Development
VITE_USE_LOCAL_SUPABASE=false
VITE_LOCAL_SUPABASE_URL=http://localhost:54321
VITE_LOCAL_SUPABASE_ANON_KEY=your_local_anon_key

# App Settings
VITE_APP_NAME=Sembalun
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development
```

## Supabase Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and anon key

### 2. Set up Database Schema
Run the SQL schema in Supabase SQL Editor:
```bash
# Copy the contents of supabase/schema.sql
# Paste and run in Supabase SQL Editor
```

### 3. Configure Authentication Providers

#### Google OAuth
1. Go to Authentication > Providers in Supabase Dashboard
2. Enable Google provider
3. Add your Google OAuth credentials
4. Set redirect URL: `https://yourdomain.com/auth/callback`

#### Apple OAuth
1. Enable Apple provider in Supabase Dashboard
2. Add your Apple OAuth credentials
3. Set redirect URL: `https://yourdomain.com/auth/callback`

### 4. Set up Storage Buckets
The following buckets will be created automatically:
- `avatars` (public) - User profile pictures  
- `audio` (public) - Audio files for meditation
- `images` (public) - General images
- `documents` (private) - User documents

## Database Schema

### Tables Created
- `users` - User profiles and preferences
- `meditation_sessions` - User meditation session records
- `journal_entries` - User journal entries
- `achievements` - User achievements
- `courses` - Meditation courses (public)
- `user_course_progress` - User progress in courses
- `bookmarks` - User bookmarks
- `user_settings` - Additional user settings

### Key Features
- **Row Level Security (RLS)** enabled on all tables
- **Automatic timestamps** with triggers
- **User profile creation** on signup via trigger
- **Sample course data** included

## Deployment

### Vercel Environment Variables
In your Vercel dashboard, add these environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_NAME`
- `VITE_APP_VERSION`
- `VITE_APP_ENV`

### Build Configuration
The project uses the same build configuration as before:
- `npm run build` for production builds
- `npm run build:fast` for optimized builds
- `npm run build:deploy` for deployment builds

## Testing

### Local Development
1. Set up environment variables
2. Run `npm run dev`
3. The app will connect to your Supabase project

### Guest Mode
- Guest data is stored in localStorage
- Automatically migrated when user signs up
- All guest features work offline

## Migration Benefits

### Performance
- **Faster queries** with PostgreSQL and indexes
- **Real-time subscriptions** with Supabase Realtime
- **Edge functions** for serverless backend logic

### Developer Experience
- **SQL-based** database with full PostgreSQL features
- **Auto-generated APIs** for all tables
- **Built-in authentication** with multiple providers
- **Dashboard** for database management

### Scalability
- **Horizontal scaling** with PostgreSQL
- **Global CDN** for static assets
- **Serverless architecture** with automatic scaling

## Troubleshooting

### Common Issues

#### Environment Variables Not Loading
- Check that `.env.local` exists and has correct values
- Restart development server after changing environment variables

#### Authentication Redirect Issues
- Verify OAuth redirect URLs are correctly configured
- Check that `auth/callback` route is accessible

#### Database Connection Issues
- Verify Supabase URL and anon key are correct
- Check if RLS policies are correctly set up

#### Storage Upload Issues
- Verify storage buckets are created
- Check file size limits and MIME type restrictions

### Getting Help

1. Check Supabase documentation: https://supabase.com/docs
2. Check project issues on GitHub
3. Review console logs for detailed error messages

## Future Enhancements

### Planned Features
- **Edge Functions** for complex business logic
- **Database Functions** for advanced queries
- **Webhooks** for external integrations
- **Analytics** with built-in Supabase metrics

### Performance Optimizations
- **Connection pooling** for high traffic
- **Read replicas** for improved read performance
- **Caching layers** for frequently accessed data

## Rollback Plan

If you need to rollback to Firebase:
1. Restore Firebase dependencies in `package.json`
2. Switch back to Firebase config files
3. Update environment variables to Firebase format
4. Redeploy with Firebase configuration

**Note**: Data migration back to Firebase would need to be handled separately.