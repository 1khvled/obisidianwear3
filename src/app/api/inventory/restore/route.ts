import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseDatabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, size, color, quantity } = body;

    if (!productId || !size || !color || !quantity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('🔄 Restoring inventory from inventory table:', { productId, size, color, quantity });

    // Get current inventory data from inventory table
    const { data: inventoryItem, error: fetchError } = await supabase
      .from('inventory')
      .select('available_quantity, quantity, reserved_quantity')
      .eq('product_id', productId)
      .eq('size', size)
      .eq('color', color)
      .single();

    if (fetchError || !inventoryItem) {
      console.error('❌ Error fetching inventory:', fetchError);
      return NextResponse.json({ error: 'Inventory record not found' }, { status: 404 });
    }

    // Restore inventory by decreasing reserved_quantity
    const newReservedQuantity = Math.max(0, inventoryItem.reserved_quantity - quantity);

    const { error: updateError } = await supabase
      .from('inventory')
      .update({ 
        reserved_quantity: newReservedQuantity,
        last_updated: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('product_id', productId)
      .eq('size', size)
      .eq('color', color);

    if (updateError) {
      console.error('❌ Error restoring inventory:', updateError);
      return NextResponse.json({ error: 'Failed to restore inventory' }, { status: 500 });
    }

    // Log transaction
    const { error: transactionError } = await supabase
      .from('inventory_transactions')
      .insert({
        id: `TXN-${Date.now()}-${productId}-${size}-${color}`,
        product_id: productId,
        size: size,
        color: color,
        transaction_type: 'unreserve',
        quantity_change: -quantity,
        previous_quantity: inventoryItem.quantity,
        new_quantity: inventoryItem.quantity,
        reason: 'Cart restoration',
        created_by: 'system'
      });

    if (transactionError) {
      console.warn('Failed to log inventory transaction:', transactionError);
    }

    console.log('✅ Inventory restored successfully:', { 
      productId, 
      size, 
      color, 
      restored: quantity, 
      available: inventoryItem.quantity - newReservedQuantity
    });

    return NextResponse.json({ 
      success: true, 
      restored: quantity, 
      available: inventoryItem.quantity - newReservedQuantity
    });

  } catch (error) {
    console.error('❌ Error in inventory restore:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
