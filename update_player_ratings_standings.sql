-- =========================================================================
-- syncplay eSports - Add National E-Soccer League Standings Columns
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/yzoqnqubnwoijrwtdroj
-- =========================================================================

-- Add standings columns to the player_ratings table (if they don't exist yet)
ALTER TABLE public.player_ratings ADD COLUMN IF NOT EXISTS mp INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.player_ratings ADD COLUMN IF NOT EXISTS wins INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.player_ratings ADD COLUMN IF NOT EXISTS draws INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.player_ratings ADD COLUMN IF NOT EXISTS losses INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.player_ratings ADD COLUMN IF NOT EXISTS goals INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.player_ratings ADD COLUMN IF NOT EXISTS gd INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.player_ratings ADD COLUMN IF NOT EXISTS points INTEGER NOT NULL DEFAULT 0;

-- Verification query
SELECT * FROM public.player_ratings LIMIT 1;
