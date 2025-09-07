-- Create inventory management system
-- Run this in your Supabase SQL Editor

-- 1. Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER NOT NULL DEFAULT 0,
  available_quantity INTEGER GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
  min_stock_level INTEGER DEFAULT 5,
  max_stock_level INTEGER DEFAULT 100,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, size, color)
);

-- 2. Create inventory_transactions table for tracking changes
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('in', 'out', 'adjustment', 'reserve', 'unreserve')),
  quantity_change INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  reason TEXT,
  order_id TEXT,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_size_color ON inventory(size, color);
CREATE INDEX IF NOT EXISTS idx_inventory_available ON inventory(available_quantity);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_product ON inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_date ON inventory_transactions(created_at);

-- 4. Enable RLS
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
CREATE POLICY "Allow public read access to inventory" ON inventory FOR SELECT USING (true);
CREATE POLICY "Allow public insert to inventory" ON inventory FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to inventory" ON inventory FOR UPDATE USING (true);
CREATE POLICY "Allow public delete to inventory" ON inventory FOR DELETE USING (true);

CREATE POLICY "Allow public read access to inventory_transactions" ON inventory_transactions FOR SELECT USING (true);
CREATE POLICY "Allow public insert to inventory_transactions" ON inventory_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to inventory_transactions" ON inventory_transactions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete to inventory_transactions" ON inventory_transactions FOR DELETE USING (true);

-- 6. Create function to automatically update inventory
CREATE OR REPLACE FUNCTION update_inventory_on_order()
RETURNS TRIGGER AS $$
DECLARE
  item JSONB;
  current_quantity INTEGER;
  new_quantity INTEGER;
BEGIN
  -- Loop through each item in the order
  FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
  LOOP
    -- Get current inventory quantity
    SELECT quantity INTO current_quantity
    FROM inventory
    WHERE product_id = (item->>'productId')::TEXT
      AND size = (item->>'selectedSize')::TEXT
      AND color = (item->>'selectedColor')::TEXT;
    
    -- If inventory record doesn't exist, create it
    IF current_quantity IS NULL THEN
      INSERT INTO inventory (id, product_id, size, color, quantity)
      VALUES (
        'INV-' || (item->>'productId')::TEXT || '-' || (item->>'selectedSize')::TEXT || '-' || (item->>'selectedColor')::TEXT,
        (item->>'productId')::TEXT,
        (item->>'selectedSize')::TEXT,
        (item->>'selectedColor')::TEXT,
        0
      );
      current_quantity := 0;
    END IF;
    
    -- Calculate new quantity (subtract ordered quantity)
    new_quantity := current_quantity - (item->>'quantity')::INTEGER;
    
    -- Update inventory
    UPDATE inventory
    SET quantity = new_quantity,
        last_updated = NOW(),
        updated_at = NOW()
    WHERE product_id = (item->>'productId')::TEXT
      AND size = (item->>'selectedSize')::TEXT
      AND color = (item->>'selectedColor')::TEXT;
    
    -- Log transaction
    INSERT INTO inventory_transactions (
      id,
      product_id,
      size,
      color,
      transaction_type,
      quantity_change,
      previous_quantity,
      new_quantity,
      reason,
      order_id,
      created_by
    ) VALUES (
      'TXN-' || extract(epoch from now())::TEXT || '-' || (item->>'productId')::TEXT,
      (item->>'productId')::TEXT,
      (item->>'selectedSize')::TEXT,
      (item->>'selectedColor')::TEXT,
      'out',
      -((item->>'quantity')::INTEGER),
      current_quantity,
      new_quantity,
      'Order placed: ' || NEW.id,
      NEW.id,
      'system'
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger to automatically update inventory on order creation
DROP TRIGGER IF EXISTS trigger_update_inventory_on_order ON orders;
CREATE TRIGGER trigger_update_inventory_on_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_on_order();

-- 8. Create function to initialize inventory for existing products
CREATE OR REPLACE FUNCTION initialize_inventory_for_products()
RETURNS VOID AS $$
DECLARE
  product RECORD;
  size_val TEXT;
  color_val TEXT;
BEGIN
  -- Loop through all products
  FOR product IN SELECT id, sizes, colors, stock FROM products
  LOOP
    -- Loop through each size
    FOR size_val IN SELECT unnest(product.sizes)
    LOOP
      -- Loop through each color
      FOR color_val IN SELECT unnest(product.colors)
      LOOP
        -- Get stock quantity from product.stock JSONB
        DECLARE
          stock_quantity INTEGER := 0;
        BEGIN
          IF product.stock IS NOT NULL AND product.stock ? size_val THEN
            IF product.stock->size_val ? color_val THEN
              stock_quantity := COALESCE((product.stock->size_val->color_val)::INTEGER, 0);
            END IF;
          END IF;
          
          -- Insert inventory record
          INSERT INTO inventory (id, product_id, size, color, quantity)
          VALUES (
            'INV-' || product.id || '-' || size_val || '-' || color_val,
            product.id,
            size_val,
            color_val,
            stock_quantity
          )
          ON CONFLICT (product_id, size, color) DO NOTHING;
        END;
      END LOOP;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 9. Initialize inventory for existing products
SELECT initialize_inventory_for_products();

-- 10. Show inventory summary
SELECT 
  p.name as product_name,
  i.size,
  i.color,
  i.quantity,
  i.available_quantity,
  i.min_stock_level,
  CASE 
    WHEN i.available_quantity <= i.min_stock_level THEN 'LOW STOCK'
    WHEN i.available_quantity = 0 THEN 'OUT OF STOCK'
    ELSE 'IN STOCK'
  END as stock_status
FROM inventory i
JOIN products p ON i.product_id = p.id
ORDER BY p.name, i.size, i.color;
