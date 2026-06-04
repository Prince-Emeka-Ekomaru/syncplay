-- =====================================================
-- Add Player Photo Columns to Registrations Table
-- For Second Edition Tournament (May 2026)
-- =====================================================

-- Add player photo columns if they don't exist
DO $$ 
BEGIN
  -- Add player1_photo_url if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'registrations' AND column_name = 'player1_photo_url'
  ) THEN
    ALTER TABLE registrations ADD COLUMN player1_photo_url TEXT;
  END IF;

  -- Add player2_photo_url if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'registrations' AND column_name = 'player2_photo_url'
  ) THEN
    ALTER TABLE registrations ADD COLUMN player2_photo_url TEXT;
  END IF;
END $$;

-- =====================================================
-- Success message
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Player photo columns added successfully!';
  RAISE NOTICE '📸 player1_photo_url column added';
  RAISE NOTICE '📸 player2_photo_url column added';
END $$;
