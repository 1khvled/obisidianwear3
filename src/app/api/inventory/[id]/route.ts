import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// PUT /api/inventory/[id] - Update inventory record
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { quantity } = await request.json();

    console.log(`🔄 Updating inventory record ${id} with quantity ${quantity}`);

    // Parse the inventory ID to extract product info
    // Format: INV-{productId}-{size}-{color}
    const parts = id.replace('INV-', '').split('-');
    if (parts.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Invalid inventory ID format' },
        { status: 400 }
      );
    }

    const productId = parts[0];
    const size = parts[1];
    const color = parts[2];

    // Get the current product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      console.error('❌ Product not found:', productError);
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Update the stock data in the product
    const currentStock = product.stock || {};
    if (!currentStock[size]) {
      currentStock[size] = {};
    }
    currentStock[size][color] = quantity;

    // Update the product with new stock data
    const { error: updateError } = await supabase
      .from('products')
      .update({ 
        stock: currentStock,
        in_stock: Object.values(currentStock).some((sizeStock: any) => 
          Object.values(sizeStock).some((qty: any) => qty > 0)
        )
      })
      .eq('id', productId);

    if (updateError) {
      console.error('❌ Error updating product stock:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update product stock' },
        { status: 500 }
      );
    }

    console.log(`✅ Successfully updated stock for ${product.name} - ${size} ${color}: ${quantity}`);

    return NextResponse.json({
      success: true,
      message: 'Inventory updated successfully',
      data: {
        id,
        product_id: productId,
        size,
        color,
        quantity,
        product_name: product.name
      }
    });

  } catch (error) {
    console.error('❌ Error updating inventory:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/inventory/[id] - Get inventory record
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Parse the inventory ID to extract product info
    const parts = id.replace('INV-', '').split('-');
    if (parts.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Invalid inventory ID format' },
        { status: 400 }
      );
    }

    const productId = parts[0];
    const size = parts[1];
    const color = parts[2];

    // Get the product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get the stock quantity for this size/color combination
    const stock = product.stock || {};
    const quantity = stock[size]?.[color] || 0;

    return NextResponse.json({
      success: true,
      data: {
        id,
        product_id: productId,
        size,
        color,
        quantity,
        product_name: product.name,
        product_image: product.image
      }
    });

  } catch (error) {
    console.error('❌ Error getting inventory record:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}