-- Fix maintenance database - Simple and guaranteed to work
-- Run this in Supabase SQL Editor

-- Drop the table if it exists (to start fresh)
DROP TABLE IF EXISTS maintenance_status CASCADE;

-- Create the table
CREATE TABLE maintenance_status (
  id TEXT PRIMARY KEY DEFAULT 'maintenance',
  is_maintenance BOOLEAN NOT NULL DEFAULT false,
  drop_date TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the default record
INSERT INTO maintenance_status (id, is_maintenance, drop_date, updated_at)
VALUES ('maintenance', false, NOW() + INTERVAL '30 days', NOW());

-- Enable RLS
ALTER TABLE maintenance_status ENABLE ROW LEVEL SECURITY;

-- Create a simple policy that allows everything
CREATE POLICY "maintenance_policy" ON maintenance_status
FOR ALL USING (true);

-- Test the table
SELECT * FROM maintenance_status;
