-- Fix RLS policies for made-to-order tables
-- This ensures that made-to-order orders can be properly fetched in the admin panel

-- First, let's check if the tables exist and their current RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('made_to_order_products', 'made_to_order_orders');

-- Disable RLS temporarily to fix any issues
ALTER TABLE made_to_order_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE made_to_order_orders DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE made_to_order_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE made_to_order_orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Made to order products are viewable by everyone" ON made_to_order_products;
DROP POLICY IF EXISTS "Made to order products are manageable by authenticated users" ON made_to_order_products;
DROP POLICY IF EXISTS "Made to order orders are viewable by authenticated users" ON made_to_order_orders;
DROP POLICY IF EXISTS "Made to order orders are manageable by authenticated users" ON made_to_order_orders;

-- Create proper policies for made_to_order_products
CREATE POLICY "Allow public read access to made_to_order_products" ON made_to_order_products 
FOR SELECT USING (true);

CREATE POLICY "Allow public insert to made_to_order_products" ON made_to_order_products 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to made_to_order_products" ON made_to_order_products 
FOR UPDATE USING (true);

CREATE POLICY "Allow public delete to made_to_order_products" ON made_to_order_products 
FOR DELETE USING (true);

-- Create proper policies for made_to_order_orders
CREATE POLICY "Allow public read access to made_to_order_orders" ON made_to_order_orders 
FOR SELECT USING (true);

CREATE POLICY "Allow public insert to made_to_order_orders" ON made_to_order_orders 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to made_to_order_orders" ON made_to_order_orders 
FOR UPDATE USING (true);

CREATE POLICY "Allow public delete to made_to_order_orders" ON made_to_order_orders 
FOR DELETE USING (true);

-- Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('made_to_order_products', 'made_to_order_orders')
ORDER BY tablename, policyname;

-- Test the queries that the admin panel uses
SELECT COUNT(*) as product_count FROM made_to_order_products;
SELECT COUNT(*) as order_count FROM made_to_order_orders;

-- Test the exact query used by the admin panel
SELECT 
  mto.*,
  mtp.id as product_id,
  mtp.name as product_name,
  mtp.image as product_image,
  mtp.description as product_description,
  mtp.price as product_price
FROM made_to_order_orders mto
LEFT JOIN made_to_order_products mtp ON mto.product_id = mtp.id
ORDER BY mto.order_date DESC
LIMIT 5;
