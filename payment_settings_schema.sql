-- Payment Settings Table for Admin Control
-- Run this in your Supabase SQL Editor

-- Create payment_settings table
CREATE TABLE IF NOT EXISTS payment_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  active_gateway TEXT DEFAULT 'kora' CHECK (active_gateway IN ('kora')),
  kora_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings (idempotent)
INSERT INTO payment_settings (id, active_gateway, kora_enabled)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'kora',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_payment_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS payment_settings_updated_at ON payment_settings;
CREATE TRIGGER payment_settings_updated_at
  BEFORE UPDATE ON payment_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_settings_updated_at();

-- Enable RLS (Row Level Security)
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous read (to check which gateways are enabled)
DROP POLICY IF EXISTS "Allow anonymous read" ON payment_settings;
CREATE POLICY "Allow anonymous read" ON payment_settings
  FOR SELECT
  USING (true);

-- Policy: Allow authenticated admin write (you'll need to set up admin authentication)
-- For now, you can manually update in Supabase dashboard or use Service Role key
-- DROP POLICY IF EXISTS "Allow admin write" ON payment_settings;
-- CREATE POLICY "Allow admin write" ON payment_settings
--   FOR ALL
--   USING (auth.role() = 'admin');

-- Add payment_gateway column to registrations table if it doesn't exist
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS payment_gateway TEXT DEFAULT 'kora';

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_registrations_payment_gateway 
ON registrations(payment_gateway);

-- Comments for documentation
COMMENT ON TABLE payment_settings IS 'Admin-configurable payment gateway settings';
COMMENT ON COLUMN payment_settings.active_gateway IS 'Default payment gateway (kora)';
COMMENT ON COLUMN payment_settings.kora_enabled IS 'Whether Kora Pay is available for users';
COMMENT ON COLUMN registrations.payment_gateway IS 'Which payment gateway was used for this registration';

