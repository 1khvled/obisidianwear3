-- Supabase Database Setup for ObisidianWear
-- Run this SQL in your Supabase SQL Editor

-- Create products table
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
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

-- Create customers table
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

-- Create wilaya_tariffs table
CREATE TABLE IF NOT EXISTS wilaya_tariffs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  home_delivery INTEGER NOT NULL,
  stop_desk INTEGER NOT NULL,
  "order" INTEGER NOT NULL,
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

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE wilaya_tariffs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is an e-commerce site)
CREATE POLICY "Allow public read access to products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public read access to wilaya_tariffs" ON wilaya_tariffs FOR SELECT USING (true);

-- Allow public to create orders and customers
CREATE POLICY "Allow public insert to orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert to customers" ON customers FOR INSERT WITH CHECK (true);

-- Allow public to read their own orders (if needed)
CREATE POLICY "Allow public read access to orders" ON orders FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_wilaya_tariffs_order ON wilaya_tariffs("order");
