-- Add entry_fee column to payment_settings table
-- Run this in your Supabase SQL Editor

-- Add entry_fee column if it doesn't exist
ALTER TABLE payment_settings 
ADD COLUMN IF NOT EXISTS entry_fee INTEGER DEFAULT 5000000; -- 50,000 Naira in kobo

-- Update existing row with default if null
UPDATE payment_settings 
SET entry_fee = 5000000 
WHERE entry_fee IS NULL;

-- Add comment
COMMENT ON COLUMN payment_settings.entry_fee IS 'Tournament entry fee in kobo (e.g., 5000000 = 50,000 Naira)';

