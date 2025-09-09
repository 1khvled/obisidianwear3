import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseDatabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, size, color, quantity } = body;

    if (!productId || !size || !color || !quantity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('🔒 Reserving inventory from inventory table:', { productId, size, color, quantity });

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

    const availableQuantity = inventoryItem.available_quantity;
    
    if (availableQuantity < quantity) {
      console.log('❌ Insufficient stock:', { available: availableQuantity, requested: quantity });
      return NextResponse.json({ 
        error: `Only ${availableQuantity} items available in ${size} ${color}` 
      }, { status: 400 });
    }

    // Reserve inventory by increasing reserved_quantity
    const newReservedQuantity = inventoryItem.reserved_quantity + quantity;

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
      console.error('❌ Error updating inventory:', updateError);
      return NextResponse.json({ error: 'Failed to reserve inventory' }, { status: 500 });
    }

    // Log transaction
    const { error: transactionError } = await supabase
      .from('inventory_transactions')
      .insert({
        id: `TXN-${Date.now()}-${productId}-${size}-${color}`,
        product_id: productId,
        size: size,
        color: color,
        transaction_type: 'reserve',
        quantity_change: quantity,
        previous_quantity: inventoryItem.quantity,
        new_quantity: inventoryItem.quantity,
        reason: 'Cart reservation',
        created_by: 'system'
      });

    if (transactionError) {
      console.warn('Failed to log inventory transaction:', transactionError);
    }

    console.log('✅ Inventory reserved successfully:', { 
      productId, 
      size, 
      color, 
      reserved: quantity, 
      available: availableQuantity - quantity
    });

    return NextResponse.json({ 
      success: true, 
      reserved: quantity, 
      remaining: availableQuantity - quantity
    });

  } catch (error) {
    console.error('❌ Error in inventory reserve:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
