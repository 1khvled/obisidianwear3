import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseDatabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, size, color, quantity } = body;

    if (!productId || !size || !color || !quantity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('🔄 Restoring inventory:', { productId, size, color, quantity });

    // Get current product data
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('stock, inStock')
      .eq('id', productId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching product:', fetchError);
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Calculate new stock (restore the quantity)
    const currentStock = product.stock?.[size]?.[color] || 0;
    const newStock = currentStock + quantity;
    
    // Update the stock in database
    const updatedStock = {
      ...product.stock,
      [size]: {
        ...product.stock?.[size],
        [color]: newStock
      }
    };

    // Mark as in stock since we're adding inventory back
    const { error: updateError } = await supabase
      .from('products')
      .update({
        stock: updatedStock,
        inStock: true
      })
      .eq('id', productId);

    if (updateError) {
      console.error('❌ Error restoring inventory:', updateError);
      return NextResponse.json({ error: 'Failed to restore inventory' }, { status: 500 });
    }

    console.log('✅ Inventory restored successfully:', { 
      productId, 
      size, 
      color, 
      restored: quantity, 
      newTotal: newStock 
    });

    return NextResponse.json({ 
      success: true, 
      restored: quantity, 
      newTotal: newStock 
    });

  } catch (error) {
    console.error('❌ Error in inventory restore:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
