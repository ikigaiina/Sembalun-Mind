-- Seed data for Sembalun Meditation App
-- This file contains sample data for development and testing

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insert sample courses (expanding on the existing ones)
INSERT INTO public.courses (title, description, category, difficulty, duration_minutes, instructor, image_url, audio_url, is_premium, order_index) VALUES
-- Beginner courses
('Dasar-Dasar Pernapasan', 'Pelajari teknik pernapasan fundamental untuk meditasi yang efektif', 'pernapasan', 'beginner', 8, 'Guru Sembalun', '/images/courses/breathing-basics.jpg', '/audio/courses/breathing-basics.mp3', false, 7),
('Meditasi 5 Menit', 'Sesi singkat untuk pemula yang ingin memulai kebiasaan meditasi', 'pemula', 'beginner', 5, 'Guru Sembalun', '/images/courses/5min-meditation.jpg', '/audio/courses/5min-meditation.mp3', false, 8),
('Mindfulness Sehari-hari', 'Cara menerapkan kesadaran penuh dalam aktivitas harian', 'mindfulness', 'beginner', 12, 'Guru Sembalun', '/images/courses/daily-mindfulness.jpg', '/audio/courses/daily-mindfulness.mp3', false, 9),
('Mengatasi Kecemasan', 'Teknik khusus untuk meredakan perasaan cemas dan gelisah', 'kesehatan', 'beginner', 15, 'Dr. Mindful', '/images/courses/anxiety-relief.jpg', '/audio/courses/anxiety-relief.mp3', false, 10),

-- Intermediate courses
('Meditasi Visualization', 'Gunakan kekuatan imajinasi untuk mencapai kedamaian yang lebih dalam', 'visualisasi', 'intermediate', 20, 'Guru Sembalun', '/images/courses/visualization.jpg', '/audio/courses/visualization.mp3', true, 11),
('Chakra Balancing', 'Seimbangkan energi tubuh melalui meditasi chakra', 'energi', 'intermediate', 35, 'Master Chakra', '/images/courses/chakra-balancing.jpg', '/audio/courses/chakra-balancing.mp3', true, 12),
('Meditasi Mantra', 'Kekuatan pengulangan kata-kata suci untuk fokus yang mendalam', 'mantra', 'intermediate', 25, 'Pandit Suci', '/images/courses/mantra-meditation.jpg', '/audio/courses/mantra-meditation.mp3', true, 13),
('Progressive Relaxation', 'Teknik relaksasi bertahap untuk melepaskan ketegangan fisik', 'relaksasi', 'intermediate', 30, 'Dr. Relaxation', '/images/courses/progressive-relaxation.jpg', '/audio/courses/progressive-relaxation.mp3', false, 14),

-- Advanced courses  
('Samatha & Vipassana', 'Gabungan teknik konsentrasi dan wawasan dari tradisi Buddha', 'buddhist', 'advanced', 45, 'Bhikkhu Mindful', '/images/courses/samatha-vipassana.jpg', '/audio/courses/samatha-vipassana.mp3', true, 15),
('Zen Meditation', 'Praktik duduk hening (zazen) dari tradisi Zen', 'zen', 'advanced', 40, 'Zen Master', '/images/courses/zen-meditation.jpg', '/audio/courses/zen-meditation.mp3', true, 16),
('Metta (Loving Kindness)', 'Kembangkan cinta kasih universal melalui meditasi metta', 'kasih', 'advanced', 35, 'Guru Karuna', '/images/courses/metta-meditation.jpg', '/audio/courses/metta-meditation.mp3', true, 17),
('Silent Retreat', 'Pengalaman retreat hening untuk pencerahan mendalam', 'retreat', 'advanced', 60, 'Guru Sembalun', '/images/courses/silent-retreat.jpg', '/audio/courses/silent-retreat.mp3', true, 18),

-- Specialized courses
('Meditasi untuk Tidur', 'Panduan khusus untuk meditasi sebelum tidur dan sleep meditation', 'tidur', 'beginner', 18, 'Sleep Specialist', '/images/courses/sleep-meditation.jpg', '/audio/courses/sleep-meditation.mp3', false, 19),
('Meditasi di Tempat Kerja', 'Teknik cepat untuk mengatasi stres di lingkungan kerja', 'kerja', 'beginner', 10, 'Corporate Mindful', '/images/courses/workplace-meditation.jpg', '/audio/courses/workplace-meditation.mp3', false, 20),
('Meditasi untuk Anak', 'Panduan meditasi yang menyenangkan dan mudah untuk anak-anak', 'anak', 'beginner', 8, 'Kids Meditation', '/images/courses/kids-meditation.jpg', '/audio/courses/kids-meditation.mp3', false, 21),
('Healing Meditation', 'Meditasi untuk penyembuhan fisik dan emosional', 'penyembuhan', 'intermediate', 28, 'Healer Master', '/images/courses/healing-meditation.jpg', '/audio/courses/healing-meditation.mp3', true, 22),

-- Series & Programs
('Program 21 Hari', 'Program komprehensif untuk membangun kebiasaan meditasi dalam 21 hari', 'program', 'beginner', 15, 'Guru Sembalun', '/images/courses/21-day-program.jpg', '/audio/courses/21-day-program.mp3', true, 23),
('Mindful Eating', 'Praktik kesadaran penuh saat makan untuk kesehatan holistik', 'mindfulness', 'intermediate', 22, 'Nutrition Guru', '/images/courses/mindful-eating.jpg', '/audio/courses/mindful-eating.mp3', true, 24),
('Gratitude Meditation', 'Kembangkan rasa syukur yang mendalam melalui meditasi', 'syukur', 'beginner', 12, 'Gratitude Teacher', '/images/courses/gratitude-meditation.jpg', '/audio/courses/gratitude-meditation.mp3', false, 25);

-- Insert sample achievement definitions (these would be used by the achievement processor)
-- Note: In production, achievement rules are defined in the Edge Function code
-- This is just for reference and testing

-- Create a demo user for testing (this would normally be created through auth signup)
-- INSERT INTO auth.users (id, email, created_at, updated_at) VALUES 
-- ('demo-user-uuid', 'demo@sembalun.app', NOW(), NOW());

-- Insert demo user profile
INSERT INTO public.users (id, email, display_name, avatar_url, preferences, progress, is_guest) VALUES 
('00000000-0000-0000-0000-000000000001', 'demo@sembalun.app', 'Demo User', '/images/avatars/demo-avatar.jpg', 
'{
  "theme": "auto",
  "language": "id",
  "notifications": {
    "daily": true,
    "reminders": true,
    "achievements": true,
    "weeklyProgress": true,
    "socialUpdates": false,
    "push": true,
    "email": false,
    "sound": true,
    "vibration": true
  },
  "privacy": {
    "analytics": true,
    "dataSharing": false,
    "profileVisibility": "private",
    "shareProgress": false,
    "locationTracking": false
  },
  "meditation": {
    "defaultDuration": 15,
    "preferredVoice": "default",
    "backgroundSounds": true,
    "guidanceLevel": "moderate",
    "musicVolume": 70,
    "voiceVolume": 80,
    "autoAdvance": false,
    "showTimer": true,
    "preparationTime": 30,
    "endingBell": true
  },
  "accessibility": {
    "reducedMotion": false,
    "highContrast": false,
    "fontSize": "medium",
    "screenReader": false,
    "keyboardNavigation": false
  },
  "display": {
    "dateFormat": "DD/MM/YYYY",
    "timeFormat": "24h",
    "weekStartsOn": "monday",
    "showStreaks": true,
    "showStatistics": true
  }
}'::jsonb,
'{
  "total_sessions": 23,
  "total_minutes": 189,
  "current_streak": 14,
  "longest_streak": 21,
  "achievements": ["first_session", "ten_sessions", "three_day_streak", "week_streak", "one_hour_total"],
  "favorite_categories": ["pernapasan", "relaksasi", "pemula"],
  "completed_programs": ["pengenalan_meditasi"]
}'::jsonb,
false);

-- Insert sample meditation sessions for demo user
INSERT INTO public.meditation_sessions (user_id, type, duration_minutes, completed_at, mood_before, mood_after, notes) VALUES
-- Recent sessions (last 2 weeks)
('00000000-0000-0000-0000-000000000001', 'guided', 15, NOW() - INTERVAL '1 day', '6', '8', 'Merasa lebih tenang setelah hari yang melelahkan'),
('00000000-0000-0000-0000-000000000001', 'breathing', 10, NOW() - INTERVAL '2 days', '5', '7', 'Teknik pernapasan sangat membantu mengurangi kecemasan'),
('00000000-0000-0000-0000-000000000001', 'silent', 20, NOW() - INTERVAL '3 days', '7', '9', 'Sesi hening yang mendalam, pikiran lebih jernih'),
('00000000-0000-0000-0000-000000000001', 'walking', 12, NOW() - INTERVAL '4 days', '6', '8', 'Meditasi berjalan di taman, sangat menyegarkan'),
('00000000-0000-0000-0000-000000000001', 'guided', 15, NOW() - INTERVAL '5 days', '4', '7', 'Sulit fokus di awal tapi akhirnya berhasil'),
('00000000-0000-0000-0000-000000000001', 'breathing', 8, NOW() - INTERVAL '6 days', '7', '8', 'Sesi singkat di pagi hari, energi meningkat'),
('00000000-0000-0000-0000-000000000001', 'guided', 18, NOW() - INTERVAL '7 days', '5', '8', 'Panduan suara sangat membantu menjaga fokus'),
('00000000-0000-0000-0000-000000000001', 'silent', 15, NOW() - INTERVAL '8 days', '8', '9', 'Mencapai kedalaman meditasi yang baik'),
('00000000-0000-0000-0000-000000000001', 'breathing', 10, NOW() - INTERVAL '9 days', '6', '7', 'Pernapasan 4-7-8 sangat efektif'),
('00000000-0000-0000-0000-000000000001', 'walking', 20, NOW() - INTERVAL '10 days', '5', '8', 'Jalan mindful di sekitar rumah'),
('00000000-0000-0000-0000-000000000001', 'guided', 12, NOW() - INTERVAL '11 days', '6', '8', 'Visualization meditation sangat menenangkan'),
('00000000-0000-0000-0000-000000000001', 'breathing', 15, NOW() - INTERVAL '12 days', '7', '9', 'Latihan pernapasan advance, hasilnya luar biasa'),
('00000000-0000-0000-0000-000000000001', 'silent', 25, NOW() - INTERVAL '13 days', '6', '8', 'Sesi terpanjang minggu ini, sangat bermanfaat'),
('00000000-0000-0000-0000-000000000001', 'guided', 10, NOW() - INTERVAL '14 days', '5', '7', 'Sesi pagi yang menyegarkan');

-- Insert sample achievements for demo user
INSERT INTO public.achievements (user_id, achievement_type, title, description, icon, unlocked_at) VALUES
('00000000-0000-0000-0000-000000000001', 'first_session', 'Langkah Pertama', 'Menyelesaikan sesi meditasi pertama', '🌱', NOW() - INTERVAL '45 days'),
('00000000-0000-0000-0000-000000000001', 'three_day_streak', 'Konsistensi Awal', 'Bermeditasi 3 hari berturut-turut', '🔥', NOW() - INTERVAL '35 days'),
('00000000-0000-0000-0000-000000000001', 'ten_sessions', 'Pembelajar Meditasi', 'Menyelesaikan 10 sesi meditasi', '🌿', NOW() - INTERVAL '25 days'),
('00000000-0000-0000-0000-000000000001', 'week_streak', 'Seminggu Penuh', 'Bermeditasi 7 hari berturut-turut', '🌈', NOW() - INTERVAL '20 days'),
('00000000-0000-0000-0000-000000000001', 'one_hour_total', 'Satu Jam Ketenangan', 'Menghabiskan total 60 menit bermeditasi', '⏰', NOW() - INTERVAL '15 days');

-- Insert sample journal entries for demo user
INSERT INTO public.journal_entries (user_id, title, content, mood, tags) VALUES
('00000000-0000-0000-0000-000000000001', 'Hari Pertama Meditasi', 'Hari ini aku mencoba meditasi untuk pertama kalinya. Awalnya sulit untuk fokus, pikiran terus berkelana. Tapi setelah beberapa menit, aku mulai merasakan ketenangan. Sepertinya ini akan menjadi perjalanan yang menarik.', 'tenang', ARRAY['pemula', 'pengalaman-pertama', 'fokus']),
('00000000-0000-0000-0000-000000000001', 'Minggu Ketiga Progress', 'Sudah 3 minggu konsisten bermeditasi. Aku mulai merasakan perubahan dalam cara menangani stres sehari-hari. Tidak mudah marah dan lebih sabar menghadapi masalah.', 'bahagia', ARRAY['progress', 'stres', 'kesabaran']),
('00000000-0000-0000-0000-000000000001', 'Tantangan Konsentrasi', 'Hari ini sangat sulit berkonsentrasi. Pikiran terus memikirkan pekerjaan dan deadline. Tapi aku tetap mencoba dan menyelesaikan sesi 15 menit. Yang penting adalah usaha, bukan hasil sempurna.', 'frustasi', ARRAY['tantangan', 'konsentrasi', 'pekerjaan']),
('00000000-0000-0000-0000-000000000001', 'Breakthrough Moment', 'Hari ini aku mengalami momen yang luar biasa dalam meditasi. Untuk pertama kalinya, aku benar-benar merasakan keheningan total. Tidak ada pikiran yang mengganggu, hanya kedamaian murni. Ini yang dicari selama ini!', 'damai', ARRAY['breakthrough', 'keheningan', 'kedamaian']);

-- Insert sample course progress for demo user
INSERT INTO public.user_course_progress (user_id, course_id, progress_percentage, last_accessed_at, completed_at) VALUES
('00000000-0000-0000-0000-000000000001', (SELECT id FROM courses WHERE title = 'Pengenalan Meditasi'), 100, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
('00000000-0000-0000-0000-000000000001', (SELECT id FROM courses WHERE title = 'Pernapasan Mindful'), 100, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
('00000000-0000-0000-0000-000000000001', (SELECT id FROM courses WHERE title = 'Meditasi Berjalan'), 60, NOW() - INTERVAL '5 days', NULL),
('00000000-0000-0000-0000-000000000001', (SELECT id FROM courses WHERE title = 'Scanning Tubuh'), 30, NOW() - INTERVAL '2 days', NULL);

-- Insert sample bookmarks for demo user
INSERT INTO public.bookmarks (user_id, content_type, content_id) VALUES
('00000000-0000-0000-0000-000000000001', 'course', (SELECT id FROM courses WHERE title = 'Meditasi Cinta Kasih')),
('00000000-0000-0000-0000-000000000001', 'course', (SELECT id FROM courses WHERE title = 'Meditasi Lanjutan')),
('00000000-0000-0000-0000-000000000001', 'course', (SELECT id FROM courses WHERE title = 'Dasar-Dasar Pernapasan'));

-- Insert sample user settings
INSERT INTO public.user_settings (user_id, setting_key, setting_value) VALUES
('00000000-0000-0000-0000-000000000001', 'notification_preferences', '{
  "daily_reminders": true,
  "achievement_alerts": true,
  "streak_warnings": true,
  "weekly_progress": true,
  "social_updates": false,
  "sound_enabled": true,
  "vibration_enabled": true,
  "quiet_hours": {
    "enabled": true,
    "start_time": "22:00",
    "end_time": "07:00"
  },
  "reminder_times": ["09:00", "19:00"]
}'::jsonb),
('00000000-0000-0000-0000-000000000001', 'daily_reminder_09:00', '{
  "user_id": "00000000-0000-0000-0000-000000000001",
  "title": "Waktunya Meditasi 🧘‍♀️",
  "body": "Luangkan waktu sejenak untuk menenangkan pikiran dan merasakan kedamaian.",
  "type": "reminder",
  "priority": "normal",
  "data": {
    "action": "start_meditation",
    "reminder_type": "daily"
  },
  "scheduled_time": "09:00",
  "is_active": true
}'::jsonb),
('00000000-0000-0000-0000-000000000001', 'daily_reminder_19:00', '{
  "user_id": "00000000-0000-0000-0000-000000000001",
  "title": "Waktunya Meditasi Malam 🌙",
  "body": "Akhiri hari Anda dengan ketenangan. Meditasi malam untuk tidur yang lebih nyenyak.",
  "type": "reminder",
  "priority": "normal",
  "data": {
    "action": "start_meditation",
    "reminder_type": "evening"
  },
  "scheduled_time": "19:00",
  "is_active": true
}'::jsonb);

-- Insert sample moods for demo user
INSERT INTO public.moods (user_id, mood, notes) VALUES
('00000000-0000-0000-0000-000000000001', '😊', 'Merasa baik hari ini.'),
('00000000-0000-0000-0000-000000000001', '😐', 'Sedikit lelah.'),
('00000000-0000-0000-0000-000000000001', '😇', 'Sangat tenang setelah meditasi.');

-- Create some sample guest data structures (for localStorage simulation)
-- This would be handled by the frontend, but kept here for reference

-- Additional meditation quotes and tips (could be used for daily inspiration)
CREATE TABLE IF NOT EXISTS public.daily_inspirations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('quote', 'tip', 'affirmation')),
  content TEXT NOT NULL,
  author TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

INSERT INTO public.daily_inspirations (type, content, author, category) VALUES
('quote', 'Kedamaian datang dari dalam. Jangan mencarinya di luar.', 'Buddha', 'kedamaian'),
('quote', 'Perjalanan seribu mil dimulai dengan satu langkah.', 'Lao Tzu', 'permulaan'),
('quote', 'Pikiran adalah segalanya. Apa yang kamu pikirkan, itulah yang akan kamu jadi.', 'Buddha', 'pikiran'),
('tip', 'Mulai dengan meditasi 5 menit setiap hari. Konsistensi lebih penting daripada durasi.', NULL, 'pemula'),
('tip', 'Jika pikiran mengembara selama meditasi, itu normal. Dengan lembut kembalikan fokus ke napas.', NULL, 'fokus'),
('tip', 'Cari tempat yang tenang dan nyaman untuk bermeditasi. Konsistensi tempat membantu menciptakan kebiasaan.', NULL, 'lingkungan'),
('affirmation', 'Saya layak mendapatkan kedamaian dan kebahagiaan.', NULL, 'self-love'),
('affirmation', 'Saya melepaskan semua yang tidak dapat saya kendalikan.', NULL, 'pelepasan'),
('affirmation', 'Setiap napas membawa saya lebih dekat ke kedamaian batin.', NULL, 'pernapasan');

-- Create table for meditation music/sounds (for future feature)
CREATE TABLE IF NOT EXISTS public.meditation_sounds (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- nature, instrumental, binaural, white-noise
  file_url TEXT NOT NULL,
  duration_seconds INTEGER,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

INSERT INTO public.meditation_sounds (title, description, category, file_url, duration_seconds, is_premium) VALUES
('Suara Hujan Lembut', 'Suara hujan yang menenangkan untuk meditasi dan relaksasi', 'nature', '/audio/sounds/gentle-rain.mp3', 1800, false),
('Ombak Pantai', 'Suara ombak pantai yang damai untuk meditasi mendalam', 'nature', '/audio/sounds/ocean-waves.mp3', 1800, false),
('Kicauan Burung Pagi', 'Suara burung-burung di pagi hari yang menyegarkan', 'nature', '/audio/sounds/morning-birds.mp3', 1800, false),
('Tibetan Singing Bowl', 'Bunyi mangkuk Tibet untuk meditasi spiritual', 'instrumental', '/audio/sounds/singing-bowl.mp3', 600, true),
('Piano Ambient', 'Musik piano lembut untuk meditasi dan kontemplasi', 'instrumental', '/audio/sounds/ambient-piano.mp3', 2400, true),
('White Noise', 'Suara putih untuk fokus dan konsentrasi', 'white-noise', '/audio/sounds/white-noise.mp3', 3600, false);

-- Update existing courses with proper image and audio URLs
UPDATE public.courses SET 
  image_url = '/images/courses/' || LOWER(REPLACE(title, ' ', '-')) || '.jpg',
  audio_url = '/audio/courses/' || LOWER(REPLACE(title, ' ', '-')) || '.mp3'
WHERE image_url IS NULL OR audio_url IS NULL;

-- Create indexes for better query performance on seed data
CREATE INDEX IF NOT EXISTS idx_daily_inspirations_type ON public.daily_inspirations(type);
CREATE INDEX IF NOT EXISTS idx_daily_inspirations_category ON public.daily_inspirations(category);
CREATE INDEX IF NOT EXISTS idx_meditation_sounds_category ON public.meditation_sounds(category);
CREATE INDEX IF NOT EXISTS idx_user_settings_key ON public.user_settings(setting_key);

-- Grant appropriate permissions
ALTER TABLE public.daily_inspirations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meditation_sounds ENABLE ROW LEVEL SECURITY;

-- Public read access for inspirations and sounds
CREATE POLICY "Anyone can view daily inspirations" ON public.daily_inspirations
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view meditation sounds" ON public.meditation_sounds
  FOR SELECT USING (true);

-- Comments for documentation
COMMENT ON TABLE public.daily_inspirations IS 'Daily quotes, tips, and affirmations for user inspiration';
COMMENT ON TABLE public.meditation_sounds IS 'Background sounds and music for meditation sessions';
COMMENT ON TABLE public.courses IS 'Meditation courses and guided sessions';
COMMENT ON TABLE public.users IS 'User profiles with preferences and progress tracking';
COMMENT ON TABLE public.meditation_sessions IS 'Individual meditation session records';
COMMENT ON TABLE public.achievements IS 'User achievements and milestones';
COMMENT ON TABLE public.journal_entries IS 'User journal entries and reflections';
COMMENT ON TABLE public.user_course_progress IS 'Progress tracking for courses';
COMMENT ON TABLE public.bookmarks IS 'User bookmarked content';
COMMENT ON TABLE public.user_settings IS 'Flexible user settings storage';
