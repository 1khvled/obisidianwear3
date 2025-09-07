-- Products Schema
-- This table stores regular products (not made-to-order)

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  image VARCHAR(500),
  images TEXT[], -- Array of image URLs
  colors TEXT[], -- Available colors
  sizes TEXT[], -- Available sizes
  category VARCHAR(100),
  tags TEXT[],
  in_stock BOOLEAN DEFAULT true,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  stock JSONB, -- Stock levels by size and color
  sku VARCHAR(100),
  weight DECIMAL(8,3),
  dimensions VARCHAR(50),
  featured BOOLEAN DEFAULT false,
  size_chart_category VARCHAR(100) DEFAULT 'T-Shirts',
  custom_size_chart JSONB,
  use_custom_size_chart BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for now, since we removed auth)
CREATE POLICY "Allow all operations on products" ON products
  FOR ALL USING (true) WITH CHECK (true);
