-- Fix made-to-order image column to support base64 data URLs
-- Change image column from VARCHAR(500) to TEXT to support larger base64 images

ALTER TABLE made_to_order_products 
ALTER COLUMN image TYPE TEXT;

-- Also ensure images array can handle larger data
-- (PostgreSQL TEXT[] already supports large text, but let's be explicit)
ALTER TABLE made_to_order_products 
ALTER COLUMN images TYPE TEXT[];

-- Add comment to document the change
COMMENT ON COLUMN made_to_order_products.image IS 'Base64 encoded image data or image URL';
COMMENT ON COLUMN made_to_order_products.images IS 'Array of base64 encoded image data or image URLs';
