import { NextResponse } from 'next/server';
import { updateInventoryOptimized } from '@/lib/optimizedSupabase';

// PUT /api/inventory-optimized/[id] - Update inventory record with optimizations
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { quantity } = body;

    console.log(`🚀 [OPTIMIZED] Updating inventory record ${id} with quantity ${quantity}`);

    const startTime = performance.now();

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

    // Get current product to update stock
    const { supabase } = await import('@/lib/optimizedSupabase');
    
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, stock')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      console.error('❌ [OPTIMIZED] Product not found:', productError);
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Update the stock data
    const currentStock = product.stock || {};
    if (!currentStock[size]) {
      currentStock[size] = {};
    }
    currentStock[size][color] = quantity;

    // Update inventory using optimized function
    const result = await updateInventoryOptimized(productId, {
      stock: currentStock,
      inStock: Object.values(currentStock).some((sizeStock: any) => 
        Object.values(sizeStock).some((qty: any) => qty > 0)
      )
    });

    const endTime = performance.now();
    console.log(`⏱️ [OPTIMIZED] Update completed in ${(endTime - startTime).toFixed(2)}ms`);

    const response = NextResponse.json({
      success: true,
      message: 'Inventory updated successfully (optimized)',
      data: {
        id: id,
        quantity: quantity,
        productId,
        size,
        color
      },
      performance: {
        updateTime: endTime - startTime
      }
    });

    // Optimized response headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('X-Response-Time', `${(endTime - startTime).toFixed(2)}ms`);
    response.headers.set('X-Optimized', 'true');

    return response;

  } catch (error) {
    console.error('❌ [OPTIMIZED] Error updating inventory:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
