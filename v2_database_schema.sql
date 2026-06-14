-- =====================================================
-- syncplay eSports v2 - Supabase Database Extensions
-- Run this in your Supabase SQL Editor to set up:
-- 1. Spectator tickets table
-- 2. Profiles table (linked to Auth.users)
-- 3. Chat rooms & messages tables
-- =====================================================

-- 1. Create Spectator Tickets Table
CREATE TABLE IF NOT EXISTS public.spectator_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  ticket_quantity INTEGER NOT NULL DEFAULT 1,
  payment_reference TEXT UNIQUE NOT NULL,
  payment_status TEXT DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  amount_paid INTEGER NOT NULL, -- in kobo (e.g. 500000 = ₦5,000)
  tournament_id TEXT DEFAULT '2v2-july-2026'
);

-- Enable RLS for spectator_tickets
ALTER TABLE public.spectator_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous insert for tickets" ON public.spectator_tickets;
CREATE POLICY "Allow anonymous insert for tickets" ON public.spectator_tickets
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous read for tickets" ON public.spectator_tickets;
CREATE POLICY "Allow anonymous read for tickets" ON public.spectator_tickets
  FOR SELECT TO anon USING (true);

-- 2. Create Profiles Table (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  username TEXT UNIQUE NOT NULL, -- Full Name
  phone TEXT,
  gamer_tag TEXT,
  platform TEXT DEFAULT 'PlayStation',
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read profiles" ON public.profiles;
CREATE POLICY "Allow public read profiles" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;
CREATE POLICY "Allow users to update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow users to insert own profile" ON public.profiles;
CREATE POLICY "Allow users to insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Create Chat Rooms Table
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  room_type TEXT DEFAULT 'group' CHECK (room_type IN ('group', 'dm')),
  is_private BOOLEAN DEFAULT false
);

-- Alter table to add columns if they do not exist
ALTER TABLE public.chat_rooms ADD COLUMN IF NOT EXISTS room_type TEXT DEFAULT 'group' CHECK (room_type IN ('group', 'dm'));
ALTER TABLE public.chat_rooms ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;

-- Enable RLS for chat_rooms
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to read rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "Allow users to read accessible rooms" ON public.chat_rooms;
CREATE POLICY "Allow users to read accessible rooms" ON public.chat_rooms
  FOR SELECT TO authenticated 
  USING (
    is_private = false OR 
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.chat_room_members 
      WHERE room_id = id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Allow authenticated users to create rooms" ON public.chat_rooms;
CREATE POLICY "Allow authenticated users to create rooms" ON public.chat_rooms
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Allow users to delete own rooms" ON public.chat_rooms;
CREATE POLICY "Allow users to delete own rooms" ON public.chat_rooms
  FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- 4. Create Chat Room Members mapping table
CREATE TABLE IF NOT EXISTS public.chat_room_members (
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (room_id, user_id)
);

-- Enable RLS for chat_room_members
ALTER TABLE public.chat_room_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow members to read room memberships" ON public.chat_room_members;
CREATE POLICY "Allow members to read room memberships" ON public.chat_room_members
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow members to insert room memberships" ON public.chat_room_members;
CREATE POLICY "Allow members to insert room memberships" ON public.chat_room_members
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow members to delete room memberships" ON public.chat_room_members;
CREATE POLICY "Allow members to delete room memberships" ON public.chat_room_members
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 5. Create Chat Messages Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE, -- NULL for Global Chat
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to read messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow users to read accessible messages" ON public.chat_messages;
CREATE POLICY "Allow users to read accessible messages" ON public.chat_messages
  FOR SELECT TO authenticated 
  USING (
    room_id IS NULL OR 
    EXISTS (
      SELECT 1 FROM public.chat_rooms r
      WHERE r.id = room_id AND (
        r.is_private = false OR 
        EXISTS (
          SELECT 1 FROM public.chat_room_members m
          WHERE m.room_id = r.id AND m.user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Allow authenticated users to insert messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow members to insert messages" ON public.chat_messages;
CREATE POLICY "Allow members to insert messages" ON public.chat_messages
  FOR INSERT TO authenticated 
  WITH CHECK (
    auth.uid() = sender_id AND (
      room_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.chat_room_members 
        WHERE room_id = chat_messages.room_id AND user_id = auth.uid()
      )
    )
  );

-- Enable Realtime Replication for chat
-- Check if publication exists, if not it will be managed by Supabase automatically
-- When running in editor, ensure chat_messages, chat_rooms, and chat_room_members are added to publication:
-- ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
-- ALTER PUBLICATION supabase_realtime ADD TABLE chat_rooms;
-- ALTER PUBLICATION supabase_realtime ADD TABLE chat_room_members;

-- 5. Trigger profile creation on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, phone, gamer_tag, platform)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', 'Player_' || substr(new.id::text, 1, 8)),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'gamer_tag',
    COALESCE(new.raw_user_meta_data->>'platform', 'PlayStation')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Create Player Ratings Table (for weekly performance updates)
CREATE TABLE IF NOT EXISTS public.player_ratings (
  gamer_tag TEXT PRIMARY KEY,
  attack INTEGER NOT NULL DEFAULT 50 CHECK (attack >= 0 AND attack <= 100),
  defense INTEGER NOT NULL DEFAULT 50 CHECK (defense >= 0 AND defense <= 100),
  passing INTEGER NOT NULL DEFAULT 50 CHECK (passing >= 0 AND passing <= 100),
  consistency INTEGER NOT NULL DEFAULT 50 CHECK (consistency >= 0 AND consistency <= 100),
  clutch INTEGER NOT NULL DEFAULT 50 CHECK (clutch >= 0 AND clutch <= 100),
  mp INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  goals INTEGER NOT NULL DEFAULT 0,
  gd INTEGER NOT NULL DEFAULT 0,
  points INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for player_ratings
ALTER TABLE public.player_ratings ENABLE ROW LEVEL SECURITY;

-- Allow public read of player ratings
DROP POLICY IF EXISTS "Allow public read player ratings" ON public.player_ratings;
CREATE POLICY "Allow public read player ratings" ON public.player_ratings
  FOR SELECT USING (true);

-- Allow authenticated admins to manage player ratings
DROP POLICY IF EXISTS "Allow admins to manage player ratings" ON public.player_ratings;
CREATE POLICY "Allow admins to manage player ratings" ON public.player_ratings
  FOR ALL TO authenticated
  USING (
    (auth.jwt() ->> 'email') = 'admin@syncplay.com' OR 
    (auth.jwt() ->> 'email') LIKE '%@syncplay.co' OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );
