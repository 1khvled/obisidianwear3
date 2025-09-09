-- Complete Supabase Database Setup for ObisidianWear
-- Run this SQL in your Supabase SQL Editor
-- This script creates tables if they don't exist and adds missing columns

-- Create products table if it doesn't exist
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  image TEXT,
  images TEXT[] DEFAULT '{}',
  stock JSONB DEFAULT '{}',
  category TEXT,
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  in_stock BOOLEAN DEFAULT true,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  sku TEXT,
  weight DECIMAL(8,2),
  dimensions JSONB,
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  custom_size_chart JSONB,
  use_custom_size_chart BOOLEAN DEFAULT false,
  size_chart_category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  items JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) NOT NULL,
  shipping_type TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  status TEXT DEFAULT 'pending',
  tracking_number TEXT,
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customers table if it doesn't exist
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

-- Create wilaya_tariffs table if it doesn't exist
CREATE TABLE IF NOT EXISTS wilaya_tariffs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  home_delivery INTEGER NOT NULL,
  stop_desk INTEGER NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create maintenance_settings table
CREATE TABLE IF NOT EXISTS maintenance_settings (
  id TEXT PRIMARY KEY DEFAULT 'maintenance',
  is_maintenance_mode BOOLEAN DEFAULT false,
  drop_date TIMESTAMP WITH TIME ZONE,
  maintenance_message TEXT DEFAULT 'We are currently performing maintenance. Please check back later.',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_users table for secure authentication
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default wilaya tariffs
INSERT INTO wilaya_tariffs (id, name, home_delivery, stop_desk, "order") VALUES
('1', 'Alger', 400, 200, 1),
('2', 'Oran', 500, 300, 2),
('3', 'Constantine', 600, 400, 3),
('4', 'Blida', 400, 200, 4),
('5', 'Setif', 500, 300, 5),
('6', 'Batna', 600, 400, 6),
('7', 'Annaba', 700, 500, 7),
('8', 'Sidi Bel Abbes', 600, 400, 8),
('9', 'Tlemcen', 700, 500, 9),
('10', 'Biskra', 800, 600, 10)
ON CONFLICT (id) DO NOTHING;

-- Insert default maintenance settings
INSERT INTO maintenance_settings (id, is_maintenance_mode, drop_date, maintenance_message) VALUES
('maintenance', false, NOW() + INTERVAL '30 days', 'We are currently performing maintenance. Please check back later.')
ON CONFLICT (id) DO NOTHING;

-- Insert default admin user (password: Dzt3ch456@)
-- Note: In production, use a proper password hashing library
INSERT INTO admin_users (id, username, password_hash, email, role) VALUES
('admin-1', 'khvled', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@obsidianwear.com', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Now safely add any missing columns to existing products table
DO $$ 
BEGIN
    -- Add original_price column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'original_price') THEN
        ALTER TABLE products ADD COLUMN original_price DECIMAL(10,2);
        RAISE NOTICE 'Added original_price column';
    ELSE
        RAISE NOTICE 'original_price column already exists';
    END IF;
    
    -- Add image column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image') THEN
        ALTER TABLE products ADD COLUMN image TEXT;
        RAISE NOTICE 'Added image column';
    ELSE
        RAISE NOTICE 'image column already exists';
    END IF;
    
    -- Add images column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'images') THEN
        ALTER TABLE products ADD COLUMN images TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added images column';
    ELSE
        RAISE NOTICE 'images column already exists';
    END IF;
    
    -- Add stock column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock') THEN
        ALTER TABLE products ADD COLUMN stock JSONB DEFAULT '{}';
        RAISE NOTICE 'Added stock column';
    ELSE
        RAISE NOTICE 'stock column already exists';
    END IF;
    
    -- Add category column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'category') THEN
        ALTER TABLE products ADD COLUMN category TEXT;
        RAISE NOTICE 'Added category column';
    ELSE
        RAISE NOTICE 'category column already exists';
    END IF;
    
    -- Add sizes column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sizes') THEN
        ALTER TABLE products ADD COLUMN sizes TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added sizes column';
    ELSE
        RAISE NOTICE 'sizes column already exists';
    END IF;
    
    -- Add colors column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'colors') THEN
        ALTER TABLE products ADD COLUMN colors TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added colors column';
    ELSE
        RAISE NOTICE 'colors column already exists';
    END IF;
    
    -- Add in_stock column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'in_stock') THEN
        ALTER TABLE products ADD COLUMN in_stock BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added in_stock column';
    ELSE
        RAISE NOTICE 'in_stock column already exists';
    END IF;
    
    -- Add rating column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'rating') THEN
        ALTER TABLE products ADD COLUMN rating DECIMAL(3,2) DEFAULT 0;
        RAISE NOTICE 'Added rating column';
    ELSE
        RAISE NOTICE 'rating column already exists';
    END IF;
    
    -- Add reviews column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'reviews') THEN
        ALTER TABLE products ADD COLUMN reviews INTEGER DEFAULT 0;
        RAISE NOTICE 'Added reviews column';
    ELSE
        RAISE NOTICE 'reviews column already exists';
    END IF;
    
    -- Add sku column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sku') THEN
        ALTER TABLE products ADD COLUMN sku TEXT;
        RAISE NOTICE 'Added sku column';
    ELSE
        RAISE NOTICE 'sku column already exists';
    END IF;
    
    -- Add weight column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'weight') THEN
        ALTER TABLE products ADD COLUMN weight DECIMAL(8,2);
        RAISE NOTICE 'Added weight column';
    ELSE
        RAISE NOTICE 'weight column already exists';
    END IF;
    
    -- Add dimensions column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'dimensions') THEN
        ALTER TABLE products ADD COLUMN dimensions JSONB;
        RAISE NOTICE 'Added dimensions column';
    ELSE
        RAISE NOTICE 'dimensions column already exists';
    END IF;
    
    -- Add tags column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'tags') THEN
        ALTER TABLE products ADD COLUMN tags TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added tags column';
    ELSE
        RAISE NOTICE 'tags column already exists';
    END IF;
    
    -- Add featured column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'featured') THEN
        ALTER TABLE products ADD COLUMN featured BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added featured column';
    ELSE
        RAISE NOTICE 'featured column already exists';
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'created_at') THEN
        ALTER TABLE products ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added created_at column';
    ELSE
        RAISE NOTICE 'created_at column already exists';
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'updated_at') THEN
        ALTER TABLE products ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column';
    ELSE
        RAISE NOTICE 'updated_at column already exists';
    END IF;
END $$;

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE wilaya_tariffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is an e-commerce site)
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access to products" ON products;
DROP POLICY IF EXISTS "Allow public read access to wilaya_tariffs" ON wilaya_tariffs;
DROP POLICY IF EXISTS "Allow public read access to maintenance_settings" ON maintenance_settings;
DROP POLICY IF EXISTS "Allow public insert to orders" ON orders;
DROP POLICY IF EXISTS "Allow public insert to customers" ON customers;
DROP POLICY IF EXISTS "Allow public read access to orders" ON orders;
DROP POLICY IF EXISTS "Allow admin access to maintenance_settings" ON maintenance_settings;
DROP POLICY IF EXISTS "Allow admin access to admin_users" ON admin_users;

-- Create new policies
CREATE POLICY "Allow public read access to products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public read access to wilaya_tariffs" ON wilaya_tariffs FOR SELECT USING (true);
CREATE POLICY "Allow public read access to maintenance_settings" ON maintenance_settings FOR SELECT USING (true);

-- Allow public to create orders and customers
CREATE POLICY "Allow public insert to orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert to customers" ON customers FOR INSERT WITH CHECK (true);

-- Allow public to read their own orders (if needed)
CREATE POLICY "Allow public read access to orders" ON orders FOR SELECT USING (true);

-- Admin-only policies for maintenance and admin users
CREATE POLICY "Allow admin access to maintenance_settings" ON maintenance_settings FOR ALL USING (true);
CREATE POLICY "Allow admin access to admin_users" ON admin_users FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_wilaya_tariffs_order ON wilaya_tariffs("order");

-- Show current products table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;
