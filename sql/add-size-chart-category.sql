-- Add size chart category column to products table
-- This allows products to specify which size chart category they belong to

-- Add the sizeChartCategory column to the products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS size_chart_category VARCHAR(50) DEFAULT 'T-Shirts';

-- Update existing products to have appropriate size chart categories based on their current category
UPDATE products 
SET size_chart_category = CASE 
  WHEN category = 'T-Shirts' THEN 'T-Shirts'
  WHEN category = 'Hoodies' THEN 'Hoodies'
  WHEN category = 'Pants' THEN 'Pants'
  WHEN category = 'Shoes' THEN 'Shoes'
  WHEN category = 'Accessories' THEN 'Watches'
  ELSE 'T-Shirts'
END
WHERE size_chart_category IS NULL OR size_chart_category = 'T-Shirts';

-- Add index for better performance when filtering by size chart category
CREATE INDEX IF NOT EXISTS idx_products_size_chart_category ON products(size_chart_category);

-- Add comment to document the column
COMMENT ON COLUMN products.size_chart_category IS 'Specifies which size chart category this product belongs to (T-Shirts, Hoodies, Pants, Shoes, Watches)';
