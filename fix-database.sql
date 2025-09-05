-- Fix Database Schema - Keep products, recreate everything else
-- Run this in your Supabase SQL Editor

-- Drop old tables (except products)
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS maintenance_status CASCADE;
DROP TABLE IF EXISTS wilaya_tariffs CASCADE;

-- Drop any views that depend on these tables
DROP VIEW IF EXISTS current_maintenance_status CASCADE;
DROP VIEW IF EXISTS order_stats CASCADE;
DROP VIEW IF EXISTS recent_orders CASCADE;

-- Create maintenance_status table
CREATE TABLE maintenance_status (
  id TEXT PRIMARY KEY DEFAULT 'maintenance',
  is_maintenance BOOLEAN DEFAULT false,
  drop_date TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default maintenance record
INSERT INTO maintenance_status (id, is_maintenance, drop_date) 
VALUES ('maintenance', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE maintenance_status ENABLE ROW LEVEL SECURITY;

-- Create policies for maintenance_status
CREATE POLICY "Allow public read access to maintenance_status" 
ON maintenance_status FOR SELECT 
USING (true);

CREATE POLICY "Allow public update access to maintenance_status" 
ON maintenance_status FOR UPDATE 
USING (true);

-- Create orders table with correct schema
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  wilaya_id INTEGER,
  wilaya_name TEXT,
  product_id TEXT NOT NULL,
  product_name TEXT,
  product_image TEXT,
  selected_size TEXT,
  selected_color TEXT,
  quantity INTEGER DEFAULT 1,
  subtotal DECIMAL(10,2) DEFAULT 0,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  shipping_type TEXT DEFAULT 'homeDelivery',
  payment_method TEXT DEFAULT 'cod',
  payment_status TEXT DEFAULT 'pending',
  status TEXT DEFAULT 'pending',
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  tracking_number TEXT,
  estimated_delivery TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies for orders
CREATE POLICY "Allow public read access to orders" 
ON orders FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access to orders" 
ON orders FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access to orders" 
ON orders FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete access to orders" 
ON orders FOR DELETE 
USING (true);

-- Create customers table
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  wilaya_id INTEGER,
  wilaya_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create policies for customers
CREATE POLICY "Allow public read access to customers" 
ON customers FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access to customers" 
ON customers FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access to customers" 
ON customers FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete access to customers" 
ON customers FOR DELETE 
USING (true);

-- Create wilaya_tariffs table
CREATE TABLE wilaya_tariffs (
  id SERIAL PRIMARY KEY,
  wilaya_name TEXT NOT NULL,
  wilaya_code INTEGER NOT NULL,
  home_delivery DECIMAL(10,2) NOT NULL,
  express_delivery DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE wilaya_tariffs ENABLE ROW LEVEL SECURITY;

-- Create policies for wilaya_tariffs
CREATE POLICY "Allow public read access to wilaya_tariffs" 
ON wilaya_tariffs FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access to wilaya_tariffs" 
ON wilaya_tariffs FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access to wilaya_tariffs" 
ON wilaya_tariffs FOR UPDATE 
USING (true);

-- Insert some sample wilaya data
INSERT INTO wilaya_tariffs (wilaya_name, wilaya_code, home_delivery, express_delivery) VALUES
('Alger', 16, 400, 800),
('Oran', 31, 500, 1000),
('Constantine', 25, 600, 1200),
('Annaba', 23, 700, 1400),
('Blida', 9, 450, 900)
ON CONFLICT DO NOTHING;

-- Create helpful views
CREATE VIEW current_maintenance_status AS
SELECT * FROM maintenance_status WHERE id = 'maintenance';

CREATE VIEW order_stats AS
SELECT 
  COUNT(*) as total_orders,
  SUM(total) as total_revenue,
  AVG(total) as average_order_value,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders
FROM orders;

CREATE VIEW recent_orders AS
SELECT 
  id,
  customer_name,
  product_name,
  total,
  status,
  order_date
FROM orders 
ORDER BY order_date DESC 
LIMIT 10;

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
