import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export interface InventoryRecord {
  id: string;
  product_id: string;
  size: string;
  color: string;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  min_stock_level: number;
  max_stock_level: number;
  last_updated: string;
  created_at: string;
  updated_at: string;
  products?: {
    id: string;
    name: string;
    image: string;
    price: number;
  };
}

export interface InventoryTransaction {
  id: string;
  product_id: string;
  size: string;
  color: string;
  transaction_type: 'in' | 'out' | 'adjustment' | 'reserve' | 'unreserve';
  quantity_change: number;
  previous_quantity: number;
  new_quantity: number;
  reason?: string;
  order_id?: string;
  created_by?: string;
  created_at: string;
}

// Get all inventory records
export async function getInventory(): Promise<InventoryRecord[]> {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        products (
          id,
          name,
          image,
          price
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Inventory service: getInventory error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Inventory service: getInventory error:', error);
    return [];
  }
}

// Get inventory for a specific product
export async function getProductInventory(productId: string): Promise<InventoryRecord[]> {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        products (
          id,
          name,
          image,
          price
        )
      `)
      .eq('product_id', productId)
      .order('size', { ascending: true });

    if (error) {
      console.error('Inventory service: getProductInventory error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Inventory service: getProductInventory error:', error);
    return [];
  }
}

// Update inventory quantity
export async function updateInventoryQuantity(
  inventoryId: string,
  newQuantity: number,
  reason?: string,
  createdBy?: string
): Promise<boolean> {
  try {
    // Get current record
    const { data: currentRecord, error: fetchError } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', inventoryId)
      .single();

    if (fetchError || !currentRecord) {
      console.error('Inventory service: Record not found:', inventoryId);
      return false;
    }

    // Update inventory
    const { error: updateError } = await supabase
      .from('inventory')
      .update({
        quantity: newQuantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', inventoryId);

    if (updateError) {
      console.error('Inventory service: updateInventoryQuantity error:', updateError);
      return false;
    }

    // Log transaction
    const quantityChange = newQuantity - currentRecord.quantity;
    if (quantityChange !== 0) {
      await supabase
        .from('inventory_transactions')
        .insert([{
          id: `TXN-${Date.now()}-${inventoryId}`,
          product_id: currentRecord.product_id,
          size: currentRecord.size,
          color: currentRecord.color,
          transaction_type: 'adjustment',
          quantity_change: quantityChange,
          previous_quantity: currentRecord.quantity,
          new_quantity: newQuantity,
          reason: reason || 'Manual adjustment',
          created_by: createdBy || 'admin'
        }]);
    }

    return true;
  } catch (error) {
    console.error('Inventory service: updateInventoryQuantity error:', error);
    return false;
  }
}

// Add inventory (stock in)
export async function addInventory(
  productId: string,
  size: string,
  color: string,
  quantity: number,
  reason?: string,
  createdBy?: string
): Promise<boolean> {
  try {
    const inventoryId = `INV-${productId}-${size}-${color}`;
    
    // Get current record
    const { data: currentRecord, error: fetchError } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', inventoryId)
      .single();

    const currentQuantity = currentRecord?.quantity || 0;
    const newQuantity = currentQuantity + quantity;

    // Upsert inventory record
    const { error: upsertError } = await supabase
      .from('inventory')
      .upsert([{
        id: inventoryId,
        product_id: productId,
        size,
        color,
        quantity: newQuantity,
        reserved_quantity: currentRecord?.reserved_quantity || 0,
        min_stock_level: currentRecord?.min_stock_level || 5,
        max_stock_level: currentRecord?.max_stock_level || 100
      }]);

    if (upsertError) {
      console.error('Inventory service: addInventory error:', upsertError);
      return false;
    }

    // Log transaction
    await supabase
      .from('inventory_transactions')
      .insert([{
        id: `TXN-${Date.now()}-${inventoryId}`,
        product_id: productId,
        size,
        color,
        transaction_type: 'in',
        quantity_change: quantity,
        previous_quantity: currentQuantity,
        new_quantity: newQuantity,
        reason: reason || 'Stock added',
        created_by: createdBy || 'admin'
      }]);

    return true;
  } catch (error) {
    console.error('Inventory service: addInventory error:', error);
    return false;
  }
}

// Check if product has sufficient stock
export async function checkStock(
  productId: string,
  size: string,
  color: string,
  requestedQuantity: number
): Promise<{ available: boolean; currentStock: number }> {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('available_quantity')
      .eq('product_id', productId)
      .eq('size', size)
      .eq('color', color)
      .single();

    if (error || !data) {
      return { available: false, currentStock: 0 };
    }

    return {
      available: data.available_quantity >= requestedQuantity,
      currentStock: data.available_quantity
    };
  } catch (error) {
    console.error('Inventory service: checkStock error:', error);
    return { available: false, currentStock: 0 };
  }
}

// Get low stock items
export async function getLowStockItems(): Promise<InventoryRecord[]> {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        products (
          id,
          name,
          image,
          price
        )
      `)
      .lte('available_quantity', supabase.raw('min_stock_level'))
      .order('available_quantity', { ascending: true });

    if (error) {
      console.error('Inventory service: getLowStockItems error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Inventory service: getLowStockItems error:', error);
    return [];
  }
}

// Get inventory transactions
export async function getInventoryTransactions(
  productId?: string,
  limit: number = 50
): Promise<InventoryTransaction[]> {
  try {
    let query = supabase
      .from('inventory_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Inventory service: getInventoryTransactions error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Inventory service: getInventoryTransactions error:', error);
    return [];
  }
}

// Initialize inventory for a product
export async function initializeProductInventory(productId: string): Promise<boolean> {
  try {
    // Get product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('sizes, colors, stock')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      console.error('Inventory service: Product not found:', productId);
      return false;
    }

    const sizes = product.sizes || [];
    const colors = product.colors || [];
    const stock = product.stock || {};

    // Create inventory records for each size/color combination
    const inventoryRecords = [];
    
    for (const size of sizes) {
      for (const color of colors) {
        const stockQuantity = stock[size]?.[color] || 0;
        
        inventoryRecords.push({
          id: `INV-${productId}-${size}-${color}`,
          product_id: productId,
          size,
          color,
          quantity: stockQuantity,
          reserved_quantity: 0,
          min_stock_level: 5,
          max_stock_level: 100
        });
      }
    }

    if (inventoryRecords.length > 0) {
      const { error: insertError } = await supabase
        .from('inventory')
        .upsert(inventoryRecords);

      if (insertError) {
        console.error('Inventory service: initializeProductInventory error:', insertError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Inventory service: initializeProductInventory error:', error);
    return false;
  }
}
