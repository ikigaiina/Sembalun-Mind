# 🚀 Panduan Setup Supabase untuk Sembalun

## 📋 Ringkasan Masalah

Console error yang Anda lihat menunjukkan bahwa environment variables Supabase belum dikonfigurasi:

```
Missing Supabase environment variables. Please check your .env file:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
```

## 🔧 Langkah-langkah Setup

### 1. Buat Proyek Supabase

1. **Kunjungi** [https://supabase.com](https://supabase.com)
2. **Sign up** atau **Login** dengan akun Anda
3. **Klik "New project"**
4. **Isi detail proyek:**
   - Name: `sembalun-meditation-app`
   - Organization: Pilih atau buat baru
   - Database Password: Buat password yang kuat (simpan dengan aman!)
   - Region: Pilih yang terdekat dengan Indonesia (Southeast Asia recommended)
5. **Klik "Create new project"**
6. **Tunggu** hingga proyek selesai dibuat (~2 menit)

### 2. Dapatkan API Keys

Setelah proyek dibuat:

1. **Masuk ke Dashboard proyek Anda**
2. **Klik "Settings"** di sidebar kiri
3. **Klik "API"** 
4. **Copy** informasi berikut:
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **anon public key**: Key yang panjang dimulai dengan `eyJ...`
   - **service_role key**: Key untuk operations admin (JANGAN expose ke client!)

### 3. Setup Environment Variables

#### Opsi A: File .env.local (Recommended)

1. **Copy** file `.env.example` menjadi `.env.local`:
   ```bash
   copy .env.example .env.local
   ```

2. **Edit** `.env.local` dengan informasi Supabase Anda:
   ```bash
   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

#### Opsi B: File .env (Alternative)

Jika `.env.local` tidak bekerja, buat file `.env` di root project:
```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Setup Database Schema

1. **Masuk ke Supabase Dashboard**
2. **Klik "SQL Editor"** di sidebar
3. **Run** script berikut untuk membuat tabel dasar:

```sql
-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  is_guest BOOLEAN DEFAULT FALSE,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meditation_sessions table
CREATE TABLE IF NOT EXISTS meditation_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  category TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 10),
  mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 10)
);

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 10),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create moods table
CREATE TABLE IF NOT EXISTS moods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  duration_minutes INTEGER,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own sessions" ON meditation_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own sessions" ON meditation_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own journal entries" ON journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own journal entries" ON journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journal entries" ON journal_entries FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own moods" ON moods FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own moods" ON moods FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Everyone can view active courses" ON courses FOR SELECT USING (is_active = TRUE);
```

### 5. Setup Authentication

1. **Masuk ke "Authentication"** di Supabase Dashboard
2. **Klik "Settings"**
3. **Konfigurasi URL settings:**
   - Site URL: `http://localhost:5173` (untuk development)
   - Redirect URLs: `http://localhost:5173/auth/callback`

4. **Enable providers yang diinginkan:**
   - Email/Password: ✅ (sudah aktif)
   - Google OAuth: (opsional, untuk "Login with Google")

### 6. Setup Storage (Opsional)

Jika aplikasi membutuhkan upload file:

1. **Masuk ke "Storage"** di dashboard
2. **Create bucket** untuk:
   - `avatars` (untuk foto profil)
   - `audio` (untuk file audio meditasi)

### 7. Test Koneksi

1. **Restart development server:**
   ```bash
   npm run dev
   ```

2. **Buka browser console** dan pastikan tidak ada error
3. **Test** fungsi login/register
4. **Cek** di Supabase Dashboard > Authentication apakah user terbuat

## 🔍 Troubleshooting

### Error: "Invalid API key"
- ✅ Pastikan `VITE_SUPABASE_ANON_KEY` benar
- ✅ Tidak ada extra spaces atau characters
- ✅ Key dimulai dengan `eyJ`

### Error: "Failed to fetch"
- ✅ Pastikan `VITE_SUPABASE_URL` benar
- ✅ Format: `https://your-project-ref.supabase.co`
- ✅ Tidak ada trailing slash

### Environment variables tidak terbaca
- ✅ Restart development server setelah menambah `.env`
- ✅ File harus di root project (same level dengan `package.json`)
- ✅ Variable names harus dimulai dengan `VITE_`

### Database connection issues
- ✅ Pastikan database schema sudah dijalankan
- ✅ RLS policies sudah dibuat
- ✅ User sudah authenticated sebelum akses database

## 🚦 Verifikasi Setup

Jalankan test script untuk memverifikasi setup:

```bash
npm run test:supabase
```

Atau cek manual di browser console:
```javascript
// Test di browser console
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Supabase client:', supabase)
```

## 📝 File Configuration

Setelah setup, file structure Anda akan seperti ini:

```
sembalun/
├── .env.local          # ← Environment variables (JANGAN commit!)
├── .env.example        # ← Template (sudah ada)
├── src/
│   ├── config/
│   │   └── supabase.ts # ← Supabase client config (sudah ada)
│   └── lib/
│       └── supabase.ts # ← Supabase service (sudah ada)
```

## 🛡️ Security Notes

- ❌ **JANGAN** commit file `.env.local` atau `.env` 
- ✅ **Gunakan** `.env.example` sebagai template
- ✅ **Service Role Key** hanya untuk server-side operations
- ✅ **Anon Key** aman untuk client-side usage

## 🎯 Next Steps

Setelah setup berhasil:

1. ✅ Test guest login functionality
2. ✅ Test user registration
3. ✅ Test meditation session creation
4. ✅ Setup production environment variables di Vercel/Netlify

---

**💡 Pro Tip**: Simpan semua credentials Supabase di password manager yang aman!