-- Made to Order Products Schema
-- This table stores products that are made to order (article sur commande)

CREATE TABLE IF NOT EXISTS made_to_order_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image TEXT,
  images TEXT[], -- Array of image URLs
  colors TEXT[] NOT NULL, -- Available colors
  sizes TEXT[] NOT NULL, -- Available sizes
  category VARCHAR(100),
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  custom_size_chart JSONB,
  use_custom_size_chart BOOLEAN DEFAULT false,
  size_chart_category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Made to Order Orders Table
-- This table stores orders for made-to-order products
CREATE TABLE IF NOT EXISTS made_to_order_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES made_to_order_products(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255),
  customer_address TEXT NOT NULL,
  wilaya_id INTEGER NOT NULL,
  wilaya_name VARCHAR(100) NOT NULL,
  selected_size VARCHAR(50) NOT NULL,
  selected_color VARCHAR(50) NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2) NOT NULL, -- 50% of total price
  remaining_amount DECIMAL(10,2) NOT NULL, -- 50% of total price
  shipping_time VARCHAR(50) DEFAULT '20-18 days',
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_production', 'ready', 'shipped', 'delivered', 'cancelled')),
  whatsapp_contact VARCHAR(20),
  notes TEXT,
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  estimated_completion_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_made_to_order_products_active ON made_to_order_products(is_active);
CREATE INDEX IF NOT EXISTS idx_made_to_order_products_display_order ON made_to_order_products(display_order);
CREATE INDEX IF NOT EXISTS idx_made_to_order_orders_product_id ON made_to_order_orders(product_id);
CREATE INDEX IF NOT EXISTS idx_made_to_order_orders_status ON made_to_order_orders(status);
CREATE INDEX IF NOT EXISTS idx_made_to_order_orders_order_date ON made_to_order_orders(order_date);

-- Enable Row Level Security (RLS)
ALTER TABLE made_to_order_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE made_to_order_orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for made_to_order_products
CREATE POLICY "Made to order products are viewable by everyone" ON made_to_order_products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Made to order products are manageable by authenticated users" ON made_to_order_products
  FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for made_to_order_orders
CREATE POLICY "Made to order orders are viewable by authenticated users" ON made_to_order_orders
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Made to order orders are manageable by authenticated users" ON made_to_order_orders
  FOR ALL USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_made_to_order_products_updated_at 
  BEFORE UPDATE ON made_to_order_products 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_made_to_order_orders_updated_at 
  BEFORE UPDATE ON made_to_order_orders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample made-to-order products
INSERT INTO made_to_order_products (name, description, price, image, colors, sizes, category, tags, display_order) VALUES
(
  'Custom Hoodie Premium',
  'Hoodie personnalisé de haute qualité, fabriqué sur commande selon vos spécifications. Matériau premium et finitions soignées.',
  4500.00,
  '/obsidian-logo.png',
  ARRAY['Noir', 'Blanc', 'Gris', 'Rouge'],
  ARRAY['S', 'M', 'L', 'XL', 'XXL'],
  'Hoodies',
  ARRAY['custom', 'premium', 'made-to-order'],
  1
),
(
  'T-Shirt Personnalisé',
  'T-shirt sur mesure avec votre design ou logo. Qualité premium et confort optimal.',
  2500.00,
  '/obsidian-logo.png',
  ARRAY['Noir', 'Blanc', 'Gris foncé'],
  ARRAY['S', 'M', 'L', 'XL'],
  'T-Shirts',
  ARRAY['custom', 'personalized', 'made-to-order'],
  2
),
(
  'Veste Custom',
  'Veste personnalisée selon vos goûts. Matériaux de qualité et coupe sur mesure.',
  6500.00,
  '/obsidian-logo.png',
  ARRAY['Noir', 'Marron', 'Bleu marine'],
  ARRAY['M', 'L', 'XL', 'XXL'],
  'Vestes',
  ARRAY['custom', 'premium', 'made-to-order'],
  3
);

-- Grant necessary permissions
GRANT ALL ON made_to_order_products TO authenticated;
GRANT ALL ON made_to_order_orders TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
