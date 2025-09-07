-- Add custom size chart data to products table
-- This allows each product to have its own customized size chart

-- Add the custom_size_chart column to store JSON data
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS custom_size_chart JSONB;

-- Add the use_custom_size_chart boolean flag
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS use_custom_size_chart BOOLEAN DEFAULT FALSE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_use_custom_size_chart ON products(use_custom_size_chart);
CREATE INDEX IF NOT EXISTS idx_products_custom_size_chart ON products USING GIN(custom_size_chart);

-- Add comments to document the columns
COMMENT ON COLUMN products.custom_size_chart IS 'JSON data containing custom size chart measurements for this specific product';
COMMENT ON COLUMN products.use_custom_size_chart IS 'Boolean flag indicating whether to use custom size chart instead of default category chart';

-- Example of what the custom_size_chart JSON structure should look like:
-- {
--   "title": "Custom Size Chart",
--   "measurements": [
--     {
--       "size": "XS",
--       "chest": 86,
--       "length": 66,
--       "shoulder": 42
--     },
--     {
--       "size": "S", 
--       "chest": 91,
--       "length": 68,
--       "shoulder": 44
--     }
--   ],
--   "instructions": "Custom measurement instructions for this product"
-- }
