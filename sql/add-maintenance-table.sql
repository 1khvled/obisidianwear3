-- Add maintenance_settings table to Supabase database
-- This table stores the maintenance mode settings and drop date

CREATE TABLE IF NOT EXISTS maintenance_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  store_status BOOLEAN NOT NULL DEFAULT true,
  drop_date TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO maintenance_settings (id, store_status, drop_date)
VALUES ('default', true, NOW() + INTERVAL '30 days')
ON CONFLICT (id) DO NOTHING;

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_maintenance_settings_id ON maintenance_settings(id);

-- Add RLS (Row Level Security) policies
ALTER TABLE maintenance_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for checking store status)
CREATE POLICY "Allow public read access" ON maintenance_settings
  FOR SELECT USING (true);

-- Allow public write access (for updating settings from admin)
CREATE POLICY "Allow public write access" ON maintenance_settings
  FOR ALL USING (true);

-- Add a comment to the table
COMMENT ON TABLE maintenance_settings IS 'Stores maintenance mode settings and drop date for the store';
COMMENT ON COLUMN maintenance_settings.store_status IS 'Whether the store is open (true) or in maintenance mode (false)';
COMMENT ON COLUMN maintenance_settings.drop_date IS 'The date and time for the next product drop';
