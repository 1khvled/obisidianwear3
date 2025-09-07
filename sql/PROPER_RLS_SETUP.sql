-- PROPER RLS SETUP: Enable RLS with correct policies
-- Run this AFTER the quick fix to properly secure your database

-- Re-enable RLS for all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE wilaya_tariffs ENABLE ROW LEVEL SECURITY;

-- Create proper policies for products table
CREATE POLICY "Allow public read access to products" ON products 
FOR SELECT USING (true);

CREATE POLICY "Allow public insert to products" ON products 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to products" ON products 
FOR UPDATE USING (true);

CREATE POLICY "Allow public delete to products" ON products 
FOR DELETE USING (true);

-- Create proper policies for orders table
CREATE POLICY "Allow public read access to orders" ON orders 
FOR SELECT USING (true);

CREATE POLICY "Allow public insert to orders" ON orders 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to orders" ON orders 
FOR UPDATE USING (true);

CREATE POLICY "Allow public delete to orders" ON orders 
FOR DELETE USING (true);

-- Create proper policies for customers table
CREATE POLICY "Allow public read access to customers" ON customers 
FOR SELECT USING (true);

CREATE POLICY "Allow public insert to customers" ON customers 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to customers" ON customers 
FOR UPDATE USING (true);

CREATE POLICY "Allow public delete to customers" ON customers 
FOR DELETE USING (true);

-- Create proper policies for wilaya_tariffs table
CREATE POLICY "Allow public read access to wilaya_tariffs" ON wilaya_tariffs 
FOR SELECT USING (true);

CREATE POLICY "Allow public insert to wilaya_tariffs" ON wilaya_tariffs 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to wilaya_tariffs" ON wilaya_tariffs 
FOR UPDATE USING (true);

CREATE POLICY "Allow public delete to wilaya_tariffs" ON wilaya_tariffs 
FOR DELETE USING (true);

-- Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('products', 'orders', 'customers', 'wilaya_tariffs')
ORDER BY tablename, policyname;
