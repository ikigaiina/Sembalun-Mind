# 🚀 Quick Supabase Setup for Sembalun Mind

## Step 1: Create Supabase Project

1. **Visit** [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **Click "New project"**
3. **Fill in:**
   - Organization: Select existing or create new
   - Name: `sembalun-mind-meditation`
   - Database Password: **Create strong password & save it!**
   - Region: `Southeast Asia (Singapore)` (closest to Indonesia)
4. **Click "Create new project"** (takes ~2 minutes)

## Step 2: Get API Keys

After project is created:

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Step 3: Setup Environment

1. **Copy** `.env.example` to `.env.local`:
   ```bash
   copy .env.example .env.local
   ```

2. **Edit** `.env.local` with your values:
   ```bash
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## Step 4: Setup Database

1. Go to **SQL Editor** in Supabase dashboard
2. **Copy & paste** the entire contents of `supabase/schema.sql`
3. **Click "Run"** (creates all tables, policies, etc.)

## Step 5: Configure Authentication

1. Go to **Authentication** → **Settings**
2. Set **Site URL**: `http://localhost:5173`
3. Add **Redirect URLs**: 
   - `http://localhost:5173/auth/callback`
   - `https://your-vercel-domain.vercel.app/auth/callback`

## Step 6: Test Connection

1. **Restart your dev server**:
   ```bash
   npm run dev
   ```

2. **Check browser console** - should see no Supabase errors
3. **Try to sign up** - should work without errors

## ⚠️ Important Notes

- **NEVER** commit `.env.local` to git
- **USE** `.env.example` as template only
- **SAVE** your database password securely
- **Southeast Asia** region recommended for Indonesian users

## 🔧 If You Need Help

Run this test script to check connection:
```bash
npm run test:supabase
```

Or check manually in browser console:
```javascript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
```

## 🎯 Next Steps After Setup

1. ✅ Test user registration
2. ✅ Test meditation session creation  
3. ✅ Test journal entries
4. ✅ Setup production environment variables in Vercel