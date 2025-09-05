-- Final Database Optimizations for ObisidianWear
-- This script aligns with the actual database schema from supabase-setup.sql

-- Performance indexes for orders table
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_updated_at ON orders(updated_at);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id_status ON orders(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at_status ON orders(created_at, status);

-- Performance indexes for products table
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status_in_stock ON products(status, in_stock);

-- Performance indexes for maintenance_status table
CREATE INDEX IF NOT EXISTS idx_maintenance_status_updated_at ON maintenance_status(updated_at);

-- Materialized view for order statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS order_stats AS
SELECT 
    DATE(created_at) as order_date,
    status,
    COUNT(*) as order_count,
    SUM(total_amount) as total_revenue
FROM orders 
GROUP BY DATE(created_at), status;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_order_stats_date_status ON order_stats(order_date, status);

-- Function to refresh order statistics
CREATE OR REPLACE FUNCTION refresh_order_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW order_stats;
END;
$$ LANGUAGE plpgsql;

-- Materialized view for recent orders (last 30 days)
CREATE MATERIALIZED VIEW IF NOT EXISTS recent_orders AS
SELECT 
    o.id,
    o.customer_id,
    o.status,
    o.total_amount,
    o.created_at,
    o.updated_at,
    o.items
FROM orders o
WHERE o.created_at >= NOW() - INTERVAL '30 days'
ORDER BY o.created_at DESC;

-- Create index on recent orders view
CREATE INDEX IF NOT EXISTS idx_recent_orders_created_at ON recent_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_recent_orders_status ON recent_orders(status);

-- Function to refresh recent orders
CREATE OR REPLACE FUNCTION refresh_recent_orders()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW recent_orders;
END;
$$ LANGUAGE plpgsql;

-- Function for bulk order status updates
CREATE OR REPLACE FUNCTION bulk_update_order_status(
    order_ids INTEGER[],
    new_status VARCHAR(50)
)
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE orders 
    SET status = new_status, updated_at = NOW()
    WHERE id = ANY(order_ids);
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Function to search orders with pagination
CREATE OR REPLACE FUNCTION search_orders(
    search_term VARCHAR(255) DEFAULT NULL,
    order_status VARCHAR(50) DEFAULT NULL,
    limit_count INTEGER DEFAULT 50,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
    id INTEGER,
    customer_id INTEGER,
    status VARCHAR(50),
    total_amount DECIMAL(10,2),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    items JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.customer_id,
        o.status,
        o.total_amount,
        o.created_at,
        o.updated_at,
        o.items
    FROM orders o
    WHERE 
        (search_term IS NULL OR o.items::text ILIKE '%' || search_term || '%')
        AND (order_status IS NULL OR o.status = order_status)
    ORDER BY o.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies for orders table
DROP POLICY IF EXISTS "Allow public read access to orders" ON orders;
CREATE POLICY "Allow public read access to orders" ON orders
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access to orders" ON orders;
CREATE POLICY "Allow public insert access to orders" ON orders
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access to orders" ON orders;
CREATE POLICY "Allow public update access to orders" ON orders
    FOR UPDATE USING (true);

-- RLS Policies for products table
DROP POLICY IF EXISTS "Allow public read access to products" ON products;
CREATE POLICY "Allow public read access to products" ON products
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public update access to products" ON products;
CREATE POLICY "Allow public update access to products" ON products
    FOR UPDATE USING (true);

-- RLS Policies for maintenance_status table
DROP POLICY IF EXISTS "Allow public read access to maintenance_status" ON maintenance_status;
CREATE POLICY "Allow public read access to maintenance_status" ON maintenance_status
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public update access to maintenance_status" ON maintenance_status;
CREATE POLICY "Allow public update access to maintenance_status" ON maintenance_status
    FOR UPDATE USING (true);

-- Add constraints with proper syntax
DO $$ 
BEGIN
    -- Add check constraint for order status
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_order_status'
    ) THEN
        ALTER TABLE orders ADD CONSTRAINT check_order_status 
        CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled'));
    END IF;

    -- Add check constraint for product status
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_product_status'
    ) THEN
        ALTER TABLE products ADD CONSTRAINT check_product_status 
        CHECK (status IN ('available', 'soon', 'out_of_stock'));
    END IF;

    -- Add check constraint for maintenance status
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_maintenance_status'
    ) THEN
        ALTER TABLE maintenance_status ADD CONSTRAINT check_maintenance_status 
        CHECK (status IN ('online', 'offline'));
    END IF;
END $$;

-- Create function for maintenance status analytics
CREATE OR REPLACE FUNCTION get_maintenance_analytics()
RETURNS TABLE(
    total_switches INTEGER,
    last_switch TIMESTAMP,
    current_status VARCHAR(20),
    uptime_percentage DECIMAL(5,2)
) AS $$
DECLARE
    total_switches INTEGER;
    last_switch TIMESTAMP;
    current_status VARCHAR(20);
    uptime_percentage DECIMAL(5,2);
BEGIN
    -- Get total switches
    SELECT COUNT(*) INTO total_switches FROM maintenance_status;
    
    -- Get last switch time
    SELECT MAX(updated_at) INTO last_switch FROM maintenance_status;
    
    -- Get current status
    SELECT status INTO current_status FROM maintenance_status ORDER BY updated_at DESC LIMIT 1;
    
    -- Calculate uptime percentage (simplified calculation)
    SELECT 
        CASE 
            WHEN current_status = 'online' THEN 100.0
            ELSE 0.0
        END INTO uptime_percentage;
    
    RETURN QUERY SELECT total_switches, last_switch, current_status, uptime_percentage;
END;
$$ LANGUAGE plpgsql;

-- Create function for order analytics
CREATE OR REPLACE FUNCTION get_order_analytics()
RETURNS TABLE(
    total_orders INTEGER,
    pending_orders INTEGER,
    completed_orders INTEGER,
    total_revenue DECIMAL(10,2),
    avg_order_value DECIMAL(10,2)
) AS $$
DECLARE
    total_orders INTEGER;
    pending_orders INTEGER;
    completed_orders INTEGER;
    total_revenue DECIMAL(10,2);
    avg_order_value DECIMAL(10,2);
BEGIN
    -- Get total orders
    SELECT COUNT(*) INTO total_orders FROM orders;
    
    -- Get pending orders
    SELECT COUNT(*) INTO pending_orders FROM orders WHERE status IN ('pending', 'processing');
    
    -- Get completed orders
    SELECT COUNT(*) INTO completed_orders FROM orders WHERE status = 'delivered';
    
    -- Get total revenue
    SELECT COALESCE(SUM(total_amount), 0) INTO total_revenue FROM orders WHERE status = 'delivered';
    
    -- Get average order value
    SELECT COALESCE(AVG(total_amount), 0) INTO avg_order_value FROM orders WHERE status = 'delivered';
    
    RETURN QUERY SELECT total_orders, pending_orders, completed_orders, total_revenue, avg_order_value;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT SELECT ON order_stats TO PUBLIC;
GRANT SELECT ON recent_orders TO PUBLIC;
GRANT EXECUTE ON FUNCTION refresh_order_stats() TO PUBLIC;
GRANT EXECUTE ON FUNCTION refresh_recent_orders() TO PUBLIC;
GRANT EXECUTE ON FUNCTION bulk_update_order_status(INTEGER[], VARCHAR(50)) TO PUBLIC;
GRANT EXECUTE ON FUNCTION search_orders(VARCHAR(255), VARCHAR(50), INTEGER, INTEGER) TO PUBLIC;
GRANT EXECUTE ON FUNCTION get_maintenance_analytics() TO PUBLIC;
GRANT EXECUTE ON FUNCTION get_order_analytics() TO PUBLIC;

-- Refresh materialized views
REFRESH MATERIALIZED VIEW order_stats;
REFRESH MATERIALIZED VIEW recent_orders;
