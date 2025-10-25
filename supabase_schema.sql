-- =====================================================
-- syncplay eSports - Supabase Database Schema
-- Tournament Registration System
-- =====================================================

-- =====================================================
-- Create registrations table
-- =====================================================
CREATE TABLE IF NOT EXISTS registrations (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Payment Information
  payment_reference TEXT UNIQUE NOT NULL,
  payment_status TEXT DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_amount INTEGER DEFAULT 10000000, -- 100,000 Naira in kobo
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Team Information
  team_name TEXT NOT NULL,
  
  -- Player 1 Information
  player1_name TEXT NOT NULL,
  player1_email TEXT NOT NULL,
  player1_phone TEXT NOT NULL,
  player1_gamer_tag TEXT NOT NULL,
  player1_platform TEXT DEFAULT 'PlayStation',
  player1_tournament_id TEXT, -- Auto-generated: SP-2025-001
  
  -- Player 2 Information
  player2_name TEXT NOT NULL,
  player2_email TEXT NOT NULL,
  player2_phone TEXT NOT NULL,
  player2_gamer_tag TEXT NOT NULL,
  player2_platform TEXT DEFAULT 'PlayStation',
  player2_tournament_id TEXT, -- Auto-generated: SP-2025-002
  
  -- Tournament Information
  tournament_id TEXT DEFAULT '2v2-nov-2025',
  registration_source TEXT DEFAULT 'website',
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'disqualified')),
  
  -- Notes (for admin use)
  admin_notes TEXT
);

-- =====================================================
-- Add new columns if they don't exist (for existing tables)
-- =====================================================
DO $$ 
BEGIN
  -- Add player1_tournament_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'registrations' AND column_name = 'player1_tournament_id'
  ) THEN
    ALTER TABLE registrations ADD COLUMN player1_tournament_id TEXT;
  END IF;

  -- Add player2_tournament_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'registrations' AND column_name = 'player2_tournament_id'
  ) THEN
    ALTER TABLE registrations ADD COLUMN player2_tournament_id TEXT;
  END IF;
END $$;

-- =====================================================
-- Create indexes for performance
-- =====================================================

-- Create index on payment_reference for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_reference ON registrations(payment_reference);

-- Create index on tournament_id for filtering
CREATE INDEX IF NOT EXISTS idx_tournament_id ON registrations(tournament_id);

-- Create index on payment_status for counting
CREATE INDEX IF NOT EXISTS idx_payment_status ON registrations(payment_status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_created_at ON registrations(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running this script)
DROP POLICY IF EXISTS "Allow anonymous insert" ON registrations;
DROP POLICY IF EXISTS "Allow anonymous select" ON registrations;
DROP POLICY IF EXISTS "Allow authenticated full access" ON registrations;

-- Policy: Allow anonymous users to INSERT (for registration)
CREATE POLICY "Allow anonymous insert" ON registrations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Allow anonymous users to SELECT (to check count)
CREATE POLICY "Allow anonymous select" ON registrations
  FOR SELECT
  TO anon
  USING (true);

-- Policy: Allow authenticated users full access (for admin)
CREATE POLICY "Allow authenticated full access" ON registrations
  FOR ALL
  TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists before creating
DROP TRIGGER IF EXISTS update_registrations_updated_at ON registrations;

CREATE TRIGGER update_registrations_updated_at
  BEFORE UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Auto-generate Tournament Player IDs
-- =====================================================

CREATE OR REPLACE FUNCTION generate_tournament_player_ids()
RETURNS TRIGGER AS $$
DECLARE
  total_players INTEGER;
  player1_num TEXT;
  player2_num TEXT;
BEGIN
  -- Count total players already registered (each registration = 2 players)
  SELECT COUNT(*) * 2 INTO total_players FROM registrations;
  
  -- Generate Player 1 ID (e.g., SP-2025-001)
  player1_num := LPAD((total_players + 1)::TEXT, 3, '0');
  NEW.player1_tournament_id := 'SP-2025-' || player1_num;
  
  -- Generate Player 2 ID (e.g., SP-2025-002)
  player2_num := LPAD((total_players + 2)::TEXT, 3, '0');
  NEW.player2_tournament_id := 'SP-2025-' || player2_num;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists before creating
DROP TRIGGER IF EXISTS assign_tournament_player_ids ON registrations;

CREATE TRIGGER assign_tournament_player_ids
  BEFORE INSERT ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION generate_tournament_player_ids();

-- =====================================================
-- Optional: Create a view for easy admin querying
-- =====================================================

CREATE OR REPLACE VIEW registration_summary AS
SELECT 
  id,
  created_at,
  team_name,
  player1_name,
  player1_email,
  player1_phone,
  player1_gamer_tag,
  player2_name,
  player2_email,
  player2_phone,
  player2_gamer_tag,
  payment_reference,
  payment_status,
  tournament_id,
  status
FROM registrations
WHERE payment_status = 'completed'
ORDER BY created_at DESC;

-- =====================================================
-- Success message
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Supabase schema created successfully!';
  RAISE NOTICE '📊 Table: registrations';
  RAISE NOTICE '🔒 Row Level Security enabled';
  RAISE NOTICE '📈 Indexes created for performance';
  RAISE NOTICE '👀 View: registration_summary';
END $$;

