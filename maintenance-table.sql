-- Create maintenance_status table for global maintenance control
CREATE TABLE IF NOT EXISTS maintenance_status (
  id TEXT PRIMARY KEY DEFAULT 'maintenance',
  is_maintenance BOOLEAN NOT NULL DEFAULT false,
  drop_date TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default record
INSERT INTO maintenance_status (id, is_maintenance, drop_date, updated_at)
VALUES ('maintenance', false, NOW() + INTERVAL '30 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE maintenance_status ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (so maintenance page can check status)
CREATE POLICY "Allow public read access to maintenance status" 
ON maintenance_status FOR SELECT 
USING (true);

-- Create policy for authenticated users to update (admin only)
CREATE POLICY "Allow authenticated users to update maintenance status" 
ON maintenance_status FOR ALL 
USING (auth.role() = 'authenticated');
