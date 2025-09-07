-- Fix existing tables without recreating them
-- Run this in your Supabase SQL Editor

-- 1. Check if maintenance_settings table exists and fix permissions
DO $$ 
BEGIN
    -- Check if maintenance_settings table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'maintenance_settings') THEN
        RAISE NOTICE 'maintenance_settings table exists';
        
        -- Enable RLS if not already enabled
        ALTER TABLE maintenance_settings ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies
        DROP POLICY IF EXISTS "Allow public read access to maintenance_settings" ON maintenance_settings;
        DROP POLICY IF EXISTS "Allow public write access to maintenance_settings" ON maintenance_settings;
        
        -- Create new policies
        CREATE POLICY "Allow public read access to maintenance_settings" ON maintenance_settings FOR SELECT USING (true);
        CREATE POLICY "Allow public write access to maintenance_settings" ON maintenance_settings FOR ALL USING (true);
        
        RAISE NOTICE 'Fixed maintenance_settings table permissions';
    ELSE
        RAISE NOTICE 'maintenance_settings table does not exist';
    END IF;
END $$;

-- 2. Check and fix customers table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
        RAISE NOTICE 'customers table exists';
        
        -- Enable RLS if not already enabled
        ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies
        DROP POLICY IF EXISTS "Allow public read access to customers" ON customers;
        DROP POLICY IF EXISTS "Allow public insert to customers" ON customers;
        
        -- Create new policies
        CREATE POLICY "Allow public read access to customers" ON customers FOR SELECT USING (true);
        CREATE POLICY "Allow public insert to customers" ON customers FOR INSERT WITH CHECK (true);
        
        RAISE NOTICE 'Fixed customers table permissions';
    ELSE
        RAISE NOTICE 'customers table does not exist';
    END IF;
END $$;

-- 3. Check and fix orders table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
        RAISE NOTICE 'orders table exists';
        
        -- Enable RLS if not already enabled
        ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies
        DROP POLICY IF EXISTS "Allow public read access to orders" ON orders;
        DROP POLICY IF EXISTS "Allow public insert to orders" ON orders;
        
        -- Create new policies
        CREATE POLICY "Allow public read access to orders" ON orders FOR SELECT USING (true);
        CREATE POLICY "Allow public insert to orders" ON orders FOR INSERT WITH CHECK (true);
        
        -- Add missing columns if they don't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_id') THEN
            ALTER TABLE orders ADD COLUMN customer_id TEXT;
            RAISE NOTICE 'Added customer_id column to orders table';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'items') THEN
            ALTER TABLE orders ADD COLUMN items JSONB DEFAULT '[]';
            RAISE NOTICE 'Added items column to orders table';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'total') THEN
            ALTER TABLE orders ADD COLUMN total DECIMAL(10,2) DEFAULT 0;
            RAISE NOTICE 'Added total column to orders table';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_cost') THEN
            ALTER TABLE orders ADD COLUMN shipping_cost DECIMAL(10,2) DEFAULT 0;
            RAISE NOTICE 'Added shipping_cost column to orders table';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_type') THEN
            ALTER TABLE orders ADD COLUMN shipping_type TEXT DEFAULT 'homeDelivery';
            RAISE NOTICE 'Added shipping_type column to orders table';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_method') THEN
            ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'cod';
            RAISE NOTICE 'Added payment_method column to orders table';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_status') THEN
            ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'pending';
            RAISE NOTICE 'Added payment_status column to orders table';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'status') THEN
            ALTER TABLE orders ADD COLUMN status TEXT DEFAULT 'pending';
            RAISE NOTICE 'Added status column to orders table';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'tracking_number') THEN
            ALTER TABLE orders ADD COLUMN tracking_number TEXT;
            RAISE NOTICE 'Added tracking_number column to orders table';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'order_date') THEN
            ALTER TABLE orders ADD COLUMN order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            RAISE NOTICE 'Added order_date column to orders table';
        END IF;
        
        RAISE NOTICE 'Fixed orders table permissions and columns';
    ELSE
        RAISE NOTICE 'orders table does not exist';
    END IF;
END $$;

-- 4. Insert default maintenance settings if none exist
INSERT INTO maintenance_settings (id, is_maintenance_mode, drop_date, maintenance_message) 
VALUES ('maintenance', false, NOW() + INTERVAL '30 days', 'We are currently performing maintenance. Please check back later.')
ON CONFLICT (id) DO NOTHING;

-- 5. Show current table structures
SELECT 'maintenance_settings' as table_name, column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'maintenance_settings' 
ORDER BY ordinal_position;

SELECT 'customers' as table_name, column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'customers' 
ORDER BY ordinal_position;

SELECT 'orders' as table_name, column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;
