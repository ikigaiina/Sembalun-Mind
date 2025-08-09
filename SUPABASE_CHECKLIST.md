# ✅ Supabase Setup Checklist for Sembalun Mind

## 📋 Step-by-Step Setup Checklist

### Phase 1: Create Supabase Project
- [ ] **Go to [Supabase Dashboard](https://supabase.com/dashboard)**
- [ ] **Click "New Project"**
- [ ] **Fill project details:**
  - [ ] Organization: Select or create
  - [ ] Name: `sembalun-mind-meditation`
  - [ ] Password: Strong password (save securely!)
  - [ ] Region: `Southeast Asia (Singapore)`
- [ ] **Click "Create new project"**
- [ ] **Wait for project initialization** (~2-3 minutes)

### Phase 2: Get API Credentials
- [ ] **Navigate to Settings → API**
- [ ] **Copy and save these values:**
  - [ ] Project URL: `https://xxxxx.supabase.co`
  - [ ] anon public key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Phase 3: Configure Environment
- [ ] **Create environment file:**
  ```bash
  copy .env.example .env.local
  ```
- [ ] **Edit `.env.local` with your values:**
  ```bash
  VITE_SUPABASE_URL=https://your-project-id.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- [ ] **Restart dev server:**
  ```bash
  npm run dev
  ```

### Phase 4: Setup Database Schema
- [ ] **Go to SQL Editor in Supabase dashboard**
- [ ] **Open `supabase/schema.sql` file**
- [ ] **Copy entire contents** (375+ lines)
- [ ] **Paste in SQL Editor**
- [ ] **Click "Run"**
- [ ] **Verify success message** ("Success. No rows returned")

### Phase 5: Verify Tables Created
- [ ] **Go to Database → Tables**
- [ ] **Check these tables exist:**
  - [ ] `users`
  - [ ] `meditation_sessions`
  - [ ] `journal_entries`
  - [ ] `achievements`
  - [ ] `courses`
  - [ ] `moods`
  - [ ] `bookmarks`
  - [ ] `user_course_progress`

### Phase 6: Configure Authentication
- [ ] **Go to Authentication → Settings**
- [ ] **Set Site URL:** `http://localhost:5173`
- [ ] **Add Redirect URLs:**
  - [ ] `http://localhost:5173/auth/callback`
  - [ ] `https://your-production-domain.vercel.app/auth/callback`
- [ ] **Save configuration**

### Phase 7: Setup Storage (Optional but Recommended)
- [ ] **Go to Storage**
- [ ] **Create bucket: `avatars`**
  - [ ] Public: ✅ Yes
  - [ ] File size limit: 2MB
  - [ ] Allowed types: image/*
- [ ] **Create bucket: `audio`**
  - [ ] Public: ✅ Yes  
  - [ ] File size limit: 50MB
  - [ ] Allowed types: audio/*

### Phase 8: Test Your Setup
- [ ] **Run test command:**
  ```bash
  npm run test:supabase
  ```
- [ ] **Verify all tests pass:**
  - [ ] Environment Variables: ✅ PASS
  - [ ] Database Connection: ✅ PASS
  - [ ] Tables exist: ✅ PASS
  - [ ] Sample Data: ✅ PASS
  - [ ] Authentication: ✅ PASS

### Phase 9: Manual Testing
- [ ] **Start development server:** `npm run dev`
- [ ] **Open app in browser**
- [ ] **Try user registration**
- [ ] **Check Supabase dashboard → Authentication**
- [ ] **Verify user appears in users list**
- [ ] **Complete onboarding process**
- [ ] **Create a meditation session**
- [ ] **Add journal entry**
- [ ] **Check Database → Table editor for your data**

### Phase 10: Production Setup
- [ ] **Add environment variables to Vercel:**
  - [ ] Go to Vercel dashboard → Project → Settings → Environment Variables
  - [ ] Add `VITE_SUPABASE_URL`
  - [ ] Add `VITE_SUPABASE_ANON_KEY`
- [ ] **Update redirect URLs in Supabase:**
  - [ ] Add your production domain to redirect URLs
  - [ ] Format: `https://your-app.vercel.app/auth/callback`

## 🔧 Troubleshooting Guide

### ❌ "Missing environment variables"
**Fix:**
- [ ] Check `.env.local` exists in project root
- [ ] Verify variable names start with `VITE_`
- [ ] Restart dev server after creating `.env.local`
- [ ] Make sure no spaces around = in `.env.local`

### ❌ "Invalid API key" 
**Fix:**
- [ ] Double-check anon key from Supabase dashboard
- [ ] Ensure key starts with `eyJ`
- [ ] No extra spaces or characters
- [ ] Copy entire key including all characters

### ❌ "Failed to fetch"
**Fix:**
- [ ] Check project URL format: `https://xxxxx.supabase.co`
- [ ] No trailing slash in URL
- [ ] Project is not paused (free tier auto-pauses after inactivity)
- [ ] Check Supabase status page for service issues

### ❌ "Table doesn't exist"
**Fix:**
- [ ] Run the complete `supabase/schema.sql` in SQL Editor
- [ ] Check for SQL errors during schema execution
- [ ] Verify you ran the script in the correct project
- [ ] Tables should appear in Database → Tables section

### ❌ Authentication issues
**Fix:**
- [ ] Verify redirect URLs are configured correctly
- [ ] Check for typos in URLs (http vs https)
- [ ] Email confirmation may be required
- [ ] Check spam folder for confirmation emails

### ❌ RLS (Row Level Security) errors
**Fix:**
- [ ] Ensure schema.sql created all RLS policies
- [ ] User must be authenticated before accessing protected tables
- [ ] Public tables (like courses) should work without authentication
- [ ] Check that policies match your user authentication state

## 🎯 Success Indicators

You'll know setup is complete when:

- [x] ✅ No console errors about Supabase
- [x] ✅ Test script shows all PASS results
- [x] ✅ User registration works without errors
- [x] ✅ Data appears in Supabase dashboard tables
- [x] ✅ Authentication redirects work properly
- [x] ✅ Meditation sessions can be created and saved
- [x] ✅ Journal entries can be written and retrieved
- [x] ✅ Sample courses are visible in app

## 📞 Getting Help

If you encounter persistent issues:

1. **Run the diagnostic:**
   ```bash
   npm run test:supabase
   ```

2. **Check browser console** for detailed error messages

3. **Verify Supabase logs:**
   - Go to your Supabase dashboard
   - Click "Logs" to see detailed error information

4. **Common solutions:**
   - Restart development server
   - Clear browser cache
   - Try incognito/private browsing mode
   - Check network connectivity

## 🚀 Next Steps After Setup

Once Supabase is working:

- [ ] **Test all app features thoroughly**
- [ ] **Set up error monitoring** (optional)
- [ ] **Configure email templates** (optional)
- [ ] **Add Google OAuth** (optional)
- [ ] **Set up automated backups** (recommended for production)
- [ ] **Monitor usage and performance**

## 💡 Pro Tips

- **Save your database password** in a secure password manager
- **Southeast Asia region** provides best performance for Indonesian users
- **Free tier** is sufficient for development and small production apps
- **Row Level Security** is automatically configured for user data protection
- **Sample meditation courses** are included in the schema for immediate testing

---

**🎉 Once complete, your Sembalun Mind app will have a fully functional, secure, and scalable backend powered by Supabase!**