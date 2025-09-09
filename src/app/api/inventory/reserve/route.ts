import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseDatabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, size, color, quantity } = body;

    if (!productId || !size || !color || !quantity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('🔒 Reserving inventory:', { productId, size, color, quantity });

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

    // Check if product is in stock
    if (!product.inStock) {
      return NextResponse.json({ error: 'Product is out of stock' }, { status: 400 });
    }

    // Check current stock for this size/color combination
    const currentStock = product.stock?.[size]?.[color] || 0;
    
    if (currentStock < quantity) {
      return NextResponse.json({ 
        error: `Only ${currentStock} items available in ${size} ${color}` 
      }, { status: 400 });
    }

    // Calculate new stock
    const newStock = currentStock - quantity;
    
    // Update the stock in database
    const updatedStock = {
      ...product.stock,
      [size]: {
        ...product.stock?.[size],
        [color]: newStock
      }
    };

    // If new stock is 0, mark as out of stock
    const isInStock = Object.values(updatedStock[size] || {}).some((stock: any) => stock > 0);

    const { error: updateError } = await supabase
      .from('products')
      .update({
        stock: updatedStock,
        inStock: isInStock
      })
      .eq('id', productId);

    if (updateError) {
      console.error('❌ Error updating inventory:', updateError);
      return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 });
    }

    console.log('✅ Inventory reserved successfully:', { 
      productId, 
      size, 
      color, 
      reserved: quantity, 
      remaining: newStock 
    });

    return NextResponse.json({ 
      success: true, 
      reserved: quantity, 
      remaining: newStock 
    });

  } catch (error) {
    console.error('❌ Error in inventory reserve:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
