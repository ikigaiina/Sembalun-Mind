# 🎯 Supabase Setup - Step by Step Instructions

## 📋 What We're Setting Up

Your Sembalun Mind app needs a database to store:
- ✅ User profiles and authentication
- ✅ Meditation sessions and progress  
- ✅ Journal entries with mood tracking
- ✅ Achievements and milestones
- ✅ Audio file storage
- ✅ User preferences and settings

## 🚀 Step 1: Create Supabase Project

### 1.1 Go to Supabase Dashboard
1. **Visit**: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **Sign up** or **Sign in** with your account
3. **Click "New project"** button

### 1.2 Configure Project Settings
Fill in the project details:

- **Organization**: Select existing or create new
- **Project Name**: `sembalun-mind-meditation`
- **Database Password**: 
  - **Create a strong password** (at least 12 characters)
  - **Include**: letters, numbers, symbols
  - **❗ IMPORTANT**: Save this password securely!
- **Region**: `Southeast Asia (Singapore)` ← Best for Indonesia
- **Pricing**: Free tier is perfect for development

### 1.3 Create Project
- **Click "Create new project"**
- **Wait ~2-3 minutes** for project initialization
- You'll see a progress indicator

## 📋 Step 2: Get Your API Keys

Once your project is ready:

### 2.1 Navigate to API Settings
1. **Click "Settings"** in the left sidebar
2. **Click "API"** in the settings menu
3. You'll see your project configuration

### 2.2 Copy Essential Information
**Copy and save these values** (you'll need them):

```
Project URL: https://xxxxx.supabase.co
anon (public) key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Note**: The anon key is safe to use in your frontend code.

## 💾 Step 3: Setup Environment Variables

### 3.1 Create Environment File
1. **Copy** `.env.example` to `.env.local`:
   ```bash
   copy .env.example .env.local
   ```

### 3.2 Edit Your Environment File
**Open** `.env.local` and replace with your values:

```bash
# Replace with your actual values from Step 2
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3.3 Verify Environment Setup
**Restart your dev server**:
```bash
npm run dev
```

**Check browser console** - you should see no Supabase errors.

## 🗄️ Step 4: Setup Database Schema

### 4.1 Open SQL Editor
1. **Go to your Supabase dashboard**
2. **Click "SQL Editor"** in the left sidebar
3. **Click "New query"**

### 4.2 Run Database Schema
1. **Open the file**: `supabase/schema.sql`
2. **Copy the entire content** (375+ lines)
3. **Paste into SQL Editor**
4. **Click "Run"** (bottom right)

**✅ Success**: You should see "Success. No rows returned" message.

This creates all necessary:
- 📊 Tables (users, sessions, journal, etc.)
- 🔐 Security policies (Row Level Security)
- 📈 Indexes for performance
- 🔄 Triggers for data consistency

### 4.3 Verify Tables Created
**Click "Database"** in sidebar - you should see these tables:
- `users`
- `meditation_sessions` 
- `journal_entries`
- `achievements`
- `courses`
- `moods`
- And more...

## 🔐 Step 5: Configure Authentication

### 5.1 Authentication Settings
1. **Go to "Authentication"** → **"Settings"**
2. **Configure URLs**:

**Site URL**: `http://localhost:5173`

**Additional Redirect URLs**:
```
http://localhost:5173/auth/callback
https://your-app-name.vercel.app/auth/callback
```

### 5.2 Email Templates (Optional)
- **Customize** confirmation and reset emails
- **Use Indonesian language** if preferred
- **Add your app branding**

## 🗂️ Step 6: Setup Storage Buckets

### 6.1 Create Storage Buckets
1. **Go to "Storage"** in dashboard
2. **Create new bucket**: `avatars`
   - **Public bucket**: ✅ Yes
   - **File size limit**: 2MB
   - **Allowed file types**: image/*

3. **Create new bucket**: `audio` 
   - **Public bucket**: ✅ Yes
   - **File size limit**: 50MB
   - **Allowed file types**: audio/*

### 6.2 Configure Storage Policies
**Run this SQL** in SQL Editor:

```sql
-- Avatar storage policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Audio storage policies  
CREATE POLICY "Audio files are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'audio');
```

## ✅ Step 7: Test Your Setup

### 7.1 Test Database Connection
**Run the test script**:
```bash
npm run test:supabase
```

### 7.2 Manual Testing
1. **Start your app**: `npm run dev`
2. **Try to register** a new account
3. **Check Supabase dashboard** → **Authentication** 
4. **Verify** user appears in the list

### 7.3 Test Database Operations
1. **Complete onboarding** in your app
2. **Create a meditation session**
3. **Add a journal entry**
4. **Go to Supabase** → **Database** → **Table editor**
5. **Check tables** have your data

## 🚀 Step 8: Production Setup

### 8.1 Add Environment Variables to Vercel
1. **Go to your Vercel dashboard**
2. **Select your project**
3. **Go to Settings** → **Environment Variables**
4. **Add**:
   - `VITE_SUPABASE_URL` = your project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key

### 8.2 Update Redirect URLs
**In Supabase** → **Authentication** → **Settings**:
- **Add your production URL**: `https://your-app.vercel.app/auth/callback`

## 🔧 Troubleshooting

### ❌ "Invalid API key"
- ✅ Check your `.env.local` has correct anon key
- ✅ Restart dev server after changing `.env.local`
- ✅ Key should start with `eyJ`

### ❌ "Failed to fetch" 
- ✅ Check your project URL is correct
- ✅ No trailing slash in URL
- ✅ Format: `https://xxxxx.supabase.co`

### ❌ Authentication issues
- ✅ Check redirect URLs are configured
- ✅ Email confirmation might be required
- ✅ Check spam folder for confirmation emails

### ❌ Database errors
- ✅ Make sure you ran the full schema.sql
- ✅ Check RLS policies are created
- ✅ User must be authenticated before database operations

## 📞 Need Help?

If you encounter issues:
1. **Check the browser console** for error messages
2. **Check Supabase logs** in dashboard
3. **Verify environment variables** are loaded:
   ```javascript
   console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
   ```

## 🎉 Success Indicators

You'll know setup is complete when:
- ✅ No console errors about missing environment variables
- ✅ User registration works
- ✅ Data appears in Supabase dashboard tables
- ✅ Authentication flow works smoothly
- ✅ Meditation sessions can be created and saved

**🎯 Once complete, your Sembalun Mind app will have a fully functional backend!**