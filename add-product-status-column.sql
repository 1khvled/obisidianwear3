-- Add status column to products table for SOON status support
-- Run this in your Supabase SQL Editor

-- Add status column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'available' 
CHECK (status IN ('available', 'soon', 'out_of_stock'));

-- Update existing products to have 'available' status if they are in stock
UPDATE products 
SET status = 'available' 
WHERE in_stock = true AND status IS NULL;

-- Update existing products to have 'out_of_stock' status if they are not in stock
UPDATE products 
SET status = 'out_of_stock' 
WHERE in_stock = false AND status IS NULL;

-- Create index for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- Create index for combined status and in_stock queries
CREATE INDEX IF NOT EXISTS idx_products_status_stock ON products(status, in_stock);

-- Verify the changes
SELECT id, name, in_stock, status, created_at 
FROM products 
ORDER BY created_at DESC 
LIMIT 10;
