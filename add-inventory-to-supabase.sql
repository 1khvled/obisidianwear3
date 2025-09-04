-- Add inventory to Supabase
-- Run this in your Supabase SQL Editor

-- First, let's see what products we have
SELECT id, name, stock, in_stock FROM products;

-- Example: Add inventory for a specific product
-- Replace 'PRODUCT_ID' with your actual product ID
UPDATE products 
SET 
  stock = '{
    "S": {"Black": 10, "White": 5, "Red": 8},
    "M": {"Black": 15, "White": 12, "Red": 10},
    "L": {"Black": 20, "White": 18, "Red": 15},
    "XL": {"Black": 8, "White": 6, "Red": 5}
  }',
  in_stock = true,
  updated_at = NOW()
WHERE id = 'PRODUCT_ID';

-- Example: Add inventory for multiple products
UPDATE products 
SET 
  stock = '{
    "S": {"Black": 25, "White": 20},
    "M": {"Black": 30, "White": 25},
    "L": {"Black": 35, "White": 30},
    "XL": {"Black": 20, "White": 15}
  }',
  in_stock = true,
  updated_at = NOW()
WHERE category = 'T-Shirts';

-- Example: Set a product as out of stock
UPDATE products 
SET 
  in_stock = false,
  updated_at = NOW()
WHERE id = 'PRODUCT_ID';

-- Example: Add inventory for a new product
INSERT INTO products (
  id, 
  name, 
  description, 
  price, 
  image, 
  stock, 
  category, 
  sizes, 
  colors, 
  in_stock, 
  created_at, 
  updated_at
) VALUES (
  'PROD-' || EXTRACT(EPOCH FROM NOW())::TEXT,
  'New Product Name',
  'Product description',
  29.99,
  'https://example.com/image.jpg',
  '{
    "S": {"Black": 10, "White": 5},
    "M": {"Black": 15, "White": 12},
    "L": {"Black": 20, "White": 18},
    "XL": {"Black": 8, "White": 6}
  }',
  'T-Shirts',
  ARRAY['S', 'M', 'L', 'XL'],
  ARRAY['Black', 'White'],
  true,
  NOW(),
  NOW()
);

-- Check the results
SELECT id, name, stock, in_stock, updated_at FROM products ORDER BY updated_at DESC;
