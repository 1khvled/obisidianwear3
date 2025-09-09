-- Add custom size chart fields to existing tables
-- Run this SQL in your Supabase SQL Editor

-- Add custom size chart fields to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS custom_size_chart JSONB,
ADD COLUMN IF NOT EXISTS use_custom_size_chart BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS size_chart_category TEXT;

-- Add custom size chart fields to made_to_order_products table
ALTER TABLE made_to_order_products 
ADD COLUMN IF NOT EXISTS custom_size_chart JSONB,
ADD COLUMN IF NOT EXISTS use_custom_size_chart BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS size_chart_category TEXT;

-- Update existing products to have default size chart category based on their category
UPDATE products 
SET size_chart_category = category 
WHERE size_chart_category IS NULL;

-- Update existing made-to-order products to have default size chart category based on their category
UPDATE made_to_order_products 
SET size_chart_category = category 
WHERE size_chart_category IS NULL;