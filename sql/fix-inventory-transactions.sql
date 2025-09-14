-- Fix inventory transactions to update both inventory table AND products.stock
-- This ensures inventory decreases when orders are placed

-- 1. Drop the existing trigger and function
DROP TRIGGER IF EXISTS trigger_update_inventory_on_order ON orders;
DROP FUNCTION IF EXISTS update_inventory_on_order();

-- 2. Create new function that updates BOTH inventory table AND products.stock
CREATE OR REPLACE FUNCTION update_inventory_on_order()
RETURNS TRIGGER AS $$
DECLARE
  item JSONB;
  current_quantity INTEGER;
  new_quantity INTEGER;
  product_record RECORD;
  current_stock JSONB;
  new_stock JSONB;
BEGIN
  -- Loop through each item in the order
  FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
  LOOP
    -- Get the product record
    SELECT * INTO product_record
    FROM products
    WHERE id = (item->>'productId')::TEXT;
    
    IF product_record IS NULL THEN
      RAISE WARNING 'Product not found: %', (item->>'productId')::TEXT;
      CONTINUE;
    END IF;
    
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
    
    -- Update inventory table
    UPDATE inventory
    SET quantity = new_quantity,
        last_updated = NOW(),
        updated_at = NOW()
    WHERE product_id = (item->>'productId')::TEXT
      AND size = (item->>'selectedSize')::TEXT
      AND color = (item->>'selectedColor')::TEXT;
    
    -- Update products.stock JSONB field
    current_stock := COALESCE(product_record.stock, '{}'::jsonb);
    
    -- Ensure the size and color structure exists
    IF NOT (current_stock ? (item->>'selectedSize')::TEXT) THEN
      current_stock := jsonb_set(current_stock, ARRAY[(item->>'selectedSize')::TEXT], '{}'::jsonb);
    END IF;
    
    -- Update the quantity for this size/color combination
    current_stock := jsonb_set(
      current_stock, 
      ARRAY[(item->>'selectedSize')::TEXT, (item->>'selectedColor')::TEXT], 
      to_jsonb(new_quantity)
    );
    
    -- Update the product with new stock
    UPDATE products
    SET stock = current_stock,
        in_stock = (SELECT bool_or(value::int > 0) FROM jsonb_each(current_stock)),
        updated_at = NOW()
    WHERE id = (item->>'productId')::TEXT;
    
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
    
    RAISE NOTICE 'Updated inventory for product % size % color %: % -> %', 
      (item->>'productId')::TEXT, 
      (item->>'selectedSize')::TEXT, 
      (item->>'selectedColor')::TEXT,
      current_quantity, 
      new_quantity;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create the trigger
CREATE TRIGGER trigger_update_inventory_on_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_on_order();

-- 4. Test the trigger by checking if it exists
SELECT 
  trigger_name, 
  event_manipulation, 
  action_timing, 
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_update_inventory_on_order';

-- 5. Show current inventory status
SELECT 
  p.name as product_name,
  i.size,
  i.color,
  i.quantity as inventory_quantity,
  p.stock->i.size->i.color as product_stock_quantity
FROM inventory i
JOIN products p ON i.product_id = p.id
WHERE i.product_id = '1757510045961'
ORDER BY i.size, i.color;
