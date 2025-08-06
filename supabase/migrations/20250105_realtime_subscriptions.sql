-- Real-time Subscriptions and Live Features Setup
-- This migration sets up real-time functionality for the meditation app

-- Enable realtime for tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meditation_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.achievements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_course_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE public.moods;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_activity;

-- Create presence tracking for live meditation sessions
CREATE TABLE IF NOT EXISTS public.live_meditation_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('breathing', 'guided', 'silent', 'walking')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  expected_duration INTEGER NOT NULL CHECK (expected_duration > 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  current_phase TEXT, -- e.g., 'preparation', 'main', 'closing'
  heart_rate INTEGER, -- If connected to fitness device
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user_id) -- One active session per user
);

-- Community features for shared meditation experiences
CREATE TABLE IF NOT EXISTS public.community_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  host_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('breathing', 'guided', 'silent', 'walking')),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  max_participants INTEGER DEFAULT 50 CHECK (max_participants > 0),
  is_public BOOLEAN DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Participants in community sessions
CREATE TABLE IF NOT EXISTS public.community_session_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES public.community_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  status TEXT NOT NULL DEFAULT 'joined' CHECK (status IN ('joined', 'active', 'left', 'completed')),
  presence_data JSONB DEFAULT '{}'::jsonb,
  UNIQUE(session_id, user_id)
);

-- Real-time notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'achievement', 'reminder', 'community', 'system', 
    'streak_warning', 'milestone', 'friend_activity'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT FALSE,
  is_delivered BOOLEAN DEFAULT FALSE,
  delivery_method TEXT[] DEFAULT ARRAY['in_app'],
  scheduled_for TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- User presence for showing who's online/meditating
CREATE TABLE IF NOT EXISTS public.user_presence (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'meditating', 'away', 'offline')),
  activity TEXT, -- What they're currently doing
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  session_data JSONB DEFAULT '{}'::jsonb,
  device_info JSONB DEFAULT '{}'::jsonb
);

-- Meditation room/space sharing
CREATE TABLE IF NOT EXISTS public.meditation_rooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  max_occupancy INTEGER DEFAULT 10 CHECK (max_occupancy > 0),
  current_occupancy INTEGER DEFAULT 0 CHECK (current_occupancy >= 0),
  background_sound TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Room occupancy tracking
CREATE TABLE IF NOT EXISTS public.room_occupancy (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES public.meditation_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  left_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'meditating', 'left')),
  UNIQUE(room_id, user_id, joined_at)
);

-- Enable RLS for all new tables
ALTER TABLE public.live_meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meditation_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_occupancy ENABLE ROW LEVEL SECURITY;

-- RLS Policies for live meditation sessions
CREATE POLICY "Users can view own live sessions" ON public.live_meditation_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own live sessions" ON public.live_meditation_sessions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND expected_duration <= 180 -- Max 3 hours
  );

CREATE POLICY "Users can update own live sessions" ON public.live_meditation_sessions
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own live sessions" ON public.live_meditation_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Community sessions policies
CREATE POLICY "Anyone can view public community sessions" ON public.community_sessions
  FOR SELECT USING (
    is_public = true 
    OR host_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.community_session_participants 
      WHERE session_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create community sessions" ON public.community_sessions
  FOR INSERT WITH CHECK (auth.uid() = host_user_id);

CREATE POLICY "Hosts can update their sessions" ON public.community_sessions
  FOR UPDATE USING (auth.uid() = host_user_id)
  WITH CHECK (auth.uid() = host_user_id);

-- Participants policies
CREATE POLICY "Users can view session participants" ON public.community_session_participants
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.community_sessions cs 
      WHERE cs.id = session_id AND (cs.is_public = true OR cs.host_user_id = auth.uid())
    )
  );

CREATE POLICY "Users can join sessions" ON public.community_session_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their participation" ON public.community_session_participants
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' = 'service_role'
    OR auth.uid() = user_id -- Users can create certain types of notifications
  );

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User presence policies
CREATE POLICY "Users can view all presence" ON public.user_presence
  FOR SELECT USING (true); -- Public presence info

CREATE POLICY "Users can update own presence" ON public.user_presence
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own presence status" ON public.user_presence
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Meditation rooms policies
CREATE POLICY "Users can view accessible rooms" ON public.meditation_rooms
  FOR SELECT USING (
    is_public = true 
    OR created_by = auth.uid()
  );

CREATE POLICY "Users can create rooms" ON public.meditation_rooms
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their rooms" ON public.meditation_rooms
  FOR UPDATE USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Room occupancy policies
CREATE POLICY "Users can view room occupancy" ON public.room_occupancy
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.meditation_rooms mr 
      WHERE mr.id = room_id AND (mr.is_public = true OR mr.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can join rooms" ON public.room_occupancy
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their room status" ON public.room_occupancy
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Functions for real-time features

-- Update user presence
CREATE OR REPLACE FUNCTION public.update_user_presence(
  status_param TEXT,
  activity_param TEXT DEFAULT NULL,
  session_data_param JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_presence (user_id, status, activity, session_data, last_seen)
  VALUES (auth.uid(), status_param, activity_param, session_data_param, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    status = EXCLUDED.status,
    activity = EXCLUDED.activity,
    session_data = COALESCE(EXCLUDED.session_data, user_presence.session_data),
    last_seen = EXCLUDED.last_seen;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Complete live meditation session
CREATE OR REPLACE FUNCTION public.complete_live_session(session_uuid UUID)
RETURNS VOID AS $$
DECLARE
  session_record public.live_meditation_sessions%ROWTYPE;
BEGIN
  -- Get the session
  SELECT * INTO session_record
  FROM public.live_meditation_sessions
  WHERE id = session_uuid AND user_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session not found or access denied';
  END IF;
  
  -- Update session status
  UPDATE public.live_meditation_sessions
  SET status = 'completed', progress_percentage = 100
  WHERE id = session_uuid;
  
  -- Create permanent session record
  INSERT INTO public.meditation_sessions (
    user_id, 
    type, 
    duration_minutes, 
    completed_at,
    notes
  ) VALUES (
    session_record.user_id,
    session_record.session_type,
    session_record.expected_duration,
    NOW(),
    'Completed via live session'
  );
  
  -- Update user presence
  PERFORM public.update_user_presence('online', NULL, NULL);
  
  -- Remove from live sessions
  DELETE FROM public.live_meditation_sessions WHERE id = session_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Send notification
CREATE OR REPLACE FUNCTION public.send_notification(
  recipient_id UUID,
  notification_type TEXT,
  title_param TEXT,
  message_param TEXT,
  data_param JSONB DEFAULT NULL,
  schedule_for TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id, type, title, message, data, scheduled_for
  ) VALUES (
    recipient_id, notification_type, title_param, message_param, data_param, schedule_for
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Join meditation room
CREATE OR REPLACE FUNCTION public.join_meditation_room(room_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  room_record public.meditation_rooms%ROWTYPE;
  current_count INTEGER;
BEGIN
  -- Get room info
  SELECT * INTO room_record
  FROM public.meditation_rooms
  WHERE id = room_uuid;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Room not found';
  END IF;
  
  -- Check if room is accessible
  IF NOT room_record.is_public AND room_record.created_by != auth.uid() THEN
    RAISE EXCEPTION 'Access denied to private room';
  END IF;
  
  -- Check occupancy
  SELECT COUNT(*) INTO current_count
  FROM public.room_occupancy
  WHERE room_id = room_uuid AND status = 'active';
  
  IF current_count >= room_record.max_occupancy THEN
    RAISE EXCEPTION 'Room is full';
  END IF;
  
  -- Join room
  INSERT INTO public.room_occupancy (room_id, user_id, status)
  VALUES (room_uuid, auth.uid(), 'active')
  ON CONFLICT (room_id, user_id, joined_at) DO UPDATE SET
    status = 'active',
    left_at = NULL;
  
  -- Update room occupancy count
  UPDATE public.meditation_rooms
  SET current_occupancy = current_count + 1
  WHERE id = room_uuid;
  
  -- Update user presence
  PERFORM public.update_user_presence('meditating', 'in_room', jsonb_build_object('room_id', room_uuid));
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for real-time performance
CREATE INDEX IF NOT EXISTS idx_live_sessions_user_id ON public.live_meditation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_status ON public.live_meditation_sessions(status, last_activity);
CREATE INDEX IF NOT EXISTS idx_community_sessions_scheduled ON public.community_sessions(scheduled_at, status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_presence_status ON public.user_presence(status, last_seen);
CREATE INDEX IF NOT EXISTS idx_room_occupancy_active ON public.room_occupancy(room_id, status) WHERE status = 'active';

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_meditation_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_session_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meditation_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_occupancy;

-- Triggers for updated_at fields
CREATE TRIGGER update_community_sessions_updated_at 
  BEFORE UPDATE ON public.community_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meditation_rooms_updated_at 
  BEFORE UPDATE ON public.meditation_rooms 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE public.live_meditation_sessions IS 'Active meditation sessions for real-time tracking';
COMMENT ON TABLE public.community_sessions IS 'Group meditation sessions';
COMMENT ON TABLE public.notifications IS 'Real-time notifications system';
COMMENT ON TABLE public.user_presence IS 'User online status and activity';
COMMENT ON TABLE public.meditation_rooms IS 'Virtual meditation spaces for sharing';