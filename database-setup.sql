-- Database setup for Obsidian Wear
-- Run this in your Supabase SQL editor

-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    original_price NUMERIC,
    image TEXT,
    images TEXT[] DEFAULT '{}',
    stock JSONB DEFAULT '{}',
    category TEXT,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sizes TEXT[] DEFAULT '{}',
    colors TEXT[] DEFAULT '{}',
    in_stock BOOLEAN DEFAULT true,
    rating NUMERIC DEFAULT 0,
    reviews INTEGER DEFAULT 0,
    sku TEXT,
    weight NUMERIC,
    dimensions JSONB,
    tags TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'available'
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
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
    subtotal NUMERIC DEFAULT 0,
    shipping_cost NUMERIC DEFAULT 0,
    total NUMERIC NOT NULL,
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

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
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

-- Create maintenance_status table
CREATE TABLE IF NOT EXISTS maintenance_status (
    id TEXT PRIMARY KEY DEFAULT 'maintenance',
    is_maintenance BOOLEAN DEFAULT false,
    drop_date TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wilaya_tariffs table
CREATE TABLE IF NOT EXISTS wilaya_tariffs (
    id SERIAL PRIMARY KEY,
    wilaya_name TEXT NOT NULL,
    wilaya_code INTEGER NOT NULL,
    home_delivery NUMERIC NOT NULL,
    express_delivery NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default maintenance status
INSERT INTO maintenance_status (id, is_maintenance, drop_date) 
VALUES ('maintenance', false, NULL) 
ON CONFLICT (id) DO NOTHING;

-- Insert sample wilaya tariffs
INSERT INTO wilaya_tariffs (wilaya_name, wilaya_code, home_delivery, express_delivery) VALUES
('Adrar', 1, 800, 1200),
('Chlef', 2, 400, 600),
('Laghouat', 3, 500, 700),
('Oum El Bouaghi', 4, 400, 600),
('Batna', 5, 400, 600),
('Béjaïa', 6, 300, 500),
('Biskra', 7, 500, 700),
('Béchar', 8, 800, 1200),
('Blida', 9, 200, 400),
('Bouira', 10, 300, 500),
('Tamanrasset', 11, 1000, 1500),
('Tébessa', 12, 500, 700),
('Tlemcen', 13, 400, 600),
('Tiaret', 14, 400, 600),
('Tizi Ouzou', 15, 300, 500),
('Alger', 16, 200, 400),
('Djelfa', 17, 500, 700),
('Jijel', 18, 300, 500),
('Sétif', 19, 400, 600),
('Saïda', 20, 500, 700),
('Skikda', 21, 300, 500),
('Sidi Bel Abbès', 22, 400, 600),
('Annaba', 23, 300, 500),
('Guelma', 24, 400, 600),
('Constantine', 25, 400, 600),
('Médéa', 26, 300, 500),
('Mostaganem', 27, 400, 600),
('M\'Sila', 28, 500, 700),
('Mascara', 29, 400, 600),
('Ouargla', 30, 600, 900),
('Oran', 31, 300, 500),
('El Bayadh', 32, 600, 900),
('Illizi', 33, 1000, 1500),
('Bordj Bou Arreridj', 34, 400, 600),
('Boumerdès', 35, 200, 400),
('El Tarf', 36, 300, 500),
('Tindouf', 37, 1000, 1500),
('Tissemsilt', 38, 400, 600),
('El Oued', 39, 600, 900),
('Khenchela', 40, 500, 700),
('Souk Ahras', 41, 400, 600),
('Tipaza', 42, 200, 400),
('Mila', 43, 400, 600),
('Aïn Defla', 44, 300, 500),
('Naâma', 45, 600, 900),
('Aïn Témouchent', 46, 400, 600),
('Ghardaïa', 47, 600, 900),
('Relizane', 48, 400, 600)
ON CONFLICT (wilaya_code) DO NOTHING;

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE wilaya_tariffs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access to products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public read access to orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow public read access to customers" ON customers FOR SELECT USING (true);
CREATE POLICY "Allow public read access to maintenance_status" ON maintenance_status FOR SELECT USING (true);
CREATE POLICY "Allow public read access to wilaya_tariffs" ON wilaya_tariffs FOR SELECT USING (true);

-- Allow inserts for orders and customers
CREATE POLICY "Allow public insert to orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert to customers" ON customers FOR INSERT WITH CHECK (true);

-- Allow updates for maintenance_status
CREATE POLICY "Allow public update to maintenance_status" ON maintenance_status FOR UPDATE USING (true);
