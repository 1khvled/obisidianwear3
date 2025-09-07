-- Safe update script for Supabase - adds missing columns to products table
-- Run this SQL in your Supabase SQL Editor

-- Add missing columns to existing products table
DO $$ 
BEGIN
    -- Add original_price column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'original_price') THEN
        ALTER TABLE products ADD COLUMN original_price DECIMAL(10,2);
        RAISE NOTICE 'Added original_price column';
    ELSE
        RAISE NOTICE 'original_price column already exists';
    END IF;
    
    -- Add image column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image') THEN
        ALTER TABLE products ADD COLUMN image TEXT;
        RAISE NOTICE 'Added image column';
    ELSE
        RAISE NOTICE 'image column already exists';
    END IF;
    
    -- Add sizes column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sizes') THEN
        ALTER TABLE products ADD COLUMN sizes TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added sizes column';
    ELSE
        RAISE NOTICE 'sizes column already exists';
    END IF;
    
    -- Add colors column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'colors') THEN
        ALTER TABLE products ADD COLUMN colors TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added colors column';
    ELSE
        RAISE NOTICE 'colors column already exists';
    END IF;
    
    -- Add in_stock column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'in_stock') THEN
        ALTER TABLE products ADD COLUMN in_stock BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added in_stock column';
    ELSE
        RAISE NOTICE 'in_stock column already exists';
    END IF;
    
    -- Add rating column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'rating') THEN
        ALTER TABLE products ADD COLUMN rating DECIMAL(3,2) DEFAULT 0;
        RAISE NOTICE 'Added rating column';
    ELSE
        RAISE NOTICE 'rating column already exists';
    END IF;
    
    -- Add reviews column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'reviews') THEN
        ALTER TABLE products ADD COLUMN reviews INTEGER DEFAULT 0;
        RAISE NOTICE 'Added reviews column';
    ELSE
        RAISE NOTICE 'reviews column already exists';
    END IF;
    
    -- Add sku column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sku') THEN
        ALTER TABLE products ADD COLUMN sku TEXT;
        RAISE NOTICE 'Added sku column';
    ELSE
        RAISE NOTICE 'sku column already exists';
    END IF;
    
    -- Add weight column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'weight') THEN
        ALTER TABLE products ADD COLUMN weight DECIMAL(8,2);
        RAISE NOTICE 'Added weight column';
    ELSE
        RAISE NOTICE 'weight column already exists';
    END IF;
    
    -- Add dimensions column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'dimensions') THEN
        ALTER TABLE products ADD COLUMN dimensions JSONB;
        RAISE NOTICE 'Added dimensions column';
    ELSE
        RAISE NOTICE 'dimensions column already exists';
    END IF;
    
    -- Add tags column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'tags') THEN
        ALTER TABLE products ADD COLUMN tags TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added tags column';
    ELSE
        RAISE NOTICE 'tags column already exists';
    END IF;
    
    -- Add featured column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'featured') THEN
        ALTER TABLE products ADD COLUMN featured BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added featured column';
    ELSE
        RAISE NOTICE 'featured column already exists';
    END IF;
END $$;

-- Show current products table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;
