-- Fix database schema to match application expectations
-- Run this in your Supabase SQL Editor

-- 1. Create maintenance_settings table (rename from maintenance_status if needed)
DROP TABLE IF EXISTS maintenance_status CASCADE;
CREATE TABLE maintenance_settings (
  id TEXT PRIMARY KEY DEFAULT 'maintenance',
  is_maintenance_mode BOOLEAN DEFAULT false,
  drop_date TIMESTAMP WITH TIME ZONE,
  maintenance_message TEXT DEFAULT 'We are currently performing maintenance. Please check back later.',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default maintenance settings
INSERT INTO maintenance_settings (id, is_maintenance_mode, drop_date, maintenance_message) VALUES
('maintenance', false, NOW() + INTERVAL '30 days', 'We are currently performing maintenance. Please check back later.')
ON CONFLICT (id) DO NOTHING;

-- 2. Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  wilaya TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Fix orders table structure
-- First, let's check if orders table exists and what columns it has
-- Add missing columns to orders table if they don't exist
DO $$ 
BEGIN
    -- Add customer_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_id') THEN
        ALTER TABLE orders ADD COLUMN customer_id TEXT;
        RAISE NOTICE 'Added customer_id column to orders table';
    ELSE
        RAISE NOTICE 'customer_id column already exists in orders table';
    END IF;
    
    -- Add items column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'items') THEN
        ALTER TABLE orders ADD COLUMN items JSONB NOT NULL DEFAULT '[]';
        RAISE NOTICE 'Added items column to orders table';
    ELSE
        RAISE NOTICE 'items column already exists in orders table';
    END IF;
    
    -- Add total column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'total') THEN
        ALTER TABLE orders ADD COLUMN total DECIMAL(10,2) NOT NULL DEFAULT 0;
        RAISE NOTICE 'Added total column to orders table';
    ELSE
        RAISE NOTICE 'total column already exists in orders table';
    END IF;
    
    -- Add shipping_cost column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_cost') THEN
        ALTER TABLE orders ADD COLUMN shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0;
        RAISE NOTICE 'Added shipping_cost column to orders table';
    ELSE
        RAISE NOTICE 'shipping_cost column already exists in orders table';
    END IF;
    
    -- Add shipping_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_type') THEN
        ALTER TABLE orders ADD COLUMN shipping_type TEXT NOT NULL DEFAULT 'homeDelivery';
        RAISE NOTICE 'Added shipping_type column to orders table';
    ELSE
        RAISE NOTICE 'shipping_type column already exists in orders table';
    END IF;
    
    -- Add payment_method column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_method') THEN
        ALTER TABLE orders ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'cod';
        RAISE NOTICE 'Added payment_method column to orders table';
    ELSE
        RAISE NOTICE 'payment_method column already exists in orders table';
    END IF;
    
    -- Add payment_status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_status') THEN
        ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'pending';
        RAISE NOTICE 'Added payment_status column to orders table';
    ELSE
        RAISE NOTICE 'payment_status column already exists in orders table';
    END IF;
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'status') THEN
        ALTER TABLE orders ADD COLUMN status TEXT DEFAULT 'pending';
        RAISE NOTICE 'Added status column to orders table';
    ELSE
        RAISE NOTICE 'status column already exists in orders table';
    END IF;
    
    -- Add tracking_number column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'tracking_number') THEN
        ALTER TABLE orders ADD COLUMN tracking_number TEXT;
        RAISE NOTICE 'Added tracking_number column to orders table';
    ELSE
        RAISE NOTICE 'tracking_number column already exists in orders table';
    END IF;
    
    -- Add order_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'order_date') THEN
        ALTER TABLE orders ADD COLUMN order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added order_date column to orders table';
    ELSE
        RAISE NOTICE 'order_date column already exists in orders table';
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'created_at') THEN
        ALTER TABLE orders ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added created_at column to orders table';
    ELSE
        RAISE NOTICE 'created_at column already exists in orders table';
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'updated_at') THEN
        ALTER TABLE orders ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to orders table';
    ELSE
        RAISE NOTICE 'updated_at column already exists in orders table';
    END IF;
END $$;

-- 4. Enable Row Level Security
ALTER TABLE maintenance_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 5. Create policies for public access
-- Drop existing policies first
DROP POLICY IF EXISTS "Allow public read access to maintenance_settings" ON maintenance_settings;
DROP POLICY IF EXISTS "Allow public read access to customers" ON customers;
DROP POLICY IF EXISTS "Allow public insert to customers" ON customers;
DROP POLICY IF EXISTS "Allow public read access to orders" ON orders;
DROP POLICY IF EXISTS "Allow public insert to orders" ON orders;

-- Create new policies
CREATE POLICY "Allow public read access to maintenance_settings" ON maintenance_settings FOR SELECT USING (true);
CREATE POLICY "Allow public read access to customers" ON customers FOR SELECT USING (true);
CREATE POLICY "Allow public insert to customers" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read access to orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert to orders" ON orders FOR INSERT WITH CHECK (true);

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_maintenance_settings_id ON maintenance_settings(id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);

-- 7. Show current table structures
SELECT 'maintenance_settings' as table_name, column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'maintenance_settings' 
ORDER BY ordinal_position;

SELECT 'customers' as table_name, column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'customers' 
ORDER BY ordinal_position;

SELECT 'orders' as table_name, column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;
