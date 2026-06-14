-- =====================================================
-- Syncplay eSports v2 - News Table Migration
-- Run this in your Supabase SQL Editor to set up:
-- =====================================================

CREATE TABLE IF NOT EXISTS public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL, -- HTML / Rich content
  image_url TEXT,
  category TEXT DEFAULT 'announcements',
  author TEXT DEFAULT 'syncplay Team',
  published BOOLEAN DEFAULT true
);

-- Enable RLS for news
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Allow public read access to news
DROP POLICY IF EXISTS "Allow public read news" ON public.news;
CREATE POLICY "Allow public read news" ON public.news
  FOR SELECT USING (true);

-- Allow authenticated users (specifically admin) to insert/update/delete news
DROP POLICY IF EXISTS "Allow admins to manage news" ON public.news;
CREATE POLICY "Allow admins to manage news" ON public.news
  FOR ALL TO authenticated USING (true);

-- =====================================================
-- Seed Initial News (Fallback articles)
-- =====================================================
INSERT INTO public.news (title, excerpt, content, image_url, category, author)
VALUES 
(
  'Registration Now Open - 2v2 EA Sports FC 26 Tournament', 
  'Registration is officially open for the v2 tournament at Rufus and Bee''s, Twinwaters Lagos. 32 teams will compete for exclusive prizes!', 
  '<p>The syncplay eSports second edition tournament registration is officially open! Team entry fee is ₦50,000 per team, and spectator tickets are ₦5,000 (includes a loaded Rufus & Bee''s Buzz Card with gaming chips/credits).</p><p>We will host the next tournament at <strong>Rufus and Bee''s Lagos</strong> on <strong>July 29, 2026</strong>. 32 teams of 2 players per team will compete in a league phase of 3 matches, with the top 8 teams proceeding to home-and-away quarter-finals/semi-finals, and a single-match grand final.</p>',
  '/fc-26-1024x639.jpg',
  'announcements',
  'syncplay Team'
)
ON CONFLICT DO NOTHING;
