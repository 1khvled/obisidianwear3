-- Fix RLS policies for made-to-order tables
-- This allows public access for orders while maintaining security

-- Drop existing policies
DROP POLICY IF EXISTS "Made to order products are viewable by everyone" ON made_to_order_products;
DROP POLICY IF EXISTS "Made to order products are manageable by authenticated users" ON made_to_order_products;
DROP POLICY IF EXISTS "Made to order orders are viewable by authenticated users" ON made_to_order_orders;
DROP POLICY IF EXISTS "Made to order orders are manageable by authenticated users" ON made_to_order_orders;

-- Create new policies for products (public read, authenticated write)
CREATE POLICY "Made to order products are viewable by everyone" ON made_to_order_products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Made to order products are manageable by authenticated users" ON made_to_order_products
  FOR ALL USING (auth.role() = 'authenticated');

-- Create new policies for orders (public insert, authenticated read/write)
CREATE POLICY "Made to order orders can be created by anyone" ON made_to_order_orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Made to order orders are viewable by authenticated users" ON made_to_order_orders
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Made to order orders are manageable by authenticated users" ON made_to_order_orders
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Made to order orders are deletable by authenticated users" ON made_to_order_orders
  FOR DELETE USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT ALL ON made_to_order_products TO authenticated;
GRANT ALL ON made_to_order_orders TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant public access for orders (for order creation)
GRANT INSERT ON made_to_order_orders TO anon;
GRANT USAGE ON SCHEMA public TO anon;

SELECT 'RLS policies updated successfully!' as status;
